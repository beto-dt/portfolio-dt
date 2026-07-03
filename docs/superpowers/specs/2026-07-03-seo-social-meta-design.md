# SEO + Social Cards — Design

**Date:** 2026-07-03
**Status:** Approved (design)

## Goal

The live site currently ships an empty `<title>`, no description, no Open
Graph/Twitter tags, `lang="en"`, and 404s on robots.txt/sitemap.xml — shared
links render blank cards and Google indexes it poorly. This feature makes
luisdelatorre.dev promotable: static meta in the exported HTML, a branded
1200×630 OG image, JSON-LD, robots.txt and sitemap.xml.

## Decisions (agreed with user)

- Meta texts are hardcoded (not CMS): they live in the static HTML shell, so
  changing them requires a redeploy anyway. Spanish as primary (`lang="es"`,
  `og:locale es_EC`, alternate `en_US`).
- OG image generated once with PIL from the repo's real fonts (Space Grotesk /
  JetBrains Mono TTFs in node_modules) and committed to `public/og.png`.
- `/admin` gets `noindex,nofollow` + robots.txt `Disallow: /admin`.
- Docs verified (docs.expo.dev/router/web/static-rendering.md): the shell is
  customized via `src/app/+html.tsx` (Node-only component, must keep
  `ScrollViewStyleReset`); per-page meta via `Head` from `expo-router/head`,
  statically rendered into the export.

## Architecture

### `src/app/+html.tsx` (new)

```tsx
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
```

### `src/app/index.tsx` — public meta via `Head`

```tsx
import Head from 'expo-router/head';
import { PortfolioScreen } from '@/features/portfolio/portfolio-screen';

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
      <PortfolioScreen />
    </>
  );
}
```

### `src/app/admin/index.tsx` — noindex

```tsx
import Head from 'expo-router/head';
import { AdminScreen } from '@/admin/screens/admin-screen';

export default function Admin() {
  return (
    <>
      <Head>
        <title>Console — Luis De La Torre</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <AdminScreen />
    </>
  );
}
```

### OG image (`public/og.png`, 1200×630)

One-off PIL script (scratchpad, not committed; the PNG is committed):
background `#0a0b0e`; subtle 48px grid lines `rgba(255,255,255,0.03)`; a soft
radial accent glow top-center; the rook logo (`src/assets/images/logo.png`)
~96px in a rounded surface box top-left area; centered-left text block:
`Luis De La Torre` in SpaceGrotesk_700Bold ~84px white; below it
`SENIOR FULL-STACK & MOBILE DEVELOPER` in JetBrainsMono_400Regular ~30px
accent `#e4e357` letter-spaced; below `Web · Móvil · AR/3D · Microservicios ·
IA` in IBMPlexSans_400Regular ~26px `#9aa0a6`; bottom-left
`luisdelatorre.dev` mono ~24px accent. Fonts loaded from
`node_modules/@expo-google-fonts/*/`.

### `public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /admin

Sitemap: https://luisdelatorre.dev/sitemap.xml
```

### `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://luisdelatorre.dev/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
```

## Error handling

None at runtime — everything is static. If `Head` duplicated tags on
navigation it would be visible in preview (verify only one `<title>`).

## Testing / verification

- `npx tsc --noEmit` + `npx expo export -p web`.
- **Static output check** (the SEO payload must be in the HTML, not just JS):
  grep `dist/index.html` for `<title>Luis De La Torre`, `og:image`,
  `application/ld+json`, `lang="es"`; grep `dist/admin.html` (or
  `dist/admin/index.html`) for `noindex`. `dist/og.png`, `dist/robots.txt`,
  `dist/sitemap.xml` exist; og.png is 1200×630.
- Preview: `document.title` correct on `/`, meta og:title present, admin shows
  noindex meta.
- Live after deploy: `curl` the HTML head for the tags; robots/sitemap/og.png
  return 200. Then hand the user Search Console setup steps.

## Implementation order

1. OG image + robots + sitemap (public/). 2. `+html.tsx` + Head in routes.
3. Verify export + preview. 4. Deploy + live check + Search Console guide.
