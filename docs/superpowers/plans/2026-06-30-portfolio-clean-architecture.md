# Portfolio Clean Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the `Portfolio.html` mock as a clean, data-driven Expo app with a feature-first structure, centralized theme, bilingual ES/EN i18n, and fully implemented Hero + Services sections.

**Architecture:** Feature-first. A `theme/` and `i18n/` module provide cross-cutting context; `content/` holds strictly-typed per-locale data; `features/portfolio/` holds the screen, shared components, and section components. Sections render from `content` (no hardcoded copy). React Native primitives only, so the code is multiplatform-ready while we polish web this phase.

**Tech Stack:** Expo ~57, Expo Router ~57, React Native 0.86 / react-native-web, TypeScript (strict), `@expo-google-fonts/{space-grotesk,ibm-plex-sans,jetbrains-mono}`.

**Testing note:** No RN unit-test runner is configured. Verification gate per task is `npx tsc --noEmit` (type safety + ES/EN translation parity). Final task adds a web render check via `npm run web`.

---

### Task 1: Theme tokens + provider

**Files:**
- Create: `src/theme/tokens.ts`
- Create: `src/theme/theme-provider.tsx`

- [ ] **Step 1: Create `src/theme/tokens.ts`**

```ts
export const fonts = {
  display: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  body: 'IBMPlexSans_400Regular',
  bodyMedium: 'IBMPlexSans_500Medium',
  mono: 'JetBrainsMono_400Regular',
} as const;

export const colors = {
  accent: '#e4e357',
  background: '#0a0b0e',
  surface: 'rgba(255,255,255,0.024)',
  surfaceStrong: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.12)',
  onAccent: '#07120e',
  text: '#f4f5f7',
  textMuted: 'rgb(183,188,197)',
  textDim: 'rgb(154,160,170)',
  textFainter: 'rgb(139,144,154)',
  textFaint: 'rgb(107,114,128)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 40,
  xxl: 72,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const layout = {
  maxWidth: 1180,
  gutter: 40,
} as const;

export const theme = { fonts, colors, spacing, radii, layout } as const;
export type Theme = typeof theme;
```

- [ ] **Step 2: Create `src/theme/theme-provider.tsx`**

```tsx
import { createContext, useContext, type ReactNode } from 'react';
import { theme, type Theme } from './tokens';

const ThemeContext = createContext<Theme>(theme);

export function ThemeProvider({ children }: { children: ReactNode }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS (no errors from these files).

- [ ] **Step 4: Commit**

```bash
git add src/theme
git commit -m "feat(theme): add design tokens and theme provider"
```

---

### Task 2: i18n locales + provider

**Files:**
- Create: `src/i18n/locales.ts`
- Create: `src/i18n/i18n-provider.tsx`

- [ ] **Step 1: Create `src/i18n/locales.ts`**

```ts
export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';
```

- [ ] **Step 2: Create `src/i18n/i18n-provider.tsx`**

Note: imports `getContent` from the dictionary created in Task 5. That is fine —
Task 5 is completed before this file is exercised at build time in Task 10, but
to keep `tsc` green after this task, Task 5 must be authored before running the
type check. Implement Tasks 2→5 then type-check. (Adjust order below is handled
by committing Task 2 code without running tsc until Task 5.)

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { getContent } from '@/content/dictionary';
import type { PortfolioContent } from '@/content/types';
import { DEFAULT_LOCALE, type Locale } from './locales';

type I18nValue = {
  locale: Locale;
  content: PortfolioContent;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      content: getContent(locale),
      toggleLocale: () => setLocale((prev) => (prev === 'es' ? 'en' : 'es')),
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used within I18nProvider');
  return value;
}
```

- [ ] **Step 3: Commit (type check deferred to Task 5)**

```bash
git add src/i18n
git commit -m "feat(i18n): add locales and i18n provider"
```

---

### Task 3: Content types

**Files:**
- Create: `src/content/types.ts`

- [ ] **Step 1: Create `src/content/types.ts`**

```ts
export type Stat = { value: string; label: string };
export type CtaLink = { label: string; anchor: string };

export type NavContent = {
  role: string;
  links: { label: string; anchor: string }[];
  languageToggleLabel: string;
  cta: CtaLink;
};

export type HeroContent = {
  availability: string;
  titleLead: string;
  titleAccent: string;
  subtitle: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  stats: Stat[];
};

export type ServiceItem = {
  index: string;
  tag: string;
  title: string;
  description: string;
};
export type ServicesContent = { kicker: string; heading: string; items: ServiceItem[] };

export type ImpactItem = { value: string; label: string };
export type ImpactContent = { kicker: string; heading: string; items: ImpactItem[] };

export type StackGroup = { category: string; items: string[] };
export type StackContent = { kicker: string; heading: string; groups: StackGroup[] };

export type ExperienceItem = {
  period: string;
  location: string;
  current?: boolean;
  currentLabel?: string;
  role: string;
  company: string;
  description: string;
};
export type ExperienceContent = { kicker: string; heading: string; items: ExperienceItem[] };

export type ProjectItem = {
  category: string;
  title: string;
  description: string;
  tech: string[];
};
export type ProjectsContent = { kicker: string; heading: string; items: ProjectItem[] };

export type Certification = { name: string; issuer: string };
export type CertificationsContent = { kicker: string; heading: string; items: Certification[] };

export type ContactContent = {
  kicker: string;
  heading: string;
  blurb: string;
  email: string;
  cta: string;
  socials: { label: string; url: string }[];
};

export type PortfolioContent = {
  nav: NavContent;
  hero: HeroContent;
  services: ServicesContent;
  impact: ImpactContent;
  stack: StackContent;
  experience: ExperienceContent;
  projects: ProjectsContent;
  certifications: CertificationsContent;
  contact: ContactContent;
};
```

- [ ] **Step 2: Commit**

```bash
git add src/content/types.ts
git commit -m "feat(content): add portfolio content types"
```

---

### Task 4: Spanish content

**Files:**
- Create: `src/content/es.ts`

- [ ] **Step 1: Create `src/content/es.ts`**

```ts
import type { PortfolioContent } from './types';

export const es: PortfolioContent = {
  nav: {
    role: 'Senior Full-Stack & Mobile',
    links: [
      { label: 'Servicios', anchor: 'services' },
      { label: 'Experiencia', anchor: 'experience' },
      { label: 'Proyectos', anchor: 'projects' },
    ],
    languageToggleLabel: 'ES / en',
    cta: { label: 'Trabajemos', anchor: 'contact' },
  },
  hero: {
    availability: 'Disponible para proyectos freelance',
    titleLead: 'Construyo productos digitales que generan',
    titleAccent: 'impacto real.',
    subtitle:
      'Senior Full-Stack & Mobile Developer con +7 años diseñando apps móviles, plataformas web escalables, experiencias de Realidad Aumentada y sistemas distribuidos. De la arquitectura al despliegue en App Store y Google Play.',
    primaryCta: { label: 'Hablemos de tu proyecto', anchor: 'contact' },
    secondaryCta: { label: 'Ver proyectos', anchor: 'projects' },
    stats: [
      { value: '7+', label: 'años de experiencia' },
      { value: '15+', label: 'microservicios en producción' },
      { value: '99.9%', label: 'uptime sostenido' },
    ],
  },
  services: {
    kicker: 'servicios',
    heading: 'Cómo puedo ayudarte',
    items: [
      { index: '01', tag: 'WEB', title: 'Desarrollo Web', description: 'Aplicaciones React y Next.js de alto rendimiento, dashboards en tiempo real y SPAs escalables con UX pulida.' },
      { index: '02', tag: 'MOBILE', title: 'Apps Móviles', description: 'iOS y Android nativo (Swift/Kotlin) y multiplataforma con Flutter, KMP y React Native, publicadas en las stores.' },
      { index: '03', tag: 'AR/3D', title: 'Realidad Aumentada & Unity', description: 'Experiencias AR nativas (ARKit/ARCore) y 3D/VR con Unity que digitalizan productos y triplican el engagement.' },
      { index: '04', tag: 'BACKEND', title: 'Backend & Microservicios', description: 'Arquitecturas distribuidas, DDD, event-driven y APIs robustas con NestJS, FastAPI, Spring Boot y Go.' },
      { index: '05', tag: 'CLOUD', title: 'Cloud & DevOps', description: 'Infraestructura en AWS y Azure con Terraform (IaC), CI/CD, Docker y Kubernetes para despliegues confiables.' },
      { index: '06', tag: 'AI/ML', title: 'Integración de IA/ML', description: 'Pipelines de datos, análisis predictivo y modelos de machine learning integrados directamente en tu producto.' },
      { index: '07', tag: 'LEAD', title: 'Consultoría & Tech Lead', description: 'Definición de arquitectura, estándares de ingeniería y liderazgo técnico para llevar tu producto a producción.' },
    ],
  },
  impact: {
    kicker: 'impacto',
    heading: 'Resultados medibles',
    items: [
      { value: '3×', label: 'más engagement con experiencias AR' },
      { value: '85%', label: 'precisión en detección de emociones (ML)' },
      { value: '40%', label: 'menos tiempo de despliegue' },
      { value: '99.9%', label: 'uptime en producción' },
      { value: '6h→15m', label: 'build de iOS optimizado con CI/CD' },
      { value: '1000+', label: 'usuarios concurrentes escalados' },
      { value: '+20%', label: 'ingresos empresariales generados' },
      { value: '−45%', label: 'response time tras optimización' },
    ],
  },
  stack: {
    kicker: 'stack',
    heading: 'Tecnologías que domino',
    groups: [
      { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Material UI', 'Angular'] },
      { category: 'Mobile', items: ['Swift', 'Kotlin', 'Flutter', 'KMP', 'React Native'] },
      { category: 'AR / 3D', items: ['Unity', 'ARKit', 'ARCore', 'VR'] },
      { category: 'Backend', items: ['NestJS', 'FastAPI', 'Django', 'Spring Boot', 'Go', 'Node.js'] },
    ],
  },
  experience: {
    kicker: 'trayectoria',
    heading: 'Experiencia',
    items: [
      { period: '06/2025 — 06/2026', location: 'Ecuador', current: true, currentLabel: 'ACTUAL', role: 'Senior Full-Stack Developer', company: 'TechDelivery', description: 'Tech Lead provisional en apps React Native + microservicios en Go (IoT Tuya). Estructuré infraestructura AWS con Terraform y rediseñé los pipelines de despliegue móvil (APK / TestFlight).' },
      { period: '03/2025 — 04/2026', location: 'Quito', role: 'Software Development Engineer', company: 'Netby IT Consulting', description: 'App bancaria (Produbanco) en Kotlin Multiplatform con OTP y biometría facial. Reduje el build de iOS de ~6 horas a 15 minutos con CI/CD en Azure e integré SDKs nativos de terceros.' },
      { period: '09/2022 — 03/2025', location: 'Chile', role: 'Software Development Engineer', company: 'Acid Labs', description: 'Diseñé 15+ microservicios para e-commerce enterprise. Escalé a 1000+ usuarios concurrentes, reduje la latencia 35% y elevé el uptime a 99.9% con CI/CD e IaC en AWS.' },
      { period: '07/2024 — 05/2025', location: 'Quito', role: 'Senior Full-Stack Developer', company: 'Smartisp · Freelance', description: 'Dashboards React en tiempo real para telecom (OLT/ONU) monitoreando 100+ dispositivos con refresco cada 5s vía protocolos industriales (SNMP).' },
      { period: '11/2021 — 07/2022', location: 'Quito', role: 'Senior Full-Stack Developer', company: 'Mushroomsoft', description: 'Plataforma de salud digital con conectores HL7/FHIR sobre AWS. Reduje el response time 45% y elevé la satisfacción de usuarios 20%.' },
      { period: '11/2020 — 12/2021', location: 'Colombia', role: 'Senior Full-Stack Developer', company: 'Sinergia Red Internacional', description: 'Apps React Native multiplataforma y arquitectura backend escalable. Entregué 4+ proyectos clave ~15% antes del deadline con metodología ágil.' },
      { period: '09/2019 — 03/2021', location: 'México', role: 'Full-Stack Developer', company: 'EXCITED, Inc', description: 'Plataforma social con ML (IBM Watson, 85% accuracy en sentiment analysis), messaging en tiempo real y arquitectura event-driven sobre AWS.' },
      { period: '04/2019 — 08/2019', location: 'Ecuador', role: 'Senior Full-Stack Developer', company: 'Vinary VR/AR', description: 'Experiencias AR/VR nativas con Unity que reemplazaron material físico, elevaron el engagement 3× y generaron +20% de ingresos empresariales.' },
    ],
  },
  projects: {
    kicker: 'destacados',
    heading: 'Proyectos',
    items: [
      { category: 'FINTECH', title: 'Banca móvil KMP', description: 'App bancaria multiplataforma con OTP, biometría facial (FacePhi) y cumplimiento de políticas de las stores, con CI/CD en Azure.', tech: ['Kotlin Multiplatform', 'iOS', 'Android', 'Azure'] },
      { category: 'IoT', title: 'Audax · Tuya IoT', description: 'Integración de dispositivos Tuya en una app React Native con un microservicio en Go y pipelines de despliegue móvil optimizados.', tech: ['React Native', 'Go', 'IoT', 'CI/CD'] },
      { category: 'TELECOM', title: 'Smartisp OLT', description: 'Sistema de monitoreo de fibra óptica en tiempo real con dashboards en vivo, control remoto de equipos y telemetría de baja latencia.', tech: ['React', 'SNMP', 'Microservicios'] },
      { category: 'E-COMMERCE', title: 'Plataforma Enterprise', description: '15+ microservicios escalables en AWS con integraciones de pagos y partners, soportando 1000+ usuarios concurrentes.', tech: ['AWS', 'Terraform', 'Kubernetes', 'Node.js'] },
      { category: 'AR/3D', title: 'AR Commerce', description: 'Experiencias de Realidad Aumentada con Unity que digitalizaron catálogos comerciales y triplicaron el engagement de clientes.', tech: ['Unity', 'ARKit', 'ARCore'] },
    ],
  },
  certifications: {
    kicker: 'formación continua',
    heading: 'Certificaciones',
    items: [
      { name: 'Máster en Arquitectura de Microservicios con Docker', issuer: 'Lite Thinking' },
      { name: 'DevOps con AWS', issuer: 'Smart Data' },
      { name: 'NestJS: Persistencia con MongoDB y TypeORM', issuer: 'Udemy' },
    ],
  },
  contact: {
    kicker: 'contacto',
    heading: 'Trabajemos juntos',
    blurb: 'Cuéntame sobre tu proyecto y construyamos algo con impacto real.',
    email: 'luis.atorred24@gmail.com',
    cta: 'Enviar un correo',
    socials: [
      { label: 'GitHub', url: 'https://github.com/' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    ],
  },
};
```

Note: `certifications` item 3, `contact` heading/blurb/socials are not fully
visible in the truncated mock; values above are reasonable defaults. Adjust with
real data if available — they are typed, so parity is enforced regardless.

- [ ] **Step 2: Commit**

```bash
git add src/content/es.ts
git commit -m "feat(content): add Spanish portfolio content"
```

---

### Task 5: English content + dictionary

**Files:**
- Create: `src/content/en.ts`
- Create: `src/content/dictionary.ts`

- [ ] **Step 1: Create `src/content/en.ts`**

```ts
import type { PortfolioContent } from './types';

export const en: PortfolioContent = {
  nav: {
    role: 'Senior Full-Stack & Mobile',
    links: [
      { label: 'Services', anchor: 'services' },
      { label: 'Experience', anchor: 'experience' },
      { label: 'Projects', anchor: 'projects' },
    ],
    languageToggleLabel: 'es / EN',
    cta: { label: "Let's work", anchor: 'contact' },
  },
  hero: {
    availability: 'Available for freelance projects',
    titleLead: 'I build digital products that drive',
    titleAccent: 'real impact.',
    subtitle:
      'Senior Full-Stack & Mobile Developer with 7+ years building mobile apps, scalable web platforms, Augmented Reality experiences and distributed systems. From architecture to App Store and Google Play release.',
    primaryCta: { label: "Let's talk about your project", anchor: 'contact' },
    secondaryCta: { label: 'View projects', anchor: 'projects' },
    stats: [
      { value: '7+', label: 'years of experience' },
      { value: '15+', label: 'microservices in production' },
      { value: '99.9%', label: 'sustained uptime' },
    ],
  },
  services: {
    kicker: 'services',
    heading: 'How I can help you',
    items: [
      { index: '01', tag: 'WEB', title: 'Web Development', description: 'High-performance React and Next.js apps, real-time dashboards and scalable SPAs with polished UX.' },
      { index: '02', tag: 'MOBILE', title: 'Mobile Apps', description: 'Native iOS and Android (Swift/Kotlin) and cross-platform with Flutter, KMP and React Native, shipped to the stores.' },
      { index: '03', tag: 'AR/3D', title: 'Augmented Reality & Unity', description: 'Native AR experiences (ARKit/ARCore) and 3D/VR with Unity that digitize products and triple engagement.' },
      { index: '04', tag: 'BACKEND', title: 'Backend & Microservices', description: 'Distributed architectures, DDD, event-driven systems and robust APIs with NestJS, FastAPI, Spring Boot and Go.' },
      { index: '05', tag: 'CLOUD', title: 'Cloud & DevOps', description: 'AWS and Azure infrastructure with Terraform (IaC), CI/CD, Docker and Kubernetes for reliable deployments.' },
      { index: '06', tag: 'AI/ML', title: 'AI/ML Integration', description: 'Data pipelines, predictive analytics and machine learning models integrated directly into your product.' },
      { index: '07', tag: 'LEAD', title: 'Consulting & Tech Lead', description: 'Architecture definition, engineering standards and technical leadership to take your product to production.' },
    ],
  },
  impact: {
    kicker: 'impact',
    heading: 'Measurable results',
    items: [
      { value: '3×', label: 'more engagement with AR experiences' },
      { value: '85%', label: 'accuracy in emotion detection (ML)' },
      { value: '40%', label: 'less deployment time' },
      { value: '99.9%', label: 'uptime in production' },
      { value: '6h→15m', label: 'iOS build optimized with CI/CD' },
      { value: '1000+', label: 'concurrent users scaled' },
      { value: '+20%', label: 'enterprise revenue generated' },
      { value: '−45%', label: 'response time after optimization' },
    ],
  },
  stack: {
    kicker: 'stack',
    heading: 'Technologies I master',
    groups: [
      { category: 'Frontend', items: ['React', 'Next.js', 'TypeScript', 'Material UI', 'Angular'] },
      { category: 'Mobile', items: ['Swift', 'Kotlin', 'Flutter', 'KMP', 'React Native'] },
      { category: 'AR / 3D', items: ['Unity', 'ARKit', 'ARCore', 'VR'] },
      { category: 'Backend', items: ['NestJS', 'FastAPI', 'Django', 'Spring Boot', 'Go', 'Node.js'] },
    ],
  },
  experience: {
    kicker: 'career',
    heading: 'Experience',
    items: [
      { period: '06/2025 — 06/2026', location: 'Ecuador', current: true, currentLabel: 'CURRENT', role: 'Senior Full-Stack Developer', company: 'TechDelivery', description: 'Interim Tech Lead on React Native apps + Go microservices (Tuya IoT). Structured AWS infrastructure with Terraform and redesigned mobile deployment pipelines (APK / TestFlight).' },
      { period: '03/2025 — 04/2026', location: 'Quito', role: 'Software Development Engineer', company: 'Netby IT Consulting', description: 'Banking app (Produbanco) in Kotlin Multiplatform with OTP and facial biometrics. Cut the iOS build from ~6 hours to 15 minutes with CI/CD on Azure and integrated third-party native SDKs.' },
      { period: '09/2022 — 03/2025', location: 'Chile', role: 'Software Development Engineer', company: 'Acid Labs', description: 'Designed 15+ microservices for enterprise e-commerce. Scaled to 1000+ concurrent users, cut latency 35% and raised uptime to 99.9% with CI/CD and IaC on AWS.' },
      { period: '07/2024 — 05/2025', location: 'Quito', role: 'Senior Full-Stack Developer', company: 'Smartisp · Freelance', description: 'Real-time React dashboards for telecom (OLT/ONU) monitoring 100+ devices refreshing every 5s over industrial protocols (SNMP).' },
      { period: '11/2021 — 07/2022', location: 'Quito', role: 'Senior Full-Stack Developer', company: 'Mushroomsoft', description: 'Digital health platform with HL7/FHIR connectors on AWS. Cut response time 45% and raised user satisfaction 20%.' },
      { period: '11/2020 — 12/2021', location: 'Colombia', role: 'Senior Full-Stack Developer', company: 'Sinergia Red Internacional', description: 'Cross-platform React Native apps and scalable backend architecture. Delivered 4+ key projects ~15% ahead of deadline with agile methodology.' },
      { period: '09/2019 — 03/2021', location: 'Mexico', role: 'Full-Stack Developer', company: 'EXCITED, Inc', description: 'Social platform with ML (IBM Watson, 85% accuracy in sentiment analysis), real-time messaging and event-driven architecture on AWS.' },
      { period: '04/2019 — 08/2019', location: 'Ecuador', role: 'Senior Full-Stack Developer', company: 'Vinary VR/AR', description: 'Native AR/VR experiences with Unity that replaced physical material, raised engagement 3× and generated +20% enterprise revenue.' },
    ],
  },
  projects: {
    kicker: 'featured',
    heading: 'Projects',
    items: [
      { category: 'FINTECH', title: 'KMP Mobile Banking', description: 'Cross-platform banking app with OTP, facial biometrics (FacePhi) and store-policy compliance, with CI/CD on Azure.', tech: ['Kotlin Multiplatform', 'iOS', 'Android', 'Azure'] },
      { category: 'IoT', title: 'Audax · Tuya IoT', description: 'Tuya device integration in a React Native app with a Go microservice and optimized mobile deployment pipelines.', tech: ['React Native', 'Go', 'IoT', 'CI/CD'] },
      { category: 'TELECOM', title: 'Smartisp OLT', description: 'Real-time fiber-optic monitoring system with live dashboards, remote equipment control and low-latency telemetry.', tech: ['React', 'SNMP', 'Microservices'] },
      { category: 'E-COMMERCE', title: 'Enterprise Platform', description: '15+ scalable microservices on AWS with payment and partner integrations, supporting 1000+ concurrent users.', tech: ['AWS', 'Terraform', 'Kubernetes', 'Node.js'] },
      { category: 'AR/3D', title: 'AR Commerce', description: 'Augmented Reality experiences with Unity that digitized commercial catalogs and tripled customer engagement.', tech: ['Unity', 'ARKit', 'ARCore'] },
    ],
  },
  certifications: {
    kicker: 'continuous learning',
    heading: 'Certifications',
    items: [
      { name: "Master's in Microservices Architecture with Docker", issuer: 'Lite Thinking' },
      { name: 'DevOps with AWS', issuer: 'Smart Data' },
      { name: 'NestJS: Persistence with MongoDB and TypeORM', issuer: 'Udemy' },
    ],
  },
  contact: {
    kicker: 'contact',
    heading: "Let's work together",
    blurb: "Tell me about your project and let's build something with real impact.",
    email: 'luis.atorred24@gmail.com',
    cta: 'Send an email',
    socials: [
      { label: 'GitHub', url: 'https://github.com/' },
      { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    ],
  },
};
```

- [ ] **Step 2: Create `src/content/dictionary.ts`**

```ts
import type { Locale } from '@/i18n/locales';
import type { PortfolioContent } from './types';
import { es } from './es';
import { en } from './en';

const dictionary: Record<Locale, PortfolioContent> = { es, en };

export function getContent(locale: Locale): PortfolioContent {
  return dictionary[locale];
}
```

- [ ] **Step 3: Verify types (covers Tasks 2–5)**

Run: `npx tsc --noEmit`
Expected: PASS. If `es.ts` or `en.ts` is missing a field, tsc fails here —
that is the ES/EN parity guarantee. Fix any missing fields.

- [ ] **Step 4: Commit**

```bash
git add src/content/en.ts src/content/dictionary.ts
git commit -m "feat(content): add English content and locale dictionary"
```

---

### Task 6: Shared portfolio primitives

**Files:**
- Create: `src/features/portfolio/components/container.tsx`
- Create: `src/features/portfolio/components/section-heading.tsx`
- Create: `src/features/portfolio/components/pill.tsx`

- [ ] **Step 1: Create `src/features/portfolio/components/container.tsx`**

```tsx
import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';
import { layout } from '@/theme/tokens';

export function Container({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <View
      style={[
        { width: '100%', maxWidth: layout.maxWidth, marginHorizontal: 'auto', paddingHorizontal: layout.gutter },
        style,
      ]}
    >
      {children}
    </View>
  );
}
```

- [ ] **Step 2: Create `src/features/portfolio/components/section-heading.tsx`**

```tsx
import { Text, View } from 'react-native';
import { colors, fonts } from '@/theme/tokens';

export function SectionHeading({ kicker, heading }: { kicker: string; heading: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accent }}>/ {kicker}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 34, letterSpacing: -0.6, color: colors.text }}>
        {heading}
      </Text>
    </View>
  );
}
```

- [ ] **Step 3: Create `src/features/portfolio/components/pill.tsx`**

```tsx
import { Text, View } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

export function Pill({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceStrong,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        borderRadius: radii.sm + 1,
        paddingHorizontal: 11,
        paddingVertical: 5,
      }}
    >
      <Text style={{ fontSize: 12.5, color: 'rgb(223,226,230)', fontFamily: fonts.body }}>{label}</Text>
    </View>
  );
}
```

- [ ] **Step 4: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/components
git commit -m "feat(portfolio): add container, section-heading, pill primitives"
```

---

### Task 7: Site header

**Files:**
- Create: `src/features/portfolio/components/site-header.tsx`

- [ ] **Step 1: Create `src/features/portfolio/components/site-header.tsx`**

```tsx
import { Pressable, Text, View } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';

export function SiteHeader() {
  const { content, toggleLocale } = useI18n();
  const { nav } = content;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.07)',
        backgroundColor: 'rgba(10,11,14,0.72)',
      }}
    >
      <View style={{ flexDirection: 'column', gap: 2, minWidth: 0 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>
          Luis De La Torre
        </Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6, color: colors.accent }}>
          {nav.role}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
        {nav.links.map((link) => (
          <Text key={link.anchor} style={{ fontSize: 13.5, color: colors.textMuted }}>
            {link.label}
          </Text>
        ))}
        <Pressable
          onPress={toggleLocale}
          style={{
            backgroundColor: colors.surfaceStrong,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            borderRadius: radii.pill,
            paddingHorizontal: 11,
            paddingVertical: 6,
          }}
        >
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.55, color: 'rgb(231,233,236)' }}>
            {nav.languageToggleLabel}
          </Text>
        </Pressable>
        <View style={{ backgroundColor: colors.accent, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 9 }}>
          <Text style={{ fontSize: 13, fontFamily: fonts.bodyMedium, color: colors.onAccent }}>{nav.cta.label}</Text>
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/components/site-header.tsx
git commit -m "feat(portfolio): add site header with language toggle"
```

---

### Task 8: Hero section

**Files:**
- Create: `src/features/portfolio/sections/hero/hero-section.tsx`

- [ ] **Step 1: Create `src/features/portfolio/sections/hero/hero-section.tsx`**

```tsx
import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';

export function HeroSection() {
  const { content } = useI18n();
  const { hero } = content;

  return (
    <Container style={{ paddingVertical: 88 }}>
      <View style={{ gap: 34 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: radii.pill,
            paddingHorizontal: 13,
            paddingVertical: 7,
          }}
        >
          <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: colors.accent }} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, letterSpacing: 0.4, color: 'rgb(201,205,212)' }}>
            {hero.availability}
          </Text>
        </View>

        <Text style={{ fontFamily: fonts.display, fontSize: 64, lineHeight: 66, letterSpacing: -1.9, color: colors.text }}>
          {hero.titleLead} <Text style={{ color: colors.accent }}>{hero.titleAccent}</Text>
        </Text>

        <Text style={{ fontSize: 18, lineHeight: 29, color: colors.textMuted, maxWidth: 640, fontFamily: fonts.body }}>
          {hero.subtitle}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <View style={{ backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 26, paddingVertical: 14 }}>
            <Text style={{ fontSize: 15, fontFamily: fonts.bodyMedium, color: colors.onAccent }}>{hero.primaryCta.label}</Text>
          </View>
          <View style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: radii.md, paddingHorizontal: 24, paddingVertical: 13 }}>
            <Text style={{ fontSize: 15, fontFamily: fonts.bodyMedium, color: 'rgb(231,233,236)' }}>{hero.secondaryCta.label}</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 40,
            marginTop: 26,
            paddingTop: 30,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {hero.stats.map((stat) => (
            <View key={stat.label} style={{ gap: 4 }}>
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 30, color: '#ffffff' }}>{stat.value}</Text>
              <Text style={{ fontSize: 12.5, color: colors.textFainter, maxWidth: 160 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/sections/hero
git commit -m "feat(portfolio): add hero section"
```

---

### Task 9: Services section + card

**Files:**
- Create: `src/features/portfolio/sections/services/service-card.tsx`
- Create: `src/features/portfolio/sections/services/services-section.tsx`

- [ ] **Step 1: Create `src/features/portfolio/sections/services/service-card.tsx`**

```tsx
import { Text, View } from 'react-native';
import type { ServiceItem } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';

export function ServiceCard({ item }: { item: ServiceItem }) {
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: 320,
        maxWidth: 560,
        padding: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{item.index}</Text>
        <View style={{ backgroundColor: 'rgba(228,227,87,0.12)', borderRadius: radii.sm, paddingHorizontal: 9, paddingVertical: 4 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>{item.tag}</Text>
        </View>
      </View>
      <Text style={{ fontFamily: fonts.display, fontSize: 19, letterSpacing: -0.19, color: colors.text, marginBottom: 9 }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim, fontFamily: fonts.body }}>
        {item.description}
      </Text>
    </View>
  );
}
```

- [ ] **Step 2: Create `src/features/portfolio/sections/services/services-section.tsx`**

```tsx
import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ServiceCard } from './service-card';
import { useI18n } from '@/i18n/i18n-provider';

export function ServicesSection() {
  const { content } = useI18n();
  const { services } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <SectionHeading kicker={services.kicker} heading={services.heading} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {services.items.map((item) => (
          <ServiceCard key={item.index} item={item} />
        ))}
      </View>
    </Container>
  );
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/portfolio/sections/services
git commit -m "feat(portfolio): add services section and card"
```

---

### Task 10: Portfolio screen, app wiring, and starter cleanup

**Files:**
- Create: `src/features/portfolio/portfolio-screen.tsx`
- Modify: `src/app/_layout.tsx` (replace)
- Modify: `src/app/index.tsx` (replace)
- Delete: starter template files (see Step 4)

- [ ] **Step 1: Create `src/features/portfolio/portfolio-screen.tsx`**

```tsx
import { ScrollView, View } from 'react-native';
import { SiteHeader } from './components/site-header';
import { HeroSection } from './sections/hero/hero-section';
import { ServicesSection } from './sections/services/services-section';
import { colors } from '@/theme/tokens';

export function PortfolioScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SiteHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 88 }}>
        <HeroSection />
        <ServicesSection />
        {/* TODO: ImpactSection, StackSection, ExperienceSection, ProjectsSection,
            CertificationsSection, ContactSection — data ready in content/{es,en}.ts,
            replicate the Container + SectionHeading pattern above. */}
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2: Replace `src/app/_layout.tsx`**

```tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts, SpaceGrotesk_600SemiBold, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { IBMPlexSans_400Regular, IBMPlexSans_500Medium } from '@expo-google-fonts/ibm-plex-sans';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { ThemeProvider } from '@/theme/theme-provider';
import { I18nProvider } from '@/i18n/i18n-provider';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    IBMPlexSans_400Regular,
    IBMPlexSans_500Medium,
    JetBrainsMono_400Regular,
  });

  if (!fontsLoaded) return null;

  return (
    <ThemeProvider>
      <I18nProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0a0b0e' } }} />
      </I18nProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 3: Replace `src/app/index.tsx`**

```tsx
import { PortfolioScreen } from '@/features/portfolio/portfolio-screen';

export default function Index() {
  return <PortfolioScreen />;
}
```

- [ ] **Step 4: Delete Expo starter template files**

```bash
git rm src/app/explore.tsx \
  src/components/app-tabs.tsx src/components/app-tabs.web.tsx \
  src/components/themed-text.tsx src/components/themed-view.tsx \
  src/components/hint-row.tsx src/components/web-badge.tsx \
  src/components/external-link.tsx \
  src/components/animated-icon.tsx src/components/animated-icon.web.tsx \
  src/components/animated-icon.module.css \
  src/components/ui/collapsible.tsx \
  src/hooks/use-color-scheme.ts src/hooks/use-color-scheme.web.ts \
  src/hooks/use-theme.ts \
  src/constants/theme.ts
```

If any listed file does not exist, remove it from the command and continue.
After deletion, `grep -rn "app-tabs\|themed-text\|themed-view\|constants/theme\|use-color-scheme" src` must return nothing. If it does, remove those imports.

- [ ] **Step 5: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS with no dangling imports.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(portfolio): wire portfolio screen and remove Expo starter template"
```

---

### Task 11: Web render verification

**Files:** none (verification only)

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 2: Start web build**

Run: `npm run web`
Expected: Metro bundles with no errors; app serves on the printed localhost URL.

- [ ] **Step 3: Manual visual check**

Open the URL and confirm:
- Dark background `#0a0b0e`, accent `#e4e357`.
- Header shows name, role, nav links, ES/EN toggle, CTA.
- Clicking the ES/EN toggle switches Hero + Services + header copy between Spanish and English.
- Hero: availability pill, two-tone title, subtitle, two CTAs, 3 stats.
- Services: "/ servicios · Cómo puedo ayudarte" heading + 7 cards with index, tag, title, description.
- Fonts render as Space Grotesk (headings), IBM Plex Sans (body), JetBrains Mono (kickers/tags).

- [ ] **Step 4: Commit (if any fixes were needed)**

```bash
git add -A
git commit -m "fix(portfolio): web render adjustments"
```

---

## Self-Review

- **Spec coverage:** theme tokens (T1), i18n + toggle (T2,T5), content types + full ES/EN data for all sections (T3–T5), shared components (T6,T7), Hero (T8), Services (T9), screen wiring + cleanup (T10), verification (T11). Remaining sections intentionally deferred as data + TODO per spec scope. ✓
- **Type consistency:** `getContent(locale)` (defined T5, used T2); `PortfolioContent` fields consumed via `useI18n().content` match `types.ts`; `ServiceItem` shape used identically in T3/T9; font family names in `tokens.ts` match those loaded in `_layout.tsx` (T10). ✓
- **Placeholder scan:** the only `TODO` is an intentional, scoped marker in `portfolio-screen.tsx` for the deferred sections (per approved spec), with data already provided. No unresolved plan placeholders. ✓
