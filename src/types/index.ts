// Shared TypeScript types: Skill, TrainingStep, PoseResult, UserProgress, etc.

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

/** One accent-color family used to theme a card, its glow, and its icon. */
export interface AccentTheme {
  /** Tailwind text color class, e.g. "text-neon-orange" */
  text: string;
  /** Tailwind border color class */
  border: string;
  /** Tailwind from/to gradient stop classes */
  from: string;
  to: string;
  /** Raw hex used for inline SVG fills/glows */
  hex: string;
}

/** One instruction within a skill's training sequence. */
export interface SkillStep {
  id: number;
  instruction: string;
  /** Reference-pose id this step will be matched against once pose-matching lands. */
  pose: string;
}

/** Full skill record as stored in src/data/skills/<anime>/<skill>.json */
export interface Skill {
  id: string;
  anime: string;
  animeSlug: string;
  name: string;
  difficulty: Difficulty;
  description: string;
  estimatedLearningTimeMinutes: number;
  previewAsset: string;
  steps: SkillStep[];
  referencePoses: string[];
  completionEffect: string;
  xpReward: number;
}

/** Minimal skill summary shown on the landing page's skill cards. */
export interface HomeSkill {
  id: string;
  anime: string;
  skillName: string;
  difficulty: Difficulty;
  description: string;
  accent: AccentTheme;
  /** Which original SVG icon component to render for this technique. */
  icon: 'orb' | 'beam' | 'void' | 'slash' | 'breath' | 'impact';
}

// --- Camera & MediaPipe tracking types (Step 4) ---

export type TrackingState = 'tracked' | 'low-confidence' | 'lost';

export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export interface PoseFrame {
  landmarks: NormalizedLandmark[];
  confidence: number;
  state: TrackingState;
}

export type Handedness = 'Left' | 'Right';

export interface HandFrame {
  landmarks: NormalizedLandmark[];
  handedness: Handedness;
  confidence: number;
  state: TrackingState;
}

export interface DetectionFrame {
  pose: PoseFrame | null;
  hands: HandFrame[];
  fps: number;
  personInFrame: boolean;
  timestamp: number;
}

export type CameraPermissionState =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'
  | 'error';

/** Imperative handles so overlays can be driven from an rAF loop without React re-renders. */
export interface PoseOverlayHandle {
  draw: (frame: PoseFrame | null) => void;
  clear: () => void;
}

export interface HandOverlayHandle {
  draw: (hands: HandFrame[]) => void;
  clear: () => void;
}

export interface FPSCounterHandle {
  update: (fps: number) => void;
}

// --- Training Engine types (Step 5) ---

/** Joints the engine can score. Deliberately limited to the subset we track
 * (see features/pose-detection's POSE_LANDMARK_INDEX) — generic across any skill. */
export type AngleJoint =
  | 'leftElbow'
  | 'rightElbow'
  | 'leftShoulder'
  | 'rightShoulder'
  | 'leftKnee'
  | 'rightKnee';

/** Coarse hand-shape archetypes the HandMatcher can classify/score against. */
export type HandShape = 'relaxed' | 'open' | 'fist' | 'cupped' | 'pointing' | 'blade';

export type FacingDirection = 'front' | 'left' | 'right';

/**
 * A single reference pose, loaded from JSON (src/data/poses/<poseId>.json).
 * Purely data — no anime- or skill-specific code anywhere reads this file
 * differently, so any new skill "just works" by shipping more of these.
 */
export interface ReferencePose {
  id: string;
  /** Target angle (degrees) per joint. Omitted joints aren't scored. */
  bodyAngles: Partial<Record<AngleJoint, number>>;
  /** Degrees of allowed deviation before a joint scores 0. */
  toleranceDeg: number;
  /** Optional torso-lean target (0 = upright), same tolerance as toleranceDeg. */
  torsoLean?: number;
  /** Optional facing/orientation requirement. */
  orientation?: FacingDirection;
  /** Optional required hand shapes — omit a side to not score it. */
  hands?: { left?: HandShape; right?: HandShape };
}

/** Per-joint scoring detail, used by both accuracy math and coaching feedback. */
export interface JointEvaluation {
  joint: AngleJoint;
  actualDeg: number;
  targetDeg: number;
  deviationDeg: number;
  score: number; // 0-1
}

export interface HandEvaluation {
  side: 'left' | 'right';
  targetShape: HandShape;
  detectedShape: HandShape | null;
  score: number; // 0-1
  present: boolean;
}

export interface PoseMatchResult {
  accuracy: number; // 0-1 aggregate body accuracy
  joints: JointEvaluation[];
  torsoLeanDeviation: number | null;
  orientationOk: boolean | null;
}

export interface HandMatchResult {
  accuracy: number; // 0-1 aggregate hand accuracy across required hands
  hands: HandEvaluation[];
}

/** Engine-facing training step — adapted at runtime from a catalog Skill's
 * SkillStep[] (see features/training/SkillSession's `toTrainingSteps`),
 * matching the shape requested for the training engine. */
export interface TrainingStep {
  stepId: number;
  title: string;
  instruction: string;
  requiredPose: string; // ReferencePose id
  requiredHands: boolean;
  holdDurationMs: number;
  minimumAccuracy: number; // 0-1
  nextStep: number | null; // stepId of the next step, or null if final
}

export type StepGrade = 'Perfect' | 'Great' | 'Good';

export interface CompletedStepRecord {
  stepId: number;
  grade: StepGrade;
  accuracyAtCompletion: number;
}

/** Problems the engine can detect that aren't "you're just not accurate yet". */
export type MistakeType =
  | 'person-left-frame'
  | 'hands-not-visible'
  | 'multiple-people'
  | 'camera-blocked'
  | 'tracking-lost'
  | 'low-confidence';

export interface SessionState {
  currentStep: TrainingStep | null;
  stepIndex: number;
  totalSteps: number;
  stepProgress: number; // 0-1, hold-timer progress for the current step
  overallProgress: number; // 0-1, completedSteps / totalSteps
  poseAccuracy: number; // 0-100
  handAccuracy: number; // 0-100
  overallAccuracy: number; // 0-100
  bestAccuracy: number; // 0-100, best overall accuracy seen this session
  sessionTimeMs: number;
  completedSteps: CompletedStepRecord[];
  feedback: string | null;
  mistake: MistakeType | null;
  lastStepGrade: StepGrade | null;
  isSessionComplete: boolean;
}


