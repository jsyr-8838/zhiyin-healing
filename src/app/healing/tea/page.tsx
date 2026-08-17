'use client';

import { useState, useMemo } from 'react';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import HealingCanvas, { HEALING_PRESET_WUYIN } from '@/components/healing/HealingCanvas';
import { TEA_DATA, getTeaByWuyin, type TeaInfo } from '@/lib/tcm-lifestyle-data';
import { Coffee, ChevronRight, Droplets, Music, Search, Sparkles } from 'lucide-react';

/* ================================================================
 *  茶道 · 宋韵光色系版
 *  8种茶 × 五行五音关联 × 冲泡参数 × 功效禁忌
 *  可与五音疗愈联动：品茶听乐
 * ================================================================ */

const ELEMENT_COLORS: Record<string, string> = {
  '木': '#4ADE80', '火': '#FB7185', '土': '#FBBF24', '金': '#60A5FA', '水': '#818CF8',
  '木→火': '#F59E0B', '木→水': '#6366F1', '木→金': '#22D3EE',
  '土→水': '#3B82F6', '土→水→木': '#10B981', '火→金': '#EC4899',
  '土→肺': '#FBBF24',
};

const WUYIN_MAP: Record<string, { name: string; desc: string }> = {
  '角': { name: '角音', desc: '木之音·养肝' },
  '徵': { name: '徵音', desc: '火之音·养心' },
  '宫': { name: '宫音', desc: '土之音·养脾' },
  '商': { name: '商音', desc: '金之音·养肺' },
  '羽': { name: '羽音', desc: '水之音·养肾' },
  '角/徵': { name: '角徵', desc: '木火·养肝心' },
  '宫/商': { name: '宫商', desc: '土金·养脾肺' },
};

export default function TeaPage() {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [wuyinFilter, setWuyinFilter] = useState<string | null>(null);

  const filteredTeas = useMemo(() => {
    let list = TEA_DATA;
    if (wuyinFilter) list = getTeaByWuyin(wuyinFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(t =>
        t.name.includes(q) || t.category.includes(q) || t.element.includes(q) ||
        t.organ.includes(q) || t.taste.includes(q) || t.season.includes(q) ||
        t.effects.some(e => e.includes(q)) || t.contraindications.some(c => c.includes(q))
      );
    }
    return list;
  }, [searchQuery, wuyinFilter]);

  const selectedTea = selectedIndex !== null ? TEA_DATA[selectedIndex] : null;

  return (
    <PageContainer theme="healing">
      <HealingHeader title="茶道养生" subtitle="五行茶韵 · 品茶听乐 · 养生修身" />

      <div className="absolute inset-0 z-0">
        <HealingCanvas energy={0.12} config={HEALING_PRESET_WUYIN} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        {/* 五音筛选 */}
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button onClick={() => setWuyinFilter(null)}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 transition"
              style={{
                background: !wuyinFilter ? '#B8860B15' : 'rgba(253,248,240,0.9)',
                color: !wuyinFilter ? '#B8860B' : '#8B7355',
                border: `1px solid ${!wuyinFilter ? '#B8860B30' : '#EDE4D3'}`,
              }}>
              全部
            </button>
            {['角', '徵', '宫', '商', '羽'].map(wy => {
              const info = WUYIN_MAP[wy];
              const active = wuyinFilter === wy;
              return (
                <button key={wy} onClick={() => setWuyinFilter(active ? null : wy)}
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold flex-shrink-0 transition"
                  style={{
                    background: active ? ELEMENT_COLORS[wy === '角' ? '木' : wy === '徵' ? '火' : wy === '宫' ? '土' : wy === '商' ? '金' : '水'] + '15' : 'rgba(253,248,240,0.9)',
                    color: active ? ELEMENT_COLORS[wy === '角' ? '木' : wy === '徵' ? '火' : wy === '宫' ? '土' : wy === '商' ? '金' : '水'] : '#8B7355',
                    border: `1px solid ${active ? ELEMENT_COLORS[wy === '角' ? '木' : wy === '徵' ? '火' : wy === '宫' ? '土' : wy === '商' ? '金' : '水'] + '30' : '#EDE4D3'}`,
                  }}>
                  {info.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 搜索 */}
        <div className="px-4 pb-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#B8A080' }} />
            <input
              type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="搜索茶名、类别、功效..."
              className="w-full pl-8 pr-3 py-2 rounded-lg text-sm"
              style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3', color: '#5C1A00' }}
            />
          </div>
        </div>

        {selectedTea ? (
          <div className="flex-1 px-4 pb-4 overflow-y-auto">
            <button onClick={() => setSelectedIndex(null)} className="text-xs mb-3 flex items-center gap-1" style={{ color: '#B8860B' }}>
              <ChevronRight size={12} className="rotate-180" />返回茶品列表
            </button>
            <TeaDetail tea={selectedTea} />
          </div>
        ) : (
          <div className="flex-1 px-4 pb-4 overflow-y-auto space-y-2">
            {filteredTeas.map((tea, i) => {
              const eColor = ELEMENT_COLORS[tea.element] || '#B8860B';
              const realIndex = TEA_DATA.indexOf(tea);
              return (
                <button key={tea.name} onClick={() => setSelectedIndex(realIndex)}
                  className="w-full text-left rounded-xl p-3 border transition active:scale-[0.98]"
                  style={{ background: 'rgba(253,248,240,0.9)', borderColor: '#EDE4D3' }}>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm" style={{ color: '#5C1A00' }}>{tea.name}</div>
                      <div className="text-xs mt-0.5" style={{ color: '#8B7355' }}>{tea.category} · {tea.taste.slice(0, 10)}...</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: eColor + '15', color: eColor, border: `1px solid ${eColor}30` }}>
                        {tea.element}行
                      </span>
                      {tea.wuyin && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: '#B8860B15', color: '#B8860B', border: '1px solid #B8860B30' }}>
                          {tea.wuyin}音
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {tea.effects.slice(0, 3).map(e => (
                      <span key={e} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: eColor + '08', color: '#5C3015' }}>{e}</span>
                    ))}
                  </div>
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

function TeaDetail({ tea }: { tea: TeaInfo }) {
  const eColor = ELEMENT_COLORS[tea.element] || '#B8860B';
  const wuyinInfo = tea.wuyin ? WUYIN_MAP[tea.wuyin] : null;

  return (
    <div className="space-y-3">
      {/* 标题 */}
      <div className="text-center">
        <div className="font-black font-serif" style={{ fontSize: 28, color: '#5C1A00' }}>{tea.name}</div>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: eColor + '15', color: eColor }}>{tea.element}行·{tea.organ}</span>
          {wuyinInfo && (
            <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: '#B8860B15', color: '#B8860B' }}>{tea.wuyin}音</span>
          )}
          <span className="text-xs" style={{ color: '#8B7355' }}>{tea.category}</span>
        </div>
        <p className="text-xs mt-1 italic" style={{ color: '#8B7355' }}>{tea.taste}</p>
      </div>

      {/* 五音联动推荐 */}
      {wuyinInfo && (
        <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
          <div className="flex items-center gap-1 mb-1"><Music size={12} style={{ color: '#B8860B' }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>五音联动</span></div>
          <p className="text-xs" style={{ color: '#5C3015' }}>
            品{tea.name}时，可聆听<span className="font-bold" style={{ color: eColor }}>{tea.wuyin}音</span>（{wuyinInfo.desc}），茶乐相和，养{tea.organ}效果更佳。
          </p>
          <a href={`/healing/wuyin`} className="text-[10px] mt-1 inline-flex items-center gap-0.5" style={{ color: '#B8860B' }}>
            前往五音疗愈 <ChevronRight size={10} />
          </a>
        </div>
      )}

      {/* 冲泡参数 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="flex items-center gap-1 mb-2"><Droplets size={12} style={{ color: eColor }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>冲泡参数</span></div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div><span style={{ color: '#8B7355' }}>水温：</span><span className="font-bold" style={{ color: '#5C3015' }}>{tea.brewing.waterTemp}</span></div>
          <div><span style={{ color: '#8B7355' }}>茶水比：</span><span className="font-bold" style={{ color: '#5C3015' }}>{tea.brewing.ratio}</span></div>
          <div><span style={{ color: '#8B7355' }}>首泡：</span><span className="font-bold" style={{ color: '#5C3015' }}>{tea.brewing.firstInfusion}</span></div>
          <div><span style={{ color: '#8B7355' }}>续泡：</span><span className="font-bold" style={{ color: '#5C3015' }}>{tea.brewing.subsequentInfusion}</span></div>
          <div><span style={{ color: '#8B7355' }}>可冲泡：</span><span className="font-bold" style={{ color: '#5C3015' }}>{tea.brewing.totalInfusions}泡</span></div>
          <div><span style={{ color: '#8B7355' }}>时节：</span><span className="font-bold" style={{ color: '#5C3015' }}>{tea.season}</span></div>
        </div>
      </div>

      {/* 冲泡步骤 */}
      <div className="rounded-xl p-3" style={{ background: 'rgba(253,248,240,0.9)', border: '1px solid #EDE4D3' }}>
        <div className="flex items-center gap-1 mb-2"><Sparkles size={12} style={{ color: eColor }} /><span className="text-xs font-bold" style={{ color: '#5C1A00' }}>冲泡步骤</span></div>
        <div className="space-y-1.5">
          {tea.steps.map((step, i) => (
            <div key={i} className="flex gap-2 text-xs">
              <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: eColor + '20', color: eColor }}>{i + 1}</span>
              <span style={{ color: '#5C3015' }}>{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 功效 & 禁忌 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3" style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>
          <div className="text-xs font-bold mb-1" style={{ color: '#4ADE80' }}>功效</div>
          {tea.effects.map(e => (
            <div key={e} className="text-[10px]" style={{ color: '#166534' }}>· {e}</div>
          ))}
        </div>
        <div className="rounded-xl p-3" style={{ background: 'rgba(251,113,133,0.06)', border: '1px solid rgba(251,113,133,0.2)' }}>
          <div className="text-xs font-bold mb-1" style={{ color: '#FB7185' }}>禁忌</div>
          {tea.contraindications.map(c => (
            <div key={c} className="text-[10px]" style={{ color: '#9F1239' }}>· {c}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
