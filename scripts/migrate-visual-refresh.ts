import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';
import type { PortfolioContent } from '../src/content/types';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

async function migrate(locale: 'es' | 'en', data: PortfolioContent) {
  await db.doc(`content/${locale}`).update({
    contact: data.contact,
    education: data.education,
    footer: data.footer,
    'hero.cvLabel': data.hero.cvLabel,
    'hero.cvUrl': data.hero.cvUrl,
  });
  console.log(`Migrated content/${locale}`);
}

async function main() {
  await migrate('es', es);
  await migrate('en', en);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
