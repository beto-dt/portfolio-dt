# Experience Timeline Polish + Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add staggered fade-in entrance, a pulsing "current" node, and a per-entry hover (node fills, line + description brighten) to the Experiencia timeline — without changing its layout or content.

**Architecture:** `experience-item.tsx` gains a `TimelineNode` sub-component (fills on hover; pulses a ring when `current`) and becomes a hover-reactive `Pressable` (line segment + description react to `hovered`). `experience-section.tsx` wraps the heading and each entry in the existing `Reveal` — entries use `slide={false}` so the stacked `border-left` timeline line never shifts.

**Tech Stack:** Expo Router + react-native-web, react-native `Animated`, existing `Reveal`, Pressable hover state. No test runner in this repo.

**Verification note:** No jest/unit-test setup — do NOT add one. Verify with `npx tsc --noEmit` + `npx expo export -p web` + browser. Do NOT run `npx expo lint` (it auto-scaffolds `eslint.config.js` + deps; discard if produced).

---

### Task 1: `experience-item.tsx` — TimelineNode (pulse + hover fill) + hover-reactive entry

**Files:**
- Modify: `src/features/portfolio/sections/experience/experience-item.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/experience/experience-item.tsx`**

```tsx
import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import type { ExperienceItem as ExperienceItemContent } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const rowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'border-left-color', transitionDuration: '180ms' } as object) : null;
const nodeTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, box-shadow', transitionDuration: '180ms' } as object) : null;
const descTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '180ms' } as object) : null;
const nodeGlowWeb = Platform.OS === 'web' ? ({ boxShadow: '0 0 12px rgba(228,227,87,0.6)' } as object) : null;

/** Timeline node: fills accent on hover; pulses a ring when it's the current role. */
function TimelineNode({ current, hovered }: { current?: boolean; hovered: boolean }) {
  const reduce = prefersReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!current || reduce) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [current, reduce, pulse]);

  return (
    <View style={{ position: 'absolute', left: -6, top: 5, width: 11, height: 11 }}>
      {current && !reduce ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 11,
            height: 11,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: colors.accent,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
          }}
        />
      ) : null}
      <View
        style={[
          {
            width: 11,
            height: 11,
            borderRadius: 999,
            backgroundColor: hovered ? colors.accent : colors.background,
            borderWidth: 2,
            borderColor: colors.accent,
          },
          nodeTransition as object,
          hovered ? (nodeGlowWeb as object) : null,
        ]}
      />
    </View>
  );
}

export function ExperienceItem({ item }: { item: ExperienceItemContent }) {
  return (
    <Pressable>
      {({ hovered }: HoverState) => (
        <View
          style={[
            {
              position: 'relative',
              flexDirection: 'row',
              gap: 28,
              paddingLeft: 28,
              paddingBottom: 34,
              marginLeft: 2,
              borderLeftWidth: 1,
              borderLeftColor: hovered ? 'rgba(228,227,87,0.35)' : 'rgba(255,255,255,0.1)',
            },
            rowTransition as object,
          ]}
        >
          <TimelineNode current={item.current} hovered={!!hovered} />

          <View style={{ width: 170, gap: 5 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.accent }}>{item.period}</Text>
            <Text style={{ fontSize: 12, color: colors.textFaint }}>{item.location}</Text>
            {item.current && item.currentLabel ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 2,
                  backgroundColor: 'rgba(228,227,87,0.14)',
                  borderRadius: radii.sm - 1,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.6, color: colors.accent }}>
                  {item.currentLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 19, letterSpacing: -0.19, color: colors.text }}>
              {item.role}
            </Text>
            <Text style={{ fontSize: 14, color: colors.accent }}>{item.company}</Text>
            <Text style={[{ marginTop: 6, fontSize: 13.5, lineHeight: 22, color: hovered ? colors.textMuted : colors.textDim, maxWidth: 560 }, descTransition as object]}>
              {item.description}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/sections/experience/experience-item.tsx
git commit -m "feat(portfolio): timeline node pulse (current) + per-entry hover"
```

---

### Task 2: `experience-section.tsx` — staggered fade entrance

**Files:**
- Modify: `src/features/portfolio/sections/experience/experience-section.tsx` (full rewrite)

Wrap the heading in `Reveal` (`delay 0`) and each entry in `<Reveal slide={false}
delay={i*70}>` (fade only, to keep the timeline line intact). Keep the existing key
scheme.

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/experience/experience-section.tsx`**

```tsx
import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ExperienceItem } from './experience-item';
import { useI18n } from '@/i18n/i18n-provider';
import { Reveal } from '@/ui/reveal';

export function ExperienceSection() {
  const { content } = useI18n();
  const { experience } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="experience">
      <Reveal delay={0}>
        <SectionHeading kicker={experience.kicker} heading={experience.heading} />
      </Reveal>
      <View>
        {experience.items.map((item, i) => (
          <Reveal key={`${item.company}-${item.period}`} slide={false} delay={i * 70}>
            <ExperienceItem item={item} />
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
git add src/features/portfolio/sections/experience/experience-section.tsx
git commit -m "feat(portfolio): staggered fade entrance for experience timeline"
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

Start/reuse the `web` preview, scroll to the Experiencia section, and confirm:
- **At rest:** timeline looks identical (continuous vertical line, hollow nodes,
  ACTUAL badge). `preview_screenshot`.
- **Current node:** the entry marked ACTUAL shows a pulsing ring around its node
  (headless may throttle `Animated`/rAF — confirm final/static state; motion live).
- **Hover:** hovering an entry fills its node (glow), brightens its line segment +
  description (headless RNW hover may be unreliable — confirm mechanism by code;
  verify live).
- **Entrance:** heading + entries fade in staggered on reload; the vertical line
  stays continuous (no gaps) because entries fade (not slide).
- **Layout unchanged:** wrapping/columns match at mobile (375) + desktop.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 4: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live.

---

## Self-Review

**1. Spec coverage:**
- `TimelineNode` fills on hover + pulsing ring when `current` (reduced-motion aware)
  → Task 1 ✓
- Per-entry hover: node fill + glow, `border-left` brightens, description
  `textDim → textMuted` → Task 1 ✓
- Staggered fade entrance (heading normal, entries `slide={false}`) → Task 2 ✓
- Verify + deploy → Task 3 ✓
- Non-goals honored: no layout/content/type-size change; no `onPress`;
  `SectionHeading` wrapped not edited; other sections untouched ✓
No gaps.

**2. Placeholder scan:** No TBD/TODO; complete code in every code step. ✓

**3. Type consistency:**
- `TimelineNode({ current?: boolean; hovered: boolean })` — defined + used in Task 1
  (`hovered={!!hovered}`) ✓.
- `ExperienceItem({ item })` public API unchanged; `experience-section.tsx` calls
  `<ExperienceItem item={item} />` inside `Reveal` ✓.
- `Reveal({ children, delay?, slide?, style? })` — existing; entries use
  `slide={false}` + `delay`, heading uses default ✓.
- `ExperienceItemContent` fields (`period`, `location`, `current`, `currentLabel`,
  `role`, `company`, `description`) all match the type ✓.
- Rest-state styles (node hollow, line `rgba(255,255,255,0.1)`, description
  `textDim`) match the current file, so no-hover appearance is unchanged ✓.
