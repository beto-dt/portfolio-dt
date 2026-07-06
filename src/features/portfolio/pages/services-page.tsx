import { PageShell } from '../components/page-shell';
import { ServicesSection } from '../sections/services/services-section';
import { ProcessSection } from '../sections/process/process-section';
import { CollaborationSection } from '../sections/collaboration/collaboration-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function ServicesPage() {
  return (
    <PageShell>
      <TrackedSection id="services"><ServicesSection /></TrackedSection>
      <TrackedSection id="process"><ProcessSection /></TrackedSection>
      <TrackedSection id="collaboration"><CollaborationSection /></TrackedSection>
    </PageShell>
  );
}
