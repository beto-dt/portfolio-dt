import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { useFluidType } from '@/theme/use-fluid-type';

export function HeroSection() {
  const { content } = useI18n();
  const { hero } = content;
  const fluid = useFluidType();

  return (
    <Container style={{ paddingVertical: 88 }}>
      <View style={{ gap: 34 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 9,
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            borderRadius: radii.pill,
            paddingHorizontal: 13,
            paddingVertical: 7,
          }}
        >
          <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: colors.accent }} />
          <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, letterSpacing: 0.4, color: 'rgb(201,205,212)' }}>
            {hero.availability}
          </Text>
        </View>

        <Text style={{ fontFamily: fonts.display, fontSize: fluid.heroTitle, lineHeight: fluid.heroTitleLineHeight, letterSpacing: fluid.heroTitleSpacing, color: colors.text }}>
          {hero.titleLead} <Text style={{ color: colors.accent }}>{hero.titleAccent}</Text>
        </Text>

        <Text style={{ fontSize: fluid.heroSubtitle, lineHeight: fluid.heroSubtitleLineHeight, color: colors.textMuted, maxWidth: 640, fontFamily: fonts.body }}>
          {hero.subtitle}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
          <View style={{ backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 26, paddingVertical: 14 }}>
            <Text style={{ fontSize: 15, fontFamily: fonts.bodyMedium, color: colors.onAccent }}>{hero.primaryCta.label}</Text>
          </View>
          <View style={{ borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)', borderRadius: radii.md, paddingHorizontal: 24, paddingVertical: 13 }}>
            <Text style={{ fontSize: 15, fontFamily: fonts.bodyMedium, color: 'rgb(231,233,236)' }}>{hero.secondaryCta.label}</Text>
          </View>
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 40,
            marginTop: 26,
            paddingTop: 30,
            borderTopWidth: 1,
            borderTopColor: colors.border,
          }}
        >
          {hero.stats.map((stat) => (
            <View key={stat.label} style={{ gap: 4 }}>
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 30, color: '#ffffff' }}>{stat.value}</Text>
              <Text style={{ fontSize: 12.5, color: colors.textFainter, maxWidth: 160 }}>{stat.label}</Text>
            </View>
          ))}
        </View>
      </View>
    </Container>
  );
}
