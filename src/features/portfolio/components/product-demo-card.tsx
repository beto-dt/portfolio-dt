import { Linking, View } from 'react-native';
import type { ProjectItem } from '@/content/types';
import { colors } from '@/theme/tokens';
import { HoverLink } from '@/ui/hover-link';
import { ProjectCard } from '../sections/projects/project-card';

/**
 * Shared shell for external product-demo cards (Ankara Spa, Vitala): a
 * ProjectCard whose footer links out to the live demo and the public repo.
 */
export function ProductDemoCard({ item, links }: { item: ProjectItem; links: { label: string; url: string }[] }) {
  return (
    <ProjectCard
      item={item}
      footer={
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 18, rowGap: 8 }}>
          {links.map((link) => (
            <HoverLink
              key={link.url}
              label={link.label}
              onPress={() => Linking.openURL(link.url)}
              color={colors.accent}
              hoverColor={colors.text}
              size={12}
              mono
            />
          ))}
        </View>
      }
    />
  );
}
