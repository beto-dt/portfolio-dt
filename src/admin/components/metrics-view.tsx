import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import { loadAnalytics, type Analytics } from '../analytics-repo';
import type { BookingRecord } from '../bookings-repo';
import { ViewHeader } from './admin-shell';

const card = {
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.lg,
  backgroundColor: colors.surface,
  padding: 20,
} as const;

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

function StatCard({ label, value, caption, accent }: { label: string; value: string; caption: string; accent?: boolean }) {
  return (
    <View style={[card, { flexGrow: 1, flexBasis: 200, gap: 6 }]}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.textFaint }}>{label}</Text>
      <Text style={{ fontFamily: fonts.displayBold, fontSize: 34, color: accent ? colors.accent : colors.text }}>{value}</Text>
      <Text style={{ fontSize: 12, color: colors.textDim }}>{caption}</Text>
    </View>
  );
}

function Panel({ label, data }: { label: string; data: [string, number][] }) {
  return (
    <View style={[card, { flexGrow: 1, flexBasis: 380, gap: 12 }]}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.textFaint }}>{label}</Text>
      {data.length ? <Bars data={data} /> : <Text style={{ color: colors.textDim, fontSize: 13 }}>Sin datos aún.</Text>}
    </View>
  );
}

export function MetricsView({ bookings }: { bookings: BookingRecord[] | null }) {
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

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 6);
  const cutoffKey = cutoff.toISOString().slice(0, 10);
  const visitas7d = Object.entries(data.byDay)
    .filter(([d]) => d >= cutoffKey)
    .reduce((sum, [, n]) => sum + n, 0);

  const monthPrefix = new Date().toISOString().slice(0, 7);
  const solicitudesMes = bookings ? bookings.filter((b) => b.date.startsWith(monthPrefix)).length : null;
  const confirmadas = bookings ? bookings.filter((b) => b.status === 'confirmed').length : null;
  const conversion = solicitudesMes === null ? null : visitas7d > 0 ? Math.round((100 * solicitudesMes) / visitas7d) : 0;

  const days = Object.entries(data.byDay).sort((a, b) => a[0].localeCompare(b[0])).slice(-30);
  const sections = Object.entries(data.bySection).sort((a, b) => b[1] - a[1]);

  return (
    <View style={{ gap: 24 }}>
      <ViewHeader title="Métricas del sitio" subtitle="Actividad y secciones más visitadas de tu portfolio." />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <StatCard label="VISITAS TOTALES" value={String(visitas7d)} caption="últimos 7 días" accent />
        <StatCard label="SOLICITUDES" value={solicitudesMes === null ? '…' : String(solicitudesMes)} caption="este mes" />
        <StatCard label="CONFIRMADAS" value={confirmadas === null ? '…' : String(confirmadas)} caption="citas agendadas" />
        <StatCard label="CONVERSIÓN" value={conversion === null ? '…' : `${conversion}%`} caption="visita → solicitud" />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <Panel label="ÚLTIMOS DÍAS" data={days} />
        <Panel label="SECCIONES MÁS VISTAS" data={sections} />
      </View>
    </View>
  );
}
