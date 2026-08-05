'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { getAvatarPreset } from '@/features/profile';

const NAV_LINKS = [
  { label: 'Home', href: '#hero' },
  { label: 'Skills', href: '#skills' },
  { label: 'Training', href: '/training' },
  { label: 'Profile', href: '/profile' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { status, user, profile, signOutUser } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOutUser();
    router.push('/');
  };

  const avatar = getAvatarPreset(profile?.avatarPresetId);
  const displayName = profile?.displayName || profile?.username || user?.displayName || 'Trainer';

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-3' : 'py-5'
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <div
          className={`flex w-full items-center justify-between rounded-2xl px-5 py-3 transition-all duration-300 ${
            scrolled ? 'glass-panel shadow-glow' : 'bg-transparent'
          }`}
        >
          <Link href="/" className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 animate-pulseGlow rounded-full bg-neon-blue shadow-glow" />
            <span className="font-display text-lg font-extrabold tracking-wide text-white">
              ASAR<span className="text-neon-blue">.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative font-display text-sm font-medium text-white/80 transition-colors hover:text-neon-blue"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-neon-blue transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {status === 'signed-in' ? (
            <div ref={menuRef} className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-white/15 py-1 pl-1 pr-3 transition-colors hover:border-neon-blue/50"
              >
                {profile?.avatarURL ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatarURL} alt="" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-background"
                    style={{ background: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})` }}
                  >
                    {avatar.glyph}
                  </span>
                )}
                <span className="hidden font-display text-sm font-semibold text-white sm:inline">
                  {displayName}
                </span>
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.15 }}
                    className="glass-panel absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-xl border border-white/10"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-white/85 hover:bg-white/5"
                    >
                      Dashboard
                    </Link>
                    <Link
                      href="/settings"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-white/85 hover:bg-white/5"
                    >
                      Settings
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2.5 text-left text-sm text-neon-red hover:bg-white/5"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="btn-ghost !px-5 !py-2 text-sm">
                Login
              </Link>
              <Link href="/signup" className="hidden !px-5 !py-2 text-sm sm:inline-flex btn-primary">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </motion.header>
  );
}
