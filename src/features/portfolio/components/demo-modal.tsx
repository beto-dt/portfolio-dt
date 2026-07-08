import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, Text, View, useWindowDimensions, type PressableStateCallbackType } from 'react-native';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

/**
 * Shared chrome for the interactive-demo modals (WebAR, AI chat).
 * animationType is left at 'none': RNW's animated Modal wrapper can leave
 * pointer-events:none stuck after the fade, freezing every press inside.
 * Reveal provides the fade; the backdrop is a SIBLING of the dialog because
 * nested Pressables fight over the responder on react-native-web.
 */
export function DemoModal({
  visible,
  title,
  closeLabel,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { height } = useWindowDimensions();
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <Reveal slide={false} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.72)' }}
        />
        <View
          style={{
            width: '92%',
            maxWidth: 900,
            height: Math.min(height * 0.78, 640),
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
            backgroundColor: '#0d0e11',
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.text }}>{title}</Text>
            <Pressable onPress={onClose} accessibilityLabel={closeLabel} style={[{ padding: 6 }, webCursor as object]}>
              {({ hovered }: HoverState) => (
                <Text style={{ fontSize: 18, color: hovered ? colors.accent : colors.textMuted }}>✕</Text>
              )}
            </Pressable>
          </View>
          {children}
        </View>
      </Reveal>
    </Modal>
  );
}
