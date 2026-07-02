# Certifications Section UI/UX Polish + Animations — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Elevate the "Certificaciones" list without changing its layout: rows highlight on
hover (subtle bg, brighter text, brighter divider, accent left marker) and the
heading + rows stagger in on entrance. No hyperlinks (per prior requirement).
Public site only.

## Context

- `certifications-section.tsx` renders `SectionHeading` + a `<View>` of rows. Each
  row: name (body, `rgb(223,226,230)`, `flex: 1`) on the left, issuer (mono,
  `textFaint`) on the right, separated by a 1px bottom border
  (`rgba(255,255,255,0.07)`), `paddingVertical: 12`.
- `Reveal` (`src/ui/reveal.tsx`) exists (default fade+slide, reduced-motion aware),
  reused here. Rows have their own per-row bottom border (not a shared continuous
  line), so the default slide entrance is fine.
- `Certification` type: `{ name: string; issuer: string }`.

## Decisions (agreed with user)

- **Hover:** row highlights — subtle bg fill, name brightens (`→ text`), issuer
  brightens (`textFaint → textDim`), bottom border brightens (`0.07 → 0.14`), and a
  2px accent marker appears in the left gutter. Default cursor (not a link).
- **Entrance:** `Reveal` fade+slide, staggered per row; heading normal.

## Non-goals

- No content changes; no hyperlinks; no typography size changes.
- No layout shift on hover (accent marker sits in the Container's left gutter via
  absolute positioning, so text stays put).
- `SectionHeading` unmodified (wrapped in `Reveal`). No other sections touched.

## Architecture

Single file. A `CertRow` sub-component renders each row as a hover-reactive
`Pressable`; the section maps rows inside `Reveal` wrappers.

### `certifications-section.tsx` (full rewrite)

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import type { Certification } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const rowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color' as const, transitionDuration: '160ms' } as object) : null;
const textTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color' as const, transitionDuration: '160ms' } as object) : null;
const markerTransition = Platform.OS === 'web' ? ({ transitionProperty: 'opacity' as const, transitionDuration: '160ms' } as object) : null;

/** A certification row that highlights on hover (decorative — not a link). */
function CertRow({ item }: { item: Certification }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          position: 'relative',
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
          backgroundColor: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        },
        rowTransition as object,
      ]}
    >
      {({ hovered }: HoverState) => (
        <>
          <View
            pointerEvents="none"
            style={[
              { position: 'absolute', left: -14, top: 12, bottom: 12, width: 2, borderRadius: 2, backgroundColor: colors.accent, opacity: hovered ? 1 : 0 },
              markerTransition as object,
            ]}
          />
          <Text style={[{ flex: 1, fontSize: 13.5, color: hovered ? colors.text : 'rgb(223,226,230)' }, textTransition as object]}>
            {item.name}
          </Text>
          <Text style={[{ fontFamily: fonts.mono, fontSize: 11, color: hovered ? colors.textDim : colors.textFaint }, textTransition as object]}>
            {item.issuer}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function CertificationsSection() {
  const { content } = useI18n();
  const { certifications } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={certifications.kicker} heading={certifications.heading} />
      </Reveal>
      <View>
        {certifications.items.map((item, i) => (
          <Reveal key={item.name} delay={i * 70}>
            <CertRow item={item} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
```

Notes:
- Same rest appearance (name `rgb(223,226,230)`, issuer `textFaint`, divider
  `0.07`, no bg).
- Accent marker is absolutely positioned at `left: -14` (inside the Container's
  ~40px gutter), so it never shifts the row content.
- `Pressable` has no `onPress` and no `cursor: pointer` (not a link).
- Web-only style props guarded by `Platform.OS === 'web'`.

## Data flow

No new data. Everything derives from `item` + hover state. i18n unaffected
(locale switch re-mounts → re-reveal).

## Files

- **Modify:** `src/features/portfolio/sections/certifications/certifications-section.tsx`.

## Error handling

- Components never throw; web-only props guarded.
- No layout regression: rest styles match the current file; hover changes are
  color/opacity/bg only; the marker is absolute (no reflow).

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds.
- Bundle hygiene unchanged (no Firebase in certifications).
- Browser (preview): at rest the list looks identical; hovering a row adds the
  subtle bg, brighter text + divider, and the left accent marker (headless RNW
  hover may be unreliable — verify mechanism by code / live); on load heading +
  rows fade/slide in staggered. Verify at mobile (375) + desktop.
- Reduced motion: with `prefers-reduced-motion: reduce`, heading + rows appear at
  final state; hover still works.
- No regression to other sections.

## Implementation order

1. `certifications-section.tsx` — `CertRow` hover + `Reveal` stagger.
2. Verify (tsc, export, bundle hygiene) + browser check + deploy.
