import { router } from 'expo-router';
import { scrollToAnchor } from './scroll-to-anchor';

// Which route each section anchor lives on (v2 multi-page layout).
const ROUTE_OF: Record<string, string> = {
  hero: '/',
  services: '/servicios',
  process: '/servicios',
  collaboration: '/servicios',
  impact: '/sobre-mi',
  stack: '/sobre-mi',
  experience: '/sobre-mi',
  reach: '/sobre-mi',
  projects: '/proyectos',
  testimonials: '/proyectos',
  formation: '/proyectos',
  contact: '/contacto',
  blog: '/blog',
};
// Same-route scroll targets that differ from the anchor name.
const SCROLL_ID: Record<string, string> = { hero: 'top' };

/** Navigate to the route that owns `anchor`, or scroll to it when already there. */
export function goToSection(anchor: string): void {
  const route = ROUTE_OF[anchor];
  if (!route) {
    scrollToAnchor(anchor);
    return;
  }
  const here = typeof window !== 'undefined' ? window.location.pathname : '/';
  if (here === route) {
    scrollToAnchor(SCROLL_ID[anchor] ?? anchor);
  } else {
    router.push(route as never);
  }
}
