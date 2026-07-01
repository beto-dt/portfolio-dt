# Analytics — Phase 3 (self-hosted visit counters) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Count total visits, per-day, and per-section views into Firestore via an HTTP Cloud Function pinged by the (Firebase-free) public site, and show the metrics in `/admin`.

**Architecture:** Public site wraps each section in `<TrackedSection>` (IntersectionObserver) and, once per session, `sendBeacon`s to `/api/visit` (Firebase Hosting rewrite → `recordVisit` function). The function increments `analytics/summary` in Firestore via the Admin SDK. `/admin` gains a read-only Métricas view. No Firebase SDK in the public bundle.

**Tech Stack:** Firebase Cloud Functions gen2 (`firebase-functions` v6, `firebase-admin`), Firebase Hosting rewrites, Firestore, Expo/React Native web (IntersectionObserver, `navigator.sendBeacon`), TypeScript.

**Testing note:** Automated gate = `npx tsc --noEmit` + `npm --prefix functions run build` + `npx expo export -p web` + public-bundle-excludes-Firebase check. The function/hosting deploy and the live-increment check are cloud/manual.

**Constants:** project `luisdelatorre-portfolio`, region `us-central1`, owner `luis.atorred24@gmail.com`. Section ids: `hero, services, impact, stack, experience, projects, certifications, contact`.

---

### Task 1: recordVisit function + analytics rules + hosting rewrite

**Files:**
- Modify: `functions/package.json` (add `firebase-admin`)
- Modify: `functions/src/index.ts` (add `recordVisit` + admin init)
- Modify: `firestore.rules` (analytics read/write)
- Modify: `firebase.json` (hosting `/api/visit` rewrite)

- [ ] **Step 1: Add `firebase-admin` to `functions/package.json` dependencies**

Set the `dependencies` block to:

```json
  "dependencies": {
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.4.0"
  },
```

Then run: `npm --prefix functions install` (updates the lockfile).

- [ ] **Step 2: Replace `functions/src/index.ts`**

```ts
import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) initializeApp();
const db = getFirestore();

const GITHUB_TOKEN = defineSecret('GITHUB_TOKEN');

const ADMIN_EMAIL = 'luis.atorred24@gmail.com';
const DISPATCH_URL =
  'https://api.github.com/repos/beto-dt/portfolio-dt/actions/workflows/deploy.yml/dispatches';
const ACTIONS_URL =
  'https://github.com/beto-dt/portfolio-dt/actions/workflows/deploy.yml';

export const publish = onCall(
  { secrets: [GITHUB_TOKEN], region: 'us-central1' },
  async (request) => {
    if (
      request.auth?.token?.email !== ADMIN_EMAIL ||
      request.auth?.token?.email_verified !== true
    ) {
      throw new HttpsError('permission-denied', 'No autorizado');
    }

    const res = await fetch(DISPATCH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN.value()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'portfolio-publish-fn',
      },
      body: JSON.stringify({ ref: 'main' }),
    });

    if (res.status !== 204) {
      const detail = await res.text();
      throw new HttpsError('internal', `GitHub dispatch failed: ${res.status} ${detail}`);
    }

    return { ok: true, actionsUrl: ACTIONS_URL };
  },
);

const SECTION_KEYS = new Set([
  'hero',
  'services',
  'impact',
  'stack',
  'experience',
  'projects',
  'certifications',
  'contact',
]);

export const recordVisit = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
  try {
    let raw: unknown = req.body;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = {};
      }
    }
    const body = (raw && typeof raw === 'object' ? raw : {}) as { countVisit?: unknown; sections?: unknown };
    const countVisit = body.countVisit === true;
    const sections = Array.isArray(body.sections) ? body.sections.filter((s): s is string => typeof s === 'string') : [];

    const update: Record<string, unknown> = {};
    if (countVisit) {
      const day = new Date().toISOString().slice(0, 10);
      update.total = FieldValue.increment(1);
      update.byDay = { [day]: FieldValue.increment(1) };
    }
    const bySection: Record<string, unknown> = {};
    for (const s of sections) {
      if (SECTION_KEYS.has(s)) bySection[s] = FieldValue.increment(1);
    }
    if (Object.keys(bySection).length > 0) update.bySection = bySection;

    if (Object.keys(update).length > 0) {
      await db.doc('analytics/summary').set(update, { merge: true });
    }
    res.status(204).send('');
  } catch {
    res.status(204).send('');
  }
});
```

- [ ] **Step 3: Add the analytics rule to `firestore.rules`**

Insert this `match` block immediately before the final `match /{document=**}` deny-all block (keep the existing `content` block and the deny-all unchanged):

```
    match /analytics/{doc} {
      allow read: if request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email == 'luis.atorred24@gmail.com';
      allow write: if false;
    }
```

- [ ] **Step 4: Add the hosting rewrite to `firebase.json`**

In the `hosting` block, add a `rewrites` key (the `hosting` block currently has `public`, `ignore`, `cleanUrls` and no rewrites). Result:

```json
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "rewrites": [
      {
        "source": "/api/visit",
        "function": { "functionId": "recordVisit", "region": "us-central1" }
      }
    ]
  },
```

(This is a single specific path; it does NOT reintroduce the catch-all rewrite that broke static routes like `/admin`.)

- [ ] **Step 5: Build functions and type-check**

Run: `npm --prefix functions run build`
Expected: compiles `functions/src/index.ts` (publish + recordVisit) with no errors.
Run: `npx tsc --noEmit`
Expected: PASS (functions is excluded from the app tsconfig).

- [ ] **Step 6: Deploy rules + functions**

Run:
```bash
firebase deploy --only firestore:rules,functions --project luisdelatorre-portfolio --non-interactive
```
Expected: rules released; `recordVisit(us-central1)` created and `publish` unchanged/updated. If a cleanup-policy warning appears, it is non-fatal.

- [ ] **Step 7: Commit**

```bash
git add functions/package.json functions/package-lock.json functions/src/index.ts firestore.rules firebase.json
git commit -m "feat(analytics): add recordVisit function, analytics rules, /api/visit rewrite"
```

---

### Task 2: Public visit tracker

**Files:**
- Create: `src/analytics/config.ts`
- Create: `src/analytics/tracker.ts`
- Create: `src/analytics/tracked-section.tsx`
- Modify: `src/features/portfolio/portfolio-screen.tsx` (wrap sections + arm visit)

- [ ] **Step 1: Create `src/analytics/config.ts`**

```ts
export const VISIT_ENDPOINT = '/api/visit';

export const SECTION_IDS = [
  'hero',
  'services',
  'impact',
  'stack',
  'experience',
  'projects',
  'certifications',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
```

- [ ] **Step 2: Create `src/analytics/tracker.ts`**

```ts
import { VISIT_ENDPOINT } from './config';

// Firebase-free visit tracker: accumulates seen sections and sends ONE beacon
// per session when the page is hidden/unloaded. No cookies, no PII.

const seen = new Set<string>();
let armed = false;
let sent = false;

function isWeb(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function';
}

function send(): void {
  if (sent || !isWeb()) return;
  sent = true;
  let countVisit = true;
  try {
    countVisit = !window.sessionStorage.getItem('pf_visit');
    if (countVisit) window.sessionStorage.setItem('pf_visit', '1');
  } catch {
    countVisit = true;
  }
  const payload = JSON.stringify({ countVisit, sections: [...seen] });
  try {
    navigator.sendBeacon(VISIT_ENDPOINT, new Blob([payload], { type: 'application/json' }));
  } catch {
    // ignore — analytics must never break the page
  }
}

export function armVisit(): void {
  if (armed || !isWeb()) return;
  armed = true;
  const onHidden = () => {
    if (document.visibilityState === 'hidden') send();
  };
  window.addEventListener('visibilitychange', onHidden);
  window.addEventListener('pagehide', send);
}

export function markSectionSeen(id: string): void {
  seen.add(id);
  armVisit();
}
```

- [ ] **Step 3: Create `src/analytics/tracked-section.tsx`**

```tsx
import { useEffect, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import { markSectionSeen } from './tracker';

export function TrackedSection({ id, children }: { id: string; children: ReactNode }) {
  const ref = useRef<View>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const node = ref.current as unknown as Element | null;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            markSectionSeen(id);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [id]);
  return <View ref={ref} style={{ width: '100%' }}>{children}</View>;
}
```

- [ ] **Step 4: Wrap sections + arm the visit in `src/features/portfolio/portfolio-screen.tsx`**

Replace the file with (imports at top, `armVisit` on mount, each section wrapped):

```tsx
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SiteHeader } from './components/site-header';
import { HeroSection } from './sections/hero/hero-section';
import { ServicesSection } from './sections/services/services-section';
import { ImpactSection } from './sections/impact/impact-section';
import { StackSection } from './sections/stack/stack-section';
import { ExperienceSection } from './sections/experience/experience-section';
import { ProjectsSection } from './sections/projects/projects-section';
import { CertificationsSection } from './sections/certifications/certifications-section';
import { ContactSection } from './sections/contact/contact-section';
import { TrackedSection } from '@/analytics/tracked-section';
import { armVisit } from '@/analytics/tracker';
import { colors } from '@/theme/tokens';

export function PortfolioScreen() {
  useEffect(() => {
    armVisit();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SiteHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 88 }}>
        <TrackedSection id="hero"><HeroSection /></TrackedSection>
        <TrackedSection id="services"><ServicesSection /></TrackedSection>
        <TrackedSection id="impact"><ImpactSection /></TrackedSection>
        <TrackedSection id="stack"><StackSection /></TrackedSection>
        <TrackedSection id="experience"><ExperienceSection /></TrackedSection>
        <TrackedSection id="projects"><ProjectsSection /></TrackedSection>
        <TrackedSection id="certifications"><CertificationsSection /></TrackedSection>
        <TrackedSection id="contact"><ContactSection /></TrackedSection>
      </ScrollView>
    </View>
  );
}
```

Note: this assumes all eight section components exist and are imported here already; if the current file imports a subset, keep its existing imports and only wrap the sections it renders. (As of Phase 2B all eight sections exist and are rendered.)

- [ ] **Step 5: Verify types + build + bundle hygiene**

Run:
```bash
npx tsc --noEmit
rm -rf dist && npx expo export -p web
for c in $(grep -oE '_expo/static/js/web/[a-zA-Z0-9._-]+\.js' dist/index.html); do grep -q "firebaseapp.com\|initializeApp" "dist/$c" && echo "LEAK $c"; done; echo "home checked"
```
Expected: tsc PASS; build succeeds; NO `LEAK` line (the tracker is Firebase-free, so the public home still excludes Firebase).

- [ ] **Step 6: Commit**

```bash
git add src/analytics/config.ts src/analytics/tracker.ts src/analytics/tracked-section.tsx src/features/portfolio/portfolio-screen.tsx
git commit -m "feat(analytics): add Firebase-free visit tracker on the public site"
```

---

### Task 3: Admin Métricas view

**Files:**
- Modify: `src/admin/firebase-client.ts` (add `readAnalyticsDoc`)
- Create: `src/admin/analytics-repo.ts`
- Create: `src/admin/components/metrics-view.tsx`
- Modify: `src/admin/screens/admin-screen.tsx` (Métricas toggle)

- [ ] **Step 1: Add `readAnalyticsDoc` to `src/admin/firebase-client.ts`**

Append this exported function at the end of the file (it uses the existing `services()` helper and the already-imported `doc`/`getDoc`/`DocumentData`):

```ts
export async function readAnalyticsDoc(): Promise<DocumentData | undefined> {
  const { db } = services();
  const snap = await getDoc(doc(db, 'analytics', 'summary'));
  return snap.exists() ? snap.data() : undefined;
}
```

- [ ] **Step 2: Create `src/admin/analytics-repo.ts`**

```ts
export type Analytics = {
  total: number;
  byDay: Record<string, number>;
  bySection: Record<string, number>;
};

export async function loadAnalytics(): Promise<Analytics> {
  const fb = await import('./firebase-client');
  const data = await fb.readAnalyticsDoc();
  return {
    total: typeof data?.total === 'number' ? data.total : 0,
    byDay: (data?.byDay as Record<string, number>) ?? {},
    bySection: (data?.bySection as Record<string, number>) ?? {},
  };
}
```

- [ ] **Step 3: Create `src/admin/components/metrics-view.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors, fonts } from '@/theme/tokens';
import { loadAnalytics, type Analytics } from '../analytics-repo';

function Bars({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <View style={{ gap: 6 }}>
      {data.map(([label, n]) => (
        <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ width: 104, color: colors.textMuted, fontSize: 12, fontFamily: fonts.mono }} numberOfLines={1}>
            {label}
          </Text>
          <View style={{ flex: 1, height: 14, backgroundColor: colors.surfaceStrong, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ width: `${(n / max) * 100}%`, height: '100%', backgroundColor: colors.accent }} />
          </View>
          <Text style={{ width: 44, textAlign: 'right', color: colors.text, fontSize: 12 }}>{n}</Text>
        </View>
      ))}
    </View>
  );
}

export function MetricsView() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadAnalytics()
      .then((a) => active && setData(a))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, []);

  if (error) return <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text>;
  if (!data) return <ActivityIndicator color={colors.accent} />;

  const days = Object.entries(data.byDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-30);
  const sections = Object.entries(data.bySection).sort((a, b) => b[1] - a[1]);

  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>visitas totales</Text>
        <Text style={{ fontFamily: fonts.displayBold, fontSize: 40, color: colors.accent }}>{data.total}</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>últimos días</Text>
        {days.length ? <Bars data={days} /> : <Text style={{ color: colors.textDim, fontSize: 13 }}>Sin datos aún.</Text>}
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>secciones más vistas</Text>
        {sections.length ? <Bars data={sections} /> : <Text style={{ color: colors.textDim, fontSize: 13 }}>Sin datos aún.</Text>}
      </View>
    </View>
  );
}
```

- [ ] **Step 4: Add a "Métricas" toggle to `src/admin/screens/admin-screen.tsx`**

Make these THREE edits (leave everything else intact):

(a) Add the import near the other component imports:
```tsx
import { MetricsView } from '../components/metrics-view';
```

(b) Add a view-mode state next to the other `useState` calls:
```tsx
  const [view, setView] = useState<'content' | 'metrics'>('content');
```

(c) In the signed-in return, add a "Métricas"/"Editar" toggle button in the header button row (next to Publicar/Cerrar sesión), and render the metrics view when active. Replace the header button `View` and the `{loading || !content ? ... : ...}` block with:

```tsx
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pressable onPress={() => setView(view === 'content' ? 'metrics' : 'content')} style={{ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>{view === 'content' ? 'Métricas' : 'Editar'}</Text>
          </Pressable>
          <Pressable onPress={onPublish} disabled={publishing} style={{ backgroundColor: colors.accent, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 7, opacity: publishing ? 0.6 : 1 }}>
            <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 13 }}>{publishing ? 'Publicando…' : 'Publicar'}</Text>
          </Pressable>
          <Pressable onPress={signOutAdmin} style={{ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Cerrar sesión</Text>
          </Pressable>
        </View>
```

and, where the section selector + form are rendered, wrap them so they only show in content mode and the metrics view shows otherwise. Concretely, change the block that currently renders the section-selector `View` + the `{loading || !content ? <ActivityIndicator/> : (<> ...forms... </>)}` to:

```tsx
      {view === 'metrics' ? (
        <MetricsView />
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {SECTIONS.map((s) => (
              <Pressable key={s.key} onPress={() => setSection(s.key)} style={{ borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: s.key === section ? colors.accent : colors.border, backgroundColor: s.key === section ? 'rgba(228,227,87,0.12)' : 'transparent' }}>
                <Text style={{ color: s.key === section ? colors.accent : colors.textMuted, fontSize: 12.5 }}>{s.label}</Text>
              </Pressable>
            ))}
          </View>
          {loading || !content ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <SectionForm section={section} content={content} onChange={setContent} />
              <Pressable onPress={onSave} style={{ alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 24, paddingVertical: 13 }}>
                <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 15 }}>Guardar</Text>
              </Pressable>
              {status ? <Text style={{ color: colors.textMuted, fontSize: 13 }}>{status}</Text> : null}
            </>
          )}
        </>
      )}
```

Keep the ES/EN locale toggle row visible above this block (it applies to content editing). The metrics view does not depend on locale.

- [ ] **Step 5: Verify types + build + bundle hygiene**

Run:
```bash
npx tsc --noEmit
rm -rf dist && npx expo export -p web
for c in $(grep -oE '_expo/static/js/web/[a-zA-Z0-9._-]+\.js' dist/index.html); do grep -q "firebaseapp.com\|initializeApp" "dist/$c" && echo "LEAK $c"; done; echo "home checked"
```
Expected: tsc PASS; build succeeds; no `LEAK` line (Firebase still admin-only lazy chunk).

- [ ] **Step 6: Commit**

```bash
git add src/admin/firebase-client.ts src/admin/analytics-repo.ts src/admin/components/metrics-view.tsx src/admin/screens/admin-screen.tsx
git commit -m "feat(admin): add read-only Métricas view (analytics summary)"
```

---

### Task 4: Deploy + end-to-end verification

**Files:** none

- [ ] **Step 1: Type check + functions build**

Run: `npx tsc --noEmit && npm --prefix functions run build`
Expected: both PASS.

- [ ] **Step 2: Deploy the site (activates the /api/visit rewrite + new tracker)**

Run:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npm run content:pull && npx expo export -p web && firebase deploy --only hosting,functions,firestore:rules --project luisdelatorre-portfolio --non-interactive
```
Expected: hosting + functions + rules deploy successfully.

- [ ] **Step 3: Manual — the endpoint records a visit**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://luisdelatorre.dev/api/visit -H 'Content-Type: application/json' -d '{"countVisit":true,"sections":["hero","services"]}'
```
Expected: `204`. Then in the Firebase console, `analytics/summary` shows `total: 1`, `byDay.<today>: 1`, `bySection.hero: 1`, `bySection.services: 1`.

- [ ] **Step 4: Manual — real visit + admin view**

- Open `https://luisdelatorre.dev` in a fresh session, scroll through some sections, then close/hide the tab. `analytics/summary.total` increments once and the scrolled sections increment. Reloading in the same session does NOT increment `total` again.
- Open `https://luisdelatorre.dev/admin` → **Métricas** → the total, per-day bars, and per-section ranking render.

- [ ] **Step 5: Commit (only if fixes were needed)**

```bash
git add -A
git commit -m "fix(analytics): phase 3 verification adjustments"
```

---

## Self-Review

- **Spec coverage:** self-hosted counters via `recordVisit` (T1); `/api/visit` same-origin rewrite (T1); analytics rules owner-read / no client write (T1); total + byDay + bySection increments with FieldValue.increment (T1); Firebase-free public tracker with once-per-session sendBeacon + IntersectionObserver per section (T2); admin read + Métricas view with total/days/sections (T3); deploy + live-increment + admin-view verification, bundle hygiene (T2/T3/T4). ✓
- **Placeholder scan:** none — concrete code/commands throughout. The one conditional note (portfolio-screen already imports all eight sections) is a factual guard, not a placeholder.
- **Type consistency:** `Analytics` `{total, byDay, bySection}` (T3) matches the function's Firestore shape (T1) and the `analytics/summary` doc; `loadAnalytics()`/`readAnalyticsDoc()` names consistent (T3); `markSectionSeen`/`armVisit` (T2) used by `TrackedSection`/`portfolio-screen` (T2); `VISIT_ENDPOINT` (T2 config) matches the hosting rewrite source `/api/visit` (T1). ✓
