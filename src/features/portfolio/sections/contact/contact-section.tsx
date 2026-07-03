import { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, Text, TextInput, View, useWindowDimensions, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { BookingCalendar } from './booking-calendar';
import { onBookingIntent } from './booking-intent';
import { SLOT_TIMES, formatSlot } from './booking-config';
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
const slotTransition = Platform.OS === 'web' ? ({ cursor: 'pointer', transitionProperty: 'background-color, border-color', transitionDuration: '140ms' } as object) : null;
const cardGlowWeb = Platform.OS === 'web'
  ? ({ backgroundImage: 'radial-gradient(700px 420px at 85% 0%, rgba(228,227,87,0.07), rgba(228,227,87,0) 70%)' } as object)
  : null;
const cardGridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', columnGap: 56, rowGap: 40 } as object)
  : null;

const FIELD_LABEL = { fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase' as const, color: colors.textFaint };
const ERROR_COLOR = '#ff8a8a';

/** Linear-time email sanity check (no regex backtracking). */
function isEmailish(v: string): boolean {
  if (!v || v.length > 200 || /\s/.test(v)) return false;
  const at = v.indexOf('@');
  if (at <= 0 || at !== v.lastIndexOf('@') || at === v.length - 1) return false;
  const domain = v.slice(at + 1);
  const dot = domain.indexOf('.');
  return dot > 0 && dot < domain.length - 1;
}

type Step = 'form' | 'schedule' | 'done';
type WizardError = 'required' | 'slot_taken' | 'network' | null;

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

function StepDot({ n, active }: { n: string; active: boolean }) {
  return (
    <View style={{ width: 22, height: 22, borderRadius: 999, alignItems: 'center', justifyContent: 'center', backgroundColor: active ? colors.accent : colors.surfaceStrong, borderWidth: 1, borderColor: active ? colors.accent : colors.border }}>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: active ? colors.onAccent : colors.textFaint }}>{n}</Text>
    </View>
  );
}

function Stepper({ step, projectLabel, scheduleLabel }: { step: Step; projectLabel: string; scheduleLabel: string }) {
  const two = step !== 'form';
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 22 }}>
      <StepDot n="1" active />
      <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: colors.text }}>{projectLabel}</Text>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
      <StepDot n="2" active={two} />
      <Text style={{ fontFamily: fonts.mono, fontSize: 12.5, color: two ? colors.text : colors.textFaint }}>{scheduleLabel}</Text>
    </View>
  );
}

export function ContactSection() {
  const { content, locale } = useI18n();
  const { contact } = content;
  const { width } = useWindowDimensions();
  const compact = width < 640;
  const [step, setStep] = useState<Step>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [taken, setTaken] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<WizardError>(null);
  const [model, setModel] = useState<string | null>(null);
  const [intentNotice, setIntentNotice] = useState<{ type: string; model: string } | null>(null);

  useEffect(() => onBookingIntent((i) => {
    if (i.model) setModel(i.model);
    if (i.projectType) {
      setType(i.projectType);
      setIntentNotice(i.model ? { type: i.projectType, model: i.model } : null);
    }
    setStep('form');
  }), []);

  const slot = date && time ? formatSlot(date, time, locale) : null;

  const fetchTaken = async (iso: string) => {
    try {
      const res = await fetch(`/api/booking?date=${iso}`);
      if (!res.ok) throw new Error('bad status');
      const data = (await res.json()) as { taken?: string[] };
      setTaken(Array.isArray(data.taken) ? data.taken : []);
    } catch {
      setTaken([]); // dev/offline: the server still enforces conflicts on POST
    }
  };

  const onPickDay = (iso: string) => {
    setDate(iso);
    setTime(null);
    setError(null);
    void fetchTaken(iso);
  };

  const goSchedule = () => {
    if (!name.trim() || !isEmailish(email.trim())) {
      setError('required');
      return;
    }
    setError(null);
    setStep('schedule');
  };

  const draft = () => {
    const n = name || '—';
    const t = type || '—';
    const b = budget || '—';
    const slotLine = slot ? (locale === 'es' ? `\nLlamada: ${slot}.` : `\nCall: ${slot}.`) : '';
    const modelLine = model ? (locale === 'es' ? `\nModelo: ${model}.` : `\nModel: ${model}.`) : '';
    return locale === 'es'
      ? `Hola Luis, soy ${n}.\nTipo de proyecto: ${t}.\nPresupuesto estimado: ${b}.${modelLine}${slotLine}\n\n${message}`
      : `Hi Luis, I'm ${n}.\nProject type: ${t}.\nEstimated budget: ${b}.${modelLine}${slotLine}\n\n${message}`;
  };

  const confirm = async () => {
    if (!date || !time || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), projectType: type ?? '', budget: budget ?? '', model: model ?? '', message, date, time, locale }),
      });
      if (res.status === 409) {
        setError('slot_taken');
        setTime(null);
        void fetchTaken(date);
        return;
      }
      if (!res.ok) throw new Error('bad status');
      setStep('done');
    } catch {
      setError('network');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setStep('form');
    setName('');
    setEmail('');
    setType(null);
    setBudget(null);
    setMessage('');
    setDate(null);
    setTime(null);
    setTaken([]);
    setError(null);
    setModel(null);
  };

  const errorText =
    error === 'required' ? contact.errorRequired :
    error === 'slot_taken' ? contact.errorSlotTaken :
    error === 'network' ? contact.errorNetwork : null;
  const freeCount = SLOT_TIMES.filter((t) => !taken.includes(t)).length;
  const banner = !date ? contact.bannerPickDay : !time ? contact.bannerPickTime : contact.bannerScheduled.replace('{slot}', slot ?? '');

  return (
    <Container style={{ paddingVertical: 72 }} nativeID="contact">
      <View
        style={[
          { borderRadius: compact ? 18 : 24, borderWidth: 1, borderColor: 'rgba(228,227,87,0.25)', backgroundColor: 'rgba(255,255,255,0.02)', padding: compact ? 22 : 44 },
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

          <Reveal delay={140}>
            <Stepper step={step} projectLabel={contact.stepProjectLabel} scheduleLabel={contact.stepScheduleLabel} />
            {step === 'form' ? (
              <View style={{ gap: 18 }}>
                {intentNotice ? (
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderColor: 'rgba(228,227,87,0.45)', backgroundColor: 'rgba(228,227,87,0.07)', borderRadius: radii.md, padding: 14 }}>
                    <Text style={{ fontSize: 14 }}>💡</Text>
                    <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}>
                      {contact.intentBanner.replace('{type}', intentNotice.type).replace('{model}', intentNotice.model)}
                    </Text>
                    <HoverLink label="✕" onPress={() => setIntentNotice(null)} color={colors.textFaint} hoverColor={colors.text} />
                  </View>
                ) : null}
                {model && !intentNotice ? (
                  <View style={{ gap: 8 }}>
                    <Text style={FIELD_LABEL}>{contact.interestLabel}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <Chip label={model} mono={false} active onPress={() => setModel(null)} />
                    </View>
                  </View>
                ) : null}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                  <View style={{ gap: 8, flexGrow: 1, flexBasis: 180 }}>
                    <Text style={FIELD_LABEL}>{contact.formNameLabel}</Text>
                    <FormInput value={name} onChangeText={setName} placeholder={contact.formNamePlaceholder} />
                  </View>
                  <View style={{ gap: 8, flexGrow: 1, flexBasis: 180 }}>
                    <Text style={FIELD_LABEL}>{contact.formEmailLabel}</Text>
                    <FormInput value={email} onChangeText={setEmail} placeholder={contact.formEmailPlaceholder} />
                  </View>
                </View>
                <View style={{ gap: 8 }}>
                  <Text style={FIELD_LABEL}>{contact.formTypeLabel}</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {contact.projectTypes.map((t) => (
                      <Chip key={t} label={t} mono={false} active={type === t} onPress={() => { setType(type === t ? null : t); if (intentNotice && t !== intentNotice.type) setIntentNotice(null); }} />
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
                <AppButton label={contact.nextCta} onPress={goSchedule} variant="primary" />
                {errorText ? <Text style={{ color: ERROR_COLOR, fontSize: 13 }}>{errorText}</Text> : null}
              </View>
            ) : step === 'schedule' ? (
              <View style={{ gap: 16 }}>
                <BookingCalendar selected={date} onSelect={onPickDay} locale={locale} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <Text style={FIELD_LABEL}>{contact.slotsHeading}</Text>
                  {date ? (
                    <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accent }}>
                      {freeCount} {contact.slotsFreeSuffix}
                    </Text>
                  ) : null}
                </View>
                {date ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {SLOT_TIMES.map((t) => {
                      const isTaken = taken.includes(t);
                      const sel = time === t;
                      return (
                        <Pressable
                          key={t}
                          onPress={isTaken ? undefined : () => { setTime(t); setError(null); }}
                          style={({ hovered }: HoverState) => [
                            {
                              borderRadius: radii.sm,
                              borderWidth: 1,
                              paddingHorizontal: 18,
                              paddingVertical: 9,
                              borderColor: sel ? colors.accent : hovered && !isTaken ? colors.borderStrong : colors.border,
                              backgroundColor: sel ? colors.accent : hovered && !isTaken ? colors.surfaceStrong : 'transparent',
                              opacity: isTaken ? 0.4 : 1,
                            },
                            isTaken ? null : (slotTransition as object),
                          ]}
                        >
                          <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: sel ? colors.onAccent : colors.text, textDecorationLine: isTaken ? 'line-through' : 'none' }}>
                            {t}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={{ fontSize: 13.5, color: colors.textDim }}>{contact.slotsPickDay}</Text>
                )}
                <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(228,227,87,0.35)', borderRadius: radii.md, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: 'rgba(228,227,87,0.05)' }}>
                  <Text style={{ fontSize: 14 }}>🗓</Text>
                  <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 19, color: colors.textMuted }}>{banner}</Text>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
                  <AppButton label={contact.backCta} onPress={() => setStep('form')} variant="outline" />
                  <View style={{ flexGrow: 1, opacity: date && time ? 1 : 0.5 }}>
                    <AppButton label={submitting ? '…' : contact.confirmCta} onPress={confirm} variant="primary" />
                  </View>
                </View>
                {errorText ? <Text style={{ color: ERROR_COLOR, fontSize: 13 }}>{errorText}</Text> : null}
                <HoverLink label={contact.whatsappAlt} onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(draft())}`)} color={colors.textFaint} hoverColor={colors.accent} />
                <Text style={{ fontSize: 12.5, lineHeight: 18, color: colors.textFaint }}>{contact.formHint}</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', gap: 14, paddingVertical: 24 }}>
                <View style={{ width: 64, height: 64, borderRadius: 999, borderWidth: 2, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(228,227,87,0.08)' }}>
                  <Text style={{ fontSize: 26, color: colors.accent }}>✓</Text>
                </View>
                <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text, textAlign: 'center' }}>{contact.successTitle}</Text>
                <Text style={{ fontSize: 14.5, lineHeight: 23, color: colors.textMuted, textAlign: 'center', maxWidth: 400 }}>
                  {contact.successBody.replace('{slot}', slot ?? '')}
                </Text>
                <AppButton label={contact.successAgain} onPress={reset} variant="outline" />
              </View>
            )}
          </Reveal>
        </View>
      </View>
    </Container>
  );
}
