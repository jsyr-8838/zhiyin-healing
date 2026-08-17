'use client';

import React from 'react';
import type { SessionData } from './types';

/**
 * HealingReportModal — 疗愈报告弹窗
 * 移植自 StressMusic 的 #report-modal
 * 展示前/后 BPM/HRV 对比 + SVG 心率曲线
 * 颜色适配五行色系
 */
export default function HealingReportModal({
  sessionData,
  onRestart,
  onClose,
}: {
  sessionData: SessionData;
  onRestart: () => void;
  onClose: () => void;
}) {
  const startB = sessionData.startBPM || 75;
  const endB = sessionData.endBPM || 72;
  const startH = sessionData.startHRV || 40;
  const endH = sessionData.endHRV || 55;

  const bpmChange = endB - startB;
  const hrvChange = endH - startH;

  // 生成心率曲线 SVG path
  const renderChart = () => {
    const points = sessionData.history.length >= 3
      ? sessionData.history.map(p => p.bpm)
      : null;

    if (!points) {
      return (
        <p className="text-xs text-[#b2bec3] text-center py-4">
          疗愈时间较短，暂无足够数据生成曲线
        </p>
      );
    }

    const width = 500;
    const height = 150;
    const padding = 20;
    const maxVal = Math.max(...points) + 5;
    const minVal = Math.min(...points) - 5;
    const range = maxVal - minVal || 1;

    const getX = (i: number) => (i / (points.length - 1)) * width;
    const getY = (val: number) => height - ((val - minVal) / range) * (height - padding * 2) - padding;

    let d = `M ${getX(0)} ${getY(points[0])}`;
    for (let i = 1; i < points.length; i++) {
      const cp1x = getX(i - 1) + (getX(i) - getX(i - 1)) / 2;
      const cp1y = getY(points[i - 1]);
      const cp2x = cp1x;
      const cp2y = getY(points[i]);
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${getX(i)} ${getY(points[i])}`;
    }

    const areaD = d + ` L ${width} ${height} L 0 ${height} Z`;

    return (
      <svg width="100%" height="150" viewBox="0 0 500 150" preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5ba09a" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#5ba09a" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#chartGradient)" />
        <path
          d={d}
          fill="none"
          stroke="#5ba09a"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  };

  return (
    <div
      className="fixed inset-0 flex justify-center items-center"
      style={{
        background: 'rgba(45, 52, 54, 0.4)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
        animation: 'fadeIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="flex flex-col items-stretch"
        style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: 40,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          maxWidth: 600,
          width: '90%',
          padding: '3rem',
          animation: 'slideUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        {/* 标题 */}
        <h2
          className="text-center font-extrabold mb-8"
          style={{
            fontSize: '1.8rem',
            background: 'linear-gradient(135deg, #2D3436 0%, #5ba09a 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          本次疗愈报告
        </h2>

        {/* 指标对比 */}
        <div
          className="grid gap-6 mb-6"
          style={{ gridTemplateColumns: '1fr 1fr' }}
        >
          {/* 心率 */}
          <div
            className="text-center"
            style={{
              background: '#fdfbf7',
              borderRadius: 20,
              padding: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.02)',
            }}
          >
            <div className="text-xs text-[#636E72] mb-3 font-semibold tracking-wider uppercase">
              心率 (BPM)
            </div>
            <div className="flex justify-center items-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#2D3436]">{startB}</span>
                <span className="text-[10px] text-[#b2bec3] mt-0.5">Before</span>
              </div>
              <span className="text-[#dfe6e9] text-xl font-light">→</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#2D3436]">{endB}</span>
                {bpmChange !== 0 && (
                  <span
                    className="text-xs font-extrabold ml-0.5"
                    style={{ color: bpmChange < 0 ? '#5ba09a' : '#c26158' }}
                  >
                    {bpmChange < 0 ? '↓' : '↑'}{Math.abs(bpmChange)}
                  </span>
                )}
                <span className="text-[10px] text-[#b2bec3] mt-0.5">After</span>
              </div>
            </div>
          </div>

          {/* 压力指数 */}
          <div
            className="text-center"
            style={{
              background: '#fdfbf7',
              borderRadius: 20,
              padding: '1.5rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              border: '1px solid rgba(0,0,0,0.02)',
            }}
          >
            <div className="text-xs text-[#636E72] mb-3 font-semibold tracking-wider uppercase">
              压力指数 (HRV)
            </div>
            <div className="flex justify-center items-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#2D3436]">{startH}</span>
                <span className="text-[10px] text-[#b2bec3] mt-0.5">Before</span>
              </div>
              <span className="text-[#dfe6e9] text-xl font-light">→</span>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-[#2D3436]">{endH}</span>
                {hrvChange !== 0 && (
                  <span
                    className="text-xs font-extrabold ml-0.5"
                    style={{ color: hrvChange > 0 ? '#5ba09a' : '#c26158' }}
                  >
                    {hrvChange > 0 ? '↑' : '↓'}{Math.abs(hrvChange)}
                  </span>
                )}
                <span className="text-[10px] text-[#b2bec3] mt-0.5">After</span>
              </div>
            </div>
          </div>
        </div>

        {/* 心率曲线 */}
        <div
          className="mb-4 overflow-hidden"
          style={{
            background: '#fdfbf7',
            borderRadius: 20,
            padding: '1.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.02)',
          }}
        >
          <p className="text-xs text-[#636E72] mb-3 text-left font-medium">
            全程心率波动曲线
          </p>
          {renderChart()}
        </div>

        {/* 再次体验按钮 */}
        <button
          onClick={onRestart}
          className="self-center mt-4 px-10 py-3.5 rounded-full text-white text-base font-semibold cursor-pointer outline-none border-none"
          style={{
            background: 'linear-gradient(135deg, #5ba09a 0%, #3d7a75 100%)',
            boxShadow: '0 10px 25px rgba(91,160,154,0.3)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          }}
          onMouseEnter={e => {
            (e.target as HTMLElement).style.transform = 'translateY(-3px) scale(1.02)';
            (e.target as HTMLElement).style.boxShadow = '0 20px 40px rgba(91,160,154,0.4)';
          }}
          onMouseLeave={e => {
            (e.target as HTMLElement).style.transform = 'none';
            (e.target as HTMLElement).style.boxShadow = '0 10px 25px rgba(91,160,154,0.3)';
          }}
        >
          再次体验
        </button>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; visibility: hidden; }
          to   { opacity: 1; visibility: visible; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px) scale(0.95); }
          to   { transform: translateY(0) scale(1); }
        }
        @media (max-width: 640px) {
          .grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
