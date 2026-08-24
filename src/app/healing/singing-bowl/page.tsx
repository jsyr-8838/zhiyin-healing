'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import HealingCanvas, { type HealingCanvasHandle, HEALING_PRESET_BOWL } from '@/components/healing/HealingCanvas';
import { fmtTime } from '@/hooks/useTimer';
import { Play, Pause, Volume2, Timer, Sparkles, Music, Waves, Headphones } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';
import { getBowlGuide, GENERIC_HEALING_GUIDE } from '@/lib/healing-voice-guide';
import {
  BOWL_FREQUENCIES, BINAURAL_MODES, MODULATIONS, SINGING_BOWL_PRESETS,
  AMBIENT_SOUNDSCAPES, BOWL_HIT_SAMPLES, BOWL_RECORDINGS, BOWL_PLAY_MODES,
  type BinauralValue, type ModulationValue, type BowlPlayMode,
} from '@/lib/five-tone-data';
import {
  useAudioService, createBowlTrack, type AudioTrack,
} from '@/lib/audio-service';
import {
  getTracksForBowlFreq, BOWL_TYPE_INFO,
} from '@/lib/healing-music-catalog';
import { useHealingRecommendation } from '@/hooks/useHealingRecommendation';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XIUWEI_GAINS, type WuxingElement } from '@/lib/cultivation-engine';
import { getClientUserId } from '@/lib/auth';
import {
  NEW_HEALING_FREQS, CATEGORY_INFO, FREQ_BY_CATEGORY, type FreqCategory,
} from '@/lib/healing-frequencies-data';

/* ================================================================
 *  颂钵音疗 · 宋韵光色系版
 *  五行颂钵频率 + 双耳节拍 + 波形调制
 *  + 真钵录音 + 敲击音色 + 环境音叠加
 *  + HealingCanvas 宣纸暖白五行声波 + 金色能量粒子
 * ================================================================ */

// ===== 主页面组件 =====
export default function SingingBowlPage() {
  const { hasDiagnosis, recommendedElement, primaryConstitution } = useHealingRecommendation();

  // ---- 音频服务状态 ----
  const {
    isPlaying, currentTrack, volume, binauralBeat, modulation,
    timerMinutes, timerRemaining, isTimerRunning,
    play, pause, stop, closePlayer, togglePlay, setVolume,
    setBinauralBeat, setModulation,
    setTimer, startTimer, stopTimer,
    setQueue, setPlayMode,
    ambientSoundId, ambientVolume, setAmbientSound, setAmbientVolume,
  } = useAudioService();

  // ---- 本地 UI 状态 ----
  const [bowlPlayMode, setBowlPlayMode] = useState<BowlPlayMode>('synth');
  const [selectedFreq, setSelectedFreq] = useState<number | null>(null);
  const [selectedBowlTrackId, setSelectedBowlTrackId] = useState<string | null>(null);
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(null);
  const [selectedHitId, setSelectedHitId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioEnergy, setAudioEnergy] = useState(0);
  const [preludePlaying, setPreludePlaying] = useState(false);
  const [guideText, setGuideText] = useState('');

  // ===== TTS 男声导引 =====
  const tts = useTTS({ defaultGender: 'male', defaultSpeed: 'slow', voiceId: 'zh-CN-YunjianNeural' });
  const ttsRef = useRef(tts);
  ttsRef.current = tts;
  // 待播放参数：导引播完后自动播放音乐
  const pendingPlayRef = useRef<{ freq: number; beat: BinauralValue; mod: ModulationValue; trackId?: string } | null>(null);
  const guideEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- 当前选中频率的可用曲目 ----
  const availableBowlTracks = useMemo(() => {
    if (!selectedFreq) return [];
    return getTracksForBowlFreq(selectedFreq);
  }, [selectedFreq]);

  // ---- Canvas / AnalyserNode 引用 ----
  const healingCanvasRef = useRef<HealingCanvasHandle>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const energyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- 获取 AnalyserNode ----
  useEffect(() => {
    if (isPlaying && !analyserRef.current) {
      import('@/lib/audio-service').then(mod => {
        const node = mod.getAnalyserNode();
        if (node) analyserRef.current = node;
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

  // ---- 统一播放函数（支持三种模式）----
  const startBowl = useCallback((opts?: { recordingId?: string; hitId?: string }) => {
    let track: AudioTrack | null = null;

    if (bowlPlayMode === 'synth') {
      const freq = selectedFreq ?? 432;
      if (!selectedFreq) setSelectedFreq(freq);
      track = createBowlTrack(freq, undefined, selectedBowlTrackId || undefined);
    } else if (bowlPlayMode === 'recording') {
      const recId = opts?.recordingId ?? selectedRecordingId;
      const rec = BOWL_RECORDINGS.find(r => r.id === recId);
      if (!rec) return;
      setSelectedFreq(rec.freq);
      track = {
        id: rec.id, title: rec.name, subtitle: rec.desc,
        src: rec.src, mode: 'singing-bowl', bowlFreq: rec.freq,
        color: rec.color, artwork: '/icon-512.png',
      };
    } else if (bowlPlayMode === 'hit') {
      const hitId = opts?.hitId ?? selectedHitId;
      const hit = BOWL_HIT_SAMPLES.find(h => h.id === hitId);
      if (!hit) return;
      setSelectedFreq(hit.freq);
      track = {
        id: hit.id, title: hit.name, subtitle: hit.desc,
        src: hit.src, mode: 'singing-bowl', bowlFreq: hit.freq,
        color: hit.color, artwork: '/icon-512.png',
        noLoop: true,
      };
    }

    if (!track) return;
    play(track);
    setElapsedSeconds(0);

    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
  }, [bowlPlayMode, selectedFreq, selectedRecordingId, selectedHitId, selectedBowlTrackId, play]);

  // ---- 合成模式：播放颂钵频率 ----
  const startPlaying = useCallback((freq: number, beat: BinauralValue, mod: ModulationValue, trackId?: string) => {
    const track = createBowlTrack(freq, undefined, trackId || selectedBowlTrackId || undefined);

    // ★ 构建颂钵频率队列，播完自动切下一首
    const bowlQueue: AudioTrack[] = BOWL_FREQUENCIES.map(b => createBowlTrack(b.value));
    const startIdx = Math.max(0, BOWL_FREQUENCIES.findIndex(b => b.value === freq));
    setPlayMode('sequence');
    setQueue(bowlQueue, startIdx);
    play(track);
    if (beat !== binauralBeat) setBinauralBeat(beat);
    if (mod !== modulation) setModulation(mod);
    setElapsedSeconds(0);

    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
  }, [play, binauralBeat, modulation, setBinauralBeat, setModulation, selectedBowlTrackId]);

  // ★ 带语音导引的播放（先播男声导引，播完自动进入音乐）
  const startPlayingWithGuide = useCallback((freq: number, beat: BinauralValue, mod: ModulationValue, trackId?: string) => {
    // 停止任何正在进行的导引
    ttsRef.current.stop();
    if (guideEndTimeoutRef.current) { clearTimeout(guideEndTimeoutRef.current); guideEndTimeoutRef.current = null; }

    // 获取导引文案
    const text = getBowlGuide(freq) || GENERIC_HEALING_GUIDE;
    setGuideText(text);
    setPreludePlaying(true);
    pendingPlayRef.current = { freq, beat, mod, trackId };

    // 估算导引时长：中文约 3.5 字/秒（slow 语速 0.5x）
    const charCount = text.replace(/[^\u4e00-\u9fa5]/g, '').length;
    const estimatedMs = Math.max(8000, Math.ceil(charCount / 3.5) * 1000 + 2000);

    // 播放 TTS 导引
    ttsRef.current.speak(text, 0.5);

    // 超时保险：即使 TTS onended 未触发，也按估算时长自动进入音乐
    guideEndTimeoutRef.current = setTimeout(() => {
      setPreludePlaying(false);
      const pending = pendingPlayRef.current;
      pendingPlayRef.current = null;
      if (pending) {
        startPlaying(pending.freq, pending.beat, pending.mod, pending.trackId);
      }
    }, estimatedMs);
  }, [startPlaying]);

  // 跳过导引，直接进入音乐
  const skipPrelude = useCallback(() => {
    ttsRef.current.stop();
    if (guideEndTimeoutRef.current) { clearTimeout(guideEndTimeoutRef.current); guideEndTimeoutRef.current = null; }
    setPreludePlaying(false);
    const pending = pendingPlayRef.current;
    pendingPlayRef.current = null;
    if (pending) {
      startPlaying(pending.freq, pending.beat, pending.mod, pending.trackId);
    }
  }, [startPlaying]);

  // ---- 停止播放 ----
  const stopAll = useCallback(() => {
    stop();
    ttsRef.current.stop();
    if (guideEndTimeoutRef.current) { clearTimeout(guideEndTimeoutRef.current); guideEndTimeoutRef.current = null; }
    setPreludePlaying(false);
    pendingPlayRef.current = null;
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
    setElapsedSeconds(0);
  }, [stop]);

  // ---- 预设点击 ----
  const applyPreset = useCallback((preset: typeof SINGING_BOWL_PRESETS[number]) => {
    const freq = preset.freq ?? 432;
    setSelectedFreq(freq);
    setTimer(preset.timer);
    startPlayingWithGuide(freq, preset.beat, preset.mod);
  }, [startPlayingWithGuide, setTimer]);

  // ---- 频率点击 ----
  const toggleFreq = useCallback((freq: number) => {
    if (isPlaying && selectedFreq === freq) {
      stopAll();
    } else {
      setSelectedFreq(freq);
      const tracks = getTracksForBowlFreq(freq);
      const firstTrackId = tracks.length > 0 ? tracks[0].id : null;
      setSelectedBowlTrackId(firstTrackId);
      startPlayingWithGuide(freq, binauralBeat, modulation as ModulationValue, firstTrackId || undefined);
    }
  }, [isPlaying, selectedFreq, binauralBeat, modulation, startPlayingWithGuide, stopAll]);

  // ---- 切换播放模式 ----
  const switchPlayMode = useCallback((mode: BowlPlayMode) => {
    if (isPlaying) stopAll();
    setBowlPlayMode(mode);
    if (mode === 'recording' && !selectedRecordingId) {
      setSelectedRecordingId(BOWL_RECORDINGS[0]?.id ?? null);
    }
    if (mode === 'hit' && !selectedHitId) {
      setSelectedHitId(BOWL_HIT_SAMPLES[0]?.id ?? null);
    }
  }, [isPlaying, stopAll, selectedRecordingId, selectedHitId]);

  // ---- 定时器自动停止 ----
  useEffect(() => {
    if (isPlaying && timerMinutes > 0 && elapsedSeconds >= timerMinutes * 60) {
      stopAll();
    }
  }, [elapsedSeconds, isPlaying, timerMinutes, stopAll]);

  // ---- 颂钵疗愈≥5分钟：记录修为（深度集成） ----
  useEffect(() => {
    if (isPlaying && selectedFreq && elapsedSeconds > 0 && elapsedSeconds % 300 === 0) {
      const currentBowlEl = currentBowl?.element as WuxingElement | undefined;
      if (!currentBowlEl) return;
      const gain = XIUWEI_GAINS.songbo_complete;
      try {
        useCultivationStore.getState().addXiuWei(currentBowlEl, gain);
        useCultivationStore.getState().recordPractice('songbo', 300, currentBowlEl, gain);
        useCultivationStore.getState().completeTodayStep('songbo');
        fetch('/api/cultivation/practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: getClientUserId(),
            category: 'songbo',
            subCategory: String(selectedFreq),
            element: currentBowlEl,
            durationSec: 300,
          }),
        }).catch(() => {});
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSeconds, isPlaying, selectedFreq]);

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
      if (guideEndTimeoutRef.current) clearTimeout(guideEndTimeoutRef.current);
      ttsRef.current.stop();
      // 切页时完全关闭播放器（清除 currentTrack → 迷你播放器消失）
      closePlayer();
    };
  }, []);

  // 当前选中频率对应的钵数据
  const currentBowl = BOWL_FREQUENCIES.find(b => b.value === selectedFreq);
  const volPercent = Math.round(volume * 100);
  const ambientPercent = Math.round(ambientVolume * 100);
  const currentAmbient = AMBIENT_SOUNDSCAPES.find(s => s.id === ambientSoundId);

  return (
    <PageContainer theme="healing" noShanshui>
      <HealingHeader title="颂钵音疗" subtitle="五行频率 · 双耳节拍 · 声波共振" />

      {hasDiagnosis && recommendedElement && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-400/30 flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">荐</span>
          <span className="text-xs text-amber-800 font-serif">基于您的{primaryConstitution}，推荐{recommendedElement === 'wood' ? '木' : recommendedElement === 'fire' ? '火' : recommendedElement === 'earth' ? '土' : recommendedElement === 'metal' ? '金' : '水'}行颂钵</span>
        </div>
      )}

      {/* Canvas 可视化区域 - 宣纸暖白背景 */}
      <div className="relative" style={{ height: 220, background: 'linear-gradient(180deg, #FDF8F0 0%, #F5EFE0 100%)', borderRadius: 12, margin: '8px 8px 0', boxShadow: 'inset 0 0 12px rgba(196,168,112,0.08)' }}>
        <HealingCanvas
          ref={healingCanvasRef}
          energy={audioEnergy}
          config={HEALING_PRESET_BOWL}
        />
        {/* 中心频率显示 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {isPlaying && selectedFreq ? (
              <>
                <div className="text-3xl font-extralight tabular-nums tracking-tight sm:text-4xl" style={{ color: '#5C1A00' }}>
                  {selectedFreq}
                  <span className="ml-1 text-sm sm:text-lg" style={{ color: '#8B7355' }}>Hz</span>
                </div>
                {currentBowl && (
                  <div className="text-sm mt-1" style={{ color: '#8B7355' }}>{currentBowl.name} · {currentBowl.element}·{currentBowl.organ}</div>
                )}
                {bowlPlayMode !== 'synth' && (
                  <div className="text-[10px] mt-0.5" style={{ color: '#B8860B' }}>
                    {BOWL_PLAY_MODES.find(m => m.value === bowlPlayMode)?.name}模式
                  </div>
                )}
              </>
            ) : (
              <div className="text-3xl font-extralight" style={{ color: '#C4A870' }}>颂钵音疗</div>
            )}
          </div>
        </div>
        {/* 计时器 */}
        <div className="absolute right-3 top-3 rounded px-2 py-1 font-mono text-xs tabular-nums" style={{ background: 'rgba(253,248,240,0.7)', color: '#8B7355' }}>
          {fmtTime(elapsedSeconds)}
          {timerMinutes > 0 && <span style={{ color: '#B8A080' }}>/{timerMinutes}:00</span>}
        </div>
        {/* 环境音标签 */}
        {isPlaying && ambientSoundId !== 'none' && currentAmbient && (
          <div className="absolute right-3 top-10">
            <span className="rounded border px-2 py-1 text-xs" style={{
              borderColor: currentAmbient.color + '50', background: currentAmbient.color + '15', color: currentAmbient.color
            }}>
              {currentAmbient.icon} {currentAmbient.name}
            </span>
          </div>
        )}
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
        {/* 播放/暂停 */}
        <div className="absolute bottom-2 left-3">
          <button
            onClick={() => isPlaying ? stopAll() : (bowlPlayMode === 'synth' ? (selectedFreq ? startPlayingWithGuide(selectedFreq, binauralBeat, modulation as ModulationValue, selectedBowlTrackId || undefined) : startPlayingWithGuide(432, binauralBeat, modulation as ModulationValue)) : startBowl())}
            className="w-11 h-11 rounded-full flex items-center justify-center transition active:scale-90"
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, #c2615830, #c2615815)'
                : 'linear-gradient(135deg, #5d8a6330, #5d8a6315)',
              border: `1px solid ${isPlaying ? '#c2615850' : '#5d8a6350'}`,
            }}
          >
            {isPlaying ? <Pause size={18} style={{ color: '#B91C1C' }} /> : <Play size={18} style={{ color: '#166534' }} />}
          </button>
        </div>
      </div>

      {/* 音量滑块 */}
      <div className="px-4 py-3 flex items-center gap-3 mx-2" style={{ background: 'linear-gradient(to right, #F5EFE0, #EDE4D3)', borderRadius: 12, marginTop: 4 }}>
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

        {/* 播放模式选择 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>播放模式</h3>
          <div className="grid grid-cols-3 gap-2">
            {BOWL_PLAY_MODES.map((mode) => {
              const active = bowlPlayMode === mode.value;
              return (
                <button
                  key={mode.value}
                  onClick={() => switchPlayMode(mode.value)}
                  className="rounded-xl p-3 border text-center transition hover:shadow-md active:scale-95"
                  style={{
                    background: active ? '#5C1A00' : '#FDF8F0',
                    borderColor: active ? '#5C1A00' : '#EDE4D3',
                    color: active ? '#FDF8F0' : '#2C1810',
                  }}
                >
                  <div className="text-lg mb-0.5" style={{ color: active ? '#E0C060' : '#8B2500' }}>{mode.icon}</div>
                  <div className="text-xs font-bold">{mode.name}</div>
                  <div className="text-[9px] mt-0.5 opacity-70">{mode.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* === 合成音模式 === */}
        {bowlPlayMode === 'synth' && (
          <>
            {/* 中医五行预设 */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} style={{ color: '#8B2500' }} />
                <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>五行疗愈方案</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {SINGING_BOWL_PRESETS.map((preset, i) => {
                  const freq = preset.freq ?? 432;
                  const isActive = isPlaying && selectedFreq === freq && binauralBeat === preset.beat;
                  return (
                    <button
                      key={i}
                      onClick={() => applyPreset(preset)}
                      className="rounded-xl p-3 border text-center transition hover:shadow-md active:scale-95"
                      style={{
                        background: isActive ? preset.color + '15' : '#FDF8F0',
                        borderColor: isActive ? preset.color : '#EDE4D3',
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
                  );
                })}
              </div>
            </div>

            {/* 频率选择 */}
            <div className="mb-5">
              <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>频率选择</h3>
              <div className="grid grid-cols-5 gap-2">
                {BOWL_FREQUENCIES.map((bf) => {
                  const active = isPlaying && selectedFreq === bf.value;
                  const ELEMENT_CN: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
                  const isRecommended = hasDiagnosis && recommendedElement && ELEMENT_CN[recommendedElement] === bf.element;
                  return (
                    <button
                      key={bf.value}
                      onClick={() => toggleFreq(bf.value)}
                      className="rounded-lg p-2 border text-center transition hover:shadow-sm active:scale-95 relative"
                      style={{
                        background: active ? bf.color + '15' : '#FDF8F0',
                        borderColor: active ? bf.color : isRecommended ? bf.color + '60' : '#EDE4D3',
                      }}
                    >
                      {isRecommended && !active && (
                        <span className="absolute -top-1 -right-1 text-[8px] px-1 py-px rounded bg-amber-500/25 text-amber-700 font-bold leading-none">荐</span>
                      )}
                      <div
                        className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-black"
                        style={{ backgroundColor: bf.color + '18', border: `2px solid ${bf.color}`, color: bf.color }}
                      >
                        {bf.icon}
                      </div>
                      <div className="text-[10px] font-bold" style={{ color: '#2C1810' }}>{bf.value}</div>
                      <div className="text-[8px]" style={{ color: '#8B7355' }}>{bf.element}·{bf.organ}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 颂钵曲目选择 */}
            {selectedFreq && availableBowlTracks.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-3">
                  <Music size={14} style={{ color: '#8B2500' }} />
                  <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>钵体选择</h3>
                  <span className="text-[10px]" style={{ color: '#8B7355' }}>
                    {availableBowlTracks.length}种可用
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableBowlTracks.map((track) => {
                    const isSelected = selectedBowlTrackId === track.id;
                    const bowlInfo = BOWL_TYPE_INFO[track.bowlType];
                    return (
                      <button
                        key={track.id}
                        onClick={() => {
                          setSelectedBowlTrackId(track.id);
                          if (isPlaying && selectedFreq) {
                            const audioTrack = createBowlTrack(selectedFreq, undefined, track.id);
                            play(audioTrack);
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
                          {bowlInfo?.icon || '钵'}
                        </span>
                        <div className="text-left">
                          <div className="font-bold" style={{ color: isSelected ? track.color : '#2C1810' }}>
                            {track.title}
                          </div>
                          <div className="text-[9px]" style={{ color: '#8B7355' }}>
                            {bowlInfo?.name || track.bowlType} · {track.subtitle}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 扩展疗愈频率（healing-frequencies 项目） */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} style={{ color: '#8B2500' }} />
                <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>扩展疗愈频率</h3>
              </div>
              <p className="text-[10px] mb-3" style={{ color: '#8B7355' }}>
                healing-frequencies 项目·11类频率·{NEW_HEALING_FREQS.length}个新增频率
              </p>
              <div className="space-y-3">
                {(Object.keys(FREQ_BY_CATEGORY) as FreqCategory[]).map((cat) => {
                  const info = CATEGORY_INFO[cat];
                  const freqs = FREQ_BY_CATEGORY[cat];
                  return (
                    <div key={cat} className="rounded-xl p-3" style={{ background: '#FDF8F0', border: `1px solid ${info.color}20` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: info.color + '18', border: `1.5px solid ${info.color}`, color: info.color }}
                        >
                          {info.icon}
                        </div>
                        <div>
                          <div className="font-bold text-xs" style={{ color: '#2C1810' }}>{info.cn}</div>
                          <div className="text-[9px]" style={{ color: '#8B7355' }}>{info.desc}</div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {freqs.map((f, j) => (
                          <button
                            key={j}
                            onClick={() => toggleFreq(f.f)}
                            className="px-2 py-1 rounded-lg text-[10px] font-mono tabular-nums transition hover:shadow-sm"
                            style={{
                              background: selectedFreq === f.f ? info.color + '30' : info.color + '10',
                              border: `1px solid ${info.color}30`,
                              color: selectedFreq === f.f ? info.color : '#2C1810',
                              fontWeight: selectedFreq === f.f ? 'bold' : 'normal',
                            }}
                          >
                            {f.f}Hz
                            <span className="ml-1 text-[8px] opacity-60">{f.cn}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 双耳节拍 */}
            <div className="mb-5">
              <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>双耳节拍</h3>
              <div className="flex flex-wrap gap-2">
                {BINAURAL_MODES.map((bm) => (
                  <button
                    key={bm.value}
                    onClick={() => {
                      setBinauralBeat(bm.value);
                      if (isPlaying && selectedFreq) {
                        startPlaying(selectedFreq, bm.value, modulation as ModulationValue);
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
              {binauralBeat > 0 && (
                <p className="text-[10px] mt-2 px-3 py-1.5 rounded-lg" style={{ color: '#8B7355', background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
                  双耳节拍需佩戴耳机，左耳{selectedFreq || '???'}Hz + 右耳{(selectedFreq || 0) + binauralBeat}Hz → 感知{binauralBeat}Hz差频
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
                      if (isPlaying && selectedFreq) {
                        startPlaying(selectedFreq, binauralBeat, m.value);
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
          </>
        )}

        {/* === 真钵录音模式 === */}
        {bowlPlayMode === 'recording' && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Music size={16} style={{ color: '#8B2500' }} />
              <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>真钵录音</h3>
              <span className="text-[10px]" style={{ color: '#8B7355' }}>真实颂钵·自然共鸣</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {BOWL_RECORDINGS.map((rec) => {
                const active = selectedRecordingId === rec.id;
                return (
                  <button
                    key={rec.id}
                    onClick={() => {
                      setSelectedRecordingId(rec.id);
                      setSelectedFreq(rec.freq);
                      startBowl({ recordingId: rec.id });
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl border text-left transition hover:shadow-md active:scale-95"
                    style={{
                      background: active ? rec.color + '15' : '#FDF8F0',
                      borderColor: active ? rec.color : '#EDE4D3',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: rec.color + '18', border: `2px solid ${rec.color}`, color: rec.color }}
                    >
                      钵
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color: active ? rec.color : '#2C1810' }}>{rec.name}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>{rec.desc}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#B8860B' }}>{rec.freq}Hz</div>
                    </div>
                    {active && isPlaying && <Pause size={16} style={{ color: rec.color }} />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* === 敲击音色模式 === */}
        {bowlPlayMode === 'hit' && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Music size={16} style={{ color: '#8B2500' }} />
              <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>敲击音色</h3>
              <span className="text-[10px]" style={{ color: '#8B7355' }}>槌击起音·自然衰减</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {BOWL_HIT_SAMPLES.map((hit) => {
                const active = selectedHitId === hit.id;
                const typeIcon = hit.id.includes('crystal') ? '晶' : hit.id.includes('bowl') ? '藏' : '铜';
                return (
                  <button
                    key={hit.id}
                    onClick={() => {
                      setSelectedHitId(hit.id);
                      setSelectedFreq(hit.freq);
                      startBowl({ hitId: hit.id });
                    }}
                    className="flex items-center gap-2 p-2.5 rounded-lg border text-left transition hover:shadow-sm active:scale-95"
                    style={{
                      background: active ? hit.color + '15' : '#FDF8F0',
                      borderColor: active ? hit.color : '#EDE4D3',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                      style={{ backgroundColor: hit.color + '18', color: hit.color }}
                    >
                      {typeIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate" style={{ color: active ? hit.color : '#2C1810' }}>{hit.name}</div>
                      <div className="text-[9px] truncate" style={{ color: '#8B7355' }}>{hit.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 环境音叠加 */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Waves size={16} style={{ color: '#8B2500' }} />
            <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>环境音叠加</h3>
            {ambientSoundId !== 'none' && currentAmbient && (
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: currentAmbient.color + '20', color: currentAmbient.color }}>
                {currentAmbient.name}
              </span>
            )}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {AMBIENT_SOUNDSCAPES.map((sc) => {
              const active = ambientSoundId === sc.id;
              return (
                <button
                  key={sc.id}
                  onClick={() => setAmbientSound(sc.id)}
                  className="rounded-lg p-2 border text-center transition hover:shadow-sm active:scale-95"
                  style={{
                    background: active ? sc.color + '15' : '#FDF8F0',
                    borderColor: active ? sc.color : '#EDE4D3',
                  }}
                >
                  <div className="text-lg mb-0.5" style={{ color: sc.color }}>{sc.icon}</div>
                  <div className="text-[10px] font-bold" style={{ color: active ? sc.color : '#2C1810' }}>{sc.name}</div>
                </button>
              );
            })}
          </div>
          {ambientSoundId !== 'none' && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-lg" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
              <Volume2 size={12} style={{ color: '#8B7355' }} />
              <input
                type="range" min={0} max={100} value={ambientPercent}
                onChange={e => setAmbientVolume(Number(e.target.value) / 100)}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #8B7355 ${ambientPercent}%, #D4C5A9 ${ambientPercent}%)` }}
              />
              <span className="text-[10px] w-8 text-right tabular-nums" style={{ color: '#8B7355' }}>{ambientPercent}%</span>
            </div>
          )}
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

        {/* 科学说明 */}
        <div className="rounded-xl p-4 mb-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
          <h4 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>颂钵音疗原理</h4>
          <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>
            颂钵音疗运用特定频率作用于人体，通过共振原理影响生理机能。中医认为"五音入五脏"，
            角(木/肝)、徵(火/心)、宫(土/脾)、商(金/肺)、羽(水/肾)五种音阶与五行脏腑对应。
            双耳节拍技术通过左右耳频率差诱导脑波同步，德尔塔波助眠、西塔波助冥想、阿尔法波助放松、贝塔波助专注。
            波形调制模拟颂钵敲击后的自然衰减，营造更真实的音疗体验。真钵录音与敲击音色源自真实颂钵，
            环境音叠加层可与主音并行播放，营造沉浸式疗愈氛围。
            扩展疗愈频率来自 healing-frequencies 项目（MIT, Olivier Guilieri），
            包含索尔菲吉欧扩展、基础疗愈、器官共振、矿物频率、唵音、宇宙八度、天使频率、
            特斯拉369、舒曼共振、DNA修复等11类频率。
          </p>
        </div>
      </div>

      {/* ===== 前奏导引浮层 — 沉浸聆听男声引导 ===== */}
      {preludePlaying && selectedFreq && currentBowl && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{
            background: `radial-gradient(ellipse at center, ${currentBowl.color}15 0%, rgba(253,248,240,0.96) 50%, rgba(253,248,240,0.88) 100%)`,
            backdropFilter: 'blur(8px)',
          }}>
          {/* 颁钵图标 */}
          <div className="font-black font-serif mb-4" style={{
            fontSize: 88,
            color: currentBowl.color,
            textShadow: `0 0 48px ${currentBowl.color}50, 0 0 96px ${currentBowl.color}25`,
            lineHeight: 1,
          }}>
            {currentBowl.icon}
          </div>

          {/* 颁钵信息 */}
          <div className="text-base font-bold mb-1 tracking-wide" style={{ color: '#5C1A00' }}>
            {currentBowl.name}
          </div>
          <div className="text-sm mb-2" style={{ color: '#8B7355' }}>
            {currentBowl.value}Hz · {currentBowl.element}行·{currentBowl.organ}
          </div>

          {/* 引导状态指示 */}
          <div className="flex items-center justify-center gap-2 mb-1" style={{ color: currentBowl.color }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: currentBowl.color }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: currentBowl.color }} />
            </span>
            <span className="text-sm font-bold tracking-widest">正在深度引导</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-8 text-xs" style={{ color: '#8B7355' }}>
            <Headphones size={12} />
            <span>请闭目聆听，跟随引导放松身心</span>
          </div>

          {/* 跳过按钮 */}
          <button onClick={skipPrelude}
            className="px-6 py-2.5 rounded-full text-xs font-bold transition active:scale-95"
            style={{
              background: currentBowl.color + '15',
              border: `1px solid ${currentBowl.color}40`,
              color: currentBowl.color,
              boxShadow: `0 0 16px ${currentBowl.color}10`,
            }}>
            跳过引导，直接开始
          </button>
        </div>
      )}

      <BottomNav />
    </PageContainer>
  );
}
