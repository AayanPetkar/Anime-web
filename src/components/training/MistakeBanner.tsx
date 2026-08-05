'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { MistakeType } from '@/types';

interface MistakeBannerProps {
  mistake: MistakeType | null;
  message: string | null;
}

const ICON: Record<MistakeType, string> = {
  'person-left-frame': '🚶',
  'hands-not-visible': '✋',
  'multiple-people': '👥',
  'camera-blocked': '📷',
  'tracking-lost': '📡',
  'low-confidence': '💡',
};

export function MistakeBanner({ mistake, message }: MistakeBannerProps) {
  return (
    <AnimatePresence>
      {mistake && message && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.3 }}
          className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center px-6"
        >
          <div className="glass-panel flex items-center gap-3 rounded-2xl border border-neon-red/40 bg-neon-red/10 px-5 py-3 text-center">
            <span className="text-xl">{ICON[mistake]}</span>
            <p className="font-display text-sm font-semibold text-white">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
