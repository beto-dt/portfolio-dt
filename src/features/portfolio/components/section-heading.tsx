import { Text, View } from 'react-native';
import { colors, fonts } from '@/theme/tokens';
import { useFluidType } from '@/theme/use-fluid-type';

export function SectionHeading({ kicker, heading }: { kicker: string; heading: string }) {
  const fluid = useFluidType();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 14, marginBottom: 32, flexWrap: 'wrap' }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accent }}>/ {kicker}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: fluid.sectionHeading, letterSpacing: fluid.sectionHeadingSpacing, color: colors.text }}>
        {heading}
      </Text>
    </View>
  );
}
