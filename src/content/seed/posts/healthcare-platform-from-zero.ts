import type { PublishedPost } from '../../posts-types';

const DIAGRAM = '/images/blog/healthcare-platform-from-zero.svg';

const EN_CONTENT = [
  `![Architecture diagram of a healthcare platform: React Native app, Python and FastAPI API and PostgreSQL database on AWS with Terraform, CI/CD pipelines, and how the team grew from one engineer to module owners.](${DIAGRAM})`,
  '',
  '## At a glance',
  '',
  '- **Client:** a growing healthcare startup (under NDA)',
  '- **Product:** a healthcare platform',
  '- **My role:** Tech Lead and first engineer on the project, across frontend, backend and infrastructure',
  '- **Stack:** React Native, Python, FastAPI, PostgreSQL, AWS, Terraform',
  '- **Result:** one solid base that a growing team built on',
  '',
  '## The problem',
  '',
  'A growing startup needed a healthcare platform built from scratch. The first version would come from one person, but the base had to be solid enough for a bigger team to build on later.',
  '',
  '## What I did',
  '',
  'I started alone and built the foundation end to end: the React Native app, a Python backend with FastAPI, a PostgreSQL database and the AWS infrastructure, all defined as code with Terraform. I also set up the CI/CD pipelines to build and release.',
  '',
  'When more developers joined, I guided them until each one took ownership of a module.',
  '',
  '## The result',
  '',
  'The platform went from an empty repository to a platform a whole team can work on in parallel, with infrastructure that can be recreated from code and a clear owner for every module.',
  '',
  "## What I'd tell another team",
  '',
  "When you're the first engineer, the most useful thing you can build is a base that other people can understand and own.",
].join('\n');

const ES_CONTENT = [
  `![Diagrama de arquitectura de una plataforma de salud: app en React Native, API en Python y FastAPI y base de datos PostgreSQL en AWS con Terraform, pipelines de CI/CD, y cómo el equipo creció de un ingeniero a dueños de cada módulo.](${DIAGRAM})`,
  '',
  '## En resumen',
  '',
  '- **Cliente:** una startup de salud en crecimiento (bajo NDA)',
  '- **Producto:** una plataforma de salud',
  '- **Mi rol:** Tech Lead y primer ingeniero del proyecto, en frontend, backend e infraestructura',
  '- **Stack:** React Native, Python, FastAPI, PostgreSQL, AWS, Terraform',
  '- **Resultado:** una base sólida sobre la que construyó un equipo en crecimiento',
  '',
  '## El problema',
  '',
  'Una startup en crecimiento necesitaba una plataforma de salud construida desde cero. La primera versión saldría de una sola persona, pero la base tenía que ser lo bastante sólida para que un equipo más grande construyera sobre ella después.',
  '',
  '## Qué hice',
  '',
  'Empecé solo y construí la base de punta a punta: la app en React Native, un backend en Python con FastAPI, una base de datos PostgreSQL y la infraestructura en AWS, todo definido como código con Terraform. También armé los pipelines de CI/CD para compilar y publicar.',
  '',
  'Cuando se sumaron más desarrolladores, los guié hasta que cada uno se hizo dueño de un módulo.',
  '',
  '## El resultado',
  '',
  'La plataforma pasó de un repositorio vacío a una plataforma en la que todo un equipo puede trabajar en paralelo, con infraestructura que se puede recrear desde código y un responsable claro para cada módulo.',
  '',
  '## Lo que le diría a otro equipo',
  '',
  'Cuando eres el primer ingeniero, lo más útil que puedes construir es una base que otras personas puedan entender y hacer suya.',
].join('\n');

export const post: PublishedPost = {
  slug: 'healthcare-platform-from-zero',
  publishedAt: '2026-10-27',
  tags: ['react-native', 'fastapi', 'aws', 'terraform'],
  es: {
    title: 'Construyendo una plataforma de salud desde cero',
    excerpt:
      'Cómo construí una plataforma de salud para una startup en crecimiento con React Native, FastAPI, PostgreSQL y AWS, y luego lideré al equipo que la escaló.',
    content: ES_CONTENT,
  },
  en: {
    title: 'Building a healthcare platform from zero',
    excerpt:
      'How I built a healthcare platform for a growing startup with React Native, FastAPI, PostgreSQL and AWS, then led the team that scaled it.',
    content: EN_CONTENT,
  },
  lang: 'en',
};
