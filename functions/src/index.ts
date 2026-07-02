import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import nodemailer from 'nodemailer';

if (!getApps().length) initializeApp();
const db = getFirestore();

const GITHUB_TOKEN = defineSecret('GITHUB_TOKEN');

const ADMIN_EMAIL = 'luis.atorred24@gmail.com';
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
  'projects',
  'certifications',
  'formation',
  'collaboration',
  'contact',
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

const SLOT_TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
const MAX_DAYS_AHEAD = 60;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BOOKING_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
    let raw: unknown = req.body;
    if (typeof raw === 'string') {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = {};
      }
    }
    const b = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
    const name = typeof b.name === 'string' ? b.name.trim() : '';
    const email = typeof b.email === 'string' ? b.email.trim() : '';
    const projectType = typeof b.projectType === 'string' ? b.projectType.slice(0, 60) : '';
    const budget = typeof b.budget === 'string' ? b.budget.slice(0, 60) : '';
    const message = typeof b.message === 'string' ? b.message.slice(0, 2000) : '';
    const date = typeof b.date === 'string' ? b.date : '';
    const time = typeof b.time === 'string' ? b.time : '';
    const locale = b.locale === 'en' ? 'en' : 'es';
    if (
      !name || name.length > 120 ||
      !BOOKING_EMAIL_RE.test(email) || email.length > 200 ||
      !isValidBookingDate(date) || !SLOT_TIMES.includes(time)
    ) {
      res.status(400).json({ error: 'invalid' });
      return;
    }
    const existing = await db.collection('bookings').where('date', '==', date).where('time', '==', time).get();
    if (existing.docs.some((docSnap) => docSnap.get('status') !== 'cancelled')) {
      res.status(409).json({ error: 'slot_taken' });
      return;
    }
    await db.collection('bookings').add({
      name, email, projectType, budget, message, date, time, locale,
      status: 'new',
      createdAt: FieldValue.serverTimestamp(),
    });
    let emailed = true;
    try {
      const transport = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: ADMIN_EMAIL, pass: GMAIL_APP_PASSWORD.value() },
      });
      await transport.sendMail({
        from: `Portfolio <${ADMIN_EMAIL}>`,
        to: ADMIN_EMAIL,
        replyTo: email,
        subject: `Nueva solicitud — ${name} · ${date} ${time}`,
        text: [
          `Nombre: ${name}`,
          `Email: ${email}`,
          `Tipo: ${projectType || '—'}`,
          `Presupuesto: ${budget || '—'}`,
          `Fecha: ${date} ${time} (GMT-5)`,
          `Idioma: ${locale}`,
          '',
          'Mensaje:',
          message || '—',
        ].join('\n'),
      });
    } catch (error) {
      emailed = false;
      console.error('booking email failed', error);
    }
    res.json({ ok: true, emailed });
  },
);
