import type { Locale } from '@/i18n/locales';

export const SLOT_TIMES = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
export const MAX_DAYS_AHEAD = 60;

const MONTHS: Record<Locale, string[]> = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const WEEKDAY_HEADERS: Record<Locale, string[]> = {
  es: ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá', 'Do'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
};
const DAY_ABBR: Record<Locale, string[]> = {
  es: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

export function monthName(locale: Locale, monthIndex: number): string {
  return MONTHS[locale][monthIndex];
}
export function weekdayHeaders(locale: Locale): string[] {
  return WEEKDAY_HEADERS[locale];
}

export function toISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Bookable: Mon–Fri, from today up to MAX_DAYS_AHEAD days out (visitor's clock). */
export function isBookableDay(d: Date): boolean {
  const dow = d.getDay();
  if (dow === 0 || dow === 6) return false;
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const max = new Date(today);
  max.setDate(max.getDate() + MAX_DAYS_AHEAD);
  return target >= today && target <= max;
}

/** "Mi 15 Julio · 10:00 (GMT-5)" / "Wed July 15 · 10:00 (GMT-5)" */
export function formatSlot(iso: string, time: string, locale: Locale): string {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const abbr = DAY_ABBR[locale][date.getDay()];
  const month = MONTHS[locale][m - 1];
  return locale === 'es' ? `${abbr} ${d} ${month} · ${time} (GMT-5)` : `${abbr} ${month} ${d} · ${time} (GMT-5)`;
}
