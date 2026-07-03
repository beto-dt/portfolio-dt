# Service Request CTA → Prefilled Contact — Design

**Date:** 2026-07-03
**Status:** Approved (design)

## Goal

Every service card gets a "Solicitar este servicio →" CTA that scrolls to
Contacto with the matching project-type chip preselected and an accent 💡
banner recommending a collaboration model (mock: "Para Cloud / DevOps te
recomiendo el modelo Retainer / por horas. Ya lo dejé preseleccionado abajo —
cuéntame los detalles."). The contact type chips grow from 7 to 9 (adds
Chatbot IA / Agentes IA).

## Decisions (agreed with user)

- Reuse the existing booking-intent pub/sub, upgraded from `string` to
  `BookingIntent = { model?: string; projectType?: string }`. Collaboration
  CTAs migrate to `{ model: model.title }` (identical behavior).
- Services intent (has `projectType`) shows the banner and activates the type
  chip; the model is stored silently (message/booking payload as today).
  Collaboration intent (model only) keeps the current "Interesado en" chip.
- Banner is dismissible (✕) and clears if the visitor picks another type chip.
- Service → type/model mapping (ES / EN):
  | Servicio | projectType | recommendedModel |
  |---|---|---|
  | 01 Web | Web / Web | Proyecto llave en mano / Turnkey project |
  | 02 Apps Móviles | App móvil / Mobile app | Proyecto llave en mano / Turnkey project |
  | 03 AR & Unity | AR / Unity | Proyecto llave en mano / Turnkey project |
  | 04 Backend | Backend | Proyecto llave en mano / Turnkey project |
  | 05 Cloud & DevOps | Cloud / DevOps | Retainer / por horas / Retainer / hourly |
  | 06 IA/ML | IA / ML · AI / ML | Retainer / por horas / Retainer / hourly |
  | 07 Consultoría | Consultoría / Consulting | Tech Lead fraccional / Fractional Tech Lead |
  | 08 Chatbots | Chatbot IA / AI Chatbot | Proyecto llave en mano / Turnkey project |
  | 09 Agentes | Agentes IA / AI Agents | Proyecto llave en mano / Turnkey project |
- New contact projectTypes lists (9): ES `['Web', 'App móvil', 'AR / Unity',
  'Backend', 'Cloud / DevOps', 'IA / ML', 'Consultoría', 'Chatbot IA',
  'Agentes IA']`; EN `['Web', 'Mobile app', 'AR / Unity', 'Backend',
  'Cloud / DevOps', 'AI / ML', 'Consulting', 'AI Chatbot', 'AI Agents']`.

## Architecture

### Content model (`src/content/types.ts`)

- `ServiceItem` gains `projectType: string;` and `recommendedModel: string;`.
- `ServicesContent` gains `requestCta: string;`.
- `ContactContent` gains `intentBanner: string;` (template with `{type}` and
  `{model}` placeholders).

### Seeds

- `services.requestCta`: ES `Solicitar este servicio`, EN
  `Request this service`. Each item gets `projectType`/`recommendedModel` per
  the mapping table.
- `contact.projectTypes`: the 9-item lists above.
- `contact.intentBanner`: ES `Para {type} te recomiendo el modelo {model}. Ya
  lo dejé preseleccionado abajo — cuéntame los detalles.`; EN `For {type} I'd
  recommend the {model} model. I've preselected it below — tell me the
  details.`

### Intent module (`booking-intent.ts`)

```ts
export type BookingIntent = { model?: string; projectType?: string };
```
`setBookingIntent(intent: BookingIntent)` / `onBookingIntent((i) => …)` —
same pub/sub, richer payload. Collaboration call site becomes
`setBookingIntent({ model: model.title })`.

### Service card (`service-card.tsx`)

- `ServiceCard({ item, requestCta })`. Card content becomes a column with
  `flexGrow: 1` body; pinned footer (`marginTop: 'auto', paddingTop: 18`):
  `Pressable` row (gap 6): label `fonts.mono` 12.5 `colors.accent` +
  arrow `→` that shifts right on hover (web transform cast, like HoverLink
  affordances); hover lifts label to `colors.text`… (keep simple: label
  accent, hover underline via border-bottom? Follow mock: mono accent text +
  arrow; hover = arrow `translateX(3px)` + label brightens to `#eeed6b`).
- `onPress`: `setBookingIntent({ projectType: item.projectType, model:
  item.recommendedModel }); scrollToAnchor('contact');`
- `services-section.tsx` passes `requestCta={services.requestCta}`.

### Contact wizard (`contact-section.tsx`)

- State adds `banner: { type: string; model: string } | null`.
- Intent effect:

```ts
useEffect(() => onBookingIntent((i) => {
  if (i.model) setModel(i.model);
  if (i.projectType) {
    setType(i.projectType);
    setBanner(i.model ? { type: i.projectType, model: i.model } : null);
  }
  setStep('form');
}), []);
```

- Banner UI (only when `banner` set), rendered ABOVE the form fields (before
  the "Interesado en" block): accent-tinted callout — `borderWidth 1,
  borderColor 'rgba(228,227,87,0.45)', backgroundColor 'rgba(228,227,87,0.07)',
  borderRadius: radii.md, padding 14, flexDirection row, gap 10,
  alignItems flex-start`: `💡` (14) + flex-1 text (13.5/20 `colors.textMuted`)
  = `contact.intentBanner` with `{type}`/`{model}` replaced + ✕ `HoverLink`
  (`colors.textFaint` → `colors.text`) that `setBanner(null)`.
- The "Interesado en" chip block renders only when `model && !banner` (the
  banner already names the model; avoids double UI). Picking a different type
  chip (`setType(t)`) also `setBanner(null)` when `t !== banner.type`.
- `interestLabel`, payload and message template unchanged — `model` keeps
  flowing into `/api/booking` and the email.

### Admin forms

- `services-form.tsx`: `requestCta` Field after `heading`; per-item
  `projectType` and `recommendedModel` Fields.
- `contact-form.tsx`: `intentBanner` Field (multiline) next to
  `interestLabel`.

### Data migration

- Verify published-vs-seed drift for `services` and `contact` first (compare
  JSON values; both matched seed at last check).
- `scripts/migrate-service-request-cta.ts`: merge-only
  `{ services: seed.services, contact: seed.contact }` for es/en.
- Patch published mirrors with the same objects (scratchpad script).
- No functions/rules changes (payload fields already exist).

## Error handling

Intent with a `projectType` not present in `contact.projectTypes` still works:
`type` is a free string in state and flows into the payload; the chip row just
shows nothing active (content migration keeps them in sync in practice).
Dismissing the banner never clears `type`/`model` (visitor keeps the
preselection).

## Testing / verification

- `npx tsc --noEmit`, `npx expo export -p web`, hygiene grep.
- Preview: click "Solicitar este servicio" on Cloud & DevOps → page scrolls to
  contact, banner shows "Para Cloud / DevOps… Retainer / por horas…",
  Cloud / DevOps chip active; 9 type chips render; collaboration CTA still
  preselects its model (chip "Interesado en"); banner ✕ dismisses; changing
  type clears banner.
- Deploy: PR flow + `gh workflow run deploy.yml` + live bundle markers.

## Implementation order

1. Types + intent module + seeds. 2. ServiceCard CTA + contact banner. 3.
Admin forms. 4. Migration + published. 5. Verify + deploy.
