// Compares live MediaPipe pose landmarks against a ReferencePose (JSON) using
// joint angles, limb vectors, and body orientation — never raw pixel/x-y
// positions, so matching is invariant to the user's distance from the camera,
// their height, and where they stand in frame. Works identically for any
// skill's reference data; nothing here is specific to a particular anime.
import type {
  NormalizedLandmark,
  ReferencePose,
  PoseMatchResult,
  JointEvaluation,
  AngleJoint,
  FacingDirection,
} from '@/types';
import { getPoseKeypoints, angleAtPoint, type PoseKeypoints } from '@/features/pose-detection';

/** Which three keypoints form the angle for each scoreable joint (vertex is the middle one). */
const JOINT_TRIPLES: Record<AngleJoint, [keyof PoseKeypoints, keyof PoseKeypoints, keyof PoseKeypoints]> = {
  leftElbow: ['leftShoulder', 'leftElbow', 'leftWrist'],
  rightElbow: ['rightShoulder', 'rightElbow', 'rightWrist'],
  leftShoulder: ['leftHip', 'leftShoulder', 'leftElbow'],
  rightShoulder: ['rightHip', 'rightShoulder', 'rightElbow'],
  leftKnee: ['leftHip', 'leftKnee', 'leftAnkle'],
  rightKnee: ['rightHip', 'rightKnee', 'rightAnkle'],
};

/** Computes every scoreable joint angle (degrees) from a frame's keypoints. */
export function computeJointAngles(points: PoseKeypoints): Record<AngleJoint, number> {
  const result = {} as Record<AngleJoint, number>;
  (Object.keys(JOINT_TRIPLES) as AngleJoint[]).forEach((joint) => {
    const [a, b, c] = JOINT_TRIPLES[joint];
    result[joint] = angleAtPoint(points[a], points[b], points[c]);
  });
  return result;
}

/** Torso lean: angle (degrees) of the neck→spineBase vector from vertical. 0 = upright. */
export function computeTorsoLean(points: PoseKeypoints): number {
  const dx = points.spineBase.x - points.neck.x;
  const dy = points.spineBase.y - points.neck.y;
  const angleFromVertical = Math.atan2(Math.abs(dx), Math.abs(dy)) * (180 / Math.PI);
  return angleFromVertical;
}

/**
 * Rough facing direction from shoulder depth (z) asymmetry. MediaPipe's z is
 * relative depth (more negative ≈ closer to camera), so a shoulder noticeably
 * closer than the other indicates the torso is turned toward that side.
 */
export function computeFacing(points: PoseKeypoints): FacingDirection {
  const dz = points.rightShoulder.z - points.leftShoulder.z;
  const ROTATION_THRESHOLD = 0.08;
  if (dz > ROTATION_THRESHOLD) return 'left'; // right shoulder further back -> turned left
  if (dz < -ROTATION_THRESHOLD) return 'right';
  return 'front';
}

function scoreDeviation(deviation: number, toleranceDeg: number): number {
  if (toleranceDeg <= 0) return deviation === 0 ? 1 : 0;
  return Math.max(0, Math.min(1, 1 - deviation / toleranceDeg));
}

/**
 * Scores a live pose frame against a reference pose. Returns per-joint
 * detail (for coaching feedback) plus an aggregate 0-1 body accuracy.
 */
export function matchPose(
  landmarks: NormalizedLandmark[],
  reference: ReferencePose
): PoseMatchResult {
  const points = getPoseKeypoints(landmarks);
  const actualAngles = computeJointAngles(points);

  const joints: JointEvaluation[] = (Object.keys(reference.bodyAngles) as AngleJoint[])
    .filter((joint) => reference.bodyAngles[joint] !== undefined)
    .map((joint) => {
      const targetDeg = reference.bodyAngles[joint]!;
      const actualDeg = actualAngles[joint];
      const deviationDeg = Math.abs(actualDeg - targetDeg);
      return {
        joint,
        actualDeg,
        targetDeg,
        deviationDeg,
        score: scoreDeviation(deviationDeg, reference.toleranceDeg),
      };
    });

  let torsoLeanDeviation: number | null = null;
  const scores: number[] = joints.map((j) => j.score);

  if (reference.torsoLean !== undefined) {
    const actualLean = computeTorsoLean(points);
    torsoLeanDeviation = Math.abs(actualLean - reference.torsoLean);
    scores.push(scoreDeviation(torsoLeanDeviation, reference.toleranceDeg));
  }

  let orientationOk: boolean | null = null;
  if (reference.orientation) {
    orientationOk = computeFacing(points) === reference.orientation;
    scores.push(orientationOk ? 1 : 0.4); // partial credit — orientation is a soft signal
  }

  const accuracy = scores.length
    ? scores.reduce((sum, s) => sum + s, 0) / scores.length
    : 0;

  return { accuracy, joints, torsoLeanDeviation, orientationOk };
}
