import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';
import type { Certification, EducationItem, LanguageItem } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const rowTransition = Platform.OS === 'web' ? ({ transitionProperty: 'background-color, border-color', transitionDuration: '160ms' } as object) : null;
const textTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '160ms' } as object) : null;
const markerTransition = Platform.OS === 'web' ? ({ transitionProperty: 'opacity', transitionDuration: '160ms' } as object) : null;
// Two side-by-side columns on web (stacks under ~1000px); flexWrap fallback.
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))', columnGap: 64, rowGap: 48 } as object)
  : null;

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

/** A stacked education item with the same hover treatment (no divider). */
function EduItem({ item }: { item: EducationItem }) {
  return (
    <Pressable
      style={({ hovered }: HoverState) => [
        { position: 'relative', paddingVertical: 10, gap: 2, backgroundColor: hovered ? 'rgba(255,255,255,0.02)' : 'transparent' },
        rowTransition as object,
      ]}
    >
      {({ hovered }: HoverState) => (
        <>
          <View
            pointerEvents="none"
            style={[
              { position: 'absolute', left: -14, top: 10, bottom: 10, width: 2, borderRadius: 2, backgroundColor: colors.accent, opacity: hovered ? 1 : 0 },
              markerTransition as object,
            ]}
          />
          <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>{item.title}</Text>
          <Text style={{ fontSize: 13.5, color: colors.accent }}>{item.institution}</Text>
          <Text style={[{ fontFamily: fonts.mono, fontSize: 11.5, color: hovered ? colors.textDim : colors.textFaint }, textTransition as object]}>
            {item.period}
          </Text>
        </>
      )}
    </Pressable>
  );
}

/** A language row: language left, level in accent right. */
function LangRow({ item }: { item: LanguageItem }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, paddingVertical: 6 }}>
      <Text style={{ fontSize: 14, color: colors.text }}>{item.language}</Text>
      <Text style={{ fontSize: 13.5, color: colors.accent }}>{item.level}</Text>
    </View>
  );
}

export function FormationSection() {
  const { content } = useI18n();
  const { certifications, education } = content;
  const langDelay = (education.items.length + 1) * 60;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="formation">
      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 48 }, gridWeb as object]}>
        <View>
          <Reveal delay={0}>
            <SectionHeading kicker={certifications.kicker} heading={certifications.heading} />
          </Reveal>
          <View>
            {certifications.items.map((item, i) => (
              <Reveal key={item.name} delay={(i + 1) * 60}>
                <CertRow item={item} />
              </Reveal>
            ))}
          </View>
        </View>
        <View>
          <Reveal delay={0}>
            <SectionHeading kicker={education.kicker} heading={education.heading} />
          </Reveal>
          <View style={{ gap: 8 }}>
            {education.items.map((item, i) => (
              <Reveal key={item.title} delay={(i + 1) * 60}>
                <EduItem item={item} />
              </Reveal>
            ))}
          </View>
          <Reveal delay={langDelay} style={{ gap: 10, marginTop: 28 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>
              {education.languagesHeading}
            </Text>
            <View>
              {education.languages.map((l) => (
                <LangRow key={l.language} item={l} />
              ))}
            </View>
          </Reveal>
        </View>
      </View>
    </Container>
  );
}
