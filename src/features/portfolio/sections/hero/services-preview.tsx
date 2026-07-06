import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { ServiceCard } from '../services/service-card';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { goToSection } from '@/ui/go-to-section';
import { Reveal } from '@/ui/reveal';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const ctaTransition = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const arrowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'transform', transitionDuration: '160ms' } as object) : null;

/** Home teaser: first three services + link to the full /servicios page. */
export function ServicesPreview() {
  const { content } = useI18n();
  const { services } = content;

  return (
    <Container style={{ paddingVertical: 40 }}>
      <Reveal delay={0}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', flexWrap: 'wrap', columnGap: 20, rowGap: 10 }}>
          <SectionHeading kicker={services.kicker} heading={services.heading} />
          <Pressable onPress={() => goToSection('services')} style={{ marginLeft: 'auto', marginBottom: 26 }}>
            {({ hovered }: HoverState) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[{ fontFamily: fonts.mono, fontSize: 12.5, color: hovered ? '#eeed6b' : colors.accent }, ctaTransition as object]}>
                  {services.seeAllCta}
                </Text>
                <Text style={[{ fontFamily: fonts.mono, fontSize: 12.5, color: hovered ? '#eeed6b' : colors.accent, transform: [{ translateX: hovered ? 3 : 0 }] }, arrowTransition as object]}>
                  →
                </Text>
              </View>
            )}
          </Pressable>
        </View>
      </Reveal>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        {services.items.slice(0, 3).map((item, i) => (
          <Reveal key={item.index} delay={70 + i * 70} style={{ flexGrow: 1, flexBasis: 300, maxWidth: 560 }}>
            <ServiceCard item={item} requestCta={services.requestCta} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
