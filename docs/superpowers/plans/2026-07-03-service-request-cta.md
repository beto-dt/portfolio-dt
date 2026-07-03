# Service Request CTA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Each service card gets a "Solicitar este servicio →" CTA that scrolls to Contacto with the matching project-type chip active and a dismissible 💡 banner recommending a collaboration model; contact type chips grow to 9.

**Architecture:** `booking-intent.ts` upgrades its payload from `string` to `BookingIntent = { model?, projectType? }`; ServiceCard gains a pinned mono-accent CTA that broadcasts intent + scrolls; the contact wizard adds a `banner` state rendered above the form. Seeds/admin/migration follow the standard CMS pipeline.

**Tech Stack:** Existing web-cast patterns, `Chip`/`HoverLink`/`scrollToAnchor`, firebase-admin migration via `npx tsx`. No test runner.

**Verification note:** No jest. Verify with `npx tsc --noEmit`, `npx expo export -p web`, hygiene grep, preview interactions. Do NOT run `npx expo lint`.

---

### Task 1: Types + intent module + seeds

**Files:**
- Modify: `src/content/types.ts:26-32` (ServiceItem/ServicesContent), `:~118` (ContactContent)
- Modify: `src/features/portfolio/sections/contact/booking-intent.ts` (full rewrite)
- Modify: `src/features/portfolio/sections/collaboration/collaboration-section.tsx` (call site)
- Modify: `src/content/seed/es.ts`, `src/content/seed/en.ts`

- [ ] **Step 1: In `src/content/types.ts`, replace the `ServiceItem`/`ServicesContent` block with:**

```ts
export type ServiceItem = {
  index: string;
  tag: string;
  title: string;
  description: string;
  projectType: string;
  recommendedModel: string;
};
export type ServicesContent = { kicker: string; heading: string; requestCta: string; items: ServiceItem[] };
```

- [ ] **Step 2: In `ContactContent`, add after `interestLabel: string;`:**

```ts
  intentBanner: string;
```

- [ ] **Step 3: Replace the ENTIRE content of `src/features/portfolio/sections/contact/booking-intent.ts` with:**

```ts
export type BookingIntent = { model?: string; projectType?: string };

type Listener = (intent: BookingIntent) => void;
const listeners = new Set<Listener>();

/** Broadcast what the visitor tapped (collaboration model and/or service project type). */
export function setBookingIntent(intent: BookingIntent): void {
  listeners.forEach((l) => l(intent));
}

/** Subscribe to intent broadcasts; returns an unsubscribe. */
export function onBookingIntent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
```

- [ ] **Step 4: In `collaboration-section.tsx`, change the CTA `onPress` line:**

```tsx
                setBookingIntent({ model: model.title });
```

(was `setBookingIntent(model.title);` — nothing else changes.)

- [ ] **Step 5: Seed `src/content/seed/es.ts` — in `services:`, add `requestCta` after `heading` and replace the 9 items:**

```ts
  services: {
    kicker: 'servicios',
    heading: 'Cómo puedo ayudarte',
    requestCta: 'Solicitar este servicio',
    items: [
      { index: '01', tag: 'WEB', title: 'Desarrollo Web', description: 'Aplicaciones React y Next.js de alto rendimiento, dashboards en tiempo real y SPAs escalables con UX pulida.', projectType: 'Web', recommendedModel: 'Proyecto llave en mano' },
      { index: '02', tag: 'MOBILE', title: 'Apps Móviles', description: 'iOS y Android nativo (Swift/Kotlin) y multiplataforma con Flutter, KMP y React Native, publicadas en las stores.', projectType: 'App móvil', recommendedModel: 'Proyecto llave en mano' },
      { index: '03', tag: 'AR/3D', title: 'Realidad Aumentada & Unity', description: 'Experiencias AR nativas (ARKit/ARCore) y 3D/VR con Unity que digitalizan productos y triplican el engagement.', projectType: 'AR / Unity', recommendedModel: 'Proyecto llave en mano' },
      { index: '04', tag: 'BACKEND', title: 'Backend & Microservicios', description: 'Arquitecturas distribuidas, DDD, event-driven y APIs robustas con NestJS, FastAPI, Spring Boot y Go.', projectType: 'Backend', recommendedModel: 'Proyecto llave en mano' },
      { index: '05', tag: 'CLOUD', title: 'Cloud & DevOps', description: 'Infraestructura en AWS y Azure con Terraform (IaC), CI/CD, Docker y Kubernetes para despliegues confiables.', projectType: 'Cloud / DevOps', recommendedModel: 'Retainer / por horas' },
      { index: '06', tag: 'AI/ML', title: 'Integración de IA/ML', description: 'Pipelines de datos, análisis predictivo y modelos de machine learning integrados directamente en tu producto.', projectType: 'IA / ML', recommendedModel: 'Retainer / por horas' },
      { index: '07', tag: 'LEAD', title: 'Consultoría & Tech Lead', description: 'Definición de arquitectura, estándares de ingeniería y liderazgo técnico para llevar tu producto a producción.', projectType: 'Consultoría', recommendedModel: 'Tech Lead fraccional' },
      { index: '08', tag: 'CHATBOT', title: 'Chatbots con IA', description: 'Asistentes conversacionales automatizados con lenguaje natural (LLMs) para soporte, ventas y atención 24/7, integrados a WhatsApp, web y tus sistemas.', projectType: 'Chatbot IA', recommendedModel: 'Proyecto llave en mano' },
      { index: '09', tag: 'AGENTES', title: 'Agentes inteligentes', description: 'Agentes de IA autónomos que razonan, usan herramientas y APIs, y ejecutan tareas de varios pasos para automatizar flujos de trabajo completos.', projectType: 'Agentes IA', recommendedModel: 'Proyecto llave en mano' },
    ],
  },
```

Also in `contact:` — replace the `projectTypes` line and add `intentBanner` after `interestLabel`:

```ts
    projectTypes: ['Web', 'App móvil', 'AR / Unity', 'Backend', 'Cloud / DevOps', 'IA / ML', 'Consultoría', 'Chatbot IA', 'Agentes IA'],
```
```ts
    intentBanner: 'Para {type} te recomiendo el modelo {model}. Ya lo dejé preseleccionado abajo — cuéntame los detalles.',
```

- [ ] **Step 6: Seed `src/content/seed/en.ts` — same shape:**

```ts
  services: {
    kicker: 'services',
    heading: 'How I can help you',
    requestCta: 'Request this service',
    items: [
      { index: '01', tag: 'WEB', title: 'Web Development', description: 'High-performance React and Next.js apps, real-time dashboards and scalable SPAs with polished UX.', projectType: 'Web', recommendedModel: 'Turnkey project' },
      { index: '02', tag: 'MOBILE', title: 'Mobile Apps', description: 'Native iOS and Android (Swift/Kotlin) and cross-platform with Flutter, KMP and React Native, shipped to the stores.', projectType: 'Mobile app', recommendedModel: 'Turnkey project' },
      { index: '03', tag: 'AR/3D', title: 'Augmented Reality & Unity', description: 'Native AR experiences (ARKit/ARCore) and 3D/VR with Unity that digitize products and triple engagement.', projectType: 'AR / Unity', recommendedModel: 'Turnkey project' },
      { index: '04', tag: 'BACKEND', title: 'Backend & Microservices', description: 'Distributed architectures, DDD, event-driven systems and robust APIs with NestJS, FastAPI, Spring Boot and Go.', projectType: 'Backend', recommendedModel: 'Turnkey project' },
      { index: '05', tag: 'CLOUD', title: 'Cloud & DevOps', description: 'AWS and Azure infrastructure with Terraform (IaC), CI/CD, Docker and Kubernetes for reliable deployments.', projectType: 'Cloud / DevOps', recommendedModel: 'Retainer / hourly' },
      { index: '06', tag: 'AI/ML', title: 'AI/ML Integration', description: 'Data pipelines, predictive analytics and machine learning models integrated directly into your product.', projectType: 'AI / ML', recommendedModel: 'Retainer / hourly' },
      { index: '07', tag: 'LEAD', title: 'Consulting & Tech Lead', description: 'Architecture definition, engineering standards and technical leadership to take your product to production.', projectType: 'Consulting', recommendedModel: 'Fractional Tech Lead' },
      { index: '08', tag: 'CHATBOT', title: 'AI Chatbots', description: 'Automated conversational assistants powered by natural language (LLMs) for support, sales and 24/7 service, integrated with WhatsApp, web and your systems.', projectType: 'AI Chatbot', recommendedModel: 'Turnkey project' },
      { index: '09', tag: 'AGENTS', title: 'Intelligent agents', description: 'Autonomous AI agents that reason, use tools and APIs, and execute multi-step tasks to automate complete workflows.', projectType: 'AI Agents', recommendedModel: 'Turnkey project' },
    ],
  },
```
```ts
    projectTypes: ['Web', 'Mobile app', 'AR / Unity', 'Backend', 'Cloud / DevOps', 'AI / ML', 'Consulting', 'AI Chatbot', 'AI Agents'],
```
```ts
    intentBanner: "For {type} I'd recommend the {model} model. I've preselected it below — tell me the details.",
```

- [ ] **Step 7: Type-check.**

Run: `npx tsc --noEmit`
Expected: PASS (published JSON is untyped at runtime; the wizard still compiles because `onBookingIntent` listener signature changed together with the module — the contact effect gets fixed in Task 2; if tsc errors ONLY in `contact-section.tsx` about `(m: string)`, that is expected and Task 2 resolves it).

- [ ] **Step 8: Commit**

```bash
git add src/content/ src/features/portfolio/sections/contact/booking-intent.ts src/features/portfolio/sections/collaboration/
git commit -m "feat(content): service request intent model + 9 project types"
```

---

### Task 2: ServiceCard CTA + contact banner

**Files:**
- Modify: `src/features/portfolio/sections/services/service-card.tsx` (full rewrite)
- Modify: `src/features/portfolio/sections/services/services-section.tsx:20`
- Modify: `src/features/portfolio/sections/contact/contact-section.tsx` (intent effect, banner state/UI, type chips)

- [ ] **Step 1: Replace the ENTIRE content of `service-card.tsx` with:**

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import type { ServiceItem } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';
import { setBookingIntent } from '../contact/booking-intent';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

// Web-only smooth transition for the tag chip bg + index color on hover.
const chipTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color', transitionDuration: '180ms' } as object) : null;
const indexTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '180ms' } as object) : null;
const ctaTransition = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const arrowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'transform', transitionDuration: '160ms' } as object) : null;

export function ServiceCard({ item, requestCta }: { item: ServiceItem; requestCta: string }) {
  return (
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
      {(hovered) => (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={[{ fontFamily: fonts.mono, fontSize: 11, color: hovered ? colors.accent : colors.textFaint }, indexTransition as object]}>
              {item.index}
            </Text>
            <View style={[{ backgroundColor: hovered ? 'rgba(228,227,87,0.2)' : 'rgba(228,227,87,0.12)', borderRadius: radii.sm, paddingHorizontal: 9, paddingVertical: 4 }, chipTransition as object]}>
              <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>{item.tag}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.2, color: colors.text, marginBottom: 9 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim, fontFamily: fonts.body }}>
            {item.description}
          </Text>
          {/* marginTop:'auto' pins the CTA to the bottom of the card */}
          <View style={{ marginTop: 'auto', paddingTop: 18 }}>
            <Pressable
              onPress={() => {
                setBookingIntent({ projectType: item.projectType, model: item.recommendedModel });
                scrollToAnchor('contact');
              }}
              style={{ alignSelf: 'flex-start' }}
            >
              {({ hovered: ctaHovered }: HoverState) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[{ fontFamily: fonts.mono, fontSize: 12.5, color: ctaHovered ? '#eeed6b' : colors.accent }, ctaTransition as object]}>
                    {requestCta}
                  </Text>
                  <Text style={[{ fontFamily: fonts.mono, fontSize: 12.5, color: ctaHovered ? '#eeed6b' : colors.accent, transform: [{ translateX: ctaHovered ? 3 : 0 }] }, arrowTransition as object]}>
                    →
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </>
      )}
    </GlowCard>
  );
}
```

- [ ] **Step 2: In `services-section.tsx` line 20, pass the CTA label:**

```tsx
            <ServiceCard item={item} requestCta={services.requestCta} />
```

- [ ] **Step 3: In `contact-section.tsx`, add banner state + new intent effect.** Replace:

```tsx
  const [model, setModel] = useState<string | null>(null);

  useEffect(() => onBookingIntent((m) => { setModel(m); setStep('form'); }), []);
```

with:

```tsx
  const [model, setModel] = useState<string | null>(null);
  const [banner, setBanner] = useState<{ type: string; model: string } | null>(null);

  useEffect(() => onBookingIntent((i) => {
    if (i.model) setModel(i.model);
    if (i.projectType) {
      setType(i.projectType);
      setBanner(i.model ? { type: i.projectType, model: i.model } : null);
    }
    setStep('form');
  }), []);
```

- [ ] **Step 4: Render the banner + make the interest chip conditional.** Replace:

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

with:

```tsx
                {banner ? (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: 'rgba(228,227,87,0.45)', backgroundColor: 'rgba(228,227,87,0.07)', borderRadius: radii.md, padding: 14 }}>
                    <Text style={{ fontSize: 14 }}>💡</Text>
                    <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}>
                      {contact.intentBanner.replace('{type}', banner.type).replace('{model}', banner.model)}
                    </Text>
                    <HoverLink label="✕" onPress={() => setBanner(null)} color={colors.textFaint} hoverColor={colors.text} />
                  </View>
                ) : null}
                {model && !banner ? (
                  <View style={{ gap: 8 }}>
                    <Text style={FIELD_LABEL}>{contact.interestLabel}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <Chip label={model} mono={false} active onPress={() => setModel(null)} />
                    </View>
                  </View>
                ) : null}
```

- [ ] **Step 5: Clear the banner when the visitor picks a different type.** Replace the type-chip line:

```tsx
                      <Chip key={t} label={t} mono={false} active={type === t} onPress={() => setType(type === t ? null : t)} />
```

with:

```tsx
                      <Chip key={t} label={t} mono={false} active={type === t} onPress={() => { setType(type === t ? null : t); if (banner && t !== banner.type) setBanner(null); }} />
```

- [ ] **Step 6: Verify + commit.**

```bash
npx tsc --noEmit && npx expo export -p web
grep -lE 'initializeApp|firebase/auth' dist/_expo/static/js/web/*.js   # only firebase-client-*.js
git add src/features/portfolio/
git commit -m "feat(site): request-service CTA on service cards + intent banner in contact"
```

---

### Task 3: Admin forms

**Files:**
- Modify: `src/admin/components/forms/services-form.tsx`
- Modify: `src/admin/components/forms/contact-form.tsx`

- [ ] **Step 1: In `services-form.tsx`:** add after the `heading` Field:

```tsx
      <Field label="requestCta" value={value.requestCta} onChangeText={(t) => set('requestCta', t)} />
```

Change `makeEmpty` to:

```tsx
        makeEmpty={() => ({ index: '', tag: '', title: '', description: '', projectType: '', recommendedModel: '' })}
```

Add inside `renderItem` after the `description` Field:

```tsx
            <Field label="projectType" value={it.projectType} onChangeText={(t) => on({ ...it, projectType: t })} />
            <Field label="recommendedModel" value={it.recommendedModel} onChangeText={(t) => on({ ...it, recommendedModel: t })} />
```

- [ ] **Step 2: In `contact-form.tsx`, add after the `interestLabel` Field (line 50):**

```tsx
      <Field label="intentBanner" value={value.intentBanner} onChangeText={(t) => set('intentBanner', t)} multiline />
```

- [ ] **Step 3: Verify + commit.**

```bash
npx tsc --noEmit
git add src/admin/
git commit -m "feat(admin): service request CTA fields in services/contact forms"
```

---

### Task 4: Migration + published JSON

**Files:**
- Create: `scripts/migrate-service-request-cta.ts`
- Modify: `src/content/published/{es,en}.json` (via patch script)

- [ ] **Step 1: Drift check — published vs seed for `services`/`contact` (pre-change fields):**

```bash
node -e "
const fs = require('fs');
for (const l of ['es','en']) {
  const pub = JSON.parse(fs.readFileSync('src/content/published/'+l+'.json','utf8'));
  console.log(l, 'services items:', pub.services.items.length, '| projectTypes:', pub.contact.projectTypes.length);
}"
```
Expected: 9 items / 7 projectTypes in both (matches pre-change seed). If counts differ, STOP and reconcile manually before merging.

- [ ] **Step 2: Create `scripts/migrate-service-request-cta.ts` with EXACTLY:**

```ts
import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

// One-off migration: merge the services (requestCta + per-item projectType /
// recommendedModel) and contact (9 projectTypes + intentBanner) sections.
// Published mirrors were drift-checked against the seed before this overwrite.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    await db.doc(`content/${id}`).set({ services: seed.services, contact: seed.contact }, { merge: true });
    console.log(`Merged services+contact into content/${id}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

- [ ] **Step 3: Run it:**

```bash
npx tsx scripts/migrate-service-request-cta.ts || GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npx tsx scripts/migrate-service-request-cta.ts
```
Expected: `Merged services+contact into content/es` and `…/en`.

- [ ] **Step 4: Patch published mirrors — overwrite the scratchpad `patch-published.ts` with:**

```ts
import { readFileSync, writeFileSync } from 'fs';
import { es } from '/Volumes/VIMKODEX 1/Personal/portfolio-dt/src/content/seed/es';
import { en } from '/Volumes/VIMKODEX 1/Personal/portfolio-dt/src/content/seed/en';

for (const [id, seed] of [['es', es], ['en', en]] as const) {
  const p = `/Volumes/VIMKODEX 1/Personal/portfolio-dt/src/content/published/${id}.json`;
  const j = JSON.parse(readFileSync(p, 'utf8'));
  j.services = seed.services;
  j.contact = seed.contact;
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8');
  console.log(`patched ${id}`);
}
```

Run: `npx tsx <scratchpad>/patch-published.ts`, then sanity-check:

```bash
node -e "
const fs = require('fs');
for (const l of ['es','en']) {
  const j = JSON.parse(fs.readFileSync('src/content/published/'+l+'.json','utf8'));
  console.log(l, '| requestCta:', j.services.requestCta, '| types:', j.contact.projectTypes.length, '| banner:', !!j.contact.intentBanner);
}"
```
Expected: requestCta set, 9 types, banner true — both locales.

- [ ] **Step 5: Commit**

```bash
npx tsc --noEmit
git add scripts/migrate-service-request-cta.ts src/content/published/
git commit -m "feat(content): seed service request CTA + 9 project types in Firestore + mirrors"
```

---

### Task 5: Preview verification + finish

- [ ] **Step 1: Preview `http://localhost:8081/`:**
  - Services: 9 cards each show "Solicitar este servicio →" pinned at the bottom.
  - Click the Cloud & DevOps CTA → scrolls to contact; banner shows "Para Cloud / DevOps te recomiendo el modelo Retainer / por horas…"; the `Cloud / DevOps` chip is active; 9 type chips render.
  - Banner ✕ dismisses (chip stays active); picking a different type clears the banner.
  - Collaboration CTA still preselects: click "Cotizar proyecto" → "Interesado en [Proyecto llave en mano]" chip (no banner).
  - No console errors.

- [ ] **Step 2: Finish the branch.** superpowers:finishing-a-development-branch → push + PR. After merge: `gh workflow run deploy.yml --ref main`, watch, live markers (`Solicitar este servicio`, `intentBanner` text fragment `te recomiendo el modelo`).

---

## Self-Review

**1. Spec coverage:** intent object + collaboration migration (T1 S3-4) ✓ · ServiceItem/ServicesContent/ContactContent fields (T1 S1-2) ✓ · seeds with full mapping table + 9 projectTypes + intentBanner ES/EN (T1 S5-6) ✓ · card CTA pinned mono-accent w/ arrow hover + broadcast + scroll (T2 S1-2) ✓ · banner UI dismissible, above fields, template replace, interest chip only when `model && !banner` (T2 S3-4) ✓ · banner clears on different type (T2 S5) ✓ · admin forms (T3) ✓ · drift check + merge migration + published patch (T4) ✓ · preview interactions + deploy (T5) ✓ · no functions changes (per spec) ✓.
**2. Placeholders:** none — all code inline.
**3. Type consistency:** `BookingIntent {model?, projectType?}` (T1) matches T2 usage `setBookingIntent({ projectType: item.projectType, model: item.recommendedModel })` and the listener destructuring ✓; `requestCta` prop name consistent T2 S1/S2 ✓; `banner.{type,model}` consistent T2 S3-5 ✓; `intentBanner` key consistent T1/T2/T3/T4 ✓. `HoverLink`, `radii`, `colors` already imported in contact-section ✓ (verified lines 9-12).
