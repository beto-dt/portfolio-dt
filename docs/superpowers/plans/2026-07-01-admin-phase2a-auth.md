# Admin Panel — Phase 2A (auth spine) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A protected `/admin` route where the owner signs in with Google and can load, edit, and save the hero section of the portfolio content in Firestore.

**Architecture:** `/admin` route in the existing Expo app. The Firebase client SDK is loaded only via dynamic `import()` from the admin code so the public routes stay clean. Auth is Google Sign-In restricted to the owner email; the real security boundary is Firestore rules (owner-only on `content/*`). Saving writes to Firestore only (publishing to the live site is Phase 2C).

**Tech Stack:** Expo Router, React Native / react-native-web, Firebase JS SDK (`firebase/app`, `firebase/auth`, `firebase/firestore`), TypeScript.

**Testing note:** No unit-test runner. Automated gate = `npx tsc --noEmit` + `npx expo export -p web`. Google sign-in and the Firestore save/deny checks are **manual** (OAuth popup can't be automated) and flagged as such.

**Project:** Firebase `luisdelatorre-portfolio`. Owner email: `luis.atorred24@gmail.com`.

---

### Task 1: Firebase client dependency, config, and lazy init

**Files:**
- Modify: `package.json` (add `firebase`)
- Create: `src/admin/firebase-config.ts`
- Create: `src/admin/admin-email.ts`
- Create: `src/admin/firebase-client.ts`

- [ ] **Step 1: Install the Firebase client SDK (runtime dependency)**

Run: `npm install firebase`
Expected: `firebase` appears under `dependencies` in package.json.

- [ ] **Step 2: Create `src/admin/firebase-config.ts`**

```ts
// Firebase web config is a public project identifier, not a secret. Security is
// enforced by Firestore rules + authorized domains.
export const firebaseConfig = {
  apiKey: 'AIzaSyBwuVUCyfUQKqKGhrYYqWxbFKMaKM6qNa0',
  authDomain: 'luisdelatorre-portfolio.firebaseapp.com',
  projectId: 'luisdelatorre-portfolio',
  storageBucket: 'luisdelatorre-portfolio.firebasestorage.app',
  messagingSenderId: '789944008050',
  appId: '1:789944008050:web:ec32700ba3238299e771eb',
};
```

- [ ] **Step 3: Create `src/admin/admin-email.ts`**

```ts
export const ADMIN_EMAIL = 'luis.atorred24@gmail.com';
```

- [ ] **Step 4: Create `src/admin/firebase-client.ts`**

```ts
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

type FirebaseBundle = { app: FirebaseApp; auth: Auth; db: Firestore };

let cached: FirebaseBundle | null = null;

/** Initializes Firebase once. Only reached via dynamic import() from the admin
 *  code, so the public route bundle never pulls the Firebase SDK. */
export function getFirebase(): FirebaseBundle {
  if (cached) return cached;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  cached = { app, auth: getAuth(app), db: getFirestore(app) };
  return cached;
}
```

- [ ] **Step 5: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS (firebase ships its own types).

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json src/admin/firebase-config.ts src/admin/admin-email.ts src/admin/firebase-client.ts
git commit -m "feat(admin): add Firebase client SDK, config, and lazy init"
```

---

### Task 2: Auth helpers (Google sign-in, owner-restricted)

**Files:**
- Create: `src/admin/auth.ts`

- [ ] **Step 1: Create `src/admin/auth.ts`**

```ts
import type { User } from 'firebase/auth';
import { ADMIN_EMAIL } from './admin-email';

export async function signInWithGoogle(): Promise<User> {
  const { getFirebase } = await import('./firebase-client');
  const { GoogleAuthProvider, signInWithPopup, signOut } = await import('firebase/auth');
  const { auth } = getFirebase();
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  if (cred.user.email !== ADMIN_EMAIL) {
    await signOut(auth);
    throw new Error('No autorizado');
  }
  return cred.user;
}

export async function signOutAdmin(): Promise<void> {
  const { getFirebase } = await import('./firebase-client');
  const { signOut } = await import('firebase/auth');
  await signOut(getFirebase().auth);
}

/** Subscribes to auth changes; only surfaces the user when it is the owner.
 *  Returns the unsubscribe function. */
export async function onAdminAuthChanged(
  callback: (user: User | null) => void,
): Promise<() => void> {
  const { getFirebase } = await import('./firebase-client');
  const { onAuthStateChanged } = await import('firebase/auth');
  return onAuthStateChanged(getFirebase().auth, (user) => {
    callback(user && user.email === ADMIN_EMAIL ? user : null);
  });
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/admin/auth.ts
git commit -m "feat(admin): add Google sign-in auth helpers (owner-restricted)"
```

---

### Task 3: Owner-only Firestore rules

**Files:**
- Modify: `firestore.rules`

- [ ] **Step 1: Replace `firestore.rules`**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only the owner (verified email) can read/write content. The public site
    // does not read Firestore at runtime; the build-time pull uses the Admin SDK
    // which bypasses these rules.
    match /content/{doc} {
      allow read, write: if request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email == 'luis.atorred24@gmail.com';
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

- [ ] **Step 2: Deploy the rules**

Run: `firebase deploy --only firestore:rules --project luisdelatorre-portfolio`
Expected: `✔ Deploy complete!` and `released rules firestore.rules`.

- [ ] **Step 3: Commit**

```bash
git add firestore.rules
git commit -m "feat(admin): restrict Firestore content to owner (auth email rule)"
```

---

### Task 4: Content repository (client-side load/save)

**Files:**
- Create: `src/admin/content-repo.ts`

- [ ] **Step 1: Create `src/admin/content-repo.ts`**

```ts
import type { Locale } from '@/i18n/locales';
import type { PortfolioContent } from '@/content/types';
import { assertPortfolioContent } from '@/content/validate';

export async function loadContent(locale: Locale): Promise<PortfolioContent> {
  const { getFirebase } = await import('./firebase-client');
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(getFirebase().db, 'content', locale));
  if (!snap.exists()) throw new Error(`content/${locale} no existe`);
  const data = snap.data();
  assertPortfolioContent(data, `content/${locale}`);
  return data;
}

export async function saveSection<K extends keyof PortfolioContent>(
  locale: Locale,
  key: K,
  value: PortfolioContent[K],
): Promise<void> {
  const { getFirebase } = await import('./firebase-client');
  const { doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(getFirebase().db, 'content', locale), { [key]: value });
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/admin/content-repo.ts
git commit -m "feat(admin): add Firestore content load/save repository"
```

---

### Task 5: Hero form component

**Files:**
- Create: `src/admin/components/hero-form.tsx`

- [ ] **Step 1: Create `src/admin/components/hero-form.tsx`**

```tsx
import { Pressable, Text, TextInput, View } from 'react-native';
import type { HeroContent, Stat } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';

const inputStyle = {
  color: colors.text,
  fontFamily: fonts.body,
  fontSize: 14,
  backgroundColor: colors.surfaceStrong,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.sm,
  paddingHorizontal: 10,
  paddingVertical: 8,
} as const;

function Field({ label, value, onChangeText, multiline }: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[inputStyle, multiline ? { minHeight: 72, textAlignVertical: 'top' } : null]}
        placeholderTextColor={colors.textFaint}
      />
    </View>
  );
}

export function HeroForm({ value, onChange }: { value: HeroContent; onChange: (h: HeroContent) => void }) {
  const set = <K extends keyof HeroContent>(key: K, v: HeroContent[K]) => onChange({ ...value, [key]: v });

  const setStat = (index: number, patch: Partial<Stat>) => {
    const stats = value.stats.map((s, i) => (i === index ? { ...s, ...patch } : s));
    set('stats', stats);
  };
  const addStat = () => set('stats', [...value.stats, { value: '', label: '' }]);
  const removeStat = (index: number) => set('stats', value.stats.filter((_, i) => i !== index));

  return (
    <View style={{ gap: 16 }}>
      <Field label="availability" value={value.availability} onChangeText={(t) => set('availability', t)} />
      <Field label="titleLead" value={value.titleLead} onChangeText={(t) => set('titleLead', t)} />
      <Field label="titleAccent" value={value.titleAccent} onChangeText={(t) => set('titleAccent', t)} />
      <Field label="subtitle" value={value.subtitle} onChangeText={(t) => set('subtitle', t)} multiline />

      <Field label="primaryCta.label" value={value.primaryCta.label} onChangeText={(t) => set('primaryCta', { ...value.primaryCta, label: t })} />
      <Field label="primaryCta.anchor" value={value.primaryCta.anchor} onChangeText={(t) => set('primaryCta', { ...value.primaryCta, anchor: t })} />
      <Field label="secondaryCta.label" value={value.secondaryCta.label} onChangeText={(t) => set('secondaryCta', { ...value.secondaryCta, label: t })} />
      <Field label="secondaryCta.anchor" value={value.secondaryCta.anchor} onChangeText={(t) => set('secondaryCta', { ...value.secondaryCta, anchor: t })} />

      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>stats</Text>
        {value.stats.map((stat, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Field label="value" value={stat.value} onChangeText={(t) => setStat(i, { value: t })} />
            </View>
            <View style={{ flex: 2 }}>
              <Field label="label" value={stat.label} onChangeText={(t) => setStat(i, { label: t })} />
            </View>
            <Pressable onPress={() => removeStat(i)} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 9 }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>✕</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={addStat} style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ color: colors.text, fontSize: 13 }}>+ Añadir stat</Text>
        </Pressable>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/admin/components/hero-form.tsx
git commit -m "feat(admin): add hero editor form"
```

---

### Task 6: Admin screen + route

**Files:**
- Create: `src/admin/screens/admin-screen.tsx`
- Create: `src/app/admin/index.tsx`

- [ ] **Step 1: Create `src/admin/screens/admin-screen.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import type { User } from 'firebase/auth';
import type { HeroContent, PortfolioContent } from '@/content/types';
import type { Locale } from '@/i18n/locales';
import { colors, fonts, radii } from '@/theme/tokens';
import { onAdminAuthChanged, signInWithGoogle, signOutAdmin } from '../auth';
import { loadContent, saveSection } from '../content-repo';
import { HeroForm } from '../components/hero-form';

export function AdminScreen() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [locale, setLocale] = useState<Locale>('es');
  const [hero, setHero] = useState<HeroContent | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

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
        <Pressable onPress={signOutAdmin} style={{ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 7 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>Cerrar sesión</Text>
        </Pressable>
      </View>

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

- [ ] **Step 2: Create `src/app/admin/index.tsx`**

```tsx
import { AdminScreen } from '@/admin/screens/admin-screen';

export default function Admin() {
  return <AdminScreen />;
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Verify the app builds**

Run: `rm -rf dist && npx expo export -p web`
Expected: bundles with no errors; `dist/admin.html` (or `dist/admin/index.html`) exists.

- [ ] **Step 5: Commit**

```bash
git add src/admin/screens/admin-screen.tsx src/app/admin/index.tsx
git commit -m "feat(admin): add /admin route with login gate and hero editor"
```

---

### Task 7: Verification

**Files:** none (verification only)

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 2: Bundle hygiene (public routes exclude Firebase)**

Run:
```bash
rm -rf dist && npx expo export -p web
echo "--- firebase referenced in these chunks: ---"
grep -rl "initializeApp\|firebaseapp.com" dist/_expo/static/js/web/*.js || echo "none"
```
Expected: build succeeds. Firebase should appear only in a lazily-loaded chunk, not in the main entry loaded by the home page. If Metro's static export does not split the chunk (Firebase ends up in the single entry bundle), record it as a known limitation for this phase — functionality is unaffected; revisit splitting in 2C if bundle size matters.

- [ ] **Step 3: Manual — owner sign-in and save**

Run `npm run web`, open `/admin`:
- Click "Iniciar sesión con Google", sign in with `luis.atorred24@gmail.com`.
- The hero editor appears. Change `titleAccent` (e.g. add a word), pick ES, click **Guardar**.
- Expected: status shows "Guardado en Firestore — publica para verlo en vivo."
- In the Firebase console, `content/es` → `hero.titleAccent` reflects the change.

- [ ] **Step 4: Manual — non-owner denied**

Confirm a non-owner cannot write `content/*`: either sign in with a different Google account (the app signs you out with "No autorizado"), or in the Firestore Rules Playground simulate an authenticated write with a different email → denied.

- [ ] **Step 5: Manual — live site unchanged**

Confirm `https://luisdelatorre.dev` still shows the old hero (saving does not publish; publishing is Phase 2C).

- [ ] **Step 6: Commit (only if fixes were needed)**

```bash
git add -A
git commit -m "fix(admin): phase 2A verification adjustments"
```

---

## Self-Review

- **Spec coverage:** `/admin` route (T6); Google sign-in owner-restricted (T2); lazy Firebase via dynamic import (T1/T2/T4); public web config file (T1); owner-only rules deployed (T3); load/edit/save hero end-to-end (T4/T5/T6); "saved not published" UI note (T6); bundle-hygiene + sign-in + rules-deny + live-unchanged verification (T7). ✓
- **Placeholder scan:** none — every step has concrete code/commands. The one soft branch (chunk-splitting) is an explicit, documented fallback, not a vague instruction.
- **Type consistency:** `getFirebase()` returns `{app,auth,db}` (T1) used in T2/T4; `signInWithGoogle`/`signOutAdmin`/`onAdminAuthChanged` (T2) used in T6; `loadContent`/`saveSection` (T4) used in T6; `HeroForm({value,onChange})` (T5) used in T6; `HeroContent`/`Stat`/`PortfolioContent`/`Locale` from existing modules; `assertPortfolioContent` from `@/content/validate`. ✓
