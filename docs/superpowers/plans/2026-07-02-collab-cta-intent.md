# Collaboration CTA Intent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The three Colaboración CTAs carry their model into the booking wizard (dismissible "Interesado en" chip), and the model travels through the POST → Firestore → notification email → admin Solicitudes view.

**Architecture:** A module-level pub/sub (`booking-intent.ts`) connects the two mounted sections; `ContactSection` subscribes and renders the chip + includes `model` in payload/draft; `submitBooking` stores/emails it; `BookingsView` displays it. One CMS field (`interestLabel`) + merge-only migration.

**Tech Stack:** Existing patterns only. No test runner.

**Verification note:** No jest. Verify with `npx tsc --noEmit`, `npm --prefix functions run build`, `npx expo export -p web`, browser preview, live POST. Do NOT run `npx expo lint`.

---

### Task 1: CMS — `interestLabel`

**Files:**
- Modify: `src/content/types.ts`, `src/content/seed/es.ts`, `src/content/seed/en.ts`
- Modify: `src/content/published/es.json`, `src/content/published/en.json`
- Modify: `src/admin/components/forms/contact-form.tsx`
- Create: `scripts/migrate-collab-intent.ts`

- [ ] **Step 1:** In `ContactContent` (types.ts) add `interestLabel: string;` after `errorNetwork: string;`. In `seed/es.ts` contact add `interestLabel: 'Interesado en',` after `errorNetwork`; in `seed/en.ts` add `interestLabel: 'Interested in',`.

- [ ] **Step 2:** Mirror into published JSON via a scratch tsx script (session scratchpad) that sets `doc.contact.interestLabel` from each seed and rewrites both files (2-space + newline). Run with `npx tsx`.

- [ ] **Step 3:** In admin `contact-form.tsx` append after the `errorNetwork` Field:

```tsx
      <Field label="interestLabel" value={value.interestLabel} onChangeText={(t) => set('interestLabel', t)} />
```

- [ ] **Step 4:** Create `scripts/migrate-collab-intent.ts`:

```ts
import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

// One-off migration: merge ONLY contact.interestLabel.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    await db.doc(`content/${id}`).set({ contact: { interestLabel: seed.contact.interestLabel } }, { merge: true });
    console.log(`Merged interestLabel into content/${id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

Run it (`npx tsx scripts/migrate-collab-intent.ts`, ADC fallback as usual), then
`npm run content:pull` (expect value-identical; keep pulled files).

- [ ] **Step 5:** `npx tsc --noEmit` → PASS. Commit:

```bash
git add src/content/ src/admin/components/forms/contact-form.tsx scripts/migrate-collab-intent.ts
git commit -m "feat(content): interestLabel for collaboration CTA intent (+migration)"
```

---

### Task 2: Frontend — intent module + CTAs + wizard chip/payload

**Files:**
- Create: `src/features/portfolio/sections/contact/booking-intent.ts`
- Modify: `src/features/portfolio/sections/collaboration/collaboration-section.tsx`
- Modify: `src/features/portfolio/sections/contact/contact-section.tsx`

- [ ] **Step 1:** Create `booking-intent.ts`:

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

- [ ] **Step 2:** In `collaboration-section.tsx` add
`import { setBookingIntent } from '../contact/booking-intent';` and change the
CTA to:

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

- [ ] **Step 3:** In `contact-section.tsx`:
  - Imports: add `useEffect` to the react import; add
    `import { onBookingIntent } from './booking-intent';`.
  - State (below `const [error, setError] = ...`):

```tsx
  const [model, setModel] = useState<string | null>(null);
  useEffect(() => onBookingIntent((m) => { setModel(m); setStep('form'); }), []);
```

  - Step-'form' UI: immediately BEFORE the name/email row `<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>`, add:

```tsx
                {model ? (
                  <View style={{ gap: 8 }}>
                    <Text style={FIELD_LABEL}>{contact.interestLabel}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <Chip label={model} mono={false} active onPress={() => setModel(null)} />
                    </View>
                  </View>
                ) : null}
```

  - `draft()`: after `const b = budget || '—';` add
    `const modelLine = model ? (locale === 'es' ? `\nModelo: ${model}.` : `\nModel: ${model}.`) : '';`
    and include `${modelLine}` right after `${b}.` in both templates (before `${slotLine}`).
  - `confirm()` body JSON: add `model: model ?? ''` after `budget`.
  - `reset()`: add `setModel(null);`.

- [ ] **Step 4:** `npx tsc --noEmit && npx expo export -p web` → PASS. Commit:

```bash
git add src/features/portfolio/sections/
git commit -m "feat(portfolio): collaboration CTAs carry model intent into the booking wizard"
```

---

### Task 3: Backend — model in booking + email; redeploy

**Files:**
- Modify: `functions/src/index.ts`

- [ ] **Step 1:** In `BookingPayload` add `model: string;` (after `budget`). In
`parseBookingPayload`'s object add
`model: typeof b.model === 'string' ? b.model.slice(0, 80) : '',` after `budget`.
In the handler destructure add `model` and include it in the Firestore `add({ … })`
(after `budget`). In the email `text` array add `` `Modelo: ${model || '—'}`, ``
after the `Presupuesto` line.

- [ ] **Step 2:** `npm --prefix functions run build` → PASS. Redeploy:
`firebase deploy --only functions:submitBooking --project luisdelatorre-portfolio --non-interactive`.
Commit:

```bash
git add functions/src/index.ts
git commit -m "feat(functions): booking model field in Firestore doc + email"
```

---

### Task 4: Admin — show the model

**Files:**
- Modify: `src/admin/firebase-client.ts` (`BookingRecord` gains `model: string;` after `budget`)
- Modify: `src/admin/components/bookings-view.tsx`

- [ ] **Step 1:** Add the field to `BookingRecord`. In `bookings-view.tsx`
change the meta `Text` to lead with the model:

```tsx
          <Text style={{ fontSize: 13, color: colors.textMuted }}>
            {b.model ? `${b.model} · ` : ''}
            {b.email}
            {b.projectType ? ` · ${b.projectType}` : ''}
            {b.budget ? ` · ${b.budget}` : ''}
          </Text>
```

- [ ] **Step 2:** `npx tsc --noEmit && npx expo export -p web` + hygiene grep →
PASS + clean. Commit:

```bash
git add src/admin/
git commit -m "feat(admin): show the collaboration model on booking cards"
```

---

### Task 5: Verify + deploy

- [ ] **Step 1: Preview.** Click each collaboration CTA → scrolls to contact and
the "Interesado en: {modelo}" chip appears (dismiss works); mocked POST includes
`model`; draft line "Modelo: …" present; reset clears the chip.
- [ ] **Step 2: Backend live check.** `curl -s -X POST … /submitBooking` with a
`model` → `{ok:true,…}`; the doc (and email) carry the model.
- [ ] **Step 3: Deploy.** PR flow; after merge `gh workflow run deploy.yml --ref main`
→ watch → live click-through.

---

## Self-Review

**1. Spec coverage:** CMS field+migration (T1) ✓ · intent module + CTAs + chip +
payload/draft/reset (T2) ✓ · backend model + redeploy (T3) ✓ · admin display
(T4) ✓ · verify/deploy (T5) ✓. **2. Placeholders:** none. **3. Consistency:**
`setBookingIntent(model.title)` ↔ `onBookingIntent` listener ↔ `model` state ↔
POST `model` ↔ `BookingPayload.model` ↔ doc/email ↔ `BookingRecord.model` ✓;
`interestLabel` used only in the chip label ✓.
