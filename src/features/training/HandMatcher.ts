// Classifies a hand's shape from its 21 landmarks using finger curl and
// spread — normalized, distance-based metrics — and scores it against the
// shape a step's reference pose requires. Generic across any skill.
import type { NormalizedLandmark, HandFrame, HandShape, HandMatchResult, HandEvaluation } from '@/types';

const FINGERTIPS = { index: 8, middle: 12, ring: 16, pinky: 20 } as const;
const MCP = { index: 5, middle: 9, ring: 13, pinky: 17 } as const;
const WRIST = 0;
const THUMB_TIP = 4;

function dist(a: NormalizedLandmark, b: NormalizedLandmark): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

/** 0 (fully curled) .. ~1.3 (fully extended), normalized by palm size so it's scale-invariant. */
function fingerExtension(landmarks: NormalizedLandmark[]): number {
  const tipEntries = Object.entries(FINGERTIPS) as [keyof typeof FINGERTIPS, number][];
  const ratios = tipEntries.map(([name, tipIdx]) => {
    const mcpIdx = MCP[name];
    const mcpDist = dist(landmarks[WRIST], landmarks[mcpIdx]) || 0.001;
    return dist(landmarks[WRIST], landmarks[tipIdx]) / mcpDist - 1;
  });
  const avg = ratios.reduce((s, v) => s + v, 0) / ratios.length;
  return Math.max(0, avg);
}

/** 0 (fingers together) .. ~1 (fingers fanned wide), via pairwise fingertip distance. */
function fingerSpread(landmarks: NormalizedLandmark[]): number {
  const tips = Object.values(FINGERTIPS).map((i) => landmarks[i]);
  const palmSize = dist(landmarks[WRIST], landmarks[MCP.middle]) || 0.001;
  let total = 0;
  for (let i = 0; i < tips.length - 1; i++) {
    total += dist(tips[i], tips[i + 1]) / palmSize;
  }
  return total / (tips.length - 1);
}

function thumbTucked(landmarks: NormalizedLandmark[]): boolean {
  const palmSize = dist(landmarks[WRIST], landmarks[MCP.middle]) || 0.001;
  return dist(landmarks[THUMB_TIP], landmarks[MCP.index]) / palmSize < 0.55;
}

export interface HandMetrics {
  extension: number;
  spread: number;
  thumbTucked: boolean;
}

export function computeHandMetrics(landmarks: NormalizedLandmark[]): HandMetrics {
  return {
    extension: fingerExtension(landmarks),
    spread: fingerSpread(landmarks),
    thumbTucked: thumbTucked(landmarks),
  };
}

/** Best-guess shape classification from raw curl/spread metrics. */
export function classifyHandShape(metrics: HandMetrics): HandShape {
  const { extension, spread, thumbTucked: tucked } = metrics;

  if (extension < 0.35 && tucked) return 'fist';
  if (extension >= 0.35 && extension < 0.7 && spread < 0.45) return 'cupped';
  if (extension >= 0.7 && spread < 0.35) return 'blade';
  if (extension >= 0.7 && spread >= 0.35) return 'open';
  if (extension >= 0.55 && spread < 0.3) return 'pointing';
  return 'relaxed';
}

/** How "close" two shape archetypes are (1 = same, 0 = opposite) — used to
 * give partial credit instead of a harsh binary right/wrong. */
const SHAPE_DISTANCE: Record<HandShape, Partial<Record<HandShape, number>>> = {
  fist: { fist: 1, cupped: 0.4, relaxed: 0.3, blade: 0.15, open: 0.05, pointing: 0.25 },
  cupped: { cupped: 1, fist: 0.4, relaxed: 0.5, blade: 0.4, open: 0.3, pointing: 0.3 },
  blade: { blade: 1, open: 0.6, cupped: 0.4, pointing: 0.45, relaxed: 0.3, fist: 0.15 },
  open: { open: 1, blade: 0.6, cupped: 0.3, pointing: 0.4, relaxed: 0.45, fist: 0.05 },
  pointing: { pointing: 1, blade: 0.45, open: 0.4, cupped: 0.3, relaxed: 0.3, fist: 0.25 },
  relaxed: { relaxed: 1, cupped: 0.5, open: 0.45, blade: 0.3, pointing: 0.3, fist: 0.3 },
};

function shapeScore(target: HandShape, detected: HandShape): number {
  return SHAPE_DISTANCE[target]?.[detected] ?? 0.2;
}

/**
 * Scores each required hand (left/right) against the shape the reference
 * pose asks for. A hand the pose doesn't require is skipped entirely.
 */
export function matchHands(
  detectedHands: HandFrame[],
  required: { left?: HandShape; right?: HandShape } | undefined
): HandMatchResult {
  if (!required || (!required.left && !required.right)) {
    return { accuracy: 1, hands: [] };
  }

  const bySide = (side: 'Left' | 'Right') =>
    detectedHands.find((h) => h.handedness === side);

  const evaluations: HandEvaluation[] = [];

  (['left', 'right'] as const).forEach((side) => {
    const targetShape = required[side];
    if (!targetShape) return;

    const detected = bySide(side === 'left' ? 'Left' : 'Right');
    if (!detected) {
      evaluations.push({ side, targetShape, detectedShape: null, score: 0, present: false });
      return;
    }

    const metrics = computeHandMetrics(detected.landmarks);
    const detectedShape = classifyHandShape(metrics);
    evaluations.push({
      side,
      targetShape,
      detectedShape,
      score: shapeScore(targetShape, detectedShape),
      present: true,
    });
  });

  const accuracy = evaluations.length
    ? evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length
    : 1;

  return { accuracy, hands: evaluations };
}
