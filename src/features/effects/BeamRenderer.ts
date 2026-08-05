// Reusable "Energy Beam" effect — a stretched, tapered cylinder with a
// flowing/scrolling shader pattern and a bright fresnel core, shot outward
// from the attach point toward the camera (a front-facing AR beam reads best
// flying at the viewer). Pooled: a small fixed set of beam meshes is reused.
import * as THREE from 'three';
import type { EffectHandle, EffectLayerConfig, EffectRenderer } from './EffectTypes';

const POOL_SIZE = 2;
const BASE_LENGTH = 1.6;
const BASE_RADIUS = 0.045;
const RADIAL_SEGMENTS = 16;
/** Front-facing camera overlay: the beam flies from the hand toward the viewer. */
const DEFAULT_DIRECTION = new THREE.Vector3(0, 0, 1);

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    float bands = sin(vUv.y * 24.0 - uTime * 9.0) * 0.5 + 0.5;
    float taperGlow = smoothstep(0.0, 0.15, vUv.y) * smoothstep(1.0, 0.85, vUv.y);
    float rim = pow(1.0 - abs(vNormal.z), 1.5);
    vec3 color = uColor * (1.0 + bands * 0.6) + rim * 0.5;
    float alpha = (0.55 + bands * 0.35) * taperGlow;
    gl_FragColor = vec4(color, alpha);
  }
`;

interface BeamSlot {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  active: boolean;
  handleId: number;
}

export class BeamRenderer implements EffectRenderer {
  readonly object3D: THREE.Group;
  private readonly slots: BeamSlot[] = [];
  private nextId = 1;

  constructor() {
    this.object3D = new THREE.Group();

    const geometry = new THREE.CylinderGeometry(
      BASE_RADIUS * 0.15,
      BASE_RADIUS,
      BASE_LENGTH,
      RADIAL_SEGMENTS,
      1,
      true
    );
    geometry.translate(0, BASE_LENGTH / 2, 0);
    geometry.rotateX(Math.PI / 2);

    for (let i = 0; i < POOL_SIZE; i++) {
      const material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: { uColor: { value: new THREE.Color('#3ec6ff') }, uTime: { value: 0 } },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = false;
      this.object3D.add(mesh);
      this.slots.push({ mesh, material, active: false, handleId: -1 });
    }
  }

  spawn(config: EffectLayerConfig, position: THREE.Vector3): EffectHandle {
    const slot = this.slots.find((s) => !s.active) ?? this.slots[0];
    const scale = config.scale ?? 1;
    slot.mesh.position.copy(position);
    slot.mesh.scale.set(scale, scale, scale * (config.intensity ?? 1));
    slot.mesh.lookAt(position.clone().add(DEFAULT_DIRECTION));
    slot.material.uniforms.uColor.value.set(config.color);
    slot.mesh.visible = true;
    slot.active = true;
    slot.handleId = this.nextId++;
    return { id: slot.handleId, kind: 'energyBeam' };
  }

  setPosition(handle: EffectHandle, position: THREE.Vector3): void {
    const slot = this.slots.find((s) => s.handleId === handle.id);
    if (!slot) return;
    slot.mesh.position.copy(position);
    slot.mesh.lookAt(position.clone().add(DEFAULT_DIRECTION));
  }

  update(_deltaSeconds: number, elapsedSeconds: number): void {
    for (const slot of this.slots) {
      if (slot.active) slot.material.uniforms.uTime.value = elapsedSeconds;
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
