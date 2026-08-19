'use client';

import React, { useRef, useEffect, useCallback } from 'react';

/**
 * ParticleVisualizer — 新媒体艺术方块可视化
 * 移植自 StressMusic 的 initVisualCanvas / drawNewMediaArt
 * 颜色适配五行色系，避开 CD 播放器中心区域
 */
interface Block {
  x: number;
  y: number;
  cx: number;
  cy: number;
  w: number;
  h: number;
  sizeScale: number;
  distFactor: number;
  baseHue: number;
  freqIndex: number;
  hueOff: number;
  floatPhase: number;
  floatSpeed: number;
}

export default function ParticleVisualizer({
  analyser,
  active,
}: {
  analyser: AnalyserNode | null;
  active: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blocksRef = useRef<Block[]>([]);
  const animRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  // 初始化方块网格
  const initBlocks = useCallback((width: number, height: number) => {
    const blocks: Block[] = [];
    const cols = 18;
    const rows = 12;
    const colWidth = width / cols;
    const rowHeight = height / rows;
    const maxDist = Math.sqrt((width / 2) ** 2 + (height / 2) ** 2);

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const cx = i * colWidth + colWidth / 2;
        const cy = j * rowHeight + rowHeight / 2;
        const dist = Math.sqrt((cx - width / 2) ** 2 + (cy - height / 2) ** 2);

        // CD 禁区
        if (dist < 180) continue;

        const normalizedDist = dist / maxDist;
        const probability = Math.pow(1 - normalizedDist * 0.55, 3);
        if (Math.random() > probability * 0.6) continue;

        const isSmall = Math.random() < 0.4;
        const sizeScale = isSmall ? 0.2 + Math.random() * 0.3 : 0.6 + Math.random() * 1.6;

        // 五行色系渐变：左上角木行(120°)→右下角火行(0°/360°)
        const gradientPos = (i / cols + j / rows) / 2;
        const baseHue = 120 + gradientPos * 240; // 绿→蓝→红

        blocks.push({
          x: i * colWidth,
          y: j * rowHeight,
          cx,
          cy,
          w: colWidth,
          h: rowHeight,
          sizeScale,
          distFactor: normalizedDist,
          baseHue,
          freqIndex: Math.floor(Math.random() * 50),
          hueOff: Math.random() * 20 - 10,
          floatPhase: Math.random() * Math.PI * 2,
          floatSpeed: 0.0003 + Math.random() * 0.0008,
        });
      }
    }
    blocksRef.current = blocks;
  }, []);

  // 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initBlocks(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);

    // 初始化频率数据数组
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    } else {
      dataArrayRef.current = new Uint8Array(128).fill(0);
    }

    const draw = () => {
      if (!active) {
        animRef.current = requestAnimationFrame(draw);
        return;
      }

      animRef.current = requestAnimationFrame(draw);

      // 获取频率数据
      if (analyser && dataArrayRef.current) {
        analyser.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();

      const time = Date.now();
      const dataArray = dataArrayRef.current || new Uint8Array(128).fill(0);

      for (const b of blocksRef.current) {
        const val = dataArray[b.freqIndex] || 0;
        const energy = val / 255;

        const baseAlpha = 0.25 + energy * 0.5;
        const fadeAlpha = baseAlpha * Math.pow(1 - b.distFactor, 1.0);

        const hue = b.baseHue + energy * 15 + b.hueOff;
        ctx.fillStyle = `hsla(${hue}, 75%, 75%, ${fadeAlpha})`;

        const currentScale = b.sizeScale * (1 + energy * 0.2);
        const drawW = b.w * currentScale;
        const drawH = b.h * currentScale;

        const floatX = Math.sin(time * b.floatSpeed + b.floatPhase) * 15;
        const floatY = Math.cos(time * b.floatSpeed + b.floatPhase) * 15;

        const x = b.cx - drawW / 2 + floatX;
        const y = b.cy - drawH / 2 + floatY;

        ctx.fillRect(x, y, drawW, drawH);
      }

      ctx.restore();
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [analyser, active, initBlocks]);

  // 同步 analyser 变更时更新 dataArray
  useEffect(() => {
    if (analyser) {
      dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
    }
  }, [analyser]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  );
}
