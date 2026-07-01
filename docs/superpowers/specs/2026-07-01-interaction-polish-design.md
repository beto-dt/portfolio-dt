# Interaction Polish (clickable affordances + working nav) Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Make every interactive element on the site feel clickable (cursor, hover, press
feedback) and actually work: the currently-dead nav links and CTAs should smooth-
scroll to their sections. Apply consistently on the public site and `/admin`.

## Problem

Most "buttons" are plain `View`/`Text` with no web affordances: no `cursor:
pointer`, no hover, no press feedback. Several are also non-functional — the
header "Trabajemos" CTA and the hero CTAs are `View`s without `onPress`, and the
nav links (`Text`) don't navigate. Reported as "no se percibe que se pulsa".

## Decisions (agreed with user)

- Add feedback **and** wire real behavior (nav/CTAs scroll to their section).
- Apply to the **public site and `/admin`**.

## Non-goals

- No visual redesign of sections; only interaction states + scroll wiring.
- No routing changes (single-page anchors only).

## Reusable primitives — `src/ui/`

- **`app-button.tsx`** — `AppButton`: a `Pressable` with variants
  `'primary' | 'outline' | 'pill' | 'pillPrimary'`, props
  `{ label: string; onPress: () => void; variant?; size? }`. Style is a function of
  Pressable's `{ hovered, pressed }`:
  - web `cursor: 'pointer'` and a short transition (react-native-web accepts
    `cursor`, `transitionProperty`, `transitionDuration` style props; applied via a
    `Platform.OS === 'web'` object cast to the style type at the boundary);
  - `primary`/`pillPrimary` (accent bg): hover → slightly lighter/raised; pressed →
    opacity ~0.85 + `scale(0.98)`;
  - `outline`/`pill`: hover → border brightens + faint bg fill; pressed → opacity +
    scale.
- **`hover-link.tsx`** — `HoverLink`: `{ label, onPress, color?, hoverColor? }`;
  a `Pressable`+`Text` that changes color on hover and shows a pointer cursor.
- **`hover-card.tsx`** — `HoverCard`: wraps non-clickable content (`children` +
  `style`), a `Pressable` with NO `onPress`; on hover raises `translateY(-2)`,
  brightens border, lightens bg; default cursor (not a link).
- **`scroll-to-anchor.ts`** — `scrollToAnchor(anchor: string)`: on web,
  `document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth', block: 'start' })`;
  no-op on native.

These live in `src/ui/` because both `features/portfolio` and `admin` use them.

## Public site changes (`src/features/portfolio/`)

- Give each scroll target a `nativeID` (renders as DOM `id` on web): `top` (hero),
  `services`, `experience`, `projects`, `contact`. Placed on the section's
  `Container` (or the `TrackedSection`/section wrapper).
- **`components/site-header.tsx`**: nav links → `HoverLink` calling
  `scrollToAnchor(link.anchor)`; language toggle → `AppButton pill` (keeps
  `toggleLocale`); "Trabajemos" CTA → `AppButton pillPrimary` calling
  `scrollToAnchor(nav.cta.anchor)`.
- **`sections/hero/hero-section.tsx`**: the three CTAs → `AppButton`
  (`primary`/`outline`/`outline`). primaryCta → `scrollToAnchor(primaryCta.anchor)`
  (`contact`); secondaryCta → `scrollToAnchor(secondaryCta.anchor)` (`projects`);
  CV → `Linking.openURL(hero.cvUrl)`.
- **`sections/contact/contact-section.tsx`**: email/WhatsApp → `AppButton`;
  the detail values (email/phone/linkedin) → `HoverLink`.
- **`sections/services/service-card.tsx`** and
  **`sections/projects/project-card.tsx`**: wrap the card body in `HoverCard`.

## Admin changes (`src/admin/`)

- `screens/admin-screen.tsx`: sign-in, Publicar, Métricas/Editar toggle, Cerrar
  sesión, locale toggle, section selector chips, Guardar → `AppButton`/hover
  styling with cursor + press feedback.
- `components/list-editor.tsx`: the ↑ / ↓ / ✕ controls and the "Add" button get
  hover + cursor + press feedback (reuse `AppButton` or add the states inline).

## Implementation notes

- The header sits above the `ScrollView` (not overlapping), so
  `scrollIntoView` lands sections correctly without a header offset.
- Firebase bundle hygiene is unaffected — `src/ui/*` imports no Firebase.
- Keep changes to interaction only; do not alter section layout/spacing.

## Error handling

- `scrollToAnchor` guards for `window`/`document`; missing id → no-op (no throw).
- `AppButton`/`HoverLink` never throw; press/hover are visual only.

## Verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds; public home still
  excludes Firebase.
- Visual (browser): buttons show a pointer cursor, change on hover, and depress on
  click; nav links + hero/header CTAs smooth-scroll to their sections; CV opens.
- `/admin`: buttons show hover/press feedback.

## Implementation order

1. `src/ui/` primitives (`AppButton`, `HoverLink`, `HoverCard`, `scrollToAnchor`).
2. Public: section `nativeID`s + header + hero + contact + cards wired to the
   primitives and scroll.
3. Admin: apply primitives to the admin buttons + list-editor controls.
4. Verify (tsc, export, bundle hygiene) + browser check + deploy.
