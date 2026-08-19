'use client';

import React from 'react';

/**
 * GlowingOrbs — 五个浮动发光球体装饰
 * 移植自 StressMusic static/css/style.css
 * 适配五行色系：紫色系→水行深天青，粉色→火行朱砂，蓝色→金行青蓝
 */
export default function GlowingOrbs({ compact = false }: { compact?: boolean }) {
  const size = compact ? 300 : 600;

  return (
    <div
      className="relative pointer-events-none"
      style={{ width: size, height: size }}
    >
      {/* Orb 1 — 大型主球 (粉紫渐变 → 火行朱砂+水行深天青) */}
      <div
        className="absolute rounded-full opacity-80"
        style={{
          width: compact ? 140 : 280,
          height: compact ? 140 : 280,
          top: '10%',
          right: '15%',
          background: 'radial-gradient(circle at 30% 30%, #c26158, #5ba09a)',
          filter: 'blur(50px)',
          mixBlendMode: 'overlay',
          animation: 'orbFloat1 8s ease-in-out infinite alternate',
        }}
      />

      {/* Orb 2 — 大型第二球 (蓝色系 → 金行青蓝+水行) */}
      <div
        className="absolute rounded-full opacity-80"
        style={{
          width: compact ? 170 : 340,
          height: compact ? 170 : 340,
          bottom: '0%',
          left: '5%',
          background: 'radial-gradient(circle at 70% 70%, #5ba09a, #3d7a75)',
          filter: 'blur(50px)',
          mixBlendMode: 'overlay',
          animation: 'orbFloat2 10s ease-in-out infinite alternate',
          animationDelay: '-2s',
        }}
      />

      {/* Orb 3 — 中型柔粉球 (火行朱砂) */}
      <div
        className="absolute rounded-full opacity-60"
        style={{
          width: compact ? 90 : 180,
          height: compact ? 90 : 180,
          top: '35%',
          left: '45%',
          background: '#c26158',
          filter: 'blur(50px)',
          mixBlendMode: 'overlay',
          animation: 'orbFloat3 7s ease-in-out infinite alternate',
        }}
      />

      {/* Orb 4 — 亮白中心 */}
      <div
        className="absolute rounded-full opacity-95"
        style={{
          width: compact ? 70 : 140,
          height: compact ? 70 : 140,
          top: '25%',
          left: '30%',
          background: '#ffffff',
          filter: 'blur(35px)',
          animation: 'orbFloat4 5s ease-in-out infinite alternate',
          zIndex: 2,
        }}
      />

      {/* Orb 5 — 柔和淡紫 (土行暮金) */}
      <div
        className="absolute rounded-full opacity-70"
        style={{
          width: compact ? 50 : 100,
          height: compact ? 50 : 100,
          bottom: '25%',
          right: '25%',
          background: '#c9a94f',
          filter: 'blur(50px)',
          mixBlendMode: 'overlay',
          animation: 'orbFloat5 12s ease-in-out infinite alternate',
        }}
      />

      {/* Keyframes via style tag */}
      <style jsx>{`
        @keyframes orbFloat1 {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.8; }
          33%  { transform: translate(40px, -60px) scale(1.1); opacity: 0.9; }
          66%  { transform: translate(-30px, 30px) scale(0.9); opacity: 0.7; }
          100% { transform: translate(20px, -20px) scale(1.05); opacity: 0.85; }
        }
        @keyframes orbFloat2 {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50%  { transform: translate(-40px, 20px) scale(1.15); opacity: 0.85; }
          100% { transform: translate(30px, -30px) scale(0.95); opacity: 0.75; }
        }
        @keyframes orbFloat3 {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.6; }
          50%  { transform: translate(20px, -40px) scale(1.1); opacity: 0.8; }
          100% { transform: translate(-20px, 10px) scale(0.9); opacity: 0.6; }
        }
        @keyframes orbFloat4 {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.95; }
          50%  { transform: translate(-15px, 15px) scale(1.05); opacity: 0.9; }
          100% { transform: translate(10px, -10px) scale(0.95); opacity: 0.95; }
        }
        @keyframes orbFloat5 {
          0%   { transform: translate(0, 0) scale(1); opacity: 0.7; }
          50%  { transform: translate(25px, 25px) scale(1.2); opacity: 0.5; }
          100% { transform: translate(-30px, -15px) scale(0.85); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
