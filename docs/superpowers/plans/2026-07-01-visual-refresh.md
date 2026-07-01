# Visual Refresh Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Match the updated reference design — hero "Descargar CV" button, a new Educación section, a redesigned Contact section (email + WhatsApp + details), and a footer — all editable from `/admin`.

**Architecture:** Extend the typed content model (+ education, + footer, restructured contact, hero CV fields), add the public components, add the matching admin forms, migrate the live Firestore docs non-destructively, and host the CV at `/cv.pdf`.

**Tech Stack:** Expo/React Native web, TypeScript, Firestore (Admin SDK migration via tsx). No new dependencies.

**Testing note:** Gate = `npx tsc --noEmit` + `npx expo export -p web` (must produce `dist/cv.pdf`) + public-bundle-excludes-Firebase check. The Firestore migration, `content:pull`, and deploy are cloud steps.

---

### Task 1: Content model + validator + seed (ES/EN)

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/content/validate.ts`
- Modify: `src/content/seed/es.ts`, `src/content/seed/en.ts`

- [ ] **Step 1: Extend `src/content/types.ts`**

Add `cvLabel`/`cvUrl` to `HeroContent`; add the new types; restructure `ContactContent`; add `education` and `footer` to `PortfolioContent`.

In `HeroContent`, add these two fields (keep the rest):
```ts
  cvLabel: string;
  cvUrl: string;
```

Add these new type declarations (near the other section types):
```ts
export type EducationItem = { title: string; institution: string; period: string };
export type LanguageItem = { language: string; level: string };
export type EducationContent = {
  kicker: string;
  heading: string;
  items: EducationItem[];
  languagesHeading: string;
  languages: LanguageItem[];
};
export type FooterContent = { copyright: string; tagline: string };
```

Replace the `ContactContent` type with:
```ts
export type ContactContent = {
  kicker: string;
  heading: string;
  blurb: string;
  emailCta: string;
  whatsappCta: string;
  email: string;
  phone: string;
  whatsapp: string;
  linkedin: string;
  location: string;
};
```

In `PortfolioContent`, add `education` and `footer`:
```ts
  education: EducationContent;
  contact: ContactContent;
  footer: FooterContent;
```

- [ ] **Step 2: Update `src/content/validate.ts` REQUIRED_KEYS**

```ts
const REQUIRED_KEYS: (keyof PortfolioContent)[] = [
  'nav',
  'hero',
  'services',
  'impact',
  'stack',
  'experience',
  'projects',
  'certifications',
  'education',
  'contact',
  'footer',
];
```

- [ ] **Step 3: Edit `src/content/seed/es.ts`**

(a) In the `hero` object, add:
```ts
    cvLabel: 'Descargar CV',
    cvUrl: '/cv.pdf',
```

(b) Replace the entire `contact:` object with:
```ts
  contact: {
    kicker: 'contacto',
    heading: '¿Tienes un proyecto en mente? Hablemos.',
    blurb:
      'Estoy disponible para proyectos freelance y colaboraciones. Cuéntame qué quieres construir y te respondo en menos de 24 horas.',
    emailCta: 'Escríbeme un email',
    whatsappCta: 'WhatsApp',
    email: 'luis.atorred24@gmail.com',
    phone: '+593 97 990 6532',
    whatsapp: '593979906532',
    linkedin: 'https://www.linkedin.com/in/luis-alberto-de-la-torre-duran-752569141/',
    location: 'Quito, Ecuador',
  },
```

(c) Add an `education` object (immediately before `contact`) and a `footer` object (immediately after `contact`):
```ts
  education: {
    kicker: 'academia',
    heading: 'Educación',
    items: [
      { title: 'Maestría en Big Data con mención en Inteligencia Artificial', institution: 'Universidad Regional Autónoma de los Andes', period: '06/2026 — Presente' },
      { title: 'Ingeniería en Sistemas', institution: 'Universidad Regional Autónoma de los Andes', period: '01/2014 — 01/2019' },
      { title: 'Máster en Arquitectura de Microservicios con Contenedores Docker', institution: 'Lite Thinking', period: '07/2024' },
      { title: 'Diplomado en Arquitectura Empresarial Moderna', institution: 'Lite Thinking', period: '08/2025 — Presente' },
      { title: 'AI Assisted Programming Bootcamp', institution: 'Dojo Coding', period: '08/2025 — Presente' },
    ],
    languagesHeading: 'Idiomas',
    languages: [
      { language: 'Español', level: 'Nativo' },
      { language: 'Inglés', level: 'Avanzado' },
    ],
  },
```
```ts
  footer: {
    copyright: '© 2026 Luis De La Torre Duran',
    tagline: 'Diseñado y desarrollado con precisión.',
  },
```

- [ ] **Step 4: Edit `src/content/seed/en.ts`** (same structure, English strings)

(a) In `hero`, add:
```ts
    cvLabel: 'Download CV',
    cvUrl: '/cv.pdf',
```

(b) Replace `contact:` with:
```ts
  contact: {
    kicker: 'contact',
    heading: "Got a project in mind? Let's talk.",
    blurb:
      "I'm available for freelance projects and collaborations. Tell me what you want to build and I'll reply within 24 hours.",
    emailCta: 'Send me an email',
    whatsappCta: 'WhatsApp',
    email: 'luis.atorred24@gmail.com',
    phone: '+593 97 990 6532',
    whatsapp: '593979906532',
    linkedin: 'https://www.linkedin.com/in/luis-alberto-de-la-torre-duran-752569141/',
    location: 'Quito, Ecuador',
  },
```

(c) Add `education` (before contact) and `footer` (after contact):
```ts
  education: {
    kicker: 'academics',
    heading: 'Education',
    items: [
      { title: "Master's in Big Data with a focus on Artificial Intelligence", institution: 'Universidad Regional Autónoma de los Andes', period: '06/2026 — Present' },
      { title: 'Systems Engineering', institution: 'Universidad Regional Autónoma de los Andes', period: '01/2014 — 01/2019' },
      { title: "Master's in Microservices Architecture with Docker Containers", institution: 'Lite Thinking', period: '07/2024' },
      { title: 'Diploma in Modern Enterprise Architecture', institution: 'Lite Thinking', period: '08/2025 — Present' },
      { title: 'AI Assisted Programming Bootcamp', institution: 'Dojo Coding', period: '08/2025 — Present' },
    ],
    languagesHeading: 'Languages',
    languages: [
      { language: 'Spanish', level: 'Native' },
      { language: 'English', level: 'Advanced' },
    ],
  },
```
```ts
  footer: {
    copyright: '© 2026 Luis De La Torre Duran',
    tagline: 'Designed and developed with precision.',
  },
```

- [ ] **Step 5: Type check** — Run: `npx tsc --noEmit` — Expected: FAIL only where existing code still uses the old contact shape (`contact.cta` / `contact.socials`) — i.e. `src/features/portfolio/sections/contact/contact-section.tsx` and `src/admin/components/forms/contact-form.tsx`. Those are rewritten in Tasks 2 and 3. If any OTHER error appears (e.g. seed missing a field), fix it. Commit after Task-1 files are consistent even though the two consumers still error — that is expected and resolved in Tasks 2-3.

Note: Tasks 1-3 land together for a green tsc. Commit Task 1 now; the two dependent errors clear in Tasks 2-3.

- [ ] **Step 6: Commit**

```bash
git add src/content/types.ts src/content/validate.ts src/content/seed/es.ts src/content/seed/en.ts
git commit -m "feat(content): add education/footer, hero CV, restructured contact (types + seed)"
```

---

### Task 2: Public site (hero CV, Education, Contact rewrite, Footer) + CV asset

**Files:**
- Modify: `src/features/portfolio/sections/hero/hero-section.tsx` (CV button)
- Create: `src/features/portfolio/sections/education/education-section.tsx`
- Modify: `src/features/portfolio/sections/contact/contact-section.tsx` (rewrite)
- Create: `src/features/portfolio/components/site-footer.tsx`
- Modify: `src/features/portfolio/portfolio-screen.tsx` (wire education + footer)
- Create: `public/cv.pdf`

- [ ] **Step 1: Add the CV button to `hero-section.tsx`**

Add `Linking` to the `react-native` import, then add a third button inside the CTA row (the `View` that holds primary/secondary CTAs), after the secondary CTA:
```tsx
          <Pressable onPress={() => Linking.openURL(hero.cvUrl)} style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: radii.md, paddingHorizontal: 24, paddingVertical: 13 }}>
            <Text style={{ fontSize: 15, fontFamily: fonts.bodyMedium, color: 'rgb(231,233,236)' }}>↓ {hero.cvLabel}</Text>
          </Pressable>
```
Ensure the CTA row uses `Pressable` (import it if the current buttons are `View` — switch the two existing CTA `View`s to `Pressable` is NOT required; only the CV button needs Pressable). Make sure `Pressable` and `Linking` are imported from `react-native`.

- [ ] **Step 2: Create `src/features/portfolio/sections/education/education-section.tsx`**

```tsx
import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

export function EducationSection() {
  const { content } = useI18n();
  const { education } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <SectionHeading kicker={education.kicker} heading={education.heading} />
      <View style={{ gap: 24 }}>
        <View>
          {education.items.map((item) => (
            <View
              key={item.title}
              style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)', gap: 3 }}
            >
              <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>{item.title}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 13.5, color: colors.accent }}>{item.institution}</Text>
                <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{item.period}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>
            {education.languagesHeading}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 28 }}>
            {education.languages.map((l) => (
              <View key={l.language} style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
                <Text style={{ fontSize: 14, color: colors.text }}>{l.language}</Text>
                <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{l.level}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Container>
  );
}
```

- [ ] **Step 3: Rewrite `src/features/portfolio/sections/contact/contact-section.tsx`**

```tsx
import { Linking, Pressable, Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';

function Detail({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  if (!value) return null;
  return (
    <View style={{ gap: 3, minWidth: 150 }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>{label}</Text>
      <Text onPress={onPress} style={{ fontSize: 13.5, color: onPress ? colors.accent : colors.textMuted }}>{value}</Text>
    </View>
  );
}

export function ContactSection() {
  const { content } = useI18n();
  const { contact } = content;
  return (
    <Container style={{ paddingVertical: 72 }}>
      <SectionHeading kicker={contact.kicker} heading={contact.heading} />
      <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{contact.blurb}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <Pressable onPress={() => Linking.openURL(`mailto:${contact.email}`)} style={{ backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 26, paddingVertical: 14 }}>
          <Text style={{ fontSize: 15, fontFamily: fonts.bodyMedium, color: colors.onAccent }}>{contact.emailCta}</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}`)} style={{ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.md, paddingHorizontal: 24, paddingVertical: 13 }}>
          <Text style={{ fontSize: 15, fontFamily: fonts.bodyMedium, color: 'rgb(231,233,236)' }}>{contact.whatsappCta}</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Detail label="Email" value={contact.email} onPress={() => Linking.openURL(`mailto:${contact.email}`)} />
        <Detail label="Teléfono" value={contact.phone} onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\s/g, '')}`)} />
        <Detail label="LinkedIn" value={contact.linkedin} onPress={() => Linking.openURL(contact.linkedin)} />
        <Detail label="Ubicación" value={contact.location} />
      </View>
    </Container>
  );
}
```

- [ ] **Step 4: Create `src/features/portfolio/components/site-footer.tsx`**

```tsx
import { Text, View } from 'react-native';
import { Container } from './container';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

export function SiteFooter() {
  const { content } = useI18n();
  const { footer } = content;
  return (
    <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: colors.border }}>
      <Container style={{ paddingVertical: 28, flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.copyright}</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.tagline}</Text>
      </Container>
    </View>
  );
}
```

- [ ] **Step 5: Wire Education + Footer into `portfolio-screen.tsx`**

Add imports:
```tsx
import { EducationSection } from './sections/education/education-section';
import { SiteFooter } from './components/site-footer';
```
Add `<TrackedSection id="education"><EducationSection /></TrackedSection>` immediately AFTER the certifications `TrackedSection`, and add `<SiteFooter />` immediately AFTER the closing `</ScrollView>` is NOT correct — instead place `<SiteFooter />` as the LAST child inside the `ScrollView` (after the contact `TrackedSection`), so it scrolls with the page.

- [ ] **Step 6: Add the CV asset**

```bash
mkdir -p public
cp "/Users/albertodelatorre/Library/Mobile Documents/com~apple~CloudDocs/Documents/LuisAlbertoDeLaTorreDuranCVActualizado.pdf" public/cv.pdf
```

- [ ] **Step 7: Verify types + build + CV in output + bundle hygiene**

```bash
npx tsc --noEmit
rm -rf dist && npx expo export -p web
test -f dist/cv.pdf && echo "cv.pdf OK" || echo "cv.pdf MISSING"
for c in $(grep -oE '_expo/static/js/web/[a-zA-Z0-9._-]+\.js' dist/index.html); do grep -q "firebaseapp.com\|initializeApp" "dist/$c" && echo "LEAK $c"; done; echo "home checked"
```
Expected: tsc PASS; build succeeds; `cv.pdf OK`; no `LEAK`.
If `cv.pdf MISSING`: Expo did not copy `public/`. Fallback — check `app.json` `web` config; if needed, the deploy step (Task 5) copies `public/cv.pdf` into `dist/` before `firebase deploy`. Note it and continue.

- [ ] **Step 8: Commit**

```bash
git add src/features/portfolio public/cv.pdf
git commit -m "feat(portfolio): hero CV button, Education section, redesigned Contact, footer"
```

---

### Task 3: Admin forms (education, footer, contact rewrite, hero CV) + selector

**Files:**
- Modify: `src/admin/components/forms/hero-form.tsx` (CV fields)
- Modify: `src/admin/components/forms/contact-form.tsx` (rewrite)
- Create: `src/admin/components/forms/education-form.tsx`
- Create: `src/admin/components/forms/footer-form.tsx`
- Modify: `src/admin/screens/admin-screen.tsx` (SECTIONS + switch)

- [ ] **Step 1: Add CV fields to `hero-form.tsx`**

Add these two `Field`s after the existing hero fields (before the `stats` `ListEditor`):
```tsx
      <Field label="cvLabel" value={value.cvLabel} onChangeText={(t) => set('cvLabel', t)} />
      <Field label="cvUrl" value={value.cvUrl} onChangeText={(t) => set('cvUrl', t)} />
```

- [ ] **Step 2: Rewrite `src/admin/components/forms/contact-form.tsx`**

```tsx
import { View } from 'react-native';
import type { ContactContent } from '@/content/types';
import { Field } from '../field';

export function ContactForm({ value, onChange }: { value: ContactContent; onChange: (v: ContactContent) => void }) {
  const set = <K extends keyof ContactContent>(k: K, v: ContactContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Field label="emailCta" value={value.emailCta} onChangeText={(t) => set('emailCta', t)} />
      <Field label="whatsappCta" value={value.whatsappCta} onChangeText={(t) => set('whatsappCta', t)} />
      <Field label="email" value={value.email} onChangeText={(t) => set('email', t)} />
      <Field label="phone" value={value.phone} onChangeText={(t) => set('phone', t)} />
      <Field label="whatsapp (solo dígitos)" value={value.whatsapp} onChangeText={(t) => set('whatsapp', t)} />
      <Field label="linkedin" value={value.linkedin} onChangeText={(t) => set('linkedin', t)} />
      <Field label="location" value={value.location} onChangeText={(t) => set('location', t)} />
    </View>
  );
}
```

- [ ] **Step 3: Create `src/admin/components/forms/education-form.tsx`**

```tsx
import { View } from 'react-native';
import type { EducationContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function EducationForm({ value, onChange }: { value: EducationContent; onChange: (v: EducationContent) => void }) {
  const set = <K extends keyof EducationContent>(k: K, v: EducationContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ title: '', institution: '', period: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="title" value={it.title} onChangeText={(t) => on({ ...it, title: t })} />
            <Field label="institution" value={it.institution} onChangeText={(t) => on({ ...it, institution: t })} />
            <Field label="period" value={it.period} onChangeText={(t) => on({ ...it, period: t })} />
          </>
        )}
      />
      <Field label="languagesHeading" value={value.languagesHeading} onChangeText={(t) => set('languagesHeading', t)} />
      <Label>languages</Label>
      <ListEditor
        items={value.languages}
        onChange={(languages) => set('languages', languages)}
        makeEmpty={() => ({ language: '', level: '' })}
        renderItem={(l, on) => (
          <>
            <Field label="language" value={l.language} onChangeText={(t) => on({ ...l, language: t })} />
            <Field label="level" value={l.level} onChangeText={(t) => on({ ...l, level: t })} />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 4: Create `src/admin/components/forms/footer-form.tsx`**

```tsx
import { View } from 'react-native';
import type { FooterContent } from '@/content/types';
import { Field } from '../field';

export function FooterForm({ value, onChange }: { value: FooterContent; onChange: (v: FooterContent) => void }) {
  const set = <K extends keyof FooterContent>(k: K, v: FooterContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="copyright" value={value.copyright} onChangeText={(t) => set('copyright', t)} />
      <Field label="tagline" value={value.tagline} onChangeText={(t) => set('tagline', t)} />
    </View>
  );
}
```

- [ ] **Step 5: Wire into `admin-screen.tsx`**

(a) Add imports:
```tsx
import { EducationForm } from '../components/forms/education-form';
import { FooterForm } from '../components/forms/footer-form';
```

(b) In the `SECTIONS` array, add `education` after `certifications` and `footer` after `contact`:
```tsx
  { key: 'certifications', label: 'Certificaciones' },
  { key: 'education', label: 'Educación' },
  { key: 'contact', label: 'Contacto' },
  { key: 'footer', label: 'Footer' },
```

(c) In the `SectionForm` switch, add cases:
```tsx
    case 'education':
      return <EducationForm value={content.education} onChange={(v) => onChange({ ...content, education: v })} />;
    case 'footer':
      return <FooterForm value={content.footer} onChange={(v) => onChange({ ...content, footer: v })} />;
```

- [ ] **Step 6: Verify types + build + bundle hygiene**

```bash
npx tsc --noEmit
rm -rf dist && npx expo export -p web
for c in $(grep -oE '_expo/static/js/web/[a-zA-Z0-9._-]+\.js' dist/index.html); do grep -q "firebaseapp.com\|initializeApp" "dist/$c" && echo "LEAK $c"; done; echo "home checked"
```
Expected: tsc PASS (all consumers now use the new contact shape); build succeeds; no `LEAK`.

- [ ] **Step 7: Commit**

```bash
git add src/admin
git commit -m "feat(admin): education/footer forms, contact rewrite, hero CV fields, selector"
```

---

### Task 4: Firestore migration + publish JSON (cloud)

**Files:**
- Create: `scripts/migrate-visual-refresh.ts`
- Modify (generated): `src/content/published/es.json`, `src/content/published/en.json`

- [ ] **Step 1: Create `scripts/migrate-visual-refresh.ts`**

```ts
import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';
import type { PortfolioContent } from '../src/content/types';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

async function migrate(locale: 'es' | 'en', data: PortfolioContent) {
  await db.doc(`content/${locale}`).update({
    contact: data.contact,
    education: data.education,
    footer: data.footer,
    'hero.cvLabel': data.hero.cvLabel,
    'hero.cvUrl': data.hero.cvUrl,
  });
  console.log(`Migrated content/${locale}`);
}

async function main() {
  await migrate('es', es);
  await migrate('en', en);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run the migration (non-destructive update of the live docs)**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npx tsx scripts/migrate-visual-refresh.ts
```
Expected: `Migrated content/es` and `Migrated content/en`. This adds education/footer/CV and replaces `contact` while preserving all other sections' current values in Firestore.

- [ ] **Step 3: Pull the published JSON from Firestore**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npm run content:pull
```
Expected: `src/content/published/{es,en}.json` regenerated; they now contain `education`, `footer`, the new `contact`, and `hero.cvLabel`/`cvUrl`. `npx tsc --noEmit` still passes.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-visual-refresh.ts src/content/published/es.json src/content/published/en.json
git commit -m "chore(content): migrate Firestore + regenerate published JSON for visual refresh"
```

---

### Task 5: Deploy + verification

**Files:** none

- [ ] **Step 1: Type check** — Run: `npx tsc --noEmit` — Expected: PASS.

- [ ] **Step 2: Deploy the site**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npm run content:pull && npx expo export -p web
test -f dist/cv.pdf || cp public/cv.pdf dist/cv.pdf
firebase deploy --only hosting --project luisdelatorre-portfolio --non-interactive
```
Expected: deploy completes; `dist/cv.pdf` present before deploy (the `cp` is a safety net if Expo did not copy `public/`).

- [ ] **Step 3: Verify live**

```bash
curl -s -o /dev/null -w "/cv.pdf -> %{http_code}\n" https://luisdelatorre.dev/cv.pdf
for s in "Educación" "Idiomas" "Hablemos" "Descargar CV" "WhatsApp"; do printf '%-16s ' "$s:"; curl -s https://luisdelatorre.dev/ | grep -qF "$s" && echo FOUND || echo missing; done
```
Expected: `/cv.pdf -> 200`; the strings FOUND (the static HTML now includes Education/Contact/CV/footer content).

- [ ] **Step 4: Manual**

- `luisdelatorre.dev`: hero has **Descargar CV** (opens the PDF); **Educación** renders with studies + Idiomas; **Contacto** shows email + WhatsApp buttons + the details grid; **footer** at the bottom. ES/EN toggle localizes headings/labels.
- `/admin`: **Educación**, **Footer**, updated **Contacto**, and Hero CV fields edit + save.

- [ ] **Step 5: Commit (only if fixes were needed)**

```bash
git add -A
git commit -m "fix(portfolio): visual refresh verification adjustments"
```

---

## Self-Review

- **Spec coverage:** types + validator + seed (T1); hero CV button, Education section, Contact rewrite, footer, portfolio wiring, cv.pdf (T2); admin education/footer/contact/hero forms + selector (T3); non-destructive Firestore migration + published JSON (T4); deploy + live verification incl. cv.pdf and localized strings (T5). ✓
- **Placeholder scan:** none — concrete code/commands. The mid-refactor "expected error until Task 2/3" notes are explicit and resolved by named tasks.
- **Type consistency:** `ContactContent` new shape (T1) consumed by `contact-section.tsx` (T2) and `contact-form.tsx` (T3); `EducationContent`/`FooterContent` (T1) used by education/footer sections + forms (T2/T3) + admin switch (T3); `hero.cvLabel`/`cvUrl` added in T1, used in hero-section (T2) + hero-form (T3) + migration (T4); migration `update()` uses dotted `hero.*` (adds) and full objects for `contact`/`education`/`footer` (replaces) — matches the non-destructive intent. ✓
