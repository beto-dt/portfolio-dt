import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

// One-off migration: merge ONLY contact.interestLabel.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    await db.doc(`content/${id}`).set({ contact: { interestLabel: seed.contact.interestLabel } }, { merge: true });
    console.log(`Merged interestLabel into content/${id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
