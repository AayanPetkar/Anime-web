// Reusable "Screen Flash" effect. A full-screen flash is inherently a 2D
// overlay concern, not a 3D object, so this is deliberately framework- and
// renderer-agnostic: pure timing/easing math. The host UI layer reads
// `.opacity` each frame and applies it to a CSS overlay (see
// components/effects/EffectStage.tsx), or a Three.js consumer could just as
// easily drive a full-screen quad's alpha with the same number.
export class ScreenFlash {
  private color = '#ffffff';
  private durationMs = 350;
  private startedAt: number | null = null;
  private active = false;

  trigger(color: string, durationMs = 350, nowMs = performance.now()): void {
    this.color = color;
    this.durationMs = durationMs;
    this.startedAt = nowMs;
    this.active = true;
  }

  /** Call once per frame. Returns current opacity (0-1) and the flash color. */
  update(nowMs: number): { opacity: number; color: string } {
    if (!this.active || this.startedAt === null) return { opacity: 0, color: this.color };

    const t = (nowMs - this.startedAt) / this.durationMs;
    if (t >= 1) {
      this.active = false;
      return { opacity: 0, color: this.color };
    }

    const opacity = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
    return { opacity: Math.max(0, Math.min(1, opacity)), color: this.color };
  }

  get isActive(): boolean {
    return this.active;
  }
}
