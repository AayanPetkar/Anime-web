'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { AccentTheme, SessionState } from '@/types';

interface SessionCompleteModalProps {
  session: SessionState;
  accent: AccentTheme;
  skillName: string;
  xpReward: number;
  onRestart: () => void;
}

export function SessionCompleteModal({
  session,
  accent,
  skillName,
  xpReward,
  onRestart,
}: SessionCompleteModalProps) {
  if (!session.isSessionComplete) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-20 flex items-center justify-center bg-background/85 p-6 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="glass-panel w-full max-w-sm rounded-2xl border border-white/10 p-6 text-center"
      >
        <p className={`font-display text-xs font-semibold uppercase tracking-[0.25em] ${accent.text}`}>
          Technique Mastered
        </p>
        <h3 className="mt-2 font-display text-2xl font-bold text-white">{skillName}</h3>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/10 py-3">
            <p className="font-display text-xl font-bold text-neon-cyan">{session.bestAccuracy}%</p>
            <p className="text-[11px] uppercase tracking-wide text-muted">Best Accuracy</p>
          </div>
          <div className="rounded-xl border border-white/10 py-3">
            <p className="font-display text-xl font-bold text-neon-yellow">+{xpReward}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted">XP Earned</p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button onClick={onRestart} className="btn-primary !py-2.5 text-sm">
            Practice Again
          </button>
          <Link href="/skills" className="btn-ghost !py-2.5 text-sm">
            Choose Another Skill
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}
