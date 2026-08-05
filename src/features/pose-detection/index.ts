// MediaPipe Pose wrapper: joint tracking, elbow/shoulder angle calculations,
// closest-person selection, and confidence/state scoring.
import type { NormalizedLandmark, PoseFrame, TrackingState } from '@/types';
import { CONFIDENCE_TRACKED, CONFIDENCE_LOW } from '@/constants';

/** Indices into MediaPipe's 33-point pose model, limited to the subset we display. */
export const POSE_LANDMARK_INDEX = {
  nose: 0,
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftKnee: 25,
  rightKnee: 26,
  leftAnkle: 27,
  rightAnkle: 28,
} as const;

const REQUIRED_INDICES = Object.values(POSE_LANDMARK_INDEX);

function midpoint(a: NormalizedLandmark, b: NormalizedLandmark): NormalizedLandmark {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
    visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
  };
}

/** Named keypoints used for drawing — includes synthetic "neck"/"spine" points
 * that aren't native pose-model landmarks but are derived from shoulders/hips. */
export interface PoseKeypoints {
  head: NormalizedLandmark;
  neck: NormalizedLandmark;
  leftShoulder: NormalizedLandmark;
  rightShoulder: NormalizedLandmark;
  leftElbow: NormalizedLandmark;
  rightElbow: NormalizedLandmark;
  leftWrist: NormalizedLandmark;
  rightWrist: NormalizedLandmark;
  spineBase: NormalizedLandmark;
  leftHip: NormalizedLandmark;
  rightHip: NormalizedLandmark;
  leftKnee: NormalizedLandmark;
  rightKnee: NormalizedLandmark;
  leftAnkle: NormalizedLandmark;
  rightAnkle: NormalizedLandmark;
}

export function getPoseKeypoints(landmarks: NormalizedLandmark[]): PoseKeypoints {
  const i = POSE_LANDMARK_INDEX;
  const leftShoulder = landmarks[i.leftShoulder];
  const rightShoulder = landmarks[i.rightShoulder];
  const leftHip = landmarks[i.leftHip];
  const rightHip = landmarks[i.rightHip];

  return {
    head: landmarks[i.nose],
    neck: midpoint(leftShoulder, rightShoulder),
    leftShoulder,
    rightShoulder,
    leftElbow: landmarks[i.leftElbow],
    rightElbow: landmarks[i.rightElbow],
    leftWrist: landmarks[i.leftWrist],
    rightWrist: landmarks[i.rightWrist],
    spineBase: midpoint(leftHip, rightHip),
    leftHip,
    rightHip,
    leftKnee: landmarks[i.leftKnee],
    rightKnee: landmarks[i.rightKnee],
    leftAnkle: landmarks[i.leftAnkle],
    rightAnkle: landmarks[i.rightAnkle],
  };
}

/** Skeleton line segments, expressed as pairs of PoseKeypoints keys. */
export const POSE_CONNECTIONS: [keyof PoseKeypoints, keyof PoseKeypoints][] = [
  ['neck', 'head'],
  ['neck', 'leftShoulder'],
  ['neck', 'rightShoulder'],
  ['leftShoulder', 'leftElbow'],
  ['leftElbow', 'leftWrist'],
  ['rightShoulder', 'rightElbow'],
  ['rightElbow', 'rightWrist'],
  ['neck', 'spineBase'],
  ['spineBase', 'leftHip'],
  ['spineBase', 'rightHip'],
  ['leftHip', 'leftKnee'],
  ['leftKnee', 'leftAnkle'],
  ['rightHip', 'rightKnee'],
  ['rightKnee', 'rightAnkle'],
];

/** Average visibility across the keypoints we actually draw (0-1). */
export function computePoseConfidence(landmarks: NormalizedLandmark[]): number {
  const scores = REQUIRED_INDICES.map((idx) => landmarks[idx]?.visibility ?? 0);
  return scores.reduce((sum, v) => sum + v, 0) / scores.length;
}

export function confidenceToState(confidence: number): TrackingState {
  if (confidence >= CONFIDENCE_TRACKED) return 'tracked';
  if (confidence >= CONFIDENCE_LOW) return 'low-confidence';
  return 'lost';
}

/** Rough on-screen bounding-box area for a pose — used as a "closeness" proxy
 * (a person nearer the camera occupies more of the frame). */
function poseBoundingBoxArea(landmarks: NormalizedLandmark[]): number {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const idx of REQUIRED_INDICES) {
    const p = landmarks[idx];
    if (!p) continue;
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
}

/** When multiple people are detected, keep only the one closest to the camera
 * (largest on-screen bounding box) and build its PoseFrame. */
export function selectClosestPose(poses: NormalizedLandmark[][]): PoseFrame | null {
  if (poses.length === 0) return null;

  let best = poses[0];
  let bestArea = poseBoundingBoxArea(best);
  for (let p = 1; p < poses.length; p++) {
    const area = poseBoundingBoxArea(poses[p]);
    if (area > bestArea) {
      best = poses[p];
      bestArea = area;
    }
  }

  const confidence = computePoseConfidence(best);
  return { landmarks: best, confidence, state: confidenceToState(confidence) };
}

/** Angle (degrees) at point b, formed by rays b->a and b->c — used for
 * elbow/shoulder/knee angle checks in the pose-matching step. */
export function angleAtPoint(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  c: NormalizedLandmark
): number {
  const abx = a.x - b.x;
  const aby = a.y - b.y;
  const cbx = c.x - b.x;
  const cby = c.y - b.y;
  const dot = abx * cbx + aby * cby;
  const magAB = Math.hypot(abx, aby);
  const magCB = Math.hypot(cbx, cby);
  if (magAB === 0 || magCB === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / (magAB * magCB)));
  return (Math.acos(cos) * 180) / Math.PI;
}

