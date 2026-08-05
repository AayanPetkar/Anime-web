import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#05060a',
        surface: '#0b0e17',
        'surface-alt': '#11162280',
        neon: {
          blue: '#3ec6ff',
          purple: '#a855f7',
          pink: '#ff3ec6',
          cyan: '#3effe0',
          orange: '#ff8a3e',
          red: '#ff3e5e',
          yellow: '#ffe23e',
        },
        muted: '#8a90a6',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(62, 198, 255, 0.5)',
        'glow-purple': '0 0 20px rgba(168, 85, 247, 0.5)',
        'glow-lg': '0 0 60px rgba(62, 198, 255, 0.35)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        floatParticle: {
          '0%': { transform: 'translateY(0) translateX(0)' },
          '50%': { transform: 'translateY(-20px) translateX(10px)' },
          '100%': { transform: 'translateY(0) translateX(0)' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 2.5s ease-in-out infinite',
        floatParticle: 'floatParticle 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
