// Original, abstract SVG icons representing energy-effect archetypes
// (orb / beam / void / slash / breath / impact). These are deliberately
// generic effect graphics — not character likenesses or studio logos —
// so the app stays clear of reproducing anyone's copyrighted artwork.

import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { color?: string };

export function OrbIcon({ color = '#3ec6ff', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <circle cx="24" cy="24" r="10" fill={color} opacity="0.25" />
      <circle cx="24" cy="24" r="6" fill={color} />
      <path
        d="M24 6c6 4 12 6 18 6-2 6-2 12 0 18-6 0-12 2-18 6-6-4-12-6-18-6 2-6 2-12 0-18 6 0 12-2 18-6Z"
        stroke={color}
        strokeWidth="1.2"
        opacity="0.4"
      />
    </svg>
  );
}

export function BeamIcon({ color = '#3ec6ff', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path d="M6 24c6-6 6-6 12 0s6 6 12 0 6-6 12 0" stroke={color} strokeWidth="2" opacity="0.5" />
      <path d="M4 24h30" stroke={color} strokeWidth="3" strokeLinecap="round" />
      <path d="M28 16l12 8-12 8" fill={color} opacity="0.9" />
    </svg>
  );
}

export function VoidIcon({ color = '#a855f7', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <polygon
        points="24,5 40,14 40,34 24,43 8,34 8,14"
        stroke={color}
        strokeWidth="1.4"
        opacity="0.5"
      />
      <circle cx="24" cy="24" r="7" fill={color} opacity="0.85" />
      <path d="M24 4v6M24 38v6M4.5 14l5.2 3M38.3 31l5.2 3M4.5 34l5.2-3M38.3 17l5.2-3" stroke={color} strokeWidth="1.2" />
    </svg>
  );
}

export function SlashIcon({ color = '#3effe0', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path
        d="M8 38C14 22 24 10 40 6c-6 12-10 22-8 34-10-4-18-2-24 -2Z"
        fill={color}
        opacity="0.18"
      />
      <path d="M9 39C16 21 25 10 41 5" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M9 39C16 21 25 10 41 5" stroke={color} strokeWidth="0.8" strokeLinecap="round" opacity="0.6" transform="translate(2 2)" />
    </svg>
  );
}

export function BreathIcon({ color = '#3ec6ff', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <path d="M4 16c6-6 10 2 16-2s8-6 14 0" stroke={color} strokeWidth="1.6" opacity="0.55" />
      <path d="M4 24c6-6 10 2 16-2s8-6 14 0" stroke={color} strokeWidth="2" opacity="0.8" />
      <path d="M4 32c6-6 10 2 16-2s8-6 14 0" stroke={color} strokeWidth="1.6" opacity="0.55" />
    </svg>
  );
}

export function ImpactIcon({ color = '#ff3e5e', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <circle cx="24" cy="24" r="6" fill={color} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <line
          key={deg}
          x1="24"
          y1="24"
          x2={24 + 18 * Math.cos((deg * Math.PI) / 180)}
          y2={24 + 18 * Math.sin((deg * Math.PI) / 180)}
          stroke={color}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity={deg % 90 === 0 ? 0.95 : 0.5}
        />
      ))}
    </svg>
  );
}

export const skillIconMap = {
  orb: OrbIcon,
  beam: BeamIcon,
  void: VoidIcon,
  slash: SlashIcon,
  breath: BreathIcon,
  impact: ImpactIcon,
} as const;
