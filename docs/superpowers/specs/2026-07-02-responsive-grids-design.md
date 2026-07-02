# Responsive Grids (Contact Wizard + All Sections) — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

The Contacto card (booking wizard) must be fully responsive on narrow screens.
Root cause: CSS grid tracks declared as `minmax(Xpx, 1fr)` cannot shrink below
X, so containers narrower than X overflow horizontally. Same latent bug in
Formación (460px) and Proyectos (300px). Also the contact card's fixed
`padding: 44` wastes too much width on phones.

## Decisions (agreed with user)

- Apply the standard CSS guard to ALL six section grids:
  `repeat(auto-fit|auto-fill, minmax(min(100%, Xpx), 1fr))` — the track shrinks
  to the container width when it is narrower than X. Files/values:
  - `contact-section.tsx` — 380 (auto-fit)
  - `formation-section.tsx` — 460 (auto-fit)
  - `projects-section.tsx` — 300 (auto-fill)
  - `process-section.tsx` — 230 (auto-fill)
  - `stack-section.tsx` — 240 (auto-fill)
  - `impact-section.tsx` — 160 (auto-fill)
- Contact card becomes width-aware via `useWindowDimensions`:
  `padding: width < 640 ? 22 : 44`, `borderRadius: width < 640 ? 18 : 24`.

## Non-goals

- No layout redesign; inner content (inputs, chips, calendar, slots) already
  wraps/flows correctly once the track can shrink.
- No breakpoint additions elsewhere.

## Error handling / risk

One-line CSS string changes (pass-through casts, same mechanism in prod) plus a
standard RN hook. `min()` inside `minmax()` is broadly supported CSS.

## Testing / verification

- `npx tsc --noEmit` + `npx expo export -p web` pass.
- Preview measured at 360/375/577/1280: no horizontal overflow
  (`document.scrollingElement.scrollWidth <= innerWidth` and the contact card's
  `getBoundingClientRect().right <= innerWidth`); wizard usable at 360 (inputs,
  chips, calendar 7 columns, slots); desktop 2-column layouts unchanged at 1280.
- Deploy + live check.

## Implementation order

1. Six grid one-liners + contact padding hook. 2. Verify + deploy.
