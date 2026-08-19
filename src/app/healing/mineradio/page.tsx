'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import {
  createInitialPlaylistState,
  getNextIndex,
  getPrevIndex,
  toPlayerTracks,
  type PlaylistState,
  type PlayerTrack,
  type RepeatMode,
} from '@/lib/mineradio/playlist';
import type { WeatherMood } from '@/lib/mineradio/weather-mood';
import { generateMoodPlaylist } from '@/lib/mineradio/weather-mood';
import { getCachedWuxing300Tracks, useWuxing300Audio } from '@/lib/wuxing300-audio';
import { getXwsTracksForTone } from '@/lib/xws-music-adapter';
import {
  getCurrentShichen,
  sheng,
  type ElementKey,
} from '@/lib/mineradio/shichen-engine';
import WeatherRadio from '@/components/mineradio/WeatherRadio';
import HealingCatalogBrowser from '@/components/mineradio/HealingCatalogBrowser';
import ZiwuClock from '@/components/mineradio/ZiwuClock';
import MusicPlayer from '@/components/mineradio/MusicPlayer';
import BottomNav from '@/components/BottomNav';

// StressMusic 组件
import { useStressFlow } from '@/components/stressmusic/useStressFlow';
import GlowingOrbs from '@/components/stressmusic/GlowingOrbs';
import BreathOrb from '@/components/stressmusic/BreathOrb';
import ParticleVisualizer from '@/components/stressmusic/ParticleVisualizer';
import CDPlayer from '@/components/stressmusic/CDPlayer';
import MusicPreferenceGrid from '@/components/stressmusic/MusicPreferenceGrid';
import ProgressLog from '@/components/stressmusic/ProgressLog';
import HealingReportModal from '@/components/stressmusic/HealingReportModal';
import HeartRateMonitor from '@/components/stressmusic/HeartRateMonitor';

import { ArrowLeft, Music2, Sparkles, ChevronDown, FolderOpen, RefreshCw } from 'lucide-react';
import { cosUrl } from '@/lib/cos-url';

/** 五行养生音源入口卡片 */
function Wuxing300EntryCard() {
  const { extendedTracks, loading, count, refresh } = useWuxing300Audio();

  return (
    <div
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: 'linear-gradient(135deg, #f7f2ea 0%, #efe8d8 100%)',
        border: '1px solid #e0d8c8',
      }}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #5d8a63, #3d7a75)' }}
        >
          <Sparkles size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-serif font-bold text-sm text-[#3a2a1a]">五行养生音源</h3>
            {loading ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 animate-pulse">加载中</span>
            ) : count > 0 ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                {count}首可用
              </span>
            ) : (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">未配置</span>
            )}
          </div>
          <p className="text-[10px] mt-0.5 text-[#8a7a60]">
            {count > 0
              ? `300首中医五行音乐养生 · 已集成${count}首`
              : '300首中医五行音乐 · 请将音频放入 F:\\heytcm-audio\\'
            }
          </p>
        </div>
        {count > 0 ? (
          <button
            onClick={() => refresh()}
            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #5d8a63, #3d7a75)' }}
          >
            <RefreshCw size={10} />
            刷新
          </button>
        ) : (
          <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-[#8a7a60]" style={{ background: '#fff', border: '1px solid #e0d8c8' }}>
            <FolderOpen size={12} />
            配置
          </div>
        )}
      </div>
      {/* 五行分布 */}
      {count > 0 && (
        <div className="px-4 pb-3 flex gap-2 flex-wrap">
          {(['jiao', 'zhi', 'gong', 'shang', 'yu'] as const).map((tone) => {
            const c = extendedTracks.filter(t => t.element === tone).length;
            if (c === 0) return null;
            const toneColors: Record<string, string> = { jiao: '#5d8a63', zhi: '#c26158', gong: '#c9a94f', shang: '#5ba09a', yu: '#3d7a75' };
            const toneNames: Record<string, string> = { jiao: '角·木', zhi: '徵·火', gong: '宫·土', shang: '商·金', yu: '羽·水' };
            return (
              <span key={tone} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${toneColors[tone]}15`, color: toneColors[tone], border: `1px solid ${toneColors[tone]}30` }}>
                {toneNames[tone]} {c}
              </span>
            );
          })}
        </div>
      )}
      {/* 未配置时的配置说明 */}
      {count === 0 && !loading && (
        <div className="px-4 pb-3">
          <div className="text-[10px] leading-relaxed rounded-lg p-3" style={{ color: '#8a7a60', background: '#fff', border: '1px dashed #d0c8b8' }}>
            <p className="font-bold mb-1">配置方法：</p>
            <p>1. 下载百度网盘中的300首五行养生音频</p>
            <p>2. 按五行分类放入：F:\heytcm-audio\wood\ · fire\ · earth\ · metal\ · water\</p>
            <p>3. 刷新页面自动识别 · 运行分类脚本辅助归类</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MineradioPage() {
  const stress = useStressFlow();
  const flowState = stress.flowState;

  // ═══ 传统播放列表（保留给 ZiwuClock/WeatherRadio/HealingCatalogBrowser） ═══
  const [playlist, setPlaylist] = useState<PlaylistState>(createInitialPlaylistState());
  const [mood, setMood] = useState<WeatherMood | null>(null);
  const [showIntro, setShowIntro] = useState(false);
  const [showBrowsePanel, setShowBrowsePanel] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const [audioLevel, setAudioLevel] = useState(0);

  // ═══ 音频事件绑定 ═══
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setPlaylist(prev => ({ ...prev, currentTime: audio.currentTime }));
    const onEnded = () => {
      setPlaylist(prev => {
        const nextIdx = getNextIndex(prev);
        if (nextIdx < 0) return { ...prev, isPlaying: false };
        const nextTrack = prev.queue[nextIdx];
        if (nextTrack?.audioUrl) safePlay(audio, nextTrack.audioUrl);
        return { ...prev, currentIndex: nextIdx, isPlaying: !!nextTrack?.audioUrl, currentTime: 0 };
      });
    };
    const onPlay = () => setPlaylist(prev => ({ ...prev, isPlaying: true }));
    const onPause = () => setPlaylist(prev => ({ ...prev, isPlaying: false }));

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.volume = 0.8;

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  const safePlay = useCallback((audio: HTMLAudioElement, url: string) => {
    audio.removeAttribute('crossorigin');
    audio.src = url;
    audio.play().catch((e: unknown) => {
      if ((e as Error).name !== 'AbortError') console.error(e);
    });
  }, []);

  const initAnalyser = useCallback(() => {
    if (analyserRef.current) {
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      return;
    }
    const audio = audioRef.current;
    if (!audio) return;
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaElementSource(audio);
      sourceNodeRef.current = source;
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.6;
      source.connect(analyser);
      analyser.connect(ctx.destination);
      analyserRef.current = analyser;
    } catch (e) {
      console.warn('Audio analyser init failed:', e);
    }
  }, []);

  useEffect(() => {
    if (!playlist.isPlaying) { setAudioLevel(0); return; }
    const update = () => {
      const analyser = analyserRef.current;
      if (!analyser) { animFrameRef.current = requestAnimationFrame(update); return; }
      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((sum, v) => sum + v, 0) / data.length / 255;
      setAudioLevel(avg);
      animFrameRef.current = requestAnimationFrame(update);
    };
    animFrameRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [playlist.isPlaying]);

  // ═══ 传统播放控制 ═══
  const playTrackAtIndex = useCallback((index: number) => {
    const audio = audioRef.current;
    const track = playlist.queue[index];
    if (!audio || !track) return;
    initAnalyser();
    if (track.audioUrl) safePlay(audio, track.audioUrl);
    setPlaylist(prev => ({ ...prev, currentIndex: index, isPlaying: !!track.audioUrl, currentTime: 0 }));
  }, [playlist, initAnalyser, safePlay]);

  const startingRef = useRef(false);
  const handleStartRadio = useCallback((tracks: PlayerTrack[], weatherMood: WeatherMood) => {
    if (startingRef.current) return;
    startingRef.current = true;
    setTimeout(() => { startingRef.current = false; }, 1000);
    setMood(weatherMood);
    setPlaylist(prev => ({ ...prev, queue: tracks, currentIndex: 0, isPlaying: true, currentTime: 0 }));
    const audio = audioRef.current;
    if (audio && tracks[0]?.audioUrl) { initAnalyser(); safePlay(audio, tracks[0].audioUrl); }
  }, [initAnalyser, safePlay]);

  const handlePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playlist.isPlaying) {
      audio.pause();
      setPlaylist(prev => ({ ...prev, isPlaying: false }));
    } else {
      initAnalyser();
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      audio.play().catch((e: unknown) => { if ((e as Error).name !== 'AbortError') console.error(e); });
      setPlaylist(prev => ({ ...prev, isPlaying: true }));
    }
  }, [playlist.isPlaying, initAnalyser]);

  const handleNext = useCallback(() => { const i = getNextIndex(playlist); if (i >= 0) playTrackAtIndex(i); }, [playlist, playTrackAtIndex]);
  const handlePrev = useCallback(() => { const i = getPrevIndex(playlist); if (i >= 0) playTrackAtIndex(i); }, [playlist, playTrackAtIndex]);
  const handleSeek = useCallback((time: number) => { const a = audioRef.current; if (a) a.currentTime = time; setPlaylist(p => ({ ...p, currentTime: time })); }, []);
  const handleVolumeChange = useCallback((vol: number) => { const a = audioRef.current; if (a) a.volume = vol; setPlaylist(p => ({ ...p, volume: vol })); }, []);
  const handleRepeatModeChange = useCallback((mode: RepeatMode) => { setPlaylist(p => ({ ...p, repeatMode: mode })); }, []);

  const handlePlayTrack = useCallback((track: PlayerTrack) => {
    initAnalyser();
    setPlaylist(p => ({ ...p, queue: [...p.queue, track], currentIndex: p.queue.length, isPlaying: true, currentTime: 0 }));
    const a = audioRef.current;
    if (a && track.audioUrl) safePlay(a, track.audioUrl);
  }, [initAnalyser, safePlay]);

  const handlePlayAll = useCallback((tracks: PlayerTrack[]) => {
    if (!tracks.length) return;
    initAnalyser();
    setPlaylist(p => ({ ...p, queue: [...p.queue, ...tracks], currentIndex: p.queue.length, isPlaying: true, currentTime: 0 }));
    const a = audioRef.current;
    if (a && tracks[0]?.audioUrl) safePlay(a, tracks[0].audioUrl);
  }, [initAnalyser, safePlay]);

  const handlePlayShichenMusic = useCallback((element: ElementKey, _label: string) => {
    initAnalyser();
    const shichenTracks = generateShichenPlaylist(element);
    const playerTracks = toPlayerTracks(shichenTracks);
    setPlaylist(p => ({ ...p, queue: [...p.queue, ...playerTracks], currentIndex: p.queue.length, isPlaying: true, currentTime: 0 }));
    const a = audioRef.current;
    if (a && playerTracks[0]?.audioUrl) safePlay(a, playerTracks[0].audioUrl);
  }, [initAnalyser, safePlay]);

  const healingTheme = mood?.theme;
  const isPlaying = playlist.isPlaying;
  const isInStressFlow = flowState !== 'idle';

  // ═══ 渲染 StressMusic 流程页面 ═══
  const renderStressFlow = () => {
    switch (flowState) {
      case 'detecting':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="flex flex-col lg:flex-row items-center gap-8 w-full max-w-4xl">
              {/* 玻璃面板 — 心率监测 */}
              <div
                className="flex flex-col items-center justify-center text-center p-8 w-full lg:w-1/2"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: 40,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)',
                  minHeight: 400,
                }}
              >
                <h2 className="text-xl font-bold text-[#2D3436] mb-1">心率检测</h2>
                <p className="text-[#636E72] text-xs mb-5">选择一种方式获取您的心率数据，以便AI生成个性化疗愈音乐</p>
                <HeartRateMonitor
                  onHeartRateReady={stress.onHeartRateReady}
                  onSkip={stress.onSkipDetection}
                />
              </div>
              {/* 发光球体 */}
              <div className="hidden lg:flex lg:w-1/2 justify-center">
                <GlowingOrbs compact />
              </div>
            </div>
          </div>
        );

      case 'preference':
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="flex flex-col lg:flex-row items-center gap-8 w-full max-w-4xl">
              {/* 玻璃面板 — 偏好选择 */}
              <div
                className="flex flex-col items-center p-8 w-full lg:w-1/2"
                style={{
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(30px)',
                  borderRadius: 40,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)',
                  minHeight: 500,
                }}
              >
                {/* 心率摘要卡片 */}
                {stress.sessionData.startBPM && (
                  <div className="w-full mb-4 p-3 rounded-2xl flex items-center gap-4"
                    style={{
                      background: 'linear-gradient(135deg, rgba(91,160,154,0.08) 0%, rgba(61,122,117,0.05) 100%)',
                      border: '1px solid rgba(91,160,154,0.2)',
                    }}
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full"
                      style={{ background: 'rgba(91,160,154,0.15)' }}
                    >
                      <span className="text-lg">&#9829;</span>
                    </div>
                    <div className="flex-1 flex items-center gap-6">
                      <div>
                        <div className="text-[10px] text-[#636E72]">心率</div>
                        <div className="text-lg font-bold text-[#2D3436] tabular-nums">
                          {stress.sessionData.startBPM}
                          <span className="text-[10px] font-normal text-[#636E72] ml-0.5">BPM</span>
                        </div>
                      </div>
                      {stress.sessionData.startHRV !== null && (
                        <div>
                          <div className="text-[10px] text-[#636E72]">HRV</div>
                          <div className="text-lg font-bold text-[#2D3436] tabular-nums">
                            {stress.sessionData.startHRV}
                            <span className="text-[10px] font-normal text-[#636E72] ml-0.5">ms</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <div className="text-[10px] text-[#636E72]">状态</div>
                        <div className="text-xs font-medium text-[#5ba09a]">
                          {stress.bpmZoneLabel}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-[#636E72]">推荐</div>
                        <div className="text-xs font-medium text-[#5ba09a]">
                          {stress.recommendedElement === 'water' ? '水行·羽' :
                            stress.recommendedElement === 'earth' ? '土行·宫' :
                            stress.recommendedElement === 'fire' ? '火行·徵' :
                            stress.recommendedElement === 'wood' ? '木行·角' : '金行·商'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <MusicPreferenceGrid
                  selected={stress.selectedGenre}
                  onSelect={stress.setSelectedGenre}
                  onConfirm={stress.handleConfirmPreference}
                />
                {stress.errorMessage && (
                  <p className="mt-3 text-[#c26158] text-sm">{stress.errorMessage}</p>
                )}
              </div>
              {/* 发光球体 */}
              <div className="hidden lg:flex lg:w-1/2 justify-center">
                <GlowingOrbs compact />
              </div>
            </div>
          </div>
        );

      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
            {/* 心率状态 & 推荐提示 */}
            {stress.sessionData.startBPM && (
              <div className="text-center space-y-1">
                <p className="text-[#5ba09a] text-sm font-medium">
                  心率 {stress.sessionData.startBPM} BPM · {stress.bpmZoneLabel}
                </p>
                <p className="text-[#636E72] text-xs">
                  推荐 {stress.recommendedElement === 'water' ? '水行·羽音' :
                    stress.recommendedElement === 'earth' ? '土行·宫音' :
                    stress.recommendedElement === 'fire' ? '火行·徵音' :
                    stress.recommendedElement === 'wood' ? '木行·角音' :
                    '金行·商音'} · {stress.breathConfig.label}
                </p>
              </div>
            )}
            {/* 呼吸球体 */}
            <BreathOrb active={true} size={120} showText={true} bpm={stress.sessionData.startBPM || undefined} />
            {/* 进度文案 */}
            <ProgressLog active={true} />
          </div>
        );

      case 'playing':
        return (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(-45deg, #1a2a2a, #0d1f1f, #1a2530, #0d1520)', backgroundSize: '400% 400%', animation: 'bgFlowDark 18s ease infinite' }}>
            {/* 方块可视化背景 */}
            <ParticleVisualizer analyser={stress.analyser} active={stress.isPlaying} />

            {/* 呼吸文字 */}
            {stress.isPlaying && (
              <div
                className="absolute top-[15%] left-1/2 -translate-x-1/2 text-xl font-light tracking-[0.15em] pointer-events-none z-10"
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  transition: 'opacity 1.5s ease-in-out',
                }}
              >
                {stress.breathPhase === 'inhale' && '吸气...'}
                {stress.breathPhase === 'hold' && '保持...'}
                {stress.breathPhase === 'exhale' && '呼气...'}
                {stress.breathPhase === 'relax' && '放松...'}
              </div>
            )}

            {/* CD 播放器 */}
            <div className="z-20">
              <CDPlayer
                isPlaying={stress.isPlaying}
                currentTime={stress.currentTime}
                duration={stress.duration}
                onTogglePlay={stress.handleTogglePlay}
                accentColor="#5ba09a"
              />
            </div>

            {/* 底部曲目信息 */}
            <div className="absolute bottom-[12%] text-center z-20">
              <h3 className="text-white/80 text-base font-medium mb-1">
                正在播放您的个性化疗愈音乐
              </h3>
              <p className="text-white/40 text-xs mb-1">
                {stress.recommendedElement === 'water' ? '水行·羽音' :
                  stress.recommendedElement === 'earth' ? '土行·宫音' :
                  stress.recommendedElement === 'fire' ? '火行·徵音' :
                  stress.recommendedElement === 'wood' ? '木行·角音' :
                  '金行·商音'} · {stress.breathConfig.label}
              </p>
              <p className="text-white/30 text-[10px]">
                基于心率 {stress.sessionData.startBPM || 72} BPM 生成
              </p>
              {/* 返回按钮 */}
              <button
                onClick={stress.backToIdle}
                className="mt-4 px-6 py-2 rounded-full text-white/50 text-xs border border-white/20 hover:bg-white/10 transition"
              >
                返回天籁
              </button>
            </div>

            <style jsx>{`
              @keyframes bgFlowDark {
                0%   { background-position: 0% 50%; }
                50%  { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
              }
            `}</style>
          </div>
        );

      default:
        return null;
    }
  };

  // ═══ 如果处于 StressMusic 播放状态，全屏渲染 ═══
  if (flowState === 'playing') {
    return (
      <>
        {renderStressFlow()}
        <audio ref={stress.audioRef} className="hidden" preload="auto" />
        {/* 疗愈报告弹窗 */}
        {stress.showReport && (
          <HealingReportModal
            sessionData={stress.sessionData}
            onRestart={stress.handleRestart}
            onClose={() => stress.setShowReport(false)}
          />
        )}
        <BottomNav />
      </>
    );
  }

  // ═══ 主页面（idle / detecting / preference / loading 状态） ═══
  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: isInStressFlow
          ? 'linear-gradient(-45deg, #fdfbf7, #e8e8fd, #e0f2fe, #fce7f3)'
          : isPlaying && healingTheme
            ? healingTheme.bgGradient
            : 'linear-gradient(180deg, #faf5ee 0%, #f5efe4 40%, #f0e8d8 70%, #ebe3d3 100%)',
        backgroundSize: isInStressFlow ? '400% 400%' : undefined,
        animation: isInStressFlow ? 'bgFlow 18s ease infinite' : undefined,
        color: isInStressFlow ? '#2D3436' : isPlaying ? '#fff' : '#1a1a1a',
        transition: 'background 0.8s ease, color 0.5s ease',
      }}
    >
      {/* ═══ 顶部导航 ═══ */}
      <div
        className="relative z-10 flex items-center justify-between px-4 pt-12 pb-3"
        style={{
          borderBottom: isPlaying ? 'none' : '1px solid #e0d8c8',
          background: isInStressFlow ? 'rgba(253,251,247,0.8)' : isPlaying ? 'transparent' : 'rgba(250,245,238,0.8)',
          backdropFilter: isInStressFlow || isPlaying ? 'none' : 'blur(8px)',
        }}
      >
        <Link
          href="/healing"
          className={`p-2 rounded-xl transition ${isInStressFlow ? 'bg-[#5ba09a]/10 hover:bg-[#5ba09a]/20 text-[#5ba09a]' : isPlaying ? 'bg-white/10 hover:bg-white/15 backdrop-blur text-white' : 'bg-[#e8e0d0] hover:bg-[#ddd5c5] text-[#4a3a2a]'}`}
        >
          {isInStressFlow ? (
            <button onClick={stress.backToIdle}><ArrowLeft size={20} /></button>
          ) : (
            <ArrowLeft size={20} />
          )}
        </Link>
        <div className="text-center">
          <h1 className={`text-lg font-bold font-serif flex items-center gap-2 ${isInStressFlow ? 'text-[#2D3436]' : isPlaying ? 'text-white' : 'text-[#3a2a1a]'}`}>
            <Music2 size={18} style={{ color: isInStressFlow ? '#5ba09a' : isPlaying ? (healingTheme?.accentColor ?? '#a78bfa') : '#8a7a60' }} />
            天籁
          </h1>
          {mood && isPlaying && (
            <p className="text-[10px]" style={{ color: healingTheme?.textSecondary ?? 'rgba(167,139,250,0.6)' }}>
              {mood.title} · {mood.tagline}
            </p>
          )}
        </div>
        <div className="w-9" />
      </div>

      {/* ═══ 主内容区 ═══ */}
      <div className="relative z-10 px-4 pb-32 flex flex-col items-center">

        {/* ═══ StressMusic 流程区域 ═══ */}
        {isInStressFlow ? (
          renderStressFlow()
        ) : (
          <>
            {/* ═══ 初始页面 — StressMusic 入口 + 传统浏览 ═══ */}

            {/* 天籁介绍 */}
            {!isPlaying && (
              <div className="mb-4 w-full max-w-md">
                <button
                  onClick={() => setShowIntro(!showIntro)}
                  className="w-full text-left p-3 rounded-xl bg-[#f5efe4] border border-[#d0c8b8] hover:bg-[#efe8d8] transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[#8a6a30] text-xs font-serif tracking-widest">《庄子·齐物论》</span>
                      <span className="text-[#b0a080] text-[10px]">天籁之由</span>
                    </div>
                    <span className="text-[#b0a080] text-xs">{showIntro ? '▲' : '▼'}</span>
                  </div>
                </button>
                {showIntro && (
                  <div className="mt-2 p-4 rounded-xl bg-[#faf5ee] border border-[#d0c8b8] space-y-3 text-[#4a3a2a] text-xs leading-relaxed font-serif">
                    <p className="text-[#2a1a0a] text-sm font-bold">「夫天籁者，吹万不同，而使其自己也」</p>
                    <p>南郭子綦隐机而坐，仰天而嘘，嗒焉似丧其耦。颜成子游立侍乎前，曰：「何居乎？形固可使如槁木，而心固可使如死灰乎？今之隐机者，非昔之隐机者也。」子綦曰：「偃，不亦善乎，而问之也！今者吾丧我，汝知之乎？女闻人籁而未闻地籁，女闻地籁而未闻天籁夫！」</p>
                    <div className="h-px bg-[#d0c8b8]" />
                    <p><span className="text-[#8a6a30]">人籁</span>，丝竹管弦，人所吹也——琴瑟箫笛，虽极尽工巧，终为人力所为。</p>
                    <p><span className="text-[#4a7a4a]">地籁</span>，众窍是已，风之所吹也——清风过而万窍怒呺，不假人力而自成天韵。</p>
                    <p><span className="text-[#3a5a7a]">天籁</span>，吹万不同，而使其自己也——万物各以其性自鸣，此天籁之至也。</p>
                    <div className="h-px bg-[#d0c8b8]" />
                    <p className="text-[#6a5a30]">天籁之设，取法乎此：以子午流注为经，以天地风候为纬，以五行相胜为纲，以情胜情为用。</p>
                  </div>
                )}
              </div>
            )}

            {/* ═══ AI 疗愈体验入口 ═══ */}
            {!isPlaying && (
              <div className="mb-4 w-full max-w-md">
                <div
                  className="flex flex-col items-center justify-center p-6 cursor-pointer"
                  style={{
                    background: 'rgba(255,255,255,0.9)',
                    backdropFilter: 'blur(30px)',
                    borderRadius: 40,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.02)',
                  }}
                  onClick={stress.handleStart}
                >
                  {/* 发光球体 */}
                  <div className="mb-4">
                    <GlowingOrbs compact />
                  </div>
                  <h2
                    className="text-lg font-extrabold mb-2 text-center"
                    style={{
                      background: 'linear-gradient(135deg, #2D3436 0%, #5ba09a 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    AI 心绪疗愈
                  </h2>
                  <p className="text-[#636E72] text-xs text-center mb-4 leading-relaxed">
                    基于心率变异性(HRV)的情绪感知<br/>与AI音乐生成，为您定制专属减压旋律
                  </p>
                  <button
                    className="px-8 py-3 rounded-full text-white text-base font-semibold border-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, #5ba09a 0%, #3d7a75 100%)',
                      boxShadow: '0 10px 25px rgba(91,160,154,0.3)',
                      transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    }}
                    onMouseEnter={e => {
                      (e.target as HTMLElement).style.transform = 'translateY(-3px) scale(1.02)';
                    }}
                    onMouseLeave={e => {
                      (e.target as HTMLElement).style.transform = 'none';
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={16} />
                      开始体验
                    </span>
                  </button>
                  {/* 后端状态 */}
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-[10px] text-[#b2bec3]">
                      {stress.backendAvailable ? 'MusicGen 后端已连接' : '本地五行音乐模式'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ 子午流注时钟（始终显示） ═══ */}
            <div className="mb-4 w-full max-w-md">
              <ZiwuClock
                weatherMoodKey={mood?.key}
                theme={healingTheme}
                compact={isPlaying}
                onPlayShichenMusic={handlePlayShichenMusic}
              />
            </div>

            {/* ═══ 五行养生音源入口 ═══ */}
            {!isPlaying && (
              <div className="mb-4 w-full max-w-md">
                <Wuxing300EntryCard />
              </div>
            )}

            {/* ═══ 天候电台 & 曲库 ═══ */}
            {!isPlaying && (
              <>
                <button
                  onClick={() => setShowBrowsePanel(!showBrowsePanel)}
                  className="flex items-center gap-2 mb-3 text-[#8a7a60] text-xs font-serif hover:text-[#5a4a30] transition"
                >
                  <ChevronDown size={14} style={{ transform: showBrowsePanel ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.3s' }} />
                  天候电台 & 疗愈曲库
                </button>

                {showBrowsePanel && (
                  <>
                    {/* 天气电台 */}
                    <div className="mb-4 w-full max-w-md">
                      <WeatherRadio onStartRadio={handleStartRadio} />
                    </div>

                    {/* 疗愈曲库（含本地+养生音源） */}
                    <div className="mb-4 w-full max-w-md">
                      <HealingCatalogBrowser
                        onPlayTrack={handlePlayTrack}
                        onPlayAll={handlePlayAll}
                        theme={healingTheme}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {/* 专业音乐播放器（传统列表播放） */}
            {(isPlaying || playlist.queue.length > 0) && (
              <div className="mb-4 w-full max-w-2xl">
                <MusicPlayer
                  playlist={playlist}
                  onPlayPause={handlePlayPause}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  onSeek={handleSeek}
                  onVolumeChange={handleVolumeChange}
                  onRepeatModeChange={handleRepeatModeChange}
                  audioRef={audioRef as React.RefObject<HTMLAudioElement | null>}
                  onToggleQueue={() => {}}
                  onPlayTrack={playTrackAtIndex}
                  theme={healingTheme}
                />
              </div>
            )}

            {/* 迷你天籁（播放中天气信息） */}
            {isPlaying && (
              <div className="mb-4 w-full max-w-md">
                <WeatherRadio onStartRadio={handleStartRadio} compact />
              </div>
            )}

            {/* 无播放提示 */}
            {!isPlaying && playlist.queue.length === 0 && (
              <div className="text-center py-4">
                <p className="text-[#5a4a3a] text-sm font-serif">顺天时而听，应天候而愈</p>
                <p className="text-[#a09080] text-xs mt-1 font-serif">子午流注引路，天气调养随行</p>
              </div>
            )}
          </>
        )}
      </div>

      <audio ref={audioRef} className="hidden" preload="auto" />
      {(flowState as string) !== 'playing' && stress.audioRef && (
        <audio ref={stress.audioRef} className="hidden" preload="auto" />
      )}
      <BottomNav />

      {/* 疗愈报告弹窗 */}
      {stress.showReport && (
        <HealingReportModal
          sessionData={stress.sessionData}
          onRestart={stress.handleRestart}
          onClose={() => stress.setShowReport(false)}
        />
      )}

      {/* 动态背景动画 */}
      <style jsx global>{`
        @keyframes bgFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  时辰五行→曲目生成
// ═══════════════════════════════════════════════════

function generateShichenPlaylist(element: ElementKey) {
  const cover = '/images/modules/liaoyu.jpg';
  const TONE_MAP: Record<ElementKey, { title: string; artist: string; audioUrl: string; duration: number }[]> = {
    wood: [
      { title: '角音·木行', artist: '天籁', audioUrl: cosUrl('/audio/five-tone/jiao.mp3'), duration: 180 },
      { title: '古琴·浴火重生', artist: '天籁', audioUrl: cosUrl('/audio/healing/gaoshan-liushui.mp3'), duration: 240 },
      { title: '古筝·山泉清音', artist: '天籁', audioUrl: cosUrl('/audio/healing/gaoshan-liushui.mp3'), duration: 300 },
      { title: '箫·竹林清风', artist: '天籁', audioUrl: cosUrl('/audio/healing/gusu-xing.mp3'), duration: 260 },
      { title: '箫·竹林低语', artist: '天籁', audioUrl: cosUrl('/audio/healing/gusu-xing.mp3'), duration: 280 },
    ],
    fire: [
      { title: '徵音·火行', artist: '天籁', audioUrl: cosUrl('/audio/five-tone/zhi.mp3'), duration: 180 },
      { title: '古筝·欢爱', artist: '天籁', audioUrl: cosUrl('/audio/healing/chunjiang-huayueye.mp3'), duration: 220 },
      { title: '编钟·新春华章', artist: '天籁', audioUrl: cosUrl('/audio/healing/jinshe-kuangwu.mp3'), duration: 300 },
      { title: '箫·竹林幽韵', artist: '天籁', audioUrl: cosUrl('/audio/healing/gusu-xing.mp3'), duration: 260 },
    ],
    earth: [
      { title: '宫音·土行', artist: '天籁', audioUrl: cosUrl('/audio/five-tone/gong.mp3'), duration: 180 },
      { title: '编钟·金声玉振', artist: '天籁', audioUrl: cosUrl('/audio/healing/guangling-san.mp3'), duration: 280 },
      { title: '冥想·静坐归中', artist: '天籁', audioUrl: cosUrl('/audio/five-tone/gong.mp3'), duration: 360 },
      { title: '合奏·月下花影', artist: '天籁', audioUrl: cosUrl('/audio/healing/caiyun-zhuiyue.mp3'), duration: 320 },
    ],
    metal: [
      { title: '商音·金行', artist: '天籁', audioUrl: cosUrl('/audio/five-tone/shang.mp3'), duration: 180 },
      { title: '箫·桥上清箫', artist: '天籁', audioUrl: cosUrl('/audio/healing/xiaoxiang-shuiyun.mp3'), duration: 260 },
      { title: '二胡·丝柔如水', artist: '天籁', audioUrl: cosUrl('/audio/healing/erquan-yingyue.mp3'), duration: 240 },
      { title: '编钟·禅寺晨钟', artist: '天籁', audioUrl: cosUrl('/audio/healing/guangling-san.mp3'), duration: 280 },
    ],
    water: [
      { title: '羽音·水行', artist: '天籁', audioUrl: cosUrl('/audio/five-tone/yu.mp3'), duration: 180 },
      { title: '箫·行远不迷', artist: '天籁', audioUrl: cosUrl('/audio/healing/yuqiao-wenda.mp3'), duration: 260 },
      { title: '二胡·溪流奔城', artist: '天籁', audioUrl: cosUrl('/audio/healing/hangong-qiuyue.mp3'), duration: 240 },
      { title: '冥想·静心观水', artist: '天籁', audioUrl: cosUrl('/audio/five-tone/yu.mp3'), duration: 360 },
      { title: '箫·幽谷空灵', artist: '天籁', audioUrl: cosUrl('/audio/healing/guanshan-yue.mp3'), duration: 300 },
    ],
  };

  const primaryTracks = TONE_MAP[element] || TONE_MAP.water;
  const secondaryElement = sheng(element);
  const secondaryTracks = (TONE_MAP[secondaryElement] || TONE_MAP.water).slice(0, 1);

  // Merge external wuxing300 tracks
  const wuxinKeyMap: Record<ElementKey, string> = { wood: 'jiao', fire: 'zhi', earth: 'gong', metal: 'shang', water: 'yu' };
  const wuxing300Tracks = getCachedWuxing300Tracks()
    .filter(t => t.element === wuxinKeyMap[element])
    .map(t => ({
      title: t.title,
      artist: '五行养生',
      audioUrl: t.src,
      duration: t.duration || 300,
    }));
  const wuxing300Secondary = getCachedWuxing300Tracks()
    .filter(t => t.element === wuxinKeyMap[secondaryElement])
    .slice(0, 2)
    .map(t => ({
      title: t.title,
      artist: '五行养生',
      audioUrl: t.src,
      duration: t.duration || 300,
    }));

  // Merge XWS music tracks
  const xwsPrimaryTracks = getXwsTracksForTone(wuxinKeyMap[element]).slice(0, 5).map(t => ({
    title: t.title,
    artist: '穴位助手',
    audioUrl: t.src,
    duration: t.duration || 300,
  }));
  const xwsSecondaryTracks = getXwsTracksForTone(wuxinKeyMap[secondaryElement]).slice(0, 2).map(t => ({
    title: t.title,
    artist: '穴位助手',
    audioUrl: t.src,
    duration: t.duration || 300,
  }));

  const sc = getCurrentShichen();

  return [...primaryTracks, ...wuxing300Tracks, ...xwsPrimaryTracks, ...secondaryTracks, ...wuxing300Secondary, ...xwsSecondaryTracks].map((t) => ({
    ...t,
    coverUrl: cover,
    mood: `shichen-${element}`,
    element,
    artist: `${t.artist}·${sc.branch}时`,
  }));
}
