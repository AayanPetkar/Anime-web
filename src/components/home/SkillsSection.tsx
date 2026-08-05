'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { homeSkills } from '@/data/homeSkills';
import { SkillCard } from './SkillCard';

export function SkillsSection() {
  return (
    <section id="skills" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-neon-purple">
            Choose Your Universe
          </span>
          <h2 className="mt-3 font-display text-3xl font-bold md:text-5xl">
            <span className="gradient-text">Six worlds.</span>{' '}
            <span className="text-white">One training room.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted">
            Pick a technique below to load its reference poses, then step in
            front of your camera to start matching it move for move.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {homeSkills.map((skill, index) => (
            <SkillCard key={skill.id} skill={skill} index={index} />
          ))}
        </div>

        <div className="mt-14 text-center">
          <Link
            href="/skills"
            className="btn-ghost inline-flex items-center gap-2"
          >
            View Full Catalog →
          </Link>
        </div>
      </div>
    </section>
  );
}
