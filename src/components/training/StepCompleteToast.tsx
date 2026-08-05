'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { StepGrade } from '@/types';

interface StepCompleteToastProps {
  /** Bump this (e.g. completedSteps.length) whenever a new step finishes. */
  completionCount: number;
  grade: StepGrade | null;
}

const GRADE_STYLE: Record<StepGrade, { color: string; label: string }> = {
  Perfect: { color: 'text-neon-cyan', label: '✓ Perfect' },
  Great: { color: 'text-neon-blue', label: '✓ Great' },
  Good: { color: 'text-neon-yellow', label: '✓ Good' },
};

export function StepCompleteToast({ completionCount, grade }: StepCompleteToastProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (completionCount === 0) return;
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1400);
    return () => clearTimeout(timer);
  }, [completionCount]);

  const style = grade ? GRADE_STYLE[grade] : null;

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <AnimatePresence>
        {visible && style && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.15 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className={`font-display text-4xl font-black drop-shadow-[0_0_20px_currentColor] md:text-6xl ${style.color}`}
          >
            {style.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
