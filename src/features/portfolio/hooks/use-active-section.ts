import { useEffect, useState } from 'react';

/** Scroll-spy: returns the anchor id of the section currently in view.
 *  Web only (IntersectionObserver); returns null on native/SSR. */
export function useActiveSection(anchors: string[]): string | null {
  const [active, setActive] = useState<string | null>(null);
  const key = anchors.join(',');

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const list = anchors;
    const elements = list.map((a) => document.getElementById(a)).filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    // A thin detector band near the top (below the header). A section counts as
    // "current" while it crosses that band — robust for tall sections where an
    // intersectionRatio approach would stay near zero.
    const intersecting = new Map<string, boolean>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          intersecting.set((entry.target as HTMLElement).id, entry.isIntersecting);
        }
        // First section (in document order) currently crossing the band.
        const current = list.find((a) => intersecting.get(a) === true) ?? null;
        setActive(current);
      },
      { threshold: 0, rootMargin: '-72px 0px -70% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
