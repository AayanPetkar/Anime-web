import type { HomeSkill } from '@/types';

/**
 * Six featured skills shown on the landing page — one per anime universe.
 * The full per-anime catalogs live in src/data/skills/<anime>/*.json and are
 * populated in the data-population step; this file only drives the homepage
 * showcase cards.
 */
export const homeSkills: HomeSkill[] = [
  {
    id: 'naruto-rasengan',
    anime: 'Naruto',
    skillName: 'Rasengan',
    difficulty: 'Intermediate',
    description:
      'A concentrated sphere of chakra shaped and held in a single palm without any hand seals — pure rotation and control.',
    accent: {
      text: 'text-neon-orange',
      border: 'border-neon-orange/30',
      from: 'from-neon-orange',
      to: 'to-neon-yellow',
      hex: '#ff8a3e',
    },
    icon: 'orb',
  },
  {
    id: 'dragon-ball-kamehameha',
    anime: 'Dragon Ball',
    skillName: 'Kamehameha',
    difficulty: 'Beginner',
    description:
      'The signature energy wave technique: cup both hands at your hip, gather focus, then drive the beam forward with full arm extension.',
    accent: {
      text: 'text-neon-blue',
      border: 'border-neon-blue/30',
      from: 'from-neon-blue',
      to: 'to-neon-cyan',
      hex: '#3ec6ff',
    },
    icon: 'beam',
  },
  {
    id: 'jujutsu-kaisen-domain-expansion',
    anime: 'Jujutsu Kaisen',
    skillName: 'Domain Expansion',
    difficulty: 'Advanced',
    description:
      'A ritual stance that projects an inescapable field around the user — precise hand positioning and total stillness are everything.',
    accent: {
      text: 'text-neon-purple',
      border: 'border-neon-purple/30',
      from: 'from-neon-purple',
      to: 'to-neon-pink',
      hex: '#a855f7',
    },
    icon: 'void',
  },
  {
    id: 'bleach-getsuga-tensho',
    anime: 'Bleach',
    skillName: 'Getsuga Tenshō',
    difficulty: 'Advanced',
    description:
      'A single downward blade swing channels spiritual pressure into a crescent wave — timing the release is the hardest part.',
    accent: {
      text: 'text-neon-cyan',
      border: 'border-neon-cyan/30',
      from: 'from-neon-cyan',
      to: 'to-neon-blue',
      hex: '#3effe0',
    },
    icon: 'slash',
  },
  {
    id: 'demon-slayer-water-breathing',
    anime: 'Demon Slayer',
    skillName: 'Water Breathing',
    difficulty: 'Intermediate',
    description:
      'A breathing-based sword style built on fluid footwork and long exhales — each form flows directly into the next.',
    accent: {
      text: 'text-neon-blue',
      border: 'border-neon-blue/30',
      from: 'from-neon-blue',
      to: 'to-neon-cyan',
      hex: '#3ec6ff',
    },
    icon: 'breath',
  },
  {
    id: 'one-piece-gum-gum-pistol',
    anime: 'One Piece',
    skillName: 'Gum-Gum Pistol',
    difficulty: 'Beginner',
    description:
      'A rubber-fueled straight punch: wind the arm back, snap the shoulder through, and extend fully on release.',
    accent: {
      text: 'text-neon-red',
      border: 'border-neon-red/30',
      from: 'from-neon-red',
      to: 'to-neon-orange',
      hex: '#ff3e5e',
    },
    icon: 'impact',
  },
];
