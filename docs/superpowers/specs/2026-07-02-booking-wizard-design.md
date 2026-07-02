# Booking Wizard + Firestore Storage + Email Notification + FAB Pulse — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

Turn the contact form into the mock's two-step wizard (Proyecto → Agenda with a
monthly calendar and time slots). Submissions are stored in Firestore
(`bookings`), notify `luis.atorred24@gmail.com` by email, and can be managed
from a new "Solicitudes" view in `/admin`. The floating WhatsApp button pulses
every 30 seconds. Bilingual; wizard strings fully CMS-backed.

## Decisions (agreed with user)

- Email via **Nodemailer + Gmail SMTP** with a `GMAIL_APP_PASSWORD` functions
  secret (user creates a Gmail App Password; pasted only at the CLI's hidden
  prompt — never in chat).
- Struck-out slots are **real**: taken times per day come from a GET endpoint
  (no personal data exposed).
- **Admin "Solicitudes" view** included (list + status management).
- **All wizard strings live in the CMS** (`ContactContent` extended + migration
  + admin form). Calendar month/weekday names are code-side i18n constants.

## Non-goals

- No third-party calendar integration (Calendly/Google Calendar) — availability
  is the fixed weekday slot grid.
- No client-side Firestore writes — only the function (Admin SDK) writes
  bookings.
- No CAPTCHA (payload validation + length caps only, v1).
- No changes to other sections.

## 1. Backend

### `submitBooking` function (`functions/src/index.ts`, gen2, us-central1)

Secret: `GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD')`.
New dependency in `functions/package.json`: `nodemailer` (+ `@types/nodemailer`
dev). Shared constants in the function:

```ts
const SLOT_TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const MAX_DAYS_AHEAD = 60;
```

`export const submitBooking = onRequest({ secrets: [GMAIL_APP_PASSWORD], region: 'us-central1' }, handler)`:

- **GET** `?date=YYYY-MM-DD` → validates format; queries
  `bookings` where `date == X` and `status != 'cancelled'`; responds
  `200 { taken: string[] }` (times only). Invalid date → `400`.
- **POST** JSON body `{ name, email, projectType, budget, message, date, time, locale }`:
  - Validate: `name` (1–120 chars), `email` (regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`,
    ≤200), `projectType`/`budget` (≤60, optional), `message` (≤2000, optional),
    `date` = `YYYY-MM-DD`, weekday (Mon–Fri), ≥ today and ≤ today+60d (UTC-5
    reference), `time` ∈ `SLOT_TIMES`, `locale` ∈ {'es','en'}. Fail → `400 { error: 'invalid' }`.
  - Conflict: existing non-cancelled booking with same date+time →
    `409 { error: 'slot_taken' }`.
  - Write to `bookings`: all fields + `status: 'new'` +
    `createdAt: FieldValue.serverTimestamp()`.
  - Email via nodemailer (`service: 'gmail'`, `auth: { user: ADMIN_EMAIL,
    pass: GMAIL_APP_PASSWORD.value() }`): to `ADMIN_EMAIL`, subject
    `Nueva solicitud — {name} · {date} {time}`, plain-text body listing all
    fields + locale + createdAt. Email failure → `console.error`, booking is
    already stored, still respond `200 { ok: true, emailed: false }`; success →
    `200 { ok: true, emailed: true }`.
  - Other methods → `405`.

### Hosting rewrite (`firebase.json`)

Add `{ "source": "/api/booking", "function": { "functionId": "submitBooking", "region": "us-central1" } }`.

### Firestore rules (`firestore.rules`)

Add before the catch-all:

```
match /bookings/{doc} {
  allow read, update, delete: if request.auth != null
    && request.auth.token.email_verified == true
    && request.auth.token.email == 'luis.atorred24@gmail.com';
  allow create: if false;
}
```

### Secret setup (user step, before functions deploy)

1. Enable 2FA on the Google account if not already.
2. Create an App Password at `https://myaccount.google.com/apppasswords`
   (app: "portfolio").
3. Run `firebase functions:secrets:set GMAIL_APP_PASSWORD --project
   luisdelatorre-portfolio` and paste the app password **only at the hidden
   prompt**.

Deploy: `firebase deploy --only functions,firestore:rules` (hosting deploys via
the usual workflow).

## 2. Content model (CMS)

`ContactContent` gains (values ES / EN; migration #3 merges them and updates
`formHint`):

| Field | ES | EN |
|---|---|---|
| `formEmailLabel` | `Tu email` | `Your email` |
| `formEmailPlaceholder` | `nombre@correo.com` | `name@email.com` |
| `stepProjectLabel` | `Proyecto` | `Project` |
| `stepScheduleLabel` | `Agenda` | `Schedule` |
| `nextCta` | `Elegir día y hora →` | `Pick a day and time →` |
| `backCta` | `← Volver` | `← Back` |
| `confirmCta` | `Confirmar y enviar` | `Confirm and send` |
| `slotsHeading` | `Horarios disponibles` | `Available times` |
| `slotsFreeSuffix` | `horarios libres` | `open slots` |
| `slotsPickDay` | `Selecciona primero un día en el calendario.` | `Pick a day on the calendar first.` |
| `bannerPickDay` | `Elige un día y una hora para tu llamada gratuita de 30 min.` | `Pick a day and time for your free 30-min call.` |
| `bannerPickTime` | `Día seleccionado. Ahora elige una hora.` | `Day selected. Now pick a time.` |
| `bannerScheduled` | `Llamada de 30 min agendada para el {slot}.` | `30-min call scheduled for {slot}.` |
| `whatsappAlt` | `o coordinar por WhatsApp` | `or coordinate via WhatsApp` |
| `successTitle` | `¡Solicitud enviada!` | `Request sent!` |
| `successBody` | `Recibí tu solicitud para el {slot}. Te confirmo por email en menos de 24 h.` | `I got your request for {slot}. I'll confirm by email within 24 h.` |
| `successAgain` | `Enviar otra solicitud` | `Send another request` |
| `errorRequired` | `Completa tu nombre y email para continuar.` | `Fill in your name and email to continue.` |
| `errorSlotTaken` | `Ese horario acaba de ocuparse. Elige otro.` | `That time was just taken. Pick another.` |
| `errorNetwork` | `No se pudo enviar. Intenta de nuevo o escríbeme por WhatsApp.` | `Couldn't send. Try again or message me on WhatsApp.` |

`formHint` value updated (migration): ES `Recibirás una confirmación y el
detalle llegará directo a mi correo. Respondo en menos de 24 h.` / EN
`You'll get a confirmation and the details go straight to my inbox. I reply
within 24 h.`

`{slot}` is replaced in code with the formatted slot (see below). Seeds +
published JSON mirrored; `scripts/migrate-booking-wizard.ts` (merge-only, same
pattern) syncs Firestore; admin `contact-form.tsx` gains the 20 fields.

## 3. Contact wizard (frontend)

### Shared booking constants (`src/features/portfolio/sections/contact/booking-config.ts`)

`SLOT_TIMES` (same 8), `MAX_DAYS_AHEAD = 60`, `isBookableDay(date)` (weekday,
today..+60), month/weekday name arrays per locale
(ES: `['Enero',…]`, `['Lu','Ma','Mi','Ju','Vi','Sá','Do']`; EN equivalents,
Monday-first grid), and `formatSlot(dateISO, time, locale)` →
`Mi 15 Julio · 10:00 (GMT-5)` / `Wed July 15 · 10:00 (GMT-5)`.

### `BookingCalendar` (`src/features/portfolio/sections/contact/booking-calendar.tsx`)

Props `{ selected: string | null; onSelect: (iso: string) => void; locale }`.
Internal month state (starts at current month; `‹›` nav clamped to
current..+2 months). Monday-first grid of day cells: bookable days show an
accent dot, hover brighten, `selected` day accent bg + `onAccent` text;
weekends/past/out-of-range dim + disabled; blank leading cells. Styled like the
mock (rounded cells, mono digits).

### `ContactSection` rewrite (state machine)

State: `step: 'form' | 'schedule' | 'done'`, fields (`name`, `email`, `type`,
`budget`, `message`), `date`, `time`, `taken: string[]`, `loadingTaken`,
`submitting`, `error: 'required' | 'slot_taken' | 'network' | null`.

- **Stepper** header on the right column: `(1) {stepProjectLabel} ——— (2)
  {stepScheduleLabel}`; circle 1 accent always, circle 2 accent when
  `step !== 'form'`.
- **Step form**: name + email inputs (email keyboardType), chips, message,
  full-width `AppButton` `nextCta` → if `!name || !email invalid` set
  `error='required'` else `step='schedule'`. Error texts render at 13px with a
  single soft-red constant `const ERROR_COLOR = '#ff8a8a'` (only new color in
  the palette, used for the three error strings).
- **Step schedule**: calendar + slots grid (3 columns wrap): each slot a
  `Chip`-like pressable — taken ⇒ disabled, dim, `textDecorationLine:
  'line-through'`; selected ⇒ accent bg. Header row: `slotsHeading` mono left,
  `«N» slotsFreeSuffix` accent right (N = SLOT_TIMES − taken; hidden until a day
  is selected, showing `slotsPickDay` under the heading instead). On day select:
  `time=null`, `GET /api/booking?date=` → `taken` (fetch error ⇒ `taken=[]`).
  Banner (border accent-tinted, calendar glyph `🗓` as `Text`): no date ⇒
  `bannerPickDay`; date no time ⇒ `bannerPickTime`; both ⇒
  `bannerScheduled` with `{slot}`. Buttons row: outline `backCta` (→ step
  'form') + primary `confirmCta` (disabled-ish when no date/time → pressing
  without slot shows `bannerPickDay` state; simplest: only enabled when
  date+time chosen — render disabled style opacity 0.5 and no-op). Below:
  `whatsappAlt` as `HoverLink` (opens wa.me with the drafted message including
  the slot if chosen) and `formHint` caption.
- **Confirm** (`submitting=true`): `fetch('/api/booking', { method: 'POST',
  headers: {'Content-Type': 'application/json'}, body })`. `200` ⇒
  `step='done'`. `409` ⇒ `error='slot_taken'`, re-GET taken, clear `time`.
  Other/network ⇒ `error='network'`. Errors shown under the buttons.
- **Step done**: centered check circle (accent ring + `✓`), `successTitle`
  (display 22), `successBody` with `{slot}`, outline `successAgain` → reset all
  state to step 'form'.
- Left column (heading/blurb/details) unchanged. Reveal entrances kept.

Draft/message composition for the WhatsApp fallback reuses the existing
`draft()` and appends the slot line when chosen.

## 4. Admin — "Solicitudes" view

- `src/admin/components/bookings-view.tsx`: loads `bookings` ordered by
  `createdAt desc` (client Firestore SDK via the existing dynamic
  firebase-client; owner rules allow read). Each row/card: `formatSlot`-style
  date+time, name, email, projectType · budget, message (multiline, dim),
  status chips (`nueva`, `confirmada`, `atendida` — `Chip` with
  `active={status===x}`, press → `updateDoc({ status })`), and a `HoverLink`
  `Responder` → `mailto:{email}`.
- `admin-screen.tsx`: `view` union gains `'bookings'`; toggle buttons add
  `Solicitudes`; renders `BookingsView` (content editor hidden in that view,
  same pattern as Métricas).

## 5. WhatsApp FAB pulse (every 30 s)

`whatsapp-fab.tsx`: add an absolutely-positioned ring `Animated.View` behind
the pill (same size, `borderRadius: 999`, `borderWidth: 2`, accent). Every
**30 s** (`setInterval` in `useEffect`, cleaned up on unmount) run two pulse
cycles: ring `scale 1 → 1.9`, `opacity 0.6 → 0` (600 ms each, sequenced), and a
subtle pill bounce (`scale 1 → 1.06 → 1`, 300 ms). Skipped entirely under
`prefers-reduced-motion`. First pulse fires 5 s after mount, then every 30 s.

## Data flow

Visitor → wizard state (local) → POST `/api/booking` → function validates →
Firestore `bookings` + Gmail SMTP email → admin reads/updates via client SDK
(owner rules). Availability: day select → GET `/api/booking?date=` → strike
taken slots. CMS pipeline unchanged for the new strings.

## Error handling

- Function: strict validation (400), slot conflict (409), email failure logged
  but non-fatal (booking persists), 405 for other methods.
- Client: `required`/`slot_taken`/`network` errors surfaced via CMS strings;
  GET availability failure degrades to "all free" (server still enforces
  conflicts at POST).
- Dev preview has no hosting rewrite → API calls fail → degraded UX in dev
  (all-free slots; submit shows network error). Full flow verified on the live
  site after deploy.
- Secret missing → functions deploy fails loudly; email path never silently
  drops a stored booking.

## Testing / verification

- `npx tsc --noEmit` (app) + `npm --prefix functions run build` (functions
  compile) + `npx expo export -p web` + bundle hygiene clean.
- Browser (preview): wizard renders step 1 with email field; stepper; step 2
  shows calendar (current month, weekends/past disabled, dots on bookable
  days), slot grid, banner states, back/confirm; success state after a mocked
  200 (verify POST payload composition by intercepting `fetch`); ES/EN toggle
  translates everything; FAB pulses (interval logic verified by code +
  triggering once with a short test interval in preview eval if throttling
  allows; otherwise live).
- Live (after deploy): real booking end-to-end → email arrives at
  luis.atorred24@gmail.com; the day's slot appears struck for the next visitor;
  `/admin` → Solicitudes lists it and status changes persist.
- Migration run + pull value-identical; `/admin` Contacto shows the new fields.

## Implementation order

1. Content model: types + seeds + published mirror + migration #3 + run + pull.
2. Backend: nodemailer dep, `submitBooking` (GET/POST), rules, rewrite;
   functions build.
3. Frontend wizard: booking-config, BookingCalendar, ContactSection rewrite.
4. Admin: BookingsView + screen toggle; admin contact-form new fields.
5. FAB pulse.
6. Verify + secret setup (user) + deploy functions/rules + hosting deploy +
   live end-to-end test.
