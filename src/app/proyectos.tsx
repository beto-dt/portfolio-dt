import Head from 'expo-router/head';
import { usePageTitle } from '@/ui/use-page-title';
import { ProjectsPage } from '@/features/portfolio/pages/projects-page';

const TITLE = 'Proyectos — Luis De La Torre';
const DESCRIPTION = 'Proyectos destacados en fintech, IoT, telecom, e-commerce y AR — con recomendaciones de colegas, certificaciones y formación.';

export default function Proyectos() {
  usePageTitle(TITLE);
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href="https://luisdelatorre.dev/proyectos" />
      </Head>
      <ProjectsPage />
    </>
  );
}
