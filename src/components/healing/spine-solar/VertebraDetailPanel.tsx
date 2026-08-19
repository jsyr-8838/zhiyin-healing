'use client';

import React from 'react';
import {
  type SpineSolarEntry,
  type VertebraType,
  WUXING_COLORS,
  WUXING_TONES,
  WUXING_LIUZIJUE,
  REGION_COLORS,
  getVertebraRegionLabel,
} from '@/lib/spine-solar-data';

interface VertebraDetailPanelProps {
  entry: SpineSolarEntry;
  onClose?: () => void;
}

export default function VertebraDetailPanel({ entry, onClose }: VertebraDetailPanelProps) {
  const wuxingColor = WUXING_COLORS[entry.wuxing];
  const regionColor = REGION_COLORS[entry.vertebraType];
  const regionLabel = getVertebraRegionLabel(entry.vertebraType);

  return (
    <div className="w-full space-y-4 animate-in slide-in-from-right-2 duration-300">
      {/* 头部：节气+椎骨 */}
      <div
        className="rounded-xl p-4 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${wuxingColor}18, ${wuxingColor}08)`,
          borderLeft: `3px solid ${wuxingColor}`,
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg font-bold text-[#2c1810]">{entry.solarTerm}</span>
              <span className="text-xs text-[#8b7b6b]">{entry.solarTermEn}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#5a4a3a]">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
                style={{ backgroundColor: regionColor }}
              >
                {entry.vertebra}
              </span>
              <span className="text-[#8b7b6b]">{regionLabel}</span>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-[#8b7b6b] hover:text-[#5a4a3a] transition-colors text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* 五行属性条 */}
      <div className="flex items-center gap-3">
        {(['木', '火', '土', '金', '水'] as const).map(w => (
          <div
            key={w}
            className={`
              flex-1 rounded-lg py-2 text-center text-xs font-medium transition-all
              ${entry.wuxing === w ? 'text-white shadow-sm scale-105' : 'text-[#8b7b6b] bg-[#faf5ee]'}
            `}
            style={{
              backgroundColor: entry.wuxing === w ? WUXING_COLORS[w] : undefined,
            }}
          >
            <div>{w}</div>
            <div className="text-[10px] mt-0.5 opacity-80">
              {WUXING_TONES[w]}·{WUXING_LIUZIJUE[w]}
            </div>
          </div>
        ))}
      </div>

      {/* 经络信息 */}
      <div className="bg-[#faf5ee] rounded-lg p-3">
        <h4 className="text-xs font-semibold text-[#5a4a3a] mb-2">对应经络</h4>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium"
            style={{ backgroundColor: `${wuxingColor}20`, color: wuxingColor }}
          >
            {entry.meridian}
          </span>
          {entry.pairedVertebra && (
            <span className="text-xs text-[#8b7b6b]">
              配对: {entry.pairedVertebra} ({entry.pairedMeridian})
            </span>
          )}
        </div>
      </div>

      {/* 情志心理 */}
      <div className="bg-[#faf5ee] rounded-lg p-3">
        <h4 className="text-xs font-semibold text-[#5a4a3a] mb-2">情志模式</h4>
        <p className="text-sm text-[#4a3a2a] leading-relaxed">{entry.psychology}</p>
        {entry.causes && entry.causes !== '-' && (
          <p className="text-xs text-[#8b7b6b] mt-2">
            <span className="font-medium">根因:</span> {entry.causes}
          </p>
        )}
      </div>

      {/* 健康风险 */}
      {entry.healthRisks.length > 0 && (
        <div className="bg-[#faf5ee] rounded-lg p-3">
          <h4 className="text-xs font-semibold text-[#5a4a3a] mb-2">健康风险</h4>
          <div className="flex flex-wrap gap-1.5">
            {entry.healthRisks.map((risk, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-[#f0e8dc] text-[#6b5b4b]"
              >
                {risk}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 疗愈方案 */}
      <div
        className="rounded-lg p-3"
        style={{
          background: `linear-gradient(135deg, ${wuxingColor}12, ${wuxingColor}06)`,
          borderLeft: `2px solid ${wuxingColor}40`,
        }}
      >
        <h4 className="text-xs font-semibold text-[#5a4a3a] mb-2">疗愈方案</h4>
        <ul className="space-y-1.5">
          {entry.healingSolutions.map((sol, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-[#4a3a2a]">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: wuxingColor }}
              />
              {sol}
            </li>
          ))}
        </ul>
      </div>

      {/* 推荐模块 */}
      <div className="grid grid-cols-3 gap-2">
        <div
          className="rounded-lg p-2.5 text-center"
          style={{ backgroundColor: `${WUXING_COLORS['木']}10` }}
        >
          <div className="text-[10px] text-[#8b7b6b] mb-1">五音</div>
          <div className="text-sm font-semibold" style={{ color: WUXING_COLORS['木'] }}>
            {entry.recommendedTone}
          </div>
        </div>
        <div
          className="rounded-lg p-2.5 text-center"
          style={{ backgroundColor: `${WUXING_COLORS['火']}10` }}
        >
          <div className="text-[10px] text-[#8b7b6b] mb-1">六字诀</div>
          <div className="text-sm font-semibold" style={{ color: WUXING_COLORS['火'] }}>
            {entry.recommendedLiuzijue}
          </div>
        </div>
        <div
          className="rounded-lg p-2.5 text-center"
          style={{ backgroundColor: `${WUXING_COLORS['土']}10` }}
        >
          <div className="text-[10px] text-[#8b7b6b] mb-1">经络</div>
          <div className="text-sm font-semibold" style={{ color: WUXING_COLORS['土'] }}>
            {entry.meridian}
          </div>
        </div>
      </div>

      {/* 穴位推荐 */}
      {entry.recommendedAcupoints.length > 0 && (
        <div className="bg-[#faf5ee] rounded-lg p-3">
          <h4 className="text-xs font-semibold text-[#5a4a3a] mb-2">推荐穴位</h4>
          <div className="flex flex-wrap gap-1.5">
            {entry.recommendedAcupoints.map((point, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${wuxingColor}20`, color: wuxingColor }}
              >
                {point}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 养生建议 */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-[#faf5ee] rounded-lg p-2.5">
          <div className="text-[10px] text-[#8b7b6b] mb-1">饮食</div>
          <div className="text-xs text-[#4a3a2a]">{entry.dietAdvice}</div>
        </div>
        <div className="bg-[#faf5ee] rounded-lg p-2.5">
          <div className="text-[10px] text-[#8b7b6b] mb-1">起居</div>
          <div className="text-xs text-[#4a3a2a]">{entry.routineAdvice}</div>
        </div>
      </div>

      {/* 禁忌 */}
      <div className="rounded-lg p-2.5 bg-[#fff5f5] border border-[#ffe0e0]">
        <div className="text-[10px] text-[#c26158] mb-0.5 font-medium">禁忌</div>
        <div className="text-xs text-[#8b4a4a]">{entry.contraindication}</div>
      </div>
    </div>
  );
}
