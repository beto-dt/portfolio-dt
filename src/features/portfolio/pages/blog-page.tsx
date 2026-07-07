import { PageShell } from '../components/page-shell';
import { BlogListSection } from '../sections/blog/blog-list-section';
import { TrackedSection } from '@/analytics/tracked-section';

export function BlogPage() {
  return (
    <PageShell>
      <TrackedSection id="blog"><BlogListSection /></TrackedSection>
    </PageShell>
  );
}
