// Typed aggregator for the one-piece skill catalog — import from here,
// not the raw JSON files, so consumers get Skill typing for free.
import type { Skill } from '@/types';

import gumGumPistol from './gum-gum-pistol.json';
import redHawk from './red-hawk.json';
import gearSecond from './gear-second.json';

export const onePieceSkills: Skill[] = [
  gumGumPistol as Skill,
  redHawk as Skill,
  gearSecond as Skill,
];
