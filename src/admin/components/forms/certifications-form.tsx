import { View } from 'react-native';
import type { CertificationsContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function CertificationsForm({ value, onChange }: { value: CertificationsContent; onChange: (v: CertificationsContent) => void }) {
  const set = <K extends keyof CertificationsContent>(k: K, v: CertificationsContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ name: '', issuer: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="name" value={it.name} onChangeText={(t) => on({ ...it, name: t })} />
            <Field label="issuer" value={it.issuer} onChangeText={(t) => on({ ...it, issuer: t })} />
          </>
        )}
      />
    </View>
  );
}
