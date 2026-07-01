import { Text, View } from 'react-native';
import { colors, fonts } from '@/theme/tokens';

export function SectionHeading({ kicker, heading }: { kicker: string; heading: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accent }}>/ {kicker}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 34, letterSpacing: -0.6, color: colors.text }}>
        {heading}
      </Text>
    </View>
  );
}
