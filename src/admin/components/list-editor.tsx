import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, radii } from '@/theme/tokens';

function Ctrl({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 5, opacity: disabled ? 0.35 : 1 }}
    >
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function ListEditor<T>({
  items,
  onChange,
  makeEmpty,
  renderItem,
  addLabel = '+ Añadir',
}: {
  items: T[];
  onChange: (items: T[]) => void;
  makeEmpty: () => T;
  renderItem: (item: T, onItemChange: (item: T) => void, index: number) => ReactNode;
  addLabel?: string;
}) {
  const update = (index: number, item: T) => onChange(items.map((it, i) => (i === index ? item : it)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <View style={{ gap: 12 }}>
      {items.map((item, i) => (
        <View key={i} style={{ gap: 8, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
            <Ctrl label="↑" onPress={() => move(i, -1)} disabled={i === 0} />
            <Ctrl label="↓" onPress={() => move(i, 1)} disabled={i === items.length - 1} />
            <Ctrl label="✕" onPress={() => remove(i)} />
          </View>
          {renderItem(item, (it) => update(i, it), i)}
        </View>
      ))}
      <Pressable
        onPress={() => onChange([...items, makeEmpty()])}
        style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 8 }}
      >
        <Text style={{ color: colors.text, fontSize: 13 }}>{addLabel}</Text>
      </Pressable>
    </View>
  );
}
