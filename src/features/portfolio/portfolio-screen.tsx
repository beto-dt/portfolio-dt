import { ScrollView, View } from 'react-native';
import { SiteHeader } from './components/site-header';
import { HeroSection } from './sections/hero/hero-section';
import { ServicesSection } from './sections/services/services-section';
import { ImpactSection } from './sections/impact/impact-section';
import { StackSection } from './sections/stack/stack-section';
import { ExperienceSection } from './sections/experience/experience-section';
import { ProjectsSection } from './sections/projects/projects-section';
import { CertificationsSection } from './sections/certifications/certifications-section';
import { ContactSection } from './sections/contact/contact-section';
import { colors } from '@/theme/tokens';

export function PortfolioScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SiteHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 88 }}>
        <HeroSection />
        <ServicesSection />
        <ImpactSection />
        <StackSection />
        <ExperienceSection />
        <ProjectsSection />
        <CertificationsSection />
        <ContactSection />
      </ScrollView>
    </View>
  );
}
