import React, { memo } from 'react';
import { SHI_CHEN_MAP } from '@/lib/tcm-calendar';
import { type WuxingElement } from '@/lib/meridian-data';
import { ViewMode, WUXING_COLORS_DISPLAY, WUXING_LABELS } from './constants';

interface MeridianBottomBarProps {
  currentShiChen: number;
  viewMode: ViewMode;
  autoRotate: boolean;
  wuxingFilter: Set<WuxingElement>;
  onShiChenChange: (index: number) => void;
  onViewModeChange: (mode: ViewMode) => void;
  onAutoRotateToggle: () => void;
  onWuxingFilterChange: (filter: Set<WuxingElement>) => void;
}

export const MeridianBottomBar = memo(function MeridianBottomBar({
  currentShiChen,
  viewMode,
  autoRotate,
  wuxingFilter,
  onShiChenChange,
  onViewModeChange,
  onAutoRotateToggle,
  onWuxingFilterChange,
}: MeridianBottomBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <div className="flex flex-col gap-2 px-4 pb-4 pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3">
          <div className="flex items-center gap-1 mb-2">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider mr-2">子午流注</span>
            {SHI_CHEN_MAP.map((sc, i) => (
              <button
                key={sc.index}
                onClick={() => onShiChenChange(i)}
                className={`flex-1 h-6 rounded text-[10px] font-bold transition-all ${
                  i === currentShiChen ? 'ring-1 ring-white/30' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: i === currentShiChen ? sc.color : `${sc.color}44`,
                  color: sc.wuxing === '金' || sc.wuxing === '土' ? '#333' : '#fff',
                }}
              >
                {sc.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2">
            {(['bones', 'meridians', 'points', 'all'] as ViewMode[]).map(mode => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  viewMode === mode ? 'bg-white/20 text-white' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {{ bones: '骨骼', meridians: '经络', points: '穴位', all: '全部' }[mode]}
              </button>
            ))}
          </div>

          <button
            onClick={onAutoRotateToggle}
            className={`bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2 text-xs font-medium transition-all ${
              autoRotate ? 'text-blue-400 border-blue-500/30' : 'text-zinc-400 hover:text-white'
            }`}
          >
            {autoRotate ? '⟳ 旋转中' : '⟳ 自动旋转'}
          </button>

          <div className="flex items-center gap-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl px-3 py-2">
            <span className="text-xs text-zinc-500">五行</span>
            {WUXING_LABELS.map(w => (
              <button
                key={w}
                onClick={() => {
                  const next = new Set(wuxingFilter);
                  if (next.has(w)) next.delete(w); else next.add(w);
                  onWuxingFilterChange(next);
                }}
                className={`w-6 h-6 rounded-full text-[10px] font-bold border transition-all ${
                  wuxingFilter.has(w) ? 'scale-110 border-white/50' : 'border-transparent opacity-40'
                }`}
                style={{
                  backgroundColor: WUXING_COLORS_DISPLAY[w],
                  color: w === '金' || w === '土' ? '#333' : '#fff',
                }}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});
