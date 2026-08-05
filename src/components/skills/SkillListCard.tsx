'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import type { Skill } from '@/types';
import { ANIME_THEME, DEFAULT_ACCENT } from '@/constants';
import { skillIconMap } from '@/components/effects/icons';
import { inferIcon } from '@/lib/utils';

const difficultyStyles: Record<Skill['difficulty'], string> = {
  Beginner: 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10',
  Intermediate: 'text-neon-orange border-neon-orange/40 bg-neon-orange/10',
  Advanced: 'text-neon-red border-neon-red/40 bg-neon-red/10',
};

interface CatalogSkillCardProps {
  skill: Skill;
  index?: number;
}

export function CatalogSkillCard({ skill, index = 0 }: CatalogSkillCardProps) {
  const accent = ANIME_THEME[skill.animeSlug] ?? DEFAULT_ACCENT;
  const Icon = skillIconMap[inferIcon(skill.completionEffect)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.4, delay: Math.min(index, 8) * 0.05 }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`group relative flex flex-col gap-3 rounded-xl border ${accent.border} glass-panel p-5 transition-shadow duration-300 hover:shadow-[0_0_30px_-10px_var(--tw-shadow-color)]`}
      style={{ ['--tw-shadow-color' as string]: accent.hex }}
    >
      <div className="flex items-center gap-3">
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${accent.border} bg-black/30`}
        >
          <Icon color={accent.hex} className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className={`truncate text-xs font-semibold uppercase tracking-wide ${accent.text}`}>
            {skill.anime}
          </p>
          <h3 className="truncate font-display text-base font-bold text-white">
            {skill.name}
          </h3>
        </div>
      </div>

      <p className="line-clamp-2 text-sm text-muted">{skill.description}</p>

      <div className="mt-1 flex items-center justify-between">
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${difficultyStyles[skill.difficulty]}`}
        >
          {skill.difficulty}
        </span>
        <span className="text-xs text-muted">
          ~{skill.estimatedLearningTimeMinutes} min
        </span>
      </div>

      <Link
        href={`/skills/${skill.id}`}
        className="mt-2 inline-flex items-center justify-center rounded-lg border border-white/15 py-2 text-sm font-semibold text-white/90 transition-colors group-hover:border-white/40 group-hover:text-white"
      >
        View Details
      </Link>
    </motion.div>
  );
}
