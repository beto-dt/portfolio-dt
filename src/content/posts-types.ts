export type PostLocaleContent = { title: string; excerpt: string; content: string };

export type BlogPost = {
  slug: string; // doc id, kebab-case
  status: 'draft' | 'published';
  publishedAt: string; // YYYY-MM-DD
  tags: string[];
  es: PostLocaleContent;
  en: PostLocaleContent;
};

/** Shape of src/content/published/posts.json entries (always published). */
export type PublishedPost = Omit<BlogPost, 'status'>;
