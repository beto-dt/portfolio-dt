# Certifications Section Polish + Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add hover-highlight rows (subtle bg, brighter text/divider, accent left marker) and a staggered fade-in entrance to the Certificaciones list — no hyperlinks, no layout/content changes.

**Architecture:** A `CertRow` sub-component renders each row as a hover-reactive `Pressable`; `certifications-section.tsx` wraps the heading + each row in the existing `Reveal`. Single file.

**Tech Stack:** Expo Router + react-native-web, existing `Reveal`, Pressable hover state. No test runner in this repo.

**Verification note:** No jest/unit-test setup — do NOT add one. Verify with `npx tsc --noEmit` + `npx expo export -p web` + browser. Do NOT run `npx expo lint` (auto-scaffolds `eslint.config.js` + deps; discard if produced). If `dist/` appears it is gitignored — leave it.

---

### Task 1: `certifications-section.tsx` — hover rows + staggered entrance

**Files:**
- Modify: `src/features/portfolio/sections/certifications/certifications-section.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/certifications/certifications-section.tsx`**

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import type { Certification } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const rowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '160ms' } as object) : null;
const textTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const markerTransition = Platform.OS === 'web' ? ({ transitionProperty: 'opacity', transitionDuration: '160ms' } as object) : null;

/** A certification row that highlights on hover (decorative — not a link). */
function CertRow({ item }: { item: Certification }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          position: 'relative',
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
          backgroundColor: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        },
        rowTransition as object,
      ]}
    >
      {({ hovered }: HoverState) => (
        <>
          <View
            pointerEvents="none"
            style={[
              { position: 'absolute', left: -14, top: 12, bottom: 12, width: 2, borderRadius: 2, backgroundColor: colors.accent, opacity: hovered ? 1 : 0 },
              markerTransition as object,
            ]}
          />
          <Text style={[{ flex: 1, fontSize: 13.5, color: hovered ? colors.text : 'rgb(223,226,230)' }, textTransition as object]}>
            {item.name}
          </Text>
          <Text style={[{ fontFamily: fonts.mono, fontSize: 11, color: hovered ? colors.textDim : colors.textFaint }, textTransition as object]}>
            {item.issuer}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function CertificationsSection() {
  const { content } = useI18n();
  const { certifications } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={certifications.kicker} heading={certifications.heading} />
      </Reveal>
      <View>
        {certifications.items.map((item, i) => (
          <Reveal key={item.name} delay={i * 70}>
            <CertRow item={item} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful `dist` export.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/sections/certifications/certifications-section.tsx
git commit -m "feat(portfolio): certifications rows hover-highlight + staggered reveal"
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

Start/reuse the `web` preview, scroll to the Certificaciones section, and confirm:
- **At rest:** list looks identical (name left, issuer right, 1px dividers).
  `preview_screenshot`.
- **Hover:** hovering a row adds a subtle bg, brightens name + issuer + divider,
  and shows the left accent marker (headless RNW hover may be unreliable — confirm
  mechanism by code; verify live).
- **Entrance:** heading + rows fade/slide in staggered on reload.
- **Layout unchanged:** no text shift; verify at mobile (375) + desktop.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 4: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live.

---

## Self-Review

**1. Spec coverage:**
- Row hover: subtle bg + name/issuer brighten + divider brighten + accent left
  marker (no layout shift) → Task 1 ✓
- Staggered fade+slide entrance (heading + rows) → Task 1 ✓
- No hyperlinks / no `onPress` / default cursor → Task 1 ✓
- Verify + deploy → Task 2 ✓
- Non-goals honored: no content/type-size change; `SectionHeading` wrapped not
  edited; other sections untouched ✓
No gaps.

**2. Placeholder scan:** No TBD/TODO; complete code in the code step. ✓

**3. Type consistency:**
- `CertRow({ item }: { item: Certification })` — `Certification` = `{ name, issuer }`
  from `@/content/types`; fields `name`/`issuer` used ✓.
- `Reveal({ children, delay?, slide?, style? })` — used with `delay`, default slide
  ✓.
- Rest-state styles (name `rgb(223,226,230)`, issuer `textFaint`, divider `0.07`)
  match the current file → no-hover appearance unchanged ✓.
- Pressable `style` callback and children callback both destructure `hovered` from
  the same `HoverState` — valid RNW pattern ✓.
