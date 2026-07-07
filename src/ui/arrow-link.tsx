import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { colors, fonts } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const ctaTransition = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const arrowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'transform', transitionDuration: '160ms' } as object) : null;

/** Mono accent label + arrow that nudges right on hover. */
export function ArrowLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ alignSelf: 'flex-start' }}>
      {({ hovered }: HoverState) => (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={[{ fontFamily: fonts.mono, fontSize: 12.5, color: hovered ? '#eeed6b' : colors.accent }, ctaTransition as object]}>{label}</Text>
          <Text style={[{ fontFamily: fonts.mono, fontSize: 12.5, color: hovered ? '#eeed6b' : colors.accent, transform: [{ translateX: hovered ? 3 : 0 }] }, arrowTransition as object]}>→</Text>
        </View>
      )}
    </Pressable>
  );
}
