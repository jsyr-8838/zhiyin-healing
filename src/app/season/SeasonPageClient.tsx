'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import {
  solarTermsHealth,
  getCurrentSolarTermHealth,
  getSeasonTheme,
  healthStandards,
  seasonalSleep,
  acupointToFocusCode,
  SOLAR_TERM_DATES,
  SOLAR_TERM_WELLNESS,
  SEASON_COLORS,
  SEASON_ICONS,
  SEASON_GRADIENTS,
  getCurrentSolarTermDateInfo,
  getCurrentWellness,
  getSolarTermProximity,
  getCalendarTermMarkers,
  type SolarTermHealth,
  type SolarTermWellness,
} from '@/lib/solar-terms-health';
import { Leaf, Moon, Activity, AlertTriangle, ChevronRight, X } from 'lucide-react';

const SEASON_TABS = ['全部', '春', '夏', '秋', '冬'] as const;
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];
const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
const WUXING_HEX: Record<string, string> = { '木': '#5d8a63', '火': '#c26158', '土': '#c9a94f', '金': '#5ba09a', '水': '#3d7a75' };

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

export default function SeasonPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');

  const [activeSeason, setActiveSeason] = useState<string>('全部');
  const [selectedTerm, setSelectedTerm] = useState<SolarTermHealth | null>(
    highlightId ? solarTermsHealth.find(t => t.id === Number(highlightId)) || null : null
  );
  const [viewMode, setViewMode] = useState<'list' | 'wheel' | 'calendar'>('wheel');

  // Calendar state
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth() + 1);
  const [calWellness, setCalWellness] = useState<SolarTermWellness | null>(null);
  const [calPanelOpen, setCalPanelOpen] = useState(false);

  const currentTerm = useMemo(() => getCurrentSolarTermHealth(), []);
  const currentTheme = useMemo(() => getSeasonTheme(currentTerm.season), [currentTerm]);

  // Calendar wellness data
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

  const filteredTerms = activeSeason === '全部'
    ? solarTermsHealth
    : solarTermsHealth.filter(t => t.season === activeSeason);

  // 节气轮盘 SVG 参数
  const wheelSize = 320;
  const center = wheelSize / 2;
  const outerR = wheelSize / 2 - 20;
  const innerR = outerR - 30;

  const openDetail = (term: SolarTermHealth) => setSelectedTerm(term);
  const closeDetail = () => setSelectedTerm(null);

  const goToAcupoint = (term: SolarTermHealth) => {
    router.push('/healing/acupoint');
  };

  // Calendar handlers
  const handlePrevMonth = useCallback(() => {
    if (viewMonth === 1) { setViewMonth(12); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const handleNextMonth = useCallback(() => {
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
      const w = SOLAR_TERM_WELLNESS.find(sw => sw.name === marker.term.name);
      if (w) {
        setCalWellness(w);
        setCalPanelOpen(true);
      }
    }
  }, [termMarkers]);

  const isToday = useCallback((day: number) => {
    return viewYear === today.getFullYear() && viewMonth === today.getMonth() + 1 && day === today.getDate();
  }, [viewYear, viewMonth, today]);

  // Get wellness data for the selected term in main detail panel
  const selectedWellness = useMemo(() => {
    if (!selectedTerm) return null;
    return SOLAR_TERM_WELLNESS.find(w => w.name === selectedTerm.name) || null;
  }, [selectedTerm]);

  const phaseLabel: Record<string, string> = { pre: '节气将至', onset: '节气当令', post: '节气已过' };

  return (
    <div className="min-h-screen bg-[#fafaf9] text-gray-900 pb-24">
      {/* === 头部：当前节气 === */}
      <div className="px-5 pt-12 pb-8 text-white" style={{ background: currentTheme.headerGradient }}>
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="text-white/70 hover:text-white text-sm">←</Link>
          <h1 className="text-2xl font-black">节气养生</h1>
          <Leaf size={22} className="text-white/50 ml-auto" />
        </div>

        {/* 当前节气概览 */}
        <div className="bg-white/15 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-white/60">当前节气</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
              {currentTerm.element} · {currentTerm.organ}
            </span>
          </div>
          <div className="flex items-end gap-3">
            <div>
              <h3 className="text-3xl font-black">{currentTerm.name}</h3>
              <p className="text-sm text-white/80 mt-1">{currentTerm.theme}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xl font-bold">{currentTerm.date.slice(5)}</p>
              <p className="text-xs text-white/60">{currentTerm.time}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => openDetail(currentTerm)}
              className="flex-1 bg-white/20 text-white text-xs font-bold py-2 rounded-lg hover:bg-white/30 transition"
            >
              查看养生详情
            </button>
            <button
              onClick={() => goToAcupoint(currentTerm)}
              className="bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-white/20 transition"
            >
              穴位定位
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 pt-5">
        {/* === 快捷卡片：健康标准 + 四季作息 === */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* 倪师六大健康标准 */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
              <Activity size={14} className="text-red-500" /> 健康标准
            </h3>
            <div className="space-y-2">
              {healthStandards.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-xs text-gray-700">{s.title}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 四季作息 */}
          <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-sm text-gray-900 mb-3 flex items-center gap-1.5">
              <Moon size={14} className="text-indigo-500" /> 四季作息
            </h3>
            <div className="space-y-2">
              {seasonalSleep.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded text-[10px] font-bold text-white flex items-center justify-center flex-shrink-0" style={{ backgroundColor: s.color }}>
                    {s.season}
                  </div>
                  <span className="text-xs text-gray-700">{s.pattern}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* === 视图切换 + 季节Tab === */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-2 overflow-x-auto">
            {SEASON_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSeason(tab)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                  activeSeason === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab === '全部' ? '全部' : `${tab}季`}
              </button>
            ))}
          </div>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('wheel')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode === 'wheel' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              轮盘
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              列表
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition ${viewMode === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}
            >
              日历
            </button>
          </div>
        </div>

        {/* === 节气轮盘视图 === */}
        {viewMode === 'wheel' && (
          <div className="flex justify-center mb-6">
            <svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`} className="select-none">
              {/* 外圈装饰环 */}
              <circle cx={center} cy={center} r={outerR + 8} fill="none" stroke="#e5e7eb" strokeWidth="1" />
              {/* 内圈 */}
              <circle cx={center} cy={center} r={innerR - 5} fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
              {/* 中心圆：当前节气 */}
              <circle cx={center} cy={center} r={35} fill={currentTerm.color} />
              <text x={center} y={center - 6} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{currentTerm.name}</text>
              <text x={center} y={center + 10} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">{currentTerm.element}·{currentTerm.organ}</text>

              {/* 24个节气节点 */}
              {solarTermsHealth.map((term, i) => {
                const angle = (i * 15 - 90) * (Math.PI / 180);
                const x = center + outerR * Math.cos(angle);
                const y = center + outerR * Math.sin(angle);
                const labelR = outerR + 14;
                const lx = center + labelR * Math.cos(angle);
                const ly = center + labelR * Math.sin(angle);
                const isCurrent = term.id === currentTerm.id;
                const isFiltered = activeSeason !== '全部' && term.season !== activeSeason;
                return (
                  <g key={term.id} onClick={() => !isFiltered && openDetail(term)} className={isFiltered ? 'opacity-20' : 'cursor-pointer'}>
                    <circle cx={x} cy={y} r={isCurrent ? 10 : 6} fill={term.color} stroke={isCurrent ? 'white' : 'none'} strokeWidth={isCurrent ? 2 : 0} />
                    <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fontSize="8" fill={isCurrent ? term.color : '#6b7280'} fontWeight={isCurrent ? 'bold' : 'normal'}>
                      {term.name}
                    </text>
                  </g>
                );
              })}

              {/* 季节分隔线 */}
              {[0, 6, 12, 18].map(startIdx => {
                const angle = (startIdx * 15 - 90) * (Math.PI / 180);
                const x1 = center + (innerR - 5) * Math.cos(angle);
                const y1 = center + (innerR - 5) * Math.sin(angle);
                const x2 = center + (outerR + 8) * Math.cos(angle);
                const y2 = center + (outerR + 8) * Math.sin(angle);
                return <line key={startIdx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#d1d5db" strokeWidth="0.5" />;
              })}
            </svg>
          </div>
        )}

        {/* === 节气列表视图 === */}
        {viewMode === 'list' && (
          <div className="space-y-3">
            {filteredTerms.map(term => {
              const isCurrent = term.id === currentTerm.id;
              return (
                <div
                  key={term.id}
                  onClick={() => openDetail(term)}
                  className={`bg-white rounded-2xl p-4 border cursor-pointer transition-all ${
                    isCurrent ? `border-emerald-300 shadow-md` : 'border-gray-100 hover:border-emerald-100 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                      style={{ backgroundColor: term.color }}
                    >
                      {term.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{term.name}</h3>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">当前</span>
                        )}
                        <span className="text-[10px] text-gray-400 ml-auto">{term.date.slice(5)}</span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">{term.theme} · {term.element}·{term.organ}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* === 节气日历视图 === */}
        {viewMode === 'calendar' && (
          <div className="space-y-4">
            {/* 当前节气提示横幅 */}
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

            {/* 月份导航 */}
            <div className="flex items-center justify-between">
              <button onClick={handlePrevMonth} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
              </button>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{viewYear}年{MONTH_NAMES[viewMonth - 1]}</div>
                <button onClick={handleToday} className="text-xs text-emerald-600 font-semibold mt-0.5">回到今天</button>
              </div>
              <button onClick={handleNextMonth} className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
              </button>
            </div>

            {/* 日历网格 */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="grid grid-cols-7 border-b border-gray-100">
                {WEEKDAYS.map((w, i) => (
                  <div key={i} className={`py-2.5 text-center text-xs font-semibold ${i === 0 || i === 6 ? 'text-red-400' : 'text-gray-500'}`}>
                    {w}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7">
                {calendarCells.map((day, idx) => {
                  if (day === null) return <div key={idx} className="h-14 bg-gray-50/30" />;
                  const marker = termMarkers.find(m => m.day === day);
                  const todayHighlight = isToday(day);
                  const isSunday = idx % 7 === 0;
                  const isSaturday = idx % 7 === 6;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleDayClick(day)}
                      className={`h-14 flex flex-col items-center justify-center relative transition-colors ${
                        marker ? 'cursor-pointer hover:bg-emerald-50' : 'cursor-default'
                      } ${todayHighlight ? 'bg-emerald-50' : ''}`}
                    >
                      <span className={`text-sm font-semibold ${
                        todayHighlight ? 'w-7 h-7 flex items-center justify-center rounded-full bg-emerald-500 text-white' :
                        marker ? 'text-gray-900' :
                        isSunday || isSaturday ? 'text-red-400/60' : 'text-gray-700'
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

            {/* 本月节气列表 */}
            {termMarkers.length > 0 && (
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-3 text-sm">本月节气</h3>
                <div className="space-y-2">
                  {termMarkers.map(m => {
                    const w = SOLAR_TERM_WELLNESS.find(sw => sw.name === m.term.name);
                    return (
                      <button
                        key={m.term.name}
                        onClick={() => { if (w) { setCalWellness(w); setCalPanelOpen(true); } }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg" style={{ backgroundColor: SEASON_COLORS[m.term.season] }}>
                          {SEASON_ICONS[m.term.season]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{m.term.name}</span>
                            <span className="text-xs px-1.5 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: WUXING_HEX[m.term.wuxing] }}>{m.term.wuxing}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{viewMonth}月{m.day}日 · {m.term.meridian}</div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* === 养生详情弹窗（轮盘/列表用） === */}
      {selectedTerm && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={closeDetail}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative w-full max-w-lg bg-white rounded-t-3xl max-h-[85vh] overflow-y-auto animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            {/* 弹窗头部 */}
            <div className="sticky top-0 z-10 bg-white rounded-t-3xl border-b border-gray-100 p-5 pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-xl"
                    style={{ backgroundColor: selectedTerm.color }}
                  >
                    {selectedTerm.name.slice(0, 1)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{selectedTerm.name}</h2>
                    <p className="text-xs text-gray-400">{selectedTerm.pinyin} · {selectedTerm.date} {selectedTerm.time}</p>
                  </div>
                </div>
                <button onClick={closeDetail} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <X size={16} className="text-gray-500" />
                </button>
              </div>
              <div className="flex gap-2 mt-3">
                <span className="text-xs px-2 py-1 rounded-full font-medium text-white" style={{ backgroundColor: selectedTerm.color }}>
                  {selectedTerm.element}行 · {selectedTerm.organ}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                  {selectedTerm.season}季
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                  六字诀「{selectedTerm.sixSound}」
                </span>
              </div>
            </div>

            {/* 弹窗内容 */}
            <div className="p-5 pt-3 space-y-4">
              {/* 主题描述 */}
              <div>
                <h4 className="font-bold text-sm text-gray-900 mb-1">{selectedTerm.theme}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{selectedTerm.description}</p>
              </div>

              {/* 食疗 */}
              <div className="bg-amber-50 rounded-2xl p-4">
                <h4 className="font-bold text-sm text-amber-800 mb-2">食疗推荐</h4>
                <p className="text-xs text-amber-600 mb-2">{selectedTerm.foodColors}</p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTerm.foods.map(f => (
                    <span key={f} className="text-xs bg-white text-amber-800 px-2 py-1 rounded-lg border border-amber-200 font-medium">{f}</span>
                  ))}
                </div>
              </div>

              {/* 作息 + 运动 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-50 rounded-2xl p-4">
                  <h4 className="font-bold text-sm text-indigo-800 mb-2 flex items-center gap-1">
                    <Moon size={12} /> 作息
                  </h4>
                  <p className="text-xs text-indigo-700">{selectedTerm.lifestyle}</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-4">
                  <h4 className="font-bold text-sm text-green-800 mb-2 flex items-center gap-1">
                    <Activity size={12} /> 运动
                  </h4>
                  <p className="text-xs text-green-700">{selectedTerm.exercise}</p>
                </div>
              </div>

              {/* 穴位按摩 */}
              <div
                className="bg-purple-50 rounded-2xl p-4 cursor-pointer hover:bg-purple-100 transition"
                onClick={() => goToAcupoint(selectedTerm)}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-purple-800">穴位按摩</h4>
                  <span className="text-[10px] text-purple-500 flex items-center gap-0.5">
                    查看定位 <ChevronRight size={10} />
                  </span>
                </div>
                <p className="text-sm text-purple-700 font-medium">{selectedTerm.acupoint}</p>
              </div>

              {/* 扩展养生信息（来自 WELLNESS 数据源） */}
              {selectedWellness && (
                <>
                  {/* 三阶段调养建议 */}
                  {(['pre', 'onset', 'post'] as const).map(phase => {
                    const adviceMap = { pre: selectedWellness.preAdvice, onset: selectedWellness.onsetAdvice, post: selectedWellness.postAdvice };
                    const labelMap = { pre: '节气前 · 预备', onset: '节气当令 · 调养', post: '节气后 · 巩固' };
                    const colorMap = { pre: '#c9a94f', onset: '#c26158', post: '#5d8a63' };
                    const advice = adviceMap[phase];
                    return (
                      <div key={phase} className="bg-white rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMap[phase] }} />
                          <h4 className="font-bold text-sm" style={{ color: colorMap[phase] }}>{labelMap[phase]}</h4>
                        </div>
                        <div className="space-y-1.5">
                          {advice.map((a, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                              <span className="text-gray-300 mt-0.5">·</span>
                              {a}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* 推荐精油 */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <h4 className="font-bold text-sm text-gray-900 mb-2">推荐精油</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedWellness.essentialOils.map(oil => (
                        <span key={oil} className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                          {oil}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 经络信息 */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <h4 className="font-bold text-sm text-gray-900 mb-2">经络信息</h4>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">{selectedWellness.meridian}</div>
                        <div className="text-xs text-gray-500 mt-0.5">当令时辰：{selectedWellness.peakTime}</div>
                      </div>
                      <Link
                        href="/healing/acupoint"
                        className="px-3 py-1.5 rounded-full text-xs font-semibold border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                      >
                        查看经络 →
                      </Link>
                    </div>
                  </div>

                  {/* 饮食起居要点 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">饮食要点</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{selectedWellness.dietFocus}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-gray-100">
                      <h4 className="font-bold text-sm text-gray-900 mb-2">起居要点</h4>
                      <p className="text-xs text-gray-600 leading-relaxed">{selectedWellness.routineFocus}</p>
                    </div>
                  </div>

                  {/* 熏香 */}
                  <div className="bg-white rounded-2xl p-4 border border-gray-100">
                    <h4 className="font-bold text-sm text-gray-900 mb-2">宜用熏香</h4>
                    <p className="text-sm text-gray-600">{selectedWellness.incense}</p>
                  </div>

                  {/* 禁忌（WELLNESS版） */}
                  <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                    <h4 className="font-bold text-sm text-red-800 mb-2 flex items-center gap-1">
                      <AlertTriangle size={12} /> 节气禁忌
                    </h4>
                    <p className="text-sm text-red-700">{selectedWellness.contraindication}</p>
                  </div>
                </>
              )}

              {/* 禁忌 */}
              <div className="bg-red-50 rounded-2xl p-4">
                <h4 className="font-bold text-sm text-red-800 mb-2 flex items-center gap-1">
                  <AlertTriangle size={12} /> 禁忌
                </h4>
                <p className="text-xs text-red-700">{selectedTerm.taboo}</p>
              </div>

              {/* 古诗词 */}
              <div className="text-center py-3">
                <p className="text-sm text-gray-400 italic" style={{ fontFamily: 'serif' }}>"{selectedTerm.poem}"</p>
              </div>

              {/* 底部操作按钮 */}
              <div className="flex gap-3 pb-2">
                <button
                  onClick={() => goToAcupoint(selectedTerm)}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-2xl font-bold text-sm shadow-md"
                >
                  穴位定位
                </button>
                <Link
                  href="/healing"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-sm shadow-md text-center"
                >
                  五音疗愈
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === 日历节气详情弹窗 === */}
      {calPanelOpen && calWellness && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setCalPanelOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-[#fafaf9] rounded-t-3xl overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-[#fafaf9]/95 z-10 px-4 pt-3 pb-2 border-b border-gray-100">
              <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-3" />
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white" style={{ backgroundColor: SEASON_COLORS[proximity.current.season] }}>
                  {SEASON_ICONS[proximity.current.season]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{calWellness.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">{calWellness.meridian}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-500">{calWellness.peakTime}</span>
                  </div>
                </div>
                <button onClick={() => setCalPanelOpen(false)} className="ml-auto w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            </div>

            <div className="px-4 py-4 space-y-4">
              {/* 三阶段调养 */}
              {(['pre', 'onset', 'post'] as const).map(phase => {
                const adviceMap = { pre: calWellness.preAdvice, onset: calWellness.onsetAdvice, post: calWellness.postAdvice };
                const labelMap = { pre: '节气前 · 预备', onset: '节气当令 · 调养', post: '节气后 · 巩固' };
                const colorMap = { pre: '#c9a94f', onset: '#c26158', post: '#5d8a63' };
                return (
                  <div key={phase} className="bg-white rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorMap[phase] }} />
                      <h3 className="font-bold text-sm" style={{ color: colorMap[phase] }}>{labelMap[phase]}</h3>
                    </div>
                    <div className="space-y-1.5">
                      {adviceMap[phase].map((a, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <span className="text-gray-300 mt-0.5">·</span>
                          {a}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* 推荐精油 */}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">推荐精油</h3>
                <div className="flex flex-wrap gap-2">
                  {calWellness.essentialOils.map(oil => (
                    <span key={oil} className="px-3 py-1.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                      {oil}
                    </span>
                  ))}
                </div>
              </div>

              {/* 饮食起居 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">饮食要点</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{calWellness.dietFocus}</p>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100">
                  <h3 className="font-bold text-gray-900 mb-2 text-sm">起居要点</h3>
                  <p className="text-xs text-gray-600 leading-relaxed">{calWellness.routineFocus}</p>
                </div>
              </div>

              {/* 熏香 */}
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-2 text-sm">宜用熏香</h3>
                <p className="text-sm text-gray-600">{calWellness.incense}</p>
              </div>

              {/* 禁忌 */}
              <div className="bg-red-50 border border-red-100 rounded-xl p-4">
                <h3 className="font-bold text-red-800 mb-2 text-sm flex items-center gap-1">
                  <AlertTriangle size={12} /> 禁忌
                </h3>
                <p className="text-sm text-red-700">{calWellness.contraindication}</p>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 text-xs text-center text-gray-400">
                节气养生日历仅供参考，具体调理请结合个人体质
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />

      <style jsx>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
