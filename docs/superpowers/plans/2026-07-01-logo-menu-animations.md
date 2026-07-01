# Header Logo + Menu Animations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the brand logo to the header and animate the menu (underline-on-hover, scroll-spy active highlight, header entrance, logo hover).

**Architecture:** A `NavLink` component (accent underline via `scaleX` + web transition, active/hover aware), a `useActiveSection` IntersectionObserver hook (scroll-spy over the existing section `nativeID`s), and a `site-header` that renders the logo + name, animates its entrance with the RN `Animated` API, and drives the nav links from the active section.

**Tech Stack:** Expo/React Native web, `Animated` (react-native), IntersectionObserver, TypeScript.

**Base:** Implement on a branch that INCLUDES the interaction-polish header (PR #13): the current `site-header.tsx` already uses `AppButton`/`HoverLink`/`scrollToAnchor`, and sections have `nativeID`s (`top`, `services`, `experience`, `projects`, `contact`).

**Testing note:** Gate = `npx tsc --noEmit` + `npx expo export -p web` (logo bundled) + public-bundle-excludes-Firebase check + a browser interaction check.

---

### Task 1: Logo asset + NavLink + useActiveSection

**Files:**
- Create: `assets/images/logo.png` (copied)
- Create: `src/features/portfolio/components/nav-link.tsx`
- Create: `src/features/portfolio/hooks/use-active-section.ts`

- [ ] **Step 1: Copy the logo asset**

```bash
cp "/Users/albertodelatorre/Desktop/Portfolio_files/logo.png" assets/images/logo.png
```
Confirm: `test -f assets/images/logo.png && echo ok`.

- [ ] **Step 2: Create `src/features/portfolio/components/nav-link.tsx`**

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { colors } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;
const underlineTransition = Platform.OS === 'web'
  ? ({ transformOrigin: 'left', transitionProperty: 'transform', transitionDuration: '200ms' } as object)
  : null;

export function NavLink({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={webCursor as object}>
      {({ hovered }: HoverState) => {
        const on = hovered || active;
        return (
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 13.5, color: active ? colors.accent : hovered ? colors.text : colors.textMuted }}>{label}</Text>
            <View style={[{ height: 2, borderRadius: 2, backgroundColor: colors.accent, transform: [{ scaleX: on ? 1 : 0 }] }, underlineTransition as object]} />
          </View>
        );
      }}
    </Pressable>
  );
}
```

- [ ] **Step 3: Create `src/features/portfolio/hooks/use-active-section.ts`**

```ts
import { useEffect, useState } from 'react';

/** Scroll-spy: returns the anchor id of the section currently in view.
 *  Web only (IntersectionObserver); returns null on native/SSR. */
export function useActiveSection(anchors: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = anchors.join(',');

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const list = anchors;
    const elements = list.map((a) => document.getElementById(a)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const a of list) {
          const r = ratios.get(a) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = a;
          }
        }
        setActive(best);
      },
      { threshold: [0.15, 0.5, 0.85], rootMargin: '-64px 0px -55% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
```

- [ ] **Step 4: Verify + commit**

Run: `npx tsc --noEmit` — Expected: PASS.
```bash
git add assets/images/logo.png src/features/portfolio/components/nav-link.tsx src/features/portfolio/hooks/use-active-section.ts
git commit -m "feat(portfolio): add logo asset, NavLink (animated underline), useActiveSection scroll-spy"
```

---

### Task 2: Header — logo + entrance + NavLinks

**Files:**
- Modify: `src/features/portfolio/components/site-header.tsx` (replace)

- [ ] **Step 1: Replace `src/features/portfolio/components/site-header.tsx`**

```tsx
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';
import { NavLink } from './nav-link';
import { useActiveSection } from '../hooks/use-active-section';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;
const logoTransition = Platform.OS === 'web' ? ({ transitionProperty: 'transform', transitionDuration: '200ms' } as object) : null;

export function SiteHeader() {
  const { content, toggleLocale } = useI18n();
  const { nav } = content;
  const [anchors] = useState(() => nav.links.map((l) => l.anchor));
  const active = useActiveSection(anchors);

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
      <Pressable onPress={() => scrollToAnchor('top')} style={webCursor as object}>
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
        {nav.links.map((link) => (
          <NavLink key={link.anchor} label={link.label} active={active === link.anchor} onPress={() => scrollToAnchor(link.anchor)} />
        ))}
        <AppButton label={nav.languageToggleLabel} onPress={toggleLocale} variant="pill" size="sm" />
        <AppButton label={nav.cta.label} onPress={() => scrollToAnchor(nav.cta.anchor)} variant="pillPrimary" size="sm" />
      </View>
    </Animated.View>
  );
}
```

- [ ] **Step 2: Verify types + build (logo bundled) + bundle hygiene**

```bash
npx tsc --noEmit
rm -rf dist && npx expo export -p web
grep -rl "logo" dist/_expo/static/media 2>/dev/null | head -1 && echo "logo asset bundled" || (ls dist/assets 2>/dev/null; echo "check logo output")
for c in $(grep -oE '_expo/static/js/web/[a-zA-Z0-9._-]+\.js' dist/index.html); do grep -q "firebaseapp.com\|initializeApp" "dist/$c" && echo "LEAK $c"; done; echo "home checked"
```
Expected: tsc PASS; build succeeds; the logo asset is emitted under `dist/_expo/static/media/` (or `dist/assets/`); no `LEAK`.
If `require('@/assets/images/logo.png')` fails to resolve in the build, replace it with the relative path `require('../../../../assets/images/logo.png')` (from `src/features/portfolio/components/` up to the repo root `assets/`) and rebuild.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/components/site-header.tsx
git commit -m "feat(portfolio): header logo + entrance animation + animated NavLinks (scroll-spy)"
```

---

### Task 3: Verification + deploy

**Files:** none

- [ ] **Step 1: Type check** — Run: `npx tsc --noEmit` — Expected: PASS.

- [ ] **Step 2: Browser check (local)**

`npm run web`, open the site:
- Logo shows to the left of the name; hovering the logo scales it slightly; clicking it scrolls to top.
- Hovering a nav link reveals an accent underline that grows from the left.
- Scrolling the page highlights the nav link of the current section (accent + underline).
- On load, the header fades in and slides down slightly.

- [ ] **Step 3: Deploy**

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$PWD/service-account.json"
npm run content:pull && npx expo export -p web
test -f dist/cv.pdf || cp public/cv.pdf dist/cv.pdf
firebase deploy --only hosting --project luisdelatorre-portfolio --non-interactive
```
Expected: deploy completes; the live header shows the logo + animations.

- [ ] **Step 4: Commit (only if fixes were needed)**

```bash
git add -A
git commit -m "fix(portfolio): logo/menu animation verification adjustments"
```

---

## Self-Review

- **Spec coverage:** logo asset + `<Image>` left of the name + hover micro-scale + click-to-top (T1/T2); `NavLink` animated underline (T1); `useActiveSection` scroll-spy over section nativeIDs (T1); header entrance via `Animated` (T2); web-only style-prop guards throughout; verify + deploy (T3). ✓
- **Placeholder scan:** none — full code; the require-path fallback is an explicit, concrete alternative, not a vague instruction.
- **Type consistency:** `NavLink({label,active,onPress})` (T1) used in `site-header` (T2); `useActiveSection(anchors): string | null` (T1) consumed as `active === link.anchor` (T2); `AppButton`/`scrollToAnchor` reused from `src/ui/` (interaction-polish base); the header outer style reproduces the existing responsive header (flexWrap/columnGap/rowGap/flexShrink) so mobile wrapping is preserved. ✓
