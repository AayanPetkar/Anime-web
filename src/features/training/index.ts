// Training engine (Step 5): pose/hand matching, accuracy scoring, step
// sequencing, coaching feedback, and the top-level SkillSession orchestrator.
// Everything here is skill-agnostic — behavior is entirely driven by the
// Skill JSON (Step 3) and ReferencePose JSON (src/data/poses).
export * from './PoseMatcher';
export * from './HandMatcher';
export * from './AccuracyCalculator';
export * from './SequenceEngine';
export * from './FeedbackEngine';
export * from './SkillSession';
