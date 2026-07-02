import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

const KEYS = [
  'formHint', 'formEmailLabel', 'formEmailPlaceholder', 'stepProjectLabel', 'stepScheduleLabel',
  'nextCta', 'backCta', 'confirmCta', 'slotsHeading', 'slotsFreeSuffix', 'slotsPickDay',
  'bannerPickDay', 'bannerPickTime', 'bannerScheduled', 'whatsappAlt', 'successTitle',
  'successBody', 'successAgain', 'errorRequired', 'errorSlotTaken', 'errorNetwork',
] as const;

// One-off migration: merge ONLY the wizard strings into contact.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    const contact = Object.fromEntries(KEYS.map((k) => [k, seed.contact[k]]));
    await db.doc(`content/${id}`).set({ contact }, { merge: true });
    console.log(`Merged booking wizard strings into content/${id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
