import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';
import { Reveal } from '@/ui/reveal';

export function ProcessSection() {
  const { content } = useI18n();
  const { process } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="process">
      <Reveal delay={0}>
        <SectionHeading kicker={process.kicker} heading={process.heading} />
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {process.steps.map((step, i) => (
          <Reveal key={step.number} delay={i * 70} style={{ flexGrow: 1, flexBasis: 230, minWidth: 210 }}>
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
              {() => (
                <>
                  <Text style={{ fontFamily: fonts.displayBold, fontSize: 26, color: colors.accent, marginBottom: 10 }}>{step.number}</Text>
                  <Text style={{ fontFamily: fonts.display, fontSize: 17, letterSpacing: -0.17, color: colors.text, marginBottom: 8 }}>{step.title}</Text>
                  <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim, fontFamily: fonts.body }}>{step.description}</Text>
                </>
              )}
            </GlowCard>
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
