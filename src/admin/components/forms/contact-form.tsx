import { View } from 'react-native';
import type { ContactContent } from '@/content/types';
import { Field } from '../field';

export function ContactForm({ value, onChange }: { value: ContactContent; onChange: (v: ContactContent) => void }) {
  const set = <K extends keyof ContactContent>(k: K, v: ContactContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Field label="emailCta" value={value.emailCta} onChangeText={(t) => set('emailCta', t)} />
      <Field label="whatsappCta" value={value.whatsappCta} onChangeText={(t) => set('whatsappCta', t)} />
      <Field label="email" value={value.email} onChangeText={(t) => set('email', t)} />
      <Field label="phone" value={value.phone} onChangeText={(t) => set('phone', t)} />
      <Field label="whatsapp (solo dígitos)" value={value.whatsapp} onChangeText={(t) => set('whatsapp', t)} />
      <Field label="linkedin" value={value.linkedin} onChangeText={(t) => set('linkedin', t)} />
      <Field label="location" value={value.location} onChangeText={(t) => set('location', t)} />
    </View>
  );
}
