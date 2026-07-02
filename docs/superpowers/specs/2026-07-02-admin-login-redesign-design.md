# Admin Login Redesign — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Replace the plain `/admin` sign-in view with the approved mock: a branded card
(logo + CONSOLE, ACCESO PRIVADO badge, white Google button with the official G,
SEGURIDAD note) over a subtle grid + glow background, plus a "← Volver al sitio"
link. Login screen only — the inner panel is untouched.

## Decisions (agreed with user)

- Scope: only the unauthenticated view (and the auth-loading spinner shares the
  new background). Hardcoded Spanish (the admin has never been CMS/bilingual).
- Google "G": hotlink the official asset
  `https://developers.google.com/identity/images/g-logo.png` (stable, widely
  used; the admin is a private page so an external image is acceptable).
- Lock glyph: the `🔒` text glyph (no icon dependency added).

## Architecture

**Create `src/admin/components/login-view.tsx`** exporting
`LoginView({ onSignIn, error }: { onSignIn: () => void; error: string | null })`
and `AdminBackdrop({ children })` (full-screen background wrapper reused by the
loading branch):

- **Backdrop**: `flex: 1`, `backgroundColor: colors.background`, centered
  content, web-only cast:

```ts
const backdropWeb = Platform.OS === 'web'
  ? ({
      backgroundImage:
        'radial-gradient(640px 420px at 50% 30%, rgba(228,227,87,0.06), rgba(228,227,87,0) 70%), ' +
        'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), ' +
        'linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
      backgroundSize: 'auto, 48px 48px, 48px 48px',
    } as object)
  : null;
```

- **Card** (`maxWidth: 460, width: '100%', borderRadius: 24, borderWidth: 1,
  borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.02)',
  padding: 36, gap: 18` + the contact-card-style web glow
  `radial-gradient(420px 260px at 80% 0%, rgba(228,227,87,0.06), rgba(228,227,87,0) 70%)`):
  1. Header row (`gap: 12`): `Image require('@/assets/images/logo.png')`
     40×40 `borderRadius: 10` inside a `backgroundColor: colors.surfaceCell`
     `padding: 6, borderRadius: 12` box; column with
     `Luis De La Torre` (`fonts.display`, 16, `colors.text`) and `CONSOLE`
     (`fonts.mono`, 10, `letterSpacing: 1.5`, `colors.accent`).
  2. Badge (self-start pill, `borderWidth 1 colors.border`, `paddingH 12 /
     paddingV 6`, row `gap 8`): accent dot 6×6 + `ACCESO PRIVADO`
     (`fonts.mono`, 10.5, `letterSpacing: 1`, `rgb(201,205,212)`).
  3. `Panel de administración` (`fonts.display`, 26, `colors.text`).
  4. `Gestiona las solicitudes de proyectos y las citas agendadas desde tu
     portfolio.` (14.5 / lineHeight 22, `colors.textMuted`).
  5. **Google button**: full-width `Pressable`
     (`backgroundColor` hover `#f1f1f1` else `#ffffff`, `borderRadius: 12`,
     `paddingVertical: 14`, centered row `gap: 10`, pressed `opacity 0.85`,
     web cursor+transition+`boxShadow '0 8px 24px rgba(0,0,0,0.35)'` on hover):
     `Image source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}`
     18×18 + `Iniciar sesión con Google` (`fonts.bodyMedium`, 15, `#1f1f1f`).
     `onPress={onSignIn}`.
  6. Error (when set): `{error}` (`#ff6b6b`, 13) under the button.
  7. Divider row (`gap: 10`, centered): 1px flex lines (`colors.border`) around
     `SEGURIDAD` (`fonts.mono`, 10, `letterSpacing: 1`, `colors.textFaint`).
  8. Security row (`gap: 10`): `🔒` (14, `opacity 0.7`) + `Solo cuentas
     autorizadas pueden acceder. Tu sesión se cifra de extremo a extremo y
     expira automáticamente.` (12.5 / 19, `colors.textFaint`, flex 1).
- Below the card (`marginTop: 24`): `HoverLink` `← Volver al sitio`
  (`colors.textFaint` → `colors.accent`) with
  `onPress={() => router.replace('/')}` (`import { router } from 'expo-router'`).

**`admin-screen.tsx`** changes:
- `!authReady` branch → `<AdminBackdrop><ActivityIndicator color={colors.accent} /></AdminBackdrop>`.
- `!user` branch → `<LoginView onSignIn={onSignIn} error={error} />`.
- Old inline JSX for both branches removed; everything else untouched.

## Error handling

Same auth flow (`onSignIn` try/catch already sets `error`). External G image
failing to load just leaves the label (Image renders empty) — button still works.

## Testing / verification

- `npx tsc --noEmit` + `npx expo export -p web` + bundle hygiene clean.
- Preview `http://localhost:8081/admin`: backdrop grid+glow, card renders all 8
  pieces, Google button hover/press feedback, "Volver al sitio" navigates to `/`.
  (Sign-in itself requires Google popup — verified live as always.)
- Live check after deploy.

## Implementation order

1. `login-view.tsx` + rewire `admin-screen.tsx`. 2. Verify + deploy.
