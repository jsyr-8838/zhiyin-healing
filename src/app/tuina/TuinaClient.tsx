'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore } from '@/lib/store';
import { cosUrl } from '@/lib/cos-url';
import { consolidateDiagnosis } from '@/lib/unified-diagnosis';
import {
  TUINA_CATEGORIES,
  CONSTITUTION_TUINA_MAP,
  recommendByConstitution,
  searchBySymptom,
  type TuinaTechnique,
  type TuinaCategory,
  type Difficulty,
} from '@/lib/tuina-data';
import { normalizeSymptom } from '@/lib/tcm-lifestyle-data';
import tuinaRaw from '@/lib/tuina-techniques.json';
import {
  ArrowLeft,
  Search,
  X,
  Heart,
  ChevronRight,
  BookOpen,
  AlertTriangle,
  Flame,
  Sparkles,
  Star,
  Filter,
  Eye,
  MapPin,
  Shield,
  User,
  Stethoscope,
  Activity,
} from 'lucide-react';

const TUINA_TECHNIQUES = tuinaRaw as TuinaTechnique[];

const DIFFICULTY_COLORS: Record<Difficulty, { bg: string; text: string; border: string }> = {
  '初级': { bg: 'rgba(34,197,94,0.1)', text: 'var(--wood)', border: 'rgba(34,197,94,0.3)' },
  '中级': { bg: 'rgba(249,115,22,0.1)', text: 'var(--earth)', border: 'rgba(249,115,22,0.3)' },
  '高级': { bg: 'rgba(239,68,68,0.1)', text: 'var(--fire)', border: 'rgba(239,68,68,0.3)' },
};

const CONSTITUTION_LABELS: Record<string, string> = {
  '阳虚质': '阳虚·畏寒', '阴虚质': '阴虚·内热', '气虚质': '气虚·乏力',
  '痰湿质': '痰湿·体胖', '湿热质': '湿热·油腻', '血瘀质': '血瘀·暗沉',
  '气郁质': '气郁·抑郁', '特禀质': '特禀·过敏', '平和质': '平和·健康',
};

const CATEGORY_ICONS: Record<string, string> = {
  '摆动类手法': '〰',
  '摩擦类手法': '🔄',
  '振动类手法': '📳',
  '挤压类手法': '✊',
  '叩击类手法': '🔨',
  '运动关节类手法': '🦴',
  '小儿推拿手法': '👶',
  '正骨整复手法': '⚕',
  '经络腧穴手法': '📍',
};

export default function TuinaClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { unifiedDiagnosis } = useAppStore();
  const consolidated = useMemo(() => consolidateDiagnosis(unifiedDiagnosis), [unifiedDiagnosis]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedTechnique, setSelectedTechnique] = useState<TuinaTechnique | null>(null);
  const [showConstitutionTab, setShowConstitutionTab] = useState(false);
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [imgErrors, setImgErrors] = useState<Set<number>>(new Set());

  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem('tuina_favs') || '[]'); } catch { return []; }
  });

  useEffect(() => {
    const constitutionParam = searchParams.get('constitution');
    if (constitutionParam) {
      setShowConstitutionTab(true);
    }
    const highlight = searchParams.get('highlight');
    if (highlight) {
      const found = TUINA_TECHNIQUES.find(t => t.n === highlight);
      if (found) setSelectedTechnique(found);
    }
  }, [searchParams]);

  const constitutionRecommendations = useMemo(() => {
    const c = consolidated.primaryConstitution;
    if (!c) return [];
    return recommendByConstitution(c, TUINA_TECHNIQUES, 8);
  }, [consolidated.primaryConstitution]);

  const constitutionRationale = useMemo(() => {
    const c = consolidated.primaryConstitution;
    if (!c) return '';
    const mapping = CONSTITUTION_TUINA_MAP[c];
    return mapping?.rationale || '';
  }, [consolidated.primaryConstitution]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: TUINA_TECHNIQUES.length };
    TUINA_CATEGORIES.forEach(cat => {
      counts[cat] = TUINA_TECHNIQUES.filter(t => t.c === cat).length;
    });
    return counts;
  }, []);

  const filteredTechniques = useMemo(() => {
    let list: TuinaTechnique[];
    if (searchQuery.trim()) {
      // 症状同义词扩展搜索
      const expandedTerms = normalizeSymptom(searchQuery.trim());
      const allTerms = [searchQuery.trim(), ...expandedTerms.filter(t => t !== searchQuery.trim())];
      const seen = new Set<number>();
      const merged: TuinaTechnique[] = [];
      for (const term of allTerms) {
        for (const t of searchBySymptom(term, TUINA_TECHNIQUES)) {
          if (!seen.has(t.id)) {
            seen.add(t.id);
            merged.push(t);
          }
        }
      }
      list = merged;
    } else if (showConstitutionTab && constitutionRecommendations.length > 0) {
      list = constitutionRecommendations;
    } else if (activeCategory === 'all') {
      list = TUINA_TECHNIQUES;
    } else {
      list = TUINA_TECHNIQUES.filter(t => t.c === activeCategory);
    }
    if (showFavsOnly) {
      list = list.filter(t => favorites.includes(String(t.id)));
    }
    return list;
  }, [searchQuery, activeCategory, showConstitutionTab, constitutionRecommendations, showFavsOnly, favorites]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => {
      const key = String(id);
      const next = prev.includes(key) ? prev.filter(x => x !== key) : [...prev, key];
      localStorage.setItem('tuina_favs', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleAcupointClick = useCallback((name: string) => {
    const clean = name.replace(/[(（].*?[)）]/g, '').trim();
    router.push(`/meridian?acupoint=${encodeURIComponent(clean)}`);
  }, [router]);

  const handleImgError = useCallback((id: number) => {
    setImgErrors(prev => new Set(prev).add(id));
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
            <h1 className="text-lg font-black tracking-wide" style={{ color: '#fff' }}>推拿手法</h1>
            <p className="text-[11px] mt-0.5" style={{ color: 'rgba(255,255,255,0.7)' }}>
              GB/T 22163-2008 国标与古典医籍
            </p>
          </div>
          <span className="text-[10px] bg-white/20 px-2.5 py-1 rounded-full" style={{ color: '#fff' }}>
            {TUINA_TECHNIQUES.length}法
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
              placeholder="搜索手法、病症、穴位..."
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
                  {consolidated.primaryConstitution} · 体质推荐手法
                </p>
                <p className="text-[10px] mt-0.5 truncate" style={{ color: 'var(--ink-light)' }}>
                  {constitutionRationale}
                </p>
              </div>
              <span
                className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-bold"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--fire)' }}
              >
                {constitutionRecommendations.length}法
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
          {TUINA_CATEGORIES.map(cat => (
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
            <Heart size={12} className={showFavsOnly ? 'fill-current' : ''} />
            收藏 {favorites.length}
          </button>
        </div>

        {/* ─── Stats Bar ─── */}
        <div className="flex items-center justify-between text-[11px]" style={{ color: 'var(--ink-light)' }}>
          <span>
            共 {filteredTechniques.length} 种手法
            {showConstitutionTab && consolidated.primaryConstitution && (
              <span style={{ color: 'var(--fire)' }}> · {consolidated.primaryConstitution}推荐</span>
            )}
          </span>
          <span>{TUINA_CATEGORIES.length} 大分类</span>
        </div>

        {/* ─── Technique Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredTechniques.map(tech => {
            const isFav = favorites.includes(String(tech.id));
            const diffStyle = DIFFICULTY_COLORS[tech.df as Difficulty] || DIFFICULTY_COLORS['初级'];
            const hasImgError = imgErrors.has(tech.id);

            return (
              <button
                key={tech.id}
                onClick={() => setSelectedTechnique(tech)}
                className="glass-card rounded-xl overflow-hidden text-left transition hover:shadow-lg"
                style={{ border: '1px solid rgba(0,0,0,0.06)' }}
              >
                {/* Image area */}
                <div className="relative w-full" style={{ height: '140px', background: 'var(--card-bg, #f9f6f0)' }}>
                  {!hasImgError ? (
                    <Image
                      src={cosUrl(tech.img)}
                      alt={tech.n}
                      fill
                      style={{ objectFit: 'contain' }}
                      sizes="(max-width: 640px) 100vw, 50vw"
                      onError={() => handleImgError(tech.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--ink-lighter)' }}>
                      <div className="text-center">
                        <Activity size={28} className="mx-auto mb-1" style={{ color: 'var(--fire)', opacity: 0.3 }} />
                        <p className="text-xs" style={{ color: 'var(--ink-lighter)' }}>{tech.n}</p>
                      </div>
                    </div>
                  )}
                  {/* Fav + Difficulty overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1.5">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: diffStyle.bg, color: diffStyle.text, border: `1px solid ${diffStyle.border}` }}
                    >
                      {tech.df}
                    </span>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); toggleFavorite(tech.id); }}
                    className="absolute top-2 left-2 p-1 rounded-full transition"
                    style={{ background: 'rgba(255,255,255,0.85)' }}
                  >
                    <Heart
                      size={14}
                      className={isFav ? 'fill-current' : ''}
                      style={{ color: isFav ? 'var(--fire)' : 'rgba(0,0,0,0.25)' }}
                    />
                  </button>
                </div>

                {/* Card body */}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold truncate" style={{ color: 'var(--ink-main)' }}>{tech.n}</h4>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{ background: 'rgba(139,69,19,0.08)', color: 'var(--earth)' }}
                    >
                      {tech.c.replace('手法', '')}
                    </span>
                  </div>
                  <p className="text-[11px] line-clamp-2 leading-relaxed mb-2" style={{ color: 'var(--ink-light)' }}>
                    {tech.d.slice(0, 60)}...
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {tech.ind.slice(0, 4).map((ind, i) => (
                      <span
                        key={i}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(239,68,68,0.06)', color: 'var(--fire)', border: '1px solid rgba(239,68,68,0.12)' }}
                      >
                        {ind}
                      </span>
                    ))}
                    {tech.ind.length > 4 && (
                      <span className="text-[10px] px-1 py-0.5" style={{ color: 'var(--ink-lighter)' }}>
                        +{tech.ind.length - 4}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty state */}
        {filteredTechniques.length === 0 && (
          <div className="text-center py-12">
            <BookOpen size={40} className="mx-auto mb-3" style={{ color: 'var(--ink-lighter)' }} />
            <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
              {showFavsOnly ? '暂无收藏手法' : '未找到匹配的手法'}
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

        {filteredTechniques.length > 30 && (
          <p className="text-center text-[11px] py-2" style={{ color: 'var(--ink-lighter)' }}>
            显示前30条，共{filteredTechniques.length}条
          </p>
        )}
      </div>

      {/* ─── Detail Modal ─── */}
      {selectedTechnique && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setSelectedTechnique(null)}
        >
          <div
            className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl"
            style={{ background: 'var(--card-bg, #fefcf7)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header Image */}
            <div className="relative w-full" style={{ height: '200px', background: 'rgba(139,69,19,0.06)' }}>
              {!imgErrors.has(selectedTechnique.id) ? (
                <Image
                  src={cosUrl(selectedTechnique.img)}
                  alt={selectedTechnique.n}
                  fill
                  style={{ objectFit: 'contain' }}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  onError={() => handleImgError(selectedTechnique.id)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center" style={{ color: 'var(--ink-lighter)' }}>
                  <div className="text-center">
                    <Activity size={40} className="mx-auto mb-2" style={{ color: 'var(--fire)', opacity: 0.4 }} />
                    <p className="text-sm" style={{ color: 'var(--ink-lighter)' }}>{selectedTechnique.n}</p>
                  </div>
                </div>
              )}

              {/* Close + Fav */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                <button
                  onClick={() => setSelectedTechnique(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <X size={16} style={{ color: 'var(--ink-main)' }} />
                </button>
                <button
                  onClick={() => toggleFavorite(selectedTechnique.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(255,255,255,0.9)' }}
                >
                  <Heart
                    size={16}
                    className={favorites.includes(String(selectedTechnique.id)) ? 'fill-current' : ''}
                    style={{ color: favorites.includes(String(selectedTechnique.id)) ? 'var(--fire)' : 'var(--ink-lighter)' }}
                  />
                </button>
              </div>

              {/* Gradient overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-16" style={{
                background: 'linear-gradient(transparent, var(--card-bg, #fefcf7))',
              }} />
            </div>

            {/* Modal Content */}
            <div className="px-5 pb-8 -mt-4 relative z-10 space-y-4">
              {/* Title + badges */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-black" style={{ color: 'var(--ink-main)' }}>{selectedTechnique.n}</h2>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(139,69,19,0.08)', color: 'var(--earth)' }}
                  >
                    {selectedTechnique.c}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                    style={{
                      background: DIFFICULTY_COLORS[selectedTechnique.df as Difficulty]?.bg || 'rgba(0,0,0,0.05)',
                      color: DIFFICULTY_COLORS[selectedTechnique.df as Difficulty]?.text || 'var(--ink-light)',
                    }}
                  >
                    {selectedTechnique.df}
                  </span>
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1"
                    style={{ background: 'rgba(59,130,246,0.06)', color: 'var(--water)', border: '1px solid rgba(59,130,246,0.15)' }}
                  >
                    <MapPin size={10} /> {selectedTechnique.bp}
                  </span>
                </div>
              </div>

              {/* 出处来源 */}
              <section>
                <SectionHeader icon={<BookOpen size={14} />} title="出处来源" />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-light)', fontStyle: 'italic' }}>
                  {selectedTechnique.s}
                </p>
              </section>

              {/* 操作方法 */}
              <section>
                <SectionHeader icon={<Activity size={14} />} title="操作方法" />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-main)' }}>
                  {selectedTechnique.d}
                </p>
              </section>

              {/* 操作要点 */}
              <section>
                <SectionHeader icon={<Star size={14} />} title="操作要点" />
                <div className="flex flex-wrap gap-1.5">
                  {selectedTechnique.k.map((point, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(34,197,94,0.08)',
                        color: 'var(--wood)',
                        border: '1px solid rgba(34,197,94,0.2)',
                      }}
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </section>

              {/* 主治病症 */}
              <section>
                <SectionHeader icon={<Stethoscope size={14} />} title="主治病症" />
                <div className="flex flex-wrap gap-1.5">
                  {selectedTechnique.ind.map((ind, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-1 rounded-full"
                      style={{
                        background: 'rgba(239,68,68,0.06)',
                        color: 'var(--fire)',
                        border: '1px solid rgba(239,68,68,0.15)',
                      }}
                    >
                      {ind}
                    </span>
                  ))}
                </div>
              </section>

              {/* 常用穴位 (clickable) */}
              <section>
                <SectionHeader icon={<MapPin size={14} />} title="常用穴位" />
                <div className="flex flex-wrap gap-1.5">
                  {selectedTechnique.ac.map((ac, i) => (
                    <button
                      key={i}
                      onClick={() => handleAcupointClick(ac)}
                      className="text-[11px] px-2.5 py-1 rounded-full transition hover:shadow-md"
                      style={{
                        background: 'rgba(59,130,246,0.06)',
                        color: 'var(--water)',
                        border: '1px solid rgba(59,130,246,0.2)',
                      }}
                    >
                      {ac}
                      <ChevronRight size={10} className="inline ml-0.5" />
                    </button>
                  ))}
                </div>
              </section>

              {/* 临床案例 */}
              {selectedTechnique.case && (
                <section>
                  <SectionHeader icon={<User size={14} />} title="临床案例" />
                  <div
                    className="rounded-xl p-3.5 space-y-2"
                    style={{ background: 'rgba(139,69,19,0.04)', border: '1px solid rgba(139,69,19,0.1)' }}
                  >
                    <div className="flex items-center gap-2">
                      <User size={12} style={{ color: 'var(--earth)' }} />
                      <span className="text-xs font-bold" style={{ color: 'var(--ink-main)' }}>{selectedTechnique.case.p}</span>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--earth)' }}>主诉</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-light)' }}>{selectedTechnique.case.sy}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--wood)' }}>治法</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-light)' }}>{selectedTechnique.case.t}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--fire)' }}>疗效</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-light)' }}>{selectedTechnique.case.o}</p>
                    </div>
                    {selectedTechnique.case.cs && (
                      <p className="text-[10px] pt-1" style={{ color: 'var(--ink-lighter)', fontStyle: 'italic' }}>
                        ——{selectedTechnique.case.cs}
                      </p>
                    )}
                  </div>
                </section>
              )}

              {/* 理论解析 */}
              {selectedTechnique.th && (
                <section>
                  <SectionHeader icon={<Sparkles size={14} />} title="理论解析" />
                  <blockquote
                    className="text-xs leading-relaxed pl-3 py-2 rounded-r-lg"
                    style={{
                      color: 'var(--ink-main)',
                      borderLeft: `3px solid var(--fire)`,
                      background: 'rgba(239,68,68,0.03)',
                    }}
                  >
                    {selectedTechnique.th}
                  </blockquote>
                </section>
              )}

              {/* 禁忌与注意事项 */}
              {(selectedTechnique.ci || selectedTechnique.pr) && (
                <section>
                  <SectionHeader icon={<AlertTriangle size={14} />} title="禁忌与注意事项" accentColor="var(--fire)" />
                  <div
                    className="rounded-xl p-3.5 space-y-2"
                    style={{
                      background: 'rgba(239,68,68,0.04)',
                      border: '1px solid rgba(239,68,68,0.15)',
                    }}
                  >
                    {selectedTechnique.ci && (
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={12} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--fire)' }} />
                        <div>
                          <p className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--fire)' }}>禁忌</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-light)' }}>{selectedTechnique.ci}</p>
                        </div>
                      </div>
                    )}
                    {selectedTechnique.pr && (
                      <div className="flex items-start gap-2">
                        <Shield size={12} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--earth)' }} />
                        <div>
                          <p className="text-[10px] font-bold mb-0.5" style={{ color: 'var(--earth)' }}>注意事项</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--ink-light)' }}>{selectedTechnique.pr}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Jump to 3D Meridian */}
              <Link
                href={`/meridian?acupoint=${encodeURIComponent(selectedTechnique.ac[0] || '')}`}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition hover:opacity-90 mt-2"
                style={{
                  background: 'linear-gradient(135deg, var(--fire), #8b4513)',
                  color: '#fff',
                }}
              >
                <MapPin size={16} /> 查看3D经络穴位
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
