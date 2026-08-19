'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore } from '@/lib/store';
import { consolidateDiagnosis } from '@/lib/unified-diagnosis';
import {
  JIULIAO_PRESCRIPTIONS,
  PRESCRIPTION_CATEGORIES,
  CONSTITUTION_PRESCRIPTIONS,
  searchPrescriptions,
  getPrescriptionsByCategory,
  getPrescriptionsForConstitution,
  type JiuliaoPrescription,
  type ConstitutionKey,
} from '@/lib/jiuliao-data';
import { normalizeSymptom } from '@/lib/tcm-lifestyle-data';
import { ArrowLeft, Search, Star, Flame, ChevronRight, Sparkles, X } from 'lucide-react';

const CONSTITUTION_LABELS: Record<string, string> = {
  '阳虚质': '阳虚·畏寒', '阴虚质': '阴虚·内热', '气虚质': '气虚·乏力',
  '痰湿质': '痰湿·体胖', '湿热质': '湿热·油腻', '血瘀质': '血瘀·暗沉',
  '气郁质': '气郁·抑郁', '特禀质': '特禀·过敏', '平和质': '平和·健康',
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '感冒':     { bg: 'rgba(239,68,68,0.08)',   text: 'var(--fire)',  border: 'rgba(239,68,68,0.2)' },
  '咳嗽':     { bg: 'rgba(59,130,246,0.08)',   text: 'var(--water)', border: 'rgba(59,130,246,0.2)' },
  '哮喘':     { bg: 'rgba(59,130,246,0.08)',   text: 'var(--water)', border: 'rgba(59,130,246,0.2)' },
  '肺痨':     { bg: 'rgba(59,130,246,0.08)',   text: 'var(--water)', border: 'rgba(59,130,246,0.2)' },
  '鼻病':     { bg: 'rgba(201,169,79,0.08)',   text: 'var(--earth)', border: 'rgba(201,169,79,0.2)' },
  '心系':     { bg: 'rgba(239,68,68,0.08)',   text: 'var(--fire)',  border: 'rgba(239,68,68,0.2)' },
  '脾胃':     { bg: 'rgba(201,169,79,0.08)',   text: 'var(--earth)', border: 'rgba(201,169,79,0.2)' },
  '肝胆':     { bg: 'rgba(34,197,94,0.08)',    text: 'var(--wood)',  border: 'rgba(34,197,94,0.2)' },
  '肾系':     { bg: 'rgba(61,122,117,0.08)',   text: 'var(--water)', border: 'rgba(61,122,117,0.2)' },
  '气血津液': { bg: 'rgba(239,68,68,0.08)',   text: 'var(--fire)',  border: 'rgba(239,68,68,0.2)' },
  '外科':     { bg: 'rgba(201,169,79,0.08)',   text: 'var(--earth)', border: 'rgba(201,169,79,0.2)' },
  '皮肤':     { bg: 'rgba(201,169,79,0.08)',   text: 'var(--earth)', border: 'rgba(201,169,79,0.2)' },
  '筋骨':     { bg: 'rgba(91,160,154,0.08)',   text: 'var(--metal)', border: 'rgba(91,160,154,0.2)' },
  '妇科':     { bg: 'rgba(239,68,68,0.08)',   text: 'var(--fire)',  border: 'rgba(239,68,68,0.2)' },
  '儿科':     { bg: 'rgba(34,197,94,0.08)',    text: 'var(--wood)',  border: 'rgba(34,197,94,0.2)' },
  '五官科':   { bg: 'rgba(91,160,154,0.08)',   text: 'var(--metal)', border: 'rgba(91,160,154,0.2)' },
  '急症':     { bg: 'rgba(239,68,68,0.08)',   text: 'var(--fire)',  border: 'rgba(239,68,68,0.2)' },
  '亚健康':   { bg: 'rgba(34,197,94,0.08)',    text: 'var(--wood)',  border: 'rgba(34,197,94,0.2)' },
  '疑难杂症': { bg: 'rgba(61,122,117,0.08)',   text: 'var(--water)', border: 'rgba(61,122,117,0.2)' },
  '特殊灸法': { bg: 'rgba(91,160,154,0.08)',   text: 'var(--metal)', border: 'rgba(91,160,154,0.2)' },
};

const DEFAULT_CAT_COLOR = { bg: 'rgba(0,0,0,0.05)', text: 'var(--ink-light)', border: 'rgba(0,0,0,0.1)' };

export default function JiuliaoClient() {
  const searchParams = useSearchParams();
  const { unifiedDiagnosis } = useAppStore();
  const consolidated = useMemo(() => consolidateDiagnosis(unifiedDiagnosis), [unifiedDiagnosis]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedPrescription, setSelectedPrescription] = useState<JiuliaoPrescription | null>(null);
  const [showConstitutionTab, setShowConstitutionTab] = useState(false);
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('jiuliao_favs') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const constitutionParam = searchParams.get('constitution');
    if (constitutionParam) {
      setShowConstitutionTab(true);
    }
    const highlight = searchParams.get('highlight');
    if (highlight) {
      const found = JIULIAO_PRESCRIPTIONS.find(p => String(p.id) === highlight || p.name === highlight);
      if (found) setSelectedPrescription(found);
    }
  }, [searchParams]);

  const constitutionRecommendations = useMemo(() => {
    const c = consolidated.primaryConstitution as ConstitutionKey | undefined;
    if (!c || !CONSTITUTION_PRESCRIPTIONS[c]) return [];
    return getPrescriptionsForConstitution(c);
  }, [consolidated.primaryConstitution]);

  const constitutionRationale = useMemo(() => {
    const c = consolidated.primaryConstitution as ConstitutionKey | undefined;
    if (!c) return '';
    return CONSTITUTION_PRESCRIPTIONS[c]?.rationale || '';
  }, [consolidated.primaryConstitution]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: JIULIAO_PRESCRIPTIONS.length };
    PRESCRIPTION_CATEGORIES.forEach(cat => {
      counts[cat] = JIULIAO_PRESCRIPTIONS.filter(p => p.category === cat).length;
    });
    return counts;
  }, []);

  const filteredPrescriptions = useMemo(() => {
    let list: JiuliaoPrescription[];
    if (searchQuery.trim()) {
      const expandedTerms = normalizeSymptom(searchQuery.trim());
      const allTerms = [searchQuery.trim(), ...expandedTerms.filter(t => t !== searchQuery.trim())];
      const seen = new Set<number>();
      const merged: JiuliaoPrescription[] = [];
      for (const term of allTerms) {
        for (const p of searchPrescriptions(term)) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            merged.push(p);
          }
        }
      }
      list = merged;
    } else if (showConstitutionTab && constitutionRecommendations.length > 0) {
      list = constitutionRecommendations;
    } else if (activeCategory === 'all') {
      list = JIULIAO_PRESCRIPTIONS;
    } else {
      list = getPrescriptionsByCategory(activeCategory);
    }
    if (showFavsOnly) {
      list = list.filter(p => favorites.includes(String(p.id)));
    }
    return list;
  }, [searchQuery, activeCategory, showConstitutionTab, constitutionRecommendations, showFavsOnly, favorites]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const key = String(id);
      const next = prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key];
      localStorage.setItem('jiuliao_favs', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleAcupointClick = useCallback((name: string) => {
    const clean = name.replace(/[(（].*?[)）]/g, '').trim();
    window.location.href = `/meridian?acupoint=${encodeURIComponent(clean)}`;
  }, []);

  return (
    <PageContainer theme="healing" className="pattern-meridian pb-24">
      {/* ─── Header ─── */}
      <div
        className="px-5 pt-12 pb-5 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, var(--fire), #8b4513)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }} />
        <div className="flex items-center gap-3 relative z-10">
          <Link href="/healing" className="text-white/70 hover:text-white transition">
            <ArrowLeft size={22} />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-black tracking-wide" style={{ color: '#fff' }}>灸疗处方</h1>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              329方 · 古籍传承与临床经验
            </p>
          </div>
          <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full" style={{ color: '#fff' }}>
            {JIULIAO_PRESCRIPTIONS.length}方
          </span>
        </div>

        {/* Search */}
        <div className="mt-3 relative z-10">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.5)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowConstitutionTab(false); setShowFavsOnly(false); }}
              placeholder="搜索处方、病症、穴位..."
              className="w-full rounded-full pl-9 pr-9 py-2.5 text-sm placeholder-white/40 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
                <X size={14} style={{ color: 'rgba(255,255,255,0.6)' }} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-3">
        {/* ─── Constitution Recommendation Banner ─── */}
        {consolidated.completedModules.length > 0 && consolidated.primaryConstitution && (
          <button
            onClick={() => {
              setShowConstitutionTab(!showConstitutionTab);
              setActiveCategory('all');
              setSearchQuery('');
              setShowFavsOnly(false);
            }}
            className="glass-card w-full rounded-xl p-3 text-left transition"
            style={{
              border: showConstitutionTab ? '1.5px solid var(--fire)' : '1px solid rgba(139,69,19,0.15)',
              background: showConstitutionTab ? 'rgba(239,68,68,0.06)' : 'var(--card-bg, #fff)',
            }}
          >
            <div className="flex items-center gap-2">
              <Flame size={18} style={{ color: 'var(--fire)' }} className="flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: 'var(--ink-main)' }}>
                  {consolidated.primaryConstitution} · 体质推荐灸方
                </p>
                <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--ink-light)' }}>
                  {constitutionRationale}
                </p>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--fire)' }}
              >
                {constitutionRecommendations.length}方
              </span>
            </div>
          </button>
        )}

        {/* ─── Category Tabs ─── */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => { setActiveCategory('all'); setShowConstitutionTab(false); setSearchQuery(''); setShowFavsOnly(false); }}
            className="px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0 transition"
            style={{
              background: activeCategory === 'all' && !showConstitutionTab && !showFavsOnly ? 'var(--fire)' : 'var(--card-bg, #fff)',
              color: activeCategory === 'all' && !showConstitutionTab && !showFavsOnly ? '#fff' : 'var(--ink-light)',
              border: activeCategory === 'all' && !showConstitutionTab && !showFavsOnly ? '1px solid var(--fire)' : '1px solid rgba(0,0,0,0.08)',
            }}
          >
            全部 {categoryCounts.all}
          </button>
          {PRESCRIPTION_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setShowConstitutionTab(false); setSearchQuery(''); setShowFavsOnly(false); }}
              className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 transition"
              style={{
                background: activeCategory === cat && !showConstitutionTab ? 'var(--fire)' : 'var(--card-bg, #fff)',
                color: activeCategory === cat && !showConstitutionTab ? '#fff' : 'var(--ink-light)',
                border: activeCategory === cat && !showConstitutionTab ? '1px solid var(--fire)' : '1px solid rgba(0,0,0,0.08)',
                fontWeight: activeCategory === cat && !showConstitutionTab ? 700 : 400,
              }}
            >
              {cat} {categoryCounts[cat] || 0}
            </button>
          ))}
          <button
            onClick={() => { setShowFavsOnly(!showFavsOnly); setActiveCategory('all'); setShowConstitutionTab(false); setSearchQuery(''); }}
            className="px-3 py-1.5 rounded-full text-xs whitespace-nowrap flex-shrink-0 transition flex items-center gap-1"
            style={{
              background: showFavsOnly ? 'var(--fire)' : 'var(--card-bg, #fff)',
              color: showFavsOnly ? '#fff' : 'var(--ink-light)',
              border: showFavsOnly ? '1px solid var(--fire)' : '1px solid rgba(0,0,0,0.08)',
              fontWeight: showFavsOnly ? 700 : 400,
            }}
          >
            <Star size={12} className={showFavsOnly ? 'fill-current' : ''} />
            收藏 {favorites.length}
          </button>
        </div>

        {/* ─── Stats Bar ─── */}
        <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--ink-light)' }}>
          <span>
            共 {filteredPrescriptions.length} 个灸方
            {showConstitutionTab && consolidated.primaryConstitution && (
              <span style={{ color: 'var(--fire)' }}> · {consolidated.primaryConstitution}推荐</span>
            )}
          </span>
          <span>{PRESCRIPTION_CATEGORIES.length} 大分类</span>
        </div>

        {/* ─── Prescription List ─── */}
        <div className="space-y-2.5">
          {filteredPrescriptions.slice(0, 30).map(prescription => {
            const isFav = favorites.includes(String(prescription.id));
            const catColor = CATEGORY_COLORS[prescription.category] || DEFAULT_CAT_COLOR;
            const isConstitutionRecommended = showConstitutionTab && consolidated.primaryConstitution
              ? CONSTITUTION_PRESCRIPTIONS[consolidated.primaryConstitution as ConstitutionKey]?.recommendedIds.includes(prescription.id)
              : false;

            return (
              <button
                key={prescription.id}
                onClick={() => setSelectedPrescription(prescription)}
                className="glass-card w-full rounded-xl p-3.5 text-left transition hover:shadow-lg"
                style={{ border: '1px solid rgba(0,0,0,0.06)' }}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: catColor.bg }}
                  >
                    <Flame size={18} style={{ color: catColor.text }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold truncate" style={{ color: 'var(--ink-main)' }}>
                        {prescription.name}
                      </h4>
                      {isConstitutionRecommended && (
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0 font-bold"
                          style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--fire)' }}
                        >
                          荐
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <span
                        className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ background: catColor.bg, color: catColor.text, border: `1px solid ${catColor.border}` }}
                      >
                        {prescription.category}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.06)', color: 'var(--wood)', border: '1px solid rgba(34,197,94,0.15)' }}>
                        {prescription.points.length}穴
                      </span>
                    </div>
                    <p className="text-[11px] line-clamp-2 leading-relaxed" style={{ color: 'var(--ink-light)' }}>
                      {prescription.indication}
                    </p>
                    {/* Acupoint tags */}
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prescription.points.slice(0, 5).map((pt, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-1.5 py-0.5 rounded"
                          style={{ background: 'rgba(59,130,246,0.06)', color: 'var(--water)', border: '1px solid rgba(59,130,246,0.15)' }}
                        >
                          {pt}
                        </span>
                      ))}
                      {prescription.points.length > 5 && (
                        <span className="text-[10px] px-1 py-0.5" style={{ color: 'var(--ink-lighter)' }}>
                          +{prescription.points.length - 5}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Fav + Arrow */}
                  <div className="flex flex-col items-center gap-2 flex-shrink-0">
                    <button
                      onClick={e => { e.stopPropagation(); toggleFavorite(prescription.id); }}
                      className="p-1 rounded-full transition"
                    >
                      <Star
                        size={16}
                        className={isFav ? 'fill-current' : ''}
                        style={{ color: isFav ? 'var(--earth)' : 'rgba(0,0,0,0.2)' }}
                      />
                    </button>
                    <ChevronRight size={14} style={{ color: 'var(--ink-lighter)' }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredPrescriptions.length === 0 && (
          <div className="text-center py-12">
            <Flame size={40} className="mx-auto mb-3" style={{ color: 'var(--ink-lighter)' }} />
            <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
              {showFavsOnly ? '暂无收藏灸方' : '未找到匹配的灸方'}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); setShowConstitutionTab(false); setShowFavsOnly(false); }}
              className="text-sm mt-2 hover:underline"
              style={{ color: 'var(--fire)' }}
            >
              清除筛选
            </button>
          </div>
        )}

        {filteredPrescriptions.length > 30 && (
          <p className="text-center text-[11px] py-2" style={{ color: 'var(--ink-lighter)' }}>
            显示前30条，共{filteredPrescriptions.length}条
          </p>
        )}
      </div>

      {/* ─── Detail Modal ─── */}
      {selectedPrescription && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedPrescription(null)}
        >
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl"
            style={{ background: 'var(--card-bg, #fefcf7)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="relative px-5 pt-5 pb-4" style={{ background: 'linear-gradient(145deg, var(--fire), #8b4513)' }}>
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setSelectedPrescription(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <X size={16} style={{ color: 'var(--ink-main)' }} />
                </button>
                <button
                  onClick={() => toggleFavorite(selectedPrescription.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <Star
                    size={16}
                    className={favorites.includes(String(selectedPrescription.id)) ? 'fill-current' : ''}
                    style={{ color: favorites.includes(String(selectedPrescription.id)) ? 'var(--earth)' : 'var(--ink-lighter)' }}
                  />
                </button>
              </div>
              <h2 className="text-xl font-black text-white">{selectedPrescription.name}</h2>
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.2)', color: '#fff' }}
                >
                  {selectedPrescription.category}
                </span>
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.9)' }}
                >
                  {selectedPrescription.standard}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-5 pb-8 space-y-4 pt-4">
              {/* 主治 */}
              <section>
                <SectionHeader icon={<Flame size={14} />} title="主治" />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-light)' }}>
                  {selectedPrescription.indication}
                </p>
              </section>

              {/* 辨证释义 */}
              {selectedPrescription.fullText && (
                <section>
                  <SectionHeader icon={<Sparkles size={14} />} title="辨证释义" />
                  <blockquote
                    className="text-xs leading-relaxed pl-3 py-2 rounded-r-lg"
                    style={{
                      color: 'var(--ink-main)',
                      borderLeft: '3px solid var(--fire)',
                      background: 'rgba(239,68,68,0.03)',
                    }}
                  >
                    {selectedPrescription.fullText}
                  </blockquote>
                </section>
              )}

              {/* 灸疗穴位 */}
              <section>
                <SectionHeader icon={<Star size={14} />} title="灸疗穴位" />
                <div className="flex flex-wrap gap-1.5">
                  {selectedPrescription.points.map((pt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAcupointClick(pt)}
                      className="text-[11px] px-2.5 py-1 rounded-full transition hover:shadow-md"
                      style={{
                        background: 'rgba(59,130,246,0.06)',
                        color: 'var(--water)',
                        border: '1px solid rgba(59,130,246,0.2)',
                      }}
                    >
                      {pt}
                      <ChevronRight size={10} className="inline ml-0.5" />
                    </button>
                  ))}
                </div>
              </section>

              {/* 操作方法 */}
              <section>
                <SectionHeader icon={<Flame size={14} />} title="操作方法" />
                <div
                  className="rounded-xl p-3.5"
                  style={{ background: 'rgba(139,69,19,0.04)', border: '1px solid rgba(139,69,19,0.1)' }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-main)' }}>
                    {selectedPrescription.method}
                  </p>
                </div>
              </section>

              {/* 古籍引用 */}
              {selectedPrescription.classicRef && (
                <section>
                  <SectionHeader icon={<Sparkles size={14} />} title="古籍引用" accentColor="var(--earth)" />
                  <blockquote
                    className="text-xs leading-relaxed pl-3 py-2 rounded-r-lg"
                    style={{
                      color: 'var(--ink-light)',
                      borderLeft: '3px solid var(--earth)',
                      background: 'rgba(201,169,79,0.04)',
                      fontStyle: 'italic',
                    }}
                  >
                    {selectedPrescription.classicRef}
                  </blockquote>
                </section>
              )}

              {/* 临床案例 */}
              {selectedPrescription.clinicalCase && (
                <section>
                  <SectionHeader icon={<Star size={14} />} title="临床案例" />
                  <div
                    className="rounded-xl p-3.5"
                    style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-light)' }}>
                      {selectedPrescription.clinicalCase}
                    </p>
                  </div>
                </section>
              )}

              {/* 临证心得 */}
              {selectedPrescription.experience && (
                <section>
                  <SectionHeader icon={<Sparkles size={14} />} title="临证心得" accentColor="var(--wood)" />
                  <div
                    className="rounded-xl p-3.5"
                    style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}
                  >
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-main)' }}>
                      {selectedPrescription.experience}
                    </p>
                  </div>
                </section>
              )}

              {/* Jump to 3D Meridian */}
              <Link
                href={`/meridian?acupoint=${encodeURIComponent(selectedPrescription.points[0] || '')}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition hover:opacity-90 mt-2"
                style={{
                  background: 'linear-gradient(135deg, var(--fire), #8b4513)',
                  color: '#fff',
                }}
              >
                查看3D经络穴位
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </PageContainer>
  );
}

function SectionHeader({ icon, title, accentColor }: { icon: React.ReactNode; title: string; accentColor?: string }) {
  return (
    <div className="flex items-center gap-1.5 mb-1.5">
      <span style={{ color: accentColor || 'var(--fire)' }}>{icon}</span>
      <h5 className="text-xs font-bold" style={{ color: accentColor || 'var(--ink-main)' }}>{title}</h5>
    </div>
  );
}
