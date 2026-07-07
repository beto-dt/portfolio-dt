import { PageShell } from '../components/page-shell';
import { HeroSection } from '../sections/hero/hero-section';
import { ServicesPreview } from '../sections/hero/services-preview';
import { CtaBand } from '../sections/hero/cta-band';
import { TrackedSection } from '@/analytics/tracked-section';

export function HomePage() {
  return (
    <PageShell>
      <TrackedSection id="hero"><HeroSection /></TrackedSection>
      <ServicesPreview />
      <CtaBand />
    </PageShell>
  );
}
