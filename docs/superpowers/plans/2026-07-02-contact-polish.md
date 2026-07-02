# Contact Section Polish + Animations — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a staggered fade-in entrance to the Contacto section and make each detail block hover-reactive (label turns accent + accent underline grows), keeping the existing CTA/link interactions.

**Architecture:** `Detail` becomes a hover-reactive `Pressable` (render-prop `hovered`) with a label + growing accent underline; the section wraps heading/blurb/CTAs/details grid in the existing `Reveal`. Single file.

**Tech Stack:** Expo Router + react-native-web, existing `Reveal` + `AppButton` + `HoverLink`, Pressable hover state. No test runner in this repo.

**Verification note:** No jest/unit-test setup — do NOT add one. Verify with `npx tsc --noEmit` + `npx expo export -p web` + browser. Do NOT run `npx expo lint` (auto-scaffolds `eslint.config.js` + deps; discard if produced). If `dist/` appears it is gitignored — leave it.

---

### Task 1: `contact-section.tsx` — hover details + staggered entrance

**Files:**
- Modify: `src/features/portfolio/sections/contact/contact-section.tsx` (full rewrite)

- [ ] **Step 1: Replace the entire contents of `src/features/portfolio/sections/contact/contact-section.tsx`**

```tsx
import { Linking, Platform, Pressable, Text, View, type PressableStateCallbackType } from 'react-native';
import { Container } from '../../components/container';
import { SectionHeading } from '../../components/section-heading';
import { useI18n } from '@/i18n/i18n-provider';
import { colors, fonts } from '@/theme/tokens';
import { AppButton } from '@/ui/app-button';
import { HoverLink } from '@/ui/hover-link';
import { Reveal } from '@/ui/reveal';

type HoverState = PressableStateCallbackType & { hovered?: boolean };
const labelTransition = Platform.OS === 'web' ? ({ transitionProperty: 'color', transitionDuration: '180ms' } as object) : null;
const underlineTransition = Platform.OS === 'web' ? ({ transformOrigin: 'left', transitionProperty: 'transform', transitionDuration: '200ms' } as object) : null;

function Detail({ label, value, onPress }: { label: string; value: string; onPress?: () => void }) {
  if (!value) return null;
  return (
    <Pressable style={{ gap: 3, minWidth: 150 }}>
      {({ hovered }: HoverState) => (
        <>
          <View style={{ gap: 4, alignSelf: 'flex-start' }}>
            <Text style={[{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 0.6, textTransform: 'uppercase', color: hovered ? colors.accent : colors.textFaint }, labelTransition as object]}>
              {label}
            </Text>
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

export function ContactSection() {
  const { content } = useI18n();
  const { contact } = content;
  return (
    <Container style={{ paddingVertical: 72 }} nativeID="contact">
      <Reveal delay={0}>
        <SectionHeading kicker={contact.kicker} heading={contact.heading} />
      </Reveal>
      <Reveal delay={70}>
        <Text style={{ fontSize: 16, lineHeight: 26, color: colors.textMuted, maxWidth: 560, marginBottom: 28 }}>{contact.blurb}</Text>
      </Reveal>

      <Reveal delay={140}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
          <AppButton label={contact.emailCta} onPress={() => Linking.openURL(`mailto:${contact.email}`)} variant="primary" />
          <AppButton label={contact.whatsappCta} onPress={() => Linking.openURL(`https://wa.me/${contact.whatsapp}`)} variant="outline" />
        </View>
      </Reveal>

      <Reveal delay={210}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 32, paddingTop: 24, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Detail label="Email" value={contact.email} onPress={() => Linking.openURL(`mailto:${contact.email}`)} />
          <Detail label="Teléfono" value={contact.phone} onPress={() => Linking.openURL(`tel:${contact.phone.replace(/\s/g, '')}`)} />
          <Detail label="LinkedIn" value={contact.linkedin} onPress={() => Linking.openURL(contact.linkedin)} />
          <Detail label="Ubicación" value={contact.location} />
        </View>
      </Reveal>
    </Container>
  );
}
```

- [ ] **Step 2: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful `dist` export.

- [ ] **Step 3: Commit**

```bash
git add src/features/portfolio/sections/contact/contact-section.tsx
git commit -m "feat(portfolio): contact detail hover (label + underline) + staggered reveal"
```

---

### Task 2: Verify (build + bundle hygiene + browser) and deploy

**Files:** none (verification + deploy).

- [ ] **Step 1: Type-check + build**

Run: `npx tsc --noEmit && npx expo export -p web`
Expected: PASS + successful export.

- [ ] **Step 2: Bundle hygiene**

Run: `grep -rl "initializeApp\|firebase/auth" dist/_expo/static/js/web | grep -v firebase-client || echo "clean"`
Expected: `clean`.

- [ ] **Step 3: Browser verification (preview tools)**

Start/reuse the `web` preview, scroll to the Contacto section, and confirm:
- **At rest:** section looks identical (heading, blurb, two CTAs, details grid).
  `preview_screenshot`.
- **Detail hover:** hovering a detail turns its label accent and grows the accent
  underline; the value link still color-changes (headless RNW hover may be
  unreliable — confirm by code / live).
- **CTAs/links:** email → `mailto:`, WhatsApp → `wa.me`, phone → `tel:`, LinkedIn →
  url (unchanged; spot-check they still render/behave).
- **Entrance:** heading/blurb/CTAs/details fade+slide in staggered on reload.
- **Layout:** verify at mobile (375) + desktop; no content shift.

Fix issues by editing source and re-running from Step 1.

- [ ] **Step 4: Deploy**

After merge (or on request): `gh workflow run deploy.yml --ref main`, then
`gh run watch <run-id> --exit-status` → `completed / success`. Confirm live.

---

## Self-Review

**1. Spec coverage:**
- Staggered entrance (heading 0 / blurb 70 / CTAs 140 / details 210) → Task 1 ✓
- Detail hover: label → accent + growing accent underline; value keeps existing
  behavior → Task 1 (`Detail`) ✓
- CTAs unchanged, ride the stagger → Task 1 ✓
- Verify + deploy → Task 2 ✓
- Non-goals honored: no content/layout/type-size change; detail container has no
  `onPress`; `SectionHeading` wrapped not edited; other sections untouched ✓
No gaps.

**2. Placeholder scan:** No TBD/TODO; complete code in the code step. ✓

**3. Type consistency:**
- `Detail({ label, value, onPress? })` — same signature as the current file; call
  sites unchanged (4 details) ✓.
- `Reveal({ children, delay?, slide?, style? })` — used with `delay`, default slide
  ✓.
- `AppButton` / `HoverLink` APIs unchanged (label/onPress/variant, label/onPress/
  color/hoverColor) ✓.
- `contact` fields used (`kicker`, `heading`, `blurb`, `emailCta`, `whatsappCta`,
  `email`, `whatsapp`, `phone`, `linkedin`, `location`) all exist on
  `ContactContent` ✓.
- Detail rest appearance (mono label `textFaint`, value `HoverLink`/`Text`) matches
  the current file; underline is `scaleX: 0` at rest ✓.
