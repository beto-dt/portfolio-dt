import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { ProductDemoCard } from '../../components/product-demo-card';

const DEMO_URL = 'https://vitala.luisdelatorre.dev';
const REPO_URL = 'https://github.com/beto-dt/vitala';

const T = {
  es: {
    category: 'PRODUCTO DEMO',
    title: 'Vitala — teleconsultas por video',
    description:
      'Videollamadas 1:1 con salas por código, construida en Flutter + Agora: tokens firmados en el servidor, WebRTC en tiempo real y sandbox que se reinicia solo. Pruébala con tu laptop y tu celular a la vez.',
    demo: 'Probar demo ↗',
    code: 'Ver código ↗',
  },
  en: {
    category: 'PRODUCT DEMO',
    title: 'Vitala — video consultations',
    description:
      '1:1 video calls with room codes, built with Flutter + Agora: server-signed tokens, real-time WebRTC and a self-resetting sandbox. Try it with your laptop and your phone at the same time.',
    demo: 'Try the demo ↗',
    code: 'View code ↗',
  },
};

const TECH = ['Flutter', 'Agora', 'WebRTC', 'Cloud Functions', 'Firestore'];

/** Vitala card: a real product demo with external demo + repo links. */
export function VitalaDemoCard() {
  const { locale } = useI18n();
  const t = T[locale];
  const item: ProjectItem = { category: t.category, title: t.title, description: t.description, tech: TECH };

  return (
    <ProductDemoCard
      item={item}
      links={[
        { label: t.demo, url: DEMO_URL },
        { label: t.code, url: REPO_URL },
      ]}
    />
  );
}
