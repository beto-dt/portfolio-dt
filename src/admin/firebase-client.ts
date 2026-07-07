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
import { getFirestore, doc, getDoc, setDoc, updateDoc, deleteDoc, collection, getDocs, orderBy, query, serverTimestamp, type DocumentData } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { firebaseConfig } from './firebase-config';
import type { BlogPost, PostComment } from '@/content/posts-types';

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

export type BookingRecord = {
  id: string;
  name: string;
  email: string;
  projectType: string;
  budget: string;
  model: string;
  message: string;
  date: string;
  time: string;
  locale: string;
  status: string;
};

export async function readBookings(): Promise<BookingRecord[]> {
  const { db } = services();
  const snap = await getDocs(query(collection(db, 'bookings'), orderBy('createdAt', 'desc')));
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<BookingRecord, 'id'>) }));
}

export async function updateBookingStatus(id: string, status: string): Promise<void> {
  const { db } = services();
  await updateDoc(doc(db, 'bookings', id), { status });
}

export async function readPosts(): Promise<BlogPost[]> {
  const { db } = services();
  const snap = await getDocs(collection(db, 'posts'));
  return snap.docs.map((d) => {
    const { createdAt: _c, updatedAt: _u, ...rest } = d.data() as DocumentData;
    return { ...rest, slug: d.id } as BlogPost;
  });
}

export async function writePost(post: BlogPost): Promise<void> {
  const { db } = services();
  const ref = doc(db, 'posts', post.slug);
  const existing = await getDoc(ref);
  await setDoc(ref, {
    status: post.status,
    publishedAt: post.publishedAt,
    tags: post.tags,
    es: post.es,
    en: post.en,
    createdAt: existing.exists() ? (existing.data()?.createdAt ?? serverTimestamp()) : serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function deletePostDoc(slug: string): Promise<void> {
  const { db } = services();
  await deleteDoc(doc(db, 'posts', slug));
}

export async function readPendingComments(): Promise<PostComment[]> {
  const { db } = services();
  const snap = await getDocs(query(collection(db, 'comments'), orderBy('createdAt', 'asc')));
  return snap.docs
    .map((d) => {
      const data = d.data() as DocumentData;
      const created = data.createdAt?.toDate ? (data.createdAt.toDate() as Date).toISOString().slice(0, 10) : '';
      return { id: d.id, slug: data.slug as string, name: data.name as string, message: data.message as string, status: data.status as string, createdAt: created };
    })
    .filter((c) => c.status === 'pending')
    .map(({ status: _s, ...rest }) => rest);
}

export async function updateCommentStatus(id: string, status: string): Promise<void> {
  const { db } = services();
  await updateDoc(doc(db, 'comments', id), { status });
}

export async function deleteCommentDoc(id: string): Promise<void> {
  const { db } = services();
  await deleteDoc(doc(db, 'comments', id));
}
