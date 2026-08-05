// Reusable "Water" effect — a continuous droplet/splash particle jet plus a
// translucent flowing ribbon (a plane with a scrolling wave-displacement
// shader standing in for a real fluid sim). Pooled.
import * as THREE from 'three';
import type { EffectHandle, EffectLayerConfig, EffectRenderer } from './EffectTypes';
import { ParticleSystem } from './ParticleSystem';

const POOL_SIZE = 3;
const DROPLET_INTERVAL = 0.05;
const RIBBON_SEGMENTS = 24;

const RIBBON_VERTEX = /* glsl */ `
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;
  void main() {
    vUv = uv;
    vec3 pos = position;
    float wave = sin(pos.y * 10.0 - uTime * 5.0) * 0.02 + sin(pos.y * 3.0 + uTime * 2.0) * 0.015;
    pos.x += wave;
    vWave = wave;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;
const RIBBON_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  varying float vWave;
  void main() {
    float edgeFade = smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
    float flow = sin(vUv.y * 14.0 - uTime * 6.0) * 0.5 + 0.5;
    vec3 color = uColor + vWave * 4.0;
    float alpha = edgeFade * (0.35 + flow * 0.3);
    gl_FragColor = vec4(color, alpha);
  }
`;

interface WaterSlot {
  origin: THREE.Vector3;
  ribbon: THREE.Mesh;
  material: THREE.ShaderMaterial;
  active: boolean;
  handleId: number;
  color: string;
  scale: number;
  intensity: number;
  lastDroplet: number;
}

export class WaterRenderer implements EffectRenderer {
  readonly object3D: THREE.Group;
  private readonly slots: WaterSlot[] = [];
  private readonly droplets = new ParticleSystem();
  private nextId = 1;
  private cameraQuaternion = new THREE.Quaternion();

  constructor() {
    this.object3D = new THREE.Group();
    this.object3D.add(this.droplets.object3D);

    const geometry = new THREE.PlaneGeometry(0.18, 0.5, 1, RIBBON_SEGMENTS);
    for (let i = 0; i < POOL_SIZE; i++) {
      const material = new THREE.ShaderMaterial({
        vertexShader: RIBBON_VERTEX,
        fragmentShader: RIBBON_FRAGMENT,
        uniforms: { uColor: { value: new THREE.Color('#3ec6ff') }, uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const ribbon = new THREE.Mesh(geometry, material);
      ribbon.visible = false;
      this.object3D.add(ribbon);
      this.slots.push({
        origin: new THREE.Vector3(),
        ribbon,
        material,
        active: false,
        handleId: -1,
        color: '#3ec6ff',
        scale: 1,
        intensity: 1,
        lastDroplet: 0,
      });
    }
  }

  setCameraOrientation(quaternion: THREE.Quaternion): void {
    this.cameraQuaternion.copy(quaternion);
  }

  spawn(config: EffectLayerConfig, position: THREE.Vector3): EffectHandle {
    const slot = this.slots.find((s) => !s.active) ?? this.slots[0];
    slot.origin.copy(position);
    slot.ribbon.position.copy(position);
    slot.ribbon.scale.setScalar(config.scale ?? 1);
    slot.material.uniforms.uColor.value.set(config.color);
    slot.color = config.color;
    slot.scale = config.scale ?? 1;
    slot.intensity = config.intensity ?? 1;
    slot.ribbon.visible = true;
    slot.active = true;
    slot.handleId = this.nextId++;
    slot.lastDroplet = 0;
    return { id: slot.handleId, kind: 'water' };
  }

  setPosition(handle: EffectHandle, position: THREE.Vector3): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    if (!slot) return;
    slot.origin.copy(position);
    slot.ribbon.position.copy(position);
  }

  update(deltaSeconds: number, elapsedSeconds: number): void {
    this.droplets.update(deltaSeconds, elapsedSeconds);
    for (const slot of this.slots) {
      if (!slot.active) continue;
      slot.material.uniforms.uTime.value = elapsedSeconds;
      slot.ribbon.quaternion.copy(this.cameraQuaternion);

      if (elapsedSeconds - slot.lastDroplet > DROPLET_INTERVAL) {
        slot.lastDroplet = elapsedSeconds;
        this.droplets.burst('sparks', slot.origin, {
          color: slot.color,
          intensity: 0.35 * slot.intensity,
          scale: slot.scale * 0.6,
        });
      }
    }
  }

  stop(handle: EffectHandle): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    if (slot) {
      slot.active = false;
      slot.ribbon.visible = false;
    }
  }

  dispose(): void {
    this.droplets.dispose();
    for (const slot of this.slots) {
      slot.ribbon.geometry.dispose();
      slot.material.dispose();
    }
  }
}
