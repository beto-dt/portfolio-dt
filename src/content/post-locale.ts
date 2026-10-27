import postsJson from '@/content/published/posts.json';
import type { PublishedPost } from '@/content/posts-types';
import type { Locale } from '@/i18n/locales';

const posts = postsJson as PublishedPost[];

/** Language a /blog/<slug> path opens in, when that post sets one. */
export function postLocaleForPath(pathname: string): Locale | undefined {
  const slug = /^\/blog\/([^/]+)\/?$/.exec(pathname)?.[1];
  return slug ? posts.find((p) => p.slug === slug)?.lang : undefined;
}
