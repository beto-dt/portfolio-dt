import { Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';

export function CertificationsSection() {
  const { content } = useI18n();
  const { certifications } = content;

  return (
    <Container style={{ paddingVertical: 56 }}>
      <SectionHeading kicker={certifications.kicker} heading={certifications.heading} />
      <View>
        {certifications.items.map((item) => (
          <View
            key={item.name}
            style={{
              flexDirection: 'row',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 16,
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(255,255,255,0.07)',
            }}
          >
            <Text style={{ flex: 1, fontSize: 13.5, color: 'rgb(223,226,230)' }}>{item.name}</Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{item.issuer}</Text>
          </View>
        ))}
      </View>
    </Container>
  );
}
