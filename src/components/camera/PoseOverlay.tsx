'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import type { PoseFrame, PoseOverlayHandle } from '@/types';
import { getPoseKeypoints, POSE_CONNECTIONS, type PoseKeypoints } from '@/features/pose-detection';
import { TRACKING_COLORS } from '@/constants';

/**
 * Draws the pose skeleton (head, neck, shoulders, elbows, wrists, spine,
 * hips, knees, ankles) onto a canvas that's reused frame to frame.
 * Exposes an imperative `draw()`/`clear()` so the rAF loop can push frames
 * without going through React state/props.
 */
export const PoseOverlay = forwardRef<PoseOverlayHandle>(function PoseOverlay(_props, ref) {
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
    draw(frame: PoseFrame | null) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      const { width, height } = sizeRef.current;
      if (!ctx || !canvas || width === 0 || height === 0) return;

      ctx.clearRect(0, 0, width, height);
      if (!frame) return;

      const color = TRACKING_COLORS[frame.state];
      const points = getPoseKeypoints(frame.landmarks);
      // Video is mirrored via CSS on the <video> element only (not this canvas),
      // so we mirror the x-coordinate here to line landmarks up visually.
      const mx = (x: number) => (1 - x) * width;

      ctx.lineWidth = 3;
      ctx.strokeStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;

      for (const [fromKey, toKey] of POSE_CONNECTIONS) {
        const from = points[fromKey];
        const to = points[toKey];
        if (!from || !to) continue;
        ctx.beginPath();
        ctx.moveTo(mx(from.x), from.y * height);
        ctx.lineTo(mx(to.x), to.y * height);
        ctx.stroke();
      }

      ctx.shadowBlur = 4;
      (Object.keys(points) as (keyof PoseKeypoints)[]).forEach((key) => {
        const p = points[key];
        if (!p) return;
        const radius = key === 'head' ? 12 : 6;
        ctx.beginPath();
        ctx.arc(mx(p.x), p.y * height, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
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
