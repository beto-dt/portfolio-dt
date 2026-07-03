import { View } from 'react-native';
import type { GlobalReachContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';
import { StringListEditor } from '../string-list-editor';

export function GlobalReachForm({ value, onChange }: { value: GlobalReachContent; onChange: (v: GlobalReachContent) => void }) {
  const set = <K extends keyof GlobalReachContent>(k: K, v: GlobalReachContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Label>stats</Label>
      <ListEditor
        items={value.stats}
        onChange={(stats) => set('stats', stats)}
        makeEmpty={() => ({ value: '', label: '' })}
        renderItem={(s, on) => (
          <>
            <Field label="value" value={s.value} onChangeText={(t) => on({ ...s, value: t })} />
            <Field label="label" value={s.label} onChangeText={(t) => on({ ...s, label: t })} />
          </>
        )}
      />
      <Field label="locationsHeading" value={value.locationsHeading} onChangeText={(t) => set('locationsHeading', t)} />
      <Label>locations</Label>
      <ListEditor
        items={value.locations}
        onChange={(locations) => set('locations', locations)}
        makeEmpty={() => ({ name: '', tag: '' })}
        renderItem={(l, on) => (
          <>
            <Field label="name" value={l.name} onChangeText={(t) => on({ ...l, name: t })} />
            <Field label="tag" value={l.tag} onChangeText={(t) => on({ ...l, tag: t })} />
          </>
        )}
      />
      <Field label="languagesHeading" value={value.languagesHeading} onChangeText={(t) => set('languagesHeading', t)} />
      <Label>languages</Label>
      <ListEditor
        items={value.languages}
        onChange={(languages) => set('languages', languages)}
        makeEmpty={() => ({ language: '', level: '', percent: 0 })}
        renderItem={(l, on) => (
          <>
            <Field label="language" value={l.language} onChangeText={(t) => on({ ...l, language: t })} />
            <Field label="level" value={l.level} onChangeText={(t) => on({ ...l, level: t })} />
            <Field label="percent (0-100)" value={String(l.percent)} onChangeText={(t) => on({ ...l, percent: Number(t) || 0 })} />
          </>
        )}
      />
      <Field label="teamHeading" value={value.teamHeading} onChangeText={(t) => set('teamHeading', t)} />
      <StringListEditor label="teamItems" items={value.teamItems} onChange={(teamItems) => set('teamItems', teamItems)} />
    </View>
  );
}
