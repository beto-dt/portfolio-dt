import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

async function main() {
  await db.doc('content/es').set(es);
  await db.doc('content/en').set(en);
  console.log('Seeded content/es and content/en');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
