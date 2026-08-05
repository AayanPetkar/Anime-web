// Typed aggregator for the demon-slayer reference-pose dataset.
import type { ReferencePose } from '@/types';

import demonSlayerFlameBreathingPose1 from './demon-slayer-flame-breathing-pose-1.json';
import demonSlayerFlameBreathingPose2 from './demon-slayer-flame-breathing-pose-2.json';
import demonSlayerFlameBreathingPose3 from './demon-slayer-flame-breathing-pose-3.json';
import demonSlayerFlameBreathingPose4 from './demon-slayer-flame-breathing-pose-4.json';
import demonSlayerFlameBreathingPose5 from './demon-slayer-flame-breathing-pose-5.json';
import demonSlayerThunderBreathingPose1 from './demon-slayer-thunder-breathing-pose-1.json';
import demonSlayerThunderBreathingPose2 from './demon-slayer-thunder-breathing-pose-2.json';
import demonSlayerThunderBreathingPose3 from './demon-slayer-thunder-breathing-pose-3.json';
import demonSlayerThunderBreathingPose4 from './demon-slayer-thunder-breathing-pose-4.json';
import demonSlayerThunderBreathingPose5 from './demon-slayer-thunder-breathing-pose-5.json';
import demonSlayerWaterBreathingPose1 from './demon-slayer-water-breathing-pose-1.json';
import demonSlayerWaterBreathingPose2 from './demon-slayer-water-breathing-pose-2.json';
import demonSlayerWaterBreathingPose3 from './demon-slayer-water-breathing-pose-3.json';
import demonSlayerWaterBreathingPose4 from './demon-slayer-water-breathing-pose-4.json';
import demonSlayerWaterBreathingPose5 from './demon-slayer-water-breathing-pose-5.json';

export const demonSlayerPoses: Record<string, ReferencePose> = {
  'demon-slayer-flame-breathing-pose-1': demonSlayerFlameBreathingPose1 as ReferencePose,
  'demon-slayer-flame-breathing-pose-2': demonSlayerFlameBreathingPose2 as ReferencePose,
  'demon-slayer-flame-breathing-pose-3': demonSlayerFlameBreathingPose3 as ReferencePose,
  'demon-slayer-flame-breathing-pose-4': demonSlayerFlameBreathingPose4 as ReferencePose,
  'demon-slayer-flame-breathing-pose-5': demonSlayerFlameBreathingPose5 as ReferencePose,
  'demon-slayer-thunder-breathing-pose-1': demonSlayerThunderBreathingPose1 as ReferencePose,
  'demon-slayer-thunder-breathing-pose-2': demonSlayerThunderBreathingPose2 as ReferencePose,
  'demon-slayer-thunder-breathing-pose-3': demonSlayerThunderBreathingPose3 as ReferencePose,
  'demon-slayer-thunder-breathing-pose-4': demonSlayerThunderBreathingPose4 as ReferencePose,
  'demon-slayer-thunder-breathing-pose-5': demonSlayerThunderBreathingPose5 as ReferencePose,
  'demon-slayer-water-breathing-pose-1': demonSlayerWaterBreathingPose1 as ReferencePose,
  'demon-slayer-water-breathing-pose-2': demonSlayerWaterBreathingPose2 as ReferencePose,
  'demon-slayer-water-breathing-pose-3': demonSlayerWaterBreathingPose3 as ReferencePose,
  'demon-slayer-water-breathing-pose-4': demonSlayerWaterBreathingPose4 as ReferencePose,
  'demon-slayer-water-breathing-pose-5': demonSlayerWaterBreathingPose5 as ReferencePose,
};
