// Generic utility functions (math, formatting, angle calculations).
export * from './inferIcon';
export * from './chargeTier';

/** Formats milliseconds as m:ss for the session timer. */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}


