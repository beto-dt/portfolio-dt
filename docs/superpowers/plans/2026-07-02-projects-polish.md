# Projects Section Polish + Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the Proyectos cards the accent-glow hover-lift (reusing `GlowCard`), make the category chip + tech tags brighten on card hover, and stagger the heading + cards in on entrance — without changing the grid layout or content.

**Architecture:** `ProjectCard` swaps `HoverCard` → `GlowCard` and drives the chip/tags from the render-prop `hovered`. `projects-section.tsx` wraps the heading + each card in the existing `Reveal`, moving the card flex sizing to the `Reveal` wrapper so the grid (and bottom-pinned tags) is preserved.

**Tech Stack:** Expo Router + react-native-web, existing `GlowCard` + `Reveal`, Pressable hover state. No test runner in this repo.

**Verification note:** No jest/unit-test setup — do NOT add one. Verify with `npx tsc --noEmit` + `npx expo export -p web` + browser. Do NOT run `npx expo lint` (auto-scaffolds `eslint.config.js` + deps; discard if produced). If `dist/` appears it is gitignored — leave it, don't commit it.

---

### Task 1: `project-card.tsx` — GlowCard + hover-reactive chip/tags

**Files:**
- Modify: `src/features/portfolio/sections/projects/project-card.tsx` (full rewrite)

Swap `HoverCard` for `GlowCard` (render-prop `hovered`). The card fills its parent
(the `Reveal` wrapper from Task 2 carries the flex sizing), so it uses
`width: '100%', flexGrow: 1` and keeps `minHeight: 210` + `marginTop: 'auto'` so the
tech tags stay bottom-pinned. On hover the chip bg intensifies and the tag
borders/text brighten.

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/projects/project-card.tsx`**

```tsx
import { Platform, Text, View } from 'react-native';
import type { ProjectItem } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';

const chipTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color', transitionDuration: '180ms' } as object) : null;
const tagTransition = Platform.OS === 'web' ? ({ transitionProperty: 'border-color, color', transitionDuration: '180ms' } as object) : null;

export function ProjectCard({ item }: { item: ProjectItem }) {
  return (
    <GlowCard
      style={{
        width: '100%',
        flexGrow: 1,
        minHeight: 210,
        padding: 26,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        borderRadius: 18,
      }}
    >
      {(hovered) => (
        <>
          <View style={{ flexDirection: 'row', marginBottom: 16 }}>
            <View
              style={[
                {
                  backgroundColor: hovered ? 'rgba(228,227,87,0.2)' : 'rgba(228,227,87,0.12)',
                  borderRadius: radii.sm,
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                },
                chipTransition as object,
              ]}
            >
              <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>
                {item.category}
              </Text>
            </View>
          </View>

          <Text style={{ fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.21, color: colors.text, marginBottom: 10 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim }}>{item.description}</Text>

          {/* marginTop:'auto' pushes the tech tags to the bottom of the card */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 'auto', paddingTop: 20 }}>
            {item.tech.map((tech) => (
              <View
                key={tech}
                style={[
                  {
                    borderWidth: 1,
                    borderColor: hovered ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)',
                    borderRadius: radii.sm - 1,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                  },
                  tagTransition as object,
                ]}
              >
                <Text style={[{ fontFamily: fonts.mono, fontSize: 10.5, color: hovered ? colors.textDim : colors.textFainter }, tagTransition as object]}>
                  {tech}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}
    </GlowCard>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/sections/projects/project-card.tsx
git commit -m "feat(portfolio): project cards use GlowCard, chip + tags react on hover"
```

---

### Task 2: `projects-section.tsx` — staggered `Reveal` entrance (grid preserved)

**Files:**
- Modify: `src/features/portfolio/sections/projects/projects-section.tsx` (full rewrite)

Wrap the heading in `Reveal` (`delay 0`) and each card in `Reveal` (`delay i*70`)
carrying the grid flex sizing (`flexGrow: 1, flexBasis: 340, minWidth: 300`). Keep
row `gap: 16` + `flexWrap`.

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/projects/projects-section.tsx`**

```tsx
import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ProjectCard } from './project-card';
import { useI18n } from '@/i18n/i18n-provider';
import { Reveal } from '@/ui/reveal';

export function ProjectsSection() {
  const { content } = useI18n();
  const { projects } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="projects">
      <Reveal delay={0}>
        <SectionHeading kicker={projects.kicker} heading={projects.heading} />
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {projects.items.map((item, i) => (
          <Reveal key={item.title} delay={i * 70} style={{ flexGrow: 1, flexBasis: 340, minWidth: 300 }}>
            <ProjectCard item={item} />
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
git add src/features/portfolio/sections/projects/projects-section.tsx
git commit -m "feat(portfolio): staggered reveal entrance for projects (grid preserved)"
```

---

### Task 3: Verify (build + bundle hygiene + browser) and deploy

**Files:** none (verification + deploy).

- [ ] **Step 1: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful export.

- [ ] **Step 2: Bundle hygiene**

Run: `grep -rl "initializeApp\|firebase/auth" dist/_expo/static/js/web | grep -v firebase-client || echo "clean"`
Expected: `clean`.

- [ ] **Step 3: Browser verification (preview tools)**

Start/reuse the `web` preview, scroll to the Proyectos section, and confirm:
- **At rest:** grid looks identical (same cards, chips, tags bottom-pinned,
  wrapping). `preview_screenshot`.
- **Card hover:** hovering a card lifts it with an accent border/glow; its chip bg
  intensifies and its tag borders/text brighten (headless RNW hover may be
  unreliable — confirm mechanism by code, same `GlowCard` as Services; verify live).
- **Entrance:** heading + cards fade/slide in staggered on reload.
- **Grid unchanged:** wrapping + card heights match at mobile (375) + desktop.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 4: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live.

---

## Self-Review

**1. Spec coverage:**
- Cards use `GlowCard` (lift + accent glow) → Task 1 ✓
- Chip bg intensifies + tag borders/text brighten on card hover (via `hovered`) →
  Task 1 ✓
- Staggered `Reveal` entrance, grid + bottom-pinned tags preserved → Task 2 ✓
- Verify + deploy → Task 3 ✓
- Non-goals honored: no layout/content/type-size change; no per-tag hover; no
  `onPress`; `SectionHeading` wrapped not edited; `HoverCard` untouched ✓
No gaps.

**2. Placeholder scan:** No TBD/TODO; complete code in every code step. ✓

**3. Type consistency:**
- `GlowCard({ style?, children })` with `children: (hovered: boolean) => ReactNode`
  — used with `{(hovered) => (…)}` in Task 1 ✓.
- `ProjectCard({ item })` API unchanged; `projects-section.tsx` calls
  `<ProjectCard item={item} />` inside `Reveal` ✓.
- `Reveal({ children, delay?, slide?, style? })` — used with `delay` + `style`
  (default slide) in Task 2 ✓.
- `ProjectItem` fields (`category`, `title`, `description`, `tech`) all match ✓.
- Grid sizing: old card had `flexGrow:1, flexBasis:340, minWidth:300, minHeight:210`;
  Task 2 moves `flexBasis:340, minWidth:300` to the `Reveal` wrapper and Task 1
  keeps `flexGrow:1, width:'100%', minHeight:210` on the card → equivalent layout,
  bottom-pinned tags preserved ✓.
