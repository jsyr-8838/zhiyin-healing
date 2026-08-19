'use client';

import { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getTcmAcupoints,
  getTcmMeridians,
  getTcmPointByCode,
  searchTcmAcupoints,
  type TcmAcupoint,
  type TcmMeridian,
} from '@/lib/tcm-acupoint-data';
import { XWS_VIDEO_ACUPOINTS } from '@/lib/xws-video-names';
import { ACUPOINT_LOCATION_IMAGES } from '@/lib/acupoint-image-names';
import { WUXING_COLORS_DISPLAY } from '@/components/meridian/constants';
import { TcmBodyModel } from '@/components/meridian/TcmBodyModel';
import { cosUrl } from '@/lib/cos-url';
import { MeridianTopBar } from '@/components/meridian/MeridianTopBar';
import { MeridianBottomBar } from '@/components/meridian/MeridianBottomBar';
import { WuYunLiuQiModal } from '@/components/meridian/WuYunLiuQiModal';
import {
  SHI_CHEN_MAP,
  getCurrentShiChen,
  computeWuYunLiuQi,
  type WuYunLiuQi,
  type WuxingElement,
} from '@/lib/tcm-calendar';

// ============================================================
// TCM版穴位详情面板（含倪师注释+视频联动）
// ============================================================

interface TcmAcupointDetailProps {
  point: TcmAcupoint | null;
  meridian: TcmMeridian | null;
  infoPanelOpen: boolean;
  onClose: () => void;
  onToggleMeridian: (code: string) => void;
  onVideoPlayState: (playing: boolean) => void;
  onFocusIn3D: () => void;
}

function TcmAcupointDetail({ point, meridian, infoPanelOpen, onClose, onToggleMeridian, onVideoPlayState, onFocusIn3D }: TcmAcupointDetailProps) {
  if (!point || !meridian) return null;

  const hasVideo = XWS_VIDEO_ACUPOINTS.has(point.name) || XWS_VIDEO_ACUPOINTS.has(point.name + '穴');
  const wuxingColor = WUXING_COLORS_DISPLAY[meridian.wuxing as keyof typeof WUXING_COLORS_DISPLAY] || meridian.color;

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 z-50 w-[380px] max-w-[85vw] bg-black/80 backdrop-blur-xl border-l border-white/10
        transform transition-transform duration-300 overflow-y-auto
        ${infoPanelOpen ? 'translate-x-0' : 'translate-x-full'} md:translate-x-0 md:top-12 md:bottom-20 md:rounded-l-2xl md:border md:h-auto
        ${point ? 'md:translate-x-0' : 'md:translate-x-full'}`}
    >
      <div className="p-5">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white text-sm"
        >
          ✕
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded-full" style={{ backgroundColor: wuxingColor }} />
            <h3 className="text-2xl font-bold text-white">{point.name}</h3>
            <span className="text-sm text-zinc-400 font-mono">{point.code}</span>
            {point.meridian === 'DONG' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 font-bold border border-purple-500/40">
                董氏奇穴
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-zinc-300">{meridian.nameZh}</span>
            <span className="text-xs text-zinc-500">·</span>
            <span className="text-xs" style={{ color: wuxingColor }}>{meridian.wuxing}行</span>
          </div>
        </div>

        <div className="space-y-3">
          {/* 定位 */}
          {point.location && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">定位</div>
              <div className="text-sm text-white leading-relaxed">{point.location}</div>
            </div>
          )}

          {/* 主治 */}
          {point.indications && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">主治</div>
              <div className="flex flex-wrap gap-1.5">
                {point.indications.split(/[，,、]/).filter(Boolean).map((ind, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs bg-white/8 text-zinc-200 border border-white/10">
                    {ind.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 针刺方法 */}
          {point.needlingMethod && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">针刺方法</div>
              <p className="text-sm text-emerald-200/90 leading-relaxed">{point.needlingMethod}</p>
            </div>
          )}

          {/* 禁忌 */}
          {point.contraindications && (
            <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <div className="text-[10px] text-red-400 uppercase tracking-wider mb-1.5">禁忌</div>
              <p className="text-sm text-red-200/90 leading-relaxed">{point.contraindications}</p>
            </div>
          )}

          {/* 倪师注释（品牌差异化核心） */}
          {point.niComment && (
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <div className="text-[10px] text-amber-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span className="inline-block w-4 h-4 rounded bg-amber-500/30 text-amber-300 text-center text-[8px] leading-4 font-bold">倪</span>
                倪师注释
              </div>
              <p className="text-sm text-amber-100/90 leading-relaxed">{point.niComment}</p>
            </div>
          )}

          {/* 定位图 */}
          {ACUPOINT_LOCATION_IMAGES.has(point.name) && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span className="text-emerald-400">◉</span> 穴位定位图
                <span className="text-[9px] text-zinc-600 ml-1 cursor-pointer hover:text-emerald-400 transition-colors" onClick={onFocusIn3D}>· 点击查看3D →</span>
              </div>
              <img
                src={cosUrl(`/assets/acupoint/images/${encodeURIComponent(point.name)}.jpg`)}
                alt={`${point.name}穴位定位图`}
                className="w-full rounded-lg cursor-pointer hover:brightness-110 hover:ring-2 hover:ring-emerald-400/40 transition-all"
                loading="lazy"
                onClick={onFocusIn3D}
              />
            </div>
          )}

          {/* 穴位视频 */}
          {hasVideo && (
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <span className="text-emerald-400">▶</span> 穴位定位视频
                <span className="text-[9px] text-zinc-600 ml-1">· 播放时3D模型同步脉动</span>
              </div>
              <video
                src={cosUrl(`/videos/acupoints/${encodeURIComponent(point.name + '穴')}.mp4`)}
                controls
                preload="metadata"
                playsInline
                className="w-full rounded-lg bg-black/20"
                style={{ maxHeight: '35vh' }}
                onPlay={() => onVideoPlayState(true)}
                onPause={() => onVideoPlayState(false)}
                onEnded={() => onVideoPlayState(false)}
                onError={(e) => { (e.target as HTMLVideoElement).parentElement!.style.display = 'none'; }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// 经络侧边栏（TCM版）
// ============================================================

interface TcmMeridianSidebarProps {
  open: boolean;
  selectedMeridians: Set<string>;
  selectedPoint: TcmAcupoint | null;
  wuxingFilter: Set<WuxingElement>;
  searchQuery: string;
  searchResults: TcmAcupoint[];
  showSearchDropdown: boolean;
  currentShiChen: number;
  filteredMeridians: TcmMeridian[];
  onToggleMeridian: (code: string) => void;
  onSearch: (q: string) => void;
  onClearSearch: () => void;
  onShowSearchDropdown: (v: boolean) => void;
  onWuxingFilterChange: (f: Set<WuxingElement>) => void;
  onPointSelect: (point: TcmAcupoint, meridian: TcmMeridian) => void;
}

function TcmMeridianSidebar({
  open, selectedMeridians, searchQuery, searchResults, showSearchDropdown,
  currentShiChen, filteredMeridians, wuxingFilter, selectedPoint,
  onToggleMeridian, onSearch, onClearSearch, onPointSelect,
}: TcmMeridianSidebarProps) {
  const shiChenInfo = SHI_CHEN_MAP[currentShiChen];

  return (
    <div className={`fixed left-0 top-12 bottom-20 z-50 w-[280px] max-w-[80vw] bg-black/70 backdrop-blur-xl border-r border-white/10 overflow-y-auto transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-3">
        {/* 搜索框 */}
        <div className="relative mb-3">
          <input
            type="text"
            placeholder="搜索穴位（571穴）..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-white/10 rounded-lg text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
          />
          {searchQuery && (
            <button onClick={onClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-xs">✕</button>
          )}
        </div>

        {/* 搜索结果 */}
        {showSearchDropdown && searchResults.length > 0 && (
          <div className="mb-3 max-h-60 overflow-y-auto rounded-lg bg-white/5 border border-white/10">
            {searchResults.slice(0, 20).map(p => {
              const m = filteredMeridians.find(m => m.code === p.meridian);
              return (
                <button
                  key={p.code}
                  onClick={() => { if (m) onPointSelect(p, m); }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m?.color || '#888' }} />
                  <span className="text-xs text-white font-medium">{p.name}</span>
                  <span className="text-[10px] text-zinc-500">{p.code}</span>
                  {p.niComment && <span className="text-[9px] text-amber-400 font-bold">倪</span>}
                </button>
              );
            })}
          </div>
        )}

        {/* 经脉列表 */}
        <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">经脉（15条）</div>
        {filteredMeridians.map(m => (
          <button
            key={m.code}
            onClick={() => onToggleMeridian(m.code)}
            className={`w-full px-3 py-2 mb-1 flex items-center gap-2 rounded-lg text-left transition-all ${
              selectedMeridians.has(m.code) ? 'bg-white/15' : 'hover:bg-white/5'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: m.color }} />
            <span className="text-xs text-white flex-1">{m.nameZh}</span>
            <span className="text-[10px] text-zinc-500">{m.acupoints.length}穴</span>
            {m.code === 'DONG' && (
              <span className="text-[9px] px-1 rounded bg-purple-500/30 text-purple-300">董氏</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

// ============================================================
// 主页面
// ============================================================

function MeridianPageContent() {
  const searchParams = useSearchParams();
  const focusCode = searchParams.get('focus');

  const [selectedMeridians, setSelectedMeridians] = useState<Set<string>>(new Set());
  const [selectedPoint, setSelectedPoint] = useState<TcmAcupoint | null>(null);
  const [selectedPointMeridian, setSelectedPointMeridian] = useState<TcmMeridian | null>(null);
  const [wuxingFilter, setWuxingFilter] = useState<Set<WuxingElement>>(new Set());
  const [showWuYunLiuQi, setShowWuYunLiuQi] = useState(false);
  const [currentShiChen, setCurrentShiChen] = useState(getCurrentShiChen());
  const [wylqYear, setWylqYear] = useState(new Date().getFullYear());
  const [wylqData, setWylqData] = useState<WuYunLiuQi>(computeWuYunLiuQi(new Date().getFullYear()));
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [infoPanelOpen, setInfoPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<TcmAcupoint[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [videoPlayingCode, setVideoPlayingCode] = useState<string | null>(null);
  const [focusTrigger, setFocusTrigger] = useState(0);

  const meridians = useMemo(() => getTcmMeridians(), []);

  const toggleMeridian = useCallback((code: string) => {
    setSelectedMeridians(prev => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }
    const results = searchTcmAcupoints(query);
    setSearchResults(results);
    setShowSearchDropdown(results.length > 0);
  }, []);

  const handlePointSelect = useCallback((point: TcmAcupoint, meridian: TcmMeridian) => {
    setSelectedMeridians(new Set([meridian.code]));
    setSelectedPoint(point);
    setSelectedPointMeridian(meridian);
    setVideoPlayingCode(null);  // 切换穴位时重置视频状态
    setShowSearchDropdown(false);
    setSearchQuery(point.name);
    if (window.innerWidth <= 768) setInfoPanelOpen(true);
    if (window.innerWidth <= 768) setSidebarOpen(false);
  }, []);

  const handleCanvasPointClick = useCallback((point: TcmAcupoint, meridian: TcmMeridian) => {
    setSelectedPoint(point);
    setSelectedPointMeridian(meridian);
    setVideoPlayingCode(null);  // 切换穴位时重置视频状态
    setSelectedMeridians(prev => {
      if (prev.has(meridian.code)) return prev;
      const next = new Set(prev);
      next.add(meridian.code);
      return next;
    });
    if (window.innerWidth <= 768) setInfoPanelOpen(true);
  }, []);

  useEffect(() => {
    setCurrentShiChen(getCurrentShiChen());
    const timer = setInterval(() => setCurrentShiChen(getCurrentShiChen()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setWylqData(computeWuYunLiuQi(wylqYear));
  }, [wylqYear]);

  // 默认选中当令经络
  useEffect(() => {
    const sc = SHI_CHEN_MAP[currentShiChen];
    setSelectedMeridians(prev => {
      const next = new Set(prev);
      if (!next.has(sc.meridianCode)) next.add(sc.meridianCode);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // focusCode 变化时：自动选中穴位、选中对应经络、打开详情面板
  useEffect(() => {
    if (!focusCode) return;
    const point = getTcmPointByCode(focusCode);
    if (!point) return;
    const m = meridians.find(m => m.code === point.meridian);
    if (!m) return;
    setSelectedPoint(point);
    setSelectedPointMeridian(m);
    setSelectedMeridians(new Set([m.code]));
    setSearchQuery(point.name);
    setInfoPanelOpen(true);
    setVideoPlayingCode(null);
  }, [focusCode, meridians]);

  const filteredMeridians = useMemo(() => {
    return meridians.filter(m => {
      if (wuxingFilter.size > 0 && !wuxingFilter.has(m.wuxing as WuxingElement)) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return m.nameZh.toLowerCase().includes(q) || m.acupoints.some(p => p.name.includes(q) || p.code.toLowerCase().includes(q));
      }
      return true;
    });
  }, [meridians, wuxingFilter, searchQuery]);

  const shiChenInfo = SHI_CHEN_MAP[currentShiChen];
  const currentWylq = computeWuYunLiuQi(new Date().getFullYear());

  return (
    <>
      <TcmBodyModel
        selectedMeridians={selectedMeridians}
        selectedPoint={selectedPoint}
        wuxingFilter={wuxingFilter}
        autoRotate={autoRotate}
        focusCode={focusCode}
        videoPlayingPoint={videoPlayingCode}
        focusTrigger={focusTrigger}
        onPointClick={handleCanvasPointClick}
      />

      <MeridianTopBar
        currentWylq={currentWylq}
        shiChenInfo={shiChenInfo}
        onWuYunLiuQiClick={() => setShowWuYunLiuQi(true)}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onToggleInfoPanel={() => setInfoPanelOpen(!infoPanelOpen)}
      />

      <TcmMeridianSidebar
        open={sidebarOpen}
        selectedMeridians={selectedMeridians}
        selectedPoint={selectedPoint}
        wuxingFilter={wuxingFilter}
        searchQuery={searchQuery}
        searchResults={searchResults}
        showSearchDropdown={showSearchDropdown}
        currentShiChen={currentShiChen}
        filteredMeridians={filteredMeridians}
        onToggleMeridian={toggleMeridian}
        onSearch={handleSearch}
        onClearSearch={() => { setSearchQuery(''); setSearchResults([]); setShowSearchDropdown(false); }}
        onShowSearchDropdown={setShowSearchDropdown}
        onWuxingFilterChange={setWuxingFilter}
        onPointSelect={handlePointSelect}
      />

      {selectedPoint && selectedPointMeridian && (
        <TcmAcupointDetail
          point={selectedPoint}
          meridian={selectedPointMeridian}
          infoPanelOpen={infoPanelOpen}
          onClose={() => { setSelectedPoint(null); setSelectedPointMeridian(null); setVideoPlayingCode(null); }}
          onToggleMeridian={toggleMeridian}
          onVideoPlayState={(playing) => setVideoPlayingCode(playing ? selectedPoint.code : null)}
          onFocusIn3D={() => { setInfoPanelOpen(false); setFocusTrigger(t => t + 1); }}
        />
      )}

      <MeridianBottomBar
        currentShiChen={currentShiChen}
        viewMode="all"
        autoRotate={autoRotate}
        wuxingFilter={wuxingFilter}
        onShiChenChange={setCurrentShiChen}
        onViewModeChange={() => {}}
        onAutoRotateToggle={() => setAutoRotate(!autoRotate)}
        onWuxingFilterChange={setWuxingFilter}
      />

      {showWuYunLiuQi && (
        <WuYunLiuQiModal
          data={wylqData}
          year={wylqYear}
          onClose={() => setShowWuYunLiuQi(false)}
          onYearChange={setWylqYear}
        />
      )}

      {(sidebarOpen || infoPanelOpen) && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => { setSidebarOpen(false); setInfoPanelOpen(false); }}
        />
      )}
    </>
  );
}

export default function MeridianClient() {
  return <MeridianPageContent />;
}
