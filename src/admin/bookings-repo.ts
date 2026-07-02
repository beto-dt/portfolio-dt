export type { BookingRecord } from './firebase-client';

export async function loadBookings() {
  const fb = await import('./firebase-client');
  return fb.readBookings();
}

export async function setBookingStatus(id: string, status: string) {
  const fb = await import('./firebase-client');
  return fb.updateBookingStatus(id, status);
}
