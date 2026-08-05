// Reads/writes user progress (completed skills, accuracy, XP, streaks, badges).
// Backed by Firebase/Supabase once the progress-system step is implemented.
import { NextResponse } from 'next/server';

export async function GET() {
  // TODO: fetch authenticated user's progress document
  return NextResponse.json({ progress: null });
}

export async function POST() {
  // TODO: upsert progress after a completed training session
  return NextResponse.json({ success: false, message: 'not implemented yet' });
}
