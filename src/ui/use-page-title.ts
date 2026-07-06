import { useEffect } from 'react';

/**
 * Keeps document.title in sync on client-side route changes.
 * expo-router's <Head> only renders into the static export, so SPA
 * navigations would otherwise keep the previously loaded page's title.
 */
export function usePageTitle(title: string): void {
  useEffect(() => {
    if (typeof document !== 'undefined') document.title = title;
  }, [title]);
}
