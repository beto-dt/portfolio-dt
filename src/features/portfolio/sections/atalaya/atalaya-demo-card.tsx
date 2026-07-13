import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { ProductDemoCard } from '../../components/product-demo-card';

const REPO_URL = 'https://github.com/beto-dt/atalaya';

const T = {
  es: {
    category: 'PRODUCTO PERSONAL',
    title: 'Atalaya — finanzas personales',
    description:
      'La app con la que gestiono mi propio dinero: presupuestos con semáforo, score de salud financiera y agregaciones en la base. Backend Java con Spring Boot 4, PostgreSQL y Flyway, levantado con un solo docker compose up.',
    code: 'Ver código ↗',
  },
  en: {
    category: 'PERSONAL PRODUCT',
    title: 'Atalaya — personal finance',
    description:
      'The app I manage my own money with: traffic-light budgets, a financial health score and in-database aggregations. Java backend with Spring Boot 4, PostgreSQL and Flyway, raised with a single docker compose up.',
    code: 'View code ↗',
  },
};

const TECH = ['Java 21', 'Spring Boot', 'PostgreSQL', 'Docker', 'React'];

/** Atalaya card: the personal-finance tool — daily-use product, public code. */
export function AtalayaDemoCard() {
  const { locale } = useI18n();
  const t = T[locale];
  const item: ProjectItem = { category: t.category, title: t.title, description: t.description, tech: TECH };

  return <ProductDemoCard item={item} links={[{ label: t.code, url: REPO_URL }]} />;
}
