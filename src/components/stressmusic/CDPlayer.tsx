'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';

/**
 * CDPlayer — 黑胶唱片播放器 + SVG 进度环
 * 移植自 StressMusic 的 .cd-container + .vinyl-disc + .progress-ring
 * 颜色适配五行色系：紫色→水行深天青，粉色标签→火行朱砂
 */
export default function CDPlayer({
  isPlaying,
  currentTime,
  duration,
  onTogglePlay,
  accentColor = '#3d7a75',
}: {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  onTogglePlay: () => void;
  accentColor?: string;
}) {
  const progressRef = useRef<SVGCircleElement>(null);
  const [circumference, setCircumference] = useState(1005.31); // 2 * PI * 160

  useEffect(() => {
    if (progressRef.current) {
      const radius = progressRef.current.r.baseVal.value;
      if (radius) {
        setCircumference(2 * Math.PI * radius);
      }
    }
  }, []);

  // 更新进度环
  useEffect(() => {
    if (!progressRef.current || !duration || isNaN(duration)) return;
    const percent = currentTime / duration;
    const offset = circumference - percent * circumference;
    progressRef.current.style.strokeDashoffset = String(offset);
  }, [currentTime, duration, circumference]);

  // 计算百分比显示
  const progressPercent = duration > 0 ? Math.round((currentTime / duration) * 100) : 0;

  return (
    <div className="relative flex items-center justify-center" style={{ width: 320, height: 320 }}>
      {/* 进度环 SVG */}
      <svg
        className="absolute"
        width="340"
        height="340"
        style={{ transform: 'rotate(-90deg)', pointerEvents: 'none', zIndex: 10 }}
      >
        {/* 背景环 */}
        <circle
          stroke="rgba(255,255,255,0.3)"
          strokeWidth="4"
          fill="transparent"
          r="160"
          cx="170"
          cy="170"
        />
        {/* 进度环 */}
        <circle
          ref={progressRef}
          stroke={accentColor}
          strokeWidth="4"
          fill="transparent"
          r="160"
          cx="170"
          cy="170"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          style={{
            transition: 'stroke-dashoffset 0.35s',
            filter: `drop-shadow(0 0 4px ${accentColor}80)`,
          }}
        />
      </svg>

      {/* 黑胶唱片 */}
      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: 280,
          height: 280,
          background: 'radial-gradient(circle, #2d3436 0%, #000 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2), inset 0 0 0 2px rgba(255,255,255,0.1)',
          animation: isPlaying ? 'cdRotate 8s linear infinite' : 'none',
          animationPlayState: isPlaying ? 'running' : 'paused',
        }}
      >
        {/* 唱片纹路 */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'repeating-radial-gradient(#111 0, #111 2px, #222 3px, #222 4px)',
            opacity: 0.8,
            maskImage: 'radial-gradient(circle, transparent 30%, black 31%)',
            WebkitMaskImage: 'radial-gradient(circle, transparent 30%, black 31%)',
          }}
        />

        {/* 标签 (火行朱砂渐变) */}
        <div
          className="rounded-full relative z-[2]"
          style={{
            width: 90,
            height: 90,
            background: `linear-gradient(135deg, ${accentColor} 0%, #c26158 99%, #fad0c4 100%)`,
            boxShadow: '0 0 10px rgba(0,0,0,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span className="text-white/80 text-[10px] font-serif tracking-[0.2em]">
            天籁
          </span>
        </div>

        {/* 进度百分比 */}
        <div
          className="absolute bottom-8 text-white/40 text-[10px] tabular-nums"
          style={{ zIndex: 3 }}
        >
          {progressPercent}%
        </div>
      </div>

      {/* 中心播放/暂停按钮 */}
      <button
        onClick={onTogglePlay}
        className="absolute rounded-full flex items-center justify-center outline-none cursor-pointer"
        style={{
          width: 60,
          height: 60,
          background: 'rgba(255,255,255,0.2)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.4)',
          color: 'white',
          fontSize: '1.2rem',
          zIndex: 30,
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={e => {
          (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.4)';
          (e.target as HTMLElement).style.transform = 'scale(1.1)';
        }}
        onMouseLeave={e => {
          (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.2)';
          (e.target as HTMLElement).style.transform = 'scale(1)';
        }}
        aria-label={isPlaying ? '暂停' : '播放'}
      >
        {isPlaying ? '❚❚' : '▶'}
      </button>

      {/* 旋转动画 */}
      <style jsx>{`
        @keyframes cdRotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
