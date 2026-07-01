import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

export function ImpactSection() {
  const { content } = useI18n();
  const { impact } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <SectionHeading kicker={impact.kicker} heading={impact.heading} />
      {/* The container background shows through the 1px gap, drawing hairline
          dividers between cells (matches the mock's grid look). */}
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 1,
          backgroundColor: colors.border,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 18,
          overflow: 'hidden',
        }}
      >
        {impact.items.map((item) => (
          <View
            key={item.label}
            style={{
              flexGrow: 1,
              flexBasis: 180,
              minWidth: 160,
              gap: 8,
              paddingVertical: 28,
              paddingHorizontal: 22,
              backgroundColor: colors.surfaceCell,
            }}
          >
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 38, letterSpacing: -0.8, lineHeight: 40, color: colors.accent }}>
              {item.value}
            </Text>
            <Text style={{ fontSize: 12.5, lineHeight: 19, color: colors.textDim }}>{item.label}</Text>
          </View>
        ))}
      </View>
    </Container>
  );
}
