import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import admin from 'firebase-admin';
import { assertPortfolioContent } from '../src/content/validate';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();
const OUT_DIR = resolve('src/content/published');

async function pull(locale: 'es' | 'en') {
  const snap = await db.doc(`content/${locale}`).get();
  if (!snap.exists) throw new Error(`Firestore doc content/${locale} not found`);
  const data = snap.data();
  assertPortfolioContent(data, `content/${locale}`);
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(`${OUT_DIR}/${locale}.json`, JSON.stringify(data, null, 2) + '\n');
  console.log(`Wrote src/content/published/${locale}.json`);
}


type PulledPost = {
  slug: string;
  publishedAt: string;
  tags: string[];
  es: { title: string; excerpt: string; content: string };
  en: { title: string; excerpt: string; content: string };
};

const SITE = 'https://luisdelatorre.dev';
const STATIC_ROUTES: { path: string; priority: string }[] = [
  { path: '/', priority: '1.0' },
  { path: '/servicios', priority: '0.8' },
  { path: '/sobre-mi', priority: '0.8' },
  { path: '/proyectos', priority: '0.8' },
  { path: '/contacto', priority: '0.8' },
  { path: '/blog', priority: '0.8' },
];

function writeSitemap(posts: PulledPost[]) {
  const urls = [
    ...STATIC_ROUTES.map(
      (r) => `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <changefreq>monthly</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
    ),
    ...posts.map(
      (p) => `  <url>\n    <loc>${SITE}/blog/${p.slug}</loc>\n    <lastmod>${p.publishedAt}</lastmod>\n    <priority>0.6</priority>\n  </url>`,
    ),
  ];
  writeFileSync(
    resolve('public/sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`,
  );
  console.log(`Wrote public/sitemap.xml (${STATIC_ROUTES.length + posts.length} urls)`);
}

async function pullPosts() {
  const snap = await db.collection('posts').where('status', '==', 'published').get();
  const posts = snap.docs.map((d) => {
    const { createdAt: _c, updatedAt: _u, status: _s, ...rest } = d.data();
    return { ...rest, slug: d.id } as PulledPost;
  });
  for (const p of posts) {
    if (!p.slug || typeof p.publishedAt !== 'string' || !p.es?.title || !p.en?.title) {
      throw new Error(`posts/${p.slug}: invalid published post shape`);
    }
  }
  posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  writeFileSync(`${OUT_DIR}/posts.json`, JSON.stringify(posts, null, 2) + '\n');
  console.log(`Wrote src/content/published/posts.json (${posts.length} posts)`);
  writeSitemap(posts);
}

async function main() {
  await pull('es');
  await pull('en');
  await pullPosts();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
