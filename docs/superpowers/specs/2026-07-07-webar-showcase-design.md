# WebAR Showcase — "Míralo en tu espacio" — Design

**Date:** 2026-07-07
**Status:** Approved (design)

## Goal

A new home-page section with an interactive 3D viewer of Luis's rook logo.
Desktop visitors rotate/zoom it with the mouse; mobile visitors tap **"Ver en
AR"** and place the rook in their real space (Scene Viewer on Android, Quick
Look on iOS) — no app install. It demos the AR service line with the site
itself.

## Decisions (agreed with user)

- **Model**: the rook logo in 3D, **generated procedurally** by a committed
  script (no Sketchfab, no licenses) — accent-yellow low-poly, `.glb` under
  ~100 KB.
- **Placement**: home page, between `HeroSection` and `ServicesPreview`.
- **Scope**: MVP only — viewer + AR button + orbit controls + loading state +
  fallback. Hotspots and AR-activation analytics stay for a later iteration.
- **Level**: `<model-viewer>` (Google) only. No Three.js / R3F — model-viewer
  already covers auto-rotate, orbit, AR modes, shadows and progress UI, and it
  coexists cleanly with react-native-web.
- UI strings hardcoded ES/EN in-component (same convention as blog chrome).

## Architecture

### Asset pipeline

- `scripts/generate-rook.py` (python3 + trimesh, already installed): builds
  the rook from boxes matching the logo's geometry — base slab, body, top slab,
  3 merlons — centered at origin, real-world scale ~0.25 m tall (sensible AR
  size on a desk). Two-tone PBR: accent `#e4e357` body (roughness ≈ 0.5,
  metallic 0), near-black `#17181c` base. Exports `public/models/rook.glb`.
  Script is committed for reproducibility.
- **iOS**: `public/models/rook.usdz` — Luis converts the `.glb` with **Reality
  Converter** (drag in → export, ~1 min) and drops the file in
  `public/models/`. Until it exists, iOS shows the 3D viewer without the AR
  button (model-viewer degrades gracefully); Android AR works from day one.

### Vendor script (self-hosted)

- `public/vendor/model-viewer.min.js` — official minified ES-module build
  (v4.x) downloaded once and committed (consistent with self-hosting photos/og;
  no runtime CDN dependency).
- Loaded **lazily**: the section component injects
  `<script type="module" src="/vendor/model-viewer.min.js">` in a `useEffect`
  on mount (guarded by `customElements.get('model-viewer')` so it loads once).
  Zero impact on first paint; not part of the Metro bundle.

### Section component

`src/features/portfolio/sections/ar/ar-showcase.tsx`:

- `Container` + `Reveal` + `SectionHeading` (kicker `ar demo` / heading ES
  "Míralo en tu espacio" · EN "See it in your space") + one support line ES
  "Gira la torre, hazle zoom — y desde tu móvil tócala con 'Ver en AR' para
  ponerla en tu escritorio. Sin instalar nada." (EN equivalent). Locale via
  `useI18n().locale`.
- The viewer: `unstable_createElement('model-viewer', {...})` from
  `react-native-web`, rendered only when `Platform.OS === 'web'` (the site is
  web-only; the guard keeps tsc/native-safe). Attributes:
  `src="/models/rook.glb"`, `ios-src="/models/rook.usdz"`, `ar`,
  `ar-modes="webxr scene-viewer quick-look"`, `camera-controls`,
  `auto-rotate`, `auto-rotate-delay=0`, `shadow-intensity="1"`,
  `touch-action="pan-y"` (page still scrolls on mobile), `loading="lazy"`,
  inline style `width:100%; height:460px; background:transparent`.
- Card chrome matching the site: wrapper `View` with `borderWidth 1`,
  `colors.border`, `borderRadius 24`, subtle surface background, overflow
  hidden.
- AR button styling via the `slot="ar-button"` child (an accent pill "Ver en
  AR ↗" / "View in AR ↗") so it matches `AppButton` visuals instead of the
  default white chip. Progress bar recolored to accent via the documented CSS
  custom properties / part attributes where possible; otherwise default is
  acceptable for MVP.
- TypeScript: `model-viewer` props typed as a local `Record<string, unknown>`
  cast (no @types dependency).

### Fallbacks / error handling

- No WebGL / element fails to define → model-viewer shows nothing: wrapper
  keeps a static rook glyph + caption behind the viewer (`position absolute`)
  so the card never renders empty.
- No AR support (desktop, iOS without usdz) → model-viewer hides the AR
  button automatically; the 3D orbit viewer remains.
- Script 404 / offline → section shows the static fallback; page unaffected.

### Integration

- `HomePage`: `<TrackedSection id="ar"><ArShowcase /></TrackedSection>`
  between hero and `ServicesPreview`.
- `functions/src/index.ts`: add `'ar'` to `SECTION_KEYS`; redeploy
  `functions:recordVisit`. Admin metrics view: add the label for the `ar` key
  if labels are mapped explicitly (checked at plan time).
- No CMS/content-model changes; no Firestore changes beyond the section key.

## Bundle hygiene

model-viewer stays **out** of the JS bundle (vendor file + runtime injection).
Golden-rule grep must still show only the firebase-client chunk. New check:
`rook.glb` served with the image/static cache rule? — `.glb` is not in the
image extension list, so it inherits `**` → `no-cache`. Add `glb|usdz` to a
static-assets header rule in `firebase.json` (`public, max-age=604800`, same
as images) so the model isn't re-downloaded every visit; the vendor `.js`
under `/vendor/**` gets the same 1-week rule (it's versioned rarely; no-cache
would refetch ~1 MB per view).

## Testing / verification

- `npx tsc --noEmit`, export, bundle-hygiene grep (firebase AND
  `model-viewer` absent from Metro chunks).
- Preview (desktop): section renders under hero, model loads (canvas present
  in snapshot), orbit works, no console errors; static fallback hidden once
  loaded.
- Verify exported HTML serves `/models/rook.glb` and `/vendor/model-viewer.min.js`.
- Live after deploy: headers for `.glb`/vendor (604800), page still no-cache;
  **real-device test by Luis**: Android → Scene Viewer opens; iPhone → Quick
  Look opens (once `rook.usdz` is in place).

## Implementation order

1. `scripts/generate-rook.py` → `rook.glb` (+ preview render sanity check).
2. Vendor download + `firebase.json` cache rule.
3. `ArShowcase` component + home wiring + tracking key.
4. Verify (tsc/export/hygiene/preview) + PR.
5. Deploy (hosting + `functions:recordVisit`) + live verification; Luis
   converts/drops `rook.usdz` (follow-up commit if not ready at PR time).
