import { useState } from 'react';
import { Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import type { Locale } from '@/i18n/locales';
import { colors, fonts, radii } from '@/theme/tokens';
import { isBookableDay, monthName, toISO, weekdayHeaders } from './booking-config';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const cellWeb = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color, border-color', transitionDuration: '140ms' } as object)
  : null;

function NavButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      style={({ hovered }: HoverState) => [
        {
          width: 32,
          height: 32,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: radii.sm,
          borderWidth: 1,
          borderColor: hovered && !disabled ? colors.borderStrong : colors.border,
          opacity: disabled ? 0.35 : 1,
        },
        disabled ? null : (cellWeb as object),
      ]}
    >
      <Text style={{ color: colors.text, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

function DayCell({ date, selected, onSelect }: { date: Date; selected: string | null; onSelect: (iso: string) => void }) {
  const iso = toISO(date);
  const bookable = isBookableDay(date);
  const isSelected = selected === iso;
  return (
    <Pressable
      onPress={bookable ? () => onSelect(iso) : undefined}
      style={({ hovered }: HoverState) => [
        {
          aspectRatio: 1,
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          borderRadius: radii.md,
          borderWidth: 1,
          borderColor: isSelected ? colors.accent : bookable ? (hovered ? colors.borderStrong : colors.border) : 'transparent',
          backgroundColor: isSelected ? colors.accent : bookable && hovered ? colors.surfaceStrong : bookable ? colors.surface : 'transparent',
          opacity: bookable ? 1 : 0.35,
        },
        bookable ? (cellWeb as object) : null,
      ]}
    >
      <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: isSelected ? colors.onAccent : colors.text }}>{date.getDate()}</Text>
      <View style={{ width: 4, height: 4, borderRadius: 999, backgroundColor: bookable ? (isSelected ? colors.onAccent : colors.accent) : 'transparent' }} />
    </Pressable>
  );
}

/** Monday-first monthly grid; bookable weekdays get an accent dot. */
export function BookingCalendar({ selected, onSelect, locale }: { selected: string | null; onSelect: (iso: string) => void; locale: Locale }) {
  const [monthOffset, setMonthOffset] = useState(0); // current month .. +2

  const now = new Date();
  const first = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const year = first.getFullYear();
  const month = first.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = (first.getDay() + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array.from({ length: leading }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.text }}>
          {monthName(locale, month)} {year}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <NavButton label="‹" disabled={monthOffset === 0} onPress={() => setMonthOffset((m) => Math.max(0, m - 1))} />
          <NavButton label="›" disabled={monthOffset === 2} onPress={() => setMonthOffset((m) => Math.min(2, m + 1))} />
        </View>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {weekdayHeaders(locale).map((w) => (
          <Text key={w} style={{ flex: 1, textAlign: 'center', fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint, paddingVertical: 4 }}>
            {w}
          </Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => (
          <View key={i} style={{ width: `${100 / 7}%`, padding: 3 }}>
            {d ? <DayCell date={d} selected={selected} onSelect={onSelect} /> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
