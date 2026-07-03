import { Platform, Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';
import { Reveal } from '@/ui/reveal';
import type { GlobalLanguage, GlobalLocation, GlobalStat } from '@/content/types';

// Uniform columns on web (last row never stretches); flexWrap is the native fallback.
const statsGridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' } as object)
  : null;
const detailGridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' } as object)
  : null;

const cardStyle = {
  width: '100%',
  flexGrow: 1,
  padding: 24,
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.09)',
  borderRadius: 18,
} as const;

function StatCard({ stat }: { stat: GlobalStat }) {
  return (
    <GlowCard style={cardStyle}>
      {() => (
        <>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 34, color: colors.accent }}>{stat.value}</Text>
          <Text style={{ fontSize: 13.5, color: colors.textMuted, marginTop: 4 }}>{stat.label}</Text>
        </>
      )}
    </GlowCard>
  );
}

function CardHeader({ glyph, title }: { glyph: string; title: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <Text style={{ fontSize: 15, color: colors.accent }}>{glyph}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.text }}>{title}</Text>
    </View>
  );
}

function LocationRow({ location }: { location: GlobalLocation }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: colors.accent }} />
      <Text style={{ flex: 1, fontSize: 14.5, color: colors.text }}>{location.name}</Text>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{location.tag}</Text>
    </View>
  );
}

function LanguageBar({ lang }: { lang: GlobalLanguage }) {
  const pct = Math.max(0, Math.min(100, lang.percent));
  return (
    <View style={{ gap: 8, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14.5, color: colors.text }}>{lang.language}</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accent }}>{lang.level}</Text>
      </View>
      <View style={{ height: 8, borderRadius: 999, backgroundColor: colors.surfaceStrong, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', borderRadius: 999, backgroundColor: colors.accent }} />
      </View>
    </View>
  );
}

export function GlobalReachSection() {
  const { content } = useI18n();
  const { globalReach } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="reach">
      <Reveal delay={0}>
        <SectionHeading kicker={globalReach.kicker} heading={globalReach.heading} />
      </Reveal>
      <Reveal delay={70}>
        <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{globalReach.blurb}</Text>
      </Reveal>

      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16 }, statsGridWeb as object]}>
        {globalReach.stats.map((stat, i) => (
          <Reveal key={stat.label} delay={140 + i * 70} style={{ flexGrow: 1, flexBasis: 260, minWidth: 240 }}>
            <StatCard stat={stat} />
          </Reveal>
        ))}
      </View>

      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, detailGridWeb as object]}>
        <Reveal delay={280} style={{ flexGrow: 1, flexBasis: 320, minWidth: 280 }}>
          <GlowCard style={cardStyle}>
            {() => (
              <>
                <CardHeader glyph="🌐" title={globalReach.locationsHeading} />
                {globalReach.locations.map((location) => (
                  <LocationRow key={location.name} location={location} />
                ))}
              </>
            )}
          </GlowCard>
        </Reveal>
        <Reveal delay={350} style={{ flexGrow: 1, flexBasis: 320, minWidth: 280 }}>
          <GlowCard style={cardStyle}>
            {() => (
              <>
                <CardHeader glyph="文A" title={globalReach.languagesHeading} />
                {globalReach.languages.map((lang) => (
                  <LanguageBar key={lang.language} lang={lang} />
                ))}
              </>
            )}
          </GlowCard>
        </Reveal>
        <Reveal delay={420} style={{ flexGrow: 1, flexBasis: 320, minWidth: 280 }}>
          <GlowCard style={cardStyle}>
            {() => (
              <>
                <CardHeader glyph="👥" title={globalReach.teamHeading} />
                {globalReach.teamItems.map((item) => (
                  <View key={item} style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline', marginBottom: 10 }}>
                    <Text style={{ color: colors.accent, fontSize: 12.5 }}>✓</Text>
                    <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}>{item}</Text>
                  </View>
                ))}
              </>
            )}
          </GlowCard>
        </Reveal>
      </View>
    </Container>
  );
}
