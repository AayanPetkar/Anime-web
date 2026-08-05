// Reusable "Camera Shake" effect. Like ScreenFlash, this is pure math with
// no THREE dependency of its own — the host applies the returned offset to
// its camera's position/rotation each frame (see components/effects/
// EffectStage.tsx), keeping this class trivially reusable outside Three.js
// too (e.g. shaking a CSS transform instead).
export interface ShakeOffset {
  x: number;
  y: number;
  rotationZ: number;
}

export class CameraShake {
  private intensity = 0;
  private durationMs = 400;
  private startedAt: number | null = null;
  private active = false;
  private seed = Math.random() * 1000;

  trigger(intensity = 0.6, durationMs = 400, nowMs = performance.now()): void {
    this.intensity = intensity;
    this.durationMs = durationMs;
    this.startedAt = nowMs;
    this.active = true;
  }

  /** Call once per frame. Returns a small positional/rotational offset that
   * decays to zero over the shake's duration. */
  update(nowMs: number): ShakeOffset {
    if (!this.active || this.startedAt === null) return { x: 0, y: 0, rotationZ: 0 };

    const elapsed = nowMs - this.startedAt;
    const t = elapsed / this.durationMs;
    if (t >= 1) {
      this.active = false;
      return { x: 0, y: 0, rotationZ: 0 };
    }

    const decay = 1 - t;
    const freq = 40;
    const time = elapsed / 1000;
    const x = pseudoNoise(time * freq + this.seed) * this.intensity * decay * 0.06;
    const y = pseudoNoise(time * freq + this.seed + 91.7) * this.intensity * decay * 0.06;
    const rotationZ = pseudoNoise(time * freq + this.seed + 233.1) * this.intensity * decay * 0.02;

    return { x, y, rotationZ };
  }

  get isActive(): boolean {
    return this.active;
  }
}

/** Deterministic, allocation-free pseudo-noise in roughly [-1, 1] — cheap
 * stand-in for Perlin noise, good enough for a screen-shake wobble. */
function pseudoNoise(x: number): number {
  const s = Math.sin(x * 12.9898) * 43758.5453;
  return (s - Math.floor(s)) * 2 - 1;
}
