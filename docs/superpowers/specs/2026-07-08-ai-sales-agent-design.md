# AI Sales Agent — "Habla con mi agente IA" — Design

**Date:** 2026-07-08
**Status:** Approved (design)

## Goal

Second interactive demo in `/proyectos`: a card «DEMO INTERACTIVO · Habla con
mi agente IA» opens a modal chat. The agent answers questions about Luis's
services/experience from the CMS, qualifies the lead and drives toward booking
a call — powered by **Gemini Flash (free tier)** behind a Cloud Function with
hard anti-abuse caps. The project itself is the evidence for services 08/09.

## Decisions (agreed with user)

- **Provider**: Gemini Flash via Google AI Studio key (cost $0 on the free
  tier). Called over plain REST (`fetch`, Node 20) — no new npm deps. Model in
  a `MODEL` constant (`gemini-2.5-flash`; if free-tier quota pinches, switch
  the constant to `gemini-2.5-flash-lite` and redeploy).
- **Limits preset**: 10 messages/day per visitor (salted IP hash), 300/day
  global, input ≤ 500 chars, replies ≤ ~150 words (`maxOutputTokens` ≈ 300),
  history truncated server-side to the last 12 turns. All caps are constants.
- **Placement**: demo card in `/proyectos` (second, after the WebAR card) +
  modal chat, twin of the WebAR pattern. No global FAB for now.
- Key stored ONLY as Firebase secret `GEMINI_API_KEY` (user sets it via the
  CLI hidden prompt; never pasted in chat/files).
- UI strings hardcoded ES/EN in-component (demo-chrome convention).

## Architecture

### Cloud Function `chatAgent` (`functions/src/index.ts` + `functions/src/agent.ts`)

`onRequest({ region: 'us-central1', cors: true, secrets: [GEMINI_API_KEY] })`,
hosting rewrite `"/api/chat"`. New module `functions/src/agent.ts` holds the
prompt builder + Gemini call so `index.ts` stays navigable.

- **POST** `{ locale: 'es'|'en', messages: [{ role: 'user'|'model', text }] }`
  - Validate: locale in set; `messages` non-empty array; every `text` a
    string; last message role `user`, trimmed length 1–500; array truncated
    server-side to last 12 entries. → else 400.
  - **Caps before any model call** (Firestore transaction on
    `chatUsage/{YYYY-MM-DD}`, doc `{ total: number, byIp: { [ipHash]: n } }`):
    `total >= 300` → 429 `{ error: 'global_limit' }`; `byIp[ipHash] >= 10` →
    429 `{ error: 'user_limit' }`; otherwise increment both in the same
    transaction. `ipHash = sha256(ip + '|chat|' + SALT)` (same salt/IP-source
    pattern as postFeedback; raw IPs never stored).
  - **System prompt** built from Firestore `content/{locale}` (module-level
    cache, ~10 min TTL): hero/about summary, the 9 services (index, title,
    description), projects list, contact channels (Contacto page, WhatsApp).
    Guardrails: only Luis & his services; no prices → invite to book a call;
    qualify the lead (project type, timeline); goal = book a call at
    `/contacto` or WhatsApp; answer in `locale`; ≤150 words; friendly,
    professional, no invented facts.
  - **Gemini REST**: POST
    `https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent`
    header `x-goog-api-key`, body `{ system_instruction, contents,
    generationConfig: { maxOutputTokens: 300, temperature: 0.7 } }`; reply =
    `candidates[0].content.parts[*].text` joined. Non-200 or empty reply →
    503 `{ error: 'unavailable' }` (logged; usage already counted — accepted
    trade-off, keeps the transaction simple).
  - 200 → `{ reply, remaining }` (`remaining` = visitor's messages left today,
    lets the UI warn before the wall).
- GET/other → 405.

### Firestore

- `chatUsage/{day}`: written only by the function (Admin SDK). Rules (before
  deny-all): owner read, client writes false — mirrors `feedback`.

### Analytics

- `SECTION_KEYS` gains `'ai'`; the modal open calls `markSectionSeen('ai')`.
  (chatAgent + recordVisit redeploy together.)

### Public UI

- **`src/features/portfolio/components/demo-modal.tsx` — `DemoModal`**:
  extraction of the modal chrome currently inline in `ar-demo-card.tsx`
  (transparent RN Modal without animationType + Reveal fade + sibling
  backdrop + dialog View + header row with title/✕). Props: `{ visible,
  title, onClose, children }`. `ArDemoCard` refactors onto it (no visual
  change); `AiDemoCard` uses it. Kills the Sonar duplication risk.
- **`src/features/portfolio/sections/ai/ai-demo-card.tsx` — `AiDemoCard`**:
  - Card via `ProjectCard` props: category `DEMO INTERACTIVO` / `INTERACTIVE
    DEMO`, title `Habla con mi agente IA` / `Talk to my AI agent`,
    description (agente que conoce servicios y proyectos, califica tu idea y
    te agenda una llamada — con límites de uso porque es una demo real), tech
    `['Gemini', 'Cloud Functions', 'Prompt Engineering', 'Firestore']`, CTA
    `Chatear ↗` / `Chat ↗`.
  - Modal content (`AiChat`, same file or sibling `ai-chat.tsx`): message
    list (ScrollView, auto-scroll to end; user bubbles accent-tinted right,
    agent bubbles surface left), greeting message hardcoded (no API call on
    open), **3 quick-start chips** (ES: «¿Qué servicios ofrece Luis?»,
    «¿Ha trabajado en fintech?», «Necesito una app móvil») that send that
    text, input (TextInput, maxLength 500, Enter sends on web) + send button,
    "escribiendo…" indicator while awaiting fetch.
  - Fetch `POST /api/chat` with full visible history (server truncates).
    Errors: 429 `user_limit`/`global_limit` → ES «Por hoy llegué a mi límite
    de mensajes 😅 — agenda una llamada con Luis en la página de Contacto.»
    (+ button to `/contacto` via `goToSection('contact')` after closing);
    503/network → «No pude responder ahora. Intenta de nuevo o escríbele
    directo.» Input disables at `remaining === 0`.
  - Footer line: `Demo con límites de uso · Gemini Flash` (small, faint).
- **`projects-section.tsx`**: `<AiDemoCard />` second (after `ArDemoCard`),
  CMS items shift to `delay={(i + 2) * 70}`.

### Hosting

`firebase.json` rewrites gains `/api/chat` → `chatAgent`.

## Error handling

- Any cap/quota/provider failure degrades to a friendly in-chat message with
  the booking CTA — the demo never shows a raw error, and the page never
  breaks.
- Function validates everything server-side; client state is never trusted.
- Firestore read failure for content → 503 (no hardcoded stale fallback
  prompt to maintain).

## Testing / verification

- tsc + functions build + export + hygiene (chat adds NO firebase to the
  public bundle — fetch only; no new client deps).
- Preview: card renders; modal opens (chips, greeting); send → fetch fires
  (verified via interception headless); 429/503 paths simulated by stubbing
  fetch in preview; ✕/backdrop/Escape close; ArDemoCard still works after the
  DemoModal refactor; mobile 375 fits.
- Live after deploy: real conversation ES/EN; 11th message from same IP →
  límite; `chatUsage/{day}` counters visible in console; metrics show `ai`.
- Deploy: user sets `GEMINI_API_KEY` secret first (AI Studio, CLI hidden
  prompt); then `firebase deploy --only functions:chatAgent,functions:recordVisit,firestore:rules`
  + hosting via workflow.

## Implementation order

1. `functions/src/agent.ts` + `chatAgent` + rules + rewrite + `'ai'` key.
2. `DemoModal` extraction + `ArDemoCard` refactor (no visual change).
3. `AiDemoCard` + `AiChat` + projects wiring.
4. Verify + PR.
5. Secret + deploy (functions + rules + hosting) + live end-to-end.
