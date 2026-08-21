'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import HealingCanvas, { type HealingCanvasHandle, HEALING_PRESET_WUYIN } from '@/components/healing/HealingCanvas';
import { fmtTime } from '@/hooks/useTimer';
import { Play, Pause, Volume2, Timer, Sparkles, Music, RefreshCw, FolderOpen, Square, Repeat, RepeatOff } from 'lucide-react';
import {
  FIVE_TONES, BINAURAL_MODES, MODULATIONS, WUYIN_PRESETS,
  type WuYinKey, type BinauralValue, type ModulationValue,
} from '@/lib/five-tone-data';
import {
  useAudioService, createWuyinTrack,
} from '@/lib/audio-service';
import {
  getTracksForTone, INSTRUMENT_INFO, type InstrumentType,
} from '@/lib/healing-music-catalog';
import { useWuxing300Audio, type Wuxing300Track } from '@/lib/wuxing300-audio';
import { getXwsTracksForTone } from '@/lib/xws-music-adapter';
import { useHealingRecommendation } from '@/hooks/useHealingRecommendation';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XIUWEI_GAINS, type WuxingElement } from '@/lib/cultivation-engine';
import { getClientUserId } from '@/lib/auth';

/* ================================================================
 *  五音疗愈 · 宋韵光色系版
 *  五行五音(角徵宫商羽) + 双耳节拍 + 波形调制
 *  + HealingCanvas 宣纸暖白五行声波 + 金色能量粒子
 * ================================================================ */

// ===== 主页面组件 =====
export default function WuYinPage() {
  // ---- 音频服务状态 ----
  const {
    isPlaying, currentTrack, volume, binauralBeat, modulation,
    timerMinutes, timerRemaining, isTimerRunning, isLooping,
    play, pause, stop, togglePlay, setVolume,
    setBinauralBeat, setModulation,
    setTimer, startTimer, stopTimer, toggleLoop,
  } = useAudioService();

  const { hasDiagnosis, recommendedTone, primaryConstitution } = useHealingRecommendation();
  const hasAutoSelectedRef = useRef(false);

  // ---- 本地 UI 状态 ----
  const [selectedTone, setSelectedTone] = useState<WuYinKey | null>(null);
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioEnergy, setAudioEnergy] = useState(0);

  // ---- 自动选择推荐音调（仅初始化一次） ----
  useEffect(() => {
    if (hasDiagnosis && recommendedTone && !hasAutoSelectedRef.current) {
      hasAutoSelectedRef.current = true;
      setSelectedTone(recommendedTone as WuYinKey);
    }
  }, [hasDiagnosis, recommendedTone]);

  const TONE_NAMES: Record<string, string> = { jiao: '角', zhi: '徵', gong: '宫', shang: '商', yu: '羽' };

  // ---- 当前选中音调的可用曲目 ----
  const { extendedTracks, loading: loadingWuxing300 } = useWuxing300Audio();

  const xwsTracksCache = useMemo(() => getXwsTracksForTone(selectedTone || 'gong'), [selectedTone]);

  const availableTracks = useMemo(() => {
    if (!selectedTone) return [];
    const local = getTracksForTone(selectedTone);
    const external = extendedTracks.filter(t => t.element === selectedTone);
    const xwsTracks = getXwsTracksForTone(selectedTone);
    return [...local, ...external, ...xwsTracks];
  }, [selectedTone, extendedTracks]);

  // ---- Canvas / AnalyserNode 引用 ----
  const healingCanvasRef = useRef<HealingCanvasHandle>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [analyserState, setAnalyserState] = useState<AnalyserNode | null>(null);
  const energyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- 获取 AnalyserNode ----
  useEffect(() => {
    if (isPlaying && !analyserRef.current) {
      // 动态导入避免循环依赖
      import('@/lib/audio-service').then(mod => {
        const node = mod.getAnalyserNode();
        if (node) {
          analyserRef.current = node;
          setAnalyserState(node);
        }
      });
    }
  }, [isPlaying]);

  // ---- 音频能量 → Canvas 驱动 ----
  useEffect(() => {
    if (!isPlaying) {
      setAudioEnergy(0);
      return;
    }
    const poll = () => {
      const analyser = analyserRef.current;
      if (!analyser) return;
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);
      let sum = 0;
      for (let i = 0; i < 64; i++) sum += freqData[i];
      const avg = sum / 64 / 255;
      setAudioEnergy(prev => prev * 0.8 + avg * 0.2);
    };
    energyIntervalRef.current = setInterval(poll, 80);
    return () => {
      if (energyIntervalRef.current) clearInterval(energyIntervalRef.current);
    };
  }, [isPlaying]);

  // ---- 播放五音 ----
  const startPlaying = useCallback((toneKey: WuYinKey, beat: BinauralValue, mod: ModulationValue, trackId?: string) => {
    // Check if it's a wuxing300 external track
    const extTrack = extendedTracks.find(t => t.id === (trackId || selectedTrackId));
    // Check if it's a xws track
    const xwsTrack = xwsTracksCache.find(t => t.id === (trackId || selectedTrackId));
    let track;
    if (extTrack) {
      // External track: use variantSrc since it's not in local catalog
      track = createWuyinTrack(toneKey, extTrack.src);
      track.id = extTrack.id;
      track.title = `${extTrack.title} — ${extTrack.subtitle}`;
      track.instrument = extTrack.instrument;
    } else if (xwsTrack) {
      // XWS track: use src from adapter
      track = createWuyinTrack(toneKey, xwsTrack.src);
      track.id = xwsTrack.id;
      track.title = `${xwsTrack.title} — ${xwsTrack.subtitle}`;
    } else {
      track = createWuyinTrack(toneKey, undefined, trackId || selectedTrackId || undefined);
    }
    play(track);
    if (beat !== binauralBeat) setBinauralBeat(beat);
    if (mod !== modulation) setModulation(mod);
    setElapsedSeconds(0);

    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
  }, [play, binauralBeat, modulation, setBinauralBeat, setModulation, selectedTrackId, extendedTracks]);

  // ---- 停止播放 ----
  const stopAll = useCallback(() => {
    // ★ 五音疗愈播放≥5分钟时记录修为
    if (elapsedSeconds >= 300) {
      try {
        const toneElMap: Record<WuYinKey, WuxingElement> = {
          jiao: 'wood', zhi: 'fire', gong: 'earth', shang: 'metal', yu: 'water',
        };
        const el: WuxingElement = toneElMap[selectedTone as WuYinKey] || 'earth';
        const gain = XIUWEI_GAINS.wuyin_5min;
        useCultivationStore.getState().addXiuWei(el, gain);
        useCultivationStore.getState().recordPractice('wuyin', elapsedSeconds, el, gain);
        useCultivationStore.getState().completeTodayStep('wuyin');
        fetch('/api/cultivation/practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: getClientUserId(),
            category: 'wuyin',
            subCategory: selectedTone,
            element: el,
            durationSec: elapsedSeconds,
          }),
        }).catch(() => {});
      } catch {}
    }
    stop();
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
    setElapsedSeconds(0);
  }, [stop, elapsedSeconds, selectedTone]);

  // ---- 预设点击 ----
  const applyPreset = useCallback((preset: typeof WUYIN_PRESETS[number]) => {
    setSelectedTone(preset.tone);
    setTimer(preset.timer);
    startPlaying(preset.tone, preset.beat, preset.mod);
  }, [startPlaying, setTimer]);

  // ---- 音符点击 ----
  const toggleTone = useCallback((toneKey: WuYinKey) => {
    if (isPlaying && selectedTone === toneKey) {
      stopAll();
    } else {
      setSelectedTone(toneKey);
      const tracks = getTracksForTone(toneKey);
      const firstTrackId = tracks.length > 0 ? tracks[0].id : null;
      setSelectedTrackId(firstTrackId);
      startPlaying(toneKey, binauralBeat, modulation as ModulationValue, firstTrackId || undefined);
    }
  }, [isPlaying, selectedTone, binauralBeat, modulation, startPlaying, stopAll]);

  // ---- 定时器自动停止 ----
  useEffect(() => {
    if (isPlaying && timerMinutes > 0 && elapsedSeconds >= timerMinutes * 60) {
      stopAll();
    }
  }, [elapsedSeconds, isPlaying, timerMinutes, stopAll]);

  // ---- 播放状态变化时同步 ----
  useEffect(() => {
    if (!isPlaying && elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  }, [isPlaying]);

  // ---- 清理 ----
  useEffect(() => {
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (energyIntervalRef.current) clearInterval(energyIntervalRef.current);
    };
  }, []);

  // 获取当前选中的音调对象
  const currentTone = FIVE_TONES.find(t => t.key === selectedTone);
  const volPercent = Math.round(volume * 100);

  return (
    <PageContainer theme="healing">
      {/* Header */}
      <HealingHeader
        title="五音疗愈"
        subtitle="角徵宫商羽 · 五行脏腑共振"
      />

      {hasDiagnosis && recommendedTone && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-400/30 flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">荐</span>
          <span className="text-xs text-amber-800 font-serif">基于您的{primaryConstitution}，推荐{ TONE_NAMES[recommendedTone]}音疗愈</span>
        </div>
      )}

      {/* Canvas 可视化区域 - 宣纸暖白背景 */}
      <div className="relative" style={{ height: 280, background: '#FDF8F0' }}>
        <HealingCanvas
          ref={healingCanvasRef}
          energy={audioEnergy}
          analyserNode={analyserState}
          config={HEALING_PRESET_WUYIN}
        />
        {/* 中心音名显示 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {isPlaying && currentTone ? (
              <>
                <div className="text-4xl font-black" style={{ color: currentTone.color }}>{currentTone.char}</div>
                <div className="text-sm mt-1" style={{ color: '#8B7355' }}>{currentTone.mainFreq} Hz · {currentTone.note}</div>
              </>
            ) : (
              <div className="text-3xl font-extralight" style={{ color: '#C4A870' }}>角徵宫商羽</div>
            )}
          </div>
        </div>
        {/* 计时器 */}
        <div className="absolute right-3 top-3 rounded px-2 py-1 font-mono text-xs tabular-nums" style={{ background: 'rgba(253,248,240,0.7)', color: '#8B7355' }}>
          {fmtTime(elapsedSeconds)}
          {timerMinutes > 0 && <span style={{ color: '#B8A080' }}>/{timerMinutes}:00</span>}
        </div>
        {/* 双耳节拍标签 */}
        {isPlaying && binauralBeat > 0 && (
          <div className="absolute left-3 top-3">
            <span className="rounded border px-2 py-1 text-xs" style={{
              borderColor: '#4ADE8050', background: '#4ADE8015', color: '#2D7A4F'
            }}>
              +{binauralBeat}Hz 双耳节拍
            </span>
          </div>
        )}
        {/* 调制标签 */}
        {isPlaying && modulation !== 'none' && (
          <div className="absolute left-3 top-9">
            <span className="rounded border px-2 py-1 text-xs" style={{
              borderColor: '#B8860B50', background: '#B8860B15', color: '#8B6508'
            }}>
              {MODULATIONS.find(m => m.value === modulation)?.name}调制
            </span>
          </div>
        )}
        {/* 播放/暂停/停止/循环 */}
        <div className="absolute bottom-2 left-3 flex items-center gap-2">
          <button
            onClick={() => isPlaying ? stopAll() : (selectedTone ? startPlaying(selectedTone, binauralBeat, modulation as ModulationValue) : startPlaying('gong', 0, 'none'))}
            className="w-10 h-10 rounded-full flex items-center justify-center transition"
            style={{ background: isPlaying ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }}
          >
            {isPlaying ? <Pause size={18} style={{ color: '#B91C1C' }} /> : <Play size={18} style={{ color: '#166534' }} />}
          </button>
          {/* 停止按钮 */}
          <button
            onClick={() => stopAll()}
            disabled={!isPlaying}
            className="w-9 h-9 rounded-full flex items-center justify-center transition disabled:opacity-30"
            style={{ background: 'rgba(92,26,0,0.08)' }}
          >
            <Square size={15} style={{ color: '#5C1A00' }} />
          </button>
          {/* 循环切换 */}
          <button
            onClick={toggleLoop}
            className="w-9 h-9 rounded-full flex items-center justify-center transition"
            style={{ background: isLooping ? 'rgba(34,197,94,0.12)' : 'rgba(92,26,0,0.06)' }}
            title={isLooping ? '循环播放' : '单次播放'}
          >
            {isLooping
              ? <Repeat size={15} style={{ color: '#166534' }} />
              : <RepeatOff size={15} style={{ color: '#8B7355' }} />}
          </button>
        </div>
      </div>

      {/* 音量滑块 */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(to right, #F5EFE0, #EDE4D3)' }}>
        <Volume2 size={16} style={{ color: '#8B7355' }} />
        <input
          type="range" min={0} max={100} value={volPercent}
          onChange={e => setVolume(Number(e.target.value) / 100)}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #B8860B ${volPercent}%, #D4C5A9 ${volPercent}%)` }}
        />
        <span className="text-xs w-8 text-right tabular-nums" style={{ color: '#8B7355' }}>{volPercent}%</span>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28" style={{ background: 'linear-gradient(170deg, #FDF8F0 0%, #F5EFE0 50%, #EDE4D3 100%)' }}>

        {/* 五行疗愈预设 */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: '#8B2500' }} />
            <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>五行疗愈方案</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {WUYIN_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => applyPreset(preset)}
                className="rounded-xl p-3 border text-center transition hover:shadow-md active:scale-95"
                style={{
                  background: isPlaying && selectedTone === preset.tone && binauralBeat === preset.beat
                    ? preset.color + '15' : '#FDF8F0',
                  borderColor: isPlaying && selectedTone === preset.tone && binauralBeat === preset.beat
                    ? preset.color : '#EDE4D3',
                }}
              >
                <div
                  className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-sm font-black"
                  style={{ backgroundColor: preset.color + '18', border: `2px solid ${preset.color}`, color: preset.color }}
                >
                  {preset.icon}
                </div>
                <div className="text-xs font-bold" style={{ color: '#2C1810' }}>{preset.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>{preset.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 五音选择 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>五音选择</h3>
          <div className="grid grid-cols-5 gap-2">
            {FIVE_TONES.map((tone) => {
              const active = isPlaying && selectedTone === tone.key;
              const isRecommended = hasDiagnosis && recommendedTone === tone.key;
              return (
                <button
                  key={tone.key}
                  onClick={() => toggleTone(tone.key)}
                  className="rounded-xl p-2.5 border text-center transition hover:shadow-sm active:scale-95 relative"
                  style={{
                    background: active ? tone.color + '15' : '#FDF8F0',
                    borderColor: active ? tone.color : isRecommended ? tone.color + '60' : '#EDE4D3',
                  }}
                >
                  {isRecommended && !active && (
                    <span className="absolute -top-1 -right-1 text-[8px] px-1 py-px rounded bg-amber-500/25 text-amber-700 font-bold leading-none">荐</span>
                  )}
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-lg font-black"
                    style={{ backgroundColor: tone.color + '18', border: `2px solid ${tone.color}`, color: tone.color }}
                  >
                    {tone.char}
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: '#2C1810' }}>{tone.element}·{tone.organ}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: '#8B7355' }}>{tone.note} {tone.mainFreq}Hz</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ 五行养生音源入口 ═══ */}
        <div className="mb-5">
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
                  <h3 className="font-bold text-sm" style={{ color: '#2C1810' }}>五行养生音源</h3>
                  {loadingWuxing300 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 animate-pulse">加载中</span>
                  ) : extendedTracks.length > 0 ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                      {extendedTracks.length}首可用
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-200 text-gray-500">未配置</span>
                  )}
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>
                  {extendedTracks.length > 0
                    ? `300首中医五行音乐养生 · 已集成${extendedTracks.length}首`
                    : '300首中医五行音乐 · 请将音频放入 F:\\heytcm-audio\\'
                  }
                </p>
              </div>
              {extendedTracks.length > 0 ? (
                <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold text-white transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #5d8a63, #3d7a75)' }}>
                  <Music size={12} />
                  已加载
                </div>
              ) : (
                <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all" style={{ background: '#fff', color: '#8B7355', border: '1px solid #e0d8c8' }}>
                  <FolderOpen size={12} />
                  配置
                </div>
              )}
            </div>
            {/* 展开时显示五行分布 */}
            {extendedTracks.length > 0 && selectedTone && (
              <div className="px-4 pb-3 flex gap-2 flex-wrap">
                {(['jiao', 'zhi', 'gong', 'shang', 'yu'] as const).map((tone) => {
                  const count = extendedTracks.filter(t => t.element === tone).length;
                  const toneColors: Record<string, string> = { jiao: '#5d8a63', zhi: '#c26158', gong: '#c9a94f', shang: '#5ba09a', yu: '#3d7a75' };
                  const toneNames: Record<string, string> = { jiao: '角·木', zhi: '徵·火', gong: '宫·土', shang: '商·金', yu: '羽·水' };
                  return (
                    <span key={tone} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: `${toneColors[tone]}15`, color: toneColors[tone], border: `1px solid ${toneColors[tone]}30` }}>
                      {toneNames[tone]} {count}
                    </span>
                  );
                })}
              </div>
            )}
            {/* 未配置时的配置说明 */}
            {extendedTracks.length === 0 && !loadingWuxing300 && (
              <div className="px-4 pb-3">
                <div className="text-[10px] leading-relaxed rounded-lg p-3" style={{ color: '#8B7355', background: '#fff', border: '1px dashed #d0c8b8' }}>
                  <p className="font-bold mb-1">配置方法：</p>
                  <p>1. 下载百度网盘中的300首五行养生音频</p>
                  <p>2. 按五行分类放入对应目录：</p>
                  <p className="font-mono ml-2 text-[9px]">
                    F:\heytcm-audio\wood\ · fire\ · earth\ · metal\ · water\
                  </p>
                  <p>3. 刷新页面自动识别 · 运行分类脚本：npx tsx scripts/classify-wuxing-audio.ts</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 曲目选择 */}
        {selectedTone && availableTracks.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Music size={14} style={{ color: '#8B2500' }} />
              <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>曲目选择</h3>
              <span className="text-[10px]" style={{ color: '#8B7355' }}>
                {availableTracks.length}首可用
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableTracks.map((track) => {
                const isSelected = selectedTrackId === track.id;
                const inst = INSTRUMENT_INFO[(track as any).instrument as InstrumentType];
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedTrackId(track.id);
                      if (isPlaying && selectedTone) {
                        // Check if it's a wuxing300 external track
                        const extTrack = extendedTracks.find(t => t.id === track.id);
                        // Check if it's a xws track
                        const xwsTrack = xwsTracksCache.find(t => t.id === track.id);
                        if (extTrack) {
                          const audioTrack = createWuyinTrack(selectedTone, extTrack.src);
                          audioTrack.id = extTrack.id;
                          play(audioTrack);
                        } else if (xwsTrack) {
                          const audioTrack = createWuyinTrack(selectedTone, xwsTrack.src);
                          audioTrack.id = xwsTrack.id;
                          play(audioTrack);
                        } else {
                          const audioTrack = createWuyinTrack(selectedTone, undefined, track.id);
                          play(audioTrack);
                        }
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition hover:shadow-sm"
                    style={{
                      background: isSelected ? track.color + '15' : '#FDF8F0',
                      borderColor: isSelected ? track.color : '#EDE4D3',
                    }}
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: track.color + '18', color: track.color }}
                    >
                      {inst?.icon || '音'}
                    </span>
                    <div className="text-left">
                      <div className="font-bold" style={{ color: isSelected ? track.color : '#2C1810' }}>
                        {track.title}
                        {'source' in track && (track as any).source === 'wuxing300' && (
                          <span className="ml-1 text-[8px] px-1 py-0.5 rounded bg-amber-100 text-amber-700">养生</span>
                        )}
                        {'source' in track && (track as {source: string}).source === 'xws' && (
                          <span className="ml-1 text-[8px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-700">穴位</span>
                        )}
                      </div>
                      <div className="text-[9px]" style={{ color: '#8B7355' }}>
                        {(inst as any)?.name || (track as any).instrument || ''} · {track.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 双耳节拍 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>双耳节拍</h3>
          <div className="flex flex-wrap gap-2">
            {BINAURAL_MODES.map((bm) => (
              <button
                key={bm.value}
                onClick={() => {
                  setBinauralBeat(bm.value);
                  if (isPlaying && selectedTone) {
                    startPlaying(selectedTone, bm.value, modulation as ModulationValue);
                  }
                }}
                className="px-3 py-2 rounded-lg border text-xs transition hover:shadow-sm"
                style={{
                  background: binauralBeat === bm.value ? '#2C3E50' : '#FDF8F0',
                  borderColor: binauralBeat === bm.value ? '#2C3E50' : '#EDE4D3',
                  color: binauralBeat === bm.value ? '#FDF8F0' : '#2C1810',
                }}
              >
                <div className="font-bold">{bm.name}</div>
                <div className="text-[10px] opacity-60">{bm.range}</div>
              </button>
            ))}
          </div>
          {binauralBeat > 0 && currentTone && (
            <p className="text-[10px] mt-2 px-3 py-1.5 rounded-lg" style={{ color: '#8B7355', background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
              双耳节拍需佩戴耳机，左耳{currentTone.mainFreq}Hz + 右耳{currentTone.mainFreq + binauralBeat}Hz → 感知{binauralBeat}Hz差频
            </p>
          )}
        </div>

        {/* 波形调制 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>波形调制</h3>
          <div className="flex flex-wrap gap-2">
            {MODULATIONS.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  setModulation(m.value);
                  if (isPlaying && selectedTone) {
                    startPlaying(selectedTone, binauralBeat, m.value);
                  }
                }}
                className="px-3 py-2 rounded-lg border text-xs transition hover:shadow-sm"
                style={{
                  background: modulation === m.value ? '#8B2500' : '#FDF8F0',
                  borderColor: modulation === m.value ? '#8B2500' : '#EDE4D3',
                  color: modulation === m.value ? '#FDF8F0' : '#2C1810',
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* 定时器 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>
            <Timer size={14} className="inline mr-1" />时长
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '不限', value: 0 },
              { label: '5分钟', value: 5 },
              { label: '10分钟', value: 10 },
              { label: '15分钟', value: 15 },
              { label: '20分钟', value: 20 },
              { label: '30分钟', value: 30 },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTimer(t.value)}
                className="px-3 py-1.5 rounded-lg border text-xs transition"
                style={{
                  background: timerMinutes === t.value ? '#B8860B' : '#FDF8F0',
                  borderColor: timerMinutes === t.value ? '#B8860B' : '#EDE4D3',
                  color: timerMinutes === t.value ? '#FDF8F0' : '#2C1810',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 五音原理说明 */}
        <div className="rounded-xl p-4 mb-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
          <h4 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>五音疗愈原理</h4>
          <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>
            《黄帝内经》云："天有五音，人有五脏"。五音疗愈基于"五音入五脏"理论，角(木/肝/E4 329.6Hz)、
            徵(火/心/G4 392Hz)、宫(土/脾/C4 261.6Hz)、商(金/肺/D4 293.7Hz)、羽(水/肾/A4 440Hz)五种音阶与五行脏腑一一对应。
            每个音由主频+副频+泛音三重振荡器合成，模拟古琴泛音的丰富层次。双耳节拍诱导脑波同步，
            波形调制模拟古琴拨弦后的自然衰减，营造沉浸式疗愈声场。
          </p>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
