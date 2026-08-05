// Typed aggregator for the jujutsu-kaisen skill catalog — import from here,
// not the raw JSON files, so consumers get Skill typing for free.
import type { Skill } from '@/types';

import hollowPurple from './hollow-purple.json';
import blackFlashStance from './black-flash-stance.json';
import domainExpansionPose from './domain-expansion-pose.json';

export const jujutsuKaisenSkills: Skill[] = [
  hollowPurple as Skill,
  blackFlashStance as Skill,
  domainExpansionPose as Skill,
];
