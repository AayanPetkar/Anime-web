'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ParticleField } from '@/components/effects';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

/** Shared cyberpunk glassmorphism shell for /login, /signup, /forgot-password
 * so none of the three pages re-implements the background/card chrome. */
export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 grid-floor opacity-30" />
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[30rem] w-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-blue/15 blur-[110px]" />
      <ParticleField density={0.7} className="opacity-60" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="glass-panel relative z-10 w-full max-w-md rounded-2xl border border-white/10 p-8"
      >
        <Link href="/" className="mb-6 inline-flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-neon-blue shadow-glow" />
          <span className="font-display text-sm font-extrabold tracking-wide text-white">
            ASAR<span className="text-neon-blue">.</span>
          </span>
        </Link>

        <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
        <p className="mt-1 text-sm text-muted">{subtitle}</p>

        <div className="mt-6">{children}</div>

        {footer && <div className="mt-6 text-center text-sm text-muted">{footer}</div>}
      </motion.div>
    </main>
  );
}
