import { View } from 'react-native';
import type { ProjectsContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';
import { StringListEditor } from '../string-list-editor';

export function ProjectsForm({ value, onChange }: { value: ProjectsContent; onChange: (v: ProjectsContent) => void }) {
  const set = <K extends keyof ProjectsContent>(k: K, v: ProjectsContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ category: '', title: '', description: '', tech: [] })}
        renderItem={(it, on) => (
          <>
            <Field label="category" value={it.category} onChangeText={(t) => on({ ...it, category: t })} />
            <Field label="title" value={it.title} onChangeText={(t) => on({ ...it, title: t })} />
            <Field label="description" value={it.description} onChangeText={(t) => on({ ...it, description: t })} multiline />
            <StringListEditor label="tech" items={it.tech} onChange={(tech) => on({ ...it, tech })} />
          </>
        )}
      />
    </View>
  );
}
