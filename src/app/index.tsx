import Head from 'expo-router/head';
import { HomePage } from '@/features/portfolio/pages/home-page';

const TITLE = 'Luis De La Torre — Senior Full-Stack & Mobile Developer';
const DESCRIPTION =
  'Desarrollador Senior Full-Stack & Mobile con 7+ años construyendo apps móviles, plataformas web escalables, experiencias de Realidad Aumentada y microservicios. Quito, Ecuador · disponible remoto en español e inglés.';
const URL = 'https://luisdelatorre.dev/';
const OG_IMAGE = 'https://luisdelatorre.dev/og.png';

export default function Index() {
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={URL} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={URL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:site_name" content="Luis De La Torre" />
        <meta property="og:locale" content="es_EC" />
        <meta property="og:locale:alternate" content="en_US" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content={OG_IMAGE} />
      </Head>
      <HomePage />
    </>
  );
}
