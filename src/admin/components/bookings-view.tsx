import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';
import { Chip } from '@/ui/chip';
import { HoverLink } from '@/ui/hover-link';
import { loadBookings, setBookingStatus, type BookingRecord } from '../bookings-repo';

const STATUSES = ['new', 'confirmed', 'done'] as const;
const STATUS_LABEL: Record<string, string> = { new: 'nueva', confirmed: 'confirmada', done: 'atendida' };

export function BookingsView() {
  const [items, setItems] = useState<BookingRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    loadBookings()
      .then((b) => active && setItems(b))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)));
    return () => {
      active = false;
    };
  }, []);

  const onStatus = async (id: string, status: string) => {
    setItems((prev) => prev?.map((b) => (b.id === id ? { ...b, status } : b)) ?? prev);
    try {
      await setBookingStatus(id, status);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  if (error) return <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text>;
  if (!items) return <ActivityIndicator color={colors.accent} />;
  if (items.length === 0) return <Text style={{ color: colors.textDim, fontSize: 13.5 }}>Sin solicitudes todavía.</Text>;

  return (
    <View style={{ gap: 12 }}>
      {items.map((b) => (
        <View key={b.id} style={{ gap: 8, padding: 16, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.accent }}>
              {b.date} · {b.time} (GMT-5)
            </Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{(b.locale || '').toUpperCase()}</Text>
          </View>
          <Text style={{ fontFamily: fonts.display, fontSize: 16, color: colors.text }}>{b.name}</Text>
          <Text style={{ fontSize: 13, color: colors.textMuted }}>
            {b.model ? `${b.model} · ` : ''}
            {b.email}
            {b.projectType ? ` · ${b.projectType}` : ''}
            {b.budget ? ` · ${b.budget}` : ''}
          </Text>
          {b.message ? <Text style={{ fontSize: 13, lineHeight: 20, color: colors.textDim }}>{b.message}</Text> : null}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {STATUSES.map((s) => (
              <Chip key={s} label={STATUS_LABEL[s]} active={b.status === s} onPress={() => onStatus(b.id, s)} />
            ))}
            <HoverLink label="Responder" onPress={() => Linking.openURL(`mailto:${b.email}`)} color={colors.accent} hoverColor={colors.text} />
          </View>
        </View>
      ))}
    </View>
  );
}
