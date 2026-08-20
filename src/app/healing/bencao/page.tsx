'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { getHerbs, searchHerbs, getHerbStats, getHerbsByCategory, type Herb } from '@/lib/tcm-herb-data';

// 药性配色
const NATURE_COLORS: Record<string, string> = {
  '寒': '#3d7a75', '凉': '#5ba09a', '平': '#8b7355', '温': '#c26158', '热': '#c26158', '微寒': '#5ba09a', '微温': '#c9a94f',
};

export default function BenCaoClient() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const herbs = useMemo(() => getHerbs(), []);
  const stats = useMemo(() => getHerbStats(), []);
  const categoryMap = useMemo(() => getHerbsByCategory(), []);

  // 分类列表
  const categories = useMemo(() => {
    return ['全部', ...Array.from(categoryMap.keys())];
  }, [categoryMap]);

  // 筛选
  const filtered = useMemo(() => {
    let list = herbs;
    if (selectedCategory !== '全部') {
      list = list.filter(h => h.category === selectedCategory);
    }
    if (search.trim()) {
      const results = searchHerbs(search);
      const ids = new Set(results.map(r => r.id));
      list = list.filter(h => ids.has(h.id));
    }
    return list;
  }, [herbs, selectedCategory, search]);

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
                本草药典
              </h1>
              <p className="text-xs text-[#8b7355] mt-0.5">
                {stats.total}味中药 · {stats.categories}个分类 · 倪师注释
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
            placeholder="搜索药名、功效、主治、归经、倪师注释..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/80 border border-[#e8ddd0] rounded-xl text-sm text-[#1a1a1a] placeholder:text-[#bba89a] focus:outline-none focus:ring-2 focus:ring-[#c9a94f]/30"
          />
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="px-4 pb-2">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map(c => (
              <button
                key={c}
                onClick={() => setSelectedCategory(c)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === c
                    ? 'bg-[#5d8a63] text-white shadow-sm'
                    : 'bg-white/60 text-[#8b7355] hover:bg-white/90 border border-[#e8ddd0]/60'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 药材列表 */}
      <div className="max-w-4xl mx-auto px-4 pb-8 space-y-2">
        {filtered.map(h => {
          const isExpanded = expandedId === h.id;
          const natureColor = NATURE_COLORS[h.nature] || '#8b7355';
          return (
            <div
              key={h.id}
              className="bg-white/90 rounded-2xl border border-[#e8ddd0]/60 overflow-hidden shadow-sm"
            >
              {/* 头部 */}
              <button
                onClick={() => toggleExpand(h.id)}
                className="w-full p-4 text-left flex items-start gap-3"
              >
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: natureColor }}>
                  {h.nature?.charAt(0) || '药'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[#1a1a1a]" style={{ fontWeight: 700 }}>{h.name}</span>
                    <span className="text-[10px] text-[#aaa]">{h.pinyin}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f5efe6] text-[#8b7355]">{h.category}</span>
                    {h.niComment && (
                      <span className="text-[9px] px-1 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">倪</span>
                    )}
                  </div>
                  <p className="text-xs text-[#8b7355] mt-0.5">{h.effects}</p>
                </div>
                <span className="text-[#bba89a] text-sm mt-1 shrink-0">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {/* 展开详情 */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-[#e8ddd0]/40 pt-3">
                  {/* 性味归经 */}
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-0.5 rounded-full text-xs border border-[#e8ddd0]/60 text-[#555]">
                      性：{h.nature}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs border border-[#e8ddd0]/60 text-[#555]">
                      味：{h.flavor}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs border border-[#e8ddd0]/60 text-[#555]">
                      归经：{h.meridianTropism}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs border border-[#e8ddd0]/60 text-[#555]">
                      用量：{h.dosage}
                    </span>
                  </div>

                  {/* 功效 */}
                  {h.effects && (
                    <div>
                      <p className="text-xs text-[#8b7355] font-medium mb-1">功效</p>
                      <div className="flex flex-wrap gap-1.5">
                        {h.effects.split(/[，,、]/).filter(Boolean).map((e, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-100">
                            {e.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 主治 */}
                  {h.indications && (
                    <div>
                      <p className="text-xs text-[#8b7355] font-medium mb-1">主治</p>
                      <p className="text-sm text-[#555] leading-relaxed">{h.indications}</p>
                    </div>
                  )}

                  {/* 禁忌 */}
                  {h.contraindications && (
                    <div className="p-2 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-xs text-red-600 font-medium mb-1">禁忌</p>
                      <p className="text-sm text-red-700/80 leading-relaxed">{h.contraindications}</p>
                    </div>
                  )}

                  {/* 倪师注释 */}
                  {h.niComment && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-700 font-medium mb-1 flex items-center gap-1">
                        <span className="inline-block w-4 h-4 rounded bg-amber-200 text-amber-800 text-center text-[8px] leading-4 font-bold">倪</span>
                        倪师注释
                      </p>
                      <p className="text-sm text-amber-800/90 leading-relaxed">{h.niComment}</p>
                    </div>
                  )}

                  {/* 经典方剂 */}
                  {h.classicFormulas.length > 0 && (
                    <div>
                      <p className="text-xs text-[#8b7355] font-medium mb-1">含此药的经方</p>
                      <div className="flex flex-wrap gap-1.5">
                        {h.classicFormulas.map(fid => (
                          <Link
                            key={fid}
                            href="/healing/jingfang"
                            className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 transition-colors"
                          >
                            {fid.replace('FORMULA_', 'F')}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 关联穴位 */}
                  {h.relatedAcupoints.length > 0 && (
                    <div>
                      <p className="text-xs text-[#8b7355] font-medium mb-1">关联穴位</p>
                      <div className="flex flex-wrap gap-1.5">
                        {h.relatedAcupoints.map(code => (
                          <Link
                            key={code}
                            href={`/meridian?focus=${code.replace('ACU_', '')}`}
                            className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-100 hover:bg-purple-100 transition-colors"
                          >
                            {code.replace('ACU_', '')}
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
            <p className="text-sm">未找到匹配的中药</p>
          </div>
        )}
      </div>
    </div>
  );
}
