'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import type { MergeStrategy } from '@/features/progress';

const OPTIONS: { strategy: MergeStrategy; label: string; description: string }[] = [
  {
    strategy: 'merge',
    label: 'Merge',
    description: 'Combine your guest progress with this account (XP added, best records kept).',
  },
  {
    strategy: 'replace',
    label: 'Replace Cloud',
    description: 'Overwrite this account\u2019s cloud progress with your guest progress.',
  },
  {
    strategy: 'discard',
    label: 'Discard Local',
    description: 'Keep this account\u2019s cloud progress and drop your guest progress.',
  },
];

/** Mounted once near the app root; renders itself only when useAuth() has a
 * pending merge prompt (a guest with local progress just signed in). */
export function MergeProgressDialog() {
  const { mergePrompt, resolveMerge } = useAuth();
  const [pending, setPending] = useState<MergeStrategy | null>(null);

  const handleChoose = async (strategy: MergeStrategy) => {
    setPending(strategy);
    try {
      await resolveMerge(strategy);
    } finally {
      setPending(null);
    }
  };

  return (
    <AnimatePresence>
      {mergePrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 p-6 backdrop-blur-md"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="glass-panel w-full max-w-md rounded-2xl border border-white/10 p-6"
          >
            <h3 className="font-display text-lg font-bold text-white">
              Merge your local progress?
            </h3>
            <p className="mt-2 text-sm text-muted">
              You practiced as a guest before signing in. What should happen to that progress?
            </p>

            <div className="mt-5 flex flex-col gap-2">
              {OPTIONS.map((opt) => (
                <button
                  key={opt.strategy}
                  onClick={() => handleChoose(opt.strategy)}
                  disabled={pending !== null}
                  className="rounded-xl border border-white/15 p-3 text-left transition-colors hover:border-neon-blue/60 hover:bg-white/5 disabled:opacity-50"
                >
                  <p className="font-display text-sm font-semibold text-white">
                    {pending === opt.strategy ? 'Working…' : opt.label}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">{opt.description}</p>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
