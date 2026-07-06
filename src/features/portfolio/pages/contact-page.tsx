import { PageShell } from '../components/page-shell';
import { ContactSection } from '../sections/contact/contact-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function ContactPage() {
  return (
    <PageShell>
      <TrackedSection id="contact"><ContactSection /></TrackedSection>
    </PageShell>
  );
}
