// A single reusable GPU particle system backing four of the "Effects" list
// items (Sparks, Shockwave, Impact Ring, Smoke) plus Embers used by other
// renderers. Particle motion (position/fade over lifetime) is computed
// entirely in the vertex/fragment shaders from a birth time + velocity, so
// per-frame JS work is just one uniform update — no per-particle CPU loop,
// and no allocation after the pool is created.
import * as THREE from 'three';
import type { BurstEmitter, BurstPresetName, EffectLayerConfig } from './EffectTypes';

const MAX_PARTICLES = 800;

const VERTEX_SHADER = /* glsl */ `
  attribute vec3 aVelocity;
  attribute float aBirth;
  attribute float aLifetime;
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uTime;
  uniform vec3 uGravity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float age = uTime - aBirth;
    if (age < 0.0 || age > aLifetime || aLifetime <= 0.0) {
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
      vAlpha = 0.0;
      return;
    }
    float t = age / aLifetime;
    vec3 pos = position + aVelocity * age + 0.5 * uGravity * age * age;
    vColor = aColor;
    vAlpha = (1.0 - t) * (1.0 - t);
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (280.0 / max(-mvPosition.z, 0.001)) * (1.0 - 0.4 * t);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    if (vAlpha <= 0.0) discard;
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float soft = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, vAlpha * soft);
  }
`;

interface PresetTuning {
  count: number;
  speed: number;
  spread: number;
  lifetime: number;
  size: number;
  gravity: THREE.Vector3;
}

const PRESETS: Record<BurstPresetName, PresetTuning> = {
  sparks: { count: 40, speed: 2.6, spread: 0.9, lifetime: 0.5, size: 6, gravity: new THREE.Vector3(0, -3.5, 0) },
  shockwave: { count: 90, speed: 3.2, spread: 1, lifetime: 0.45, size: 5, gravity: new THREE.Vector3(0, 0, 0) },
  impactRing: { count: 70, speed: 2.2, spread: 1, lifetime: 0.6, size: 7, gravity: new THREE.Vector3(0, 0.4, 0) },
  smoke: { count: 30, speed: 0.5, spread: 0.4, lifetime: 1.6, size: 22, gravity: new THREE.Vector3(0, 0.6, 0) },
  embers: { count: 25, speed: 0.9, spread: 0.6, lifetime: 1.1, size: 4, gravity: new THREE.Vector3(0, 0.8, 0) },
};

/** GPU particle burst pool. One instance handles every burst-style effect
 * in the app — "reusable" and "object pooling" both satisfied by never
 * allocating new geometry/material/typed-arrays after construction. */
export class ParticleSystem implements BurstEmitter {
  readonly object3D: THREE.Points;

  private readonly geometry: THREE.BufferGeometry;
  private readonly material: THREE.ShaderMaterial;
  private readonly positions: Float32Array;
  private readonly velocities: Float32Array;
  private readonly births: Float32Array;
  private readonly lifetimes: Float32Array;
  private readonly sizes: Float32Array;
  private readonly colors: Float32Array;

  private cursor = 0;
  private elapsed = 0;

  constructor() {
    this.geometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(MAX_PARTICLES * 3);
    this.velocities = new Float32Array(MAX_PARTICLES * 3);
    this.births = new Float32Array(MAX_PARTICLES).fill(-1);
    this.lifetimes = new Float32Array(MAX_PARTICLES);
    this.sizes = new Float32Array(MAX_PARTICLES);
    this.colors = new Float32Array(MAX_PARTICLES * 3);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geometry.setAttribute('aVelocity', new THREE.BufferAttribute(this.velocities, 3));
    this.geometry.setAttribute('aBirth', new THREE.BufferAttribute(this.births, 1));
    this.geometry.setAttribute('aLifetime', new THREE.BufferAttribute(this.lifetimes, 1));
    this.geometry.setAttribute('aSize', new THREE.BufferAttribute(this.sizes, 1));
    this.geometry.setAttribute('aColor', new THREE.BufferAttribute(this.colors, 3));
    this.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);

    this.material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uTime: { value: 0 },
        uGravity: { value: new THREE.Vector3(0, -2, 0) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.object3D = new THREE.Points(this.geometry, this.material);
    this.object3D.frustumCulled = false;
  }

  burst(preset: BurstPresetName, position: THREE.Vector3, config?: Partial<EffectLayerConfig>): void {
    const tuning = PRESETS[preset];
    const color = new THREE.Color(config?.color ?? '#3ec6ff');
    const intensity = config?.intensity ?? 1;
    const scale = config?.scale ?? 1;
    const count = Math.min(Math.round(tuning.count * intensity), MAX_PARTICLES);

    this.material.uniforms.uGravity.value.copy(tuning.gravity);

    for (let i = 0; i < count; i++) {
      const slot = this.cursor;
      this.cursor = (this.cursor + 1) % MAX_PARTICLES;

      const dir = randomDirection(tuning.spread, preset === 'shockwave' || preset === 'impactRing');
      const speed = tuning.speed * (0.6 + Math.random() * 0.8) * scale;

      this.positions[slot * 3] = position.x;
      this.positions[slot * 3 + 1] = position.y;
      this.positions[slot * 3 + 2] = position.z;

      this.velocities[slot * 3] = dir.x * speed;
      this.velocities[slot * 3 + 1] = dir.y * speed;
      this.velocities[slot * 3 + 2] = dir.z * speed;

      this.births[slot] = this.elapsed;
      this.lifetimes[slot] = tuning.lifetime * (0.8 + Math.random() * 0.4);
      this.sizes[slot] = tuning.size * scale * (0.7 + Math.random() * 0.6);

      this.colors[slot * 3] = color.r;
      this.colors[slot * 3 + 1] = color.g;
      this.colors[slot * 3 + 2] = color.b;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.aVelocity.needsUpdate = true;
    this.geometry.attributes.aBirth.needsUpdate = true;
    this.geometry.attributes.aLifetime.needsUpdate = true;
    this.geometry.attributes.aSize.needsUpdate = true;
    this.geometry.attributes.aColor.needsUpdate = true;
  }

  update(_deltaSeconds: number, elapsedSeconds: number): void {
    this.elapsed = elapsedSeconds;
    this.material.uniforms.uTime.value = elapsedSeconds;
  }

  dispose(): void {
    this.geometry.dispose();
    this.material.dispose();
  }
}

/** Unit direction vector; `spread` interpolates between a forward jet (0)
 * and a full sphere (1); `flat` flattens it onto the XZ plane (for
 * shockwave/impact-ring effects that should hug the ground/attach plane). */
function randomDirection(spread: number, flat: boolean): THREE.Vector3 {
  const theta = Math.random() * Math.PI * 2;
  const phi = flat ? Math.PI / 2 : Math.acos(1 - 2 * Math.random() * spread);
  const x = Math.sin(phi) * Math.cos(theta);
  const y = flat ? (Math.random() - 0.5) * 0.2 : Math.cos(phi);
  const z = Math.sin(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z).normalize();
}
