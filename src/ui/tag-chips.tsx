import { Text, View } from 'react-native';
import { colors, fonts } from '@/theme/tokens';

/** Accent-tinted mono tag pills (blog cards and post headers). */
export function TagChips({ tags }: { tags: string[] }) {
  return (
    <>
      {tags.map((tag) => (
        <View key={tag} style={{ backgroundColor: 'rgba(228,227,87,0.12)', borderRadius: 6, paddingHorizontal: 9, paddingVertical: 4 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>{tag}</Text>
        </View>
      ))}
    </>
  );
}
