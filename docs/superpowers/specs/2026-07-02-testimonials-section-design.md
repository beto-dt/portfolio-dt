# Testimonials (Recomendaciones) Section — Design

**Date:** 2026-07-02
**Status:** Approved (design)

## Goal

A new "Recomendaciones" section between Proyectos and Formación showing the 12
real LinkedIn recommendations as quote cards (mock layout: 2-col grid, quote
glyph, divider, initials avatar + name + LinkedIn badge + role). Fully
CMS-managed like every other section.

## Decisions (agreed with user)

- **All 12 recommendations**, reverse-chronological. For the ones truncated
  with «…más» in the screenshots, use the visible fragment cut at a complete
  sentence.
- **LinkedIn badge** on every card opens Luis's recommendations tab:
  `https://www.linkedin.com/in/luis-alberto-de-la-torre-duran-752569141/details/recommendations/`
  (single `linkedinUrl` field; no per-person URLs).
- **EN locale**: quotes translated to English (Gerardo's and Tom's originals
  are already English; their ES versions are translations).
- Light orthographic cleanup only (accents/punctuation); wording preserved.
- Badge is a text-glyph "in" chip (#0a66c2 bg, white text) — no icon library.
- Blurb drops the mock's placeholder instruction ("Reemplaza estos textos…").

## Architecture

### Content model (`src/content/types.ts`)

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

`PortfolioContent` gains `testimonials: TestimonialsContent;` between
`projects` and `certifications`.

### Seed content

`LINKEDIN_RECS = 'https://www.linkedin.com/in/luis-alberto-de-la-torre-duran-752569141/details/recommendations/'`

**ES** (`src/content/seed/es.ts`): kicker `recomendaciones`, heading
`Lo que dicen de mi trabajo`, blurb `Recomendaciones de líderes técnicos y
clientes con quienes he colaborado.`, items:

1. **Juan Cruz Cuello** — `SSR Software Engineer · NaranjaX` — "Luis es un
   excelente profesional y compañero. Cuando dejamos de compartir equipo miré
   hacia atrás y me dejó muy contento todo lo que él había crecido como
   ingeniero y todo lo que yo había aprendido de él. Sin dudas espero que en un
   futuro nos crucemos nuevamente."
2. **Roberth Borges** — `Engineering Manager · Tech Lead` — "Tuve la
   oportunidad de trabajar con Luis durante un par de años. Es una persona
   extremadamente proactiva, comprometida con alcanzar las metas del equipo, y
   siempre cuenta con una excelente actitud y energía positiva que aportan
   mucho valor a un excelente ambiente laboral. Luis es técnicamente muy
   sólido, con una gran experiencia en JavaScript, arquitecturas de
   microservicios y orientadas a eventos."
3. **Manuel Yaffe** — `Project Management · Cencosud` — "Tuve el placer de
   trabajar con Luis en Cencosud y siempre me impresionó su habilidad técnica y
   su capacidad para investigar soluciones complejas. Su dominio de diversas
   tecnologías le permite entregar resultados de alta calidad dentro de plazos
   ajustados. Además, es un excelente colaborador, siempre dispuesto a ayudar y
   compartir conocimientos con el equipo."
4. **Jorge Ramírez** — `Head of Product · Banca Digital` — "Tuve la
   oportunidad de trabajar con Luis en el proyecto Home Delivery Regional,
   donde fue clave en la integración del producto con el ecosistema de
   facturación. Luis destacó por su alto nivel técnico, enfoque en la
   resolución de problemas y excelente capacidad de trabajo en equipo. Su
   contribución fue decisiva para el éxito del proyecto."
5. **Gerardo Alvarez Muñoz** — `Staff Engineer` — "Me complace recomendar a
   Luis Alberto para cualquier posición de desarrollador. He tenido el placer
   de trabajar con él en varios proyectos y puedo dar fe de sus habilidades
   técnicas y profesionales, así como de su resolución de problemas, excelente
   trabajo en equipo y adaptabilidad. Sería una valiosa incorporación para
   cualquier equipo de desarrollo."
6. **Andrés Juárez** — `Tech Lead · Arquitectura de Software` — "Luis es un
   developer con una capacidad de adaptación que resalta, trabaja muy bien en
   equipo, tiene excelentes skills técnicos y es muy comprometido con su
   trabajo. Recomiendo trabajar con él por todas estas cualidades profesionales
   y muchas cualidades personales que tiene."
7. **Wil Salas** — `Senior Full Stack Developer` — "Es una persona altamente
   proactiva y disciplinada en cada tarea que se le asigna. Además, aporta
   significativamente al rendimiento y cohesión de los equipos en los que
   colabora. Destaca por su compromiso, integridad y dedicación, siendo un
   profesional confiable y orientado a resultados."
8. **Tom Baran-Martinez** — `English Speaking Coach` — "Tuve el placer y el
   honor de ser el coach de inglés de Luis durante 4 meses. En ese tiempo, Luis
   trabajó duro para conseguir un nuevo empleo en Acid Labs, donde debía —y
   continúa— hablando inglés regularmente con su equipo y clientes. En mi
   programa, Luis siempre nos trató a mí, a mi equipo y a sus compañeros con el
   máximo respeto."
9. **John Jiménez** — `Estratega de Marketing Digital` — "Es un excelente
   profesional, destaco su responsabilidad y compromiso con cada una de sus
   actividades. Sabe trabajar en equipo y con muy buenas metodologías que
   facilitan el cumplimiento de objetivos."
10. **Edgar Quiles** — `Director of Sales · BeTrep` — "Alberto, quien formó
    parte de nuestra institución por un año, es una persona con una integridad
    intachable. Ha demostrado ser un excelente elemento para cualquier equipo
    del que forma parte: su trabajo siempre destaca entre los mejores y afronta
    los retos de manera comprometida, responsable y organizada. Sobre todo, es
    una persona con actitud emprendedora, siempre buscando el crecimiento y la
    mejora de todos."
11. **Andres Diaz** — `Flutter Developer · Founder de Jobnow` — "Un excelente
    profesional y persona, una capacidad enorme de aprender y su conocimiento
    por la tecnología es demasiado amplio."
12. **Mauricio Baena Vásquez** — `Diseñador Gráfico Senior` — "Muy buen
    elemento, apasionado por su carrera, propositivo y responsable; además es
    un buen compañero, sabe trabajar en equipo y es muy solidario."

**EN** (`src/content/seed/en.ts`): kicker `recommendations`, heading
`What people say about my work`, blurb `Recommendations from technical leaders
and clients I've worked with.`, items (same people/roles, translated roles
where Spanish):

1. Juan Cruz Cuello — `SSR Software Engineer · NaranjaX` — "Luis is an
   excellent professional and teammate. When we stopped sharing a team, I
   looked back very pleased with how much he had grown as an engineer and how
   much I had learned from him. I certainly hope we cross paths again in the
   future."
2. Roberth Borges — `Engineering Manager · Tech Lead` — "I had the opportunity
   to work with Luis for a couple of years. He is an extremely proactive
   person, committed to reaching the team's goals, and always brings an
   excellent attitude and positive energy that add a lot of value to a great
   work environment. Luis is technically very solid, with strong experience in
   JavaScript, microservices and event-driven architectures."
3. Manuel Yaffe — `Project Management · Cencosud` — "I had the pleasure of
   working with Luis at Cencosud and I was always impressed by his technical
   skill and his ability to research complex solutions. His command of diverse
   technologies allows him to deliver high-quality results within tight
   deadlines. He is also an excellent collaborator, always willing to help and
   share knowledge with the team."
4. Jorge Ramírez — `Head of Product · Digital Banking` — "I had the
   opportunity to work with Luis on the Regional Home Delivery project, where
   he was key to integrating the product with the billing ecosystem. Luis
   stood out for his high technical level, problem-solving focus and excellent
   teamwork. His contribution was decisive for the project's success."
5. Gerardo Alvarez Muñoz — `Staff Engineer` — "I am happy to recommend Luis
   Alberto for any developer position. I have had the pleasure of working with
   him on several projects. I can attest to his technical and professional
   skills, as well as his problem-solving, excellent teamwork, and
   adaptability, and he would be a valuable addition to any development team."
6. Andrés Juárez — `Tech Lead · Software Architecture` — "Luis is a developer
   with standout adaptability; he works very well in a team, has excellent
   technical skills and is deeply committed to his work. I recommend working
   with him for all these professional qualities and the many personal
   qualities he has."
7. Wil Salas — `Senior Full Stack Developer` — "He is a highly proactive and
   disciplined person in every task he takes on. He also contributes
   significantly to the performance and cohesion of the teams he works with.
   He stands out for his commitment, integrity and dedication — a reliable,
   results-oriented professional."
8. Tom Baran-Martinez — `English Speaking Coach` — "I had the pleasure and
   honor of being Luis's English Speaking Coach for 4 months. During that
   time, Luis worked hard to obtain a new job with Acid Labs, where he had to
   (and continues to) speak English regularly with his team and clients. In my
   program, Luis always treated me, my staff, and his peers with the utmost
   respect."
9. John Jiménez — `Digital Marketing Strategist` — "He is an excellent
   professional; I highlight his responsibility and commitment to every one of
   his activities. He knows how to work in a team, with very good
   methodologies that make it easier to meet goals."
10. Edgar Quiles — `Director of Sales · BeTrep` — "Alberto, who was part of
    our institution for a year, is a person of impeccable integrity. He has
    proven to be an excellent asset to any team he joins: his work always
    stands out among the best and he faces challenges in a committed,
    responsible and organized way. Above all, he has an entrepreneurial
    attitude, always seeking growth and improvement for everyone."
11. Andres Diaz — `Flutter Developer · Founder of Jobnow` — "An excellent
    professional and person, with an enormous capacity to learn and remarkably
    broad knowledge of technology."
12. Mauricio Baena Vásquez — `Senior Graphic Designer` — "A great team member,
    passionate about his career, proactive and responsible; he is also a good
    teammate, works well in a team and is very supportive."

### Public section (`src/features/portfolio/sections/testimonials/testimonials-section.tsx`)

- `Container paddingVertical 56, nativeID="testimonials"`; `Reveal` +
  `SectionHeading kicker/heading`; blurb text (14.5/22 `colors.textMuted`,
  maxWidth 560, marginTop -20 area consistent with other blurbs) before grid.
- Grid: web cast `display:'grid', gridTemplateColumns: 'repeat(auto-fit,
  minmax(min(100%, 420px), 1fr))'` over `flexDirection row, flexWrap, gap 16`.
- Card (per item, `Reveal delay={i*70}` + `GlowCard`): padding 24, gap 14:
  - `"` glyph: `fonts.displayBold` 34, `colors.accent`, lineHeight 34.
  - Quote: 15/24, `colors.textMuted`.
  - Divider: height 1 `colors.border`.
  - Author row (gap 12): initials circle 44×44 (`borderRadius 999, borderWidth
    1, borderColor 'rgba(228,227,87,0.45)', backgroundColor
    'rgba(228,227,87,0.10)'`, initials `fonts.mono` 13 `colors.accent` —
    initials = first letters of first two name words, uppercase); column:
    name row (name `fonts.display` 15 `colors.text` + LinkedIn chip) and role
    (12.5, `colors.textDim`).
  - LinkedIn chip: `Pressable` 18×18 `borderRadius 4, backgroundColor
    '#0a66c2'`, centered `in` (`fonts.bodyMedium` 10.5, white), hover
    brightness (`#1272d6`) + web cursor cast; `onPress →
    Linking.openURL(testimonials.linkedinUrl)`.
- `hovered` from GlowCard is available but unused beyond GlowCard's own glow.

### Integration

- `portfolio-screen.tsx`: `<TrackedSection id="testimonials"><TestimonialsSection /></TrackedSection>`
  between projects and formation.
- `functions/src/index.ts`: add `'testimonials'` to `SECTION_KEYS` (redeploy
  `recordVisit`).
- Admin: `src/admin/components/forms/testimonials-form.tsx` — standard
  `Field`s (kicker, heading, blurb multiline, linkedinUrl) + `ListEditor` of
  items (quote multiline, name, role). Register in `SECTIONS`
  (`{ key: 'testimonials', label: 'Recomendaciones' }` after Proyectos) and
  `SectionForm` switch in `admin-screen.tsx`.
- Validator (`src/content/validate.ts`): `REQUIRED_KEYS` is an explicit list
  that never gained `process`/`collaboration` — matching that precedent,
  **no change** (adding `'testimonials'` would make old Firestore docs fail
  validation before the migration runs).

### Data migration

- `scripts/migrate-testimonials.ts`: merge-only
  `set(doc('content', locale), { testimonials: seed[locale].testimonials }, { merge: true })`
  for es/en (ADC fallback `GOOGLE_APPLICATION_CREDENTIALS=./service-account.json`),
  run with `npx tsx`.
- Patch `src/content/published/{es,en}.json` with the same object (scratchpad
  tsx script), verify value-identical vs seed.

## Error handling

No new failure modes: static content; LinkedIn link is a plain `openURL`.
Empty `items` renders just the heading/blurb (same as other list sections).

## Testing / verification

- `npx tsc --noEmit`, `npm --prefix functions run build`,
  `npx expo export -p web`, bundle hygiene grep.
- Preview `/`: section appears after Proyectos with 12 cards, grid 2-col wide /
  1-col narrow, LinkedIn chip present; admin editor shows "Recomendaciones".
- Deploy: functions (`recordVisit`) + PR flow + `gh workflow run deploy.yml` +
  live check (section + bundle markers).

## Implementation order

1. Types + seeds (es/en).
2. Section component + portfolio-screen + functions SECTION_KEYS.
3. Admin form + registry (+ validator key if list is explicit).
4. Migration + published JSON.
5. Verify + deploy.
