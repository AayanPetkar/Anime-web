'use client';

// Standalone React Three Fiber host for the Effect Engine. This is new and
// self-contained — it does not import from or modify components/camera or
// components/training. Drop it in above a camera feed later by supplying a
// real `resolvePosition` derived from MediaPipe landmarks; without one it
// falls back to fixed demo positions so it also works as a preview on its own.
import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimatePresence, motion } from 'framer-motion';
import {
  EffectManager,
  type SkillEffectPreset,
  type LandmarkPositionResolver,
  type LandmarkAttachment,
} from '@/features/effects';

const DEMO_POSITIONS: Record<LandmarkAttachment, THREE.Vector3> = {
  rightPalm: new THREE.Vector3(0.35, -0.25, 0),
  leftPalm: new THREE.Vector3(-0.35, -0.25, 0),
  chest: new THREE.Vector3(0, -0.05, 0),
  head: new THREE.Vector3(0, 0.45, 0),
  betweenHands: new THREE.Vector3(0, -0.25, 0),
  aboveHead: new THREE.Vector3(0, 0.75, 0),
};

const defaultResolvePosition: LandmarkPositionResolver = (attachment) =>
  DEMO_POSITIONS[attachment] ?? null;

/** Tiny WebAudio synthesized chime — keeps "play success sound" functional
 * without shipping/fetching an audio asset. */
function playChime(kind: 'charge' | 'success') {
  if (typeof window === 'undefined') return;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return;
  const ctx: AudioContext = new AudioCtx();
  const notes = kind === 'success' ? [523.25, 659.25, 783.99, 1046.5] : [392, 493.88];
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const start = ctx.currentTime + i * 0.09;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);
  });
  window.setTimeout(() => ctx.close(), 1200);
}

// NOTE: a global post-process bloom pass (EffectComposer + UnrealBloomPass)
// used to run here. It's removed: UnrealBloomPass's composite shader always
// writes alpha=1 (fully opaque) regardless of the renderer's clear settings,
// which made this entire transparent overlay canvas render as a solid black
// rectangle on top of the camera feed. Every individual effect (EnergyOrb,
// FireRenderer, WaterRenderer, LightningRenderer, WindRenderer, AuraRenderer)
// already gets its glow from its own ShaderMaterial with AdditiveBlending,
// so no visual capability is lost by not routing through a global bloom pass.
// BloomPass.ts itself is left intact in features/effects for future use if
// a properly alpha-safe bloom technique replaces it.

interface ManagerBridgeProps {
  manager: EffectManager;
  preset: SkillEffectPreset;
  resolvePosition: LandmarkPositionResolver;
  charging: boolean;
  completionSignal: number;
  onCompletion: () => void;
  flashElRef: React.RefObject<HTMLDivElement>;
}

function ManagerBridge({
  manager,
  preset,
  resolvePosition,
  charging,
  completionSignal,
  onCompletion,
  flashElRef,
}: ManagerBridgeProps) {
  const { camera } = useThree();
  const wasCharging = useRef(false);
  const lastCompletionSignal = useRef(0);
  const basePosition = useRef(camera.position.clone());

  useEffect(() => {
    // Re-running playCharge on every render where `preset` changes (not just
    // the charging false->true edge) is what lets Step 7's accuracy-driven
    // intensity tiers (60/75/90%) actually respawn with boosted values while
    // the user keeps holding the pose. playCharge() itself stops the previous
    // charge layers before spawning the new ones, so this never double-spawns.
    if (charging) {
      manager.playCharge(preset, resolvePosition);
    } else if (wasCharging.current) {
      manager.stopCharge();
    }
    wasCharging.current = charging;
  }, [charging, preset, manager, resolvePosition]);

  useEffect(() => {
    if (completionSignal > 0 && completionSignal !== lastCompletionSignal.current) {
      lastCompletionSignal.current = completionSignal;
      manager.playCompletion(preset, resolvePosition);
      onCompletion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionSignal]);

  useFrame((_state, delta) => {
    manager.setCameraOrientation(camera.quaternion);
    manager.followLandmarks(resolvePosition);
    const { flash, shake } = manager.update(delta, performance.now());

    camera.position.set(
      basePosition.current.x + shake.x,
      basePosition.current.y + shake.y,
      basePosition.current.z
    );
    camera.rotation.z = shake.rotationZ;

    if (flashElRef.current) {
      flashElRef.current.style.opacity = String(flash.opacity);
      flashElRef.current.style.backgroundColor = flash.color;
    }
  });

  return <primitive object={manager.root} />;
}

export interface EffectStageProps {
  preset: SkillEffectPreset;
  charging: boolean;
  completionSignal: number;
  skillName: string;
  xpGained: number;
  resolvePosition?: LandmarkPositionResolver;
  onSoundCue?: (sound: 'charge' | 'success') => void;
  className?: string;
}

/** Full Effect Engine host: Canvas + bloom + charge/completion playback +
 * screen flash + camera shake + the "Technique Mastered" completion banner
 * (XP gained, success sound). Self-contained and reusable for any skill. */
export function EffectStage({
  preset,
  charging,
  completionSignal,
  skillName,
  xpGained,
  resolvePosition = defaultResolvePosition,
  onSoundCue,
  className = '',
}: EffectStageProps) {
  const manager = useMemo(() => new EffectManager(), []);
  const flashElRef = useRef<HTMLDivElement>(null);
  const [showCompletion, setShowCompletion] = useState(false);
  const prevCharging = useRef(false);

  useEffect(() => {
    return () => manager.dispose();
  }, [manager]);

  useEffect(() => {
    if (charging && !prevCharging.current) onSoundCue?.('charge');
    prevCharging.current = charging;
  }, [charging, onSoundCue]);

  const handleCompletion = () => {
    setShowCompletion(true);
    onSoundCue?.('success');
    playChime('success');
    window.setTimeout(() => setShowCompletion(false), 2200);
  };

  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 2], fov: 45 }}
        style={{ background: 'transparent' }}
      >
        <ManagerBridge
          manager={manager}
          preset={preset}
          resolvePosition={resolvePosition}
          charging={charging}
          completionSignal={completionSignal}
          onCompletion={handleCompletion}
          flashElRef={flashElRef}
        />
      </Canvas>

      <div
        ref={flashElRef}
        className="absolute inset-0"
        style={{ opacity: 0, backgroundColor: '#ffffff', mixBlendMode: 'screen' }}
      />

      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center"
          >
            <p className="font-display text-3xl font-black text-white drop-shadow-[0_0_24px_rgba(62,198,255,0.8)] md:text-5xl">
              Technique Mastered
            </p>
            <p className="font-display text-lg font-bold text-neon-cyan">{skillName}</p>
            <p className="font-display text-sm font-semibold text-neon-yellow">+{xpGained} XP</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
