# Header Logo + Menu Animations Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Add the brand logo to the left of the name in the header, and animate the menu:
an animated underline on hover, an active-section highlight (scroll-spy), a header
entrance animation on load, and a logo hover micro-interaction.

## Base dependency

Builds on the interaction-polish header (PR #13): the header already uses
`AppButton` for the toggle/CTA and `scrollToAnchor`, and sections carry
`nativeID`s (`top`, `services`, `experience`, `projects`, `contact`). Implement on
a base that includes that work (merge #13 to `main` first, or branch from it).

## Decisions (agreed with user)

- Logo image (the rook) at 36×36, left of the name; hover micro-scale; clicking
  it scrolls to top.
- Menu animations: **all four** — underline-on-hover, scroll-spy active
  highlight, header entrance, logo hover.

## Assets

- Copy `~/Desktop/Portfolio_files/logo.png` → `assets/images/logo.png` (the rook,
  accent on dark). Bundled via `require`.

## Components

### `NavLink` — `src/features/portfolio/components/nav-link.tsx` (new)
- Renders the label + an accent **underline** bar beneath it. The underline uses
  `transform: [{ scaleX }]` with `transformOrigin: 'left'` and a web transition;
  `scaleX` is `1` when hovered OR active, else `0` (reveal-from-left).
- Text color: accent when active, `textMuted`→`text` on hover otherwise.
- Cursor pointer (web); `onPress` → `scrollToAnchor(anchor)`.
- Props: `{ label: string; anchor: string; active: boolean; onPress: () => void }`.

### `useActiveSection` — `src/features/portfolio/hooks/use-active-section.ts` (new)
- `useActiveSection(anchors: string[]): string | null`.
- Web only: an `IntersectionObserver` observes `document.getElementById(anchor)`
  for each anchor; tracks the entry with the largest intersection ratio near the
  top and returns its anchor. No-op on native / SSR (returns `null`).
- Cleans up the observer on unmount.

### `site-header.tsx` (modify)
- Wrap the header in an animated container (React Native `Animated`): on mount,
  fade `opacity` 0→1 and `translateY` −8→0 over ~500ms (`useNativeDriver: true`;
  reliable on web).
- Add the logo `<Image source={require('@/assets/images/logo.png')} />` (36×36,
  `borderRadius: 9`) before the name block, wrapped in a `Pressable` with a hover
  micro-scale (`transform: [{ scale: hovered ? 1.08 : 1 }]` + transition) and
  `onPress` → `scrollToAnchor('top')`.
- Replace the nav `HoverLink`s with `NavLink`s, passing `active = activeAnchor ===
  link.anchor`, where `activeAnchor = useActiveSection(nav.links.map(l => l.anchor))`.
- Keep the language toggle and CTA `AppButton`s unchanged.

## Animation implementation notes

- Web-only style props (`cursor`, `transformOrigin`, `transitionProperty`,
  `transitionDuration`) are applied under `Platform.OS === 'web'`, cast to
  `object` at the style boundary (same pattern as `src/ui/`).
- Entrance uses the built-in `Animated` API (not reanimated) to avoid web
  layout-animation flakiness.
- Scroll-spy observes the existing section `nativeID`s (no new ids needed).

## Error handling

- `useActiveSection` guards `window`/`IntersectionObserver`; missing elements are
  skipped; returns `null` when unavailable (no active highlight, no crash).
- Logo `Image` uses a bundled `require` (no network); if it fails, the name still
  renders.

## Verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds; `assets/images/logo.png`
  is bundled (referenced in the output); public bundle still excludes Firebase.
- Browser: logo shows left of the name and scales on hover; nav links reveal an
  underline on hover; the current section's link is highlighted while scrolling;
  the header fades/slides in on load.

## Implementation order

1. Copy the logo asset.
2. `NavLink` + `useActiveSection`.
3. `site-header.tsx`: logo + entrance + NavLinks wired to scroll-spy.
4. Verify (tsc, export, bundle hygiene) + browser check + deploy.
