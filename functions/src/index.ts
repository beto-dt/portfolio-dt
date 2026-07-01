import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';

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
