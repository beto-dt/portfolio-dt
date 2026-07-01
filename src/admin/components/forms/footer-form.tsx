import { View } from 'react-native';
import type { FooterContent } from '@/content/types';
import { Field } from '../field';

export function FooterForm({ value, onChange }: { value: FooterContent; onChange: (v: FooterContent) => void }) {
  const set = <K extends keyof FooterContent>(k: K, v: FooterContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="copyright" value={value.copyright} onChangeText={(t) => set('copyright', t)} />
      <Field label="tagline" value={value.tagline} onChangeText={(t) => set('tagline', t)} />
    </View>
  );
}
