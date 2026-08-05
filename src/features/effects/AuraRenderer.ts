// Reusable "Aura" / "Glow" effect — a soft, pulsating radial-gradient
// billboard (always faces the camera) used for full-body auras, chest glows,
// or as a glow halo behind other effects (e.g. bloom-boosted highlights).
// Pooled: a fixed set of sprites is created once and reused.
import * as THREE from 'three';
import type { EffectHandle, EffectLayerConfig, EffectRenderer } from './EffectTypes';

const POOL_SIZE = 4;
const BASE_SIZE = 0.5;

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  void main() {
    vec2 centered = vUv - 0.5;
    float d = length(centered) * 2.0;
    float pulse = 0.85 + 0.15 * sin(uTime * 3.0);
    float falloff = smoothstep(1.0, 0.0, d) * pulse;
    float alpha = falloff * falloff * uIntensity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

interface AuraSlot {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  active: boolean;
  handleId: number;
}

/** Billboard geometry: a flat quad that AuraRenderer keeps facing the camera
 * every frame via quaternion copy (see update()). */
export class AuraRenderer implements EffectRenderer {
  readonly object3D: THREE.Group;
  private readonly slots: AuraSlot[] = [];
  private nextId = 1;
  private cameraQuaternion = new THREE.Quaternion();

  constructor() {
    this.object3D = new THREE.Group();
    const geometry = new THREE.PlaneGeometry(BASE_SIZE, BASE_SIZE);

    for (let i = 0; i < POOL_SIZE; i++) {
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uColor: { value: new THREE.Color('#a855f7') },
          uTime: { value: 0 },
          uIntensity: { value: 0.6 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      this.object3D.add(mesh);
      this.slots.push({ mesh, material, active: false, handleId: -1 });
    }
  }

  /** Call once per frame with the active camera's world quaternion so every
   * aura billboard faces the viewer (cheap: one quaternion copy per slot). */
  setCameraOrientation(quaternion: THREE.Quaternion): void {
    this.cameraQuaternion.copy(quaternion);
  }

  spawn(config: EffectLayerConfig, position: THREE.Vector3): EffectHandle {
    const slot = this.slots.find((s) => !s.active) ?? this.slots[0];
    const scale = config.scale ?? 1;
    slot.mesh.position.copy(position);
    slot.mesh.scale.setScalar(scale);
    slot.material.uniforms.uColor.value.set(config.color);
    slot.material.uniforms.uIntensity.value = config.intensity ?? 0.6;
    slot.mesh.visible = true;
    slot.active = true;
    slot.handleId = this.nextId++;
    return { id: slot.handleId, kind: 'aura' };
  }

  setPosition(handle: EffectHandle, position: THREE.Vector3): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    slot?.mesh.position.copy(position);
  }

  update(_deltaSeconds: number, elapsedSeconds: number): void {
    for (const slot of this.slots) {
      if (!slot.active) continue;
      slot.material.uniforms.uTime.value = elapsedSeconds;
      slot.mesh.quaternion.copy(this.cameraQuaternion);
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
    for (const slot of this.slots) {
      slot.mesh.geometry.dispose();
      slot.material.dispose();
    }
  }
}
