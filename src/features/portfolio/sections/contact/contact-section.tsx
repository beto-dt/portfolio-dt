import { useState } from 'react';
import { Linking, Platform, Pressable, Text, TextInput, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { Chip } from '@/ui/chip';
import { HoverLink } from '@/ui/hover-link';
import { Reveal } from '@/ui/reveal';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const labelTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '180ms' } as object) : null;
const underlineTransition = Platform.OS === 'web' ? ({ transformOrigin: 'left', transitionProperty: 'transform', transitionDuration: '200ms' } as object) : null;
const inputTransition = Platform.OS === 'web' ? ({ transitionProperty: 'border-color', transitionDuration: '160ms' } as object) : null;
const cardGlowWeb = Platform.OS === 'web'
  ? ({ backgroundImage: 'radial-gradient(700px 420px at 85% 0%, rgba(228,227,87,0.07), rgba(228,227,87,0) 70%)' } as object)
  : null;
const cardGridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', columnGap: 56, rowGap: 40 } as object)
  : null;

const FIELD_LABEL = { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase' as const, color: colors.textFaint };

function Detail({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  if (!value) return null;
  return (
    <Pressable style={{ gap: 3, minWidth: 150 }}>
      {({ hovered }: HoverState) => (
        <>
          <View style={{ gap: 4, alignSelf: 'flex-start' }}>
            <Text style={[FIELD_LABEL, { color: hovered ? colors.accent : colors.textFaint }, labelTransition as object]}>{label}</Text>
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

/** Dark themed input with accent focus ring; multiline for the message box. */
function FormInput({ value, onChangeText, placeholder, multiline }: { value: string; onChangeText: (t: string) => void; placeholder: string; multiline?: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      multiline={!!multiline}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        {
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: focused ? 'rgba(228,227,87,0.4)' : colors.border,
          borderRadius: radii.md,
          paddingHorizontal: 14,
          paddingVertical: 12,
          color: colors.text,
          fontSize: 14,
          fontFamily: fonts.body,
          ...(multiline ? { minHeight: 130, textAlignVertical: 'top' as const } : null),
        },
        inputTransition as object,
      ]}
    />
  );
}

export function ContactSection() {
  const { content, locale } = useI18n();
  const { contact } = content;
  const [name, setName] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const draft = () => {
    const n = name || '—';
    const t = type || '—';
    const b = budget || '—';
    return locale === 'es'
      ? `Hola Luis, soy ${n}.\nTipo de proyecto: ${t}.\nPresupuesto estimado: ${b}.\n\n${message}`
      : `Hi Luis, I'm ${n}.\nProject type: ${t}.\nEstimated budget: ${b}.\n\n${message}`;
  };
  const sendWhatsApp = () => Linking.openURL(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(draft())}`);
  const sendEmail = () => {
    const subject = locale === 'es' ? `Proyecto — ${type || 'consulta'}` : `Project — ${type || 'inquiry'}`;
    Linking.openURL(`mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(draft())}`);
  };

  return (
    <Container style={{ paddingVertical: 72 }} nativeID="contact">
      <View
        style={[
          { borderRadius: 24, borderWidth: 1, borderColor: 'rgba(228,227,87,0.25)', backgroundColor: 'rgba(255,255,255,0.02)', padding: 44 },
          cardGlowWeb as object,
        ]}
      >
        <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 40 }, cardGridWeb as object]}>
          <View>
            <Reveal delay={0}>
              <SectionHeading kicker={contact.kicker} heading={contact.heading} />
            </Reveal>
            <Reveal delay={70}>
              <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560 }}>{contact.blurb}</Text>
            </Reveal>
            <Reveal delay={140}>
              <View style={{ gap: 18, marginTop: 28, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
                <Detail label="Email" value={contact.email} onPress={() => Linking.openURL(`mailto:${contact.email}`)} />
                <Detail label="Teléfono" value={contact.phone} onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\s/g, '')}`)} />
                <Detail label="LinkedIn" value={contact.linkedinLabel} onPress={() => Linking.openURL(contact.linkedin)} />
                <Detail label="Ubicación" value={contact.location} />
              </View>
            </Reveal>
          </View>

          <Reveal delay={140} style={{ gap: 18 }}>
            <View style={{ gap: 8 }}>
              <Text style={FIELD_LABEL}>{contact.formNameLabel}</Text>
              <FormInput value={name} onChangeText={setName} placeholder={contact.formNamePlaceholder} />
            </View>
            <View style={{ gap: 8 }}>
              <Text style={FIELD_LABEL}>{contact.formTypeLabel}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {contact.projectTypes.map((t) => (
                  <Chip key={t} label={t} mono={false} active={type === t} onPress={() => setType(type === t ? null : t)} />
                ))}
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={FIELD_LABEL}>{contact.formBudgetLabel}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {contact.budgets.map((b) => (
                  <Chip key={b} label={b} active={budget === b} onPress={() => setBudget(budget === b ? null : b)} />
                ))}
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <Text style={FIELD_LABEL}>{contact.formMessageLabel}</Text>
              <FormInput value={message} onChangeText={setMessage} placeholder={contact.formMessagePlaceholder} multiline />
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              <AppButton label={contact.whatsappCta} onPress={sendWhatsApp} variant="primary" />
              <AppButton label={contact.emailCta} onPress={sendEmail} variant="outline" />
            </View>
            <Text style={{ fontSize: 12.5, lineHeight: 18, color: colors.textFaint }}>{contact.formHint}</Text>
          </Reveal>
        </View>
      </View>
    </Container>
  );
}
