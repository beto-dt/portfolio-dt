import type { Locale } from '@/i18n/locales';
import type { PortfolioContent } from '@/content/types';
import { assertPortfolioContent } from '@/content/validate';

export async function loadContent(locale: Locale): Promise<PortfolioContent> {
  const { getFirebase } = await import('./firebase-client');
  const { doc, getDoc } = await import('firebase/firestore');
  const snap = await getDoc(doc(getFirebase().db, 'content', locale));
  if (!snap.exists()) throw new Error(`content/${locale} no existe`);
  const data = snap.data();
  assertPortfolioContent(data, `content/${locale}`);
  return data;
}

export async function saveSection<K extends keyof PortfolioContent>(
  locale: Locale,
  key: K,
  value: PortfolioContent[K],
): Promise<void> {
  const { getFirebase } = await import('./firebase-client');
  const { doc, updateDoc } = await import('firebase/firestore');
  await updateDoc(doc(getFirebase().db, 'content', locale), { [key]: value });
}
