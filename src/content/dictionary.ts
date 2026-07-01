import type { Locale } from '@/i18n/locales';
import type { PortfolioContent } from './types';
import { assertPortfolioContent } from './validate';
import esJson from './published/es.json';
import enJson from './published/en.json';

assertPortfolioContent(esJson, 'published/es');
assertPortfolioContent(enJson, 'published/en');

const dictionary: Record<Locale, PortfolioContent> = {
  es: esJson as unknown as PortfolioContent,
  en: enJson as unknown as PortfolioContent,
};

export function getContent(locale: Locale): PortfolioContent {
  return dictionary[locale];
}
