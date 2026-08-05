// Reusable "Lightning" effect — a cluster of short, jagged arc segments that
// regenerate on a fast timer around the attach point (readable both as
// "lightning surrounding the hand" and as a single bolt when scaled up),
// plus periodic spark bursts via the shared GPU particle system. Pooled.
import * as THREE from 'three';
import type { EffectHandle, EffectLayerConfig, EffectRenderer } from './EffectTypes';
import { ParticleSystem } from './ParticleSystem';

const POOL_SIZE = 3;
const ARCS_PER_BOLT = 6;
const SEGMENTS_PER_ARC = 5;
const REGEN_INTERVAL = 0.045;
const SPARK_INTERVAL = 0.12;

interface LightningSlot {
  group: THREE.Group;
  lines: THREE.Line[];
  material: THREE.LineBasicMaterial;
  active: boolean;
  handleId: number;
  radius: number;
  lastRegen: number;
  lastSpark: number;
}

export class LightningRenderer implements EffectRenderer {
  readonly object3D: THREE.Group;
  private readonly slots: LightningSlot[] = [];
  private readonly sparks = new ParticleSystem();
  private nextId = 1;

  constructor() {
    this.object3D = new THREE.Group();
    this.object3D.add(this.sparks.object3D);

    for (let i = 0; i < POOL_SIZE; i++) {
      const group = new THREE.Group();
      const material = new THREE.LineBasicMaterial({
        color: '#a855f7',
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
      });
      const lines: THREE.Line[] = [];
      for (let a = 0; a < ARCS_PER_BOLT; a++) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array(SEGMENTS_PER_ARC * 3), 3)
        );
        const line = new THREE.Line(geometry, material);
        lines.push(line);
        group.add(line);
      }
      group.visible = false;
      this.object3D.add(group);
      this.slots.push({ group, lines, material, active: false, handleId: -1, radius: 0.15, lastRegen: 0, lastSpark: 0 });
    }
  }

  private regenerateArcs(slot: LightningSlot, origin: THREE.Vector3): void {
    for (const line of slot.lines) {
      const positions = line.geometry.attributes.position.array as Float32Array;
      const dir = new THREE.Vector3(
        Math.random() - 0.5,
        Math.random() - 0.5,
        Math.random() - 0.5
      ).normalize();
      const length = slot.radius * (0.5 + Math.random() * 0.6);

      for (let s = 0; s < SEGMENTS_PER_ARC; s++) {
        const t = s / (SEGMENTS_PER_ARC - 1);
        const jitter = new THREE.Vector3(
          (Math.random() - 0.5) * slot.radius * 0.4,
          (Math.random() - 0.5) * slot.radius * 0.4,
          (Math.random() - 0.5) * slot.radius * 0.4
        ).multiplyScalar(Math.sin(t * Math.PI));

        const point = dir.clone().multiplyScalar(length * t).add(jitter);
        positions[s * 3] = point.x;
        positions[s * 3 + 1] = point.y;
        positions[s * 3 + 2] = point.z;
      }
      line.geometry.attributes.position.needsUpdate = true;
    }
    slot.group.position.copy(origin);
  }

  spawn(config: EffectLayerConfig, position: THREE.Vector3): EffectHandle {
    const slot = this.slots.find((s) => !s.active) ?? this.slots[0];
    slot.radius = 0.15 * (config.scale ?? 1);
    slot.material.color.set(config.color);
    slot.material.opacity = 0.7 + 0.25 * (config.intensity ?? 1);
    slot.group.visible = true;
    slot.active = true;
    slot.handleId = this.nextId++;
    slot.lastRegen = 0;
    slot.lastSpark = 0;
    this.regenerateArcs(slot, position);
    return { id: slot.handleId, kind: 'lightning' };
  }

  setPosition(handle: EffectHandle, position: THREE.Vector3): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    slot?.group.position.copy(position);
  }

  update(_deltaSeconds: number, elapsedSeconds: number): void {
    this.sparks.update(_deltaSeconds, elapsedSeconds);
    for (const slot of this.slots) {
      if (!slot.active) continue;
      if (elapsedSeconds - slot.lastRegen > REGEN_INTERVAL) {
        slot.lastRegen = elapsedSeconds;
        this.regenerateArcs(slot, slot.group.position);
      }
      if (elapsedSeconds - slot.lastSpark > SPARK_INTERVAL) {
        slot.lastSpark = elapsedSeconds;
        this.sparks.burst('sparks', slot.group.position, {
          color: `#${slot.material.color.getHexString()}`,
          intensity: 0.3,
          scale: 0.5,
        });
      }
    }
  }

  stop(handle: EffectHandle): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    if (slot) {
      slot.active = false;
      slot.group.visible = false;
    }
  }

  dispose(): void {
    this.sparks.dispose();
    for (const slot of this.slots) {
      slot.material.dispose();
      for (const line of slot.lines) line.geometry.dispose();
    }
  }
}
