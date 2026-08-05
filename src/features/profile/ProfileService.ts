// Firestore-backed account/profile CRUD (the `users` collection) plus
// avatar upload to Firebase Storage. Distinct from ProgressStore, which
// owns the `progress` collection (XP/skills/ranks) — this is identity and
// settings data.
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirebaseFirestore, getFirebaseStorage } from '@/lib/firebase';
import { DEFAULT_SETTINGS, type UserProfileDoc, type UserSettings } from './ProfileTypes';

const COLLECTION = 'users';
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function profileRef(uid: string) {
  return doc(getFirebaseFirestore(), COLLECTION, uid);
}

export const ProfileService = {
  async getProfile(uid: string): Promise<UserProfileDoc | null> {
    const snap = await getDoc(profileRef(uid));
    return snap.exists() ? (snap.data() as UserProfileDoc) : null;
  },

  async ensureProfile(uid: string, defaults: { username: string; email: string | null }): Promise<UserProfileDoc> {
    const existing = await this.getProfile(uid);
    if (existing) return existing;

    const profile: UserProfileDoc = {
      uid,
      username: defaults.username,
      displayName: defaults.username,
      email: defaults.email,
      avatarURL: null,
      avatarPresetId: 'blaze',
      favoriteAnime: null,
      settings: DEFAULT_SETTINGS,
      streakCount: 0,
      lastPracticeDate: null,
      createdAt: new Date().toISOString(),
    };
    await setDoc(profileRef(uid), { ...profile, createdAt: serverTimestamp() });
    return profile;
  },

  async updateProfile(uid: string, patch: Partial<UserProfileDoc>): Promise<void> {
    await setDoc(profileRef(uid), patch, { merge: true });
  },

  async updateSettings(uid: string, settings: Partial<UserSettings>): Promise<void> {
    const current = await this.getProfile(uid);
    await setDoc(
      profileRef(uid),
      { settings: { ...DEFAULT_SETTINGS, ...current?.settings, ...settings } },
      { merge: true }
    );
  },

  async uploadAvatar(uid: string, file: File): Promise<string> {
    if (file.size > MAX_AVATAR_BYTES) {
      throw new Error('Image is too large — please choose a file under 5MB.');
    }
    if (!file.type.startsWith('image/')) {
      throw new Error('Please choose an image file.');
    }
    const avatarRef = ref(getFirebaseStorage(), `avatars/${uid}/${Date.now()}-${file.name}`);
    await uploadBytes(avatarRef, file);
    const url = await getDownloadURL(avatarRef);
    await this.updateProfile(uid, { avatarURL: url, avatarPresetId: null });
    return url;
  },

  /**
   * Bumps the daily streak: increments if the last practice day was
   * yesterday, keeps it if it was already today, resets to 1 otherwise.
   * Call this once when a training session completes.
   */
  async recordPracticeToday(uid: string): Promise<number> {
    const profile = await this.getProfile(uid);
    const today = new Date().toISOString().slice(0, 10);

    if (profile?.lastPracticeDate === today) return profile.streakCount;

    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const continuesStreak = profile?.lastPracticeDate === yesterday;
    const nextStreak = continuesStreak ? (profile?.streakCount ?? 0) + 1 : 1;

    await setDoc(profileRef(uid), { streakCount: nextStreak, lastPracticeDate: today }, { merge: true });
    return nextStreak;
  },
};
