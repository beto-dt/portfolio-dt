import type { ReactNode } from 'react';
import { Platform, Pressable, type PressableStateCallbackType, type ViewStyle } from 'react-native';
import { colors } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

const webTransition = Platform.OS === 'web'
  ? ({ transitionProperty: 'transform, border-color, background-color, box-shadow', transitionDuration: '180ms' } as object)
  : null;
const glowWeb = Platform.OS === 'web' ? ({ boxShadow: '0 10px 34px rgba(228,227,87,0.14)' } as object) : null;
const pressCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

/**
 * Card container that lifts + shows a soft accent glow/border on hover, and
 * passes `hovered` to children (render prop) so they can react. Default
 * cursor unless `onPress` makes the whole card clickable.
 */
export function GlowCard({ style, onPress, children }: { style?: ViewStyle; onPress?: () => void; children: (hovered: boolean) => ReactNode }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: HoverState) => [
        style,
        hovered
          ? { transform: [{ translateY: -3 }], borderColor: 'rgba(228,227,87,0.45)', backgroundColor: colors.surfaceStrong }
          : null,
        hovered ? (glowWeb as object) : null,
        webTransition as object,
        onPress ? (pressCursor as object) : null,
      ]}
    >
      {({ hovered }: HoverState) => children(!!hovered)}
    </Pressable>
  );
}
