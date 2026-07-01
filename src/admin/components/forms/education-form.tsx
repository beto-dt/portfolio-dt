import { View } from 'react-native';
import type { EducationContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function EducationForm({ value, onChange }: { value: EducationContent; onChange: (v: EducationContent) => void }) {
  const set = <K extends keyof EducationContent>(k: K, v: EducationContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ title: '', institution: '', period: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="title" value={it.title} onChangeText={(t) => on({ ...it, title: t })} />
            <Field label="institution" value={it.institution} onChangeText={(t) => on({ ...it, institution: t })} />
            <Field label="period" value={it.period} onChangeText={(t) => on({ ...it, period: t })} />
          </>
        )}
      />
      <Field label="languagesHeading" value={value.languagesHeading} onChangeText={(t) => set('languagesHeading', t)} />
      <Label>languages</Label>
      <ListEditor
        items={value.languages}
        onChange={(languages) => set('languages', languages)}
        makeEmpty={() => ({ language: '', level: '' })}
        renderItem={(l, on) => (
          <>
            <Field label="language" value={l.language} onChangeText={(t) => on({ ...l, language: t })} />
            <Field label="level" value={l.level} onChangeText={(t) => on({ ...l, level: t })} />
          </>
        )}
      />
    </View>
  );
}
