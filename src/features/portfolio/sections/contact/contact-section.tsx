import { Linking, Pressable, Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';

function Detail({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  if (!value) return null;
  return (
    <View style={{ gap: 3, minWidth: 150 }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: colors.textFaint }}>{label}</Text>
      <Text onPress={onPress} style={{ fontSize: 13.5, color: onPress ? colors.accent : colors.textMuted }}>{value}</Text>
    </View>
  );
}

export function ContactSection() {
  const { content } = useI18n();
  const { contact } = content;
  return (
    <Container style={{ paddingVertical: 72 }}>
      <SectionHeading kicker={contact.kicker} heading={contact.heading} />
      <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{contact.blurb}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <Pressable onPress={() => Linking.openURL(`mailto:${contact.email}`)} style={{ backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 26, paddingVertical: 14 }}>
          <Text style={{ fontSize: 15, fontFamily: fonts.bodyMedium, color: colors.onAccent }}>{contact.emailCta}</Text>
        </Pressable>
        <Pressable onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}`)} style={{ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.md, paddingHorizontal: 24, paddingVertical: 13 }}>
          <Text style={{ fontSize: 15, fontFamily: fonts.bodyMedium, color: 'rgb(231,233,236)' }}>{contact.whatsappCta}</Text>
        </Pressable>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Detail label="Email" value={contact.email} onPress={() => Linking.openURL(`mailto:${contact.email}`)} />
        <Detail label="Teléfono" value={contact.phone} onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\s/g, '')}`)} />
        <Detail label="LinkedIn" value={contact.linkedin} onPress={() => Linking.openURL(contact.linkedin)} />
        <Detail label="Ubicación" value={contact.location} />
      </View>
    </Container>
  );
}
