# Stack Section Polish + Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Stack section category cards the accent-glow hover-lift (reusing `GlowCard`), make tech pills hover-reactive, and stagger the heading + cards in on entrance — without changing the grid layout or content.

**Architecture:** `Pill` becomes a hover-reactive `Pressable` (same public API, no `onPress`). `stack-section.tsx` wraps each category card in `GlowCard` and wraps the heading + each card in the existing `Reveal`, moving the card flex sizing onto the `Reveal` wrapper so the grid is preserved.

**Tech Stack:** Expo Router + react-native-web, existing `GlowCard` + `Reveal`, Pressable hover state. No test runner in this repo.

**Verification note:** No jest/unit-test setup — do NOT add one. Verify with `npx tsc --noEmit` + `npx expo export -p web` + browser. Do NOT run `npx expo lint` (it auto-scaffolds `eslint.config.js` + deps; discard if produced).

---

### Task 1: `Pill` — hover-reactive (API unchanged)

**Files:**
- Modify: `src/features/portfolio/components/pill.tsx` (full rewrite)

Convert the static `View` into a `Pressable` (no `onPress`) whose background + border brighten on hover, with a web transition. Same rest appearance and same public API (`{ label }`).

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/components/pill.tsx`**

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

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/components/pill.tsx
git commit -m "feat(portfolio): tech Pill brightens on hover (web)"
```

---

### Task 2: Stack section — `GlowCard` cards + staggered `Reveal` entrance

**Files:**
- Modify: `src/features/portfolio/sections/stack/stack-section.tsx` (full rewrite)

Wrap the heading in `Reveal` (`delay 0`) and each category card in `Reveal`
(`delay i*70`) that carries the grid flex sizing (`flexGrow: 1, flexBasis: 240,
minWidth: 220`). Each card body uses `GlowCard` (fills the wrapper with
`width: '100%', flexGrow: 1`), keeping the card's surface/border/radius/padding.
`GlowCard` children is a render prop; the content ignores `hovered` (pills have
their own hover).

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/stack/stack-section.tsx`**

```tsx
import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { Pill } from '../../components/pill';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';
import { Reveal } from '@/ui/reveal';

export function StackSection() {
  const { content } = useI18n();
  const { stack } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={stack.kicker} heading={stack.heading} />
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {stack.groups.map((group, i) => (
          <Reveal key={group.category} delay={i * 70} style={{ flexGrow: 1, flexBasis: 240, minWidth: 220 }}>
            <GlowCard
              style={{
                width: '100%',
                flexGrow: 1,
                padding: 20,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.lg - 2,
              }}
            >
              {() => (
                <>
                  <Text
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 11,
                      letterSpacing: 0.55,
                      textTransform: 'uppercase',
                      color: colors.textFaint,
                      marginBottom: 14,
                    }}
                  >
                    {group.category}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {group.items.map((item) => (
                      <Pill key={item} label={item} />
                    ))}
                  </View>
                </>
              )}
            </GlowCard>
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
git add src/features/portfolio/sections/stack/stack-section.tsx
git commit -m "feat(portfolio): stack cards use GlowCard + staggered reveal (grid preserved)"
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

Start/reuse the `web` preview, scroll to the Stack section, and confirm:
- **At rest:** grid looks identical (same category cards, same pills, same
  wrapping). `preview_screenshot`.
- **Card hover:** hovering a category card lifts it with an accent border + soft
  glow (headless RNW hover may be unreliable — if so, confirm the mechanism by code
  (same `GlowCard` used by Services) and verify live).
- **Pill hover:** hovering a pill brightens its bg/border.
- **Entrance:** heading + cards fade/slide in staggered on reload (headless may
  throttle `Animated`/rAF — confirm final state; motion verified live).
- **Grid unchanged:** wrapping matches at mobile (375) + desktop.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 4: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live.

---

## Self-Review

**1. Spec coverage:**
- `Pill` hover-reactive, API unchanged → Task 1 ✓
- Category cards use `GlowCard` (lift + accent glow) → Task 2 ✓
- Heading + cards staggered `Reveal`, grid preserved (flex sizing on wrapper) →
  Task 2 ✓
- Verify + deploy → Task 3 ✓
- Non-goals honored: no grid/content/type-size change; no `onPress` on pills;
  `SectionHeading` wrapped not edited; other sections untouched ✓
No gaps.

**2. Placeholder scan:** No TBD/TODO; complete code in every code step. ✓

**3. Type consistency:**
- `Pill({ label }: { label: string })` — API unchanged; `stack-section.tsx` calls
  `<Pill key={item} label={item} />` ✓.
- `GlowCard({ style?, children })` with `children: (hovered: boolean) => ReactNode`
  — used with `{() => (…)}` in Task 2 ✓.
- `Reveal({ children, delay?, slide?, style? })` — used with `delay` + `style`
  (flex sizing), default slide ✓.
- `StackGroup` fields `category`/`items` used ✓.
- Grid sizing: old card had `flexGrow:1, flexBasis:240, minWidth:220`; Task 2 moves
  `flexBasis:240, minWidth:220` to the `Reveal` wrapper and keeps `flexGrow:1,
  width:'100%'` on the `GlowCard` → equivalent layout ✓.
