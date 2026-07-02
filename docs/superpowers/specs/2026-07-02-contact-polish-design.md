# Contact Section UI/UX Polish + Animations — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Elevate the "Contacto" section without changing its layout: a staggered entrance
for the whole section, and hover-reactive detail blocks (label turns accent + an
accent underline grows) in addition to the existing link/button interactions.
Public site only.

## Context

- `contact-section.tsx` renders `SectionHeading` + a blurb + two CTAs
  (`AppButton` primary/outline — already have hover/press + the primary accent
  glow from prior work) + a horizontal details grid.
- `Detail({ label, value, onPress })` renders a mono uppercase label + either a
  `HoverLink` (email/phone/linkedin — hover color change already) or a plain `Text`
  (location). Returns `null` if `value` is empty.
- `Reveal` (`src/ui/reveal.tsx`) exists (default fade+slide, reduced-motion aware),
  reused here.

## Decisions (agreed with user)

- **Entrance:** staggered `Reveal` — heading (0), blurb (70), CTAs (140), details
  grid (210).
- **Details:** each `Detail` becomes a hover container — on hover the label turns
  accent and a 2px accent underline grows beneath it (like the nav underline). The
  value keeps its existing behavior (`HoverLink` color change / plain text).
- **CTAs:** unchanged (already polished); they just ride the entrance stagger.

## Non-goals

- No content/layout/type-size changes. No new primitives.
- Detail container has no `onPress` (the inner `HoverLink` keeps the action); it is
  a hover detector only, default cursor.
- `SectionHeading` unmodified (wrapped in `Reveal`). No other sections touched.

## Architecture

Single file. `Detail` becomes a hover-reactive `Pressable` (render-prop `hovered`)
with a label + growing accent underline; the section wraps heading/blurb/CTAs/grid
in `Reveal`.

### `contact-section.tsx` (full rewrite)

```tsx
import { Linking, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { HoverLink } from '@/ui/hover-link';
import { Reveal } from '@/ui/reveal';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const labelTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '180ms' } as object) : null;
const underlineTransition = Platform.OS === 'web' ? ({ transformOrigin: 'left', transitionProperty: 'transform', transitionDuration: '200ms' } as object) : null;

function Detail({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  if (!value) return null;
  return (
    <Pressable style={{ gap: 3, minWidth: 150 }}>
      {({ hovered }: HoverState) => (
        <>
          <View style={{ gap: 4, alignSelf: 'flex-start' }}>
            <Text style={[{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: hovered ? colors.accent : colors.textFaint }, labelTransition as object]}>
              {label}
            </Text>
            <View style={[{ height: 2, borderRadius: 2, backgroundColor: colors.accent, transform: [{ scaleX: hovered ? 1 : 0 }] }, underlineTransition as object]} />
          </View>
          {onPress ? (
            <HoverLink label={value} onPress={onPress} color={colors.accent} hoverColor={colors.text} />
          ) : (
            <Text style={{ fontSize: 13.5, color: colors.textMuted }}>{value}</Text>
          )}
        </>
      )}
    </Pressable>
  );
}

export function ContactSection() {
  const { content } = useI18n();
  const { contact } = content;
  return (
    <Container style={{ paddingVertical: 72 }} nativeID="contact">
      <Reveal delay={0}>
        <SectionHeading kicker={contact.kicker} heading={contact.heading} />
      </Reveal>
      <Reveal delay={70}>
        <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{contact.blurb}</Text>
      </Reveal>

      <Reveal delay={140}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <AppButton label={contact.emailCta} onPress={() => Linking.openURL(`mailto:${contact.email}`)} variant="primary" />
          <AppButton label={contact.whatsappCta} onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}`)} variant="outline" />
        </View>
      </Reveal>

      <Reveal delay={210}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Detail label="Email" value={contact.email} onPress={() => Linking.openURL(`mailto:${contact.email}`)} />
          <Detail label="Teléfono" value={contact.phone} onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\s/g, '')}`)} />
          <Detail label="LinkedIn" value={contact.linkedin} onPress={() => Linking.openURL(contact.linkedin)} />
          <Detail label="Ubicación" value={contact.location} />
        </View>
      </Reveal>
    </Container>
  );
}
```

Notes:
- Detail rest appearance unchanged (mono uppercase label `textFaint`, value via
  `HoverLink`/`Text`). The underline sits at `scaleX: 0` at rest (invisible).
- Detail container is a `Pressable` with **no `onPress`** — hover detector only;
  the inner `HoverLink` still handles the click. Default cursor on the container.
- The four detail-label strings stay hardcoded (they were already hardcoded in the
  current file — not part of the i18n content model).
- Web-only style props guarded by `Platform.OS === 'web'`.

## Data flow

No new data. i18n unaffected (locale switch re-mounts → re-reveal).

## Files

- **Modify:** `src/features/portfolio/sections/contact/contact-section.tsx`.

## Error handling

- Components never throw; web-only props guarded; `Detail` returns `null` for empty
  values (unchanged).
- No layout regression: the underline is a 2px element that occupies its row even
  at `scaleX: 0` (fixed height 2), so rest layout matches today plus a 2+4px label
  gap — a minor, intentional spacing refinement below the label. CTAs/links behave
  exactly as before.

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds.
- Bundle hygiene unchanged (no Firebase added; contact uses only `Linking`).
- Browser (preview): section looks the same at rest; on load heading/blurb/CTAs/
  details fade+slide in staggered; hovering a detail turns its label accent and
  grows the underline; email/WhatsApp buttons + links behave as before (mailto,
  wa.me, tel, linkedin). Verify at mobile (375) + desktop.
- Reduced motion: with `prefers-reduced-motion: reduce`, everything appears at
  final state; hovers still work.
- No regression to other sections.

## Implementation order

1. `contact-section.tsx` — `Detail` hover (label + underline) + `Reveal` stagger.
2. Verify (tsc, export, bundle hygiene) + browser check + deploy.
