# Portfolio v2 — Phase 2: Home Services Preview + CTA Band — Design

**Date:** 2026-07-06
**Status:** Approved (design)

## Goal

Complete the v2 Inicio screen: below the hero, a **preview of the first 3
services** with a "Ver todos los servicios →" link to `/servicios`, then the
**CTA band** ("¿Listo para llevar tu idea a producción?") with the primary CTA
button navigating to `/contacto`. Both pieces match the design's markup and are
fully CMS-managed.

## Decisions

- Preview reuses the existing `ServiceCard` (same chrome + "Solicitar este
  servicio" CTA, which already navigates cross-route) — the design's home cards
  are the same cards.
- New CMS strings live on existing sections (no new section key): `services`
  gains `seeAllCta`; `hero` gains `ctaBandTitle` and `ctaBandSub`. The band's
  button label reuses `hero.primaryCta.label` (as the design does).
- Section tracking: the preview + band render inside the existing home
  `TrackedSection id="hero"` page — no new SECTION_KEYS (the real `services`
  section is tracked on `/servicios`).

## Architecture

### `src/features/portfolio/sections/hero/services-preview.tsx` (new)

- Heading row (design: baseline flex): `SectionHeading kicker={services.kicker}
  heading={services.heading}` on the left; right side (marginLeft auto):
  `HoverLink`-style mono accent link `{services.seeAllCta} →` → arrow shifts on
  hover (same pattern as the ServiceCard CTA), `onPress → goToSection('services')`.
  On wrap (narrow) the link falls under the heading.
- Grid: first **3** items of `services.items`, same grid pattern as
  services-section (`flexWrap gap 16` + web grid `repeat(auto-fit,
  minmax(min(100%, 300px), 1fr))`), each in `Reveal delay={i*70}` with
  `<ServiceCard item={item} requestCta={services.requestCta} />`.
- Container `paddingVertical 40` (sits between hero and band).

### `src/features/portfolio/sections/hero/cta-band.tsx` (new)

Design markup translated to RN (v2 §HOME · CTA BAND):

- Container: `Container paddingVertical` 30 top / 60 bottom; inner card:
  `borderRadius 24, borderWidth 1, borderColor 'rgba(228,227,87,0.28)',
  backgroundColor 'rgba(255,255,255,0.02)', paddingVertical 64,
  paddingHorizontal 40, alignItems center` + web cast `backgroundImage:
  'radial-gradient(700px 300px at 50% -30%, rgba(228,227,87,0.16),
  transparent 70%)'`, `overflow: 'hidden'`.
- Title: `fonts.display` 34 (28 under 640), `letterSpacing -0.6`, center,
  `maxWidth 560` — `hero.ctaBandTitle`.
- Sub: 15.5/25, `#b7bcc5`, center, `maxWidth 620`, marginTop 14 —
  `hero.ctaBandSub`.
- Button (marginTop 30): `AppButton label={hero.primaryCta.label}
  variant="primary" onPress={() => goToSection('contact')}`.
- Wrapped in `Reveal`.

### Home page

`home-page.tsx` renders inside the existing PageShell/TrackedSection:

```tsx
<TrackedSection id="hero"><HeroSection /></TrackedSection>
<ServicesPreview />
<CtaBand />
```

### CMS

- `ServicesContent` gains `seeAllCta: string` (ES `Ver todos los servicios`,
  EN `See all services`).
- `HeroContent` gains `ctaBandTitle: string` (ES `¿Listo para llevar tu idea a
  producción?`, EN `Ready to take your idea to production?`) and
  `ctaBandSub: string` (ES `Cuéntame tu proyecto y agenda una llamada gratuita
  de 30 minutos. Respondo en menos de 24 h.`, EN `Tell me about your project
  and book a free 30-minute call. I reply within 24 h.`).
- Admin: `services-form` gains `seeAllCta` Field; `hero-form` gains
  `ctaBandTitle` + `ctaBandSub` Fields.
- Migration `scripts/migrate-v2-home.ts`: drift-check, then merge
  `{ hero: seed.hero, services: seed.services }` for es/en + published patch.

## Error handling

None new — static content and existing navigation helpers.

## Testing / verification

- tsc + export + hygiene.
- Preview `/`: hero → 3 service cards (01–03) → "Ver todos los servicios →"
  navigates to `/servicios`; card CTAs still intent+navigate to `/contacto`;
  CTA band renders with accent-tinted border/glow and its button lands on
  `/contacto`; mobile 375 single column, no overflow.
- Live after deploy: markers `¿Listo para llevar tu idea a producción?`,
  `Ver todos los servicios` in bundle; band visible on `/`.

## Implementation order

1. Types + seeds + admin fields. 2. ServicesPreview + CtaBand + home wiring.
3. Migration + published. 4. Verify + deploy.
