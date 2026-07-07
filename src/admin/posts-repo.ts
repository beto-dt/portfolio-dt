import type { BlogPost } from '@/content/posts-types';

export type { BlogPost, PostLocaleContent } from '@/content/posts-types';

export async function listPosts(): Promise<BlogPost[]> {
  const fb = await import('./firebase-client');
  const posts = await fb.readPosts();
  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export async function savePost(post: BlogPost): Promise<void> {
  const fb = await import('./firebase-client');
  return fb.writePost(post);
}

export async function deletePost(slug: string): Promise<void> {
  const fb = await import('./firebase-client');
  return fb.deletePostDoc(slug);
}
