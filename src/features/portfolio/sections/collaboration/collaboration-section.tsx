import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { GlowCard } from '@/ui/glow-card';
import { Reveal } from '@/ui/reveal';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';
import type { CollaborationModel } from '@/content/types';

/** One collaboration model card; the popular one is accent-bordered + badged. */
function ModelCard({ model }: { model: CollaborationModel }) {
  return (
    <GlowCard
      style={{
        width: '100%',
        flexGrow: 1,
        padding: 26,
        backgroundColor: model.popular ? 'rgba(228,227,87,0.04)' : 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: model.popular ? 'rgba(228,227,87,0.5)' : 'rgba(255,255,255,0.09)',
        borderRadius: 18,
      }}
    >
      {() => (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 14 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>{model.tag}</Text>
            {model.popular ? (
              <View style={{ backgroundColor: colors.accent, borderRadius: radii.sm, paddingHorizontal: 8, paddingVertical: 3 }}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 0.6, color: colors.onAccent }}>POPULAR</Text>
              </View>
            ) : null}
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 21, letterSpacing: -0.21, color: colors.text, marginBottom: 8 }}>{model.title}</Text>
          <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim }}>{model.description}</Text>
          <View style={{ gap: 8, marginTop: 14 }}>
            {model.features.map((feature) => (
              <View key={feature} style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
                <Text style={{ color: colors.accent, fontSize: 12.5 }}>✓</Text>
                <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}>{feature}</Text>
              </View>
            ))}
          </View>
          {/* marginTop:'auto' pins the CTA to the bottom of the card */}
          <View style={{ marginTop: 'auto', paddingTop: 20 }}>
            <AppButton label={model.cta} onPress={() => scrollToAnchor('contact')} variant={model.popular ? 'primary' : 'outline'} />
          </View>
        </>
      )}
    </GlowCard>
  );
}

export function CollaborationSection() {
  const { content } = useI18n();
  const { collaboration } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="collaboration">
      <Reveal delay={0}>
        <SectionHeading kicker={collaboration.kicker} heading={collaboration.heading} />
      </Reveal>
      <Reveal delay={70}>
        <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{collaboration.blurb}</Text>
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {collaboration.models.map((model, i) => (
          <Reveal key={model.title} delay={140 + i * 70} style={{ flexGrow: 1, flexBasis: 300, minWidth: 280 }}>
            <ModelCard model={model} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
