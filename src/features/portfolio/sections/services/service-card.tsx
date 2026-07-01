import { Text, View } from 'react-native';
import type { ServiceItem } from '@/content/types';
import { colors, fonts, radii } from '@/theme/tokens';
import { HoverCard } from '@/ui/hover-card';

export function ServiceCard({ item }: { item: ServiceItem }) {
  return (
    <HoverCard
      style={{
        flexGrow: 1,
        flexBasis: 320,
        maxWidth: 560,
        padding: 24,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: radii.lg,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{item.index}</Text>
        <View style={{ backgroundColor: 'rgba(228,227,87,0.12)', borderRadius: radii.sm, paddingHorizontal: 9, paddingVertical: 4 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.5, color: colors.accent }}>{item.tag}</Text>
        </View>
      </View>
      <Text style={{ fontFamily: fonts.display, fontSize: 19, letterSpacing: -0.19, color: colors.text, marginBottom: 9 }}>
        {item.title}
      </Text>
      <Text style={{ fontSize: 13.5, lineHeight: 22, color: colors.textDim, fontFamily: fonts.body }}>
        {item.description}
      </Text>
    </HoverCard>
  );
}
