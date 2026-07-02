import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import type { EducationItem, LanguageItem } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const rowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '160ms' } as object) : null;
const textTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const markerTransition = Platform.OS === 'web' ? ({ transitionProperty: 'opacity', transitionDuration: '160ms' } as object) : null;
const chipTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '150ms' } as object) : null;

/** An education row that highlights on hover (decorative — not a link). */
function EduRow({ item }: { item: EducationItem }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          position: 'relative',
          paddingVertical: 12,
          gap: 3,
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
          <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>{item.title}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <Text style={{ fontSize: 13.5, color: colors.accent }}>{item.institution}</Text>
            <Text style={[{ fontFamily: fonts.mono, fontSize: 11.5, color: hovered ? colors.textDim : colors.textFaint }, textTransition as object]}>
              {item.period}
            </Text>
          </View>
        </>
      )}
    </Pressable>
  );
}

/** A language/level chip that brightens on hover (decorative — not a link). */
function LangChip({ item }: { item: LanguageItem }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        {
          flexDirection: 'row',
          gap: 8,
          alignItems: 'baseline',
          backgroundColor: hovered ? colors.borderStrong : colors.surfaceStrong,
          borderWidth: 1,
          borderColor: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
          borderRadius: radii.sm + 1,
          paddingHorizontal: 11,
          paddingVertical: 6,
        },
        chipTransition as object,
      ]}
    >
      <Text style={{ fontSize: 14, color: colors.text }}>{item.language}</Text>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{item.level}</Text>
    </Pressable>
  );
}

export function EducationSection() {
  const { content } = useI18n();
  const { education } = content;
  const langDelay = (education.items.length + 1) * 70;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <Reveal delay={0}>
        <SectionHeading kicker={education.kicker} heading={education.heading} />
      </Reveal>
      <View style={{ gap: 24 }}>
        <View>
          {education.items.map((item, i) => (
            <Reveal key={item.title} delay={(i + 1) * 70}>
              <EduRow item={item} />
            </Reveal>
          ))}
        </View>
        <Reveal delay={langDelay} style={{ gap: 10 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>
            {education.languagesHeading}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {education.languages.map((l) => (
              <LangChip key={l.language} item={l} />
            ))}
          </View>
        </Reveal>
      </View>
    </Container>
  );
}
