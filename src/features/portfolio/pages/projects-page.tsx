import { PageShell } from '../components/page-shell';
import { ProjectsSection } from '../sections/projects/projects-section';
import { TestimonialsSection } from '../sections/testimonials/testimonials-section';
import { FormationSection } from '../sections/formation/formation-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function ProjectsPage() {
  return (
    <PageShell>
      <TrackedSection id="projects"><ProjectsSection /></TrackedSection>
      <TrackedSection id="testimonials"><TestimonialsSection /></TrackedSection>
      <TrackedSection id="formation"><FormationSection /></TrackedSection>
    </PageShell>
  );
}
