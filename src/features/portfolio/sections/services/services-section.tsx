import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ServiceCard } from './service-card';
import { useI18n } from '@/i18n/i18n-provider';
import { Reveal } from '@/ui/reveal';

export function ServicesSection() {
  const { content } = useI18n();
  const { services } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="services">
      <Reveal delay={0}>
        <SectionHeading kicker={services.kicker} heading={services.heading} />
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {services.items.map((item, i) => (
          <Reveal key={item.index} delay={i * 70} style={{ flexGrow: 1, flexBasis: 320, maxWidth: 560 }}>
            <ServiceCard item={item} requestCta={services.requestCta} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
