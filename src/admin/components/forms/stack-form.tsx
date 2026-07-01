import { View } from 'react-native';
import type { StackContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';
import { StringListEditor } from '../string-list-editor';

export function StackForm({ value, onChange }: { value: StackContent; onChange: (v: StackContent) => void }) {
  const set = <K extends keyof StackContent>(k: K, v: StackContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>groups</Label>
      <ListEditor
        items={value.groups}
        onChange={(groups) => set('groups', groups)}
        makeEmpty={() => ({ category: '', items: [] })}
        renderItem={(g, on) => (
          <>
            <Field label="category" value={g.category} onChangeText={(t) => on({ ...g, category: t })} />
            <StringListEditor label="items" items={g.items} onChange={(items) => on({ ...g, items })} />
          </>
        )}
      />
    </View>
  );
}
