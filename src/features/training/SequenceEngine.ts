// Drives step-by-step progression through a skill's TrainingStep[]. Advances
// a step only when live accuracy stays >= minimumAccuracy for holdDurationMs
// continuously. Entirely generic over whatever steps it's given — no
// per-skill branching logic lives here.
import type { TrainingStep, CompletedStepRecord, StepGrade } from '@/types';
import { GRADE_THRESHOLDS } from '@/constants';

export function gradeForAccuracy(accuracy: number): StepGrade {
  const match = GRADE_THRESHOLDS.find((t) => accuracy >= t.min);
  return match ? match.grade : 'Good';
}

export interface SequenceTick {
  stepProgress: number; // 0-1, hold-timer progress toward this step's holdDurationMs
  justCompleted: CompletedStepRecord | null;
}

export class SequenceEngine {
  private steps: TrainingStep[];
  private currentIndex = 0;
  private holdStartTime: number | null = null;
  private holdAccumulatedMs = 0;
  private accuracySum = 0;
  private accuracySamples = 0;
  private completed: CompletedStepRecord[] = [];

  constructor(steps: TrainingStep[]) {
    this.steps = steps;
  }

  get currentStep(): TrainingStep | null {
    return this.steps[this.currentIndex] ?? null;
  }

  get stepIndex(): number {
    return this.currentIndex;
  }

  get totalSteps(): number {
    return this.steps.length;
  }

  get completedSteps(): CompletedStepRecord[] {
    return this.completed;
  }

  get isComplete(): boolean {
    return this.currentIndex >= this.steps.length;
  }

  reset(): void {
    this.currentIndex = 0;
    this.completed = [];
    this.clearHold();
  }

  private clearHold(): void {
    this.holdStartTime = null;
    this.holdAccumulatedMs = 0;
    this.accuracySum = 0;
    this.accuracySamples = 0;
  }

  /** Call once per detection frame with the current overall accuracy (0-1). */
  update(overallAccuracy: number, now: number): SequenceTick {
    const step = this.currentStep;
    if (!step) return { stepProgress: 1, justCompleted: null };

    const meetsThreshold = overallAccuracy >= step.minimumAccuracy;

    if (meetsThreshold) {
      if (this.holdStartTime === null) this.holdStartTime = now;
      this.accuracySum += overallAccuracy;
      this.accuracySamples += 1;
      this.holdAccumulatedMs = now - this.holdStartTime;
    } else {
      this.clearHold();
    }

    const stepProgress = Math.min(1, this.holdAccumulatedMs / step.holdDurationMs);

    let justCompleted: CompletedStepRecord | null = null;
    if (stepProgress >= 1) {
      const avgAccuracy = this.accuracySamples ? this.accuracySum / this.accuracySamples : overallAccuracy;
      justCompleted = {
        stepId: step.stepId,
        grade: gradeForAccuracy(avgAccuracy),
        accuracyAtCompletion: avgAccuracy,
      };
      this.completed.push(justCompleted);
      this.advanceFrom(step);
    }

    return { stepProgress, justCompleted };
  }

  private advanceFrom(step: TrainingStep): void {
    this.clearHold();
    if (step.nextStep === null) {
      this.currentIndex = this.steps.length; // marks the session complete
      return;
    }
    const idx = this.steps.findIndex((s) => s.stepId === step.nextStep);
    this.currentIndex = idx === -1 ? this.currentIndex + 1 : idx;
  }
}
