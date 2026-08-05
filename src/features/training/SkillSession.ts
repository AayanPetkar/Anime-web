// Orchestrates a single training session for one skill: adapts the catalog
// Skill's JSON steps into engine-facing TrainingSteps, runs pose/hand
// matching + accuracy smoothing + step sequencing + coaching feedback each
// frame, and detects "you're not doing it wrong, something's wrong with
// tracking" situations (person left frame, camera blocked, etc).
//
// This file contains zero skill-specific logic — everything it needs comes
// from the Skill JSON and a `getReferencePose` lookup the caller supplies,
// so adding a new anime/skill never touches this file.
import type {
  Skill,
  TrainingStep,
  ReferencePose,
  SessionState,
  MistakeType,
  NormalizedLandmark,
  Handedness,
  HandFrame,
} from '@/types';
import {
  DEFAULT_HOLD_DURATION_MS,
  DEFAULT_MINIMUM_ACCURACY,
  MULTIPLE_PEOPLE_FRAMES,
  FRAMES_BEFORE_LOST,
} from '@/constants';
import { selectClosestPose } from '@/features/pose-detection';
import { selectClosestHands } from '@/features/hand-tracking';
import { matchPose } from './PoseMatcher';
import { matchHands } from './HandMatcher';
import { AccuracyCalculator } from './AccuracyCalculator';
import { SequenceEngine } from './SequenceEngine';
import { FeedbackEngine } from './FeedbackEngine';

const HAND_KEYWORDS = ['hand', 'palm', 'finger', 'fist', 'grip', 'seal'];

const DIFFICULTY_TUNING: Record<Skill['difficulty'], { minimumAccuracy: number; holdDurationMs: number }> = {
  Beginner: { minimumAccuracy: 0.7, holdDurationMs: 1200 },
  Intermediate: { minimumAccuracy: 0.75, holdDurationMs: 1500 },
  Advanced: { minimumAccuracy: 0.8, holdDurationMs: 1800 },
};

/** Adapts a catalog Skill's SkillStep[] (Step 3 JSON) into the engine's
 * TrainingStep[] shape, filling in scoring defaults the catalog JSON
 * doesn't (and shouldn't have to) carry. Steps advance sequentially by
 * default; `nextStep` is still an explicit field so branching is possible
 * without changing this function. */
export function toTrainingSteps(skill: Skill): TrainingStep[] {
  const tuning = DIFFICULTY_TUNING[skill.difficulty] ?? {
    minimumAccuracy: DEFAULT_MINIMUM_ACCURACY,
    holdDurationMs: DEFAULT_HOLD_DURATION_MS,
  };

  return skill.steps.map((step, i) => ({
    stepId: step.id,
    title: `Step ${step.id}`,
    instruction: step.instruction,
    requiredPose: step.pose,
    requiredHands: HAND_KEYWORDS.some((kw) => step.instruction.toLowerCase().includes(kw)),
    holdDurationMs: tuning.holdDurationMs,
    minimumAccuracy: tuning.minimumAccuracy,
    nextStep: i + 1 < skill.steps.length ? skill.steps[i + 1].id : null,
  }));
}

const MISTAKE_MESSAGES: Record<MistakeType, string> = {
  'person-left-frame': 'Step back into frame to continue.',
  'hands-not-visible': 'Show both hands to the camera.',
  'multiple-people': 'Only one person should be in frame right now.',
  'camera-blocked': 'Your camera view looks blocked — check for obstructions.',
  'tracking-lost': 'Tracking lost — hold still in a well-lit area.',
  'low-confidence': 'Move somewhere brighter for more reliable tracking.',
};

/** Mistakes serious enough that we pause scoring entirely this frame. */
const BLOCKING_MISTAKES: MistakeType[] = [
  'person-left-frame',
  'tracking-lost',
  'camera-blocked',
  'multiple-people',
];

export interface SkillSessionFrameInput {
  /** All raw detected poses this frame (before closest-person selection) —
   * needed so the session itself can flag "multiple people". */
  poses: NormalizedLandmark[][];
  rawHands: { landmarks: NormalizedLandmark[]; handedness: Handedness; score: number }[];
  cameraBlocked: boolean;
  now: number;
}

export class SkillSession {
  private readonly steps: TrainingStep[];
  private readonly sequence: SequenceEngine;
  private readonly accuracy = new AccuracyCalculator();
  private readonly feedback = new FeedbackEngine();
  private readonly getReferencePose: (id: string) => ReferencePose | undefined;

  private startedAt: number | null = null;
  private missedPoseFrames = 0;
  private multiplePeopleFrames = 0;
  private state: SessionState;

  constructor(skill: Skill, getReferencePose: (id: string) => ReferencePose | undefined) {
    this.steps = toTrainingSteps(skill);
    this.getReferencePose = getReferencePose;
    this.sequence = new SequenceEngine(this.steps);
    this.state = this.buildIdleState();
  }

  private buildIdleState(): SessionState {
    return {
      currentStep: this.steps[0] ?? null,
      stepIndex: 0,
      totalSteps: this.steps.length,
      stepProgress: 0,
      overallProgress: 0,
      poseAccuracy: 0,
      handAccuracy: 0,
      overallAccuracy: 0,
      bestAccuracy: 0,
      sessionTimeMs: 0,
      completedSteps: [],
      feedback: null,
      mistake: null,
      lastStepGrade: null,
      isSessionComplete: false,
    };
  }

  get currentState(): SessionState {
    return this.state;
  }

  reset(): void {
    this.sequence.reset();
    this.accuracy.reset();
    this.feedback.reset();
    this.startedAt = null;
    this.missedPoseFrames = 0;
    this.multiplePeopleFrames = 0;
    this.state = this.buildIdleState();
  }

  /** Call once per detection frame (~every rAF tick). */
  evaluateFrame(input: SkillSessionFrameInput): SessionState {
    if (this.startedAt === null) this.startedAt = input.now;
    const sessionTimeMs = input.now - this.startedAt;

    if (this.sequence.isComplete) {
      this.state = { ...this.state, currentStep: null, isSessionComplete: true, mistake: null, feedback: null, sessionTimeMs };
      return this.state;
    }

    const step = this.sequence.currentStep!;

    // --- Mistake detection (order = priority) ---
    let mistake: MistakeType | null = null;

    if (input.cameraBlocked) {
      mistake = 'camera-blocked';
    } else if (input.poses.length > 1) {
      this.multiplePeopleFrames += 1;
      if (this.multiplePeopleFrames >= MULTIPLE_PEOPLE_FRAMES) mistake = 'multiple-people';
    } else {
      this.multiplePeopleFrames = 0;
    }

    const poseFrame = mistake ? null : selectClosestPose(input.poses);

    if (!mistake) {
      if (!poseFrame) {
        this.missedPoseFrames += 1;
        if (this.missedPoseFrames >= FRAMES_BEFORE_LOST) mistake = 'person-left-frame';
      } else {
        this.missedPoseFrames = 0;
        if (poseFrame.state === 'lost') mistake = 'tracking-lost';
      }
    }

    if (mistake && BLOCKING_MISTAKES.includes(mistake)) {
      this.state = { ...this.state, mistake, feedback: MISTAKE_MESSAGES[mistake], sessionTimeMs };
      return this.state;
    }

    // poseFrame is guaranteed non-null past this point (no blocking mistake was raised).
    const handFrames: HandFrame[] = selectClosestHands(input.rawHands);

    let softMistake: MistakeType | null = null;
    if (poseFrame!.state === 'low-confidence') softMistake = 'low-confidence';
    if (step.requiredHands && handFrames.length === 0) softMistake = 'hands-not-visible';

    const reference = this.getReferencePose(step.requiredPose);
    if (!reference) {
      // No reference data shipped for this pose yet — degrade gracefully
      // (freeze on the step with a clear message) rather than crashing.
      this.state = {
        ...this.state,
        mistake: null,
        feedback: 'Reference data for this step isn\u2019t available yet.',
        sessionTimeMs,
      };
      return this.state;
    }

    const poseResult = matchPose(poseFrame!.landmarks, reference);
    const handResult = matchHands(handFrames, step.requiredHands ? reference.hands : undefined);
    const snapshot = this.accuracy.update(poseResult, handResult, step.requiredHands);
    const tick = this.sequence.update(snapshot.overallAccuracy, input.now);
    const isHolding = tick.stepProgress > 0 && tick.stepProgress < 1;
    const feedbackMessage = softMistake
      ? MISTAKE_MESSAGES[softMistake]
      : this.feedback.evaluate(poseResult, handResult, reference, isHolding, input.now);

    if (tick.justCompleted) {
      this.accuracy.reset();
      this.feedback.reset();
    }

    const nextStep = this.sequence.currentStep;
    const isSessionComplete = this.sequence.isComplete;

    this.state = {
      currentStep: nextStep,
      stepIndex: this.sequence.stepIndex,
      totalSteps: this.sequence.totalSteps,
      stepProgress: isSessionComplete ? 1 : tick.stepProgress,
      overallProgress: this.sequence.completedSteps.length / Math.max(1, this.sequence.totalSteps),
      poseAccuracy: Math.round(snapshot.poseAccuracy * 100),
      handAccuracy: Math.round(snapshot.handAccuracy * 100),
      overallAccuracy: Math.round(snapshot.overallAccuracy * 100),
      bestAccuracy: Math.round(snapshot.bestAccuracy * 100),
      sessionTimeMs,
      completedSteps: this.sequence.completedSteps,
      feedback: feedbackMessage,
      mistake: softMistake,
      lastStepGrade: tick.justCompleted?.grade ?? this.state.lastStepGrade,
      isSessionComplete,
    };

    return this.state;
  }
}
