import { useEffect, useRef } from 'react';
import { Animated, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import type { ExperienceItem as ExperienceItemContent } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const rowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'border-left-color', transitionDuration: '180ms' } as object) : null;
const nodeTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, box-shadow', transitionDuration: '180ms' } as object) : null;
const descTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '180ms' } as object) : null;
const nodeGlowWeb = Platform.OS === 'web' ? ({ boxShadow: '0 0 12px rgba(228,227,87,0.6)' } as object) : null;

/** Timeline node: fills accent on hover; pulses a ring when it's the current role. */
function TimelineNode({ current, hovered }: { current?: boolean; hovered: boolean }) {
  const reduce = prefersReducedMotion();
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!current || reduce) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [current, reduce, pulse]);

  return (
    <View style={{ position: 'absolute', left: -6, top: 5, width: 11, height: 11 }}>
      {current && !reduce ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: 11,
            height: 11,
            borderRadius: 999,
            borderWidth: 2,
            borderColor: colors.accent,
            opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.4] }) }],
          }}
        />
      ) : null}
      <View
        style={[
          {
            width: 11,
            height: 11,
            borderRadius: 999,
            backgroundColor: hovered ? colors.accent : colors.background,
            borderWidth: 2,
            borderColor: colors.accent,
          },
          nodeTransition as object,
          hovered ? (nodeGlowWeb as object) : null,
        ]}
      />
    </View>
  );
}

export function ExperienceItem({ item }: { item: ExperienceItemContent }) {
  return (
    <Pressable>
      {({ hovered }: HoverState) => (
        <View
          style={[
            {
              position: 'relative',
              flexDirection: 'row',
              gap: 28,
              paddingLeft: 28,
              paddingBottom: 34,
              marginLeft: 2,
              borderLeftWidth: 1,
              borderLeftColor: hovered ? 'rgba(228,227,87,0.35)' : 'rgba(255,255,255,0.1)',
            },
            rowTransition as object,
          ]}
        >
          <TimelineNode current={item.current} hovered={!!hovered} />

          <View style={{ width: 170, gap: 5 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.accent }}>{item.period}</Text>
            <Text style={{ fontSize: 12, color: colors.textFaint }}>{item.location}</Text>
            {item.current && item.currentLabel ? (
              <View
                style={{
                  alignSelf: 'flex-start',
                  marginTop: 2,
                  backgroundColor: 'rgba(228,227,87,0.14)',
                  borderRadius: radii.sm - 1,
                  paddingHorizontal: 8,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.6, color: colors.accent }}>
                  {item.currentLabel}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 19, letterSpacing: -0.19, color: colors.text }}>
              {item.role}
            </Text>
            <Text style={{ fontSize: 14, color: colors.accent }}>{item.company}</Text>
            <Text style={[{ marginTop: 6, fontSize: 13.5, lineHeight: 22, color: hovered ? colors.textMuted : colors.textDim, maxWidth: 560 }, descTransition as object]}>
              {item.description}
            </Text>
          </View>
        </View>
      )}
    </Pressable>
  );
}
