import type { ReactNode } from 'react';
import { Platform, Pressable, type PressableStateCallbackType, type ViewStyle } from 'react-native';
import { colors } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webTransition = Platform.OS === 'web'
  ? ({ transitionProperty: 'transform, border-color, background-color', transitionDuration: '180ms' } as object)
  : null;

export function HoverCard({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        style,
        hovered ? { transform: [{ translateY: -2 }], borderColor: colors.borderStrong, backgroundColor: colors.surfaceStrong } : null,
        webTransition as object,
      ]}
    >
      {children}
    </Pressable>
  );
}
