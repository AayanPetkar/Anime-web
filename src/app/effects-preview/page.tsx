'use client';

import { useMemo, useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { EffectStage } from '@/components/effects';
import { allSkills } from '@/data/skills';
import { getEffectPreset } from '@/data/effectPresets';

/**
 * Standalone showcase for the Step 6 Effect Engine — lets you pick any
 * catalog skill, hold to play its charge layers, and trigger its completion
 * payoff (screen flash, camera shake, XP banner, success chime). This page
 * is new and self-contained; it doesn't import or modify anything under
 * components/camera, components/training, or features/pose-*.
 */
export default function EffectsPreviewPage() {
  const [skillId, setSkillId] = useState(allSkills[0].id);
  const [charging, setCharging] = useState(false);
  const [completionSignal, setCompletionSignal] = useState(0);

  const skill = useMemo(() => allSkills.find((s) => s.id === skillId) ?? allSkills[0], [skillId]);
  const preset = useMemo(() => getEffectPreset(skill), [skill]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen px-6 pb-24 pt-36">
        <div className="mx-auto max-w-4xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.25em] text-neon-purple">
            Effect Engine Preview
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold text-white md:text-4xl">
            Cinematic Completion Effects
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Pick a technique, hold the charge button to loop its charge-phase
            layers, then release to trigger its one-shot completion payoff.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <select
              value={skillId}
              onChange={(e) => setSkillId(e.target.value)}
              className="rounded-xl border border-white/15 bg-surface px-4 py-2 font-display text-sm text-white"
            >
              {allSkills.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.anime} — {s.name}
                </option>
              ))}
            </select>

            <button
              onMouseDown={() => setCharging(true)}
              onMouseUp={() => setCharging(false)}
              onMouseLeave={() => setCharging(false)}
              onTouchStart={() => setCharging(true)}
              onTouchEnd={() => setCharging(false)}
              className="btn-ghost !py-2 text-sm"
            >
              {charging ? 'Charging…' : 'Hold to Charge'}
            </button>

            <button
              onClick={() => {
                setCharging(false);
                setCompletionSignal((n) => n + 1);
              }}
              className="btn-primary !py-2 text-sm"
            >
              Trigger Completion
            </button>
          </div>

          <div className="relative mt-8 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
            <EffectStage
              preset={preset}
              charging={charging}
              completionSignal={completionSignal}
              skillName={skill.name}
              xpGained={skill.xpReward}
            />
          </div>

          <p className="mt-6 text-xs text-muted/70">
            Preset for <span className="text-white">{skill.name}</span>: charge
            layers — {preset.chargeLayers.map((l) => l.kind).join(', ')}; completion
            layers — {preset.completionLayers.map((l) => l.kind).join(', ')}
            {preset.screenFlash ? '; screen flash' : ''}
            {preset.cameraShake ? '; camera shake' : ''}.
          </p>
        </div>
      </main>
    </>
  );
}
