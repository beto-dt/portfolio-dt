import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ServiceCard } from '../services/service-card';
import { useI18n } from '@/i18n/i18n-provider';
import { ArrowLink } from '@/ui/arrow-link';
import { goToSection } from '@/ui/go-to-section';
import { Reveal } from '@/ui/reveal';


/** Home teaser: first three services + link to the full /servicios page. */
export function ServicesPreview() {
  const { content } = useI18n();
  const { services } = content;

  return (
    <Container style={{ paddingVertical: 40 }}>
      <Reveal delay={0}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', columnGap: 20, rowGap: 10 }}>
          <SectionHeading kicker={services.kicker} heading={services.heading} />
          <View style={{ marginLeft: 'auto', marginBottom: 26 }}>
            <ArrowLink label={services.seeAllCta} onPress={() => goToSection('services')} />
          </View>
        </View>
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {services.items.slice(0, 3).map((item, i) => (
          <Reveal key={item.index} delay={70 + i * 70} style={{ flexGrow: 1, flexBasis: 300, maxWidth: 560 }}>
            <ServiceCard item={item} requestCta={services.requestCta} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
