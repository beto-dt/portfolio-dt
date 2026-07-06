import { Platform, Text, View, useWindowDimensions } from 'react-native';
import { Container } from '../../components/container';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { goToSection } from '@/ui/go-to-section';
import { Reveal } from '@/ui/reveal';

// v2 design: accent-tinted rounded band with a radial glow from the top.
const bandGlowWeb = Platform.OS === 'web'
  ? ({ backgroundImage: 'radial-gradient(700px 300px at 50% -30%, rgba(228,227,87,0.16), transparent 70%)', overflow: 'hidden' } as object)
  : null;

/** Home closer: "¿Listo para llevar tu idea a producción?" → /contacto. */
export function CtaBand() {
  const { content } = useI18n();
  const { hero } = content;
  const { width } = useWindowDimensions();
  const compact = width < 640;

  return (
    <Container style={{ paddingTop: 30, paddingBottom: 60 }}>
      <Reveal delay={0}>
        <View
          style={[
            { borderRadius: 24, borderWidth: 1, borderColor: 'rgba(228,227,87,0.28)', backgroundColor: 'rgba(255,255,255,0.02)', paddingVertical: compact ? 48 : 64, paddingHorizontal: compact ? 24 : 40, alignItems: 'center' },
            bandGlowWeb as object,
          ]}
        >
          <Text style={{ fontFamily: fonts.display, fontSize: compact ? 28 : 34, letterSpacing: -0.6, color: colors.text, textAlign: 'center', maxWidth: 560 }}>
            {hero.ctaBandTitle}
          </Text>
          <Text style={{ fontSize: 15.5, lineHeight: 25, color: '#b7bcc5', textAlign: 'center', maxWidth: 620, marginTop: 14 }}>
            {hero.ctaBandSub}
          </Text>
          <View style={{ marginTop: 30 }}>
            <AppButton label={hero.primaryCta.label} onPress={() => goToSection('contact')} variant="primary" />
          </View>
        </View>
      </Reveal>
    </Container>
  );
}
