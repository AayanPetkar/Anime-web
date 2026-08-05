'use client';

import { memo } from 'react';
import type { TrackingState } from '@/types';
import { TRACKING_COLORS } from '@/constants';

interface TrackingStatusProps {
  state: TrackingState;
  personInFrame: boolean;
  poseConfidence: number;
  handConfidence: number;
  modelsLoading: boolean;
}

const LABEL: Record<TrackingState, string> = {
  tracked: 'Tracking',
  'low-confidence': 'Low Confidence',
  lost: 'Lost',
};

/**
 * Memoized so it only re-renders when its primitive props actually change —
 * the detection loop only calls the setState behind these on real transitions.
 */
export const TrackingStatus = memo(function TrackingStatus({
  state,
  personInFrame,
  poseConfidence,
  handConfidence,
  modelsLoading,
}: TrackingStatusProps) {
  const color = TRACKING_COLORS[state];

  return (
    <div className="glass-panel flex flex-col gap-2 rounded-xl border border-white/10 px-4 py-3 font-display text-xs">
      <div className="flex items-center gap-2">
        <span
          className="h-2.5 w-2.5 rounded-full transition-colors duration-300"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
        <span className="font-bold uppercase tracking-wide text-white">
          {modelsLoading ? 'Loading Models…' : LABEL[state]}
        </span>
      </div>

      {!modelsLoading && !personInFrame && (
        <p className="text-neon-red/90">Step into frame to begin tracking.</p>
      )}

      {!modelsLoading && personInFrame && (
        <div className="flex gap-4 text-muted">
          <span>
            Pose <span className="font-bold text-white">{poseConfidence}%</span>
          </span>
          <span>
            Hands <span className="font-bold text-white">{handConfidence}%</span>
          </span>
        </div>
      )}
    </div>
  );
});
