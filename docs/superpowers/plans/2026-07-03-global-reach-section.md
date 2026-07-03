# Global Reach Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** CMS-managed "Alcance global" section between Experiencia and Proyectos: blurb + 3 stat cards + 3 detail cards (locations, language bars, global-teams checklist), responsive like the rest of the site.

**Architecture:** `GlobalReachContent` in the content model + seeds; new `global-reach-section.tsx` (SectionHeading + blurb + two auto-fit CSS grids of GlowCards); admin `GlobalReachForm` + registry; `'reach'` in `recordVisit` SECTION_KEYS; merge-only Firestore migration + published-JSON patch.

**Tech Stack:** Expo Router + react-native-web, web-cast grid pattern, text-glyph icons (🌐 / 文A / 👥), firebase-admin migration via `npx tsx`. No test runner.

**Verification note:** No jest. Verify with `npx tsc --noEmit`, `npm --prefix functions run build`, `npx expo export -p web`, bundle-hygiene grep, preview (incl. `preview_resize` tablet/mobile). Do NOT run `npx expo lint`.

---

### Task 1: Content model + seeds

**Files:**
- Modify: `src/content/types.ts`
- Modify: `src/content/seed/es.ts`
- Modify: `src/content/seed/en.ts`

- [ ] **Step 1: In `src/content/types.ts`, right after the `ExperienceContent` line, add:**

```ts
export type GlobalStat = { value: string; label: string };
export type GlobalLocation = { name: string; tag: string };
export type GlobalLanguage = { language: string; level: string; percent: number };
export type GlobalReachContent = {
  kicker: string;
  heading: string;
  blurb: string;
  stats: GlobalStat[];
  locationsHeading: string;
  locations: GlobalLocation[];
  languagesHeading: string;
  languages: GlobalLanguage[];
  teamHeading: string;
  teamItems: string[];
};
```

- [ ] **Step 2: In the `PortfolioContent` type, add after `experience: ExperienceContent;`:**

```ts
  globalReach: GlobalReachContent;
```

- [ ] **Step 3: In `src/content/seed/es.ts`, insert after the closing `},` of the `experience:` block (immediately before `projects:`):**

```ts
  globalReach: {
    kicker: 'alcance global',
    heading: 'Experiencia nacional e internacional',
    blurb: 'He colaborado con equipos locales y distribuidos en distintos países, culturas y zonas horarias, comunicándome con fluidez en español e inglés. Del trabajo presencial en Ecuador a la colaboración remota con clientes de América y Europa.',
    stats: [
      { value: '3', label: 'continentes' },
      { value: '2', label: 'idiomas de trabajo' },
      { value: 'GMT-5', label: 'base en Quito, Ecuador' },
    ],
    locationsHeading: 'Dónde he colaborado',
    locations: [
      { name: 'Ecuador', tag: 'local' },
      { name: 'Latinoamérica', tag: 'remoto' },
      { name: 'Estados Unidos', tag: 'remoto' },
      { name: 'Europa', tag: 'remoto' },
    ],
    languagesHeading: 'Idiomas',
    languages: [
      { language: 'Español', level: 'Nativo', percent: 100 },
      { language: 'Inglés', level: 'Intermedio · B1', percent: 55 },
    ],
    teamHeading: 'En equipos globales',
    teamItems: [
      'Solapamiento horario con América (EST/PST) y Europa (CET)',
      'Flujo remoto y asíncrono, con dailies y demos en inglés',
      'Documentación y code reviews bilingües (ES/EN)',
      'Adaptación a equipos multiculturales y husos distintos',
    ],
  },
```

- [ ] **Step 4: In `src/content/seed/en.ts`, insert at the same position (after `experience:` block, before `projects:`):**

```ts
  globalReach: {
    kicker: 'global reach',
    heading: 'National and international experience',
    blurb: "I've collaborated with local and distributed teams across countries, cultures and time zones, communicating fluently in Spanish and English. From on-site work in Ecuador to remote collaboration with clients across America and Europe.",
    stats: [
      { value: '3', label: 'continents' },
      { value: '2', label: 'working languages' },
      { value: 'GMT-5', label: 'based in Quito, Ecuador' },
    ],
    locationsHeading: "Where I've collaborated",
    locations: [
      { name: 'Ecuador', tag: 'on-site' },
      { name: 'Latin America', tag: 'remote' },
      { name: 'United States', tag: 'remote' },
      { name: 'Europe', tag: 'remote' },
    ],
    languagesHeading: 'Languages',
    languages: [
      { language: 'Spanish', level: 'Native', percent: 100 },
      { language: 'English', level: 'Intermediate · B1', percent: 55 },
    ],
    teamHeading: 'On global teams',
    teamItems: [
      'Time-zone overlap with America (EST/PST) and Europe (CET)',
      'Remote, async workflow with dailies and demos in English',
      'Bilingual documentation and code reviews (ES/EN)',
      'Adaptation to multicultural teams and different time zones',
    ],
  },
```

- [ ] **Step 5: Type-check.**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/content/types.ts src/content/seed/es.ts src/content/seed/en.ts
git commit -m "feat(content): global reach content model + es/en seeds"
```

---

### Task 2: Public section + wiring + recordVisit key

**Files:**
- Create: `src/features/portfolio/sections/global-reach/global-reach-section.tsx`
- Modify: `src/features/portfolio/portfolio-screen.tsx`
- Modify: `functions/src/index.ts` (SECTION_KEYS)

- [ ] **Step 1: Create `src/features/portfolio/sections/global-reach/global-reach-section.tsx` with EXACTLY:**

```tsx
import { Platform, Text, View } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { GlowCard } from '@/ui/glow-card';
import { Reveal } from '@/ui/reveal';
import type { GlobalLanguage, GlobalLocation, GlobalStat } from '@/content/types';

// Uniform columns on web (last row never stretches); flexWrap is the native fallback.
const statsGridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))' } as object)
  : null;
const detailGridWeb = Platform.OS === 'web'
  ? ({ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))' } as object)
  : null;

const cardStyle = {
  width: '100%',
  flexGrow: 1,
  padding: 24,
  backgroundColor: 'rgba(255,255,255,0.03)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.09)',
  borderRadius: 18,
} as const;

function StatCard({ stat }: { stat: GlobalStat }) {
  return (
    <GlowCard style={cardStyle}>
      {() => (
        <>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 34, color: colors.accent }}>{stat.value}</Text>
          <Text style={{ fontSize: 13.5, color: colors.textMuted, marginTop: 4 }}>{stat.label}</Text>
        </>
      )}
    </GlowCard>
  );
}

function CardHeader({ glyph, title }: { glyph: string; title: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 }}>
      <Text style={{ fontSize: 15, color: colors.accent }}>{glyph}</Text>
      <Text style={{ fontFamily: fonts.display, fontSize: 17, color: colors.text }}>{title}</Text>
    </View>
  );
}

function LocationRow({ location }: { location: GlobalLocation }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
      <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: colors.accent }} />
      <Text style={{ flex: 1, fontSize: 14.5, color: colors.text }}>{location.name}</Text>
      <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, color: colors.textFaint }}>{location.tag}</Text>
    </View>
  );
}

function LanguageBar({ lang }: { lang: GlobalLanguage }) {
  const pct = Math.max(0, Math.min(100, lang.percent));
  return (
    <View style={{ gap: 8, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ flex: 1, fontFamily: fonts.bodyMedium, fontSize: 14.5, color: colors.text }}>{lang.language}</Text>
        <Text style={{ fontFamily: fonts.mono, fontSize: 12, color: colors.accent }}>{lang.level}</Text>
      </View>
      <View style={{ height: 8, borderRadius: 999, backgroundColor: colors.surfaceStrong, overflow: 'hidden' }}>
        <View style={{ width: `${pct}%`, height: '100%', borderRadius: 999, backgroundColor: colors.accent }} />
      </View>
    </View>
  );
}

export function GlobalReachSection() {
  const { content } = useI18n();
  const { globalReach } = content;

  return (
    <Container style={{ paddingVertical: 56 }} nativeID="reach">
      <Reveal delay={0}>
        <SectionHeading kicker={globalReach.kicker} heading={globalReach.heading} />
      </Reveal>
      <Reveal delay={70}>
        <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{globalReach.blurb}</Text>
      </Reveal>

      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 16 }, statsGridWeb as object]}>
        {globalReach.stats.map((stat, i) => (
          <Reveal key={stat.label} delay={140 + i * 70} style={{ flexGrow: 1, flexBasis: 260, minWidth: 240 }}>
            <StatCard stat={stat} />
          </Reveal>
        ))}
      </View>

      <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, detailGridWeb as object]}>
        <Reveal delay={280} style={{ flexGrow: 1, flexBasis: 320, minWidth: 280 }}>
          <GlowCard style={cardStyle}>
            {() => (
              <>
                <CardHeader glyph="🌐" title={globalReach.locationsHeading} />
                {globalReach.locations.map((location) => (
                  <LocationRow key={location.name} location={location} />
                ))}
              </>
            )}
          </GlowCard>
        </Reveal>
        <Reveal delay={350} style={{ flexGrow: 1, flexBasis: 320, minWidth: 280 }}>
          <GlowCard style={cardStyle}>
            {() => (
              <>
                <CardHeader glyph="文A" title={globalReach.languagesHeading} />
                {globalReach.languages.map((lang) => (
                  <LanguageBar key={lang.language} lang={lang} />
                ))}
              </>
            )}
          </GlowCard>
        </Reveal>
        <Reveal delay={420} style={{ flexGrow: 1, flexBasis: 320, minWidth: 280 }}>
          <GlowCard style={cardStyle}>
            {() => (
              <>
                <CardHeader glyph="👥" title={globalReach.teamHeading} />
                {globalReach.teamItems.map((item) => (
                  <View key={item} style={{ flexDirection: 'row', gap: 8, alignItems: 'baseline', marginBottom: 10 }}>
                    <Text style={{ color: colors.accent, fontSize: 12.5 }}>✓</Text>
                    <Text style={{ flex: 1, fontSize: 13.5, lineHeight: 20, color: colors.textMuted }}>{item}</Text>
                  </View>
                ))}
              </>
            )}
          </GlowCard>
        </Reveal>
      </View>
    </Container>
  );
}
```

- [ ] **Step 2: In `src/features/portfolio/portfolio-screen.tsx`:**
  - Add import after the `ExperienceSection` import:

```tsx
import { GlobalReachSection } from './sections/global-reach/global-reach-section';
```

  - Add between the experience and projects lines:

```tsx
        <TrackedSection id="reach"><GlobalReachSection /></TrackedSection>
```

- [ ] **Step 3: In `functions/src/index.ts`, inside `SECTION_KEYS`, add `'reach',` after `'experience',`.**

- [ ] **Step 4: Verify builds.**

```bash
npx tsc --noEmit && npm --prefix functions run build
```
Expected: both PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/portfolio/ functions/src/index.ts
git commit -m "feat(site): global reach section under experience + visit tracking key"
```

---

### Task 3: Admin form + registry

**Files:**
- Create: `src/admin/components/forms/global-reach-form.tsx`
- Modify: `src/admin/screens/admin-screen.tsx`

- [ ] **Step 1: Create `src/admin/components/forms/global-reach-form.tsx` with EXACTLY:**

```tsx
import { View } from 'react-native';
import type { GlobalReachContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';
import { StringListEditor } from '../string-list-editor';

export function GlobalReachForm({ value, onChange }: { value: GlobalReachContent; onChange: (v: GlobalReachContent) => void }) {
  const set = <K extends keyof GlobalReachContent>(k: K, v: GlobalReachContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Label>stats</Label>
      <ListEditor
        items={value.stats}
        onChange={(stats) => set('stats', stats)}
        makeEmpty={() => ({ value: '', label: '' })}
        renderItem={(s, on) => (
          <>
            <Field label="value" value={s.value} onChangeText={(t) => on({ ...s, value: t })} />
            <Field label="label" value={s.label} onChangeText={(t) => on({ ...s, label: t })} />
          </>
        )}
      />
      <Field label="locationsHeading" value={value.locationsHeading} onChangeText={(t) => set('locationsHeading', t)} />
      <Label>locations</Label>
      <ListEditor
        items={value.locations}
        onChange={(locations) => set('locations', locations)}
        makeEmpty={() => ({ name: '', tag: '' })}
        renderItem={(l, on) => (
          <>
            <Field label="name" value={l.name} onChangeText={(t) => on({ ...l, name: t })} />
            <Field label="tag" value={l.tag} onChangeText={(t) => on({ ...l, tag: t })} />
          </>
        )}
      />
      <Field label="languagesHeading" value={value.languagesHeading} onChangeText={(t) => set('languagesHeading', t)} />
      <Label>languages</Label>
      <ListEditor
        items={value.languages}
        onChange={(languages) => set('languages', languages)}
        makeEmpty={() => ({ language: '', level: '', percent: 0 })}
        renderItem={(l, on) => (
          <>
            <Field label="language" value={l.language} onChangeText={(t) => on({ ...l, language: t })} />
            <Field label="level" value={l.level} onChangeText={(t) => on({ ...l, level: t })} />
            <Field label="percent (0-100)" value={String(l.percent)} onChangeText={(t) => on({ ...l, percent: Number(t) || 0 })} />
          </>
        )}
      />
      <Field label="teamHeading" value={value.teamHeading} onChangeText={(t) => set('teamHeading', t)} />
      <StringListEditor label="teamItems" items={value.teamItems} onChange={(teamItems) => set('teamItems', teamItems)} />
    </View>
  );
}
```

- [ ] **Step 2: In `src/admin/screens/admin-screen.tsx`:**
  - Add import next to the other form imports:

```tsx
import { GlobalReachForm } from '../components/forms/global-reach-form';
```

  - In `SECTIONS`, add after the `experience` entry:

```tsx
  { key: 'globalReach', label: 'Alcance global' },
```

  - In the `SectionForm` switch, add after the `experience` case:

```tsx
    case 'globalReach':
      return <GlobalReachForm value={content.globalReach} onChange={(v) => onChange({ ...content, globalReach: v })} />;
```

- [ ] **Step 3: Type-check.**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/admin/
git commit -m "feat(admin): global reach editor form"
```

---

### Task 4: Firestore migration + published JSON

**Files:**
- Create: `scripts/migrate-global-reach.ts`
- Modify: `src/content/published/es.json`, `src/content/published/en.json` (via patch script)

- [ ] **Step 1: Create `scripts/migrate-global-reach.ts` with EXACTLY:**

```ts
import admin from 'firebase-admin';
import { es } from '../src/content/seed/es';
import { en } from '../src/content/seed/en';

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  projectId: 'luisdelatorre-portfolio',
});

const db = admin.firestore();

// One-off migration: merge ONLY the new globalReach section into the content
// docs. Never a full set() — admin edits to existing fields must survive.
async function main() {
  const locales = [
    { id: 'es', seed: es },
    { id: 'en', seed: en },
  ] as const;
  for (const { id, seed } of locales) {
    await db.doc(`content/${id}`).set({ globalReach: seed.globalReach }, { merge: true });
    console.log(`Merged globalReach into content/${id}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
```

- [ ] **Step 2: Run the migration:**

```bash
npx tsx scripts/migrate-global-reach.ts || GOOGLE_APPLICATION_CREDENTIALS=./service-account.json npx tsx scripts/migrate-global-reach.ts
```
Expected: `Merged globalReach into content/es` and `…content/en`.

- [ ] **Step 3: Patch the published JSON mirrors (do NOT `content:pull`). Overwrite the scratchpad script `patch-published.ts` with:**

```ts
import { readFileSync, writeFileSync } from 'fs';
import { es } from '/Volumes/VIMKODEX 1/Personal/portfolio-dt/src/content/seed/es';
import { en } from '/Volumes/VIMKODEX 1/Personal/portfolio-dt/src/content/seed/en';

for (const [id, seed] of [['es', es], ['en', en]] as const) {
  const p = `/Volumes/VIMKODEX 1/Personal/portfolio-dt/src/content/published/${id}.json`;
  const j = JSON.parse(readFileSync(p, 'utf8'));
  j.globalReach = seed.globalReach;
  writeFileSync(p, JSON.stringify(j, null, 2) + '\n', 'utf8');
  console.log(`patched ${id}`);
}
```

Run: `npx tsx <scratchpad>/patch-published.ts`
Then: `git diff --stat src/content/published/` — both files insertion-only.

- [ ] **Step 4: Verify + commit**

```bash
npx tsc --noEmit
git add scripts/migrate-global-reach.ts src/content/published/
git commit -m "feat(content): seed global reach in Firestore + published mirrors"
```

---

### Task 5: Verify + deploy

- [ ] **Step 1: Full build + hygiene.**

```bash
npx expo export -p web
grep -lE 'initializeApp|firebase/auth' dist/_expo/static/js/web/*.js
```
Expected: export OK; grep matches ONLY the `firebase-client-*.js` chunk.

- [ ] **Step 2: Preview `http://localhost:8081/`:** section after Experiencia (order experience → reach → projects); 3 stat cards (3 / 2 / GMT-5) + 3 detail cards; bars 100%/55%; `preview_resize` tablet (768) → 2 col detail, mobile (375) → 1 col.

- [ ] **Step 3: Deploy `recordVisit`:**

```bash
firebase deploy --only functions:recordVisit --project luisdelatorre-portfolio --non-interactive
```
Expected: `Deploy complete!`.

- [ ] **Step 4: Finish the branch.** superpowers:finishing-a-development-branch → push + PR. After merge: `gh workflow run deploy.yml --ref main`, watch, live bundle markers (`Experiencia nacional e internacional`, `alcance global`, `GMT-5`).

---

## Self-Review

**1. Spec coverage:** types (T1 S1-2) ✓ · seeds ES/EN completos (T1 S3-4) ✓ · sección con stats row + detail row, glifos, barras clampeadas, checklist (T2 S1) ✓ · placement + TrackedSection `reach` (T2 S2) ✓ · SECTION_KEYS + build + deploy (T2 S3, T5 S3) ✓ · admin form con percent como texto parseado + StringListEditor (T3) ✓ · validador sin cambios ✓ · migración + published patch (T4) ✓ · responsive verify con preview_resize (T5 S2) ✓.
**2. Placeholders:** none.
**3. Type consistency:** `GlobalStat/GlobalLocation/GlobalLanguage/GlobalReachContent` (T1) coinciden con usos en T2 (`stat.value/label`, `location.name/tag`, `lang.language/level/percent`) y T3 (`value.*`) ✓; clave `globalReach` en seeds/PortfolioContent/admin case ✓; id `reach` en TrackedSection y SECTION_KEYS ✓.
