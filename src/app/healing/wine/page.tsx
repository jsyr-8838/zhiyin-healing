'use client';

import { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import HealingCanvas, { HEALING_PRESET_BOWL } from '@/components/healing/HealingCanvas';
import { WINE_DATA, type WineInfo } from '@/lib/tcm-lifestyle-data';
import { Wine, ChevronRight, Search, Heart, AlertTriangle, Flame, Droplets } from 'lucide-react';

/* ================================================================
 *  酒道品鉴 · 宋韵光色系版
 *  8种酒 × 五行脏腑 × 品鉴搭配 × 健康提示
 * ================================================================ */

const ELEMENT_COLORS: Record<string, string> = {
  '土': '#FBBF24', '土→水': '#3B82F6', '火': '#FB7185', '水→木': '#10B981',
  '木': '#4ADE80', '火→金': '#EC4899', '木→金': '#22D3EE', '木→水': '#6366F1',
  '金': '#60A5FA',
};

const CATEGORY_ICONS: Record<string, string> = {
  '黄酒': '🍶', '米酒': '🍚', '果酒': '🍇', '药酒': '🌿',
  '白酒': '🥃', '花酒': '🌸', '配制酒': '⚗️',
};

export default function WinePage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categories = useMemo(() => [...new Set(WINE_DATA.map(w => w.category))], []);

  const filteredWines = useMemo(() => {
    let list = WINE_DATA;
    if (categoryFilter) list = list.filter(w => w.category === categoryFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(w =>
        w.name.includes(q) || w.category.includes(q) || w.element.includes(q) ||
        w.organ.includes(q) || w.appearance.includes(q) || w.aroma.includes(q) ||
        w.taste.includes(q) || w.healthNote.includes(q) || w.drinkingMethod.includes(q) ||
        w.pairings.some(p => p.includes(q))
      );
    }
    return list;
  }, [searchQuery, categoryFilter]);

  const selectedWine = selectedIndex !== null ? WINE_DATA[selectedIndex] : null;

  return (
    <PageContainer theme="healing">
      <HealingHeader title="酒道品鉴" subtitle="温经通络 · 品鉴养生 · 五行和合" />

      <div className="absolute inset-0 z-0">
        <HealingCanvas energy={0.12} config={HEALING_PRESET_BOWL} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* 分类筛选 */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button onClick={() => setCategoryFilter(null)}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 transition"
              style={{
                background: !categoryFilter ? '#B8860B15' : 'rgba(253,248,240,0.9)',
                color: !categoryFilter ? '#B8860B' : '#8B7355',
                border: `1px solid ${!categoryFilter ? '#B8860B30' : '#EDE4D3'}`,
              }}>
              全部
            </button>
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 transition"
                style={{
                  background: categoryFilter === cat ? '#B8860B15' : 'rgba(253,248,240,0.9)',
                  color: categoryFilter === cat ? '#B8860B' : '#8B7355',
                  border: `1px solid ${categoryFilter === cat ? '#B8860B30' : '#EDE4D3'}`,
                }}>
                {CATEGORY_ICONS[cat] || ''} {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 搜索 */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#B8A080' }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索酒名、搭配、功效..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3', color: '#5C1A00' }} />
          </div>
        </div>

        {selectedWine ? (
          <div className="flex-1 px-4 pb-4 overflow-y-auto">
            <button onClick={() => setSelectedIndex(null)} className="text-xs mb-3 flex items-center gap-1" style={{ color: '#B8860B' }}>
              <ChevronRight size={12} className="rotate-180" />返回酒品列表
            </button>
            <WineDetail wine={selectedWine} />
          </div>
        ) : (
          <div className="flex-1 px-4 pb-4 overflow-y-auto space-y-2">
            {filteredWines.map((wine) => {
              const realIndex = WINE_DATA.indexOf(wine);
              const eColor = ELEMENT_COLORS[wine.element] || '#B8860B';
              return (
                <button key={wine.name} onClick={() => setSelectedIndex(realIndex)}
                  className="w-full text-left rounded-xl p-3 border transition active:scale-[0.98]"
                  style={{ background: 'rgba(253,248,240,0.9)', borderColor: '#EDE4D3' }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CATEGORY_ICONS[wine.category] || '🍷'}</span>
                      <div>
                        <div className="font-bold text-sm" style={{ color: '#5C1A00' }}>{wine.name}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#8B7355' }}>{wine.category} · {wine.servingTemp}</div>
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: eColor + '15', color: eColor, border: `1px solid ${eColor}30` }}>
                      {wine.element}行·{wine.organ}
                    </span>
                  </div>
                  <p className="text-[10px] mt-1.5 line-clamp-1" style={{ color: '#8B7355' }}>{wine.healthNote}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

function WineDetail({ wine }: { wine: WineInfo }) {
  const eColor = ELEMENT_COLORS[wine.element] || '#B8860B';

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="text-center">
        <div className="text-3xl mb-1">{CATEGORY_ICONS[wine.category] || '🍷'}</div>
        <div className="font-black font-serif" style={{ fontSize: 24, color: '#5C1A00' }}>{wine.name}</div>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: eColor + '15', color: eColor }}>{wine.element}行·{wine.organ}</span>
          <span className="text-xs" style={{ color: '#8B7355' }}>{wine.category}</span>
        </div>
      </div>

      {/* 外观·香气·口感 */}
      <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="flex items-start gap-2">
          <Flame size={12} className="mt-0.5 flex-shrink-0" style={{ color: '#FBBF24' }} />
          <div><span className="text-[10px] font-bold" style={{ color: '#8B7355' }}>外观</span><p className="text-xs" style={{ color: '#5C3015' }}>{wine.appearance}</p></div>
        </div>
        <div className="flex items-start gap-2">
          <Droplets size={12} className="mt-0.5 flex-shrink-0" style={{ color: eColor }} />
          <div><span className="text-[10px] font-bold" style={{ color: '#8B7355' }}>香气</span><p className="text-xs" style={{ color: '#5C3015' }}>{wine.aroma}</p></div>
        </div>
        <div className="flex items-start gap-2">
          <Heart size={12} className="mt-0.5 flex-shrink-0" style={{ color: '#FB7185' }} />
          <div><span className="text-[10px] font-bold" style={{ color: '#8B7355' }}>口感</span><p className="text-xs" style={{ color: '#5C3015' }}>{wine.taste}</p></div>
        </div>
      </div>

      {/* 饮用方式 */}
      <div className="rounded-xl p-3" style={{ background: eColor + '08', border: `1px solid ${eColor}25` }}>
        <div className="text-xs font-bold mb-1" style={{ color: eColor }}>饮用方式</div>
        <p className="text-xs" style={{ color: '#5C3015' }}>{wine.drinkingMethod}</p>
        <div className="mt-1 text-[10px]" style={{ color: '#8B7355' }}>适饮温度：{wine.servingTemp}</div>
      </div>

      {/* 搭配推荐 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="text-xs font-bold mb-1.5" style={{ color: '#5C1A00' }}>搭配推荐</div>
        <div className="flex flex-wrap gap-1.5">
          {wine.pairings.map(p => (
            <span key={p} className="px-2 py-0.5 rounded-full text-xs" style={{ background: eColor + '10', color: '#5C3015', border: `1px solid ${eColor}25` }}>{p}</span>
          ))}
        </div>
      </div>

      {/* 健康提示 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
        <div className="flex items-center gap-1 mb-1"><Heart size={12} style={{ color: '#4ADE80' }} /><span className="text-xs font-bold" style={{ color: '#166534' }}>养生功效</span></div>
        <p className="text-xs" style={{ color: '#166534' }}>{wine.healthNote}</p>
      </div>

      {/* 禁忌 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.2)' }}>
        <div className="flex items-center gap-1 mb-1"><AlertTriangle size={12} style={{ color: '#FB7185' }} /><span className="text-xs font-bold" style={{ color: '#9F1239' }}>饮用禁忌</span></div>
        <p className="text-xs" style={{ color: '#9F1239' }}>{wine.taboo}</p>
      </div>

      {/* 温馨提示 */}
      <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(184,134,11,0.06)', border: '1px solid rgba(184,134,11,0.15)' }}>
        <p className="text-[10px]" style={{ color: '#8B7355' }}>小酌怡情，大饮伤身。未成年人禁止饮酒，酒后请勿驾车。</p>
      </div>
    </div>
  );
}
