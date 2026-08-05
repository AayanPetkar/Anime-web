// Composite rank calculation. Every weight and threshold lives here — the
// single source of truth for how S/A/B/C/D is decided — so nothing else
// (summary UI, persistence) duplicates this math.
import type { Rank, RankInput } from './ProgressTypes';

const RANK_THRESHOLDS: { rank: Rank; min: number }[] = [
  { rank: 'S', min: 92 },
  { rank: 'A', min: 82 },
  { rank: 'B', min: 68 },
  { rank: 'C', min: 50 },
  { rank: 'D', min: 0 },
];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export interface RankResult {
  rank: Rank;
  score: number;
}

/**
 * Blends four signals into one 0-100 score, then maps it to a letter rank:
 * - accuracy (50%): how closely poses matched the reference throughout
 * - tracking stability (20%): fraction of the session without a mistake flag
 * - pace (15%): completion time vs. an expected baseline for the skill
 * - corrections (15%): fewer live coaching corrections = cleaner run
 */
export function computeRank(input: RankInput): RankResult {
  const accuracyScore = clamp(input.accuracy, 0, 100);
  const stabilityScore = clamp(input.stability * 100, 0, 100);

  const paceRatio = input.expectedTimeMs > 0 ? input.completionTimeMs / input.expectedTimeMs : 1;
  const paceScore = clamp(100 - Math.max(0, paceRatio - 1) * 100, 0, 100);

  const correctionScore = clamp(100 - input.corrections * 8, 0, 100);

  const score =
    accuracyScore * 0.5 + stabilityScore * 0.2 + paceScore * 0.15 + correctionScore * 0.15;

  const match = RANK_THRESHOLDS.find((t) => score >= t.min);
  return { rank: match ? match.rank : 'D', score };
}
