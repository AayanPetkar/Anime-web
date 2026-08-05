// Serves the skill catalog, sourced from src/data/skills/**/*.json.
// Later this can proxy to Firestore/Supabase for community-uploaded skills.
import { NextResponse } from 'next/server';
import { allSkills } from '@/data/skills';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const anime = searchParams.get('anime');

  const skills = anime
    ? allSkills.filter((skill) => skill.animeSlug === anime)
    : allSkills;

  return NextResponse.json({ skills });
}
