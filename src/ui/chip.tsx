import { Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionDuration: '150ms', transitionProperty: 'background-color, border-color' } as object) : null;

export function Chip({ label, active, onPress, mono = true }: { label: string; active: boolean; onPress: () => void; mono?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: HoverState) => [
        {
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: active ? colors.accent : hovered ? colors.borderStrong : colors.border,
          backgroundColor: active ? 'rgba(228,227,87,0.12)' : hovered ? colors.surfaceStrong : 'transparent',
          paddingHorizontal: 12,
          paddingVertical: 7,
        },
        webCursor as object,
      ]}
    >
      <Text style={{ color: active ? colors.accent : colors.text, fontSize: 12.5, fontFamily: mono ? fonts.mono : fonts.body }}>{label}</Text>
    </Pressable>
  );
}
