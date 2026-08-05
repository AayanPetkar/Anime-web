// Central catalog: combines every anime's typed skill array into one place.
// Add a new anime by creating its folder + index.ts, then listing it here —
// no other application code needs to change.
import type { Skill } from '@/types';
import { narutoSkills } from './naruto';
import { dragonBallSkills } from './dragon-ball';
import { bleachSkills } from './bleach';
import { jujutsuKaisenSkills } from './jujutsu-kaisen';
import { demonSlayerSkills } from './demon-slayer';
import { onePieceSkills } from './one-piece';
import { avatarSkills } from './avatar';

export const allSkills: Skill[] = [
  ...narutoSkills,
  ...dragonBallSkills,
  ...bleachSkills,
  ...jujutsuKaisenSkills,
  ...demonSlayerSkills,
  ...onePieceSkills,
  ...avatarSkills,
];

export const skillsByAnime: Record<string, Skill[]> = allSkills.reduce(
  (acc, skill) => {
    acc[skill.animeSlug] = acc[skill.animeSlug] ?? [];
    acc[skill.animeSlug].push(skill);
    return acc;
  },
  {} as Record<string, Skill[]>
);

export function getSkillById(id: string): Skill | undefined {
  return allSkills.find((skill) => skill.id === id);
}

export function getAnimeList(): { slug: string; name: string; count: number }[] {
  return Object.entries(skillsByAnime).map(([slug, skills]) => ({
    slug,
    name: skills[0]?.anime ?? slug,
    count: skills.length,
  }));
}
