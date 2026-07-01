import type { User } from 'firebase/auth'; // type-only: erased at build, no SDK in bundle
import { ADMIN_EMAIL } from './admin-email';

export async function signInWithGoogle(): Promise<User> {
  const fb = await import('./firebase-client');
  const user = await fb.popupGoogleSignIn();
  if (user.email !== ADMIN_EMAIL) {
    await fb.firebaseSignOut();
    throw new Error('No autorizado');
  }
  return user;
}

export async function signOutAdmin(): Promise<void> {
  const fb = await import('./firebase-client');
  await fb.firebaseSignOut();
}

/** Subscribes to auth changes; only surfaces the user when it is the owner.
 *  Returns the unsubscribe function. */
export async function onAdminAuthChanged(
  callback: (user: User | null) => void,
): Promise<() => void> {
  const fb = await import('./firebase-client');
  return fb.watchAuth((user) => {
    callback(user && user.email === ADMIN_EMAIL ? user : null);
  });
}
