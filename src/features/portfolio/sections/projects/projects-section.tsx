import { View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ProjectCard } from './project-card';
import { useI18n } from '@/i18n/i18n-provider';

export function ProjectsSection() {
  const { content } = useI18n();
  const { projects } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="projects">
      <SectionHeading kicker={projects.kicker} heading={projects.heading} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {projects.items.map((item) => (
          <ProjectCard key={item.title} item={item} />
        ))}
      </View>
    </Container>
  );
}
