import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ProjectCard } from './project-card';
import { useI18n } from '@/i18n/i18n-provider';
import { Reveal } from '@/ui/reveal';

export function ProjectsSection() {
  const { content } = useI18n();
  const { projects } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="projects">
      <Reveal delay={0}>
        <SectionHeading kicker={projects.kicker} heading={projects.heading} />
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {projects.items.map((item, i) => (
          <Reveal key={item.title} delay={i * 70} style={{ flexGrow: 1, flexBasis: 340, minWidth: 300 }}>
            <ProjectCard item={item} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
