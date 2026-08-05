// App-wide constants: accuracy thresholds, XP tables, route paths.
import type { AccentTheme } from '@/types';

/** One accent theme per anime universe, keyed by animeSlug, reused across
 * the homepage showcase, the browse grid, and skill detail pages so a given
 * series always reads as the same color. */
export const ANIME_THEME: Record<string, AccentTheme> = {
  naruto: {
    text: 'text-neon-orange',
    border: 'border-neon-orange/30',
    from: 'from-neon-orange',
    to: 'to-neon-yellow',
    hex: '#ff8a3e',
  },
  'dragon-ball': {
    text: 'text-neon-blue',
    border: 'border-neon-blue/30',
    from: 'from-neon-blue',
    to: 'to-neon-cyan',
    hex: '#3ec6ff',
  },
  bleach: {
    text: 'text-neon-cyan',
    border: 'border-neon-cyan/30',
    from: 'from-neon-cyan',
    to: 'to-neon-blue',
    hex: '#3effe0',
  },
  'jujutsu-kaisen': {
    text: 'text-neon-purple',
    border: 'border-neon-purple/30',
    from: 'from-neon-purple',
    to: 'to-neon-pink',
    hex: '#a855f7',
  },
  'demon-slayer': {
    text: 'text-neon-blue',
    border: 'border-neon-blue/30',
    from: 'from-neon-blue',
    to: 'to-neon-purple',
    hex: '#3ec6ff',
  },
  'one-piece': {
    text: 'text-neon-red',
    border: 'border-neon-red/30',
    from: 'from-neon-red',
    to: 'to-neon-orange',
    hex: '#ff3e5e',
  },
  avatar: {
    text: 'text-neon-yellow',
    border: 'border-neon-yellow/30',
    from: 'from-neon-yellow',
    to: 'to-neon-orange',
    hex: '#ffe23e',
  },
};

export const DEFAULT_ACCENT: AccentTheme = ANIME_THEME.naruto;

/** Accuracy threshold (%) at which a training session is marked complete. */
export const COMPLETION_ACCURACY_THRESHOLD = 90;

// --- Camera / MediaPipe tracking (Step 4) ---

/** Confidence (0-1) at/above which tracking is considered solid ("green"). */
export const CONFIDENCE_TRACKED = 0.7;
/** Confidence (0-1) at/above which tracking is "low-confidence" ("yellow"); below is "lost" ("red"). */
export const CONFIDENCE_LOW = 0.4;

/** Consecutive frames with no detected pose before we declare the person gone. */
export const FRAMES_BEFORE_LOST = 12;

/** Max number of people the pose model looks for; we then track only the closest. */
export const MAX_POSES_DETECTED = 3;
/** Max hands the hand model looks for; we then keep only the closest pair. */
export const MAX_HANDS_DETECTED = 4;

export const TRACKING_COLORS: Record<'tracked' | 'low-confidence' | 'lost', string> = {
  tracked: '#3effe0',
  'low-confidence': '#ffe23e',
  lost: '#ff3e5e',
};

export const CAMERA_VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: 'user',
  width: { ideal: 1280 },
  height: { ideal: 720 },
};

// --- Training Engine (Step 5) ---

/** Fallback hold duration/accuracy when a skill's JSON doesn't specify one. */
export const DEFAULT_HOLD_DURATION_MS = 1500;
export const DEFAULT_MINIMUM_ACCURACY = 0.75;
export const DEFAULT_ANGLE_TOLERANCE_DEG = 28;

/** Grade thresholds (overall accuracy 0-1) awarded on step completion. */
export const GRADE_THRESHOLDS: { grade: 'Perfect' | 'Great' | 'Good'; min: number }[] = [
  { grade: 'Perfect', min: 0.95 },
  { grade: 'Great', min: 0.85 },
  { grade: 'Good', min: 0 },
];

/** Exponential moving-average factor for smoothing accuracy frame-to-frame
 * (higher = more responsive, lower = smoother/less flicker). */
export const ACCURACY_SMOOTHING_ALPHA = 0.25;

/** A coaching message must be the top issue for this many consecutive
 * evaluations before it's shown, and stays visible at least this long —
 * both exist purely to stop feedback text from flickering. */
export const FEEDBACK_STABILITY_FRAMES = 5;
export const FEEDBACK_MIN_DISPLAY_MS = 1200;

/** Consecutive frames with >1 pose detected before we surface "multiple people". */
export const MULTIPLE_PEOPLE_FRAMES = 15;

// --- Progress / Ranking (Step 7) ---

/** Baseline pace assumption for rank scoring: how long one step "should"
 * take at a reasonable clip, used to score completion time relative to a
 * skill's step count rather than a fixed number for every skill. */
export const EXPECTED_TIME_PER_STEP_MS = 6000;

