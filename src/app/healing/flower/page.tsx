'use client';

import { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import HealingCanvas, { HEALING_PRESET_WUYIN } from '@/components/healing/HealingCanvas';
import { FLOWER_DATA, TEA_DATA, type FlowerInfo } from '@/lib/tcm-lifestyle-data';
import { Flower2, ChevronRight, Search, Droplets, Leaf, Heart, Gift } from 'lucide-react';

/* ================================================================
 *  花语 · 宋韵光色系版
 *  18种花 × 五行属性 × 花语寓意 × 搭配茶饮 × 赠送指南
 * ============================================================ */

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#4ADE80', '火': '#FB7185', '土': '#FBBF24', '金': '#60A5FA', '水': '#818CF8',
  '木→火': '#F59E0B', '木→水': '#6366F1', '木→金': '#22D3EE',
  '火→金': '#EC4899',
};

// 花的简约色（用渐变代替图片）
const FLOWER_COLORS: Record<string, { bg: string; text: string }> = {
  '梅花': { bg: '#FDF2F8', text: '#DB2777' },
  '兰花': { bg: '#F0FDF4', text: '#16A34A' },
  '菊花': { bg: '#FFFBEB', text: '#CA8A04' },
  '荷花': { bg: '#FDF2F8', text: '#EC4899' },
  '牡丹': { bg: '#FEF2F2', text: '#DC2626' },
  '桂花': { bg: '#FFFBEB', text: '#B45309' },
  '玫瑰': { bg: '#FFF1F2', text: '#E11D48' },
  '茉莉': { bg: '#F5F3FF', text: '#7C3AED' },
  '百合': { bg: '#FEFCE8', text: '#A16207' },
  '水仙': { bg: '#F0FDFA', text: '#0D9488' },
  '茶花': { bg: '#FDF2F8', text: '#BE185D' },
  '玉兰': { bg: '#FFFBEB', text: '#92400E' },
  '桃花': { bg: '#FFF1F2', text: '#F43F5E' },
  '芍药': { bg: '#FDF2F8', text: '#C026D3' },
  '月季': { bg: '#FEF2F2', text: '#DC2626' },
  '紫藤': { bg: '#F5F3FF', text: '#7C3AED' },
  '薰衣草': { bg: '#FAF5FF', text: '#9333EA' },
  '向日葵': { bg: '#FFFBEB', text: '#CA8A04' },
};

const SEASONS = ['春季', '夏季', '秋季', '冬季', '四季', '春夏', '夏秋', '冬春', '冬春', '暮春', '早春', '春夏'];

export default function FlowerPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [seasonFilter, setSeasonFilter] = useState<string | null>(null);

  const filteredFlowers = useMemo(() => {
    let list = FLOWER_DATA;
    if (seasonFilter) list = list.filter(f => f.season.includes(seasonFilter));
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(f =>
        f.name.includes(q) || f.language.includes(q) || f.element.includes(q) ||
        f.meaning.includes(q) || f.season.includes(q) || f.careTips.includes(q) ||
        f.suitableFor.some(s => s.includes(q)) || f.pairingTea.includes(q)
      );
    }
    return list;
  }, [searchQuery, seasonFilter]);

  const selectedFlower = selectedIndex !== null ? FLOWER_DATA[selectedIndex] : null;

  return (
    <PageContainer theme="healing">
      <HealingHeader title="花语传情" subtitle="花有意·茶有香·五行情韵" />

      <div className="absolute inset-0 z-0">
        <HealingCanvas energy={0.10} config={HEALING_PRESET_WUYIN} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* 季节筛选 */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button onClick={() => setSeasonFilter(null)}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 transition"
              style={{
                background: !seasonFilter ? '#B8860B15' : 'rgba(253,248,240,0.9)',
                color: !seasonFilter ? '#B8860B' : '#8B7355',
                border: `1px solid ${!seasonFilter ? '#B8860B30' : '#EDE4D3'}`,
              }}>
              全部
            </button>
            {['春', '夏', '秋', '冬'].map(s => (
              <button key={s} onClick={() => setSeasonFilter(seasonFilter === s ? null : s)}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 transition"
                style={{
                  background: seasonFilter === s ? '#4ADE8015' : 'rgba(253,248,240,0.9)',
                  color: seasonFilter === s ? '#16A34A' : '#8B7355',
                  border: `1px solid ${seasonFilter === s ? '#4ADE8030' : '#EDE4D3'}`,
                }}>
                {s}季
              </button>
            ))}
          </div>
        </div>

        {/* 搜索 */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#B8A080' }} />
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索花名、花语、赠送场合..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3', color: '#5C1A00' }} />
          </div>
        </div>

        {selectedFlower ? (
          <div className="flex-1 px-4 pb-4 overflow-y-auto">
            <button onClick={() => setSelectedIndex(null)} className="text-xs mb-3 flex items-center gap-1" style={{ color: '#B8860B' }}>
              <ChevronRight size={12} className="rotate-180" />返回花语列表
            </button>
            <FlowerDetail flower={selectedFlower} />
          </div>
        ) : (
          <div className="flex-1 px-4 pb-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {filteredFlowers.map((flower) => {
                const realIndex = FLOWER_DATA.indexOf(flower);
                const fc = FLOWER_COLORS[flower.name] || { bg: '#FFF7ED', text: '#B8860B' };
                return (
                  <button key={flower.name} onClick={() => setSelectedIndex(realIndex)}
                    className="text-left rounded-xl p-3 border transition active:scale-95"
                    style={{ background: fc.bg + 'E6', borderColor: fc.text + '20' }}>
                    <div className="flex items-center gap-1.5 mb-1">
                      <Flower2 size={14} style={{ color: fc.text }} />
                      <span className="font-bold text-sm font-serif" style={{ color: fc.text }}>{flower.name}</span>
                    </div>
                    <p className="text-[10px] line-clamp-2" style={{ color: '#5C3015' }}>{flower.language}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <span className="text-[8px] px-1 py-0.5 rounded" style={{ background: (ELEMENT_COLORS[flower.element] || '#B8860B') + '15', color: ELEMENT_COLORS[flower.element] || '#8B7355' }}>
                        {flower.element}行
                      </span>
                      <span className="text-[8px]" style={{ color: '#B8A080' }}>{flower.season}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

function FlowerDetail({ flower }: { flower: FlowerInfo }) {
  const fc = FLOWER_COLORS[flower.name] || { bg: '#FFF7ED', text: '#B8860B' };
  const eColor = ELEMENT_COLORS[flower.element] || '#B8860B';

  // 查找配对茶
  const pairingTeaInfo = TEA_DATA.find(t => t.name === flower.pairingTea || flower.pairingTea.includes(t.name));

  return (
    <div className="space-y-3">
      {/* 标题区：花的色块背景 */}
      <div className="rounded-2xl p-5 text-center" style={{ background: fc.bg }}>
        <Flower2 size={36} className="mx-auto mb-2" style={{ color: fc.text }} />
        <div className="font-black font-serif text-2xl" style={{ color: fc.text }}>{flower.name}</div>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: eColor + '15', color: eColor }}>{flower.element}行</span>
          <span className="text-xs" style={{ color: '#8B7355' }}>{flower.season}</span>
        </div>
      </div>

      {/* 花语 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="flex items-center gap-1 mb-1"><Heart size={12} style={{ color: fc.text }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>花语</span></div>
        <p className="text-sm font-serif font-bold" style={{ color: fc.text }}>{flower.language}</p>
        <p className="text-xs mt-1" style={{ color: '#5C3015' }}>{flower.meaning}</p>
      </div>

      {/* 适合赠送 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="flex items-center gap-1 mb-1.5"><Gift size={12} style={{ color: '#B8860B' }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>适合赠予</span></div>
        <div className="flex flex-wrap gap-1.5">
          {flower.suitableFor.map(s => (
            <span key={s} className="px-2 py-0.5 rounded-full text-xs" style={{ background: fc.text + '10', color: '#5C3015', border: `1px solid ${fc.text}25` }}>{s}</span>
          ))}
        </div>
      </div>

      {/* 养护建议 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="flex items-center gap-1 mb-1"><Leaf size={12} style={{ color: '#4ADE80' }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>养护建议</span></div>
        <p className="text-xs" style={{ color: '#5C3015' }}>{flower.careTips}</p>
      </div>

      {/* 搭配茶饮 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="flex items-center gap-1 mb-1"><Droplets size={12} style={{ color: eColor }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>搭配茶饮</span></div>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-bold font-serif" style={{ color: eColor }}>{flower.pairingTea}</span>
            {pairingTeaInfo && (
              <p className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>{pairingTeaInfo.category} · {pairingTeaInfo.element}行·{pairingTeaInfo.organ}</p>
            )}
          </div>
          <a href="/healing/tea" className="text-[10px] flex items-center gap-0.5" style={{ color: '#B8860B' }}>
            前往茶道 <ChevronRight size={10} />
          </a>
        </div>
      </div>
    </div>
  );
}
