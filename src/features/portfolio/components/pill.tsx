import { Text, View } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

export function Pill({ label }: { label: string }) {
  return (
    <View
      style={{
        backgroundColor: colors.surfaceStrong,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.07)',
        borderRadius: radii.sm + 1,
        paddingHorizontal: 11,
        paddingVertical: 5,
      }}
    >
      <Text style={{ fontSize: 12.5, color: 'rgb(223,226,230)', fontFamily: fonts.body }}>{label}</Text>
    </View>
  );
}
