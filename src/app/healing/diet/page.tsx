'use client';

import { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import HealingCanvas, { HEALING_PRESET_WUYIN } from '@/components/healing/HealingCanvas';
import { SOLAR_TERM_DIETS, getCurrentSolarTerm, type SolarTermDiet } from '@/lib/tcm-lifestyle-data';
import { Leaf, Search, ChevronRight, Flame, Snowflake, Droplets, Wind, Sun } from 'lucide-react';

/* ================================================================
 *  二十四节气饮食 · 宋韵光色系版
 *  节气养生 + 宜忌食材 + 推荐汤品茶饮 + 五行脏腑关联
 * ================================================================ */

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#4ADE80', '火': '#FB7185', '土': '#FBBF24', '金': '#60A5FA', '水': '#818CF8',
  '木→火': '#F59E0B', '木→水': '#6366F1', '木→金': '#22D3EE',
  '火→土': '#F97316', '金→水': '#3B82F6', '水→木': '#10B981',
  '土→木': '#84CC16', '火→金': '#EC4899',
};

const SEASON_ICONS: Record<string, typeof Leaf> = {
  '春': Leaf, '夏': Sun, '秋': Wind, '冬': Snowflake,
};

function getSeason(termName: string): string {
  const spring = ['立春','雨水','惊蛰','春分','清明','谷雨'];
  const summer = ['立夏','小满','芒种','夏至','小暑','大暑'];
  const autumn = ['立秋','处暑','白露','秋分','寒露','霜降'];
  if (spring.includes(termName)) return '春';
  if (summer.includes(termName)) return '夏';
  if (autumn.includes(termName)) return '秋';
  return '冬';
}

export default function DietPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentTerm = useMemo(() => getCurrentSolarTerm(), []);
  const currentIndex = useMemo(() =>
    SOLAR_TERM_DIETS.findIndex(d => d.name === currentTerm.name), [currentTerm]
  );

  const filteredDiets = useMemo(() => {
    if (!searchQuery.trim()) return SOLAR_TERM_DIETS;
    const q = searchQuery.trim().toLowerCase();
    return SOLAR_TERM_DIETS.filter(d =>
      d.name.includes(q) || d.principle.includes(q) || d.element.includes(q) ||
      d.organ.includes(q) || d.recommended.some(r => r.includes(q)) ||
      d.soup.includes(q) || d.tea.includes(q) || d.description.includes(q)
    );
  }, [searchQuery]);

  const selectedDiet = selectedIndex !== null ? SOLAR_TERM_DIETS[selectedIndex] : null;

  return (
    <PageContainer theme="healing">
      <HealingHeader title="节气饮食" subtitle="顺天时而食 · 二十四节气养生" />

      <div className="absolute inset-0 z-0">
        <HealingCanvas energy={0.15} config={HEALING_PRESET_WUYIN} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* 当前节气提示 */}
        <div className="px-4 pt-3 pb-2">
          <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.85)', border: '1px solid #EDE4D3' }}>
            <div className="flex items-center gap-2 mb-1">
              {(() => { const Icon = SEASON_ICONS[getSeason(currentTerm.name)] || Leaf; return <Icon size={16} style={{ color: ELEMENT_COLORS[currentTerm.element] || '#B8860B' }} />; })()}
              <span className="text-xs font-bold" style={{ color: '#5C1A00' }}>当前节气</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-black font-serif" style={{ color: ELEMENT_COLORS[currentTerm.element] || '#5C1A00' }}>{currentTerm.name}</span>
              <span className="text-xs" style={{ color: '#8B7355' }}>{currentTerm.dateRange} · {currentTerm.element}行·{currentTerm.organ}</span>
            </div>
            <p className="text-xs mt-1" style={{ color: '#8B7355' }}>{currentTerm.principle}</p>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#B8A080' }} />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索节气、食材、汤品..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3', color: '#5C1A00' }}
            />
          </div>
        </div>

        {/* 节气列表 / 详情 */}
        {selectedDiet ? (
          <div className="flex-1 px-4 pb-4">
            <button onClick={() => setSelectedIndex(null)} className="text-xs mb-3 flex items-center gap-1" style={{ color: '#B8860B' }}>
              <ChevronRight size={12} className="rotate-180" />返回节气列表
            </button>
            <DietDetail diet={selectedDiet} elementColor={ELEMENT_COLORS[selectedDiet.element] || '#B8860B'} />
          </div>
        ) : (
          <div className="flex-1 px-4 pb-4 overflow-y-auto">
            <div className="grid grid-cols-4 gap-2">
              {filteredDiets.map((diet, i) => {
                const isCurrent = SOLAR_TERM_DIETS.indexOf(diet) === currentIndex;
                const color = ELEMENT_COLORS[diet.element] || '#B8860B';
                return (
                  <button key={diet.name} onClick={() => setSelectedIndex(SOLAR_TERM_DIETS.indexOf(diet))}
                    className="flex flex-col items-center py-2 px-1 rounded-lg border transition active:scale-95"
                    style={{
                      background: isCurrent ? color + '15' : 'rgba(253,248,240,0.9)',
                      borderColor: isCurrent ? color + '40' : '#EDE4D3',
                    }}>
                    <span className="font-black font-serif" style={{ fontSize: 15, color: isCurrent ? color : '#5C1A00' }}>{diet.name}</span>
                    <span className="text-[9px] mt-0.5" style={{ color: '#B8A080' }}>{diet.element}行·{diet.organ}</span>
                    {isCurrent && <span className="text-[8px] mt-0.5 font-bold" style={{ color }}>当前</span>}
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

function DietDetail({ diet, elementColor }: { diet: SolarTermDiet; elementColor: string }) {
  return (
    <div className="space-y-3">
      {/* 标题区 */}
      <div className="text-center">
        <div className="font-black font-serif" style={{ fontSize: 32, color: elementColor }}>{diet.name}</div>
        <div className="text-xs" style={{ color: '#8B7355' }}>{diet.dateRange} · {diet.element}行 · {diet.organ}</div>
      </div>

      {/* 养生原则 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="text-xs font-bold mb-1" style={{ color: '#5C1A00' }}>养生原则</div>
        <p className="text-sm" style={{ color: '#5C3015' }}>{diet.principle}</p>
        <p className="text-xs mt-1" style={{ color: '#8B7355' }}>{diet.description}</p>
      </div>

      {/* 宜食 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#4ADE80' }}>宜食</div>
        <div className="flex flex-wrap gap-1.5">
          {diet.recommended.map(r => (
            <span key={r} className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#4ADE8015', color: '#166534', border: '1px solid #4ADE8030' }}>{r}</span>
          ))}
        </div>
      </div>

      {/* 忌食 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#FB7185' }}>忌食</div>
        <div className="flex flex-wrap gap-1.5">
          {diet.avoid.map(a => (
            <span key={a} className="px-2 py-0.5 rounded-full text-xs" style={{ background: '#FB718515', color: '#9F1239', border: '1px solid #FB718530' }}>{a}</span>
          ))}
        </div>
      </div>

      {/* 推荐汤品 & 茶饮 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
          <div className="flex items-center gap-1 mb-1"><Flame size={12} style={{ color: '#FBBF24' }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>推荐汤品</span></div>
          <p className="text-sm font-bold" style={{ color: '#5C3015' }}>{diet.soup}</p>
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
          <div className="flex items-center gap-1"><Droplets size={12} style={{ color: '#4ADE80' }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>推荐茶饮</span></div>
          <p className="text-sm font-bold" style={{ color: '#5C3015' }}>{diet.tea}</p>
        </div>
      </div>
    </div>
  );
}
