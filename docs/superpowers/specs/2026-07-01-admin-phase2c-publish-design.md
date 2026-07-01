# Admin Panel — Phase 2C (Publish button) Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Add a "Publish" button to `/admin` that takes the content currently in Firestore
live on the static site. The button calls a secure Cloud Function (admin-only)
that triggers a GitHub Actions workflow which pulls Firestore content, builds, and
deploys to Firebase Hosting.

This is **Phase 2C of Phase 2** (admin panel). 2A (auth + hero editor) is done;
2B (forms for all sections) comes after.

## Decisions (agreed with user)

- Publish = instant, via a Cloud Function that triggers CI (not the function
  doing the build itself).
- CI authenticates to Firestore (pull) and Firebase Hosting (deploy) with the
  **same service account** (one GitHub secret); the SA gets the "Firebase Hosting
  Admin" role.
- Publish UX = **fire-and-notify**: "Publicación iniciada (~2-3 min)" + a link to
  the GitHub Actions run.
- Requires upgrading the Firebase project to the **Blaze** plan (Cloud Functions).

## Non-goals (2C)

- No auto-deploy on every push to `main` (dispatch only via the button / manual
  GitHub run).
- The CI does not commit the pulled JSON back to `main` (the committed
  `published/*.json` may lag Firestore; it serves local dev only).
- No live status polling (fire-and-notify only).
- No new content forms (that is 2B).

## Architecture

```
/admin [Publicar]
  → callable Cloud Function `publish` (verifies admin auth)
  → GitHub REST: workflow_dispatch(deploy.yml, ref=main)
  → GitHub Actions deploy.yml:
       npm ci → content:pull (Firestore) → expo export -p web → firebase deploy --only hosting
  → live site (luisdelatorre.dev) updated
```

## Components

### 1. Deploy workflow — `.github/workflows/deploy.yml`
- Trigger: `workflow_dispatch` (button + manual runs).
- Steps: checkout → setup-node (20) → `npm ci` → write the service account JSON
  from secret `GCP_SA_KEY` to a file and export `GOOGLE_APPLICATION_CREDENTIALS`
  → `npm run content:pull` → `npx expo export -p web` →
  `npx firebase deploy --only hosting --project luisdelatorre-portfolio`.
- Auth: the same SA JSON is used for both the Firestore pull and the Firebase
  Hosting deploy (SA has Hosting Admin role).

### 2. Cloud Function — `functions/` (Firebase Functions gen2, TypeScript)
- Callable `publish` (region `us-central1`):
  - Reject if `request.auth` is missing, or
    `request.auth.token.email !== 'luis.atorred24@gmail.com'`, or
    `email_verified !== true` → `HttpsError('permission-denied')`.
  - `POST https://api.github.com/repos/beto-dt/portfolio-dt/actions/workflows/deploy.yml/dispatches`
    with body `{ ref: 'main' }`, headers `Authorization: Bearer <GITHUB_TOKEN>`,
    `Accept: application/vnd.github+json`.
  - On 204 → return `{ ok: true, actionsUrl: 'https://github.com/beto-dt/portfolio-dt/actions/workflows/deploy.yml' }`.
  - On non-204 → `HttpsError('internal', ...)` with the status.
- Secret: `GITHUB_TOKEN` via Firebase Secret Manager (`functions:secrets:set`).
- `functions/` is its own package (own `package.json`, `tsconfig.json`); add a
  `functions` block to `firebase.json`.

### 3. Admin "Publish" button — in `src/admin/`
- Add `callPublish()` to the lazy Firebase module (`firebase/functions`
  `httpsCallable`), keeping Firebase admin-only and out of the public bundle.
- In `admin-screen.tsx`, a "Publicar" button: on click → `callPublish()` →
  show "Publicación iniciada (~2-3 min)" + a link to `actionsUrl`; on error show
  the message.

## Prerequisites (manual, owner)

- Upgrade the Firebase project to **Blaze** (with a budget alert).
- Grant the service account the **Firebase Hosting Admin** role.
- GitHub repo secret **`GCP_SA_KEY`** = full contents of `service-account.json`.
- Firebase Function secret **`GITHUB_TOKEN`** = a fine-grained PAT scoped to
  `beto-dt/portfolio-dt` with **Actions: read and write** permission.

## Error handling

- Function: unauthorized caller → `permission-denied`; GitHub API failure →
  `internal` with status; missing `GITHUB_TOKEN` → `failed-precondition`.
- Admin UI: surfaces the error text; button re-enabled after completion/failure.
- Workflow: any step failing fails the run (no partial deploy); the SA file is
  written only within the job and never logged.

## Verification

- `npx tsc --noEmit` passes (admin app + functions).
- The `functions/` project builds (`npm --prefix functions run build`).
- Manual (controller, via `gh`): dispatch `deploy.yml` → run succeeds → the live
  site reflects the current Firestore content.
- Manual (owner): in `/admin`, edit hero → **Publicar** → "iniciada" + link;
  after the run, `luisdelatorre.dev` shows the change.
- A non-admin calling `publish` is rejected (permission-denied).

## Implementation order

1. `deploy.yml` workflow (dispatchable) — merge to main so it is dispatchable.
2. `functions/` project scaffold (package.json, tsconfig, src/index.ts with the
   `publish` callable) + `firebase.json` functions config.
3. Admin `callPublish()` in the lazy module + "Publicar" button in admin-screen.
4. Deploy the function + set the `GITHUB_TOKEN` secret (after Blaze + SA role).
5. Verify (tsc, functions build, dispatch run, button publish, non-admin reject).
