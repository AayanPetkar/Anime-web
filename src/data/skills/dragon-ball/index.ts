// Typed aggregator for the dragon-ball skill catalog — import from here,
// not the raw JSON files, so consumers get Skill typing for free.
import type { Skill } from '@/types';

import kamehameha from './kamehameha.json';
import finalFlash from './final-flash.json';
import galickGun from './galick-gun.json';
import spiritBomb from './spirit-bomb.json';

export const dragonBallSkills: Skill[] = [
  kamehameha as Skill,
  finalFlash as Skill,
  galickGun as Skill,
  spiritBomb as Skill,
];
