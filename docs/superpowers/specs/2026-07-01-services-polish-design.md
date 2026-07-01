# Services Section UI/UX Polish + Animations — Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Elevate the "Servicios / Cómo puedo ayudarte" section without changing its layout
(a wrapping grid of 7 cards): refine card typography/hierarchy, add a richer
accent-glow hover, and stagger the cards in on entrance. Public site only.

## Context

- `services-section.tsx` renders `SectionHeading` + a `flexWrap` row of
  `ServiceCard`.
- `ServiceCard` currently wraps its body in `HoverCard` (shared with Projects),
  which lifts on hover but does NOT expose `hovered` to its children — so the card
  cannot brighten its own tag/number on hover today.
- The global typography fix (SpaceGrotesk with sans fallback) already landed, so
  card titles already render in SpaceGrotesk. This work only *refines* hierarchy.
- `Reveal` (`src/ui/reveal.tsx`) already exists (fade + slide-up, reduced-motion
  aware) and is reused here.

## Decisions (agreed with user)

- **Scope:** keep the 7-card grid; elevate styles + refine card typography + add
  staggered entrance + richer hover. No icons, no card recomposition.
- **Hover:** accent-glow + lift; tag chip and index number brighten on hover.

## Non-goals

- No layout/grid changes; no per-service icons; no card recomposition.
- No content changes. No change to `HoverCard` or to the Projects section.
- `SectionHeading` component is NOT modified (shared across sections); the entrance
  animation is applied by wrapping it in `Reveal` at the services-section level.

## Architecture

Two concerns:

1. **A reusable `GlowCard` primitive** (`src/ui/glow-card.tsx`) — a `Pressable`
   card that lifts + shows an accent border/glow on hover and **passes `hovered`
   to its children via a render prop**, so the card can drive internal element
   colors. Replaces `HoverCard` usage in `ServiceCard` only.
2. **Services wiring** — `ServiceCard` uses `GlowCard`, refines typography and adds
   hover states for the tag/number; `services-section.tsx` wraps the heading and
   each card in `Reveal` with a staggered delay.

### `src/ui/glow-card.tsx` — `GlowCard`

```tsx
import type { ReactNode } from 'react';
import { Platform, Pressable, type PressableStateCallbackType, type ViewStyle } from 'react-native';
import { colors } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

const webTransition = Platform.OS === 'web'
  ? ({ transitionProperty: 'transform, border-color, background-color, box-shadow', transitionDuration: '180ms' } as object)
  : null;
const glowWeb = Platform.OS === 'web' ? ({ boxShadow: '0 10px 34px rgba(228,227,87,0.14)' } as object) : null;

/**
 * Card container that lifts + shows a soft accent glow/border on hover, and
 * passes `hovered` to children so they can react. Not a link (default cursor).
 */
export function GlowCard({ style, children }: { style?: ViewStyle; children: (hovered: boolean) => ReactNode }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        style,
        hovered
          ? { transform: [{ translateY: -3 }], borderColor: 'rgba(228,227,87,0.45)', backgroundColor: colors.surfaceStrong }
          : null,
        hovered ? (glowWeb as object) : null,
        webTransition as object,
      ]}
    >
      {({ hovered }: HoverState) => children(!!hovered)}
    </Pressable>
  );
}
```

Notes:
- `children` is a render prop `(hovered) => ReactNode` — the caller reads `hovered`.
- Web-only style props (`boxShadow`, `transitionProperty`) cast at the boundary,
  consistent with existing `src/ui` primitives. Native: lift + border/bg only.
- No `onPress` (card is not a link); default cursor.

### `ServiceCard` refinements (`src/features/portfolio/sections/services/service-card.tsx`)

- Replace `HoverCard` with `GlowCard`, consuming `hovered`.
- **Index number:** color `colors.textFaint` → `colors.accent` when hovered.
- **Tag chip:** background `rgba(228,227,87,0.12)` → `rgba(228,227,87,0.2)` when
  hovered; tag text stays `colors.accent`.
- **Title typography:** `fontSize 19 → 20`, `letterSpacing -0.19 → -0.2`, keep
  `fonts.display` and existing color/margins.
- Description unchanged. Card padding/border/radius unchanged.
- Add a web transition to the tag chip bg + number color so they ease (reuse a
  small web-cast `transitionProperty`/`transitionDuration` object, or rely on the
  card's transition — implement an explicit one on the animated children to be
  safe).

### Services entrance (`services-section.tsx`)

- Wrap `SectionHeading` in `Reveal` (`delay={0}`).
- Wrap each `ServiceCard` in `Reveal` with `delay={index * 70}` where `index` is
  the array position from `.map((item, i) => …)`. The `Reveal` wrapper must carry
  the card's flex sizing so the grid layout is preserved — apply
  `style={{ flexGrow: 1, flexBasis: 320, maxWidth: 560 }}` on the `Reveal` and set
  the card to fill it (`ServiceCard`/`GlowCard` uses `flexGrow: 1`,
  `flexBasis: 'auto'`, width `100%` inside the wrapper). Keep the row `gap: 16` and
  `flexWrap` as-is.

## Data flow

- No new data. `Reveal` is presentational; `GlowCard` derives everything from
  hover state. i18n unaffected (locale switch re-mounts and re-reveals — a subtle
  re-animate, acceptable and consistent with the hero).

## Files

- **Create:** `src/ui/glow-card.tsx` — `GlowCard`.
- **Modify:** `src/features/portfolio/sections/services/service-card.tsx` — use
  `GlowCard`, refine typography + hover states.
- **Modify:** `src/features/portfolio/sections/services/services-section.tsx` —
  `Reveal` stagger for heading + cards, preserving grid sizing.

## Error handling

- `GlowCard`/`Reveal` never throw; web-only props are guarded by
  `Platform.OS === 'web'`.
- Grid must not regress: the `Reveal` wrapper carries flex sizing so wrapping and
  card widths stay identical to today.

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds.
- Bundle hygiene unchanged (no Firebase in `src/ui` or services).
- Browser (preview): cards render identically at rest; on hover a card lifts, its
  border turns accent with a soft glow, and its tag chip + number brighten; on
  load the heading and cards fade/slide in staggered. Grid wrapping unchanged at
  desktop and mobile widths.
- Reduced motion: with `prefers-reduced-motion: reduce`, cards appear at final
  state (no entrance animation); hover still works.
- No regression to Projects (still uses `HoverCard`).

## Implementation order

1. `GlowCard` primitive.
2. `ServiceCard` — use `GlowCard`, refine typography + hover states.
3. `services-section.tsx` — `Reveal` stagger preserving grid sizing.
4. Verify (tsc, export, bundle hygiene) + browser check + deploy.
