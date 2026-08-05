// Typed aggregator for the avatar skill catalog — import from here,
// not the raw JSON files, so consumers get Skill typing for free.
import type { Skill } from '@/types';

import fireBending from './fire-bending.json';
import waterBending from './water-bending.json';
import airBending from './air-bending.json';
import earthBending from './earth-bending.json';

export const avatarSkills: Skill[] = [
  fireBending as Skill,
  waterBending as Skill,
  airBending as Skill,
  earthBending as Skill,
];
