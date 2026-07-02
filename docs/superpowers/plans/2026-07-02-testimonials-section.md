# Testimonials Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** New CMS-managed "Recomendaciones" section between Proyectos and Formación with 12 real LinkedIn recommendations as quote cards (initials avatar, LinkedIn badge → Luis's recommendations tab).

**Architecture:** `TestimonialsContent` in the content model + seeds; new `testimonials-section.tsx` following the collaboration/projects patterns (SectionHeading + blurb + CSS-grid of GlowCards); admin `TestimonialsForm` + registry entry; `'testimonials'` in `recordVisit`'s SECTION_KEYS; merge-only Firestore migration + published-JSON patch.

**Tech Stack:** Expo Router + react-native-web, existing web-cast grid pattern, firebase-admin migration via `npx tsx`. No test runner.

**Verification note:** No jest. Verify with `npx tsc --noEmit`, `npm --prefix functions run build`, `npx expo export -p web`, bundle-hygiene grep, preview. Do NOT run `npx expo lint`.

---

### Task 1: Content model + seeds

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/content/seed/es.ts`
- Modify: `src/content/seed/en.ts`

- [ ] **Step 1: In `src/content/types.ts`, right after the `ProjectsContent` line, add:**

```ts
export type TestimonialItem = { quote: string; name: string; role: string };
export type TestimonialsContent = {
  kicker: string;
  heading: string;
  blurb: string;
  linkedinUrl: string;
  items: TestimonialItem[];
};
```

- [ ] **Step 2: In the `PortfolioContent` type, add after `projects: ProjectsContent;`:**

```ts
  testimonials: TestimonialsContent;
```

- [ ] **Step 3: In `src/content/seed/es.ts`, insert after the closing `},` of the `projects:` block (immediately before `certifications:`):**

```ts
  testimonials: {
    kicker: 'recomendaciones',
    heading: 'Lo que dicen de mi trabajo',
    blurb: 'Recomendaciones de líderes técnicos y clientes con quienes he colaborado.',
    linkedinUrl: 'https://www.linkedin.com/in/luis-alberto-de-la-torre-duran-752569141/details/recommendations/',
    items: [
      { name: 'Juan Cruz Cuello', role: 'SSR Software Engineer · NaranjaX', quote: 'Luis es un excelente profesional y compañero. Cuando dejamos de compartir equipo miré hacia atrás y me dejó muy contento todo lo que él había crecido como ingeniero y todo lo que yo había aprendido de él. Sin dudas espero que en un futuro nos crucemos nuevamente.' },
      { name: 'Roberth Borges', role: 'Engineering Manager · Tech Lead', quote: 'Tuve la oportunidad de trabajar con Luis durante un par de años. Es una persona extremadamente proactiva, comprometida con alcanzar las metas del equipo, y siempre cuenta con una excelente actitud y energía positiva que aportan mucho valor a un excelente ambiente laboral. Luis es técnicamente muy sólido, con una gran experiencia en JavaScript, arquitecturas de microservicios y orientadas a eventos.' },
      { name: 'Manuel Yaffe', role: 'Project Management · Cencosud', quote: 'Tuve el placer de trabajar con Luis en Cencosud y siempre me impresionó su habilidad técnica y su capacidad para investigar soluciones complejas. Su dominio de diversas tecnologías le permite entregar resultados de alta calidad dentro de plazos ajustados. Además, es un excelente colaborador, siempre dispuesto a ayudar y compartir conocimientos con el equipo.' },
      { name: 'Jorge Ramírez', role: 'Head of Product · Banca Digital', quote: 'Tuve la oportunidad de trabajar con Luis en el proyecto Home Delivery Regional, donde fue clave en la integración del producto con el ecosistema de facturación. Luis destacó por su alto nivel técnico, enfoque en la resolución de problemas y excelente capacidad de trabajo en equipo. Su contribución fue decisiva para el éxito del proyecto.' },
      { name: 'Gerardo Alvarez Muñoz', role: 'Staff Engineer', quote: 'Me complace recomendar a Luis Alberto para cualquier posición de desarrollador. He tenido el placer de trabajar con él en varios proyectos y puedo dar fe de sus habilidades técnicas y profesionales, así como de su resolución de problemas, excelente trabajo en equipo y adaptabilidad. Sería una valiosa incorporación para cualquier equipo de desarrollo.' },
      { name: 'Andrés Juárez', role: 'Tech Lead · Arquitectura de Software', quote: 'Luis es un developer con una capacidad de adaptación que resalta, trabaja muy bien en equipo, tiene excelentes skills técnicos y es muy comprometido con su trabajo. Recomiendo trabajar con él por todas estas cualidades profesionales y muchas cualidades personales que tiene.' },
      { name: 'Wil Salas', role: 'Senior Full Stack Developer', quote: 'Es una persona altamente proactiva y disciplinada en cada tarea que se le asigna. Además, aporta significativamente al rendimiento y cohesión de los equipos en los que colabora. Destaca por su compromiso, integridad y dedicación, siendo un profesional confiable y orientado a resultados.' },
      { name: 'Tom Baran-Martinez', role: 'English Speaking Coach', quote: 'Tuve el placer y el honor de ser el coach de inglés de Luis durante 4 meses. En ese tiempo, Luis trabajó duro para conseguir un nuevo empleo en Acid Labs, donde debía —y continúa— hablando inglés regularmente con su equipo y clientes. En mi programa, Luis siempre nos trató a mí, a mi equipo y a sus compañeros con el máximo respeto.' },
      { name: 'John Jiménez', role: 'Estratega de Marketing Digital', quote: 'Es un excelente profesional, destaco su responsabilidad y compromiso con cada una de sus actividades. Sabe trabajar en equipo y con muy buenas metodologías que facilitan el cumplimiento de objetivos.' },
      { name: 'Edgar Quiles', role: 'Director of Sales · BeTrep', quote: 'Alberto, quien formó parte de nuestra institución por un año, es una persona con una integridad intachable. Ha demostrado ser un excelente elemento para cualquier equipo del que forma parte: su trabajo siempre destaca entre los mejores y afronta los retos de manera comprometida, responsable y organizada. Sobre todo, es una persona con actitud emprendedora, siempre buscando el crecimiento y la mejora de todos.' },
      { name: 'Andres Diaz', role: 'Flutter Developer · Founder de Jobnow', quote: 'Un excelente profesional y persona, una capacidad enorme de aprender y su conocimiento por la tecnología es demasiado amplio.' },
      { name: 'Mauricio Baena Vásquez', role: 'Diseñador Gráfico Senior', quote: 'Muy buen elemento, apasionado por su carrera, propositivo y responsable; además es un buen compañero, sabe trabajar en equipo y es muy solidario.' },
    ],
  },
```

- [ ] **Step 4: In `src/content/seed/en.ts`, insert at the same position (after `projects:` block, before `certifications:`):**

```ts
  testimonials: {
    kicker: 'recommendations',
    heading: 'What people say about my work',
    blurb: "Recommendations from technical leaders and clients I've worked with.",
    linkedinUrl: 'https://www.linkedin.com/in/luis-alberto-de-la-torre-duran-752569141/details/recommendations/',
    items: [
      { name: 'Juan Cruz Cuello', role: 'SSR Software Engineer · NaranjaX', quote: 'Luis is an excellent professional and teammate. When we stopped sharing a team, I looked back very pleased with how much he had grown as an engineer and how much I had learned from him. I certainly hope we cross paths again in the future.' },
      { name: 'Roberth Borges', role: 'Engineering Manager · Tech Lead', quote: "I had the opportunity to work with Luis for a couple of years. He is an extremely proactive person, committed to reaching the team's goals, and always brings an excellent attitude and positive energy that add a lot of value to a great work environment. Luis is technically very solid, with strong experience in JavaScript, microservices and event-driven architectures." },
      { name: 'Manuel Yaffe', role: 'Project Management · Cencosud', quote: 'I had the pleasure of working with Luis at Cencosud and I was always impressed by his technical skill and his ability to research complex solutions. His command of diverse technologies allows him to deliver high-quality results within tight deadlines. He is also an excellent collaborator, always willing to help and share knowledge with the team.' },
      { name: 'Jorge Ramírez', role: 'Head of Product · Digital Banking', quote: "I had the opportunity to work with Luis on the Regional Home Delivery project, where he was key to integrating the product with the billing ecosystem. Luis stood out for his high technical level, problem-solving focus and excellent teamwork. His contribution was decisive for the project's success." },
      { name: 'Gerardo Alvarez Muñoz', role: 'Staff Engineer', quote: 'I am happy to recommend Luis Alberto for any developer position. I have had the pleasure of working with him on several projects. I can attest to his technical and professional skills, as well as his problem-solving, excellent teamwork, and adaptability, and he would be a valuable addition to any development team.' },
      { name: 'Andrés Juárez', role: 'Tech Lead · Software Architecture', quote: 'Luis is a developer with standout adaptability; he works very well in a team, has excellent technical skills and is deeply committed to his work. I recommend working with him for all these professional qualities and the many personal qualities he has.' },
      { name: 'Wil Salas', role: 'Senior Full Stack Developer', quote: 'He is a highly proactive and disciplined person in every task he takes on. He also contributes significantly to the performance and cohesion of the teams he works with. He stands out for his commitment, integrity and dedication — a reliable, results-oriented professional.' },
      { name: 'Tom Baran-Martinez', role: 'English Speaking Coach', quote: "I had the pleasure and honor of being Luis's English Speaking Coach for 4 months. During that time, Luis worked hard to obtain a new job with Acid Labs, where he had to (and continues to) speak English regularly with his team and clients. In my program, Luis always treated me, my staff, and his peers with the utmost respect." },
      { name: 'John Jiménez', role: 'Digital Marketing Strategist', quote: 'He is an excellent professional; I highlight his responsibility and commitment to every one of his activities. He knows how to work in a team, with very good methodologies that make it easier to meet goals.' },
      { name: 'Edgar Quiles', role: 'Director of Sales · BeTrep', quote: 'Alberto, who was part of our institution for a year, is a person of impeccable integrity. He has proven to be an excellent asset to any team he joins: his work always stands out among the best and he faces challenges in a committed, responsible and organized way. Above all, he has an entrepreneurial attitude, always seeking growth and improvement for everyone.' },
      { name: 'Andres Diaz', role: 'Flutter Developer · Founder of Jobnow', quote: 'An excellent professional and person, with an enormous capacity to learn and remarkably broad knowledge of technology.' },
      { name: 'Mauricio Baena Vásquez', role: 'Senior Graphic Designer', quote: 'A great team member, passionate about his career, proactive and responsible; he is also a good teammate, works well in a team and is very supportive.' },
    ],
  },
```

- [ ] **Step 5: Type-check.**

Run: `npx tsc --noEmit`
Expected: PASS (published JSON is read as untyped JSON at runtime; only seeds must satisfy the type).

- [ ] **Step 6: Commit**

```bash
git add src/content/types.ts src/content/seed/es.ts src/content/seed/en.ts
git commit -m "feat(content): testimonials content model + es/en seeds"
```

---

### Task 2: Public section + wiring + recordVisit key

**Files:**
- Create: `src/features/portfolio/sections/testimonials/testimonials-section.tsx`
- Modify: `src/features/portfolio/portfolio-screen.tsx`
- Modify: `functions/src/index.ts` (SECTION_KEYS)

- [ ] **Step 1: Create `src/features/portfolio/sections/testimonials/testimonials-section.tsx` with EXACTLY:**

```tsx
import { Linking, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';
import { Reveal } from '@/ui/reveal';
import type { TestimonialItem } from '@/content/types';

type HoverState = PressableStateCallbackType & { hovered?: boolean };

// Uniform columns on web (last row never stretches); flexWrap is the native fallback.
const gridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))' } as object)
  : null;
const webPress = Platform.OS === 'web'
  ? ({ cursor: 'pointer', transitionProperty: 'background-color', transitionDuration: '150ms' } as object)
  : null;

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function TestimonialCard({ item, linkedinUrl }: { item: TestimonialItem; linkedinUrl: string }) {
  return (
    <GlowCard
      style={{
        width: '100%',
        flexGrow: 1,
        padding: 24,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.09)',
        borderRadius: 18,
      }}
    >
      {() => (
        <>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 34, lineHeight: 34, color: colors.accent }}>“</Text>
          <Text style={{ fontSize: 15, lineHeight: 24, color: colors.textMuted, marginTop: 6 }}>{item.quote}</Text>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 16 }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(228,227,87,0.45)', backgroundColor: 'rgba(228,227,87,0.10)', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontFamily: fonts.mono, fontSize: 13, color: colors.accent }}>{initialsOf(item.name)}</Text>
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: fonts.display, fontSize: 15, color: colors.text }}>{item.name}</Text>
                <Pressable
                  onPress={() => Linking.openURL(linkedinUrl)}
                  style={({ hovered }: HoverState) => [
                    { width: 18, height: 18, borderRadius: 4, backgroundColor: hovered ? '#1272d6' : '#0a66c2', alignItems: 'center', justifyContent: 'center' },
                    webPress as object,
                  ]}
                >
                  <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 10.5, lineHeight: 12, color: '#ffffff' }}>in</Text>
                </Pressable>
              </View>
              <Text style={{ fontSize: 12.5, color: colors.textDim }}>{item.role}</Text>
            </View>
          </View>
        </>
      )}
    </GlowCard>
  );
}

export function TestimonialsSection() {
  const { content } = useI18n();
  const { testimonials } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="testimonials">
      <Reveal delay={0}>
        <SectionHeading kicker={testimonials.kicker} heading={testimonials.heading} />
      </Reveal>
      <Reveal delay={70}>
        <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{testimonials.blurb}</Text>
      </Reveal>
      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, gridWeb as object]}>
        {testimonials.items.map((item, i) => (
          <Reveal key={item.name} delay={140 + i * 60} style={{ flexGrow: 1, flexBasis: 420, minWidth: 300 }}>
            <TestimonialCard item={item} linkedinUrl={testimonials.linkedinUrl} />
          </Reveal>
        ))}
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: In `src/features/portfolio/portfolio-screen.tsx`:**
  - Add import after the `ProjectsSection` import:

```tsx
import { TestimonialsSection } from './sections/testimonials/testimonials-section';
```

  - Add between the projects and formation lines:

```tsx
        <TrackedSection id="testimonials"><TestimonialsSection /></TrackedSection>
```

- [ ] **Step 3: In `functions/src/index.ts`, inside `SECTION_KEYS`, add `'testimonials',` after `'projects',`.**

- [ ] **Step 4: Verify builds.**

```bash
npx tsc --noEmit && npm --prefix functions run build
```
Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/ functions/src/index.ts
git commit -m "feat(site): testimonials section under projects + visit tracking key"
```

---

### Task 3: Admin form + registry

**Files:**
- Create: `src/admin/components/forms/testimonials-form.tsx`
- Modify: `src/admin/screens/admin-screen.tsx`

- [ ] **Step 1: Create `src/admin/components/forms/testimonials-form.tsx` with EXACTLY:**

```tsx
import { View } from 'react-native';
import type { TestimonialsContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function TestimonialsForm({ value, onChange }: { value: TestimonialsContent; onChange: (v: TestimonialsContent) => void }) {
  const set = <K extends keyof TestimonialsContent>(k: K, v: TestimonialsContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Field label="linkedinUrl" value={value.linkedinUrl} onChangeText={(t) => set('linkedinUrl', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ quote: '', name: '', role: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="quote" value={it.quote} onChangeText={(t) => on({ ...it, quote: t })} multiline />
            <Field label="name" value={it.name} onChangeText={(t) => on({ ...it, name: t })} />
            <Field label="role" value={it.role} onChangeText={(t) => on({ ...it, role: t })} />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 2: In `src/admin/screens/admin-screen.tsx`:**
  - Add import next to the other form imports:

```tsx
import { TestimonialsForm } from '../components/forms/testimonials-form';
```

  - In `SECTIONS`, add after the `projects` entry:

```tsx
  { key: 'testimonials', label: 'Recomendaciones' },
```

  - In the `SectionForm` switch, add after the `projects` case:

```tsx
    case 'testimonials':
      return <TestimonialsForm value={content.testimonials} onChange={(v) => onChange({ ...content, testimonials: v })} />;
```

- [ ] **Step 3: Type-check.**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/admin/
git commit -m "feat(admin): testimonials editor form"
```

---

### Task 4: Firestore migration + published JSON

**Files:**
- Create: `scripts/migrate-testimonials.ts`
- Modify: `src/content/published/es.json`, `src/content/published/en.json` (via patch script)

- [ ] **Step 1: Create `scripts/migrate-testimonials.ts` with EXACTLY:**

```ts
import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

// One-off migration: merge ONLY the new testimonials section into the content
// docs. Never a full set() — admin edits to existing fields must survive.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    await db.doc(`content/${id}`).set({ testimonials: seed.testimonials }, { merge: true });
    console.log(`Merged testimonials into content/${id}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

- [ ] **Step 2: Run the migration (ADC fallback to the local gitignored service account):**

```bash
npx tsx scripts/migrate-testimonials.ts || GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npx tsx scripts/migrate-testimonials.ts
```
Expected: `Merged testimonials into content/es` and `…content/en`.

- [ ] **Step 3: Patch the published JSON mirrors (do NOT `content:pull` — it reorders every key). Write the scratchpad script `patch-published.ts` in the session scratchpad dir:**

```ts
import { readFileSync, writeFileSync } from 'fs';
import { es } from '/Volumes/VIMKODEX 1/Personal/portfolio-dt/src/content/seed/es';
import { en } from '/Volumes/VIMKODEX 1/Personal/portfolio-dt/src/content/seed/en';

for (const [id, seed] of [['es', es], ['en', en]] as const) {
  const p = `/Volumes/VIMKODEX 1/Personal/portfolio-dt/src/content/published/${id}.json`;
  const j = JSON.parse(readFileSync(p, 'utf8'));
  j.testimonials = seed.testimonials;
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8');
  console.log(`patched ${id}`);
}
```

Run: `npx tsx <scratchpad>/patch-published.ts`
Then verify only `testimonials` changed: `git diff --stat src/content/published/`
Expected: both files changed; `git diff src/content/published/es.json | grep '^-' | grep -v '^---'` shows no removed lines except possibly the closing-brace line rewritten (insertion-only diff).

- [ ] **Step 4: Type-check + commit**

```bash
npx tsc --noEmit
git add scripts/migrate-testimonials.ts src/content/published/
git commit -m "feat(content): seed testimonials in Firestore + published mirrors"
```

---

### Task 5: Verify + deploy

- [ ] **Step 1: Full build + hygiene.**

```bash
npx expo export -p web
grep -lE 'initializeApp|firebase/auth' dist/_expo/static/js/web/*.js
```
Expected: export OK; grep matches ONLY the `firebase-client-*.js` chunk.

- [ ] **Step 2: Preview `http://localhost:8081/`:** section "Lo que dicen de mi trabajo" appears after Proyectos with the 12 cards (names Juan Cruz Cuello … Mauricio Baena Vásquez), initials avatars, "in" badges; narrow viewport stacks to 1 column.

- [ ] **Step 3: Deploy the updated `recordVisit` (new SECTION_KEYS entry):**

```bash
firebase deploy --only functions:recordVisit --project luisdelatorre-portfolio --non-interactive
```
Expected: `Deploy complete!`.

- [ ] **Step 4: Finish the branch.** superpowers:finishing-a-development-branch → push + PR. After merge: `gh workflow run deploy.yml --ref main`, watch, then live check https://luisdelatorre.dev (section + bundle markers `Lo que dicen de mi trabajo`, `Juan Cruz Cuello`).

---

## Self-Review

**1. Spec coverage:** types (T1 S1-2) ✓ · seeds ES/EN 12 items with exact quotes/roles (T1 S3-4) ✓ · section component with grid/quote glyph/divider/initials/LinkedIn chip (T2 S1) ✓ · portfolio-screen placement + TrackedSection (T2 S2) ✓ · SECTION_KEYS + functions build + deploy (T2 S3, T5 S3) ✓ · admin form + SECTIONS + SectionForm (T3) ✓ · validator: no change (per spec) ✓ · migration merge-only + published patch (T4) ✓ · verify/deploy (T5) ✓.
**2. Placeholders:** none — full seed data and component code inline.
**3. Type consistency:** `TestimonialItem`/`TestimonialsContent` (T1) match usages in T2 (`item.quote/name/role`, `testimonials.linkedinUrl`) and T3 (`value.kicker/heading/blurb/linkedinUrl/items`) ✓; `initialsOf` defined and used in T2 only ✓; seed key `testimonials` matches `PortfolioContent` ✓.
