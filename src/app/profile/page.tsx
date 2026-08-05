'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { RequireAuth } from '@/components/auth';
import { EditProfileModal } from '@/components/profile';
import { useAuth } from '@/hooks/useAuth';
import { getActiveProgressStore, type UserProgressProfile } from '@/features/progress';
import { computeAchievements, getAvatarPreset } from '@/features/profile';
import { getSkillById } from '@/data/skills';
import { formatDuration } from '@/lib/utils';

const RANK_ORDER: Record<string, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };
const RANK_COLOR: Record<string, string> = {
  S: 'text-neon-yellow',
  A: 'text-neon-cyan',
  B: 'text-neon-blue',
  C: 'text-neon-orange',
  D: 'text-neon-red',
};

function levelFromXP(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

function ProfileContent() {
  const router = useRouter();
  const { status, user, profile, signOutUser, refreshProfile } = useAuth();
  const [progress, setProgress] = useState<UserProgressProfile | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const loadProgress = useCallback(async () => {
    const data = await getActiveProgressStore().getProfile();
    setProgress(data);
  }, []);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const handleLogout = async () => {
    await signOutUser();
    router.push('/');
  };

  if (!progress) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="h-8 w-8 animate-spin rounded-full border-2 border-neon-blue border-t-transparent" />
      </div>
    );
  }

  const level = levelFromXP(progress.totalXP);
  const bestRank = Object.values(progress.bestRankBySkill).sort((a, b) => RANK_ORDER[b] - RANK_ORDER[a])[0] ?? '—';
  const bestAccuracy = Math.round(Math.max(0, ...Object.values(progress.highestAccuracyBySkill)));
  const totalTimeMs = progress.practiceHistory.reduce((sum, e) => sum + e.timeMs, 0);
  const achievements = computeAchievements(progress);
  const recentlyPracticed = progress.practiceHistory.slice(0, 5);

  const avatar = getAvatarPreset(profile?.avatarPresetId);
  const isGuest = status === 'guest';

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pb-24 pt-36">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel flex flex-col items-center gap-4 rounded-2xl border border-white/10 p-6 text-center sm:flex-row sm:text-left"
          >
            {profile?.avatarURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarURL}
                alt=""
                className="h-20 w-20 rounded-full border border-white/15 object-cover"
              />
            ) : (
              <div
                className="flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold text-background"
                style={{ background: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})` }}
              >
                {avatar.glyph}
              </div>
            )}

            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-white">
                {profile?.displayName || profile?.username || (isGuest ? 'Guest Trainer' : 'Trainer')}
              </h1>
              <p className="text-sm text-muted">
                {isGuest ? 'Browsing as guest — sign in to sync across devices.' : profile?.email ?? user?.email}
              </p>
              {profile?.favoriteAnime && (
                <p className="mt-1 text-xs text-neon-purple">Favorite: {profile.favoriteAnime}</p>
              )}
            </div>

            <div className="flex flex-col items-center gap-1">
              <span className="font-display text-xl font-black text-neon-cyan">Lv. {level}</span>
              <span className="text-xs text-muted">{progress.totalXP} XP</span>
            </div>
          </motion.div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Current Rank" value={bestRank} valueClassName={RANK_COLOR[bestRank] ?? 'text-white'} />
            <Stat label="Current Streak" value={`${profile?.streakCount ?? 0}🔥`} />
            <Stat label="Completed Skills" value={String(progress.completedSkillIds.length)} />
            <Stat label="Highest Accuracy" value={`${bestAccuracy}%`} />
            <Stat label="Training Time" value={formatDuration(totalTimeMs)} />
            <Stat label="Sessions Logged" value={String(progress.practiceHistory.length)} />
          </div>

          {!isGuest && user && profile && (
            <EditProfileModal
              uid={user.uid}
              profile={profile}
              open={editOpen}
              onClose={() => setEditOpen(false)}
              onSaved={refreshProfile}
            />
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/skills" className="btn-primary !py-2.5 text-sm">
              Continue Training
            </Link>
            {!isGuest ? (
              <button onClick={() => setEditOpen(true)} className="btn-ghost !py-2.5 text-sm">
                Edit Profile
              </button>
            ) : (
              <Link href="/signup" className="btn-ghost !py-2.5 text-sm">
                Create Account
              </Link>
            )}
            <Link href="/settings" className="btn-ghost !py-2.5 text-sm">
              Settings
            </Link>
            {!isGuest && (
              <button onClick={handleLogout} className="btn-ghost !py-2.5 text-sm text-neon-red">
                Logout
              </button>
            )}
          </div>

          <section className="mt-10">
            <h2 className="mb-4 font-display text-lg font-bold text-white">Achievements</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`glass-panel rounded-xl border p-4 text-center ${
                    a.unlocked ? 'border-neon-cyan/40' : 'border-white/10 opacity-40'
                  }`}
                >
                  <p className="text-2xl">{a.icon}</p>
                  <p className="mt-1 font-display text-sm font-bold text-white">{a.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{a.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 font-display text-lg font-bold text-white">Recently Practiced</h2>
            {recentlyPracticed.length === 0 ? (
              <p className="text-sm text-muted">No sessions yet — go complete a technique!</p>
            ) : (
              <div className="flex flex-col gap-2">
                {recentlyPracticed.map((entry, i) => {
                  const skill = getSkillById(entry.skillId);
                  return (
                    <div
                      key={`${entry.skillId}-${i}`}
                      className="glass-panel flex items-center justify-between rounded-xl border border-white/10 p-4"
                    >
                      <div>
                        <p className="font-display text-sm font-semibold text-white">
                          {entry.skillName}
                        </p>
                        <p className="text-xs text-muted">
                          {entry.anime} · {new Date(entry.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-display font-bold ${RANK_COLOR[entry.rank]}`}>{entry.rank}</span>
                        <span className="text-muted">{Math.round(entry.accuracy)}%</span>
                        <Link
                          href={skill ? `/training/${skill.id}` : '/skills'}
                          className="text-neon-blue hover:underline"
                        >
                          Retry
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}

function Stat({ label, value, valueClassName = 'text-white' }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="glass-panel rounded-xl border border-white/10 p-4 text-center">
      <p className={`font-display text-xl font-bold ${valueClassName}`}>{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wide text-muted">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <RequireAuth>
      <ProfileContent />
    </RequireAuth>
  );
}
