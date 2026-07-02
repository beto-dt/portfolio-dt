# Education Section Polish + Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add hover-highlight education rows (like Certifications), hover-reactive language chips, and a staggered fade-in entrance to the Educación section — no layout/content changes to the rows.

**Architecture:** `EduRow` (hover `Pressable`) and `LangChip` (hover `Pressable`) sub-components; the section maps rows inside `Reveal` wrappers and puts the languages block in its own `Reveal`. Single file.

**Tech Stack:** Expo Router + react-native-web, existing `Reveal`, Pressable hover state. No test runner in this repo.

**Verification note:** No jest/unit-test setup — do NOT add one. Verify with `npx tsc --noEmit` + `npx expo export -p web` + browser. Do NOT run `npx expo lint` (auto-scaffolds `eslint.config.js` + deps; discard if produced). If `dist/` appears it is gitignored — leave it.

---

### Task 1: `education-section.tsx` — hover rows + language chips + staggered entrance

**Files:**
- Modify: `src/features/portfolio/sections/education/education-section.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/education/education-section.tsx`**

```tsx
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import type { EducationItem, LanguageItem } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const rowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '160ms' } as object) : null;
const textTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const markerTransition = Platform.OS === 'web' ? ({ transitionProperty: 'opacity', transitionDuration: '160ms' } as object) : null;
const chipTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '150ms' } as object) : null;

/** An education row that highlights on hover (decorative — not a link). */
function EduRow({ item }: { item: EducationItem }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          position: 'relative',
          paddingVertical: 12,
          gap: 3,
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
          <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>{item.title}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 13.5, color: colors.accent }}>{item.institution}</Text>
            <Text style={[{ fontFamily: fonts.mono, fontSize: 11.5, color: hovered ? colors.textDim : colors.textFaint }, textTransition as object]}>
              {item.period}
            </Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

/** A language/level chip that brightens on hover (decorative — not a link). */
function LangChip({ item }: { item: LanguageItem }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          flexDirection: 'row',
          gap: 8,
          alignItems: 'baseline',
          backgroundColor: hovered ? colors.borderStrong : colors.surfaceStrong,
          borderWidth: 1,
          borderColor: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
          borderRadius: radii.sm + 1,
          paddingHorizontal: 11,
          paddingVertical: 6,
        },
        chipTransition as object,
      ]}
    >
      <Text style={{ fontSize: 14, color: colors.text }}>{item.language}</Text>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{item.level}</Text>
    </Pressable>
  );
}

export function EducationSection() {
  const { content } = useI18n();
  const { education } = content;
  const langDelay = (education.items.length + 1) * 70;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={education.kicker} heading={education.heading} />
      </Reveal>
      <View style={{ gap: 24 }}>
        <View>
          {education.items.map((item, i) => (
            <Reveal key={item.title} delay={(i + 1) * 70}>
              <EduRow item={item} />
            </Reveal>
          ))}
        </View>
        <Reveal delay={langDelay} style={{ gap: 10 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>
            {education.languagesHeading}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {education.languages.map((l) => (
              <LangChip key={l.language} item={l} />
            ))}
          </View>
        </Reveal>
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
git add src/features/portfolio/sections/education/education-section.tsx
git commit -m "feat(portfolio): education rows hover + language chips + staggered reveal"
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

Start/reuse the `web` preview, scroll to the Educación section, and confirm:
- **At rest:** education rows look identical (title, institution accent, period);
  languages now render as chips (bg + border). `preview_screenshot`.
- **Row hover:** hovering a row adds a subtle bg, brighter divider + period, and
  the left accent marker (headless RNW hover may be unreliable — confirm by code /
  live).
- **Chip hover:** hovering a language chip brightens its bg/border.
- **Entrance:** heading + rows + languages block fade/slide in staggered on reload.
- **Layout:** no text shift in rows; verify at mobile (375) + desktop.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 4: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live.

---

## Self-Review

**1. Spec coverage:**
- Education rows hover-highlight (bg, brighter period/divider, accent marker) →
  Task 1 (`EduRow`) ✓
- Languages → hover-reactive chips → Task 1 (`LangChip`) ✓
- Staggered entrance (heading, rows, languages block) → Task 1 ✓
- Verify + deploy → Task 2 ✓
- Non-goals honored: no content/type-size change; no hyperlinks; `SectionHeading`
  wrapped not edited; other sections untouched ✓
No gaps.

**2. Placeholder scan:** No TBD/TODO; complete code in the code step. ✓

**3. Type consistency:**
- `EducationItem = { title, institution, period }`, `LanguageItem = { language,
  level }` from `@/content/types`; fields used match ✓.
- `Reveal({ children, delay?, slide?, style? })` — used with `delay` + `style`
  (`gap: 10` on the languages block), default slide ✓.
- Stagger math: heading `delay 0`, rows `(i+1)*70`, languages `(items.length+1)*70`
  (continues after the last row) ✓.
- Rest-state row styles (title display 16, institution accent, period `textFaint`,
  divider `0.07`) match the current file ✓.
