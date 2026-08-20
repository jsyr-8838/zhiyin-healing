'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { essenceOils, generateOilPsychResult, ENERGY_PROPERTY, type EssenceOil, type OilPsychResult } from '@/lib/essence-data';
import { useAppStore } from '@/lib/store';
import type { EssenceDiagnosisResult } from '@/lib/unified-diagnosis';

const WUXING_COLORS: Record<string, string> = { '木': '#5d8a63', '火': '#c26158', '土': '#c9a94f', '金': '#5ba09a', '水': '#3d7a75' };
const WUXING_CN: Record<string, string> = { '木': '木·角', '火': '火·徵', '土': '土·宫', '金': '金·商', '水': '水·羽' };

export default function OilPsychPage() {
  const [selected, setSelected] = useState<string[]>([]);
  const [result, setResult] = useState<OilPsychResult | null>(null);
  const setEssenceDiagnosisResult = useAppStore(s => s.setEssenceDiagnosisResult);

  // Wire to unified diagnosis store when result changes
  useEffect(() => {
    if (!result) return;
    const wuxingEntries = Object.entries(result.wuxingDistribution) as [string, number][];
    const dominantWuxing = wuxingEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || '土';
    const essenceResult: EssenceDiagnosisResult = {
      preferredElement: dominantWuxing as EssenceDiagnosisResult['preferredElement'],
      recommendedOils: result.selectedOils.map(o => o.name),
      aromaProfile: result.psychologyProfile.slice(0, 30),
      timestamp: Date.now(),
    };
    setEssenceDiagnosisResult(essenceResult);
  }, [result, setEssenceDiagnosisResult]);

  const solarOils = useMemo(() => essenceOils.filter(o => o.type === 'solar_term'), []);

  const toggleOil = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const selectedOils = useMemo(() => solarOils.filter(o => selected.includes(o.id)), [selected, solarOils]);

  const handleAnalyze = () => {
    if (selectedOils.length !== 3) return;
    const r = generateOilPsychResult(selectedOils);
    setResult(r);
  };

  const maxWuxing = Math.max(...Object.values(result?.wuxingDistribution || {}), 1);

  if (result) {
    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf5ee 0%, #f5efe4 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
          <div className="flex items-center gap-3 mb-6">
            <Link href="/diagnose/oil-psych" onClick={() => setResult(null)} className="text-sm" style={{ color: '#5d8a63' }}>← 重新选择</Link>
          </div>

          <div className="rounded-2xl p-6 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 className="text-lg mb-1" style={{ color: '#1a1a1a', fontWeight: 760 }}>五行分布</h2>
            <p className="text-xs mb-4" style={{ color: '#888' }}>所选精油的五行能量分布</p>
            <div className="flex items-end gap-3 justify-center" style={{ height: 140 }}>
              {(['木', '火', '土', '金', '水'] as const).map(w => {
                const val = result.wuxingDistribution[w] || 0;
                const h = Math.max((val / maxWuxing) * 100, 4);
                return (
                  <div key={w} className="flex flex-col items-center gap-1 flex-1">
                    <span className="text-xs font-bold" style={{ color: WUXING_COLORS[w] }}>{val}</span>
                    <div className="w-full rounded-t-lg transition-all duration-500" style={{ height: h, background: WUXING_COLORS[w], minHeight: 4 }} />
                    <span className="text-xs" style={{ color: '#1a1a1a' }}>{WUXING_CN[w]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base mb-3" style={{ color: '#1a1a1a', fontWeight: 760 }}>阴阳平衡</h2>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs" style={{ color: '#c26158' }}>阳 {result.yinYangBalance.yang}</span>
              <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: '#f0ebe3' }}>
                <div className="h-full rounded-full" style={{
                  width: `${(result.yinYangBalance.yang / (result.yinYangBalance.yang + result.yinYangBalance.yin)) * 100}%`,
                  background: 'linear-gradient(90deg, #c26158, #e8a088)',
                }} />
              </div>
              <span className="text-xs" style={{ color: '#3d7a75' }}>阴 {result.yinYangBalance.yin}</span>
            </div>
            <p className="text-xs text-center" style={{ color: '#888' }}>阳:阴 = {result.yinYangBalance.ratio}</p>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base mb-3" style={{ color: '#1a1a1a', fontWeight: 760 }}>主导情志</h2>
            <div className="flex flex-wrap gap-2">
              {result.dominantEmotions.map((e, i) => (
                <span key={i} className="px-3 py-1 rounded-full text-sm" style={{ background: '#f5efe4', color: '#5d8a63', fontWeight: 600 }}>{e}</span>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base mb-3" style={{ color: '#1a1a1a', fontWeight: 760 }}>心理画像</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#444' }}>{result.psychologyProfile}</p>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base mb-3" style={{ color: '#1a1a1a', fontWeight: 760 }}>经络分析</h2>
            <p className="text-sm leading-relaxed" style={{ color: '#444' }}>{result.meridianAnalysis}</p>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base mb-3" style={{ color: '#1a1a1a', fontWeight: 760 }}>色彩心理</h2>
            <div className="mb-2">
              <p className="text-xs mb-1" style={{ color: '#888' }}>意识层面（上层色）</p>
              <div className="flex gap-2">
                {result.selectedOils.map(o => (
                  <div key={o.id + 'u'} className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ background: o.upperColorHex, border: '1px solid #e0d8cc' }} />
                    <span className="text-xs" style={{ color: '#444' }}>{o.upperColor}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-3">
              <p className="text-xs mb-1" style={{ color: '#888' }}>潜意识层面（下层色）</p>
              <div className="flex gap-2">
                {result.selectedOils.map(o => (
                  <div key={o.id + 'l'} className="flex items-center gap-1">
                    <div className="w-4 h-4 rounded" style={{ background: o.lowerColorHex, border: '1px solid #e0d8cc' }} />
                    <span className="text-xs" style={{ color: '#444' }}>{o.lowerColor}</span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#444' }}>{result.colorPsychAnalysis}</p>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base mb-3" style={{ color: '#1a1a1a', fontWeight: 760 }}>疗愈建议</h2>
            <ul className="space-y-2">
              {result.healingSuggestions.map((s, i) => (
                <li key={i} className="flex gap-2 text-sm" style={{ color: '#444' }}>
                  <span className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ background: '#f5efe4', color: '#5d8a63' }}>{i + 1}</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-center py-4" style={{ color: '#aaa' }}>{result.disclaimer}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf5ee 0%, #f5efe4 100%)' }}>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Link href="/diagnose" className="text-sm" style={{ color: '#5d8a63' }}>← 明辨</Link>
          <span style={{ color: '#ccc' }}>·</span>
          <span className="text-sm" style={{ color: '#888' }}>精油心理</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl mb-2" style={{ color: '#1a1a1a', fontWeight: 780, letterSpacing: '-0.02em' }}>精油心理</h1>
          <p className="text-sm leading-relaxed" style={{ color: '#777' }}>
            凭直觉选出 3 款最吸引你的节气精油，你的选择将揭示内在五行能量分布、阴阳状态与深层心理画像。
          </p>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div key={i} className="w-8 h-1 rounded-full" style={{ background: i < selected.length ? '#5d8a63' : '#e8e1d5' }} />
            ))}
          </div>
          <span className="text-xs" style={{ color: '#888' }}>已选 {selected.length}/3</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-32">
          {solarOils.map(oil => {
            const isSelected = selected.includes(oil.id);
            const isDisabled = !isSelected && selected.length >= 3;
            return (
              <button
                key={oil.id}
                onClick={() => !isDisabled && toggleOil(oil.id)}
                disabled={isDisabled}
                className="relative rounded-xl p-3 text-left transition-all duration-200"
                style={{
                  background: isSelected ? '#fff' : '#fff',
                  boxShadow: isSelected
                    ? `0 0 0 2px ${WUXING_COLORS[oil.wuxing]}, 0 4px 20px rgba(0,0,0,0.08)`
                    : '0 1px 8px rgba(0,0,0,0.04)',
                  opacity: isDisabled ? 0.4 : 1,
                }}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs" style={{ background: WUXING_COLORS[oil.wuxing] }}>✓</div>
                )}
                <div className="flex gap-1 mb-2">
                  <div className="w-5 h-5 rounded" style={{ background: oil.upperColorHex, border: '1px solid #e0d8cc' }} />
                  <div className="w-5 h-5 rounded" style={{ background: oil.lowerColorHex, border: '1px solid #e0d8cc' }} />
                </div>
                <p className="text-sm mb-1" style={{ color: '#1a1a1a', fontWeight: 600 }}>{oil.solarTerm}</p>
                <p className="text-xs" style={{ color: '#888' }}>{oil.meridian}</p>
                <div className="mt-2">
                  <span className="inline-block px-2 py-0.5 rounded text-xs" style={{ background: WUXING_COLORS[oil.wuxing] + '18', color: WUXING_COLORS[oil.wuxing] }}>
                    {oil.wuxing}·{ENERGY_PROPERTY[oil.wuxing]?.name || ''}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {selected.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-10" style={{ background: 'rgba(250,245,238,0.96)',
borderTop: '1px solid #e8e1d5' }}>
          <div className="max-w-2xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 mb-2">
              {selectedOils.map(o => (
                <span key={o.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs" style={{ background: WUXING_COLORS[o.wuxing] + '14', color: WUXING_COLORS[o.wuxing] }}>
                  <div className="w-3 h-3 rounded-sm" style={{ background: o.lowerColorHex }} />
                  {o.solarTerm}
                  <button onClick={() => toggleOil(o.id)} className="ml-0.5 opacity-60 hover:opacity-100">×</button>
                </span>
              ))}
            </div>
            <button
              onClick={handleAnalyze}
              disabled={selected.length < 3}
              className="w-full py-3 rounded-xl text-sm transition-all"
              style={{
                background: selected.length === 3 ? 'linear-gradient(135deg, #5d8a63, #3d7a75)' : '#e0d8cc',
                color: selected.length === 3 ? '#fff' : '#999',
                fontWeight: 700,
              }}
            >
              {selected.length < 3 ? `还需选择 ${3 - selected.length} 款` : '开始分析 →'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
