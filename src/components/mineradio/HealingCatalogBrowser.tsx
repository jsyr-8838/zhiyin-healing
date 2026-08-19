'use client';

import { useState, useCallback, memo, useMemo } from 'react';
import {
  HEALING_MUSIC_CATALOG,
  getTracksForTone,
  INSTRUMENT_INFO,
  type HealingTrack,
  type InstrumentType,
} from '@/lib/healing-music-catalog';
import type { PlayerTrack } from '@/lib/mineradio/playlist';
import type { HealingTheme } from '@/lib/mineradio/weather-mood';
import { useWuxing300Audio, type Wuxing300Track } from '@/lib/wuxing300-audio';
import { cosUrl } from '@/lib/cos-url';
import {
  Music, Play, PlayCircle, ChevronDown, ChevronUp, RefreshCw,
} from 'lucide-react';

// ─── 五行筛选标签 ───
const ELEMENT_TABS = [
  { key: 'all', label: '全部', color: '#8a7a60' },
  { key: 'jiao', label: '角·木', color: '#27AE60' },
  { key: 'zhi', label: '徵·火', color: '#E74C3C' },
  { key: 'gong', label: '宫·土', color: '#F39C12' },
  { key: 'shang', label: '商·金', color: '#3498DB' },
  { key: 'yu', label: '羽·水', color: '#1ABC9C' },
] as const;

type ElementFilter = typeof ELEMENT_TABS[number]['key'];

// ─── 乐器筛选标签 ───
const INSTRUMENT_TABS: { key: InstrumentType | 'all'; label: string; icon: string }[] = [
  { key: 'all', label: '全部', icon: '♪' },
  { key: 'guqin', label: '古琴', icon: '琴' },
  { key: 'guzheng', label: '古筝', icon: '筝' },
  { key: 'erhu', label: '二胡', icon: '胡' },
  { key: 'pipa', label: '琵琶', icon: '琶' },
  { key: 'dizi', label: '笛子', icon: '笛' },
  { key: 'suona', label: '唢呐', icon: '呐' },
  { key: 'world', label: '世界', icon: '韵' },
];

// ─── 来源筛选 ───
type SourceFilter = 'all' | 'local' | 'wuxing300';
const SOURCE_TABS: { key: SourceFilter; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'local', label: '本地' },
  { key: 'wuxing300', label: '养生' },
];

/** 统一曲目接口，用于合并本地和外部曲目 */
interface UnifiedTrack {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  instrument: InstrumentType;
  element: 'jiao' | 'zhi' | 'gong' | 'shang' | 'yu';
  color: string;
  duration?: number;
  credit?: string;
  source: 'local' | 'wuxing300';
  sizeBytes?: number;
}

function localToUnified(t: HealingTrack): UnifiedTrack {
  return { ...t, source: 'local' };
}

function wuxing300ToUnified(t: Wuxing300Track): UnifiedTrack {
  return { ...t, source: 'wuxing300' };
}

interface HealingCatalogBrowserProps {
  onPlayTrack: (track: PlayerTrack) => void;
  onPlayAll: (tracks: PlayerTrack[]) => void;
  theme?: HealingTheme;
}

/** 将 UnifiedTrack 转为 PlayerTrack */
function unifiedToPlayerTrack(t: UnifiedTrack, index: number): PlayerTrack {
  return {
    uid: `${t.source}-${t.id}-${index}`,
    title: t.title,
    artist: INSTRUMENT_INFO[t.instrument]?.name ?? (t.source === 'wuxing300' ? '养生' : '传统'),
    coverUrl: '/images/modules/liaoyu.jpg',
    audioUrl: t.src,
    duration: t.duration ?? 300,
    mood: `catalog-${t.element}`,
    element: t.element === 'jiao' ? 'wood'
      : t.element === 'zhi' ? 'fire'
      : t.element === 'gong' ? 'earth'
      : t.element === 'shang' ? 'metal'
      : 'water',
  };
}

/**
 * 天籁 · 疗愈曲库
 * 展示本地 40+ 首扩展曲目 + 外部五行养生音源
 * 按五行/乐器/来源分类筛选，支持单曲播放与全部播放
 */
export default memo(function HealingCatalogBrowser({
  onPlayTrack,
  onPlayAll,
  theme,
}: HealingCatalogBrowserProps) {
  const [expanded, setExpanded] = useState(false);
  const [elementFilter, setElementFilter] = useState<ElementFilter>('all');
  const [instrumentFilter, setInstrumentFilter] = useState<InstrumentType | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  // 外部养生音源
  const { extendedTracks, loading: wuxingLoading, count: wuxingCount, refresh: wuxingRefresh } = useWuxing300Audio();

  // 本地曲目：只包含 /audio/healing/ 路径的扩展曲目
  // 注意：healing-music-catalog.ts 中的 src 已被 cosUrl() 包装，
  // 开发环境返回原始路径，生产环境返回完整 COS URL。
  // 因此用 cosUrl('/audio/healing/') 的返回值做 startsWith 检查，两端环境一致。
  const healingPrefix = cosUrl('/audio/healing/');
  const healingTracks = useMemo(
    () => HEALING_MUSIC_CATALOG.filter((t) => t.src.startsWith(healingPrefix)),
    [healingPrefix]
  );

  // 合并本地 + 外部曲目
  const allTracks = useMemo<UnifiedTrack[]>(() => {
    const local = healingTracks.map(localToUnified);
    const external = extendedTracks.map(wuxing300ToUnified);
    return [...local, ...external];
  }, [healingTracks, extendedTracks]);

  // 筛选
  const filteredTracks = useMemo(() => {
    return allTracks.filter((t) => {
      if (elementFilter !== 'all' && t.element !== elementFilter) return false;
      if (instrumentFilter !== 'all' && t.instrument !== instrumentFilter) return false;
      if (sourceFilter !== 'all' && t.source !== sourceFilter) return false;
      return true;
    });
  }, [allTracks, elementFilter, instrumentFilter, sourceFilter]);

  const handlePlayTrack = useCallback(
    (t: UnifiedTrack, index: number) => {
      onPlayTrack(unifiedToPlayerTrack(t, index));
    },
    [onPlayTrack],
  );

  const handlePlayAll = useCallback(() => {
    onPlayAll(filteredTracks.map(unifiedToPlayerTrack));
  }, [filteredTracks, onPlayAll]);

  const accentColor = theme?.accentColor ?? '#8a7a60';
  const localCount = healingTracks.length;

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'rgba(250, 245, 238, 0.92)',
        border: '1px solid #d0c8b8',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* ═══ 标题栏 ═══ */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#efe8d8] transition"
      >
        <div className="flex items-center gap-2">
          <Music size={16} style={{ color: accentColor }} />
          <span className="font-serif text-sm font-bold text-[#3a2a1a]">疗愈曲库</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#e8e0d0] text-[#6a5a40]">
            {localCount}首
          </span>
          {wuxingCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              +{wuxingCount}养生
            </span>
          )}
          {wuxingLoading && (
            <span className="text-[10px] text-amber-500 animate-pulse">加载中...</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {expanded && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePlayAll();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition hover:opacity-80"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              <PlayCircle size={12} />
              全部播放
            </button>
          )}
          {expanded ? (
            <ChevronUp size={16} className="text-[#8a7a60]" />
          ) : (
            <ChevronDown size={16} className="text-[#8a7a60]" />
          )}
        </div>
      </button>

      {/* ═══ 展开内容 ═══ */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* 五行筛选 */}
          <div className="flex gap-1.5 flex-wrap">
            {ELEMENT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setElementFilter(tab.key)}
                className="px-2.5 py-1 rounded-full text-[11px] font-medium transition"
                style={{
                  background:
                    elementFilter === tab.key
                      ? `${tab.color}20`
                      : 'transparent',
                  color:
                    elementFilter === tab.key ? tab.color : '#8a7a60',
                  border:
                    elementFilter === tab.key
                      ? `1px solid ${tab.color}40`
                      : '1px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 乐器筛选 */}
          <div className="flex gap-1.5 flex-wrap">
            {INSTRUMENT_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setInstrumentFilter(tab.key)}
                className="px-2 py-0.5 rounded-full text-[10px] transition"
                style={{
                  background:
                    instrumentFilter === tab.key
                      ? `${accentColor}15`
                      : 'transparent',
                  color:
                    instrumentFilter === tab.key ? accentColor : '#8a7a60',
                  border:
                    instrumentFilter === tab.key
                      ? `1px solid ${accentColor}30`
                      : '1px solid transparent',
                }}
              >
                <span className="mr-0.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* 来源筛选 */}
          <div className="flex gap-1.5 flex-wrap">
            {SOURCE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSourceFilter(tab.key)}
                className="px-2 py-0.5 rounded-full text-[10px] transition"
                style={{
                  background:
                    sourceFilter === tab.key
                      ? `${accentColor}15`
                      : 'transparent',
                  color:
                    sourceFilter === tab.key ? accentColor : '#8a7a60',
                  border:
                    sourceFilter === tab.key
                      ? `1px solid ${accentColor}30`
                      : '1px solid transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
            {/* 刷新外部曲目 */}
            {wuxingCount > 0 && (
              <button
                onClick={() => wuxingRefresh()}
                className="px-2 py-0.5 rounded-full text-[10px] transition text-emerald-600 hover:bg-emerald-50"
                title="刷新外部曲目"
              >
                <RefreshCw size={10} className="inline mr-0.5" />
                刷新
              </button>
            )}
          </div>

          {/* 曲目列表 */}
          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {filteredTracks.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-[#a09080] text-xs font-serif">
                  {wuxingLoading ? '正在加载外部曲目...' : '当前筛选无曲目'}
                </p>
                {!wuxingLoading && wuxingCount === 0 && sourceFilter !== 'local' && (
                  <p className="text-[10px] text-[#c0b8a0] mt-1">
                    外部养生音源未配置，请将音频放入 F:\heytcm-audio\
                  </p>
                )}
              </div>
            ) : (
              filteredTracks.map((t, idx) => {
                const instInfo = INSTRUMENT_INFO[t.instrument];
                const elTab = ELEMENT_TABS.find((e) => e.key === t.element);
                const elColor = elTab?.color ?? accentColor;
                const isWuxing = t.source === 'wuxing300';

                return (
                  <button
                    key={`${t.source}-${t.id}`}
                    onClick={() => handlePlayTrack(t, idx)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#efe8d8] transition text-left group"
                  >
                    {/* 五行色圆点 */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 relative"
                      style={{ background: elColor }}
                    >
                      {instInfo?.icon ?? '♪'}
                      {isWuxing && (
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-white" />
                      )}
                    </div>

                    {/* 曲目信息 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#3a2a1a] truncate">
                        {t.title}
                        {isWuxing && (
                          <span className="ml-1.5 px-1 py-0 rounded text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            养生
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] text-[#8a7a60] truncate">
                        {instInfo?.name ?? ''} · {t.subtitle}
                      </p>
                    </div>

                    {/* 播放图标 */}
                    <Play
                      size={14}
                      className="text-[#b0a080] opacity-0 group-hover:opacity-100 transition shrink-0"
                      style={{ color: elColor }}
                    />
                  </button>
                );
              })
            )}
          </div>

          {/* 底部统计 */}
          <div className="flex items-center justify-between pt-2 border-t border-[#e0d8c8]">
            <p className="text-[10px] text-[#a09080] font-serif">
              显示 {filteredTracks.length} / {allTracks.length} 首
              {wuxingCount > 0 && ` (本地${localCount} + 养生${wuxingCount})`}
            </p>
            <button
              onClick={handlePlayAll}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition hover:opacity-80"
              style={{ background: `${accentColor}20`, color: accentColor }}
            >
              <PlayCircle size={12} />
              播放所选
            </button>
          </div>
        </div>
      )}
    </div>
  );
});
