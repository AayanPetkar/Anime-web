// Decides which StorageAdapter backs the app's ProgressStore — Local for
// guests, Firebase for signed-in users — and exposes exactly one function
// the rest of the app calls to get "the" progress store. Nothing outside
// this file (and the auth provider that calls setStorageMode) needs to know
// which backend is active, per the spec's "the rest of the app must never
// know which storage is used."
import { ProgressStore, STORAGE_KEY } from './ProgressStore';
import { LocalStorageAdapter } from './StorageAdapter';
import { FirebaseStorageAdapter } from './FirebaseStorageAdapter';
import type { UserProgressProfile } from './ProgressTypes';

export type MergeStrategy = 'merge' | 'replace' | 'discard';

let activeStore: ProgressStore = new ProgressStore(new LocalStorageAdapter());
let activeAdapter: LocalStorageAdapter | FirebaseStorageAdapter = new LocalStorageAdapter();
let activeMode: 'guest' | 'user' = 'guest';

/** The one function the rest of the app should call for progress reads/writes. */
export function getActiveProgressStore(): ProgressStore {
  return activeStore;
}

/** Raw adapter for the rare cases that need it directly (Settings' Export/Import). */
export function getActiveStorageAdapter(): LocalStorageAdapter | FirebaseStorageAdapter {
  return activeAdapter;
}

export function getActiveStorageMode(): 'guest' | 'user' {
  return activeMode;
}

/** Called by the auth provider whenever sign-in state changes. */
export function setStorageMode(mode: 'guest' | 'user', uid?: string): void {
  activeMode = mode;
  activeAdapter = mode === 'user' && uid ? new FirebaseStorageAdapter(uid) : new LocalStorageAdapter();
  activeStore = new ProgressStore(activeAdapter);
}

function mergeProfiles(local: UserProgressProfile, cloud: UserProgressProfile): UserProgressProfile {
  const completedSkillIds = Array.from(new Set([...cloud.completedSkillIds, ...local.completedSkillIds]));

  const highestAccuracyBySkill = { ...cloud.highestAccuracyBySkill };
  for (const [skillId, accuracy] of Object.entries(local.highestAccuracyBySkill)) {
    highestAccuracyBySkill[skillId] = Math.max(highestAccuracyBySkill[skillId] ?? 0, accuracy);
  }

  const RANK_ORDER: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };
  const bestRankBySkill = { ...cloud.bestRankBySkill };
  for (const [skillId, rank] of Object.entries(local.bestRankBySkill)) {
    const current = bestRankBySkill[skillId];
    if (!current || RANK_ORDER[rank] > RANK_ORDER[current]) bestRankBySkill[skillId] = rank;
  }

  const practiceHistory = [...cloud.practiceHistory, ...local.practiceHistory]
    .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
    .slice(0, 50);

  return {
    totalXP: cloud.totalXP + local.totalXP,
    completedSkillIds,
    highestAccuracyBySkill,
    bestRankBySkill,
    practiceHistory,
  };
}

/**
 * Resolves a guest's local progress against a freshly-signed-in account's
 * cloud progress, per the user's chosen strategy:
 * - "merge": combine both (XP summed, best accuracy/rank kept, history merged)
 * - "replace": overwrite the cloud profile with the local one
 * - "discard": keep the cloud profile, drop local progress
 * Local storage is cleared afterward either way, so the prompt doesn't
 * reappear on the next sign-in.
 */
export async function mergeGuestProgressIntoAccount(
  uid: string,
  strategy: MergeStrategy
): Promise<UserProgressProfile> {
  const localAdapter = new LocalStorageAdapter();
  const firebaseAdapter = new FirebaseStorageAdapter(uid);

  const localStore = new ProgressStore(localAdapter);
  const cloudStore = new ProgressStore(firebaseAdapter);

  const [localProfile, cloudProfile] = await Promise.all([localStore.getProfile(), cloudStore.getProfile()]);

  let finalProfile: UserProgressProfile;
  if (strategy === 'discard') {
    finalProfile = cloudProfile;
  } else if (strategy === 'replace') {
    finalProfile = localProfile;
    await firebaseAdapter.setItem(STORAGE_KEY, finalProfile);
  } else {
    finalProfile = mergeProfiles(localProfile, cloudProfile);
    await firebaseAdapter.setItem(STORAGE_KEY, finalProfile);
  }

  await localAdapter.removeItem(STORAGE_KEY);
  return finalProfile;
}

/** Guests always have *some* local progress, even if it's just the empty
 * default — this checks whether it's worth prompting to merge at all. */
export async function hasLocalProgressToMerge(): Promise<boolean> {
  const localStore = new ProgressStore(new LocalStorageAdapter());
  const profile = await localStore.getProfile();
  return profile.completedSkillIds.length > 0 || profile.totalXP > 0;
}
