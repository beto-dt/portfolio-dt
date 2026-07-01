import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { getContent } from '@/content/dictionary';
import type { PortfolioContent } from '@/content/types';
import { DEFAULT_LOCALE, type Locale } from './locales';

type I18nValue = {
  locale: Locale;
  content: PortfolioContent;
  toggleLocale: () => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      content: getContent(locale),
      toggleLocale: () => setLocale((prev) => (prev === 'es' ? 'en' : 'es')),
    }),
    [locale],
  );
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error('useI18n must be used within I18nProvider');
  return value;
}
