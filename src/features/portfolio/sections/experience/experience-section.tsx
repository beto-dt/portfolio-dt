import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ExperienceItem } from './experience-item';
import { useI18n } from '@/i18n/i18n-provider';

export function ExperienceSection() {
  const { content } = useI18n();
  const { experience } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="experience">
      <SectionHeading kicker={experience.kicker} heading={experience.heading} />
      <View>
        {experience.items.map((item) => (
          <ExperienceItem key={`${item.company}-${item.period}`} item={item} />
        ))}
      </View>
    </Container>
  );
}
