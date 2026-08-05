'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { CameraPermissionState } from '@/types';

interface PermissionDialogProps {
  permission: CameraPermissionState;
  errorMessage: string | null;
  onRetry: () => void;
}

const COPY: Record<
  Exclude<CameraPermissionState, 'granted'>,
  { title: string; body: string; showRetry: boolean }
> = {
  idle: {
    title: 'Starting camera…',
    body: 'Preparing your training session.',
    showRetry: false,
  },
  requesting: {
    title: 'Requesting camera access',
    body: 'Allow camera access in the browser prompt to start training.',
    showRetry: false,
  },
  denied: {
    title: 'Camera access denied',
    body: 'Anime Skill AR Trainer needs your webcam to track your movements. Enable camera access for this site in your browser settings, then try again.',
    showRetry: true,
  },
  unavailable: {
    title: 'No camera available',
    body: 'We couldn\u2019t find a usable webcam on this device. Connect a camera or try a different device.',
    showRetry: true,
  },
  error: {
    title: 'Something went wrong',
    body: 'We hit an unexpected error starting the camera. You can try again.',
    showRetry: true,
  },
};

export function PermissionDialog({ permission, errorMessage, onRetry }: PermissionDialogProps) {
  if (permission === 'granted') return null;
  const copy = COPY[permission];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-md"
      >
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="glass-panel mx-6 max-w-sm rounded-2xl border border-white/10 p-6 text-center"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-neon-blue/30 bg-neon-blue/10">
            {permission === 'requesting' || permission === 'idle' ? (
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                className="h-6 w-6 rounded-full border-2 border-neon-blue border-t-transparent"
              />
            ) : (
              <span className="text-2xl">
                {permission === 'denied' ? '🚫' : permission === 'unavailable' ? '📷' : '⚠️'}
              </span>
            )}
          </div>
          <h3 className="font-display text-lg font-bold text-white">{copy.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{copy.body}</p>
          {errorMessage && permission === 'error' && (
            <p className="mt-2 text-xs text-neon-red/80">{errorMessage}</p>
          )}
          {copy.showRetry && (
            <button onClick={onRetry} className="btn-primary mt-5 !px-6 !py-2 text-sm">
              Try Again
            </button>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
