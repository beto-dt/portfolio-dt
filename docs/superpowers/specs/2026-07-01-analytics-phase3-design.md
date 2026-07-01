# Analytics — Phase 3 (self-hosted visit counters) Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Count site visits and per-section views into Firestore via a small Cloud
Function, and show the metrics inside `/admin` — without adding the Firebase SDK
to the public bundle, without cookies, and without personal data.

This is **Phase 3 of 3** (the analytics phase from the original decomposition).
Phases 1 (CMS), 2A/2B/2C (admin panel) are done.

## Decisions (agreed with user)

- Approach: **self-hosted counters** — public site pings a Cloud Function that
  increments Firestore counters; metrics viewed in `/admin`.
- Metrics: **total visits + per-day + per-section**.
- Counting: **once per session** (a `sessionStorage` flag), so reloads/internal
  navigation don't re-count the visit (section views still accumulate).
- Privacy: no cookies, no PII, no IP storage → no consent banner needed.

## Non-goals (Phase 3)

- No referrers / geography / user agents (would add data + privacy surface).
- No per-URL analytics (single-page site).
- No Firebase SDK in the public bundle — the tracker uses only `fetch` /
  `navigator.sendBeacon` + `IntersectionObserver`.

## Architecture

```
Public site (static, Firebase-free)
  <TrackedSection id> wraps each section; IntersectionObserver marks seen sections
  once per session (sessionStorage flag): on pagehide/visibilitychange-hidden,
  navigator.sendBeacon('/api/visit', { countVisit, sections: [...] })
        │  Firebase Hosting rewrite  /api/visit -> recordVisit (same origin, no CORS)
        ▼
recordVisit (HTTP Cloud Function, gen2, us-central1, unauthenticated)
  increments analytics/summary via FieldValue.increment
        ▼
Firestore analytics/summary  { total, byDay: {date:n}, bySection: {key:n} }
        ▲
/admin "Métricas" view  reads analytics/summary (admin read) and renders it
```

## Components

### 1. Public tracking — `src/analytics/`
- **`config.ts`** — `const VISIT_ENDPOINT = '/api/visit'` and the list of valid
  section keys.
- **`tracker.ts`** (web-guarded, Firebase-free): a singleton that
  - accumulates seen section ids in a `Set`;
  - `markSectionSeen(id)`;
  - on first use, registers a `visibilitychange`/`pagehide` handler that sends
    ONE `navigator.sendBeacon(VISIT_ENDPOINT, blob)` with
    `{ countVisit, sections: [...seen] }`, where `countVisit` is
    `!sessionStorage.getItem('pf_visit')` and sets that flag after.
  - No-op when `window`/`sendBeacon` is unavailable (native / SSR).
- **`tracked-section.tsx`** — wraps children in a `View`; on web attaches an
  `IntersectionObserver` (via the view's DOM ref) that calls
  `markSectionSeen(id)` at ≥50% visibility, then disconnects. On native, renders
  children unchanged (no-op).
- `portfolio-screen.tsx` wraps each section: `<TrackedSection id="hero">…`,
  `"services"`, `"impact"`, `"stack"`, `"experience"`, `"projects"`,
  `"certifications"`, `"contact"`.

### 2. Cloud Function — `functions/src/` (add to the existing functions project)
- **`recordVisit`** (`onRequest`, region us-central1): parse JSON body
  `{ countVisit?: boolean; sections?: string[] }`; build a Firestore update:
  `total` and `byDay[YYYY-MM-DD]` incremented by 1 when `countVisit` is true;
  `bySection[key]` incremented for each `key` in `sections` that is a known
  section key; write with `set({...}, {merge:true})` using `FieldValue.increment`.
  Respond `204`. Ignore unknown section keys. `YYYY-MM-DD` from the server clock.
- **Hosting rewrite:** add to `firebase.json` hosting
  `"rewrites": [{ "source": "/api/visit", "function": { "functionId": "recordVisit", "region": "us-central1" } }]`.
  This is a specific path (not the catch-all removed earlier), so it does not
  affect static routes like `/admin`.

### 3. Firestore
- Doc **`analytics/summary`** `{ total: number, byDay: Record<string, number>,
  bySection: Record<string, number> }`.
- Rules add: `match /analytics/{doc} { allow read: if <owner email rule>; allow
  write: if false; }` — owner reads it in `/admin`; clients cannot read or write;
  the function writes via the Admin SDK (bypasses rules).

### 4. Admin metrics view — `src/admin/`
- **`analytics-repo.ts`** (or extend `firebase-client.ts`): `loadAnalytics()` →
  reads `analytics/summary`, returns a typed `{ total, byDay, bySection }` (empty
  defaults if the doc is missing).
- **`components/metrics-view.tsx`** — total visits (big number), last ~30 days as
  simple bars, per-section ranking as bars. Read-only.
- `admin-screen.tsx`: a **"Métricas"** toggle that switches between the content
  editor and the metrics view (loads analytics on demand).

## Error handling

- `recordVisit`: malformed body → treat as empty (no crash), respond 204; unknown
  section keys ignored; never throws to the client.
- Tracker: all wrapped so a tracking failure never breaks the page; `sendBeacon`
  failure is silent.
- Admin metrics: missing/empty `analytics/summary` → show zeros, not an error.

## Verification

- `npx tsc --noEmit` passes (app) and `npm --prefix functions run build` passes.
- Public web export builds; the public bundle still excludes Firebase
  (`grep initializeApp` on the home chunks → none). The tracker is Firebase-free.
- Manual: load the live site → `analytics/summary.total` increments once; scroll
  through sections → `bySection` increments; reload in the same session → `total`
  does not increment again.
- `/admin` → Métricas shows the total, per-day bars, and per-section ranking.

## Implementation order

1. `analytics/summary` rules + `recordVisit` function + hosting `/api/visit`
   rewrite; deploy function.
2. Public tracker + `TrackedSection` + wrap sections in `portfolio-screen`.
3. Admin `loadAnalytics()` + `metrics-view` + "Métricas" toggle in admin-screen.
4. Verify (tsc, functions build, bundle hygiene, live increment, admin view).
