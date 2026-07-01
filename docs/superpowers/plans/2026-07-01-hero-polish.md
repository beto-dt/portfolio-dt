# Hero UI/UX Polish + Animations + Typography Fix — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the hero section (styles + depth + entrance/micro animations) and fix the display typeface so headings render in SpaceGrotesk instead of the browser serif fallback, without changing the hero's layout or content.

**Architecture:** Three isolated concerns — (1) a token-level font-stack fix with a sans fallback (app-wide), (2) two reusable animation primitives (`Reveal`, `useCountUp`) that both honor `prefers-reduced-motion`, and (3) hero-local style/motion wiring (backdrop glow, accent glow, staggered reveal, count-up stats, pulsing dot). A small `AppButton` hover-glow tweak completes the primary CTA.

**Tech Stack:** Expo Router + react-native-web, react-native `Animated`, `requestAnimationFrame`, `window.matchMedia`. No test runner in this repo — verification is `npx tsc --noEmit`, `npx expo export -p web`, `npx expo lint`, and browser checks via the preview tools.

**Verification note:** This project has **no jest/unit-test setup** (confirmed: no `test` script, no `jest`/`jest-expo` dep, no test files). Do **not** add a test runner. Verify each task with `npx tsc --noEmit` and the browser; the plan lists explicit assertions to check.

---

### Task 1: Typeface fix — font stacks with sans fallback

**Files:**
- Modify: `src/theme/tokens.ts:1-8`

Currently `src/theme/tokens.ts` starts directly with `export const fonts = {...}` using bare family names (`'SpaceGrotesk_600SemiBold'`, etc.). On the static web export, when the web font is not applied the browser falls back to its default **serif**. Adding a comma-separated CSS font stack (web only) guarantees a sans fallback (never serif). Native (`Platform.OS !== 'web'`) must keep the bare family name — RN native requires an exact font name, not a CSS stack.

- [ ] **Step 1: Replace the `fonts` block in `src/theme/tokens.ts`**

Replace lines 1–8 (the current `export const fonts = {...} as const;`) with:

```ts
import { Platform } from 'react-native';

// On web, react-native-web passes fontFamily straight to CSS `font-family`, so a
// comma-separated stack works and guarantees a sans fallback (never the browser
// serif). Native requires an exact font name, so it keeps the bare family.
const sans = Platform.OS === 'web' ? ", system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" : '';
const mono = Platform.OS === 'web' ? ", 'SFMono-Regular', Menlo, Consolas, monospace" : '';

export const fonts = {
  display: 'SpaceGrotesk_600SemiBold' + sans,
  displayBold: 'SpaceGrotesk_700Bold' + sans,
  body: 'IBMPlexSans_400Regular' + sans,
  bodyMedium: 'IBMPlexSans_500Medium' + sans,
  mono: 'JetBrainsMono_400Regular' + mono,
} as const;
```

Leave the rest of the file (`colors`, `spacing`, `radii`, `layout`, `theme`) unchanged.

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS (no errors).

- [ ] **Step 3: Build the web export**

Run: `npx expo export -p web`
Expected: `EXPORT OK` (no build errors).

- [ ] **Step 4: Commit**

```bash
git add src/theme/tokens.ts
git commit -m "fix(theme): font stacks with sans fallback (no serif fallback on web)"
```

**Browser verification (done in Task 6, note here):** on the built/preview site, the hero heading's computed `font-family` should resolve to SpaceGrotesk when loaded, and to a sans-serif (system-ui) — **never** a serif — during load.

---

### Task 2: `Reveal` primitive (entrance animation)

**Files:**
- Create: `src/ui/reveal.tsx`

A presentational wrapper that fades + slides its children in on mount, after an optional `delay`. Honors `prefers-reduced-motion` (web): when reduce is requested, it renders at the final state with no animation. SSR/no-window safe.

- [ ] **Step 1: Create `src/ui/reveal.tsx`**

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
 * Fades + slides children in on mount (opacity 0->1, translateY 8->0) after
 * `delay` ms. Under prefers-reduced-motion it renders at the final state.
 */
export function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: ViewStyle }) {
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
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
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
git commit -m "feat(ui): add Reveal entrance-animation primitive (reduced-motion aware)"
```

---

### Task 3: `useCountUp` hook (animated stat numbers)

**Files:**
- Create: `src/features/portfolio/hooks/use-count-up.ts`

Animates a numeric display from 0 to a target parsed out of a stat string, preserving prefix/suffix and decimal count. Non-numeric input is returned unchanged. Under reduced motion (or no `requestAnimationFrame`), returns the final formatted string immediately. Cleans up its rAF on unmount.

Parsing contract (must hold):
- `"7+"` → prefix `""`, number `7`, decimals `0`, suffix `"+"` → animates `0+ … 7+`
- `"15+"` → number `15`, decimals `0`, suffix `"+"`
- `"99.9%"` → number `99.9`, decimals `1`, suffix `"%"` → ends exactly `"99.9%"`
- `"abc"` (no digits) → returned unchanged, no animation

- [ ] **Step 1: Create `src/features/portfolio/hooks/use-count-up.ts`**

```ts
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

type Parsed = { prefix: string; target: number; decimals: number; suffix: string };

/** Split "99.9%" into { prefix:"", target:99.9, decimals:1, suffix:"%" }. Null if no number. */
function parse(value: string): Parsed | null {
  const m = /^(\D*)(\d+(?:\.\d+)?)(.*)$/.exec(value);
  if (!m) return null;
  const [, prefix, num, suffix] = m;
  const dot = num.indexOf('.');
  return { prefix, target: parseFloat(num), decimals: dot === -1 ? 0 : num.length - dot - 1, suffix };
}

function format(p: Parsed, n: number): string {
  return `${p.prefix}${n.toFixed(p.decimals)}${p.suffix}`;
}

/**
 * Returns `value` with its number animating 0 -> target on mount (~1s, ease-out).
 * Non-numeric values and reduced-motion return the final string immediately.
 */
export function useCountUp(value: string, opts?: { durationMs?: number }): string {
  const durationMs = opts?.durationMs ?? 1000;
  const parsed = parse(value);
  const [display, setDisplay] = useState<string>(() => (parsed ? format(parsed, 0) : value));

  useEffect(() => {
    if (!parsed) {
      setDisplay(value);
      return;
    }
    if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') {
      setDisplay(format(parsed, parsed.target));
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (ts: number) => {
      if (start === 0) start = ts;
      const t = Math.min(1, (ts - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(format(parsed, parsed.target * eased));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(format(parsed, parsed.target)); // land exactly on target
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // value drives re-parse; parsed is derived from value each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, durationMs]);

  return display;
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/hooks/use-count-up.ts
git commit -m "feat(portfolio): add useCountUp hook for animated stat numbers"
```

---

### Task 4: Hero wiring — backdrop glow, accent glow, Reveal stagger, count-up, pulsing dot

**Files:**
- Modify: `src/features/portfolio/sections/hero/hero-section.tsx` (full rewrite of the component body)

This wires the primitives into the hero and adds hero-local decoration. It introduces:
- a `StatValue` sub-component so `useCountUp` (a hook) is called per stat (hooks can't run in a `.map` callback of the parent without a component boundary);
- a `HeroBackdrop` layer (web-only radial glow, `pointerEvents="none"`, behind content);
- an accent-word web `textShadow` glow;
- a pulsing availability dot (looping `Animated`, reduced-motion aware);
- `Reveal` wrappers with staggered delays around the five blocks.

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/hero/hero-section.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { Animated, Linking, Platform, Text, View } from 'react-native';
import { Container } from '../../components/container';
import { useCountUp } from '../../hooks/use-count-up';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { useFluidType } from '@/theme/use-fluid-type';
import { AppButton } from '@/ui/app-button';
import { Reveal } from '@/ui/reveal';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';

function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Web-only radial glow behind the hero content. Decorative, non-interactive.
const backdropWeb =
  Platform.OS === 'web'
    ? ({
        backgroundImage:
          'radial-gradient(620px 380px at 12% 8%, rgba(228,227,87,0.10), rgba(228,227,87,0) 70%)',
      } as object)
    : null;

const accentGlowWeb = Platform.OS === 'web' ? ({ textShadow: '0 0 26px rgba(228,227,87,0.35)' } as object) : null;

function HeroBackdrop() {
  if (Platform.OS !== 'web') return null;
  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, backdropWeb as object]}
    />
  );
}

/** Pulsing availability dot (opacity loop); static under reduced motion. */
function AvailabilityDot() {
  const reduce = prefersReducedMotion();
  const pulse = useRef(new Animated.Value(reduce ? 1 : 0.35)).current;
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduce]);
  return <Animated.View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: colors.accent, opacity: pulse }} />;
}

/** One stat cell; owns a useCountUp call (hooks need a component boundary). */
function StatValue({ value }: { value: string }) {
  const shown = useCountUp(value);
  return <Text style={{ fontFamily: fonts.displayBold, fontSize: 30, color: '#ffffff' }}>{shown}</Text>;
}

export function HeroSection() {
  const { content } = useI18n();
  const { hero } = content;
  const fluid = useFluidType();

  return (
    <Container style={{ paddingVertical: 88 }} nativeID="top">
      <HeroBackdrop />
      <View style={{ gap: 34 }}>
        <Reveal delay={0} style={{ alignSelf: 'flex-start' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 9,
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: radii.pill,
              paddingHorizontal: 13,
              paddingVertical: 7,
            }}
          >
            <AvailabilityDot />
            <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, letterSpacing: 0.4, color: 'rgb(201,205,212)' }}>
              {hero.availability}
            </Text>
          </View>
        </Reveal>

        <Reveal delay={80}>
          <Text style={{ fontFamily: fonts.display, fontSize: fluid.heroTitle, lineHeight: fluid.heroTitleLineHeight, letterSpacing: fluid.heroTitleSpacing, color: colors.text }}>
            {hero.titleLead} <Text style={[{ color: colors.accent }, accentGlowWeb as object]}>{hero.titleAccent}</Text>
          </Text>
        </Reveal>

        <Reveal delay={160}>
          <Text style={{ fontSize: fluid.heroSubtitle, lineHeight: fluid.heroSubtitleLineHeight, color: colors.textMuted, maxWidth: 640, fontFamily: fonts.body }}>
            {hero.subtitle}
          </Text>
        </Reveal>

        <Reveal delay={240}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
            <AppButton label={hero.primaryCta.label} onPress={() => scrollToAnchor(hero.primaryCta.anchor)} variant="primary" />
            <AppButton label={hero.secondaryCta.label} onPress={() => scrollToAnchor(hero.secondaryCta.anchor)} variant="outline" />
            <AppButton label={`↓ ${hero.cvLabel}`} onPress={() => Linking.openURL(hero.cvUrl)} variant="outline" />
          </View>
        </Reveal>

        <Reveal delay={320}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 40,
              marginTop: 26,
              paddingTop: 30,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            {hero.stats.map((stat) => (
              <View key={stat.label} style={{ gap: 4 }}>
                <StatValue value={stat.value} />
                <Text style={{ fontSize: 12.5, color: colors.textFainter, maxWidth: 160 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Reveal>
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Lint**

Run: `npx expo lint`
Expected: no new errors in `hero-section.tsx` (warnings tolerated if pre-existing style).

- [ ] **Step 4: Commit**

```bash
git add src/features/portfolio/sections/hero/hero-section.tsx
git commit -m "feat(portfolio): hero backdrop glow, accent glow, staggered reveal, count-up stats, pulsing dot"
```

---

### Task 5: `AppButton` primary hover glow

**Files:**
- Modify: `src/ui/app-button.tsx:8-10,30-41`

Add a subtle accent box-shadow on hover for the primary/pillPrimary variants (web only), without regressing existing hover/press/cursor behavior.

- [ ] **Step 1: Add a web-only hover-glow constant**

In `src/ui/app-button.tsx`, replace the existing `webInteractive` constant (lines 8–10) with both constants:

```ts
// react-native-web accepts these web-only style props; cast at the boundary.
const webInteractive = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'opacity, transform, background-color, border-color, box-shadow', transitionDuration: '150ms' } as object)
  : null;
const primaryHoverGlow = Platform.OS === 'web' ? ({ boxShadow: '0 8px 30px rgba(228,227,87,0.35)' } as object) : null;
```

- [ ] **Step 2: Apply the glow when a primary button is hovered**

In the `Pressable` `style` callback, add `isPrimary && hovered ? (primaryHoverGlow as object) : null` to the returned style array (after `webInteractive`):

```tsx
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
        isPrimary && hovered ? (primaryHoverGlow as object) : null,
      ]}
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/ui/app-button.tsx
git commit -m "feat(ui): subtle accent hover glow on primary AppButton (web)"
```

---

### Task 6: Verify (build + bundle hygiene + browser) and deploy

**Files:** none (verification + deploy).

- [ ] **Step 1: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + `EXPORT OK`.

- [ ] **Step 2: Bundle hygiene — no Firebase in the public entry**

Run: `grep -rl "initializeApp\|firebase/auth" dist/_expo/static/js/web | grep -v firebase-client || echo "clean"`
Expected: `clean` (Firebase SDK stays confined to the `firebase-client-*` chunk).

- [ ] **Step 3: Browser verification (preview tools)**

Start/reuse the preview server, load the home, and confirm:
- **Typeface:** `preview_inspect` the hero title → computed `font-family` starts with `SpaceGrotesk_600SemiBold` (or resolves to a sans, **never** a serif). Use `preview_eval` reading `getComputedStyle(document.querySelector('[data-... hero title]')).fontFamily` if needed.
- **Backdrop glow:** visible but subtle in a `preview_screenshot`.
- **Entrance stagger:** on reload, blocks fade/slide in sequentially (note: the headless preview may throttle rAF/Animated — if so, confirm the final state is correct and rely on the live site for motion).
- **Count-up stats:** `7+`, `15+`, `99.9%` end at their exact target strings (`preview_snapshot`/`preview_inspect`).
- **Primary CTA glow:** present on hover (best confirmed on the live site if headless hover is unreliable).
- **Reduced motion:** `preview_resize` is not sufficient; note that under `prefers-reduced-motion` everything must render at final state — verify logic by code review since the preview can't easily toggle the media feature.

Fix any issues by editing source and re-running from Step 1.

- [ ] **Step 4: Deploy to production**

After the branch is merged (or on request), trigger the manual deploy:

Run: `gh workflow run deploy.yml --ref main` then `gh run watch <run-id> --exit-status`
Expected: `completed / success`. Then confirm the live site renders SpaceGrotesk headings.

---

## Self-Review

**1. Spec coverage:**
- Typeface fix → Task 1 ✓
- `Reveal` primitive (reduced-motion) → Task 2 ✓
- `useCountUp` (suffix/decimals parsing, reduced-motion) → Task 3 ✓
- Backdrop glow, accent-word glow, staggered reveal, count-up stats, pulsing dot → Task 4 ✓
- Primary CTA hover glow → Task 5 ✓
- Build/bundle/browser verification + deploy → Task 6 ✓
No spec gaps.

**2. Placeholder scan:** No TBD/TODO; every code step shows complete code. ✓

**3. Type consistency:**
- `useCountUp(value: string, opts?: { durationMs?: number }): string` — defined in Task 3, called with a single arg in Task 4 ✓.
- `Reveal({ children, delay?, style? })` — defined Task 2, used with `delay`/`style` in Task 4 ✓.
- `prefersReducedMotion()` is defined locally in each file that uses it (reveal.tsx, use-count-up.ts, hero-section.tsx) — intentional small duplication to keep primitives dependency-free; acceptable per DRY-vs-coupling trade-off. ✓
- `fonts.display`/`displayBold` remain `string`-typed after Task 1; existing consumers use them as `fontFamily` strings ✓.
