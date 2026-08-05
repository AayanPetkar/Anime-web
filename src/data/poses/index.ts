// Central reference-pose catalog: merges every anime's pose data into one
// lookup. Add a new anime by creating its folder + index.ts (see any sibling
// folder for the pattern) and listing it here — the training engine itself
// never changes.
import type { ReferencePose } from '@/types';
import { narutoPoses } from './naruto';
import { dragonBallPoses } from './dragon-ball';
import { bleachPoses } from './bleach';
import { jujutsuKaisenPoses } from './jujutsu-kaisen';
import { demonSlayerPoses } from './demon-slayer';
import { onePiecePoses } from './one-piece';
import { avatarPoses } from './avatar';

const ALL_POSES: Record<string, ReferencePose> = {
  ...narutoPoses,
  ...dragonBallPoses,
  ...bleachPoses,
  ...jujutsuKaisenPoses,
  ...demonSlayerPoses,
  ...onePiecePoses,
  ...avatarPoses,
};

/** Looks up a ReferencePose by id (matches SkillStep.pose / TrainingStep.requiredPose). */
export function getReferencePose(poseId: string): ReferencePose | undefined {
  return ALL_POSES[poseId];
}
