import { PageShell } from '../components/page-shell';
import { HeroSection } from '../sections/hero/hero-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function HomePage() {
  return (
    <PageShell>
      <TrackedSection id="hero"><HeroSection /></TrackedSection>
    </PageShell>
  );
}
