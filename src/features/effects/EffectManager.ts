// Central orchestrator for the Effect Engine. Owns one instance of each
// reusable renderer, plays a SkillEffectPreset's charge/completion layers by
// dispatching to the right renderer for each layer's `kind`, and drives
// every renderer's update() from a single per-frame call. This is the only
// file that needs to know "which renderer handles which EffectKind" — every
// other file in this folder is agnostic of the others.
import * as THREE from 'three';
import type {
  EffectHandle,
  EffectKind,
  EffectLayerConfig,
  EffectRenderer,
  LandmarkPositionResolver,
  SkillEffectPreset,
} from './EffectTypes';
import { EnergyOrb } from './EnergyOrb';
import { BeamRenderer } from './BeamRenderer';
import { AuraRenderer } from './AuraRenderer';
import { LightningRenderer } from './LightningRenderer';
import { FireRenderer } from './FireRenderer';
import { WaterRenderer } from './WaterRenderer';
import { WindRenderer } from './WindRenderer';
import { ParticleSystem } from './ParticleSystem';
import { ScreenFlash } from './ScreenFlash';
import { CameraShake, type ShakeOffset } from './CameraShake';

interface ActiveLayer {
  config: EffectLayerConfig;
  handle: EffectHandle;
  renderer: EffectRenderer;
}

const CONTINUOUS_KINDS: EffectKind[] = ['energyOrb', 'energyBeam', 'lightning', 'fire', 'water', 'wind', 'aura', 'glow'];
const BURST_KINDS: EffectKind[] = ['sparks', 'shockwave', 'impactRing', 'smoke'];

export class EffectManager {
  readonly root: THREE.Group;

  private readonly orb = new EnergyOrb();
  private readonly beam = new BeamRenderer();
  private readonly aura = new AuraRenderer();
  private readonly lightning = new LightningRenderer();
  private readonly fire = new FireRenderer();
  private readonly water = new WaterRenderer();
  private readonly wind = new WindRenderer();
  private readonly bursts = new ParticleSystem();

  readonly screenFlash = new ScreenFlash();
  readonly cameraShake = new CameraShake();

  private activeCharge: ActiveLayer[] = [];
  private elapsed = 0;

  constructor() {
    this.root = new THREE.Group();
    this.root.add(
      this.orb.object3D,
      this.beam.object3D,
      this.aura.object3D,
      this.lightning.object3D,
      this.fire.object3D,
      this.water.object3D,
      this.wind.object3D,
      this.bursts.object3D
    );
  }

  private rendererFor(kind: EffectKind): EffectRenderer | null {
    switch (kind) {
      case 'energyOrb':
        return this.orb;
      case 'energyBeam':
        return this.beam;
      case 'aura':
      case 'glow':
        return this.aura;
      case 'lightning':
        return this.lightning;
      case 'fire':
        return this.fire;
      case 'water':
        return this.water;
      case 'wind':
        return this.wind;
      default:
        return null;
    }
  }

  /** Camera-facing billboards (aura/fire shimmer/water ribbon) need the
   * camera's orientation to stay flat toward the viewer — call this once
   * per frame before update() if the camera can move/rotate. */
  setCameraOrientation(quaternion: THREE.Quaternion): void {
    this.aura.setCameraOrientation(quaternion);
    this.fire.setCameraOrientation(quaternion);
    this.water.setCameraOrientation(quaternion);
  }

  /** Starts a preset's continuous "charge" layers (looping while the user
   * holds the pose). Call `stopCharge()` when the hold breaks or completes. */
  playCharge(preset: SkillEffectPreset, resolvePosition: LandmarkPositionResolver): void {
    this.stopCharge();
    for (const config of preset.chargeLayers) {
      if (!CONTINUOUS_KINDS.includes(config.kind)) continue;
      const renderer = this.rendererFor(config.kind);
      const position = resolvePosition(config.attach);
      if (!renderer || !position) continue;
      const handle = renderer.spawn(config, position);
      this.activeCharge.push({ config, handle, renderer });
    }
  }

  stopCharge(): void {
    for (const layer of this.activeCharge) layer.renderer.stop(layer.handle);
    this.activeCharge = [];
  }

  /** Fires a preset's one-shot "completion" layers plus screen flash / camera
   * shake — the full "technique mastered" payoff. Continuous layers listed
   * under completionLayers spawn and auto-stop after `durationMs` (or a
   * sensible default) since a completion moment shouldn't loop forever. */
  playCompletion(preset: SkillEffectPreset, resolvePosition: LandmarkPositionResolver): void {
    for (const config of preset.completionLayers) {
      const position = resolvePosition(config.attach);
      if (!position) continue;

      if (BURST_KINDS.includes(config.kind)) {
        const burstName =
          config.kind === 'shockwave'
            ? 'shockwave'
            : config.kind === 'impactRing'
              ? 'impactRing'
              : config.kind === 'smoke'
                ? 'smoke'
                : 'sparks';
        this.bursts.burst(burstName, position, config);
        continue;
      }

      const renderer = this.rendererFor(config.kind);
      if (!renderer) continue;
      const handle = renderer.spawn(config, position);
      const lifespan = config.durationMs ?? 900;
      window.setTimeout(() => renderer.stop(handle), lifespan);
    }

    if (preset.screenFlash) {
      this.screenFlash.trigger(preset.screenFlash.color, preset.screenFlash.durationMs ?? 350);
    }
    if (preset.cameraShake) {
      this.cameraShake.trigger(preset.cameraShake.intensity ?? 0.6, preset.cameraShake.durationMs ?? 400);
    }
  }

  /** Keeps every continuously-attached charge layer pinned to its landmark
   * (call every frame while charging — cheap position copies, no spawning). */
  followLandmarks(resolvePosition: LandmarkPositionResolver): void {
    for (const layer of this.activeCharge) {
      const position = resolvePosition(layer.config.attach);
      if (position) layer.renderer.setPosition(layer.handle, position);
    }
  }

  /** Call once per rendered frame. */
  update(deltaSeconds: number, nowMs: number): { flash: { opacity: number; color: string }; shake: ShakeOffset } {
    this.elapsed += deltaSeconds;
    this.orb.update(deltaSeconds, this.elapsed);
    this.beam.update(deltaSeconds, this.elapsed);
    this.aura.update(deltaSeconds, this.elapsed);
    this.lightning.update(deltaSeconds, this.elapsed);
    this.fire.update(deltaSeconds, this.elapsed);
    this.water.update(deltaSeconds, this.elapsed);
    this.wind.update(deltaSeconds, this.elapsed);
    this.bursts.update(deltaSeconds, this.elapsed);

    return {
      flash: this.screenFlash.update(nowMs),
      shake: this.cameraShake.update(nowMs),
    };
  }

  stopAll(): void {
    this.stopCharge();
  }

  dispose(): void {
    this.stopAll();
    this.orb.dispose();
    this.beam.dispose();
    this.aura.dispose();
    this.lightning.dispose();
    this.fire.dispose();
    this.water.dispose();
    this.wind.dispose();
    this.bursts.dispose();
  }
}
