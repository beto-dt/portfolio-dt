import admin from 'firebase-admin';
import { es } from '../../src/content/seed/es';
import { en } from '../../src/content/seed/en';

type Seed = typeof es;

/** Shared runner for one-off merge-only content migrations (never a full set()). */
export function runMergeMigration(label: string, pick: (seed: Seed) => Record<string, unknown>): void {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'luisdelatorre-portfolio',
  });
  const db = admin.firestore();
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  Promise.all(
    locales.map(({ id, seed }) =>
      db
        .doc(`content/${id}`)
        .set(pick(seed), { merge: true })
        .then(() => console.log(`Merged ${label} into content/${id}`)),
    ),
  )
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
