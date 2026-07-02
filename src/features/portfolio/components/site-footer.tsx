import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from './container';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import { scrollToAnchor } from '@/ui/scroll-to-anchor';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const topInteractive = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;

function BackToTop({ label }: { label: string }) {
  return (
    <Pressable onPress={() => scrollToAnchor('top')} style={topInteractive as object}>
      {({ hovered }: HoverState) => (
        <Text style={[{ fontFamily: fonts.mono, fontSize: 11.5, color: hovered ? colors.accent : colors.textFaint }, topInteractive as object]}>
          ↑ {label}
        </Text>
      )}
    </Pressable>
  );
}

export function SiteFooter() {
  const { content, locale } = useI18n();
  const { footer } = content;
  const topLabel = locale === 'es' ? 'Volver arriba' : 'Back to top';
  return (
    <View style={{ width: '100%', borderTopWidth: 1, borderTopColor: colors.border }}>
      <Reveal slide={false}>
        <Container style={{ paddingVertical: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.copyright}</Text>
          <BackToTop label={topLabel} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{footer.tagline}</Text>
        </Container>
      </Reveal>
    </View>
  );
}
