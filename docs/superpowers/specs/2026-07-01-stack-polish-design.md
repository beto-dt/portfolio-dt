# Stack Section UI/UX Polish + Animations — Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Elevate the "Stack / Tecnologías que domino" section without changing its grid
layout: category cards get the accent-glow hover-lift (reusing `GlowCard`), tech
pills gain a subtle per-pill hover, and the heading + cards stagger in on
entrance. Public site only.

## Context

- `stack-section.tsx` renders `SectionHeading` + a `flexWrap` row of category
  cards. Each card: a `View` (surface bg, border, `radii.lg - 2`, padding 20) with
  a mono-uppercase category label + a wrap of `Pill`s.
- `Pill` (`src/features/portfolio/components/pill.tsx`) is a static `View` (surface
  strong bg, faint border, body font). It is used **only** in `stack-section.tsx`
  (verified) — safe to enhance without affecting other sections.
- `GlowCard` (`src/ui/glow-card.tsx`) and `Reveal` (`src/ui/reveal.tsx`) already
  exist and are reused. The cards have real spacing (gap 14, no `overflow:hidden`
  seams), so `GlowCard` (which lifts + adds a box-shadow) and the default
  slide-in `Reveal` both fit here.

## Decisions (agreed with user)

- **Cards:** use `GlowCard` (lift + accent border/glow), consistent with Services.
- **Pills:** subtle per-pill hover — background + border brighten on hover; default
  cursor (pills are not links).
- **Entrance:** `Reveal` fade+slide (default), staggered per card.

## Non-goals

- No grid/layout changes; no content changes; no typography size changes.
- No `onPress` on pills (decorative hover only).
- `SectionHeading` unmodified (wrapped in `Reveal`). No changes to other sections.

## Architecture

Two concerns:

1. **`Pill` becomes hover-reactive** — a `Pressable` (no `onPress`) whose
   background + border brighten on hover, with a web transition. Default cursor.
2. **Stack wiring** — category cards use `GlowCard`; the heading and each card are
   wrapped in `Reveal` with a staggered delay; the card flex sizing moves to the
   `Reveal` wrapper so the grid is preserved.

### `Pill` change (`src/features/portfolio/components/pill.tsx`)

```tsx
import { Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '150ms' } as object) : null;

/** Decorative tech pill; brightens on hover (not a link — default cursor). */
export function Pill({ label }: { label: string }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          backgroundColor: hovered ? colors.borderStrong : colors.surfaceStrong,
          borderWidth: 1,
          borderColor: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
          borderRadius: radii.sm + 1,
          paddingHorizontal: 11,
          paddingVertical: 5,
        },
        webTransition as object,
      ]}
    >
      <Text style={{ fontSize: 12.5, color: 'rgb(223,226,230)', fontFamily: fonts.body }}>{label}</Text>
    </Pressable>
  );
}
```

Notes:
- Same visual at rest as today (surface-strong bg, faint border, body text).
- No `cursor: 'pointer'` (not a link); web transition only.
- Public API unchanged (`{ label }`), so `stack-section.tsx` call sites are
  untouched.

### Stack wiring (`stack-section.tsx`)

- Each category card: `GlowCard` with the card style (surface bg, border,
  `radii.lg - 2`, padding 20, `width: '100%'`, `flexGrow: 1`). `GlowCard`'s
  children is a render prop; the card content ignores `hovered` (pills have their
  own hover): `{() => ( <>…</> )}`.
- The card flex sizing (`flexGrow: 1`, `flexBasis: 240`, `minWidth: 220`) moves to
  the `Reveal` wrapper; the `GlowCard` fills it (`width: '100%'`, `flexGrow: 1`).
- Wrap the heading in `<Reveal delay={0}>` and each card in
  `<Reveal delay={i * 70} style={{ flexGrow: 1, flexBasis: 240, minWidth: 220 }}>`
  (default slide). Keep the row `gap: 14` and `flexWrap`.

## Data flow

No new data. `Pill`/`GlowCard`/`Reveal` are presentational. i18n unaffected
(locale switch re-mounts → re-reveal, consistent with prior sections).

## Files

- **Modify:** `src/features/portfolio/components/pill.tsx` — hover-reactive Pill.
- **Modify:** `src/features/portfolio/sections/stack/stack-section.tsx` — `GlowCard`
  cards + `Reveal` stagger (grid preserved).

## Error handling

- `Pill`/`GlowCard`/`Reveal` never throw; web-only props guarded by
  `Platform.OS === 'web'` and cast at the boundary.
- Grid must not regress: flex sizing on the `Reveal` wrapper + `width: '100%'`
  card reproduce today's layout.

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds.
- Bundle hygiene unchanged (no Firebase in `src/ui`, pill, or stack).
- Browser (preview): at rest the grid looks identical (same cards, same pills, same
  wrapping); hovering a card lifts it with an accent border/glow; hovering a pill
  brightens its bg/border; on load the heading + cards fade/slide in staggered.
  Verify wrapping at mobile (375) + desktop.
- Reduced motion: with `prefers-reduced-motion: reduce`, heading + cards appear at
  final state; hovers still work.
- No regression to other sections (Pill is used only here; `GlowCard`/`Reveal`
  APIs unchanged).

## Implementation order

1. `Pill` — hover-reactive Pressable (API unchanged).
2. Stack wiring — `GlowCard` cards + `Reveal` stagger (grid preserved).
3. Verify (tsc, export, bundle hygiene) + browser check + deploy.
