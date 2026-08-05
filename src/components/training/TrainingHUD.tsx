'use client';

import { memo } from 'react';
import type { SessionState } from '@/types';
import type { AccentTheme } from '@/types';
import { formatDuration } from '@/lib/utils';

interface TrainingHUDProps {
  session: SessionState;
  accent: AccentTheme;
}

/** Memoized — only re-renders when SessionState's identity changes, which
 * useTrainingSession throttles to ~8/sec (or on meaningful events). */
export const TrainingHUD = memo(function TrainingHUD({ session, accent }: TrainingHUDProps) {
  const {
    currentStep,
    stepIndex,
    totalSteps,
    stepProgress,
    overallProgress,
    poseAccuracy,
    handAccuracy,
    overallAccuracy,
    bestAccuracy,
    sessionTimeMs,
    completedSteps,
  } = session;

  return (
    <div className="glass-panel flex flex-col gap-4 rounded-2xl border border-white/10 p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className={`font-display text-xs font-semibold uppercase tracking-wide ${accent.text}`}>
            Step {stepIndex + 1} of {totalSteps}
          </p>
          <h3 className="mt-1 font-display text-lg font-bold text-white">
            {currentStep ? currentStep.instruction : 'Session complete'}
          </h3>
        </div>
        <span className="font-display text-sm text-muted">
          ⏱ {formatDuration(sessionTimeMs)}
        </span>
      </div>

      {/* Step hold progress */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>Step Progress</span>
          <span>{Math.round(stepProgress * 100)}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={`h-full bg-gradient-to-r ${accent.from} ${accent.to} transition-[width] duration-150`}
            style={{ width: `${stepProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Overall progress */}
      <div>
        <div className="mb-1 flex justify-between text-xs text-muted">
          <span>Overall Progress</span>
          <span>{completedSteps.length}/{totalSteps} steps</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full bg-neon-cyan transition-[width] duration-300"
            style={{ width: `${overallProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Accuracy readouts */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <AccuracyStat label="Pose" value={poseAccuracy} />
        <AccuracyStat label="Hands" value={handAccuracy} />
        <AccuracyStat label="Overall" value={overallAccuracy} highlight />
      </div>

      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-xs text-muted">
        <span>Best Accuracy</span>
        <span className="font-display font-bold text-neon-cyan">{bestAccuracy}%</span>
      </div>
    </div>
  );
});

function AccuracyStat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  const color = value >= 90 ? 'text-neon-cyan' : value >= 60 ? 'text-neon-yellow' : 'text-neon-red';
  return (
    <div className={`rounded-xl border border-white/10 py-3 ${highlight ? 'bg-white/[0.03]' : ''}`}>
      <p className={`font-display text-2xl font-bold ${color}`}>{value}%</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}
