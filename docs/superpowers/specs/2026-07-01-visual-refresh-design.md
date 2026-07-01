# Visual Refresh (match reference design) Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Bring the live portfolio up to the updated reference design: add a **Descargar CV**
button in the hero, a new **Educación** section (studies + languages), a
**redesigned Contact** section (email + WhatsApp + a contact-details grid), and a
**footer**. All new content is editable from `/admin` and stored in Firestore.

The visual STYLE (dark theme, yellow accent, Space Grotesk / IBM Plex Sans /
JetBrains Mono, cards) is unchanged — this phase is additive.

## Decisions (agreed with user)

- Implement all four deltas: CV button, Education section, redesigned Contact,
  footer.
- New content is **editable in `/admin`** (types + Firestore + admin forms).
- CV hosted at `/cv.pdf` (the file `LuisAlbertoDeLaTorreDuranCVActualizado.pdf`).
- WhatsApp `+593979906532`; phone shown as `+593 97 990 6532`; location
  `Quito, Ecuador`; LinkedIn `https://www.linkedin.com/in/luis-alberto-de-la-torre-duran-752569141/`.

## Non-goals

- No restyle of the existing sections; no `/admin` visual change beyond the new
  forms.
- Certifications content stays as-is (editable in `/admin`; not part of this
  phase's code).

## Content model changes (`src/content/types.ts`)

- **HeroContent**: add `cvLabel: string`, `cvUrl: string`.
- **New** `EducationItem = { title: string; institution: string; period: string }`.
- **New** `LanguageItem = { language: string; level: string }`.
- **New** `EducationContent = { kicker: string; heading: string; items: EducationItem[]; languagesHeading: string; languages: LanguageItem[] }`.
- **ContactContent** restructured to:
  `{ kicker, heading, blurb, emailCta, whatsappCta, email, phone, whatsapp, linkedin, location }`
  (removes the old `cta` and `socials`).
- **New** `FooterContent = { copyright: string; tagline: string }`.
- **PortfolioContent**: add `education: EducationContent` and `footer: FooterContent`.
- `src/content/validate.ts`: add `education`, `footer` to `REQUIRED_KEYS`.

## New/changed content (both locales)

### Hero (add)
- ES: `cvLabel: "Descargar CV"`, `cvUrl: "/cv.pdf"`.
- EN: `cvLabel: "Download CV"`, `cvUrl: "/cv.pdf"`.

### Education
Items (same in both locales; titles kept, headings localized):
1. Maestría en Big Data con mención en Inteligencia Artificial — Universidad Regional Autónoma de los Andes — 06/2026 — Presente
2. Ingeniería en Sistemas — Universidad Regional Autónoma de los Andes — 01/2014 — 01/2019
3. Máster en Arquitectura de Microservicios con Contenedores Docker — Lite Thinking — 07/2024
4. Diplomado en Arquitectura Empresarial Moderna — Lite Thinking — 08/2025 — Presente
5. AI Assisted Programming Bootcamp — Dojo Coding — 08/2025 — Presente

- ES: `kicker: "academia"`, `heading: "Educación"`, `languagesHeading: "Idiomas"`,
  languages `[{Español, Nativo}, {Inglés, Avanzado}]`.
- EN: `kicker: "academics"`, `heading: "Education"`, `languagesHeading: "Languages"`,
  languages `[{Spanish, Native}, {English, Advanced}]`.

### Contact
- ES: `kicker: "contacto"`, `heading: "¿Tienes un proyecto en mente? Hablemos."`,
  `blurb: "Estoy disponible para proyectos freelance y colaboraciones. Cuéntame qué quieres construir y te respondo en menos de 24 horas."`,
  `emailCta: "Escríbeme un email"`, `whatsappCta: "WhatsApp"`.
- EN: `kicker: "contact"`, `heading: "Got a project in mind? Let's talk."`,
  `blurb: "I'm available for freelance projects and collaborations. Tell me what you want to build and I'll reply within 24 hours."`,
  `emailCta: "Send me an email"`, `whatsappCta: "WhatsApp"`.
- Both: `email: "luis.atorred24@gmail.com"`, `phone: "+593 97 990 6532"`,
  `whatsapp: "593979906532"`,
  `linkedin: "https://www.linkedin.com/in/luis-alberto-de-la-torre-duran-752569141/"`,
  `location: "Quito, Ecuador"`.

### Footer
- ES: `copyright: "© 2026 Luis De La Torre Duran"`, `tagline: "Diseñado y desarrollado con precisión."`.
- EN: same copyright, `tagline: "Designed and developed with precision."`.

## Public site (`src/features/portfolio/`)

- **Hero**: third action, a "Descargar CV" outline button linking to `hero.cvUrl`
  (opens in a new tab via `Linking.openURL`).
- **`sections/education/education-section.tsx`** (new): `SectionHeading` +
  a studies list (title / institution / period) and a small "Idiomas" block
  (language · level), matching the reference layout. Rendered after
  Certifications.
- **`sections/contact/contact-section.tsx`** (rewrite): heading + blurb, two
  buttons — **email** (`mailto:`) and **WhatsApp** (`https://wa.me/<whatsapp>`) —
  and a details grid (EMAIL · TELÉFONO · LINKEDIN · UBICACIÓN), the LinkedIn/email
  being tappable.
- **`components/site-footer.tsx`** (new): copyright + tagline row at the bottom of
  `portfolio-screen`.
- `portfolio-screen.tsx`: add `<EducationSection/>` (after certifications) and
  `<SiteFooter/>` (after contact), each wrapped in `<TrackedSection>` where it
  makes sense (education tracked as `"education"`; footer not tracked).

## Admin (`src/admin/`)

- **`components/forms/education-form.tsx`** (new): kicker, heading, items list
  (title/institution/period), languagesHeading, languages list (language/level).
- **`components/forms/footer-form.tsx`** (new): copyright, tagline.
- **`components/forms/contact-form.tsx`** (rewrite): the new contact fields.
- **`components/forms/hero-form.tsx`**: add `cvLabel`, `cvUrl` fields.
- `screens/admin-screen.tsx`: add `education` and `footer` to `SECTIONS` and the
  `SectionForm` switch.

## Firestore migration (non-destructive)

- `scripts/migrate-visual-refresh.ts` (run via tsx): for `content/es` and
  `content/en`, `update()` with: full new `contact` object, new `education`
  object, new `footer` object, and dotted `hero.cvLabel` / `hero.cvUrl`. Using
  `update()` (not seed) preserves all other edited sections. Run once.
- Update `src/content/seed/{es,en}.ts` to the full new shape (repo truth).
- `npm run content:pull` regenerates `src/content/published/{es,en}.json`.

## CV asset

- Copy the CV PDF to `public/cv.pdf` (Expo web export copies `public/` to the site
  root; verified in the plan). The hero button links to `/cv.pdf`.

## Error handling

- Missing `cvUrl` → button still renders but is harmless; validate presence in the
  form.
- Contact links guard against empty values (skip a detail row if its value is
  empty).
- Analytics/tracking unaffected.

## Verification

- `npx tsc --noEmit` passes; ES/EN seed satisfies the new `PortfolioContent`.
- `npx expo export -p web` builds; `dist/cv.pdf` exists (public/ copied); public
  home still excludes Firebase.
- After migration + pull: `content/es`/`en` in Firestore have education/footer and
  the new contact; published JSON matches.
- Live: hero shows Descargar CV (downloads the PDF); Educación renders; Contact
  shows email + WhatsApp + details; footer present; ES/EN toggle localizes all.
- `/admin`: Educación, Footer, and the updated Contact/Hero forms edit and save.

## Implementation order

1. Types + validator; seed ES/EN updated to the new shape.
2. Public: hero CV button, EducationSection, ContactSection rewrite, SiteFooter,
   portfolio-screen wiring; `public/cv.pdf`.
3. Admin: education-form, footer-form, contact-form rewrite, hero cv fields,
   admin-screen SECTIONS/switch.
4. Firestore migration script + run; `content:pull`; commit published JSON.
5. Verify (tsc, export incl. cv.pdf, bundle hygiene) + deploy + live check.
