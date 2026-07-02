# Projects Section UI/UX Polish + Animations — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Elevate the "Proyectos" section without changing its grid layout: project cards get
the accent-glow hover-lift (reusing `GlowCard`), the category chip + tech tags
brighten when the card is hovered, and the heading + cards stagger in on entrance.
Public site only.

## Context

- `projects-section.tsx` renders `SectionHeading` + a `flexWrap` row of
  `ProjectCard`.
- `ProjectCard` currently uses `HoverCard` (lift only). It has a category chip
  (accent bg), a title (`fonts.display`, 21), a description, and a bottom row of
  tech tags (mono, faint border, `textFainter`) pinned with `marginTop: 'auto'`.
  Card is `minHeight: 210`.
- `GlowCard` (`src/ui/glow-card.tsx`) exposes `hovered` to children via a render
  prop; `Reveal` (`src/ui/reveal.tsx`) exists. Both reused. Cards have real spacing
  (gap 16, no seams), so `GlowCard`'s lift/box-shadow and the default slide-in
  `Reveal` both fit.
- `ProjectItem` type: `{ category, title, description, tech: string[] }`.

## Decisions (agreed with user)

- **Cards:** use `GlowCard` (lift + accent border/glow).
- **Chip + tags:** react to the card's hover (single interaction level) — the
  category chip bg intensifies and the tech tag borders brighten + text lightens.
- **Entrance:** `Reveal` fade+slide (default), staggered per card.

## Non-goals

- No grid/layout/content changes; no typography size changes.
- No per-tag hover (tags react to the card, not individually).
- No `onPress` (cards are not links). `SectionHeading` unmodified (wrapped).
- `HoverCard` is no longer used after this change, but is left in the repo (a valid
  reusable primitive); no deletion in this work.

## Architecture

`ProjectCard` swaps `HoverCard` → `GlowCard` and drives the chip/tags from the
render-prop `hovered`. `projects-section.tsx` wraps the heading + each card in
`Reveal`, moving the card flex sizing to the `Reveal` wrapper so the grid is
preserved.

### `project-card.tsx` (full rewrite)

```tsx
import { Platform, Text, View } from 'react-native';
import type { ProjectItem } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';

const chipTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color', transitionDuration: '180ms' } as object) : null;
const tagTransition = Platform.OS === 'web' ? ({ transitionProperty: 'border-color, color', transitionDuration: '180ms' } as object) : null;

export function ProjectCard({ item }: { item: ProjectItem }) {
  return (
    <GlowCard
      style={{
        width: '100%',
        flexGrow: 1,
        minHeight: 210,
        padding: 26,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        borderRadius: 18,
      }}
    >
      {(hovered) => (
        <>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <View
              style={[
                {
                  backgroundColor: hovered ? 'rgba(228,227,87,0.2)' : 'rgba(228,227,87,0.12)',
                  borderRadius: radii.sm,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                },
                chipTransition as object,
              ]}
            >
              <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>
                {item.category}
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.21, color: colors.text, marginBottom: 10 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim }}>{item.description}</Text>

          {/* marginTop:'auto' pushes the tech tags to the bottom of the card */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 'auto', paddingTop: 20 }}>
            {item.tech.map((tech) => (
              <View
                key={tech}
                style={[
                  {
                    borderWidth: 1,
                    borderColor: hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    borderRadius: radii.sm - 1,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  },
                  tagTransition as object,
                ]}
              >
                <Text style={[{ fontFamily: fonts.mono, fontSize: 10.5, color: hovered ? colors.textDim : colors.textFainter }, tagTransition as object]}>
                  {tech}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </GlowCard>
  );
}
```

Notes:
- Same rest appearance (chip 0.12, tag border 0.1, `textFainter`).
- `GlowCard` (a `Pressable`/`View`, flex column) preserves `minHeight: 210` +
  `marginTop: 'auto'` bottom-pinning, exactly like `HoverCard` did.
- Web-only props guarded by `Platform.OS === 'web'` and cast at the boundary.

### `projects-section.tsx` (rewrite)

Wrap the heading in `<Reveal delay={0}>` and each card in
`<Reveal key={item.title} delay={i*70} style={{ flexGrow: 1, flexBasis: 340, minWidth: 300 }}>`
(default slide). Keep the row `gap: 16` + `flexWrap`. The flex sizing
(`flexBasis: 340`, `minWidth: 300`) moves from the card to the `Reveal` wrapper;
the `GlowCard` fills it (`width: '100%'`, `flexGrow: 1`).

## Data flow

No new data. `GlowCard`/`Reveal` presentational; chip/tags derive from `hovered`.
i18n unaffected (locale switch re-mounts → re-reveal).

## Files

- **Modify:** `src/features/portfolio/sections/projects/project-card.tsx` —
  `GlowCard` + hover-reactive chip/tags.
- **Modify:** `src/features/portfolio/sections/projects/projects-section.tsx` —
  `Reveal` stagger (grid preserved).

## Error handling

- Components never throw; web-only props guarded.
- Grid must not regress: flex sizing on the `Reveal` wrapper + `width: '100%'`
  card + `minHeight: 210` reproduce today's layout, including bottom-pinned tags.

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds.
- Bundle hygiene unchanged (no Firebase in projects).
- Browser (preview): at rest the grid looks identical (same cards, chips, tags,
  wrapping, bottom-pinned tags); hovering a card lifts it with an accent
  border/glow and brightens its chip + tag borders/text; on load heading + cards
  fade/slide in staggered. Verify at mobile (375) + desktop.
- Reduced motion: with `prefers-reduced-motion: reduce`, heading + cards appear at
  final state; hovers still work.
- No regression to other sections (`GlowCard`/`Reveal` APIs unchanged; `HoverCard`
  untouched).

## Implementation order

1. `project-card.tsx` — `GlowCard` + hover-reactive chip/tags.
2. `projects-section.tsx` — `Reveal` stagger (grid preserved).
3. Verify (tsc, export, bundle hygiene) + browser check + deploy.
