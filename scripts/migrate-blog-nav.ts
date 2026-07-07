import { runMergeMigration } from './lib/merge-sections';

// One-off migration: merge ONLY the nav section (adds the dock.blog label).
runMergeMigration('nav', (seed) => ({ nav: seed.nav }));
