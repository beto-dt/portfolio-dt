# Blog Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5-star ratings + moderated comments on every blog post, served live through a new `postFeedback` Cloud Function (`/api/feedback`), with moderation + email notification for Luis.

**Architecture:** Shared `functions/src/mailer.ts` (booking refactors onto it); `postFeedback` handles GET (aggregates + approved comments), POST rating (transactional, 1/IP-hash) and POST comment (pending + email); Firestore rules owner-only; public `PostFeedback` component fetches at mount; `PostsView` gains a pending-comments moderation block.

**Tech Stack:** Existing patterns (onRequest + rewrite, dynamic firebase-client, tokens). No new deps.

**Verification note:** No jest. Verify with `npx tsc --noEmit`, `npm --prefix functions run build`, `npx expo export -p web`, hygiene grep, preview con interceptación de fetch. Do NOT run `npx expo lint`.

---

### Task 1: Mailer compartido + función `postFeedback` + rules + rewrite

**Files:**
- Create: `functions/src/mailer.ts`
- Modify: `functions/src/index.ts` (imports, ADMIN_EMAIL, submitBooking email block, nueva función)
- Modify: `firestore.rules`, `firebase.json`

- [ ] **Step 1: Create `functions/src/mailer.ts`:**

```ts
import nodemailer from 'nodemailer';

export const ADMIN_EMAIL = 'luis.atorred24@gmail.com';

/**
 * Sends a notification email to the admin inbox. Explicit SMTPS (TLS on 465) —
 * same endpoint the 'gmail' shorthand uses, spelled out so the transport is
 * verifiably encrypted (Sonar S5332).
 */
export function sendAdminEmail(pass: string, subject: string, text: string, replyTo?: string): Promise<unknown> {
  const transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user: ADMIN_EMAIL, pass },
  });
  return transport.sendMail({ from: `Portfolio <${ADMIN_EMAIL}>`, to: ADMIN_EMAIL, replyTo, subject, text });
}
```

- [ ] **Step 2: In `functions/src/index.ts`:**
  - Add `import { createHash } from 'node:crypto';` and `import { ADMIN_EMAIL, sendAdminEmail } from './mailer';`.
  - Remove the local `const ADMIN_EMAIL = …` and the `import nodemailer from 'nodemailer';` line (grep first: if `nodemailer` has no other use after Step 3, drop it).
  - **Refactor submitBooking's email block** — replace the whole `const transport = nodemailer.createTransport({...}); await transport.sendMail({...});` with:

```ts
      await sendAdminEmail(
        GMAIL_APP_PASSWORD.value(),
        `Nueva solicitud — ${name} · ${date} ${time}`,
        [
          `Nombre: ${name}`,
          `Email: ${email}`,
          `Tipo: ${projectType || '—'}`,
          `Presupuesto: ${budget || '—'}`,
          `Modelo: ${model || '—'}`,
          `Fecha: ${date} ${time} (GMT-5)`,
          `Idioma: ${locale}`,
          '',
          'Mensaje:',
          message || '—',
        ].join('\n'),
        email,
      );
```

  (el `try/catch` con `emailed = false` y el comentario S5332 del bloque viejo se van con él — el comentario vive ahora en mailer.ts).

- [ ] **Step 3: Add `postFeedback` at the end of `functions/src/index.ts`:**

```ts
const FEEDBACK_SALT = 'ldt-feedback-v1';
const SLUG_RE = /^[a-z0-9-]{1,80}$/;

function feedbackIpHash(forwarded: string | undefined, fallbackIp: string | undefined, slug: string): string {
  const ip = forwarded?.split(',')[0]?.trim() || fallbackIp || 'unknown';
  return createHash('sha256').update(`${ip}|${slug}|${FEEDBACK_SALT}`).digest('hex');
}

type StoredComment = { name: string; message: string; status: string; ipHash?: string; createdAt?: { toDate?: () => Date } };

function commentDay(c: StoredComment): string {
  return c.createdAt?.toDate ? c.createdAt.toDate().toISOString().slice(0, 10) : '';
}

export const postFeedback = onRequest(
  { secrets: [GMAIL_APP_PASSWORD], region: 'us-central1', cors: true },
  async (req, res) => {
    try {
      if (req.method === 'GET') {
        const slug = String(req.query.slug ?? '');
        if (!SLUG_RE.test(slug)) {
          res.status(400).json({ error: 'bad_slug' });
          return;
        }
        const [fbSnap, commentsSnap] = await Promise.all([
          db.doc(`feedback/${slug}`).get(),
          db.collection('comments').where('slug', '==', slug).get(),
        ]);
        const sum = (fbSnap.data()?.ratingSum as number) ?? 0;
        const count = (fbSnap.data()?.ratingCount as number) ?? 0;
        const comments = commentsSnap.docs
          .map((d) => ({ id: d.id, data: d.data() as StoredComment }))
          .filter((c) => c.data.status === 'approved')
          .map((c) => ({ id: c.id, name: c.data.name, message: c.data.message, createdAt: commentDay(c.data) }))
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .slice(0, 100);
        res.json({ rating: { avg: count ? Math.round((sum / count) * 10) / 10 : 0, count }, comments });
        return;
      }
      if (req.method !== 'POST') {
        res.status(405).json({ error: 'method_not_allowed' });
        return;
      }
      const body = (req.body ?? {}) as Record<string, unknown>;
      const slug = typeof body.slug === 'string' ? body.slug : '';
      if (!SLUG_RE.test(slug)) {
        res.status(400).json({ error: 'bad_slug' });
        return;
      }
      const postSnap = await db.doc(`posts/${slug}`).get();
      if (!postSnap.exists || postSnap.data()?.status !== 'published') {
        res.status(404).json({ error: 'unknown_post' });
        return;
      }
      const ipHash = feedbackIpHash(req.headers['x-forwarded-for'] as string | undefined, req.ip, slug);

      if (body.type === 'rating') {
        const stars = Number(body.stars);
        if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
          res.status(400).json({ error: 'bad_stars' });
          return;
        }
        const voteRef = db.doc(`feedback/${slug}/votes/${ipHash}`);
        const fbRef = db.doc(`feedback/${slug}`);
        try {
          const result = await db.runTransaction(async (tx) => {
            const vote = await tx.get(voteRef);
            if (vote.exists) throw new Error('already_rated');
            const fb = await tx.get(fbRef);
            const sum = ((fb.data()?.ratingSum as number) ?? 0) + stars;
            const count = ((fb.data()?.ratingCount as number) ?? 0) + 1;
            tx.set(voteRef, { createdAt: FieldValue.serverTimestamp() });
            tx.set(fbRef, { ratingSum: sum, ratingCount: count }, { merge: true });
            return { sum, count };
          });
          res.json({ rating: { avg: Math.round((result.sum / result.count) * 10) / 10, count: result.count } });
        } catch (error) {
          if (error instanceof Error && error.message === 'already_rated') {
            res.status(409).json({ error: 'already_rated' });
            return;
          }
          throw error;
        }
        return;
      }

      if (body.type === 'comment') {
        const name = typeof body.name === 'string' ? body.name.trim() : '';
        const message = typeof body.message === 'string' ? body.message.trim() : '';
        if (!name || name.length > 60 || !message || message.length > 1000) {
          res.status(400).json({ error: 'bad_fields' });
          return;
        }
        const existing = await db.collection('comments').where('slug', '==', slug).get();
        const today = new Date().toISOString().slice(0, 10);
        const mineToday = existing.docs.filter((d) => {
          const data = d.data() as StoredComment;
          return data.ipHash === ipHash && commentDay(data) === today;
        });
        if (mineToday.length >= 3) {
          res.status(429).json({ error: 'too_many' });
          return;
        }
        await db.collection('comments').add({ slug, name, message, status: 'pending', ipHash, createdAt: FieldValue.serverTimestamp() });
        await sendAdminEmail(
          GMAIL_APP_PASSWORD.value(),
          `Nuevo comentario en /blog/${slug}`,
          [
            `Nombre: ${name}`,
            `Post: https://luisdelatorre.dev/blog/${slug}`,
            '',
            'Comentario:',
            message,
            '',
            'Aprueba o elimina en https://luisdelatorre.dev/admin (pestaña Blog).',
          ].join('\n'),
        ).catch((error) => console.error('comment email failed', error));
        res.json({ ok: true });
        return;
      }

      res.status(400).json({ error: 'bad_type' });
    } catch (error) {
      console.error('postFeedback failed', error);
      res.status(500).json({ error: 'internal' });
    }
  },
);
```

- [ ] **Step 4: `firestore.rules`** — before the deny-all block add:

```
    // Feedback aggregates/votes are written only by the postFeedback function;
    // the owner can read them for auditing.
    match /feedback/{document=**} {
      allow read: if request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email == 'luis.atorred24@gmail.com';
      allow write: if false;
    }
    // Comments are created by the function; the owner moderates them.
    match /comments/{doc} {
      allow read, update, delete: if request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email == 'luis.atorred24@gmail.com';
      allow create: if false;
    }
```

- [ ] **Step 5: `firebase.json`** — after the `/api/booking` rewrite add:

```json
      {
        "source": "/api/feedback",
        "function": { "functionId": "postFeedback", "region": "us-central1" }
      }
```

- [ ] **Step 6:** `npm --prefix functions run build` → PASS. Commit:

```bash
git add functions/ firestore.rules firebase.json
git commit -m "feat(feedback): postFeedback function, shared mailer, rules and rewrite"
```

---

### Task 2: Tipos + repos de admin

**Files:**
- Modify: `src/content/posts-types.ts`, `src/admin/firebase-client.ts`, `src/admin/posts-repo.ts`

- [ ] **Step 1: `posts-types.ts`** — add at the end:

```ts
export type PostComment = { id: string; slug: string; name: string; message: string; createdAt: string };
```

- [ ] **Step 2: `firebase-client.ts`** — extend the posts-types import to `import type { BlogPost, PostComment } from '@/content/posts-types';` and add at the end:

```ts
export async function readPendingComments(): Promise<PostComment[]> {
  const { db } = services();
  const snap = await getDocs(query(collection(db, 'comments'), orderBy('createdAt', 'asc')));
  return snap.docs
    .map((d) => {
      const data = d.data() as DocumentData;
      const created = data.createdAt?.toDate ? (data.createdAt.toDate() as Date).toISOString().slice(0, 10) : '';
      return { id: d.id, slug: data.slug as string, name: data.name as string, message: data.message as string, status: data.status as string, createdAt: created };
    })
    .filter((c) => c.status === 'pending')
    .map(({ status: _s, ...rest }) => rest);
}

export async function updateCommentStatus(id: string, status: string): Promise<void> {
  const { db } = services();
  await updateDoc(doc(db, 'comments', id), { status });
}

export async function deleteCommentDoc(id: string): Promise<void> {
  const { db } = services();
  await deleteDoc(doc(db, 'comments', id));
}
```

- [ ] **Step 3: `posts-repo.ts`** — extend the type re-export to include `PostComment` and add:

```ts
export async function listPendingComments(): Promise<PostComment[]> {
  const fb = await import('./firebase-client');
  return fb.readPendingComments();
}

export async function approveComment(id: string): Promise<void> {
  const fb = await import('./firebase-client');
  return fb.updateCommentStatus(id, 'approved');
}

export async function deleteComment(id: string): Promise<void> {
  const fb = await import('./firebase-client');
  return fb.deleteCommentDoc(id);
}
```

(with `import type { PostComment } from '@/content/posts-types';` alongside the BlogPost import.)

- [ ] **Step 4:** `npx tsc --noEmit` → PASS. Commit:

```bash
git add src/content/posts-types.ts src/admin/
git commit -m "feat(feedback): pending-comments repo for admin moderation"
```

---

### Task 3: UI pública `PostFeedback`

**Files:**
- Create: `src/features/portfolio/sections/blog/post-feedback.tsx`
- Modify: `src/features/portfolio/pages/blog-post-page.tsx`

- [ ] **Step 1: Create `post-feedback.tsx` with EXACTLY:**

```tsx
import { useEffect, useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';

type FeedbackComment = { id: string; name: string; message: string; createdAt: string };
type FeedbackData = { rating: { avg: number; count: number }; comments: FeedbackComment[] };

const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

const T = {
  es: { ratingTitle: '¿Te sirvió este artículo?', votes: 'votos', thanks: 'Gracias', comments: 'Comentarios', empty: 'Sé el primero en comentar.', name: 'Tu nombre', message: 'Tu comentario…', send: 'Comentar', pending: 'Gracias — tu comentario aparecerá cuando sea aprobado.', error: 'No se pudo enviar. Intenta de nuevo.', tooMany: 'Demasiados comentarios por hoy.' },
  en: { ratingTitle: 'Was this article useful?', votes: 'votes', thanks: 'Thanks', comments: 'Comments', empty: 'Be the first to comment.', name: 'Your name', message: 'Your comment…', send: 'Comment', pending: 'Thanks — your comment will appear once approved.', error: 'Could not send. Try again.', tooMany: 'Too many comments for today.' },
} as const;

/** Live ratings + moderated comments under each blog post (via /api/feedback). */
export function PostFeedback({ slug }: { slug: string }) {
  const { locale } = useI18n();
  const t = T[locale];
  const [data, setData] = useState<FeedbackData>({ rating: { avg: 0, count: 0 }, comments: [] });
  const [myVote, setMyVote] = useState<number | null>(null);
  const [hoverStar, setHoverStar] = useState(0);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem(`rated:${slug}`);
      if (stored) setMyVote(Number(stored));
    }
    fetch(`/api/feedback?slug=${slug}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d) setData(d as FeedbackData);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [slug]);

  const rate = async (stars: number) => {
    if (myVote) return;
    setMyVote(stars);
    if (typeof localStorage !== 'undefined') localStorage.setItem(`rated:${slug}`, String(stars));
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'rating', slug, stars }) });
      if (res.ok) {
        const d = (await res.json()) as { rating: FeedbackData['rating'] };
        setData((prev) => ({ ...prev, rating: d.rating }));
      }
    } catch {
      // el voto local se conserva; el agregado se verá en la próxima visita
    }
  };

  const submit = async () => {
    if (!name.trim() || !message.trim() || sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'comment', slug, name: name.trim(), message: message.trim() }) });
      if (res.status === 429) {
        setError(t.tooMany);
        return;
      }
      if (!res.ok) throw new Error('bad_status');
      setSent(true);
    } catch {
      setError(t.error);
    } finally {
      setSending(false);
    }
  };

  const inputStyle = { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 11, color: colors.text, fontSize: 14 } as const;

  return (
    <View style={{ gap: 20, marginTop: 32 }}>
      <View style={{ height: 1, backgroundColor: colors.border }} />
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.text }}>{t.ratingTitle}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <View style={{ flexDirection: 'row', gap: 2 }}>
            {[1, 2, 3, 4, 5].map((s) => {
              const filled = myVote ? s <= myVote : s <= hoverStar;
              return (
                <Pressable key={s} onPress={() => rate(s)} onHoverIn={() => setHoverStar(s)} onHoverOut={() => setHoverStar(0)} style={webCursor as object}>
                  <Text style={{ fontSize: 24, color: filled ? colors.accent : colors.textFaint }}>{filled ? '★' : '☆'}</Text>
                </Pressable>
              );
            })}
          </View>
          {data.rating.count > 0 ? (
            <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.textMuted }}>
              {myVote ? `${t.thanks} · ` : ''}⭐ {data.rating.avg} · {data.rating.count} {t.votes}
            </Text>
          ) : myVote ? (
            <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.textMuted }}>{t.thanks} ⭐</Text>
          ) : null}
        </View>
      </View>

      <View style={{ gap: 12 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.text }}>
          {t.comments} ({data.comments.length})
        </Text>
        {data.comments.length === 0 ? <Text style={{ fontSize: 13.5, color: colors.textDim }}>{t.empty}</Text> : null}
        {data.comments.map((c) => (
          <View key={c.id} style={{ gap: 6, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface }}>
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 14.5, color: colors.text }}>{c.name}</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{c.createdAt}</Text>
            </View>
            <Text style={{ fontSize: 14, lineHeight: 22, color: colors.textMuted }}>{c.message}</Text>
          </View>
        ))}
        {sent ? (
          <Text style={{ fontSize: 13.5, color: colors.accent }}>{t.pending}</Text>
        ) : (
          <View style={{ gap: 10 }}>
            <TextInput value={name} onChangeText={setName} placeholder={t.name} placeholderTextColor={colors.textFaint} style={inputStyle} />
            <TextInput value={message} onChangeText={setMessage} placeholder={t.message} placeholderTextColor={colors.textFaint} multiline style={[inputStyle, { minHeight: 90, textAlignVertical: 'top' }]} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <AppButton label={t.send} onPress={submit} variant="primary" />
              {error ? <Text style={{ fontSize: 12.5, color: '#ff8a8a' }}>{error}</Text> : null}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
```

- [ ] **Step 2: `blog-post-page.tsx`** — import `PostFeedback` from `'../sections/blog/post-feedback'` and render `<PostFeedback slug={post.slug} />` between `<Markdown source={t.content} />` and the bottom back-link `<View style={{ marginTop: 24 … }}>`.

- [ ] **Step 3:** `npx tsc --noEmit && npx expo export -p web` + hygiene grep (solo chunk firebase-client). Commit:

```bash
git add src/features/portfolio/
git commit -m "feat(feedback): rating stars + comments UI on blog posts"
```

---

### Task 4: Moderación en el admin

**Files:**
- Modify: `src/admin/components/posts-view.tsx`

- [ ] **Step 1:** Extend the repo import line to include `listPendingComments, approveComment, deleteComment, type PostComment`. Add state + load in `PostsView`:

```tsx
  const [pending, setPending] = useState<PostComment[] | null>(null);
```

and inside `reload`:

```tsx
    listPendingComments()
      .then(setPending)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
```

- [ ] **Step 2:** In list mode (after the `{error ? …}` line, before the `{!posts ? …}` block), add:

```tsx
      {pending && pending.length > 0 ? (
        <View style={{ gap: 12 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, color: colors.accent }}>COMENTARIOS PENDIENTES ({pending.length})</Text>
          {pending.map((c) => (
            <View key={c.id} style={{ gap: 8, padding: 16, borderWidth: 1, borderColor: 'rgba(228,227,87,0.45)', borderRadius: radii.lg, backgroundColor: colors.surface }}>
              <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>
                {c.name} · /blog/{c.slug} · {c.createdAt}
              </Text>
              <Text style={{ fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}>{c.message}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <AccentButton
                  label="Aprobar"
                  onPress={async () => {
                    try {
                      await approveComment(c.id);
                      setPending((p) => p?.filter((x) => x.id !== c.id) ?? p);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : String(e));
                    }
                  }}
                />
                <HoverLink
                  label={confirmDelete === `c:${c.id}` ? '¿Seguro?' : 'Eliminar'}
                  onPress={async () => {
                    if (confirmDelete !== `c:${c.id}`) {
                      setConfirmDelete(`c:${c.id}`);
                      return;
                    }
                    try {
                      await deleteComment(c.id);
                      setConfirmDelete(null);
                      setPending((p) => p?.filter((x) => x.id !== c.id) ?? p);
                    } catch (e) {
                      setError(e instanceof Error ? e.message : String(e));
                    }
                  }}
                  color={confirmDelete === `c:${c.id}` ? '#ff6b6b' : colors.textFaint}
                  hoverColor="#ff6b6b"
                />
              </View>
            </View>
          ))}
        </View>
      ) : null}
```

- [ ] **Step 3:** `npx tsc --noEmit` → PASS. Commit:

```bash
git add src/admin/
git commit -m "feat(admin): pending-comments moderation in blog view"
```

---

### Task 5: Verify + deploy

- [ ] **Step 1:** Full builds + hygiene. Preview del post de Firebase:
  - Bloque de estrellas + "Comentarios (0)" + form visibles bajo el artículo.
  - Interceptar `window.fetch` en preview_eval; click en la 4ª estrella → se
    dispara `POST /api/feedback` con `{type:'rating',stars:4,slug}` y
    localStorage `rated:<slug>` queda seteado.
  - Llenar nombre+comentario y enviar → `POST {type:'comment'…}` + mensaje de
    pendiente (el POST real falla en dev sin la función — el intercept valida
    payload y el catch muestra el error esperado; el flujo feliz se verifica en
    vivo).
  - Sin errores de consola; /admin login intacto.

- [ ] **Step 2: Deploy infra:**

```bash
firebase deploy --only functions:postFeedback,functions:submitBooking,firestore:rules --project luisdelatorre-portfolio --non-interactive
```
Expected: `Deploy complete!` (postFeedback create + submitBooking update + rules).

- [ ] **Step 3: Finish.** finishing-a-development-branch → push + PR → merge →
  `gh workflow run deploy.yml --ref main` (publica el rewrite + el JS nuevo) →
  live end-to-end: `curl GET /api/feedback?slug=agenda-de-llamadas-con-firebase`
  (zeros), votar desde el navegador, comentar, verificar email, aprobar en
  admin, ver el comentario publicado y el GET devolviéndolo.

---

## Self-Review

**1. Spec coverage:** mailer compartido + refactor booking (T1 S1-2) ✓ · postFeedback GET/rating/comment con validaciones, transacción, 409/429, ipHash salado, email best-effort (T1 S3) ✓ · rules feedback+comments (T1 S4) ✓ · rewrite (T1 S5) ✓ · PostComment + repos (T2) ✓ · UI pública con estrellas hover/voto único localStorage, comentarios, form con estados 429/error/pendiente, degradación silenciosa (T3) ✓ · moderación con Aprobar/Eliminar dos-taps + optimista (T4) ✓ · verify con fetch-intercept + deploy funciones/rules + E2E vivo (T5) ✓.
**2. Placeholders:** ninguno.
**3. Type consistency:** `FeedbackData`/respuestas del GET coinciden con lo que sirve la función (avg/count/comments[{id,name,message,createdAt}]) ✓ · `PostComment` T2↔T4 ✓ · `sendAdminEmail(pass, subject, text, replyTo?)` T1 S1↔S2↔S3 ✓ · `confirmDelete` reusado con prefijo `c:` para no chocar con el confirm de posts ✓ · `AppButton variant="primary"` existente ✓.
