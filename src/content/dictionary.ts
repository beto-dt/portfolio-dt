import type { Locale } from '@/i18n/locales';
import type { PortfolioContent } from './types';
import { es } from './seed/es';
import { en } from './seed/en';

const dictionary: Record<Locale, PortfolioContent> = { es, en };

export function getContent(locale: Locale): PortfolioContent {
  return dictionary[locale];
}
