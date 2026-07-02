import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { SiteHeader } from './components/site-header';
import { HeroSection } from './sections/hero/hero-section';
import { ServicesSection } from './sections/services/services-section';
import { ProcessSection } from './sections/process/process-section';
import { ImpactSection } from './sections/impact/impact-section';
import { StackSection } from './sections/stack/stack-section';
import { ExperienceSection } from './sections/experience/experience-section';
import { ProjectsSection } from './sections/projects/projects-section';
import { FormationSection } from './sections/formation/formation-section';
import { ContactSection } from './sections/contact/contact-section';
import { CollaborationSection } from './sections/collaboration/collaboration-section';
import { SiteFooter } from './components/site-footer';
import { WhatsAppFab } from './components/whatsapp-fab';
import { TrackedSection } from '@/analytics/tracked-section';
import { armVisit } from '@/analytics/tracker';
import { colors } from '@/theme/tokens';

export function PortfolioScreen() {
  useEffect(() => {
    armVisit();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SiteHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 88 }}>
        <TrackedSection id="hero"><HeroSection /></TrackedSection>
        <TrackedSection id="services"><ServicesSection /></TrackedSection>
        <TrackedSection id="process"><ProcessSection /></TrackedSection>
        <TrackedSection id="collaboration"><CollaborationSection /></TrackedSection>
        <TrackedSection id="impact"><ImpactSection /></TrackedSection>
        <TrackedSection id="stack"><StackSection /></TrackedSection>
        <TrackedSection id="experience"><ExperienceSection /></TrackedSection>
        <TrackedSection id="projects"><ProjectsSection /></TrackedSection>
        <TrackedSection id="formation"><FormationSection /></TrackedSection>
        <TrackedSection id="contact"><ContactSection /></TrackedSection>
        <SiteFooter />
      </ScrollView>
      <WhatsAppFab />
    </View>
  );
}
