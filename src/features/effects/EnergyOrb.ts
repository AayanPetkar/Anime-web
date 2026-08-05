// Reusable "Energy Orb" effect — a glowing, roiling sphere (Rasengan, Spirit
// Bomb's core, etc.) built from an unlit ShaderMaterial (fresnel rim + noise
// -displaced surface) plus a shared particle emitter for swirling motes.
// Pooled: a fixed number of orb meshes are created once and reused.
import * as THREE from 'three';
import type { EffectHandle, EffectLayerConfig, EffectRenderer } from './EffectTypes';
import { ParticleSystem } from './ParticleSystem';

const POOL_SIZE = 4;
const BASE_RADIUS = 0.09;

const VERTEX_SHADER = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }

  void main() {
    vec3 pos = position;
    float n = hash(floor(position * 6.0 + uTime * 1.5));
    pos += normal * n * 0.035;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vViewDir = normalize(-mvPosition.xyz);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float fresnel = pow(1.0 - max(dot(vNormal, vViewDir), 0.0), 2.2);
    float pulse = 0.75 + 0.25 * sin(uTime * 6.0);
    vec3 core = uColor * 1.4 * pulse;
    vec3 rim = uColor + vec3(0.4);
    vec3 color = mix(core, rim, fresnel);
    float alpha = clamp(fresnel * 1.3 + 0.35, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
  }
`;

interface OrbSlot {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  active: boolean;
  handleId: number;
  lastMoteAt: number;
}

export class EnergyOrb implements EffectRenderer {
  readonly object3D: THREE.Group;
  private readonly slots: OrbSlot[] = [];
  private readonly motes = new ParticleSystem();
  private nextId = 1;
  private elapsed = 0;

  constructor() {
    this.object3D = new THREE.Group();
    this.object3D.add(this.motes.object3D);

    const geometry = new THREE.IcosahedronGeometry(BASE_RADIUS, 3);
    for (let i = 0; i < POOL_SIZE; i++) {
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: { uColor: { value: new THREE.Color('#3ec6ff') }, uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      this.object3D.add(mesh);
      this.slots.push({ mesh, material, active: false, handleId: -1, lastMoteAt: 0 });
    }
  }

  spawn(config: EffectLayerConfig, position: THREE.Vector3): EffectHandle {
    const slot = this.slots.find((s) => !s.active) ?? this.slots[0];
    const scale = config.scale ?? 1;
    slot.mesh.scale.setScalar(scale * (config.intensity ?? 1));
    slot.mesh.position.copy(position);
    slot.material.uniforms.uColor.value.set(config.color);
    slot.mesh.visible = true;
    slot.active = true;
    slot.handleId = this.nextId++;
    slot.lastMoteAt = this.elapsed;
    return { id: slot.handleId, kind: 'energyOrb' };
  }

  setPosition(handle: EffectHandle, position: THREE.Vector3): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    slot?.mesh.position.copy(position);
  }

  update(_deltaSeconds: number, elapsedSeconds: number): void {
    this.elapsed = elapsedSeconds;
    this.motes.update(_deltaSeconds, elapsedSeconds);
    for (const slot of this.slots) {
      if (!slot.active) continue;
      slot.material.uniforms.uTime.value = elapsedSeconds;
      if (elapsedSeconds - slot.lastMoteAt > 0.09) {
        slot.lastMoteAt = elapsedSeconds;
        this.motes.burst('embers', slot.mesh.position, {
          color: `#${slot.material.uniforms.uColor.value.getHexString()}`,
          intensity: 0.2,
          scale: 0.35 * slot.mesh.scale.x,
        });
      }
    }
  }

  stop(handle: EffectHandle): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    if (slot) {
      slot.active = false;
      slot.mesh.visible = false;
    }
  }

  dispose(): void {
    this.motes.dispose();
    for (const slot of this.slots) {
      slot.mesh.geometry.dispose();
      slot.material.dispose();
    }
  }
}
