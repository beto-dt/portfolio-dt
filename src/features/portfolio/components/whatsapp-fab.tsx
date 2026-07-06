import { useEffect, useRef } from 'react';
import { Animated, Linking, Platform, Pressable, Text, type PressableStateCallbackType, useWindowDimensions } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const fabFixedWeb = Platform.OS === 'web' ? ({ position: 'fixed' } as object) : null;
const fabInteractiveWeb = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'transform, background-color, box-shadow', transitionDuration: '160ms' } as object)
  : null;
const fabGlowWeb = Platform.OS === 'web' ? ({ boxShadow: '0 10px 30px rgba(228,227,87,0.35)' } as object) : null;

const PULSE_INTERVAL_MS = 30000;
const FIRST_PULSE_MS = 5000;

/** Floating WhatsApp pill; pulses an accent ring every 30 s to draw attention. */
export function WhatsAppFab() {
  const { width } = useWindowDimensions();
  const narrow = width < 640;
  const { content } = useI18n();
  const { contact } = content;
  const ring = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    const pulse = () =>
      Animated.parallel([
        Animated.sequence([
          Animated.timing(ring, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(ring, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(ring, { toValue: 1, duration: 600, useNativeDriver: true }),
          Animated.timing(ring, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(bounce, { toValue: 1, duration: 150, useNativeDriver: true }),
          Animated.timing(bounce, { toValue: 0, duration: 150, useNativeDriver: true }),
        ]),
      ]).start();
    const first = setTimeout(pulse, FIRST_PULSE_MS);
    const every = setInterval(pulse, PULSE_INTERVAL_MS);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, [ring, bounce]);

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: narrow ? 96 : 24,
          right: 24,
          zIndex: 50,
          transform: [{ scale: bounce.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }],
        },
        fabFixedWeb as object,
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: colors.accent,
          opacity: ring.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
          transform: [{ scale: ring.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] }) }],
        }}
      />
      <Pressable
        onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}`)}
        style={({ hovered, pressed }: HoverState) => [
          {
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
          fabInteractiveWeb as object,
          fabGlowWeb as object,
        ]}
      >
        <Text style={{ fontSize: 16, color: colors.onAccent }}>✆</Text>
        <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 14, color: colors.onAccent }}>WhatsApp</Text>
      </Pressable>
    </Animated.View>
  );
}
