import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

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
  'impact',
  'stack',
  'experience',
  'projects',
  'certifications',
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
