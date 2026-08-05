'use client';

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import type {
  Skill,
  PoseOverlayHandle,
  HandOverlayHandle,
  FPSCounterHandle,
  SessionState,
  Handedness,
} from '@/types';
import { getPoseLandmarker, getHandLandmarker } from '@/lib/mediapipe';
import { selectClosestPose } from '@/features/pose-detection';
import { selectClosestHands } from '@/features/hand-tracking';
import { SkillSession } from '@/features/training';
import { getReferencePose } from '@/data/poses';

interface UseTrainingSessionArgs {
  skill: Skill;
  videoRef: RefObject<HTMLVideoElement>;
  poseOverlayRef: RefObject<PoseOverlayHandle>;
  handOverlayRef: RefObject<HandOverlayHandle>;
  fpsRef: RefObject<FPSCounterHandle>;
  enabled: boolean;
}

interface UseTrainingSessionResult {
  session: SessionState;
  modelsLoading: boolean;
  modelError: string | null;
  restart: () => void;
}

const UI_FLUSH_INTERVAL_MS = 120;
const BLOCK_CHECK_INTERVAL_MS = 400;
const BLOCK_CHECK_SIZE = 16;

/**
 * Runs a self-contained rAF detection loop (separate from useVisionTracking
 * in Step 4, left untouched) that feeds every frame into a SkillSession and
 * drives the pose/hand overlay canvases imperatively — same "no per-frame
 * setState" discipline as Step 4's camera loop, throttled to ~8 UI updates/
 * second since the numeric HUD doesn't need 60.
 */
export function useTrainingSession({
  skill,
  videoRef,
  poseOverlayRef,
  handOverlayRef,
  fpsRef,
  enabled,
}: UseTrainingSessionArgs): UseTrainingSessionResult {
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);

  const sessionRef = useRef<SkillSession | null>(null);
  const lastPushedState = useRef<SessionState | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>(() => {
    sessionRef.current = new SkillSession(skill, getReferencePose);
    return sessionRef.current.currentState;
  });

  const rafId = useRef<number | null>(null);
  const blockCanvas = useRef<HTMLCanvasElement | null>(null);
  const lastBlockCheck = useRef(0);
  const cameraBlockedRef = useRef(false);
  const lastUiFlush = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const fpsSamples = useRef<number[]>([]);
  const lastFpsFlush = useRef(performance.now());

  // Recreate the session whenever the skill changes.
  useEffect(() => {
    sessionRef.current = new SkillSession(skill, getReferencePose);
    lastPushedState.current = null;
    setSessionState(sessionRef.current.currentState);
  }, [skill]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getPoseLandmarker(), getHandLandmarker()])
      .then(() => {
        if (!cancelled) setModelsLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setModelError(err instanceof Error ? err.message : 'Failed to load tracking models.');
          setModelsLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!enabled || modelsLoading || modelError) return;
    let isActive = true;

    const run = async () => {
      const [poseLandmarker, handLandmarker] = await Promise.all([
        getPoseLandmarker(),
        getHandLandmarker(),
      ]);
      if (!isActive) return;

      const loop = () => {
        if (!isActive) return;
        const video = videoRef.current;
        const session = sessionRef.current;

        if (!video || video.readyState < 2 || !session) {
          rafId.current = requestAnimationFrame(loop);
          return;
        }

        const now = performance.now();

        try {
          const poseResult = poseLandmarker.detectForVideo(video, now);
          const handResult = handLandmarker.detectForVideo(video, now);

          const poses = (poseResult.landmarks ?? []) as any[];
          const rawHands = (handResult.landmarks ?? []).map((landmarks, i) => ({
            landmarks: landmarks as any,
            handedness:
              (handResult.handedness?.[i]?.[0]?.categoryName as Handedness) ?? 'Right',
            score: handResult.handedness?.[i]?.[0]?.score ?? 0,
          }));

          if (now - lastBlockCheck.current > BLOCK_CHECK_INTERVAL_MS) {
            lastBlockCheck.current = now;
            cameraBlockedRef.current = detectCameraBlocked(video, blockCanvas);
          }

          const next = session.evaluateFrame({
            poses,
            rawHands,
            cameraBlocked: cameraBlockedRef.current,
            now,
          });

          poseOverlayRef.current?.draw(selectClosestPose(poses));
          handOverlayRef.current?.draw(selectClosestHands(rawHands));

          const prev = lastPushedState.current;
          const meaningfulChange =
            !prev ||
            prev.stepIndex !== next.stepIndex ||
            prev.mistake !== next.mistake ||
            prev.isSessionComplete !== next.isSessionComplete ||
            prev.completedSteps.length !== next.completedSteps.length;

          if (meaningfulChange || now - lastUiFlush.current > UI_FLUSH_INTERVAL_MS) {
            lastUiFlush.current = now;
            lastPushedState.current = next;
            setSessionState(next);
          }
        } catch {
          // Skip a bad frame rather than breaking the loop.
        }

        const delta = now - lastFrameTime.current;
        lastFrameTime.current = now;
        if (delta > 0) fpsSamples.current.push(1000 / delta);
        if (now - lastFpsFlush.current > 500) {
          const avg =
            fpsSamples.current.reduce((s, v) => s + v, 0) / (fpsSamples.current.length || 1);
          fpsRef.current?.update(Math.round(avg));
          fpsSamples.current = [];
          lastFpsFlush.current = now;
        }

        rafId.current = requestAnimationFrame(loop);
      };

      rafId.current = requestAnimationFrame(loop);
    };

    run();

    return () => {
      isActive = false;
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [enabled, modelsLoading, modelError, skill, videoRef, poseOverlayRef, handOverlayRef, fpsRef]);

  const restart = useCallback(() => {
    sessionRef.current = new SkillSession(skill, getReferencePose);
    lastPushedState.current = null;
    setSessionState(sessionRef.current.currentState);
  }, [skill]);

  return { session: sessionState, modelsLoading, modelError, restart };
}

/** Downsamples the current video frame and flags it as "blocked" when the
 * image is near-black or near-uniform (a hand/lens cap over the camera). */
function detectCameraBlocked(
  video: HTMLVideoElement,
  canvasHolder: { current: HTMLCanvasElement | null }
): boolean {
  if (!canvasHolder.current) {
    canvasHolder.current = document.createElement('canvas');
    canvasHolder.current.width = BLOCK_CHECK_SIZE;
    canvasHolder.current.height = BLOCK_CHECK_SIZE;
  }
  const canvas = canvasHolder.current;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx || video.videoWidth === 0) return false;

  ctx.drawImage(video, 0, 0, BLOCK_CHECK_SIZE, BLOCK_CHECK_SIZE);
  const { data } = ctx.getImageData(0, 0, BLOCK_CHECK_SIZE, BLOCK_CHECK_SIZE);

  let sum = 0;
  const luminances: number[] = [];
  for (let i = 0; i < data.length; i += 4) {
    const luminance = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    luminances.push(luminance);
    sum += luminance;
  }
  const mean = sum / luminances.length;
  const variance = luminances.reduce((s, v) => s + (v - mean) ** 2, 0) / luminances.length;

  return mean < 10 || variance < 4;
}
