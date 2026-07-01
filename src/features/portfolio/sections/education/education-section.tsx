import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

export function EducationSection() {
  const { content } = useI18n();
  const { education } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <SectionHeading kicker={education.kicker} heading={education.heading} />
      <View style={{ gap: 24 }}>
        <View>
          {education.items.map((item) => (
            <View
              key={item.title}
              style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)', gap: 3 }}
            >
              <Text style={{ fontFamily: fonts.display, fontSize: 16, letterSpacing: -0.16, color: colors.text }}>{item.title}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <Text style={{ fontSize: 13.5, color: colors.accent }}>{item.institution}</Text>
                <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{item.period}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={{ gap: 10 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>
            {education.languagesHeading}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 28 }}>
            {education.languages.map((l) => (
              <View key={l.language} style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline' }}>
                <Text style={{ fontSize: 14, color: colors.text }}>{l.language}</Text>
                <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{l.level}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Container>
  );
}
