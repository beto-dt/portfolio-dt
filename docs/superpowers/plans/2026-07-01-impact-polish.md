# Impact Section Polish + Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Animate the Impacto numbers counting up, stagger the cells in (fade only), and add a subtle per-cell hover — all while preserving the seamless hairline grid.

**Architecture:** Add an optional `slide` prop to the existing `Reveal` primitive (default `true`) so it can fade without translating (needed for the seamless grid). In `impact-section.tsx`, run one `useCountUp` per cell via an `ImpactValue` sub-component, make each cell a `Pressable` that lightens on hover, and wrap the heading + cells in `Reveal` (cells `slide={false}`, staggered).

**Tech Stack:** Expo Router + react-native-web, existing `Reveal` + `useCountUp`, Pressable hover state. No test runner in this repo.

**Verification note:** This project has **no jest/unit-test setup**. Do NOT add one. Verify with `npx tsc --noEmit` + `npx expo export -p web` + the browser. Do NOT run `npx expo lint` (it auto-scaffolds `eslint.config.js` + deps on first run; discard those if produced).

---

### Task 1: `Reveal` — add optional `slide` prop (default true)

**Files:**
- Modify: `src/ui/reveal.tsx`

The current `Reveal` always animates opacity 0→1 AND translateY 8→0. Add a `slide?: boolean` prop (default `true`); when `false`, animate opacity only (no transform). Backward compatible — existing callers (hero, services) omit the prop.

- [ ] **Step 1: Replace the entire contents of `src/ui/reveal.tsx`**

```tsx
import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, Platform, type ViewStyle } from 'react-native';

/** True when the user asked for reduced motion (web); false on native/SSR. */
function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Fades children in on mount (opacity 0->1) after `delay` ms, and — unless
 * `slide` is false — also slides them up (translateY 8->0). `slide={false}` is
 * used where a transform would break a seamless layout (e.g. a hairline grid).
 * Under prefers-reduced-motion it renders at the final state.
 */
export function Reveal({
  children,
  delay = 0,
  slide = true,
  style,
}: {
  children: ReactNode;
  delay?: number;
  slide?: boolean;
  style?: ViewStyle;
}) {
  const reduce = prefersReducedMotion();
  const progress = useRef(new Animated.Value(reduce ? 1 : 0)).current;

  useEffect(() => {
    if (reduce) return;
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration: 500,
      delay,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay, reduce]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: slide
            ? [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }]
            : undefined,
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ui/reveal.tsx
git commit -m "feat(ui): Reveal gains optional slide prop (opacity-only mode)"
```

---

### Task 2: Impact section — count-up, per-cell hover, staggered fade entrance

**Files:**
- Modify: `src/features/portfolio/sections/impact/impact-section.tsx` (full rewrite)

Extract `ImpactValue` (one `useCountUp` per cell) and `ImpactCell` (a `Pressable` that lightens on hover). Wrap the heading in a normal `Reveal` and each cell in `<Reveal slide={false} delay={i*70}>` carrying the grid flex sizing, so the hairline grid is preserved and cells fade (never slide).

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/impact/impact-section.tsx`**

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useCountUp } from '../../hooks/use-count-up';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import type { ImpactItem } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const cellTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color', transitionDuration: '180ms' } as object) : null;

/** One stat number; owns a useCountUp call (hooks need a component boundary). */
function ImpactValue({ value }: { value: string }) {
  const shown = useCountUp(value);
  return (
    <Text style={{ fontFamily: fonts.displayBold, fontSize: 38, letterSpacing: -0.8, lineHeight: 40, color: colors.accent }}>
      {shown}
    </Text>
  );
}

/** A grid cell; lightens its background on hover (no lift/shadow → keeps seams). */
function ImpactCell({ item }: { item: ImpactItem }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          width: '100%',
          flexGrow: 1,
          gap: 8,
          paddingVertical: 28,
          paddingHorizontal: 22,
          backgroundColor: hovered ? '#12151b' : colors.surfaceCell,
        },
        cellTransition as object,
      ]}
    >
      <ImpactValue value={item.value} />
      <Text style={{ fontSize: 12.5, lineHeight: 19, color: colors.textDim }}>{item.label}</Text>
    </Pressable>
  );
}

export function ImpactSection() {
  const { content } = useI18n();
  const { impact } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={impact.kicker} heading={impact.heading} />
      </Reveal>
      {/* The container background shows through the 1px gap, drawing hairline
          dividers between cells (matches the mock's grid look). */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 1,
          backgroundColor: colors.border,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        {impact.items.map((item, i) => (
          <Reveal key={item.label} slide={false} delay={i * 70} style={{ flexGrow: 1, flexBasis: 180, minWidth: 160 }}>
            <ImpactCell item={item} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful `dist` export.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/sections/impact/impact-section.tsx
git commit -m "feat(portfolio): impact count-up numbers, cell hover, staggered fade entrance"
```

---

### Task 3: Verify (build + bundle hygiene + browser) and deploy

**Files:** none (verification + deploy).

- [ ] **Step 1: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful export.

- [ ] **Step 2: Bundle hygiene**

Run: `grep -rl "initializeApp\|firebase/auth" dist/_expo/static/js/web | grep -v firebase-client || echo "clean"`
Expected: `clean`.

- [ ] **Step 3: Browser verification (preview tools)**

Start/reuse the `web` preview, scroll to the Impact section, and confirm:
- **At rest:** the hairline grid looks identical (1px dividers intact, no seams
  broken). `preview_screenshot`.
- **Count-up:** each number ends at its exact final string — `3×`, `85%`, `40%`,
  `99.9%`, `6h→15m`, `1000+`, `+20%`, `−45%` (`preview_snapshot`/`preview_eval`
  reading the cells' text). `6h→15m` shows the leading number animating with
  `h→15m` static.
- **Entrance:** cells fade in staggered on reload (headless may throttle
  `Animated`/rAF — confirm final state; motion verified live).
- **Hover:** hovering a cell lightens its background only (no lift/shadow, seams
  unchanged). Headless RNW hover may not trigger via synthetic events — if so,
  confirm the mechanism by code (identical Pressable-hover pattern used elsewhere)
  and verify live.
- **Grid unchanged:** compare wrapping at mobile (375) + desktop.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 4: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live.

---

## Self-Review

**1. Spec coverage:**
- `Reveal` `slide` prop (default true, opacity-only when false) → Task 1 ✓
- Count-up all numbers via `ImpactValue`/`useCountUp` → Task 2 ✓
- Per-cell hover background lighten (no lift/shadow) → Task 2 (`ImpactCell`) ✓
- Staggered fade entrance preserving grid (flex sizing on wrapper, `slide={false}`)
  → Task 2 ✓
- Heading wrapped in normal `Reveal` → Task 2 ✓
- Verify + deploy → Task 3 ✓
- Non-goals honored: no grid/content/type-size changes; no box-shadow; hero/services
  unaffected (default slide) ✓
No gaps.

**2. Placeholder scan:** No TBD/TODO; complete code in every code step. ✓

**3. Type consistency:**
- `Reveal({ children, delay?, slide?, style? })` — `slide` added Task 1, used
  `slide={false}` in Task 2 ✓; existing hero/services callers omit it (default
  true) ✓.
- `useCountUp(value: string): string` — existing hook, called with one arg in
  `ImpactValue` ✓.
- `ImpactItem` = `{ value: string; label: string }` (from `@/content/types`) —
  fields `value`/`label` used ✓.
- Grid sizing: old cell had `flexGrow:1, flexBasis:180, minWidth:160`; Task 2 moves
  `flexBasis:180, minWidth:160` to the `Reveal` wrapper and keeps `flexGrow:1,
  width:'100%'` on the cell → equivalent hairline layout ✓.
- `key` changed from `item.label` (unchanged — labels are unique) ✓.
