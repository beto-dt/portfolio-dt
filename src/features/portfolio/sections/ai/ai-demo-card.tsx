import { useState } from 'react';
import { markSectionSeen } from '@/analytics/tracker';
import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { DemoModal } from '../../components/demo-modal';
import { ProjectCard } from '../projects/project-card';
import { AiChat } from './ai-chat';

const T = {
  es: {
    category: 'DEMO INTERACTIVO',
    title: 'Habla con mi agente IA',
    description:
      'Un agente que conoce mis servicios y proyectos, entiende tu idea y te ayuda a agendar una llamada. Corre sobre Gemini con topes de uso — porque una demo real también cuida los costos.',
    cta: 'Chatear ↗',
    modalTitle: 'Agente IA · demo',
    close: 'Cerrar',
  },
  en: {
    category: 'INTERACTIVE DEMO',
    title: 'Talk to my AI agent',
    description:
      'An agent that knows my services and projects, understands your idea and helps you book a call. Runs on Gemini with usage caps — because a real demo also keeps costs in check.',
    cta: 'Chat ↗',
    modalTitle: 'AI agent · demo',
    close: 'Close',
  },
};

const TECH = ['Gemini', 'Cloud Functions', 'Prompt Engineering', 'Firestore'];

/** AI-chat card of the projects grid: opens the agent in the shared demo modal. */
export function AiDemoCard() {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const t = T[locale];

  const item: ProjectItem = { category: t.category, title: t.title, description: t.description, tech: TECH };

  const openDemo = () => {
    setOpen(true);
    markSectionSeen('ai');
  };

  return (
    <>
      <ProjectCard item={item} onPress={openDemo} cta={t.cta} />
      <DemoModal visible={open} title={t.modalTitle} closeLabel={t.close} onClose={() => setOpen(false)}>
        <AiChat onNavigate={() => setOpen(false)} />
      </DemoModal>
    </>
  );
}
