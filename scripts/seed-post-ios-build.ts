import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

const SLUG = 'ios-build-6-hours-to-15-minutes';
const DIAGRAM = '/images/blog/ios-build-6-hours-to-15-minutes.svg';

const EN_CONTENT = [
  `![Before and after diagram of the iOS build pipeline: about 6 hours per build before, about 15 minutes after adding a dedicated Mac as a self-hosted Azure DevOps agent.](${DIAGRAM})`,
  '',
  '## At a glance',
  '',
  '- **Client:** a major bank in Ecuador (under NDA)',
  '- **Product:** mobile banking app built with Kotlin Multiplatform',
  '- **My role:** Software Development Engineer, mobile and CI/CD',
  '- **Stack:** Azure DevOps, a dedicated Mac as a self-hosted build agent, iOS, Android',
  '- **Result:** the iOS build went from 6 hours to about 15 minutes, roughly 24x faster',
  '',
  '## The problem',
  '',
  "Every iOS build of the bank's app took about 6 hours. With builds that slow, the team could ship about one release a day, and only on a good day. Fixes, QA rounds and store submissions all moved at that pace.",
  '',
  '## What I did',
  '',
  "I worked on the Azure DevOps pipelines with the team. First, we tuned their configuration so the Android and iOS builds would run faster. Then came the biggest change: a dedicated Mac that runs the build jobs as a self-hosted Azure DevOps agent, so every iOS build gets that machine's full resources.",
  '',
  '## The result',
  '',
  'The iOS build dropped from 6 hours to about 15 minutes, and the Android builds got faster too. The team went from about one release a day to shipping as many releases as it needs.',
  '',
  "## What I'd tell another team",
  '',
  'If your mobile builds are measured in hours, look at where they run before you rewrite anything. Pipeline configuration and build hardware are often the fastest win you have.',
].join('\n');

const ES_CONTENT = [
  `![Diagrama del antes y después del pipeline de iOS: unas 6 horas por build antes, unos 15 minutos después de sumar un Mac dedicado como agente self-hosted de Azure DevOps.](${DIAGRAM})`,
  '',
  '## En resumen',
  '',
  '- **Cliente:** un banco grande de Ecuador (bajo NDA)',
  '- **Producto:** app de banca móvil construida con Kotlin Multiplatform',
  '- **Mi rol:** Software Development Engineer, móvil y CI/CD',
  '- **Stack:** Azure DevOps, un Mac dedicado como agente de build self-hosted, iOS, Android',
  '- **Resultado:** el build de iOS pasó de 6 horas a unos 15 minutos, unas 24 veces más rápido',
  '',
  '## El problema',
  '',
  'Cada build de iOS de la app del banco tardaba unas 6 horas. Con builds tan lentos, el equipo podía sacar más o menos un release al día, y solo en un buen día. Los fixes, las rondas de QA y los envíos a las tiendas iban todos a ese ritmo.',
  '',
  '## Qué hice',
  '',
  'Trabajé en los pipelines de Azure DevOps junto al equipo. Primero, afinamos su configuración para que los builds de Android e iOS corrieran más rápido. Después vino el cambio más grande: un Mac dedicado que ejecuta los jobs de build como agente self-hosted de Azure DevOps, para que cada build de iOS tenga todos los recursos de esa máquina.',
  '',
  '## El resultado',
  '',
  'El build de iOS bajó de 6 horas a unos 15 minutos, y los builds de Android también se aceleraron. El equipo pasó de un release al día a sacar todos los que necesita.',
  '',
  '## Lo que le diría a otro equipo',
  '',
  'Si tus builds móviles se miden en horas, mira dónde se ejecutan antes de reescribir nada. La configuración del pipeline y el hardware de build suelen ser la victoria más rápida que tienes.',
].join('\n');

// One-off seed: creates the iOS build case study unless it already exists.
async function main() {
  const ref = db.doc(`posts/${SLUG}`);
  if ((await ref.get()).exists) {
    console.log(`posts/${SLUG} already exists — skipping`);
    return;
  }
  await ref.set({
    status: 'published',
    publishedAt: '2026-10-27',
    tags: ['ios', 'azure-devops', 'ci-cd', 'kotlin-multiplatform'],
    lang: 'en',
    es: {
      title: 'Cómo bajé el build de iOS de una app bancaria de 6 horas a 15 minutos',
      excerpt:
        'Cómo un pipeline de Azure DevOps afinado y un Mac dedicado como agente de build llevaron el build de iOS de una app bancaria de 6 horas a unos 15 minutos.',
      content: ES_CONTENT,
    },
    en: {
      title: "Cutting a bank app's iOS build from 6 hours to 15 minutes",
      excerpt:
        "How a tuned Azure DevOps pipeline and a dedicated Mac build agent took a mobile banking app's iOS build from 6 hours to about 15 minutes.",
      content: EN_CONTENT,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`Seeded posts/${SLUG}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
