import { View } from 'react-native';
import type { ExperienceContent } from '@/content/types';
import { BoolField, Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function ExperienceForm({ value, onChange }: { value: ExperienceContent; onChange: (v: ExperienceContent) => void }) {
  const set = <K extends keyof ExperienceContent>(k: K, v: ExperienceContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ period: '', location: '', current: false, currentLabel: '', role: '', company: '', description: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="period" value={it.period} onChangeText={(t) => on({ ...it, period: t })} />
            <Field label="location" value={it.location} onChangeText={(t) => on({ ...it, location: t })} />
            <BoolField label="current" value={it.current ?? false} onChange={(v) => on({ ...it, current: v })} />
            <Field label="currentLabel" value={it.currentLabel ?? ''} onChangeText={(t) => on({ ...it, currentLabel: t })} />
            <Field label="role" value={it.role} onChangeText={(t) => on({ ...it, role: t })} />
            <Field label="company" value={it.company} onChangeText={(t) => on({ ...it, company: t })} />
            <Field label="description" value={it.description} onChangeText={(t) => on({ ...it, description: t })} multiline />
          </>
        )}
      />
    </View>
  );
}
