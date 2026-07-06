import { useEffect, useRef } from 'react';
import { Animated, Linking, Platform, Text, View } from 'react-native';
import { Container } from '../../components/container';
import { Pill } from '../../components/pill';
import { useCountUp } from '../../hooks/use-count-up';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { useFluidType } from '@/theme/use-fluid-type';
import { AppButton } from '@/ui/app-button';
import { Reveal } from '@/ui/reveal';
import { goToSection } from '@/ui/go-to-section';

function prefersReducedMotion(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Web-only radial glow behind the hero content. Decorative, non-interactive.
const backdropWeb =
  Platform.OS === 'web'
    ? ({
        backgroundImage:
          'radial-gradient(620px 380px at 12% 8%, rgba(228,227,87,0.10), rgba(228,227,87,0) 70%)',
      } as object)
    : null;

const accentGlowWeb = Platform.OS === 'web' ? ({ textShadow: '0 0 26px rgba(228,227,87,0.35)' } as object) : null;

function HeroBackdrop() {
  if (Platform.OS !== 'web') return null;
  return (
    <View
      pointerEvents="none"
      style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, backdropWeb as object]}
    />
  );
}

/** Pulsing availability dot (opacity loop); static under reduced motion. */
function AvailabilityDot() {
  const reduce = prefersReducedMotion();
  const pulse = useRef(new Animated.Value(reduce ? 1 : 0.35)).current;
  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.35, duration: 900, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduce]);
  return <Animated.View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: colors.accent, opacity: pulse }} />;
}

/** One stat cell; owns a useCountUp call (hooks need a component boundary). */
function StatValue({ value }: { value: string }) {
  const shown = useCountUp(value);
  return <Text style={{ fontFamily: fonts.displayBold, fontSize: 30, color: '#ffffff' }}>{shown}</Text>;
}

export function HeroSection() {
  const { content } = useI18n();
  const { hero } = content;
  const fluid = useFluidType();

  return (
    <Container style={{ paddingVertical: 88 }}>
      <HeroBackdrop />
      <View style={{ gap: 34 }}>
        <Reveal delay={0} style={{ alignSelf: 'flex-start' }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 9,
              backgroundColor: 'rgba(255,255,255,0.04)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.1)',
              borderRadius: radii.pill,
              paddingHorizontal: 13,
              paddingVertical: 7,
            }}
          >
            <AvailabilityDot />
            <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, letterSpacing: 0.4, color: 'rgb(201,205,212)' }}>
              {hero.availability}
            </Text>
          </View>
        </Reveal>

        <Reveal delay={80}>
          <Text style={{ fontFamily: fonts.display, fontSize: fluid.heroTitle, lineHeight: fluid.heroTitleLineHeight, letterSpacing: fluid.heroTitleSpacing, color: colors.text }}>
            {hero.titleLead} <Text style={[{ color: colors.accent }, accentGlowWeb as object]}>{hero.titleAccent}</Text>
          </Text>
        </Reveal>

        <Reveal delay={160}>
          <Text style={{ fontSize: fluid.heroSubtitle, lineHeight: fluid.heroSubtitleLineHeight, color: colors.textMuted, maxWidth: 640, fontFamily: fonts.body }}>
            {hero.subtitle}
          </Text>
        </Reveal>

        <Reveal delay={240}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
            <AppButton label={hero.primaryCta.label} onPress={() => goToSection(hero.primaryCta.anchor)} variant="primary" />
            <AppButton label={hero.secondaryCta.label} onPress={() => goToSection(hero.secondaryCta.anchor)} variant="outline" />
            <AppButton label={`↓ ${hero.cvLabel}`} onPress={() => Linking.openURL(hero.cvUrl)} variant="outline" />
          </View>
        </Reveal>

        <Reveal delay={320}>
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 40,
              marginTop: 26,
              paddingTop: 30,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            {hero.stats.map((stat) => (
              <View key={stat.label} style={{ gap: 4 }}>
                <StatValue value={stat.value} />
                <Text style={{ fontSize: 12.5, color: colors.textFainter, maxWidth: 160 }}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </Reveal>

        <Reveal delay={400}>
          <View style={{ gap: 12 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>
              {hero.clientsHeading}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {hero.clients.map((client) => (
                <Pill key={client} label={client} />
              ))}
            </View>
          </View>
        </Reveal>
      </View>
    </Container>
  );
}
