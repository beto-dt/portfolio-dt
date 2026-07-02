# Formation Columns + Contact Form + WhatsApp FAB — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Match the approved mocks: (A) Certificaciones + Educación side by side in a
two-column layout with a restyled education/languages list and new seeded
content; (B) the Contacto section becomes an accent-bordered card with a
contact form that pre-drafts a message and opens WhatsApp or email (no
backend); (C) the footer gains the logo and a global floating WhatsApp button.
Bilingual, CMS-backed, migration merge-only.

## Decisions (agreed with user)

- All three pieces.
- Form labels/options live in the CMS (`ContactContent` extended) + admin form.
- New certifications/education content seeded by a migration that REPLACES
  `certifications.items` and `education.items` (other fields untouched).
- WhatsApp FAB floats globally (fixed bottom-right); the footer keeps
  "↑ Volver arriba".

## Non-goals

- No backend/email service — the form only composes a message and opens
  `wa.me` / `mailto:`.
- No nav changes. No changes to other sections.
- Old contact CTA buttons disappear (replaced by the form's send buttons, which
  reuse the existing `whatsappCta`/`emailCta` fields with new values).

## A) Formation section (Certs + Educación side by side)

### Component

**Create `src/features/portfolio/sections/formation/formation-section.tsx`**,
which **replaces** `certifications-section.tsx` and `education-section.tsx`
(both files deleted; `portfolio-screen.tsx` swaps the two `TrackedSection`s for
one `<TrackedSection id="formation"><FormationSection /></TrackedSection>` in the
same position). Analytics note: the old `certifications`/`education` counters
freeze; a new `formation` counter starts (accepted).

- One `Container` (`paddingVertical: 56`, `nativeID="formation"`).
- Two-column web grid (same cast pattern):
  `display: grid, gridTemplateColumns: repeat(auto-fit, minmax(460px, 1fr)),
  columnGap: 64, rowGap: 48` appended to a `flexDirection:'row', flexWrap:'wrap',
  gap: 48` fallback. Collapses to one column under ~1000px.
- **Left column** — heading (`formación continua` / `Certificaciones`) via
  `SectionHeading`, then the existing `CertRow` list (hover: bg + brighter
  divider + accent gutter marker — moved verbatim from the old file). Rows
  staggered with `Reveal` (`delay (i+1)*60`).
- **Right column** — heading (`academia` / `Educación`) via `SectionHeading`,
  then **stacked** education items (no bottom border, no left/right split):

  ```tsx
  <View style={{ gap: 2, paddingVertical: 10 }}>
    <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>{item.title}</Text>
    <Text style={{ fontSize: 13.5, color: colors.accent }}>{item.institution}</Text>
    <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{item.period}</Text>
  </View>
  ```

  wrapped in a hover `Pressable` that keeps the subtle bg lighten + accent
  gutter marker (like `CertRow`, without the divider). Staggered `Reveal`.
- **Idiomas** below the education items: mono uppercase heading, then one row per
  language — `space-between`: language (`fontSize 14, colors.text`) left, level
  (`fontSize 13.5, colors.accent`) right. No chips, no dividers. In its own
  `Reveal`.

### Content migration (replaces list items)

`scripts/migrate-formation-contact.ts` (same firebase-admin init; merge-only
`set`; arrays replace wholesale under merge):

- `certifications.items` **ES** (10):
  1. Máster en Arquitectura de Microservicios con Docker — Lite Thinking
  2. DevOps con AWS — Smart Data
  3. NestJS: Persistencia con MongoDB y TypeORM — Platzi
  4. Infraestructura como código en Terraform — Platzi
  5. Fundamentos de TypeScript — Platzi
  6. Testing con JavaScript — Platzi
  7. Angular: Componentes y Servicios — Platzi
  8. Material UI con React — Platzi
  9. Desarrollo Front-End & JavaScript — Coursera
  10. Diplomado en Habilidades Directivas — Newman

  **EN**: Master's in Microservices Architecture with Docker / DevOps with AWS /
  NestJS: Persistence with MongoDB & TypeORM / Infrastructure as Code with
  Terraform / TypeScript Fundamentals / Testing with JavaScript / Angular:
  Components & Services / Material UI with React / Front-End Development &
  JavaScript / Management Skills Diploma (same issuers).
- `education.items` **ES** (order del mock):
  1. Maestría en Big Data con mención en IA — UNIANDES — `2026 — Presente`
  2. Diplomado en Arquitectura Empresarial Moderna — Lite Thinking — `2025 — Presente`
  3. AI Assisted Programming Bootcamp — Dojo Coding — `2025 — Presente`
  4. Ingeniería en Sistemas — UNIANDES — `2014 — 2019`

  **EN**: Master's in Big Data with a focus on AI — UNIANDES — `2026 — Present` /
  Diploma in Modern Enterprise Architecture — Lite Thinking — `2025 — Present` /
  AI Assisted Programming Bootcamp — Dojo Coding — `2025 — Present` / Systems
  Engineering — UNIANDES — `2014 — 2019`.
- Plus the contact fields below. Seeds (`src/content/seed/{es,en}.ts`) and
  published JSON updated with the same values first (mirror pattern from the
  new-sections feature); migration then syncs Firestore; `content:pull` should
  show a value-identical diff (key order may shuffle — keep pulled version).

## B) Contact card + form

### Content model (`ContactContent` gains)

```ts
linkedinLabel: string;         // "/luis-alberto-de-la-torre" (display; href stays `linkedin`)
formNameLabel: string;         // "Tu nombre"
formNamePlaceholder: string;   // "Ej: María Torres"
formTypeLabel: string;         // "Tipo de proyecto"
projectTypes: string[];        // ['Web','App móvil','AR / Unity','Backend','Cloud / DevOps','IA / ML','Consultoría']
formBudgetLabel: string;       // "Presupuesto estimado"
budgets: string[];             // ['< $2k','$2k–5k','$5k–15k','$15k+','A definir']
formMessageLabel: string;      // "Cuéntame tu proyecto"
formMessagePlaceholder: string;// "¿Qué quieres construir? Objetivo, plazos, contexto..."
formHint: string;              // "Al enviar se abre WhatsApp o tu email con el mensaje ya redactado. Respondo en menos de 24 h."
```

EN equivalents: "Your name" / "E.g.: María Torres" / "Project type" /
['Web','Mobile app','AR / Unity','Backend','Cloud / DevOps','AI / ML','Consulting'] /
"Estimated budget" / ['< $2k','$2k–5k','$5k–15k','$15k+','To be defined'] /
"Tell me about your project" / "What do you want to build? Goal, timeline, context..." /
"Sending opens WhatsApp or your email with the message pre-drafted. I reply within 24 h."

Migration also updates values: `whatsappCta: 'Enviar por WhatsApp'` /
`'Send via WhatsApp'`, `emailCta: 'Enviar por email'` / `'Send via email'`,
`location: 'Quito, Ecuador · GMT-5'` (both locales).

### Component rewrite (`contact-section.tsx`)

- Whole section inside a **card**: `borderRadius: 24, borderWidth: 1,
  borderColor: 'rgba(228,227,87,0.25)', backgroundColor: 'rgba(255,255,255,0.02)',
  padding: 44` + web-only radial glow backgroundImage
  (`radial-gradient(700px 420px at 85% 0%, rgba(228,227,87,0.07), rgba(228,227,87,0) 70%)`).
  Card sits inside the existing `Container` (`nativeID="contact"` stays).
- Two-column web grid inside the card:
  `repeat(auto-fit, minmax(380px, 1fr)), columnGap: 56, rowGap: 40` (flexWrap
  fallback).
- **Left column** (`Reveal` staggered): `SectionHeading` + blurb + divider
  (`borderTop colors.border, paddingTop 24`) + details **stacked** (`gap: 18`)
  using the existing `Detail` hover component; LinkedIn renders
  `contact.linkedinLabel` as the visible `HoverLink` label with the full
  `contact.linkedin` as the pressed URL.
- **Right column — the form** (`Reveal delay 140`):
  - Labels: mono 10.5 uppercase `textFaint` (same as Detail labels).
  - **Name**: react-native `TextInput` styled dark
    (`backgroundColor: colors.surface, borderWidth 1, borderColor: colors.border,
    borderRadius: radii.md, paddingHorizontal 14, paddingVertical 12,
    color: colors.text, fontSize 14`, `placeholderTextColor: colors.textFaint`;
    web transition on border-color; focus border `rgba(228,227,87,0.4)` via
    `onFocus/onBlur` state).
  - **Project type** and **budget**: wrap rows of the existing `Chip` primitive
    (single-select each: `active={selected === option}`, tap toggles/selects;
    `mono={false}` for project types to match the mock's sans chips, budgets
    keep mono).
  - **Message**: same `TextInput` styling with `multiline`, `minHeight: 130`,
    `textAlignVertical: 'top'`.
  - **Buttons row** (wrap, gap 12): `AppButton` primary `contact.whatsappCta`
    and outline `contact.emailCta`.
  - **Hint**: 12.5 `textFaint`, `lineHeight 18`.
- **Send logic** (pure, no backend). Message template by locale:

  ```
  ES: `Hola Luis, soy ${name || '—'}.\nTipo de proyecto: ${type || '—'}.\nPresupuesto estimado: ${budget || '—'}.\n\n${message}`
  EN: `Hi Luis, I'm ${name || '—'}.\nProject type: ${type || '—'}.\nEstimated budget: ${budget || '—'}.\n\n${message}`
  ```

  - WhatsApp → `Linking.openURL('https://wa.me/' + contact.whatsapp + '?text=' + encodeURIComponent(msg))`
  - Email → `Linking.openURL('mailto:' + contact.email + '?subject=' +
    encodeURIComponent(locale === 'es' ? 'Proyecto — ' + (type || 'consulta') : 'Project — ' + (type || 'inquiry')) +
    '&body=' + encodeURIComponent(msg))`
  - Empty fields degrade to `—` — never throws, no validation gate (the human
    reads the draft before sending).

### Admin (`contact-form.tsx`)

Add `Field`s for `linkedinLabel`, `formNameLabel`, `formNamePlaceholder`,
`formTypeLabel`, `formBudgetLabel`, `formMessageLabel`, `formMessagePlaceholder`
(multiline), `formHint` (multiline) and `StringListEditor`s for `projectTypes`
and `budgets`.

## C) Footer logo + WhatsApp FAB

- **`site-footer.tsx`**: copyright block becomes a row (`gap: 10, alignItems:
  'center'`) with the logo `Image` (`require('@/assets/images/logo.png')`,
  24×24, `borderRadius: 6`) before the copyright text. "↑ Volver arriba" +
  tagline unchanged.
- **Create `src/features/portfolio/components/whatsapp-fab.tsx`**: a `Pressable`
  pill fixed bottom-right (web-only cast `position: 'fixed', bottom: 24,
  right: 24, zIndex: 50`; native fallback `position: 'absolute'` same offsets),
  `backgroundColor: colors.accent, borderRadius: 999, paddingHorizontal: 18,
  paddingVertical: 12`, row `gap: 8`: a monochrome handset glyph — `Text` with
  the character `✆` (U+2706, tintable), `fontSize 16, color: colors.onAccent` —
  + label `WhatsApp` (`fonts.bodyMedium, 14, colors.onAccent`).
  Hover (web): brighten bg `#eeed6b` + `scale 1.04` + accent box-shadow;
  cursor pointer; press opacity. `onPress` → `Linking.openURL('https://wa.me/' +
  contact.whatsapp)` (uses `useI18n().content.contact.whatsapp`).
  Rendered in `portfolio-screen.tsx` as a sibling AFTER the `ScrollView`
  (floats above content; not part of scroll).

## Data flow

CMS pipeline unchanged (seed → Firestore → pull → published JSON). Form state is
local (`useState`) and never persisted. FAB/form read contact data from i18n
content.

## Error handling

- Migration merge-only; arrays replace wholesale (intended for the two item
  lists); aborts loudly on credential errors.
- Form composes drafts client-side; `encodeURIComponent` handles all characters;
  empty fields become `—`.
- Web-only props via the established `Platform.OS === 'web'` casts.

## Testing / verification

- `npx tsc --noEmit` + `npx expo export -p web` + bundle hygiene clean.
- Browser: Formation renders 2 columns ≥1000px (10 cert rows left; 4 stacked
  education items + Idiomas rows with accent levels right), 1 column mobile.
  Contact card shows accent border + 2 columns; chips single-select; filling the
  form and pressing the WhatsApp/email buttons produces `wa.me`/`mailto` URLs
  with the encoded draft (assert via intercepting `window.open`/location or
  checking `Linking` target on preview — headless may block navigation; verify
  URL composition via code + live click). FAB floats bottom-right over all
  sections, opens wa.me. Footer shows logo + copyright + Volver arriba +
  tagline. ES/EN toggle translates form labels/options.
- `/admin`: Contacto form shows the new fields/lists; Certificaciones/Educación
  show the migrated items.
- Migration runs (merge-only) + `content:pull` value-identical.
- Deploy + live check.

## Implementation order

1. Content model: types + seeds + published JSON mirror.
2. Migration script + run + pull.
3. FormationSection (+ delete old two sections, rewire screen).
4. Contact card + form rewrite.
5. Footer logo + WhatsAppFab + screen wiring.
6. Admin contact form fields.
7. Verify + deploy.
