type Listener = (model: string) => void;
const listeners = new Set<Listener>();

/** Broadcast the collaboration model the visitor tapped. */
export function setBookingIntent(model: string): void {
  listeners.forEach((l) => l(model));
}

/** Subscribe to intent broadcasts; returns an unsubscribe. */
export function onBookingIntent(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
