import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { Pill } from '../../components/pill';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';

export function StackSection() {
  const { content } = useI18n();
  const { stack } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <SectionHeading kicker={stack.kicker} heading={stack.heading} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
        {stack.groups.map((group) => (
          <View
            key={group.category}
            style={{
              flexGrow: 1,
              flexBasis: 240,
              minWidth: 220,
              padding: 20,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: radii.lg - 2,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                letterSpacing: 0.55,
                textTransform: 'uppercase',
                color: colors.textFaint,
                marginBottom: 14,
              }}
            >
              {group.category}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {group.items.map((item) => (
                <Pill key={item} label={item} />
              ))}
            </View>
          </View>
        ))}
      </View>
    </Container>
  );
}
