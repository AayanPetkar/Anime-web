// MediaPipe Hands wrapper: 21-point landmark connections, handedness labeling,
// confidence scoring, and closest-pair (nearest-person) selection.
import type { NormalizedLandmark, HandFrame, TrackingState, Handedness } from '@/types';
import { CONFIDENCE_TRACKED, CONFIDENCE_LOW } from '@/constants';

/** Standard 21-point hand skeleton connections (wrist + 4 joints per finger). */
export const HAND_CONNECTIONS: [number, number][] = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [0, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [0, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [0, 17], [17, 18], [18, 19], [19, 20],
  // Palm
  [5, 9], [9, 13], [13, 17],
];

export function confidenceToState(confidence: number): TrackingState {
  if (confidence >= CONFIDENCE_TRACKED) return 'tracked';
  if (confidence >= CONFIDENCE_LOW) return 'low-confidence';
  return 'lost';
}

function boundingBoxArea(landmarks: NormalizedLandmark[]): number {
  let minX = 1, minY = 1, maxX = 0, maxY = 0;
  for (const p of landmarks) {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  }
  return Math.max(0, maxX - minX) * Math.max(0, maxY - minY);
}

interface RawHand {
  landmarks: NormalizedLandmark[];
  handedness: Handedness;
  score: number;
}

/** When multiple people's hands are detected, keep only the closest pair
 * (largest on-screen bounding box) — mirroring the closest-person pose logic —
 * so we track at most one left + one right hand belonging to the nearest person. */
export function selectClosestHands(hands: RawHand[], maxHands = 2): HandFrame[] {
  const ranked = [...hands].sort(
    (a, b) => boundingBoxArea(b.landmarks) - boundingBoxArea(a.landmarks)
  );

  const chosen: HandFrame[] = [];
  const usedHandedness = new Set<Handedness>();

  for (const hand of ranked) {
    if (chosen.length >= maxHands) break;
    if (usedHandedness.has(hand.handedness)) continue; // keep at most one Left + one Right
    usedHandedness.add(hand.handedness);
    chosen.push({
      landmarks: hand.landmarks,
      handedness: hand.handedness,
      confidence: hand.score,
      state: confidenceToState(hand.score),
    });
  }

  return chosen;
}

