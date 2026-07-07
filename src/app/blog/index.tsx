import Head from 'expo-router/head';
import { usePageTitle } from '@/ui/use-page-title';
import { BlogPage } from '@/features/portfolio/pages/blog-page';

const TITLE = 'Blog — Luis De La Torre';
const DESCRIPTION = 'Artículos sobre desarrollo web y móvil, arquitectura, IA y carrera — por Luis De La Torre.';

export default function Blog() {
  usePageTitle(TITLE);
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href="https://luisdelatorre.dev/blog" />
      </Head>
      <BlogPage />
    </>
  );
}
