// Firestore-backed implementation of the same StorageAdapter interface
// LocalStorageAdapter implements (see ./StorageAdapter.ts, untouched). Every
// key is stored as a field on a single per-user document, so ProgressStore's
// single-blob read/write pattern maps 1:1 onto Firestore with zero changes
// to ProgressStore itself.
import { doc, getDoc, setDoc, deleteField, type Firestore } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/lib/firebase';
import type { StorageAdapter } from './StorageAdapter';

const COLLECTION = 'progress';

export class FirebaseStorageAdapter implements StorageAdapter {
  private readonly uid: string;
  private readonly db: Firestore;

  constructor(uid: string) {
    this.uid = uid;
    this.db = getFirebaseFirestore();
  }

  private docRef() {
    return doc(this.db, COLLECTION, this.uid);
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const snap = await getDoc(this.docRef());
      if (!snap.exists()) return null;
      const data = snap.data();
      return key in data ? (data[key] as T) : null;
    } catch {
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    await setDoc(this.docRef(), { [key]: value, updatedAt: Date.now() }, { merge: true });
  }

  async removeItem(key: string): Promise<void> {
    await setDoc(this.docRef(), { [key]: deleteField() }, { merge: true });
  }
}
