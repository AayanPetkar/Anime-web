// Shared types for the Effect Engine. Pure type-space (plus a couple of
// small runtime-free helpers) — no rendering logic lives here.
import type * as THREE from 'three';

/** Every reusable visual effect the engine can render. */
export type EffectKind =
  | 'energyOrb'
  | 'energyBeam'
  | 'lightning'
  | 'fire'
  | 'water'
  | 'wind'
  | 'smoke'
  | 'glow'
  | 'aura'
  | 'shockwave'
  | 'impactRing'
  | 'sparks'
  | 'screenFlash'
  | 'cameraShake';

/** Body/hand locations an effect can be pinned to. Resolved to a live
 * THREE.Vector3 each frame by whatever consumes MediaPipe landmarks
 * (see components/effects/EffectStage.tsx) — this module never touches
 * MediaPipe directly. */
export type LandmarkAttachment =
  | 'rightPalm'
  | 'leftPalm'
  | 'chest'
  | 'head'
  | 'betweenHands'
  | 'aboveHead';

/** A resolver the host app supplies each frame: attachment point -> world position. */
export type LandmarkPositionResolver = (attachment: LandmarkAttachment) => THREE.Vector3 | null;

/** One layer of a preset — a single reusable effect, where it's pinned, and how it looks. */
export interface EffectLayerConfig {
  kind: EffectKind;
  attach: LandmarkAttachment;
  /** Hex color, e.g. "#3ec6ff". */
  color: string;
  /** 0-1+ multiplier on the effect's base intensity (particle count, beam width, etc). */
  intensity?: number;
  /** 0-1+ multiplier on the effect's base size. */
  scale?: number;
  /** For one-shot effects (sparks/shockwave/impactRing/lightning bolts). Continuous
   * effects (orb/beam/fire/water/wind/aura) ignore this and run until stopped. */
  durationMs?: number;
}

/** Full skill -> effects mapping. `chargeLayers` loop while accuracy is
 * building toward the hold threshold; `completionLayers` fire once when a
 * step (or the whole skill) is mastered. */
export interface SkillEffectPreset {
  skillId: string;
  chargeLayers: EffectLayerConfig[];
  completionLayers: EffectLayerConfig[];
  screenFlash?: { color: string; durationMs?: number };
  cameraShake?: { intensity?: number; durationMs?: number };
}

/** Handle returned by a renderer's spawn() — lets the caller move, query, or stop it. */
export interface EffectHandle {
  readonly id: number;
  readonly kind: EffectKind;
}

/** Common contract every continuous-effect renderer (Orb, Beam, Aura,
 * Lightning, Fire, Water, Wind) implements. One-shot burst effects
 * (sparks/shockwave/impact ring, via ParticleSystem) use the narrower
 * BurstEmitter contract instead — they don't need position updates after spawn. */
export interface EffectRenderer {
  /** Root object the EffectManager adds to the host scene exactly once. */
  readonly object3D: THREE.Object3D;
  spawn(config: EffectLayerConfig, position: THREE.Vector3): EffectHandle;
  setPosition(handle: EffectHandle, position: THREE.Vector3): void;
  update(deltaSeconds: number, elapsedSeconds: number): void;
  stop(handle: EffectHandle): void;
  dispose(): void;
}

/** Contract for the shared GPU particle burst system (sparks, shockwave,
 * impact ring, smoke) — fire-and-forget, no position follow-up needed. */
export interface BurstEmitter {
  readonly object3D: THREE.Object3D;
  burst(preset: BurstPresetName, position: THREE.Vector3, config?: Partial<EffectLayerConfig>): void;
  update(deltaSeconds: number, elapsedSeconds: number): void;
  dispose(): void;
}

export type BurstPresetName = 'sparks' | 'shockwave' | 'impactRing' | 'smoke' | 'embers';

export interface CompletionAnimationConfig {
  skillName: string;
  xpGained: number;
  preset: SkillEffectPreset;
  onSoundCue?: (sound: 'charge' | 'success') => void;
}
