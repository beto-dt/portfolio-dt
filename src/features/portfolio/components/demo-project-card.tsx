import { useState, type ReactNode } from 'react';
import { markSectionSeen } from '@/analytics/tracker';
import type { ProjectItem } from '@/content/types';
import { ProjectCard } from '../sections/projects/project-card';
import { DemoModal } from './demo-modal';

/**
 * Shared shell for the interactive-demo cards (WebAR, AI chat): a ProjectCard
 * that opens a DemoModal and marks its analytics section on open. `children`
 * receives a close() callback so demo content can dismiss the modal itself.
 */
export function DemoProjectCard({
  item,
  cta,
  modalTitle,
  closeLabel,
  analyticsKey,
  children,
}: {
  item: ProjectItem;
  cta: string;
  modalTitle: string;
  closeLabel: string;
  analyticsKey: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);

  const openDemo = () => {
    setOpen(true);
    markSectionSeen(analyticsKey);
  };

  return (
    <>
      <ProjectCard item={item} onPress={openDemo} cta={cta} />
      <DemoModal visible={open} title={modalTitle} closeLabel={closeLabel} onClose={() => setOpen(false)}>
        {children(() => setOpen(false))}
      </DemoModal>
    </>
  );
}
