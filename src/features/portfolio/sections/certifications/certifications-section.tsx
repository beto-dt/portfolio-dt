import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import type { Certification } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const rowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '160ms' } as object) : null;
const textTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const markerTransition = Platform.OS === 'web' ? ({ transitionProperty: 'opacity', transitionDuration: '160ms' } as object) : null;

/** A certification row that highlights on hover (decorative — not a link). */
function CertRow({ item }: { item: Certification }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          position: 'relative',
          flexDirection: 'row',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: hovered ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.07)',
          backgroundColor: hovered ? 'rgba(255,255,255,0.02)' : 'transparent',
        },
        rowTransition as object,
      ]}
    >
      {({ hovered }: HoverState) => (
        <>
          <View
            pointerEvents="none"
            style={[
              { position: 'absolute', left: -14, top: 12, bottom: 12, width: 2, borderRadius: 2, backgroundColor: colors.accent, opacity: hovered ? 1 : 0 },
              markerTransition as object,
            ]}
          />
          <Text style={[{ flex: 1, fontSize: 13.5, color: hovered ? colors.text : 'rgb(223,226,230)' }, textTransition as object]}>
            {item.name}
          </Text>
          <Text style={[{ fontFamily: fonts.mono, fontSize: 11, color: hovered ? colors.textDim : colors.textFaint }, textTransition as object]}>
            {item.issuer}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function CertificationsSection() {
  const { content } = useI18n();
  const { certifications } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={certifications.kicker} heading={certifications.heading} />
      </Reveal>
      <View>
        {certifications.items.map((item, i) => (
          <Reveal key={item.name} delay={i * 70}>
            <CertRow item={item} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
