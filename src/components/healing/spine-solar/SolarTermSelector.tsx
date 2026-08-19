'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  ORDERED_TERMS,
  SEASON_COLORS,
  SEASON_ICONS,
  WUXING_COLORS,
  getCurrentSolarTerm,
  type Season,
  type WuxingElement,
  type SpineSolarEntry,
  spineSolarData,
} from '@/lib/spine-solar-data';

interface SolarTermSelectorProps {
  selectedTerm: string;
  onSelect: (term: string) => void;
}

export default function SolarTermSelector({ selectedTerm, onSelect }: SolarTermSelectorProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showAll, setShowAll] = useState(false);
  const currentTerm = getCurrentSolarTerm();

  /* 节气→季节映射 */
  const getTermSeason = (term: string): Season => {
    return spineSolarData.find(d => d.solarTerm === term)?.season ?? '冬';
  };

  const getTermWuxing = (term: string): WuxingElement => {
    return spineSolarData.find(d => d.solarTerm === term)?.wuxing ?? '水';
  };

  /* 自动滚动到当前选中项 */
  useEffect(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const selected = container.querySelector(`[data-term="${selectedTerm}"]`);
    if (selected) {
      const containerRect = container.getBoundingClientRect();
      const itemRect = selected.getBoundingClientRect();
      const scrollLeft = selected.getBoundingClientRect().left - containerRect.left + container.scrollLeft - containerRect.width / 2 + itemRect.width / 2;
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }
  }, [selectedTerm]);

  const displayTerms = showAll ? ORDERED_TERMS : ORDERED_TERMS;

  return (
    <div className="w-full">
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#5a4a3a]">
          二十四节气
        </h3>
        <span className="text-xs text-[#8b7b6b]">
          当前: {SEASON_ICONS[getTermSeason(currentTerm)]} {currentTerm}
        </span>
      </div>

      {/* 节气按钮滚动区 */}
      <div
        ref={scrollRef}
        className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#d4c5b0] scrollbar-track-transparent"
        style={{ scrollbarWidth: 'thin' }}
      >
        {displayTerms.map((term) => {
          const season = getTermSeason(term);
          const wuxing = getTermWuxing(term);
          const isSelected = term === selectedTerm;
          const isCurrent = term === currentTerm;
          const seasonColor = SEASON_COLORS[season];
          const wuxingColor = WUXING_COLORS[wuxing];

          return (
            <button
              key={term}
              data-term={term}
              onClick={() => onSelect(term)}
              className={`
                relative flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-200 whitespace-nowrap
                ${isSelected
                  ? 'text-white shadow-md scale-105'
                  : 'text-[#5a4a3a] hover:bg-[#f0e8dc]'
                }
                ${isCurrent && !isSelected ? 'ring-1 ring-offset-1' : ''}
              `}
              style={{
                backgroundColor: isSelected ? wuxingColor : 'rgba(250,245,238,0.8)',
                ...(isCurrent && !isSelected ? { ringColor: seasonColor } : {}),
              }}
            >
              {isCurrent && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: seasonColor }}
                />
              )}
              {SEASON_ICONS[season]} {term}
            </button>
          );
        })}
      </div>

      {/* 季节图例 */}
      <div className="flex items-center gap-4 mt-2">
        {(['春', '夏', '秋', '冬'] as Season[]).map(s => (
          <div key={s} className="flex items-center gap-1">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: SEASON_COLORS[s] }}
            />
            <span className="text-[10px] text-[#8b7b6b]">{s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
