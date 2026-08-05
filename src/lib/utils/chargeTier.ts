// Pure helpers bridging live training accuracy to Effect Engine intensity.
// Kept separate from both the training engine and the effect engine so
// neither has to know about the other's thresholds — this is the one place
// "60% / 75% / 90%" is defined.
import type { EffectLayerConfig, SkillEffectPreset } from '@/features/effects';

export const CHARGE_START_ACCURACY = 60;
export const CHARGE_DENSITY_ACCURACY = 75;
export const CHARGE_MAX_GLOW_ACCURACY = 90;

/** 0 = not charging, 1 = charging, 2 = denser particles, 3 = maximum glow. */
export type ChargeTier = 0 | 1 | 2 | 3;

export function getChargeTier(accuracy0to100: number): ChargeTier {
  if (accuracy0to100 >= CHARGE_MAX_GLOW_ACCURACY) return 3;
  if (accuracy0to100 >= CHARGE_DENSITY_ACCURACY) return 2;
  if (accuracy0to100 >= CHARGE_START_ACCURACY) return 1;
  return 0;
}

const TIER_MULTIPLIER: Record<ChargeTier, { intensity: number; scale: number }> = {
  0: { intensity: 0, scale: 0 },
  1: { intensity: 0.7, scale: 0.85 },
  2: { intensity: 1.0, scale: 1.05 },
  3: { intensity: 1.35, scale: 1.25 },
};

/**
 * Scales a preset's charge layers by tier — this is how "increase intensity
 * smoothly", "75%: increase particle density", and "90%: maximum glow" are
 * actually implemented: higher tiers boost each layer's own intensity/scale
 * (which the renderers already use to drive particle rate/size), and tier 3
 * guarantees a strong glow/aura layer is present.
 */
export function applyChargeTier(preset: SkillEffectPreset, tier: ChargeTier): SkillEffectPreset {
  const mult = TIER_MULTIPLIER[tier];

  const chargeLayers: EffectLayerConfig[] = preset.chargeLayers.map((layer) => ({
    ...layer,
    intensity: (layer.intensity ?? 1) * mult.intensity,
    scale: (layer.scale ?? 1) * mult.scale,
  }));

  if (tier >= 3 && !chargeLayers.some((l) => l.kind === 'glow' || l.kind === 'aura')) {
    const anchor = chargeLayers[0];
    chargeLayers.push({
      kind: 'glow',
      attach: anchor?.attach ?? 'chest',
      color: anchor?.color ?? '#ffffff',
      intensity: 1.2,
      scale: 1.3,
    });
  }

  return { ...preset, chargeLayers };
}
