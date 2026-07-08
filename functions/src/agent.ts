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
