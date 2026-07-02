import { Linking, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { HoverLink } from '@/ui/hover-link';
import { Reveal } from '@/ui/reveal';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const labelTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '180ms' } as object) : null;
const underlineTransition = Platform.OS === 'web' ? ({ transformOrigin: 'left', transitionProperty: 'transform', transitionDuration: '200ms' } as object) : null;

function Detail({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  if (!value) return null;
  return (
    <Pressable style={{ gap: 3, minWidth: 150 }}>
      {({ hovered }: HoverState) => (
        <>
          <View style={{ gap: 4, alignSelf: 'flex-start' }}>
            <Text style={[{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: hovered ? colors.accent : colors.textFaint }, labelTransition as object]}>
              {label}
            </Text>
            <View style={[{ height: 2, borderRadius: 2, backgroundColor: colors.accent, transform: [{ scaleX: hovered ? 1 : 0 }] }, underlineTransition as object]} />
          </View>
          {onPress ? (
            <HoverLink label={value} onPress={onPress} color={colors.accent} hoverColor={colors.text} />
          ) : (
            <Text style={{ fontSize: 13.5, color: colors.textMuted }}>{value}</Text>
          )}
        </>
      )}
    </Pressable>
  );
}

export function ContactSection() {
  const { content } = useI18n();
  const { contact } = content;
  return (
    <Container style={{ paddingVertical: 72 }} nativeID="contact">
      <Reveal delay={0}>
        <SectionHeading kicker={contact.kicker} heading={contact.heading} />
      </Reveal>
      <Reveal delay={70}>
        <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{contact.blurb}</Text>
      </Reveal>

      <Reveal delay={140}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <AppButton label={contact.emailCta} onPress={() => Linking.openURL(`mailto:${contact.email}`)} variant="primary" />
          <AppButton label={contact.whatsappCta} onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}`)} variant="outline" />
        </View>
      </Reveal>

      <Reveal delay={210}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Detail label="Email" value={contact.email} onPress={() => Linking.openURL(`mailto:${contact.email}`)} />
          <Detail label="Teléfono" value={contact.phone} onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\s/g, '')}`)} />
          <Detail label="LinkedIn" value={contact.linkedin} onPress={() => Linking.openURL(contact.linkedin)} />
          <Detail label="Ubicación" value={contact.location} />
        </View>
      </Reveal>
    </Container>
  );
}
