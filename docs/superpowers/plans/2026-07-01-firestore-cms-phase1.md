# Firestore CMS — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make all portfolio content editable from Firestore while the public site stays static, by pulling Firestore content into committed JSON at build/deploy time.

**Architecture:** Firestore (`content/es`, `content/en`) is the source of truth. A Node script (`firebase-admin`, run via `tsx`) seeds Firestore from the current typed content, and another pulls Firestore into `src/content/published/{es,en}.json`. The app imports that JSON (typed + validated); no Firebase SDK runs in the browser.

**Tech Stack:** Expo/React Native (existing), Firestore, `firebase-admin` + `tsx` (dev-only scripts), TypeScript.

**Testing note:** No unit-test runner. Verification per task = `npx tsc --noEmit`, running the scripts, `npx expo export -p web`, and inspecting real output.

**Project:** Firebase project id `luisdelatorre-portfolio`.

---

### Task 1: Firestore database, service account, and security rules

**Files:**
- Create: `firestore.rules`
- Modify: `firebase.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create the Firestore database (one-time, manual)**

In the Firebase console for `luisdelatorre-portfolio`:
Build → Firestore Database → Create database → **Production mode** → pick a
location (e.g. `nam5` / `us-central`) → Enable.
(Location is permanent. This must exist before the scripts run.)

- [ ] **Step 2: Generate a service account key (one-time, manual)**

Console → Project settings → Service accounts → **Generate new private key**.
Save the file as `service-account.json` in the repo root. Do NOT commit it.

- [ ] **Step 3: Ignore the key**

Append to `.gitignore`:

```
# Firebase service account (never commit)
service-account.json
```

- [ ] **Step 4: Create `firestore.rules` (deny all client access)**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public site never reads Firestore at runtime; scripts use the Admin SDK
    // which bypasses these rules. Phase 2 will open writes to the admin.
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 5: Add firestore config to `firebase.json`**

Replace the file with:

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "cleanUrls": true,
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

- [ ] **Step 6: Deploy the rules**

Run: `firebase deploy --only firestore:rules --project luisdelatorre-portfolio`
Expected: `Deploy complete!` and `✔ cloud.firestore: released rules firestore.rules`.

- [ ] **Step 7: Commit**

```bash
git add firestore.rules firebase.json .gitignore
git commit -m "chore(firestore): add deny-all rules and firestore config"
```

---

### Task 2: Add dev tooling and move content to a seed folder

**Files:**
- Modify: `package.json` (devDependencies)
- Move: `src/content/es.ts` → `src/content/seed/es.ts`
- Move: `src/content/en.ts` → `src/content/seed/en.ts`
- Modify: `src/content/seed/es.ts` and `seed/en.ts` (import path)
- Modify: `src/content/dictionary.ts` (import path)

- [ ] **Step 1: Install dev dependencies**

Run: `npm install -D firebase-admin tsx @types/node`
Expected: installs without errors; they appear under `devDependencies`.

- [ ] **Step 2: Move the content files into `seed/`**

```bash
mkdir -p src/content/seed
git mv src/content/es.ts src/content/seed/es.ts
git mv src/content/en.ts src/content/seed/en.ts
```

- [ ] **Step 3: Fix the type import path in both seed files**

In `src/content/seed/es.ts` and `src/content/seed/en.ts`, change the first line:

From:
```ts
import type { PortfolioContent } from './types';
```
To:
```ts
import type { PortfolioContent } from '../types';
```

- [ ] **Step 4: Point the dictionary at the seed files (temporary, keeps app working)**

Edit `src/content/dictionary.ts`:

```ts
import type { Locale } from '@/i18n/locales';
import type { PortfolioContent } from './types';
import { es } from './seed/es';
import { en } from './seed/en';

const dictionary: Record<Locale, PortfolioContent> = { es, en };

export function getContent(locale: Locale): PortfolioContent {
  return dictionary[locale];
}
```

- [ ] **Step 5: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS (app still builds from the seed content).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(content): add firebase-admin/tsx tooling; move content to seed/"
```

---

### Task 3: Seed script — upload seed content to Firestore

**Files:**
- Create: `scripts/seed-content.ts`

- [ ] **Step 1: Create `scripts/seed-content.ts`**

```ts
import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

async function main() {
  await db.doc('content/es').set(es);
  await db.doc('content/en').set(en);
  console.log('Seeded content/es and content/en');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS (needs `@types/node` and `firebase-admin` types from Task 2).

- [ ] **Step 3: Run the seed (one-time)**

Run:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npx tsx scripts/seed-content.ts
```
Expected: prints `Seeded content/es and content/en`. Confirm in the Firebase
console that `content/es` and `content/en` documents exist with the content.

- [ ] **Step 4: Commit**

```bash
git add scripts/seed-content.ts
git commit -m "feat(content): add Firestore seed script"
```

---

### Task 4: Content validator and pull script

**Files:**
- Create: `src/content/validate.ts`
- Create: `scripts/pull-content.ts`
- Create (generated): `src/content/published/es.json`, `src/content/published/en.json`

- [ ] **Step 1: Create `src/content/validate.ts`**

```ts
import type { PortfolioContent } from './types';

const REQUIRED_KEYS: (keyof PortfolioContent)[] = [
  'nav',
  'hero',
  'services',
  'impact',
  'stack',
  'experience',
  'projects',
  'certifications',
  'contact',
];

export function assertPortfolioContent(
  data: unknown,
  label = 'content',
): asserts data is PortfolioContent {
  if (!data || typeof data !== 'object') {
    throw new Error(`${label}: expected an object`);
  }
  const obj = data as Record<string, unknown>;
  for (const key of REQUIRED_KEYS) {
    if (obj[key] == null) throw new Error(`${label}: missing key "${key}"`);
  }
  const hero = obj.hero as { titleLead?: unknown; stats?: unknown };
  if (typeof hero.titleLead !== 'string') throw new Error(`${label}: hero.titleLead missing`);
  if (!Array.isArray(hero.stats) || hero.stats.length === 0) {
    throw new Error(`${label}: hero.stats empty`);
  }
  const services = obj.services as { items?: unknown };
  if (!Array.isArray(services.items) || services.items.length === 0) {
    throw new Error(`${label}: services.items empty`);
  }
}
```

- [ ] **Step 2: Create `scripts/pull-content.ts`**

```ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import admin from 'firebase-admin';
import { assertPortfolioContent } from '../src/content/validate';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();
const OUT_DIR = resolve('src/content/published');

async function pull(locale: 'es' | 'en') {
  const snap = await db.doc(`content/${locale}`).get();
  if (!snap.exists) throw new Error(`Firestore doc content/${locale} not found`);
  const data = snap.data();
  assertPortfolioContent(data, `content/${locale}`);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(`${OUT_DIR}/${locale}.json`, JSON.stringify(data, null, 2) + '\n');
  console.log(`Wrote src/content/published/${locale}.json`);
}

async function main() {
  await pull('es');
  await pull('en');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Run the pull (generates the published JSON)**

Run:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npx tsx scripts/pull-content.ts
```
Expected: prints two `Wrote src/content/published/*.json` lines. Confirm both
files exist and contain the full content (nav, hero, services, … contact).

- [ ] **Step 5: Commit**

```bash
git add src/content/validate.ts scripts/pull-content.ts src/content/published/es.json src/content/published/en.json
git commit -m "feat(content): add validator and Firestore pull script; generate published JSON"
```

---

### Task 5: Switch the app to the published JSON

**Files:**
- Modify: `tsconfig.json` (ensure `resolveJsonModule`)
- Modify: `src/content/dictionary.ts`

- [ ] **Step 1: Ensure `resolveJsonModule` in `tsconfig.json`**

Open `tsconfig.json`. Under `compilerOptions`, ensure `"resolveJsonModule": true`
is present (add it if missing). Example result:

```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "resolveJsonModule": true,
    "paths": {
      "@/*": ["./src/*"],
      "@/assets/*": ["./assets/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"]
}
```

- [ ] **Step 2: Rewrite `src/content/dictionary.ts` to import the published JSON**

```ts
import type { Locale } from '@/i18n/locales';
import type { PortfolioContent } from './types';
import { assertPortfolioContent } from './validate';
import esJson from './published/es.json';
import enJson from './published/en.json';

assertPortfolioContent(esJson, 'published/es');
assertPortfolioContent(enJson, 'published/en');

const dictionary: Record<Locale, PortfolioContent> = {
  es: esJson as unknown as PortfolioContent,
  en: enJson as unknown as PortfolioContent,
};

export function getContent(locale: Locale): PortfolioContent {
  return dictionary[locale];
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS (JSON imports resolve; `getContent` signature unchanged).

- [ ] **Step 4: Verify the app renders from the published JSON**

Run: `npx expo export -p web`
Expected: bundles with no errors; `dist/index.html` contains real content
(e.g. `grep -c "Cómo puedo ayudarte" dist/index.html` returns ≥ 1, and
`grep -c "How I can help you" dist/index.html` ≥ 1 for the EN copy in the bundle).

- [ ] **Step 5: Commit**

```bash
git add tsconfig.json src/content/dictionary.ts
git commit -m "feat(content): source content from Firestore-published JSON"
```

---

### Task 6: npm scripts for seed / pull / deploy

**Files:**
- Modify: `package.json` (scripts)

- [ ] **Step 1: Add scripts to `package.json`**

In the `"scripts"` block add:

```json
"content:seed": "tsx scripts/seed-content.ts",
"content:pull": "tsx scripts/pull-content.ts",
"deploy": "npm run content:pull && expo export -p web && firebase deploy --only hosting"
```

- [ ] **Step 2: Verify the pull script runs via the npm alias**

Run:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npm run content:pull
```
Expected: prints the two `Wrote …` lines with no diff to the committed JSON
(`git status --short src/content/published` shows no changes).

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore(scripts): add content:seed, content:pull, deploy npm scripts"
```

---

### Task 7: End-to-end verification

**Files:** none (verification only)

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 2: Confirm the web bundle excludes Firebase SDKs**

Run:
```bash
rm -rf dist && npx expo export -p web
grep -rl "firebase-admin" dist && echo "LEAK" || echo "clean: no firebase-admin"
```
Expected: `clean: no firebase-admin` (the admin SDK is dev-only, never bundled).

- [ ] **Step 3: Render parity check**

Confirm the exported site still shows all sections in both languages:
```bash
for s in "Cómo puedo ayudarte" "Resultados medibles" "Tecnologías que domino" "Experiencia" "Proyectos" "Trabajemos juntos"; do
  printf '%-28s ' "$s:"; grep -qF "$s" dist/index.html && echo FOUND || echo missing
done
```
Expected: all FOUND (identical content to before, now sourced from Firestore).

- [ ] **Step 4: Firestore rules check**

Confirm client access is denied (Firestore console → Rules playground, or attempt
a client read). Expected: read and write both denied for unauthenticated/any
client. The Admin SDK scripts still work (they bypass rules).

- [ ] **Step 5: Deploy (optional, publishes the Firestore-sourced site)**

Run:
```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npm run deploy
```
Expected: pull succeeds, export succeeds, `Deploy complete!`, site live at
`https://luisdelatorre-portfolio.web.app` (and `luisdelatorre.dev` once the
domain is connected) showing identical content.

---

## Self-Review

- **Spec coverage:** Firestore model `content/{es,en}` (T3/T4); all 8 sections
  (seed = full content, T2); Firestore-only source, no runtime fallback
  (dictionary imports generated JSON, T5); build-time generation via
  seed+pull scripts (T3/T4/T6); service account + deny-all rules + firestore in
  firebase.json + firebase-admin devDep (T1/T2); deploy flow (T6); error handling
  = pull validates and exits non-zero, dictionary asserts on load (T4/T5);
  verification incl. bundle-excludes-firebase and render parity (T7). ✓
- **Placeholder scan:** none — every step has concrete code/commands.
- **Type consistency:** `assertPortfolioContent(data, label)` defined in T4,
  used identically in T4 (pull) and T5 (dictionary); `getContent(locale)`
  signature unchanged across T2 and T5; `PortfolioContent` from
  `src/content/types.ts` throughout; seed import path `../types` after the move
  (T2). ✓
