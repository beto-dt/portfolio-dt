import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import type { ServiceItem } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';
import { goToSection } from '@/ui/go-to-section';
import { setBookingIntent } from '../contact/booking-intent';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

// Web-only smooth transition for the tag chip bg + index color on hover.
const chipTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color', transitionDuration: '180ms' } as object) : null;
const indexTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '180ms' } as object) : null;
const ctaTransition = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const arrowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'transform', transitionDuration: '160ms' } as object) : null;

export function ServiceCard({ item, requestCta }: { item: ServiceItem; requestCta: string }) {
  return (
    <GlowCard
      style={{
        width: '100%',
        flexGrow: 1,
        padding: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
      }}
    >
      {(hovered) => (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={[{ fontFamily: fonts.mono, fontSize: 11, color: hovered ? colors.accent : colors.textFaint }, indexTransition as object]}>
              {item.index}
            </Text>
            <View style={[{ backgroundColor: hovered ? 'rgba(228,227,87,0.2)' : 'rgba(228,227,87,0.12)', borderRadius: radii.sm, paddingHorizontal: 9, paddingVertical: 4 }, chipTransition as object]}>
              <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>{item.tag}</Text>
            </View>
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 20, letterSpacing: -0.2, color: colors.text, marginBottom: 9 }}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim, fontFamily: fonts.body }}>
            {item.description}
          </Text>
          {/* marginTop:'auto' pins the CTA to the bottom of the card */}
          <View style={{ marginTop: 'auto', paddingTop: 18 }}>
            <Pressable
              onPress={() => {
                setBookingIntent({ projectType: item.projectType, model: item.recommendedModel });
                goToSection('contact');
              }}
              style={{ alignSelf: 'flex-start' }}
            >
              {({ hovered: ctaHovered }: HoverState) => (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[{ fontFamily: fonts.mono, fontSize: 12.5, color: ctaHovered ? '#eeed6b' : colors.accent }, ctaTransition as object]}>
                    {requestCta}
                  </Text>
                  <Text style={[{ fontFamily: fonts.mono, fontSize: 12.5, color: ctaHovered ? '#eeed6b' : colors.accent, transform: [{ translateX: ctaHovered ? 3 : 0 }] }, arrowTransition as object]}>
                    →
                  </Text>
                </View>
              )}
            </Pressable>
          </View>
        </>
      )}
    </GlowCard>
  );
}
