import Head from 'expo-router/head';
import { usePageTitle } from '@/ui/use-page-title';
import { AboutPage } from '@/features/portfolio/pages/about-page';

const TITLE = 'Sobre mí — Luis De La Torre';
const DESCRIPTION = 'Resultados medibles, stack tecnológico, trayectoria profesional y experiencia nacional e internacional de Luis De La Torre.';

export default function SobreMi() {
  usePageTitle(TITLE);
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href="https://luisdelatorre.dev/sobre-mi" />
      </Head>
      <AboutPage />
    </>
  );
}
