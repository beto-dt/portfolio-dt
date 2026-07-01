import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
  type Unsubscribe,
} from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, type DocumentData } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseConfig } from './firebase-config';

// This is the ONLY module that imports the Firebase SDK at runtime. Everything
// else reaches it via a single dynamic import('./firebase-client'), so the
// Firebase SDK stays in one lazily-loaded chunk and never ships to the public
// routes.

function services() {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return { auth: getAuth(app), db: getFirestore(app) };
}

export async function popupGoogleSignIn(): Promise<User> {
  const { auth } = services();
  const cred = await signInWithPopup(auth, new GoogleAuthProvider());
  return cred.user;
}

export async function firebaseSignOut(): Promise<void> {
  const { auth } = services();
  await signOut(auth);
}

export function watchAuth(callback: (user: User | null) => void): Unsubscribe {
  const { auth } = services();
  return onAuthStateChanged(auth, callback);
}

export async function readContentDoc(locale: string): Promise<DocumentData | undefined> {
  const { db } = services();
  const snap = await getDoc(doc(db, 'content', locale));
  return snap.exists() ? snap.data() : undefined;
}

export async function writeContentSection(locale: string, key: string, value: unknown): Promise<void> {
  const { db } = services();
  await updateDoc(doc(db, 'content', locale), { [key]: value });
}

export async function callPublish(): Promise<{ ok: boolean; actionsUrl: string }> {
  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const functions = getFunctions(app, 'us-central1');
  const result = await httpsCallable(functions, 'publish')();
  return result.data as { ok: boolean; actionsUrl: string };
}

export async function readAnalyticsDoc(): Promise<DocumentData | undefined> {
  const { db } = services();
  const snap = await getDoc(doc(db, 'analytics', 'summary'));
  return snap.exists() ? snap.data() : undefined;
}
