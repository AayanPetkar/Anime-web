// Reusable "Fire" effect — a continuous upward flame jet (bright orange/red
// GPU particles) with a secondary, slower gray smoke jet layered on top
// (Fireball Jutsu's Fire + Smoke combo), plus a lightweight heat-shimmer
// plane. True screen-space heat refraction needs to sample a scene render
// target, which this self-contained module doesn't own — the shimmer here
// is an additive flicker approximation, close enough for a stylized overlay.
import * as THREE from 'three';
import type { EffectHandle, EffectLayerConfig, EffectRenderer } from './EffectTypes';
import { ParticleSystem } from './ParticleSystem';

const POOL_SIZE = 3;
const FLAME_INTERVAL = 0.035;
const SMOKE_INTERVAL = 0.15;

const SHIMMER_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const SHIMMER_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  void main() {
    vec2 c = vUv - 0.5;
    float d = length(c) * 2.0;
    float flicker = 0.5 + 0.5 * sin(uTime * 18.0 + d * 10.0);
    float falloff = smoothstep(1.0, 0.0, d);
    gl_FragColor = vec4(uColor, falloff * flicker * 0.12);
  }
`;

interface FireSlot {
  origin: THREE.Vector3;
  shimmer: THREE.Mesh;
  material: THREE.ShaderMaterial;
  active: boolean;
  handleId: number;
  color: string;
  scale: number;
  intensity: number;
  lastFlame: number;
  lastSmoke: number;
}

export class FireRenderer implements EffectRenderer {
  readonly object3D: THREE.Group;
  private readonly slots: FireSlot[] = [];
  private readonly flame = new ParticleSystem();
  private readonly smoke = new ParticleSystem();
  private nextId = 1;
  private cameraQuaternion = new THREE.Quaternion();

  constructor() {
    this.object3D = new THREE.Group();
    this.object3D.add(this.flame.object3D, this.smoke.object3D);

    const geometry = new THREE.PlaneGeometry(0.4, 0.4);
    for (let i = 0; i < POOL_SIZE; i++) {
      const material = new THREE.ShaderMaterial({
        vertexShader: SHIMMER_VERTEX,
        fragmentShader: SHIMMER_FRAGMENT,
        uniforms: { uColor: { value: new THREE.Color('#ff8a3e') }, uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const shimmer = new THREE.Mesh(geometry, material);
      shimmer.visible = false;
      this.object3D.add(shimmer);
      this.slots.push({
        origin: new THREE.Vector3(),
        shimmer,
        material,
        active: false,
        handleId: -1,
        color: '#ff8a3e',
        scale: 1,
        intensity: 1,
        lastFlame: 0,
        lastSmoke: 0,
      });
    }
  }

  setCameraOrientation(quaternion: THREE.Quaternion): void {
    this.cameraQuaternion.copy(quaternion);
  }

  spawn(config: EffectLayerConfig, position: THREE.Vector3): EffectHandle {
    const slot = this.slots.find((s) => !s.active) ?? this.slots[0];
    slot.origin.copy(position);
    slot.shimmer.position.copy(position);
    slot.shimmer.scale.setScalar(config.scale ?? 1);
    slot.material.uniforms.uColor.value.set(config.color);
    slot.color = config.color;
    slot.scale = config.scale ?? 1;
    slot.intensity = config.intensity ?? 1;
    slot.shimmer.visible = true;
    slot.active = true;
    slot.handleId = this.nextId++;
    slot.lastFlame = 0;
    slot.lastSmoke = 0;
    return { id: slot.handleId, kind: 'fire' };
  }

  setPosition(handle: EffectHandle, position: THREE.Vector3): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    if (!slot) return;
    slot.origin.copy(position);
    slot.shimmer.position.copy(position);
  }

  update(deltaSeconds: number, elapsedSeconds: number): void {
    this.flame.update(deltaSeconds, elapsedSeconds);
    this.smoke.update(deltaSeconds, elapsedSeconds);

    for (const slot of this.slots) {
      if (!slot.active) continue;
      slot.material.uniforms.uTime.value = elapsedSeconds;
      slot.shimmer.quaternion.copy(this.cameraQuaternion);

      if (elapsedSeconds - slot.lastFlame > FLAME_INTERVAL) {
        slot.lastFlame = elapsedSeconds;
        this.flame.burst('embers', slot.origin, {
          color: slot.color,
          intensity: 0.55 * slot.intensity,
          scale: slot.scale,
        });
      }
      if (elapsedSeconds - slot.lastSmoke > SMOKE_INTERVAL) {
        slot.lastSmoke = elapsedSeconds;
        this.smoke.burst('smoke', slot.origin, {
          color: '#6b7280',
          intensity: 0.4 * slot.intensity,
          scale: slot.scale * 0.8,
        });
      }
    }
  }

  stop(handle: EffectHandle): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    if (slot) {
      slot.active = false;
      slot.shimmer.visible = false;
    }
  }

  dispose(): void {
    this.flame.dispose();
    this.smoke.dispose();
    for (const slot of this.slots) {
      slot.shimmer.geometry.dispose();
      slot.material.dispose();
    }
  }
}
