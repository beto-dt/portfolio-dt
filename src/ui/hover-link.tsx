import { Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { colors, fonts } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

export function HoverLink({
  label,
  onPress,
  color = colors.textMuted,
  hoverColor = colors.text,
  size = 13.5,
  mono = false,
}: {
  label: string;
  onPress: () => void;
  color?: string;
  hoverColor?: string;
  size?: number;
  mono?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={webCursor as object}>
      {({ hovered }: HoverState) => (
        <Text style={{ fontSize: size, fontFamily: mono ? fonts.mono : fonts.body, color: hovered ? hoverColor : color }}>{label}</Text>
      )}
    </Pressable>
  );
}
