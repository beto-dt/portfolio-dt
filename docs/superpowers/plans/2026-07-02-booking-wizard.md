# Booking Wizard + Firestore + Email + FAB Pulse — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Two-step contact wizard (Proyecto → Agenda with calendar + real slot availability) whose submissions are stored in Firestore, emailed to luis.atorred24@gmail.com, and manageable from a new `/admin` "Solicitudes" view; plus a WhatsApp FAB that pulses every 30 s.

**Architecture:** A `submitBooking` gen2 function (GET availability / POST validate+store+email via Nodemailer with a `GMAIL_APP_PASSWORD` secret) behind a `/api/booking` hosting rewrite; `bookings` collection owner-only in rules (public writes only via Admin SDK). Frontend: `booking-config` constants, a `BookingCalendar` component, and a state-machine rewrite of `ContactSection`; 20 new CMS strings in `ContactContent` (seeds + published mirror + merge-only migration + admin form). Admin gains a `BookingsView` via the dynamic firebase-client. FAB gains an interval-driven pulse ring.

**Tech Stack:** firebase-functions v2 + firebase-admin + nodemailer (functions), Firestore client SDK (admin panel only), react-native-web + existing primitives. No test runner in this repo.

**Verification note:** No jest — verify with `npx tsc --noEmit` (app), `npm --prefix functions run build` (functions), `npx expo export -p web`, bundle-hygiene grep, browser preview, and a live end-to-end booking after deploy. Do NOT run `npx expo lint`. `dist/` gitignored. `service-account.json` local-only — NEVER commit. The Gmail App Password is pasted ONLY at the CLI's hidden prompt — never in chat, never in a file.

---

### Task 1: Content model — types + seeds + published mirror + admin form

**Files:**
- Modify: `src/content/types.ts` (ContactContent)
- Modify: `src/content/seed/es.ts`, `src/content/seed/en.ts`
- Modify: `src/content/published/es.json`, `src/content/published/en.json`
- Modify: `src/admin/components/forms/contact-form.tsx`

- [ ] **Step 1: Add 20 fields to `ContactContent` in `src/content/types.ts`** (after `formHint: string;`):

```ts
  formEmailLabel: string;
  formEmailPlaceholder: string;
  stepProjectLabel: string;
  stepScheduleLabel: string;
  nextCta: string;
  backCta: string;
  confirmCta: string;
  slotsHeading: string;
  slotsFreeSuffix: string;
  slotsPickDay: string;
  bannerPickDay: string;
  bannerPickTime: string;
  bannerScheduled: string;
  whatsappAlt: string;
  successTitle: string;
  successBody: string;
  successAgain: string;
  errorRequired: string;
  errorSlotTaken: string;
  errorNetwork: string;
```

- [ ] **Step 2: Seed values.** In `src/content/seed/es.ts` `contact`, set
`formHint: 'Recibirás una confirmación y el detalle llegará directo a mi correo. Respondo en menos de 24 h.'`
and append after it:

```ts
    formEmailLabel: 'Tu email',
    formEmailPlaceholder: 'nombre@correo.com',
    stepProjectLabel: 'Proyecto',
    stepScheduleLabel: 'Agenda',
    nextCta: 'Elegir día y hora →',
    backCta: '← Volver',
    confirmCta: 'Confirmar y enviar',
    slotsHeading: 'Horarios disponibles',
    slotsFreeSuffix: 'horarios libres',
    slotsPickDay: 'Selecciona primero un día en el calendario.',
    bannerPickDay: 'Elige un día y una hora para tu llamada gratuita de 30 min.',
    bannerPickTime: 'Día seleccionado. Ahora elige una hora.',
    bannerScheduled: 'Llamada de 30 min agendada para el {slot}.',
    whatsappAlt: 'o coordinar por WhatsApp',
    successTitle: '¡Solicitud enviada!',
    successBody: 'Recibí tu solicitud para el {slot}. Te confirmo por email en menos de 24 h.',
    successAgain: 'Enviar otra solicitud',
    errorRequired: 'Completa tu nombre y email para continuar.',
    errorSlotTaken: 'Ese horario acaba de ocuparse. Elige otro.',
    errorNetwork: 'No se pudo enviar. Intenta de nuevo o escríbeme por WhatsApp.',
```

In `src/content/seed/en.ts` `contact`, set
`formHint: "You'll get a confirmation and the details go straight to my inbox. I reply within 24 h."`
and append:

```ts
    formEmailLabel: 'Your email',
    formEmailPlaceholder: 'name@email.com',
    stepProjectLabel: 'Project',
    stepScheduleLabel: 'Schedule',
    nextCta: 'Pick a day and time →',
    backCta: '← Back',
    confirmCta: 'Confirm and send',
    slotsHeading: 'Available times',
    slotsFreeSuffix: 'open slots',
    slotsPickDay: 'Pick a day on the calendar first.',
    bannerPickDay: 'Pick a day and time for your free 30-min call.',
    bannerPickTime: 'Day selected. Now pick a time.',
    bannerScheduled: '30-min call scheduled for {slot}.',
    whatsappAlt: 'or coordinate via WhatsApp',
    successTitle: 'Request sent!',
    successBody: "I got your request for {slot}. I'll confirm by email within 24 h.",
    successAgain: 'Send another request',
    errorRequired: 'Fill in your name and email to continue.',
    errorSlotTaken: 'That time was just taken. Pick another.',
    errorNetwork: "Couldn't send. Try again or message me on WhatsApp.",
```

- [ ] **Step 3: Mirror into published JSON.** Write a scratch tsx script (in the
session scratchpad, not the repo) that imports both seeds, loads
`src/content/published/{es,en}.json`, `Object.assign`s the 21 contact keys
(`formHint` + the 20 new) from the seed of each locale, and writes the files back
(2-space JSON + trailing newline). Run it with `npx tsx`.

- [ ] **Step 4: Admin form.** In `src/admin/components/forms/contact-form.tsx`,
append after the `formHint` Field (all follow the same `set` pattern):

```tsx
      <Field label="formEmailLabel" value={value.formEmailLabel} onChangeText={(t) => set('formEmailLabel', t)} />
      <Field label="formEmailPlaceholder" value={value.formEmailPlaceholder} onChangeText={(t) => set('formEmailPlaceholder', t)} />
      <Field label="stepProjectLabel" value={value.stepProjectLabel} onChangeText={(t) => set('stepProjectLabel', t)} />
      <Field label="stepScheduleLabel" value={value.stepScheduleLabel} onChangeText={(t) => set('stepScheduleLabel', t)} />
      <Field label="nextCta" value={value.nextCta} onChangeText={(t) => set('nextCta', t)} />
      <Field label="backCta" value={value.backCta} onChangeText={(t) => set('backCta', t)} />
      <Field label="confirmCta" value={value.confirmCta} onChangeText={(t) => set('confirmCta', t)} />
      <Field label="slotsHeading" value={value.slotsHeading} onChangeText={(t) => set('slotsHeading', t)} />
      <Field label="slotsFreeSuffix" value={value.slotsFreeSuffix} onChangeText={(t) => set('slotsFreeSuffix', t)} />
      <Field label="slotsPickDay" value={value.slotsPickDay} onChangeText={(t) => set('slotsPickDay', t)} />
      <Field label="bannerPickDay" value={value.bannerPickDay} onChangeText={(t) => set('bannerPickDay', t)} />
      <Field label="bannerPickTime" value={value.bannerPickTime} onChangeText={(t) => set('bannerPickTime', t)} />
      <Field label="bannerScheduled" value={value.bannerScheduled} onChangeText={(t) => set('bannerScheduled', t)} />
      <Field label="whatsappAlt" value={value.whatsappAlt} onChangeText={(t) => set('whatsappAlt', t)} />
      <Field label="successTitle" value={value.successTitle} onChangeText={(t) => set('successTitle', t)} />
      <Field label="successBody" value={value.successBody} onChangeText={(t) => set('successBody', t)} multiline />
      <Field label="successAgain" value={value.successAgain} onChangeText={(t) => set('successAgain', t)} />
      <Field label="errorRequired" value={value.errorRequired} onChangeText={(t) => set('errorRequired', t)} />
      <Field label="errorSlotTaken" value={value.errorSlotTaken} onChangeText={(t) => set('errorSlotTaken', t)} />
      <Field label="errorNetwork" value={value.errorNetwork} onChangeText={(t) => set('errorNetwork', t)} />
```

- [ ] **Step 5: `npx tsc --noEmit`** → PASS. Commit:

```bash
git add src/content/types.ts src/content/seed/es.ts src/content/seed/en.ts src/content/published/es.json src/content/published/en.json src/admin/components/forms/contact-form.tsx
git commit -m "feat(content): booking wizard strings in ContactContent (types, seeds, published, admin form)"
```

---

### Task 2: Migration #3 (merge-only) + pull

**Files:**
- Create: `scripts/migrate-booking-wizard.ts`

- [ ] **Step 1: Create the script** (same init pattern as
`scripts/migrate-formation-contact.ts`):

```ts
import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

const KEYS = [
  'formHint', 'formEmailLabel', 'formEmailPlaceholder', 'stepProjectLabel', 'stepScheduleLabel',
  'nextCta', 'backCta', 'confirmCta', 'slotsHeading', 'slotsFreeSuffix', 'slotsPickDay',
  'bannerPickDay', 'bannerPickTime', 'bannerScheduled', 'whatsappAlt', 'successTitle',
  'successBody', 'successAgain', 'errorRequired', 'errorSlotTaken', 'errorNetwork',
] as const;

// One-off migration: merge ONLY the wizard strings into contact.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    const contact = Object.fromEntries(KEYS.map((k) => [k, seed.contact[k]]));
    await db.doc(`content/${id}`).set({ contact }, { merge: true });
    console.log(`Merged booking wizard strings into content/${id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run** `npx tsx scripts/migrate-booking-wizard.ts` (fallback
`GOOGLE_APPLICATION_CREDENTIALS=./service-account.json` prefix). If credentials
unavailable: commit the script, mark run BLOCKED, continue.

- [ ] **Step 3:** `npm run content:pull` → diff should be value-identical
(key-order shuffles OK — verify with an order-independent JSON compare against
`git show HEAD:…`; keep the pulled version). Commit:

```bash
git add scripts/migrate-booking-wizard.ts src/content/published/
git commit -m "feat(content): one-off migration for booking wizard strings (merge-only)"
```

---

### Task 3: Backend — submitBooking + rules + rewrite

**Files:**
- Modify: `functions/package.json` (deps)
- Modify: `functions/src/index.ts`
- Modify: `firestore.rules`
- Modify: `firebase.json`

- [ ] **Step 1: Add nodemailer.** Run:
`npm --prefix functions install nodemailer && npm --prefix functions install -D @types/nodemailer`

- [ ] **Step 2: Extend `functions/src/index.ts`.** Add to the imports
`import nodemailer from 'nodemailer';` and below the existing `GITHUB_TOKEN`
secret add:

```ts
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');

const SLOT_TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const MAX_DAYS_AHEAD = 60;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BOOKING_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Valid booking day: real date, Mon–Fri, today..+60d in the site's GMT-5. */
function isValidBookingDate(iso: string): boolean {
  if (!DATE_RE.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return false;
  const dow = date.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  const now = new Date(Date.now() - 5 * 3600 * 1000);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const target = Date.UTC(y, m - 1, d);
  return target >= today && target <= today + MAX_DAYS_AHEAD * 86400 * 1000;
}
```

And at the end of the file append the function:

```ts
export const submitBooking = onRequest(
  { secrets: [GMAIL_APP_PASSWORD], region: 'us-central1' },
  async (req, res) => {
    if (req.method === 'GET') {
      const date = String(req.query.date ?? '');
      if (!DATE_RE.test(date)) {
        res.status(400).json({ error: 'invalid' });
        return;
      }
      const snap = await db.collection('bookings').where('date', '==', date).get();
      const taken = snap.docs
        .filter((docSnap) => docSnap.get('status') !== 'cancelled')
        .map((docSnap) => String(docSnap.get('time')));
      res.json({ taken });
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'method' });
      return;
    }
    const b = (req.body ?? {}) as Record<string, unknown>;
    const name = typeof b.name === 'string' ? b.name.trim() : '';
    const email = typeof b.email === 'string' ? b.email.trim() : '';
    const projectType = typeof b.projectType === 'string' ? b.projectType.slice(0, 60) : '';
    const budget = typeof b.budget === 'string' ? b.budget.slice(0, 60) : '';
    const message = typeof b.message === 'string' ? b.message.slice(0, 2000) : '';
    const date = typeof b.date === 'string' ? b.date : '';
    const time = typeof b.time === 'string' ? b.time : '';
    const locale = b.locale === 'en' ? 'en' : 'es';
    if (
      !name || name.length > 120 ||
      !BOOKING_EMAIL_RE.test(email) || email.length > 200 ||
      !isValidBookingDate(date) || !SLOT_TIMES.includes(time)
    ) {
      res.status(400).json({ error: 'invalid' });
      return;
    }
    const existing = await db.collection('bookings').where('date', '==', date).where('time', '==', time).get();
    if (existing.docs.some((docSnap) => docSnap.get('status') !== 'cancelled')) {
      res.status(409).json({ error: 'slot_taken' });
      return;
    }
    await db.collection('bookings').add({
      name, email, projectType, budget, message, date, time, locale,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    });
    let emailed = true;
    try {
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: ADMIN_EMAIL, pass: GMAIL_APP_PASSWORD.value() },
      });
      await transport.sendMail({
        from: `Portfolio <${ADMIN_EMAIL}>`,
        to: ADMIN_EMAIL,
        replyTo: email,
        subject: `Nueva solicitud — ${name} · ${date} ${time}`,
        text: [
          `Nombre: ${name}`,
          `Email: ${email}`,
          `Tipo: ${projectType || '—'}`,
          `Presupuesto: ${budget || '—'}`,
          `Fecha: ${date} ${time} (GMT-5)`,
          `Idioma: ${locale}`,
          '',
          'Mensaje:',
          message || '—',
        ].join('\n'),
      });
    } catch (error) {
      emailed = false;
      console.error('booking email failed', error);
    }
    res.json({ ok: true, emailed });
  },
);
```

- [ ] **Step 3: Rules.** In `firestore.rules`, before the `match /{document=**}`
catch-all, add:

```
    match /bookings/{doc} {
      allow read, update, delete: if request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email == 'luis.atorred24@gmail.com';
      allow create: if false;
    }
```

- [ ] **Step 4: Rewrite.** In `firebase.json` `hosting.rewrites`, add after the
`/api/visit` entry:

```json
      {
        "source": "/api/booking",
        "function": { "functionId": "submitBooking", "region": "us-central1" }
      }
```

- [ ] **Step 5: Build functions** — `npm --prefix functions run build` → PASS.
Commit:

```bash
git add functions/package.json functions/package-lock.json functions/src/index.ts firestore.rules firebase.json
git commit -m "feat(functions): submitBooking (availability GET, validated POST, Firestore + Gmail email)"
```

---

### Task 4: Frontend wizard — booking-config + BookingCalendar + ContactSection

**Files:**
- Create: `src/features/portfolio/sections/contact/booking-config.ts`
- Create: `src/features/portfolio/sections/contact/booking-calendar.tsx`
- Modify: `src/features/portfolio/sections/contact/contact-section.tsx` (rewrite)

- [ ] **Step 1: Create `booking-config.ts`:**

```ts
import type { Locale } from '@/i18n/locales';

export const SLOT_TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
export const MAX_DAYS_AHEAD = 60;

const MONTHS: Record<Locale, string[]> = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const WEEKDAY_HEADERS: Record<Locale, string[]> = {
  es: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
};
const DAY_ABBR: Record<Locale, string[]> = {
  es: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export function monthName(locale: Locale, monthIndex: number): string {
  return MONTHS[locale][monthIndex];
}
export function weekdayHeaders(locale: Locale): string[] {
  return WEEKDAY_HEADERS[locale];
}

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Bookable: Mon–Fri, from today up to MAX_DAYS_AHEAD days out (visitor's clock). */
export function isBookableDay(d: Date): boolean {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const max = new Date(today);
  max.setDate(max.getDate() + MAX_DAYS_AHEAD);
  return target >= today && target <= max;
}

/** "Mi 15 Julio · 10:00 (GMT-5)" / "Wed July 15 · 10:00 (GMT-5)" */
export function formatSlot(iso: string, time: string, locale: Locale): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const abbr = DAY_ABBR[locale][date.getDay()];
  const month = MONTHS[locale][m - 1];
  return locale === 'es' ? `${abbr} ${d} ${month} · ${time} (GMT-5)` : `${abbr} ${month} ${d} · ${time} (GMT-5)`;
}
```

- [ ] **Step 2: Create `booking-calendar.tsx`:**

```tsx
import { useState } from 'react';
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import type { Locale } from '@/i18n/locales';
import { colors, fonts, radii } from '@/theme/tokens';
import { isBookableDay, monthName, toISO, weekdayHeaders } from './booking-config';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const cellWeb = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color, border-color', transitionDuration: '140ms' } as object)
  : null;

function NavButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ hovered }: HoverState) => [
        {
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: hovered && !disabled ? colors.borderStrong : colors.border,
          opacity: disabled ? 0.35 : 1,
        },
        disabled ? null : (cellWeb as object),
      ]}
    >
      <Text style={{ color: colors.text, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

function DayCell({ date, selected, onSelect }: { date: Date; selected: string | null; onSelect: (iso: string) => void }) {
  const iso = toISO(date);
  const bookable = isBookableDay(date);
  const isSelected = selected === iso;
  return (
    <Pressable
      onPress={bookable ? () => onSelect(iso) : undefined}
      style={({ hovered }: HoverState) => [
        {
          aspectRatio: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: isSelected ? colors.accent : bookable ? (hovered ? colors.borderStrong : colors.border) : 'transparent',
          backgroundColor: isSelected ? colors.accent : bookable && hovered ? colors.surfaceStrong : bookable ? colors.surface : 'transparent',
          opacity: bookable ? 1 : 0.35,
        },
        bookable ? (cellWeb as object) : null,
      ]}
    >
      <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: isSelected ? colors.onAccent : colors.text }}>{date.getDate()}</Text>
      <View style={{ width: 4, height: 4, borderRadius: 999, backgroundColor: bookable ? (isSelected ? colors.onAccent : colors.accent) : 'transparent' }} />
    </Pressable>
  );
}

/** Monday-first monthly grid; bookable weekdays get an accent dot. */
export function BookingCalendar({ selected, onSelect, locale }: { selected: string | null; onSelect: (iso: string) => void; locale: Locale }) {
  const [monthOffset, setMonthOffset] = useState(0); // current month .. +2

  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = first.getFullYear();
  const month = first.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.text }}>
          {monthName(locale, month)} {year}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <NavButton label="‹" disabled={monthOffset === 0} onPress={() => setMonthOffset((m) => Math.max(0, m - 1))} />
          <NavButton label="›" disabled={monthOffset === 2} onPress={() => setMonthOffset((m) => Math.min(2, m + 1))} />
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {weekdayHeaders(locale).map((w) => (
          <Text key={w} style={{ flex: 1, textAlign: 'center', fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint, paddingVertical: 4 }}>
            {w}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => (
          <View key={i} style={{ width: `${100 / 7}%`, padding: 3 }}>
            {d ? <DayCell date={d} selected={selected} onSelect={onSelect} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Rewrite `contact-section.tsx`.** Keep the card, grid, left
column, `Detail`, `FormInput`, `FIELD_LABEL` and web casts exactly as they are
today; replace the right column with the wizard. Full file:

```tsx
import { useState } from 'react';
import { Linking, Platform, Pressable, Text, TextInput, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { BookingCalendar } from './booking-calendar';
import { SLOT_TIMES, formatSlot } from './booking-config';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { Chip } from '@/ui/chip';
import { HoverLink } from '@/ui/hover-link';
import { Reveal } from '@/ui/reveal';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const labelTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '180ms' } as object) : null;
const underlineTransition = Platform.OS === 'web' ? ({ transformOrigin: 'left', transitionProperty: 'transform', transitionDuration: '200ms' } as object) : null;
const inputTransition = Platform.OS === 'web' ? ({ transitionProperty: 'border-color', transitionDuration: '160ms' } as object) : null;
const slotTransition = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'background-color, border-color', transitionDuration: '140ms' } as object) : null;
const cardGlowWeb = Platform.OS === 'web'
  ? ({ backgroundImage: 'radial-gradient(700px 420px at 85% 0%, rgba(228,227,87,0.07), rgba(228,227,87,0) 70%)' } as object)
  : null;
const cardGridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', columnGap: 56, rowGap: 40 } as object)
  : null;

const FIELD_LABEL = { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase' as const, color: colors.textFaint };
const ERROR_COLOR = '#ff8a8a';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Step = 'form' | 'schedule' | 'done';
type WizardError = 'required' | 'slot_taken' | 'network' | null;

function Detail({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  if (!value) return null;
  return (
    <Pressable style={{ gap: 3, minWidth: 150 }}>
      {({ hovered }: HoverState) => (
        <>
          <View style={{ gap: 4, alignSelf: 'flex-start' }}>
            <Text style={[FIELD_LABEL, { color: hovered ? colors.accent : colors.textFaint }, labelTransition as object]}>{label}</Text>
            <View style={[{ height: 2, borderRadius: 2, backgroundColor: colors.accent, transform: [{ scaleX: hovered ? 1 : 0 }] }, underlineTransition as object]} />
          </View>
          {onPress ? (
            <HoverLink label={value} onPress={onPress} color={colors.accent} hoverColor={colors.text} />
          ) : (
            <Text style={{ fontSize: 13.5, color: colors.textMuted }}>{value}</Text>
          )}
        </>
      )}
    </Pressable>
  );
}

/** Dark themed input with accent focus ring; multiline for the message box. */
function FormInput({ value, onChangeText, placeholder, multiline }: { value: string; onChangeText: (t: string) => void; placeholder: string; multiline?: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      multiline={!!multiline}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: focused ? 'rgba(228,227,87,0.4)' : colors.border,
          borderRadius: radii.md,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: colors.text,
          fontSize: 14,
          fontFamily: fonts.body,
          ...(multiline ? { minHeight: 130, textAlignVertical: 'top' as const } : null),
        },
        inputTransition as object,
      ]}
    />
  );
}

function StepDot({ n, active }: { n: string; active: boolean }) {
  return (
    <View style={{ width: 22, height: 22, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.accent : colors.surfaceStrong, borderWidth: 1, borderColor: active ? colors.accent : colors.border }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: active ? colors.onAccent : colors.textFaint }}>{n}</Text>
    </View>
  );
}

function Stepper({ step, projectLabel, scheduleLabel }: { step: Step; projectLabel: string; scheduleLabel: string }) {
  const two = step !== 'form';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 }}>
      <StepDot n="1" active />
      <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.text }}>{projectLabel}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <StepDot n="2" active={two} />
      <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: two ? colors.text : colors.textFaint }}>{scheduleLabel}</Text>
    </View>
  );
}

export function ContactSection() {
  const { content, locale } = useI18n();
  const { contact } = content;
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [taken, setTaken] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<WizardError>(null);

  const slot = date && time ? formatSlot(date, time, locale) : null;

  const fetchTaken = async (iso: string) => {
    try {
      const res = await fetch(`/api/booking?date=${iso}`);
      if (!res.ok) throw new Error('bad status');
      const data = (await res.json()) as { taken?: string[] };
      setTaken(Array.isArray(data.taken) ? data.taken : []);
    } catch {
      setTaken([]); // dev/offline: the server still enforces conflicts on POST
    }
  };

  const onPickDay = (iso: string) => {
    setDate(iso);
    setTime(null);
    setError(null);
    void fetchTaken(iso);
  };

  const goSchedule = () => {
    if (!name.trim() || !EMAIL_RE.test(email.trim())) {
      setError('required');
      return;
    }
    setError(null);
    setStep('schedule');
  };

  const draft = () => {
    const n = name || '—';
    const t = type || '—';
    const b = budget || '—';
    const slotLine = slot ? (locale === 'es' ? `\nLlamada: ${slot}.` : `\nCall: ${slot}.`) : '';
    return locale === 'es'
      ? `Hola Luis, soy ${n}.\nTipo de proyecto: ${t}.\nPresupuesto estimado: ${b}.${slotLine}\n\n${message}`
      : `Hi Luis, I'm ${n}.\nProject type: ${t}.\nEstimated budget: ${b}.${slotLine}\n\n${message}`;
  };

  const confirm = async () => {
    if (!date || !time || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), projectType: type ?? '', budget: budget ?? '', message, date, time, locale }),
      });
      if (res.status === 409) {
        setError('slot_taken');
        setTime(null);
        void fetchTaken(date);
        return;
      }
      if (!res.ok) throw new Error('bad status');
      setStep('done');
    } catch {
      setError('network');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep('form');
    setName('');
    setEmail('');
    setType(null);
    setBudget(null);
    setMessage('');
    setDate(null);
    setTime(null);
    setTaken([]);
    setError(null);
  };

  const errorText =
    error === 'required' ? contact.errorRequired :
    error === 'slot_taken' ? contact.errorSlotTaken :
    error === 'network' ? contact.errorNetwork : null;
  const freeCount = SLOT_TIMES.filter((t) => !taken.includes(t)).length;
  const banner = !date ? contact.bannerPickDay : !time ? contact.bannerPickTime : contact.bannerScheduled.replace('{slot}', slot ?? '');

  return (
    <Container style={{ paddingVertical: 72 }} nativeID="contact">
      <View
        style={[
          { borderRadius: 24, borderWidth: 1, borderColor: 'rgba(228,227,87,0.25)', backgroundColor: 'rgba(255,255,255,0.02)', padding: 44 },
          cardGlowWeb as object,
        ]}
      >
        <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 40 }, cardGridWeb as object]}>
          <View>
            <Reveal delay={0}>
              <SectionHeading kicker={contact.kicker} heading={contact.heading} />
            </Reveal>
            <Reveal delay={70}>
              <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560 }}>{contact.blurb}</Text>
            </Reveal>
            <Reveal delay={140}>
              <View style={{ gap: 18, marginTop: 28, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Detail label="Email" value={contact.email} onPress={() => Linking.openURL(`mailto:${contact.email}`)} />
                <Detail label="Teléfono" value={contact.phone} onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\s/g, '')}`)} />
                <Detail label="LinkedIn" value={contact.linkedinLabel} onPress={() => Linking.openURL(contact.linkedin)} />
                <Detail label="Ubicación" value={contact.location} />
              </View>
            </Reveal>
          </View>

          <Reveal delay={140}>
            <Stepper step={step} projectLabel={contact.stepProjectLabel} scheduleLabel={contact.stepScheduleLabel} />
            {step === 'form' ? (
              <View style={{ gap: 18 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                  <View style={{ gap: 8, flexGrow: 1, flexBasis: 180 }}>
                    <Text style={FIELD_LABEL}>{contact.formNameLabel}</Text>
                    <FormInput value={name} onChangeText={setName} placeholder={contact.formNamePlaceholder} />
                  </View>
                  <View style={{ gap: 8, flexGrow: 1, flexBasis: 180 }}>
                    <Text style={FIELD_LABEL}>{contact.formEmailLabel}</Text>
                    <FormInput value={email} onChangeText={setEmail} placeholder={contact.formEmailPlaceholder} />
                  </View>
                </View>
                <View style={{ gap: 8 }}>
                  <Text style={FIELD_LABEL}>{contact.formTypeLabel}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {contact.projectTypes.map((t) => (
                      <Chip key={t} label={t} mono={false} active={type === t} onPress={() => setType(type === t ? null : t)} />
                    ))}
                  </View>
                </View>
                <View style={{ gap: 8 }}>
                  <Text style={FIELD_LABEL}>{contact.formBudgetLabel}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {contact.budgets.map((b) => (
                      <Chip key={b} label={b} active={budget === b} onPress={() => setBudget(budget === b ? null : b)} />
                    ))}
                  </View>
                </View>
                <View style={{ gap: 8 }}>
                  <Text style={FIELD_LABEL}>{contact.formMessageLabel}</Text>
                  <FormInput value={message} onChangeText={setMessage} placeholder={contact.formMessagePlaceholder} multiline />
                </View>
                <AppButton label={contact.nextCta} onPress={goSchedule} variant="primary" />
                {errorText ? <Text style={{ color: ERROR_COLOR, fontSize: 13 }}>{errorText}</Text> : null}
              </View>
            ) : step === 'schedule' ? (
              <View style={{ gap: 16 }}>
                <BookingCalendar selected={date} onSelect={onPickDay} locale={locale} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <Text style={FIELD_LABEL}>{contact.slotsHeading}</Text>
                  {date ? (
                    <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accent }}>
                      {freeCount} {contact.slotsFreeSuffix}
                    </Text>
                  ) : null}
                </View>
                {date ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {SLOT_TIMES.map((t) => {
                      const isTaken = taken.includes(t);
                      const sel = time === t;
                      return (
                        <Pressable
                          key={t}
                          onPress={isTaken ? undefined : () => { setTime(t); setError(null); }}
                          style={({ hovered }: HoverState) => [
                            {
                              borderRadius: radii.sm,
                              borderWidth: 1,
                              paddingHorizontal: 18,
                              paddingVertical: 9,
                              borderColor: sel ? colors.accent : hovered && !isTaken ? colors.borderStrong : colors.border,
                              backgroundColor: sel ? colors.accent : hovered && !isTaken ? colors.surfaceStrong : 'transparent',
                              opacity: isTaken ? 0.4 : 1,
                            },
                            isTaken ? null : (slotTransition as object),
                          ]}
                        >
                          <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: sel ? colors.onAccent : colors.text, textDecorationLine: isTaken ? 'line-through' : 'none' }}>
                            {t}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={{ fontSize: 13.5, color: colors.textDim }}>{contact.slotsPickDay}</Text>
                )}
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(228,227,87,0.35)', borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: 'rgba(228,227,87,0.05)' }}>
                  <Text style={{ fontSize: 14 }}>🗓</Text>
                  <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.textMuted }}>{banner}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                  <AppButton label={contact.backCta} onPress={() => setStep('form')} variant="outline" />
                  <View style={{ flexGrow: 1, opacity: date && time ? 1 : 0.5 }}>
                    <AppButton label={submitting ? '…' : contact.confirmCta} onPress={confirm} variant="primary" />
                  </View>
                </View>
                {errorText ? <Text style={{ color: ERROR_COLOR, fontSize: 13 }}>{errorText}</Text> : null}
                <HoverLink label={contact.whatsappAlt} onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(draft())}`)} color={colors.textFaint} hoverColor={colors.accent} />
                <Text style={{ fontSize: 12.5, lineHeight: 18, color: colors.textFaint }}>{contact.formHint}</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', gap: 14, paddingVertical: 24 }}>
                <View style={{ width: 64, height: 64, borderRadius: 999, borderWidth: 2, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(228,227,87,0.08)' }}>
                  <Text style={{ fontSize: 26, color: colors.accent }}>✓</Text>
                </View>
                <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text, textAlign: 'center' }}>{contact.successTitle}</Text>
                <Text style={{ fontSize: 14.5, lineHeight: 23, color: colors.textMuted, textAlign: 'center', maxWidth: 400 }}>
                  {contact.successBody.replace('{slot}', slot ?? '')}
                </Text>
                <AppButton label={contact.successAgain} onPress={reset} variant="outline" />
              </View>
            )}
          </Reveal>
        </View>
      </View>
    </Container>
  );
}
```

- [ ] **Step 4: `npx tsc --noEmit && npx expo export -p web`** → PASS. Commit:

```bash
git add src/features/portfolio/sections/contact/
git commit -m "feat(portfolio): two-step booking wizard with calendar + live slot availability"
```

---

### Task 5: Admin — bookings repo/view + screen toggle

**Files:**
- Modify: `src/admin/firebase-client.ts`
- Create: `src/admin/bookings-repo.ts`
- Create: `src/admin/components/bookings-view.tsx`
- Modify: `src/admin/screens/admin-screen.tsx`

- [ ] **Step 1: firebase-client additions.** Extend the firestore import to
`import { getFirestore, doc, getDoc, updateDoc, collection, getDocs, orderBy, query, type DocumentData } from 'firebase/firestore';`
and append:

```ts
export type BookingRecord = {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  message: string;
  date: string;
  time: string;
  locale: string;
  status: string;
};

export async function readBookings(): Promise<BookingRecord[]> {
  const { db } = services();
  const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookingRecord, 'id'>) }));
}

export async function updateBookingStatus(id: string, status: string): Promise<void> {
  const { db } = services();
  await updateDoc(doc(db, 'bookings', id), { status });
}
```

- [ ] **Step 2: Create `src/admin/bookings-repo.ts`** (dynamic-import wrapper —
keeps the SDK out of eagerly-loaded admin code, same as content-repo):

```ts
export type { BookingRecord } from './firebase-client';

export async function loadBookings() {
  const fb = await import('./firebase-client');
  return fb.readBookings();
}

export async function setBookingStatus(id: string, status: string) {
  const fb = await import('./firebase-client');
  return fb.updateBookingStatus(id, status);
}
```

- [ ] **Step 3: Create `src/admin/components/bookings-view.tsx`:**

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import { Chip } from '@/ui/chip';
import { HoverLink } from '@/ui/hover-link';
import { loadBookings, setBookingStatus, type BookingRecord } from '../bookings-repo';

const STATUSES = ['new', 'confirmed', 'done'] as const;
const STATUS_LABEL: Record<string, string> = { new: 'nueva', confirmed: 'confirmada', done: 'atendida' };

export function BookingsView() {
  const [items, setItems] = useState<BookingRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadBookings()
      .then((b) => active && setItems(b))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, []);

  const onStatus = async (id: string, status: string) => {
    setItems((prev) => prev?.map((b) => (b.id === id ? { ...b, status } : b)) ?? prev);
    try {
      await setBookingStatus(id, status);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (error) return <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text>;
  if (!items) return <ActivityIndicator color={colors.accent} />;
  if (items.length === 0) return <Text style={{ color: colors.textDim, fontSize: 13.5 }}>Sin solicitudes todavía.</Text>;

  return (
    <View style={{ gap: 12 }}>
      {items.map((b) => (
        <View key={b.id} style={{ gap: 8, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.accent }}>
              {b.date} · {b.time} (GMT-5)
            </Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{(b.locale || '').toUpperCase()}</Text>
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.text }}>{b.name}</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>
            {b.email}
            {b.projectType ? ` · ${b.projectType}` : ''}
            {b.budget ? ` · ${b.budget}` : ''}
          </Text>
          {b.message ? <Text style={{ fontSize: 13, lineHeight: 20, color: colors.textDim }}>{b.message}</Text> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {STATUSES.map((s) => (
              <Chip key={s} label={STATUS_LABEL[s]} active={b.status === s} onPress={() => onStatus(b.id, s)} />
            ))}
            <HoverLink label="Responder" onPress={() => Linking.openURL(`mailto:${b.email}`)} color={colors.accent} hoverColor={colors.text} />
          </View>
        </View>
      ))}
    </View>
  );
}
```

- [ ] **Step 4: Wire into `admin-screen.tsx`:**
  - Import: `import { BookingsView } from '../components/bookings-view';`
  - State union: `const [view, setView] = useState<'content' | 'metrics' | 'bookings'>('content');`
  - Replace the single view-toggle `AppButton` (`label={view === 'content' ? 'Métricas' : 'Editar'}…`) with:

```tsx
          {view !== 'content' ? <AppButton label="Editar" onPress={() => setView('content')} variant="pill" size="sm" /> : null}
          {view !== 'metrics' ? <AppButton label="Métricas" onPress={() => setView('metrics')} variant="pill" size="sm" /> : null}
          {view !== 'bookings' ? <AppButton label="Solicitudes" onPress={() => setView('bookings')} variant="pill" size="sm" /> : null}
```

  - Render: change `{view === 'metrics' ? (<MetricsView />) : (…)}` to
    `{view === 'metrics' ? (<MetricsView />) : view === 'bookings' ? (<BookingsView />) : (…)}`.

- [ ] **Step 5: `npx tsc --noEmit && npx expo export -p web`** + hygiene grep
(`grep -rl "initializeApp\|firebase/auth" dist/_expo/static/js/web | grep -v firebase-client || echo clean`)
→ PASS + `clean`. Commit:

```bash
git add src/admin/
git commit -m "feat(admin): Solicitudes view for bookings (list + status + reply)"
```

---

### Task 6: FAB pulse every 30 s

**Files:**
- Modify: `src/features/portfolio/components/whatsapp-fab.tsx` (full rewrite)

- [ ] **Step 1: Replace the file with:**

```tsx
import { useEffect, useRef } from 'react';
import { Animated, Linking, Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const fabFixedWeb = Platform.OS === 'web' ? ({ position: 'fixed' } as object) : null;
const fabInteractiveWeb = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'transform, background-color, box-shadow', transitionDuration: '160ms' } as object)
  : null;
const fabGlowWeb = Platform.OS === 'web' ? ({ boxShadow: '0 10px 30px rgba(228,227,87,0.35)' } as object) : null;

const PULSE_INTERVAL_MS = 30000;
const FIRST_PULSE_MS = 5000;

/** Floating WhatsApp pill; pulses an accent ring every 30 s to draw attention. */
export function WhatsAppFab() {
  const { content } = useI18n();
  const { contact } = content;
  const ring = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const pulse = () =>
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(ring, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(ring, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(ring, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(bounce, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]),
      ]).start();
    const first = setTimeout(pulse, FIRST_PULSE_MS);
    const every = setInterval(pulse, PULSE_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, [ring, bounce]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 50,
          transform: [{ scale: bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
        },
        fabFixedWeb as object,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: colors.accent,
          opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
          transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
        }}
      />
      <Pressable
        onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}`)}
        style={({ hovered, pressed }: HoverState) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            backgroundColor: hovered ? '#eeed6b' : colors.accent,
            borderRadius: 999,
            paddingHorizontal: 18,
            paddingVertical: 12,
            opacity: pressed ? 0.85 : 1,
            transform: [{ scale: hovered ? 1.04 : 1 }],
          },
          fabInteractiveWeb as object,
          fabGlowWeb as object,
        ]}
      >
        <Text style={{ fontSize: 16, color: colors.onAccent }}>✆</Text>
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.onAccent }}>WhatsApp</Text>
      </Pressable>
    </Animated.View>
  );
}
```

- [ ] **Step 2: `npx tsc --noEmit`** → PASS. Commit:

```bash
git add src/features/portfolio/components/whatsapp-fab.tsx
git commit -m "feat(portfolio): WhatsApp FAB pulses every 30s (reduced-motion aware)"
```

---

### Task 7: Verify, secret, deploy, live end-to-end

**Files:** none.

- [ ] **Step 1: Full build.** `npx tsc --noEmit && npm --prefix functions run
build && npx expo export -p web` + hygiene grep → PASS + `clean`.

- [ ] **Step 2: Browser (preview).** Wizard step 1 (name+email inputs, chips,
next CTA + required-error path); step 2 (calendar current month, weekend/past
disabled, dots, month nav; `slotsPickDay` before picking; after picking a day
the slot grid renders — availability GET fails in dev ⇒ all free, expected);
banner states; back/confirm; intercept `fetch` via `preview_eval` to return 200
and verify the POST payload + success state; ES/EN toggle; FAB renders (pulse
interval verified live).

- [ ] **Step 3: Secret (user action — coordinate in chat).** User creates a
Gmail App Password (`https://myaccount.google.com/apppasswords`, requires 2FA)
and runs `firebase functions:secrets:set GMAIL_APP_PASSWORD --project
luisdelatorre-portfolio`, pasting the password ONLY at the hidden prompt.

- [ ] **Step 4: Deploy backend.** `firebase deploy --only
functions,firestore:rules --project luisdelatorre-portfolio` → deploys
`submitBooking` (+ existing functions) and the bookings rules.

- [ ] **Step 5: Merge + hosting deploy** (PR flow as usual; `gh workflow run
deploy.yml --ref main` after merge) — the new `/api/booking` rewrite ships with
hosting.

- [ ] **Step 6: Live end-to-end.** Make a real booking on luisdelatorre.dev →
expect: success state; email at luis.atorred24@gmail.com; the slot struck for
that day on a fresh visit; `/admin` → Solicitudes lists it; status change
persists after reload.

---

## Self-Review

**1. Spec coverage:** CMS strings (T1) + migration (T2) ✓ · submitBooking
GET/POST + validation + 409 + nodemailer + rules + rewrite (T3) ✓ · wizard
(config/calendar/section state machine, banner states, errors, success, wa
fallback) (T4) ✓ · admin Solicitudes (repo/view/toggle) (T5) ✓ · FAB 30 s pulse
(T6) ✓ · verify/secret/deploy/live (T7) ✓. No gaps.

**2. Placeholder scan:** none — full code in every code step; T1 Step 3 defines
the scratch-script procedure precisely (pattern already used twice in this
repo).

**3. Type consistency:**
- `ContactContent` new keys (T1) match every usage in T4 and the admin fields ✓.
- `BookingCalendar { selected, onSelect, locale }` (T4 Step 2) matches its call
  site (T4 Step 3) ✓; `formatSlot(iso, time, locale)`/`SLOT_TIMES` shared ✓ and
  duplicated intentionally in the function (server-side source of truth) ✓.
- `BookingRecord` (T5 Step 1) fields match what the function writes (T3) minus
  `createdAt` (unused in the view) ✓.
- `submitBooking` responses (`{taken}`, `409 slot_taken`, `{ok, emailed}`) match
  the client's handling (T4 `fetchTaken`/`confirm`) ✓.
- Firestore queries are equality-only (no composite index needed) ✓.
- Admin `view` union + toggle buttons + render branch consistent (T5 Step 4) ✓.
