// Typed aggregator for the bleach skill catalog — import from here,
// not the raw JSON files, so consumers get Skill typing for free.
import type { Skill } from '@/types';

import getsugaTenshou from './getsuga-tenshou.json';
import bankaiActivation from './bankai-activation.json';

export const bleachSkills: Skill[] = [
  getsugaTenshou as Skill,
  bankaiActivation as Skill,
];
