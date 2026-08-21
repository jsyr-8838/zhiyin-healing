'use client';

import { useState, useMemo } from 'react';
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
  type SolarTermHealth,
} from '@/lib/solar-terms-health';
import { Leaf, Moon, Activity, AlertTriangle, ChevronRight, X } from 'lucide-react';

const SEASON_TABS = ['全部', '春', '夏', '秋', '冬'] as const;

export default function SeasonPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id');

  const [activeSeason, setActiveSeason] = useState<string>('全部');
  const [selectedTerm, setSelectedTerm] = useState<SolarTermHealth | null>(
    highlightId ? solarTermsHealth.find(t => t.id === Number(highlightId)) || null : null
  );
  const [viewMode, setViewMode] = useState<'list' | 'wheel'>('wheel');

  const currentTerm = useMemo(() => getCurrentSolarTermHealth(), []);
  const currentTheme = useMemo(() => getSeasonTheme(currentTerm.season), [currentTerm]);

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
    const code = acupointToFocusCode(term.acupoint);
    if (code) {
      router.push(`/healing/acupoint`);
    } else {
      router.push('/healing/acupoint');
    }
  };

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
              穴位3D
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
      </div>

      {/* === 养生详情弹窗 === */}
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

              {/* 穴位按摩 → 3D联动 */}
              <div
                className="bg-purple-50 rounded-2xl p-4 cursor-pointer hover:bg-purple-100 transition"
                onClick={() => goToAcupoint(selectedTerm)}
              >
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-sm text-purple-800">穴位按摩</h4>
                  <span className="text-[10px] text-purple-500 flex items-center gap-0.5">
                    查看3D定位 <ChevronRight size={10} />
                  </span>
                </div>
                <p className="text-sm text-purple-700 font-medium">{selectedTerm.acupoint}</p>
              </div>

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
                  穴位3D定位
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
