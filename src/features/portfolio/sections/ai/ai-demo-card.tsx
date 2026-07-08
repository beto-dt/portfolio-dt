import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { DemoProjectCard } from '../../components/demo-project-card';
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
  const t = T[locale];
  const item: ProjectItem = { category: t.category, title: t.title, description: t.description, tech: TECH };

  return (
    <DemoProjectCard item={item} cta={t.cta} modalTitle={t.modalTitle} closeLabel={t.close} analyticsKey="ai">
      {(close) => <AiChat onNavigate={close} />}
    </DemoProjectCard>
  );
}
