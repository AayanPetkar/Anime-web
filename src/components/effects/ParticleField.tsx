'use client';

import { useEffect, useRef } from 'react';

interface ParticleFieldProps {
  /** Roughly how many particles per 100k px² of viewport. */
  density?: number;
  className?: string;
}

const PALETTE = ['#3ec6ff', '#a855f7', '#ff3ec6', '#3effe0'];

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number;
  drift: number;
  color: string;
  alpha: number;
  alphaDir: number;
}

/**
 * Lightweight canvas-based particle field. Chosen over per-particle DOM
 * nodes / Framer Motion for this many concurrent elements so it stays at
 * 60fps even on lower-end laptops.
 */
export function ParticleField({ density = 1.1, className = '' }: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    let animationFrame = 0;

    const createParticles = () => {
      const area = (width * height) / 100000;
      const count = Math.max(20, Math.round(area * density));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        speed: Math.random() * 0.35 + 0.08,
        drift: (Math.random() - 0.5) * 0.3,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        alpha: Math.random() * 0.5 + 0.3,
        alphaDir: Math.random() > 0.5 ? 1 : -1,
      }));
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      createParticles();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        p.y -= p.speed;
        p.x += p.drift;
        p.alpha += p.alphaDir * 0.002;
        if (p.alpha <= 0.15 || p.alpha >= 0.85) p.alphaDir *= -1;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = p.color;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      animationFrame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener('resize', resize);

    if (!prefersReducedMotion) {
      animationFrame = requestAnimationFrame(draw);
    } else {
      draw(); // draw a single static frame
    }

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrame);
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className}`}
    />
  );
}
