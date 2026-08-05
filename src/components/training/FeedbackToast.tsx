'use client';

import { AnimatePresence, motion } from 'framer-motion';

interface FeedbackToastProps {
  message: string | null;
}

/**
 * The message itself is already debounced upstream (FeedbackEngine), so this
 * just needs a smooth crossfade — AnimatePresence's `mode="wait"` plus a key
 * on the message text prevents any double-render flicker between swaps.
 */
export function FeedbackToast({ message }: FeedbackToastProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="glass-panel rounded-full border border-neon-cyan/30 px-5 py-2 text-center font-display text-sm font-semibold text-white shadow-glow"
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
