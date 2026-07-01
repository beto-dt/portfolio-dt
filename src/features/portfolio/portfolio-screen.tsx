import { ScrollView, View } from 'react-native';
import { SiteHeader } from './components/site-header';
import { HeroSection } from './sections/hero/hero-section';
import { ServicesSection } from './sections/services/services-section';
import { colors } from '@/theme/tokens';

export function PortfolioScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <SiteHeader />
      <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 88 }}>
        <HeroSection />
        <ServicesSection />
        {/* TODO: ImpactSection, StackSection, ExperienceSection, ProjectsSection,
            CertificationsSection, ContactSection — data ready in content/{es,en}.ts,
            replicate the Container + SectionHeading pattern above. */}
      </ScrollView>
    </View>
  );
}
