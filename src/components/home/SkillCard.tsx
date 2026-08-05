'use client';

import type { CSSProperties } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import type { HomeSkill } from '@/types';
import { skillIconMap } from '@/components/effects/icons';
import { AnimeMark } from './AnimeMark';

const difficultyStyles: Record<HomeSkill['difficulty'], string> = {
  Beginner: 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10',
  Intermediate: 'text-neon-orange border-neon-orange/40 bg-neon-orange/10',
  Advanced: 'text-neon-red border-neon-red/40 bg-neon-red/10',
};

interface SkillCardProps {
  skill: HomeSkill;
  index: number;
}

export function SkillCard({ skill, index }: SkillCardProps) {
  const Icon = skillIconMap[skill.icon];

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ scale: 1.03, y: -6 }}
      className={`sweep-border group relative flex flex-col gap-4 rounded-2xl border ${skill.accent.border}
        glass-panel p-6 shadow-[0_0_0_rgba(0,0,0,0)] transition-shadow duration-300
        hover:shadow-[0_0_40px_-8px_var(--tw-shadow-color)] ${skill.accent.text}`}
      style={
        {
          '--tw-shadow-color': skill.accent.hex,
          '--sweep-color': skill.accent.hex,
        } as CSSProperties
      }
    >
      {/* Anime wordmark */}
      <AnimeMark anime={skill.anime} colorClass={skill.accent.text} />

      {/* Skill icon "image" */}
      <div
        className={`relative flex h-32 items-center justify-center rounded-xl border ${skill.accent.border} bg-black/30`}
      >
        <div
          className="absolute inset-0 rounded-xl opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
          style={{ background: `radial-gradient(circle, ${skill.accent.hex}, transparent 70%)` }}
        />
        <Icon
          color={skill.accent.hex}
          className="relative h-16 w-16 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
        />
      </div>

      {/* Name + difficulty */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-bold text-white">
          {skill.skillName}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${difficultyStyles[skill.difficulty]}`}
        >
          {skill.difficulty}
        </span>
      </div>

      {/* Description */}
      <p className="flex-1 text-sm leading-relaxed text-muted">
        {skill.description}
      </p>

      {/* CTA */}
      <Link
        href={`/training/${skill.id}`}
        className={`mt-2 inline-flex items-center justify-center rounded-xl bg-gradient-to-r ${skill.accent.from} ${skill.accent.to}
          px-5 py-2.5 font-display text-sm font-semibold text-background transition-transform duration-300
          group-hover:scale-[1.02] group-hover:shadow-glow`}
      >
        Start Training
      </Link>
    </motion.div>
  );
}
