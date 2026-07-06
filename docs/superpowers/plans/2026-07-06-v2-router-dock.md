# Portfolio v2 Phase 1 — Router + Dock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The public site becomes 5 real expo-router routes (`/`, `/servicios`, `/sobre-mi`, `/proyectos`, `/contacto`) navigated by the v2 floating bottom dock; intents and tracking keep working across routes.

**Architecture:** New `DockNav` (react-native-svg icons, exact v2 styles) + `PageShell` (shared chrome) + 5 thin page components; `portfolio-screen.tsx` dies; `goToSection` maps CMS anchors to routes; `booking-intent` persists a pending intent consumed on Contact mount; `nav.dock` labels come from CMS.

**Tech Stack:** expo-router routes + `Head`, `react-native-svg` (new dep, dock only), existing web-cast patterns. No test runner.

**Verification note:** No jest. Verify with `npx tsc --noEmit`, `npx expo export -p web` (+ per-route HTML greps), hygiene grep, preview navigation. Do NOT run `npx expo lint`.

---

### Task 1: react-native-svg + DockNav + PageShell

**Files:**
- Modify: `package.json` (via `npx expo install react-native-svg`)
- Create: `src/features/portfolio/components/dock-nav.tsx`
- Create: `src/features/portfolio/components/page-shell.tsx`
- Modify: `src/features/portfolio/components/whatsapp-fab.tsx` (raise on narrow)
- Modify: `src/features/portfolio/sections/hero/hero-section.tsx:71` (drop `nativeID="top"`)

- [ ] **Step 1:** `npx expo install react-native-svg` → check `package.json` gains the dependency; `npx tsc --noEmit` still passes.

- [ ] **Step 2: Create `src/features/portfolio/components/dock-nav.tsx` with EXACTLY:**

```tsx
import { Platform, Pressable, Text, View, useWindowDimensions, type PressableStateCallbackType } from 'react-native';
import { router, usePathname } from 'expo-router';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

// v2 design dock chrome: fixed blurred pill centered at the bottom.
const dockWebWide = Platform.OS === 'web'
  ? ({ position: 'fixed', left: '50%', transform: 'translateX(-50%)', backdropFilter: 'blur(16px)', boxShadow: '0 18px 44px -14px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)' } as object)
  : null;
const dockWebNarrow = Platform.OS === 'web'
  ? ({ position: 'fixed', backdropFilter: 'blur(16px)', boxShadow: '0 18px 44px -14px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.05)' } as object)
  : null;
const tabWeb = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '180ms' } as object) : null;

type IconName = 'home' | 'services' | 'about' | 'projects' | 'contact';

// Icon paths lifted verbatim from Portfolio v2.dc.html (21×21, stroke 1.9).
function DockIcon({ name, color }: { name: IconName; color: string }) {
  const common = { stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' as const };
  return (
    <Svg width={21} height={21} viewBox="0 0 24 24">
      {name === 'home' ? (
        <>
          <Path d="M3 10.5 12 3l9 7.5" {...common} />
          <Path d="M5.5 9.5V20a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.5" {...common} />
        </>
      ) : null}
      {name === 'services' ? (
        <>
          <Rect x={3.5} y={3.5} width={7} height={7} rx={1.5} {...common} />
          <Rect x={13.5} y={3.5} width={7} height={7} rx={1.5} {...common} />
          <Rect x={3.5} y={13.5} width={7} height={7} rx={1.5} {...common} />
          <Rect x={13.5} y={13.5} width={7} height={7} rx={1.5} {...common} />
        </>
      ) : null}
      {name === 'about' ? (
        <>
          <Circle cx={12} cy={8} r={4} {...common} />
          <Path d="M4 21v-1a6 6 0 0 1 12 0v1" {...common} />
        </>
      ) : null}
      {name === 'projects' ? (
        <Path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H9l2 2h8.5A1.5 1.5 0 0 1 21 9.5v8A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z" {...common} />
      ) : null}
      {name === 'contact' ? (
        <>
          <Rect x={3} y={5} width={18} height={14} rx={2} {...common} />
          <Path d="m3.5 7 8.5 6 8.5-6" {...common} />
        </>
      ) : null}
    </Svg>
  );
}

function DockTab({ icon, label, active, narrow, onPress }: { icon: IconName; label: string; active: boolean; narrow: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        { flexDirection: 'column', alignItems: 'center', gap: 4, paddingVertical: narrow ? 8 : 9, paddingHorizontal: narrow ? 6 : 20, borderRadius: 999, backgroundColor: active ? 'rgba(228,227,87,0.16)' : 'transparent' },
        narrow ? { flex: 1 } : null,
        tabWeb as object,
      ]}
    >
      {({ hovered }: HoverState) => {
        const color = active ? colors.accent : hovered ? '#e7e9ec' : '#9aa0aa';
        return (
          <>
            <DockIcon name={icon} color={color} />
            <Text style={{ fontFamily: active ? fonts.bodyMedium : fonts.body, fontSize: 11, color }}>{label}</Text>
          </>
        );
      }}
    </Pressable>
  );
}

export function DockNav() {
  const { content } = useI18n();
  const { dock } = content.nav;
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const narrow = width < 640;

  const tabs: { icon: IconName; route: string; label: string }[] = [
    { icon: 'home', route: '/', label: dock.home },
    { icon: 'services', route: '/servicios', label: dock.services },
    { icon: 'about', route: '/sobre-mi', label: dock.about },
    { icon: 'projects', route: '/proyectos', label: dock.projects },
    { icon: 'contact', route: '/contacto', label: dock.contact },
  ];

  return (
    <View
      style={[
        { position: 'absolute', bottom: 22, zIndex: 56, flexDirection: 'row', alignItems: 'center', gap: 2, padding: 7, borderRadius: 999, backgroundColor: 'rgba(10,11,14,0.76)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
        narrow ? { left: 12, right: 12, justifyContent: 'space-between' } : null,
        (narrow ? dockWebNarrow : dockWebWide) as object,
      ]}
    >
      {tabs.map((t) => (
        <DockTab key={t.route} icon={t.icon} label={t.label} active={pathname === t.route} narrow={narrow} onPress={() => { if (pathname !== t.route) router.push(t.route as never); }} />
      ))}
    </View>
  );
}
```

- [ ] **Step 3: Create `src/features/portfolio/components/page-shell.tsx` with EXACTLY:**

```tsx
import { useEffect, type ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SiteHeader } from './site-header';
import { SiteFooter } from './site-footer';
import { DockNav } from './dock-nav';
import { WhatsAppFab } from './whatsapp-fab';
import { armVisit } from '@/analytics/tracker';
import { colors } from '@/theme/tokens';

/** Chrome shared by every public page: header, scroll area, footer, dock, FAB. */
export function PageShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    armVisit();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SiteHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 148 }}>
        <View nativeID="top" style={{ alignSelf: 'stretch' }} />
        {children}
        <SiteFooter />
      </ScrollView>
      <DockNav />
      <WhatsAppFab />
    </View>
  );
}
```

- [ ] **Step 4: In `hero-section.tsx` line 71, drop the id (PageShell owns `top` now):**

```tsx
    <Container style={{ paddingVertical: 88 }}>
```

- [ ] **Step 5: In `whatsapp-fab.tsx`, raise the FAB above the dock on narrow screens.**
  - Add `useWindowDimensions` to the existing `react-native` import.
  - First lines inside the `WhatsAppFab` component body, add:

```tsx
  const { width } = useWindowDimensions();
  const narrow = width < 640;
```

  - Replace the unique `bottom: 24,` (the FAB container style, line ~59) with:

```tsx
          bottom: narrow ? 96 : 24,
```

- [ ] **Step 6:** `npx tsc --noEmit` — expect an error ONLY about `content.nav.dock` not existing yet (added in Task 4). If so, temporarily proceed; Task 4 resolves it. Commit:

```bash
git add package.json package-lock.json src/features/portfolio/
git commit -m "feat(v2): DockNav + PageShell + FAB clearance (react-native-svg)"
```

---

### Task 2: Pages + routes + Head; retire portfolio-screen; simplify header

**Files:**
- Create: `src/features/portfolio/pages/{home,services,about,projects,contact}-page.tsx`
- Create: `src/app/{servicios,sobre-mi,proyectos,contacto}.tsx`
- Modify: `src/app/index.tsx` (swap screen)
- Modify: `src/features/portfolio/components/site-header.tsx` (rewrite)
- Delete: `src/features/portfolio/portfolio-screen.tsx`, `src/features/portfolio/hooks/use-active-section.tsx`, `src/features/portfolio/components/nav-link.tsx`

- [ ] **Step 1: Create the five page components:**

`src/features/portfolio/pages/home-page.tsx`:
```tsx
import { PageShell } from '../components/page-shell';
import { HeroSection } from '../sections/hero/hero-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function HomePage() {
  return (
    <PageShell>
      <TrackedSection id="hero"><HeroSection /></TrackedSection>
    </PageShell>
  );
}
```

`src/features/portfolio/pages/services-page.tsx`:
```tsx
import { PageShell } from '../components/page-shell';
import { ServicesSection } from '../sections/services/services-section';
import { ProcessSection } from '../sections/process/process-section';
import { CollaborationSection } from '../sections/collaboration/collaboration-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function ServicesPage() {
  return (
    <PageShell>
      <TrackedSection id="services"><ServicesSection /></TrackedSection>
      <TrackedSection id="process"><ProcessSection /></TrackedSection>
      <TrackedSection id="collaboration"><CollaborationSection /></TrackedSection>
    </PageShell>
  );
}
```

`src/features/portfolio/pages/about-page.tsx`:
```tsx
import { PageShell } from '../components/page-shell';
import { ImpactSection } from '../sections/impact/impact-section';
import { StackSection } from '../sections/stack/stack-section';
import { ExperienceSection } from '../sections/experience/experience-section';
import { GlobalReachSection } from '../sections/global-reach/global-reach-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function AboutPage() {
  return (
    <PageShell>
      <TrackedSection id="impact"><ImpactSection /></TrackedSection>
      <TrackedSection id="stack"><StackSection /></TrackedSection>
      <TrackedSection id="experience"><ExperienceSection /></TrackedSection>
      <TrackedSection id="reach"><GlobalReachSection /></TrackedSection>
    </PageShell>
  );
}
```

`src/features/portfolio/pages/projects-page.tsx`:
```tsx
import { PageShell } from '../components/page-shell';
import { ProjectsSection } from '../sections/projects/projects-section';
import { TestimonialsSection } from '../sections/testimonials/testimonials-section';
import { FormationSection } from '../sections/formation/formation-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function ProjectsPage() {
  return (
    <PageShell>
      <TrackedSection id="projects"><ProjectsSection /></TrackedSection>
      <TrackedSection id="testimonials"><TestimonialsSection /></TrackedSection>
      <TrackedSection id="formation"><FormationSection /></TrackedSection>
    </PageShell>
  );
}
```

`src/features/portfolio/pages/contact-page.tsx`:
```tsx
import { PageShell } from '../components/page-shell';
import { ContactSection } from '../sections/contact/contact-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function ContactPage() {
  return (
    <PageShell>
      <TrackedSection id="contact"><ContactSection /></TrackedSection>
    </PageShell>
  );
}
```

- [ ] **Step 2: In `src/app/index.tsx`, swap the screen import/usage** (`PortfolioScreen` → `HomePage` from `@/features/portfolio/pages/home-page`; the Head/OG block is untouched).

- [ ] **Step 3: Create the four route files.** Same shape each; titles/descriptions:

`src/app/servicios.tsx`:
```tsx
import Head from 'expo-router/head';
import { ServicesPage } from '@/features/portfolio/pages/services-page';

const TITLE = 'Servicios — Luis De La Torre';
const DESCRIPTION = 'Desarrollo web y móvil, AR/3D, backend y microservicios, cloud, IA, chatbots y agentes inteligentes — cómo trabajo y modelos de colaboración.';

export default function Servicios() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href="https://luisdelatorre.dev/servicios" />
      </Head>
      <ServicesPage />
    </>
  );
}
```

`src/app/sobre-mi.tsx`: component `SobreMi`, screen `AboutPage`, TITLE `Sobre mí — Luis De La Torre`, DESCRIPTION `Resultados medibles, stack tecnológico, trayectoria profesional y experiencia nacional e internacional de Luis De La Torre.`, canonical `https://luisdelatorre.dev/sobre-mi`.

`src/app/proyectos.tsx`: component `Proyectos`, screen `ProjectsPage`, TITLE `Proyectos — Luis De La Torre`, DESCRIPTION `Proyectos destacados en fintech, IoT, telecom, e-commerce y AR — con recomendaciones de colegas, certificaciones y formación.`, canonical `https://luisdelatorre.dev/proyectos`.

`src/app/contacto.tsx`: component `Contacto`, screen `ContactPage`, TITLE `Contacto — Luis De La Torre`, DESCRIPTION `Cuéntame tu proyecto y agenda una llamada gratuita de 30 minutos. Respondo en menos de 24 horas.`, canonical `https://luisdelatorre.dev/contacto`.

- [ ] **Step 4: Rewrite `site-header.tsx`** — same container/logo/animation, drop the links row + scroll-spy:

```tsx
import { useEffect, useRef } from 'react';
import { Animated, Image, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { goToSection } from '@/ui/go-to-section';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;
const logoTransition = Platform.OS === 'web' ? ({ transitionProperty: 'transform', transitionDuration: '200ms' } as object) : null;

export function SiteHeader() {
  const { content, toggleLocale } = useI18n();
  const { nav } = content;

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [enter]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        columnGap: 20,
        rowGap: 12,
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.07)',
        backgroundColor: 'rgba(10,11,14,0.72)',
      }}
    >
      <Pressable onPress={() => goToSection('hero')} style={webCursor as object}>
        {({ hovered }: HoverState) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0, flexShrink: 1 }}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={[{ width: 36, height: 36, borderRadius: 9, transform: [{ scale: hovered ? 1.08 : 1 }] }, logoTransition as object]}
            />
            <View style={{ flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>{nav.name}</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6, color: colors.accent }}>{nav.role}</Text>
            </View>
          </View>
        )}
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 24, flexWrap: 'wrap', flexShrink: 1 }}>
        <AppButton label={nav.languageToggleLabel} onPress={toggleLocale} variant="pill" size="sm" />
        <AppButton label={nav.cta.label} onPress={() => goToSection(nav.cta.anchor)} variant="pillPrimary" size="sm" />
      </View>
    </Animated.View>
  );
}
```

- [ ] **Step 5: Delete** `src/features/portfolio/portfolio-screen.tsx`, `src/features/portfolio/hooks/use-active-section.tsx`, `src/features/portfolio/components/nav-link.tsx` (only site-header consumed them — verified).

```bash
git rm src/features/portfolio/portfolio-screen.tsx src/features/portfolio/hooks/use-active-section.tsx src/features/portfolio/components/nav-link.tsx
```

- [ ] **Step 6:** `npx tsc --noEmit` — remaining errors must ONLY be `go-to-section` (Task 3) and `nav.dock` (Task 4). Commit:

```bash
git add src/app/ src/features/portfolio/
git commit -m "feat(v2): five routes with per-page Head; retire single-page screen"
```

---

### Task 3: goToSection + persistent intent + call-site swaps

**Files:**
- Create: `src/ui/go-to-section.ts`
- Modify: `src/features/portfolio/sections/contact/booking-intent.ts`
- Modify: `contact-section.tsx` (intent effect), `hero-section.tsx:109-110`, `collaboration-section.tsx:53`, `service-card.tsx:50`

- [ ] **Step 1: Create `src/ui/go-to-section.ts` with EXACTLY:**

```ts
import { router } from 'expo-router';
import { scrollToAnchor } from './scroll-to-anchor';

// Which route each section anchor lives on (v2 multi-page layout).
const ROUTE_OF: Record<string, string> = {
  hero: '/',
  services: '/servicios',
  process: '/servicios',
  collaboration: '/servicios',
  impact: '/sobre-mi',
  stack: '/sobre-mi',
  experience: '/sobre-mi',
  reach: '/sobre-mi',
  projects: '/proyectos',
  testimonials: '/proyectos',
  formation: '/proyectos',
  contact: '/contacto',
};
// Same-route scroll targets that differ from the anchor name.
const SCROLL_ID: Record<string, string> = { hero: 'top' };

/** Navigate to the route that owns `anchor`, or scroll to it when already there. */
export function goToSection(anchor: string): void {
  const route = ROUTE_OF[anchor];
  if (!route) {
    scrollToAnchor(anchor);
    return;
  }
  const here = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (here === route) {
    scrollToAnchor(SCROLL_ID[anchor] ?? anchor);
  } else {
    router.push(route as never);
  }
}
```

- [ ] **Step 2: Replace `booking-intent.ts` ENTIRELY with:**

```ts
export type BookingIntent = { model?: string; projectType?: string };

type Listener = (intent: BookingIntent) => void;
const listeners = new Set<Listener>();
let pending: BookingIntent | null = null;

/** Broadcast what the visitor tapped; kept until Contact mounts and consumes it. */
export function setBookingIntent(intent: BookingIntent): void {
  pending = intent;
  listeners.forEach((l) => l(intent));
}

/** One-shot read of the last intent (cross-route navigation). */
export function consumeBookingIntent(): BookingIntent | null {
  const intent = pending;
  pending = null;
  return intent;
}

/** Subscribe to intent broadcasts; returns an unsubscribe. */
export function onBookingIntent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
```

- [ ] **Step 3: In `contact-section.tsx`** update the import to include `consumeBookingIntent` and `type BookingIntent`, then replace the intent effect:

```tsx
  useEffect(() => onBookingIntent((i) => {
    if (i.model) setModel(i.model);
    if (i.projectType) {
      setType(i.projectType);
      setIntentNotice(i.model ? { type: i.projectType, model: i.model } : null);
    }
    setStep('form');
  }), []);
```

with:

```tsx
  const applyIntent = (i: BookingIntent) => {
    if (i.model) setModel(i.model);
    if (i.projectType) {
      setType(i.projectType);
      setIntentNotice(i.model ? { type: i.projectType, model: i.model } : null);
    }
    setStep('form');
  };

  useEffect(() => {
    const pending = consumeBookingIntent();
    if (pending) applyIntent(pending);
    return onBookingIntent(applyIntent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
```

- [ ] **Step 4: Swap the cross-section call sites** (import `goToSection` from `@/ui/go-to-section`, drop the now-unused `scrollToAnchor` import in each):
  - `hero-section.tsx:109-110`: `onPress={() => goToSection(hero.primaryCta.anchor)}` / `onPress={() => goToSection(hero.secondaryCta.anchor)}`.
  - `collaboration-section.tsx:53`: `goToSection('contact');`
  - `service-card.tsx:50`: `goToSection('contact');`
  (site-footer keeps `scrollToAnchor('top')` — same-page by design.)

- [ ] **Step 5:** `npx tsc --noEmit` — only the `nav.dock` error may remain. Commit:

```bash
git add src/ui/go-to-section.ts src/features/portfolio/
git commit -m "feat(v2): cross-route section navigation + persistent booking intent"
```

---

### Task 4: CMS dock labels + sitemap

**Files:**
- Modify: `src/content/types.ts` (NavContent), `src/content/seed/{es,en}.ts`, `src/admin/components/forms/nav-form.tsx`, `public/sitemap.xml`
- Create: `scripts/migrate-v2-nav.ts`
- Modify: `src/content/published/{es,en}.json` (via patch script)

- [ ] **Step 1: `NavContent` gains `dock`** (after `cta`):

```ts
export type NavContent = {
  name: string;
  role: string;
  links: { label: string; anchor: string }[];
  languageToggleLabel: string;
  cta: CtaLink;
  dock: { home: string; services: string; about: string; projects: string; contact: string };
};
```

- [ ] **Step 2: Seeds** — in `es.ts` nav, after the `cta` line add:

```ts
    dock: { home: 'Inicio', services: 'Servicios', about: 'Sobre mí', projects: 'Proyectos', contact: 'Contacto' },
```

In `en.ts`:

```ts
    dock: { home: 'Home', services: 'Services', about: 'About', projects: 'Projects', contact: 'Contact' },
```

- [ ] **Step 3: `nav-form.tsx`** — after the `cta.anchor` Field add:

```tsx
      <Label>dock</Label>
      <Field label="dock.home" value={value.dock.home} onChangeText={(t) => set('dock', { ...value.dock, home: t })} />
      <Field label="dock.services" value={value.dock.services} onChangeText={(t) => set('dock', { ...value.dock, services: t })} />
      <Field label="dock.about" value={value.dock.about} onChangeText={(t) => set('dock', { ...value.dock, about: t })} />
      <Field label="dock.projects" value={value.dock.projects} onChangeText={(t) => set('dock', { ...value.dock, projects: t })} />
      <Field label="dock.contact" value={value.dock.contact} onChangeText={(t) => set('dock', { ...value.dock, contact: t })} />
```

- [ ] **Step 4: Drift-check + migration.** Drift check: `node -e` compare `published/*.json` `nav` keys vs seed (nav has been untouched since seeding — expect identical). Create `scripts/migrate-v2-nav.ts` (same shape as `scripts/migrate-testimonials.ts`, merging `{ nav: seed.nav }` for es/en, header comment "One-off migration: merge ONLY the nav section (adds dock labels)"). Run with the usual ADC fallback. Then overwrite the scratchpad `patch-published.ts` to set `j.nav = seed.nav` and run it; `git diff --stat src/content/published/` should be insertion-only.

- [ ] **Step 5: `public/sitemap.xml`** — replace the single `<url>` with five (`/`, `/servicios`, `/sobre-mi`, `/proyectos`, `/contacto`), each `<changefreq>monthly</changefreq>`, priority `1.0` for `/` and `0.8` for the rest.

- [ ] **Step 6:** `npx tsc --noEmit` → PASS (all Task 1-3 pending errors resolved). Commit:

```bash
git add src/content/ src/admin/ scripts/migrate-v2-nav.ts public/sitemap.xml
git commit -m "feat(v2): dock labels in CMS + five-URL sitemap"
```

---

### Task 5: Verify + finish

- [ ] **Step 1: Export + static checks:**

```bash
npx expo export -p web
for f in index servicios sobre-mi proyectos contacto; do echo "== $f"; grep -o '<title[^>]*>[^<]*' "dist/$f.html" | head -1; done
grep -lE 'initializeApp|firebase/auth' dist/_expo/static/js/web/*.js   # only firebase-client chunk
```
Expected: five HTML files, each with its own title.

- [ ] **Step 2: Preview flows:** dock on all routes with active tab correct; "Solicitar este servicio" on `/servicios` → lands on `/contacto` with banner + chip; "Trabajemos" → `/contacto`; hero "Ver proyectos" → `/proyectos`; footer "Volver arriba" scrolls; ES/en toggle works everywhere; `preview_resize` mobile 375 → dock stretches edge-to-edge, FAB at bottom 96, no overlap, no horizontal overflow; no console errors.

- [ ] **Step 3: Finish.** superpowers:finishing-a-development-branch → push + PR. After merge: `gh workflow run deploy.yml --ref main`, watch; live: the 5 URLs return 200 with their titles (cleanUrls), dock visible, intents work.

---

## Self-Review

**1. Spec coverage:** react-native-svg + DockNav estilos/íconos verbatim (T1 S1-2) ✓ · PageShell con paddingBottom 148 + top anchor + armVisit (T1 S3-4) ✓ · FAB a 96 en narrow (T1 S5, del CSS del diseño `[data-fab]{bottom:96px}`) ✓ · 5 páginas + rutas + Head/canonical (T2 S1-3) ✓ · header sin scroll-spy + borrado de portfolio-screen/use-active-section/nav-link (T2 S4-5) ✓ · goToSection con ROUTE_OF/SCROLL_ID + intent persistente consumido al montar (T3) ✓ · swaps de call sites (T3 S4; footer se queda con scrollToAnchor) ✓ · CMS dock + nav-form + migración + published + sitemap ×5 (T4) ✓ · OG solo en `/` (index.tsx no se toca salvo el swap) ✓ · verificación por HTML estático + preview + live (T5) ✓.
**2. Placeholders:** ninguno — los cuatro route files comparten forma con el ejemplo completo de servicios y difieren solo en 4 strings dados explícitamente.
**3. Type consistency:** `IconName`/tabs/dock keys coinciden T1↔T4 (`dock.home…contact`) ✓; `goToSection` usado por header (T2 S4) se crea en T3 — por eso T2 S6 tolera ese error hasta T3, y el orden de commits lo refleja ✓; `BookingIntent`/`consumeBookingIntent` (T3 S2) coinciden con el uso en S3 ✓; `pathname === t.route` con rutas exactas de expo-router ✓.

**Nota de orden:** T2 depende de `go-to-section` (T3) para compilar el header; los commits de T2 y T3 son consecutivos y el tsc intermedio documenta el error esperado. Si se ejecuta con subagentes, dispatch T2+T3 al mismo subagente o en secuencia inmediata.
