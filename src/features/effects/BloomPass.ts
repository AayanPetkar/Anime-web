// Wraps three.js's postprocessing pipeline (EffectComposer + RenderPass +
// UnrealBloomPass) into one reusable helper so every additive-blended
// effect above (orbs, beams, particles) gets a real glow/bloom pass instead
// of relying on emissive materials alone — this is what makes "Glow" and
// Spirit Bomb's "Bloom" mapping actually mean something visually.
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export interface BloomConfig {
  strength?: number;
  radius?: number;
  threshold?: number;
}

const DEFAULT_CONFIG: Required<BloomConfig> = {
  strength: 1.1,
  radius: 0.55,
  threshold: 0.15,
};

export class BloomPass {
  readonly composer: EffectComposer;
  private readonly bloomPass: UnrealBloomPass;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.Camera,
    size: { width: number; height: number },
    config: BloomConfig = {}
  ) {
    const merged = { ...DEFAULT_CONFIG, ...config };

    // `alpha: true` on the WebGLRenderer only lets the <canvas> context
    // composite with the DOM behind it — it does NOT set the renderer's own
    // clear alpha, which defaults to 1 (opaque). Since this composer owns
    // the entire render loop for this canvas (see EffectStage's
    // BloomRenderer, which calls composer.render() at useFrame priority 1),
    // every frame was clearing to opaque black and painting over whatever
    // sits behind the canvas — in this case, the live camera <video>.
    renderer.setClearAlpha(0);

    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(size.width, size.height),
      merged.strength,
      merged.radius,
      merged.threshold
    );
    this.composer.addPass(this.bloomPass);
    this.composer.addPass(new OutputPass());
  }

  setSize(width: number, height: number): void {
    this.composer.setSize(width, height);
    this.bloomPass.setSize(width, height);
  }

  /** Bump bloom intensity briefly for a completion flash, then let it settle
   * back — callers typically drive `strength` from ScreenFlash's opacity. */
  setStrength(strength: number): void {
    this.bloomPass.strength = strength;
  }

  render(): void {
    this.composer.render();
  }

  dispose(): void {
    this.composer.dispose();
  }
}
