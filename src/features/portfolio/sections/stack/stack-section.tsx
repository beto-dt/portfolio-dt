import { Platform, Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { Pill } from '../../components/pill';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';
import { Reveal } from '@/ui/reveal';

// Uniform columns on web (last row never stretches); flexWrap is the native fallback.
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' } as object)
  : null;

export function StackSection() {
  const { content } = useI18n();
  const { stack } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={stack.kicker} heading={stack.heading} />
      </Reveal>
      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, gridWeb as object]}>
        {stack.groups.map((group, i) => (
          <Reveal key={group.category} delay={i * 70} style={{ flexGrow: 1, flexBasis: 240, minWidth: 220 }}>
            <GlowCard
              style={{
                width: '100%',
                flexGrow: 1,
                padding: 20,
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: radii.lg - 2,
              }}
            >
              {() => (
                <>
                  <Text
                    style={{
                      fontFamily: fonts.mono,
                      fontSize: 11,
                      letterSpacing: 0.55,
                      textTransform: 'uppercase',
                      color: colors.textFaint,
                      marginBottom: 14,
                    }}
                  >
                    {group.category}
                  </Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {group.items.map((item) => (
                      <Pill key={item} label={item} />
                    ))}
                  </View>
                </>
              )}
            </GlowCard>
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
