// Typed aggregator for the naruto skill catalog — import from here,
// not the raw JSON files, so consumers get Skill typing for free.
import type { Skill } from '@/types';

import rasengan from './rasengan.json';
import chidori from './chidori.json';
import fireballJutsu from './fireball-jutsu.json';
import shadowCloneJutsu from './shadow-clone-jutsu.json';
import waterDragonJutsu from './water-dragon-jutsu.json';

export const narutoSkills: Skill[] = [
  rasengan as Skill,
  chidori as Skill,
  fireballJutsu as Skill,
  shadowCloneJutsu as Skill,
  waterDragonJutsu as Skill,
];
