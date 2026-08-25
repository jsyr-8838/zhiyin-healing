'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import HealingCanvas, { type HealingCanvasHandle, HEALING_PRESET_BOWL } from '@/components/healing/HealingCanvas';
import { fmtTime } from '@/hooks/useTimer';
import { Play, Pause, Volume2, Timer, Sparkles, Music, Waves, Headphones, ChevronDown, ChevronRight } from 'lucide-react';
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
 *  颂钵音疗 · 前卫沉浸式重设计
 *  五行颂钵频率 + 双耳节拍 + 波形调制
 *  + 真钵录音 + 敲击音色 + 环境音叠加
 *  + 深色舞台 + 径向频率 + 分层手风琴
 * ================================================================ */

// ===== 主页面组件 =====
export default function SingingBowlPage() {
  const { hasDiagnosis, recommendedElement, primaryConstitution } = useHealingRecommendation();

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
  const [expandedSection, setExpandedSection] = useState<string | null>('presets');

  // ===== TTS 男声导引 =====
  const tts = useTTS({ defaultGender: 'male', defaultSpeed: 'slow', voiceId: 'zh-CN-YunjianNeural' });
  const ttsRef = useRef(tts);
  ttsRef.current = tts;
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

  useEffect(() => {
    if (isPlaying && !analyserRef.current) {
      import('@/lib/audio-service').then(mod => {
        const node = mod.getAnalyserNode();
        if (node) analyserRef.current = node;
      });
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) { setAudioEnergy(0); return; }
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
    return () => { if (energyIntervalRef.current) clearInterval(energyIntervalRef.current); };
  }, [isPlaying]);

  // ---- 统一播放函数 ----
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
      track = { id: rec.id, title: rec.name, subtitle: rec.desc, src: rec.src, mode: 'singing-bowl', bowlFreq: rec.freq, color: rec.color, artwork: '/icon-512.png' };
    } else if (bowlPlayMode === 'hit') {
      const hitId = opts?.hitId ?? selectedHitId;
      const hit = BOWL_HIT_SAMPLES.find(h => h.id === hitId);
      if (!hit) return;
      setSelectedFreq(hit.freq);
      track = { id: hit.id, title: hit.name, subtitle: hit.desc, src: hit.src, mode: 'singing-bowl', bowlFreq: hit.freq, color: hit.color, artwork: '/icon-512.png', noLoop: true };
    }
    if (!track) return;
    play(track);
    setElapsedSeconds(0);
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => { setElapsedSeconds(s => s + 1); }, 1000);
  }, [bowlPlayMode, selectedFreq, selectedRecordingId, selectedHitId, selectedBowlTrackId, play]);

  const startPlaying = useCallback((freq: number, beat: BinauralValue, mod: ModulationValue, trackId?: string) => {
    const track = createBowlTrack(freq, undefined, trackId || selectedBowlTrackId || undefined);
    const bowlQueue: AudioTrack[] = BOWL_FREQUENCIES.map(b => createBowlTrack(b.value));
    const startIdx = Math.max(0, BOWL_FREQUENCIES.findIndex(b => b.value === freq));
    setPlayMode('sequence');
    setQueue(bowlQueue, startIdx);
    play(track);
    if (beat !== binauralBeat) setBinauralBeat(beat);
    if (mod !== modulation) setModulation(mod);
    setElapsedSeconds(0);
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => { setElapsedSeconds(s => s + 1); }, 1000);
  }, [play, binauralBeat, modulation, setBinauralBeat, setModulation, selectedBowlTrackId]);

  const startPlayingWithGuide = useCallback((freq: number, beat: BinauralValue, mod: ModulationValue, trackId?: string) => {
    ttsRef.current.stop();
    if (guideEndTimeoutRef.current) { clearTimeout(guideEndTimeoutRef.current); guideEndTimeoutRef.current = null; }
    const text = getBowlGuide(freq) || GENERIC_HEALING_GUIDE;
    setGuideText(text);
    setPreludePlaying(true);
    pendingPlayRef.current = { freq, beat, mod, trackId };
    const charCount = text.replace(/[^\u4e00-\u9fa5]/g, '').length;
    const estimatedMs = Math.max(8000, Math.ceil(charCount / 3.5) * 1000 + 2000);
    ttsRef.current.speak(text, 0.5, 0.7);
    guideEndTimeoutRef.current = setTimeout(() => {
      setPreludePlaying(false);
      const pending = pendingPlayRef.current;
      pendingPlayRef.current = null;
      if (pending) startPlaying(pending.freq, pending.beat, pending.mod, pending.trackId);
    }, estimatedMs);
  }, [startPlaying]);

  const skipPrelude = useCallback(() => {
    ttsRef.current.stop();
    if (guideEndTimeoutRef.current) { clearTimeout(guideEndTimeoutRef.current); guideEndTimeoutRef.current = null; }
    setPreludePlaying(false);
    const pending = pendingPlayRef.current;
    pendingPlayRef.current = null;
    if (pending) startPlaying(pending.freq, pending.beat, pending.mod, pending.trackId);
  }, [startPlaying]);

  const stopAll = useCallback(() => {
    stop();
    ttsRef.current.stop();
    if (guideEndTimeoutRef.current) { clearTimeout(guideEndTimeoutRef.current); guideEndTimeoutRef.current = null; }
    setPreludePlaying(false);
    pendingPlayRef.current = null;
    if (elapsedIntervalRef.current) { clearInterval(elapsedIntervalRef.current); elapsedIntervalRef.current = null; }
    setElapsedSeconds(0);
  }, [stop]);

  const applyPreset = useCallback((preset: typeof SINGING_BOWL_PRESETS[number]) => {
    const freq = preset.freq ?? 432;
    setSelectedFreq(freq);
    setTimer(preset.timer);
    startPlayingWithGuide(freq, preset.beat, preset.mod);
  }, [startPlayingWithGuide, setTimer]);

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

  const switchPlayMode = useCallback((mode: BowlPlayMode) => {
    if (isPlaying) stopAll();
    setBowlPlayMode(mode);
    if (mode === 'recording' && !selectedRecordingId) setSelectedRecordingId(BOWL_RECORDINGS[0]?.id ?? null);
    if (mode === 'hit' && !selectedHitId) setSelectedHitId(BOWL_HIT_SAMPLES[0]?.id ?? null);
  }, [isPlaying, stopAll, selectedRecordingId, selectedHitId]);

  useEffect(() => {
    if (isPlaying && timerMinutes > 0 && elapsedSeconds >= timerMinutes * 60) stopAll();
  }, [elapsedSeconds, isPlaying, timerMinutes, stopAll]);

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
          body: JSON.stringify({ userId: getClientUserId(), category: 'songbo', subCategory: String(selectedFreq), element: currentBowlEl, durationSec: 300 }),
        }).catch(() => {});
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSeconds, isPlaying, selectedFreq]);

  useEffect(() => {
    if (!isPlaying && elapsedIntervalRef.current) { clearInterval(elapsedIntervalRef.current); elapsedIntervalRef.current = null; }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (energyIntervalRef.current) clearInterval(energyIntervalRef.current);
      if (guideEndTimeoutRef.current) clearTimeout(guideEndTimeoutRef.current);
      ttsRef.current.stop();
      closePlayer();
    };
  }, []);

  const currentBowl = BOWL_FREQUENCIES.find(b => b.value === selectedFreq);
  const volPercent = Math.round(volume * 100);
  const ambientPercent = Math.round(ambientVolume * 100);
  const currentAmbient = AMBIENT_SOUNDSCAPES.find(s => s.id === ambientSoundId);

  // 手风琴展开/收起
  const toggleSection = (key: string) => {
    setExpandedSection(prev => prev === key ? null : key);
  };

  return (
    <PageContainer theme="healing" noShanshui>
      <HealingHeader title="颂钵音疗" subtitle="五行频率 · 双耳节拍 · 声波共振" />

      {hasDiagnosis && recommendedElement && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-400/30 flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">荐</span>
          <span className="text-xs text-amber-800 font-serif">基于您的{primaryConstitution}，推荐{recommendedElement === 'wood' ? '木' : recommendedElement === 'fire' ? '火' : recommendedElement === 'earth' ? '土' : recommendedElement === 'metal' ? '金' : '水'}行颂钵</span>
        </div>
      )}

      {/* ═══ 深色沉浸式可视化舞台 ═══ */}
      <div className="relative overflow-hidden mx-2 mt-2" style={{
        height: 280,
        borderRadius: 24,
        background: 'radial-gradient(ellipse at 50% 30%, #1A1208 0%, #0F0A06 50%, #080503 100%)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 0 1px rgba(212,175,55,0.1), inset 0 1px 0 rgba(212,175,55,0.06)',
      }}>
        {/* 莲花光能背景层 */}
        <img
          src="/images/healing/lotus-light.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          style={{ opacity: 0.35, mixBlendMode: 'screen' }}
        />

        {/* Canvas 可视化 */}
        <div className="absolute inset-0" style={{ opacity: 0.65 }}>
          <HealingCanvas ref={healingCanvasRef} energy={audioEnergy} config={HEALING_PRESET_BOWL} />
        </div>

        {/* 中心频率大字 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {isPlaying && selectedFreq ? (
              <>
                <div className="font-extralight tabular-nums tracking-tight" style={{
                  fontSize: 60, lineHeight: 1,
                  color: currentBowl?.color || '#D4AF37',
                  textShadow: `0 0 28px ${(currentBowl?.color || '#D4AF37')}55, 0 0 56px ${(currentBowl?.color || '#D4AF37')}25, 0 2px 8px rgba(0,0,0,0.6)`,
                }}>
                  {selectedFreq}
                  <span className="text-xl ml-1 font-extralight" style={{ color: '#D4AF37', opacity: 0.6 }}>Hz</span>
                </div>
                {currentBowl && (
                  <div className="text-sm mt-3 font-serif" style={{ color: 'rgba(212,175,55,0.7)', letterSpacing: '0.15em', textShadow: '0 0 12px rgba(212,175,55,0.2)' }}>
                    {currentBowl.name} · {currentBowl.element}·{currentBowl.organ}
                  </div>
                )}
                {bowlPlayMode !== 'synth' && (
                  <div className="text-[10px] mt-2 inline-block px-2.5 py-0.5 rounded-full" style={{
                    background: 'rgba(212,175,55,0.08)',
                    border: '1px solid rgba(212,175,55,0.15)',
                    color: 'rgba(232,197,71,0.8)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  }}>
                    {BOWL_PLAY_MODES.find(m => m.value === bowlPlayMode)?.name}模式
                  </div>
                )}
              </>
            ) : (
              <div className="text-xl font-extralight tracking-[0.35em]" style={{ color: 'rgba(212,175,55,0.4)', textShadow: '0 0 24px rgba(212,175,55,0.15)' }}>选择频率</div>
            )}
          </div>
        </div>

        {/* 计时器 */}
        <div className="absolute right-3 top-3 rounded-xl px-3 py-1.5 font-mono text-xs tabular-nums"
          style={{ background: 'rgba(15,10,6,0.7)', backdropFilter: 'blur(16px) saturate(1.2)', border: '1px solid rgba(212,175,55,0.12)', color: 'rgba(212,175,55,0.85)', boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(212,175,55,0.05)' }}>
          {fmtTime(elapsedSeconds)}
          {timerMinutes > 0 && <span style={{ color: 'rgba(212,175,55,0.4)' }}>/{timerMinutes}:00</span>}
        </div>

        {/* 环境音标签 */}
        {isPlaying && ambientSoundId !== 'none' && currentAmbient && (
          <div className="absolute right-3 top-10">
            <span className="rounded-xl px-2.5 py-1 text-xs" style={{
              background: `${currentAmbient.color}10`, backdropFilter: 'blur(16px) saturate(1.2)',
              border: `1px solid ${currentAmbient.color}30`, color: currentAmbient.color,
              boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
              {currentAmbient.icon} {currentAmbient.name}
            </span>
          </div>
        )}

        {/* 双耳节拍 + 调制标签 */}
        {isPlaying && binauralBeat > 0 && (
          <div className="absolute left-3 top-3 flex flex-col gap-1">
            <span className="rounded-xl px-2.5 py-1 text-xs font-bold" style={{
              background: 'rgba(74,222,128,0.12)', backdropFilter: 'blur(16px) saturate(1.2)',
              border: '1px solid rgba(74,222,128,0.25)', color: 'rgba(74,222,128,0.85)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(74,222,128,0.08)',
            }}>+{binauralBeat}Hz</span>
            {modulation !== 'none' && (
              <span className="rounded-xl px-2.5 py-1 text-xs" style={{
                background: 'rgba(212,175,55,0.10)', backdropFilter: 'blur(16px) saturate(1.2)',
                border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(232,197,71,0.8)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.3)',
              }}>{MODULATIONS.find(m => m.value === modulation)?.name}</span>
            )}
          </div>
        )}

        {/* 播放/暂停 — 悬浮按钮 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
          <button
            onClick={() => isPlaying ? stopAll() : (bowlPlayMode === 'synth' ? (selectedFreq ? startPlayingWithGuide(selectedFreq, binauralBeat, modulation as ModulationValue, selectedBowlTrackId || undefined) : startPlayingWithGuide(432, binauralBeat, modulation as ModulationValue)) : startBowl())}
            className="w-14 h-14 rounded-full flex items-center justify-center transition active:scale-90"
            style={{
              background: isPlaying ? 'linear-gradient(135deg, rgba(220,38,38,0.25), rgba(220,38,38,0.08))' : 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.08))',
              border: `1.5px solid ${isPlaying ? 'rgba(220,38,38,0.35)' : 'rgba(34,197,94,0.35)'}`,
              backdropFilter: 'blur(16px) saturate(1.2)',
              boxShadow: isPlaying ? '0 0 20px rgba(220,38,38,0.25), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(220,38,38,0.08)' : '0 0 20px rgba(34,197,94,0.25), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(34,197,94,0.08)',
            }}>
            {isPlaying ? <Pause size={22} style={{ color: 'rgba(248,113,113,0.9)' }} /> : <Play size={22} style={{ color: 'rgba(74,222,128,0.9)' }} />}
          </button>
        </div>
      </div>

      {/* ═══ 音量滑块 ═══ */}
      <div className="mx-2 mt-2 px-4 py-3 flex items-center gap-3"
        style={{ background: 'rgba(253,248,240,0.85)', backdropFilter: 'blur(12px) saturate(1.1)', borderRadius: 16, border: '1px solid rgba(212,175,55,0.12)', boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.4)' }}>
        <Volume2 size={16} style={{ color: '#B8860B' }} />
        <input type="range" min={0} max={100} value={volPercent}
          onChange={e => setVolume(Number(e.target.value) / 100)}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #D4AF37 ${volPercent}%, #E0D5C0 ${volPercent}%)` }} />
        <span className="text-xs w-8 text-right tabular-nums" style={{ color: '#8B7355' }}>{volPercent}%</span>
      </div>

      {/* ═══ 播放模式分段切换 ═══ */}
      <div className="mx-2 mt-3 flex gap-1 p-1 rounded-2xl" style={{ background: 'rgba(15,10,6,0.06)', border: '1px solid rgba(212,175,55,0.08)' }}>
        {BOWL_PLAY_MODES.map((mode) => {
          const active = bowlPlayMode === mode.value;
          return (
            <button key={mode.value} onClick={() => switchPlayMode(mode.value)}
              className="flex-1 py-2.5 rounded-xl text-center transition-all"
              style={{
                background: active ? 'linear-gradient(135deg, #1a1208, #0F0A06)' : 'transparent',
                boxShadow: active ? '0 2px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(212,175,55,0.08)' : 'none',
                border: active ? '1px solid rgba(212,175,55,0.12)' : '1px solid transparent',
              }}>
              <div className="text-base mb-0.5" style={{ color: active ? '#E8C547' : '#8B7355' }}>{mode.icon}</div>
              <div className="text-xs font-bold" style={{ color: active ? '#FDF8F0' : '#8B7355' }}>{mode.name}</div>
            </button>
          );
        })}
      </div>

      {/* ═══ 内容区域 ═══ */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28" style={{ background: 'linear-gradient(170deg, #FDF8F0 0%, #F5EFE0 50%, #EDE4D3 100%)' }}>

        {/* === 合成音模式 === */}
        {bowlPlayMode === 'synth' && (
          <>
            {/* 手风琴：五行疗愈方案 */}
            <div className="mb-3">
              <button onClick={() => toggleSection('presets')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition"
                style={{ background: 'linear-gradient(135deg, #1a1208, #0F0A06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', border: '1px solid rgba(212,175,55,0.08)' }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} style={{ color: '#E8C547' }} />
                  <span className="font-bold text-sm" style={{ color: '#F5EFE0' }}>五行疗愈方案</span>
                </div>
                {expandedSection === 'presets' ? <ChevronDown size={18} style={{ color: '#E8C547' }} /> : <ChevronRight size={18} style={{ color: '#E8C547' }} />}
              </button>
              {expandedSection === 'presets' && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {SINGING_BOWL_PRESETS.map((preset, i) => {
                    const freq = preset.freq ?? 432;
                    const isActive = isPlaying && selectedFreq === freq && binauralBeat === preset.beat;
                    return (
                      <button key={i} onClick={() => applyPreset(preset)}
                        className="rounded-2xl p-3 border text-center transition hover:shadow-md active:scale-95"
                        style={{ background: isActive ? preset.color + '15' : '#FDF8F0', borderColor: isActive ? preset.color : '#EDE4D3' }}>
                        <div className="w-10 h-10 rounded-2xl mx-auto mb-1.5 flex items-center justify-center text-sm font-black"
                          style={{ backgroundColor: preset.color + '18', border: `2px solid ${preset.color}`, color: preset.color }}>
                          {preset.icon}
                        </div>
                        <div className="text-xs font-bold" style={{ color: '#2C1810' }}>{preset.name}</div>
                        <div className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>{preset.desc}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 手风琴：频率选择 */}
            <div className="mb-3">
              <button onClick={() => toggleSection('freqs')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition"
                style={{ background: 'linear-gradient(135deg, #1a1208, #0F0A06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', border: '1px solid rgba(212,175,55,0.08)' }}>
                <div className="flex items-center gap-2">
                  <Music size={16} style={{ color: '#E8C547' }} />
                  <span className="font-bold text-sm" style={{ color: '#F5EFE0' }}>频率选择</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,197,71,0.12)', color: '#E8C547' }}>
                    {BOWL_FREQUENCIES.length}个
                  </span>
                </div>
                {expandedSection === 'freqs' ? <ChevronDown size={18} style={{ color: '#E8C547' }} /> : <ChevronRight size={18} style={{ color: '#E8C547' }} />}
              </button>
              {expandedSection === 'freqs' && (
                <>
                  {/* 频率网格 — 大胆前卫布局 */}
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {BOWL_FREQUENCIES.map((bf) => {
                      const active = isPlaying && selectedFreq === bf.value;
                      const ELEMENT_CN: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
                      const isRecommended = hasDiagnosis && recommendedElement && ELEMENT_CN[recommendedElement] === bf.element;
                      return (
                        <button key={bf.value} onClick={() => toggleFreq(bf.value)}
                          className="rounded-xl p-2 border text-center transition hover:shadow-sm active:scale-95 relative"
                          style={{
                            background: active ? `linear-gradient(135deg, ${bf.color}20, ${bf.color}08)` : '#FDF8F0',
                            borderColor: active ? bf.color : isRecommended ? bf.color + '60' : '#EDE4D3',
                            boxShadow: active ? `0 0 16px ${bf.color}30` : 'none',
                          }}>
                          {isRecommended && !active && (
                            <span className="absolute -top-1 -right-1 text-[8px] px-1 py-px rounded bg-amber-500/25 text-amber-700 font-bold leading-none">荐</span>
                          )}
                          <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-black"
                            style={{ backgroundColor: bf.color + '18', border: `2px solid ${bf.color}`, color: bf.color }}>
                            {bf.icon}
                          </div>
                          <div className="text-[10px] font-bold tabular-nums" style={{ color: active ? bf.color : '#2C1810' }}>{bf.value}</div>
                          <div className="text-[8px]" style={{ color: '#8B7355' }}>{bf.element}·{bf.organ}</div>
                        </button>
                      );
                    })}
                  </div>

                  {/* 钵体选择 */}
                  {selectedFreq && availableBowlTracks.length > 0 && (
                    <div className="mt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Music size={14} style={{ color: '#B8860B' }} />
                        <h3 className="font-bold text-sm" style={{ color: '#5C3015' }}>钵体选择</h3>
                        <span className="text-[10px]" style={{ color: '#8B7355' }}>{availableBowlTracks.length}种可用</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {availableBowlTracks.map((track) => {
                          const isSelected = selectedBowlTrackId === track.id;
                          const bowlInfo = BOWL_TYPE_INFO[track.bowlType];
                          return (
                            <button key={track.id}
                              onClick={() => {
                                setSelectedBowlTrackId(track.id);
                                if (isPlaying && selectedFreq) { const audioTrack = createBowlTrack(selectedFreq, undefined, track.id); play(audioTrack); }
                              }}
                              className="flex items-center gap-2 px-3 py-2 rounded-xl border text-xs transition hover:shadow-sm"
                              style={{ background: isSelected ? track.color + '15' : '#FDF8F0', borderColor: isSelected ? track.color : '#EDE4D3' }}>
                              <span className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                                style={{ backgroundColor: track.color + '18', color: track.color }}>
                                {bowlInfo?.icon || '钵'}
                              </span>
                              <div className="text-left">
                                <div className="font-bold" style={{ color: isSelected ? track.color : '#2C1810' }}>{track.title}</div>
                                <div className="text-[9px]" style={{ color: '#8B7355' }}>{bowlInfo?.name || track.bowlType} · {track.subtitle}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 手风琴：扩展疗愈频率 */}
            <div className="mb-3">
              <button onClick={() => toggleSection('ext-freqs')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition"
                style={{ background: 'linear-gradient(135deg, #1a1208, #0F0A06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', border: '1px solid rgba(212,175,55,0.08)' }}>
                <div className="flex items-center gap-2">
                  <Sparkles size={16} style={{ color: '#E8C547' }} />
                  <span className="font-bold text-sm" style={{ color: '#F5EFE0' }}>扩展疗愈频率</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(232,197,71,0.12)', color: '#E8C547' }}>
                    {NEW_HEALING_FREQS.length}+
                  </span>
                </div>
                {expandedSection === 'ext-freqs' ? <ChevronDown size={18} style={{ color: '#E8C547' }} /> : <ChevronRight size={18} style={{ color: '#E8C547' }} />}
              </button>
              {expandedSection === 'ext-freqs' && (
                <div className="space-y-3 mt-2">
                  <p className="text-[10px]" style={{ color: '#8B7355' }}>healing-frequencies 项目·11类频率</p>
                  {(Object.keys(FREQ_BY_CATEGORY) as FreqCategory[]).map((cat) => {
                    const info = CATEGORY_INFO[cat];
                    const freqs = FREQ_BY_CATEGORY[cat];
                    return (
                      <div key={cat} className="rounded-xl p-3" style={{ background: '#FDF8F0', border: `1px solid ${info.color}20` }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: info.color + '18', border: `1.5px solid ${info.color}`, color: info.color }}>
                            {info.icon}
                          </div>
                          <div>
                            <div className="font-bold text-xs" style={{ color: '#2C1810' }}>{info.cn}</div>
                            <div className="text-[9px]" style={{ color: '#8B7355' }}>{info.desc}</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {freqs.map((f, j) => (
                            <button key={j} onClick={() => toggleFreq(f.f)}
                              className="px-2 py-1 rounded-lg text-[10px] font-mono tabular-nums transition hover:shadow-sm"
                              style={{
                                background: selectedFreq === f.f ? info.color + '30' : info.color + '10',
                                border: `1px solid ${info.color}30`,
                                color: selectedFreq === f.f ? info.color : '#2C1810',
                                fontWeight: selectedFreq === f.f ? 'bold' : 'normal',
                              }}>
                              {f.f}Hz<span className="ml-1 text-[8px] opacity-60">{f.cn}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 手风琴：节拍与调制 */}
            <div className="mb-3">
              <button onClick={() => toggleSection('beat-mod')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-2xl transition"
                style={{ background: 'linear-gradient(135deg, #1a1208, #0F0A06)', boxShadow: '0 2px 12px rgba(0,0,0,0.2)', border: '1px solid rgba(212,175,55,0.08)' }}>
                <div className="flex items-center gap-2">
                  <Waves size={16} style={{ color: '#E8C547' }} />
                  <span className="font-bold text-sm" style={{ color: '#F5EFE0' }}>双耳节拍 · 波形调制</span>
                </div>
                {expandedSection === 'beat-mod' ? <ChevronDown size={18} style={{ color: '#E8C547' }} /> : <ChevronRight size={18} style={{ color: '#E8C547' }} />}
              </button>
              {expandedSection === 'beat-mod' && (
                <div className="mt-2">
                  {/* 双耳节拍 */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {BINAURAL_MODES.map((bm) => (
                      <button key={bm.value}
                        onClick={() => { setBinauralBeat(bm.value); if (isPlaying && selectedFreq) startPlaying(selectedFreq, bm.value, modulation as ModulationValue); }}
                        className="px-3 py-3 rounded-xl border text-left transition hover:shadow-sm"
                        style={{
                          background: binauralBeat === bm.value ? 'linear-gradient(135deg, #2C3E50, #1a252f)' : '#FDF8F0',
                          borderColor: binauralBeat === bm.value ? '#2C3E50' : '#EDE4D3',
                          color: binauralBeat === bm.value ? '#FDF8F0' : '#2C1810',
                        }}>
                        <div className="font-bold text-sm">{bm.name}</div>
                        <div className="text-[10px] opacity-60">{bm.range}</div>
                      </button>
                    ))}
                  </div>
                  {binauralBeat > 0 && (
                    <p className="text-[10px] mb-3 px-3 py-2 rounded-lg" style={{ color: '#8B7355', background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
                      双耳节拍需佩戴耳机，左耳{selectedFreq || '???'}Hz + 右耳{(selectedFreq || 0) + binauralBeat}Hz → 感知{binauralBeat}Hz差频
                    </p>
                  )}
                  {/* 波形调制 */}
                  <div className="flex flex-wrap gap-2">
                    {MODULATIONS.map((m) => (
                      <button key={m.value}
                        onClick={() => { setModulation(m.value); if (isPlaying && selectedFreq) startPlaying(selectedFreq, binauralBeat, m.value); }}
                        className="px-4 py-2.5 rounded-xl border text-xs font-bold transition hover:shadow-sm"
                        style={{
                          background: modulation === m.value ? 'linear-gradient(135deg, #B8860B, #5C3015)' : '#FDF8F0',
                          borderColor: modulation === m.value ? '#B8860B' : '#EDE4D3',
                          color: modulation === m.value ? '#FDF8F0' : '#2C1810',
                        }}>
                        {m.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* === 真钵录音模式 === */}
        {bowlPlayMode === 'recording' && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Music size={16} style={{ color: '#B8860B' }} />
              <h3 className="font-bold text-sm" style={{ color: '#5C3015' }}>真钵录音</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(184,134,11,0.08)', color: '#8B6508' }}>真实颂钵·自然共鸣</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {BOWL_RECORDINGS.map((rec) => {
                const active = selectedRecordingId === rec.id;
                return (
                  <button key={rec.id}
                    onClick={() => { setSelectedRecordingId(rec.id); setSelectedFreq(rec.freq); startBowl({ recordingId: rec.id }); }}
                    className="flex items-center gap-3 p-3.5 rounded-2xl border text-left transition hover:shadow-lg active:scale-[0.98]"
                    style={{
                      background: active ? `linear-gradient(135deg, ${rec.color}15, ${rec.color}05)` : '#FDF8F0',
                      borderColor: active ? rec.color : '#EDE4D3',
                      boxShadow: active ? `0 0 20px ${rec.color}20` : 'none',
                    }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ backgroundColor: rec.color + '18', border: `2px solid ${rec.color}`, color: rec.color }}>
                      钵
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm" style={{ color: active ? rec.color : '#2C1810' }}>{rec.name}</div>
                      <div className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>{rec.desc}</div>
                      <div className="text-[10px] mt-0.5 font-mono" style={{ color: '#B8860B' }}>{rec.freq}Hz</div>
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
              <Music size={16} style={{ color: '#B8860B' }} />
              <h3 className="font-bold text-sm" style={{ color: '#5C3015' }}>敲击音色</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(184,134,11,0.08)', color: '#8B6508' }}>槌击起音·自然衰减</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {BOWL_HIT_SAMPLES.map((hit) => {
                const active = selectedHitId === hit.id;
                const typeIcon = hit.id.includes('crystal') ? '晶' : hit.id.includes('bowl') ? '藏' : '铜';
                return (
                  <button key={hit.id}
                    onClick={() => { setSelectedHitId(hit.id); setSelectedFreq(hit.freq); startBowl({ hitId: hit.id }); }}
                    className="flex items-center gap-2 p-3 rounded-2xl border text-left transition hover:shadow-sm active:scale-95"
                    style={{
                      background: active ? `linear-gradient(135deg, ${hit.color}15, ${hit.color}05)` : '#FDF8F0',
                      borderColor: active ? hit.color : '#EDE4D3',
                    }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ backgroundColor: hit.color + '18', border: `2px solid ${hit.color}`, color: hit.color }}>
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
            <Waves size={16} style={{ color: '#B8860B' }} />
            <h3 className="font-bold text-sm" style={{ color: '#5C3015' }}>环境音叠加</h3>
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
                <button key={sc.id} onClick={() => setAmbientSound(sc.id)}
                  className="rounded-xl p-2 border text-center transition hover:shadow-sm active:scale-95"
                  style={{
                    background: active ? `linear-gradient(135deg, ${sc.color}15, ${sc.color}05)` : '#FDF8F0',
                    borderColor: active ? sc.color : '#EDE4D3',
                    boxShadow: active ? `0 0 12px ${sc.color}20` : 'none',
                  }}>
                  <div className="text-lg mb-0.5" style={{ color: sc.color }}>{sc.icon}</div>
                  <div className="text-[10px] font-bold" style={{ color: active ? sc.color : '#2C1810' }}>{sc.name}</div>
                </button>
              );
            })}
          </div>
          {ambientSoundId !== 'none' && (
            <div className="flex items-center gap-2 mt-2 px-3 py-2 rounded-xl" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
              <Volume2 size={12} style={{ color: '#8B7355' }} />
              <input type="range" min={0} max={100} value={ambientPercent}
                onChange={e => setAmbientVolume(Number(e.target.value) / 100)}
                className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                style={{ background: `linear-gradient(to right, #8B7355 ${ambientPercent}%, #D4C5A9 ${ambientPercent}%)` }} />
              <span className="text-[10px] w-8 text-right tabular-nums" style={{ color: '#8B7355' }}>{ambientPercent}%</span>
            </div>
          )}
        </div>

        {/* 定时器 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-2" style={{ color: '#5C3015' }}>
            <Timer size={14} className="inline mr-1" />时长
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '不限', value: 0 }, { label: '5分钟', value: 5 }, { label: '10分钟', value: 10 },
              { label: '15分钟', value: 15 }, { label: '20分钟', value: 20 }, { label: '30分钟', value: 30 },
            ].map((t) => (
              <button key={t.value} onClick={() => setTimer(t.value)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition"
                style={{
                  background: timerMinutes === t.value ? 'linear-gradient(135deg, #B8860B, #8B6508)' : '#FDF8F0',
                  color: timerMinutes === t.value ? '#FDF8F0' : '#2C1810',
                  border: `1px solid ${timerMinutes === t.value ? '#B8860B' : '#EDE4D3'}`,
                }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 科学说明 */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
          <h4 className="font-bold text-sm mb-2" style={{ color: '#5C3015' }}>颂钵音疗原理</h4>
          <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>
            颂钵音疗运用特定频率作用于人体，通过共振原理影响生理机能。中医认为"五音入五脏"，
            角(木/肝)、徵(火/心)、宫(土/脾)、商(金/肺)、羽(水/肾)五种音阶与五行脏腑对应。
            双耳节拍技术通过左右耳频率差诱导脑波同步，德尔塔波助眠、西塔波助冥想、阿尔法波助放松、贝塔波助专注。
            波形调制模拟颂钵敲击后的自然衰减，营造更真实的音疗体验。真钵录音与敲击音色源自真实颂钵，
            环境音叠加层可与主音并行播放，营造沉浸式疗愈氛围。
            扩展疗愈频率来自 healing-frequencies 项目（MIT, Olivier Guilieri），
            包含索尔菲吉奥扩展、基础疗愈、器官共振、矿物频率、唵音、宇宙八度、天使频率、
            特斯拉369、舒曼共振、DNA修复等11类频率。
          </p>
        </div>
      </div>

      {/* ===== 前奏导引浮层 ===== */}
      {preludePlaying && selectedFreq && currentBowl && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{
            background: `radial-gradient(ellipse at center, ${currentBowl.color}15 0%, rgba(26,15,10,0.96) 50%, rgba(26,15,10,0.88) 100%)`,
            backdropFilter: 'blur(16px)',
          }}>
          <div className="font-black font-serif mb-4" style={{
            fontSize: 96,
            color: currentBowl.color,
            textShadow: `0 0 48px ${currentBowl.color}50, 0 0 96px ${currentBowl.color}25`,
            lineHeight: 1,
          }}>
            {currentBowl.icon}
          </div>
          <div className="text-lg font-bold mb-1 tracking-wide" style={{ color: '#F5EFE0' }}>
            {currentBowl.name}
          </div>
          <div className="text-sm mb-2" style={{ color: '#8B7355' }}>
            {currentBowl.value}Hz · {currentBowl.element}行·{currentBowl.organ}
          </div>
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
