// Typed aggregator for the dragon-ball reference-pose dataset.
import type { ReferencePose } from '@/types';

import dragonBallFinalFlashPose1 from './dragon-ball-final-flash-pose-1.json';
import dragonBallFinalFlashPose2 from './dragon-ball-final-flash-pose-2.json';
import dragonBallFinalFlashPose3 from './dragon-ball-final-flash-pose-3.json';
import dragonBallFinalFlashPose4 from './dragon-ball-final-flash-pose-4.json';
import dragonBallFinalFlashPose5 from './dragon-ball-final-flash-pose-5.json';
import dragonBallGalickGunPose1 from './dragon-ball-galick-gun-pose-1.json';
import dragonBallGalickGunPose2 from './dragon-ball-galick-gun-pose-2.json';
import dragonBallGalickGunPose3 from './dragon-ball-galick-gun-pose-3.json';
import dragonBallGalickGunPose4 from './dragon-ball-galick-gun-pose-4.json';
import dragonBallGalickGunPose5 from './dragon-ball-galick-gun-pose-5.json';
import dragonBallKamehamehaPose1 from './dragon-ball-kamehameha-pose-1.json';
import dragonBallKamehamehaPose2 from './dragon-ball-kamehameha-pose-2.json';
import dragonBallKamehamehaPose3 from './dragon-ball-kamehameha-pose-3.json';
import dragonBallKamehamehaPose4 from './dragon-ball-kamehameha-pose-4.json';
import dragonBallKamehamehaPose5 from './dragon-ball-kamehameha-pose-5.json';
import dragonBallSpiritBombPose1 from './dragon-ball-spirit-bomb-pose-1.json';
import dragonBallSpiritBombPose2 from './dragon-ball-spirit-bomb-pose-2.json';
import dragonBallSpiritBombPose3 from './dragon-ball-spirit-bomb-pose-3.json';
import dragonBallSpiritBombPose4 from './dragon-ball-spirit-bomb-pose-4.json';
import dragonBallSpiritBombPose5 from './dragon-ball-spirit-bomb-pose-5.json';

export const dragonBallPoses: Record<string, ReferencePose> = {
  'dragon-ball-final-flash-pose-1': dragonBallFinalFlashPose1 as ReferencePose,
  'dragon-ball-final-flash-pose-2': dragonBallFinalFlashPose2 as ReferencePose,
  'dragon-ball-final-flash-pose-3': dragonBallFinalFlashPose3 as ReferencePose,
  'dragon-ball-final-flash-pose-4': dragonBallFinalFlashPose4 as ReferencePose,
  'dragon-ball-final-flash-pose-5': dragonBallFinalFlashPose5 as ReferencePose,
  'dragon-ball-galick-gun-pose-1': dragonBallGalickGunPose1 as ReferencePose,
  'dragon-ball-galick-gun-pose-2': dragonBallGalickGunPose2 as ReferencePose,
  'dragon-ball-galick-gun-pose-3': dragonBallGalickGunPose3 as ReferencePose,
  'dragon-ball-galick-gun-pose-4': dragonBallGalickGunPose4 as ReferencePose,
  'dragon-ball-galick-gun-pose-5': dragonBallGalickGunPose5 as ReferencePose,
  'dragon-ball-kamehameha-pose-1': dragonBallKamehamehaPose1 as ReferencePose,
  'dragon-ball-kamehameha-pose-2': dragonBallKamehamehaPose2 as ReferencePose,
  'dragon-ball-kamehameha-pose-3': dragonBallKamehamehaPose3 as ReferencePose,
  'dragon-ball-kamehameha-pose-4': dragonBallKamehamehaPose4 as ReferencePose,
  'dragon-ball-kamehameha-pose-5': dragonBallKamehamehaPose5 as ReferencePose,
  'dragon-ball-spirit-bomb-pose-1': dragonBallSpiritBombPose1 as ReferencePose,
  'dragon-ball-spirit-bomb-pose-2': dragonBallSpiritBombPose2 as ReferencePose,
  'dragon-ball-spirit-bomb-pose-3': dragonBallSpiritBombPose3 as ReferencePose,
  'dragon-ball-spirit-bomb-pose-4': dragonBallSpiritBombPose4 as ReferencePose,
  'dragon-ball-spirit-bomb-pose-5': dragonBallSpiritBombPose5 as ReferencePose,
};
