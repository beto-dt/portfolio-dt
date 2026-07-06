# Portfolio v2 — Phase 3: Visual Polish — Design

**Date:** 2026-07-06
**Status:** Approved (design)

## Goal

Close the visual gap with the v2 design: scroll progress bar, ambient radial
background glows, compact mobile header, icon-only mobile WhatsApp FAB. No
CMS/functions/data changes.

## Architecture

### `src/features/portfolio/components/scroll-progress.tsx` (new)

`ScrollProgress({ progress })` — `progress` is 0..1 state owned by PageShell:

- Bar: `position fixed (web cast), top 0, left 0, height 3, zIndex 60,
  backgroundColor colors.accent, width: `${progress * 100}%`` + web casts
  `boxShadow '0 0 12px rgba(228,227,87,0.6)'`, `transitionProperty 'width'`,
  `transitionDuration '100ms'` (design: `[data-progress]`).

### `PageShell` changes

- State `const [progress, setProgress] = useState(0)`; ScrollView gains
  `onScroll` (`scrollEventThrottle={16}`):

```tsx
onScroll={(e) => {
  const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
  const max = contentSize.height - layoutMeasurement.height;
  setProgress(max > 0 ? Math.min(1, Math.max(0, contentOffset.y / max)) : 0);
}}
```

- Renders `<ScrollProgress progress={progress} />` after `<DockNav />`.
- Root `View` gains the ambient web cast (design root background):

```ts
const ambientWeb = Platform.OS === 'web'
  ? ({
      backgroundImage:
        'radial-gradient(1200px 600px at 78% -8%, rgba(228,227,87,0.12), transparent 70%), ' +
        'radial-gradient(900px 500px at 8% 12%, rgba(228,227,87,0.07), transparent 65%)',
    } as object)
  : null;
```

  applied as `style={[{ flex: 1, backgroundColor: colors.background }, ambientWeb as object]}`.

### `SiteHeader`

`useWindowDimensions`; `paddingHorizontal: width < 760 ? 20 : 40`.

### `WhatsAppFab`

Design hides the label under 760px (`[data-fab-label]{display:none}`): the
existing `narrow` const (width < 640) changes to `width < 760` and the
`WhatsApp` `<Text>` renders only when `!narrow`; keep icon + pulse + bottom 96.

## Testing / verification

- tsc + export + hygiene.
- Preview desktop: glows visible on the root, progress bar grows on scroll
  (check `width` style at bottom ≈ 100%), header 40px padding.
- Preview mobile 375 (fresh load): header 20px padding, FAB circular without
  label above the dock, progress bar works, no overflow.
- Flows sanity: dock nav + one intent flow still OK. Live check post-deploy.

## Implementation order

1. ScrollProgress + PageShell (progress + ambient). 2. Header + FAB tweaks.
3. Verify + deploy.
