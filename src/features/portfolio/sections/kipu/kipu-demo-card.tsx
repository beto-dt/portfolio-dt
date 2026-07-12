import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { ProductDemoCard } from '../../components/product-demo-card';

const REPO_URL = 'https://github.com/beto-dt/kipu';

const T = {
  es: {
    category: 'PRODUCTO DEMO',
    title: 'Kipu — wallet iOS nativa',
    description:
      'Wallet construida 100% en Swift y SwiftUI: bloqueo con Face ID, cuentas y movimientos con SwiftData, transferencias con balances animados y gráfica de gastos con Swift Charts. Cero dependencias externas.',
    code: 'Ver código y demo ↗',
  },
  en: {
    category: 'PRODUCT DEMO',
    title: 'Kipu — native iOS wallet',
    description:
      'Wallet built 100% in Swift and SwiftUI: Face ID lock, accounts and movements with SwiftData, transfers with animated balances and a Swift Charts spending donut. Zero external dependencies.',
    code: 'View code & demo ↗',
  },
};

const TECH = ['Swift', 'SwiftUI', 'SwiftData', 'Face ID', 'Swift Charts'];

/** Kipu card: native iOS demo — the repo README carries the demo GIF. */
export function KipuDemoCard() {
  const { locale } = useI18n();
  const t = T[locale];
  const item: ProjectItem = { category: t.category, title: t.title, description: t.description, tech: TECH };

  return <ProductDemoCard item={item} links={[{ label: t.code, url: REPO_URL }]} />;
}
