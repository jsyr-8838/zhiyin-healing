'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
}

interface ParticleCanvasProps {
  /** 粒子主色（亮），rgba 字符串 */
  colorA: string;
  /** 粒子辅色（暗），rgba 字符串 */
  colorB: string;
  /** 粒子数量 */
  count?: number;
}

/**
 * ParticleCanvas — 知音之境背景粒子系统
 *
 * 从 FlowHaven 移植的 Canvas 2D 粒子动画，纯绘制、不触发 React 重渲染。
 * 粒子在四境主题色之间渐变，营造柔软漂浮的微光氛围。
 * 页面不可见时自动暂停以节省性能。
 */
export default function ParticleCanvas({ colorA, colorB, count = 52 }: ParticleCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorARef = useRef(colorA);
  const colorBRef = useRef(colorB);

  // 颜色变化时同步到 ref（不打断动画循环）
  useEffect(() => {
    colorARef.current = colorA;
    colorBRef.current = colorB;
  }, [colorA, colorB]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let animationId: number | null = null;
    let running = true;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.4,
      speedY: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.5 + 0.12,
    });

    for (let i = 0; i < count; i++) particles.push(createParticle());

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        gradient.addColorStop(0, colorARef.current.replace(/[\d.]+\)$/g, `${p.opacity})`));
        gradient.addColorStop(0.5, colorBRef.current.replace(/[\d.]+\)$/g, `${p.opacity * 0.8})`));
        gradient.addColorStop(1, colorBRef.current.replace(/[\d.]+\)$/g, `0)`));
        ctx.fillStyle = gradient;
        ctx.fill();
      }
      animationId = requestAnimationFrame(draw);
    };

    const start = () => {
      if (animationId === null && running) draw();
    };
    const stop = () => {
      if (animationId !== null) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    };

    const onVisibility = () => {
      if (document.hidden) {
        stop();
      } else {
        running = true;
        start();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    start();

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  return <canvas ref={canvasRef} className="particleCanvas" />;
}
