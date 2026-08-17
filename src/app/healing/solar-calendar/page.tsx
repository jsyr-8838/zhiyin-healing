'use client';
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { SOLAR_TERM_DATES, SOLAR_TERM_WELLNESS, SEASON_COLORS, SEASON_ICONS, SEASON_GRADIENTS, getCurrentSolarTermDateInfo, getCurrentWellness, getSolarTermProximity, getCalendarTermMarkers, getSolarTermsInMonth, type SolarTermDateInfo, type SolarTermWellness } from '@/lib/solar-wellness';

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

const WUXING_HEX: Record<string, string> = { '木': '#5d8a63', '火': '#c26158', '土': '#c9a94f', '金': '#5ba09a', '水': '#3d7a75' };

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export default function SolarCalendarPage() {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [selectedWellness, setSelectedWellness] = useState<SolarTermWellness | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<SolarTermDateInfo | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const currentTermInfo = useMemo(() => getCurrentSolarTermDateInfo(), []);
  const currentWellness = useMemo(() => getCurrentWellness(), []);
  const proximity = useMemo(() => getSolarTermProximity(), []);

  const termMarkers = useMemo(() => getCalendarTermMarkers(viewYear, viewMonth), [viewYear, viewMonth]);

  const daysInMonth = useMemo(() => getDaysInMonth(viewYear, viewMonth), [viewYear, viewMonth]);
  const firstDay = useMemo(() => getFirstDayOfWeek(viewYear, viewMonth), [viewYear, viewMonth]);

  const seasonKey = useMemo(() => {
    const m = viewMonth;
    if (m >= 3 && m <= 5) return '春';
    if (m >= 6 && m <= 8) return '夏';
    if (m >= 9 && m <= 11) return '秋';
    return '冬';
  }, [viewMonth]);

  const seasonGrad = SEASON_GRADIENTS[seasonKey] || ['#f5ede3', '#e8d4b8'];

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    const remaining = 7 - (cells.length % 7);
    if (remaining < 7) for (let i = 0; i < remaining; i++) cells.push(null);
    return cells;
  }, [firstDay, daysInMonth]);

  const handlePrev = useCallback(() => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const handleNext = useCallback(() => {
    if (viewMonth === 12) { setViewMonth(1); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  const handleToday = useCallback(() => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth() + 1);
  }, [today]);

  const handleDayClick = useCallback((day: number) => {
    const marker = termMarkers.find(m => m.day === day);
    if (marker) {
      setSelectedTerm(marker.term);
      const w = SOLAR_TERM_WELLNESS.find(sw => sw.name === marker.term.name);
      if (w) setSelectedWellness(w);
      setPanelOpen(true);
    }
  }, [termMarkers]);

  const isToday = useCallback((day: number) => {
    return viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1 && day === today.getDate();
  }, [viewYear, viewMonth, today]);

  const phaseLabel: Record<string, string> = { pre: '节气将至', onset: '节气当令', post: '节气已过' };

  return (
    <div className="min-h-screen bg-[#faf5ee]">
      <div className="sticky top-0 z-20 bg-[#faf5ee]/90 backdrop-blur-md border-b border-[#e8d4b8]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/healing" className="text-[#8b7b6b] hover:text-[#1a1a1a] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </Link>
          <h1 className="text-lg font-bold text-[#1a1a1a]">节气养生日历</h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        {/* Current wellness banner */}
        <div className="rounded-2xl p-4 shadow-sm" style={{ background: `linear-gradient(135deg, ${seasonGrad[0]}, ${seasonGrad[1]})` }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{SEASON_ICONS[proximity.current.season]}</span>
            <span className="text-sm font-bold text-white/90 px-2 py-0.5 rounded-full" style={{ backgroundColor: SEASON_COLORS[proximity.current.season] }}>
              {proximity.current.name}
            </span>
            <span className="text-xs text-[#5a4a3a] bg-white/60 px-2 py-0.5 rounded-full">
              {phaseLabel[proximity.phase]}
            </span>
          </div>
          <p className="text-sm text-[#5a4a3a] leading-relaxed">
            {proximity.phase === 'pre' && currentWellness.preAdvice[0]}
            {proximity.phase === 'onset' && currentWellness.onsetAdvice[0]}
            {proximity.phase === 'post' && currentWellness.postAdvice[0]}
          </p>
          {proximity.daysUntilNext > 0 && (
            <div className="mt-2 text-xs text-[#8b7b6b]">
              距{proximity.next.name}还有 <strong className="text-[#1a1a1a]">{proximity.daysUntilNext}</strong> 天
            </div>
          )}
        </div>

        {/* Month navigation */}
        <div className="flex items-center justify-between">
          <button onClick={handlePrev} className="w-10 h-10 rounded-xl border border-[#e8d4b8] flex items-center justify-center text-[#8b7b6b] hover:bg-[#f5ede3] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <div className="text-center">
            <div className="text-lg font-bold text-[#1a1a1a]">{viewYear}年{MONTH_NAMES[viewMonth - 1]}</div>
            <button onClick={handleToday} className="text-xs text-[#c9a94f] font-semibold mt-0.5">回到今天</button>
          </div>
          <button onClick={handleNext} className="w-10 h-10 rounded-xl border border-[#e8d4b8] flex items-center justify-center text-[#8b7b6b] hover:bg-[#f5ede3] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
          </button>
        </div>

        {/* Calendar grid */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e8d4b8] overflow-hidden">
          <div className="grid grid-cols-7 border-b border-[#e8d4b8]">
            {WEEKDAYS.map((w, i) => (
              <div key={i} className={`py-2.5 text-center text-xs font-semibold ${i === 0 || i === 6 ? 'text-[#c26158]' : 'text-[#8b7b6b]'}`}>
                {w}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarCells.map((day, idx) => {
              if (day === null) return <div key={idx} className="h-14 bg-[#faf5ee]/30" />;
              const marker = termMarkers.find(m => m.day === day);
              const todayHighlight = isToday(day);
              const isSunday = idx % 7 === 0;
              const isSaturday = idx % 7 === 6;
              return (
                <button
                  key={idx}
                  onClick={() => handleDayClick(day)}
                  className={`h-14 flex flex-col items-center justify-center relative transition-colors ${
                    marker ? 'cursor-pointer hover:bg-[#f5ede3]' : 'cursor-default'
                  } ${todayHighlight ? 'bg-[#faf5ee]' : ''}`}
                >
                  <span className={`text-sm font-semibold ${
                    todayHighlight ? 'w-7 h-7 flex items-center justify-center rounded-full bg-[#c26158] text-white' :
                    marker ? 'text-[#1a1a1a]' :
                    isSunday || isSaturday ? 'text-[#c26158]/60' : 'text-[#5a4a3a]'
                  }`}>
                    {day}
                  </span>
                  {marker && (
                    <span className="text-[10px] font-bold leading-tight truncate max-w-full px-0.5 mt-0.5 rounded px-1" style={{ color: WUXING_HEX[marker.term.wuxing] || SEASON_COLORS[marker.term.season] }}>
                      {marker.term.name}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Solar terms list for this month */}
        {termMarkers.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#e8d4b8]">
            <h3 className="font-bold text-[#1a1a1a] mb-3 text-sm">本月节气</h3>
            <div className="space-y-2">
              {termMarkers.map(m => {
                const w = SOLAR_TERM_WELLNESS.find(sw => sw.name === m.term.name);
                return (
                  <button
                    key={m.term.name}
                    onClick={() => { setSelectedTerm(m.term); if (w) setSelectedWellness(w); setPanelOpen(true); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#faf5ee] transition-colors text-left"
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg" style={{ backgroundColor: SEASON_COLORS[m.term.season] }}>
                      {SEASON_ICONS[m.term.season]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#1a1a1a]">{m.term.name}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: WUXING_HEX[m.term.wuxing] }}>{m.term.wuxing}</span>
                      </div>
                      <div className="text-xs text-[#8b7b6b] mt-0.5">{viewMonth}月{m.day}日 · {m.term.meridian}</div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b8a898" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Detail panel overlay */}
      {panelOpen && selectedWellness && selectedTerm && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setPanelOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[#faf5ee] rounded-t-3xl overflow-y-auto animate-slide-up" style={{ animation: 'slideUp 0.3s ease-out' }}>
            <div className="sticky top-0 bg-[#faf5ee]/95 backdrop-blur-md z-10 px-4 pt-3 pb-2 border-b border-[#e8d4b8]">
              <div className="w-10 h-1 bg-[#d4c4b4] rounded-full mx-auto mb-3" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white" style={{ backgroundColor: SEASON_COLORS[selectedTerm.season] }}>
                  {SEASON_ICONS[selectedTerm.season]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#1a1a1a]">{selectedWellness.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: WUXING_HEX[selectedTerm.wuxing] }}>{selectedTerm.wuxing}行</span>
                    <span className="text-xs text-[#8b7b6b]">{selectedTerm.season}季</span>
                  </div>
                </div>
                <button onClick={() => setPanelOpen(false)} className="ml-auto w-8 h-8 rounded-full bg-[#f5ede3] flex items-center justify-center text-[#8b7b6b]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="px-4 py-4 space-y-4">
              {/* Phase advice */}
              {(['pre', 'onset', 'post'] as const).map(phase => {
                const adviceMap = { pre: selectedWellness.preAdvice, onset: selectedWellness.onsetAdvice, post: selectedWellness.postAdvice };
                const labelMap = { pre: '节气前 · 预备', onset: '节气当令 · 调养', post: '节气后 · 巩固' };
                const colorMap = { pre: '#c9a94f', onset: '#c26158', post: '#5d8a63' };
                const advice = adviceMap[phase];
                return (
                  <div key={phase} className="bg-white rounded-xl p-4 border border-[#e8d4b8]">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMap[phase] }} />
                      <h3 className="font-bold text-sm" style={{ color: colorMap[phase] }}>{labelMap[phase]}</h3>
                    </div>
                    <div className="space-y-1.5">
                      {advice.map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-[#5a4a3a]">
                          <span className="text-[#b8a898] mt-0.5">·</span>
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Essential oils */}
              <div className="bg-white rounded-xl p-4 border border-[#e8d4b8]">
                <h3 className="font-bold text-[#1a1a1a] mb-2 text-sm">🌿 推荐精油</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedWellness.essentialOils.map(oil => (
                    <span key={oil} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#5d8a63]/10 text-[#5d8a63]">
                      {oil}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meridian info */}
              <div className="bg-white rounded-xl p-4 border border-[#e8d4b8]">
                <h3 className="font-bold text-[#1a1a1a] mb-2 text-sm">⚡ 经络信息</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[#1a1a1a]">{selectedWellness.meridian}</div>
                    <div className="text-xs text-[#8b7b6b] mt-0.5">当令时辰：{selectedWellness.peakTime}</div>
                  </div>
                  <Link
                    href={`/meridian?code=${selectedTerm.meridianCode}`}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border border-[#5d8a63] text-[#5d8a63] hover:bg-[#5d8a63]/10 transition-colors"
                  >
                    查看经络 →
                  </Link>
                </div>
              </div>

              {/* Diet & Routine */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border border-[#e8d4b8]">
                  <h3 className="font-bold text-[#1a1a1a] mb-2 text-sm">🍚 饮食要点</h3>
                  <p className="text-xs text-[#5a4a3a] leading-relaxed">{selectedWellness.dietFocus}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-[#e8d4b8]">
                  <h3 className="font-bold text-[#1a1a1a] mb-2 text-sm">🛌 起居要点</h3>
                  <p className="text-xs text-[#5a4a3a] leading-relaxed">{selectedWellness.routineFocus}</p>
                </div>
              </div>

              {/* Incense */}
              <div className="bg-white rounded-xl p-4 border border-[#e8d4b8]">
                <h3 className="font-bold text-[#1a1a1a] mb-2 text-sm">🎍 宜用熏香</h3>
                <p className="text-sm text-[#5a4a3a]">{selectedWellness.incense}</p>
              </div>

              {/* Contraindication */}
              <div className="bg-[#c26158]/5 border border-[#c26158]/20 rounded-xl p-4">
                <h3 className="font-bold text-[#c26158] mb-2 text-sm">⚠️ 禁忌</h3>
                <p className="text-sm text-[#8b5a5a]">{selectedWellness.contraindication}</p>
              </div>

              {/* Season overview */}
              <div className="rounded-xl p-4 text-center" style={{ background: `linear-gradient(135deg, ${seasonGrad[0]}, ${seasonGrad[1]})` }}>
                <div className="text-3xl mb-1">{SEASON_ICONS[selectedTerm.season]}</div>
                <div className="text-sm font-bold text-[#5a4a3a]">{selectedTerm.season}季 · {selectedTerm.wuxing}行当令</div>
                <div className="text-xs text-[#8b7b6b] mt-1">{selectedTerm.meridian} · 黄经{selectedTerm.huangJing}</div>
              </div>

              <div className="p-3 rounded-xl bg-[#f5ede3] text-xs text-center text-[#8b7b6b]">
                节气养生日历仅供参考，具体调理请结合个人体质
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
