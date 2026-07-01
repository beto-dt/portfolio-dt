import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { colors } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;
const underlineTransition = Platform.OS === 'web'
  ? ({ transformOrigin: 'left', transitionProperty: 'transform', transitionDuration: '200ms' } as object)
  : null;

export function NavLink({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={webCursor as object}>
      {({ hovered }: HoverState) => {
        const on = hovered || active;
        return (
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 13.5, color: active ? colors.accent : hovered ? colors.text : colors.textMuted }}>{label}</Text>
            <View style={[{ height: 2, borderRadius: 2, backgroundColor: colors.accent, transform: [{ scaleX: on ? 1 : 0 }] }, underlineTransition as object]} />
          </View>
        );
      }}
    </Pressable>
  );
}
