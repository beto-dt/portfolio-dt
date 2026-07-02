import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ExperienceItem } from './experience-item';
import { useI18n } from '@/i18n/i18n-provider';
import { Reveal } from '@/ui/reveal';

export function ExperienceSection() {
  const { content } = useI18n();
  const { experience } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="experience">
      <Reveal delay={0}>
        <SectionHeading kicker={experience.kicker} heading={experience.heading} />
      </Reveal>
      <View>
        {experience.items.map((item, i) => (
          <Reveal key={`${item.company}-${item.period}`} slide={false} delay={i * 70}>
            <ExperienceItem item={item} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
