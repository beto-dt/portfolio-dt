import admin from 'firebase-admin';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

const ES_CONTENT = [
  'Después de varias semanas construyendo este sitio, lo estreno con un espacio para escribir. Aquí voy a compartir notas de ingeniería: decisiones de arquitectura, aprendizajes de proyectos reales y experimentos con IA.',
  '',
  '## Qué vas a encontrar',
  '',
  '- Casos reales de proyectos (web, móvil, AR y microservicios)',
  '- Decisiones técnicas y sus *trade-offs*, sin humo',
  '- Experimentos con **agentes de IA** y automatización',
  '',
  '## Cómo está hecho este blog',
  '',
  'El sitio completo es Expo + React Native Web con export estático. Los posts viven en Firestore, se editan desde un admin propio y cada publicación genera una página estática con su propio SEO:',
  '',
  '```',
  'admin → Firestore → Publicar → build estático → /blog/mi-post',
  '```',
  '',
  '> ¿Tienes un proyecto en mente? En [contacto](https://luisdelatorre.dev/contacto) puedes agendar una llamada gratuita de 30 minutos.',
  '',
  'Gracias por leer — nos vemos en el próximo post.',
].join('\n');

const EN_CONTENT = [
  'After several weeks building this site, I am opening it with a space to write. Here I will share engineering notes: architecture decisions, lessons from real projects and AI experiments.',
  '',
  '## What you will find',
  '',
  '- Real project cases (web, mobile, AR and microservices)',
  '- Technical decisions and their *trade-offs*, no fluff',
  '- Experiments with **AI agents** and automation',
  '',
  '## How this blog is built',
  '',
  'The whole site is Expo + React Native Web with a static export. Posts live in Firestore, are edited from a custom admin, and each publish generates a static page with its own SEO:',
  '',
  '```',
  'admin → Firestore → Publish → static build → /blog/my-post',
  '```',
  '',
  '> Got a project in mind? You can [book a free 30-minute call](https://luisdelatorre.dev/contacto).',
  '',
  'Thanks for reading — see you in the next post.',
].join('\n');

// One-off seed: creates the welcome post unless it already exists.
async function main() {
  const ref = db.doc('posts/bienvenido-al-blog');
  if ((await ref.get()).exists) {
    console.log('posts/bienvenido-al-blog already exists — skipping');
    return;
  }
  await ref.set({
    status: 'published',
    publishedAt: '2026-07-06',
    tags: ['portfolio', 'detrás de cámaras'],
    es: {
      title: 'Bienvenido al blog',
      excerpt: 'Estreno este espacio para compartir notas de ingeniería: arquitectura, proyectos reales y experimentos con IA.',
      content: ES_CONTENT,
    },
    en: {
      title: 'Welcome to the blog',
      excerpt: 'Opening this space to share engineering notes: architecture, real projects and AI experiments.',
      content: EN_CONTENT,
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log('Seeded posts/bienvenido-al-blog');
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
