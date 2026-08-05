'use client';

import { useEffect, useRef } from 'react';
import type { SessionState } from '@/types';

export interface SessionTelemetry {
  corrections: number;
  /** 0-1 — fraction of observed frames with no mistake flagged. */
  stability: number;
}

/**
 * Derives cumulative session telemetry (correction count, tracking
 * stability) purely by observing SessionState transitions over time. It
 * doesn't duplicate anything SessionState already tracks — those two
 * numbers (a running correction tally, a running stability ratio) simply
 * don't exist as instantaneous state, so this is the one place they're
 * accumulated. Reset by changing `resetKey` (e.g. skill id, or a restart
 * counter).
 */
export function useSessionTelemetry(session: SessionState, resetKey: unknown): SessionTelemetry {
  const correctionsRef = useRef(0);
  const observedFramesRef = useRef(0);
  const mistakeFramesRef = useRef(0);
  const lastFeedbackRef = useRef<string | null>(null);
  const stabilityRef = useRef(1);

  useEffect(() => {
    correctionsRef.current = 0;
    observedFramesRef.current = 0;
    mistakeFramesRef.current = 0;
    lastFeedbackRef.current = null;
    stabilityRef.current = 1;
  }, [resetKey]);

  useEffect(() => {
    observedFramesRef.current += 1;
    if (session.mistake) mistakeFramesRef.current += 1;

    if (session.feedback && session.feedback !== lastFeedbackRef.current) {
      correctionsRef.current += 1;
    }
    lastFeedbackRef.current = session.feedback;

    stabilityRef.current = 1 - mistakeFramesRef.current / observedFramesRef.current;
  }, [session]);

  return { corrections: correctionsRef.current, stability: stabilityRef.current };
}
