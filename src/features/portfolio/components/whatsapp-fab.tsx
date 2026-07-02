import { Linking, Platform, Pressable, Text, type PressableStateCallbackType } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const fabWeb = Platform.OS === 'web'
  ? ({ position: 'fixed', cursor: 'pointer', transitionProperty: 'transform, background-color, box-shadow', transitionDuration: '160ms' } as object)
  : null;
const fabGlowWeb = Platform.OS === 'web' ? ({ boxShadow: '0 10px 30px rgba(228,227,87,0.35)' } as object) : null;

/** Floating WhatsApp pill, fixed bottom-right on web (absolute fallback native). */
export function WhatsAppFab() {
  const { content } = useI18n();
  const { contact } = content;
  return (
    <Pressable
      onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}`)}
      style={({ hovered, pressed }: HoverState) => [
        {
          position: 'absolute',
          bottom: 24,
          right: 24,
          zIndex: 50,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
          backgroundColor: hovered ? '#eeed6b' : colors.accent,
          borderRadius: 999,
          paddingHorizontal: 18,
          paddingVertical: 12,
          opacity: pressed ? 0.85 : 1,
          transform: [{ scale: hovered ? 1.04 : 1 }],
        },
        fabWeb as object,
        fabGlowWeb as object,
      ]}
    >
      <Text style={{ fontSize: 16, color: colors.onAccent }}>✆</Text>
      <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.onAccent }}>WhatsApp</Text>
    </Pressable>
  );
}
