'use client';

import React, { useState, useMemo, useCallback, Suspense } from 'react';
import Link from 'next/link';
import {
  spineSolarData,
  getCurrentSolarTerm,
  getEntryBySolarTerm,
  WUXING_COLORS,
  SEASON_COLORS,
  SEASON_ICONS,
  type SpineSolarEntry,
  type Season,
  type WuxingElement,
  type VertebraType,
} from '@/lib/spine-solar-data';
import dynamic from 'next/dynamic';

/* 动态加载3D组件（避免SSR问题） */
const SpineViewer3D = dynamic(
  () => import('@/components/healing/spine-solar/SpineViewer3D'),
  { ssr: false, loading: () => <SpineLoader /> }
);

const SolarTermSelector = dynamic(
  () => import('@/components/healing/spine-solar/SolarTermSelector'),
  { ssr: false }
);

const VertebraDetailPanel = dynamic(
  () => import('@/components/healing/spine-solar/VertebraDetailPanel'),
  { ssr: false }
);

/* ===== 加载占位 ===== */

function SpineLoader() {
  return (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-[rgba(250,245,238,0.6)] rounded-xl">
      <div className="w-10 h-10 border-[3px] border-[#E8D4B8] border-t-[#D4A574] rounded-full animate-spin" />
      <div className="text-[#8B6F5E] text-sm mt-3 font-medium">构建脊柱模型...</div>
    </div>
  );
}

/* ===== 概览统计 ===== */

function OverviewStats({ entry }: { entry: SpineSolarEntry }) {
  const stats = [
    { label: '季节', value: `${SEASON_ICONS[entry.season]} ${entry.season}`, color: SEASON_COLORS[entry.season] },
    { label: '五行', value: entry.wuxing, color: WUXING_COLORS[entry.wuxing] },
    { label: '椎骨', value: entry.vertebra, color: '#c9a94f' },
    { label: '经络', value: entry.meridian, color: '#5d8a63' },
  ];

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map(s => (
        <div key={s.label} className="bg-[#faf5ee] rounded-lg p-2.5 text-center">
          <div className="text-[10px] text-[#8b7b6b] mb-1">{s.label}</div>
          <div className="text-sm font-semibold" style={{ color: s.color }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ===== 区域过滤器 ===== */

type FilterType = 'all' | Season | WuxingElement | VertebraType;

function RegionFilter({
  filter,
  onChange,
}: {
  filter: FilterType;
  onChange: (f: FilterType) => void;
}) {
  const options: { key: FilterType; label: string; icon: string }[] = [
    { key: 'all', label: '全部', icon: '🔗' },
    { key: '春', label: '春', icon: '🌸' },
    { key: '夏', label: '夏', icon: '☀️' },
    { key: '秋', label: '秋', icon: '🍂' },
    { key: '冬', label: '冬', icon: '❄️' },
    { key: 'sacrum', label: '骶椎', icon: '🦴' },
    { key: 'lumbar', label: '腰椎', icon: '💪' },
    { key: 'thoracic', label: '胸椎', icon: '🫁' },
    { key: 'cervical', label: '颈椎', icon: '🦒' },
  ];

  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {options.map(o => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`
            flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-all
            ${filter === o.key
              ? 'bg-[#5d8a63] text-white shadow-sm'
              : 'bg-[#faf5ee] text-[#6b5b4b] hover:bg-[#f0e8dc]'
            }
          `}
        >
          {o.icon} {o.label}
        </button>
      ))}
    </div>
  );
}

/* ===== 主页面 ===== */

export default function SpineSolarPage() {
  const currentTerm = getCurrentSolarTerm();
  const [selectedTerm, setSelectedTerm] = useState(currentTerm);
  const [filter, setFilter] = useState<FilterType>('all');

  const selectedEntry = useMemo((): SpineSolarEntry | undefined => {
    return getEntryBySolarTerm(selectedTerm);
  }, [selectedTerm]);

  /* 过滤节气列表 */
  const filteredEntries = useMemo((): SpineSolarEntry[] => {
    if (filter === 'all') return spineSolarData;
    const seasonValues: string[] = ['春', '夏', '秋', '冬'];
    const wuxingValues: string[] = ['木', '火', '土', '金', '水'];
    const vertebraValues: string[] = ['sacrum', 'lumbar', 'thoracic', 'cervical'];

    if (seasonValues.includes(filter)) {
      return spineSolarData.filter(d => d.season === filter);
    }
    if (wuxingValues.includes(filter)) {
      return spineSolarData.filter(d => d.wuxing === filter);
    }
    if (vertebraValues.includes(filter)) {
      return spineSolarData.filter(d => d.vertebraType === filter);
    }
    return spineSolarData;
  }, [filter]);

  /* 3D椎骨点击回调 */
  const handleBoneClick = useCallback((entry: SpineSolarEntry | null) => {
    if (entry) {
      setSelectedTerm(entry.solarTerm);
    }
  }, []);

  /* 节气网格点击 */
  const handleTermSelect = useCallback((term: string) => {
    setSelectedTerm(term);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf5ee]">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-[#faf5ee]/90 border-b border-[#e8dcc8]">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href="/healing"
              className="text-[#8b7b6b] hover:text-[#5a4a3a] transition-colors"
            >
              ← 返回
            </Link>
            <h1 className="text-lg font-bold text-[#2c1810]">
              二十四节气 · 脊柱身心疗法
            </h1>
          </div>
          <p className="text-xs text-[#8b7b6b] mt-1">
            每个节气对应脊柱特定椎骨，椎骨移位引发身心失衡。探索节气↔椎骨↔经络的深层关联
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* 节气选择器 */}
        <div className="mb-4">
          <SolarTermSelector
            selectedTerm={selectedTerm}
            onSelect={handleTermSelect}
          />
        </div>

        {/* 主体布局：3D脊柱 + 详情面板 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
          {/* 3D脊柱查看器 */}
          <div className="lg:col-span-3">
            <div className="aspect-[3/4] lg:aspect-auto lg:h-[600px] rounded-xl overflow-hidden shadow-sm">
              <SpineViewer3D
                selectedSolarTerm={selectedTerm}
                selectedEntry={selectedEntry ?? null}
                onBoneClick={handleBoneClick}
              />
            </div>
          </div>

          {/* 详情面板 */}
          <div className="lg:col-span-2">
            <div className="max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
              {selectedEntry ? (
                <VertebraDetailPanel entry={selectedEntry} />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-[#8b7b6b]">
                  <div className="text-4xl mb-3">🦴</div>
                  <p className="text-sm">点击节气或3D脊柱查看详情</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 概览统计（当前节气） */}
        {selectedEntry && (
          <div className="mb-6">
            <OverviewStats entry={selectedEntry} />
          </div>
        )}

        {/* 区域过滤器 */}
        <div className="mb-4">
          <RegionFilter filter={filter} onChange={setFilter} />
        </div>

        {/* 24节气网格 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
          {filteredEntries.map(entry => {
            const wuxingColor = WUXING_COLORS[entry.wuxing];
            const seasonColor = SEASON_COLORS[entry.season];
            const isSelected = entry.solarTerm === selectedTerm;
            const isCurrent = entry.solarTerm === currentTerm;

            return (
              <button
                key={entry.solarTerm}
                onClick={() => handleTermSelect(entry.solarTerm)}
                className={`
                  relative rounded-xl p-3 text-left transition-all duration-200
                  ${isSelected
                    ? 'shadow-md scale-[1.02]'
                    : 'hover:shadow-sm hover:scale-[1.01]'
                  }
                `}
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${wuxingColor}20, ${wuxingColor}08)`
                    : '#faf5ee',
                  borderLeft: `3px solid ${isSelected ? wuxingColor : seasonColor}60`,
                }}
              >
                {/* 当前节气标记 */}
                {isCurrent && (
                  <div
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: seasonColor }}
                  />
                )}

                {/* 节气名 */}
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-sm font-bold text-[#2c1810]">{entry.solarTerm}</span>
                  <span className="text-[10px] text-[#8b7b6b]">{SEASON_ICONS[entry.season]}</span>
                </div>

                {/* 椎骨 */}
                <div
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white mb-1"
                  style={{ backgroundColor: seasonColor }}
                >
                  {entry.vertebra}
                </div>

                {/* 经络 */}
                <div className="text-[10px] text-[#8b7b6b] truncate">
                  {entry.meridian} · {entry.wuxing}
                </div>

                {/* 情志摘要 */}
                <div className="text-[10px] text-[#6b5b4b] mt-1 line-clamp-2 leading-relaxed">
                  {entry.psychology.slice(0, 30)}{entry.psychology.length > 30 ? '...' : ''}
                </div>
              </button>
            );
          })}
        </div>

        {/* 理论介绍 */}
        <div className="rounded-xl p-5 bg-[#f0e8dc]/60 border border-[#e0d4c0] mb-6">
          <h3 className="text-sm font-bold text-[#2c1810] mb-3">理论基础</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[#5a4a3a] leading-relaxed">
            <div>
              <h4 className="font-semibold text-[#4a3a2a] mb-1">节气与脊柱</h4>
              <p>
                二十四节气从冬至到大雪，对应人体从骶椎到颈椎的25块椎骨。
                每个节气对应一块椎骨，椎骨移位可引发特定身心失衡。
                中医认为人与天地相应，节气交替时脊柱最为敏感。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#4a3a2a] mb-1">颈胸配对</h4>
              <p>
                颈椎与胸椎存在配对关系：颈椎7对胸椎12（三焦经）、
                颈椎6对胸椎11（肾经）等。配对椎骨共用经络，
                颈椎代表正向品质（勇气、慈悲），胸椎对应潜在问题（恐惧、悲观）。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#4a3a2a] mb-1">情志与椎骨</h4>
              <p>
                每块椎骨都有对应的情志心理模式：骶椎关联失神状态，
                腰椎关联意志力和家庭关系，胸椎关联情绪压抑和人际模式，
                颈椎关联精神境界和沟通力。椎骨正位可改善对应情志。
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-[#4a3a2a] mb-1">综合疗愈</h4>
              <p>
                根据当前节气和对应椎骨，推荐五行音疗（角徵宫商羽）、
                六字诀呼吸法（嘘呵呼呬吹嘻）、经络穴位疏通、
                饮食调养等综合疗愈方案，顺应天时调养身心。
              </p>
            </div>
          </div>
        </div>

        {/* 快捷入口 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { href: '/healing/wuyin', label: '五音疗愈', icon: '🎵', color: WUXING_COLORS['木'] },
            { href: '/healing/liuzijue', label: '六字诀', icon: '🫁', color: WUXING_COLORS['火'] },
            { href: '/healing/diet', label: '节气饮食', icon: '🍚', color: WUXING_COLORS['土'] },
            { href: '/healing/grounding', label: '灸疗疏导', icon: '🔥', color: WUXING_COLORS['金'] },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl p-3 text-center bg-[#faf5ee] hover:bg-[#f0e8dc] transition-all group"
            >
              <div className="text-2xl mb-1 group-hover:scale-110 transition-transform">{item.icon}</div>
              <div className="text-xs font-medium" style={{ color: item.color }}>{item.label}</div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
