import Head from 'expo-router/head';
import { usePageTitle } from '@/ui/use-page-title';
import { ServicesPage } from '@/features/portfolio/pages/services-page';

const TITLE = 'Servicios — Luis De La Torre';
const DESCRIPTION = 'Desarrollo web y móvil, AR/3D, backend y microservicios, cloud, IA, chatbots y agentes inteligentes — cómo trabajo y modelos de colaboración.';

export default function Servicios() {
  usePageTitle(TITLE);
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href="https://luisdelatorre.dev/servicios" />
      </Head>
      <ServicesPage />
    </>
  );
}
