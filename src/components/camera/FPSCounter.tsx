'use client';

import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { FPSCounterHandle } from '@/types';

/**
 * Displays live FPS. Updated imperatively via ref.update() from the
 * detection loop so a changing number never triggers a React re-render
 * of the surrounding tree.
 */
export const FPSCounter = forwardRef<FPSCounterHandle>(function FPSCounter(_props, ref) {
  const valueRef = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    update(fps: number) {
      if (valueRef.current) valueRef.current.textContent = String(fps);
    },
  }));

  return (
    <div className="glass-panel flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 font-display text-xs">
      <span className="h-1.5 w-1.5 rounded-full bg-neon-cyan" />
      <span ref={valueRef} className="font-bold text-white">
        --
      </span>
      <span className="text-muted">FPS</span>
    </div>
  );
});
