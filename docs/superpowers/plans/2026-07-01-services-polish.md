# Services Section Polish + Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the Servicios section — a reusable accent-glow `GlowCard`, refined card typography + hover states, and a staggered entrance — without changing the grid layout or content.

**Architecture:** A new `GlowCard` primitive (Pressable that lifts + glows on hover and passes `hovered` to children via render prop) replaces `HoverCard` in `ServiceCard` only. `ServiceCard` refines typography and drives its tag/number colors from `hovered`. `services-section.tsx` wraps the heading and each card in the existing `Reveal` primitive with a staggered delay, keeping the flex grid sizing intact.

**Tech Stack:** Expo Router + react-native-web, react-native `Animated` (via existing `Reveal`), Pressable hover state. No test runner in this repo.

**Verification note:** This project has **no jest/unit-test setup**. Do NOT add one. Verify each task with `npx tsc --noEmit` and the browser preview. Do NOT run `npx expo lint` (it auto-scaffolds an `eslint.config.js` + deps on first run — out of scope; if it was run, discard those changes).

---

### Task 1: `GlowCard` primitive

**Files:**
- Create: `src/ui/glow-card.tsx`

A card container that lifts + shows a soft accent glow/border on hover and passes `hovered` to its children so they can react. Not a link (default cursor, no `onPress`).

- [ ] **Step 1: Create `src/ui/glow-card.tsx`**

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
 * passes `hovered` to children (render prop) so they can react. Default cursor.
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

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/ui/glow-card.tsx
git commit -m "feat(ui): add GlowCard primitive (accent-glow hover, passes hovered to children)"
```

---

### Task 2: `ServiceCard` — use `GlowCard`, refine typography + hover states

**Files:**
- Modify: `src/features/portfolio/sections/services/service-card.tsx` (full rewrite)

The card fills its parent (the `Reveal` wrapper added in Task 3 carries the flex sizing), so `GlowCard` here uses `width: '100%'` + `flexGrow: 1` instead of the old `flexBasis: 320` / `maxWidth: 560` (those move to the wrapper). Index and tag colors are driven by `hovered`; the title typography is refined.

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/services/service-card.tsx`**

```tsx
import { Platform, Text, View } from 'react-native';
import type { ServiceItem } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';

// Web-only smooth transition for the tag chip bg + index color on hover.
const chipTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color', transitionDuration: '180ms' } as object) : null;
const indexTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '180ms' } as object) : null;

export function ServiceCard({ item }: { item: ServiceItem }) {
  return (
    <GlowCard
      style={{
        width: '100%',
        flexGrow: 1,
        padding: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
      }}
    >
      {(hovered) => (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={[{ fontFamily: fonts.mono, fontSize: 11, color: hovered ? colors.accent : colors.textFaint }, indexTransition as object]}>
              {item.index}
            </Text>
            <View style={[{ backgroundColor: hovered ? 'rgba(228,227,87,0.2)' : 'rgba(228,227,87,0.12)', borderRadius: radii.sm, paddingHorizontal: 9, paddingVertical: 4 }, chipTransition as object]}>
              <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>{item.tag}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.2, color: colors.text, marginBottom: 9 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim, fontFamily: fonts.body }}>
            {item.description}
          </Text>
        </>
      )}
    </GlowCard>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/sections/services/service-card.tsx
git commit -m "feat(portfolio): service cards use GlowCard, refined type + hover states"
```

---

### Task 3: Services section — staggered `Reveal` entrance (grid preserved)

**Files:**
- Modify: `src/features/portfolio/sections/services/services-section.tsx` (full rewrite)

Wrap `SectionHeading` in `Reveal` (`delay 0`) and each card in a `Reveal` that carries the grid flex sizing (`flexGrow: 1, flexBasis: 320, maxWidth: 560`) previously on the card, so wrapping/widths are unchanged. Stagger with `delay = i * 70`.

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/services/services-section.tsx`**

```tsx
import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ServiceCard } from './service-card';
import { useI18n } from '@/i18n/i18n-provider';
import { Reveal } from '@/ui/reveal';

export function ServicesSection() {
  const { content } = useI18n();
  const { services } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="services">
      <Reveal delay={0}>
        <SectionHeading kicker={services.kicker} heading={services.heading} />
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {services.items.map((item, i) => (
          <Reveal key={item.index} delay={i * 70} style={{ flexGrow: 1, flexBasis: 320, maxWidth: 560 }}>
            <ServiceCard item={item} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + `EXPORT OK`.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/sections/services/services-section.tsx
git commit -m "feat(portfolio): staggered reveal entrance for services (grid preserved)"
```

---

### Task 4: Verify (build + bundle hygiene + browser) and deploy

**Files:** none (verification + deploy).

- [ ] **Step 1: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + `EXPORT OK`.

- [ ] **Step 2: Bundle hygiene**

Run: `grep -rl "initializeApp\|firebase/auth" dist/_expo/static/js/web | grep -v firebase-client || echo "clean"`
Expected: `clean`.

- [ ] **Step 3: Browser verification (preview tools)**

Start/reuse the preview `web` server, load home, scroll to `#services`, and confirm:
- **At rest:** 7 cards render identically to before (same grid, same wrapping). Use `preview_screenshot` + `preview_inspect`.
- **Hover:** hovering a card lifts it, its border turns accent with a soft glow, its tag chip bg brightens and its index number turns accent. (`preview_eval` can set hover via dispatching `mouseover`, or confirm the computed styles; headless hover may be unreliable — if so, confirm on the live site.)
- **Entrance stagger:** on reload the heading + cards fade/slide in in sequence (headless may throttle `Animated`/rAF — confirm final state correct; motion verified live).
- **Grid unchanged:** `preview_resize` to mobile (375) + desktop (1280); wrapping matches prior behavior.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 4: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live.

---

## Self-Review

**1. Spec coverage:**
- `GlowCard` primitive (render-prop `hovered`, accent glow, lift) → Task 1 ✓
- `ServiceCard` uses `GlowCard`, tag/number brighten on hover, title 20/-0.2 → Task 2 ✓
- `Reveal` stagger for heading + cards, grid preserved (flex sizing on wrapper) → Task 3 ✓
- Verify + deploy → Task 4 ✓
- Non-goals honored: `HoverCard` untouched, Projects untouched, `SectionHeading` unmodified (wrapped, not edited), no content/icon/layout changes ✓
No gaps.

**2. Placeholder scan:** No TBD/TODO; complete code in every code step. ✓

**3. Type consistency:**
- `GlowCard({ style?, children })` where `children: (hovered: boolean) => ReactNode` — defined Task 1, used with render-prop in Task 2 ✓.
- `Reveal({ children, delay?, style? })` — existing primitive; used with `delay` + `style` (flex sizing) in Task 3 ✓.
- `ServiceItem` fields used (`index`, `tag`, `title`, `description`) match the existing type imported from `@/content/types` ✓.
- Grid sizing math: old card had `flexGrow:1, flexBasis:320, maxWidth:560`; Task 3 moves `flexBasis:320, maxWidth:560` to the `Reveal` wrapper and Task 2 keeps `flexGrow:1, width:'100%'` on the card → equivalent layout ✓.
