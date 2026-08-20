'use client';
import React, { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { essenceOils, getCurrentSolarTerm, generateHealingPlan, ENERGY_PROPERTY, AROMA_NOTE, COLOR_PSYCHOLOGY, MERIDIAN_PSYCHOLOGY, type EssenceOil } from '@/lib/essence-data';
import EssentialOilBottle from '@/components/healing/essence/EssenceBottle3D';

const WUXING_COLORS: Record<string, string> = { '木': '#5d8a63', '火': '#c26158', '土': '#c9a94f', '金': '#5ba09a', '水': '#3d7a75' };
const TYPE_LABELS: Record<string, string> = { monthly: '月令', solar_term: '节气', pentad: '候' };

function BottleSkeleton() {
  return (
    <div style={{ width: 72, height: 148, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: 40, height: 80, borderRadius: 8, background: 'rgba(0,0,0,0.04)' }} />
    </div>
  );
}

export default function EssenceAtlasPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [wuxingFilter, setWuxingFilter] = useState<string>('all');
  const [selectedOil, setSelectedOil] = useState<EssenceOil | null>(null);

  const currentTerm = useMemo(() => getCurrentSolarTerm(), []);

  const filtered = useMemo(() => {
    return essenceOils.filter(o => {
      if (typeFilter !== 'all' && o.type !== typeFilter) return false;
      if (wuxingFilter !== 'all' && o.wuxing !== wuxingFilter) return false;
      return true;
    });
  }, [typeFilter, wuxingFilter]);

  const isCurrentTerm = useCallback((oil: EssenceOil) => {
    if (!currentTerm) return false;
    return oil.solarTerm === currentTerm.solarTerm;
  }, [currentTerm]);

  const healingPlan = useMemo(() => {
    if (!selectedOil) return null;
    return generateHealingPlan(selectedOil);
  }, [selectedOil]);

  return (
    <div className="min-h-screen" style={{ background: '#faf5ee' }}>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3" style={{ background: 'rgba(250,245,238,0.88)',
}}>
        <Link href="/healing" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(26,26,26,0.06)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        </Link>
        <h1 className="text-lg font-bold tracking-wide" style={{ color: '#1a1a1a', fontWeight: 760 }}>精油图谱</h1>
        {currentTerm && (
          <span className="ml-auto text-xs px-2.5 py-1 rounded-full" style={{ background: `${WUXING_COLORS['木']}18`, color: WUXING_COLORS['木'], fontWeight: 600 }}>
            当前 · {currentTerm.solarTerm}
          </span>
        )}
      </header>

      <div className="px-4 pt-1 pb-2">
        <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          <div className="flex gap-1.5 rounded-2xl px-2 py-1.5" style={{ background: 'rgba(255,255,255,0.6)',
}}>
            {['all', 'monthly', 'solar_term', 'pentad'].map(t => (
              <button key={t} onClick={() => setTypeFilter(t)}
                className="px-3 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all"
                style={{
                  background: typeFilter === t ? '#1a1a1a' : 'transparent',
                  color: typeFilter === t ? '#faf5ee' : '#1a1a1a',
                  fontWeight: typeFilter === t ? 600 : 400,
                }}>
                {t === 'all' ? '全部' : TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-1.5 mt-1.5">
          {['all', '木', '火', '土', '金', '水'].map(w => (
            <button key={w} onClick={() => setWuxingFilter(w)}
              className="px-3 py-1.5 rounded-xl text-xs transition-all"
              style={{
                background: wuxingFilter === w ? WUXING_COLORS[w] || '#1a1a1a' : 'rgba(255,255,255,0.6)',
                color: wuxingFilter === w ? '#fff' : w === 'all' ? '#1a1a1a' : WUXING_COLORS[w],
                fontWeight: wuxingFilter === w ? 600 : 500,
                border: wuxingFilter !== w && w !== 'all' ? `1px solid ${WUXING_COLORS[w]}40` : 'none',
              }}>
              {w === 'all' ? '五行' : w}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 pb-6">
        <div className="text-xs mb-2" style={{ color: '#999' }}>共 {filtered.length} 款精油</div>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map(oil => {
            const color = WUXING_COLORS[oil.wuxing];
            const isCurrent = isCurrentTerm(oil);
            return (
              <button key={oil.id} onClick={() => setSelectedOil(oil)}
                className="relative rounded-2xl p-3 text-left transition-all active:scale-[0.97]"
                style={{
                  background: 'rgba(255,255,255,0.65)',
borderLeft: `3px solid ${color}`,
                  boxShadow: isCurrent ? `0 0 0 1.5px ${color}50, 0 4px 16px ${color}18` : '0 1px 4px rgba(0,0,0,0.04)',
                }}>
                {isCurrent && (
                  <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full" style={{ background: `${color}20`, color, fontWeight: 600 }}>当令</span>
                )}
                {/* CSS oil bottle */}
                <div className="flex justify-center mb-1.5">
                  <EssentialOilBottle
                    upperColor={oil.upperColorHex}
                    lowerColor={oil.lowerColorHex}
                    upperColorName={oil.upperColor}
                    lowerColorName={oil.lowerColor}
                    name={oil.name}
                    meridian={oil.meridian}
                    wuxing={oil.wuxing}
                    size="sm"
                    animate={isCurrent}
                    showLabels={false}
                  />
                </div>
                <div className="text-sm font-bold leading-tight mb-1" style={{ color: '#1a1a1a', fontWeight: 760 }}>{oil.name}</div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${color}18`, color }}>{oil.wuxing}</span>
                  <span className="text-[10px]" style={{ color: '#999' }}>{oil.meridian}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                    <div className="flex h-full">
                      <div className="h-full rounded-l-full" style={{ width: `${(oil.yangValue / 6) * 100}%`, background: '#c26158' }} />
                      <div className="h-full rounded-r-full" style={{ width: `${(oil.yinValue / 6) * 100}%`, background: '#3d7a75' }} />
                    </div>
                  </div>
                  <span className="text-[9px] shrink-0" style={{ color: '#999' }}>阳{oil.yangValue}/阴{oil.yinValue}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selectedOil && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setSelectedOil(null)}>
          <div className="absolute inset-0" style={{ background: 'rgba(26,26,26,0.35)',
}} />
          <div className="relative w-full max-w-lg rounded-t-3xl overflow-hidden animate-slide-up" style={{ background: '#faf5ee', maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-4 pb-2" style={{ background: '#faf5ee' }}>
              <h2 className="text-base font-bold" style={{ color: '#1a1a1a', fontWeight: 760 }}>{selectedOil.name}</h2>
              <button onClick={() => setSelectedOil(null)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="px-5 pb-8 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
              {/* CSS Oil Bottle in detail view */}
              <div className="flex justify-center mb-4">
                <EssentialOilBottle
                  upperColor={selectedOil.upperColorHex}
                  lowerColor={selectedOil.lowerColorHex}
                  upperColorName={selectedOil.upperColor}
                  lowerColorName={selectedOil.lowerColor}
                  name={selectedOil.name}
                  meridian={selectedOil.meridian}
                  wuxing={selectedOil.wuxing}
                  size="lg"
                  animate={true}
                  showLabels={true}
                />
              </div>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: `${WUXING_COLORS[selectedOil.wuxing]}18`, color: WUXING_COLORS[selectedOil.wuxing] }}>{selectedOil.wuxing} · {ENERGY_PROPERTY[selectedOil.wuxing]?.name}</span>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.05)' }}>{selectedOil.meridian}</span>
                {selectedOil.yangDesc && (
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(194,97,88,0.1)', color: '#c26158' }}>{selectedOil.yangDesc}</span>
                )}
                {selectedOil.yinDesc && (
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: 'rgba(61,122,117,0.1)', color: '#3d7a75' }}>{selectedOil.yinDesc}</span>
                )}
              </div>

              {selectedOil.dateRange && (
                <div className="text-xs mb-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)', color: '#666' }}>
                  {selectedOil.dateRange}
                  {selectedOil.climateFeature ? ` · ${selectedOil.climateFeature}` : ''}
                  {selectedOil.solarLongitude != null ? ` · 黄经${selectedOil.solarLongitude}°` : ''}
                </div>
              )}

              {selectedOil.yiJingQi && (
                <div className="text-xs mb-3 px-3 py-2 rounded-xl" style={{ background: `${WUXING_COLORS[selectedOil.wuxing]}0a`, color: '#555' }}>
                  易经主气：{selectedOil.yiJingQi}
                </div>
              )}

              {/* 五行特性 (full text from PPT) */}
              <div className="mb-4 px-3 py-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                <div className="text-xs font-bold mb-1.5" style={{ color: WUXING_COLORS[selectedOil.wuxing], fontWeight: 760 }}>五行特性</div>
                <div className="text-xs leading-relaxed" style={{ color: '#444' }}>{selectedOil.wuxingFeature}</div>
              </div>

              {/* 上层释义 (from PPT) */}
              {selectedOil.upperExplanation && (
                <div className="mb-3 px-3 py-2.5 rounded-xl" style={{ background: `${selectedOil.upperColorHex}12`, borderLeft: `3px solid ${selectedOil.upperColorHex === '#FFFFFF' ? '#ddd' : selectedOil.upperColorHex}` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full border" style={{ background: selectedOil.upperColorHex, borderColor: selectedOil.upperColorHex === '#FFFFFF' ? '#ddd' : 'transparent' }} />
                    <span className="text-[10px] font-bold" style={{ color: '#1a1a1a' }}>上层 · {selectedOil.upperColor}（阳）</span>
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: '#555' }}>{selectedOil.upperExplanation}</div>
                </div>
              )}

              {/* 下层释义 (from PPT) */}
              {selectedOil.lowerExplanation && (
                <div className="mb-3 px-3 py-2.5 rounded-xl" style={{ background: `${selectedOil.lowerColorHex}12`, borderLeft: `3px solid ${selectedOil.lowerColorHex === '#FFFFFF' ? '#ddd' : selectedOil.lowerColorHex}` }}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="w-3 h-3 rounded-full border" style={{ background: selectedOil.lowerColorHex, borderColor: selectedOil.lowerColorHex === '#FFFFFF' ? '#ddd' : 'transparent' }} />
                    <span className="text-[10px] font-bold" style={{ color: '#1a1a1a' }}>下层 · {selectedOil.lowerColor}（阴）</span>
                  </div>
                  <div className="text-xs leading-relaxed" style={{ color: '#555' }}>{selectedOil.lowerExplanation}</div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)' }}>
                  <div className="text-[10px] mb-0.5" style={{ color: '#999' }}>脏腑功能</div>
                  <div className="text-xs font-semibold" style={{ color: '#1a1a1a' }}>{selectedOil.organFunction || '-'}</div>
                </div>
                <div className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)' }}>
                  <div className="text-[10px] mb-0.5" style={{ color: '#999' }}>香阶</div>
                  <div className="text-xs font-semibold" style={{ color: '#1a1a1a' }}>{AROMA_NOTE[selectedOil.wuxing]?.note || '-'}</div>
                </div>
              </div>

              <div className="mb-4">
                <div className="text-xs font-bold mb-2" style={{ color: '#1a1a1a', fontWeight: 760 }}>阴阳配比</div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                    <div className="flex h-full">
                      <div className="h-full rounded-l-full transition-all" style={{ width: `${(selectedOil.yangValue / 6) * 100}%`, background: '#c26158' }} />
                      <div className="h-full rounded-r-full transition-all" style={{ width: `${(selectedOil.yinValue / 6) * 100}%`, background: '#3d7a75' }} />
                    </div>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: '#666' }}>阳{selectedOil.yangValue} 阴{selectedOil.yinValue}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {(['upper', 'lower'] as const).map(pos => {
                  const colName = pos === 'upper' ? selectedOil.upperColor : selectedOil.lowerColor;
                  const colHex = pos === 'upper' ? selectedOil.upperColorHex : selectedOil.lowerColorHex;
                  const psyche = COLOR_PSYCHOLOGY[colName];
                  if (!psyche) return null;
                  return (
                    <div key={pos} className="px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-3 h-3 rounded-full border" style={{ background: colHex, borderColor: colHex === '#FFFFFF' ? '#ddd' : 'transparent' }} />
                        <span className="text-[10px]" style={{ color: '#999' }}>{pos === 'upper' ? '上层' : '下层'} · {colName}</span>
                      </div>
                      <div className="text-xs font-semibold" style={{ color: '#1a1a1a' }}>{psyche.psyche}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#888' }}>{psyche.emotion}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: WUXING_COLORS[selectedOil.wuxing] }}>{psyche.chakra}</div>
                    </div>
                  );
                })}
              </div>

              {(() => {
                const mp = MERIDIAN_PSYCHOLOGY[selectedOil.meridian];
                if (!mp) return null;
                return (
                  <div className="mb-4 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.7)' }}>
                    <div className="text-xs font-bold mb-1.5" style={{ color: '#1a1a1a', fontWeight: 760 }}>经络心理</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs" style={{ color: WUXING_COLORS[selectedOil.wuxing], fontWeight: 600 }}>{mp.organ}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.05)', color: '#666' }}>情志 · {mp.emotion}</span>
                    </div>
                    <div className="text-xs" style={{ color: '#666' }}>{mp.healing}</div>
                  </div>
                );
              })()}

              {healingPlan && (
                <div className="px-3 py-3 rounded-xl" style={{ background: `${WUXING_COLORS[selectedOil.wuxing]}0a`, border: `1px solid ${WUXING_COLORS[selectedOil.wuxing]}20` }}>
                  <div className="text-xs font-bold mb-2" style={{ color: WUXING_COLORS[selectedOil.wuxing], fontWeight: 760 }}>疗愈方案</div>
                  <div className="space-y-2">
                    <div className="text-xs" style={{ color: '#555' }}><span className="font-semibold" style={{ color: '#1a1a1a' }}>方法：</span>{healingPlan.method}</div>
                    <div className="text-xs" style={{ color: '#555' }}><span className="font-semibold" style={{ color: '#1a1a1a' }}>周期：</span>{healingPlan.duration}</div>
                    <div className="text-xs" style={{ color: '#555' }}><span className="font-semibold" style={{ color: '#1a1a1a' }}>配伍：</span>{healingPlan.combination}</div>
                    <div className="text-xs" style={{ color: '#555' }}><span className="font-semibold" style={{ color: '#1a1a1a' }}>时辰：</span>{healingPlan.timing}</div>
                    {healingPlan.precautions && (
                      <div className="text-xs" style={{ color: '#999' }}><span className="font-semibold">注意：</span>{healingPlan.precautions}</div>
                    )}
                  </div>
                  <div className="text-[10px] mt-2 pt-2" style={{ color: '#bbb', borderTop: '1px solid rgba(0,0,0,0.06)' }}>{healingPlan.disclaimer}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.3s cubic-bezier(0.16,1,0.3,1); }
      `}</style>
    </div>
  );
}
