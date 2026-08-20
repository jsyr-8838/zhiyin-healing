import React, { memo } from 'react';
import {
  TWELVE_MERIDIANS,
  getMeridianByCode,
  type WuxingElement,
  type Acupoint,
  type Meridian,
} from '@/lib/meridian-data';
import { SHI_CHEN_MAP } from '@/lib/tcm-calendar';
import {
  WUXING_COLORS_DISPLAY,
  WUXING_LABELS,
  getPointBadges,
  getBadgeColor,
  MERIDIAN_CLASSIC_QUOTES,
  MOXIBUSTION_PRESCRIPTIONS,
} from './constants';

interface MeridianSidebarProps {
  open: boolean;
  selectedMeridians: Set<string>;
  selectedPoint: Acupoint | null;
  wuxingFilter: Set<WuxingElement>;
  searchQuery: string;
  searchResults: Array<{ point: Acupoint; meridian: Meridian }>;
  showSearchDropdown: boolean;
  currentShiChen: number;
  shiChenInfo: { name: string; meridianName: string; color: string; openPointName: string; openPoint: string };
  filteredMeridians: Meridian[];
  onToggleMeridian: (code: string) => void;
  onSearch: (query: string) => void;
  onClearSearch: () => void;
  onShowSearchDropdown: (show: boolean) => void;
  onWuxingFilterChange: (filter: Set<WuxingElement>) => void;
  onPointSelect: (point: Acupoint, meridian: Meridian) => void;
  onFocusAcupoint: (point: Acupoint, meridian: Meridian) => void;
}

export const MeridianSidebar = memo(function MeridianSidebar({
  open,
  selectedMeridians,
  selectedPoint,
  wuxingFilter,
  searchQuery,
  searchResults,
  showSearchDropdown,
  currentShiChen,
  shiChenInfo,
  filteredMeridians,
  onToggleMeridian,
  onSearch,
  onClearSearch,
  onShowSearchDropdown,
  onWuxingFilterChange,
  onPointSelect,
  onFocusAcupoint,
}: MeridianSidebarProps) {
  const singleMeridian = selectedMeridians.size === 1
    ? TWELVE_MERIDIANS.find(m => selectedMeridians.has(m.code))
    : null;

  return (
    <div
      className={`fixed left-0 top-0 bottom-0 z-50 w-[340px] max-w-[85vw] bg-black/80 border-r border-white/10
        transform transition-transform duration-300 overflow-y-auto
        ${open ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:top-12 md:bottom-20 md:rounded-r-2xl md:border md:h-auto`}
    >
      <div className="p-4">
        <h2 className="text-base font-bold text-white mb-1">经络穴位 3D 可视化</h2>
        <p className="text-xs text-zinc-500 mb-3">基于《灵枢·骨度》骨度分寸法 · BodyParts3D 解剖模型</p>

        <a
          href="/quiz"
          className="flex items-center gap-2 mb-3 px-3 py-2 bg-emerald-600/15 border border-emerald-500/30 rounded-xl text-emerald-300 hover:bg-emerald-600/25 transition-all"
        >
          <span className="text-sm">📝</span>
          <span className="text-sm font-medium">穴位测验</span>
          <span className="text-xs text-emerald-400/60 ml-auto">答题+3D联动</span>
        </a>

        <div className="mb-3 p-3 bg-amber-600/10 border border-amber-500/20 rounded-xl">
          <h3 className="text-sm font-bold text-amber-300 mb-2">灸疗处方</h3>
          <div className="space-y-1.5">
            {MOXIBUSTION_PRESCRIPTIONS.map(rx => (
              <button
                key={rx.name}
                onClick={() => {
                  const firstPointName = rx.points.split('、')[0];
                  for (const m of TWELVE_MERIDIANS) {
                    const found = m.points.find(p => p.name === firstPointName);
                    if (found) {
                      onFocusAcupoint(found, m);
                      break;
                    }
                  }
                }}
                className="w-full text-left bg-white/5 hover:bg-white/10 rounded-lg p-2 transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-200">{rx.name}</span>
                  <span className="text-[10px] bg-amber-600/20 text-amber-400 px-1.5 py-0.5 rounded">{rx.target}</span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-0.5">{rx.points} · {rx.time}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="relative mb-3">
          <div className="flex gap-1">
            <input
              type="text"
              value={searchQuery}
              onChange={e => onSearch(e.target.value)}
              onFocus={() => { if (searchResults.length > 0) onShowSearchDropdown(true); }}
              onBlur={() => setTimeout(() => onShowSearchDropdown(false), 200)}
              placeholder="搜索穴位名/代号/主治..."
              className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={onClearSearch}
                className="px-2 text-zinc-500 hover:text-white text-sm"
              >✕</button>
            )}
          </div>
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 max-h-[280px] overflow-y-auto bg-zinc-900/95 border border-white/15 rounded-lg shadow-xl">
              <div className="px-2 py-1.5 text-[10px] text-zinc-500 border-b border-white/5">
                找到 {searchResults.length > 20 ? '20+' : searchResults.length} 个结果
              </div>
              {searchResults.map(({ point, meridian }) => (
                <div
                  key={point.code}
                  onMouseDown={() => onFocusAcupoint(point, meridian)}
                  className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-white/10 transition-colors border-b border-white/3 last:border-b-0"
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: WUXING_COLORS_DISPLAY[meridian.wuxing] }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-white text-xs font-medium">{point.name}</span>
                      <span className="text-zinc-500 text-[10px]">{point.code}</span>
                    </div>
                    <div className="text-zinc-500 text-[10px] truncate">{meridian.name} · {point.location || ''}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-zinc-500">五行筛选:</span>
          {WUXING_LABELS.map(w => (
            <button
              key={w}
              onClick={() => {
                const next = new Set(wuxingFilter);
                if (next.has(w)) next.delete(w); else next.add(w);
                onWuxingFilterChange(next);
              }}
              className={`w-7 h-7 rounded-full text-xs font-bold border-2 transition-all ${
                wuxingFilter.has(w) ? 'scale-110' : 'opacity-50'
              }`}
              style={{
                backgroundColor: WUXING_COLORS_DISPLAY[w],
                borderColor: wuxingFilter.has(w) ? 'white' : 'transparent',
                color: w === '金' || w === '土' ? '#333' : '#fff',
              }}
            >
              {w}
            </button>
          ))}
        </div>

        <div className="space-y-1 mb-4">
          {filteredMeridians.map(m => (
            <div
              key={m.code}
              onClick={() => onToggleMeridian(m.code)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all text-sm ${
                selectedMeridians.has(m.code)
                  ? 'bg-white/10 border-l-2'
                  : 'bg-white/3 hover:bg-white/6'
              }`}
              style={{ borderLeftColor: WUXING_COLORS_DISPLAY[m.wuxing] }}
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: WUXING_COLORS_DISPLAY[m.wuxing] }}
              />
              <span className="text-white font-medium flex-1 truncate">{m.name}</span>
              <span className="text-zinc-500 text-xs">{m.points.length}穴</span>
              {selectedMeridians.has(m.code) && <span className="text-blue-400 text-xs">✓</span>}
            </div>
          ))}
        </div>

        {singleMeridian && (
          <div className="mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: WUXING_COLORS_DISPLAY[singleMeridian.wuxing] }} />
              <h3 className="text-white font-bold text-sm">{singleMeridian.name}</h3>
            </div>
            <div className="text-xs text-zinc-400 space-y-1">
              <div>五行: <span style={{ color: WUXING_COLORS_DISPLAY[singleMeridian.wuxing] }}>{singleMeridian.wuxing}</span> · 脏腑: {singleMeridian.organ}</div>
              <div className="text-zinc-600 mt-2 text-[10px] leading-relaxed">
                {MERIDIAN_CLASSIC_QUOTES[singleMeridian.code]}
              </div>
            </div>
            <div className="mt-2 max-h-[200px] overflow-y-auto space-y-0.5">
              {singleMeridian.points.map(p => {
                const badges = getPointBadges(p);
                return (
                  <div
                    key={p.code}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPointSelect(p, singleMeridian);
                    }}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer hover:bg-white/10 transition-colors ${
                      selectedPoint?.code === p.code ? 'bg-white/10' : ''
                    }`}
                  >
                    <span className="text-zinc-300 w-8 shrink-0">{p.code}</span>
                    <span className="text-white font-medium flex-1">{p.name}</span>
                    {badges.map(b => (
                      <span
                        key={b}
                        className="px-1 py-0.5 rounded text-[10px] font-bold"
                        style={{
                          backgroundColor: getBadgeColor(b),
                          color: '#fff',
                        }}
                      >
                        {b}
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold text-white">子午流注</span>
            <span className="text-xs text-zinc-500">当前:</span>
            <span className="text-xs font-bold" style={{ color: shiChenInfo.color }}>
              {shiChenInfo.name}时
            </span>
          </div>
          <div className="text-xs text-zinc-400">
            <div>{shiChenInfo.meridianName} 当令</div>
            <div className="mt-1">
              开穴: <span className="text-white font-medium">{shiChenInfo.openPointName} ({shiChenInfo.openPoint})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
