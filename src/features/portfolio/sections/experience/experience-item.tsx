import { Text, View } from 'react-native';
import type { ExperienceItem as ExperienceItemContent } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';

export function ExperienceItem({ item }: { item: ExperienceItemContent }) {
  return (
    <View
      style={{
        position: 'relative',
        flexDirection: 'row',
        gap: 28,
        paddingLeft: 28,
        paddingBottom: 34,
        marginLeft: 2,
        borderLeftWidth: 1,
        borderLeftColor: 'rgba(255,255,255,0.1)',
      }}
    >
      {/* Node on the timeline line */}
      <View
        style={{
          position: 'absolute',
          left: -6,
          top: 5,
          width: 11,
          height: 11,
          borderRadius: 999,
          backgroundColor: colors.background,
          borderWidth: 2,
          borderColor: colors.accent,
        }}
      />

      <View style={{ width: 170, gap: 5 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.accent }}>{item.period}</Text>
        <Text style={{ fontSize: 12, color: colors.textFaint }}>{item.location}</Text>
        {item.current && item.currentLabel ? (
          <View
            style={{
              alignSelf: 'flex-start',
              marginTop: 2,
              backgroundColor: 'rgba(228,227,87,0.14)',
              borderRadius: radii.sm - 1,
              paddingHorizontal: 8,
              paddingVertical: 3,
            }}
          >
            <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.6, color: colors.accent }}>
              {item.currentLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ flex: 1, gap: 6 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 19, letterSpacing: -0.19, color: colors.text }}>
          {item.role}
        </Text>
        <Text style={{ fontSize: 14, color: colors.accent }}>{item.company}</Text>
        <Text style={{ marginTop: 6, fontSize: 13.5, lineHeight: 22, color: colors.textDim, maxWidth: 560 }}>
          {item.description}
        </Text>
      </View>
    </View>
  );
}
