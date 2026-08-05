'use client';

import { motion } from 'framer-motion';
import type { AccentTheme } from '@/types';
import { skillIconMap } from '@/components/effects/icons';
import type { IconKey } from '@/lib/utils';

interface AnimatedPreviewProps {
  icon: IconKey;
  accent: AccentTheme;
}

/**
 * A lightweight "animated preview" for the skill detail page — a pulsing
 * glow behind the technique's abstract icon plus a slowly orbiting ring.
 * This stands in for a recorded reference clip until real preview assets
 * (previewAsset in the skill JSON) are produced.
 */
export function AnimatedPreview({ icon, accent }: AnimatedPreviewProps) {
  const Icon = skillIconMap[icon];

  return (
    <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-black/40">
      <motion.div
        className="absolute h-40 w-40 rounded-full"
        style={{ background: `radial-gradient(circle, ${accent.hex}55, transparent 70%)` }}
        animate={{ scale: [1, 1.25, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute h-44 w-44 rounded-full border"
        style={{ borderColor: `${accent.hex}55` }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute h-56 w-56 rounded-full border border-dashed"
        style={{ borderColor: `${accent.hex}33` }}
        animate={{ rotate: -360 }}
        transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
      />
      <Icon color={accent.hex} className="relative h-20 w-20" />
    </div>
  );
}
