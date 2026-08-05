// Typed aggregator for the bleach reference-pose dataset.
import type { ReferencePose } from '@/types';

import bleachBankaiActivationPose1 from './bleach-bankai-activation-pose-1.json';
import bleachBankaiActivationPose2 from './bleach-bankai-activation-pose-2.json';
import bleachBankaiActivationPose3 from './bleach-bankai-activation-pose-3.json';
import bleachBankaiActivationPose4 from './bleach-bankai-activation-pose-4.json';
import bleachBankaiActivationPose5 from './bleach-bankai-activation-pose-5.json';
import bleachGetsugaTenshouPose1 from './bleach-getsuga-tenshou-pose-1.json';
import bleachGetsugaTenshouPose2 from './bleach-getsuga-tenshou-pose-2.json';
import bleachGetsugaTenshouPose3 from './bleach-getsuga-tenshou-pose-3.json';
import bleachGetsugaTenshouPose4 from './bleach-getsuga-tenshou-pose-4.json';
import bleachGetsugaTenshouPose5 from './bleach-getsuga-tenshou-pose-5.json';

export const bleachPoses: Record<string, ReferencePose> = {
  'bleach-bankai-activation-pose-1': bleachBankaiActivationPose1 as ReferencePose,
  'bleach-bankai-activation-pose-2': bleachBankaiActivationPose2 as ReferencePose,
  'bleach-bankai-activation-pose-3': bleachBankaiActivationPose3 as ReferencePose,
  'bleach-bankai-activation-pose-4': bleachBankaiActivationPose4 as ReferencePose,
  'bleach-bankai-activation-pose-5': bleachBankaiActivationPose5 as ReferencePose,
  'bleach-getsuga-tenshou-pose-1': bleachGetsugaTenshouPose1 as ReferencePose,
  'bleach-getsuga-tenshou-pose-2': bleachGetsugaTenshouPose2 as ReferencePose,
  'bleach-getsuga-tenshou-pose-3': bleachGetsugaTenshouPose3 as ReferencePose,
  'bleach-getsuga-tenshou-pose-4': bleachGetsugaTenshouPose4 as ReferencePose,
  'bleach-getsuga-tenshou-pose-5': bleachGetsugaTenshouPose5 as ReferencePose,
};
