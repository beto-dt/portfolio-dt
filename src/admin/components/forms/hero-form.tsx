import { View } from 'react-native';
import type { HeroContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function HeroForm({ value, onChange }: { value: HeroContent; onChange: (h: HeroContent) => void }) {
  const set = <K extends keyof HeroContent>(key: K, v: HeroContent[K]) => onChange({ ...value, [key]: v });
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
      <Label>stats</Label>
      <ListEditor
        items={value.stats}
        onChange={(stats) => set('stats', stats)}
        makeEmpty={() => ({ value: '', label: '' })}
        renderItem={(stat, on) => (
          <>
            <Field label="value" value={stat.value} onChangeText={(t) => on({ ...stat, value: t })} />
            <Field label="label" value={stat.label} onChangeText={(t) => on({ ...stat, label: t })} />
          </>
        )}
      />
    </View>
  );
}
