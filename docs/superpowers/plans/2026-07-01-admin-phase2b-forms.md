# Admin Panel — Phase 2B (all-section forms) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Edit every portfolio section from `/admin` — `nav` + the seven content sections — via structured forms with a section selector, built on reusable primitives.

**Architecture:** Shared primitives (`Field`, `BoolField`, `Label`, `ListEditor`, `StringListEditor`) under `src/admin/components/`; one thin controlled form per section under `src/admin/components/forms/`; `admin-screen` gains a section selector and renders the active form via a typed switch. Save/publish reuse 2A/2C.

**Tech Stack:** Expo / React Native (existing), TypeScript. No new dependencies.

**Testing note:** Automated gate = `npx tsc --noEmit` + `npx expo export -p web` + public-bundle-excludes-Firebase check. Editing/saving each section in the browser is manual.

**Types:** all from `src/content/types.ts` (`NavContent`, `HeroContent`, `ServicesContent`, `ImpactContent`, `StackContent`, `ExperienceContent`, `ProjectsContent`, `CertificationsContent`, `ContactContent`, and item types `ServiceItem`, `Stat`, etc.). No type changes.

---

### Task 1: Field primitives + move/refactor hero-form

**Files:**
- Create: `src/admin/components/field.tsx`
- Move: `src/admin/components/hero-form.tsx` → `src/admin/components/forms/hero-form.tsx` (refactored)

- [ ] **Step 1: Create `src/admin/components/field.tsx`**

```tsx
import { Pressable, Text, TextInput, View } from 'react-native';
import { colors, fonts, radii } from '@/theme/tokens';

export const fieldInputStyle = {
  color: colors.text,
  fontFamily: fonts.body,
  fontSize: 14,
  backgroundColor: colors.surfaceStrong,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: radii.sm,
  paddingHorizontal: 10,
  paddingVertical: 8,
} as const;

export function Label({ children }: { children: string }) {
  return <Text style={{ fontFamily: fonts.mono, fontSize: 11, color: colors.textFaint }}>{children}</Text>;
}

export function Field({
  label,
  value,
  onChangeText,
  multiline,
}: {
  label?: string;
  value: string;
  onChangeText: (t: string) => void;
  multiline?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Label>{label}</Label> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        style={[fieldInputStyle, multiline ? { minHeight: 72, textAlignVertical: 'top' } : null]}
        placeholderTextColor={colors.textFaint}
      />
    </View>
  );
}

export function BoolField({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Pressable
        onPress={() => onChange(!value)}
        style={{
          width: 44,
          height: 26,
          borderRadius: 999,
          backgroundColor: value ? colors.accent : colors.surfaceStrong,
          borderWidth: 1,
          borderColor: colors.border,
          padding: 3,
        }}
      >
        <View style={{ width: 18, height: 18, borderRadius: 999, backgroundColor: value ? colors.onAccent : colors.textMuted, alignSelf: value ? 'flex-end' : 'flex-start' }} />
      </Pressable>
      <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: fonts.mono }}>{label}</Text>
    </View>
  );
}
```

- [ ] **Step 2: Move hero-form and refactor it to use the shared primitives**

```bash
mkdir -p src/admin/components/forms
git mv src/admin/components/hero-form.tsx src/admin/components/forms/hero-form.tsx
```

Replace `src/admin/components/forms/hero-form.tsx` entirely with:

```tsx
import { View } from 'react-native';
import type { HeroContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function HeroForm({ value, onChange }: { value: HeroContent; onChange: (h: HeroContent) => void }) {
  const set = <K extends keyof HeroContent>(key: K, v: HeroContent[K]) => onChange({ ...value, [key]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="availability" value={value.availability} onChangeText={(t) => set('availability', t)} />
      <Field label="titleLead" value={value.titleLead} onChangeText={(t) => set('titleLead', t)} />
      <Field label="titleAccent" value={value.titleAccent} onChangeText={(t) => set('titleAccent', t)} />
      <Field label="subtitle" value={value.subtitle} onChangeText={(t) => set('subtitle', t)} multiline />
      <Field label="primaryCta.label" value={value.primaryCta.label} onChangeText={(t) => set('primaryCta', { ...value.primaryCta, label: t })} />
      <Field label="primaryCta.anchor" value={value.primaryCta.anchor} onChangeText={(t) => set('primaryCta', { ...value.primaryCta, anchor: t })} />
      <Field label="secondaryCta.label" value={value.secondaryCta.label} onChangeText={(t) => set('secondaryCta', { ...value.secondaryCta, label: t })} />
      <Field label="secondaryCta.anchor" value={value.secondaryCta.anchor} onChangeText={(t) => set('secondaryCta', { ...value.secondaryCta, anchor: t })} />
      <Label>stats</Label>
      <ListEditor
        items={value.stats}
        onChange={(stats) => set('stats', stats)}
        makeEmpty={() => ({ value: '', label: '' })}
        renderItem={(stat, on) => (
          <>
            <Field label="value" value={stat.value} onChangeText={(t) => on({ ...stat, value: t })} />
            <Field label="label" value={stat.label} onChangeText={(t) => on({ ...stat, label: t })} />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: FAIL — `../list-editor` does not exist yet AND `admin-screen.tsx` still imports the old hero-form path. That is expected mid-refactor; it is fixed in Task 2 (list-editor) and Task 6 (admin-screen). To keep this task self-contained, do NOT commit yet — proceed to Task 2 first, then commit both together at the end of Task 2.

Note: Tasks 1 and 2 land together (the type check only goes green once `list-editor` exists). Their commit is at the end of Task 2.

---

### Task 2: ListEditor + StringListEditor, then commit Tasks 1-2

**Files:**
- Create: `src/admin/components/list-editor.tsx`
- Create: `src/admin/components/string-list-editor.tsx`

- [ ] **Step 1: Create `src/admin/components/list-editor.tsx`**

```tsx
import type { ReactNode } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, radii } from '@/theme/tokens';

function Ctrl({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.sm, paddingHorizontal: 10, paddingVertical: 5, opacity: disabled ? 0.35 : 1 }}
    >
      <Text style={{ color: colors.textMuted, fontSize: 13 }}>{label}</Text>
    </Pressable>
  );
}

export function ListEditor<T>({
  items,
  onChange,
  makeEmpty,
  renderItem,
  addLabel = '+ Añadir',
}: {
  items: T[];
  onChange: (items: T[]) => void;
  makeEmpty: () => T;
  renderItem: (item: T, onItemChange: (item: T) => void, index: number) => ReactNode;
  addLabel?: string;
}) {
  const update = (index: number, item: T) => onChange(items.map((it, i) => (i === index ? item : it)));
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index));
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const next = items.slice();
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <View style={{ gap: 12 }}>
      {items.map((item, i) => (
        <View key={i} style={{ gap: 8, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md, backgroundColor: colors.surface }}>
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 6 }}>
            <Ctrl label="↑" onPress={() => move(i, -1)} disabled={i === 0} />
            <Ctrl label="↓" onPress={() => move(i, 1)} disabled={i === items.length - 1} />
            <Ctrl label="✕" onPress={() => remove(i)} />
          </View>
          {renderItem(item, (it) => update(i, it), i)}
        </View>
      ))}
      <Pressable
        onPress={() => onChange([...items, makeEmpty()])}
        style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 8 }}
      >
        <Text style={{ color: colors.text, fontSize: 13 }}>{addLabel}</Text>
      </Pressable>
    </View>
  );
}
```

- [ ] **Step 2: Create `src/admin/components/string-list-editor.tsx`**

```tsx
import { View } from 'react-native';
import { Field, Label } from './field';
import { ListEditor } from './list-editor';

export function StringListEditor({ label, items, onChange }: { label: string; items: string[]; onChange: (items: string[]) => void }) {
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <ListEditor<string>
        items={items}
        onChange={onChange}
        makeEmpty={() => ''}
        renderItem={(item, on) => <Field value={item} onChangeText={on} />}
      />
    </View>
  );
}
```

- [ ] **Step 3: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS EXCEPT for `src/admin/screens/admin-screen.tsx` still importing `../components/hero-form` (old path). That single error is fixed in Task 6. If any OTHER error appears, fix it before committing.

- [ ] **Step 4: Commit Tasks 1-2**

```bash
git add src/admin/components/field.tsx src/admin/components/list-editor.tsx src/admin/components/string-list-editor.tsx src/admin/components/forms/hero-form.tsx
git commit -m "feat(admin): add form primitives (Field/ListEditor/StringListEditor); move hero-form"
```

---

### Task 3: Simple forms — impact, certifications, contact, nav

**Files:**
- Create: `src/admin/components/forms/impact-form.tsx`
- Create: `src/admin/components/forms/certifications-form.tsx`
- Create: `src/admin/components/forms/contact-form.tsx`
- Create: `src/admin/components/forms/nav-form.tsx`

- [ ] **Step 1: Create `src/admin/components/forms/impact-form.tsx`**

```tsx
import { View } from 'react-native';
import type { ImpactContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function ImpactForm({ value, onChange }: { value: ImpactContent; onChange: (v: ImpactContent) => void }) {
  const set = <K extends keyof ImpactContent>(k: K, v: ImpactContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ value: '', label: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="value" value={it.value} onChangeText={(t) => on({ ...it, value: t })} />
            <Field label="label" value={it.label} onChangeText={(t) => on({ ...it, label: t })} />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 2: Create `src/admin/components/forms/certifications-form.tsx`**

```tsx
import { View } from 'react-native';
import type { CertificationsContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function CertificationsForm({ value, onChange }: { value: CertificationsContent; onChange: (v: CertificationsContent) => void }) {
  const set = <K extends keyof CertificationsContent>(k: K, v: CertificationsContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ name: '', issuer: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="name" value={it.name} onChangeText={(t) => on({ ...it, name: t })} />
            <Field label="issuer" value={it.issuer} onChangeText={(t) => on({ ...it, issuer: t })} />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 3: Create `src/admin/components/forms/contact-form.tsx`**

```tsx
import { View } from 'react-native';
import type { ContactContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function ContactForm({ value, onChange }: { value: ContactContent; onChange: (v: ContactContent) => void }) {
  const set = <K extends keyof ContactContent>(k: K, v: ContactContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Field label="email" value={value.email} onChangeText={(t) => set('email', t)} />
      <Field label="cta" value={value.cta} onChangeText={(t) => set('cta', t)} />
      <Label>socials</Label>
      <ListEditor
        items={value.socials}
        onChange={(socials) => set('socials', socials)}
        makeEmpty={() => ({ label: '', url: '' })}
        renderItem={(s, on) => (
          <>
            <Field label="label" value={s.label} onChangeText={(t) => on({ ...s, label: t })} />
            <Field label="url" value={s.url} onChangeText={(t) => on({ ...s, url: t })} />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 4: Create `src/admin/components/forms/nav-form.tsx`**

```tsx
import { View } from 'react-native';
import type { NavContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function NavForm({ value, onChange }: { value: NavContent; onChange: (v: NavContent) => void }) {
  const set = <K extends keyof NavContent>(k: K, v: NavContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="name" value={value.name} onChangeText={(t) => set('name', t)} />
      <Field label="role" value={value.role} onChangeText={(t) => set('role', t)} />
      <Field label="languageToggleLabel" value={value.languageToggleLabel} onChangeText={(t) => set('languageToggleLabel', t)} />
      <Field label="cta.label" value={value.cta.label} onChangeText={(t) => set('cta', { ...value.cta, label: t })} />
      <Field label="cta.anchor" value={value.cta.anchor} onChangeText={(t) => set('cta', { ...value.cta, anchor: t })} />
      <Label>links</Label>
      <ListEditor
        items={value.links}
        onChange={(links) => set('links', links)}
        makeEmpty={() => ({ label: '', anchor: '' })}
        renderItem={(l, on) => (
          <>
            <Field label="label" value={l.label} onChangeText={(t) => on({ ...l, label: t })} />
            <Field label="anchor" value={l.anchor} onChangeText={(t) => on({ ...l, anchor: t })} />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 5: Verify types** — Run: `npx tsc --noEmit` — Expected: PASS except the known `admin-screen.tsx` hero-form import error (fixed in Task 6). No other errors.

- [ ] **Step 6: Commit**

```bash
git add src/admin/components/forms/impact-form.tsx src/admin/components/forms/certifications-form.tsx src/admin/components/forms/contact-form.tsx src/admin/components/forms/nav-form.tsx
git commit -m "feat(admin): add impact/certifications/contact/nav forms"
```

---

### Task 4: List forms — services, experience

**Files:**
- Create: `src/admin/components/forms/services-form.tsx`
- Create: `src/admin/components/forms/experience-form.tsx`

- [ ] **Step 1: Create `src/admin/components/forms/services-form.tsx`**

```tsx
import { View } from 'react-native';
import type { ServicesContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function ServicesForm({ value, onChange }: { value: ServicesContent; onChange: (v: ServicesContent) => void }) {
  const set = <K extends keyof ServicesContent>(k: K, v: ServicesContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ index: '', tag: '', title: '', description: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="index" value={it.index} onChangeText={(t) => on({ ...it, index: t })} />
            <Field label="tag" value={it.tag} onChangeText={(t) => on({ ...it, tag: t })} />
            <Field label="title" value={it.title} onChangeText={(t) => on({ ...it, title: t })} />
            <Field label="description" value={it.description} onChangeText={(t) => on({ ...it, description: t })} multiline />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 2: Create `src/admin/components/forms/experience-form.tsx`**

```tsx
import { View } from 'react-native';
import type { ExperienceContent } from '@/content/types';
import { BoolField, Field, Label } from '../field';
import { ListEditor } from '../list-editor';

export function ExperienceForm({ value, onChange }: { value: ExperienceContent; onChange: (v: ExperienceContent) => void }) {
  const set = <K extends keyof ExperienceContent>(k: K, v: ExperienceContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ period: '', location: '', current: false, currentLabel: '', role: '', company: '', description: '' })}
        renderItem={(it, on) => (
          <>
            <Field label="period" value={it.period} onChangeText={(t) => on({ ...it, period: t })} />
            <Field label="location" value={it.location} onChangeText={(t) => on({ ...it, location: t })} />
            <BoolField label="current" value={it.current ?? false} onChange={(v) => on({ ...it, current: v })} />
            <Field label="currentLabel" value={it.currentLabel ?? ''} onChangeText={(t) => on({ ...it, currentLabel: t })} />
            <Field label="role" value={it.role} onChangeText={(t) => on({ ...it, role: t })} />
            <Field label="company" value={it.company} onChangeText={(t) => on({ ...it, company: t })} />
            <Field label="description" value={it.description} onChangeText={(t) => on({ ...it, description: t })} multiline />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 3: Verify types** — Run: `npx tsc --noEmit` — Expected: PASS except the known `admin-screen.tsx` import error (fixed in Task 6).

- [ ] **Step 4: Commit**

```bash
git add src/admin/components/forms/services-form.tsx src/admin/components/forms/experience-form.tsx
git commit -m "feat(admin): add services and experience forms"
```

---

### Task 5: Nested-list forms — stack, projects

**Files:**
- Create: `src/admin/components/forms/stack-form.tsx`
- Create: `src/admin/components/forms/projects-form.tsx`

- [ ] **Step 1: Create `src/admin/components/forms/stack-form.tsx`**

```tsx
import { View } from 'react-native';
import type { StackContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';
import { StringListEditor } from '../string-list-editor';

export function StackForm({ value, onChange }: { value: StackContent; onChange: (v: StackContent) => void }) {
  const set = <K extends keyof StackContent>(k: K, v: StackContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>groups</Label>
      <ListEditor
        items={value.groups}
        onChange={(groups) => set('groups', groups)}
        makeEmpty={() => ({ category: '', items: [] })}
        renderItem={(g, on) => (
          <>
            <Field label="category" value={g.category} onChangeText={(t) => on({ ...g, category: t })} />
            <StringListEditor label="items" items={g.items} onChange={(items) => on({ ...g, items })} />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 2: Create `src/admin/components/forms/projects-form.tsx`**

```tsx
import { View } from 'react-native';
import type { ProjectsContent } from '@/content/types';
import { Field, Label } from '../field';
import { ListEditor } from '../list-editor';
import { StringListEditor } from '../string-list-editor';

export function ProjectsForm({ value, onChange }: { value: ProjectsContent; onChange: (v: ProjectsContent) => void }) {
  const set = <K extends keyof ProjectsContent>(k: K, v: ProjectsContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Label>items</Label>
      <ListEditor
        items={value.items}
        onChange={(items) => set('items', items)}
        makeEmpty={() => ({ category: '', title: '', description: '', tech: [] })}
        renderItem={(it, on) => (
          <>
            <Field label="category" value={it.category} onChangeText={(t) => on({ ...it, category: t })} />
            <Field label="title" value={it.title} onChangeText={(t) => on({ ...it, title: t })} />
            <Field label="description" value={it.description} onChangeText={(t) => on({ ...it, description: t })} multiline />
            <StringListEditor label="tech" items={it.tech} onChange={(tech) => on({ ...it, tech })} />
          </>
        )}
      />
    </View>
  );
}
```

- [ ] **Step 3: Verify types** — Run: `npx tsc --noEmit` — Expected: PASS except the known `admin-screen.tsx` import error (fixed in Task 6).

- [ ] **Step 4: Commit**

```bash
git add src/admin/components/forms/stack-form.tsx src/admin/components/forms/projects-form.tsx
git commit -m "feat(admin): add stack and projects forms (nested string lists)"
```

---

### Task 6: Admin screen — section selector + all forms

**Files:**
- Modify: `src/admin/screens/admin-screen.tsx` (replace)

- [ ] **Step 1: Replace `src/admin/screens/admin-screen.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import type { User } from 'firebase/auth';
import type { PortfolioContent } from '@/content/types';
import type { Locale } from '@/i18n/locales';
import { colors, fonts, radii } from '@/theme/tokens';
import { onAdminAuthChanged, signInWithGoogle, signOutAdmin } from '../auth';
import { loadContent, saveSection } from '../content-repo';
import { publishSite } from '../publish';
import { HeroForm } from '../components/forms/hero-form';
import { NavForm } from '../components/forms/nav-form';
import { ServicesForm } from '../components/forms/services-form';
import { ImpactForm } from '../components/forms/impact-form';
import { StackForm } from '../components/forms/stack-form';
import { ExperienceForm } from '../components/forms/experience-form';
import { ProjectsForm } from '../components/forms/projects-form';
import { CertificationsForm } from '../components/forms/certifications-form';
import { ContactForm } from '../components/forms/contact-form';

type SectionKey = keyof PortfolioContent;

const SECTIONS: { key: SectionKey; label: string }[] = [
  { key: 'nav', label: 'Nav' },
  { key: 'hero', label: 'Hero' },
  { key: 'services', label: 'Servicios' },
  { key: 'impact', label: 'Impacto' },
  { key: 'stack', label: 'Stack' },
  { key: 'experience', label: 'Experiencia' },
  { key: 'projects', label: 'Proyectos' },
  { key: 'certifications', label: 'Certificaciones' },
  { key: 'contact', label: 'Contacto' },
];

function SectionForm({ section, content, onChange }: { section: SectionKey; content: PortfolioContent; onChange: (c: PortfolioContent) => void }) {
  switch (section) {
    case 'nav':
      return <NavForm value={content.nav} onChange={(v) => onChange({ ...content, nav: v })} />;
    case 'hero':
      return <HeroForm value={content.hero} onChange={(v) => onChange({ ...content, hero: v })} />;
    case 'services':
      return <ServicesForm value={content.services} onChange={(v) => onChange({ ...content, services: v })} />;
    case 'impact':
      return <ImpactForm value={content.impact} onChange={(v) => onChange({ ...content, impact: v })} />;
    case 'stack':
      return <StackForm value={content.stack} onChange={(v) => onChange({ ...content, stack: v })} />;
    case 'experience':
      return <ExperienceForm value={content.experience} onChange={(v) => onChange({ ...content, experience: v })} />;
    case 'projects':
      return <ProjectsForm value={content.projects} onChange={(v) => onChange({ ...content, projects: v })} />;
    case 'certifications':
      return <CertificationsForm value={content.certifications} onChange={(v) => onChange({ ...content, certifications: v })} />;
    case 'contact':
      return <ContactForm value={content.contact} onChange={(v) => onChange({ ...content, contact: v })} />;
  }
}

export function AdminScreen() {
  const [authReady, setAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [locale, setLocale] = useState<Locale>('es');
  const [content, setContent] = useState<PortfolioContent | null>(null);
  const [section, setSection] = useState<SectionKey>('hero');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const [publishing, setPublishing] = useState(false);
  const [publishMsg, setPublishMsg] = useState<string | null>(null);
  const [publishUrl, setPublishUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsub: (() => void) | undefined;
    onAdminAuthChanged((u) => {
      if (!active) return;
      setUser(u);
      setAuthReady(true);
    }).then((fn) => {
      if (active) unsub = fn;
      else fn();
    });
    return () => {
      active = false;
      unsub?.();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    setStatus(null);
    loadContent(locale)
      .then((c) => active && setContent(c))
      .catch((e) => active && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user, locale]);

  const onSignIn = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al iniciar sesión');
    }
  };

  const onSave = async () => {
    if (!content) return;
    setStatus('Guardando…');
    try {
      await saveSection(locale, section, content[section]);
      setStatus('Guardado en Firestore — publica para verlo en vivo.');
    } catch (e) {
      setStatus(e instanceof Error ? `Error: ${e.message}` : 'Error al guardar');
    }
  };

  const onPublish = async () => {
    setPublishing(true);
    setPublishMsg(null);
    setPublishUrl(null);
    try {
      const { actionsUrl } = await publishSite();
      setPublishMsg('Publicación iniciada (~2-3 min).');
      setPublishUrl(actionsUrl);
    } catch (e) {
      setPublishMsg(e instanceof Error ? `Error: ${e.message}` : 'Error al publicar');
    } finally {
      setPublishing(false);
    }
  };

  if (!authReady) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 24, color: colors.text }}>Panel de administración</Text>
        <Pressable onPress={onSignIn} style={{ backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 22, paddingVertical: 13 }}>
          <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 15 }}>Iniciar sesión con Google</Text>
        </Pressable>
        {error ? <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text> : null}
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 24, gap: 20, maxWidth: 760, width: '100%', marginHorizontal: 'auto' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <Text style={{ fontFamily: fonts.display, fontSize: 22, color: colors.text }}>Panel · {SECTIONS.find((s) => s.key === section)?.label}</Text>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Pressable onPress={onPublish} disabled={publishing} style={{ backgroundColor: colors.accent, borderRadius: radii.pill, paddingHorizontal: 16, paddingVertical: 7, opacity: publishing ? 0.6 : 1 }}>
            <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 13 }}>{publishing ? 'Publicando…' : 'Publicar'}</Text>
          </Pressable>
          <Pressable onPress={signOutAdmin} style={{ borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radii.pill, paddingHorizontal: 14, paddingVertical: 7 }}>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>Cerrar sesión</Text>
          </Pressable>
        </View>
      </View>

      {publishMsg ? (
        <View style={{ gap: 4 }}>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>{publishMsg}</Text>
          {publishUrl ? (
            <Text onPress={() => Linking.openURL(publishUrl)} style={{ color: colors.accent, fontSize: 13, textDecorationLine: 'underline' }}>
              Ver progreso en GitHub Actions
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(['es', 'en'] as Locale[]).map((l) => (
          <Pressable key={l} onPress={() => setLocale(l)} style={{ borderRadius: radii.sm, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: l === locale ? colors.accent : colors.surfaceStrong }}>
            <Text style={{ color: l === locale ? colors.onAccent : colors.text, fontFamily: fonts.mono, fontSize: 12 }}>{l.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {SECTIONS.map((s) => (
          <Pressable key={s.key} onPress={() => setSection(s.key)} style={{ borderRadius: radii.sm, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: s.key === section ? colors.accent : colors.border, backgroundColor: s.key === section ? 'rgba(228,227,87,0.12)' : 'transparent' }}>
            <Text style={{ color: s.key === section ? colors.accent : colors.textMuted, fontSize: 12.5 }}>{s.label}</Text>
          </Pressable>
        ))}
      </View>

      {loading || !content ? (
        <ActivityIndicator color={colors.accent} />
      ) : (
        <>
          <SectionForm section={section} content={content} onChange={setContent} />
          <Pressable onPress={onSave} style={{ alignSelf: 'flex-start', backgroundColor: colors.accent, borderRadius: radii.md, paddingHorizontal: 24, paddingVertical: 13 }}>
            <Text style={{ color: colors.onAccent, fontFamily: fonts.bodyMedium, fontSize: 15 }}>Guardar</Text>
          </Pressable>
          {status ? <Text style={{ color: colors.textMuted, fontSize: 13 }}>{status}</Text> : null}
        </>
      )}
      {error ? <Text style={{ color: '#ff6b6b', fontSize: 13 }}>{error}</Text> : null}
    </ScrollView>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: PASS (all form imports resolve; the old hero-form path error is gone).

- [ ] **Step 3: Verify build + public bundle hygiene**

Run:
```bash
rm -rf dist && npx expo export -p web
for c in $(grep -oE '_expo/static/js/web/[a-zA-Z0-9._-]+\.js' dist/index.html); do grep -q "firebaseapp.com\|initializeApp" "dist/$c" && echo "LEAK $c"; done; echo "home checked"
```
Expected: build succeeds; no `LEAK` line (public home still excludes Firebase).

- [ ] **Step 4: Commit**

```bash
git add src/admin/screens/admin-screen.tsx
git commit -m "feat(admin): section selector rendering all content forms"
```

---

### Task 7: Verification

**Files:** none

- [ ] **Step 1: Type check** — Run: `npx tsc --noEmit` — Expected: PASS.

- [ ] **Step 2: Confirm no stray old hero-form path**

Run: `grep -rn "components/hero-form" src` — Expected: no matches (all reference `components/forms/hero-form`).

- [ ] **Step 3: Manual — edit representative sections**

`npm run web`, open `/admin`, sign in. For **services**, **experience**, and **stack**:
- Edit a field; add an item; remove an item; reorder with ↑/↓.
- Click **Guardar** → status "Guardado en Firestore…".
- In the Firebase console, `content/es` reflects the change (nested arrays intact).

- [ ] **Step 4: Manual — locale + publish**

- Toggle **EN**, confirm the forms reload with English content; edit + Guardar writes `content/en`.
- Click **Publicar** → after the run, the live site shows the change.

- [ ] **Step 5: Commit (only if fixes were needed)**

```bash
git add -A
git commit -m "fix(admin): phase 2B verification adjustments"
```

---

## Self-Review

- **Spec coverage:** primitives Field/BoolField/Label/ListEditor/StringListEditor (T1-T2); hero-form refactored + moved (T1); forms for nav + 7 sections (T3-T5); section selector + typed switch + per-section save + locale + publish reused (T6); verification incl. bundle hygiene + manual edit/reorder/save/publish (T7). ✓
- **Placeholder scan:** none — every step has concrete code. The mid-refactor "expected FAIL/partial" notes are explicit and resolved by a named later task, not vague.
- **Type consistency:** `Field`/`Label`/`BoolField` (T1) used by all forms; `ListEditor<T>` signature `{items,onChange,makeEmpty,renderItem,addLabel?}` (T2) used identically everywhere; `StringListEditor({label,items,onChange})` (T2) used in stack/projects (T5); each form is `{value,onChange}` typed to its `*Content`; `SectionForm` switch (T6) covers all nine `SECTIONS` keys; `saveSection(locale, section, content[section])` matches the generic signature from `content-repo`. ✓
