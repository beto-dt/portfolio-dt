import admin from 'firebase-admin';
import { seedPosts } from '../src/content/seed/posts';

// One-off seed: creates posts/<slug> as published unless it already exists.
// Usage: npx tsx scripts/seed-post.ts <slug>
async function main() {
  const slug = process.argv[2];
  const post = seedPosts.find((p) => p.slug === slug);
  if (!post) {
    throw new Error(`Unknown post "${slug}". Known: ${seedPosts.map((p) => p.slug).join(', ')}`);
  }

  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId: 'luisdelatorre-portfolio',
  });
  const ref = admin.firestore().doc(`posts/${slug}`);
  if ((await ref.get()).exists) {
    console.log(`posts/${slug} already exists — skipping`);
    return;
  }
  const { slug: _slug, ...data } = post;
  await ref.set({
    status: 'published',
    ...data,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`Seeded posts/${slug}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
