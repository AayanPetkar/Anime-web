import type { skillIconMap } from '@/components/effects/icons';

export type IconKey = keyof typeof skillIconMap;

const KEYWORD_MAP: [RegExp, IconKey][] = [
  [/orb|sphere/i, 'orb'],
  [/beam/i, 'beam'],
  [/void|expansion/i, 'void'],
  [/slash|wave/i, 'slash'],
  [/swirl|breath/i, 'breath'],
  [/burst|impact|flash|dash|surge/i, 'impact'],
];

/** Infers which abstract icon best represents a skill's completion effect. */
export function inferIcon(completionEffect: string): IconKey {
  const match = KEYWORD_MAP.find(([pattern]) => pattern.test(completionEffect));
  return match ? match[1] : 'orb';
}
