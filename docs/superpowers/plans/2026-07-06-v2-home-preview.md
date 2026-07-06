# V2 Home Preview + CTA Band Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The home screen gains the v2 services preview (first 3 cards + "Ver todos los servicios →" to /servicios) and the CTA band ("¿Listo para llevar tu idea a producción?" → /contacto).

**Architecture:** Two new hero-side components (`ServicesPreview`, `CtaBand`) wired into `home-page.tsx`; new CMS strings on `hero` (`ctaBandTitle`/`ctaBandSub`) and `services` (`seeAllCta`) with admin fields + merge migration.

**Tech Stack:** Existing patterns (ServiceCard, Reveal, AppButton, goToSection, web casts). No test runner.

**Verification note:** No jest. Verify with `npx tsc --noEmit`, `npx expo export -p web`, hygiene grep, preview. Do NOT run `npx expo lint`.

---

### Task 1: CMS strings (types + seeds + admin)

**Files:**
- Modify: `src/content/types.ts` (HeroContent, ServicesContent)
- Modify: `src/content/seed/{es,en}.ts`
- Modify: `src/admin/components/forms/hero-form.tsx`, `src/admin/components/forms/services-form.tsx`

- [ ] **Step 1: In `types.ts`,** add to `HeroContent` after `clients: string[];`:

```ts
  ctaBandTitle: string;
  ctaBandSub: string;
```

and change `ServicesContent` to:

```ts
export type ServicesContent = { kicker: string; heading: string; requestCta: string; seeAllCta: string; items: ServiceItem[] };
```

- [ ] **Step 2: Seeds.** `es.ts` hero — after the `clients: [...]` line add:

```ts
    ctaBandTitle: '¿Listo para llevar tu idea a producción?',
    ctaBandSub: 'Cuéntame tu proyecto y agenda una llamada gratuita de 30 minutos. Respondo en menos de 24 h.',
```

`es.ts` services — after `requestCta` add: `    seeAllCta: 'Ver todos los servicios',`

`en.ts` hero — after `clients: [...]`:

```ts
    ctaBandTitle: 'Ready to take your idea to production?',
    ctaBandSub: 'Tell me about your project and book a free 30-minute call. I reply within 24 h.',
```

`en.ts` services — after `requestCta`: `    seeAllCta: 'See all services',`

- [ ] **Step 3: Admin forms.** `hero-form.tsx` after the `clients` StringListEditor line:

```tsx
      <Field label="ctaBandTitle" value={value.ctaBandTitle} onChangeText={(t) => set('ctaBandTitle', t)} />
      <Field label="ctaBandSub" value={value.ctaBandSub} onChangeText={(t) => set('ctaBandSub', t)} multiline />
```

`services-form.tsx` after the `requestCta` Field:

```tsx
      <Field label="seeAllCta" value={value.seeAllCta} onChangeText={(t) => set('seeAllCta', t)} />
```

- [ ] **Step 4:** `npx tsc --noEmit` → PASS. Commit:

```bash
git add src/content/ src/admin/
git commit -m "feat(content): v2 home preview + CTA band strings"
```

---

### Task 2: ServicesPreview + CtaBand + home wiring

**Files:**
- Create: `src/features/portfolio/sections/hero/services-preview.tsx`
- Create: `src/features/portfolio/sections/hero/cta-band.tsx`
- Modify: `src/features/portfolio/pages/home-page.tsx`

- [ ] **Step 1: Create `services-preview.tsx` with EXACTLY:**

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ServiceCard } from '../services/service-card';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { goToSection } from '@/ui/go-to-section';
import { Reveal } from '@/ui/reveal';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const ctaTransition = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const arrowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'transform', transitionDuration: '160ms' } as object) : null;

/** Home teaser: first three services + link to the full /servicios page. */
export function ServicesPreview() {
  const { content } = useI18n();
  const { services } = content;

  return (
    <Container style={{ paddingVertical: 40 }}>
      <Reveal delay={0}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', columnGap: 20, rowGap: 10 }}>
          <SectionHeading kicker={services.kicker} heading={services.heading} />
          <Pressable onPress={() => goToSection('services')} style={{ marginLeft: 'auto', marginBottom: 26 }}>
            {({ hovered }: HoverState) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[{ fontFamily: fonts.mono, fontSize: 12.5, color: hovered ? '#eeed6b' : colors.accent }, ctaTransition as object]}>
                  {services.seeAllCta}
                </Text>
                <Text style={[{ fontFamily: fonts.mono, fontSize: 12.5, color: hovered ? '#eeed6b' : colors.accent, transform: [{ translateX: hovered ? 3 : 0 }] }, arrowTransition as object]}>
                  →
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {services.items.slice(0, 3).map((item, i) => (
          <Reveal key={item.index} delay={70 + i * 70} style={{ flexGrow: 1, flexBasis: 300, maxWidth: 560 }}>
            <ServiceCard item={item} requestCta={services.requestCta} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: Create `cta-band.tsx` with EXACTLY:**

```tsx
import { Platform, Text, View, useWindowDimensions } from 'react-native';
import { Container } from '../../components/container';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { goToSection } from '@/ui/go-to-section';
import { Reveal } from '@/ui/reveal';

// v2 design: accent-tinted rounded band with a radial glow from the top.
const bandGlowWeb = Platform.OS === 'web'
  ? ({ backgroundImage: 'radial-gradient(700px 300px at 50% -30%, rgba(228,227,87,0.16), transparent 70%)', overflow: 'hidden' } as object)
  : null;

/** Home closer: "¿Listo para llevar tu idea a producción?" → /contacto. */
export function CtaBand() {
  const { content } = useI18n();
  const { hero } = content;
  const { width } = useWindowDimensions();
  const compact = width < 640;

  return (
    <Container style={{ paddingTop: 30, paddingBottom: 60 }}>
      <Reveal delay={0}>
        <View
          style={[
            { borderRadius: 24, borderWidth: 1, borderColor: 'rgba(228,227,87,0.28)', backgroundColor: 'rgba(255,255,255,0.02)', paddingVertical: compact ? 48 : 64, paddingHorizontal: compact ? 24 : 40, alignItems: 'center' },
            bandGlowWeb as object,
          ]}
        >
          <Text style={{ fontFamily: fonts.display, fontSize: compact ? 28 : 34, letterSpacing: -0.6, color: colors.text, textAlign: 'center', maxWidth: 560 }}>
            {hero.ctaBandTitle}
          </Text>
          <Text style={{ fontSize: 15.5, lineHeight: 25, color: '#b7bcc5', textAlign: 'center', maxWidth: 620, marginTop: 14 }}>
            {hero.ctaBandSub}
          </Text>
          <View style={{ marginTop: 30 }}>
            <AppButton label={hero.primaryCta.label} onPress={() => goToSection('contact')} variant="primary" />
          </View>
        </View>
      </Reveal>
    </Container>
  );
}
```

- [ ] **Step 3: `home-page.tsx`** — add both below the hero:

```tsx
import { PageShell } from '../components/page-shell';
import { HeroSection } from '../sections/hero/hero-section';
import { ServicesPreview } from '../sections/hero/services-preview';
import { CtaBand } from '../sections/hero/cta-band';
import { TrackedSection } from '@/analytics/tracked-section';

export function HomePage() {
  return (
    <PageShell>
      <TrackedSection id="hero"><HeroSection /></TrackedSection>
      <ServicesPreview />
      <CtaBand />
    </PageShell>
  );
}
```

- [ ] **Step 4:** `npx tsc --noEmit && npx expo export -p web` → PASS; hygiene grep only firebase-client chunk. Commit:

```bash
git add src/features/portfolio/
git commit -m "feat(v2): home services preview + CTA band"
```

---

### Task 3: Migration + published

**Files:**
- Create: `scripts/migrate-v2-home.ts`
- Modify: `src/content/published/{es,en}.json` (patch)

- [ ] **Step 1: Drift check** (hero/services published vs pre-change seed — both were re-merged recently, expect aligned):

```bash
node -e "
const fs = require('fs');
for (const l of ['es','en']) {
  const j = JSON.parse(fs.readFileSync('src/content/published/'+l+'.json','utf8'));
  console.log(l, '| hero ctaBand:', 'ctaBandTitle' in j.hero, '| services seeAll:', 'seeAllCta' in j.services, '| items:', j.services.items.length);
}"
```
Expected: `false / false / 9` both locales.

- [ ] **Step 2: `scripts/migrate-v2-home.ts`** — same shape as `scripts/migrate-v2-nav.ts`, merging `{ hero: seed.hero, services: seed.services }`, comment "One-off migration: merge the hero (ctaBandTitle/Sub) and services (seeAllCta) v2 home strings." Run with ADC fallback → `Merged home strings into content/es|en`.

- [ ] **Step 3: Patch published** — python inline (same as phase 1): `j['hero']['ctaBandTitle']=…`, `['ctaBandSub']=…`, `j['services']['seeAllCta']=…` per locale with the seed strings; `git diff --stat` insertion-only.

- [ ] **Step 4:** `npx tsc --noEmit`; commit:

```bash
git add scripts/migrate-v2-home.ts src/content/published/
git commit -m "feat(content): seed v2 home strings in Firestore + mirrors"
```

---

### Task 4: Verify + finish

- [ ] **Step 1: Preview `/`:** hero → 3 cards (01, 02, 03) → "Ver todos los servicios →" navega a `/servicios`; CTA de tarjeta → `/contacto` con banner; banda CTA visible con borde acento + botón "Hablemos de tu proyecto" → `/contacto`; móvil 375: 1 columna, banda compacta, sin overflow; sin errores de consola.

- [ ] **Step 2: Finish.** superpowers:finishing-a-development-branch → push + PR → merge → `gh workflow run deploy.yml --ref main` → live markers (`¿Listo para llevar tu idea a producción?`, `Ver todos los servicios`).

---

## Self-Review

**1. Spec coverage:** types/seeds/admin (T1) ✓ · ServicesPreview con heading row + link hover + 3 cards (T2 S1) ✓ · CtaBand markup del diseño con compact variant (T2 S2) ✓ · home wiring (T2 S3) ✓ · migración+published con drift check (T3) ✓ · verify+deploy (T4) ✓.
**2. Placeholders:** T3 S2-3 referencian scripts de fase 1 por forma pero dan los merges y strings exactos — aceptable al ser el mismo patrón ya committeado en el repo.
**3. Type consistency:** `seeAllCta`/`ctaBandTitle`/`ctaBandSub` idénticos en types/seeds/forms/componentes/migración ✓; `ServiceCard {item, requestCta}` (existente) ✓; `goToSection('services'|'contact')` con claves ya mapeadas en ROUTE_OF ✓.
