// Shared types for the progress/persistence system.

export type Rank = 'S' | 'A' | 'B' | 'C' | 'D';

export interface RankInput {
  /** 0-100 */
  accuracy: number;
  completionTimeMs: number;
  expectedTimeMs: number;
  corrections: number;
  /** 0-1 — fraction of the session with solid tracking (no mistakes flagged). */
  stability: number;
}

export interface PracticeHistoryEntry {
  skillId: string;
  skillName: string;
  anime: string;
  completedAt: string;
  accuracy: number;
  rank: Rank;
  xpEarned: number;
  timeMs: number;
}

export interface UserProgressProfile {
  totalXP: number;
  completedSkillIds: string[];
  highestAccuracyBySkill: Record<string, number>;
  bestRankBySkill: Record<string, Rank>;
  practiceHistory: PracticeHistoryEntry[];
}

export interface SessionResultInput {
  skillId: string;
  skillName: string;
  anime: string;
  accuracy: number;
  rank: Rank;
  xpEarned: number;
  timeMs: number;
}
