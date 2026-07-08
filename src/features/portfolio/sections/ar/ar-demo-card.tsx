import { useState } from 'react';
import { markSectionSeen } from '@/analytics/tracker';
import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { DemoModal } from '../../components/demo-modal';
import { ProjectCard } from '../projects/project-card';
import { ArViewer } from './ar-viewer';

const T = {
  es: {
    category: 'DEMO INTERACTIVO',
    title: 'Realidad Aumentada en tu navegador',
    description:
      'Una torre 3D que puedes girar, acercar y — desde tu móvil — colocar en tu espacio real con un tap, sin instalar nada. Modelo generado por código y servido como WebAR.',
    cta: 'Abrir demo ↗',
    modalTitle: 'Demo WebAR',
    close: 'Cerrar',
  },
  en: {
    category: 'INTERACTIVE DEMO',
    title: 'Augmented Reality in your browser',
    description:
      'A 3D rook you can rotate, zoom and — from your phone — place in your real space with one tap, nothing to install. Model generated from code and served as WebAR.',
    cta: 'Open demo ↗',
    modalTitle: 'WebAR demo',
    close: 'Close',
  },
};

const TECH = ['WebAR', '3D', 'model-viewer', 'Scene Viewer', 'Quick Look'];

/** WebAR card of the projects grid: opens the viewer in the shared demo modal. */
export function ArDemoCard() {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const t = T[locale];

  const item: ProjectItem = { category: t.category, title: t.title, description: t.description, tech: TECH };

  const openDemo = () => {
    setOpen(true);
    markSectionSeen('ar');
  };

  return (
    <>
      <ProjectCard item={item} onPress={openDemo} cta={t.cta} />
      <DemoModal visible={open} title={t.modalTitle} closeLabel={t.close} onClose={() => setOpen(false)}>
        <ArViewer />
      </DemoModal>
    </>
  );
}
