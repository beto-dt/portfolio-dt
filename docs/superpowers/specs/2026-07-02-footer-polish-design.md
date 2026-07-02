# Footer UI/UX Polish + Animations — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Elevate the site footer: add a "back to top" control (accent hover, smooth scroll)
and a fade-in entrance, keeping the minimal copyright/tagline layout. Public site
only.

## Context

- `src/features/portfolio/components/site-footer.tsx`: an outer `View` with a top
  border + a `Container` (space-between row, flexWrap) holding copyright (left,
  mono `textFaint`) and tagline (right, mono `textFaint`).
- `FooterContent = { copyright, tagline }` — no back-to-top label in the content
  model.
- `useI18n()` exposes `locale` (`'es' | 'en'`), so a bilingual button label can be
  resolved inline without expanding the CMS content model.
- `scrollToAnchor(anchor)` (`src/ui/scroll-to-anchor.ts`) smooth-scrolls to a DOM
  id; the hero has `nativeID="top"`. `Reveal` (`src/ui/reveal.tsx`) exists.

## Decisions (agreed with user)

- **Back to top:** a centered `Pressable` "↑ Volver arriba" / "↑ Back to top"
  (mono) that turns accent on hover (cursor pointer) and calls
  `scrollToAnchor('top')`.
- **Entrance:** the footer content fades in via `Reveal` (fade only — no slide, so
  the top border doesn't shift).
- **Copyright/tagline:** stay static (non-interactive text; no hover), so hover
  affordance is reserved for the one clickable element (the button).

## Non-goals

- No content-model/CMS changes (label resolved inline from `locale`).
- No layout redesign; no new primitives.
- No hover on the plain copyright/tagline texts.

## Architecture

Single file. Add a `topLabel` from `locale`, a back-to-top `Pressable`, and wrap
the row content in `Reveal`.

### `site-footer.tsx` (full rewrite)

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from './container';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const topInteractive = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;

function BackToTop({ label }: { label: string }) {
  return (
    <Pressable onPress={() => scrollToAnchor('top')} style={topInteractive as object}>
      {({ hovered }: HoverState) => (
        <Text style={[{ fontFamily: fonts.mono, fontSize: 11.5, color: hovered ? colors.accent : colors.textFaint }, topInteractive as object]}>
          ↑ {label}
        </Text>
      )}
    </Pressable>
  );
}

export function SiteFooter() {
  const { content, locale } = useI18n();
  const { footer } = content;
  const topLabel = locale === 'es' ? 'Volver arriba' : 'Back to top';
  return (
    <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: colors.border }}>
      <Reveal slide={false}>
        <Container style={{ paddingVertical: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.copyright}</Text>
          <BackToTop label={topLabel} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.tagline}</Text>
        </Container>
      </Reveal>
    </View>
  );
}
```

Notes:
- `space-between` with three children puts copyright left, the button centered,
  tagline right; `flexWrap` + `gap: 12` stacks them cleanly on narrow screens.
- The button label uses `locale` (bilingual) — no CMS field added.
- Web-only props (`cursor`, `transitionProperty`) guarded and cast at the boundary;
  the transition is applied to the `Text` so the color eases on hover.
- `Reveal slide={false}` keeps the top border fixed while the content fades in.

## Data flow

No new data. `topLabel` derives from `locale`. i18n unaffected (locale switch
re-renders the label + re-reveals).

## Files

- **Modify:** `src/features/portfolio/components/site-footer.tsx`.

## Error handling

- `scrollToAnchor` guards `document`; missing `top` id → no-op. Components never
  throw; web-only props guarded.
- No layout regression: copyright/tagline rest styles unchanged; the button is an
  added centered element (was empty center space before).

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds.
- Bundle hygiene unchanged (footer imports no Firebase).
- Browser (preview): footer shows copyright · "↑ Volver arriba" · tagline; clicking
  the button smooth-scrolls to the hero top; hovering it turns it accent; the footer
  fades in. Toggle locale → label switches to "↑ Back to top". Verify at mobile
  (375) + desktop (wrap behavior).
- Reduced motion: with `prefers-reduced-motion: reduce`, footer appears at final
  state; button still works.
- No regression to other sections.

## Implementation order

1. `site-footer.tsx` — `BackToTop` + `Reveal` + bilingual label.
2. Verify (tsc, export, bundle hygiene) + browser check + deploy.
