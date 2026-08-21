'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getFormulas, searchFormulas, getFormulaStats, type Formula } from '@/lib/tcm-formula-data';

// 来源配色
const SOURCE_COLORS: Record<string, string> = {
  '伤寒论': '#c26158',
  '金匮要略': '#5d8a63',
  '温病条辨': '#3d7a75',
  '太平惠民和剂局方': '#c9a94f',
  '内外伤辨惑论': '#5ba09a',
};

export default function JingFangClient() {
  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState('全部');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const formulas = useMemo(() => getFormulas(), []);
  const stats = useMemo(() => getFormulaStats(), []);

  // 来源列表
  const sources = useMemo(() => {
    const set = new Set(formulas.map(f => f.source));
    return ['全部', ...Array.from(set)];
  }, [formulas]);

  // 筛选
  const filtered = useMemo(() => {
    let list = formulas;
    if (selectedSource !== '全部') {
      list = list.filter(f => f.source === selectedSource);
    }
    if (search.trim()) {
      const results = searchFormulas(search);
      const ids = new Set(results.map(r => r.id));
      list = list.filter(f => ids.has(f.id));
    }
    return list;
  }, [formulas, selectedSource, search]);

  const toggleExpand = useCallback((id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf5ee]">
      {/* 顶部 */}
      <div className="sticky top-0 z-30 bg-[#faf5ee]/95 border-b border-[#e8ddd0]/60 px-4 py-3">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-[#1a1a1a]" style={{ fontWeight: 760 }}>
                经方处方
              </h1>
              <p className="text-xs text-[#8b7355] mt-0.5">
                {stats.total}首方剂 · {stats.sources}部典籍 · 倪师注释
              </p>
            </div>
            <Link
              href="/healing"
              className="px-3 py-1.5 bg-[#f5efe6] text-[#8b7355] text-xs rounded-lg hover:bg-[#e8ddd0]/60 transition-colors"
            >
              返回疗愈
            </Link>
          </div>
        </div>
      </div>

      {/* 搜索 */}
      <div className="px-4 py-2">
        <div className="max-w-4xl mx-auto">
          <input
            type="text"
            placeholder="搜索方剂名称、主治、组成、倪师注释..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/80 border border-[#e8ddd0] rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#bba89a] focus:outline-none focus:ring-2 focus:ring-[#c9a94f]/30"
          />
        </div>
      </div>

      {/* 来源筛选 */}
      <div className="px-4 pb-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {sources.map(s => (
              <button
                key={s}
                onClick={() => setSelectedSource(s)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedSource === s
                    ? 'bg-[#c9a94f] text-white shadow-sm'
                    : 'bg-white/60 text-[#8b7355] hover:bg-white/90 border border-[#e8ddd0]/60'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 方剂列表 */}
      <div className="max-w-4xl mx-auto px-4 pb-8 space-y-2">
        {filtered.map(f => {
          const isExpanded = expandedId === f.id;
          const sourceColor = SOURCE_COLORS[f.source] || '#8b7355';
          return (
            <div
              key={f.id}
              className="bg-white/90 rounded-2xl border border-[#e8ddd0]/60 overflow-hidden shadow-sm"
            >
              {/* 头部 */}
              <button
                onClick={() => toggleExpand(f.id)}
                className="w-full p-4 text-left flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: sourceColor }}>
                  方
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#1a1a1a]" style={{ fontWeight: 700 }}>{f.name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: sourceColor }}>{f.source}</span>
                    {f.niComment && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">倪</span>
                    )}
                  </div>
                  <p className="text-xs text-[#8b7355] mt-0.5">{f.indications}</p>
                  <p className="text-[11px] text-[#aaa] mt-0.5">
                    {f.ingredients.map(i => `${i.name}${i.dosage}${i.unit}`).join('、')}
                  </p>
                </div>
                <span className="text-[#bba89a] text-sm mt-1 shrink-0">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {/* 展开详情 */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#e8ddd0]/40 pt-3">
                  {/* 原文 */}
                  {f.originalText && (
                    <div>
                      <p className="text-xs text-[#8b7355] font-medium mb-1">原文</p>
                      <p className="text-sm text-[#555] leading-relaxed italic">{f.originalText}</p>
                    </div>
                  )}

                  {/* 组成 */}
                  <div>
                    <p className="text-xs text-[#8b7355] font-medium mb-1">组成</p>
                    <div className="flex flex-wrap gap-1.5">
                      {f.ingredients.map((ing, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-[#f5efe6] text-[#555] border border-[#e8ddd0]/60">
                          {ing.name} {ing.dosage}{ing.unit}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 煎服法 */}
                  {f.preparation && (
                    <div>
                      <p className="text-xs text-[#8b7355] font-medium mb-1">煎服法</p>
                      <p className="text-sm text-[#555] leading-relaxed">{f.preparation}</p>
                    </div>
                  )}

                  {/* 辨证 */}
                  {f.syndromeDifferentiation && (
                    <div>
                      <p className="text-xs text-[#8b7355] font-medium mb-1">辨证要点</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.syndromeDifferentiation.split(/[，,、]/).filter(Boolean).map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 禁忌 */}
                  {f.contraindications && (
                    <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs text-red-600 font-medium mb-1">禁忌</p>
                      <p className="text-sm text-red-700/80 leading-relaxed">{f.contraindications}</p>
                    </div>
                  )}

                  {/* 倪师注释 */}
                  {f.niComment && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-700 font-medium mb-1 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 rounded bg-amber-200 text-amber-800 text-center text-[8px] leading-4 font-bold">倪</span>
                        倪师注释
                      </p>
                      <p className="text-sm text-amber-800/90 leading-relaxed">{f.niComment}</p>
                    </div>
                  )}

                  {/* 关联穴位 */}
                  {f.relatedAcupoints.length > 0 && (
                    <div>
                      <p className="text-xs text-[#8b7355] font-medium mb-1">关联穴位</p>
                      <div className="flex flex-wrap gap-1.5">
                        {f.relatedAcupoints.map(code => (
                          <Link
                            key={code}
                            href={`/healing/acupoint`}
                            className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            {code}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[#bba89a]">
            <p className="text-sm">未找到匹配的方剂</p>
          </div>
        )}
      </div>
    </div>
  );
}
