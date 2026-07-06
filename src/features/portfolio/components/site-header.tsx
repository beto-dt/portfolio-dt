import { useEffect, useRef } from 'react';
import { Animated, Image, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { goToSection } from '@/ui/go-to-section';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;
const logoTransition = Platform.OS === 'web' ? ({ transitionProperty: 'transform', transitionDuration: '200ms' } as object) : null;

export function SiteHeader() {
  const { content, toggleLocale } = useI18n();
  const { nav } = content;

  const enter = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(enter, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [enter]);

  return (
    <Animated.View
      style={{
        opacity: enter,
        transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [-8, 0] }) }],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        columnGap: 20,
        rowGap: 12,
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.07)',
        backgroundColor: 'rgba(10,11,14,0.72)',
      }}
    >
      <Pressable onPress={() => goToSection('hero')} style={webCursor as object}>
        {({ hovered }: HoverState) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minWidth: 0, flexShrink: 1 }}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={[{ width: 36, height: 36, borderRadius: 9, transform: [{ scale: hovered ? 1.08 : 1 }] }, logoTransition as object]}
            />
            <View style={{ flexDirection: 'column', gap: 2, minWidth: 0 }}>
              <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>{nav.name}</Text>
              <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 0.6, color: colors.accent }}>{nav.role}</Text>
            </View>
          </View>
        )}
      </Pressable>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 24, flexWrap: 'wrap', flexShrink: 1 }}>
        <AppButton label={nav.languageToggleLabel} onPress={toggleLocale} variant="pill" size="sm" />
        <AppButton label={nav.cta.label} onPress={() => goToSection(nav.cta.anchor)} variant="pillPrimary" size="sm" />
      </View>
    </Animated.View>
  );
}
