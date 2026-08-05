// Maps every catalog skill to a combination of reusable effects. The five
// presets the spec calls out by name (Rasengan, Kamehameha, Chidori,
// Fireball, Spirit Bomb) are hand-authored to match exactly; every other
// skill's preset is generated from its own `completionEffect` string via
// generic keyword rules — the same pattern used for pose-reference data in
// Step 5 — so a brand-new skill JSON gets a sensible preset with zero code
// changes here.
import type { EffectKind, EffectLayerConfig, SkillEffectPreset } from '@/features/effects';
import type { Skill } from '@/types';

const COLOR_WORDS: Record<string, string> = {
  blue: '#3ec6ff',
  cyan: '#3effe0',
  orange: '#ff8a3e',
  fire: '#ff6a3e',
  purple: '#a855f7',
  black: '#c084fc',
  red: '#ff3e5e',
  yellow: '#ffe23e',
  pink: '#ff3ec6',
  brown: '#c2793d',
};

function colorFromEffectName(effectName: string): string {
  for (const word of Object.keys(COLOR_WORDS)) {
    if (effectName.includes(word)) return COLOR_WORDS[word];
  }
  return '#3ec6ff';
}

function layer(
  kind: EffectKind,
  attach: EffectLayerConfig['attach'],
  color: string,
  extra: Partial<EffectLayerConfig> = {}
): EffectLayerConfig {
  return { kind, attach, color, ...extra };
}

/** Hand-authored presets for the exact combinations named in the spec. */
const NAMED_PRESETS: Record<string, SkillEffectPreset> = {
  'naruto-rasengan': {
    skillId: 'naruto-rasengan',
    chargeLayers: [
      layer('energyOrb', 'rightPalm', '#3ec6ff'),
      layer('wind', 'rightPalm', '#3effe0', { scale: 1.1 }),
      layer('glow', 'rightPalm', '#3ec6ff', { intensity: 0.7 }),
    ],
    completionLayers: [
      layer('shockwave', 'rightPalm', '#3ec6ff'),
      layer('sparks', 'rightPalm', '#3effe0'),
    ],
    cameraShake: { intensity: 0.4, durationMs: 300 },
  },
  'dragon-ball-kamehameha': {
    skillId: 'dragon-ball-kamehameha',
    chargeLayers: [
      layer('energyOrb', 'betweenHands', '#3ec6ff', { scale: 0.7, intensity: 0.8 }),
      layer('glow', 'betweenHands', '#3ec6ff', { intensity: 0.8 }),
    ],
    completionLayers: [
      layer('energyBeam', 'betweenHands', '#3ec6ff', { scale: 1.3, durationMs: 1200 }),
      layer('sparks', 'betweenHands', '#eaf6ff'),
    ],
    screenFlash: { color: '#3ec6ff', durationMs: 400 },
    cameraShake: { intensity: 0.8, durationMs: 450 },
  },
  'naruto-chidori': {
    skillId: 'naruto-chidori',
    chargeLayers: [
      layer('lightning', 'rightPalm', '#a855f7'),
      layer('glow', 'rightPalm', '#a855f7', { intensity: 0.6 }),
    ],
    completionLayers: [
      layer('sparks', 'rightPalm', '#c084fc'),
      layer('lightning', 'rightPalm', '#a855f7', { scale: 1.4, durationMs: 700 }),
    ],
    cameraShake: { intensity: 0.35, durationMs: 250 },
  },
  'naruto-fireball-jutsu': {
    skillId: 'naruto-fireball-jutsu',
    chargeLayers: [layer('fire', 'chest', '#ff6a3e', { scale: 0.7 })],
    completionLayers: [
      layer('fire', 'chest', '#ff6a3e', { scale: 1.6, durationMs: 1000 }),
      layer('smoke', 'chest', '#6b7280'),
    ],
    screenFlash: { color: '#ff8a3e', durationMs: 300 },
  },
  'dragon-ball-spirit-bomb': {
    skillId: 'dragon-ball-spirit-bomb',
    chargeLayers: [
      layer('energyOrb', 'aboveHead', '#ffe23e', { scale: 1.4 }),
      layer('glow', 'aboveHead', '#ffe23e', { intensity: 1 }),
    ],
    completionLayers: [
      layer('shockwave', 'aboveHead', '#ffe23e', { scale: 1.6 }),
      layer('sparks', 'aboveHead', '#ffffff'),
    ],
    screenFlash: { color: '#ffe23e', durationMs: 450 },
    cameraShake: { intensity: 0.7, durationMs: 500 },
  },
};

/** Generic fallback: builds a reasonable preset for any skill from its own
 * `completionEffect` keyword, so new skills "just work" without an entry here. */
function generatePreset(skill: Skill): SkillEffectPreset {
  const name = skill.completionEffect.toLowerCase();
  const color = colorFromEffectName(name);
  const attach: EffectLayerConfig['attach'] = name.includes('overhead')
    ? 'aboveHead'
    : name.includes('aura') || name.includes('expansion') || name.includes('surge')
      ? 'chest'
      : name.includes('dual') || name.includes('void')
        ? 'betweenHands'
        : 'rightPalm';

  let chargeLayers: EffectLayerConfig[];
  let completionLayers: EffectLayerConfig[];
  let screenFlash: SkillEffectPreset['screenFlash'];
  let cameraShake: SkillEffectPreset['cameraShake'];

  if (name.includes('beam')) {
    chargeLayers = [layer('energyOrb', attach, color, { scale: 0.6 }), layer('glow', attach, color, { intensity: 0.7 })];
    completionLayers = [layer('energyBeam', attach, color, { durationMs: 1000 }), layer('sparks', attach, color)];
    screenFlash = { color };
    cameraShake = { intensity: 0.6 };
  } else if (name.includes('sphere') || name.includes('orb')) {
    chargeLayers = [layer('energyOrb', attach, color), layer('glow', attach, color, { intensity: 0.6 })];
    completionLayers = [layer('shockwave', attach, color), layer('sparks', attach, color)];
    cameraShake = { intensity: 0.4 };
  } else if (name.includes('lightning') || name.includes('flash') || name.includes('dash') || name.includes('surge')) {
    chargeLayers = [layer('lightning', attach, color), layer('glow', attach, color, { intensity: 0.5 })];
    completionLayers = [layer('sparks', attach, color), layer('impactRing', attach, color)];
    cameraShake = { intensity: 0.45 };
  } else if (name.includes('flame') || name.includes('fire')) {
    chargeLayers = [layer('fire', attach, color, { scale: 0.7 })];
    completionLayers = [layer('fire', attach, color, { scale: 1.4, durationMs: 900 }), layer('smoke', attach, '#6b7280')];
    screenFlash = { color };
  } else if (name.includes('water')) {
    chargeLayers = [layer('water', attach, color, { scale: 0.8 })];
    completionLayers = [layer('water', attach, color, { scale: 1.3, durationMs: 800 }), layer('sparks', attach, color)];
  } else if (name.includes('wind') || name.includes('swirl')) {
    chargeLayers = [layer('wind', attach, color)];
    completionLayers = [layer('wind', attach, color, { scale: 1.4, durationMs: 800 }), layer('sparks', attach, color)];
  } else if (name.includes('void') || name.includes('expansion')) {
    chargeLayers = [layer('aura', attach, color, { intensity: 0.8 })];
    completionLayers = [layer('shockwave', attach, color, { scale: 1.5 }), layer('impactRing', attach, color)];
    screenFlash = { color };
    cameraShake = { intensity: 0.5 };
  } else if (name.includes('slash') || name.includes('wave')) {
    chargeLayers = [layer('aura', attach, color, { intensity: 0.6 })];
    completionLayers = [layer('impactRing', attach, color), layer('sparks', attach, color)];
    cameraShake = { intensity: 0.4 };
  } else if (name.includes('impact') || name.includes('burst')) {
    chargeLayers = [layer('aura', attach, color, { intensity: 0.5 })];
    completionLayers = [layer('impactRing', attach, color), layer('shockwave', attach, color)];
    cameraShake = { intensity: 0.55 };
  } else if (name.includes('rock')) {
    chargeLayers = [layer('aura', attach, color, { intensity: 0.5 })];
    completionLayers = [layer('shockwave', attach, color), layer('sparks', attach, color)];
    cameraShake = { intensity: 0.6 };
  } else {
    chargeLayers = [layer('aura', attach, color, { intensity: 0.6 })];
    completionLayers = [layer('sparks', attach, color), layer('glow', attach, color, { intensity: 0.8 })];
  }

  return { skillId: skill.id, chargeLayers, completionLayers, screenFlash, cameraShake };
}

/** Public lookup — always returns a preset, never undefined, so the
 * completion animation never has "nothing to play" for any skill. */
export function getEffectPreset(skill: Skill): SkillEffectPreset {
  return NAMED_PRESETS[skill.id] ?? generatePreset(skill);
}

const CONFETTI_PALETTE = ['#3ec6ff', '#a855f7', '#ff3ec6', '#3effe0', '#ffe23e', '#ff8a3e'];
const CONFETTI_ATTACH_POINTS: EffectLayerConfig['attach'][] = [
  'rightPalm',
  'leftPalm',
  'head',
  'chest',
  'aboveHead',
];

/**
 * Builds the "whole skill mastered" finale from a skill's normal completion
 * preset: its own completion layers, plus a scatter of confetti-style spark
 * bursts across every attach point, plus a stacked glow/aura pair for
 * maximum bloom, with screen flash and camera shake always present (even if
 * the base preset didn't request them) since this is the biggest moment in
 * the session.
 */
export function getFinalePreset(skill: Skill): SkillEffectPreset {
  const base = getEffectPreset(skill);

  const confetti: EffectLayerConfig[] = CONFETTI_ATTACH_POINTS.map((attach, i) =>
    layer('sparks', attach, CONFETTI_PALETTE[i % CONFETTI_PALETTE.length], {
      intensity: 1.4,
      scale: 1.2,
    })
  );

  const maxGlow: EffectLayerConfig[] = [
    layer('glow', 'chest', base.chargeLayers[0]?.color ?? '#3ec6ff', { intensity: 1.4, scale: 1.6 }),
    layer('aura', 'aboveHead', CONFETTI_PALETTE[1], { intensity: 1.2, scale: 1.4 }),
  ];

  return {
    skillId: skill.id,
    chargeLayers: [],
    completionLayers: [...base.completionLayers, ...confetti, ...maxGlow],
    screenFlash: { color: base.screenFlash?.color ?? '#ffffff', durationMs: 550 },
    cameraShake: { intensity: Math.max(0.6, base.cameraShake?.intensity ?? 0), durationMs: 550 },
  };
}
