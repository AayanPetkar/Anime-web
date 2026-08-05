// Converts PoseMatcher/HandMatcher deviations into a single prioritized,
// human-readable coaching line. Entirely generic — phrases are built from
// joint names and deviation direction, never from skill- or anime-specific
// strings, so this works unmodified for any reference pose.
import type {
  PoseMatchResult,
  HandMatchResult,
  ReferencePose,
  JointEvaluation,
  AngleJoint,
} from '@/types';
import { FEEDBACK_STABILITY_FRAMES, FEEDBACK_MIN_DISPLAY_MS } from '@/constants';

interface Candidate {
  key: string;
  message: string;
  severity: number; // 0-1, higher = worse (drives priority)
}

const SIDE_LABEL = { leftElbow: 'left', rightElbow: 'right', leftShoulder: 'left', rightShoulder: 'right', leftKnee: 'left', rightKnee: 'right' } as const satisfies Record<AngleJoint, 'left' | 'right'>;

function jointCandidate(evaluation: JointEvaluation, tolerance: number): Candidate | null {
  if (evaluation.score >= 0.85) return null;
  const side = SIDE_LABEL[evaluation.joint];
  const tooSmall = evaluation.actualDeg < evaluation.targetDeg;
  let message: string;

  if (evaluation.joint.endsWith('Elbow')) {
    message = tooSmall ? `Straighten your ${side} arm a little.` : `Bend your ${side} elbow more.`;
  } else if (evaluation.joint.endsWith('Shoulder')) {
    message = tooSmall ? `Raise your ${side} elbow.` : `Lower your ${side} arm slightly.`;
  } else {
    // Knee
    message = tooSmall ? 'Straighten your legs a little.' : 'Bend your knees slightly.';
  }

  return {
    key: evaluation.joint,
    message,
    severity: 1 - evaluation.score,
  };
}

export class FeedbackEngine {
  private stableKey: string | null = null;
  private stableCount = 0;
  private activeKey: string | null = null;
  private activeMessage: string | null = null;
  private activeSince = 0;

  reset(): void {
    this.stableKey = null;
    this.stableCount = 0;
    this.activeKey = null;
    this.activeMessage = null;
    this.activeSince = 0;
  }

  /**
   * @param now performance.now()-style timestamp, passed in so this stays
   *            pure/testable rather than reading the clock itself.
   */
  evaluate(
    poseResult: PoseMatchResult,
    handResult: HandMatchResult,
    reference: ReferencePose,
    isHolding: boolean,
    now: number
  ): string | null {
    const candidates: Candidate[] = [];

    for (const joint of poseResult.joints) {
      const c = jointCandidate(joint, reference.toleranceDeg);
      if (c) candidates.push(c);
    }

    if (
      poseResult.torsoLeanDeviation !== null &&
      poseResult.torsoLeanDeviation > reference.toleranceDeg * 0.8
    ) {
      candidates.push({
        key: 'torsoLean',
        message: 'Straighten your back.',
        severity: Math.min(1, poseResult.torsoLeanDeviation / (reference.toleranceDeg * 2)),
      });
    }

    if (poseResult.orientationOk === false) {
      const dir = reference.orientation === 'left' ? 'left' : reference.orientation === 'right' ? 'right' : '';
      candidates.push({
        key: 'orientation',
        message: dir ? `Rotate slightly ${dir}.` : 'Face the camera directly.',
        severity: 0.6,
      });
    }

    for (const hand of handResult.hands) {
      if (hand.score >= 0.8) continue;
      if (!hand.present) {
        candidates.push({
          key: `hand-${hand.side}-missing`,
          message: `Move your ${hand.side} hand into view.`,
          severity: 1,
        });
        continue;
      }
      const phrase =
        hand.targetShape === 'open'
          ? 'Spread your fingers.'
          : hand.targetShape === 'fist'
            ? 'Close your hand into a fist.'
            : hand.targetShape === 'cupped'
              ? 'Cup your palms together.'
              : hand.targetShape === 'blade'
                ? 'Press your fingers together, palm flat.'
                : hand.targetShape === 'pointing'
                  ? 'Extend just your index finger.'
                  : `Relax your ${hand.side} hand.`;
      candidates.push({ key: `hand-${hand.side}`, message: phrase, severity: 1 - hand.score });
    }

    candidates.sort((a, b) => b.severity - a.severity);
    const top = candidates[0] ?? null;

    const key = top ? top.key : isHolding ? 'hold' : null;
    const message = top ? top.message : isHolding ? 'Hold this position.' : null;

    if (key === this.stableKey) {
      this.stableCount += 1;
    } else {
      this.stableKey = key;
      this.stableCount = 1;
    }

    const stableEnough = this.stableCount >= FEEDBACK_STABILITY_FRAMES;
    const minDisplayElapsed = now - this.activeSince >= FEEDBACK_MIN_DISPLAY_MS;

    if (stableEnough && key !== this.activeKey && (this.activeKey === null || minDisplayElapsed)) {
      this.activeKey = key;
      this.activeMessage = message;
      this.activeSince = now;
    }

    return this.activeMessage;
  }
}
