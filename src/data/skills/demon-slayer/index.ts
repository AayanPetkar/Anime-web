// Typed aggregator for the demon-slayer skill catalog — import from here,
// not the raw JSON files, so consumers get Skill typing for free.
import type { Skill } from '@/types';

import waterBreathing from './water-breathing.json';
import flameBreathing from './flame-breathing.json';
import thunderBreathing from './thunder-breathing.json';

export const demonSlayerSkills: Skill[] = [
  waterBreathing as Skill,
  flameBreathing as Skill,
  thunderBreathing as Skill,
];
