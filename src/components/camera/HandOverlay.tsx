'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { HandFrame, HandOverlayHandle } from '@/types';
import { HAND_CONNECTIONS } from '@/features/hand-tracking';
import { TRACKING_COLORS } from '@/constants';

/**
 * Draws all 21 hand landmarks per detected hand, with a Left/Right label,
 * onto a reused canvas via an imperative `draw()` API (see PoseOverlay for
 * why this is imperative rather than prop-driven).
 */
export const HandOverlay = forwardRef<HandOverlayHandle>(function HandOverlay(_props, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
      sizeRef.current = { width, height };
    });
    if (canvas.parentElement) observer.observe(canvas.parentElement);
    return () => observer.disconnect();
  }, []);

  useImperativeHandle(ref, () => ({
    draw(hands: HandFrame[]) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const { width, height } = sizeRef.current;
      if (!ctx || !canvas || width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);
      // Video is mirrored via CSS on the <video> element only (not this canvas),
      // so we mirror the x-coordinate here to line landmarks up visually and
      // keep the Left/Right text legible (not flipped).
      const mx = (x: number) => (1 - x) * width;

      for (const hand of hands) {
        const color = TRACKING_COLORS[hand.state];
        const pts = hand.landmarks;

        ctx.lineWidth = 2;
        ctx.strokeStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 6;

        for (const [a, b] of HAND_CONNECTIONS) {
          const from = pts[a];
          const to = pts[b];
          if (!from || !to) continue;
          ctx.beginPath();
          ctx.moveTo(mx(from.x), from.y * height);
          ctx.lineTo(mx(to.x), to.y * height);
          ctx.stroke();
        }

        ctx.shadowBlur = 3;
        pts.forEach((p, i) => {
          ctx.beginPath();
          ctx.arc(mx(p.x), p.y * height, i === 0 ? 5 : 3.5, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        });
        ctx.shadowBlur = 0;

        // Left/Right label near the wrist (landmark 0).
        const wrist = pts[0];
        if (wrist) {
          const labelX = mx(wrist.x);
          const labelY = wrist.y * height - 14;
          ctx.font = '600 12px var(--font-display), sans-serif';
          ctx.textAlign = 'center';
          ctx.fillStyle = color;
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          ctx.fillText(hand.handedness.toUpperCase(), labelX, labelY);
          ctx.shadowBlur = 0;
        }
      }
    },
    clear() {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const { width, height } = sizeRef.current;
      ctx?.clearRect(0, 0, width, height);
    },
  }));

  return <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />;
});
