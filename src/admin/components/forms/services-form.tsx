import { View } from 'react-native';
import type { ServicesContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function ServicesForm({ value, onChange }: { value: ServicesContent; onChange: (v: ServicesContent) => void }) {
  const set = <K extends keyof ServicesContent>(k: K, v: ServicesContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="requestCta" value={value.requestCta} onChangeText={(t) => set('requestCta', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ index: '', tag: '', title: '', description: '', projectType: '', recommendedModel: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="index" value={it.index} onChangeText={(t) => on({ ...it, index: t })} />
            <Field label="tag" value={it.tag} onChangeText={(t) => on({ ...it, tag: t })} />
            <Field label="title" value={it.title} onChangeText={(t) => on({ ...it, title: t })} />
            <Field label="description" value={it.description} onChangeText={(t) => on({ ...it, description: t })} multiline />
            <Field label="projectType" value={it.projectType} onChangeText={(t) => on({ ...it, projectType: t })} />
            <Field label="recommendedModel" value={it.recommendedModel} onChangeText={(t) => on({ ...it, recommendedModel: t })} />
          </>
        )}
      />
    </View>
  );
}
