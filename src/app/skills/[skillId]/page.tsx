import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { AnimatedPreview } from '@/components/skills/AnimatedPreview';
import { getSkillById, allSkills } from '@/data/skills';
import { ANIME_THEME, DEFAULT_ACCENT } from '@/constants';
import { inferIcon } from '@/lib/utils';

const difficultyStyles: Record<string, string> = {
  Beginner: 'text-neon-cyan border-neon-cyan/40 bg-neon-cyan/10',
  Intermediate: 'text-neon-orange border-neon-orange/40 bg-neon-orange/10',
  Advanced: 'text-neon-red border-neon-red/40 bg-neon-red/10',
};

export function generateStaticParams() {
  return allSkills.map((skill) => ({ skillId: skill.id }));
}

export function generateMetadata({ params }: { params: { skillId: string } }) {
  const skill = getSkillById(params.skillId);
  return { title: skill ? `${skill.name} — Anime Skill AR Trainer` : 'Skill not found' };
}

export default function SkillDetailPage({
  params,
}: {
  params: { skillId: string };
}) {
  const skill = getSkillById(params.skillId);
  if (!skill) notFound();

  const accent = ANIME_THEME[skill.animeSlug] ?? DEFAULT_ACCENT;
  const icon = inferIcon(skill.completionEffect);

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pb-24 pt-36">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/skills"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-white"
          >
            ← Back to all skills
          </Link>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-start">
            <AnimatedPreview icon={icon} accent={accent} />

            <div>
              <p className={`font-display text-sm font-semibold uppercase tracking-[0.25em] ${accent.text}`}>
                {skill.anime}
              </p>
              <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
                {skill.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${difficultyStyles[skill.difficulty]}`}
                >
                  {skill.difficulty}
                </span>
                <span className="text-sm text-muted">
                  ⏱ ~{skill.estimatedLearningTimeMinutes} min to learn
                </span>
                <span className="text-sm text-muted">
                  +{skill.xpReward} XP on completion
                </span>
              </div>

              <p className="mt-6 leading-relaxed text-muted">{skill.description}</p>

              <Link
                href={`/training/${skill.id}`}
                className={`mt-8 inline-flex items-center justify-center rounded-xl bg-gradient-to-r ${accent.from} ${accent.to} px-6 py-3 font-display text-sm font-semibold text-background shadow-glow transition-transform hover:scale-[1.02]`}
              >
                Begin Training
              </Link>
            </div>
          </div>

          {/* Step-by-step instructions */}
          <section className="mt-16">
            <h2 className="mb-6 font-display text-xl font-bold text-white">
              Step-by-Step Instructions
            </h2>
            <ol className="flex flex-col gap-4">
              {skill.steps.map((step) => (
                <li
                  key={step.id}
                  className="glass-panel flex items-start gap-4 rounded-xl border border-white/10 p-4"
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${accent.border} font-display text-sm font-bold ${accent.text}`}
                  >
                    {step.id}
                  </span>
                  <p className="pt-1 text-white/90">{step.instruction}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </main>
    </>
  );
}
