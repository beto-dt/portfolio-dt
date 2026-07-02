# Impact Section UI/UX Polish + Animations — Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Elevate the "Impacto / Resultados medibles" section without changing its hairline
grid layout: animate the numbers counting up, stagger the cells in on entrance,
and add a subtle per-cell hover — all while preserving the seamless grid. Public
site only.

## Context

- `impact-section.tsx` renders `SectionHeading` + a `flexWrap` row that fakes
  hairline dividers: the row has `backgroundColor: colors.border`, `gap: 1`,
  `overflow: 'hidden'`, `borderRadius: 18`; each cell has
  `backgroundColor: colors.surfaceCell` so the 1px gap shows the border color
  through as a hairline.
- Each cell: a big accent number (`fonts.displayBold`, 38) + a dim label.
- Values are varied: `3×`, `85%`, `40%`, `99.9%`, `6h→15m`, `1000+`, `+20%`,
  `−45%`.
- `useCountUp` (`src/features/portfolio/hooks/use-count-up.ts`) and `Reveal`
  (`src/ui/reveal.tsx`) already exist and are reused.

## Decisions (agreed with user)

- **Count-up:** animate ALL numbers, including `6h→15m` (its leading `6` counts up
  while `h→15m` stays as the parsed suffix — accepted).
- **Hover:** subtle per-cell background lightening (no lift, no box-shadow) so the
  seamless hairline grid is preserved.
- **Entrance:** staggered per-cell **fade only** (no translateY) to avoid revealing
  the grid seams mid-animation; heading uses the normal fade+slide `Reveal`.

## Non-goals

- No grid/layout changes; no content changes; no typography size changes (numbers
  already render in SpaceGrotesk after the global font fix).
- No box-shadow glow here (would be clipped by the grid's `overflow: hidden`).
- `SectionHeading` is not modified (wrapped in `Reveal`, not edited).

## Architecture

Two concerns:

1. **`Reveal` gains an optional `slide` prop** (default `true`). When `slide` is
   `false`, it animates opacity only (no translateY) — needed for the seamless
   grid. Backward compatible: hero and services keep the default slide behavior.
2. **Impact wiring** — an `ImpactValue` sub-component runs one `useCountUp` per
   cell (hooks need a component boundary inside `.map`); each cell becomes a
   `Pressable` that lightens its background on hover; the heading and each cell are
   wrapped in `Reveal` (cells with `slide={false}`, staggered `delay`).

### `Reveal` change (`src/ui/reveal.tsx`)

Add `slide?: boolean` (default `true`) to the props. When `false`, the transform
interpolation is omitted (opacity-only). The reduced-motion path is unchanged
(renders at final state). Existing callers (hero, services) pass no `slide` prop
and keep fade+slide.

### Impact wiring (`impact-section.tsx`)

- **`ImpactValue({ value }: { value: string })`** — calls `useCountUp(value)` and
  renders the number `Text` (same style as today: `fonts.displayBold`, 38,
  `letterSpacing: -0.8`, `lineHeight: 40`, `color: colors.accent`).
- **`ImpactCell({ item })`** — a `Pressable` (no `onPress`; default cursor) that
  carries the cell styles (`gap: 8`, `paddingVertical: 28`, `paddingHorizontal:
  22`, `backgroundColor: colors.surfaceCell`, `width: '100%'`, `flexGrow: 1`). On
  hover the background lightens to `#12151b` (a step up from
  `colors.surfaceCell` = `#0d0f13`), with a web transition on `background-color`.
  Contains `ImpactValue` + the label `Text`.
- **Grid**: unchanged row (`backgroundColor: colors.border`, `gap: 1`,
  `overflow: 'hidden'`, `borderRadius: 18`, `borderWidth/Color`). Each child is
  `<Reveal slide={false} delay={i * 70} style={{ flexGrow: 1, flexBasis: 180,
  minWidth: 160 }}>` wrapping `<ImpactCell item={item} />`. The flex sizing moves
  from the cell to the `Reveal` wrapper (as done for services), and the cell fills
  it with `width: '100%'` + `flexGrow: 1`, so the hairline layout is identical.
- **Heading**: wrapped in `<Reveal delay={0}>` (normal fade+slide).

## Data flow

- No new data. `ImpactValue` derives from `item.value`; `Reveal` is
  presentational. i18n unaffected (locale switch re-mounts → re-reveal/re-count,
  consistent with hero/services).

## Files

- **Modify:** `src/ui/reveal.tsx` — add optional `slide` prop (default true).
- **Modify:** `src/features/portfolio/sections/impact/impact-section.tsx` —
  `ImpactValue`, `ImpactCell` (hover), `Reveal` wiring (fade-stagger, grid
  preserved).

## Error handling

- `Reveal`/`useCountUp`/`Pressable` never throw; web-only style props guarded by
  `Platform.OS === 'web'` and cast at the boundary.
- Grid must not regress: flex sizing on the `Reveal` wrapper + `width: '100%'`
  cell reproduce today's hairline layout; cells fade (not slide) so seams never
  show mid-animation.

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds.
- Bundle hygiene unchanged (no Firebase in `src/ui` or impact).
- Browser (preview): at rest the grid looks identical (hairline dividers intact);
  numbers count up from 0 to their exact final strings (`3×`, `85%`, `40%`,
  `99.9%`, `6h→15m`, `1000+`, `+20%`, `−45%`); cells fade in staggered; hovering a
  cell lightens its background with no lift/seam change. Verify at mobile (375) and
  desktop widths that wrapping matches today.
- Reduced motion: with `prefers-reduced-motion: reduce`, numbers show final values
  and cells appear at final state; hover still works.
- No regression to hero/services (they keep default `Reveal` slide behavior).

## Implementation order

1. `Reveal` — add `slide` prop (default true).
2. Impact wiring — `ImpactValue`, `ImpactCell` hover, `Reveal` fade-stagger.
3. Verify (tsc, export, bundle hygiene) + browser check + deploy.
