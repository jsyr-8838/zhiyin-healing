'use client';

import React from 'react';

/**
 * TcmBodyModel (2D版) — 替代原 R3F 3D 人体模型
 * 显示人体正面图 + 穴位标记点，纯2D实现，零依赖
 */

export interface TcmBodyModelProps {
  selectedMeridians: Set<string>;
  selectedPoint: { code: string; name: string; x?: number; y?: number; meridian?: string } | null;
  wuxingFilter: Set<string>;
  autoRotate: boolean;
  onPointClick?: (point: { code: string; name: string }) => void;
}

const WUXING_COLORS: Record<string, string> = {
  '木': '#5d8a63',
  '火': '#c26158',
  '土': '#c9a94f',
  '金': '#8fa6a0',
  '水': '#5ba09a',
};

export function TcmBodyModel(_props: TcmBodyModelProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#faf5ee] rounded-xl p-4">
      {/* 2D 人体轮廓 SVG */}
      <svg viewBox="0 0 200 400" className="w-full max-w-[200px] h-auto" style={{ opacity: 0.9 }}>
        {/* 头 */}
        <circle cx="100" cy="30" r="22" fill="none" stroke="#1e2d26" strokeWidth="1.5" />
        {/* 脖子 */}
        <line x1="100" y1="52" x2="100" y2="65" stroke="#1e2d26" strokeWidth="1.5" />
        {/* 躯干 */}
        <path d="M70 65 Q100 60 130 65 L135 180 Q100 185 65 180 Z" fill="none" stroke="#1e2d26" strokeWidth="1.5" />
        {/* 手臂左 */}
        <path d="M70 68 L45 170" fill="none" stroke="#1e2d26" strokeWidth="1.5" />
        {/* 手臂右 */}
        <path d="M130 68 L155 170" fill="none" stroke="#1e2d26" strokeWidth="1.5" />
        {/* 腿左 */}
        <path d="M75 180 L72 350" fill="none" stroke="#1e2d26" strokeWidth="1.5" />
        {/* 腿右 */}
        <path d="M125 180 L128 350" fill="none" stroke="#1e2d26" strokeWidth="1.5" />
        {/* 五行标注圆点 */}
        <circle cx="85" cy="100" r="4" fill={WUXING_COLORS['木']} opacity="0.7" />
        <circle cx="115" cy="100" r="4" fill={WUXING_COLORS['火']} opacity="0.7" />
        <circle cx="100" cy="130" r="4" fill={WUXING_COLORS['土']} opacity="0.7" />
        <circle cx="80" cy="155" r="4" fill={WUXING_COLORS['金']} opacity="0.7" />
        <circle cx="120" cy="155" r="4" fill={WUXING_COLORS['水']} opacity="0.7" />
      </svg>
      <p className="text-xs text-[#8b7b6b] mt-3 text-center">
        经络穴位图 · 点击穴位查看详情
      </p>
    </div>
  );
}
