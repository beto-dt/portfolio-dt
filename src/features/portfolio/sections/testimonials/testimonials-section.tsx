import { Linking, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';
import { Reveal } from '@/ui/reveal';
import type { TestimonialItem } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

// Uniform columns on web (last row never stretches); flexWrap is the native fallback.
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' } as object)
  : null;
const webPress = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '150ms' } as object)
  : null;

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function TestimonialCard({ item, linkedinUrl }: { item: TestimonialItem; linkedinUrl: string }) {
  return (
    <GlowCard
      style={{
        width: '100%',
        flexGrow: 1,
        padding: 24,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        borderRadius: 18,
      }}
    >
      {() => (
        <>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 34, color: colors.accent }}>“</Text>
          <Text style={{ fontSize: 15, lineHeight: 24, color: colors.textMuted, marginTop: 6 }}>{item.quote}</Text>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(228,227,87,0.45)', backgroundColor: 'rgba(228,227,87,0.10)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.accent }}>{initialsOf(item.name)}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.text }}>{item.name}</Text>
                <Pressable
                  onPress={() => Linking.openURL(linkedinUrl)}
                  style={({ hovered }: HoverState) => [
                    { width: 18, height: 18, borderRadius: 4, backgroundColor: hovered ? '#1272d6' : '#0a66c2', alignItems: 'center', justifyContent: 'center' },
                    webPress as object,
                  ]}
                >
                  <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 10.5, lineHeight: 12, color: '#ffffff' }}>in</Text>
                </Pressable>
              </View>
              <Text style={{ fontSize: 12.5, color: colors.textDim }}>{item.role}</Text>
            </View>
          </View>
        </>
      )}
    </GlowCard>
  );
}

export function TestimonialsSection() {
  const { content } = useI18n();
  const { testimonials } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="testimonials">
      <Reveal delay={0}>
        <SectionHeading kicker={testimonials.kicker} heading={testimonials.heading} />
      </Reveal>
      <Reveal delay={70}>
        <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{testimonials.blurb}</Text>
      </Reveal>
      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, gridWeb as object]}>
        {testimonials.items.map((item, i) => (
          <Reveal key={item.name} delay={140 + i * 60} style={{ flexGrow: 1, flexBasis: 420, minWidth: 300 }}>
            <TestimonialCard item={item} linkedinUrl={testimonials.linkedinUrl} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
