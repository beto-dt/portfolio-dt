# Admin Panel Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The signed-in `/admin` matches the approved mocks: sidebar shell (brand, nav with Solicitudes badge, Publicar/ES-EN/Salir), Métricas with 4 stat cards + 2 bar panels, Solicitudes with filter tabs + status-badged cards, Editor with vertical section sub-nav + save bar.

**Architecture:** New `admin-shell.tsx` (sidebar + content layout, plus shared `ViewHeader`/`AccentButton`); `metrics-view.tsx` and `bookings-view.tsx` become presentational (bookings state lifts into `AdminScreen`); `admin-screen.tsx` wires everything and renders the Editor view. Auth, save, publish, and Firestore writes are untouched.

**Tech Stack:** Expo Router + react-native-web, existing web-cast style pattern, theme tokens. Text glyphs for icons (no icon library). No test runner.

**Verification note:** No jest. Verify with `npx tsc --noEmit`, `npx expo export -p web`, bundle-hygiene grep, and preview. Do NOT run `npx expo lint`.

**Cross-task note:** Tasks 2 and 3 change the props of `MetricsView`/`BookingsView`, so `npx tsc --noEmit` reports errors **only in `admin-screen.tsx`** until Task 4 rewires it. That is expected; full tsc must be clean after Task 4.

---

### Task 1: `AdminShell` (sidebar + content layout, shared pieces)

**Files:**
- Create: `src/admin/components/admin-shell.tsx`

- [ ] **Step 1: Create `src/admin/components/admin-shell.tsx` with EXACTLY:**

```tsx
import type { ReactNode } from 'react';
import { Image, Linking, Platform, Pressable, ScrollView, Text, useWindowDimensions, View, type PressableStateCallbackType } from 'react-native';
import type { Locale } from '@/i18n/locales';
import { colors, fonts, radii } from '@/theme/tokens';
import { Chip } from '@/ui/chip';
import { HoverLink } from '@/ui/hover-link';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

export type AdminView = 'metrics' | 'bookings' | 'editor';

const webPress = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color, border-color, opacity', transitionDuration: '150ms' } as object)
  : null;

const NAV: { key: AdminView; glyph: string; label: string }[] = [
  { key: 'metrics', glyph: '📊', label: 'Métricas' },
  { key: 'bookings', glyph: '💬', label: 'Solicitudes' },
  { key: 'editor', glyph: '✎', label: 'Editor' },
];

/** Shared view header: title + subtitle, used by every admin view. */
export function ViewHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: fonts.display, fontSize: 26, color: colors.text }}>{title}</Text>
      <Text style={{ fontSize: 14, lineHeight: 21, color: colors.textMuted }}>{subtitle}</Text>
    </View>
  );
}

/** Small accent action button (Responder, Guardar). */
export function AccentButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: HoverState) => [
        { backgroundColor: hovered ? '#eeed6b' : colors.accent, borderRadius: 10, paddingHorizontal: 16, paddingVertical: 10, opacity: pressed ? 0.85 : 1 },
        webPress as object,
      ]}
    >
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.onAccent }}>{label}</Text>
    </Pressable>
  );
}

function NavItem({ glyph, label, active, badge, onPress }: { glyph: string; label: string; active: boolean; badge?: number | null; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: HoverState) => [
        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderRadius: radii.md, backgroundColor: active ? 'rgba(228,227,87,0.12)' : hovered ? colors.surfaceStrong : 'transparent' },
        webPress as object,
      ]}
    >
      <Text style={{ fontSize: 13, color: active ? colors.accent : colors.textMuted }}>{glyph}</Text>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: active ? colors.accent : colors.textMuted }}>{label}</Text>
      {badge ? (
        <View style={{ marginLeft: 'auto', minWidth: 20, height: 20, borderRadius: 999, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.onAccent }}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export function AdminShell({
  view,
  onNavigate,
  bookingsCount,
  publishing,
  onPublish,
  publishMsg,
  publishUrl,
  locale,
  onLocale,
  onSignOut,
  children,
}: {
  view: AdminView;
  onNavigate: (v: AdminView) => void;
  bookingsCount: number | null;
  publishing: boolean;
  onPublish: () => void;
  publishMsg: string | null;
  publishUrl: string | null;
  locale: Locale;
  onLocale: (l: Locale) => void;
  onSignOut: () => void;
  children: ReactNode;
}) {
  const { width } = useWindowDimensions();
  const wide = width >= 900;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, flexDirection: wide ? 'row' : 'column' }}>
      <View
        style={{
          width: wide ? 280 : '100%',
          borderRightWidth: wide ? 1 : 0,
          borderBottomWidth: wide ? 0 : 1,
          borderColor: colors.border,
          backgroundColor: 'rgba(255,255,255,0.015)',
          padding: 20,
          justifyContent: wide ? 'space-between' : 'flex-start',
          gap: wide ? 0 : 20,
        }}
      >
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ backgroundColor: colors.surfaceCell, padding: 5, borderRadius: 10 }}>
              <Image source={require('@/assets/images/logo.png')} style={{ width: 32, height: 32, borderRadius: 8 }} />
            </View>
            <View style={{ gap: 2 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.text }}>Luis De La Torre</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 1.5, color: colors.accent }}>CONSOLE</Text>
            </View>
          </View>
          <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: colors.textFaint, marginTop: 20, marginBottom: 6, paddingHorizontal: 14 }}>GESTIÓN</Text>
          <View style={{ gap: 2 }}>
            {NAV.map((item) => (
              <NavItem
                key={item.key}
                glyph={item.glyph}
                label={item.label}
                active={view === item.key}
                badge={item.key === 'bookings' ? bookingsCount : null}
                onPress={() => onNavigate(item.key)}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          {publishMsg ? (
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>{publishMsg}</Text>
              {publishUrl ? (
                <HoverLink label="Ver progreso en GitHub Actions" onPress={() => Linking.openURL(publishUrl)} color={colors.accent} hoverColor={colors.text} />
              ) : null}
            </View>
          ) : null}
          <Pressable
            onPress={onPublish}
            disabled={publishing}
            style={({ hovered, pressed }: HoverState) => [
              { backgroundColor: hovered ? '#eeed6b' : colors.accent, borderRadius: 12, paddingVertical: 13, alignItems: 'center', opacity: pressed ? 0.85 : publishing ? 0.7 : 1 },
              webPress as object,
            ]}
          >
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.onAccent }}>{publishing ? 'Publicando…' : '↑ Publicar'}</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {(['es', 'en'] as Locale[]).map((l) => (
              <Chip key={l} label={l.toUpperCase()} active={l === locale} onPress={() => onLocale(l)} />
            ))}
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={onSignOut}
              style={({ hovered }: HoverState) => [
                { borderWidth: 1, borderColor: hovered ? colors.borderStrong : colors.border, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: hovered ? colors.surfaceStrong : 'transparent' },
                webPress as object,
              ]}
            >
              <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.textMuted }}>⎋ Salir</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 32, maxWidth: 1100, width: '100%' }}>
        {children}
      </ScrollView>
    </View>
  );
}
```

- [ ] **Step 2: Type-check the new file compiles.**

Run: `npx tsc --noEmit`
Expected: PASS (nothing consumes the new exports yet).

- [ ] **Step 3: Commit**

```bash
git add src/admin/components/admin-shell.tsx
git commit -m "feat(admin): AdminShell sidebar layout + shared ViewHeader/AccentButton"
```

---

### Task 2: Métricas redesign

**Files:**
- Modify: `src/admin/components/metrics-view.tsx` (full rewrite)

- [ ] **Step 1: Replace the ENTIRE content of `src/admin/components/metrics-view.tsx` with:**

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import { loadAnalytics, type Analytics } from '../analytics-repo';
import type { BookingRecord } from '../bookings-repo';
import { ViewHeader } from './admin-shell';

const card = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.lg,
  backgroundColor: colors.surface,
  padding: 20,
} as const;

function Bars({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <View style={{ gap: 6 }}>
      {data.map(([label, n]) => (
        <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ width: 104, color: colors.textMuted, fontSize: 12, fontFamily: fonts.mono }} numberOfLines={1}>
            {label}
          </Text>
          <View style={{ flex: 1, height: 14, backgroundColor: colors.surfaceStrong, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ width: `${(n / max) * 100}%`, height: '100%', backgroundColor: colors.accent }} />
          </View>
          <Text style={{ width: 44, textAlign: 'right', color: colors.text, fontSize: 12 }}>{n}</Text>
        </View>
      ))}
    </View>
  );
}

function StatCard({ label, value, caption, accent }: { label: string; value: string; caption: string; accent?: boolean }) {
  return (
    <View style={[card, { flexGrow: 1, flexBasis: 200, gap: 6 }]}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.textFaint }}>{label}</Text>
      <Text style={{ fontFamily: fonts.displayBold, fontSize: 34, color: accent ? colors.accent : colors.text }}>{value}</Text>
      <Text style={{ fontSize: 12, color: colors.textDim }}>{caption}</Text>
    </View>
  );
}

function Panel({ label, data }: { label: string; data: [string, number][] }) {
  return (
    <View style={[card, { flexGrow: 1, flexBasis: 380, gap: 12 }]}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.textFaint }}>{label}</Text>
      {data.length ? <Bars data={data} /> : <Text style={{ color: colors.textDim, fontSize: 13 }}>Sin datos aún.</Text>}
    </View>
  );
}

export function MetricsView({ bookings }: { bookings: BookingRecord[] | null }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadAnalytics()
      .then((a) => active && setData(a))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, []);

  if (error) return <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text>;
  if (!data) return <ActivityIndicator color={colors.accent} />;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const visitas7d = Object.entries(data.byDay)
    .filter(([d]) => d >= cutoffKey)
    .reduce((sum, [, n]) => sum + n, 0);

  const monthPrefix = new Date().toISOString().slice(0, 7);
  const solicitudesMes = bookings ? bookings.filter((b) => b.date.startsWith(monthPrefix)).length : null;
  const confirmadas = bookings ? bookings.filter((b) => b.status === 'confirmed').length : null;
  const conversion = solicitudesMes === null ? null : visitas7d > 0 ? Math.round((100 * solicitudesMes) / visitas7d) : 0;

  const days = Object.entries(data.byDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-30);
  const sections = Object.entries(data.bySection).sort((a, b) => b[1] - a[1]);

  return (
    <View style={{ gap: 24 }}>
      <ViewHeader title="Métricas del sitio" subtitle="Actividad y secciones más visitadas de tu portfolio." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <StatCard label="VISITAS TOTALES" value={String(visitas7d)} caption="últimos 7 días" accent />
        <StatCard label="SOLICITUDES" value={solicitudesMes === null ? '…' : String(solicitudesMes)} caption="este mes" />
        <StatCard label="CONFIRMADAS" value={confirmadas === null ? '…' : String(confirmadas)} caption="citas agendadas" />
        <StatCard label="CONVERSIÓN" value={conversion === null ? '…' : `${conversion}%`} caption="visita → solicitud" />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <Panel label="ÚLTIMOS DÍAS" data={days} />
        <Panel label="SECCIONES MÁS VISTAS" data={sections} />
      </View>
    </View>
  );
}
```

- [ ] **Step 2: Type-check.**

Run: `npx tsc --noEmit`
Expected: errors ONLY in `src/admin/screens/admin-screen.tsx` (old `<MetricsView />` usage now missing the `bookings` prop). Any error in `metrics-view.tsx` itself must be fixed.

- [ ] **Step 3: Commit**

```bash
git add src/admin/components/metrics-view.tsx
git commit -m "feat(admin): metrics view with stat cards and bar panels"
```

---

### Task 3: Solicitudes redesign

**Files:**
- Modify: `src/admin/components/bookings-view.tsx` (full rewrite)

- [ ] **Step 1: Replace the ENTIRE content of `src/admin/components/bookings-view.tsx` with:**

```tsx
import { useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import { Chip } from '@/ui/chip';
import type { BookingRecord } from '../bookings-repo';
import { AccentButton, ViewHeader } from './admin-shell';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

const webPress = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color, color', transitionDuration: '150ms' } as object)
  : null;

type Filter = 'all' | 'new' | 'confirmed' | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'new', label: 'Nuevas' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'done', label: 'Atendidas' },
];
const STATUSES = ['new', 'confirmed', 'done'] as const;
const STATUS_LABEL: Record<string, string> = { new: 'Nueva', confirmed: 'Confirmada', done: 'Atendida' };
const BADGE: Record<string, { bg: string; fg: string }> = {
  new: { bg: 'rgba(228,227,87,0.15)', fg: colors.accent },
  confirmed: { bg: 'rgba(74,222,128,0.12)', fg: '#4ade80' },
  done: { bg: colors.surfaceStrong, fg: colors.textDim },
};

function FilterTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: HoverState) => [
        { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: active ? colors.accent : hovered ? colors.surfaceStrong : 'transparent' },
        webPress as object,
      ]}
    >
      <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: active ? colors.onAccent : colors.textMuted }}>{label}</Text>
    </Pressable>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textMuted }}>{label}</Text>
    </View>
  );
}

export function BookingsView({ bookings, onStatus }: { bookings: BookingRecord[] | null; onStatus: (id: string, status: string) => void }) {
  const [filter, setFilter] = useState<Filter>('all');

  if (!bookings) {
    return (
      <View style={{ gap: 24 }}>
        <ViewHeader title="Solicitudes" subtitle="Cargando…" />
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <View style={{ gap: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <ViewHeader title="Solicitudes" subtitle={`${bookings.length} ${bookings.length === 1 ? 'solicitud' : 'solicitudes'}`} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, borderWidth: 1, borderColor: colors.border, borderRadius: 999, padding: 3 }}>
          {FILTERS.map((f) => (
            <FilterTab key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </View>
      </View>

      {filtered.length === 0 ? (
        <Text style={{ color: colors.textDim, fontSize: 13.5 }}>Sin solicitudes todavía.</Text>
      ) : (
        <View style={{ gap: 16 }}>
          {filtered.map((b) => (
            <View
              key={b.id}
              style={{ gap: 10, padding: 20, borderWidth: 1, borderColor: b.status === 'new' ? 'rgba(228,227,87,0.45)' : colors.border, borderRadius: radii.lg, backgroundColor: colors.surface }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.accent }}>
                  🗓 {b.date} · {b.time} (GMT-5)
                </Text>
                <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: BADGE[b.status]?.bg ?? colors.surfaceStrong }}>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: BADGE[b.status]?.fg ?? colors.textDim }}>
                    {(STATUS_LABEL[b.status] ?? b.status).toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.text }}>{b.name}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <MetaChip label={`✉ ${b.email}`} />
                {b.model || b.projectType ? <MetaChip label={[b.model, b.projectType].filter(Boolean).join(' · ')} /> : null}
                {b.budget ? <MetaChip label={b.budget} /> : null}
              </View>
              {b.message ? <Text style={{ fontSize: 13.5, lineHeight: 20, color: colors.textDim }}>{b.message}</Text> : null}
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4, paddingTop: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.textFaint }}>ESTADO</Text>
                {STATUSES.map((s) => (
                  <Chip key={s} label={STATUS_LABEL[s]} active={b.status === s} onPress={() => onStatus(b.id, s)} />
                ))}
                <View style={{ marginLeft: 'auto' }}>
                  <AccentButton label="✉ Responder" onPress={() => Linking.openURL(`mailto:${b.email}`)} />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
```

- [ ] **Step 2: Type-check.**

Run: `npx tsc --noEmit`
Expected: errors ONLY in `src/admin/screens/admin-screen.tsx` (old `<BookingsView />`/`<MetricsView />` usages). Any error in `bookings-view.tsx` itself must be fixed.

- [ ] **Step 3: Commit**

```bash
git add src/admin/components/bookings-view.tsx
git commit -m "feat(admin): solicitudes view with filter tabs and status-badged cards"
```

---

### Task 4: `AdminScreen` restructure (shell wiring + Editor view)

**Files:**
- Modify: `src/admin/screens/admin-screen.tsx`

- [ ] **Step 1: Replace the imports block (everything before `type SectionKey`) with:**

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, Text, useWindowDimensions, View, type PressableStateCallbackType } from 'react-native';
import type { User } from 'firebase/auth';
import type { PortfolioContent } from '@/content/types';
import type { Locale } from '@/i18n/locales';
import { colors, fonts, radii } from '@/theme/tokens';
import { onAdminAuthChanged, signInWithGoogle, signOutAdmin } from '../auth';
import { loadContent, saveSection } from '../content-repo';
import { loadBookings, setBookingStatus, type BookingRecord } from '../bookings-repo';
import { publishSite } from '../publish';
import { HeroForm } from '../components/forms/hero-form';
import { NavForm } from '../components/forms/nav-form';
import { ServicesForm } from '../components/forms/services-form';
import { ImpactForm } from '../components/forms/impact-form';
import { StackForm } from '../components/forms/stack-form';
import { ExperienceForm } from '../components/forms/experience-form';
import { ProjectsForm } from '../components/forms/projects-form';
import { CertificationsForm } from '../components/forms/certifications-form';
import { EducationForm } from '../components/forms/education-form';
import { ProcessForm } from '../components/forms/process-form';
import { CollaborationForm } from '../components/forms/collaboration-form';
import { ContactForm } from '../components/forms/contact-form';
import { FooterForm } from '../components/forms/footer-form';
import { MetricsView } from '../components/metrics-view';
import { BookingsView } from '../components/bookings-view';
import { AdminBackdrop, LoginView } from '../components/login-view';
import { AccentButton, AdminShell, ViewHeader, type AdminView } from '../components/admin-shell';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

const webPress = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '150ms' } as object)
  : null;
```

(Removed: `Linking`, `ScrollView` from react-native; `AppButton`; `Chip`; `HoverLink` — the shell owns those pieces now. `SECTIONS` and `SectionForm` stay exactly as they are.)

- [ ] **Step 2: Add the Editor helper components at module level, right AFTER the `SectionForm` function:**

```tsx
function SectionNavItem({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: HoverState) => [
        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radii.md, backgroundColor: active ? 'rgba(228,227,87,0.12)' : hovered ? colors.surfaceStrong : 'transparent' },
        webPress as object,
      ]}
    >
      <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: active ? colors.accent : colors.border }} />
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: active ? colors.text : colors.textMuted }}>{label}</Text>
    </Pressable>
  );
}

function SaveBar({ status, onSave }: { status: string | null; onSave: () => void }) {
  const isSaving = status === 'Guardando…';
  const isSaved = !!status && status.startsWith('Guardado');
  const isError = !!status && !isSaving && !isSaved;
  const color = isSaved ? '#4ade80' : isSaving ? colors.accent : isError ? '#ff6b6b' : colors.textFaint;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, backgroundColor: colors.surface, padding: 16 }}>
      <View style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: color }} />
      <Text style={{ flex: 1, fontFamily: fonts.mono, fontSize: 12.5, color }}>{status ?? 'Sin cambios pendientes'}</Text>
      <AccentButton label="💾 Guardar" onPress={onSave} />
    </View>
  );
}

function EditorView({
  wide,
  section,
  onSection,
  loading,
  content,
  onChange,
  status,
  onSave,
}: {
  wide: boolean;
  section: SectionKey;
  onSection: (s: SectionKey) => void;
  loading: boolean;
  content: PortfolioContent | null;
  onChange: (c: PortfolioContent) => void;
  status: string | null;
  onSave: () => void;
}) {
  return (
    <View style={{ gap: 24 }}>
      <ViewHeader title="Editor de contenido" subtitle="Edita los textos de tu portfolio y publica los cambios." />
      <View style={{ flexDirection: wide ? 'row' : 'column', gap: 24 }}>
        <View style={{ width: wide ? 220 : '100%', gap: 4 }}>
          {SECTIONS.map((s) => (
            <SectionNavItem key={s.key} label={s.label} active={s.key === section} onPress={() => onSection(s.key)} />
          ))}
        </View>
        <View style={[{ gap: 16 }, wide ? { flex: 1 } : null]}>
          {loading || !content ? (
            <ActivityIndicator color={colors.accent} />
          ) : (
            <>
              <SectionForm section={section} content={content} onChange={onChange} />
              <SaveBar status={status} onSave={onSave} />
            </>
          )}
        </View>
      </View>
    </View>
  );
}
```

- [ ] **Step 3: Inside `AdminScreen`, update state + add bookings loading.**

Change the `view` state line to:

```tsx
  const [view, setView] = useState<AdminView>('metrics');
```

Add right after the publish state declarations (`publishUrl` line):

```tsx
  const [bookings, setBookings] = useState<BookingRecord[] | null>(null);
```

Add a new effect right after the content-loading `useEffect` (the one keyed `[user, locale]`):

```tsx
  useEffect(() => {
    if (!user) {
      setBookings(null);
      return;
    }
    let active = true;
    loadBookings()
      .then((b) => active && setBookings(b))
      .catch((e) => {
        if (active) {
          setBookings([]);
          setError(e instanceof Error ? e.message : String(e));
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  const onBookingStatus = async (id: string, next: string) => {
    setBookings((prev) => prev?.map((b) => (b.id === id ? { ...b, status: next } : b)) ?? prev);
    try {
      await setBookingStatus(id, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };
```

Add inside `AdminScreen`, right before the `if (!authReady)` early return:

```tsx
  const { width } = useWindowDimensions();
  const wide = width >= 900;
```

(Hooks must run before early returns — this placement keeps hook order stable.)

- [ ] **Step 4: Replace the ENTIRE signed-in return (the `<ScrollView …>…</ScrollView>` block) with:**

```tsx
  return (
    <AdminShell
      view={view}
      onNavigate={setView}
      bookingsCount={bookings ? bookings.length : null}
      publishing={publishing}
      onPublish={onPublish}
      publishMsg={publishMsg}
      publishUrl={publishUrl}
      locale={locale}
      onLocale={setLocale}
      onSignOut={signOutAdmin}
    >
      {view === 'metrics' ? (
        <MetricsView bookings={bookings} />
      ) : view === 'bookings' ? (
        <BookingsView bookings={bookings} onStatus={onBookingStatus} />
      ) : (
        <EditorView wide={wide} section={section} onSection={setSection} loading={loading} content={content} onChange={setContent} status={status} onSave={onSave} />
      )}
      {error ? <Text style={{ color: '#ff6b6b', fontSize: 13, marginTop: 16 }}>{error}</Text> : null}
    </AdminShell>
  );
```

- [ ] **Step 5: Full verification.**

```bash
npx tsc --noEmit && npx expo export -p web
```
Expected: both PASS with zero errors.

Bundle hygiene (firebase must stay only in the dynamic chunk):

```bash
grep -lE 'initializeApp|firebase/auth' dist/_expo/static/js/web/*.js
```
Expected: exactly one file, the `firebase-client-*.js` chunk. If `entry-*.js` matches, the dynamic-import boundary broke — fix before committing (only type-only imports from `firebase-client`/`bookings-repo` are allowed in statically-bundled files; `loadBookings`/`setBookingStatus` from `bookings-repo` keep the dynamic `import()`).

- [ ] **Step 6: Commit**

```bash
git add src/admin/screens/admin-screen.tsx
git commit -m "feat(admin): shell-based panel with metrics landing, editor sub-nav and save bar"
```

---

### Task 5: Preview verification + finish

- [ ] **Step 1: Preview `http://localhost:8081/admin`.** Signed out only the login card shows (unchanged — sanity check it still renders). The signed-in shell can't be exercised headless (Google popup); structural verification is the Task 4 build + code review.

- [ ] **Step 2: Also preview `/` home** to confirm the public site is untouched (no admin chunk in initial load, page renders).

- [ ] **Step 3: Finish the branch.** Use superpowers:finishing-a-development-branch → push + PR. After merge: `gh workflow run deploy.yml --ref main`, watch it, then verify live at https://luisdelatorre.dev/admin signing in (sidebar, badge, Métricas cards, filtros de Solicitudes, Editor sub-nav + Guardar, Publicar).

---

## Self-Review

**1. Spec coverage:** Shell sidebar (T1: brand, GESTIÓN, NavItem+badge, Publicar/ES-EN/Salir, ≥900 responsive, ScrollView content) ✓ · shared ViewHeader/AccentButton (T1) ✓ · Métricas (T2: header, 4 stat cards with exact formulas & captions, 2 panels reusing Bars, `…` when bookings null) ✓ · Solicitudes (T3: header+count, 4 filter tabs, badge colors, accent border on `new`, chips row, divider, ESTADO+Chips, ✉ Responder mailto) ✓ · Editor (T4: header, sub-nav all 13 SECTIONS with dots, forms unchanged, SaveBar states) ✓ · bookings lifted with optimistic status + failure→`[]`+error (T4) ✓ · verify/deploy (T4 S5, T5) ✓.
**2. Placeholders:** none — every code step is complete file/blocks.
**3. Type consistency:** `AdminView` (T1) used in T4 ✓; `MetricsView({ bookings })` (T2) matches T4 usage ✓; `BookingsView({ bookings, onStatus })` (T3) matches T4 ✓; `AccentButton({ label, onPress })`/`ViewHeader({ title, subtitle })` consistent across T1/T3/T4 ✓; `onStatus(id, status)` signature matches `onBookingStatus(id, next)` ✓.
