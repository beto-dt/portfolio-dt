export type BookingIntent = { model?: string; projectType?: string };

type Listener = (intent: BookingIntent) => void;
const listeners = new Set<Listener>();
let pending: BookingIntent | null = null;

/** Broadcast what the visitor tapped; kept until Contact mounts and consumes it. */
export function setBookingIntent(intent: BookingIntent): void {
  pending = intent;
  listeners.forEach((l) => l(intent));
}

/** One-shot read of the last intent (cross-route navigation). */
export function consumeBookingIntent(): BookingIntent | null {
  const intent = pending;
  pending = null;
  return intent;
}

/** Subscribe to intent broadcasts; returns an unsubscribe. */
export function onBookingIntent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
