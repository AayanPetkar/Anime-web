// Typed aggregator for the avatar reference-pose dataset.
import type { ReferencePose } from '@/types';

import avatarAirBendingPose1 from './avatar-air-bending-pose-1.json';
import avatarAirBendingPose2 from './avatar-air-bending-pose-2.json';
import avatarAirBendingPose3 from './avatar-air-bending-pose-3.json';
import avatarAirBendingPose4 from './avatar-air-bending-pose-4.json';
import avatarAirBendingPose5 from './avatar-air-bending-pose-5.json';
import avatarEarthBendingPose1 from './avatar-earth-bending-pose-1.json';
import avatarEarthBendingPose2 from './avatar-earth-bending-pose-2.json';
import avatarEarthBendingPose3 from './avatar-earth-bending-pose-3.json';
import avatarEarthBendingPose4 from './avatar-earth-bending-pose-4.json';
import avatarEarthBendingPose5 from './avatar-earth-bending-pose-5.json';
import avatarFireBendingPose1 from './avatar-fire-bending-pose-1.json';
import avatarFireBendingPose2 from './avatar-fire-bending-pose-2.json';
import avatarFireBendingPose3 from './avatar-fire-bending-pose-3.json';
import avatarFireBendingPose4 from './avatar-fire-bending-pose-4.json';
import avatarFireBendingPose5 from './avatar-fire-bending-pose-5.json';
import avatarWaterBendingPose1 from './avatar-water-bending-pose-1.json';
import avatarWaterBendingPose2 from './avatar-water-bending-pose-2.json';
import avatarWaterBendingPose3 from './avatar-water-bending-pose-3.json';
import avatarWaterBendingPose4 from './avatar-water-bending-pose-4.json';
import avatarWaterBendingPose5 from './avatar-water-bending-pose-5.json';

export const avatarPoses: Record<string, ReferencePose> = {
  'avatar-air-bending-pose-1': avatarAirBendingPose1 as ReferencePose,
  'avatar-air-bending-pose-2': avatarAirBendingPose2 as ReferencePose,
  'avatar-air-bending-pose-3': avatarAirBendingPose3 as ReferencePose,
  'avatar-air-bending-pose-4': avatarAirBendingPose4 as ReferencePose,
  'avatar-air-bending-pose-5': avatarAirBendingPose5 as ReferencePose,
  'avatar-earth-bending-pose-1': avatarEarthBendingPose1 as ReferencePose,
  'avatar-earth-bending-pose-2': avatarEarthBendingPose2 as ReferencePose,
  'avatar-earth-bending-pose-3': avatarEarthBendingPose3 as ReferencePose,
  'avatar-earth-bending-pose-4': avatarEarthBendingPose4 as ReferencePose,
  'avatar-earth-bending-pose-5': avatarEarthBendingPose5 as ReferencePose,
  'avatar-fire-bending-pose-1': avatarFireBendingPose1 as ReferencePose,
  'avatar-fire-bending-pose-2': avatarFireBendingPose2 as ReferencePose,
  'avatar-fire-bending-pose-3': avatarFireBendingPose3 as ReferencePose,
  'avatar-fire-bending-pose-4': avatarFireBendingPose4 as ReferencePose,
  'avatar-fire-bending-pose-5': avatarFireBendingPose5 as ReferencePose,
  'avatar-water-bending-pose-1': avatarWaterBendingPose1 as ReferencePose,
  'avatar-water-bending-pose-2': avatarWaterBendingPose2 as ReferencePose,
  'avatar-water-bending-pose-3': avatarWaterBendingPose3 as ReferencePose,
  'avatar-water-bending-pose-4': avatarWaterBendingPose4 as ReferencePose,
  'avatar-water-bending-pose-5': avatarWaterBendingPose5 as ReferencePose,
};
