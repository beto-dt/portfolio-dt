import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { ProductDemoCard } from '../../components/product-demo-card';

const DEMO_URL = 'https://spa.luisdelatorre.dev';
const REPO_URL = 'https://github.com/beto-dt/ankara-spa';

const T = {
  es: {
    category: 'PRODUCTO DEMO',
    title: 'Ankara Spa — reservas de sauna & masajes',
    description:
      'App de reservas construida en Kotlin Multiplatform: catálogo, disponibilidad real por terapeuta, reservas con transacción anti-doble-booking y panel del negocio. En producción, con código abierto.',
    demo: 'Probar demo ↗',
    code: 'Ver código ↗',
  },
  en: {
    category: 'PRODUCT DEMO',
    title: 'Ankara Spa — sauna & massage bookings',
    description:
      'Booking app built with Kotlin Multiplatform: catalog, real per-therapist availability, bookings guarded by an anti-double-booking transaction, and a business panel. In production, open source.',
    demo: 'Try the demo ↗',
    code: 'View code ↗',
  },
};

const TECH = ['Kotlin Multiplatform', 'Compose', 'Ktor', 'Cloud Functions', 'Firestore'];

/** Ankara Spa card: a real product demo with external demo + repo links. */
export function AnkaraDemoCard() {
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
