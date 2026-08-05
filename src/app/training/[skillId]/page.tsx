import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { TrainingSessionView } from '@/components/training';
import { RequireAuth } from '@/components/auth';
import { getSkillById, allSkills } from '@/data/skills';
import { ANIME_THEME, DEFAULT_ACCENT } from '@/constants';

export function generateStaticParams() {
  return allSkills.map((skill) => ({ skillId: skill.id }));
}

export function generateMetadata({ params }: { params: { skillId: string } }) {
  const skill = getSkillById(params.skillId);
  return { title: skill ? `Training: ${skill.name} — Anime Skill AR Trainer` : 'Training' };
}

export default function TrainingPage({
  params,
}: {
  params: { skillId: string };
}) {
  const skill = getSkillById(params.skillId);
  if (!skill) notFound();

  const accent = ANIME_THEME[skill.animeSlug] ?? DEFAULT_ACCENT;

  return (
    <RequireAuth>
      <Navbar />
      <main className="min-h-screen px-6 pb-24 pt-36">
        <div className="mx-auto max-w-5xl">
          <Link
            href={`/skills/${skill.id}`}
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-white"
          >
            ← Back to {skill.name}
          </Link>

          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className={`font-display text-xs font-semibold uppercase tracking-[0.25em] ${accent.text}`}>
                {skill.anime} · Camera Training
              </p>
              <h1 className="mt-2 font-display text-2xl font-bold text-white md:text-4xl">
                {skill.name}
              </h1>
            </div>
          </div>

          <TrainingSessionView skill={skill} accent={accent} />

          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">
            Follow the on-screen instruction and hold the pose steadily — the
            ring fills as you hold, and the step advances automatically once
            you're accurate enough for long enough.
          </p>
        </div>
      </main>
    </RequireAuth>
  );
}
