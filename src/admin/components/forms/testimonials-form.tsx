import { View } from 'react-native';
import type { TestimonialsContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function TestimonialsForm({ value, onChange }: { value: TestimonialsContent; onChange: (v: TestimonialsContent) => void }) {
  const set = <K extends keyof TestimonialsContent>(k: K, v: TestimonialsContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Field label="linkedinUrl" value={value.linkedinUrl} onChangeText={(t) => set('linkedinUrl', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ quote: '', name: '', role: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="quote" value={it.quote} onChangeText={(t) => on({ ...it, quote: t })} multiline />
            <Field label="name" value={it.name} onChangeText={(t) => on({ ...it, name: t })} />
            <Field label="role" value={it.role} onChangeText={(t) => on({ ...it, role: t })} />
          </>
        )}
      />
    </View>
  );
}
