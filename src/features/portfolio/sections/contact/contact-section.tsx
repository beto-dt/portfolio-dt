import { Linking, Pressable, Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';

export function ContactSection() {
  const { content } = useI18n();
  const { contact } = content;

  return (
    <Container style={{ paddingVertical: 72 }}>
      <SectionHeading kicker={contact.kicker} heading={contact.heading} />
      <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>
        {contact.blurb}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 16 }}>
        <Pressable
          onPress={() => Linking.openURL(`mailto:${contact.email}`)}
          style={{ backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 26, paddingVertical: 14 }}
        >
          <Text style={{ fontSize: 15, fontFamily: fonts.bodyMedium, color: colors.onAccent }}>{contact.cta}</Text>
        </Pressable>
        {contact.socials.map((social) => (
          <Pressable
            key={social.label}
            onPress={() => Linking.openURL(social.url)}
            style={{
              borderWidth: 1,
              borderColor: colors.borderStrong,
              borderRadius: radii.md,
              paddingHorizontal: 20,
              paddingVertical: 13,
            }}
          >
            <Text style={{ fontSize: 14, fontFamily: fonts.bodyMedium, color: 'rgb(231,233,236)' }}>{social.label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={{ marginTop: 24, fontFamily: fonts.mono, fontSize: 12.5, color: colors.textFaint }}>
        {contact.email}
      </Text>
    </Container>
  );
}
