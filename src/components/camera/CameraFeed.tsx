'use client';

import { useRef } from 'react';
import { useCamera, useVisionTracking } from '@/hooks';
import type { PoseOverlayHandle, HandOverlayHandle, FPSCounterHandle } from '@/types';
import { PermissionDialog } from './PermissionDialog';
import { PoseOverlay } from './PoseOverlay';
import { HandOverlay } from './HandOverlay';
import { FPSCounter } from './FPSCounter';
import { TrackingStatus } from './TrackingStatus';

interface CameraFeedProps {
  className?: string;
}

/**
 * The full camera training surface: requests webcam permission, starts
 * automatically once granted, mirrors the feed, and overlays the live
 * pose + hand skeletons with FPS/confidence/tracking-status HUD elements.
 */
export function CameraFeed({ className = '' }: CameraFeedProps) {
  const { videoRef, permission, errorMessage, requestCamera } = useCamera(true);

  const poseOverlayRef = useRef<PoseOverlayHandle>(null);
  const handOverlayRef = useRef<HandOverlayHandle>(null);
  const fpsRef = useRef<FPSCounterHandle>(null);

  const { modelsLoading, modelError, personInFrame, trackingState, poseConfidence, handConfidence } =
    useVisionTracking({
      videoRef,
      poseOverlayRef,
      handOverlayRef,
      fpsRef,
      enabled: permission === 'granted',
    });

  return (
    <div
      className={`relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-glow-lg ${className}`}
    >
      {/* Mirrored webcam feed — only the <video> is CSS-mirrored; overlay
          canvases mirror their draw math instead so labels stay legible. */}
      <video
        ref={videoRef}
        playsInline
        muted
        className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
      />

      <PoseOverlay ref={poseOverlayRef} />
      <HandOverlay ref={handOverlayRef} />

      {/* HUD */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 md:p-4">
        <TrackingStatus
          state={trackingState}
          personInFrame={personInFrame}
          poseConfidence={poseConfidence}
          handConfidence={handConfidence}
          modelsLoading={modelsLoading}
        />
        <FPSCounter ref={fpsRef} />
      </div>

      {modelError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/90 p-6 text-center">
          <p className="text-sm text-neon-red">
            Failed to load tracking models: {modelError}
          </p>
        </div>
      )}

      <PermissionDialog
        permission={permission}
        errorMessage={errorMessage}
        onRetry={requestCamera}
      />
    </div>
  );
}
