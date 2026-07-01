import type { Locale } from '@/i18n/locales';
import type { PortfolioContent } from '@/content/types';
import { assertPortfolioContent } from '@/content/validate';

export async function loadContent(locale: Locale): Promise<PortfolioContent> {
  const fb = await import('./firebase-client');
  const data = await fb.readContentDoc(locale);
  if (!data) throw new Error(`content/${locale} no existe`);
  assertPortfolioContent(data, `content/${locale}`);
  return data;
}

export async function saveSection<K extends keyof PortfolioContent>(
  locale: Locale,
  key: K,
  value: PortfolioContent[K],
): Promise<void> {
  const fb = await import('./firebase-client');
  await fb.writeContentSection(locale, key as string, value);
}
