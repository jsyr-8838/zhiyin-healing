'use client';

import { useState, useRef, useEffect, useCallback, memo } from 'react';
import type { PlayerTrack, PlaylistState, RepeatMode } from '@/lib/mineradio/playlist';
import { getNextIndex, getPrevIndex, getProgress } from '@/lib/mineradio/playlist';
import { formatTime } from '@/lib/mineradio/lrc-parser';
import {
  Play, Pause, SkipBack, SkipForward, Volume2, VolumeX,
  Repeat, Repeat1, ListMusic, X, Music,
  Leaf, Flame, Mountain, Sparkles, Droplets,
} from 'lucide-react';
import type { HealingTheme } from '@/lib/mineradio/weather-mood';

/* ─── 五行配色系 ─── */
const ELEMENT_THEME: Record<string, {
  gradient: string;
  icon: React.ReactNode;
  label: string;
  accent: string;       // 主题色
  accentRgb: string;    // 主题色 RGB for rgba()
  bgBlur: string;       // 氛围模糊色
}> = {
  wood: {
    gradient: 'from-emerald-900 via-emerald-800 to-green-950',
    icon: <Leaf size={36} className="text-emerald-300/30" />,
    label: '木',
    accent: '#34d399',
    accentRgb: '52,211,153',
    bgBlur: 'rgba(6,78,59,0.6)',
  },
  fire: {
    gradient: 'from-red-900 via-red-800 to-rose-950',
    icon: <Flame size={36} className="text-red-300/30" />,
    label: '火',
    accent: '#f87171',
    accentRgb: '248,113,113',
    bgBlur: 'rgba(127,29,29,0.6)',
  },
  earth: {
    gradient: 'from-amber-900 via-amber-800 to-yellow-950',
    icon: <Mountain size={36} className="text-amber-300/30" />,
    label: '土',
    accent: '#fbbf24',
    accentRgb: '251,191,36',
    bgBlur: 'rgba(120,53,15,0.6)',
  },
  metal: {
    gradient: 'from-teal-900 via-teal-800 to-cyan-950',
    icon: <Sparkles size={36} className="text-teal-300/30" />,
    label: '金',
    accent: '#2dd4bf',
    accentRgb: '45,212,191',
    bgBlur: 'rgba(17,94,89,0.6)',
  },
  water: {
    gradient: 'from-blue-900 via-blue-800 to-indigo-950',
    icon: <Droplets size={36} className="text-blue-300/30" />,
    label: '水',
    accent: '#60a5fa',
    accentRgb: '96,165,250',
    bgBlur: 'rgba(30,58,138,0.6)',
  },
};

const DEFAULT_ACCENT = '#00F5D4';
const DEFAULT_ACCENT_RGB = '0,245,212';

interface MusicPlayerProps {
  playlist: PlaylistState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onRepeatModeChange: (mode: RepeatMode) => void;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  onToggleQueue?: () => void;
  /** 点击队列项播放指定索引 */
  onPlayTrack?: (index: number) => void;
  /** 疗愈视觉主题 */
  theme?: HealingTheme;
  compact?: boolean;
}

function MusicPlayer({
  playlist,
  onPlayPause,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onRepeatModeChange,
  audioRef,
  onToggleQueue,
  onPlayTrack,
  theme: healingTheme,
  compact = false,
}: MusicPlayerProps) {
  const { queue, currentIndex, repeatMode, isPlaying, currentTime, volume } = playlist;
  const track = queue[currentIndex] as PlayerTrack | undefined;
  const progress = getProgress(playlist);
  const progressRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showVolume, setShowVolume] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [dragParticles, setDragParticles] = useState<Array<{ id: number; x: number; y: number; dx: number; dy: number }>>([]);

  // 当前五行主题
  const elementKey = track?.element as string | undefined;
  const theme = elementKey ? ELEMENT_THEME[elementKey] : null;
  const accent = theme?.accent ?? (healingTheme?.accentColor ?? DEFAULT_ACCENT);
  const accentRgb = theme?.accentRgb ?? (healingTheme?.accentRgb ?? DEFAULT_ACCENT_RGB);

  // ─── 进度条交互 ───
  const handleProgressInteraction = useCallback(
    (e: React.MouseEvent | MouseEvent) => {
      if (!progressRef.current || !track?.duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      onSeek(x * track.duration);
    },
    [track, onSeek]
  );

  useEffect(() => {
    if (!isDragging) return;
    const handleMove = (e: MouseEvent) => {
      handleProgressInteraction(e);
      // 生成拖拽粒子
      setDragParticles((prev) => [
        ...prev.slice(-6),
        {
          id: Date.now() + Math.random(),
          x: e.clientX,
          y: e.clientY,
          dx: (Math.random() - 0.5) * 30,
          dy: -10 - Math.random() * 20,
        },
      ]);
    };
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, handleProgressInteraction]);

  // 清理过期粒子
  useEffect(() => {
    if (!dragParticles.length) return;
    const timer = setTimeout(() => setDragParticles([]), 650);
    return () => clearTimeout(timer);
  }, [dragParticles]);

  const repeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;
  const repeatActive = repeatMode !== 'off';

  // ─── 紧凑模式 ───
  if (compact) {
    const compactTheme = elementKey ? ELEMENT_THEME[elementKey] : null;
    return (
      <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-2xl border border-white/10">
        <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ${
          compactTheme ? `bg-gradient-to-br ${compactTheme.gradient}` : 'bg-white/10'
        } flex items-center justify-center`}>
          {compactTheme ? (
            <span className="text-white/50 text-sm font-serif font-bold">{compactTheme.label}</span>
          ) : track?.coverUrl ? (
            <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
          ) : null}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-white/90 truncate">{track?.title || '未播放'}</p>
          <p className="text-[10px] text-white/50 truncate">{track?.artist || ''}</p>
        </div>
        <button onClick={onPlayPause} className="p-2 text-white/80 hover:text-white transition">
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ═══ 拖拽粒子 ═══ */}
      {dragParticles.map((p) => (
        <div
          key={p.id}
          className="fixed z-[999] w-1 h-1 rounded-full pointer-events-none"
          style={{
            left: p.x,
            top: p.y,
            background: `rgba(255,255,255,0.92)`,
            boxShadow: `0 0 12px rgba(${accentRgb},0.36)`,
            animation: 'progressParticleFade 0.62s ease-out forwards',
            '--px': `${p.x}px`,
            '--py': `${p.y}px`,
            '--dx': `${p.dx}px`,
            '--dy': `${p.dy}px`,
          } as React.CSSProperties}
        />
      ))}

      {/* ═══ 专辑氛围背景模糊 ═══ */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
        aria-hidden
      >
        <div
          className="absolute inset-0 scale-150"
          style={{
            background: healingTheme
              ? `radial-gradient(ellipse at center, ${healingTheme.ambientBlur} 0%, rgba(0,0,0,0.95) 70%)`
              : theme
                ? `radial-gradient(ellipse at center, ${theme.bgBlur} 0%, rgba(0,0,0,0.95) 70%)`
                : 'radial-gradient(ellipse at center, rgba(30,20,60,0.6) 0%, rgba(0,0,0,0.95) 70%)',
            filter: 'blur(120px) saturate(1.5) brightness(0.18)',
          }}
        />
      </div>

      {/* ═══ 主播放器 ═══ */}
      <div className="relative flex flex-col items-center">

        {/* ─── 旋转黑胶唱片 ─── */}
        <div className="relative mt-6 mb-8">
          {/* 唱片外圈辉光 */}
          <div
            className="absolute inset-0 rounded-full blur-xl opacity-40 scale-110"
            style={{
              background: `radial-gradient(circle, rgba(${accentRgb},0.3) 0%, transparent 70%)`,
            }}
          />
          {/* 唱片主体 */}
          <div
            className={`w-52 h-52 rounded-full relative ${isPlaying ? 'animate-spin' : ''}`}
            style={{
              animationDuration: '18s',
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              background: `
                conic-gradient(from 0deg,
                  #1a1a1a 0deg, #2a2a2a 30deg, #1a1a1a 60deg,
                  #222222 90deg, #2e2e2e 120deg, #1a1a1a 150deg,
                  #252525 180deg, #2a2a2a 210deg, #1a1a1a 240deg,
                  #222222 270deg, #2c2c2c 300deg, #1a1a1a 330deg, #1a1a1a 360deg
                )
              `,
              boxShadow: `
                0 0 40px rgba(0,0,0,0.5),
                inset 0 0 30px rgba(0,0,0,0.3),
                0 0 80px rgba(${accentRgb},0.08)
              `,
            }}
          >
            {/* 唱片纹路 */}
            <div
              className="absolute inset-4 rounded-full"
              style={{
                background: `repeating-radial-gradient(
                  circle at center,
                  transparent 0px, transparent 2px,
                  rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 3px
                )`,
              }}
            />
            {/* 中心标签 */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full overflow-hidden"
              style={{
                background: theme
                  ? `linear-gradient(135deg, rgba(${accentRgb},0.3), rgba(${accentRgb},0.1))`
                  : 'linear-gradient(135deg, rgba(100,60,180,0.4), rgba(60,40,120,0.2))',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {theme ? (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  {theme.icon}
                  <span className="text-white/60 text-[10px] font-serif font-bold mt-0.5">{theme.label}</span>
                </div>
              ) : track?.coverUrl ? (
                <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music size={20} className="text-white/20" />
                </div>
              )}
            </div>
            {/* 中心孔 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-black/80 border border-white/10" />
          </div>
        </div>

        {/* ─── 歌曲信息 ─── */}
        <div className="text-center px-8 mb-5 w-full max-w-md">
          <h3 className="text-lg font-bold text-white/90 truncate" style={{ fontWeight: 760 }}>
            {track?.title || '天籁'}
          </h3>
          <p className="text-sm text-white/45 truncate mt-0.5">{track?.artist || '万窍自鸣·以情胜情'}</p>
        </div>

        {/* ─── 专业进度条 ─── */}
        <div className="w-full max-w-lg px-6 mb-4">
          <div
            ref={progressRef}
            className={`relative rounded-full cursor-pointer group transition-all duration-200 ${
              isDragging ? 'h-[5px]' : 'h-1'
            }`}
            style={{
              background: 'rgba(255,255,255,0.095)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.12), inset 0 -1px 1px rgba(0,0,0,0.20)',
            }}
            onClick={handleProgressInteraction}
            onMouseDown={(e) => {
              setIsDragging(true);
              handleProgressInteraction(e);
            }}
          >
            {/* 已播放 */}
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-[width] duration-100"
              style={{
                width: `${progress * 100}%`,
                background: `linear-gradient(90deg, rgba(255,255,255,0.92), rgba(${accentRgb},0.74))`,
                boxShadow: `0 0 16px rgba(${accentRgb},0.18)`,
              }}
            />
            {/* 辉光拇指 */}
            <div
              className="absolute top-1/2 pointer-events-none transition-all duration-150"
              style={{
                left: `${progress * 100}%`,
                transform: `translate(-50%, -50%) scale(${isDragging || false ? 1 : 0.72})`,
                opacity: isDragging ? 1 : 0,
                width: 13,
                height: 13,
                borderRadius: '50%',
                background: `radial-gradient(circle at 34% 28%, #fff 0%, #fff 28%, rgba(194,235,255,0.86) 74%)`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.34), 0 0 18px rgba(178,229,255,0.28)`,
              }}
            />
            {/* Hover 显示拇指 */}
            <div
              className="absolute top-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              style={{
                left: `${progress * 100}%`,
                transform: 'translate(-50%, -50%) scale(1)',
                width: 13,
                height: 13,
                borderRadius: '50%',
                background: `radial-gradient(circle at 34% 28%, #fff 0%, #fff 28%, rgba(194,235,255,0.86) 74%)`,
                boxShadow: `0 0 0 1px rgba(255,255,255,0.34), 0 0 18px rgba(178,229,255,0.28)`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[11px] text-white/40 font-mono" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.35px' }}>
              {formatTime(currentTime)}
            </span>
            <span className="text-[11px] text-white/40 font-mono" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.35px' }}>
              {formatTime(track?.duration || 0)}
            </span>
          </div>
        </div>

        {/* ─── 3列控制栏（Mineradio 风格） ─── */}
        <div
          className="w-full max-w-2xl mx-auto px-4 mb-4 rounded-full"
          style={{
            padding: '9px 22px 14px',
            borderRadius: 50,
            background: 'rgba(0,0,0,0.10)',

            boxShadow: `
              inset 0 0 2px 1px rgba(255,255,255,0.35),
              inset 0 0 10px 4px rgba(255,255,255,0.15),
              0 4px 16px rgba(17,17,26,0.05),
              0 8px 24px rgba(17,17,26,0.05),
              inset 0 4px 16px rgba(17,17,26,0.05)
            `,
            border: '1px solid rgba(255,255,255,0.095)',
          }}
        >
          <div className="grid items-center gap-4" style={{ gridTemplateColumns: '1fr auto 1fr' }}>

            {/* 左列：封面+曲目信息 */}
            <div className="flex items-center gap-3 justify-start min-w-0">
              <div
                className={`w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden ${
                  theme ? `bg-gradient-to-br ${theme.gradient}` : 'bg-white/5'
                } flex items-center justify-center`}
                style={{
                  boxShadow: '0 10px 28px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.20), inset 0 0 0 1px rgba(255,255,255,0.08)',
                }}
              >
                {theme ? (
                  <span className="text-white/60 text-sm font-serif font-bold">{theme.label}</span>
                ) : track?.coverUrl ? (
                  <img src={track.coverUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Music size={18} className="text-white/20" />
                )}
              </div>
              <div className="min-w-0 max-w-[170px]">
                <p className="text-[13px] font-bold text-white/90 truncate" style={{ fontWeight: 760 }}>{track?.title || '天籁'}</p>
                <p className="text-[11px] text-white/45 truncate">{track?.artist || '等待播放'}</p>
              </div>
            </div>

            {/* 中列：传输控制 */}
            <div className="flex items-center gap-3 justify-center">
              <button onClick={onPrev} className="ctrl-btn">
                <SkipBack size={21} fill="currentColor" />
              </button>
              <button
                onClick={onPlayPause}
                className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all duration-200"
                style={{
                  background: 'rgba(0,0,0,0.10)',
                  boxShadow: `
                    inset 0 0 2px 1px rgba(255,255,255,0.34),
                    inset 0 0 10px 4px rgba(255,255,255,0.13),
                    0 10px 30px rgba(0,0,0,0.18)
                  `,

                }}
              >
                {isPlaying ? (
                  <Pause size={24} fill="currentColor" />
                ) : (
                  <Play size={24} fill="currentColor" className="ml-0.5" />
                )}
              </button>
              <button onClick={onNext} className="ctrl-btn">
                <SkipForward size={21} fill="currentColor" />
              </button>
            </div>

            {/* 右列：模式控制 */}
            <div className="flex items-center gap-2 justify-end">
              <button
                onClick={() => onRepeatModeChange(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
                className={`ctrl-btn ${repeatActive ? 'active' : ''}`}
                data-mode={repeatMode}
              >
                {repeatMode === 'one' ? <Repeat1 size={21} /> : <Repeat size={21} />}
              </button>

              {/* 音量控制 */}
              <div className="relative flex items-center justify-center volume-control">
                <button
                  onClick={() => setShowVolume(!showVolume)}
                  className={`ctrl-btn ${volume < 0.01 ? 'muted' : ''}`}
                >
                  {volume < 0.01 ? <VolumeX size={21} /> : <Volume2 size={21} />}
                </button>
                {/* 浮动音量弹窗 */}
                {showVolume && (
                  <div
                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl z-20"
                    style={{
                      width: 154,
                      background: 'rgba(12,12,16,0.78)',

                      boxShadow: '0 18px 48px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.09)',
                    }}
                  >
                    <input
                      id="volume-slider"
                      type="range"
                      min={0}
                      max={100}
                      value={Math.round(volume * 100)}
                      onChange={(e) => onVolumeChange(Number(e.target.value) / 100)}
                      className="flex-1 h-1 rounded-full appearance-none cursor-pointer bg-white/20"
                      style={{ accentColor: accent }}
                    />
                    <span
                      id="volume-value"
                      className="text-[10px] text-white/50 w-8 text-right"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {Math.round(volume * 100)}
                    </span>
                  </div>
                )}
              </div>

              {/* 迷你队列按钮 */}
              <div className="relative flex items-center justify-center">
                <button
                  onClick={() => setShowQueue(!showQueue)}
                  className={`ctrl-btn ${showQueue ? 'active' : ''}`}
                >
                  <ListMusic size={21} />
                </button>

                {/* 迷你队列弹窗 */}
                {showQueue && queue.length > 0 && (
                  <div
                    className="absolute bottom-full right-0 mb-3 overflow-hidden z-20"
                    style={{
                      width: 'min(380px, calc(100vw - 32px))',
                      maxHeight: 'min(380px, calc(100vh - 200px))',
                      padding: 14,
                      borderRadius: 16,
                      border: '1px solid rgba(255,255,255,0.075)',
                      background: 'linear-gradient(145deg, rgba(18,18,23,0.82), rgba(8,8,12,0.88))',

                      boxShadow: '0 22px 70px rgba(0,0,0,0.46), inset 0 1px 0 rgba(255,255,255,0.065)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div>
                        <p className="text-xs font-bold text-white/90" style={{ fontWeight: 700, letterSpacing: '0.4px' }}>播放队列</p>
                        <p className="text-[10px] text-white/40 mt-0.5">{queue.length} 首</p>
                      </div>
                      <button onClick={() => setShowQueue(false)} className="text-white/40 hover:text-white/70 transition">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-72 overflow-y-auto pr-0.5" style={{ overscrollBehavior: 'contain' }}>
                      {queue.map((t, idx) => {
                        const isNow = idx === currentIndex;
                        const tElement = t.element as string | undefined;
                        const tTheme = tElement ? ELEMENT_THEME[tElement] : null;
                        return (
                          <div
                            key={t.uid}
                            onClick={() => {
                              if (onPlayTrack) {
                                onPlayTrack(idx);
                              }
                            }}
                            className="flex items-center gap-2.5 px-2 py-2 rounded-xl cursor-pointer transition-all duration-150"
                            style={{
                              border: isNow ? `1px solid rgba(${accentRgb},0.36)` : '1px solid rgba(255,255,255,0.055)',
                              background: isNow ? `rgba(${accentRgb},0.075)` : 'rgba(255,255,255,0.032)',
                              boxShadow: isNow ? `inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 28px rgba(${accentRgb},0.06)` : 'none',
                            }}
                          >
                            <div
                              className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center ${
                                tTheme ? `bg-gradient-to-br ${tTheme.gradient}` : 'bg-white/5'
                              }`}
                            >
                              {tTheme ? (
                                <span className="text-white/50 text-[10px] font-serif font-bold">{tTheme.label}</span>
                              ) : (
                                <Music size={14} className="text-white/20" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-xs truncate ${isNow ? 'text-white font-bold' : 'text-white/80'}`}>{t.title}</p>
                              <p className="text-[10px] text-white/35 truncate mt-0.5">{t.artist}</p>
                            </div>
                            {isNow && (
                              <div className="flex gap-0.5 items-end h-3 flex-shrink-0">
                                {[0.3, 0.6, 1, 0.5, 0.8].map((h, i) => (
                                  <div
                                    key={i}
                                    className="w-0.5 rounded-full animate-pulse"
                                    style={{
                                      height: `${h * 100}%`,
                                      background: accent,
                                      animationDelay: `${i * 100}ms`,
                                    }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══ 进度粒子动画 Keyframe (注入一次) ═══ */}
      <style jsx global>{`
        @keyframes progressParticleFade {
          0% { opacity: 0.95; transform: translate3d(var(--px, 0), var(--py, 0), 0) scale(1); }
          100% { opacity: 0; transform: translate3d(calc(var(--px, 0) + var(--dx, 0)), calc(var(--py, 0) + var(--dy, 0)), 0) scale(0.15); }
        }
        .ctrl-btn {
          flex: 0 0 auto;
          width: 36px; height: 36px;
          background: transparent;
          border: 0; border-radius: 11px;
          color: rgba(255,255,255,0.70);
          cursor: pointer;
          transition: color 0.18s, transform 0.18s, text-shadow 0.18s, background 0.18s, box-shadow 0.18s;
          display: flex; align-items: center; justify-content: center;
          padding: 0;
          will-change: transform;
        }
        .ctrl-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.045);
          transform: translateY(-1px);
          text-shadow: 0 0 10px rgba(0,245,212,0.12);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.045);
        }
        .ctrl-btn:active {
          transform: translateY(0) scale(0.96);
        }
        .ctrl-btn.active {
          color: rgba(210,244,241,0.90);
          text-shadow: 0 0 12px rgba(0,245,212,0.16);
        }
        .ctrl-btn.muted {
          color: rgba(255,255,255,0.38);
        }
        .volume-control:hover .volume-popover,
        .volume-control:focus-within .volume-popover {
          opacity: 1; pointer-events: auto;
          transform: translateX(-50%) translateY(0);
        }
        /* 唱片旋转 */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 18s linear infinite;
        }
      `}</style>
    </>
  );
}

export default memo(MusicPlayer);
