import { useEffect, useRef, type ReactNode } from 'react';
import { View } from 'react-native';
import { markSectionSeen } from './tracker';

export function TrackedSection({ id, children }: { id: string; children: ReactNode }) {
  const ref = useRef<View>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;
    const node = ref.current as unknown as Element | null;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            markSectionSeen(id);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [id]);
  return <View ref={ref} style={{ width: '100%' }}>{children}</View>;
}
