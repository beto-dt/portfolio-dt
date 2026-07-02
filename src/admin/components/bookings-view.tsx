import { useState } from 'react';
import { ActivityIndicator, Linking, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import { Chip } from '@/ui/chip';
import type { BookingRecord } from '../bookings-repo';
import { AccentButton, ViewHeader } from './admin-shell';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

const webPress = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color, color', transitionDuration: '150ms' } as object)
  : null;

type Filter = 'all' | 'new' | 'confirmed' | 'done';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'Todas' },
  { key: 'new', label: 'Nuevas' },
  { key: 'confirmed', label: 'Confirmadas' },
  { key: 'done', label: 'Atendidas' },
];
const STATUSES = ['new', 'confirmed', 'done'] as const;
const STATUS_LABEL: Record<string, string> = { new: 'Nueva', confirmed: 'Confirmada', done: 'Atendida' };
const BADGE: Record<string, { bg: string; fg: string }> = {
  new: { bg: 'rgba(228,227,87,0.15)', fg: colors.accent },
  confirmed: { bg: 'rgba(74,222,128,0.12)', fg: '#4ade80' },
  done: { bg: colors.surfaceStrong, fg: colors.textDim },
};

function FilterTab({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }: HoverState) => [
        { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: active ? colors.accent : hovered ? colors.surfaceStrong : 'transparent' },
        webPress as object,
      ]}
    >
      <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: active ? colors.onAccent : colors.textMuted }}>{label}</Text>
    </Pressable>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textMuted }}>{label}</Text>
    </View>
  );
}

export function BookingsView({ bookings, onStatus }: { bookings: BookingRecord[] | null; onStatus: (id: string, status: string) => void }) {
  const [filter, setFilter] = useState<Filter>('all');

  if (!bookings) {
    return (
      <View style={{ gap: 24 }}>
        <ViewHeader title="Solicitudes" subtitle="Cargando…" />
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  const filtered = filter === 'all' ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <View style={{ gap: 24 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <ViewHeader title="Solicitudes" subtitle={`${bookings.length} ${bookings.length === 1 ? 'solicitud' : 'solicitudes'}`} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 2, borderWidth: 1, borderColor: colors.border, borderRadius: 999, padding: 3 }}>
          {FILTERS.map((f) => (
            <FilterTab key={f.key} label={f.label} active={filter === f.key} onPress={() => setFilter(f.key)} />
          ))}
        </View>
      </View>

      {filtered.length === 0 ? (
        <Text style={{ color: colors.textDim, fontSize: 13.5 }}>Sin solicitudes todavía.</Text>
      ) : (
        <View style={{ gap: 16 }}>
          {filtered.map((b) => (
            <View
              key={b.id}
              style={{ gap: 10, padding: 20, borderWidth: 1, borderColor: b.status === 'new' ? 'rgba(228,227,87,0.45)' : colors.border, borderRadius: radii.lg, backgroundColor: colors.surface }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.accent }}>
                  🗓 {b.date} · {b.time} (GMT-5)
                </Text>
                <View style={{ borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: BADGE[b.status]?.bg ?? colors.surfaceStrong }}>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 10, letterSpacing: 1, color: BADGE[b.status]?.fg ?? colors.textDim }}>
                    {(STATUS_LABEL[b.status] ?? b.status).toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={{ fontFamily: fonts.display, fontSize: 18, color: colors.text }}>{b.name}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                <MetaChip label={`✉ ${b.email}`} />
                {b.model || b.projectType ? <MetaChip label={[b.model, b.projectType].filter(Boolean).join(' · ')} /> : null}
                {b.budget ? <MetaChip label={b.budget} /> : null}
              </View>
              {b.message ? <Text style={{ fontSize: 13.5, lineHeight: 20, color: colors.textDim }}>{b.message}</Text> : null}
              <View style={{ borderTopWidth: 1, borderTopColor: colors.border, marginTop: 4, paddingTop: 12, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, color: colors.textFaint }}>ESTADO</Text>
                {STATUSES.map((s) => (
                  <Chip key={s} label={STATUS_LABEL[s]} active={b.status === s} onPress={() => onStatus(b.id, s)} />
                ))}
                <View style={{ marginLeft: 'auto' }}>
                  <AccentButton label="✉ Responder" onPress={() => Linking.openURL(`mailto:${b.email}`)} />
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
