import type { PublishedPost } from '../../posts-types';
import { post as bankingSuperApp } from './banking-super-app-modular-architecture';
import { post as iosBuild } from './ios-build-6-hours-to-15-minutes';

/** Posts authored as code; publish one with `npx tsx scripts/seed-post.ts <slug>`. */
export const seedPosts: PublishedPost[] = [iosBuild, bankingSuperApp];
