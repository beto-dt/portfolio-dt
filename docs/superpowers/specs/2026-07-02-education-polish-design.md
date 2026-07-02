# Education Section UI/UX Polish + Animations — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Elevate the "Educación" section without changing its layout: education rows
highlight on hover (like Certifications) with a staggered entrance, and the
Idiomas block becomes hover-reactive chips. Public site only.

## Context

- `education-section.tsx` renders `SectionHeading` + a list of education rows +
  a languages block.
- Each education row: title (`fonts.display`, 16) on top, then a
  space-between row with institution (accent) + period (mono, `textFaint`);
  1px bottom border (`rgba(255,255,255,0.07)`), `paddingVertical: 12`.
- Languages block: a mono-uppercase heading (`languagesHeading`) + inline
  `language` (text) / `level` (mono, `textFaint`) pairs.
- `Reveal` (`src/ui/reveal.tsx`) exists (default fade+slide, reduced-motion aware),
  reused here.
- Types: `EducationItem = { title, institution, period }`,
  `LanguageItem = { language, level }`.

## Decisions (agreed with user)

- **Education rows:** same hover as Certifications — subtle bg, brighter
  title/institution/period, brighter divider, accent left marker (default cursor).
- **Languages:** each pair becomes a hover-reactive chip (`LangChip`) — pill bg +
  border that brighten on hover; language in text, level in mono (`textFaint →
  textDim`).
- **Entrance:** `Reveal` fade+slide, staggered — heading, each row, then the
  languages block.

## Non-goals

- No content changes; no typography size changes; no hyperlinks.
- No layout shift on hover (accent marker sits in the Container gutter).
- `SectionHeading` unmodified (wrapped in `Reveal`). No other sections touched.

## Architecture

Single file. `EduRow` (hover-reactive `Pressable`) and `LangChip` (hover-reactive
`Pressable`) sub-components; the section maps rows inside `Reveal` wrappers and puts
the languages block in its own `Reveal`.

### `education-section.tsx` (full rewrite)

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import type { EducationItem, LanguageItem } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const rowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '160ms' } as object) : null;
const textTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const markerTransition = Platform.OS === 'web' ? ({ transitionProperty: 'opacity', transitionDuration: '160ms' } as object) : null;
const chipTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '150ms' } as object) : null;

/** An education row that highlights on hover (decorative — not a link). */
function EduRow({ item }: { item: EducationItem }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          position: 'relative',
          paddingVertical: 12,
          gap: 3,
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
          <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>{item.title}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 13.5, color: colors.accent }}>{item.institution}</Text>
            <Text style={[{ fontFamily: fonts.mono, fontSize: 11.5, color: hovered ? colors.textDim : colors.textFaint }, textTransition as object]}>
              {item.period}
            </Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

/** A language/level chip that brightens on hover (decorative — not a link). */
function LangChip({ item }: { item: LanguageItem }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          flexDirection: 'row',
          gap: 8,
          alignItems: 'baseline',
          backgroundColor: hovered ? colors.borderStrong : colors.surfaceStrong,
          borderWidth: 1,
          borderColor: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
          borderRadius: radii.sm + 1,
          paddingHorizontal: 11,
          paddingVertical: 6,
        },
        chipTransition as object,
      ]}
    >
      <Text style={{ fontSize: 14, color: colors.text }}>{item.language}</Text>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{item.level}</Text>
    </Pressable>
  );
}

export function EducationSection() {
  const { content } = useI18n();
  const { education } = content;
  const langDelay = (education.items.length + 1) * 70;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={education.kicker} heading={education.heading} />
      </Reveal>
      <View style={{ gap: 24 }}>
        <View>
          {education.items.map((item, i) => (
            <Reveal key={item.title} delay={(i + 1) * 70}>
              <EduRow item={item} />
            </Reveal>
          ))}
        </View>
        <Reveal delay={langDelay} style={{ gap: 10 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>
            {education.languagesHeading}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {education.languages.map((l) => (
              <LangChip key={l.language} item={l} />
            ))}
          </View>
        </Reveal>
      </View>
    </Container>
  );
}
```

Notes:
- Education rows keep their rest appearance (title display 16, institution accent,
  period `textFaint`, divider `0.07`); hover adds bg + marker + period brighten +
  divider brighten. (Institution stays accent — already prominent.)
- Languages change from inline text pairs to chips (surface-strong bg, faint
  border), matching the Stack pill aesthetic. Row `gap` tightened 28 → 12 since
  chips have their own padding.
- Web-only props guarded by `Platform.OS === 'web'`; no `cursor: pointer` (not
  links).
- `langDelay` continues the stagger after the education rows (+1 accounts for the
  heading at delay 0 / rows starting at 70).

## Data flow

No new data. Everything derives from `education` + hover state. i18n unaffected.

## Files

- **Modify:** `src/features/portfolio/sections/education/education-section.tsx`.

## Error handling

- Components never throw; web-only props guarded.
- No layout regression for rows (rest styles match; marker absolute). Languages
  visually change to chips by design (approved).

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds.
- Bundle hygiene unchanged (no Firebase in education).
- Browser (preview): education rows look the same at rest; hovering a row adds bg +
  marker + brighter divider/period; language chips render (bg + border) and
  brighten on hover; on load heading + rows + languages fade/slide in staggered.
  Verify at mobile (375) + desktop.
- Reduced motion: with `prefers-reduced-motion: reduce`, everything appears at
  final state; hovers still work.
- No regression to other sections.

## Implementation order

1. `education-section.tsx` — `EduRow` + `LangChip` hover + `Reveal` stagger.
2. Verify (tsc, export, bundle hygiene) + browser check + deploy.
