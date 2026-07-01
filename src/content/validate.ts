import type { PortfolioContent } from './types';

const REQUIRED_KEYS: (keyof PortfolioContent)[] = [
  'nav',
  'hero',
  'services',
  'impact',
  'stack',
  'experience',
  'projects',
  'certifications',
  'contact',
];

export function assertPortfolioContent(
  data: unknown,
  label = 'content',
): asserts data is PortfolioContent {
  if (!data || typeof data !== 'object') {
    throw new Error(`${label}: expected an object`);
  }
  const obj = data as Record<string, unknown>;
  for (const key of REQUIRED_KEYS) {
    if (obj[key] == null) throw new Error(`${label}: missing key "${key}"`);
  }
  const hero = obj.hero as { titleLead?: unknown; stats?: unknown };
  if (typeof hero.titleLead !== 'string') throw new Error(`${label}: hero.titleLead missing`);
  if (!Array.isArray(hero.stats) || hero.stats.length === 0) {
    throw new Error(`${label}: hero.stats empty`);
  }
  const services = obj.services as { items?: unknown };
  if (!Array.isArray(services.items) || services.items.length === 0) {
    throw new Error(`${label}: services.items empty`);
  }
}
