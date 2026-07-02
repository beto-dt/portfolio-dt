# New Content Sections (Hero Clients + Process + Collaboration) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three CMS-backed content pieces: hero "clients/sectors" chips, a Process section (4 steps, after Servicios), and a Collaboration section (3 model cards with a POPULAR highlight, before Contacto) — bilingual and editable from `/admin`.

**Architecture:** Extend the content model (`types.ts` + seed es/en + published JSON), merge the new fields into Firestore with a one-off migration script (never a full overwrite), render the new pieces with existing primitives (`Reveal`, `GlowCard`, `Pill`, `AppButton`, `scrollToAnchor`), and add the admin forms + section registry entries.

**Tech Stack:** Expo Router + react-native-web, Firestore CMS pipeline (`seed-content.ts` / `pull-content.ts` pattern), firebase-admin (script only), existing UI primitives. No test runner in this repo.

**Verification note:** No jest — verify with `npx tsc --noEmit`, `npx expo export -p web`, bundle hygiene grep, and the browser preview. Do NOT run `npx expo lint`. `dist/` is gitignored — leave it.

---

### Task 1: Content model — types + seed (es/en) + published JSON

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/content/seed/es.ts`
- Modify: `src/content/seed/en.ts`
- Modify: `src/content/published/es.json`
- Modify: `src/content/published/en.json`

- [ ] **Step 1: Add the new types in `src/content/types.ts`**

In `HeroContent`, after `cvUrl: string;` add:

```ts
  clientsHeading: string;
  clients: string[];
```

After the `EducationContent` type (before `FooterContent`), add:

```ts
export type ProcessStep = { number: string; title: string; description: string };
export type ProcessContent = { kicker: string; heading: string; steps: ProcessStep[] };

export type CollaborationModel = {
  tag: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
  popular?: boolean;
};
export type CollaborationContent = { kicker: string; heading: string; blurb: string; models: CollaborationModel[] };
```

In `PortfolioContent`, add `process: ProcessContent;` after `services` and
`collaboration: CollaborationContent;` after `education`.

- [ ] **Step 2: Extend `src/content/seed/es.ts`**

In `hero`, after `cvUrl: '/cv.pdf',` add:

```ts
    clientsHeading: 'Empresas y sectores donde he entregado',
    clients: ['Banca · Produbanco', 'E-commerce · Acid Labs', 'IoT · Audax', 'Telecom · Smartisp', 'Salud · HL7/FHIR', 'AR/VR · Unity'],
```

After the `services` block, add:

```ts
  process: {
    kicker: 'cómo trabajo',
    heading: 'Un proceso claro, sin sorpresas',
    steps: [
      { number: '01', title: 'Descubrimiento', description: 'Entiendo tu objetivo de negocio, usuarios y restricciones. Definimos alcance, entregables y métricas de éxito.' },
      { number: '02', title: 'Arquitectura', description: 'Diseño la solución técnica: stack, infraestructura y plan de entrega por fases, con estimaciones realistas.' },
      { number: '03', title: 'Desarrollo', description: 'Construyo en iteraciones con demos frecuentes. Código limpio, testeado y con CI/CD desde el día uno.' },
      { number: '04', title: 'Entrega & soporte', description: 'Despliegue a producción (stores/cloud), documentación y acompañamiento post-lanzamiento.' },
    ],
  },
```

After the `education` block, add:

```ts
  collaboration: {
    kicker: 'colaboración',
    heading: 'Modelos para trabajar juntos',
    blurb: 'Elige el formato que mejor encaje con tu proyecto. Todo empieza con una llamada gratuita de 30 min.',
    models: [
      { tag: 'ALCANCE CERRADO', title: 'Proyecto llave en mano', description: 'Ideal para MVPs y productos con alcance definido. Precio fijo por entregable.', features: ['Cotización fija por fases', 'Diseño → desarrollo → despliegue', 'Garantía post-entrega'], cta: 'Cotizar proyecto' },
      { tag: 'MENSUAL', title: 'Retainer / por horas', description: 'Capacidad dedicada continua para evolucionar tu producto mes a mes.', features: ['Bloque de horas flexible', 'Prioridad y disponibilidad', 'Reportes y demos semanales'], cta: 'Reservar cupo', popular: true },
      { tag: 'ESTRATÉGICO', title: 'Tech Lead fraccional', description: 'Lidero tu equipo y arquitectura sin el costo de un full-time senior.', features: ['Arquitectura y estándares', 'Code reviews y mentoría', 'Roadmap técnico'], cta: 'Agendar llamada' },
    ],
  },
```

- [ ] **Step 3: Extend `src/content/seed/en.ts` (same structure, EN copy)**

In `hero`, after `cvUrl`:

```ts
    clientsHeading: "Companies and sectors I've delivered for",
    clients: ['Banking · Produbanco', 'E-commerce · Acid Labs', 'IoT · Audax', 'Telecom · Smartisp', 'Health · HL7/FHIR', 'AR/VR · Unity'],
```

After `services`:

```ts
  process: {
    kicker: 'how I work',
    heading: 'A clear process, no surprises',
    steps: [
      { number: '01', title: 'Discovery', description: 'I understand your business goal, users and constraints. We define scope, deliverables and success metrics.' },
      { number: '02', title: 'Architecture', description: 'I design the technical solution: stack, infrastructure and a phased delivery plan with realistic estimates.' },
      { number: '03', title: 'Development', description: 'I build in iterations with frequent demos. Clean, tested code with CI/CD from day one.' },
      { number: '04', title: 'Delivery & support', description: 'Production deployment (stores/cloud), documentation and post-launch support.' },
    ],
  },
```

After `education`:

```ts
  collaboration: {
    kicker: 'collaboration',
    heading: 'Ways to work together',
    blurb: 'Pick the format that best fits your project. Everything starts with a free 30-min call.',
    models: [
      { tag: 'FIXED SCOPE', title: 'Turnkey project', description: 'Ideal for MVPs and products with a defined scope. Fixed price per deliverable.', features: ['Fixed quote per phase', 'Design → development → deployment', 'Post-delivery warranty'], cta: 'Get a quote' },
      { tag: 'MONTHLY', title: 'Retainer / hourly', description: 'Ongoing dedicated capacity to evolve your product month by month.', features: ['Flexible block of hours', 'Priority and availability', 'Weekly reports and demos'], cta: 'Book a slot', popular: true },
      { tag: 'STRATEGIC', title: 'Fractional Tech Lead', description: 'I lead your team and architecture without the cost of a full-time senior.', features: ['Architecture and standards', 'Code reviews and mentoring', 'Technical roadmap'], cta: 'Schedule a call' },
    ],
  },
```

- [ ] **Step 4: Mirror the same data into the published JSON (so the app type-checks and renders before the migration)**

In `src/content/published/es.json`: inside the `"hero"` object add
`"clientsHeading"` and `"clients"` (JSON form of Step 2's values); add top-level
`"process"` and `"collaboration"` objects (JSON form of Step 2's blocks — note
JSON needs `"popular": true` only on the Retainer model; the other models omit the
key). Repeat for `src/content/published/en.json` with Step 3's values. Keep the
existing key order style (place `process` after `services`, `collaboration` after
`education` for readability).

- [ ] **Step 5: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS (published JSON satisfies the extended `PortfolioContent`).

- [ ] **Step 6: Commit**

```bash
git add src/content/types.ts src/content/seed/es.ts src/content/seed/en.ts src/content/published/es.json src/content/published/en.json
git commit -m "feat(content): add hero clients, process and collaboration to content model + seed + published"
```

---

### Task 2: Firestore migration (merge-only) + pull

**Files:**
- Create: `scripts/migrate-add-sections.ts`

- [ ] **Step 1: Create `scripts/migrate-add-sections.ts`**

```ts
import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

// One-off migration: merge ONLY the new fields into the existing content docs.
// Never a full set() — admin edits to existing fields must survive.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    await db.doc(`content/${id}`).set(
      {
        hero: { clientsHeading: seed.hero.clientsHeading, clients: seed.hero.clients },
        process: seed.process,
        collaboration: seed.collaboration,
      },
      { merge: true },
    );
    console.log(`Merged new sections into content/${id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
```

- [ ] **Step 2: Run the migration**

Run: `npx tsx scripts/migrate-add-sections.ts` — with the same credentials used for
`scripts/seed-content.ts` (if `GOOGLE_APPLICATION_CREDENTIALS` isn't already
exported, prefix with `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json`,
which exists locally and is gitignored — NEVER commit it).
Expected output: `Merged new sections into content/es` and `…content/en`.

**If credentials are unavailable in this environment:** report BLOCKED for this
step only and continue with Task 3 — the site builds from the published JSON
updated in Task 1; the migration must then be run before relying on `/admin` for
the new sections.

- [ ] **Step 3: Pull and confirm no drift**

Run: `npm run content:pull && git diff --stat src/content/published/`
Expected: the pull succeeds; the diff is **empty** (or whitespace-only) because
Task 1 already wrote the same values. If the diff shows real changes (i.e. an
admin edit had touched these locales meanwhile), keep the pulled version.

- [ ] **Step 4: Commit**

```bash
git add scripts/migrate-add-sections.ts src/content/published/
git commit -m "feat(content): one-off Firestore migration for new sections (merge-only)"
```

---

### Task 3: Hero clients block

**Files:**
- Modify: `src/features/portfolio/sections/hero/hero-section.tsx`

- [ ] **Step 1: Add the `Pill` import**

After the line `import { Container } from '../../components/container';` add:

```ts
import { Pill } from '../../components/pill';
```

- [ ] **Step 2: Append the clients block**

The stats block currently ends the hero content:

```tsx
        <Reveal delay={320}>
          <View
            style={{ … stats row … }}
          >
            {hero.stats.map((stat) => ( … ))}
          </View>
        </Reveal>
```

Immediately AFTER that `</Reveal>` (still inside the `<View style={{ gap: 34 }}>`),
add:

```tsx
        <Reveal delay={400}>
          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>
              {hero.clientsHeading}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {hero.clients.map((client) => (
                <Pill key={client} label={client} />
              ))}
            </View>
          </View>
        </Reveal>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/portfolio/sections/hero/hero-section.tsx
git commit -m "feat(portfolio): hero clients/sectors chip row"
```

---

### Task 4: ProcessSection + screen wiring

**Files:**
- Create: `src/features/portfolio/sections/process/process-section.tsx`
- Modify: `src/features/portfolio/portfolio-screen.tsx`

- [ ] **Step 1: Create `src/features/portfolio/sections/process/process-section.tsx`**

```tsx
import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';
import { Reveal } from '@/ui/reveal';

export function ProcessSection() {
  const { content } = useI18n();
  const { process } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="process">
      <Reveal delay={0}>
        <SectionHeading kicker={process.kicker} heading={process.heading} />
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {process.steps.map((step, i) => (
          <Reveal key={step.number} delay={i * 70} style={{ flexGrow: 1, flexBasis: 230, minWidth: 210 }}>
            <GlowCard
              style={{
                width: '100%',
                flexGrow: 1,
                padding: 24,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.lg,
              }}
            >
              {() => (
                <>
                  <Text style={{ fontFamily: fonts.displayBold, fontSize: 26, color: colors.accent, marginBottom: 10 }}>{step.number}</Text>
                  <Text style={{ fontFamily: fonts.display, fontSize: 17, letterSpacing: -0.17, color: colors.text, marginBottom: 8 }}>{step.title}</Text>
                  <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim, fontFamily: fonts.body }}>{step.description}</Text>
                </>
              )}
            </GlowCard>
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: Wire into `portfolio-screen.tsx`**

Add the import (with the other section imports):

```ts
import { ProcessSection } from './sections/process/process-section';
```

And insert AFTER the services line:

```tsx
        <TrackedSection id="process"><ProcessSection /></TrackedSection>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/portfolio/sections/process/process-section.tsx src/features/portfolio/portfolio-screen.tsx
git commit -m "feat(portfolio): process section (cómo trabajo) after services"
```

---

### Task 5: CollaborationSection + AppButton centered label + screen wiring

**Files:**
- Modify: `src/ui/app-button.tsx`
- Create: `src/features/portfolio/sections/collaboration/collaboration-section.tsx`
- Modify: `src/features/portfolio/portfolio-screen.tsx`

- [ ] **Step 1: Center the AppButton label**

In `src/ui/app-button.tsx`, the label `Text` currently is:

```tsx
      <Text style={{ fontSize: size === 'sm' ? 13 : 15, fontFamily: fonts.bodyMedium, color: isPrimary ? colors.onAccent : 'rgb(231,233,236)' }}>
```

Add `textAlign: 'center'` to that style object. (Intrinsic-width buttons — header,
hero, contact — are unaffected because the Text already fills its own width; only
stretched full-width buttons, like the new collaboration CTAs, gain a centered
label.)

- [ ] **Step 2: Create `src/features/portfolio/sections/collaboration/collaboration-section.tsx`**

```tsx
import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { GlowCard } from '@/ui/glow-card';
import { Reveal } from '@/ui/reveal';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';
import type { CollaborationModel } from '@/content/types';

/** One collaboration model card; the popular one is accent-bordered + badged. */
function ModelCard({ model }: { model: CollaborationModel }) {
  return (
    <GlowCard
      style={{
        width: '100%',
        flexGrow: 1,
        padding: 26,
        backgroundColor: model.popular ? 'rgba(228,227,87,0.04)' : 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: model.popular ? 'rgba(228,227,87,0.5)' : 'rgba(255,255,255,0.09)',
        borderRadius: 18,
      }}
    >
      {() => (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>{model.tag}</Text>
            {model.popular ? (
              <View style={{ backgroundColor: colors.accent, borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.6, color: colors.onAccent }}>POPULAR</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.21, color: colors.text, marginBottom: 8 }}>{model.title}</Text>
          <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim }}>{model.description}</Text>
          <View style={{ gap: 8, marginTop: 14 }}>
            {model.features.map((feature) => (
              <View key={feature} style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
                <Text style={{ color: colors.accent, fontSize: 12.5 }}>✓</Text>
                <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}>{feature}</Text>
              </View>
            ))}
          </View>
          {/* marginTop:'auto' pins the CTA to the bottom of the card */}
          <View style={{ marginTop: 'auto', paddingTop: 20 }}>
            <AppButton label={model.cta} onPress={() => scrollToAnchor('contact')} variant={model.popular ? 'primary' : 'outline'} />
          </View>
        </>
      )}
    </GlowCard>
  );
}

export function CollaborationSection() {
  const { content } = useI18n();
  const { collaboration } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="collaboration">
      <Reveal delay={0}>
        <SectionHeading kicker={collaboration.kicker} heading={collaboration.heading} />
      </Reveal>
      <Reveal delay={70}>
        <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{collaboration.blurb}</Text>
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {collaboration.models.map((model, i) => (
          <Reveal key={model.title} delay={140 + i * 70} style={{ flexGrow: 1, flexBasis: 300, minWidth: 280 }}>
            <ModelCard model={model} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
```

- [ ] **Step 3: Wire into `portfolio-screen.tsx`**

Add the import:

```ts
import { CollaborationSection } from './sections/collaboration/collaboration-section';
```

And insert BEFORE the contact line:

```tsx
        <TrackedSection id="collaboration"><CollaborationSection /></TrackedSection>
```

- [ ] **Step 4: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful `dist` export.

- [ ] **Step 5: Commit**

```bash
git add src/ui/app-button.tsx src/features/portfolio/sections/collaboration/collaboration-section.tsx src/features/portfolio/portfolio-screen.tsx
git commit -m "feat(portfolio): collaboration section (modelos) with POPULAR highlight before contact"
```

---

### Task 6: Admin — hero fields + ProcessForm + CollaborationForm + registry

**Files:**
- Modify: `src/admin/components/forms/hero-form.tsx`
- Create: `src/admin/components/forms/process-form.tsx`
- Create: `src/admin/components/forms/collaboration-form.tsx`
- Modify: `src/admin/screens/admin-screen.tsx`

- [ ] **Step 1: Extend `hero-form.tsx`**

Add the import:

```ts
import { StringListEditor } from '../string-list-editor';
```

After the `cvUrl` Field (before `<Label>stats</Label>`), add:

```tsx
      <Field label="clientsHeading" value={value.clientsHeading} onChangeText={(t) => set('clientsHeading', t)} />
      <StringListEditor label="clients" items={value.clients} onChange={(clients) => set('clients', clients)} />
```

- [ ] **Step 2: Create `src/admin/components/forms/process-form.tsx`**

```tsx
import { View } from 'react-native';
import type { ProcessContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function ProcessForm({ value, onChange }: { value: ProcessContent; onChange: (v: ProcessContent) => void }) {
  const set = <K extends keyof ProcessContent>(k: K, v: ProcessContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>steps</Label>
      <ListEditor
        items={value.steps}
        onChange={(steps) => set('steps', steps)}
        makeEmpty={() => ({ number: '', title: '', description: '' })}
        renderItem={(s, on) => (
          <>
            <Field label="number" value={s.number} onChangeText={(t) => on({ ...s, number: t })} />
            <Field label="title" value={s.title} onChangeText={(t) => on({ ...s, title: t })} />
            <Field label="description" value={s.description} onChangeText={(t) => on({ ...s, description: t })} multiline />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 3: Create `src/admin/components/forms/collaboration-form.tsx`**

```tsx
import { View } from 'react-native';
import type { CollaborationContent } from '@/content/types';
import { Chip } from '@/ui/chip';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';
import { StringListEditor } from '../string-list-editor';

export function CollaborationForm({ value, onChange }: { value: CollaborationContent; onChange: (v: CollaborationContent) => void }) {
  const set = <K extends keyof CollaborationContent>(k: K, v: CollaborationContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Label>models</Label>
      <ListEditor
        items={value.models}
        onChange={(models) => set('models', models)}
        makeEmpty={() => ({ tag: '', title: '', description: '', features: [], cta: '', popular: false })}
        renderItem={(m, on) => (
          <>
            <Field label="tag" value={m.tag} onChangeText={(t) => on({ ...m, tag: t })} />
            <Field label="title" value={m.title} onChangeText={(t) => on({ ...m, title: t })} />
            <Field label="description" value={m.description} onChangeText={(t) => on({ ...m, description: t })} multiline />
            <StringListEditor label="features" items={m.features} onChange={(features) => on({ ...m, features })} />
            <Field label="cta" value={m.cta} onChangeText={(t) => on({ ...m, cta: t })} />
            <View style={{ alignSelf: 'flex-start' }}>
              <Chip label="popular" active={!!m.popular} onPress={() => on({ ...m, popular: !m.popular })} />
            </View>
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 4: Register in `admin-screen.tsx`**

Add the imports (with the other form imports):

```ts
import { ProcessForm } from '../components/forms/process-form';
import { CollaborationForm } from '../components/forms/collaboration-form';
```

In `SECTIONS`, insert `{ key: 'process', label: 'Proceso' }` after the
`services` entry, and `{ key: 'collaboration', label: 'Colaboración' }` before the
`contact` entry.

In the `SectionForm` switch, add:

```tsx
    case 'process':
      return <ProcessForm value={content.process} onChange={(v) => onChange({ ...content, process: v })} />;
    case 'collaboration':
      return <CollaborationForm value={content.collaboration} onChange={(v) => onChange({ ...content, collaboration: v })} />;
```

- [ ] **Step 5: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful export.

- [ ] **Step 6: Commit**

```bash
git add src/admin/components/forms/hero-form.tsx src/admin/components/forms/process-form.tsx src/admin/components/forms/collaboration-form.tsx src/admin/screens/admin-screen.tsx
git commit -m "feat(admin): forms + registry for hero clients, process and collaboration"
```

---

### Task 7: Verify (build + hygiene + browser + admin) and deploy

**Files:** none (verification + deploy).

- [ ] **Step 1: Type-check + build + hygiene**

Run: `npx tsc --noEmit && npx expo export -p web`, then
`grep -rl "initializeApp\|firebase/auth" dist/_expo/static/js/web | grep -v firebase-client || echo "clean"`
Expected: PASS + `clean` (firebase-admin lives only in `scripts/`, never imported
by `src/` — confirm no new Firebase import leaked into the public bundle).

- [ ] **Step 2: Browser verification (preview tools)**

- **Hero:** clients heading + 6 chips render after the stats.
- **Process:** 4 numbered cards after Servicios (accent numbers, SpaceGrotesk
  titles).
- **Collaboration:** 3 cards before Contacto; middle card accent-bordered with
  POPULAR badge and primary CTA; the CTAs scroll toward Contacto (headless may
  throttle smooth-scroll — confirm handler wiring; verify live).
- **i18n:** toggle ES/en → all new content switches language.
- **Layout:** mobile (375) + desktop wrapping sane; entrance staggers play
  (final state correct under headless).
- `/admin` cannot be fully exercised headless (Google sign-in) — verify the
  Proceso/Colaboración chips appear in the section selector after sign-in on the
  live site.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 3: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live:
new sections render and `/admin` edits + Publicar work for them.

---

## Self-Review

**1. Spec coverage:**
- Types + seed es/en + published JSON mirror → Task 1 ✓
- Merge-only migration + pull-no-drift check → Task 2 (with BLOCKED fallback) ✓
- Hero clients block (Reveal 400, Pill chips) → Task 3 ✓
- ProcessSection after services + TrackedSection id="process" → Task 4 ✓
- CollaborationSection before contact, POPULAR accent card, CTAs →
  `scrollToAnchor('contact')`, TrackedSection id="collaboration" → Task 5 ✓
- AppButton centered label (needed for stretched CTAs) → Task 5 Step 1 ✓
- Admin: hero fields, ProcessForm, CollaborationForm (Chip toggle), SECTIONS +
  switch → Task 6 ✓
- Verify + deploy → Task 7 ✓
- Non-goals honored: no nav change, no new primitives, no analytics/rules changes ✓
No gaps.

**2. Placeholder scan:** No TBD/TODO; every code step shows complete code (Task 1
Step 4 describes a JSON mirror of values fully specified in Steps 2–3). ✓

**3. Type consistency:**
- `ProcessStep { number, title, description }` — used by section (`step.number`
  etc.) and ProcessForm `makeEmpty` ✓.
- `CollaborationModel { tag, title, description, features, cta, popular? }` — used
  by `ModelCard` and CollaborationForm `makeEmpty` (popular: false) ✓.
- `HeroContent.clientsHeading/clients` — used by hero block and HeroForm ✓.
- `SectionKey = keyof PortfolioContent` extends automatically; SECTIONS entries use
  the new keys `'process'`/`'collaboration'` ✓.
- Admin component APIs match existing ones: `Field {label,value,onChangeText,multiline}`,
  `ListEditor {items,onChange,makeEmpty,renderItem}`, `StringListEditor
  {label,items,onChange}`, `Chip {label,active,onPress}` ✓.
- `GlowCard` render-prop children `{() => (…)}` — consistent with services/stack ✓.
