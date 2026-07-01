# Admin Panel — Phase 2C (Publish button) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A "Publish" button in `/admin` that takes the current Firestore content live, via an admin-only Cloud Function that triggers a GitHub Actions deploy workflow.

**Architecture:** Admin button → callable Cloud Function `publish` (verifies owner auth, calls GitHub `workflow_dispatch`) → `deploy.yml` runs `content:pull` + `expo export` + `firebase deploy` using one service account. Firebase SDK stays lazy/admin-only; the function's GitHub token lives server-side.

**Tech Stack:** GitHub Actions, Firebase Cloud Functions gen2 (TypeScript, `firebase-functions` v6), Firebase JS SDK (`firebase/functions`), Expo.

**Testing note:** Automated gate = `npx tsc --noEmit` (app) + `npm --prefix functions run build` (functions). The workflow dispatch + in-app Publish need the Blaze upgrade + secrets and are flagged as prerequisite-gated/manual.

**Constants:** repo `beto-dt/portfolio-dt`, project `luisdelatorre-portfolio`, owner `luis.atorred24@gmail.com`, function region `us-central1`.

---

### Task 1: Deploy workflow (dispatchable)

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  workflow_dispatch:

jobs:
  deploy:
    name: Build and deploy
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: npm ci

      - name: Write service account credentials
        run: printf '%s' "$GCP_SA_KEY" > "$RUNNER_TEMP/sa.json"
        env:
          GCP_SA_KEY: ${{ secrets.GCP_SA_KEY }}

      - name: Pull content, build, and deploy
        env:
          GOOGLE_APPLICATION_CREDENTIALS: ${{ runner.temp }}/sa.json
        run: |
          npm run content:pull
          npx expo export -p web
          npx --yes firebase-tools@14 deploy --only hosting --project luisdelatorre-portfolio --non-interactive
```

- [ ] **Step 2: Lint the YAML locally (syntax sanity)**

Run: `python3 -c "import yaml,sys; yaml.safe_load(open('.github/workflows/deploy.yml')); print('yaml ok')"`
Expected: `yaml ok`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci(deploy): add dispatchable Firebase Hosting deploy workflow"
```

Note: `workflow_dispatch` only works once this file is on the default branch
(`main`), so it becomes dispatchable after this phase merges.

---

### Task 2: Cloud Functions project (`publish` callable)

**Files:**
- Create: `functions/package.json`
- Create: `functions/tsconfig.json`
- Create: `functions/.gitignore`
- Create: `functions/src/index.ts`
- Modify: `firebase.json` (add `functions`)
- Modify: `tsconfig.json` (exclude `functions` from the app type-check)

- [ ] **Step 1: Create `functions/package.json`**

```json
{
  "name": "functions",
  "private": true,
  "main": "lib/index.js",
  "engines": {
    "node": "20"
  },
  "scripts": {
    "build": "tsc"
  },
  "dependencies": {
    "firebase-functions": "^6.4.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0"
  }
}
```

- [ ] **Step 2: Create `functions/tsconfig.json`**

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "es2021",
    "moduleResolution": "node",
    "outDir": "lib",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `functions/.gitignore`**

```
node_modules/
lib/
```

- [ ] **Step 4: Create `functions/src/index.ts`**

```ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

const GITHUB_TOKEN = defineSecret('GITHUB_TOKEN');

const ADMIN_EMAIL = 'luis.atorred24@gmail.com';
const DISPATCH_URL =
  'https://api.github.com/repos/beto-dt/portfolio-dt/actions/workflows/deploy.yml/dispatches';
const ACTIONS_URL =
  'https://github.com/beto-dt/portfolio-dt/actions/workflows/deploy.yml';

export const publish = onCall(
  { secrets: [GITHUB_TOKEN], region: 'us-central1' },
  async (request) => {
    const token = request.auth?.token;
    if (!token || token.email !== ADMIN_EMAIL || token.email_verified !== true) {
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
```

- [ ] **Step 5: Add `functions` to `firebase.json`**

Add this key alongside `hosting` and `firestore` (keep those unchanged):

```json
  "functions": {
    "source": "functions",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
  }
```

- [ ] **Step 6: Exclude `functions` from the app type-check in `tsconfig.json`**

Add a top-level `"exclude"` (the app tsconfig must not type-check the functions
codebase, which uses a different module system and libs):

```json
  "exclude": ["functions", "dist"]
```

- [ ] **Step 7: Install functions deps and build**

Run:
```bash
npm --prefix functions install
npm --prefix functions run build
```
Expected: installs, then `tsc` compiles `functions/src/index.ts` to
`functions/lib/index.js` with no errors.

- [ ] **Step 8: Verify the app still type-checks (functions excluded)**

Run: `npx tsc --noEmit`
Expected: PASS (no attempt to check `functions/`).

- [ ] **Step 9: Commit**

```bash
git add functions/package.json functions/tsconfig.json functions/.gitignore functions/src/index.ts functions/package-lock.json firebase.json tsconfig.json
git commit -m "feat(functions): add admin-only publish callable that dispatches deploy"
```

---

### Task 3: Admin "Publish" button

**Files:**
- Modify: `src/admin/firebase-client.ts` (add `callPublish`)
- Create: `src/admin/publish.ts`
- Modify: `src/admin/screens/admin-screen.tsx` (add the button + status)

- [ ] **Step 1: Add `callPublish` to `src/admin/firebase-client.ts`**

Add these imports and function (keep the existing exports unchanged):

```ts
import { getFunctions, httpsCallable } from 'firebase/functions';
```

```ts
export async function callPublish(): Promise<{ ok: boolean; actionsUrl: string }> {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const functions = getFunctions(app, 'us-central1');
  const result = await httpsCallable(functions, 'publish')();
  return result.data as { ok: boolean; actionsUrl: string };
}
```

- [ ] **Step 2: Create `src/admin/publish.ts`**

```ts
export async function publishSite(): Promise<{ ok: boolean; actionsUrl: string }> {
  const fb = await import('./firebase-client');
  return fb.callPublish();
}
```

- [ ] **Step 3: Replace `src/admin/screens/admin-screen.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import type { User } from 'firebase/auth';
import type { HeroContent, PortfolioContent } from '@/content/types';
import type { Locale } from '@/i18n/locales';
import { colors, fonts, radii } from '@/theme/tokens';
import { onAdminAuthChanged, signInWithGoogle, signOutAdmin } from '../auth';
import { loadContent, saveSection } from '../content-repo';
import { publishSite } from '../publish';
import { HeroForm } from '../components/hero-form';

export function AdminScreen() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [locale, setLocale] = useState<Locale>('es');
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsub: (() => void) | undefined;
    onAdminAuthChanged((u) => {
      if (!active) return;
      setUser(u);
      setAuthReady(true);
    }).then((fn) => {
      if (active) unsub = fn;
      else fn();
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setStatus(null);
    loadContent(locale)
      .then((content: PortfolioContent) => {
        if (active) setHero(content.hero);
      })
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user, locale]);

  const onSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    }
  };

  const onSave = async () => {
    if (!hero) return;
    setStatus('Guardando…');
    try {
      await saveSection(locale, 'hero', hero);
      setStatus('Guardado en Firestore — publica para verlo en vivo.');
    } catch (e) {
      setStatus(e instanceof Error ? `Error: ${e.message}` : 'Error al guardar');
    }
  };

  const onPublish = async () => {
    setPublishing(true);
    setPublishMsg(null);
    setPublishUrl(null);
    try {
      const { actionsUrl } = await publishSite();
      setPublishMsg('Publicación iniciada (~2-3 min).');
      setPublishUrl(actionsUrl);
    } catch (e) {
      setPublishMsg(e instanceof Error ? `Error: ${e.message}` : 'Error al publicar');
    } finally {
      setPublishing(false);
    }
  };

  if (!authReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.text }}>Panel de administración</Text>
        <Pressable onPress={onSignIn} style={{ backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 22, paddingVertical: 13 }}>
          <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 15 }}>Iniciar sesión con Google</Text>
        </Pressable>
        {error ? <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, gap: 20, maxWidth: 720, width: '100%', marginHorizontal: 'auto' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>Editar · Hero</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pressable onPress={onPublish} disabled={publishing} style={{ backgroundColor: colors.accent, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 7, opacity: publishing ? 0.6 : 1 }}>
            <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 13 }}>{publishing ? 'Publicando…' : 'Publicar'}</Text>
          </Pressable>
          <Pressable onPress={signOutAdmin} style={{ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>

      {publishMsg ? (
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{publishMsg}</Text>
          {publishUrl ? (
            <Text onPress={() => Linking.openURL(publishUrl)} style={{ color: colors.accent, fontSize: 13, textDecorationLine: 'underline' }}>
              Ver progreso en GitHub Actions
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['es', 'en'] as Locale[]).map((l) => (
          <Pressable key={l} onPress={() => setLocale(l)} style={{ borderRadius: radii.sm, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: l === locale ? colors.accent : colors.surfaceStrong }}>
            <Text style={{ color: l === locale ? colors.onAccent : colors.text, fontFamily: fonts.mono, fontSize: 12 }}>{l.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      {loading || !hero ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          <HeroForm value={hero} onChange={setHero} />
          <Pressable onPress={onSave} style={{ alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 24, paddingVertical: 13 }}>
            <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 15 }}>Guardar</Text>
          </Pressable>
          {status ? <Text style={{ color: colors.textMuted, fontSize: 13 }}>{status}</Text> : null}
        </>
      )}
      {error ? <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text> : null}
    </ScrollView>
  );
}
```

- [ ] **Step 4: Verify types and public bundle hygiene**

Run:
```bash
npx tsc --noEmit
rm -rf dist && npx expo export -p web
for c in $(grep -oE '_expo/static/js/web/[a-zA-Z0-9._-]+\.js' dist/index.html); do grep -q "firebaseapp.com\|initializeApp" "dist/$c" && echo "LEAK $c"; done; echo "home bundle checked"
```
Expected: tsc PASS; build succeeds; no `LEAK` printed (public home still excludes Firebase — `firebase/functions` stays in the admin-only lazy chunk).

- [ ] **Step 5: Commit**

```bash
git add src/admin/firebase-client.ts src/admin/publish.ts src/admin/screens/admin-screen.tsx
git commit -m "feat(admin): add Publish button that triggers the deploy function"
```

---

### Task 4: Deploy the function (prerequisite-gated)

**Files:** none (deploy actions)

Prerequisites (owner, manual — must be done first):
- Firebase project upgraded to **Blaze**.
- Service account granted **Firebase Hosting Admin** role.
- GitHub repo secret **`GCP_SA_KEY`** = full contents of `service-account.json`.
- Fine-grained PAT with **Actions: read and write** on `beto-dt/portfolio-dt`.

- [ ] **Step 1: Set the function secret (GitHub token)**

Run (paste the PAT when prompted):
```bash
firebase functions:secrets:set GITHUB_TOKEN --project luisdelatorre-portfolio
```
Expected: stores a new secret version.

- [ ] **Step 2: Deploy the function**

Run:
```bash
firebase deploy --only functions --project luisdelatorre-portfolio
```
Expected: builds (predeploy) and deploys `publish` (gen2, us-central1). If it
errors that Blaze is required, the Blaze upgrade prerequisite is not yet done —
stop and report.

- [ ] **Step 3: No commit** (deploy only; code already committed).

---

### Task 5: Verification

**Files:** none

- [ ] **Step 1: Type check + functions build**

Run: `npx tsc --noEmit && npm --prefix functions run build`
Expected: both PASS.

- [ ] **Step 2: Controller — dispatch the deploy workflow directly**

(After `GCP_SA_KEY` secret + SA Hosting Admin role are in place, and `deploy.yml`
is on `main`.) Run:
```bash
gh workflow run deploy.yml --repo beto-dt/portfolio-dt --ref main
sleep 5 && gh run list --repo beto-dt/portfolio-dt --workflow=deploy.yml -L 1
```
Expected: a run starts; it completes `success`; `https://luisdelatorre.dev`
reflects the current Firestore content.

- [ ] **Step 3: Owner — Publish from `/admin`**

In `/admin` (signed in), click **Publicar**. Expected: "Publicación iniciada
(~2-3 min)." + a working "Ver progreso" link; after the run, the live site shows
the latest saved hero content.

- [ ] **Step 4: Non-admin rejected**

Confirm a non-owner calling `publish` gets `permission-denied` (sign in with a
different Google account and click Publicar → error; or call the callable from a
non-owner session).

---

## Self-Review

- **Spec coverage:** deploy workflow dispatchable, single SA for pull+deploy
  (T1); callable `publish` admin-only that dispatches, secret via Secret Manager,
  own functions package + firebase.json functions (T2); `callPublish` in the lazy
  module + Publish button + fire-and-notify with Actions link (T3); function
  deploy + secret (T4); tsc/functions-build + dispatch + button + non-admin
  reject (T5); Blaze + SA role + `GCP_SA_KEY` + PAT prerequisites (T4). ✓
- **Placeholder scan:** none — concrete code/commands throughout. Prerequisite
  gating is explicit, not vague.
- **Type consistency:** `callPublish()` returns `{ ok, actionsUrl }` (T3) matching
  the function's return (T2) and consumed in `onPublish` (T3); `publishSite()`
  wraps `callPublish` (T3); root `tsconfig` excludes `functions` so the app check
  and functions build stay separate (T2). ✓
