// MediaPipe Tasks Vision model loading helpers (Pose + Hands landmarkers).
// Uses the modern @mediapipe/tasks-vision API (PoseLandmarker / HandLandmarker),
// not the legacy @mediapipe/pose | @mediapipe/hands packages.
import {
  FilesetResolver,
  PoseLandmarker,
  HandLandmarker,
  type PoseLandmarkerResult,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision';
import { MAX_POSES_DETECTED, MAX_HANDS_DETECTED } from '@/constants';

const WASM_BASE_URL =
  process.env.NEXT_PUBLIC_MEDIAPIPE_WASM_URL ||
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';

const POSE_MODEL_URL =
  process.env.NEXT_PUBLIC_POSE_MODEL_URL ||
  'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task';

const HAND_MODEL_URL =
  process.env.NEXT_PUBLIC_HAND_MODEL_URL ||
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/latest/hand_landmarker.task';

export type { PoseLandmarkerResult, HandLandmarkerResult };

let visionResolverPromise: ReturnType<typeof FilesetResolver.forVisionTasks> | null = null;

function getVisionResolver() {
  if (!visionResolverPromise) {
    visionResolverPromise = FilesetResolver.forVisionTasks(WASM_BASE_URL);
  }
  return visionResolverPromise;
}

let poseLandmarkerPromise: Promise<PoseLandmarker> | null = null;

/** Lazily creates (and caches) a single shared PoseLandmarker instance. */
export function getPoseLandmarker(): Promise<PoseLandmarker> {
  if (!poseLandmarkerPromise) {
    poseLandmarkerPromise = (async () => {
      const vision = await getVisionResolver();
      const baseConfig = {
        runningMode: 'VIDEO' as const,
        numPoses: MAX_POSES_DETECTED,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      };
      try {
        return await PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: 'GPU' },
          ...baseConfig,
        });
      } catch {
        // Some browsers/devices lack WebGL support for the GPU delegate — fall back to CPU.
        return PoseLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: POSE_MODEL_URL, delegate: 'CPU' },
          ...baseConfig,
        });
      }
    })();
  }
  return poseLandmarkerPromise;
}

let handLandmarkerPromise: Promise<HandLandmarker> | null = null;

/** Lazily creates (and caches) a single shared HandLandmarker instance. */
export function getHandLandmarker(): Promise<HandLandmarker> {
  if (!handLandmarkerPromise) {
    handLandmarkerPromise = (async () => {
      const vision = await getVisionResolver();
      const baseConfig = {
        runningMode: 'VIDEO' as const,
        numHands: MAX_HANDS_DETECTED,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      };
      try {
        return await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate: 'GPU' },
          ...baseConfig,
        });
      } catch {
        return HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: HAND_MODEL_URL, delegate: 'CPU' },
          ...baseConfig,
        });
      }
    })();
  }
  return handLandmarkerPromise;
}

/** Preloads both landmarkers in parallel; call once before starting the camera loop. */
export async function preloadLandmarkers() {
  await Promise.all([getPoseLandmarker(), getHandLandmarker()]);
}

