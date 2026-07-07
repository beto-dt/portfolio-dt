import { View } from 'react-native';
import type { NavContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function NavForm({ value, onChange }: { value: NavContent; onChange: (v: NavContent) => void }) {
  const set = <K extends keyof NavContent>(k: K, v: NavContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="name" value={value.name} onChangeText={(t) => set('name', t)} />
      <Field label="role" value={value.role} onChangeText={(t) => set('role', t)} />
      <Field label="languageToggleLabel" value={value.languageToggleLabel} onChangeText={(t) => set('languageToggleLabel', t)} />
      <Field label="cta.label" value={value.cta.label} onChangeText={(t) => set('cta', { ...value.cta, label: t })} />
      <Field label="cta.anchor" value={value.cta.anchor} onChangeText={(t) => set('cta', { ...value.cta, anchor: t })} />
      <Label>dock</Label>
      <Field label="dock.home" value={value.dock.home} onChangeText={(t) => set('dock', { ...value.dock, home: t })} />
      <Field label="dock.services" value={value.dock.services} onChangeText={(t) => set('dock', { ...value.dock, services: t })} />
      <Field label="dock.about" value={value.dock.about} onChangeText={(t) => set('dock', { ...value.dock, about: t })} />
      <Field label="dock.projects" value={value.dock.projects} onChangeText={(t) => set('dock', { ...value.dock, projects: t })} />
      <Field label="dock.contact" value={value.dock.contact} onChangeText={(t) => set('dock', { ...value.dock, contact: t })} />
      <Field label="dock.blog" value={value.dock.blog} onChangeText={(t) => set('dock', { ...value.dock, blog: t })} />
      <Label>links</Label>
      <ListEditor
        items={value.links}
        onChange={(links) => set('links', links)}
        makeEmpty={() => ({ label: '', anchor: '' })}
        renderItem={(l, on) => (
          <>
            <Field label="label" value={l.label} onChangeText={(t) => on({ ...l, label: t })} />
            <Field label="anchor" value={l.anchor} onChangeText={(t) => on({ ...l, anchor: t })} />
          </>
        )}
      />
    </View>
  );
}
