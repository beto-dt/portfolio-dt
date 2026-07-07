# AR Demo: Projects Card + Modal — Design

**Date:** 2026-07-07
**Status:** Approved (design)

## Goal

Move the WebAR demo (shipped in PR #49/#50) from the home page to `/proyectos`:
a new project card ("Demo interactivo") opens a modal with the existing 3D/AR
viewer. Home returns to hero → services preview → CTA band.

## Decisions (agreed with user)

- Home: `ArShowcase` section removed entirely.
- `/proyectos`: the demo card renders **first** in the projects grid, with the
  same `GlowCard` chrome as CMS project cards. Texts hardcoded ES/EN
  in-component (blog-chrome convention); no CMS/content-model change.
- Click → **modal** with the full viewer (auto-rotate, orbit/zoom, "Ver en AR"
  via Scene Viewer/Quick Look — both work from a modal), close via ✕ button,
  backdrop press and Escape.
- Analytics: `markSectionSeen('ar')` fires **when the modal opens** (real
  interest, not scroll-by). The `'ar'` key is already live in `recordVisit` —
  no functions change, no deploy of functions needed.
- Vendor script now loads only when the modal first opens — home is back to
  zero AR overhead.

## Architecture

### Components (in `src/features/portfolio/sections/ar/`)

- **`ar-viewer.tsx` — `ArViewer`**: extraction of the viewer internals from
  the current `ar-showcase.tsx`, unchanged behavior: lazy script injection
  (`ensureModelViewerScript`), `unstable_createElement('model-viewer', ...)`
  (eager loading, ar-modes, camera-controls, auto-rotate, shadow, styled
  slot ar-button), ♜ placeholder hidden by polling `loaded` via host-View
  ref. Fills its parent (`flex: 1`); locale-aware AR-button label via
  `useI18n`. The T strings it needs (arButton) live here.
- **`ar-demo-card.tsx` — `ArDemoCard`**: owns modal open/close state.
  Renders:
  - The card: `ProjectCard` reused via new optional props (below), with a
    local ES/EN `T`: category `DEMO INTERACTIVO` / `INTERACTIVE DEMO`, title
    `Realidad Aumentada en tu navegador` / `Augmented Reality in your
    browser`, description (torre 3D + "Ver en AR" sin instalar nada, modelo
    procedural), tech tags `['WebAR', '3D', 'model-viewer', 'Scene Viewer',
    'Quick Look']`, CTA `Abrir demo ↗` / `Open demo ↗`.
  - The modal: RN `Modal` (`transparent`, `animationType="fade"`,
    `onRequestClose` closes — covers Android back & web Escape). Backdrop
    `Pressable` (rgba(0,0,0,0.72)) closes; content card centered, `width
    '92%'`, `maxWidth 900`, height `min(78% of window, 640)`, site chrome
    (border, radius 24, background `#0d0e11`), header row (title + ✕
    `Pressable` hover accent) above the `ArViewer`.
  - On open: `setOpen(true)` + `markSectionSeen('ar')`.
- **`ar-showcase.tsx`**: deleted.

### `ProjectCard` extension (`projects/project-card.tsx`)

Optional props, backward compatible: `onPress?: () => void` and
`cta?: string`. When `onPress` is set, the `GlowCard` is wrapped in a
`Pressable` (web cursor pointer); when `cta` is set, an accent arrow-label row
renders after the tech tags (mono 12, accent, same visual language as
`ArrowLink`). CMS cards keep rendering exactly as today (props absent).

### Wiring

- `home-page.tsx`: remove `<TrackedSection id="ar"><ArShowcase /></TrackedSection>`
  and the import (home = hero, services preview, CTA band).
- `projects-section.tsx`: render `<ArDemoCard />` as the first grid item
  (`Reveal delay={0}`, same `flexGrow/flexBasis/minWidth` wrapper as the
  mapped cards; CMS items shift to `delay={(i + 1) * 70}`).

### Unchanged

`rook.glb`/`rook.usdz`, `public/vendor/model-viewer.min.js`, cache headers,
`SECTION_KEYS` ('ar' stays), generator scripts.

## Error handling

- Same viewer fallbacks as before (placeholder if the element never loads).
- Modal unmounts its content on close (`visible={false}`) — the injected
  script stays cached; reopening is instant.
- No-JS/crawler: card renders as static text; modal simply never opens.

## Testing / verification

- `npx tsc --noEmit`, export, bundle-hygiene grep (unchanged expectations).
- Preview desktop: home has NO ar section; `/proyectos` shows the demo card
  first; click → modal with the rook rendering (canvas + `loaded`), ✕ /
  backdrop / Escape close it; no console errors.
- Preview mobile 375: modal fits, page doesn't scroll horizontally.
- Live after deploy (hosting only): `/proyectos` card + modal; AR buttons on
  real devices unchanged (same viewer).

## Implementation order

1. `ArViewer` extraction + `ProjectCard` props.
2. `ArDemoCard` (card + modal) + wiring (projects in, home out) + delete
   `ar-showcase.tsx`.
3. Verify (tsc/export/hygiene/preview) + PR.
4. Deploy hosting + live check.
