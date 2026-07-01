import type { User } from 'firebase/auth';
import { ADMIN_EMAIL } from './admin-email';

export async function signInWithGoogle(): Promise<User> {
  const { getFirebase } = await import('./firebase-client');
  const { GoogleAuthProvider, signInWithPopup, signOut } = await import('firebase/auth');
  const { auth } = getFirebase();
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  if (cred.user.email !== ADMIN_EMAIL) {
    await signOut(auth);
    throw new Error('No autorizado');
  }
  return cred.user;
}

export async function signOutAdmin(): Promise<void> {
  const { getFirebase } = await import('./firebase-client');
  const { signOut } = await import('firebase/auth');
  await signOut(getFirebase().auth);
}

/** Subscribes to auth changes; only surfaces the user when it is the owner.
 *  Returns the unsubscribe function. */
export async function onAdminAuthChanged(
  callback: (user: User | null) => void,
): Promise<() => void> {
  const { getFirebase } = await import('./firebase-client');
  const { onAuthStateChanged } = await import('firebase/auth');
  return onAuthStateChanged(getFirebase().auth, (user) => {
    callback(user && user.email === ADMIN_EMAIL ? user : null);
  });
}
