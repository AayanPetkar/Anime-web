// Original, anime-inspired preset avatars — gradient/glyph swatches, not
// reproductions of any studio's character art, so there's no IP concern in
// offering them as profile picture choices.

export interface AvatarPreset {
  id: string;
  label: string;
  from: string;
  to: string;
  glyph: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  { id: 'blaze', label: 'Blaze', from: '#ff8a3e', to: '#ff3e5e', glyph: '炎' },
  { id: 'frost', label: 'Frost', from: '#3ec6ff', to: '#3effe0', glyph: '氷' },
  { id: 'volt', label: 'Volt', from: '#a855f7', to: '#ffe23e', glyph: '雷' },
  { id: 'void', label: 'Void', from: '#a855f7', to: '#ff3ec6', glyph: '闇' },
  { id: 'bloom', label: 'Bloom', from: '#ff3ec6', to: '#ff8a3e', glyph: '花' },
  { id: 'tide', label: 'Tide', from: '#3ec6ff', to: '#a855f7', glyph: '水' },
  { id: 'gale', label: 'Gale', from: '#3effe0', to: '#3ec6ff', glyph: '風' },
  { id: 'ember', label: 'Ember', from: '#ffe23e', to: '#ff8a3e', glyph: '灯' },
];

export function getAvatarPreset(id: string | null | undefined): AvatarPreset {
  return AVATAR_PRESETS.find((p) => p.id === id) ?? AVATAR_PRESETS[0];
}
