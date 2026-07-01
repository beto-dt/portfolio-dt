# Portfolio — Clean Architecture (Expo + Expo Router)

**Date:** 2026-06-30
**Status:** Approved (design)

## Goal

Rebuild the `Portfolio.html` mock as a clean, well-structured Expo application.
Replace the default Expo starter template under `src/` with a data-driven,
feature-first architecture. All folders and code identifiers in English.

## Decisions (agreed with user)

1. **Platform:** Web now, mobile later. Code is written with React Native
   primitives so it is multiplatform-ready, but only web is polished this phase
   (via `react-native-web`).
2. **Language:** Bilingual ES/EN with a real i18n system and a working toggle
   (the mock's "ES / en" button). Content lives in per-locale files.
3. **Scope this session:** Architecture + Hero + Services sections fully
   implemented. Remaining sections (Impact, Stack, Experience, Projects,
   Certifications, Contact) ship as typed content data + a component `TODO`,
   ready to replicate the established pattern.

## Non-goals

- No native (iOS/Android) polish this phase.
- No CMS/backend; content is static typed data.
- No unrelated refactors beyond removing the Expo starter template.

## Architecture — Feature-first

```
src/
  app/
    _layout.tsx            # root: font loading + ThemeProvider + I18nProvider
    index.tsx              # renders <PortfolioScreen/>
  theme/
    tokens.ts              # colors, spacing, radii, typography, font families
    theme-provider.tsx     # context + useTheme()
  i18n/
    locales.ts             # Locale = 'es' | 'en'
    i18n-provider.tsx      # locale state + useI18n() + toggleLocale()
    dictionary.ts          # binds es/en content, typed
  content/
    types.ts               # PortfolioContent + item types
    es.ts                  # Spanish content (must satisfy PortfolioContent)
    en.ts                  # English content (must satisfy PortfolioContent)
  features/portfolio/
    portfolio-screen.tsx   # ScrollView: header + sections
    components/
      site-header.tsx      # sticky nav + language toggle + CTA
      container.tsx        # max-width 1180 + horizontal padding
      section-heading.tsx  # "/ kicker  Heading"
      pill.tsx             # rounded badge/tag primitive
    sections/
      hero/hero-section.tsx
      services/
        services-section.tsx
        service-card.tsx
  components/ui/           # generic primitives (only if shared beyond portfolio)
```

## Data model (`content/types.ts`)

- `PortfolioContent`: `{ nav, hero, services, impact, stack, experience, projects, certifications, contact }`
- `HeroContent`: `{ availability, titleLead, titleAccent, subtitle, primaryCta, secondaryCta, stats: Stat[] }`
- `Stat`: `{ value, label }`
- `ServiceItem`: `{ index, tag, title, description }`
- `ImpactItem`: `{ value, label }`
- `StackGroup`: `{ category, items: string[] }`
- `ExperienceItem`: `{ period, location, current?: boolean, role, company, description }`
- `ProjectItem`: `{ category, title, description, tech: string[] }`
- `Certification`: `{ name, issuer }`
- `ContactContent`: `{ kicker, heading, blurb, email, socials: { label, url }[] }`
- `NavContent`: `{ links: { label, anchor }[], cta }`

`es.ts` and `en.ts` both export `const content: PortfolioContent`, guaranteeing
translation parity at compile time.

## Theme tokens (`theme/tokens.ts`)

Derived from the mock:
- **accent:** `#e4e357`
- **background:** `#0a0b0e`; surfaces: subtle white overlays (`rgba(255,255,255,0.02–0.05)`)
- **text:** primary `#f4f5f7`, muted `rgb(183,188,197)`, dim `rgb(154,160,170)`,
  fainter `rgb(139,144,154)`, faint `rgb(107,114,128)`
- **fonts:** display = Space Grotesk, body = IBM Plex Sans, mono = JetBrains Mono
  (already installed via `@expo-google-fonts/*`)
- **spacing / radii:** scale tokens instead of magic numbers.

## Clean-code principles

- **Data-driven:** sections render from `content`, no hardcoded copy in components.
- **Centralized theme:** no magic colors/sizes in components; all from tokens.
- **One file, one purpose:** each section and card in its own small file.
- **Strict typing:** content types enforce shape and ES/EN parity.
- **RN primitives only:** `View`/`Text`/`Pressable`/`ScrollView` + `StyleSheet`
  so the code is multiplatform-ready.

## Cleanup

Remove the Expo starter template: `app/explore.tsx`, `app/(tabs)` if any,
`components/app-tabs*.tsx`, `themed-text.tsx`, `themed-view.tsx`,
`hint-row.tsx`, `web-badge.tsx`, `animated-icon*`, `external-link.tsx`,
`components/ui/collapsible.tsx`, `hooks/use-color-scheme*`, and the default
`constants/theme.ts`. Keep `src/global.css` (update font vars if needed).

## Verification

- `npx tsc --noEmit` passes (types + ES/EN parity).
- `npm run web` renders Hero + Services matching the mock (dark theme, accent,
  fonts, layout) with a working ES/EN toggle.
- Responsive: readable on narrow and wide viewports.

## Implementation order

1. Theme tokens + provider.
2. i18n provider + locales.
3. Content types + full ES/EN data.
4. Shared portfolio components (container, section-heading, pill, site-header).
5. Hero section.
6. Services section + card.
7. `portfolio-screen` + `app/_layout` + `app/index` wiring; remove starter files.
8. Verify (tsc + web).
