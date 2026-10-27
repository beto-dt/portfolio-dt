import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { usePathname } from 'expo-router';
import { getContent } from '@/content/dictionary';
import { postLocaleForPath } from '@/content/post-locale';
import type { PortfolioContent } from '@/content/types';
import { DEFAULT_LOCALE, type Locale } from './locales';

type I18nValue = {
  locale: Locale;
  content: PortfolioContent;
  toggleLocale: () => void;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // A post can open in its own language, including in the static HTML.
  const [locale, setLocale] = useState<Locale>(() => postLocaleForPath(pathname) ?? DEFAULT_LOCALE);
  const value = useMemo<I18nValue>(
    () => ({
      locale,
      content: getContent(locale),
      toggleLocale: () => setLocale((prev) => (prev === 'es' ? 'en' : 'es')),
      setLocale,
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
