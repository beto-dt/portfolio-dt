export function scrollToAnchor(anchor: string): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(anchor);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
