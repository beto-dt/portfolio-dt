export const VISIT_ENDPOINT = '/api/visit';

export const SECTION_IDS = [
  'hero',
  'services',
  'impact',
  'stack',
  'experience',
  'projects',
  'certifications',
  'contact',
] as const;

export type SectionId = (typeof SECTION_IDS)[number];
