import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { createHash } from 'node:crypto';
import { ADMIN_EMAIL, sendAdminEmail } from './mailer';

if (!getApps().length) initializeApp();
const db = getFirestore();

const GITHUB_TOKEN = defineSecret('GITHUB_TOKEN');

const DISPATCH_URL =
  'https://api.github.com/repos/beto-dt/portfolio-dt/actions/workflows/deploy.yml/dispatches';
const ACTIONS_URL =
  'https://github.com/beto-dt/portfolio-dt/actions/workflows/deploy.yml';

export const publish = onCall(
  { secrets: [GITHUB_TOKEN], region: 'us-central1' },
  async (request) => {
    if (
      request.auth?.token?.email !== ADMIN_EMAIL ||
      request.auth?.token?.email_verified !== true
    ) {
      throw new HttpsError('permission-denied', 'No autorizado');
    }

    const res = await fetch(DISPATCH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN.value()}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'portfolio-publish-fn',
      },
      body: JSON.stringify({ ref: 'main' }),
    });

    if (res.status !== 204) {
      const detail = await res.text();
      throw new HttpsError('internal', `GitHub dispatch failed: ${res.status} ${detail}`);
    }

    return { ok: true, actionsUrl: ACTIONS_URL };
  },
);

const SECTION_KEYS = new Set([
  'hero',
  'services',
  'process',
  'impact',
  'stack',
  'experience',
  'reach',
  'projects',
  'testimonials',
  'certifications',
  'formation',
  'collaboration',
  'contact',
  'blog',
]);

export const recordVisit = onRequest({ region: 'us-central1', cors: true }, async (req, res) => {
  try {
    let raw: unknown = req.body;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = {};
      }
    }
    const body = (raw && typeof raw === 'object' ? raw : {}) as { countVisit?: unknown; sections?: unknown };
    const countVisit = body.countVisit === true;
    const sections = Array.isArray(body.sections) ? body.sections.filter((s): s is string => typeof s === 'string') : [];

    const update: Record<string, unknown> = {};
    if (countVisit) {
      const day = new Date().toISOString().slice(0, 10);
      update.total = FieldValue.increment(1);
      update.byDay = { [day]: FieldValue.increment(1) };
    }
    const bySection: Record<string, unknown> = {};
    for (const s of sections) {
      if (SECTION_KEYS.has(s)) bySection[s] = FieldValue.increment(1);
    }
    if (Object.keys(bySection).length > 0) update.bySection = bySection;

    if (Object.keys(update).length > 0) {
      await db.doc('analytics/summary').set(update, { merge: true });
    }
    res.status(204).send('');
  } catch {
    res.status(204).send('');
  }
});

const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');

const SLOT_TIMES = new Set(['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']);
const MAX_DAYS_AHEAD = 60;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/** Linear-time email sanity check (no regex backtracking). */
function isEmailish(v: string): boolean {
  if (!v || v.length > 200 || /\s/.test(v)) return false;
  const at = v.indexOf('@');
  if (at <= 0 || at !== v.lastIndexOf('@') || at === v.length - 1) return false;
  const domain = v.slice(at + 1);
  const dot = domain.indexOf('.');
  return dot > 0 && dot < domain.length - 1;
}

/** Valid booking day: real date, Mon–Fri, today..+60d in the site's GMT-5. */
function isValidBookingDate(iso: string): boolean {
  if (!DATE_RE.test(iso)) return false;
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) return false;
  const dow = date.getUTCDay();
  if (dow === 0 || dow === 6) return false;
  const now = new Date(Date.now() - 5 * 3600 * 1000);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const target = Date.UTC(y, m - 1, d);
  return target >= today && target <= today + MAX_DAYS_AHEAD * 86400 * 1000;
}

type BookingPayload = {
  name: string;
  email: string;
  projectType: string;
  budget: string;
  model: string;
  message: string;
  date: string;
  time: string;
  locale: string;
};

/** Parse + validate the booking POST body; null when anything is off. */
function parseBookingPayload(raw: unknown): BookingPayload | null {
  let body: unknown = raw;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = {};
    }
  }
  const b = (body && typeof body === 'object' ? body : {}) as Record<string, unknown>;
  const payload: BookingPayload = {
    name: typeof b.name === 'string' ? b.name.trim() : '',
    email: typeof b.email === 'string' ? b.email.trim() : '',
    projectType: typeof b.projectType === 'string' ? b.projectType.slice(0, 60) : '',
    budget: typeof b.budget === 'string' ? b.budget.slice(0, 60) : '',
    model: typeof b.model === 'string' ? b.model.slice(0, 80) : '',
    message: typeof b.message === 'string' ? b.message.slice(0, 2000) : '',
    date: typeof b.date === 'string' ? b.date : '',
    time: typeof b.time === 'string' ? b.time : '',
    locale: b.locale === 'en' ? 'en' : 'es',
  };
  if (
    !payload.name || payload.name.length > 120 ||
    !isEmailish(payload.email) ||
    !isValidBookingDate(payload.date) || !SLOT_TIMES.has(payload.time)
  ) {
    return null;
  }
  return payload;
}

export const submitBooking = onRequest(
  { secrets: [GMAIL_APP_PASSWORD], region: 'us-central1' },
  async (req, res) => {
    if (req.method === 'GET') {
      const date = String(req.query.date ?? '');
      if (!DATE_RE.test(date)) {
        res.status(400).json({ error: 'invalid' });
        return;
      }
      const snap = await db.collection('bookings').where('date', '==', date).get();
      const taken = snap.docs
        .filter((docSnap) => docSnap.get('status') !== 'cancelled')
        .map((docSnap) => String(docSnap.get('time')));
      res.json({ taken });
      return;
    }
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'method' });
      return;
    }
    const payload = parseBookingPayload(req.body);
    if (!payload) {
      res.status(400).json({ error: 'invalid' });
      return;
    }
    const { name, email, projectType, budget, model, message, date, time, locale } = payload;
    const existing = await db.collection('bookings').where('date', '==', date).where('time', '==', time).get();
    if (existing.docs.some((docSnap) => docSnap.get('status') !== 'cancelled')) {
      res.status(409).json({ error: 'slot_taken' });
      return;
    }
    await db.collection('bookings').add({
      name, email, projectType, budget, model, message, date, time, locale,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    });
    let emailed = true;
    try {
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
    } catch (error) {
      emailed = false;
      console.error('booking email failed', error);
    }
    res.json({ ok: true, emailed });
  },
);

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
