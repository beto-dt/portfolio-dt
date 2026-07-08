# AI Sales Agent Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Second interactive demo in `/proyectos`: «Habla con mi agente IA» — a modal chat powered by Gemini Flash behind a hard-capped Cloud Function that answers from the CMS and drives leads to book a call.

**Architecture:** `chatAgent` onRequest function (`/api/chat` rewrite) validates → enforces caps in a Firestore transaction (10/day/visitor via salted IP hash, 300/day global) → builds a system prompt from `content/{locale}` (10-min memory cache) → calls Gemini REST → `{ reply, remaining }`. UI: shared `DemoModal` chrome extracted from the WebAR card, new `AiDemoCard` + `AiChat`.

**Tech Stack:** Gemini REST via native `fetch` (no new deps), firebase-functions v2, existing UI primitives.

**Spec:** `docs/superpowers/specs/2026-07-08-ai-sales-agent-design.md`
**Branch:** `feat/ai-sales-agent` (created; spec committed)

**Verification instead of tests:** no test runner. Verify with `npx tsc --noEmit`, `npm --prefix functions run build`, `npx expo export -p web`, bundle-hygiene grep, and preview checks (fetch stubbed for `/api/chat` — headless preview has no functions emulator). NEVER run `npx expo lint`.

---

### Task 1: `functions/src/agent.ts` — prompt builder + Gemini client

**Files:**
- Create: `functions/src/agent.ts`

- [ ] **Step 1: Write the module**

```ts
import { getFirestore } from 'firebase-admin/firestore';

// Switch to 'gemini-2.5-flash-lite' (bigger free-tier quota) by editing this
// constant and redeploying if the daily quota ever pinches.
const MODEL = 'gemini-2.5-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
const CACHE_TTL_MS = 10 * 60 * 1000;

export type ChatMessage = { role: 'user' | 'model'; text: string };

/** Thrown by the caps transaction; mapped to HTTP 429 by chatAgent. */
export class CapError extends Error {
  constructor(public code: 'global_limit' | 'user_limit') {
    super(code);
  }
}

// Minimal shape of the CMS doc fields the prompt uses (content/{locale}).
type ContentDoc = {
  hero?: { titleLead?: string; titleAccent?: string; subtitle?: string; stats?: { value: string; label: string }[] };
  services?: { items?: { index: string; title: string; description: string }[] };
  projects?: { items?: { category: string; title: string; description: string; tech: string[] }[] };
  experience?: { items?: { period: string; role: string; company: string }[] };
};

const promptCache = new Map<string, { prompt: string; at: number }>();

const RULES = {
  es: `Eres el agente comercial del portfolio de Luis Alberto De La Torre (luisdelatorre.dev), desarrollador Senior Full-Stack & Mobile en Quito, Ecuador (trabaja remoto en español e inglés).

Reglas estrictas:
- Responde SOLO sobre Luis, sus servicios, experiencia y proyectos listados abajo. Si preguntan otra cosa (clima, política, código ajeno, otros temas), redirige amablemente a cómo Luis puede ayudar.
- NUNCA des precios ni tarifas: invita a agendar una llamada gratuita en la página de Contacto del sitio, o por WhatsApp desde el botón del sitio.
- Tu objetivo: entender qué necesita el visitante (tipo de proyecto, plazos) en 1-2 preguntas y llevarlo a agendar la llamada.
- Máximo 150 palabras por respuesta. Tono cercano y profesional. No inventes datos: si no está abajo, dilo y ofrece la llamada.
- Responde siempre en español.`,
  en: `You are the sales agent for the portfolio of Luis Alberto De La Torre (luisdelatorre.dev), a Senior Full-Stack & Mobile developer in Quito, Ecuador (works remotely in Spanish and English).

Strict rules:
- ONLY answer about Luis, his services, experience and the projects listed below. If asked anything else (weather, politics, unrelated code, other topics), kindly redirect to how Luis can help.
- NEVER give prices or rates: invite the visitor to book a free call on the site's Contact page, or via the site's WhatsApp button.
- Your goal: understand what the visitor needs (project type, timeline) in 1-2 questions and lead them to book the call.
- Max 150 words per reply. Friendly, professional tone. Never invent facts: if it's not below, say so and offer the call.
- Always reply in English.`,
} as const;

export async function buildSystemPrompt(locale: 'es' | 'en'): Promise<string> {
  const hit = promptCache.get(locale);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.prompt;

  const snap = await getFirestore().doc(`content/${locale}`).get();
  if (!snap.exists) throw new Error(`content/${locale} missing`);
  const c = snap.data() as ContentDoc;

  const profile = `${c.hero?.titleLead ?? ''} ${c.hero?.titleAccent ?? ''} — ${c.hero?.subtitle ?? ''}`.trim();
  const stats = (c.hero?.stats ?? []).map((s) => `${s.value} ${s.label}`).join(' · ');
  const services = (c.services?.items ?? [])
    .map((s) => `- ${s.index} ${s.title}: ${s.description}`)
    .join('\n');
  const projects = (c.projects?.items ?? [])
    .map((p) => `- [${p.category}] ${p.title}: ${p.description} (${p.tech.join(', ')})`)
    .join('\n');
  const experience = (c.experience?.items ?? [])
    .map((e) => `- ${e.period}: ${e.role} · ${e.company}`)
    .join('\n');

  const prompt = [
    RULES[locale],
    '',
    locale === 'es' ? '## Perfil' : '## Profile',
    profile,
    stats,
    '',
    locale === 'es' ? '## Servicios' : '## Services',
    services,
    '',
    locale === 'es' ? '## Proyectos' : '## Projects',
    projects,
    '',
    locale === 'es' ? '## Experiencia' : '## Experience',
    experience,
  ].join('\n');

  promptCache.set(locale, { prompt, at: Date.now() });
  return prompt;
}

export async function askGemini(apiKey: string, system: string, messages: ChatMessage[]): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: system }] },
      contents: messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
      generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
    }),
  });
  if (!res.ok) throw new Error(`gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const reply = (data.candidates?.[0]?.content?.parts ?? [])
    .map((p) => p.text ?? '')
    .join('')
    .trim();
  if (!reply) throw new Error('gemini empty reply');
  return reply;
}
```

- [ ] **Step 2: Build to verify**

Run: `npm --prefix functions run build` → exit 0.

- [ ] **Step 3: Commit**

```bash
git add functions/src/agent.ts
git commit -m "feat(ai): agent module — CMS prompt builder + Gemini REST client"
```

---

### Task 2: `chatAgent` function + rules + rewrite + 'ai' key

**Files:**
- Modify: `functions/src/index.ts`
- Modify: `firestore.rules`
- Modify: `firebase.json`

- [ ] **Step 1: Add the function**

In `functions/src/index.ts`: add to the imports `import { CapError, askGemini, buildSystemPrompt, type ChatMessage } from './agent';`, add `'ai',` to `SECTION_KEYS` (after `'ar',`), and append at the end of the file:

```ts
// ---------------------------------------------------------------------------
// AI sales agent (demo): hard-capped chat behind /api/chat.
// ---------------------------------------------------------------------------

const GEMINI_API_KEY = defineSecret('GEMINI_API_KEY');

const CHAT_USER_DAILY_LIMIT = 10;
const CHAT_GLOBAL_DAILY_LIMIT = 300;
const CHAT_MAX_INPUT_CHARS = 500;
const CHAT_MAX_TURNS = 12;

function chatIpHash(forwarded: string | undefined, fallbackIp: string | undefined): string {
  const ip = forwarded?.split(',')[0]?.trim() || fallbackIp || 'unknown';
  return createHash('sha256').update(`${ip}|chat|${FEEDBACK_SALT}`).digest('hex');
}

export const chatAgent = onRequest(
  { region: 'us-central1', cors: true, secrets: [GEMINI_API_KEY] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'method_not_allowed' });
      return;
    }
    const { locale, messages } = (req.body ?? {}) as { locale?: unknown; messages?: unknown };
    const loc = locale === 'en' ? 'en' : locale === 'es' ? 'es' : null;
    if (!loc || !Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'bad_request' });
      return;
    }
    const turns: ChatMessage[] = [];
    for (const m of messages.slice(-CHAT_MAX_TURNS)) {
      const role = (m as { role?: unknown })?.role;
      const text = (m as { text?: unknown })?.text;
      if ((role !== 'user' && role !== 'model') || typeof text !== 'string' || !text.trim()) {
        res.status(400).json({ error: 'bad_request' });
        return;
      }
      turns.push({ role, text: text.trim().slice(0, 2000) });
    }
    const last = turns[turns.length - 1];
    if (last.role !== 'user' || last.text.length > CHAT_MAX_INPUT_CHARS) {
      res.status(400).json({ error: 'bad_request' });
      return;
    }

    const ipHash = chatIpHash(req.headers['x-forwarded-for'] as string | undefined, req.ip);
    const usageRef = db.doc(`chatUsage/${new Date().toISOString().slice(0, 10)}`);
    try {
      const remaining = await db.runTransaction(async (tx) => {
        const snap = await tx.get(usageRef);
        const total = (snap.data()?.total as number | undefined) ?? 0;
        const mine = ((snap.data()?.byIp as Record<string, number> | undefined) ?? {})[ipHash] ?? 0;
        if (total >= CHAT_GLOBAL_DAILY_LIMIT) throw new CapError('global_limit');
        if (mine >= CHAT_USER_DAILY_LIMIT) throw new CapError('user_limit');
        tx.set(
          usageRef,
          { total: FieldValue.increment(1), byIp: { [ipHash]: FieldValue.increment(1) } },
          { merge: true },
        );
        return CHAT_USER_DAILY_LIMIT - mine - 1;
      });

      const system = await buildSystemPrompt(loc);
      const reply = await askGemini(GEMINI_API_KEY.value(), system, turns);
      res.json({ reply, remaining });
    } catch (e) {
      if (e instanceof CapError) {
        res.status(429).json({ error: e.code });
        return;
      }
      console.error('chatAgent error', e);
      res.status(503).json({ error: 'unavailable' });
    }
  },
);
```

- [ ] **Step 2: Firestore rules for chatUsage**

In `firestore.rules`, before the final deny-all `match /{document=**}` block:

```
    // Chat usage counters are written only by the chatAgent function; the
    // owner can read them to monitor the demo.
    match /chatUsage/{doc} {
      allow read: if request.auth != null
        && request.auth.token.email_verified == true
        && request.auth.token.email == 'luis.atorred24@gmail.com';
      allow write: if false;
    }
```

- [ ] **Step 3: Hosting rewrite**

In `firebase.json`, add to `rewrites` (after the `/api/feedback` entry):

```json
      {
        "source": "/api/chat",
        "function": {
          "functionId": "chatAgent",
          "region": "us-central1"
        }
      }
```

- [ ] **Step 4: Build + validate + commit**

Run: `npm --prefix functions run build && python3 -c "import json; json.load(open('firebase.json')); print('valid')"` → exit 0, `valid`.

```bash
git add functions/src/index.ts firestore.rules firebase.json
git commit -m "feat(ai): chatAgent function — caps transaction + /api/chat rewrite + rules"
```

---

### Task 3: `DemoModal` extraction + `ArDemoCard` refactor

**Files:**
- Create: `src/features/portfolio/components/demo-modal.tsx`
- Modify: `src/features/portfolio/sections/ar/ar-demo-card.tsx`

- [ ] **Step 1: Create the shared modal chrome**

`src/features/portfolio/components/demo-modal.tsx` (this is the exact chrome currently inline in `ar-demo-card.tsx` — behavior unchanged):

```tsx
import type { ReactNode } from 'react';
import { Modal, Platform, Pressable, Text, View, useWindowDimensions, type PressableStateCallbackType } from 'react-native';
import { colors, fonts } from '@/theme/tokens';
import { Reveal } from '@/ui/reveal';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const webCursor = Platform.OS === 'web' ? ({ cursor: 'pointer' } as object) : null;

/**
 * Shared chrome for the interactive-demo modals (WebAR, AI chat).
 * animationType is left at 'none': RNW's animated Modal wrapper can leave
 * pointer-events:none stuck after the fade, freezing every press inside.
 * Reveal provides the fade; the backdrop is a SIBLING of the dialog because
 * nested Pressables fight over the responder on react-native-web.
 */
export function DemoModal({
  visible,
  title,
  closeLabel,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { height } = useWindowDimensions();
  return (
    <Modal visible={visible} transparent onRequestClose={onClose}>
      <Reveal slide={false} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Pressable
          onPress={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.72)' }}
        />
        <View
          style={{
            width: '92%',
            maxWidth: 900,
            height: Math.min(height * 0.78, 640),
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 24,
            backgroundColor: '#0d0e11',
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.text }}>{title}</Text>
            <Pressable onPress={onClose} accessibilityLabel={closeLabel} style={[{ padding: 6 }, webCursor as object]}>
              {({ hovered }: HoverState) => (
                <Text style={{ fontSize: 18, color: hovered ? colors.accent : colors.textMuted }}>✕</Text>
              )}
            </Pressable>
          </View>
          {children}
        </View>
      </Reveal>
    </Modal>
  );
}
```

- [ ] **Step 2: Refactor ArDemoCard onto it**

Replace the whole `src/features/portfolio/sections/ar/ar-demo-card.tsx` with:

```tsx
import { useState } from 'react';
import { markSectionSeen } from '@/analytics/tracker';
import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { DemoModal } from '../../components/demo-modal';
import { ProjectCard } from '../projects/project-card';
import { ArViewer } from './ar-viewer';

const T = {
  es: {
    category: 'DEMO INTERACTIVO',
    title: 'Realidad Aumentada en tu navegador',
    description:
      'Una torre 3D que puedes girar, acercar y — desde tu móvil — colocar en tu espacio real con un tap, sin instalar nada. Modelo generado por código y servido como WebAR.',
    cta: 'Abrir demo ↗',
    modalTitle: 'Demo WebAR',
    close: 'Cerrar',
  },
  en: {
    category: 'INTERACTIVE DEMO',
    title: 'Augmented Reality in your browser',
    description:
      'A 3D rook you can rotate, zoom and — from your phone — place in your real space with one tap, nothing to install. Model generated from code and served as WebAR.',
    cta: 'Open demo ↗',
    modalTitle: 'WebAR demo',
    close: 'Close',
  },
};

const TECH = ['WebAR', '3D', 'model-viewer', 'Scene Viewer', 'Quick Look'];

/** WebAR card of the projects grid: opens the viewer in the shared demo modal. */
export function ArDemoCard() {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const t = T[locale];

  const item: ProjectItem = { category: t.category, title: t.title, description: t.description, tech: TECH };

  const openDemo = () => {
    setOpen(true);
    markSectionSeen('ar');
  };

  return (
    <>
      <ProjectCard item={item} onPress={openDemo} cta={t.cta} />
      <DemoModal visible={open} title={t.modalTitle} closeLabel={t.close} onClose={() => setOpen(false)}>
        <ArViewer />
      </DemoModal>
    </>
  );
}
```

- [ ] **Step 3: Typecheck + commit**

Run: `npx tsc --noEmit` → exit 0.

```bash
git add src/features/portfolio/components/demo-modal.tsx src/features/portfolio/sections/ar/ar-demo-card.tsx
git commit -m "refactor(ar): extract shared DemoModal chrome"
```

---

### Task 4: `AiChat` + `AiDemoCard` + projects wiring

**Files:**
- Create: `src/features/portfolio/sections/ai/ai-chat.tsx`
- Create: `src/features/portfolio/sections/ai/ai-demo-card.tsx`
- Modify: `src/features/portfolio/sections/projects/projects-section.tsx`

- [ ] **Step 1: The chat UI**

`src/features/portfolio/sections/ai/ai-chat.tsx`:

```tsx
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
```

- [ ] **Step 2: The card**

`src/features/portfolio/sections/ai/ai-demo-card.tsx`:

```tsx
import { useState } from 'react';
import { markSectionSeen } from '@/analytics/tracker';
import type { ProjectItem } from '@/content/types';
import { useI18n } from '@/i18n/i18n-provider';
import { DemoModal } from '../../components/demo-modal';
import { ProjectCard } from '../projects/project-card';
import { AiChat } from './ai-chat';

const T = {
  es: {
    category: 'DEMO INTERACTIVO',
    title: 'Habla con mi agente IA',
    description:
      'Un agente que conoce mis servicios y proyectos, entiende tu idea y te ayuda a agendar una llamada. Corre sobre Gemini con topes de uso — porque una demo real también cuida los costos.',
    cta: 'Chatear ↗',
    modalTitle: 'Agente IA · demo',
    close: 'Cerrar',
  },
  en: {
    category: 'INTERACTIVE DEMO',
    title: 'Talk to my AI agent',
    description:
      'An agent that knows my services and projects, understands your idea and helps you book a call. Runs on Gemini with usage caps — because a real demo also keeps costs in check.',
    cta: 'Chat ↗',
    modalTitle: 'AI agent · demo',
    close: 'Close',
  },
};

const TECH = ['Gemini', 'Cloud Functions', 'Prompt Engineering', 'Firestore'];

/** AI-chat card of the projects grid: opens the agent in the shared demo modal. */
export function AiDemoCard() {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const t = T[locale];

  const item: ProjectItem = { category: t.category, title: t.title, description: t.description, tech: TECH };

  const openDemo = () => {
    setOpen(true);
    markSectionSeen('ai');
  };

  return (
    <>
      <ProjectCard item={item} onPress={openDemo} cta={t.cta} />
      <DemoModal visible={open} title={t.modalTitle} closeLabel={t.close} onClose={() => setOpen(false)}>
        <AiChat onNavigate={() => setOpen(false)} />
      </DemoModal>
    </>
  );
}
```

- [ ] **Step 3: Wire into the grid (second item)**

In `projects-section.tsx`: add `import { AiDemoCard } from '../ai/ai-demo-card';` and update the grid to:

```tsx
        <Reveal delay={0} style={{ flexGrow: 1, flexBasis: 340, minWidth: 300 }}>
          <ArDemoCard />
        </Reveal>
        <Reveal delay={70} style={{ flexGrow: 1, flexBasis: 340, minWidth: 300 }}>
          <AiDemoCard />
        </Reveal>
        {projects.items.map((item, i) => (
          <Reveal key={item.title} delay={(i + 2) * 70} style={{ flexGrow: 1, flexBasis: 340, minWidth: 300 }}>
            <ProjectCard item={item} />
          </Reveal>
        ))}
```

- [ ] **Step 4: Typecheck + commit**

Run: `npx tsc --noEmit` → exit 0.

```bash
git add src/features/portfolio/sections/ai/ src/features/portfolio/sections/projects/projects-section.tsx
git commit -m "feat(ai): AiDemoCard + chat UI wired as second demo in projects"
```

---

### Task 5: Verify (export, hygiene, preview)

**Files:** none (verification only)

- [ ] **Step 1: Export + hygiene**

```bash
npx expo export -p web
grep -lE 'initializeApp|firebase/auth' dist/_expo/static/js/web/*.js   # → only firebase-client chunk
```

- [ ] **Step 2: Preview checks** (dev server + fresh reload at 1280×800)

1. `/proyectos` → cards order: WebAR demo, AI demo, then CMS cards. WebAR modal still opens/closes (DemoModal refactor regression check).
2. Stub fetch in the page: `window.fetch = (url, o) => url === '/api/chat' ? Promise.resolve(new Response(JSON.stringify({reply: 'Respuesta de prueba', remaining: 9}), {status: 200})) : origFetch(url, o)`. Open the AI modal → greeting + 3 chips visible; click a chip → user bubble + stubbed reply bubble appear; type + Enter sends too.
3. Re-stub with `{status: 429}` body `{error:'user_limit'}` → límite message + "Ir a Contacto ↗" button shows and input disables.
4. ✕ / backdrop / Escape close (mouse-event sequence like the WebAR verification).
5. Mobile 375×812 + reload → chat fits, no horizontal overflow.
6. `preview_console_logs` errors → none. Screenshot for the report.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A && git commit -m "fix(ai): preview fixes"   # only if needed
```

---

### Task 6: PR

- [ ] **Step 1: Push + PR**

```bash
git push -u origin feat/ai-sales-agent
gh pr create --title "feat(ai): agente comercial IA — demo con Gemini y topes de uso" --body "$(cat <<'EOF'
## Summary
- Segunda demo interactiva en /proyectos: «Habla con mi agente IA» — chat en modal que responde desde el CMS (servicios, proyectos, experiencia), califica al lead y lo lleva a agendar llamada
- Cloud Function `chatAgent` tras `/api/chat`: topes en transacción Firestore ANTES de llamar al modelo (10/día por visitante vía IP-hash salteado, 300/día global), entrada ≤500 chars, historial ≤12 turnos, respuestas ≤300 tokens
- Gemini Flash por REST nativo (cero deps nuevas); system prompt desde content/{locale} con caché de 10 min; secret GEMINI_API_KEY
- `DemoModal` compartido extraído de la card WebAR (sin duplicación); métrica 'ai' al abrir; rules para chatUsage (owner-read)

## Test Plan
- [x] tsc + functions build + export + higiene de bundle
- [x] Preview: chips/burbujas/límite-429/error simulados con fetch stub; WebAR intacta tras refactor; mobile OK
- [ ] Post-deploy: conversación real ES/EN, tope por visitante, contadores en chatUsage, métrica ai

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

### Deploy (after user merges — MANUAL)

1. **User (one-time)**: create the key at aistudio.google.com (Get API key) →
   `firebase functions:secrets:set GEMINI_API_KEY --project luisdelatorre-portfolio`
   (value ONLY at the CLI hidden prompt — never in chat/files).
2. `npx firebase-tools deploy --only functions:chatAgent,functions:recordVisit,firestore:rules --project luisdelatorre-portfolio`
3. `gh workflow run deploy.yml --ref main` (hosting: rewrite + UI).
4. Live: real chat ES/EN on /proyectos; `curl -s -X POST https://luisdelatorre.dev/api/chat -H 'Content-Type: application/json' -d '{"locale":"es","messages":[{"role":"user","text":"¿Qué servicios ofrece Luis?"}]}'` → `{ reply, remaining }`; 11 rapid messages → 429 user_limit; `chatUsage/{day}` visible in the Firebase console.
