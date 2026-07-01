import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors, fonts } from '@/theme/tokens';
import { loadAnalytics, type Analytics } from '../analytics-repo';

function Bars({ data }: { data: [string, number][] }) {
  const max = Math.max(1, ...data.map(([, n]) => n));
  return (
    <View style={{ gap: 6 }}>
      {data.map(([label, n]) => (
        <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ width: 104, color: colors.textMuted, fontSize: 12, fontFamily: fonts.mono }} numberOfLines={1}>
            {label}
          </Text>
          <View style={{ flex: 1, height: 14, backgroundColor: colors.surfaceStrong, borderRadius: 4, overflow: 'hidden' }}>
            <View style={{ width: `${(n / max) * 100}%`, height: '100%', backgroundColor: colors.accent }} />
          </View>
          <Text style={{ width: 44, textAlign: 'right', color: colors.text, fontSize: 12 }}>{n}</Text>
        </View>
      ))}
    </View>
  );
}

export function MetricsView() {
  const [data, setData] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadAnalytics()
      .then((a) => active && setData(a))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, []);

  if (error) return <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text>;
  if (!data) return <ActivityIndicator color={colors.accent} />;

  const days = Object.entries(data.byDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-30);
  const sections = Object.entries(data.bySection).sort((a, b) => b[1] - a[1]);

  return (
    <View style={{ gap: 24 }}>
      <View style={{ gap: 4 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>visitas totales</Text>
        <Text style={{ fontFamily: fonts.displayBold, fontSize: 40, color: colors.accent }}>{data.total}</Text>
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>últimos días</Text>
        {days.length ? <Bars data={days} /> : <Text style={{ color: colors.textDim, fontSize: 13 }}>Sin datos aún.</Text>}
      </View>
      <View style={{ gap: 8 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>secciones más vistas</Text>
        {sections.length ? <Bars data={sections} /> : <Text style={{ color: colors.textDim, fontSize: 13 }}>Sin datos aún.</Text>}
      </View>
    </View>
  );
}
