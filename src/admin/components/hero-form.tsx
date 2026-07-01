import { Pressable, Text, TextInput, View } from 'react-native';
import type { HeroContent, Stat } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';

const inputStyle = {
  color: colors.text,
  fontFamily: fonts.body,
  fontSize: 14,
  backgroundColor: colors.surfaceStrong,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.sm,
  paddingHorizontal: 10,
  paddingVertical: 8,
} as const;

function Field({ label, value, onChangeText, multiline }: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[inputStyle, multiline ? { minHeight: 72, textAlignVertical: 'top' } : null]}
        placeholderTextColor={colors.textFaint}
      />
    </View>
  );
}

export function HeroForm({ value, onChange }: { value: HeroContent; onChange: (h: HeroContent) => void }) {
  const set = <K extends keyof HeroContent>(key: K, v: HeroContent[K]) => onChange({ ...value, [key]: v });

  const setStat = (index: number, patch: Partial<Stat>) => {
    const stats = value.stats.map((s, i) => (i === index ? { ...s, ...patch } : s));
    set('stats', stats);
  };
  const addStat = () => set('stats', [...value.stats, { value: '', label: '' }]);
  const removeStat = (index: number) => set('stats', value.stats.filter((_, i) => i !== index));

  return (
    <View style={{ gap: 16 }}>
      <Field label="availability" value={value.availability} onChangeText={(t) => set('availability', t)} />
      <Field label="titleLead" value={value.titleLead} onChangeText={(t) => set('titleLead', t)} />
      <Field label="titleAccent" value={value.titleAccent} onChangeText={(t) => set('titleAccent', t)} />
      <Field label="subtitle" value={value.subtitle} onChangeText={(t) => set('subtitle', t)} multiline />

      <Field label="primaryCta.label" value={value.primaryCta.label} onChangeText={(t) => set('primaryCta', { ...value.primaryCta, label: t })} />
      <Field label="primaryCta.anchor" value={value.primaryCta.anchor} onChangeText={(t) => set('primaryCta', { ...value.primaryCta, anchor: t })} />
      <Field label="secondaryCta.label" value={value.secondaryCta.label} onChangeText={(t) => set('secondaryCta', { ...value.secondaryCta, label: t })} />
      <Field label="secondaryCta.anchor" value={value.secondaryCta.anchor} onChangeText={(t) => set('secondaryCta', { ...value.secondaryCta, anchor: t })} />

      <View style={{ gap: 10 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>stats</Text>
        {value.stats.map((stat, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <Field label="value" value={stat.value} onChangeText={(t) => setStat(i, { value: t })} />
            </View>
            <View style={{ flex: 2 }}>
              <Field label="label" value={stat.label} onChangeText={(t) => setStat(i, { label: t })} />
            </View>
            <Pressable onPress={() => removeStat(i)} style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 9 }}>
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>✕</Text>
            </Pressable>
          </View>
        ))}
        <Pressable onPress={addStat} style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 8 }}>
          <Text style={{ color: colors.text, fontSize: 13 }}>+ Añadir stat</Text>
        </Pressable>
      </View>
    </View>
  );
}
