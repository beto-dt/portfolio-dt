# AR Demo Projects Card + Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the WebAR demo from the home page into `/proyectos` as the first project card, which opens a modal containing the 3D/AR viewer.

**Architecture:** Extract the viewer from `ar-showcase.tsx` into a reusable `ArViewer`; extend `GlowCard`/`ProjectCard` with optional press/CTA props; new `ArDemoCard` owns the card + RN `Modal`. Home drops the section; analytics `'ar'` fires on modal open (key already deployed).

**Tech Stack:** Existing primitives only (`GlowCard`, `ProjectCard`, RN `Modal` on RNW, `markSectionSeen`). No new deps, no CMS/functions changes.

**Spec:** `docs/superpowers/specs/2026-07-07-ar-demo-projects-modal-design.md`
**Branch:** `feat/ar-demo-projects-modal` (created; spec committed)

**Verification instead of tests:** no test runner. Verify with `npx tsc --noEmit`, `npx expo export -p web`, bundle-hygiene grep, and preview checks. NEVER run `npx expo lint`.

---

### Task 1: Press support in GlowCard + ProjectCard CTA

**Files:**
- Modify: `src/ui/glow-card.tsx`
- Modify: `src/features/portfolio/sections/projects/project-card.tsx`

- [ ] **Step 1: GlowCard optional onPress**

In `src/ui/glow-card.tsx`, add an optional `onPress` and a pointer cursor when it is set. Replace the component with:

```tsx
const pressCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

/**
 * Card container that lifts + shows a soft accent glow/border on hover, and
 * passes `hovered` to children (render prop) so they can react. Default
 * cursor unless `onPress` makes the whole card clickable.
 */
export function GlowCard({ style, onPress, children }: { style?: ViewStyle; onPress?: () => void; children: (hovered: boolean) => ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: HoverState) => [
        style,
        hovered
          ? { transform: [{ translateY: -3 }], borderColor: 'rgba(228,227,87,0.45)', backgroundColor: colors.surfaceStrong }
          : null,
        hovered ? (glowWeb as object) : null,
        webTransition as object,
        onPress ? (pressCursor as object) : null,
      ]}
    >
      {({ hovered }: HoverState) => children(!!hovered)}
    </Pressable>
  );
}
```
(imports, `HoverState`, `webTransition`, `glowWeb` stay as they are.)

- [ ] **Step 2: ProjectCard optional onPress + cta**

In `project-card.tsx`, change the signature and pass `onPress` through to `GlowCard`:

```tsx
export function ProjectCard({ item, onPress, cta }: { item: ProjectItem; onPress?: () => void; cta?: string }) {
  return (
    <GlowCard
      onPress={onPress}
      style={{
```
and after the closing `</View>` of the tech-tags row (the `marginTop: 'auto'` block), before the final `</>`:

```tsx
          {cta ? (
            <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accent, marginTop: 14 }}>{cta}</Text>
          ) : null}
```

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit` → exit 0.

```bash
git add src/ui/glow-card.tsx src/features/portfolio/sections/projects/project-card.tsx
git commit -m "feat(ar): optional press/cta on GlowCard + ProjectCard"
```

---

### Task 2: Extract ArViewer, delete ArShowcase

**Files:**
- Create: `src/features/portfolio/sections/ar/ar-viewer.tsx`
- Delete: `src/features/portfolio/sections/ar/ar-showcase.tsx`

- [ ] **Step 1: Create the viewer component**

`src/features/portfolio/sections/ar/ar-viewer.tsx` — the internals of the current `ar-showcase.tsx`, minus section chrome (Container/heading/support). Full content:

```tsx
import { useEffect, useRef, useState } from 'react';
import { Platform, Text, View } from 'react-native';
import { unstable_createElement } from 'react-native-web';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

const T = {
  es: { arButton: 'Ver en AR ↗' },
  en: { arButton: 'View in AR ↗' },
};

/** Injects the self-hosted model-viewer module once, on first mount (web only). */
function ensureModelViewerScript(): void {
  if (typeof document === 'undefined' || typeof customElements === 'undefined') return;
  if (customElements.get('model-viewer') || document.getElementById('model-viewer-script')) return;
  const script = document.createElement('script');
  script.type = 'module';
  script.src = '/vendor/model-viewer.min.js';
  script.id = 'model-viewer-script';
  document.head.appendChild(script);
}

/** The interactive 3D/AR rook viewer; fills its parent. */
export function ArViewer() {
  const { locale } = useI18n();
  const t = T[locale];
  const hostRef = useRef<View>(null);
  const [modelReady, setModelReady] = useState(false);

  useEffect(() => {
    ensureModelViewerScript();
  }, []);

  // Hide the static placeholder once the model renders (the viewer background
  // is transparent, so anything behind it stays visible until then). Polling
  // the element's `loaded` flag is more reliable than a React ref here:
  // unstable_createElement does not forward refs to the custom element.
  useEffect(() => {
    const host = hostRef.current as unknown as HTMLElement | null;
    if (!host || typeof host.querySelector !== 'function') return;
    let ticks = 0;
    const timer = setInterval(() => {
      const el = host.querySelector('model-viewer') as unknown as { loaded?: boolean } | null;
      ticks += 1;
      if (el?.loaded) {
        setModelReady(true);
        clearInterval(timer);
      } else if (ticks > 120) {
        clearInterval(timer); // never loaded — keep the static placeholder
      }
    }, 250);
    return () => clearInterval(timer);
  }, []);

  if (Platform.OS !== 'web') return null;

  const viewer = unstable_createElement(
    'model-viewer',
    {
      src: '/models/rook.glb',
      'ios-src': '/models/rook.usdz',
      alt: 'Luis De La Torre — AR demo',
      ar: '',
      'ar-modes': 'webxr scene-viewer quick-look',
      'camera-controls': '',
      'auto-rotate': '',
      'auto-rotate-delay': '0',
      'shadow-intensity': '1',
      'touch-action': 'pan-y',
      loading: 'eager',
      style: { width: '100%', height: '100%', '--progress-bar-color': 'rgba(228,227,87,0.85)' },
    },
    unstable_createElement(
      'button',
      {
        slot: 'ar-button',
        style: {
          position: 'absolute',
          bottom: '18px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: colors.accent,
          color: colors.onAccent,
          border: 'none',
          borderRadius: '999px',
          padding: '12px 22px',
          fontFamily: fonts.bodyMedium,
          fontSize: '14px',
          cursor: 'pointer',
        },
      },
      t.arButton,
    ),
  );

  return (
    <View ref={hostRef} style={{ flex: 1 }}>
      {/* Static placeholder behind the viewer; hidden once the model renders. */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', opacity: modelReady ? 0 : 1 }}>
        <Text style={{ fontSize: 64, color: colors.accent }}>♜</Text>
      </View>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{viewer}</View>
    </View>
  );
}
```

- [ ] **Step 2: Delete the old section**

```bash
git rm src/features/portfolio/sections/ar/ar-showcase.tsx
```

- [ ] **Step 3: Remove it from home**

`src/features/portfolio/pages/home-page.tsx` back to:

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

- [ ] **Step 4: Typecheck + commit**

Run: `npx tsc --noEmit` → exit 0.

```bash
git add -A
git commit -m "refactor(ar): extract ArViewer; drop home showcase section"
```

---

### Task 3: ArDemoCard (card + modal) + projects wiring

**Files:**
- Create: `src/features/portfolio/sections/ar/ar-demo-card.tsx`
- Modify: `src/features/portfolio/sections/projects/projects-section.tsx`

- [ ] **Step 1: Create the card + modal component**

`src/features/portfolio/sections/ar/ar-demo-card.tsx`:

```tsx
import { useState } from 'react';
import { Modal, Platform, Pressable, Text, View, useWindowDimensions, type PressableStateCallbackType } from 'react-native';
import { markSectionSeen } from '@/analytics/tracker';
import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { ProjectCard } from '../projects/project-card';
import { ArViewer } from './ar-viewer';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

const T = {
  es: {
    category: 'DEMO INTERACTIVO',
    title: 'Realidad Aumentada en tu navegador',
    description:
      'Una torre 3D que puedes girar, acercar y — desde tu móvil — colocar en tu espacio real con un tap, sin instalar nada. Modelo generado por código y servido como WebAR.',
    cta: 'Abrir demo ↗',
    modalTitle: 'Demo WebAR',
    close: 'Cerrar',
  },
  en: {
    category: 'INTERACTIVE DEMO',
    title: 'Augmented Reality in your browser',
    description:
      'A 3D rook you can rotate, zoom and — from your phone — place in your real space with one tap, nothing to install. Model generated from code and served as WebAR.',
    cta: 'Open demo ↗',
    modalTitle: 'WebAR demo',
    close: 'Close',
  },
};

const TECH = ['WebAR', '3D', 'model-viewer', 'Scene Viewer', 'Quick Look'];

/** First card of the projects grid: opens the WebAR viewer in a modal. */
export function ArDemoCard() {
  const { locale } = useI18n();
  const { height } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const t = T[locale];

  const item: ProjectItem = { category: t.category, title: t.title, description: t.description, tech: TECH };

  const openDemo = () => {
    setOpen(true);
    markSectionSeen('ar');
  };

  return (
    <>
      <ProjectCard item={item} onPress={openDemo} cta={t.cta} />
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          onPress={() => setOpen(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.72)', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          {/* Stop backdrop-close when pressing inside the dialog. */}
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: '92%',
              maxWidth: 900,
              height: Math.min(height * 0.78, 640),
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 24,
              backgroundColor: '#0d0e11',
              overflow: 'hidden',
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.text }}>{t.modalTitle}</Text>
              <Pressable
                onPress={() => setOpen(false)}
                accessibilityLabel={t.close}
                style={[{ padding: 6 }, webCursor as object]}
              >
                {({ hovered }: HoverState) => (
                  <Text style={{ fontSize: 18, color: hovered ? colors.accent : colors.textMuted }}>✕</Text>
                )}
              </Pressable>
            </View>
            <ArViewer />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
```

- [ ] **Step 2: Wire into the projects grid (first item)**

In `projects-section.tsx`, add the import and render the demo card first; shift CMS-card delays by one slot:

```tsx
import { ArDemoCard } from '../ar/ar-demo-card';
```

```tsx
      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, gridWeb as object]}>
        <Reveal delay={0} style={{ flexGrow: 1, flexBasis: 340, minWidth: 300 }}>
          <ArDemoCard />
        </Reveal>
        {projects.items.map((item, i) => (
          <Reveal key={item.title} delay={(i + 1) * 70} style={{ flexGrow: 1, flexBasis: 340, minWidth: 300 }}>
            <ProjectCard item={item} />
          </Reveal>
        ))}
      </View>
```

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit` → exit 0.

```bash
git add src/features/portfolio/sections/ar/ar-demo-card.tsx src/features/portfolio/sections/projects/projects-section.tsx
git commit -m "feat(ar): demo card in projects grid opens WebAR modal"
```

---

### Task 4: Verify (export, hygiene, preview)

**Files:** none (verification only)

- [ ] **Step 1: Export + hygiene**

```bash
npx expo export -p web
grep -lE 'initializeApp|firebase/auth' dist/_expo/static/js/web/*.js   # → only firebase-client chunk
ls dist/models dist/vendor                                             # rook.glb, rook.usdz, model-viewer.min.js
```

- [ ] **Step 2: Preview checks**

With the dev server (preview_start `portfolio`), viewport 1280×800 + fresh reload:
1. `/` snapshot → NO "Míralo en tu espacio" section (hero → services preview → CTA).
2. `/proyectos` snapshot → first card = "Realidad Aumentada en tu navegador" with DEMO INTERACTIVO chip + "Abrir demo ↗".
3. Click the card → modal visible; eval: `customElements.get('model-viewer')` truthy and, after a beat, `document.querySelector('model-viewer').loaded === true`.
4. ✕ closes; reopen; backdrop press closes (click coordinates outside the dialog).
5. `preview_console_logs` level error → none.
6. Mobile 375×812 + reload → `/proyectos` card renders, modal fits, no horizontal overflow.
7. `preview_screenshot` (desktop, modal open) for the user report.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "fix(ar): preview fixes"   # only if needed
```

---

### Task 5: PR

- [ ] **Step 1: Push and create the PR**

```bash
git push -u origin feat/ar-demo-projects-modal
gh pr create --title "feat(ar): demo WebAR como card de proyectos + modal" --body "$(cat <<'EOF'
## Summary
- La demo WebAR sale del inicio y vive en /proyectos: card "Realidad Aumentada en tu navegador" (primera de la grilla) que abre un modal con el visor 3D/AR completo
- ArViewer extraído y reutilizable; GlowCard/ProjectCard ganan props opcionales (onPress, cta) sin afectar las cards del CMS
- El script vendor solo se carga al abrir el modal — el inicio vuelve a quedar sin overhead AR
- Métrica 'ar' se marca al abrir el modal (interés real); sin cambios en functions

## Test Plan
- [x] tsc + export + higiene de bundle
- [x] Preview: home sin sección AR; /proyectos con card demo; modal abre/cierra (✕, backdrop, Escape); torre carga; sin errores de consola; mobile OK
- [ ] Post-deploy (hosting): card + modal en vivo; AR real en Android/iOS igual que antes

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

### Deploy (after user merges — MANUAL, on user's "lanza deploy")

1. `gh workflow run deploy.yml --ref main` — hosting only (functions untouched).
2. Live: `/proyectos` shows the card; modal opens; `/` no longer has the section.
