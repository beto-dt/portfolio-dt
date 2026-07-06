import { PageShell } from '../components/page-shell';
import { ImpactSection } from '../sections/impact/impact-section';
import { StackSection } from '../sections/stack/stack-section';
import { ExperienceSection } from '../sections/experience/experience-section';
import { GlobalReachSection } from '../sections/global-reach/global-reach-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function AboutPage() {
  return (
    <PageShell>
      <TrackedSection id="impact"><ImpactSection /></TrackedSection>
      <TrackedSection id="stack"><StackSection /></TrackedSection>
      <TrackedSection id="experience"><ExperienceSection /></TrackedSection>
      <TrackedSection id="reach"><GlobalReachSection /></TrackedSection>
    </PageShell>
  );
}
