'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Skill, AccentTheme, PoseOverlayHandle, HandOverlayHandle, FPSCounterHandle } from '@/types';
import { useCamera } from '@/hooks/useCamera';
import { useTrainingSession } from '@/hooks/useTrainingSession';
import { useSessionTelemetry } from '@/hooks/useSessionTelemetry';
import { PermissionDialog, PoseOverlay, HandOverlay, FPSCounter, TrackingStatus } from '@/components/camera';
import { EffectStage } from '@/components/effects';
import { TrainingHUD } from './TrainingHUD';
import { FeedbackToast } from './FeedbackToast';
import { MistakeBanner } from './MistakeBanner';
import { StepCompleteToast } from './StepCompleteToast';
import { TrainingSummary } from './TrainingSummary';
import { allSkills } from '@/data/skills';
import { getEffectPreset, getFinalePreset } from '@/data/effectPresets';
import { getChargeTier, applyChargeTier, CHARGE_START_ACCURACY } from '@/lib/utils';
import { computeRank, getActiveProgressStore } from '@/features/progress';
import { useAuth } from '@/hooks/useAuth';
import { ProfileService } from '@/features/profile';
import { EXPECTED_TIME_PER_STEP_MS } from '@/constants';

interface TrainingSessionViewProps {
  skill: Skill;
  accent: AccentTheme;
}

export function TrainingSessionView({ skill, accent }: TrainingSessionViewProps) {
  const router = useRouter();
  const { status: authStatus, user } = useAuth();
  const { videoRef, permission, errorMessage, requestCamera } = useCamera(true);

  const poseOverlayRef = useRef<PoseOverlayHandle>(null);
  const handOverlayRef = useRef<HandOverlayHandle>(null);
  const fpsRef = useRef<FPSCounterHandle>(null);

  const { session, modelsLoading, modelError, restart } = useTrainingSession({
    skill,
    videoRef,
    poseOverlayRef,
    handOverlayRef,
    fpsRef,
    enabled: permission === 'granted',
  });

  const trackingState =
    session.mistake === 'tracking-lost'
      ? 'lost'
      : session.mistake === 'low-confidence'
        ? 'low-confidence'
        : 'tracked';

  // --- Effect Engine wiring — every input below is derived from the
  // existing SessionState (no new fields duplicating what SkillSession
  // already tracks). `retryCount` is the one genuinely new bit of state:
  // it doesn't exist anywhere in SessionState (there's no "how many times
  // has the user restarted" field), so it can't be derived from it.
  const [retryCount, setRetryCount] = useState(0);
  const hasRecordedRef = useRef(false);

  const basePreset = useMemo(() => getEffectPreset(skill), [skill]);
  const finalePreset = useMemo(() => getFinalePreset(skill), [skill]);
  const chargeTier = getChargeTier(session.overallAccuracy);
  const activePreset = useMemo(
    () => (session.isSessionComplete ? finalePreset : applyChargeTier(basePreset, chargeTier)),
    [session.isSessionComplete, finalePreset, basePreset, chargeTier]
  );
  const charging = !session.isSessionComplete && session.overallAccuracy >= CHARGE_START_ACCURACY;
  // Reusing completedSteps.length directly as the completion trigger — it
  // already increments exactly once per step (including the final one),
  // so no separate "did a step just complete" flag is needed.
  const completionSignal = session.completedSteps.length;

  const telemetry = useSessionTelemetry(session, `${skill.id}:${retryCount}`);

  const overallAccuracy = useMemo(() => {
    if (session.completedSteps.length === 0) return session.overallAccuracy;
    const sum = session.completedSteps.reduce((s, step) => s + step.accuracyAtCompletion * 100, 0);
    return sum / session.completedSteps.length;
  }, [session.completedSteps, session.overallAccuracy]);

  const rank = useMemo(
    () =>
      computeRank({
        accuracy: overallAccuracy,
        completionTimeMs: session.sessionTimeMs,
        expectedTimeMs: skill.steps.length * EXPECTED_TIME_PER_STEP_MS,
        corrections: telemetry.corrections,
        stability: telemetry.stability,
      }),
    [overallAccuracy, session.sessionTimeMs, skill.steps.length, telemetry.corrections, telemetry.stability]
  );

  // Persist exactly once per completed session.
  useEffect(() => {
    if (!session.isSessionComplete || hasRecordedRef.current) return;
    hasRecordedRef.current = true;
    getActiveProgressStore().recordSessionResult({
      skillId: skill.id,
      skillName: skill.name,
      anime: skill.anime,
      accuracy: overallAccuracy,
      rank: rank.rank,
      xpEarned: skill.xpReward,
      timeMs: session.sessionTimeMs,
    });
    if (authStatus === 'signed-in' && user) {
      ProfileService.recordPracticeToday(user.uid);
    }
  }, [session.isSessionComplete, session.sessionTimeMs, overallAccuracy, rank.rank, skill, authStatus, user]);

  const handleRetry = () => {
    hasRecordedRef.current = false;
    setRetryCount((n) => n + 1);
    restart();
  };

  const handleNextSkill = () => {
    const currentIndex = allSkills.findIndex((s) => s.id === skill.id);
    const next = allSkills[(currentIndex + 1) % allSkills.length];
    router.push(`/training/${next.id}`);
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-glow-lg">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 h-full w-full scale-x-[-1] object-cover"
        />

        <PoseOverlay ref={poseOverlayRef} />
        <HandOverlay ref={handOverlayRef} />

        <EffectStage
          preset={activePreset}
          charging={charging}
          completionSignal={completionSignal}
          skillName={skill.name}
          xpGained={skill.xpReward}
        />

        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 md:p-4">
          <TrackingStatus
            state={trackingState}
            personInFrame={session.mistake !== 'person-left-frame'}
            poseConfidence={session.poseAccuracy}
            handConfidence={session.handAccuracy}
            modelsLoading={modelsLoading}
          />
          <FPSCounter ref={fpsRef} />
        </div>

        <MistakeBanner mistake={session.mistake} message={session.mistake ? session.feedback : null} />
        <StepCompleteToast completionCount={session.completedSteps.length} grade={session.lastStepGrade} />
        <FeedbackToast message={!session.mistake ? session.feedback : null} />

        {modelError && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/90 p-6 text-center">
            <p className="text-sm text-neon-red">Failed to load tracking models: {modelError}</p>
          </div>
        )}

        <PermissionDialog permission={permission} errorMessage={errorMessage} onRetry={requestCamera} />

        {session.isSessionComplete && (
          <TrainingSummary
            skill={skill}
            session={session}
            rank={rank}
            overallAccuracy={overallAccuracy}
            accent={accent}
            onRetry={handleRetry}
            onNextSkill={handleNextSkill}
          />
        )}
      </div>

      <TrainingHUD session={session} accent={accent} />
    </div>
  );
}
