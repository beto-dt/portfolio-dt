# Admin Panel — Phase 2B (all-section forms) Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Let the owner edit every section of the portfolio from `/admin`, not just hero:
add structured forms for `nav` and the seven content sections, with a section
selector, built on reusable form primitives. Saving and publishing already work
(2A/2C); this phase only adds the editing UI.

This is **Phase 2B of Phase 2** (admin panel). 2A (auth + hero) and 2C (publish)
are done.

## Decisions (agreed with user)

- Editable sections: **`nav` + all 7 content sections** (services, impact, stack,
  experience, projects, certifications, contact). `hero` already has a form.
- List reordering: **up/down (↑/↓) buttons** (no drag-and-drop).
- One phase, built on shared primitives to avoid duplicating array plumbing.

## Non-goals (2B)

- No drag-and-drop reordering.
- No new backend/auth/publish work (reuse 2A/2C).
- No schema-driven/generic renderer — explicit per-section forms.

## Architecture

### Reusable primitives — `src/admin/components/`
- **`field.tsx`** — `Field` (label + `TextInput`, optional `multiline`),
  extracted from `hero-form.tsx`; `hero-form` is refactored to import it (DRY).
- **`list-editor.tsx`** — generic `ListEditor<T>`:
  props `{ items: T[]; onChange: (items: T[]) => void; makeEmpty: () => T;
  renderItem: (item: T, onChange: (item: T) => void, index: number) => ReactNode;
  addLabel?: string }`. Renders each item in a card with ↑ / ↓ / ✕ controls and an
  "Add" button; owns all add/remove/move-up/move-down logic.
- **`string-list-editor.tsx`** — `StringListEditor` for `string[]` (stack group
  `items`, project `tech`): a `ListEditor<string>`-style list of text inputs with
  add/remove/reorder.

### Section forms — `src/admin/components/forms/`
Each is a thin controlled component `{ value, onChange }` composed from the
primitives, typed to its slice of `PortfolioContent`:
- `nav-form.tsx` — name, role, languageToggleLabel, cta {label, anchor},
  links[] {label, anchor}.
- `services-form.tsx` — kicker, heading, items[] {index, tag, title, description}.
- `impact-form.tsx` — kicker, heading, items[] {value, label}.
- `stack-form.tsx` — kicker, heading, groups[] {category, items: string[]}.
- `experience-form.tsx` — kicker, heading, items[] {period, location, current,
  currentLabel, role, company, description}. `current` is a boolean toggle;
  `currentLabel` is a text field.
- `projects-form.tsx` — kicker, heading, items[] {category, title, description,
  tech: string[]}.
- `certifications-form.tsx` — kicker, heading, items[] {name, issuer}.
- `contact-form.tsx` — kicker, heading, blurb, email, cta, socials[] {label, url}.

`hero-form.tsx` already exists (refactored to use the shared `Field`).

### Screen — `src/admin/screens/admin-screen.tsx` (refactor)
- Load the full `PortfolioContent` for the current locale into a draft state.
- A **section selector** (row of buttons: Nav · Hero · Servicios · Impacto ·
  Stack · Experiencia · Proyectos · Certificaciones · Contacto).
- Render the active section's form via a typed `switch (section)`, bound to
  `content[section]`; edits update the draft.
- **Guardar** writes the active section only: `saveSection(locale, section,
  content[section])`. Keep the ES/EN toggle, **Publicar**, and sign-out.

## Data shapes (from `src/content/types.ts`, unchanged)

`NavContent`, `HeroContent`, `ServicesContent`, `ImpactContent`, `StackContent`,
`ExperienceContent`, `ProjectsContent`, `CertificationsContent`, `ContactContent`
— the forms edit these exactly; no type changes.

## Error handling

- Load failure / invalid shape → error banner (existing behavior via
  `assertPortfolioContent`).
- Save failure → status shows the error; draft stays editable.
- Empty arrays are allowed (a section can have zero items); `makeEmpty()` seeds a
  blank item on Add.

## Verification

- `npx tsc --noEmit` passes.
- Public web export builds; the public home still excludes Firebase (admin-only
  lazy chunk unchanged).
- Manual: for a representative set of sections (e.g. services, experience, stack),
  edit a field / add / remove / reorder an item → Guardar → the change is in
  Firestore (`content/es` or `en`).
- Manual: **Publicar** after an edit reflects the change on the live site.
- Switching ES/EN reloads the correct locale's content into the forms.

## Implementation order

1. Primitives: `field.tsx` (extract) + refactor `hero-form.tsx` to use it.
2. `list-editor.tsx` + `string-list-editor.tsx`.
3. Simple forms: `impact-form`, `certifications-form`, `contact-form`, `nav-form`.
4. List forms: `services-form`, `experience-form`.
5. Nested-list forms: `stack-form`, `projects-form`.
6. `admin-screen` refactor: section selector + typed `switch` rendering.
7. Verify (tsc, bundle hygiene, manual edit/save/publish).
