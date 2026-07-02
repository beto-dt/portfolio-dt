import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useCountUp } from '../../hooks/use-count-up';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import type { ImpactItem } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const cellTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color', transitionDuration: '180ms' } as object) : null;
// Uniform columns on web (last row never stretches); flexWrap is the native
// fallback. The leftover area of the last row shows the container background
// (the hairline color) — the mock's lighter filler panel, with no extra markup.
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' } as object)
  : null;

/** One stat number; owns a useCountUp call (hooks need a component boundary). */
function ImpactValue({ value }: { value: string }) {
  const shown = useCountUp(value);
  return (
    <Text style={{ fontFamily: fonts.displayBold, fontSize: 38, letterSpacing: -0.8, lineHeight: 40, color: colors.accent }}>
      {shown}
    </Text>
  );
}

/** A grid cell; lightens its background on hover (no lift/shadow → keeps seams). */
function ImpactCell({ item }: { item: ImpactItem }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          width: '100%',
          flexGrow: 1,
          gap: 8,
          paddingVertical: 28,
          paddingHorizontal: 22,
          backgroundColor: hovered ? '#12151b' : colors.surfaceCell,
        },
        cellTransition as object,
      ]}
    >
      <ImpactValue value={item.value} />
      <Text style={{ fontSize: 12.5, lineHeight: 19, color: colors.textDim }}>{item.label}</Text>
    </Pressable>
  );
}

export function ImpactSection() {
  const { content } = useI18n();
  const { impact } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={impact.kicker} heading={impact.heading} />
      </Reveal>
      {/* The container background shows through the 1px gap, drawing hairline
          dividers between cells (matches the mock's grid look). */}
      <View
        style={[
          {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 1,
            backgroundColor: colors.border,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 18,
            overflow: 'hidden',
          },
          gridWeb as object,
        ]}
      >
        {impact.items.map((item, i) => (
          <Reveal key={item.label} slide={false} delay={i * 70} style={{ flexGrow: 1, flexBasis: 180, minWidth: 160 }}>
            <ImpactCell item={item} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
