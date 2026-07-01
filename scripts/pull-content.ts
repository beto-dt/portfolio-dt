import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import admin from 'firebase-admin';
import { assertPortfolioContent } from '../src/content/validate';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();
const OUT_DIR = resolve('src/content/published');

async function pull(locale: 'es' | 'en') {
  const snap = await db.doc(`content/${locale}`).get();
  if (!snap.exists) throw new Error(`Firestore doc content/${locale} not found`);
  const data = snap.data();
  assertPortfolioContent(data, `content/${locale}`);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(`${OUT_DIR}/${locale}.json`, JSON.stringify(data, null, 2) + '\n');
  console.log(`Wrote src/content/published/${locale}.json`);
}

async function main() {
  await pull('es');
  await pull('en');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
