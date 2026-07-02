import { View } from 'react-native';
import type { ContactContent } from '@/content/types';
import { Field } from '../field';
import { StringListEditor } from '../string-list-editor';

export function ContactForm({ value, onChange }: { value: ContactContent; onChange: (v: ContactContent) => void }) {
  const set = <K extends keyof ContactContent>(k: K, v: ContactContent[K]) => onChange({ ...value, [k]: v });
  return (
    <View style={{ gap: 16 }}>
      <Field label="kicker" value={value.kicker} onChangeText={(t) => set('kicker', t)} />
      <Field label="heading" value={value.heading} onChangeText={(t) => set('heading', t)} />
      <Field label="blurb" value={value.blurb} onChangeText={(t) => set('blurb', t)} multiline />
      <Field label="emailCta" value={value.emailCta} onChangeText={(t) => set('emailCta', t)} />
      <Field label="whatsappCta" value={value.whatsappCta} onChangeText={(t) => set('whatsappCta', t)} />
      <Field label="email" value={value.email} onChangeText={(t) => set('email', t)} />
      <Field label="phone" value={value.phone} onChangeText={(t) => set('phone', t)} />
      <Field label="whatsapp (solo dígitos)" value={value.whatsapp} onChangeText={(t) => set('whatsapp', t)} />
      <Field label="linkedin" value={value.linkedin} onChangeText={(t) => set('linkedin', t)} />
      <Field label="location" value={value.location} onChangeText={(t) => set('location', t)} />
      <Field label="linkedinLabel" value={value.linkedinLabel} onChangeText={(t) => set('linkedinLabel', t)} />
      <Field label="formNameLabel" value={value.formNameLabel} onChangeText={(t) => set('formNameLabel', t)} />
      <Field label="formNamePlaceholder" value={value.formNamePlaceholder} onChangeText={(t) => set('formNamePlaceholder', t)} />
      <Field label="formTypeLabel" value={value.formTypeLabel} onChangeText={(t) => set('formTypeLabel', t)} />
      <StringListEditor label="projectTypes" items={value.projectTypes} onChange={(projectTypes) => set('projectTypes', projectTypes)} />
      <Field label="formBudgetLabel" value={value.formBudgetLabel} onChangeText={(t) => set('formBudgetLabel', t)} />
      <StringListEditor label="budgets" items={value.budgets} onChange={(budgets) => set('budgets', budgets)} />
      <Field label="formMessageLabel" value={value.formMessageLabel} onChangeText={(t) => set('formMessageLabel', t)} />
      <Field label="formMessagePlaceholder" value={value.formMessagePlaceholder} onChangeText={(t) => set('formMessagePlaceholder', t)} multiline />
      <Field label="formHint" value={value.formHint} onChangeText={(t) => set('formHint', t)} multiline />
      <Field label="formEmailLabel" value={value.formEmailLabel} onChangeText={(t) => set('formEmailLabel', t)} />
      <Field label="formEmailPlaceholder" value={value.formEmailPlaceholder} onChangeText={(t) => set('formEmailPlaceholder', t)} />
      <Field label="stepProjectLabel" value={value.stepProjectLabel} onChangeText={(t) => set('stepProjectLabel', t)} />
      <Field label="stepScheduleLabel" value={value.stepScheduleLabel} onChangeText={(t) => set('stepScheduleLabel', t)} />
      <Field label="nextCta" value={value.nextCta} onChangeText={(t) => set('nextCta', t)} />
      <Field label="backCta" value={value.backCta} onChangeText={(t) => set('backCta', t)} />
      <Field label="confirmCta" value={value.confirmCta} onChangeText={(t) => set('confirmCta', t)} />
      <Field label="slotsHeading" value={value.slotsHeading} onChangeText={(t) => set('slotsHeading', t)} />
      <Field label="slotsFreeSuffix" value={value.slotsFreeSuffix} onChangeText={(t) => set('slotsFreeSuffix', t)} />
      <Field label="slotsPickDay" value={value.slotsPickDay} onChangeText={(t) => set('slotsPickDay', t)} />
      <Field label="bannerPickDay" value={value.bannerPickDay} onChangeText={(t) => set('bannerPickDay', t)} />
      <Field label="bannerPickTime" value={value.bannerPickTime} onChangeText={(t) => set('bannerPickTime', t)} />
      <Field label="bannerScheduled" value={value.bannerScheduled} onChangeText={(t) => set('bannerScheduled', t)} />
      <Field label="whatsappAlt" value={value.whatsappAlt} onChangeText={(t) => set('whatsappAlt', t)} />
      <Field label="successTitle" value={value.successTitle} onChangeText={(t) => set('successTitle', t)} />
      <Field label="successBody" value={value.successBody} onChangeText={(t) => set('successBody', t)} multiline />
      <Field label="successAgain" value={value.successAgain} onChangeText={(t) => set('successAgain', t)} />
      <Field label="errorRequired" value={value.errorRequired} onChangeText={(t) => set('errorRequired', t)} />
      <Field label="errorSlotTaken" value={value.errorSlotTaken} onChangeText={(t) => set('errorSlotTaken', t)} />
      <Field label="errorNetwork" value={value.errorNetwork} onChangeText={(t) => set('errorNetwork', t)} />
      <Field label="interestLabel" value={value.interestLabel} onChangeText={(t) => set('interestLabel', t)} />
    </View>
  );
}
