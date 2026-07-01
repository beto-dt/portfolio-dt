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

    const ratios = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).id;
          ratios.set(id, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const a of list) {
          const r = ratios.get(a) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            best = a;
          }
        }
        setActive(best);
      },
      { threshold: [0.15, 0.5, 0.85], rootMargin: '-64px 0px -55% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return active;
}
