// Typed aggregator for the jujutsu-kaisen reference-pose dataset.
import type { ReferencePose } from '@/types';

import jujutsuKaisenBlackFlashStancePose1 from './jujutsu-kaisen-black-flash-stance-pose-1.json';
import jujutsuKaisenBlackFlashStancePose2 from './jujutsu-kaisen-black-flash-stance-pose-2.json';
import jujutsuKaisenBlackFlashStancePose3 from './jujutsu-kaisen-black-flash-stance-pose-3.json';
import jujutsuKaisenBlackFlashStancePose4 from './jujutsu-kaisen-black-flash-stance-pose-4.json';
import jujutsuKaisenBlackFlashStancePose5 from './jujutsu-kaisen-black-flash-stance-pose-5.json';
import jujutsuKaisenDomainExpansionPosePose1 from './jujutsu-kaisen-domain-expansion-pose-pose-1.json';
import jujutsuKaisenDomainExpansionPosePose2 from './jujutsu-kaisen-domain-expansion-pose-pose-2.json';
import jujutsuKaisenDomainExpansionPosePose3 from './jujutsu-kaisen-domain-expansion-pose-pose-3.json';
import jujutsuKaisenDomainExpansionPosePose4 from './jujutsu-kaisen-domain-expansion-pose-pose-4.json';
import jujutsuKaisenDomainExpansionPosePose5 from './jujutsu-kaisen-domain-expansion-pose-pose-5.json';
import jujutsuKaisenHollowPurplePose1 from './jujutsu-kaisen-hollow-purple-pose-1.json';
import jujutsuKaisenHollowPurplePose2 from './jujutsu-kaisen-hollow-purple-pose-2.json';
import jujutsuKaisenHollowPurplePose3 from './jujutsu-kaisen-hollow-purple-pose-3.json';
import jujutsuKaisenHollowPurplePose4 from './jujutsu-kaisen-hollow-purple-pose-4.json';
import jujutsuKaisenHollowPurplePose5 from './jujutsu-kaisen-hollow-purple-pose-5.json';

export const jujutsuKaisenPoses: Record<string, ReferencePose> = {
  'jujutsu-kaisen-black-flash-stance-pose-1': jujutsuKaisenBlackFlashStancePose1 as ReferencePose,
  'jujutsu-kaisen-black-flash-stance-pose-2': jujutsuKaisenBlackFlashStancePose2 as ReferencePose,
  'jujutsu-kaisen-black-flash-stance-pose-3': jujutsuKaisenBlackFlashStancePose3 as ReferencePose,
  'jujutsu-kaisen-black-flash-stance-pose-4': jujutsuKaisenBlackFlashStancePose4 as ReferencePose,
  'jujutsu-kaisen-black-flash-stance-pose-5': jujutsuKaisenBlackFlashStancePose5 as ReferencePose,
  'jujutsu-kaisen-domain-expansion-pose-pose-1': jujutsuKaisenDomainExpansionPosePose1 as ReferencePose,
  'jujutsu-kaisen-domain-expansion-pose-pose-2': jujutsuKaisenDomainExpansionPosePose2 as ReferencePose,
  'jujutsu-kaisen-domain-expansion-pose-pose-3': jujutsuKaisenDomainExpansionPosePose3 as ReferencePose,
  'jujutsu-kaisen-domain-expansion-pose-pose-4': jujutsuKaisenDomainExpansionPosePose4 as ReferencePose,
  'jujutsu-kaisen-domain-expansion-pose-pose-5': jujutsuKaisenDomainExpansionPosePose5 as ReferencePose,
  'jujutsu-kaisen-hollow-purple-pose-1': jujutsuKaisenHollowPurplePose1 as ReferencePose,
  'jujutsu-kaisen-hollow-purple-pose-2': jujutsuKaisenHollowPurplePose2 as ReferencePose,
  'jujutsu-kaisen-hollow-purple-pose-3': jujutsuKaisenHollowPurplePose3 as ReferencePose,
  'jujutsu-kaisen-hollow-purple-pose-4': jujutsuKaisenHollowPurplePose4 as ReferencePose,
  'jujutsu-kaisen-hollow-purple-pose-5': jujutsuKaisenHollowPurplePose5 as ReferencePose,
};
