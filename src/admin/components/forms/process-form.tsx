import { View } from 'react-native';
import type { ProcessContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function ProcessForm({ value, onChange }: { value: ProcessContent; onChange: (v: ProcessContent) => void }) {
  const set = <K extends keyof ProcessContent>(k: K, v: ProcessContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>steps</Label>
      <ListEditor
        items={value.steps}
        onChange={(steps) => set('steps', steps)}
        makeEmpty={() => ({ number: '', title: '', description: '' })}
        renderItem={(s, on) => (
          <>
            <Field label="number" value={s.number} onChangeText={(t) => on({ ...s, number: t })} />
            <Field label="title" value={s.title} onChangeText={(t) => on({ ...s, title: t })} />
            <Field label="description" value={s.description} onChangeText={(t) => on({ ...s, description: t })} multiline />
          </>
        )}
      />
    </View>
  );
}
