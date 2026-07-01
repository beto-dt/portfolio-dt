import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ServiceCard } from './service-card';
import { useI18n } from '@/i18n/i18n-provider';

export function ServicesSection() {
  const { content } = useI18n();
  const { services } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <SectionHeading kicker={services.kicker} heading={services.heading} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {services.items.map((item) => (
          <ServiceCard key={item.index} item={item} />
        ))}
      </View>
    </Container>
  );
}
