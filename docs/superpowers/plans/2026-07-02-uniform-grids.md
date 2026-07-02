# Uniform Grid Columns + Experience Spacing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Uniform column widths (last row never stretches) in Impacto, Stack and Proyectos via web-cast CSS Grid — with a lighter filler cell in Impacto — plus wider description lines and more vertical air in the Experiencia timeline.

**Architecture:** Each grid container gains a web-only `display: grid` + `gridTemplateColumns: repeat(auto-fill, minmax(X, 1fr))` cast appended to its style array (same `Platform.OS === 'web' … as object` boundary pattern already shipped for boxShadow/transitions). Existing flexWrap props stay as the native fallback; `Reveal` wrappers become grid items (their flex props are ignored on web). Impacto appends one `gridColumn: 'auto / -1'` filler cell.

**Tech Stack:** react-native-web style pass-through (CSS Grid), existing components untouched otherwise. No test runner in this repo.

**Verification note:** No jest — verify with `npx tsc --noEmit`, `npx expo export -p web`, and the browser preview (computed `display === 'grid'`, equal card widths across rows). Do NOT run `npx expo lint`. `dist/` is gitignored — leave it.

---

### Task 1: Impacto — grid + lighter filler cell

**Files:**
- Modify: `src/features/portfolio/sections/impact/impact-section.tsx`

- [ ] **Step 1: Add the web-only grid casts**

After the existing `cellTransition` const, add:

```ts
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' } as object)
  : null;
// Spans the leftover columns of the grid's last row (mock's lighter filler panel).
const fillerWeb = Platform.OS === 'web' ? ({ gridColumn: 'auto / -1' } as object) : null;
```

- [ ] **Step 2: Apply the grid to the hairline container and append the filler**

The container + map currently read:

```tsx
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 1,
          backgroundColor: colors.border,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        {impact.items.map((item, i) => (
          <Reveal key={item.label} slide={false} delay={i * 70} style={{ flexGrow: 1, flexBasis: 180, minWidth: 160 }}>
            <ImpactCell item={item} />
          </Reveal>
        ))}
      </View>
```

Replace with:

```tsx
      <View
        style={[
          {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 1,
            backgroundColor: colors.border,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
            overflow: 'hidden',
          },
          gridWeb as object,
        ]}
      >
        {impact.items.map((item, i) => (
          <Reveal key={item.label} slide={false} delay={i * 70} style={{ flexGrow: 1, flexBasis: 180, minWidth: 160 }}>
            <ImpactCell item={item} />
          </Reveal>
        ))}
        {Platform.OS === 'web' ? (
          <View pointerEvents="none" style={[{ backgroundColor: '#101218' }, fillerWeb as object]} />
        ) : null}
      </View>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/portfolio/sections/impact/impact-section.tsx
git commit -m "feat(portfolio): impact grid with uniform columns + lighter filler cell"
```

---

### Task 2: Stack + Proyectos — uniform grid columns

**Files:**
- Modify: `src/features/portfolio/sections/stack/stack-section.tsx`
- Modify: `src/features/portfolio/sections/projects/projects-section.tsx`

- [ ] **Step 1: Stack — add the cast and apply it**

In `stack-section.tsx`, add `Platform` to the react-native import
(`import { Platform, Text, View } from 'react-native';`) and add after the
imports:

```ts
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' } as object)
  : null;
```

Change the cards row from:

```tsx
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
```

to:

```tsx
      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, gridWeb as object]}>
```

(The `Reveal` wrappers keep their flex sizing — native fallback, ignored as grid
items.)

- [ ] **Step 2: Proyectos — same pattern**

In `projects-section.tsx`, add `Platform` to the react-native import
(`import { Platform, View } from 'react-native';`) and add after the imports:

```ts
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' } as object)
  : null;
```

Change the cards row from:

```tsx
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
```

to:

```tsx
      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, gridWeb as object]}>
```

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/features/portfolio/sections/stack/stack-section.tsx src/features/portfolio/sections/projects/projects-section.tsx
git commit -m "feat(portfolio): uniform grid columns for stack and projects (no last-row stretch)"
```

---

### Task 3: Experiencia — wider description + more air

**Files:**
- Modify: `src/features/portfolio/sections/experience/experience-item.tsx`

- [ ] **Step 1: Two value changes**

In the entry row style, change `paddingBottom: 34` to `paddingBottom: 48`.
In the description `Text` style, change `maxWidth: 560` to `maxWidth: 680`.

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful `dist` export.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/sections/experience/experience-item.tsx
git commit -m "feat(portfolio): experience timeline breathing room (wider text, taller entries)"
```

---

### Task 4: Verify (browser widths) and deploy

**Files:** none.

- [ ] **Step 1: Type-check + build + hygiene**

Run: `npx tsc --noEmit && npx expo export -p web`, then
`grep -rl "initializeApp\|firebase/auth" dist/_expo/static/js/web | grep -v firebase-client || echo "clean"`
Expected: PASS + `clean`.

- [ ] **Step 2: Browser verification (preview tools, desktop viewport)**

- `preview_eval`: for each of the three grid containers assert
  `getComputedStyle(el).display === 'grid'`, and compare
  `getBoundingClientRect().width` of a first-row card vs a last-row card —
  they must be equal (±1px). For Impacto also confirm the filler element exists
  after the `−45%` cell and its computed `background-color` is `rgb(16, 18, 24)`.
- `preview_screenshot` of Impacto + Stack + Proyectos: last rows keep column
  width; Impacto shows the lighter filler.
- Experiencia: description wraps at ~680px and entries have taller spacing;
  timeline line continuous.
- Mobile (375): grids collapse to 1 column cleanly.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 3: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live.

---

## Self-Review

**1. Spec coverage:**
- Impacto grid (`minmax(160px,1fr)`, hairline intact) + filler `auto / -1` bg
  `#101218` `pointerEvents="none"` → Task 1 ✓
- Stack grid `minmax(240px,1fr)` / Proyectos grid `minmax(300px,1fr)`; flex props
  kept as native fallback → Task 2 ✓
- Experiencia `maxWidth 680` + `paddingBottom 48` → Task 3 ✓
- Verification incl. computed-display and width-equality assertions + deploy →
  Task 4 ✓
- Non-goals honored: no content/CMS/primitive changes; Servicios/Proceso/
  Colaboración untouched ✓
No gaps.

**2. Placeholder scan:** none; every step shows exact code/values. ✓

**3. Type consistency:** `gridWeb`/`fillerWeb` consts follow the existing
web-cast pattern; `Platform` import additions specified where missing (stack,
projects — impact already imports it); no API changes anywhere. ✓
