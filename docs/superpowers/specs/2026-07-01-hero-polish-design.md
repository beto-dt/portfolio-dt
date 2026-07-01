# Hero UI/UX Polish + Animations + Typography Fix — Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Elevate the hero section's UI/UX without changing its layout: fix the display
typeface (it currently falls back to a serif), add depth and refined styles, and
introduce tasteful entrance + micro-interaction animations. Public site only.

## Problem

- **Typography:** headings render in a browser-default **serif** (Times-like)
  instead of `SpaceGrotesk`. Fonts are loaded via `useFonts` in
  `src/app/_layout.tsx` without blocking render (intentional FOUT), and the
  `fontFamily: 'SpaceGrotesk_600SemiBold'` name falls back to the browser default
  (serif) when the web font is not yet applied on the static export.
- **Visual flatness:** the hero is text on a flat black background — no depth, no
  motion, minimal hierarchy cues.
- **No motion:** nothing animates in; the section appears all at once.

## Decisions (agreed with user)

- **Scope:** keep the current layout (left-aligned text). Elevate styles + add
  animations. No new graphic/portrait element, no full recomposition.
- **Typography:** fix `SpaceGrotesk` so titles render as designed (not the serif
  fallback).

## Non-goals

- No layout recomposition (no centering, no right-column graphic/portrait).
- No content changes (copy, stats values, CTA targets stay as-is).
- No changes to other sections. New reusable primitives are introduced but only
  wired into the hero in this work.

## Architecture

Three concerns, each isolated:

1. **Typeface fix** — token-level, applies app-wide.
2. **Style/depth** — local to the hero (a backdrop glow layer + refined styles).
3. **Animation** — two reusable primitives (`Reveal`, `useCountUp`) wired into the
   hero, both honoring `prefers-reduced-motion`.

### 1. Typeface fix (`src/theme/tokens.ts`)

Give the display families a **web font stack with a sans-serif fallback** so the
browser never falls back to serif:

```ts
// On web, react-native-web passes fontFamily straight to CSS font-family, so a
// comma-separated stack works and guarantees a sans fallback (never serif).
const sansFallback = ", system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
export const fonts = {
  display: 'SpaceGrotesk_600SemiBold' + (Platform.OS === 'web' ? sansFallback : ''),
  displayBold: 'SpaceGrotesk_700Bold' + (Platform.OS === 'web' ? sansFallback : ''),
  body: 'IBMPlexSans_400Regular' + (Platform.OS === 'web' ? sansFallback : ''),
  bodyMedium: 'IBMPlexSans_500Medium' + (Platform.OS === 'web' ? sansFallback : ''),
  mono: 'JetBrainsMono_400Regular' + (Platform.OS === 'web' ? ", 'SFMono-Regular', Menlo, monospace" : ''),
} as const;
```

- Native (`Platform.OS !== 'web'`) keeps the bare family name (RN native requires
  an exact font name, not a CSS stack).
- During implementation, **verify in the built site** that `SpaceGrotesk` actually
  applies (computed `font-family` on a heading resolves to SpaceGrotesk, not the
  fallback). If it never loads on the static export, force-register the
  `@font-face` (e.g. ensure the export includes the font and the family name
  matches). The fallback stack is the safety net regardless.

### 2. Style / depth (hero-local)

- **Backdrop glow:** a subtle accent-tinted radial glow behind the hero content,
  anchored top-left, very low opacity. On web use a `radialGradient`-style layer
  (an absolutely-positioned `View` with a web `backgroundImage: radial-gradient(...)`
  cast at the web boundary); no-op/omit on native. Purely decorative,
  `pointerEvents: 'none'`, behind content.
- **Accent word glow:** the accent span (`hero.titleAccent`) gets a soft text glow
  on web (`textShadow` cast at the web boundary) so "impacto real" pops.
- **Availability dot pulse:** the 7×7 accent dot gains a gentle looping pulse
  (opacity/scale) — see animation section.
- **Stats refinement:** number in `fonts.displayBold`, keep 30px; label tightened
  (existing `textFainter`, maxWidth 160). Keep the top border separator.
- **Primary CTA glow on hover:** handled inside `AppButton` `primary`/`pillPrimary`
  variants — add a subtle accent box-shadow on hover (web only). Must not regress
  existing hover/press behavior.

### 3. Animations

**`src/ui/reveal.tsx` — `Reveal`**

Wraps children and animates them in on mount: opacity 0→1 and translateY 8→0.

- Props: `{ children: React.ReactNode; delay?: number; style?: ViewStyle }`.
- Uses `Animated.Value` + `Animated.timing` (duration ~500ms, `useNativeDriver:
  true`), started in a `useEffect` after `delay` ms.
- **Reduced motion:** if `prefers-reduced-motion: reduce` is set (web), skip the
  animation and render at final state (opacity 1, translateY 0). Detect via
  `window.matchMedia`; on native or when unavailable, animate normally.
- Never throws; on SSR/no-window it renders children at final state.

Wire the hero's five blocks each in a `Reveal` with staggered delays:
pill `0ms` → title `80ms` → subtitle `160ms` → CTAs `240ms` → stats `320ms`.

**`src/features/portfolio/hooks/use-count-up.ts` — `useCountUp`**

Animates a numeric display from 0 to a target parsed out of the stat string,
preserving any prefix/suffix (`+`, `%`, decimals).

- Signature: `useCountUp(value: string, opts?: { durationMs?: number }): string`.
- Parse `value` into `{ prefix, number, decimals, suffix }` via regex
  (e.g. `"99.9%"` → number 99.9, decimals 1, suffix `"%"`; `"7+"` → 7, suffix
  `"+"`; `"15+"` → 15, suffix `"+"`). Non-numeric values return `value` unchanged.
- Drive with `requestAnimationFrame` (or an `Animated.Value` + listener),
  easing out, over `durationMs` (default ~1000ms), formatting to the detected
  decimal count each frame; end exactly on the target string.
- **Reduced motion:** return the final formatted string immediately (no rAF loop).
- Cleanup: cancel rAF / remove listener on unmount. SSR-safe (returns final value
  when no `window`).

**Availability dot pulse**

A looping `Animated.loop(Animated.sequence([...]))` on opacity (e.g. 1 → 0.4 → 1)
and/or scale, `useNativeDriver: true`, on the accent dot. Skipped under reduced
motion (renders static). Implemented inline in the hero (small, hero-specific).

## Data flow

- No new data. `useCountUp` derives its output purely from the existing
  `hero.stats[].value` strings. `Reveal` is presentational.
- i18n unaffected: switching locale re-renders; `Reveal`/count-up re-run on mount
  of the new tree (acceptable — a subtle re-reveal on language switch).

## Files

- **Modify:** `src/theme/tokens.ts` — font stacks with sans fallback (web).
- **Modify:** `src/theme/tokens.ts` import of `Platform` from `react-native`.
- **Create:** `src/ui/reveal.tsx` — `Reveal`.
- **Create:** `src/features/portfolio/hooks/use-count-up.ts` — `useCountUp`.
- **Create (or inline):** hero backdrop glow — a small `HeroBackdrop` layer inside
  `src/features/portfolio/sections/hero/hero-section.tsx`.
- **Modify:** `src/features/portfolio/sections/hero/hero-section.tsx` — backdrop,
  accent glow, `Reveal` wrappers, `useCountUp` in stats, pulsing dot.
- **Modify:** `src/ui/app-button.tsx` — primary/pillPrimary hover glow (web).

## Error handling

- `Reveal` / `useCountUp` never throw; guard `window`/`matchMedia`/`requestAnimationFrame`.
- Web-only style props (`backgroundImage`, `textShadow`, `boxShadow`,
  `transitionProperty`) are applied via a `Platform.OS === 'web'` object cast at
  the style boundary, consistent with existing `src/ui` primitives.
- Font fallback stack guarantees a readable sans face even if SpaceGrotesk never
  loads.

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds.
- Bundle hygiene unchanged (no Firebase imports added to `src/ui` or hero).
- Browser (preview + built site): headings render in SpaceGrotesk (computed
  `font-family` resolves to SpaceGrotesk, not serif); backdrop glow visible but
  subtle; entrance stagger plays; stats count up; availability dot pulses.
- Reduced-motion: with `prefers-reduced-motion: reduce`, content appears at final
  state with no motion and stats show final values.
- No regression to existing CTA hover/press or the header/logo work.

## Implementation order

1. Typeface fix in tokens (+ verify SpaceGrotesk applies in build).
2. `Reveal` primitive (+ reduced-motion).
3. `useCountUp` hook (+ reduced-motion, suffix parsing).
4. Hero wiring: backdrop glow, accent glow, `Reveal` stagger, count-up stats,
   pulsing dot.
5. `AppButton` primary hover glow.
6. Verify (tsc, export, bundle hygiene) + browser check + deploy.
