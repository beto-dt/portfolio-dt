# Admin Panel Redesign (Authenticated Views) — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

The signed-in `/admin` matches the four mocks: a persistent sidebar (brand,
GESTIÓN nav with a Solicitudes badge, Publicar/ES-EN/Salir pinned at the
bottom) and three restyled content views — Métricas (stat cards + two bar
panels), Solicitudes (filter tabs + richer cards), Editor (vertical section
sub-nav + save bar). Auth, saving, publishing and data writes are unchanged.

## Decisions (agreed with user)

- Text glyphs for icons (no icon library added): 📊 Métricas, 💬 Solicitudes,
  ✎ Editor, ↑ Publicar, ⎋ Salir, 🗓 fecha, ✉ email/Responder, 💾 Guardar.
- Editor keeps **all 13 existing sections** (mock's 5 are illustrative).
- Bookings load once in `AdminScreen` and are shared (sidebar badge = total
  count, Métricas stat cards, Solicitudes list). Status changes stay optimistic.
- Metric definitions: **Visitas totales** = sum of `byDay` over the last 7
  calendar days (subtitle "últimos 7 días"); **Solicitudes** = bookings whose
  `date` falls in the current month (subtitle "este mes"); **Confirmadas** =
  bookings with `status === 'confirmed'` (subtitle "citas agendadas");
  **Conversión** = `visitas7d > 0 ? round(100 * solicitudesMes / visitas7d) : 0`
  (subtitle "visita → solicitud").

## Architecture

### `src/admin/components/admin-shell.tsx` (new)

Exports:

- `type AdminView = 'metrics' | 'bookings' | 'editor';`
- `AdminShell({ view, onNavigate, bookingsCount, publishing, onPublish,
  publishMsg, publishUrl, locale, onLocale, onSignOut, children })`.

Layout: `useWindowDimensions`; `wide = width >= 900`. Root `View`
`flex: 1, backgroundColor: colors.background, flexDirection: wide ? 'row' :
'column'`.

**Sidebar** (`wide ? { width: 280, height: '100%' } : { width: '100%' }`,
`borderRightWidth: wide ? 1 : 0, borderBottomWidth: wide ? 0 : 1, borderColor:
colors.border, backgroundColor: 'rgba(255,255,255,0.015)', padding: 20,
justifyContent: 'space-between'` — in narrow mode the bottom block flows after
the nav):

- Brand row (same as login): logo 32×32 radius 8 in `colors.surfaceCell`
  box + `Luis De La Torre` (display 15) / `CONSOLE` (mono 9.5, accent,
  letterSpacing 1.5).
- `GESTIÓN` label (mono 10, letterSpacing 1, `colors.textFaint`, marginTop 20).
- Nav items (`NavItem({ glyph, label, active, badge?, onPress })`): row,
  `gap: 10, paddingH 14 / paddingV 12, borderRadius: radii.md`; active ⇒
  `backgroundColor: 'rgba(228,227,87,0.12)'`, glyph+label `colors.accent`;
  inactive ⇒ label `colors.textMuted`, hover `colors.surfaceStrong` bg (web
  cursor+transition cast). Badge (Solicitudes): accent circle 20×20 with
  `colors.onAccent` mono count, pushed right (`marginLeft: 'auto'`).
- Bottom block (`gap: 10`): existing publish message/link (when set, 12px);
  `Publicar` — full-width accent `Pressable` (radius 12, paddingV 13, centered
  `↑ Publicar` / `Publicando…`, hover `#eeed6b`, pressed opacity — same visual
  language as the wizard CTA); row with the ES/EN segmented control (two
  `Chip`s as today) + `Salir` outline pressable (`⎋ Salir`, flex 1).

**Content**: `ScrollView` `flex: 1` with
`contentContainerStyle={{ padding: 32, maxWidth: 1100, width: '100%' }}` and
the view's children.

Each view starts with a shared header pattern (rendered by each view):
title (display 26, `colors.text`) + subtitle (14, `colors.textMuted`).

### `AdminScreen` restructure (`admin-screen.tsx`)

- State: `view: AdminView` (default `'metrics'` — matches the mock's landing),
  plus existing locale/content/section/status/publish state.
- **Bookings lifted**: `const [bookings, setBookings] = useState<BookingRecord[] | null>(null)`
  loaded via `loadBookings()` once per sign-in (`useEffect` on `user`);
  `onBookingStatus(id, status)` does the optimistic map + `setBookingStatus`
  (moved up from BookingsView).
- Render: `<AdminShell …>{view === 'metrics' ? <MetricsView bookings={bookings} />
  : view === 'bookings' ? <BookingsView bookings={bookings} onStatus={onBookingStatus} />
  : <EditorView …inline… />}</AdminShell>`.
- The old header row / top-level locale chips / Publicar button move into the
  shell props. Save/publish handlers unchanged.

### Métricas (`metrics-view.tsx` redesign)

`MetricsView({ bookings }: { bookings: BookingRecord[] | null })` — keeps
loading `Analytics` itself.

- Header: `Métricas del sitio` / `Actividad y secciones más visitadas de tu
  portfolio.`
- Stat cards row (`flexWrap, gap: 16`; each card `flexGrow 1, flexBasis 200,
  borderWidth 1 colors.border, borderRadius radii.lg, backgroundColor
  colors.surface, padding 20, gap: 6`): mono 10.5 uppercase label
  `colors.textFaint`; value `fonts.displayBold` 34 (`colors.accent` for
  Visitas, `colors.text` for the rest); caption 12 `colors.textDim`. Values per
  the metric definitions above (bookings `null` ⇒ show `…` for the three
  booking-based cards).
- Two panels (`flexWrap row, gap: 16`; each `flexGrow 1, flexBasis 380`, card
  chrome as above): `ÚLTIMOS DÍAS` (existing `Bars` over last-30 `byDay`) and
  `SECCIONES MÁS VISTAS` (existing `Bars` over `bySection` sorted desc).
  Empty ⇒ "Sin datos aún."

### Solicitudes (`bookings-view.tsx` redesign)

`BookingsView({ bookings, onStatus }: { bookings: BookingRecord[] | null;
onStatus: (id: string, status: string) => void })`.

- Header row: `Solicitudes` + `«N» solicitudes` subtitle; right: filter tabs —
  segmented container (border radius pill) with `Todas | Nuevas | Confirmadas |
  Atendidas`; active tab accent bg + `onAccent` text; local
  `filter: 'all' | 'new' | 'confirmed' | 'done'`.
- Cards (`gap: 16`): card chrome `borderRadius: radii.lg, borderWidth 1,
  padding 20, backgroundColor colors.surface`; **status `new` ⇒ borderColor
  `'rgba(228,227,87,0.45)'`**, else `colors.border`.
  - Top row: `🗓 {date} · {time} (GMT-5)` (mono 12.5 accent) — right: status
    badge pill (mono 10, letterSpacing 1): NUEVA `bg rgba(228,227,87,0.15)` text
    accent; CONFIRMADA `bg rgba(74,222,128,0.12)` text `#4ade80`; ATENDIDA `bg
    colors.surfaceStrong` text `colors.textDim`.
  - Name (display 18).
  - Chips row (bordered pills, mono 11.5, `colors.textMuted`): `✉ {email}`,
    `{model}` + (` · {projectType}` when both / whichever exists), `{budget}`.
  - Message (13.5/20 `colors.textDim`), divider (`borderTop colors.border,
    marginTop 12, paddingTop 12`).
  - Bottom row: `ESTADO` label (mono 10.5 faint) + the three status `Chip`s
    (labels Nueva/Confirmada/Atendida, active = current) — right
    (`marginLeft: 'auto'`): `✉ Responder` accent pressable (radius 10,
    paddingH 16/V 10, `colors.onAccent` text, hover brighten) → `mailto:`.
- `bookings === null` ⇒ spinner; empty after filter ⇒ "Sin solicitudes todavía."

### Editor (inline in `admin-screen.tsx`)

- Header: `Editor de contenido` / `Edita los textos de tu portfolio y publica
  los cambios.`
- Body `flexDirection: wide ? 'row' : 'column'` (reuse the shell's
  `useWindowDimensions` locally), `gap: 24`:
  - **Sub-nav** (`width: wide ? 220 : '100%'`, `gap: 4`): one `Pressable` per
    `SECTIONS` entry — row `gap: 10`, dot 5×5 (`colors.accent` when active else
    `colors.border`), label 14 (`colors.text` active / `colors.textMuted`),
    active bg `rgba(228,227,87,0.12)` radius `radii.md`, paddingH 14/V 10,
    hover surfaceStrong.
  - **Form column** (`flex: 1, gap: 16`): loading spinner or `SectionForm`
    (unchanged) + **save bar**: card row (`borderWidth 1 colors.border, radius
    radii.lg, padding 16, alignItems center, gap 12`): status dot+text — when
    `status` starts with `'Guardado'` ⇒ green dot `#4ade80` + `Todo guardado`
    style text (mono 12.5 `#4ade80`); `'Guardando…'` ⇒ accent dot + text; error
    ⇒ red `#ff6b6b`; `null` ⇒ faint `Sin cambios pendientes`; right
    (`marginLeft: 'auto'`): `💾 Guardar` accent pressable (same style as
    Responder) → existing `onSave`.

## Error handling

Unchanged flows (auth, save, publish, booking status). Bookings load failure ⇒
`setBookings([])` + the existing error text shown in the Solicitudes view;
badge hides when count is 0/null.

## Testing / verification

- tsc + export + hygiene clean.
- Preview `/admin` (signed out — only login shows): the shell can't be
  exercised headless (Google sign-in), so structural verification is by build +
  code review; visual verification happens live after deploy (sign in →
  sidebar, the three views, badge count, filters, save bar).
- Live: sign in; navigate Métricas/Solicitudes/Editor; change a booking status;
  edit + Guardar a section; Publicar works.

## Implementation order

1. `admin-shell.tsx`.
2. `metrics-view.tsx` + `bookings-view.tsx` redesigns.
3. `admin-screen.tsx` restructure (lift bookings, editor view, wire shell).
4. Verify + deploy + live sign-in check.
