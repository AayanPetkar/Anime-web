// Achievements are computed views over UserProgressProfile (features/progress),
// not a separately persisted collection — the progress blob is the single
// source of truth, so there's nothing to keep in sync and no duplicated logic.
import type { UserProgressProfile } from '@/features/progress';

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export function computeAchievements(profile: UserProgressProfile): Achievement[] {
  const bestAccuracy = Math.max(0, ...Object.values(profile.highestAccuracyBySkill));
  const hasSRank = Object.values(profile.bestRankBySkill).includes('S');

  return [
    {
      id: 'first-steps',
      label: 'First Steps',
      description: 'Complete your first technique.',
      icon: '🥋',
      unlocked: profile.completedSkillIds.length >= 1,
    },
    {
      id: 'technique-collector',
      label: 'Technique Collector',
      description: 'Master 5 different techniques.',
      icon: '📚',
      unlocked: profile.completedSkillIds.length >= 5,
    },
    {
      id: 'grandmaster',
      label: 'Grandmaster',
      description: 'Master 15 different techniques.',
      icon: '🏆',
      unlocked: profile.completedSkillIds.length >= 15,
    },
    {
      id: 's-rank-elite',
      label: 'S-Rank Elite',
      description: 'Earn an S rank on any technique.',
      icon: '⭐',
      unlocked: hasSRank,
    },
    {
      id: 'perfectionist',
      label: 'Perfectionist',
      description: 'Reach 95%+ accuracy on a technique.',
      icon: '🎯',
      unlocked: bestAccuracy >= 95,
    },
    {
      id: 'dedicated',
      label: 'Dedicated',
      description: 'Complete 10 training sessions.',
      icon: '🔥',
      unlocked: profile.practiceHistory.length >= 10,
    },
  ];
}
