import { Text, View } from 'react-native';
import type { ProjectItem } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';

export function ProjectCard({ item }: { item: ProjectItem }) {
  return (
    <View
      style={{
        flexGrow: 1,
        flexBasis: 340,
        minWidth: 300,
        minHeight: 210,
        padding: 26,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        borderRadius: 18,
      }}
    >
      <View style={{ flexDirection: 'row', marginBottom: 16 }}>
        <View
          style={{
            backgroundColor: 'rgba(228,227,87,0.12)',
            borderRadius: radii.sm,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>
            {item.category}
          </Text>
        </View>
      </View>

      <Text style={{ fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.21, color: colors.text, marginBottom: 10 }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim }}>{item.description}</Text>

      {/* marginTop:'auto' pushes the tech tags to the bottom of the card */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 'auto', paddingTop: 20 }}>
        {item.tech.map((tech) => (
          <View
            key={tech}
            style={{
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: radii.sm - 1,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, color: colors.textFainter }}>{tech}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
