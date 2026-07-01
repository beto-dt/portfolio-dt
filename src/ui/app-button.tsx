import { Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

type Variant = 'primary' | 'outline' | 'pill' | 'pillPrimary';
type HoverState = PressableStateCallbackType & { hovered?: boolean };

// react-native-web accepts these web-only style props; cast at the boundary.
const webInteractive = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'opacity, transform, background-color, border-color', transitionDuration: '150ms' } as object)
  : null;

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
}: {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: 'sm' | 'md';
}) {
  const isPrimary = variant === 'primary' || variant === 'pillPrimary';
  const isPill = variant === 'pill' || variant === 'pillPrimary';
  const pad = size === 'sm' ? { paddingHorizontal: 14, paddingVertical: 8 } : { paddingHorizontal: 24, paddingVertical: 13 };

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered, pressed }: HoverState) => [
        {
          borderRadius: isPill ? radii.pill : radii.md,
          borderWidth: isPrimary ? 0 : 1,
          borderColor: hovered ? 'rgba(255,255,255,0.35)' : colors.borderStrong,
          backgroundColor: isPrimary ? (hovered ? '#eeed6b' : colors.accent) : hovered ? colors.surfaceStrong : 'transparent',
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
          ...pad,
        },
        webInteractive as object,
      ]}
    >
      <Text style={{ fontSize: size === 'sm' ? 13 : 15, fontFamily: fonts.bodyMedium, color: isPrimary ? colors.onAccent : 'rgb(231,233,236)' }}>
        {label}
      </Text>
    </Pressable>
  );
}
