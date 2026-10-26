import { useEffect } from 'react';
import { navigation } from '@/data/navigation';

export function useSectionGlow(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const sections = navigation
      .map(({ id }) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];
        if (visible) {
          document.documentElement.dataset.activeSection = visible.target.id;
        }
      },
      { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.15, 0.3] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [enabled]);
}
