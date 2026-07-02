# Experience Timeline UI/UX Polish + Animations — Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Elevate the "Experiencia" timeline without changing its layout: stagger entries in
on entrance (fade only, to keep the vertical line intact), pulse the current
entry's node, and add a per-entry hover (node fills, line segment + description
brighten). Public site only.

## Context

- `experience-section.tsx` renders `SectionHeading` + a `<View>` of
  `ExperienceItem`s.
- `ExperienceItem` is a row `View` with `borderLeftWidth: 1` (the timeline line),
  an absolutely-positioned hollow node (bg = background, 2px accent border), a left
  column (period, location, optional `current`/`currentLabel` badge), and a right
  column (role in `fonts.display`, company in accent, description in `textDim`).
- `Reveal` (`src/ui/reveal.tsx`) exists with a `slide?: boolean` prop (default
  true); `slide={false}` = opacity-only, needed here so the stacked `border-left`
  segments never shift and leave gaps mid-animation.
- `ExperienceItem` type: `{ period, location, current?, currentLabel?, role,
  company, description }`.

## Decisions (agreed with user)

- **Hover:** node fills accent (soft glow) + that entry's `border-left` segment
  brightens to an accent tint + description brightens (`textDim → textMuted`).
- **Current node:** a subtle pulsing ring behind the node.
- **Entrance:** staggered per-entry, fade only (`slide={false}`); heading normal.

## Non-goals

- No layout/content changes; no typography size changes (role already SpaceGrotesk).
- No `onPress` (entries are not links — default cursor).
- `SectionHeading` unmodified (wrapped in `Reveal`). No other sections touched.

## Architecture

Two concerns:

1. **`ExperienceItem` becomes hover-reactive with a smart node** — a `Pressable`
   (no `onPress`) whose row exposes `hovered` to a new `TimelineNode`
   sub-component and to the description; a web transition eases the border/color
   changes. `TimelineNode` fills on hover and, when `current`, renders a pulsing
   ring (reduced-motion aware).
2. **Entrance wiring** — `experience-section.tsx` wraps the heading in `Reveal` and
   each entry in `<Reveal slide={false} delay={i*70}>`.

### `experience-item.tsx` (full rewrite)

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

Notes:
- Same rest appearance (hollow node, faint line, `textDim` description).
- Web-only style props guarded by `Platform.OS === 'web'` and cast at the boundary.
- `Pressable` has no `onPress` (not a link); no `cursor: pointer`.

### `experience-section.tsx` (rewrite)

Wrap the heading in `<Reveal delay={0}>` and each entry in
`<Reveal key={…} slide={false} delay={i * 70}>` (fade-only). Keep the existing key
scheme `${item.company}-${item.period}`.

## Data flow

No new data. All effects derive from `item` + hover/reduced-motion state. i18n
unaffected (locale switch re-mounts → re-reveal, consistent with prior sections).

## Files

- **Modify:** `src/features/portfolio/sections/experience/experience-item.tsx` —
  `TimelineNode` + hover-reactive entry.
- **Modify:** `src/features/portfolio/sections/experience/experience-section.tsx` —
  `Reveal` (heading + staggered fade entries).

## Error handling

- Components never throw; web-only props guarded. Pulse cleans up its loop on
  unmount.
- Timeline line preserved: entries fade (no slide) so the stacked `border-left`
  segments never shift; hover only changes the segment color.

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds.
- Bundle hygiene unchanged (no Firebase in experience).
- Browser (preview): at rest the timeline looks identical (continuous line, hollow
  nodes); the current entry's node pulses a ring; hovering an entry fills its node
  (glow), brightens its line segment + description; on load heading + entries fade
  in staggered. Verify at mobile (375) + desktop.
- Reduced motion: with `prefers-reduced-motion: reduce`, no pulse and no entrance
  motion (final state); hover still works.
- No regression to other sections.

## Implementation order

1. `experience-item.tsx` — `TimelineNode` (pulse + hover fill) + hover-reactive
   entry (line + description).
2. `experience-section.tsx` — `Reveal` heading + staggered fade entries.
3. Verify (tsc, export, bundle hygiene) + browser check + deploy.
