import React, { memo } from 'react';
import { type WuYunLiuQi } from '@/lib/tcm-calendar';
import { WUXING_COLORS_DISPLAY } from './constants';

interface MeridianTopBarProps {
  currentWylq: WuYunLiuQi;
  shiChenInfo: { name: string; timeRange: string; meridianName: string; color: string };
  onWuYunLiuQiClick: () => void;
  onToggleSidebar: () => void;
  onToggleInfoPanel: () => void;
}

export const MeridianTopBar = memo(function MeridianTopBar({
  currentWylq,
  shiChenInfo,
  onWuYunLiuQiClick,
  onToggleSidebar,
  onToggleInfoPanel,
}: MeridianTopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 pointer-events-none">
      <div className="flex items-center gap-2">
        <a
          href="/dashboard"
          className="md:hidden pointer-events-auto w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white text-lg hover:bg-black/90 transition-colors"
        >
          ←
        </a>
        <button
          onClick={onToggleSidebar}
          className="md:hidden pointer-events-auto w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white text-lg"
        >
          ☰
        </button>
      </div>

      <div
        className="hidden md:flex pointer-events-auto items-center gap-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2 cursor-pointer hover:border-white/20 transition-colors"
        onClick={onWuYunLiuQiClick}
      >
        <span className="text-xs text-zinc-400">五运六气</span>
        <span className="text-sm font-semibold" style={{ color: WUXING_COLORS_DISPLAY[currentWylq.zhongYun] }}>
          {currentWylq.tianGan}{currentWylq.diZhi}年 · {currentWylq.zhongYunName}
        </span>
        <span className="text-xs text-zinc-500">{currentWylq.siTian} / {currentWylq.zaiQuan}</span>
      </div>

      <div className="pointer-events-auto flex items-center gap-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2">
        <span className="text-xs text-zinc-400">子午流注</span>
        <span className="text-sm font-bold" style={{ color: shiChenInfo.color }}>
          {shiChenInfo.name}时 ({shiChenInfo.timeRange})
        </span>
        <span className="text-xs text-zinc-400">{shiChenInfo.meridianName}当令</span>
      </div>

      <button
        onClick={onToggleInfoPanel}
        className="md:hidden pointer-events-auto w-10 h-10 rounded-full bg-black/80 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white text-lg"
      >
        ℹ
      </button>
    </div>
  );
});
