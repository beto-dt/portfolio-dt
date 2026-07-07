import { useEffect } from 'react';
import Head from 'expo-router/head';
import { router, useLocalSearchParams } from 'expo-router';
import postsJson from '@/content/published/posts.json';
import { usePageTitle } from '@/ui/use-page-title';
import { BlogPostPage } from '@/features/portfolio/pages/blog-post-page';
import type { PublishedPost } from '@/content/posts-types';

const posts = postsJson as PublishedPost[];

export function generateStaticParams(): { slug: string }[] {
  return posts.map((p) => ({ slug: p.slug }));
}

export default function BlogPost() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const post = posts.find((p) => p.slug === slug);
  const title = post ? `${post.es.title} — Luis De La Torre` : 'Blog — Luis De La Torre';
  usePageTitle(title);

  useEffect(() => {
    if (!post) router.replace('/blog' as never);
  }, [post]);

  if (!post) return null;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={post.es.excerpt} />
        <link rel="canonical" href={`https://luisdelatorre.dev/blog/${post.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={post.es.excerpt} />
        <meta property="article:published_time" content={post.publishedAt} />
      </Head>
      <BlogPostPage post={post} />
    </>
  );
}
