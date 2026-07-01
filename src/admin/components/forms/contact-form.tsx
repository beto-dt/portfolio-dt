import { View } from 'react-native';
import type { ContactContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function ContactForm({ value, onChange }: { value: ContactContent; onChange: (v: ContactContent) => void }) {
  const set = <K extends keyof ContactContent>(k: K, v: ContactContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Field label="email" value={value.email} onChangeText={(t) => set('email', t)} />
      <Field label="cta" value={value.cta} onChangeText={(t) => set('cta', t)} />
      <Label>socials</Label>
      <ListEditor
        items={value.socials}
        onChange={(socials) => set('socials', socials)}
        makeEmpty={() => ({ label: '', url: '' })}
        renderItem={(s, on) => (
          <>
            <Field label="label" value={s.label} onChangeText={(t) => on({ ...s, label: t })} />
            <Field label="url" value={s.url} onChangeText={(t) => on({ ...s, url: t })} />
          </>
        )}
      />
    </View>
  );
}
