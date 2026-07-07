# Blog Feedback: Ratings + Moderated Comments — Design

**Date:** 2026-07-06
**Status:** Approved (design)

## Goal

Each blog post gets a 5-star rating ("¿Te sirvió este artículo?") and a
comments section. Ratings aggregate live; comments are **moderated** (pending
until Luis approves them in the admin) and each new comment emails Luis. The
public site keeps its golden rule: it never talks to Firestore — everything
flows through a new Cloud Function behind `/api/feedback`.

## Decisions (agreed with user)

- **5 stars** with average + count shown; one vote per reader (localStorage
  guard client-side + per-IP-per-post guard server-side via salted hash — raw
  IPs are never stored).
- **Moderation**: comments enter as `pending`, appear publicly only after
  approval from the admin Blog tab.
- **Email notification** on each new comment, reusing the booking Gmail
  transport (extracted to a shared `functions/src/mailer.ts` to avoid Sonar
  duplication).
- Feedback data is **live** (fetched on post-page mount), not baked at build.
- UI strings hardcoded ES/EN in-component (same convention as the blog chrome).

## Architecture

### Firestore

- `feedback/{slug}`: `{ ratingSum: number, ratingCount: number }` — updated in
  a transaction.
- `feedback/{slug}/votes/{ipHash}`: `{ createdAt }` — vote dedup marker.
  `ipHash = sha256(ip + '|' + slug + '|' + SALT)` where SALT is a constant in
  the function source (privacy: unlinkable without the salt, no raw IPs).
- `comments/{id}` (flat collection): `{ slug, name, message, status:
  'pending' | 'approved', createdAt, ipHash }`.
- Rules (before deny-all): `feedback/{doc=**}` — owner read only, writes
  false; `comments/{doc}` — owner read/update/delete, create false. The
  function writes via Admin SDK (bypasses rules).

### Cloud Function `postFeedback` (`functions/src/index.ts`)

`onRequest({ region: 'us-central1', cors: true, secrets: [GMAIL_APP_PASSWORD] })`,
hosting rewrite `"/api/feedback"`.

- **GET `?slug=<slug>`** → 200 `{ rating: { avg, count }, comments:
  [{ id, name, message, createdAt }] }`.
  - `avg = ratingCount ? round(ratingSum / ratingCount * 10) / 10 : 0`.
  - Comments: `comments` where `slug ==` (single-field query), filtered to
    `status === 'approved'` in code (avoids composite index), sorted
    `createdAt asc`, capped at 100; `createdAt` serialized `YYYY-MM-DD`.
- **POST `{ type: 'rating', slug, stars }`**:
  - Validate: `slug` matches `/^[a-z0-9-]{1,80}$/`, `stars` integer 1–5,
    `posts/{slug}` exists and `status === 'published'` → else 400/404.
  - Vote guard: if `feedback/{slug}/votes/{ipHash}` exists → 409
    `{ error: 'already_rated' }`.
  - Transaction: create vote marker + increment `ratingSum`/`ratingCount`
    (creating `feedback/{slug}` if missing). → 200 `{ rating: { avg, count } }`.
- **POST `{ type: 'comment', slug, name, message }`**:
  - Validate: slug as above + post exists; `name` trimmed 1–60 chars;
    `message` trimmed 1–1000 chars → else 400.
  - Throttle: max 3 comments per ipHash per post per day (count query on
    `comments` where `slug ==` + filter ipHash/date in code) → 429.
  - Create doc `status: 'pending'`; send email via shared mailer (subject
    `Nuevo comentario en /blog/{slug}`, body: name, message, link to admin).
    Email failure logs but still returns 200 (comment saved). → 200
    `{ ok: true }`.
- IP source: `req.headers['x-forwarded-for']` first value, fallback
  `req.ip ?? 'unknown'`.

### Shared mailer (`functions/src/mailer.ts`)

```ts
export function createMailer(pass: string) { /* nodemailer SMTPS smtp.gmail.com:465, user ADMIN_EMAIL */ }
export async function sendAdminEmail(pass: string, subject: string, text: string, replyTo?: string) { … }
```

`submitBooking` refactors to use it (same transport values — behavior
unchanged); `postFeedback` uses it for comment notifications.

### Public — post page (`blog-post-page.tsx` + new `post-feedback.tsx`)

`src/features/portfolio/sections/blog/post-feedback.tsx`, rendered after the
`<Markdown/>` and before the closing back-link:

- On mount: `GET /api/feedback?slug=` → state `{ rating, comments }` (fetch
  errors → section renders with zeros; never blocks the article).
- **Rating block**: divider; title ES `¿Te sirvió este artículo?` / EN
  `Was this article useful?`; 5 pressable stars (outline `☆` textFaint →
  hover/selected `★` accent); after voting (or if `localStorage
  'rated:'+slug`): stars frozen at the reader's vote + text `Gracias ⭐ {avg} ·
  {count} votos` / `Thanks ⭐ {avg} · {count} votes`; before voting shows
  `{avg} · {count}` small when count > 0. POST on click; 409 → treat as
  already-voted.
- **Comments block**: heading `Comentarios ({n})` / `Comments ({n})`; each:
  name (display 14.5) + date (mono 11 faint) + message (14/22 textMuted) in a
  surface card; empty → ES `Sé el primero en comentar.`
- **Form**: FormInput-style fields (name + multiline message, same visual
  language as the contact wizard inputs), `AppButton` `Comentar`/`Comment`;
  client validation (both non-empty); success replaces the form with ES
  `Gracias — tu comentario aparecerá cuando sea aprobado.`; error → ES
  `No se pudo enviar. Intenta de nuevo.` (429 → `Demasiados comentarios por
  hoy.`).

### Admin — moderation (in `PostsView`)

- `posts-repo.ts` gains: `listPendingComments(): Promise<PostComment[]>`
  (`comments` where `status == 'pending'`, sorted createdAt asc),
  `approveComment(id)`, `deleteComment(id)` — via `firebase-client.ts`
  (`readPendingComments`, `updateCommentStatus`, `deleteCommentDoc`).
  `PostComment = { id, slug, name, message, createdAt: string }` in
  `posts-types.ts`.
- `PostsView` list mode gains a **"Comentarios pendientes (N)"** block above
  the posts list (only when N > 0): each pending comment in a surface card —
  `{name} · /blog/{slug} · {fecha}` (mono faint) + message + `Aprobar`
  (AccentButton) + `Eliminar` (HoverLink red, two-tap confirm like posts).
  Approve/delete update the list optimistically.

### Hosting

`firebase.json` rewrites gains `{ "source": "/api/feedback", "function":
{ "functionId": "postFeedback", "region": "us-central1" } }`.

## Error handling

- GET for a slug with no feedback → zeros/empty (no 404: the post page always
  renders).
- Function validates everything server-side; the client never trusts its own
  state (double-vote → 409 handled gracefully).
- Email failure never loses the comment (logged, 200 returned).
- Public fetch failures degrade silently (article remains readable).

## Testing / verification

- tsc + functions build + export + hygiene (feedback flows add NO firebase to
  the public bundle — fetch only).
- Preview: post page shows rating block + empty comments + form; stars
  clickable (POST fires — verified via fetch interception in headless);
  comment form posts and shows the pending message. Admin moderation verified
  live post-deploy (auth required), igual que Solicitudes en su momento.
- Deploy: `firebase deploy --only functions:postFeedback,functions:submitBooking,firestore:rules`
  + hosting rewrite via el workflow (deploy.yml solo hace hosting — el rewrite
  requiere `firebase deploy --only hosting`? No: firebase.json va en el repo y
  el workflow ya despliega hosting con él). Live: GET/POST reales contra
  /api/feedback, votar el post de Firebase, comentar, aprobar en admin, ver el
  comentario publicado.

## Implementation order

1. Mailer compartido + función `postFeedback` + rules + rewrite.
2. Tipos + repos admin (pending comments).
3. UI pública `PostFeedback` en la página del post.
4. Moderación en `PostsView`.
5. Verify + deploy (functions + rules) + PR + live end-to-end.
