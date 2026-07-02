# Formation Columns + Contact Form + WhatsApp FAB — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Certificaciones + Educación side by side (restyled, with new seeded content), a Contacto card with a form that pre-drafts a WhatsApp/email message (no backend), and a footer logo + global floating WhatsApp button — bilingual and CMS-backed.

**Architecture:** Extend `ContactContent` (form labels/options + `linkedinLabel`); replace `certifications.items`/`education.items` and update contact values via a merge-only migration; new `FormationSection` replaces the two old sections; `contact-section.tsx` is rewritten as a 2-column accent card with local form state that composes `wa.me`/`mailto` URLs; `WhatsAppFab` renders outside the ScrollView; the admin Contacto form gains the new fields.

**Tech Stack:** Expo Router + react-native-web (grid/transition casts), Firestore CMS pipeline, `TextInput`/`Chip`/`AppButton`/`Reveal` primitives. No test runner in this repo.

**Verification note:** No jest — verify with `npx tsc --noEmit`, `npx expo export -p web`, bundle-hygiene grep, browser preview. Do NOT run `npx expo lint`. `dist/` is gitignored — leave it. `service-account.json` exists locally, is gitignored — NEVER commit it.

---

### Task 1: Content model — types + seeds + published JSON

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/content/seed/es.ts`
- Modify: `src/content/seed/en.ts`
- Modify: `src/content/published/es.json`
- Modify: `src/content/published/en.json`

- [ ] **Step 1: Extend `ContactContent` in `src/content/types.ts`**

Add after `location: string;`:

```ts
  linkedinLabel: string;
  formNameLabel: string;
  formNamePlaceholder: string;
  formTypeLabel: string;
  projectTypes: string[];
  formBudgetLabel: string;
  budgets: string[];
  formMessageLabel: string;
  formMessagePlaceholder: string;
  formHint: string;
```

- [ ] **Step 2: Update `src/content/seed/es.ts`**

Replace `certifications.items` with:

```ts
    items: [
      { name: 'Máster en Arquitectura de Microservicios con Docker', issuer: 'Lite Thinking' },
      { name: 'DevOps con AWS', issuer: 'Smart Data' },
      { name: 'NestJS: Persistencia con MongoDB y TypeORM', issuer: 'Platzi' },
      { name: 'Infraestructura como código en Terraform', issuer: 'Platzi' },
      { name: 'Fundamentos de TypeScript', issuer: 'Platzi' },
      { name: 'Testing con JavaScript', issuer: 'Platzi' },
      { name: 'Angular: Componentes y Servicios', issuer: 'Platzi' },
      { name: 'Material UI con React', issuer: 'Platzi' },
      { name: 'Desarrollo Front-End & JavaScript', issuer: 'Coursera' },
      { name: 'Diplomado en Habilidades Directivas', issuer: 'Newman' },
    ],
```

Replace `education.items` with:

```ts
    items: [
      { title: 'Maestría en Big Data con mención en IA', institution: 'UNIANDES', period: '2026 — Presente' },
      { title: 'Diplomado en Arquitectura Empresarial Moderna', institution: 'Lite Thinking', period: '2025 — Presente' },
      { title: 'AI Assisted Programming Bootcamp', institution: 'Dojo Coding', period: '2025 — Presente' },
      { title: 'Ingeniería en Sistemas', institution: 'UNIANDES', period: '2014 — 2019' },
    ],
```

In `contact`, set `emailCta: 'Enviar por email'`, `whatsappCta: 'Enviar por WhatsApp'`,
`location: 'Quito, Ecuador · GMT-5'`, and add after `location`:

```ts
    linkedinLabel: '/luis-alberto-de-la-torre',
    formNameLabel: 'Tu nombre',
    formNamePlaceholder: 'Ej: María Torres',
    formTypeLabel: 'Tipo de proyecto',
    projectTypes: ['Web', 'App móvil', 'AR / Unity', 'Backend', 'Cloud / DevOps', 'IA / ML', 'Consultoría'],
    formBudgetLabel: 'Presupuesto estimado',
    budgets: ['< $2k', '$2k–5k', '$5k–15k', '$15k+', 'A definir'],
    formMessageLabel: 'Cuéntame tu proyecto',
    formMessagePlaceholder: '¿Qué quieres construir? Objetivo, plazos, contexto...',
    formHint: 'Al enviar se abre WhatsApp o tu email con el mensaje ya redactado. Respondo en menos de 24 h.',
```

- [ ] **Step 3: Update `src/content/seed/en.ts` (same shapes, EN copy)**

`certifications.items`:

```ts
    items: [
      { name: "Master's in Microservices Architecture with Docker", issuer: 'Lite Thinking' },
      { name: 'DevOps with AWS', issuer: 'Smart Data' },
      { name: 'NestJS: Persistence with MongoDB & TypeORM', issuer: 'Platzi' },
      { name: 'Infrastructure as Code with Terraform', issuer: 'Platzi' },
      { name: 'TypeScript Fundamentals', issuer: 'Platzi' },
      { name: 'Testing with JavaScript', issuer: 'Platzi' },
      { name: 'Angular: Components & Services', issuer: 'Platzi' },
      { name: 'Material UI with React', issuer: 'Platzi' },
      { name: 'Front-End Development & JavaScript', issuer: 'Coursera' },
      { name: 'Management Skills Diploma', issuer: 'Newman' },
    ],
```

`education.items`:

```ts
    items: [
      { title: "Master's in Big Data with a focus on AI", institution: 'UNIANDES', period: '2026 — Present' },
      { title: 'Diploma in Modern Enterprise Architecture', institution: 'Lite Thinking', period: '2025 — Present' },
      { title: 'AI Assisted Programming Bootcamp', institution: 'Dojo Coding', period: '2025 — Present' },
      { title: 'Systems Engineering', institution: 'UNIANDES', period: '2014 — 2019' },
    ],
```

`contact`: `emailCta: 'Send via email'`, `whatsappCta: 'Send via WhatsApp'`,
`location: 'Quito, Ecuador · GMT-5'`, plus:

```ts
    linkedinLabel: '/luis-alberto-de-la-torre',
    formNameLabel: 'Your name',
    formNamePlaceholder: 'E.g.: María Torres',
    formTypeLabel: 'Project type',
    projectTypes: ['Web', 'Mobile app', 'AR / Unity', 'Backend', 'Cloud / DevOps', 'AI / ML', 'Consulting'],
    formBudgetLabel: 'Estimated budget',
    budgets: ['< $2k', '$2k–5k', '$5k–15k', '$15k+', 'To be defined'],
    formMessageLabel: 'Tell me about your project',
    formMessagePlaceholder: 'What do you want to build? Goal, timeline, context...',
    formHint: 'Sending opens WhatsApp or your email with the message pre-drafted. I reply within 24 h.',
```

- [ ] **Step 4: Mirror the same changes in `src/content/published/es.json` and `en.json`**

Replace the `"items"` arrays inside `"certifications"` and `"education"`, update
`"emailCta"`/`"whatsappCta"`/`"location"` inside `"contact"`, and add the new
contact keys — JSON form of Steps 2–3 values, per locale.

- [ ] **Step 5: Type-check + commit**

Run: `npx tsc --noEmit` → PASS. Then:

```bash
git add src/content/types.ts src/content/seed/es.ts src/content/seed/en.ts src/content/published/es.json src/content/published/en.json
git commit -m "feat(content): formation content refresh + contact form fields (types, seeds, published)"
```

---

### Task 2: Firestore migration (merge-only) + pull

**Files:**
- Create: `scripts/migrate-formation-contact.ts`

- [ ] **Step 1: Create the script**

```ts
import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

// One-off migration: merge ONLY the changed/new fields. Arrays replace
// wholesale (intended for the two item lists); everything else is untouched.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    await db.doc(`content/${id}`).set(
      {
        certifications: { items: seed.certifications.items },
        education: { items: seed.education.items },
        contact: {
          whatsappCta: seed.contact.whatsappCta,
          emailCta: seed.contact.emailCta,
          location: seed.contact.location,
          linkedinLabel: seed.contact.linkedinLabel,
          formNameLabel: seed.contact.formNameLabel,
          formNamePlaceholder: seed.contact.formNamePlaceholder,
          formTypeLabel: seed.contact.formTypeLabel,
          projectTypes: seed.contact.projectTypes,
          formBudgetLabel: seed.contact.formBudgetLabel,
          budgets: seed.contact.budgets,
          formMessageLabel: seed.contact.formMessageLabel,
          formMessagePlaceholder: seed.contact.formMessagePlaceholder,
          formHint: seed.contact.formHint,
        },
      },
      { merge: true },
    );
    console.log(`Merged formation + contact updates into content/${id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run it**

`npx tsx scripts/migrate-formation-contact.ts` (if credentials fail, retry with
`GOOGLE_APPLICATION_CREDENTIALS=./service-account.json` prefix). Expected: two
"Merged formation + contact updates…" lines. If credentials are unavailable,
commit the script, report the run as BLOCKED, and continue (site builds from
published JSON).

- [ ] **Step 3: Pull + commit**

`npm run content:pull` → diff should be value-identical (key order may shuffle;
keep the pulled version). Then:

```bash
git add scripts/migrate-formation-contact.ts src/content/published/
git commit -m "feat(content): one-off migration for formation + contact updates (merge-only)"
```

---

### Task 3: FormationSection (replaces Certificaciones + Educación)

**Files:**
- Create: `src/features/portfolio/sections/formation/formation-section.tsx`
- Delete: `src/features/portfolio/sections/certifications/certifications-section.tsx`
- Delete: `src/features/portfolio/sections/education/education-section.tsx`
- Modify: `src/features/portfolio/portfolio-screen.tsx`

- [ ] **Step 1: Create `formation-section.tsx` with EXACTLY:**

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import type { Certification, EducationItem, LanguageItem } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const rowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '160ms' } as object) : null;
const textTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const markerTransition = Platform.OS === 'web' ? ({ transitionProperty: 'opacity', transitionDuration: '160ms' } as object) : null;
// Two side-by-side columns on web (stacks under ~1000px); flexWrap fallback.
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(460px, 1fr))', columnGap: 64, rowGap: 48 } as object)
  : null;

/** A certification row that highlights on hover (decorative — not a link). */
function CertRow({ item }: { item: Certification }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          position: 'relative',
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
          backgroundColor: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        },
        rowTransition as object,
      ]}
    >
      {({ hovered }: HoverState) => (
        <>
          <View
            pointerEvents="none"
            style={[
              { position: 'absolute', left: -14, top: 12, bottom: 12, width: 2, borderRadius: 2, backgroundColor: colors.accent, opacity: hovered ? 1 : 0 },
              markerTransition as object,
            ]}
          />
          <Text style={[{ flex: 1, fontSize: 13.5, color: hovered ? colors.text : 'rgb(223,226,230)' }, textTransition as object]}>
            {item.name}
          </Text>
          <Text style={[{ fontFamily: fonts.mono, fontSize: 11, color: hovered ? colors.textDim : colors.textFaint }, textTransition as object]}>
            {item.issuer}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** A stacked education item with the same hover treatment (no divider). */
function EduItem({ item }: { item: EducationItem }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        { position: 'relative', paddingVertical: 10, gap: 2, backgroundColor: hovered ? 'rgba(255,255,255,0.02)' : 'transparent' },
        rowTransition as object,
      ]}
    >
      {({ hovered }: HoverState) => (
        <>
          <View
            pointerEvents="none"
            style={[
              { position: 'absolute', left: -14, top: 10, bottom: 10, width: 2, borderRadius: 2, backgroundColor: colors.accent, opacity: hovered ? 1 : 0 },
              markerTransition as object,
            ]}
          />
          <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>{item.title}</Text>
          <Text style={{ fontSize: 13.5, color: colors.accent }}>{item.institution}</Text>
          <Text style={[{ fontFamily: fonts.mono, fontSize: 11.5, color: hovered ? colors.textDim : colors.textFaint }, textTransition as object]}>
            {item.period}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** A language row: language left, level in accent right. */
function LangRow({ item }: { item: LanguageItem }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, color: colors.text }}>{item.language}</Text>
      <Text style={{ fontSize: 13.5, color: colors.accent }}>{item.level}</Text>
    </View>
  );
}

export function FormationSection() {
  const { content } = useI18n();
  const { certifications, education } = content;
  const langDelay = (education.items.length + 1) * 60;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="formation">
      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 48 }, gridWeb as object]}>
        <View>
          <Reveal delay={0}>
            <SectionHeading kicker={certifications.kicker} heading={certifications.heading} />
          </Reveal>
          <View>
            {certifications.items.map((item, i) => (
              <Reveal key={item.name} delay={(i + 1) * 60}>
                <CertRow item={item} />
              </Reveal>
            ))}
          </View>
        </View>
        <View>
          <Reveal delay={0}>
            <SectionHeading kicker={education.kicker} heading={education.heading} />
          </Reveal>
          <View style={{ gap: 8 }}>
            {education.items.map((item, i) => (
              <Reveal key={item.title} delay={(i + 1) * 60}>
                <EduItem item={item} />
              </Reveal>
            ))}
          </View>
          <Reveal delay={langDelay} style={{ gap: 10, marginTop: 28 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>
              {education.languagesHeading}
            </Text>
            <View>
              {education.languages.map((l) => (
                <LangRow key={l.language} item={l} />
              ))}
            </View>
          </Reveal>
        </View>
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: Rewire `portfolio-screen.tsx` and delete the old sections**

Remove the `CertificationsSection`/`EducationSection` imports; add
`import { FormationSection } from './sections/formation/formation-section';`.
Replace the two lines

```tsx
        <TrackedSection id="certifications"><CertificationsSection /></TrackedSection>
        <TrackedSection id="education"><EducationSection /></TrackedSection>
```

with

```tsx
        <TrackedSection id="formation"><FormationSection /></TrackedSection>
```

Then `git rm src/features/portfolio/sections/certifications/certifications-section.tsx src/features/portfolio/sections/education/education-section.tsx`.

- [ ] **Step 3: Type-check + commit**

`npx tsc --noEmit` → PASS. Then:

```bash
git add -A src/features/portfolio
git commit -m "feat(portfolio): formation section — certifications + education side by side"
```

---

### Task 4: Contact card + form rewrite

**Files:**
- Modify: `src/features/portfolio/sections/contact/contact-section.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire contents with EXACTLY:**

```tsx
import { useState } from 'react';
import { Linking, Platform, Pressable, Text, TextInput, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
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
const cardGlowWeb = Platform.OS === 'web'
  ? ({ backgroundImage: 'radial-gradient(700px 420px at 85% 0%, rgba(228,227,87,0.07), rgba(228,227,87,0) 70%)' } as object)
  : null;
const cardGridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', columnGap: 56, rowGap: 40 } as object)
  : null;

const FIELD_LABEL = { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase' as const, color: colors.textFaint };

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

export function ContactSection() {
  const { content, locale } = useI18n();
  const { contact } = content;
  const [name, setName] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const draft = () => {
    const n = name || '—';
    const t = type || '—';
    const b = budget || '—';
    return locale === 'es'
      ? `Hola Luis, soy ${n}.\nTipo de proyecto: ${t}.\nPresupuesto estimado: ${b}.\n\n${message}`
      : `Hi Luis, I'm ${n}.\nProject type: ${t}.\nEstimated budget: ${b}.\n\n${message}`;
  };
  const sendWhatsApp = () => Linking.openURL(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(draft())}`);
  const sendEmail = () => {
    const subject = locale === 'es' ? `Proyecto — ${type || 'consulta'}` : `Project — ${type || 'inquiry'}`;
    Linking.openURL(`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft())}`);
  };

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

          <Reveal delay={140} style={{ gap: 18 }}>
            <View style={{ gap: 8 }}>
              <Text style={FIELD_LABEL}>{contact.formNameLabel}</Text>
              <FormInput value={name} onChangeText={setName} placeholder={contact.formNamePlaceholder} />
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
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <AppButton label={contact.whatsappCta} onPress={sendWhatsApp} variant="primary" />
              <AppButton label={contact.emailCta} onPress={sendEmail} variant="outline" />
            </View>
            <Text style={{ fontSize: 12.5, lineHeight: 18, color: colors.textFaint }}>{contact.formHint}</Text>
          </Reveal>
        </View>
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: Type-check + build + commit**

`npx tsc --noEmit && npx expo export -p web` → PASS. Then:

```bash
git add src/features/portfolio/sections/contact/contact-section.tsx
git commit -m "feat(portfolio): contact card with pre-drafted WhatsApp/email form"
```

---

### Task 5: Footer logo + WhatsAppFab

**Files:**
- Modify: `src/features/portfolio/components/site-footer.tsx`
- Create: `src/features/portfolio/components/whatsapp-fab.tsx`
- Modify: `src/features/portfolio/portfolio-screen.tsx`

- [ ] **Step 1: Footer logo**

In `site-footer.tsx`, add `Image` to the react-native import. Replace the
copyright `Text` line with:

```tsx
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source={require('@/assets/images/logo.png')} style={{ width: 24, height: 24, borderRadius: 6 }} />
            <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.copyright}</Text>
          </View>
```

(Requires `View` already imported — it is.)

- [ ] **Step 2: Create `whatsapp-fab.tsx` with EXACTLY:**

```tsx
import { Linking, Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const fabWeb = Platform.OS === 'web'
  ? ({ position: 'fixed', cursor: 'pointer', transitionProperty: 'transform, background-color, box-shadow', transitionDuration: '160ms' } as object)
  : null;
const fabGlowWeb = Platform.OS === 'web' ? ({ boxShadow: '0 10px 30px rgba(228,227,87,0.35)' } as object) : null;

/** Floating WhatsApp pill, fixed bottom-right on web (absolute fallback native). */
export function WhatsAppFab() {
  const { content } = useI18n();
  const { contact } = content;
  return (
    <Pressable
      onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}`)}
      style={({ hovered, pressed }: HoverState) => [
        {
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 50,
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
        fabWeb as object,
        fabGlowWeb as object,
      ]}
    >
      <Text style={{ fontSize: 16, color: colors.onAccent }}>✆</Text>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.onAccent }}>WhatsApp</Text>
    </Pressable>
  );
}
```

- [ ] **Step 3: Render the FAB**

In `portfolio-screen.tsx`, add
`import { WhatsAppFab } from './components/whatsapp-fab';` and render
`<WhatsAppFab />` as the LAST child of the root `View` (after the `ScrollView`).

- [ ] **Step 4: Type-check + commit**

`npx tsc --noEmit` → PASS. Then:

```bash
git add src/features/portfolio/components/site-footer.tsx src/features/portfolio/components/whatsapp-fab.tsx src/features/portfolio/portfolio-screen.tsx
git commit -m "feat(portfolio): footer logo + floating WhatsApp button"
```

---

### Task 6: Admin — contact form fields

**Files:**
- Modify: `src/admin/components/forms/contact-form.tsx`

- [ ] **Step 1: Extend the form**

Add `import { StringListEditor } from '../string-list-editor';` (if missing).
Following the file's existing `set` helper + `Field` pattern, append after the
existing `location` Field:

```tsx
      <Field label="linkedinLabel" value={value.linkedinLabel} onChangeText={(t) => set('linkedinLabel', t)} />
      <Field label="formNameLabel" value={value.formNameLabel} onChangeText={(t) => set('formNameLabel', t)} />
      <Field label="formNamePlaceholder" value={value.formNamePlaceholder} onChangeText={(t) => set('formNamePlaceholder', t)} />
      <Field label="formTypeLabel" value={value.formTypeLabel} onChangeText={(t) => set('formTypeLabel', t)} />
      <StringListEditor label="projectTypes" items={value.projectTypes} onChange={(projectTypes) => set('projectTypes', projectTypes)} />
      <Field label="formBudgetLabel" value={value.formBudgetLabel} onChangeText={(t) => set('formBudgetLabel', t)} />
      <StringListEditor label="budgets" items={value.budgets} onChange={(budgets) => set('budgets', budgets)} />
      <Field label="formMessageLabel" value={value.formMessageLabel} onChangeText={(t) => set('formMessageLabel', t)} />
      <Field label="formMessagePlaceholder" value={value.formMessagePlaceholder} onChangeText={(t) => set('formMessagePlaceholder', t)} multiline />
      <Field label="formHint" value={value.formHint} onChangeText={(t) => set('formHint', t)} multiline />
```

(If the file's setter is named differently, adapt to its existing helper — all
admin forms share the `const set = <K extends keyof …>` pattern.)

- [ ] **Step 2: Type-check + build + commit**

`npx tsc --noEmit && npx expo export -p web` → PASS. Then:

```bash
git add src/admin/components/forms/contact-form.tsx
git commit -m "feat(admin): contact form fields for the new contact card + form"
```

---

### Task 7: Verify and deploy

**Files:** none.

- [ ] **Step 1: Build + hygiene**

`npx tsc --noEmit && npx expo export -p web`, then
`grep -rl "initializeApp\|firebase/auth" dist/_expo/static/js/web | grep -v firebase-client || echo "clean"` → `clean`.

- [ ] **Step 2: Browser verification (preview tools)**

- **Formation** (desktop 1280): two columns — 10 cert rows left; 4 stacked
  education items + IDIOMAS rows (levels in accent, right-aligned). One column
  at mobile width. Old standalone sections gone.
- **Contact**: accent-bordered card; left details stacked (LinkedIn shows
  `/luis-alberto-de-la-torre`, location shows GMT-5); right form renders inputs +
  chips (single-select toggles) + textarea + both buttons + hint. Type a name,
  pick chips, write a message; verify the composed URL (intercept
  `window.open`/`Linking` via preview_eval or inspect the wa.me/mailto URL logic
  by clicking — headless may block actual navigation; confirm live).
- **Footer**: logo beside copyright; "↑ Volver arriba" + tagline intact.
- **FAB**: fixed bottom-right at every scroll position (`position: fixed`
  computed), above content.
- **i18n**: EN toggle translates form labels/options and formation content.

Fix issues at the source and re-run from Step 1.

- [ ] **Step 3: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main` →
`gh run watch <run-id> --exit-status` → `completed / success`. Live check +
`/admin` shows the new Contacto fields and the migrated Certificaciones/Educación
items.

---

## Self-Review

**1. Spec coverage:** types+seeds+published (T1) ✓ · migration merge-only + pull
(T2) ✓ · FormationSection + delete old + rewire `id="formation"` (T3) ✓ ·
contact card/form with draft composition + reuse of `whatsappCta`/`emailCta`
(T4) ✓ · footer logo + FAB global + keep Volver arriba (T5) ✓ · admin fields
(T6) ✓ · verify/deploy (T7) ✓. No gaps.

**2. Placeholder scan:** none — full code everywhere; Task 6 includes a
fallback instruction tied to the shared admin-form pattern, not a TODO. ✓

**3. Type consistency:**
- `ContactContent` new keys (T1) match usages in T4 (`formNameLabel`,
  `projectTypes`, etc.) and T6 form fields ✓.
- `Chip {label, active, onPress, mono?}` — used with `mono={false}` for project
  types, default mono for budgets ✓.
- `Certification {name, issuer}` / `EducationItem {title, institution, period}` /
  `LanguageItem {language, level}` all match `types.ts` ✓.
- `FormationSection` imports only existing primitives; `TrackedSection` accepts
  arbitrary ids ✓.
- FAB uses `contact.whatsapp` (existing field) ✓; footer logo path
  `@/assets/images/logo.png` (existing asset) ✓.
