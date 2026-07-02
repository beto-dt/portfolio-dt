# New Content Sections (Hero Clients + Process + Collaboration) — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Add three new content pieces from the approved mock, fully integrated with the
Firestore CMS pipeline: a "clients/sectors" chip row under the hero stats, a
"Cómo trabajo / Un proceso claro, sin sorpresas" section (4 steps), and a
"Colaboración / Modelos para trabajar juntos" section (3 model cards, one
highlighted as POPULAR). Bilingual (ES/EN), editable from `/admin`.

## Decisions (agreed with user)

- **Scope:** all three pieces (hero clients chips, Process section, Collaboration
  section).
- **CMS:** full pipeline — types + seed + Firestore migration + published JSON +
  admin forms (same pattern as the visual refresh).
- **Collaboration CTAs:** all three buttons smooth-scroll to `#contact`
  (`scrollToAnchor('contact')`).
- **Page order:** …Hero → Servicios → **Proceso** → Impacto → Stack → Experiencia →
  Proyectos → Certificaciones → Educación → **Colaboración** → Contacto → Footer.

## Non-goals

- No nav changes (nav keeps Servicios/Experiencia/Proyectos).
- No new UI primitives (reuse `Reveal`, `GlowCard`, `Pill`, `AppButton`,
  `SectionHeading`, `scrollToAnchor`).
- No analytics/functions/rules changes (`TrackedSection` works with arbitrary ids).

## 1. Content model (`src/content/types.ts`)

`HeroContent` gains two fields:

```ts
clientsHeading: string;  // "Empresas y sectores donde he entregado"
clients: string[];       // ["Banca · Produbanco", "E-commerce · Acid Labs", ...]
```

New types:

```ts
export type ProcessStep = { number: string; title: string; description: string };
export type ProcessContent = { kicker: string; heading: string; steps: ProcessStep[] };

export type CollaborationModel = {
  tag: string;            // "ALCANCE CERRADO" / "MENSUAL" / "ESTRATÉGICO"
  title: string;          // "Proyecto llave en mano"
  description: string;
  features: string[];     // checklist lines
  cta: string;            // button label
  popular?: boolean;      // highlighted card + POPULAR badge
};
export type CollaborationContent = { kicker: string; heading: string; blurb: string; models: CollaborationModel[] };
```

`PortfolioContent` gains `process: ProcessContent` and
`collaboration: CollaborationContent`.

### Seed content (ES, from the mock; EN translated)

- **Hero ES:** `clientsHeading: "Empresas y sectores donde he entregado"`,
  `clients: ["Banca · Produbanco", "E-commerce · Acid Labs", "IoT · Audax",
  "Telecom · Smartisp", "Salud · HL7/FHIR", "AR/VR · Unity"]`.
  EN: `"Companies and sectors I've delivered for"`, same chips (proper nouns stay).
- **Process ES:** kicker `"cómo trabajo"`, heading `"Un proceso claro, sin
  sorpresas"`, steps 01 Descubrimiento / 02 Arquitectura / 03 Desarrollo /
  04 Entrega & soporte with the mock descriptions. EN: kicker `"how I work"`,
  heading `"A clear process, no surprises"`, translated steps.
- **Collaboration ES:** kicker `"colaboración"`, heading `"Modelos para trabajar
  juntos"`, blurb `"Elige el formato que mejor encaje con tu proyecto. Todo
  empieza con una llamada gratuita de 30 min."`, models:
  1. tag `ALCANCE CERRADO`, title `Proyecto llave en mano`, desc del mock,
     features [`Cotización fija por fases`, `Diseño → desarrollo → despliegue`,
     `Garantía post-entrega`], cta `Cotizar proyecto`.
  2. tag `MENSUAL`, title `Retainer / por horas`, desc del mock, features
     [`Bloque de horas flexible`, `Prioridad y disponibilidad`, `Reportes y demos
     semanales`], cta `Reservar cupo`, `popular: true`.
  3. tag `ESTRATÉGICO`, title `Tech Lead fraccional`, desc del mock, features
     [`Arquitectura y estándares`, `Code reviews y mentoría`, `Roadmap técnico`],
     cta `Agendar llamada`.
  EN: translated equivalents (tags `FIXED SCOPE` / `MONTHLY` / `STRATEGIC`, etc.).

Seed files `src/content/seed/es.ts` and `src/content/seed/en.ts` get the new
fields (used by fresh seeds and as the source for the migration).

## 2. Firestore migration (no clobbering)

New one-off script `scripts/migrate-add-sections.ts` (run via
`npx tsx scripts/migrate-add-sections.ts`, same firebase-admin init as
`seed-content.ts`): for each locale doc (`content/es`, `content/en`) it merges
**only the new fields** from the seed modules:

```ts
await db.doc(`content/${locale}`).set(
  {
    hero: { clientsHeading: seed.hero.clientsHeading, clients: seed.hero.clients },
    process: seed.process,
    collaboration: seed.collaboration,
  },
  { merge: true },
);
```

Never a full `set` — admin edits to existing fields survive. Then
`npm run content:pull` regenerates `src/content/published/{es,en}.json`
(committed).

## 3. Public site

### Hero clients block (`hero-section.tsx`)

Appended after the stats row, inside a final `Reveal` (`delay={400}`, continuing
the existing 0/80/160/240/320 cascade):

- Heading: mono, 11, `letterSpacing 0.6`, uppercase, `textFaint` (same style as
  the education `languagesHeading`), `marginTop: 30`.
- Chips: `flexDirection: 'row', flexWrap: 'wrap', gap: 10` of **`Pill`**
  (existing primitive — body font, surface bg + border, hover brighten), one per
  `hero.clients` string.

### `ProcessSection` (`src/features/portfolio/sections/process/process-section.tsx`)

- `Container` `paddingVertical: 56`, `nativeID="process"`.
- `<Reveal delay={0}>` around `SectionHeading kicker/heading`.
- Row `flexWrap, gap: 16`; each step in
  `<Reveal delay={i*70} style={{ flexGrow: 1, flexBasis: 230, minWidth: 210 }}>`
  wrapping a `GlowCard` (`width: '100%', flexGrow: 1, padding: 24`, surface bg,
  border, `borderRadius: radii.lg`):
  - number: `fonts.displayBold`, 26, `colors.accent` (mock's big accent "01"),
  - title: `fonts.display`, 17, `letterSpacing -0.17`, `colors.text`,
  - description: 13.5/22, `colors.textDim`, `fonts.body`.
- Card content ignores `hovered` (children render-prop `{() => (…)}`); the
  GlowCard lift/glow is the hover effect.

### `CollaborationSection` (`src/features/portfolio/sections/collaboration/collaboration-section.tsx`)

- `Container` `paddingVertical: 56`, `nativeID="collaboration"`.
- `<Reveal delay={0}>` heading; `<Reveal delay={70}>` blurb (16/26 `textMuted`,
  `maxWidth: 560`, `marginBottom: 28`).
- Row `flexWrap, gap: 16`; each model in
  `<Reveal delay={140 + i*70} style={{ flexGrow: 1, flexBasis: 300, minWidth: 280 }}>`
  wrapping a `GlowCard`:
  - card style: `width: '100%', flexGrow: 1, padding: 26`, bg
    `rgba(255,255,255,0.03)`, `borderRadius: 18`, `borderWidth: 1`; **popular**
    card gets `borderColor: 'rgba(228,227,87,0.5)'` + bg
    `rgba(228,227,87,0.04)`; others `borderColor: 'rgba(255,255,255,0.09)'`.
  - header row: tag (mono 10.5, letterSpacing 0.5, accent) left; if `popular`, a
    `POPULAR` badge right (accent bg chip like the mock: bg
    `rgba(228,227,87,0.9)` → use `colors.accent` bg + `colors.onAccent` text,
    mono 9.5, radius `radii.sm`).
  - title: `fonts.display`, 21, `colors.text`; description 13.5/22 `textDim`.
  - features: rows `✓ {feature}` — check glyph in accent, text 13.5 `textMuted`,
    `gap: 8` between rows, `marginTop: 14`.
  - CTA pinned bottom (`marginTop: 'auto', paddingTop: 20`): `AppButton`
    `variant={model.popular ? 'primary' : 'outline'}`
    `onPress={() => scrollToAnchor('contact')}`.
- Popular badge/borders are static (not hover-dependent); GlowCard hover adds
  lift/glow on all three.

### Screen wiring (`portfolio-screen.tsx`)

Insert `<TrackedSection id="process"><ProcessSection /></TrackedSection>` after
services, and `<TrackedSection id="collaboration"><CollaborationSection /></TrackedSection>`
before contact.

## 4. Admin (`/admin`)

- **`hero-form.tsx`**: add `Field clientsHeading` + `StringListEditor` for
  `clients` (after stats).
- **`process-form.tsx`** (new): kicker/heading `Field`s + `ListEditor` of steps
  (`makeEmpty: () => ({ number: '', title: '', description: '' })`; Fields for
  number/title/description, description multiline).
- **`collaboration-form.tsx`** (new): kicker/heading/blurb `Field`s + `ListEditor`
  of models (`makeEmpty: () => ({ tag: '', title: '', description: '',
  features: [], cta: '', popular: false })`; Fields for tag/title/description
  (multiline)/cta, `StringListEditor` for features, and a popular toggle — the
  existing `Chip` primitive (`src/ui/chip.tsx`) with `active={!!m.popular}` and
  `onPress` flipping the boolean, label `popular`).
- **`admin-screen.tsx`**: add `{ key: 'process', label: 'Proceso' }` and
  `{ key: 'collaboration', label: 'Colaboración' }` to `SECTIONS` (process after
  services, collaboration before contact) + the two `case`s rendering the forms.
  `SectionKey` derives from the registry/type as currently implemented.

## Data flow

Unchanged pipeline: Firestore `content/{es,en}` → (build) `content:pull` →
`src/content/published/{es,en}.json` → app import. Admin reads/writes Firestore
directly (owner-only rules already cover the whole doc — no rules change). Publish
button → existing `publish` function → deploy workflow (no changes).

## Error handling

- Migration script merges only new keys; aborts loudly on credential errors (same
  behavior as seed script).
- Public components render from typed content; `features`/`clients` map over
  arrays that the seed guarantees non-empty; `popular` optional → falsy default.
- All animation/hover primitives are the existing reduced-motion-aware ones.

## Testing / verification

- `npx tsc --noEmit` passes; `npx expo export -p web` builds; bundle hygiene
  (Firebase only in `firebase-client-*` chunk).
- Browser (preview): hero shows the clients heading + chips after stats; Process
  renders 4 numbered cards after Servicios; Collaboration renders 3 cards (middle
  one accent-bordered with POPULAR badge) before Contacto; the 3 CTAs
  smooth-scroll to Contacto; entrance staggers play; ES/EN toggle shows translated
  content everywhere.
- `/admin`: Proceso and Colaboración appear in the selector; hero form shows
  clients editor; editing + Guardar persists (verified against Firestore).
- Migration: run script → Firestore docs gain the new fields without losing
  existing edits; `content:pull` regenerates JSON; site builds from them.
- Deploy + live check.

## Implementation order

1. Types + seed (es/en) + add the same new fields to
   `src/content/published/{es,en}.json` by hand (copied from the seed values) so
   the app type-checks and renders before the migration runs.
2. Migration script + run + `content:pull` (confirms Firestore now matches; the
   pulled JSON should be a no-op diff for the new fields).
3. Public: hero clients block; ProcessSection; CollaborationSection; screen wiring.
4. Admin: hero form fields; ProcessForm; CollaborationForm; SECTIONS registry.
5. Verify (tsc/export/hygiene/browser/admin) + deploy.
