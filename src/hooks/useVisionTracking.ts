'use client';

import { useEffect, useRef, useState, type RefObject } from 'react';
import type {
  PoseOverlayHandle,
  HandOverlayHandle,
  FPSCounterHandle,
  TrackingState,
  Handedness,
} from '@/types';
import { getPoseLandmarker, getHandLandmarker } from '@/lib/mediapipe';
import { selectClosestPose } from '@/features/pose-detection';
import { selectClosestHands } from '@/features/hand-tracking';
import { FRAMES_BEFORE_LOST } from '@/constants';

interface UseVisionTrackingArgs {
  videoRef: RefObject<HTMLVideoElement>;
  poseOverlayRef: RefObject<PoseOverlayHandle>;
  handOverlayRef: RefObject<HandOverlayHandle>;
  fpsRef: RefObject<FPSCounterHandle>;
  /** Only run the detection loop once the video stream is actually playing. */
  enabled: boolean;
}

interface VisionTrackingStatus {
  modelsLoading: boolean;
  modelError: string | null;
  personInFrame: boolean;
  trackingState: TrackingState;
  poseConfidence: number;
  handConfidence: number;
}

/**
 * Runs the MediaPipe Tasks Vision detection loop via requestAnimationFrame.
 * Per-frame results are pushed straight into the overlay canvases through
 * imperative refs (no React re-render per frame). React state here only
 * changes on meaningful transitions (tracking lost/regained, model load,
 * confidence bucket change) to keep re-renders to a minimum.
 */
export function useVisionTracking({
  videoRef,
  poseOverlayRef,
  handOverlayRef,
  fpsRef,
  enabled,
}: UseVisionTrackingArgs): VisionTrackingStatus {
  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelError, setModelError] = useState<string | null>(null);
  const [personInFrame, setPersonInFrame] = useState(false);
  const [trackingState, setTrackingState] = useState<TrackingState>('lost');
  const [poseConfidence, setPoseConfidence] = useState(0);
  const [handConfidence, setHandConfidence] = useState(0);

  const rafId = useRef<number | null>(null);
  const missedFrames = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const fpsSamples = useRef<number[]>([]);
  const lastFpsFlush = useRef(performance.now());
  const lastStateRef = useRef<TrackingState>('lost');
  const lastPersonInFrameRef = useRef(false);
  const lastConfidenceReported = useRef({ pose: -1, hand: -1 });

  useEffect(() => {
    let cancelled = false;

    Promise.all([getPoseLandmarker(), getHandLandmarker()])
      .then(() => {
        if (!cancelled) setModelsLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setModelError(
            err instanceof Error ? err.message : 'Failed to load the tracking models.'
          );
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
      // Landmarkers are already created (modelsLoading is false) — this just
      // resolves the cached instances once, not per frame.
      const [poseLandmarker, handLandmarker] = await Promise.all([
        getPoseLandmarker(),
        getHandLandmarker(),
      ]);
      if (!isActive) return;

      const loop = () => {
        if (!isActive) return;
        const video = videoRef.current;

        if (!video || video.readyState < 2) {
          rafId.current = requestAnimationFrame(loop);
          return;
        }

        const now = performance.now();

        try {
          const poseResult = poseLandmarker.detectForVideo(video, now);
          const handResult = handLandmarker.detectForVideo(video, now);

          const poseFrame = selectClosestPose((poseResult.landmarks ?? []) as any);

          const rawHands = (handResult.landmarks ?? []).map((landmarks, i) => ({
            landmarks: landmarks as any,
            handedness:
              (handResult.handedness?.[i]?.[0]?.categoryName as Handedness) ?? 'Right',
            score: handResult.handedness?.[i]?.[0]?.score ?? 0,
          }));
          const handFrames = selectClosestHands(rawHands);

          // Draw straight to canvas — no setState in the hot path.
          poseOverlayRef.current?.draw(poseFrame);
          handOverlayRef.current?.draw(handFrames);

          // "Person left frame" detection with a small grace window to absorb
          // single-frame dropouts (blinking detections) rather than flickering.
          if (poseFrame) {
            missedFrames.current = 0;
          } else {
            missedFrames.current += 1;
          }
          const isPersonPresent = missedFrames.current < FRAMES_BEFORE_LOST;
          if (isPersonPresent !== lastPersonInFrameRef.current) {
            lastPersonInFrameRef.current = isPersonPresent;
            setPersonInFrame(isPersonPresent);
          }

          const nextState: TrackingState = !isPersonPresent
            ? 'lost'
            : poseFrame?.state ?? 'lost';
          if (nextState !== lastStateRef.current) {
            lastStateRef.current = nextState;
            setTrackingState(nextState);
          }

          const roundedPose = Math.round((poseFrame?.confidence ?? 0) * 100);
          const roundedHand = Math.round(
            (handFrames[0]?.confidence ?? handFrames[1]?.confidence ?? 0) * 100
          );
          if (roundedPose !== lastConfidenceReported.current.pose) {
            lastConfidenceReported.current.pose = roundedPose;
            setPoseConfidence(roundedPose);
          }
          if (roundedHand !== lastConfidenceReported.current.hand) {
            lastConfidenceReported.current.hand = roundedHand;
            setHandConfidence(roundedHand);
          }
        } catch {
          // A single bad frame shouldn't crash the loop — skip and retry next tick.
        }

        // FPS bookkeeping (updates the FPSCounter's own DOM node directly, not React state).
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
  }, [enabled, modelsLoading, modelError, videoRef, poseOverlayRef, handOverlayRef, fpsRef]);

  return { modelsLoading, modelError, personInFrame, trackingState, poseConfidence, handConfidence };
}
