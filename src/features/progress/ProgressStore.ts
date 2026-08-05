// Single entry point for reading/writing player progress. Swap the backend
// (e.g. to a FirestoreStorageAdapter) by constructing with a different
// StorageAdapter — no other code in the app needs to change.
import type { StorageAdapter } from './StorageAdapter';
import { LocalStorageAdapter } from './StorageAdapter';
import type { PracticeHistoryEntry, Rank, SessionResultInput, UserProgressProfile } from './ProgressTypes';

export const STORAGE_KEY = 'asar:progress:v1';
const MAX_HISTORY = 50;

const EMPTY_PROFILE: UserProgressProfile = {
  totalXP: 0,
  completedSkillIds: [],
  highestAccuracyBySkill: {},
  bestRankBySkill: {},
  practiceHistory: [],
};

const RANK_ORDER: Record<Rank, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };

export class ProgressStore {
  constructor(private readonly adapter: StorageAdapter = new LocalStorageAdapter()) {}

  async getProfile(): Promise<UserProgressProfile> {
    const stored = await this.adapter.getItem<UserProgressProfile>(STORAGE_KEY);
    return stored ?? EMPTY_PROFILE;
  }

  async recordSessionResult(result: SessionResultInput): Promise<UserProgressProfile> {
    const profile = await this.getProfile();

    const totalXP = profile.totalXP + result.xpEarned;

    const completedSkillIds = profile.completedSkillIds.includes(result.skillId)
      ? profile.completedSkillIds
      : [...profile.completedSkillIds, result.skillId];

    const prevBestAccuracy = profile.highestAccuracyBySkill[result.skillId] ?? 0;
    const highestAccuracyBySkill = {
      ...profile.highestAccuracyBySkill,
      [result.skillId]: Math.max(prevBestAccuracy, result.accuracy),
    };

    const prevBestRank = profile.bestRankBySkill[result.skillId];
    const bestRankBySkill = {
      ...profile.bestRankBySkill,
      [result.skillId]:
        !prevBestRank || RANK_ORDER[result.rank] > RANK_ORDER[prevBestRank]
          ? result.rank
          : prevBestRank,
    };

    const entry: PracticeHistoryEntry = {
      skillId: result.skillId,
      skillName: result.skillName,
      anime: result.anime,
      completedAt: new Date().toISOString(),
      accuracy: result.accuracy,
      rank: result.rank,
      xpEarned: result.xpEarned,
      timeMs: result.timeMs,
    };
    const practiceHistory = [entry, ...profile.practiceHistory].slice(0, MAX_HISTORY);

    const nextProfile: UserProgressProfile = {
      totalXP,
      completedSkillIds,
      highestAccuracyBySkill,
      bestRankBySkill,
      practiceHistory,
    };

    await this.adapter.setItem(STORAGE_KEY, nextProfile);
    return nextProfile;
  }

  async reset(): Promise<void> {
    await this.adapter.setItem(STORAGE_KEY, EMPTY_PROFILE);
  }
}

/** Shared singleton so every screen reads/writes the same store without
 * prop-drilling an instance through the tree. */
export const progressStore = new ProgressStore();
