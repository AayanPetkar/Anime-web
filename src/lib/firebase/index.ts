// Firebase app/auth/firestore/storage initialization. Credentials come
// exclusively from NEXT_PUBLIC_FIREBASE_* env vars (see .env.local.example)
// — never hardcoded here. Safe to import from client components; Firebase
// JS SDK is browser-first, and initializeApp() is a no-op on the server
// beyond constructing config objects (no network calls happen at import time).
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getStorage, type FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** True once every required env var is present — lets the rest of the app
 * degrade gracefully (e.g. fall back to guest-only/local storage) instead
 * of crashing when Firebase hasn't been configured yet. */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId
);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let firestoreInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

function getApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars — see .env.local.example.'
    );
  }
  if (!app) {
    app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getApp());
  return authInstance;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestoreInstance) firestoreInstance = getFirestore(getApp());
  return firestoreInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storageInstance) storageInstance = getStorage(getApp());
  return storageInstance;
}

export const googleAuthProvider = new GoogleAuthProvider();

