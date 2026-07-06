# Portfolio v2 — Phase 1: Multi-Route Architecture + Dock Nav — Design

**Date:** 2026-07-06
**Status:** Approved (design)

## Goal

Restructure the public site from a single scrolling page into the 5 screens of
the "Portfolio v2" design (imported from Claude Design,
`Portfolio v2.dc.html`), navigated by a floating bottom dock: **Inicio**
(hero), **Servicios** (servicios + proceso + colaboración), **Sobre mí**
(impacto + stack + experiencia + alcance global), **Proyectos** (proyectos +
recomendaciones + formación), **Contacto** (wizard). Visual language of
cards/sections is unchanged — this phase is navigation architecture. (Phase 2
adds the home services-preview + CTA band; Phase 3 polish.)

## Decisions (agreed with user)

- **Real expo-router routes** (`/`, `/servicios`, `/sobre-mi`, `/proyectos`,
  `/contacto`) instead of screen state: static export emits one HTML per route
  with its own `<Head>` (per-page title/description/canonical), URLs are
  shareable, back button works, sitemap grows to 5 URLs. `cleanUrls: true` is
  already set in firebase.json, so `/servicios` serves `servicios.html` with
  no hosting changes.
- **Add `react-native-svg`** (via `npx expo install react-native-svg`) for the
  dock icons — the dock is the centerpiece and the design uses 21×21 stroke
  icons (home/grid/person/folder/mail) whose paths we lift verbatim from the
  design file. This is the first icon dependency; everywhere else keeps text
  glyphs.
- Booking intents must survive route changes: the pub/sub gains a stored
  "pending" intent consumed when Contacto mounts.
- CMS: `NavContent` gains `dock` labels (5), editable in the admin nav form;
  merge-only migration + published patch as usual.
- Tracking unchanged: same `TrackedSection` ids and `SECTION_KEYS`; `armVisit`
  is already guarded (`armed` flag) so calling it on every route mount is safe.

## Architecture

### Routes (`src/app/`)

Each route file renders `<Head>` (title, description, canonical; the full
OG/Twitter block stays only on `/`) + a screen component:

| Route file | Screen | TrackedSections |
|---|---|---|
| `index.tsx` | `HomeScreen` | hero |
| `servicios.tsx` | `ServicesPage` | services, process, collaboration |
| `sobre-mi.tsx` | `AboutPage` | impact, stack, experience, reach |
| `proyectos.tsx` | `ProjectsPage` | projects, testimonials, formation |
| `contacto.tsx` | `ContactPage` | contact |

Titles: `Luis De La Torre — Senior Full-Stack & Mobile Developer` (home) and
`Servicios — Luis De La Torre`, `Sobre mí — Luis De La Torre`,
`Proyectos — Luis De La Torre`, `Contacto — Luis De La Torre`. Each route gets
a one-line Spanish meta description and canonical
`https://luisdelatorre.dev/<ruta>`.

Screen components live in
`src/features/portfolio/pages/{home,services,about,projects,contact}-page.tsx`
and are thin: `<PageShell>` + the existing section components in order.
`portfolio-screen.tsx` is deleted (replaced by the pages).

### `PageShell` (`src/features/portfolio/components/page-shell.tsx`)

The chrome shared by all pages (extracted from today's `PortfolioScreen`):

```tsx
export function PageShell({ children }: { children: ReactNode }) {
  useEffect(() => { armVisit(); }, []);
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SiteHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 148 }}>
        {children}
        <SiteFooter />
      </ScrollView>
      <DockNav />
      <WhatsAppFab />
    </View>
  );
}
```

`paddingBottom` grows (88 → 148) so content clears the dock.

### `DockNav` (`src/features/portfolio/components/dock-nav.tsx`)

Fixed pill centered at the bottom (web casts), styles lifted from the design:

- Container: `position fixed (web), left '50%', bottom 22, transform
  translateX(-50%), zIndex 56, flexDirection row, gap 2, padding 7,
  borderRadius 999, backgroundColor 'rgba(10,11,14,0.76)', borderWidth 1,
  borderColor 'rgba(255,255,255,0.1)'` + web-only `backdropFilter: 'blur(16px)'`
  and `boxShadow '0 18px 44px -14px rgba(0,0,0,0.75), inset 0 1px 0
  rgba(255,255,255,0.05)'`.
- Tab (`Pressable`): column, alignItems center, gap 4, padding 9/20 (narrow:
  8/6 + flex 1), borderRadius 999. Icon 21×21 `react-native-svg` stroke
  `currentColor`-equivalent (color prop), strokeWidth 1.9. Label IBM Plex 11
  (500) — active label 600.
- States: inactive `#9aa0aa`; hover `#e7e9ec`; active `colors.accent` + bg
  `rgba(228,227,87,0.16)`.
- Active route via `usePathname()`; press → `router.push(route)` (no-op when
  already active). Narrow (<640): the pill stretches to `left 12 / right 12`
  with tabs `flex: 1` (design's mobile variant).
- Icon paths: copied verbatim from `Portfolio v2.dc.html` (home: `M3 10.5 12
  3l9 7.5` + door path; services: four 7×7 rounded rects; about: person;
  projects: folder; contact: mail — extracted during implementation).
- Labels from `nav.dock` (CMS).

### SiteHeader simplification

- Remove `nav.links` anchor row and `useActiveSection` scroll-spy (dead in the
  multi-route world; `use-active-section.tsx` and `nav-link.tsx` are deleted
  if nothing else imports them).
- Keeps: logo block (pressing it → `router.push('/')`), `ES / en` toggle, CTA
  "Trabajemos" → `router.push('/contacto')` (was `scrollToAnchor('contact')`).

### Cross-route navigation & intents

- New `src/ui/go-to-section.ts`:

```ts
const ROUTE_OF: Record<string, string> = {
  hero: '/', services: '/servicios', process: '/servicios', collaboration: '/servicios',
  impact: '/sobre-mi', stack: '/sobre-mi', experience: '/sobre-mi', reach: '/sobre-mi',
  projects: '/proyectos', testimonials: '/proyectos', formation: '/proyectos',
  contact: '/contacto',
};
export function goToSection(anchor: string): void; // same-route → scrollToAnchor(anchor); else router.push(route)
```

  All current `scrollToAnchor(...)` call sites in sections/hero/service
  cards/collaboration switch to `goToSection(...)`. CMS anchor values
  (`contact`, `projects`, …) stay as-is.
- `booking-intent.ts` stores the last intent:

```ts
let pending: BookingIntent | null = null;
export function setBookingIntent(i: BookingIntent) { pending = i; listeners.forEach(l => l(i)); }
export function consumeBookingIntent(): BookingIntent | null { const i = pending; pending = null; return i; }
```

  Contact wizard consumes it on mount (`useEffect(() => { const i =
  consumeBookingIntent(); if (i) apply(i); }, [])`) in addition to the live
  subscription — so "Solicitar este servicio" on `/servicios` lands on
  `/contacto` with the banner + chip preselected.

### CMS (`NavContent`)

```ts
export type NavContent = { …existing…; dock: { home: string; services: string; about: string; projects: string; contact: string } };
```

Seeds — ES: Inicio/Servicios/Sobre mí/Proyectos/Contacto; EN:
Home/Services/About/Projects/Contact. Admin `nav-form` gains the 5 Fields.
Migration `scripts/migrate-v2-nav.ts` (merge `{ nav: seed.nav }` — drift-check
published vs seed first) + published patch. `nav.links` stays in the model/CMS
(unused by the header now) to avoid breaking old published docs.

### SEO plumbing

- `public/sitemap.xml`: 5 `<url>` entries.
- Route Heads as described; og block only on `/`.

## Error handling

Unknown anchor in `goToSection` falls back to `scrollToAnchor` (same page).
Direct-loading `/contacto` with no intent renders the wizard as today (consume
returns null). 404s handled by expo-router's default not-found.

## Testing / verification

- tsc + export: `dist/` contains `index.html`, `servicios.html`,
  `sobre-mi.html`, `proyectos.html`, `contacto.html`, each with its own
  `<title>`; hygiene grep clean.
- Preview: dock renders on all 5 routes with correct active tab; navigating
  shows the right sections; "Solicitar este servicio" on /servicios → lands on
  /contacto with banner; "Trabajemos" → /contacto; hero "Ver proyectos" →
  /proyectos; ES/en toggle persists per page; `preview_resize` mobile → dock
  stretches full-width, no overlap with WhatsApp FAB; no console errors.
- Live after deploy: the 5 URLs return 200 with their titles (cleanUrls).

## Implementation order

1. `react-native-svg` install + `DockNav` + `PageShell`.
2. Routes + page components + Head; delete portfolio-screen; header cleanup.
3. `goToSection` + intent persistence + call-site migration.
4. CMS dock labels (types/seeds/admin/migración/published) + sitemap.
5. Verify + deploy.
