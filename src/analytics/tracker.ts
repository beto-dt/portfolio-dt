import { VISIT_ENDPOINT } from './config';

// Firebase-free visit tracker: accumulates seen sections and sends ONE beacon
// per session when the page is hidden/unloaded. No cookies, no PII.

const seen = new Set<string>();
let armed = false;
let sent = false;

function isWeb(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function';
}

function send(): void {
  if (sent || !isWeb()) return;
  sent = true;
  let countVisit = true;
  try {
    countVisit = !window.sessionStorage.getItem('pf_visit');
    if (countVisit) window.sessionStorage.setItem('pf_visit', '1');
  } catch {
    countVisit = true;
  }
  const payload = JSON.stringify({ countVisit, sections: [...seen] });
  try {
    navigator.sendBeacon(VISIT_ENDPOINT, new Blob([payload], { type: 'application/json' }));
  } catch {
    // ignore — analytics must never break the page
  }
}

export function armVisit(): void {
  if (armed || !isWeb()) return;
  armed = true;
  const onHidden = () => {
    if (document.visibilityState === 'hidden') send();
  };
  window.addEventListener('visibilitychange', onHidden);
  window.addEventListener('pagehide', send);
}

export function markSectionSeen(id: string): void {
  seen.add(id);
  armVisit();
}
