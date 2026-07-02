import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

// One-off migration: merge ONLY the changed/new fields. Arrays replace
// wholesale (intended for the two item lists); everything else is untouched.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    await db.doc(`content/${id}`).set(
      {
        certifications: { items: seed.certifications.items },
        education: { items: seed.education.items },
        contact: {
          whatsappCta: seed.contact.whatsappCta,
          emailCta: seed.contact.emailCta,
          location: seed.contact.location,
          linkedinLabel: seed.contact.linkedinLabel,
          formNameLabel: seed.contact.formNameLabel,
          formNamePlaceholder: seed.contact.formNamePlaceholder,
          formTypeLabel: seed.contact.formTypeLabel,
          projectTypes: seed.contact.projectTypes,
          formBudgetLabel: seed.contact.formBudgetLabel,
          budgets: seed.contact.budgets,
          formMessageLabel: seed.contact.formMessageLabel,
          formMessagePlaceholder: seed.contact.formMessagePlaceholder,
          formHint: seed.contact.formHint,
        },
      },
      { merge: true },
    );
    console.log(`Merged formation + contact updates into content/${id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
