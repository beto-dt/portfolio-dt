# Footer Polish + Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "↑ back to top" control (accent hover, smooth scroll) and a fade-in entrance to the footer, keeping the minimal copyright/tagline layout.

**Architecture:** `site-footer.tsx` gains a `BackToTop` `Pressable` (bilingual label from `locale`, hover→accent, `scrollToAnchor('top')`) placed between copyright and tagline, and wraps the row in `Reveal slide={false}`. Single file.

**Tech Stack:** Expo Router + react-native-web, existing `Reveal` + `scrollToAnchor`, `useI18n().locale`, Pressable hover state. No test runner in this repo.

**Verification note:** No jest/unit-test setup — do NOT add one. Verify with `npx tsc --noEmit` + `npx expo export -p web` + browser. Do NOT run `npx expo lint` (auto-scaffolds `eslint.config.js` + deps; discard if produced). If `dist/` appears it is gitignored — leave it.

---

### Task 1: `site-footer.tsx` — back-to-top button + fade entrance

**Files:**
- Modify: `src/features/portfolio/components/site-footer.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/components/site-footer.tsx`**

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from './container';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const topInteractive = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;

function BackToTop({ label }: { label: string }) {
  return (
    <Pressable onPress={() => scrollToAnchor('top')} style={topInteractive as object}>
      {({ hovered }: HoverState) => (
        <Text style={[{ fontFamily: fonts.mono, fontSize: 11.5, color: hovered ? colors.accent : colors.textFaint }, topInteractive as object]}>
          ↑ {label}
        </Text>
      )}
    </Pressable>
  );
}

export function SiteFooter() {
  const { content, locale } = useI18n();
  const { footer } = content;
  const topLabel = locale === 'es' ? 'Volver arriba' : 'Back to top';
  return (
    <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: colors.border }}>
      <Reveal slide={false}>
        <Container style={{ paddingVertical: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.copyright}</Text>
          <BackToTop label={topLabel} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.tagline}</Text>
        </Container>
      </Reveal>
    </View>
  );
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful `dist` export.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/components/site-footer.tsx
git commit -m "feat(portfolio): footer back-to-top button + fade entrance"
```

---

### Task 2: Verify (build + bundle hygiene + browser) and deploy

**Files:** none (verification + deploy).

- [ ] **Step 1: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful export.

- [ ] **Step 2: Bundle hygiene**

Run: `grep -rl "initializeApp\|firebase/auth" dist/_expo/static/js/web | grep -v firebase-client || echo "clean"`
Expected: `clean`.

- [ ] **Step 3: Browser verification (preview tools)**

Start/reuse the `web` preview, scroll to the footer, and confirm:
- **At rest:** footer shows copyright (left) · "↑ Volver arriba" (center) · tagline
  (right); top border intact. `preview_screenshot`.
- **Back to top:** clicking "↑ Volver arriba" smooth-scrolls to the hero top
  (`preview_eval` can read `window.scrollY` before/after, or click + snapshot; note
  headless smooth-scroll may be throttled — if so, confirm the handler is wired and
  verify live).
- **Hover:** the button turns accent on hover (headless RNW hover may be unreliable
  — confirm by code / live).
- **Locale:** toggle language → label switches to "↑ Back to top".
- **Entrance:** footer fades in; top border does not shift (slide disabled).
- **Layout:** verify wrap at mobile (375) + desktop.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 4: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live.

---

## Self-Review

**1. Spec coverage:**
- Back-to-top `Pressable` (bilingual label, accent hover, `scrollToAnchor('top')`)
  → Task 1 (`BackToTop`) ✓
- Fade-only entrance (`Reveal slide={false}`, border fixed) → Task 1 ✓
- Copyright/tagline stay static (no hover) → Task 1 ✓
- Verify + deploy → Task 2 ✓
- Non-goals honored: no CMS change (label from `locale`); no layout redesign; no new
  primitives; no hover on plain texts ✓
No gaps.

**2. Placeholder scan:** No TBD/TODO; complete code in the code step. ✓

**3. Type consistency:**
- `useI18n()` returns `{ content, locale, toggleLocale }` — `content` + `locale`
  used ✓.
- `Reveal({ children, delay?, slide?, style? })` — used with `slide={false}` ✓.
- `scrollToAnchor(anchor: string)` — called with `'top'` (hero has `nativeID="top"`)
  ✓.
- `BackToTop({ label: string })` — defined + called with `topLabel` ✓.
- `FooterContent` fields `copyright`/`tagline` used ✓.
