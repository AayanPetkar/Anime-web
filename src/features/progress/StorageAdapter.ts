// Abstract key-value storage contract so the persistence backend
// (localStorage now, Firebase/Firestore later) can be swapped without
// touching ProgressStore or any UI code. Every method is async so a
// network-backed adapter conforms to exactly the same shape as this
// synchronous-under-the-hood localStorage one.
export interface StorageAdapter {
  getItem<T>(key: string): Promise<T | null>;
  setItem<T>(key: string, value: T): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/** Default adapter — browser localStorage, JSON-serialized. SSR-safe (no-ops
 * when `window` isn't available) and fails silently on quota/availability
 * errors (private browsing) rather than throwing into the training UI. */
export class LocalStorageAdapter implements StorageAdapter {
  async getItem<T>(key: string): Promise<T | null> {
    if (typeof window === 'undefined') return null;
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full/unavailable — progress just won't persist this session.
    }
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
  }
}
