import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

// One-off migration: merge ONLY the new fields into the existing content docs.
// Never a full set() — admin edits to existing fields must survive.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    await db.doc(`content/${id}`).set(
      {
        hero: { clientsHeading: seed.hero.clientsHeading, clients: seed.hero.clients },
        process: seed.process,
        collaboration: seed.collaboration,
      },
      { merge: true },
    );
    console.log(`Merged new sections into content/${id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
