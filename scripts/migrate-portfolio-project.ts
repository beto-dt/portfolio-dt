import { runMergeMigration } from './lib/merge-sections';

// One-off migration: merge ONLY the projects section (adds the "Este
// portfolio" / "This portfolio" item). Published mirrors were verified
// identical to the seed before this overwrite, so no admin edits are lost.
runMergeMigration('projects', (seed) => ({ projects: seed.projects }));
