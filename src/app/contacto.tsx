import Head from 'expo-router/head';
import { usePageTitle } from '@/ui/use-page-title';
import { ContactPage } from '@/features/portfolio/pages/contact-page';

const TITLE = 'Contacto — Luis De La Torre';
const DESCRIPTION = 'Cuéntame tu proyecto y agenda una llamada gratuita de 30 minutos. Respondo en menos de 24 horas.';

export default function Contacto() {
  usePageTitle(TITLE);
  return (
    <>
      <Head>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href="https://luisdelatorre.dev/contacto" />
      </Head>
      <ContactPage />
    </>
  );
}
