import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

const personJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Luis Alberto De La Torre Duran',
  alternateName: 'Luis De La Torre',
  jobTitle: 'Senior Full-Stack & Mobile Developer',
  url: 'https://luisdelatorre.dev',
  image: 'https://luisdelatorre.dev/og.png',
  email: 'mailto:luis.atorred24@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Quito', addressCountry: 'EC' },
  sameAs: [
    'https://www.linkedin.com/in/luis-alberto-de-la-torre-duran-752569141/',
    'https://github.com/beto-dt',
  ],
  knowsLanguage: ['es', 'en'],
});

// Static HTML shell for every page of the web export. Runs only in Node.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        <meta name="theme-color" content="#0a0b0e" />
        <ScrollViewStyleReset />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: personJsonLd }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
