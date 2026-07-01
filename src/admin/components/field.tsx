import { Pressable, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

export const fieldInputStyle = {
  color: colors.text,
  fontFamily: fonts.body,
  fontSize: 14,
  backgroundColor: colors.surfaceStrong,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.sm,
  paddingHorizontal: 10,
  paddingVertical: 8,
} as const;

export function Label({ children }: { children: string }) {
  return <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{children}</Text>;
}

export function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[fieldInputStyle, multiline ? { minHeight: 72, textAlignVertical: 'top' } : null]}
        placeholderTextColor={colors.textFaint}
      />
    </View>
  );
}

export function BoolField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable
        onPress={() => onChange(!value)}
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          backgroundColor: value ? colors.accent : colors.surfaceStrong,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 3,
        }}
      >
        <View style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: value ? colors.onAccent : colors.textMuted, alignSelf: value ? 'flex-end' : 'flex-start' }} />
      </Pressable>
      <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: fonts.mono }}>{label}</Text>
    </View>
  );
}
