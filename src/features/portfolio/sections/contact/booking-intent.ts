export type BookingIntent = { model?: string; projectType?: string };

type Listener = (intent: BookingIntent) => void;
const listeners = new Set<Listener>();

/** Broadcast what the visitor tapped (collaboration model and/or service project type). */
export function setBookingIntent(intent: BookingIntent): void {
  listeners.forEach((l) => l(intent));
}

/** Subscribe to intent broadcasts; returns an unsubscribe. */
export function onBookingIntent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
