# Responsive Grids Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** No horizontal overflow on narrow screens: grid tracks shrink below their minimum via `min(100%, Xpx)` in all six section grids, and the contact card's padding adapts to the viewport.

**Architecture:** One-line CSS string changes in the existing `gridWeb` casts + a `useWindowDimensions`-driven padding in `ContactSection`. No layout redesign.

**Tech Stack:** Existing web-cast pattern; `useWindowDimensions` from react-native. No test runner.

---

### Task 1: Grid guards + contact padding

**Files:**
- Modify: `src/features/portfolio/sections/contact/contact-section.tsx`
- Modify: `src/features/portfolio/sections/formation/formation-section.tsx`
- Modify: `src/features/portfolio/sections/projects/projects-section.tsx`
- Modify: `src/features/portfolio/sections/process/process-section.tsx`
- Modify: `src/features/portfolio/sections/stack/stack-section.tsx`
- Modify: `src/features/portfolio/sections/impact/impact-section.tsx`

- [ ] **Step 1: Replace the minmax minimums (one line each):**

| File | old | new |
|---|---|---|
| contact | `minmax(380px, 1fr)` | `minmax(min(100%, 380px), 1fr)` |
| formation | `minmax(460px, 1fr)` | `minmax(min(100%, 460px), 1fr)` |
| projects | `minmax(300px, 1fr)` | `minmax(min(100%, 300px), 1fr)` |
| process | `minmax(230px, 1fr)` | `minmax(min(100%, 230px), 1fr)` |
| stack | `minmax(240px, 1fr)` | `minmax(min(100%, 240px), 1fr)` |
| impact | `minmax(160px, 1fr)` | `minmax(min(100%, 160px), 1fr)` |

- [ ] **Step 2: Contact card width-aware padding.** In `contact-section.tsx`:
add `useWindowDimensions` to the react-native import; inside `ContactSection`
add `const { width } = useWindowDimensions(); const compact = width < 640;` and
change the card style object from `padding: 44` / `borderRadius: 24` to
`padding: compact ? 22 : 44` / `borderRadius: compact ? 18 : 24`.

- [ ] **Step 3: Verify build.** `npx tsc --noEmit && npx expo export -p web` → PASS.

- [ ] **Step 4: Commit.**

```bash
git add src/features/portfolio/sections/
git commit -m "fix(portfolio): responsive grid tracks (min(100%, X)) + adaptive contact card padding"
```

---

### Task 2: Verify (measured) and deploy

- [ ] **Step 1: Preview at 360/375/577/1280.** Assert per width:
`document.scrollingElement.scrollWidth <= window.innerWidth` (no page overflow)
and the contact card fits (`getBoundingClientRect().right <= innerWidth`);
wizard remains usable at 360 (inputs full-width, chips wrap, calendar 7 cols);
desktop 1280 unchanged (contact 2 columns, formation 2 columns).

- [ ] **Step 2: Deploy.** PR flow; after merge `gh workflow run deploy.yml --ref
main` → watch → live check on a phone-sized viewport.

---

## Self-Review

**1. Spec coverage:** six grid guards (T1 S1) ✓ · adaptive padding/radius (T1 S2)
✓ · measured verification + deploy (T2) ✓. **2. Placeholders:** none.
**3. Consistency:** the six files' `gridWeb` strings match the current code
(values 380/460/300/230/240/160) ✓; `compact` used only in the card style ✓.
