# Section Order + Logo Favicon — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Colaboración renders immediately after Cómo trabajo, and the favicon becomes the rook logo.

**Architecture:** One JSX line moves in `portfolio-screen.tsx`; `assets/images/favicon.png` is regenerated from `logo.png` with `sips`. No other changes.

**Tech Stack:** Existing Expo web export (favicon configured in `app.json`, untouched). No test runner.

---

### Task 1: Move Colaboración + regenerate favicon

**Files:**
- Modify: `src/features/portfolio/portfolio-screen.tsx`
- Modify: `assets/images/favicon.png` (binary, regenerated)

- [ ] **Step 1: Reorder the section.** In `portfolio-screen.tsx`, delete the line

```tsx
        <TrackedSection id="collaboration"><CollaborationSection /></TrackedSection>
```

(currently before the contact line) and re-insert it immediately AFTER

```tsx
        <TrackedSection id="process"><ProcessSection /></TrackedSection>
```

- [ ] **Step 2: Regenerate the favicon.**

Run: `sips -z 48 48 assets/images/logo.png --out assets/images/favicon.png`
Expected: favicon.png is now a 48×48 render of the rook logo (verify with
`file assets/images/favicon.png` → `48 x 48`).

- [ ] **Step 3: Verify build.**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS; `dist/favicon.ico` regenerated from the new artwork.

- [ ] **Step 4: Commit.**

```bash
git add src/features/portfolio/portfolio-screen.tsx assets/images/favicon.png
git commit -m "feat(portfolio): colaboración after cómo trabajo + rook logo favicon"
```

---

### Task 2: Verify (browser) and deploy

- [ ] **Step 1: Preview.** Confirm the section order (Colaboración immediately
after Proceso, before Impacto) and that `http://localhost:8081/favicon.ico`
serves the rook artwork.

- [ ] **Step 2: Deploy.** PR flow as usual; after merge,
`gh workflow run deploy.yml --ref main` → watch → live check (favicon needs a
hard refresh; browsers cache it aggressively).

---

## Self-Review

**1. Spec coverage:** reorder (T1 S1) ✓ · favicon (T1 S2) ✓ · verify/deploy (T2) ✓.
**2. Placeholder scan:** none. **3. Type consistency:** single JSX line moved,
ids unchanged ✓.
