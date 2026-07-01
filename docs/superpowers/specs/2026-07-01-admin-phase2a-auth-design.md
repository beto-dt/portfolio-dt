# Admin Panel — Phase 2A (auth spine) Design

**Date:** 2026-07-01
**Status:** Approved (design)

## Goal

Stand up the admin backbone: a protected `/admin` route where the owner signs in
with Google and can load, edit, and save **one section (hero)** of the portfolio
content in Firestore — proving the whole auth → read → edit → write spine before
building every form.

This is **Phase 2A of Phase 2** (admin panel), decomposed as:
- **2A (this spec):** auth + `/admin` shell + hero edit/save end-to-end.
- **2B (later):** structured forms for all remaining sections (ES + EN).
- **2C (later):** "Publish" button → Cloud Function → triggers redeploy (Blaze).

## Decisions (agreed with user)

- Access: web admin with login, reachable from anywhere.
- Login: **Google Sign-In**, restricted to the owner (`luis.atorred24@gmail.com`).
- Location: **`/admin` route in the same Expo app**; Firebase client SDK loaded
  only there (dynamic import) so the public bundle stays clean.
- This phase edits **hero only**; saving persists to Firestore but does NOT
  publish to the live site (publish is 2C).

## Non-goals (2A)

- No "Publish" / redeploy trigger (2C). Saving only writes to Firestore.
- No forms beyond hero (2B).
- No Cloud Functions, no Blaze upgrade yet.

## Firebase web config (public)

Firebase web config is a project identifier, not a secret (security comes from
Firestore rules + authorized domains). Committed in the repo:

```
apiKey: AIzaSyBwuVUCyfUQKqKGhrYYqWxbFKMaKM6qNa0
authDomain: luisdelatorre-portfolio.firebaseapp.com
projectId: luisdelatorre-portfolio
storageBucket: luisdelatorre-portfolio.firebasestorage.app
messagingSenderId: 789944008050
appId: 1:789944008050:web:ec32700ba3238299e771eb
```

## Architecture

- **`firebase` client SDK** added as a runtime dependency, but imported ONLY via
  a dynamic `import()` from the admin screen, so the public route chunks don't
  include it. Verified by checking the public `index.html`/entry chunk excludes
  firebase.
- **Auth:** on `/admin`, if no session → "Sign in with Google"
  (`signInWithPopup(new GoogleAuthProvider())`). After sign-in, if
  `user.email !== ADMIN_EMAIL` → sign out + show "no autorizado". Client check is
  UX only; the real boundary is Firestore rules.
- **Content access:** the admin reads `content/es` and `content/en` from Firestore
  (client SDK), validates with `assertPortfolioContent`, edits the `hero` field,
  and writes back with a merge update.
- **Publish gap:** saving updates Firestore only; the live static site keeps
  serving the committed published JSON until a deploy. The UI states this
  explicitly ("Guardado en Firestore — publica para verlo en vivo").

## Security rules (Firestore)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /content/{doc} {
      allow read, write: if request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email == 'luis.atorred24@gmail.com';
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

Public site never reads Firestore at runtime; the build-time pull uses the Admin
SDK (bypasses rules). Only the owner can read/write `content/*`.

## File structure

```
src/
  admin/
    firebase-config.ts     # the public web config object
    firebase-client.ts     # lazy init: getFirebase() -> { app, auth, db } (dynamic-imported)
    admin-email.ts         # ADMIN_EMAIL constant
    auth.ts                # signInWithGoogle(), signOutAdmin(), onAdminAuthChanged()
    content-repo.ts        # loadContent(locale), saveSection(locale, key, value)
    screens/
      admin-screen.tsx     # login gate + hero editor + locale switch + save
    components/
      hero-form.tsx        # controlled form for HeroContent
  app/
    admin/
      index.tsx            # route /admin -> renders <AdminScreen/>
```

Reuses existing `src/content/types.ts` (`HeroContent`, `PortfolioContent`) and
`src/content/validate.ts` (`assertPortfolioContent`).

## Prerequisites (done by owner)

- Web App registered in Firebase (config above). ✓
- Google provider enabled in Authentication; authorized domains include
  `localhost`, `luisdelatorre.dev`, `luisdelatorre-portfolio.web.app`. ✓

## Error handling

- Sign-in popup dismissed/blocked → show a retry message.
- Non-admin account → immediate sign-out + "no autorizado".
- Firestore read invalid shape → `assertPortfolioContent` throws → show an error
  banner instead of a broken form.
- Save failure (rules/network) → show the error; keep the form editable.

## Verification

- `npx tsc --noEmit` passes.
- Public web export bundles with no errors and the public entry chunk does NOT
  include the Firebase SDK (dynamic import keeps it in the `/admin` chunk).
- `/admin`: Google sign-in with the owner account shows the hero editor; editing
  a hero field and Saving updates `content/es` (or `en`) in Firestore (verified in
  console).
- A non-owner account cannot write `content/*` (rules deny) — confirmed via rules
  playground or a denied write.
- Public live site is unchanged after a save (no publish yet).

## Implementation order

1. Add `firebase` dependency; `firebase-config.ts` + `admin-email.ts`.
2. `firebase-client.ts` lazy init.
3. `auth.ts` (Google sign-in/out + admin auth-state).
4. Update + deploy `firestore.rules` (owner-only on `content/*`).
5. `content-repo.ts` (load/save via client SDK).
6. `hero-form.tsx` + `admin-screen.tsx` (login gate + editor + locale switch).
7. `app/admin/index.tsx` route.
8. Verify (tsc, bundle hygiene, live sign-in + save, rules deny).
