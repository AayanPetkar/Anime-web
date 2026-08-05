'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ParticleField } from '@/components/effects/ParticleField';

const TITLE_LINES = ['ANIME SKILL', 'AR TRAINER'];

export function Hero() {
  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6"
    >
      {/* Perspective grid floor */}
      <div
        className="absolute inset-0 grid-floor opacity-40"
        style={{
          maskImage: 'linear-gradient(to bottom, transparent, black 45%, black 75%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 45%, black 75%, transparent)',
          animation: 'gridDrift 6s linear infinite',
        }}
      />

      {/* Radial glow blobs */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-blue/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-0 top-2/3 h-96 w-96 translate-x-1/3 rounded-full bg-neon-purple/25 blur-[110px]" />
      <div className="pointer-events-none absolute left-0 top-0 h-80 w-80 -translate-x-1/3 rounded-full bg-neon-pink/20 blur-[100px]" />

      {/* Floating particles */}
      <ParticleField density={1.3} className="opacity-80" />

      {/* Content */}
      <div className="relative z-10 flex max-w-4xl flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 rounded-full border border-neon-blue/30 bg-neon-blue/10 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.25em] text-neon-blue"
        >
          Tracking System Online
        </motion.span>

        <h1 className="font-display font-black uppercase leading-[0.95]">
          {TITLE_LINES.map((line, i) => (
            <motion.span
              key={line}
              initial={{ opacity: 0, y: 40, rotateX: 40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ duration: 0.7, delay: 0.2 + i * 0.15, ease: 'easeOut' }}
              className="block text-4xl sm:text-6xl md:text-7xl"
              style={{
                transformStyle: 'preserve-3d',
                color: '#eaf6ff',
                textShadow: `
                  0 1px 0 #3ec6ff,
                  0 2px 0 #34b3e8,
                  0 3px 0 #2aa0d1,
                  0 4px 8px rgba(62,198,255,0.55),
                  0 8px 24px rgba(168,85,247,0.45),
                  0 0 40px rgba(62,198,255,0.35)
                `,
                animation: 'titleFlicker 6s ease-in-out infinite',
              }}
            >
              {line}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.55 }}
          className="mt-6 max-w-xl text-balance text-base text-muted md:text-lg"
        >
          Step in front of your camera and learn the movements behind the
          world&apos;s most iconic anime techniques — tracked live, scored in
          real time, and layered with effects that are pure fiction, all fun.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link href="/training" className="btn-primary">
            Start Training
          </Link>
          <a href="#skills" className="btn-ghost">
            Browse Skills
          </a>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted"
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border border-white/20 p-1">
          <motion.span
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="h-1.5 w-1.5 rounded-full bg-neon-blue"
          />
        </div>
      </motion.div>
    </section>
  );
}
