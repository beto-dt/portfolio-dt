# WebAR Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Home-page section with an interactive 3D rook (the site logo) that visitors can place in their real space via WebAR — Scene Viewer on Android, Quick Look on iOS — with orbit/zoom on desktop.

**Architecture:** A committed Python script generates `public/models/rook.glb` procedurally (trimesh boxes, PBR materials). Google's `<model-viewer>` web component is self-hosted in `public/vendor/` and lazily injected by the new `ArShowcase` section (rendered via `unstable_createElement`, so it never enters the Metro bundle). Tracking reuses `TrackedSection` + a new `'ar'` key in `recordVisit`.

**Tech Stack:** trimesh (installed), `@google/model-viewer` 4.1.0 (vendored file, not an npm dep), react-native-web `unstable_createElement`, existing section primitives (`Container`, `SectionHeading`, `Reveal`).

**Spec:** `docs/superpowers/specs/2026-07-07-webar-showcase-design.md`
**Branch:** `feature/webar-showcase` (already created; spec committed)

**Verification instead of tests:** this repo has NO test runner. Every task verifies with: `npx tsc --noEmit`, and the final task adds `npm --prefix functions run build`, `npx expo export -p web`, bundle-hygiene grep, and preview checks. NEVER run `npx expo lint`.

---

### Task 1: Generate the rook model

**Files:**
- Create: `scripts/generate-rook.py`
- Create: `public/models/rook.glb` (generated, committed)

- [ ] **Step 1: Write the generator script**

Create `scripts/generate-rook.py`:

```python
"""Generates public/models/rook.glb - the site logo as a low-poly 3D rook.

Run from repo root: python3 scripts/generate-rook.py
Geometry mirrors the blocky logo: base slab, plinth, body, collar, 3 merlons.
Units: modeled in mm, exported in meters (glTF requirement); ~27 cm tall,
a natural desk-object size in AR.
"""
import trimesh
from trimesh.visual import TextureVisuals
from trimesh.visual.material import PBRMaterial

MM = 0.001

# baseColorFactor is linear RGB per glTF spec (sRGB #e4e357 / #17181c converted).
ACCENT = PBRMaterial(baseColorFactor=[0.767, 0.760, 0.095, 1.0], metallicFactor=0.05, roughnessFactor=0.45, name="accent")
DARK = PBRMaterial(baseColorFactor=[0.0091, 0.0098, 0.0122, 1.0], metallicFactor=0.1, roughnessFactor=0.6, name="dark")


def box(w: float, h: float, d: float, x: float, y_bottom: float, mat: PBRMaterial) -> trimesh.Trimesh:
    b = trimesh.creation.box(extents=[w * MM, h * MM, d * MM])
    b.apply_translation([x * MM, (y_bottom + h / 2) * MM, 0.0])
    b.visual = TextureVisuals(material=mat)
    return b


parts = [
    box(190, 40, 120, 0, 0, DARK),        # base slab
    box(150, 25, 100, 0, 40, ACCENT),     # plinth
    box(120, 145, 80, 0, 65, ACCENT),     # body
    box(170, 25, 100, 0, 210, ACCENT),    # collar
    box(45, 35, 100, -62.5, 235, ACCENT), # merlon left
    box(45, 35, 100, 0, 235, ACCENT),     # merlon center
    box(45, 35, 100, 62.5, 235, ACCENT),  # merlon right
]

scene = trimesh.Scene(parts)
scene.export("public/models/rook.glb")
print("rook.glb written, bounds (m):", scene.bounds.tolist())
```

- [ ] **Step 2: Run it and validate the output**

Run from repo root: `python3 scripts/generate-rook.py`
Expected: `rook.glb written, bounds (m): [[-0.095, 0.0, -0.06], [0.095, 0.27, 0.06]]`

Validate round-trip + size:
```bash
python3 -c "import trimesh; s = trimesh.load('public/models/rook.glb'); print('geoms:', len(s.geometry), 'ok')"
ls -la public/models/rook.glb
```
Expected: `geoms: 7 ok` (trimesh may merge same-material geoms — any count ≥ 2 is fine) and file size well under 100 KB (boxes only; expect < 10 KB).

- [ ] **Step 3: Commit**

```bash
git add scripts/generate-rook.py public/models/rook.glb
git commit -m "feat(ar): procedural rook model (logo as low-poly glb)"
```

---

### Task 2: Vendor model-viewer + cache headers

**Files:**
- Create: `public/vendor/model-viewer.min.js` (downloaded, committed)
- Modify: `firebase.json` (headers block)

- [ ] **Step 1: Download the pinned build**

```bash
mkdir -p public/vendor
curl -fsSL https://cdn.jsdelivr.net/npm/@google/model-viewer@4.1.0/dist/model-viewer.min.js -o public/vendor/model-viewer.min.js
head -c 300 public/vendor/model-viewer.min.js
ls -la public/vendor/model-viewer.min.js
```
Expected: JS content (license banner / minified module), size roughly 700 KB–1.3 MB. If jsdelivr fails, fallback URL: `https://unpkg.com/@google/model-viewer@4.1.0/dist/model-viewer.min.js`.

- [ ] **Step 2: Add cache rules for models and vendor**

In `firebase.json`, headers array — order matters (LAST matching rule wins; the catch-all `**` no-cache must stay FIRST). Edit the image-extensions rule and add a vendor rule so the final array is:

```json
"headers": [
  {
    "source": "**",
    "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
  },
  {
    "source": "**/*.@(jpg|jpeg|png|gif|webp|svg|ico|woff2|glb|usdz)",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=604800" }]
  },
  {
    "source": "/vendor/**",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=604800" }]
  },
  {
    "source": "/_expo/static/**",
    "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
  }
]
```

- [ ] **Step 3: Verify JSON is valid**

Run: `python3 -c "import json; json.load(open('firebase.json')); print('valid')"`
Expected: `valid`

- [ ] **Step 4: Commit**

```bash
git add public/vendor/model-viewer.min.js firebase.json
git commit -m "feat(ar): vendor model-viewer 4.1.0 + cache rules for 3d assets"
```

---

### Task 3: ArShowcase section component

**Files:**
- Create: `src/types/react-native-web.d.ts`
- Create: `src/features/portfolio/sections/ar/ar-showcase.tsx`

- [ ] **Step 1: Type declaration for react-native-web**

react-native-web ships no TypeScript types; declare the one export we use.
Create `src/types/react-native-web.d.ts`:

```ts
declare module 'react-native-web' {
  import type { ReactElement, ReactNode } from 'react';
  export function unstable_createElement(
    type: string,
    props?: Record<string, unknown>,
    ...children: ReactNode[]
  ): ReactElement;
}
```

- [ ] **Step 2: Write the section component**

Create `src/features/portfolio/sections/ar/ar-showcase.tsx`:

```tsx
import { useEffect } from 'react';
import { Platform, Text, View, useWindowDimensions } from 'react-native';
import { unstable_createElement } from 'react-native-web';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { Reveal } from '@/ui/reveal';

const T = {
  es: {
    kicker: 'ar demo',
    heading: 'Míralo en tu espacio',
    support:
      'Gira la torre y hazle zoom. Desde tu móvil, toca «Ver en AR» para ponerla en tu escritorio — sin instalar nada. Así se siente el trabajo de Realidad Aumentada que construyo.',
    arButton: 'Ver en AR ↗',
    fallback: 'Tu navegador no soporta el visor 3D.',
  },
  en: {
    kicker: 'ar demo',
    heading: 'See it in your space',
    support:
      'Rotate the rook and zoom in. On your phone, tap “View in AR” to place it on your desk — nothing to install. This is what the Augmented Reality work I build feels like.',
    arButton: 'View in AR ↗',
    fallback: 'Your browser does not support the 3D viewer.',
  },
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

export function ArShowcase() {
  const { locale } = useI18n();
  const { width } = useWindowDimensions();
  const t = T[locale];

  useEffect(() => {
    ensureModelViewerScript();
  }, []);

  if (Platform.OS !== 'web') return null;

  const viewer = unstable_createElement(
    'model-viewer',
    {
      src: '/models/rook.glb',
      'ios-src': '/models/rook.usdz',
      alt: t.heading,
      ar: '',
      'ar-modes': 'webxr scene-viewer quick-look',
      'camera-controls': '',
      'auto-rotate': '',
      'auto-rotate-delay': '0',
      'shadow-intensity': '1',
      'touch-action': 'pan-y',
      loading: 'lazy',
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
    <Container style={{ paddingVertical: 40 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={t.kicker} heading={t.heading} />
        <Text style={{ fontSize: 15, lineHeight: 24, color: colors.textMuted, maxWidth: 640, marginTop: -16, marginBottom: 28 }}>
          {t.support}
        </Text>
      </Reveal>
      <Reveal delay={120}>
        <View
          style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: 'rgba(255,255,255,0.02)',
            height: width < 640 ? 380 : 460,
          }}
        >
          {/* Static fallback behind the viewer: visible only if the element never defines/loads. */}
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Text style={{ fontSize: 64, color: colors.accent }}>♜</Text>
            <Text style={{ fontSize: 13, color: colors.textFaint }}>{t.fallback}</Text>
          </View>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>{viewer}</View>
        </View>
      </Reveal>
    </Container>
  );
}
```

Notes for the implementer:
- `ar: ''` etc.: React renders unknown-element props as attributes; empty string = attribute present, which is how model-viewer reads boolean attributes.
- `touch-action="pan-y"` keeps page scroll working over the viewer on mobile.
- The button slot replaces model-viewer's default white AR chip with site styling; it only appears on AR-capable devices (model-viewer manages visibility).
- Check the exact token names in `src/theme/tokens.ts` (`colors.textMuted`, `colors.textFaint`, `colors.border`, `colors.accent`, `colors.onAccent`, `fonts.bodyMedium`) and adjust if any differ.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: exit 0, no errors.

- [ ] **Step 4: Commit**

```bash
git add src/types/react-native-web.d.ts src/features/portfolio/sections/ar/ar-showcase.tsx
git commit -m "feat(ar): ArShowcase section (model-viewer via unstable_createElement)"
```

---

### Task 4: Home wiring + analytics key

**Files:**
- Modify: `src/features/portfolio/pages/home-page.tsx`
- Modify: `functions/src/index.ts` (SECTION_KEYS, ~line 48)

- [ ] **Step 1: Mount the section on the home page**

Replace the body of `src/features/portfolio/pages/home-page.tsx` with:

```tsx
import { PageShell } from '../components/page-shell';
import { HeroSection } from '../sections/hero/hero-section';
import { ArShowcase } from '../sections/ar/ar-showcase';
import { ServicesPreview } from '../sections/hero/services-preview';
import { CtaBand } from '../sections/hero/cta-band';
import { TrackedSection } from '@/analytics/tracked-section';

export function HomePage() {
  return (
    <PageShell>
      <TrackedSection id="hero"><HeroSection /></TrackedSection>
      <TrackedSection id="ar"><ArShowcase /></TrackedSection>
      <ServicesPreview />
      <CtaBand />
    </PageShell>
  );
}
```

- [ ] **Step 2: Add the 'ar' section key to recordVisit**

In `functions/src/index.ts`, add `'ar',` to the `SECTION_KEYS` set (after `'hero',`):

```ts
const SECTION_KEYS = new Set([
  'hero',
  'ar',
  'services',
```
(keep the rest of the list unchanged — the admin metrics panel lists `bySection` keys as-is, so no admin change is needed.)

- [ ] **Step 3: Typecheck app + build functions**

Run: `npx tsc --noEmit && npm --prefix functions run build`
Expected: both exit 0.

- [ ] **Step 4: Commit**

```bash
git add src/features/portfolio/pages/home-page.tsx functions/src/index.ts
git commit -m "feat(ar): mount ArShowcase on home + track 'ar' section"
```

---

### Task 5: Verify (export, hygiene, preview)

**Files:** none (verification only)

- [ ] **Step 1: Static export**

Run: `npx expo export -p web`
Expected: succeeds; `dist/models/rook.glb` and `dist/vendor/model-viewer.min.js` exist (`ls dist/models dist/vendor`).

- [ ] **Step 2: Bundle hygiene**

```bash
grep -lE 'initializeApp|firebase/auth' dist/_expo/static/js/web/*.js
grep -l 'model-viewer' dist/_expo/static/js/web/*.js | xargs -I{} sh -c 'echo {}; grep -o "model-viewer[a-z.-]*" {} | sort -u'
```
Expected: first grep → ONLY the firebase-client chunk. Second grep may match chunks containing the literal strings `'model-viewer'`/`/vendor/model-viewer.min.js` from ArShowcase itself (fine) — what must NOT appear is the library payload; confirm no chunk grew by ~1 MB (`ls -la dist/_expo/static/js/web/` — all chunks similar to previous builds).

- [ ] **Step 3: Preview checks**

Start the dev server (preview_start with the existing launch config). Then:
1. `preview_snapshot` on `/` → section "Míralo en tu espacio" present between hero and services preview.
2. `preview_eval`: `!!customElements.get('model-viewer')` → `true` (script injected and defined).
3. `preview_eval`: `!!document.querySelector('model-viewer')?.shadowRoot?.querySelector('canvas')` → `true` (model rendering). It may need a second try after load.
4. `preview_console_logs` level error → none related to model-viewer/rook.
5. `preview_resize` mobile (375×812) + fresh reload → section renders at 380 height, no horizontal overflow.
6. `preview_screenshot` desktop for the user report.

If the custom element never defines or the canvas is missing, debug: check `/vendor/model-viewer.min.js` is served (preview_network), check console for module errors — fix before proceeding.

- [ ] **Step 4: Commit any fixes**

```bash
git add -A && git commit -m "fix(ar): preview fixes" # only if fixes were needed
```

---

### Task 6: USDZ handoff note + PR

**Files:** none

- [ ] **Step 1: Tell the user how to produce rook.usdz**

The iOS AR button needs `public/models/rook.usdz`. Ask the user to: open **Reality Converter** (macOS), drag in `public/models/rook.glb`, File → Export → save as `rook.usdz`, drop it into `public/models/`. Then `git add public/models/rook.usdz && git commit -m "feat(ar): usdz for iOS Quick Look"`. This can land in the same PR or as a follow-up — Android AR and the 3D viewer do not depend on it.

- [ ] **Step 2: Push and create the PR**

```bash
git push -u origin feature/webar-showcase
gh pr create --title "feat(ar): WebAR showcase — rook 3D en 'Míralo en tu espacio'" --body "$(cat <<'EOF'
## Summary
- Nueva sección home "Míralo en tu espacio": visor 3D interactivo del logo (torre) con auto-rotate, órbita/zoom y botón "Ver en AR" (Scene Viewer Android / Quick Look iOS vía ios-src usdz)
- Modelo generado proceduralmente (`scripts/generate-rook.py` → `public/models/rook.glb`, <10 KB) — sin licencias de terceros
- `model-viewer` 4.1.0 self-hosted en `public/vendor/`, inyectado lazy fuera del bundle de Metro
- Cache: `.glb/.usdz` y `/vendor/**` a 1 semana; clave `'ar'` en recordVisit para métricas

## Test Plan
- [x] tsc + functions build + export
- [x] Bundle hygiene (firebase y model-viewer fuera de los chunks)
- [x] Preview: sección renderiza, custom element definido, canvas presente, sin errores de consola, mobile OK
- [ ] Post-deploy: AR real en Android (Scene Viewer) y iOS (Quick Look, requiere rook.usdz)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

### Deploy (after user merges — MANUAL, on user's "lanza deploy")

1. `gh workflow run deploy.yml --ref main` (hosting: pages + models + vendor + headers).
2. `npx firebase-tools deploy --only functions:recordVisit --project luisdelatorre-portfolio` (new 'ar' section key) — required because deploy.yml only deploys hosting.
3. Live checks: `curl -sI https://luisdelatorre.dev/models/rook.glb | grep -i cache-control` → `public, max-age=604800`; same for `/vendor/model-viewer.min.js`; `/` still `no-cache`.
4. Real-device: user opens the site on Android → "Ver en AR" → Scene Viewer places the rook; iPhone (once usdz landed) → Quick Look.
