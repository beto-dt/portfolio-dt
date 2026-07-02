import { View } from 'react-native';
import type { CollaborationContent } from '@/content/types';
import { Chip } from '@/ui/chip';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';
import { StringListEditor } from '../string-list-editor';

export function CollaborationForm({ value, onChange }: { value: CollaborationContent; onChange: (v: CollaborationContent) => void }) {
  const set = <K extends keyof CollaborationContent>(k: K, v: CollaborationContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Label>models</Label>
      <ListEditor
        items={value.models}
        onChange={(models) => set('models', models)}
        makeEmpty={() => ({ tag: '', title: '', description: '', features: [], cta: '', popular: false })}
        renderItem={(m, on) => (
          <>
            <Field label="tag" value={m.tag} onChangeText={(t) => on({ ...m, tag: t })} />
            <Field label="title" value={m.title} onChangeText={(t) => on({ ...m, title: t })} />
            <Field label="description" value={m.description} onChangeText={(t) => on({ ...m, description: t })} multiline />
            <StringListEditor label="features" items={m.features} onChange={(features) => on({ ...m, features })} />
            <Field label="cta" value={m.cta} onChangeText={(t) => on({ ...m, cta: t })} />
            <View style={{ alignSelf: 'flex-start' }}>
              <Chip label="popular" active={!!m.popular} onPress={() => on({ ...m, popular: !m.popular })} />
            </View>
          </>
        )}
      />
    </View>
  );
}
