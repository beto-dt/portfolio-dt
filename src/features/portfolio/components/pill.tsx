import { Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '150ms' } as object) : null;

/** Decorative tech pill; brightens on hover (not a link — default cursor). */
export function Pill({ label }: { label: string }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          backgroundColor: hovered ? colors.borderStrong : colors.surfaceStrong,
          borderWidth: 1,
          borderColor: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
          borderRadius: radii.sm + 1,
          paddingHorizontal: 11,
          paddingVertical: 5,
        },
        webTransition as object,
      ]}
    >
      <Text style={{ fontSize: 12.5, color: 'rgb(223,226,230)', fontFamily: fonts.body }}>{label}</Text>
    </Pressable>
  );
}
