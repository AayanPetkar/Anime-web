// Typed aggregator for the one-piece reference-pose dataset.
import type { ReferencePose } from '@/types';

import onePieceGearSecondPose1 from './one-piece-gear-second-pose-1.json';
import onePieceGearSecondPose2 from './one-piece-gear-second-pose-2.json';
import onePieceGearSecondPose3 from './one-piece-gear-second-pose-3.json';
import onePieceGearSecondPose4 from './one-piece-gear-second-pose-4.json';
import onePieceGearSecondPose5 from './one-piece-gear-second-pose-5.json';
import onePieceGumGumPistolPose1 from './one-piece-gum-gum-pistol-pose-1.json';
import onePieceGumGumPistolPose2 from './one-piece-gum-gum-pistol-pose-2.json';
import onePieceGumGumPistolPose3 from './one-piece-gum-gum-pistol-pose-3.json';
import onePieceGumGumPistolPose4 from './one-piece-gum-gum-pistol-pose-4.json';
import onePieceGumGumPistolPose5 from './one-piece-gum-gum-pistol-pose-5.json';
import onePieceRedHawkPose1 from './one-piece-red-hawk-pose-1.json';
import onePieceRedHawkPose2 from './one-piece-red-hawk-pose-2.json';
import onePieceRedHawkPose3 from './one-piece-red-hawk-pose-3.json';
import onePieceRedHawkPose4 from './one-piece-red-hawk-pose-4.json';
import onePieceRedHawkPose5 from './one-piece-red-hawk-pose-5.json';

export const onePiecePoses: Record<string, ReferencePose> = {
  'one-piece-gear-second-pose-1': onePieceGearSecondPose1 as ReferencePose,
  'one-piece-gear-second-pose-2': onePieceGearSecondPose2 as ReferencePose,
  'one-piece-gear-second-pose-3': onePieceGearSecondPose3 as ReferencePose,
  'one-piece-gear-second-pose-4': onePieceGearSecondPose4 as ReferencePose,
  'one-piece-gear-second-pose-5': onePieceGearSecondPose5 as ReferencePose,
  'one-piece-gum-gum-pistol-pose-1': onePieceGumGumPistolPose1 as ReferencePose,
  'one-piece-gum-gum-pistol-pose-2': onePieceGumGumPistolPose2 as ReferencePose,
  'one-piece-gum-gum-pistol-pose-3': onePieceGumGumPistolPose3 as ReferencePose,
  'one-piece-gum-gum-pistol-pose-4': onePieceGumGumPistolPose4 as ReferencePose,
  'one-piece-gum-gum-pistol-pose-5': onePieceGumGumPistolPose5 as ReferencePose,
  'one-piece-red-hawk-pose-1': onePieceRedHawkPose1 as ReferencePose,
  'one-piece-red-hawk-pose-2': onePieceRedHawkPose2 as ReferencePose,
  'one-piece-red-hawk-pose-3': onePieceRedHawkPose3 as ReferencePose,
  'one-piece-red-hawk-pose-4': onePieceRedHawkPose4 as ReferencePose,
  'one-piece-red-hawk-pose-5': onePieceRedHawkPose5 as ReferencePose,
};
