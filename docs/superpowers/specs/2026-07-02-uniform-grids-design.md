# Uniform Grid Columns + Experience Spacing — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Match the approved mocks: in Impacto, Stack and Proyectos the last row of
cells/cards must keep the same column width as the rest (no stretching), with
Impacto showing a slightly lighter filler cell over the leftover space; and the
Experiencia timeline gets wider description lines and more vertical air between
entries. Public site only.

## Decisions (agreed with user)

- **Scope:** uniform columns in all three grid sections (Impacto, Stack,
  Proyectos); Impacto's leftover space rendered as a lighter filler cell.
- **Experiencia:** description `maxWidth 560 → 680` and entry spacing
  (`paddingBottom 34 → 48`).
- **Technique:** CSS Grid via the established web-only style cast
  (`Platform.OS === 'web' ? ({ … } as object) : null`), the same pattern already
  shipped for `boxShadow`/`transitionProperty`/`backgroundImage`. Existing flex
  props remain in place as the native/fallback layout.

## Non-goals

- No content, CMS, primitive, or hover/animation changes.
- No changes to Servicios (its `maxWidth: 560` cap already bounds the stretch),
  Proceso (4 items fill rows evenly) or Colaboración (3 items fill evenly).
- No breakpoint-specific manual widths.

## How CSS Grid interacts with the existing code

When a container gets `display: grid` (web), its children become grid items:
their `flexGrow`/`flexBasis`/`minWidth` are ignored on web but stay meaningful
for the native fallback (where the container keeps `flexDirection: 'row'`,
`flexWrap: 'wrap'`, `gap`). Children that use `width: '100%'` fill their grid
track. Grid also stretches items in a row to equal height (matches the mocks).

## 1. Impacto (`src/features/portfolio/sections/impact/impact-section.tsx`)

- Add a web-only grid cast:

```ts
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' } as object)
  : null;
const fillerWeb = Platform.OS === 'web' ? ({ gridColumn: 'auto / -1' } as object) : null;
```

- The hairline container keeps everything it has (`flexDirection: 'row'`,
  `flexWrap: 'wrap'`, `gap: 1`, `backgroundColor: colors.border`, `borderWidth`,
  `borderRadius: 18`, `overflow: 'hidden'`) and appends `gridWeb as object` to its
  style array.
- The `Reveal` wrappers keep `style={{ flexGrow: 1, flexBasis: 180, minWidth: 160 }}`
  (native fallback; ignored as grid items).
- **Filler cell:** after the mapped cells, append:

```tsx
{Platform.OS === 'web' ? (
  <View pointerEvents="none" style={[{ backgroundColor: '#101218' }, fillerWeb as object]} />
) : null}
```

  It spans the leftover columns of the last row (`auto / -1`), one shade lighter
  than the cells' `#0d0f13`, reproducing the mock. If a CMS edit makes the items
  fill the last row exactly, the filler lands on a new zero-height row (invisible
  sliver) — no breakage.

## 2. Stack (`src/features/portfolio/sections/stack/stack-section.tsx`)

- Grid cast on the cards row (which keeps `flexDirection/flexWrap/gap: 14`):

```ts
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' } as object)
  : null;
```

- `Reveal` wrappers keep `{ flexGrow: 1, flexBasis: 240, minWidth: 220 }` (native
  fallback). Cards already `width: '100%', flexGrow: 1` → they fill the track and
  stretch to equal row height. No filler (leftover space stays transparent, like
  the mock).

## 3. Proyectos (`src/features/portfolio/sections/projects/projects-section.tsx`)

- Same pattern with `minmax(300px, 1fr)` and the row keeping `gap: 16`:

```ts
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' } as object)
  : null;
```

- `Reveal` wrappers keep `{ flexGrow: 1, flexBasis: 340, minWidth: 300 }`
  (fallback). Cards keep `minHeight: 210` + bottom-pinned tags; grid gives equal
  heights per row.

## 4. Experiencia (`src/features/portfolio/sections/experience/experience-item.tsx`)

- Description `Text`: `maxWidth: 560` → `maxWidth: 680`.
- Entry row: `paddingBottom: 34` → `paddingBottom: 48`.
- Nothing else changes (node, pulse, hover, colors intact).

## Data flow

None — purely presentational. i18n unaffected.

## Error handling

- All web-only props are guarded by `Platform.OS === 'web'` and cast at the
  boundary (established pattern; these exact casts pass through react-native-web
  to the DOM, as verified in production with other pass-through props).
- Native fallback: containers keep flexWrap layout (current behavior) — no native
  regression.
- Impacto filler is `pointerEvents="none"` and empty — never interactive, never
  taller than its row.

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds; bundle hygiene
  unchanged.
- Browser (preview, desktop ~1280): Impacto shows equal-width cells with the
  lighter filler after `−45%`; Stack's second row (CLOUD/DATA/ARQUITECTURA) keeps
  first-row card width with empty space at right; Proyectos' second row (2 cards)
  keeps 3-column width. `preview_inspect`/`preview_eval` can assert
  `getComputedStyle(container).display === 'grid'` and compare card widths across
  rows (first-row card width ≈ last-row card width).
- Mobile (375): grids collapse to 1–2 columns cleanly (auto-fill handles it).
- Experiencia: description lines visibly longer (maxWidth 680) and more space
  between entries; timeline line still continuous.
- No regression to hovers/entrances (GlowCard/Reveal untouched).

## Implementation order

1. Impacto grid + filler.
2. Stack + Proyectos grids.
3. Experiencia spacing.
4. Verify (tsc/export/browser widths) + deploy.
