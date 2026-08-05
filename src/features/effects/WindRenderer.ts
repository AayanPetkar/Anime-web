// Reusable "Wind" effect — thin curved streak lines that continuously orbit
// the attach point (e.g. swirling around a Rasengan). Point-sprite particles
// can't easily stretch along their velocity, so wind uses line geometry
// whose points are recomputed each frame from a rotating spiral parametric
// curve — cheap (typed-array writes only, no allocation) and reads as
// streaking air far better than circular particles would.
import * as THREE from 'three';
import type { EffectHandle, EffectLayerConfig, EffectRenderer } from './EffectTypes';

const POOL_SIZE = 3;
const STREAKS_PER_SLOT = 5;
const POINTS_PER_STREAK = 10;
const ORBIT_SPEED = 3.2;

interface WindSlot {
  group: THREE.Group;
  lines: THREE.Line[];
  material: THREE.LineBasicMaterial;
  active: boolean;
  handleId: number;
  radius: number;
  phaseOffsets: number[];
}

export class WindRenderer implements EffectRenderer {
  readonly object3D: THREE.Group;
  private readonly slots: WindSlot[] = [];
  private nextId = 1;

  constructor() {
    this.object3D = new THREE.Group();

    for (let i = 0; i < POOL_SIZE; i++) {
      const group = new THREE.Group();
      const material = new THREE.LineBasicMaterial({
        color: '#3effe0',
        transparent: true,
        opacity: 0.55,
        blending: THREE.AdditiveBlending,
      });
      const lines: THREE.Line[] = [];
      const phaseOffsets: number[] = [];
      for (let s = 0; s < STREAKS_PER_SLOT; s++) {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(new Float32Array(POINTS_PER_STREAK * 3), 3)
        );
        const line = new THREE.Line(geometry, material);
        lines.push(line);
        group.add(line);
        phaseOffsets.push(i2Pi(s, STREAKS_PER_SLOT));
      }
      group.visible = false;
      this.object3D.add(group);
      this.slots.push({ group, lines, material, active: false, handleId: -1, radius: 0.14, phaseOffsets });
    }
  }

  private updateStreaks(slot: WindSlot, elapsedSeconds: number): void {
    for (let s = 0; s < slot.lines.length; s++) {
      const line = slot.lines[s];
      const positions = line.geometry.attributes.position.array as Float32Array;
      const phase = slot.phaseOffsets[s] + elapsedSeconds * ORBIT_SPEED;
      const verticalSpan = 0.05 + (s % 3) * 0.015;

      for (let p = 0; p < POINTS_PER_STREAK; p++) {
        const t = p / (POINTS_PER_STREAK - 1);
        const angle = phase + t * 1.4;
        const r = slot.radius * (0.6 + 0.4 * t);
        positions[p * 3] = Math.cos(angle) * r;
        positions[p * 3 + 1] = (t - 0.5) * verticalSpan + Math.sin(phase * 0.7) * 0.01;
        positions[p * 3 + 2] = Math.sin(angle) * r;
      }
      line.geometry.attributes.position.needsUpdate = true;
    }
  }

  spawn(config: EffectLayerConfig, position: THREE.Vector3): EffectHandle {
    const slot = this.slots.find((s) => !s.active) ?? this.slots[0];
    slot.radius = 0.14 * (config.scale ?? 1);
    slot.material.color.set(config.color);
    slot.material.opacity = 0.4 + 0.35 * (config.intensity ?? 1);
    slot.group.position.copy(position);
    slot.group.visible = true;
    slot.active = true;
    slot.handleId = this.nextId++;
    return { id: slot.handleId, kind: 'wind' };
  }

  setPosition(handle: EffectHandle, position: THREE.Vector3): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    slot?.group.position.copy(position);
  }

  update(_deltaSeconds: number, elapsedSeconds: number): void {
    for (const slot of this.slots) {
      if (slot.active) this.updateStreaks(slot, elapsedSeconds);
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
    for (const slot of this.slots) {
      slot.material.dispose();
      for (const line of slot.lines) line.geometry.dispose();
    }
  }
}

function i2Pi(index: number, total: number): number {
  return (index / total) * Math.PI * 2;
}
