# Global Reach (Alcance Global) Section — Design

**Date:** 2026-07-03
**Status:** Approved (design)

## Goal

A new "Alcance global" section between Experiencia and Proyectos matching the
mock: heading + blurb, a row of 3 stat cards (3 continentes / 2 idiomas /
GMT-5), and a row of 3 detail cards (Dónde he colaborado, Idiomas with
progress bars, En equipos globales checklist). Fully CMS-managed, responsive
like every other section (auto-fit grids with `min(100%, Xpx)`).

## Decisions (agreed with user)

- Text-glyph icons: 🌐 (locations), 文A (languages), 👥 (teams) — no icon lib.
- Content key `globalReach`; tracked/anchor id `reach` (added to
  `recordVisit`'s SECTION_KEYS, function redeployed).
- Language bars use a CMS `percent` (0–100): Español 100, Inglés 55.
- EN locale fully translated (`local`→`on-site`, `remoto`→`remote`).

## Architecture

### Content model (`src/content/types.ts`, after `ExperienceContent`)

```ts
export type GlobalStat = { value: string; label: string };
export type GlobalLocation = { name: string; tag: string };
export type GlobalLanguage = { language: string; level: string; percent: number };
export type GlobalReachContent = {
  kicker: string;
  heading: string;
  blurb: string;
  stats: GlobalStat[];
  locationsHeading: string;
  locations: GlobalLocation[];
  languagesHeading: string;
  languages: GlobalLanguage[];
  teamHeading: string;
  teamItems: string[];
};
```

`PortfolioContent` gains `globalReach: GlobalReachContent;` between
`experience` and `projects`.

### Seed content

**ES**: kicker `alcance global`; heading `Experiencia nacional e
internacional`; blurb `He colaborado con equipos locales y distribuidos en
distintos países, culturas y zonas horarias, comunicándome con fluidez en
español e inglés. Del trabajo presencial en Ecuador a la colaboración remota
con clientes de América y Europa.`; stats `3`/`continentes`,
`2`/`idiomas de trabajo`, `GMT-5`/`base en Quito, Ecuador`;
locationsHeading `Dónde he colaborado`, locations Ecuador/`local`,
Latinoamérica/`remoto`, Estados Unidos/`remoto`, Europa/`remoto`;
languagesHeading `Idiomas`, languages Español/`Nativo`/100,
Inglés/`Intermedio · B1`/55; teamHeading `En equipos globales`, teamItems:
`Solapamiento horario con América (EST/PST) y Europa (CET)`, `Flujo remoto y
asíncrono, con dailies y demos en inglés`, `Documentación y code reviews
bilingües (ES/EN)`, `Adaptación a equipos multiculturales y husos distintos`.

**EN**: kicker `global reach`; heading `National and international
experience`; blurb `I've collaborated with local and distributed teams across
countries, cultures and time zones, communicating fluently in Spanish and
English. From on-site work in Ecuador to remote collaboration with clients
across America and Europe.`; stats `3`/`continents`, `2`/`working languages`,
`GMT-5`/`based in Quito, Ecuador`; locationsHeading `Where I've collaborated`,
locations Ecuador/`on-site`, Latin America/`remote`, United States/`remote`,
Europe/`remote`; languagesHeading `Languages`, languages Spanish/`Native`/100,
English/`Intermediate · B1`/55; teamHeading `On global teams`, teamItems:
`Time-zone overlap with America (EST/PST) and Europe (CET)`, `Remote, async
workflow with dailies and demos in English`, `Bilingual documentation and code
reviews (ES/EN)`, `Adaptation to multicultural teams and different time
zones`.

### Public section (`src/features/portfolio/sections/global-reach/global-reach-section.tsx`)

- `Container paddingVertical 56, nativeID="reach"`; `Reveal` + `SectionHeading`
  + blurb (16/26 `textMuted`, maxWidth 560, marginBottom 28 — collaboration
  pattern).
- **Stats row**: grid cast `repeat(auto-fit, minmax(min(100%, 260px), 1fr))`
  over `flexWrap gap 16`, `marginBottom 16`. Each stat = `GlowCard` (padding
  24, surface chrome `rgba(255,255,255,0.03)` bg / `rgba(255,255,255,0.09)`
  border / radius 18): value `fonts.displayBold` 34 `colors.accent`, label
  13.5 `colors.textMuted` marginTop 4. Reveal delay `140 + i*70`.
- **Detail row**: grid cast `repeat(auto-fit, minmax(min(100%, 320px), 1fr))`,
  same card chrome, Reveal delay `280 + i*70`. Each card starts with a header
  row (glyph 15 + title `fonts.display` 17 `colors.text`, gap 10,
  marginBottom 16).
  - **Locations** (🌐 + locationsHeading): one row per location (`gap 10,
    paddingVertical 6, alignItems center`): dot 6×6 accent, name 14.5
    `colors.text` flex 1, tag `fonts.mono` 11.5 `colors.textFaint`.
  - **Languages** (文A + languagesHeading): per language (gap 8,
    marginBottom 14): row with language `fonts.bodyMedium` 14.5 `colors.text`
    flex 1 + level `fonts.mono` 12 `colors.accent`; bar: track height 8
    `colors.surfaceStrong` radius 999 overflow hidden, fill
    `width: `${Math.max(0, Math.min(100, l.percent))}%`` accent.
  - **Team** (👥 + teamHeading): per item row (gap 8, alignItems baseline,
    marginBottom 10): `✓` accent 12.5 + text 13.5/20 `colors.textMuted`
    flex 1 (collaboration features pattern).

### Integration

- `portfolio-screen.tsx`: `<TrackedSection id="reach"><GlobalReachSection /></TrackedSection>`
  between experience and projects.
- `functions/src/index.ts`: `'reach'` in SECTION_KEYS (redeploy `recordVisit`).
- Admin: `src/admin/components/forms/global-reach-form.tsx` — Fields (kicker,
  heading, blurb multiline, locationsHeading, languagesHeading, teamHeading) +
  `ListEditor` stats (value/label) + `ListEditor` locations (name/tag) +
  `ListEditor` languages (language/level/percent — percent edited as text,
  parsed with `Number(t) || 0`) + `StringListEditor` teamItems. `SECTIONS`
  entry `{ key: 'globalReach', label: 'Alcance global' }` after Experiencia +
  `SectionForm` case.
- Validator: no change (same precedent as process/collaboration/testimonials).

### Data migration

- `scripts/migrate-global-reach.ts`: merge-only
  `set(doc('content', locale), { globalReach: seed.globalReach }, { merge: true })`
  for es/en; run with `npx tsx` (ADC fallback service-account.json).
- Patch `src/content/published/{es,en}.json` with the same object (scratchpad
  tsx script), verify insertion-only diff.

## Error handling

Static content; `percent` clamped 0–100 in the bar. Empty arrays render just
the card headers (same as other list sections).

## Testing / verification

- `npx tsc --noEmit`, `npm --prefix functions run build`,
  `npx expo export -p web`, bundle hygiene grep.
- Preview `/`: section after Experiencia (order experience → reach →
  projects), 3 stats + 3 cards, bars at 100%/55%, responsive at ~768px
  (2-col) and ~375px (1-col) via preview_resize.
- Deploy: `firebase deploy --only functions:recordVisit` + PR flow +
  `gh workflow run deploy.yml` + live bundle markers.

## Implementation order

1. Types + seeds. 2. Section + portfolio-screen + SECTION_KEYS. 3. Admin form
+ registry. 4. Migration + published JSON. 5. Verify + deploy.
