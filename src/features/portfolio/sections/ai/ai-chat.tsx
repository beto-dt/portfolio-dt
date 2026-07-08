import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, Text, TextInput, View, type PressableStateCallbackType } from 'react-native';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts, radii } from '@/theme/tokens';
import { goToSection } from '@/ui/go-to-section';

type Msg = { role: 'user' | 'model'; text: string };
type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

const T = {
  es: {
    greeting: '¡Hola! Soy el agente IA de Luis. Puedo contarte sobre sus servicios, su experiencia y ayudarte a aterrizar tu idea. ¿Qué tienes en mente?',
    placeholder: 'Escribe tu pregunta…',
    send: 'Enviar',
    typing: 'escribiendo…',
    chips: ['¿Qué servicios ofrece Luis?', '¿Ha trabajado en fintech?', 'Necesito una app móvil'],
    limit: 'Por hoy llegué a mi límite de mensajes 😅 — mejor agenda una llamada gratuita con Luis.',
    error: 'No pude responder ahora mismo. Intenta de nuevo en un momento, o escríbele directo a Luis.',
    goContact: 'Ir a Contacto ↗',
    footer: 'Demo con límites de uso · Gemini Flash',
  },
  en: {
    greeting: "Hi! I'm Luis's AI agent. I can tell you about his services and experience, and help you shape your idea. What do you have in mind?",
    placeholder: 'Type your question…',
    send: 'Send',
    typing: 'typing…',
    chips: ['What services does Luis offer?', 'Has he worked in fintech?', 'I need a mobile app'],
    limit: "I've hit my message limit for today 😅 — better book a free call with Luis.",
    error: "I couldn't reply right now. Try again in a moment, or write to Luis directly.",
    goContact: 'Go to Contact ↗',
    footer: 'Usage-limited demo · Gemini Flash',
  },
};

/** The demo chat; fills the DemoModal body. onNavigate closes the modal before routing. */
export function AiChat({ onNavigate }: { onNavigate: () => void }) {
  const { locale } = useI18n();
  const t = T[locale];
  const [msgs, setMsgs] = useState<Msg[]>([{ role: 'model', text: t.greeting }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [walled, setWalled] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [msgs, busy]);

  const send = async (raw: string) => {
    const text = raw.trim().slice(0, 500);
    if (!text || busy || walled) return;
    const history = [...msgs, { role: 'user' as const, text }];
    setMsgs(history);
    setInput('');
    setBusy(true);
    try {
      // slice(1) drops the local greeting: Gemini contents must start with a user turn.
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, messages: history.slice(1) }),
      });
      if (res.status === 429) {
        setWalled(true);
        setMsgs((m) => [...m, { role: 'model', text: t.limit }]);
        return;
      }
      if (!res.ok) {
        setMsgs((m) => [...m, { role: 'model', text: t.error }]);
        return;
      }
      const data = (await res.json()) as { reply: string; remaining: number };
      setMsgs((m) => [...m, { role: 'model', text: data.reply }]);
      if (data.remaining <= 0) setWalled(true);
    } catch {
      setMsgs((m) => [...m, { role: 'model', text: t.error }]);
    } finally {
      setBusy(false);
    }
  };

  const goContact = () => {
    onNavigate();
    goToSection('contact');
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ padding: 20, gap: 12 }}>
        {msgs.map((m, i) => (
          <View
            key={`${i}-${m.role}`}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              backgroundColor: m.role === 'user' ? 'rgba(228,227,87,0.14)' : 'rgba(255,255,255,0.05)',
              borderWidth: 1,
              borderColor: m.role === 'user' ? 'rgba(228,227,87,0.3)' : colors.border,
              borderRadius: radii.md,
              paddingHorizontal: 14,
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontSize: 14, lineHeight: 21, color: colors.text }}>{m.text}</Text>
          </View>
        ))}
        {busy ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start' }}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={{ fontSize: 12, color: colors.textFaint }}>{t.typing}</Text>
          </View>
        ) : null}
        {msgs.length === 1 && !busy ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {t.chips.map((chip) => (
              <Pressable
                key={chip}
                onPress={() => send(chip)}
                style={({ hovered }: HoverState) => [
                  { borderWidth: 1, borderColor: hovered ? colors.accent : colors.border, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
                  webCursor as object,
                ]}
              >
                <Text style={{ fontSize: 12.5, color: colors.textMuted }}>{chip}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {walled ? (
          <Pressable
            onPress={goContact}
            style={({ hovered }: HoverState) => [
              { alignSelf: 'flex-start', backgroundColor: hovered ? '#eeed6b' : colors.accent, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
              webCursor as object,
            ]}
          >
            <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.onAccent }}>{t.goContact}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: colors.border }}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={t.placeholder}
          placeholderTextColor={colors.textFaint}
          maxLength={500}
          editable={!walled}
          onSubmitEditing={() => send(input)}
          style={{ flex: 1, color: colors.text, fontSize: 14, paddingHorizontal: 14, paddingVertical: 10, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: 'rgba(255,255,255,0.03)' }}
        />
        <Pressable
          onPress={() => send(input)}
          disabled={busy || walled}
          style={({ hovered }: HoverState) => [
            { backgroundColor: hovered ? '#eeed6b' : colors.accent, borderRadius: radii.md, paddingHorizontal: 16, paddingVertical: 10, opacity: busy || walled ? 0.5 : 1 },
            webCursor as object,
          ]}
        >
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 13, color: colors.onAccent }}>{t.send}</Text>
        </Pressable>
      </View>
      <Text style={{ fontSize: 10.5, color: colors.textFaint, textAlign: 'center', paddingBottom: 10 }}>{t.footer}</Text>
    </View>
  );
}
