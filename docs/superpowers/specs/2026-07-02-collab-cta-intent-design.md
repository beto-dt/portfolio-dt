# Collaboration CTA Intent → Booking Wizard — Design

**Date:** 2026-07-02
**Status:** Approved (design — option A chosen by user)

## Goal

The three Colaboración CTAs (Cotizar proyecto / Reservar cupo / Agendar llamada)
keep scrolling to the contact wizard, but now carry the chosen model with them:
the wizard shows a dismissible "Interesado en: {modelo}" chip, and the model
travels in the Firestore booking and the notification email — so Luis can see
which offer converts.

## Decisions

- All three CTAs → `#contact` wizard with the model as intent (option A).
- The "Interesado en" label is CMS-backed (`ContactContent.interestLabel`),
  consistent with the rest of the wizard strings.
- The model is optional everywhere (no validation gate); dismissing the chip
  clears it.

## Non-goals

- No per-CTA channels (mailto/WhatsApp) — everything stays in the tracked
  funnel. No changes to the collaboration card layout.

## Architecture

### 1. Intent module (`src/features/portfolio/sections/contact/booking-intent.ts`)

A tiny module-level pub/sub (both sections are mounted simultaneously, so
"consume on mount" is not enough):

```ts
type Listener = (model: string) => void;
const listeners = new Set<Listener>();

/** Broadcast the collaboration model the visitor tapped. */
export function setBookingIntent(model: string): void {
  listeners.forEach((l) => l(model));
}

/** Subscribe to intent broadcasts; returns an unsubscribe. */
export function onBookingIntent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
```

### 2. Collaboration CTAs (`collaboration-section.tsx`)

`ModelCard`'s button becomes:

```tsx
<AppButton
  label={model.cta}
  onPress={() => {
    setBookingIntent(model.title);
    scrollToAnchor('contact');
  }}
  variant={model.popular ? 'primary' : 'outline'}
/>
```

### 3. Wizard (`contact-section.tsx`)

- State: `const [model, setModel] = useState<string | null>(null);` +
  `useEffect(() => onBookingIntent((m) => { setModel(m); setStep('form'); }), []);`
  (arriving from a CTA lands on step 1 with the chip set — also when the wizard
  was on the success screen).
- UI (step 'form', above the name/email row): when `model` is set, a row with
  `FIELD_LABEL` `{contact.interestLabel}` + a `Chip` (`active`,
  `mono={false}`, label = model, `onPress={() => setModel(null)}` to dismiss).
- POST payload gains `model: model ?? ''`; `draft()` gains a line
  (`Modelo: {model}.` / `Model: {model}.`) when set.
- `reset()` clears `model`.

### 4. Backend (`functions/src/index.ts`)

`parseBookingPayload` gains `model: typeof b.model === 'string' ?
b.model.slice(0, 80) : ''` (in the payload type + object; no validation gate).
The Firestore doc stores `model`, and the email text gains a
`Modelo: ${model || '—'}` line. Redeploy `submitBooking`.

### 5. Admin (`bookings-view.tsx` + `firebase-client.ts`)

`BookingRecord` gains `model: string`; the meta line renders it first:
`{b.model ? `${b.model} · ` : ''}{b.email}…` — so each request shows which
offer originated it.

### 6. CMS

`ContactContent.interestLabel` — ES `'Interesado en'` / EN `'Interested in'`.
Types + seeds + published mirror + `scripts/migrate-collab-intent.ts`
(merge-only, one key per locale) + admin `contact-form.tsx` Field.

## Error handling

Intent is fire-and-forget; no listener → no-op. Model absent → everything
behaves exactly as today (empty string in doc/email dash).

## Testing / verification

- tsc + functions build + export + hygiene.
- Preview: tapping each collaboration CTA scrolls to contact and shows
  "Interesado en: {modelo}" (dismissible); mocked POST includes `model`;
  draft line present; reset clears.
- Backend: real POST with `model` → doc stores it and the email includes it.
- Migration run + pull value-identical; deploy functions + hosting.

## Implementation order

1. CMS (types/seeds/published/migration/admin field).
2. Intent module + collaboration CTAs + wizard chip/payload.
3. Backend model field + redeploy.
4. Admin bookings view.
5. Verify + deploy.
