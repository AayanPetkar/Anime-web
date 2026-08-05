import { Navbar } from '@/components/layout/Navbar';
import { CatalogSkillCard } from '@/components/skills/SkillListCard';
import { getAnimeList, skillsByAnime } from '@/data/skills';
import { ANIME_THEME, DEFAULT_ACCENT } from '@/constants';

export const metadata = {
  title: 'Browse Skills — Anime Skill AR Trainer',
};

export default function SkillsBrowsePage() {
  const animeList = getAnimeList();

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pb-24 pt-36">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <span className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-neon-purple">
              Full Catalog
            </span>
            <h1 className="mt-3 font-display text-3xl font-bold md:text-5xl">
              <span className="gradient-text">Every technique,</span>{' '}
              <span className="text-white">by universe.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted">
              {animeList.reduce((sum, a) => sum + a.count, 0)} techniques across{' '}
              {animeList.length} anime universes — pick one to see its
              step-by-step breakdown before you train.
            </p>
          </div>

          <div className="flex flex-col gap-20">
            {animeList.map(({ slug, name }) => {
              const accent = ANIME_THEME[slug] ?? DEFAULT_ACCENT;
              const skills = skillsByAnime[slug];
              return (
                <section key={slug}>
                  <div className="mb-6 flex items-center gap-4">
                    <h2 className={`font-display text-2xl font-extrabold uppercase tracking-tight ${accent.text}`}>
                      {name}
                    </h2>
                    <div className={`h-px flex-1 bg-gradient-to-r ${accent.from} ${accent.to} opacity-30`} />
                    <span className="text-sm text-muted">{skills.length} techniques</span>
                  </div>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {skills.map((skill, i) => (
                      <CatalogSkillCard key={skill.id} skill={skill} index={i} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
