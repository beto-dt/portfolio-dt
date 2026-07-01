import { View } from 'react-native';
import type { ImpactContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function ImpactForm({ value, onChange }: { value: ImpactContent; onChange: (v: ImpactContent) => void }) {
  const set = <K extends keyof ImpactContent>(k: K, v: ImpactContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ value: '', label: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="value" value={it.value} onChangeText={(t) => on({ ...it, value: t })} />
            <Field label="label" value={it.label} onChangeText={(t) => on({ ...it, label: t })} />
          </>
        )}
      />
    </View>
  );
}
