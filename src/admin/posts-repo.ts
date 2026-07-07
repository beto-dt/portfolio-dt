import type { BlogPost, PostComment } from '@/content/posts-types';

export type { BlogPost, PostComment, PostLocaleContent } from '@/content/posts-types';

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

export async function listPendingComments(): Promise<PostComment[]> {
  const fb = await import('./firebase-client');
  return fb.readPendingComments();
}

export async function approveComment(id: string): Promise<void> {
  const fb = await import('./firebase-client');
  return fb.updateCommentStatus(id, 'approved');
}

export async function deleteComment(id: string): Promise<void> {
  const fb = await import('./firebase-client');
  return fb.deleteCommentDoc(id);
}
