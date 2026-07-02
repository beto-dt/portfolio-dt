# Section Order (Colaboración after Cómo trabajo) + Logo Favicon — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Two small adjustments: the Colaboración section moves to sit immediately after
the "Cómo trabajo" (process) section, and the browser favicon becomes the site's
rook logo instead of the default Expo icon.

## Decisions (agreed with user)

- New page order: hero → services → **process → collaboration** → impact →
  stack → experience → projects → formation → contact → footer.
- Favicon: replace `assets/images/favicon.png` with the rook logo
  (`assets/images/logo.png`, 288×294) resized to 48×48 via `sips` (the ~2%
  aspect nudge is imperceptible at favicon sizes). `app.json` unchanged (already
  points at `./assets/images/favicon.png`).

## Non-goals

- No component, analytics, nav or content changes — one JSX line moves in
  `portfolio-screen.tsx`; `TrackedSection` ids keep working as-is.

## Changes

1. **`src/features/portfolio/portfolio-screen.tsx`** — move
   `<TrackedSection id="collaboration"><CollaborationSection /></TrackedSection>`
   from before the contact line to immediately after the process line.
2. **`assets/images/favicon.png`** — regenerate from the logo:
   `sips -z 48 48 assets/images/logo.png --out assets/images/favicon.png`.

## Error handling

None required — static asset + JSX reorder; `tsc` guards the reorder.

## Testing / verification

- `npx tsc --noEmit` + `npx expo export -p web` pass; `dist/favicon.ico`
  contains the new artwork (expo generates it from the configured favicon).
- Browser preview: section order shows Colaboración right after Proceso; the
  tab icon shows the yellow rook.
- Deploy + live check (favicon may need a hard refresh due to browser caching).

## Implementation order

1. Move the JSX line; 2. regenerate favicon; 3. verify + deploy.
