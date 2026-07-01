import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { firebaseConfig } from './firebase-config';

type FirebaseBundle = { app: FirebaseApp; auth: Auth; db: Firestore };

let cached: FirebaseBundle | null = null;

/** Initializes Firebase once. Only reached via dynamic import() from the admin
 *  code, so the public route bundle never pulls the Firebase SDK. */
export function getFirebase(): FirebaseBundle {
  if (cached) return cached;
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  cached = { app, auth: getAuth(app), db: getFirestore(app) };
  return cached;
}
