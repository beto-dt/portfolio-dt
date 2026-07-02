# Admin Login Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The `/admin` sign-in screen matches the approved mock (branded card over grid+glow backdrop, white Google button, SEGURIDAD note, "← Volver al sitio").

**Architecture:** New `login-view.tsx` exporting `AdminBackdrop` (full-screen background wrapper) and `LoginView` (the card); `admin-screen.tsx`'s loading and signed-out branches delegate to them. Auth logic untouched.

**Tech Stack:** Existing web-cast pattern, `expo-router`'s `router`, official Google G asset (hotlinked). No test runner.

**Verification note:** No jest. Verify with `npx tsc --noEmit`, `npx expo export -p web`, hygiene grep, and preview of `/admin`. Do NOT run `npx expo lint`.

---

### Task 1: `LoginView` + rewire admin branches

**Files:**
- Create: `src/admin/components/login-view.tsx`
- Modify: `src/admin/screens/admin-screen.tsx`

- [ ] **Step 1: Create `src/admin/components/login-view.tsx` with EXACTLY:**

```tsx
import type { ReactNode } from 'react';
import { Image, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { router } from 'expo-router';
import { colors, fonts } from '@/theme/tokens';
import { HoverLink } from '@/ui/hover-link';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

const backdropWeb = Platform.OS === 'web'
  ? ({
      backgroundImage:
        'radial-gradient(640px 420px at 50% 30%, rgba(228,227,87,0.06), rgba(228,227,87,0) 70%), ' +
        'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), ' +
        'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: 'auto, 48px 48px, 48px 48px',
    } as object)
  : null;
const cardGlowWeb = Platform.OS === 'web'
  ? ({ backgroundImage: 'radial-gradient(420px 260px at 80% 0%, rgba(228,227,87,0.06), rgba(228,227,87,0) 70%)' } as object)
  : null;
const googleWeb = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color, box-shadow', transitionDuration: '150ms' } as object)
  : null;
const googleHoverShadow = Platform.OS === 'web' ? ({ boxShadow: '0 8px 24px rgba(0,0,0,0.35)' } as object) : null;

/** Full-screen admin background (subtle grid + accent glow), content centered. */
export function AdminBackdrop({ children }: { children: ReactNode }) {
  return (
    <View style={[{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 }, backdropWeb as object]}>
      {children}
    </View>
  );
}

export function LoginView({ onSignIn, error }: { onSignIn: () => void; error: string | null }) {
  return (
    <AdminBackdrop>
      <View style={[{ width: '100%', maxWidth: 460, borderRadius: 24, borderWidth: 1, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)', padding: 36, gap: 18 }, cardGlowWeb as object]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ backgroundColor: colors.surfaceCell, padding: 6, borderRadius: 12 }}>
            <Image source={require('@/assets/images/logo.png')} style={{ width: 40, height: 40, borderRadius: 10 }} />
          </View>
          <View style={{ gap: 2 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.text }}>Luis De La Torre</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1.5, color: colors.accent }}>CONSOLE</Text>
          </View>
        </View>

        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 }}>
          <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: colors.accent }} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: 'rgb(201,205,212)' }}>ACCESO PRIVADO</Text>
        </View>

        <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.text }}>Panel de administración</Text>
        <Text style={{ fontSize: 14.5, lineHeight: 22, color: colors.textMuted }}>
          Gestiona las solicitudes de proyectos y las citas agendadas desde tu portfolio.
        </Text>

        <Pressable
          onPress={onSignIn}
          style={({ hovered, pressed }: HoverState) => [
            { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: hovered ? '#f1f1f1' : '#ffffff', borderRadius: 12, paddingVertical: 14, opacity: pressed ? 0.85 : 1 },
            googleWeb as object,
            hovered ? (googleHoverShadow as object) : null,
          ]}
        >
          <Image source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }} style={{ width: 18, height: 18 }} />
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: '#1f1f1f' }}>Iniciar sesión con Google</Text>
        </Pressable>
        {error ? <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text> : null}

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textFaint }}>SEGURIDAD</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Text style={{ fontSize: 14, opacity: 0.7 }}>🔒</Text>
          <Text style={{ flex: 1, fontSize: 12.5, lineHeight: 19, color: colors.textFaint }}>
            Solo cuentas autorizadas pueden acceder. Tu sesión se cifra de extremo a extremo y expira automáticamente.
          </Text>
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        <HoverLink label="← Volver al sitio" onPress={() => router.replace('/')} color={colors.textFaint} hoverColor={colors.accent} />
      </View>
    </AdminBackdrop>
  );
}
```

- [ ] **Step 2: Rewire `admin-screen.tsx`.**
  - Add import: `import { AdminBackdrop, LoginView } from '../components/login-view';`
  - Replace the `!authReady` branch's JSX with:

```tsx
    return (
      <AdminBackdrop>
        <ActivityIndicator color={colors.accent} />
      </AdminBackdrop>
    );
```

  - Replace the `!user` branch's JSX with:

```tsx
    return <LoginView onSignIn={onSignIn} error={error} />;
```

  (The old inline card JSX for both branches is removed; nothing else changes.)

- [ ] **Step 3:** `npx tsc --noEmit && npx expo export -p web` → PASS + hygiene
grep clean. Commit:

```bash
git add src/admin/
git commit -m "feat(admin): branded login screen (console card, Google button, security note)"
```

---

### Task 2: Verify + deploy

- [ ] **Step 1: Preview `http://localhost:8081/admin`:** backdrop grid+glow;
card shows logo/CONSOLE, ACCESO PRIVADO, título, subtítulo, botón Google blanco
(G + texto oscuro), divider SEGURIDAD, nota con 🔒; "← Volver al sitio" navega a
`/`. (El sign-in real requiere el popup de Google — se prueba en vivo.)

- [ ] **Step 2: Deploy.** PR flow; tras el merge `gh workflow run deploy.yml
--ref main` → watch → check en vivo iniciando sesión.

---

## Self-Review

**1. Spec coverage:** backdrop (T1 S1 `AdminBackdrop`) ✓ · card 8 piezas ✓ ·
Google button hover/press ✓ · error bajo el botón ✓ · volver al sitio con
`router.replace('/')` ✓ · loading branch con backdrop ✓ · verify/deploy (T2) ✓.
**2. Placeholders:** none. **3. Consistency:** `LoginView({ onSignIn, error })`
coincide con `onSignIn`/`error` ya definidos en `AdminScreen` antes de los early
returns ✓; `ActivityIndicator`/`colors` ya importados en admin-screen ✓.
