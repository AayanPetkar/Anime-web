// Combines PoseMatcher + HandMatcher output into the three numbers the UI
// shows (pose / hand / overall accuracy), smoothed frame-to-frame with an
// exponential moving average so the HUD doesn't flicker on single noisy
// frames, and tracks the session's best accuracy.
import type { PoseMatchResult, HandMatchResult } from '@/types';
import { ACCURACY_SMOOTHING_ALPHA } from '@/constants';

export interface AccuracySnapshot {
  poseAccuracy: number; // 0-1, smoothed
  handAccuracy: number; // 0-1, smoothed
  overallAccuracy: number; // 0-1, smoothed
  bestAccuracy: number; // 0-1, running max of overallAccuracy
}

/**
 * Stateful smoother — one instance per active training step (reset on step
 * change) so a fresh step doesn't inherit the previous step's momentum.
 */
export class AccuracyCalculator {
  private smoothedPose = 0;
  private smoothedHand = 1; // hands default to "not required" = perfect
  private best = 0;
  private initialized = false;

  reset(): void {
    this.smoothedPose = 0;
    this.smoothedHand = 1;
    this.best = 0;
    this.initialized = false;
  }

  /**
   * @param poseResult   output of PoseMatcher.matchPose
   * @param handResult   output of HandMatcher.matchHands
   * @param handsRequired whether this step scores hands at all (if not,
   *                      hand accuracy is excluded from the overall blend)
   */
  update(
    poseResult: PoseMatchResult,
    handResult: HandMatchResult,
    handsRequired: boolean
  ): AccuracySnapshot {
    const alpha = ACCURACY_SMOOTHING_ALPHA;

    if (!this.initialized) {
      this.smoothedPose = poseResult.accuracy;
      this.smoothedHand = handResult.accuracy;
      this.initialized = true;
    } else {
      this.smoothedPose = this.smoothedPose + alpha * (poseResult.accuracy - this.smoothedPose);
      this.smoothedHand = this.smoothedHand + alpha * (handResult.accuracy - this.smoothedHand);
    }

    const overall = handsRequired
      ? this.smoothedPose * 0.6 + this.smoothedHand * 0.4
      : this.smoothedPose;

    this.best = Math.max(this.best, overall);

    return {
      poseAccuracy: this.smoothedPose,
      handAccuracy: this.smoothedHand,
      overallAccuracy: overall,
      bestAccuracy: this.best,
    };
  }
}
