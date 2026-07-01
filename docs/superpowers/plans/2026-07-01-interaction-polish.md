# Interaction Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make interactive elements feel clickable (cursor/hover/press) and work (nav + CTAs smooth-scroll to sections), on the public site and `/admin`.

**Architecture:** Reusable `src/ui/` primitives (AppButton, HoverLink, HoverCard, Chip, scrollToAnchor) built on `Pressable`'s `{hovered, pressed}` state + web-only `cursor`/`transition` style props. Section `Container`s get `nativeID`s so `scrollIntoView` can target them.

**Tech Stack:** Expo/React Native web, TypeScript. No new dependencies.

**Testing note:** Gate = `npx tsc --noEmit` + `npx expo export -p web` + public-bundle-excludes-Firebase check + a browser hover/press/scroll check.

---

### Task 1: `src/ui/` interaction primitives

**Files:**
- Create: `src/ui/scroll-to-anchor.ts`, `src/ui/app-button.tsx`, `src/ui/hover-link.tsx`, `src/ui/hover-card.tsx`, `src/ui/chip.tsx`

- [ ] **Step 1: `src/ui/scroll-to-anchor.ts`**

```ts
export function scrollToAnchor(anchor: string): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(anchor);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
```

- [ ] **Step 2: `src/ui/app-button.tsx`**

```tsx
import { Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

type Variant = 'primary' | 'outline' | 'pill' | 'pillPrimary';
type HoverState = PressableStateCallbackType & { hovered?: boolean };

// react-native-web accepts these web-only style props; cast at the boundary.
const webInteractive = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'opacity, transform, background-color, border-color', transitionDuration: '150ms' } as object)
  : null;

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'sm' | 'md';
}) {
  const isPrimary = variant === 'primary' || variant === 'pillPrimary';
  const isPill = variant === 'pill' || variant === 'pillPrimary';
  const pad = size === 'sm' ? { paddingHorizontal: 14, paddingVertical: 8 } : { paddingHorizontal: 24, paddingVertical: 13 };

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: HoverState) => [
        {
          borderRadius: isPill ? radii.pill : radii.md,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: hovered ? 'rgba(255,255,255,0.35)' : colors.borderStrong,
          backgroundColor: isPrimary ? (hovered ? '#eeed6b' : colors.accent) : hovered ? colors.surfaceStrong : 'transparent',
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          ...pad,
        },
        webInteractive as object,
      ]}
    >
      <Text style={{ fontSize: size === 'sm' ? 13 : 15, fontFamily: fonts.bodyMedium, color: isPrimary ? colors.onAccent : 'rgb(231,233,236)' }}>
        {label}
      </Text>
    </Pressable>
  );
}
```

- [ ] **Step 3: `src/ui/hover-link.tsx`**

```tsx
import { Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { colors, fonts } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

export function HoverLink({
  label,
  onPress,
  color = colors.textMuted,
  hoverColor = colors.text,
  size = 13.5,
  mono = false,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  hoverColor?: string;
  size?: number;
  mono?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={webCursor as object}>
      {({ hovered }: HoverState) => (
        <Text style={{ fontSize: size, fontFamily: mono ? fonts.mono : fonts.body, color: hovered ? hoverColor : color }}>{label}</Text>
      )}
    </Pressable>
  );
}
```

- [ ] **Step 4: `src/ui/hover-card.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Platform, Pressable, type PressableStateCallbackType, type ViewStyle } from 'react-native';
import { colors } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webTransition = Platform.OS === 'web'
  ? ({ transitionProperty: 'transform, border-color, background-color', transitionDuration: '180ms' } as object)
  : null;

export function HoverCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        style,
        hovered ? { transform: [{ translateY: -2 }], borderColor: colors.borderStrong, backgroundColor: colors.surfaceStrong } : null,
        webTransition as object,
      ]}
    >
      {children}
    </Pressable>
  );
}
```

- [ ] **Step 5: `src/ui/chip.tsx`**

```tsx
import { Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionDuration: '150ms', transitionProperty: 'background-color, border-color' } as object) : null;

export function Chip({ label, active, onPress, mono = true }: { label: string; active: boolean; onPress: () => void; mono?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: HoverState) => [
        {
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: active ? colors.accent : hovered ? colors.borderStrong : colors.border,
          backgroundColor: active ? 'rgba(228,227,87,0.12)' : hovered ? colors.surfaceStrong : 'transparent',
          paddingHorizontal: 12,
          paddingVertical: 7,
        },
        webCursor as object,
      ]}
    >
      <Text style={{ color: active ? colors.accent : colors.text, fontSize: 12.5, fontFamily: mono ? fonts.mono : fonts.body }}>{label}</Text>
    </Pressable>
  );
}
```

- [ ] **Step 6: Verify + commit**

Run: `npx tsc --noEmit` — Expected: PASS.
```bash
git add src/ui
git commit -m "feat(ui): add interactive primitives (AppButton/HoverLink/HoverCard/Chip/scrollToAnchor)"
```

---

### Task 2: Public site — nativeIDs + wire header/hero/contact/cards

**Files:**
- Modify: `src/features/portfolio/components/container.tsx` (nativeID passthrough)
- Modify: `src/features/portfolio/sections/{hero,services,experience,projects,contact}/*-section.tsx` (nativeID)
- Modify: `src/features/portfolio/components/site-header.tsx`
- Modify: `src/features/portfolio/sections/hero/hero-section.tsx`
- Modify: `src/features/portfolio/sections/contact/contact-section.tsx`
- Modify: `src/features/portfolio/sections/services/service-card.tsx`
- Modify: `src/features/portfolio/sections/projects/project-card.tsx`

- [ ] **Step 1: `container.tsx` — accept and forward `nativeID`**

Read the file. Add a `nativeID?: string` prop and pass it to the root `View`. Example result:
```tsx
export function Container({ children, style, nativeID }: { children: ReactNode; style?: ViewStyle; nativeID?: string }) {
  return (
    <View nativeID={nativeID} style={[{ width: '100%', maxWidth: layout.maxWidth, marginHorizontal: 'auto', paddingHorizontal: layout.gutter }, style]}>
      {children}
    </View>
  );
}
```

- [ ] **Step 2: Add `nativeID` to the five section Containers**

In each section file, add the matching `nativeID` prop to its `<Container ...>`:
- `hero-section.tsx` → `nativeID="top"`
- `services-section.tsx` → `nativeID="services"`
- `experience-section.tsx` → `nativeID="experience"`
- `projects-section.tsx` → `nativeID="projects"`
- `contact-section.tsx` → `nativeID="contact"`

(Only add the prop to the existing `<Container style={{ paddingVertical: ... }}>` — change nothing else.)

- [ ] **Step 3: Rewrite `site-header.tsx` to use HoverLink + AppButton**

Read the file. Keep the outer layout and the name/role block. Replace the nav block: each `link` becomes a `HoverLink` that scrolls; the toggle and CTA become `AppButton`s. Imports to add:
```tsx
import { HoverLink } from '@/ui/hover-link';
import { AppButton } from '@/ui/app-button';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';
```
Replace the nav `View`'s children with:
```tsx
        {nav.links.map((link) => (
          <HoverLink key={link.anchor} label={link.label} onPress={() => scrollToAnchor(link.anchor)} />
        ))}
        <AppButton label={nav.languageToggleLabel} onPress={toggleLocale} variant="pill" size="sm" />
        <AppButton label={nav.cta.label} onPress={() => scrollToAnchor(nav.cta.anchor)} variant="pillPrimary" size="sm" />
```
Remove the old `<Text>` link map, the toggle `<Pressable>`, and the CTA `<View>`. Keep the `alignItems: 'center', gap: 24, flexWrap: 'wrap'` on the nav container.

- [ ] **Step 4: Hero CTAs → AppButton**

Read `hero-section.tsx`. Replace the CTA row (the `View` containing the two CTA `View`s and the CV `Pressable`) with:
```tsx
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <AppButton label={hero.primaryCta.label} onPress={() => scrollToAnchor(hero.primaryCta.anchor)} variant="primary" />
          <AppButton label={hero.secondaryCta.label} onPress={() => scrollToAnchor(hero.secondaryCta.anchor)} variant="outline" />
          <AppButton label={`↓ ${hero.cvLabel}`} onPress={() => Linking.openURL(hero.cvUrl)} variant="outline" />
        </View>
```
Add imports:
```tsx
import { AppButton } from '@/ui/app-button';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';
```
Ensure `Linking` is imported from `react-native` (it already is, for the CV button). Remove the now-unused `Pressable` import if nothing else uses it.

- [ ] **Step 5: Contact buttons + detail links**

Read `contact-section.tsx`. Replace the two action `Pressable`s (email + WhatsApp) with:
```tsx
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <AppButton label={contact.emailCta} onPress={() => Linking.openURL(`mailto:${contact.email}`)} variant="primary" />
        <AppButton label={contact.whatsappCta} onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}`)} variant="outline" />
      </View>
```
Change the `Detail` component so a tappable value renders a `HoverLink` (accent) instead of a `Text onPress`:
```tsx
function Detail({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  if (!value) return null;
  return (
    <View style={{ gap: 3, minWidth: 150 }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>{label}</Text>
      {onPress ? (
        <HoverLink label={value} onPress={onPress} color={colors.accent} hoverColor={colors.text} />
      ) : (
        <Text style={{ fontSize: 13.5, color: colors.textMuted }}>{value}</Text>
      )}
    </View>
  );
}
```
Add imports:
```tsx
import { AppButton } from '@/ui/app-button';
import { HoverLink } from '@/ui/hover-link';
```
Keep the `Detail` usages (Email/Teléfono/LinkedIn/Ubicación) as they are.

- [ ] **Step 6: Cards → HoverCard**

In `service-card.tsx` and `project-card.tsx`: change the outermost `<View style={cardStyle}>...</View>` to `<HoverCard style={cardStyle}>...</HoverCard>` (move the existing style object to `HoverCard`'s `style` prop; keep all inner content unchanged). Add:
```tsx
import { HoverCard } from '@/ui/hover-card';
```
(If the outer element's style is written inline, pass that same inline object as `HoverCard`'s `style`.)

- [ ] **Step 7: Verify + commit**

```bash
npx tsc --noEmit
rm -rf dist && npx expo export -p web
for c in $(grep -oE '_expo/static/js/web/[a-zA-Z0-9._-]+\.js' dist/index.html); do grep -q "firebaseapp.com\|initializeApp" "dist/$c" && echo "LEAK $c"; done; echo "home checked"
```
Expected: tsc PASS; build succeeds; no `LEAK`. Also confirm the section ids are emitted: `grep -oE 'id="(top|services|experience|projects|contact)"' dist/index.html | sort -u` should list them.
```bash
git add src/features/portfolio
git commit -m "feat(portfolio): interactive buttons/links + working anchor scroll + card hover"
```

---

### Task 3: Admin — apply primitives

**Files:**
- Modify: `src/admin/components/list-editor.tsx`
- Modify: `src/admin/screens/admin-screen.tsx`

- [ ] **Step 1: `list-editor.tsx` — hover/cursor on controls**

Read the file. Replace the internal `Ctrl` component and the "Add" `Pressable` so both show a pointer cursor and a hover background on web. Concretely, give the `Ctrl` Pressable and the Add Pressable a style function using `{ hovered }` plus a web cursor:
```tsx
import { Platform, Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';
import { colors, radii } from '@/theme/tokens';

const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionDuration: '120ms', transitionProperty: 'background-color, border-color, opacity' } as object) : null;

function Ctrl({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => [
        { borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 5, opacity: disabled ? 0.35 : pressed ? 0.7 : 1, backgroundColor: hovered && !disabled ? colors.surfaceStrong : 'transparent' },
        disabled ? null : (webCursor as object),
      ]}
    >
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}
```
And the Add button:
```tsx
      <Pressable
        onPress={() => onChange([...items, makeEmpty()])}
        style={({ hovered, pressed }: { hovered?: boolean; pressed: boolean }) => [
          { alignSelf: 'flex-start', borderWidth: 1, borderColor: hovered ? colors.borderStrong : colors.border, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 8, opacity: pressed ? 0.7 : 1, backgroundColor: hovered ? colors.surfaceStrong : 'transparent' },
          webCursor as object,
        ]}
      >
        <Text style={{ color: colors.text, fontSize: 13 }}>{addLabel}</Text>
      </Pressable>
```
Keep the rest of `ListEditor` (props, map, move/remove logic) exactly as-is; only the two controls change.

- [ ] **Step 2: `admin-screen.tsx` — AppButton + Chip**

Read the file. Apply this mapping (keep ALL state/handlers/logic unchanged):
- Import: `import { AppButton } from '@/ui/app-button';` and `import { Chip } from '@/ui/chip';`.
- Sign-in button (the "Iniciar sesión con Google" `Pressable`) → `<AppButton label="Iniciar sesión con Google" onPress={onSignIn} variant="primary" />`.
- Header row buttons: `Métricas/Editar` toggle → `<AppButton label={view === 'content' ? 'Métricas' : 'Editar'} onPress={() => setView(view === 'content' ? 'metrics' : 'content')} variant="pill" size="sm" />`; `Publicar` → `<AppButton label={publishing ? 'Publicando…' : 'Publicar'} onPress={onPublish} variant="pillPrimary" size="sm" />`; `Cerrar sesión` → `<AppButton label="Cerrar sesión" onPress={signOutAdmin} variant="pill" size="sm" />`.
- Locale toggle (`['es','en']` map) → each becomes `<Chip key={l} label={l.toUpperCase()} active={l === locale} onPress={() => setLocale(l)} />`.
- Section selector (`SECTIONS.map`) → each becomes `<Chip key={s.key} label={s.label} active={s.key === section} onPress={() => setSection(s.key)} mono={false} />`.
- Guardar button → `<AppButton label="Guardar" onPress={onSave} variant="primary" />` (keep `alignSelf: 'flex-start'` by wrapping in a `<View style={{ alignSelf: 'flex-start' }}>` if needed).
- The "Ver progreso en GitHub Actions" `Text onPress` → replace with `<HoverLink label="Ver progreso en GitHub Actions" onPress={() => Linking.openURL(publishUrl)} color={colors.accent} hoverColor={colors.text} />` (add `import { HoverLink } from '@/ui/hover-link';`).

Do not change the loading/auth gating, effects, or the `SectionForm` switch.

- [ ] **Step 3: Verify + commit**

```bash
npx tsc --noEmit
rm -rf dist && npx expo export -p web
for c in $(grep -oE '_expo/static/js/web/[a-zA-Z0-9._-]+\.js' dist/index.html); do grep -q "firebaseapp.com\|initializeApp" "dist/$c" && echo "LEAK $c"; done; echo "home checked"
```
Expected: tsc PASS; build succeeds; no `LEAK`.
```bash
git add src/admin
git commit -m "feat(admin): interactive buttons/chips with hover/press feedback"
```

---

### Task 4: Verification + deploy

**Files:** none

- [ ] **Step 1: Type check** — Run: `npx tsc --noEmit` — Expected: PASS.

- [ ] **Step 2: Browser check (local)**

`npm run web`, open the site:
- Buttons show a pointer cursor and change appearance on hover; they depress (scale/opacity) on click.
- Clicking a nav link (Servicios/Experiencia/Proyectos) smooth-scrolls to that section; hero "Hablemos de tu proyecto" → Contacto; "Ver proyectos" → Proyectos; "Trabajemos" → Contacto; "Descargar CV" opens the PDF.
- Service/Project cards lift slightly on hover.
- `/admin`: buttons/chips show hover/press feedback.

- [ ] **Step 3: Deploy**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npm run content:pull && npx expo export -p web
test -f dist/cv.pdf || cp public/cv.pdf dist/cv.pdf
firebase deploy --only hosting --project luisdelatorre-portfolio --non-interactive
```
Expected: deploy completes; the live site has the new interaction behavior.

- [ ] **Step 4: Commit (only if fixes were needed)**

```bash
git add -A
git commit -m "fix(ui): interaction polish verification adjustments"
```

---

## Self-Review

- **Spec coverage:** primitives AppButton/HoverLink/HoverCard/Chip/scrollToAnchor (T1); section nativeIDs + header/hero/contact/cards wired with feedback + working scroll (T2); admin buttons/chips/list-editor feedback (T3); verify + deploy (T4). ✓
- **Placeholder scan:** none — full code for primitives; precise read-and-replace mappings with exact JSX for the stateful files (no vague "update the buttons").
- **Type consistency:** `AppButton({label,onPress,variant,size})`, `HoverLink({label,onPress,color,hoverColor,size,mono})`, `HoverCard({children,style})`, `Chip({label,active,onPress,mono})`, `scrollToAnchor(anchor)` — signatures defined in T1 and used exactly in T2/T3; the web-only style props are cast to `object` uniformly; `Container` gains `nativeID?: string` (T2) matching the anchors used by `scrollToAnchor`. ✓
