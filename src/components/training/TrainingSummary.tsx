'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { AccentTheme, SessionState, Skill } from '@/types';
import type { RankResult } from '@/features/progress';
import { formatDuration } from '@/lib/utils';

interface TrainingSummaryProps {
  skill: Skill;
  session: SessionState;
  rank: RankResult;
  overallAccuracy: number;
  accent: AccentTheme;
  onRetry: () => void;
  onNextSkill: () => void;
}

const RANK_COLOR: Record<RankResult['rank'], string> = {
  S: 'text-neon-yellow',
  A: 'text-neon-cyan',
  B: 'text-neon-blue',
  C: 'text-neon-orange',
  D: 'text-neon-red',
};

/**
 * The post-skill screen. Its entrance (dark fade-in + slow, staggered
 * reveal) is deliberately the "cinematic" pacing the spec asks for — the
 * actual particle/bloom cinematic is already playing behind it via the
 * single EffectStage instance TrainingSessionView owns (see the finale
 * preset swap there); this component doesn't run a second one.
 */
export function TrainingSummary({
  skill,
  session,
  rank,
  overallAccuracy,
  accent,
  onRetry,
  onNextSkill,
}: TrainingSummaryProps) {
  const stepsByAccuracy = [...session.completedSteps].sort(
    (a, b) => b.accuracyAtCompletion - a.accuracyAtCompletion
  );
  const best = stepsByAccuracy[0];
  const worst = stepsByAccuracy[stepsByAccuracy.length - 1];
  const stepInstruction = (stepId: number | undefined) =>
    skill.steps.find((s) => s.id === stepId)?.instruction ?? '—';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.1, ease: 'easeOut' }}
      className="absolute inset-0 z-30 flex items-center justify-center overflow-y-auto bg-background/92 p-6 backdrop-blur-md"
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: 'easeOut' }}
        className="glass-panel my-8 w-full max-w-lg rounded-2xl border border-white/10 p-6 md:p-8"
      >
        <div className="text-center">
          <p className={`font-display text-xs font-semibold uppercase tracking-[0.3em] ${accent.text}`}>
            {skill.anime}
          </p>
          <h2 className="mt-2 font-display text-2xl font-black text-white md:text-3xl">
            Technique Mastered
          </h2>
          <p className="mt-1 font-display text-lg font-bold text-white/90">{skill.name}</p>

          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.9, type: 'spring' }}
            className={`mx-auto mt-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-current font-display text-4xl font-black ${RANK_COLOR[rank.rank]}`}
          >
            {rank.rank}
          </motion.div>

          <div className="mt-4 flex justify-center gap-6 text-sm text-muted">
            <span>
              XP <span className="font-display font-bold text-neon-yellow">+{skill.xpReward}</span>
            </span>
            <span>
              Accuracy <span className="font-display font-bold text-white">{Math.round(overallAccuracy)}%</span>
            </span>
            <span>
              Time <span className="font-display font-bold text-white">{formatDuration(session.sessionTimeMs)}</span>
            </span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-8 grid grid-cols-2 gap-3"
        >
          <Stat label="Overall Accuracy" value={`${Math.round(overallAccuracy)}%`} />
          <Stat label="Pose Accuracy" value={`${session.poseAccuracy}%`} />
          <Stat label="Hand Accuracy" value={`${session.handAccuracy}%`} />
          <Stat label="Total Time" value={formatDuration(session.sessionTimeMs)} />
          <Stat
            label="Best Step"
            value={best ? `${Math.round(best.accuracyAtCompletion * 100)}%` : '—'}
            detail={stepInstruction(best?.stepId)}
          />
          <Stat
            label="Worst Step"
            value={worst ? `${Math.round(worst.accuracyAtCompletion * 100)}%` : '—'}
            detail={stepInstruction(worst?.stepId)}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.6 }}
          className="mt-8 flex flex-col gap-2"
        >
          <button onClick={onRetry} className="btn-primary !py-2.5 text-sm">
            Retry
          </button>
          <button onClick={onNextSkill} className="btn-ghost !py-2.5 text-sm">
            Next Skill
          </button>
          <Link href="/" className="btn-ghost !py-2.5 text-sm text-center">
            Return Home
          </Link>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function Stat({ label, value, detail }: { label: string; value: string; detail?: string }) {
  return (
    <div className="rounded-xl border border-white/10 p-3">
      <p className="font-display text-lg font-bold text-white">{value}</p>
      <p className="text-[11px] uppercase tracking-wide text-muted">{label}</p>
      {detail && <p className="mt-1 truncate text-[11px] text-muted/70">{detail}</p>}
    </div>
  );
}
