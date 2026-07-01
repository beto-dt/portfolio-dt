import { View } from 'react-native';
import { Field, Label } from './field';
import { ListEditor } from './list-editor';

export function StringListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <ListEditor<string>
        items={items}
        onChange={onChange}
        makeEmpty={() => ''}
        renderItem={(item, on) => <Field value={item} onChangeText={on} />}
      />
    </View>
  );
}
