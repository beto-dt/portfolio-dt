import type { PublishedPost } from '../../posts-types';

const DIAGRAM = '/images/blog/banking-super-app-modular-architecture.svg';

const EN_CONTENT = [
  `![Diagram of a banking super app before and after modularization: before, every feature shipped inside the base app; after, separate feature modules on top of shared Kotlin Multiplatform code, enabling Android Dynamic Feature Delivery.](${DIAGRAM})`,
  '',
  '## At a glance',
  '',
  '- **Client:** a major bank in Ecuador (under NDA)',
  '- **Product:** banking super app built with Kotlin Multiplatform',
  '- **My role:** Software Development Engineer, mobile architecture',
  '- **Stack:** Kotlin Multiplatform, Android, iOS',
  '- **Result:** a modular architecture, with Android Dynamic Feature Delivery enabled',
  '',
  '## The problem',
  '',
  'A super app keeps adding features. Without dynamic feature modules, every one of them goes into the base app that every user downloads, and they all ship together. The app also had to support Android Dynamic Feature Delivery, which only works when each feature lives in its own module.',
  '',
  '## What I did',
  '',
  "I worked on refactoring the codebase so each feature lives in its own module, on top of the shared Kotlin Multiplatform code. On Android, those feature modules can now be delivered on their own. On iOS, the platform's architecture makes this kind of split much harder, so the modular delivery work focused on Android.",
  '',
  '## The result',
  '',
  'The app now has a modular architecture, and Android Dynamic Feature Delivery became possible: feature modules can be delivered separately instead of all shipping inside the base app.',
  '',
  "## What I'd tell another team",
  '',
  "If you're building a super app, plan your module boundaries early. Splitting a grown codebase later can be done, but it takes a lot more work.",
].join('\n');

const ES_CONTENT = [
  `![Diagrama de una super app bancaria antes y después de modularizarla: antes, cada funcionalidad iba dentro de la app base; después, módulos de funcionalidad separados sobre el código compartido en Kotlin Multiplatform, lo que habilita Android Dynamic Feature Delivery.](${DIAGRAM})`,
  '',
  '## En resumen',
  '',
  '- **Cliente:** un banco grande de Ecuador (bajo NDA)',
  '- **Producto:** super app bancaria construida con Kotlin Multiplatform',
  '- **Mi rol:** Software Development Engineer, arquitectura móvil',
  '- **Stack:** Kotlin Multiplatform, Android, iOS',
  '- **Resultado:** una arquitectura modular, con Android Dynamic Feature Delivery habilitado',
  '',
  '## El problema',
  '',
  'Una super app no deja de sumar funcionalidades. Sin módulos de funcionalidad dinámicos, cada una entra en la app base que descarga cada usuario, y todas se publican juntas. Además, la app tenía que soportar Android Dynamic Feature Delivery, que solo funciona cuando cada funcionalidad vive en su propio módulo.',
  '',
  '## Qué hice',
  '',
  'Trabajé en refactorizar el código para que cada funcionalidad viva en su propio módulo, sobre el código compartido en Kotlin Multiplatform. En Android, esos módulos ahora se pueden entregar por separado. En iOS, la arquitectura de la plataforma hace este tipo de división mucho más difícil, así que el trabajo de entrega modular se centró en Android.',
  '',
  '## El resultado',
  '',
  'La app ahora tiene una arquitectura modular, y Android Dynamic Feature Delivery se hizo posible: los módulos de funcionalidad se pueden entregar por separado en vez de ir todos dentro de la app base.',
  '',
  '## Lo que le diría a otro equipo',
  '',
  'Si estás construyendo una super app, define los límites de tus módulos desde el principio. Dividir después un código que ya creció se puede, pero cuesta mucho más trabajo.',
].join('\n');

export const post: PublishedPost = {
  slug: 'banking-super-app-modular-architecture',
  publishedAt: '2026-10-27',
  tags: ['kotlin-multiplatform', 'android', 'mobile-architecture', 'dynamic-delivery'],
  es: {
    title: 'Modularizando una super app bancaria en Kotlin Multiplatform',
    excerpt:
      'Cómo dividir una super app bancaria en Kotlin Multiplatform en módulos de funcionalidad hizo posible Android Dynamic Feature Delivery.',
    content: ES_CONTENT,
  },
  en: {
    title: 'Modularizing a Kotlin Multiplatform banking super app',
    excerpt:
      'How splitting a Kotlin Multiplatform banking super app into feature modules made Android Dynamic Feature Delivery possible.',
    content: EN_CONTENT,
  },
  lang: 'en',
};
