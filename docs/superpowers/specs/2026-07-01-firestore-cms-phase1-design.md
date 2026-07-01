# Firestore CMS — Phase 1 (build-time content) Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Make the portfolio content editable from **Firestore** while keeping the public
site **static, fast, and SEO-friendly**. Firestore is the source of truth; the
site is generated at deploy time by pulling content from Firestore. No Firebase
SDK runs in the browser.

This is **Phase 1 of 3** (agreed decomposition):
- **Phase 1 (this spec):** CMS read — content lives in Firestore, baked into the
  static build.
- **Phase 2 (later):** Admin panel — Firebase Auth + edit content + "Publish"
  action that triggers a redeploy.
- **Phase 3 (later):** Analytics — visits/section metrics.

## Decisions (agreed with user)

1. **Scope:** all 8 sections editable from Firestore (nav/hero, services,
   impact, stack, experience, projects, certifications, contact).
2. **Source of truth:** Firestore only (no static runtime fallback). The current
   typed content becomes the one-time **seed** for Firestore.
3. **Consumption:** **build-time generation** — a script pulls Firestore into
   committed JSON that the app imports. The site does not read Firestore at
   runtime.

## Non-goals (Phase 1)

- No admin UI, no auth, no runtime Firestore reads, no analytics.
- No live/instant content updates: publishing a change requires a redeploy
  (automated in Phase 2).

## Architecture

```
Firestore  content/es , content/en   (source of truth)
   │  npm run content:pull   (Node + firebase-admin, service account)
   ▼
src/content/published/{es,en}.json    (committed = last published content)
   │  imported + validated as PortfolioContent
   ▼
npx expo export -p web  →  firebase deploy
```

The public site stays static (as today); only the content *source* changes from
hardcoded TS to generated JSON.

## Firestore data model

Collection **`content`**, two documents, each the full `PortfolioContent`:
- `content/es` → all Spanish content
- `content/en` → all English content

Maps 1:1 to the existing `PortfolioContent` type and current `es.ts`/`en.ts`.

## Repository changes

- **Move** current content to `src/content/seed/es.ts` and
  `src/content/seed/en.ts` (unchanged data; still typed `PortfolioContent`, so
  ES/EN parity is enforced at compile time). Used ONLY by the seed script.
- **`scripts/seed-content.mjs`** — uploads the seed to `content/es` and
  `content/en` via the Admin SDK. Idempotent (overwrites the two docs). Run once
  (or to reset).
- **`scripts/pull-content.mjs`** — reads `content/es`/`content/en`, validates the
  shape, and writes `src/content/published/es.json` and `published/en.json`. If a
  doc is missing or fails validation, it **exits non-zero** (build must not
  publish empty/broken content).
- **`src/content/dictionary.ts`** — import the published JSON, type as
  `PortfolioContent` with a runtime shape check; `getContent(locale)` unchanged
  signature. The rest of the app (`i18n`, sections) is untouched.
- **`src/content/published/*.json`** — committed; represents the currently
  published content so local dev and CI build without needing Firestore access.
- `src/content/types.ts` stays the single type definition.

## Firebase setup

- **Create Firestore** (Native mode) in project `luisdelatorre-portfolio`.
- **Service account key** (Project settings → Service accounts → Generate key),
  stored locally, path via env var (e.g. `GOOGLE_APPLICATION_CREDENTIALS`), and
  **git-ignored**. Never committed.
- **Security rules** (`firestore.rules`): deny all client access —
  `match /{document=**} { allow read, write: if false; }`. The Admin SDK used by
  the scripts bypasses rules. (Phase 2 will open writes to the authenticated
  admin.) Add `firestore` config to `firebase.json` and deploy rules.
- **`firebase-admin`** as a **devDependency** only (scripts); it must not enter
  the web bundle.

## Deploy flow

- `npm run content:seed` — one-time (or reset) seed of Firestore.
- `npm run content:pull` — regenerate published JSON from Firestore.
- `npm run deploy` — `content:pull && expo export -p web && firebase deploy`.

## Error handling

- `pull-content`: missing doc or invalid shape → log + non-zero exit; no JSON
  written; deploy aborts.
- `dictionary`: validate published JSON shape on load; throw on mismatch (guards
  against a bad manual Firestore edit that slipped through pull validation).

## Verification

- `npx tsc --noEmit` passes (types + seed ES/EN parity).
- Run seed → pull → the generated JSON equals the current content.
- `npx expo export -p web` and the rendered site is **identical** to today
  (dark theme, all 8 sections, ES/EN toggle) — now sourced from Firestore.
- Firestore rules: a client read/write is denied (rules test or console check).
- The web bundle does not include `firebase`/`firebase-admin`.

## Implementation order

1. Create Firestore DB + service account + `firestore.rules` + `firebase.json`
   firestore config.
2. Add `firebase-admin` devDep; move content to `src/content/seed/`.
3. `scripts/seed-content.mjs`; run seed.
4. `scripts/pull-content.mjs` with shape validation; run pull → published JSON.
5. Switch `dictionary.ts` to import published JSON; keep types/validation.
6. `npm run` scripts (`content:seed`, `content:pull`, `deploy`).
7. Verify (tsc, export, render parity, rules).
