'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import HealingCanvas, { type HealingCanvasHandle, HEALING_PRESET_CHAKRA } from '@/components/healing/HealingCanvas';
import { fmtTime } from '@/hooks/useTimer';
import { Play, Pause, Volume2, Timer, Sparkles, Headphones, ChevronRight } from 'lucide-react';
import { useTTS } from '@/hooks/useTTS';
import { getChakraGuide } from '@/lib/healing-voice-guide';
import {
  BINAURAL_MODES, MODULATIONS,
  type BinauralValue, type ModulationValue,
} from '@/lib/five-tone-data';
import {
  useAudioService, createBowlTrack, type AudioTrack,
} from '@/lib/audio-service';
import { useHealingRecommendation } from '@/hooks/useHealingRecommendation';
import {
  CHAKRA_EXTENDED_FREQS, CATEGORY_INFO, FREQ_BY_CATEGORY, type FreqCategory,
} from '@/lib/healing-frequencies-data';

/* ================================================================
 *  脉轮调谐 · 前卫沉浸式重设计
 *  七脉轮索尔菲吉奥频率 (396/417/528/639/741/852/963)
 *  能量柱 + 径向脉轮选择 + 玻璃拟态控制面板
 * ================================================================ */

// ===== 七脉轮数据（索尔菲吉奥频率） =====
const CHAKRAS = [
  { id: 'root',    name: '根轮',   sanskrit: 'Muladhara',   freq: 396, hue: 0,   color: '#DC2626', element: '土', organ: '肾上腺·脊柱',  desc: '安全感· grounding· 生存基础', icon: '根' },
  { id: 'sacral',  name: '腹轮',   sanskrit: 'Svadhisthana', freq: 417, hue: 25,  color: '#F97316', element: '水', organ: '生殖·下腹',    desc: '创造力· 情感流动· 欲望',       icon: '腹' },
  { id: 'solar',   name: '脐轮',   sanskrit: 'Manipura',    freq: 528, hue: 45,  color: '#EAB308', element: '火', organ: '脾胃·消化',     desc: '意志力· 自信· 个人力量',       icon: '脐' },
  { id: 'heart',   name: '心轮',   sanskrit: 'Anahata',     freq: 639, hue: 120, color: '#22C55E', element: '风', organ: '心肺·胸腺',     desc: '慈悲· 爱· 连结· 和谐',         icon: '心' },
  { id: 'throat',  name: '喉轮',   sanskrit: 'Vishuddha',   freq: 741, hue: 190, color: '#06B6D4', element: '空', organ: '甲状腺·喉',     desc: '真实表达· 沟通· 创造力',        icon: '喉' },
  { id: 'third',   name: '眉心轮', sanskrit: 'Ajna',        freq: 852, hue: 240, color: '#6366F1', element: '光', organ: '松果体·眉心',   desc: '直觉· 洞察· 内在智慧',         icon: '眉' },
  { id: 'crown',   name: '顶轮',   sanskrit: 'Sahasrara',   freq: 963, hue: 280, color: '#A855F7', element: '宇宙', organ: '大脑皮层·头顶', desc: '灵性连接· 超越· 宇宙意识',      icon: '顶' },
] as const;

// ===== 脉轮疗愈预设 =====
const CHAKRA_PRESETS = [
  { name: '根轮开启',   chakraId: 'root',   beat: 6  as BinauralValue, mod: 'breathing' as ModulationValue, timer: 15, desc: '安全感·稳定·扎根',   color: '#DC2626' },
  { name: '心轮疗愈',   chakraId: 'heart',  beat: 10 as BinauralValue, mod: 'ocean'     as ModulationValue, timer: 20, desc: '慈悲·爱·和谐',       color: '#22C55E' },
  { name: '眉心觉醒',   chakraId: 'third',  beat: 6  as BinauralValue, mod: 'gentle'    as ModulationValue, timer: 15, desc: '直觉·洞察·内在智慧', color: '#6366F1' },
  { name: '顶轮连接',   chakraId: 'crown',  beat: 6  as BinauralValue, mod: 'breathing' as ModulationValue, timer: 20, desc: '灵性·超越·宇宙意识', color: '#A855F7' },
  { name: '七轮全通',   chakraId: 'root',   beat: 10 as BinauralValue, mod: 'gentle'    as ModulationValue, timer: 30, desc: '由下至上逐轮调谐',   color: '#C4A35A' },
];

// ===== 主页面 =====
export default function ChakraPage() {
  const { hasDiagnosis, recommendedChakra, primaryConstitution } = useHealingRecommendation();

  const {
    isPlaying, currentTrack, volume, binauralBeat, modulation,
    timerMinutes, timerRemaining, isTimerRunning,
    play, pause, stop, closePlayer, togglePlay, setVolume,
    setBinauralBeat, setModulation,
    setTimer, startTimer, stopTimer,
    setQueue, setPlayMode,
  } = useAudioService();

  // 本地 UI 状态
  const [selectedChakra, setSelectedChakra] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioEnergy, setAudioEnergy] = useState(0);
  const [preludePlaying, setPreludePlaying] = useState(false);
  const [guideText, setGuideText] = useState('');
  const [activePanel, setActivePanel] = useState<'chakras' | 'presets' | 'freqs' | 'controls'>('chakras');

  // ===== TTS 男声导引 =====
  const tts = useTTS({ defaultGender: 'male', defaultSpeed: 'slow', voiceId: 'zh-CN-YunjianNeural' });
  const ttsRef = useRef(tts);
  ttsRef.current = tts;
  const pendingPlayRef = useRef<{ freq: number; beat: BinauralValue; mod: ModulationValue } | null>(null);

  // Canvas 引用
  const healingCanvasRef = useRef<HealingCanvasHandle>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const energyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const guideEndTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 获取 AnalyserNode
  useEffect(() => {
    if (isPlaying && !analyserRef.current) {
      import('@/lib/audio-service').then(mod => {
        const node = mod.getAnalyserNode();
        if (node) analyserRef.current = node;
      });
    }
  }, [isPlaying]);

  // 音频能量 → Canvas
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

  // 播放脉轮频率
  const startPlaying = useCallback((freq: number, beat: BinauralValue, mod: ModulationValue) => {
    const track = createBowlTrack(freq);
    const chakraQueue: AudioTrack[] = CHAKRAS.map(c => createBowlTrack(c.freq));
    const startIdx = Math.max(0, CHAKRAS.findIndex(c => c.freq === freq));
    setPlayMode('sequence');
    setQueue(chakraQueue, startIdx);
    play(track);
    if (beat !== binauralBeat) setBinauralBeat(beat);
    if (mod !== modulation) setModulation(mod);
    setElapsedSeconds(0);
    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
  }, [play, binauralBeat, modulation, setBinauralBeat, setModulation]);

  const startPlayingWithGuide = useCallback((freq: number, beat: BinauralValue, mod: ModulationValue, chakraId?: string) => {
    ttsRef.current.stop();
    if (guideEndTimeoutRef.current) { clearTimeout(guideEndTimeoutRef.current); guideEndTimeoutRef.current = null; }
    const text = chakraId ? getChakraGuide(chakraId) : '';
    if (text) {
      setGuideText(text);
      setPreludePlaying(true);
      pendingPlayRef.current = { freq, beat, mod };
      const charCount = text.replace(/[^\u4e00-\u9fa5]/g, '').length;
      const estimatedMs = Math.max(8000, Math.ceil(charCount / 3.5) * 1000 + 2000);
      ttsRef.current.speak(text, 0.5);
      guideEndTimeoutRef.current = setTimeout(() => {
        setPreludePlaying(false);
        const pending = pendingPlayRef.current;
        pendingPlayRef.current = null;
        if (pending) startPlaying(pending.freq, pending.beat, pending.mod);
      }, estimatedMs);
    } else {
      startPlaying(freq, beat, mod);
    }
  }, [startPlaying]);

  const skipPrelude = useCallback(() => {
    ttsRef.current.stop();
    if (guideEndTimeoutRef.current) { clearTimeout(guideEndTimeoutRef.current); guideEndTimeoutRef.current = null; }
    setPreludePlaying(false);
    const pending = pendingPlayRef.current;
    pendingPlayRef.current = null;
    if (pending) startPlaying(pending.freq, pending.beat, pending.mod);
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

  const applyPreset = useCallback((preset: typeof CHAKRA_PRESETS[number]) => {
    const chakraIdx = CHAKRAS.findIndex(c => c.id === preset.chakraId);
    setSelectedChakra(chakraIdx >= 0 ? chakraIdx : 0);
    setTimer(preset.timer);
    const freq = CHAKRAS[chakraIdx >= 0 ? chakraIdx : 0].freq;
    const chakraId = CHAKRAS[chakraIdx >= 0 ? chakraIdx : 0].id;
    startPlayingWithGuide(freq, preset.beat, preset.mod, chakraId);
  }, [startPlayingWithGuide, setTimer]);

  const toggleChakra = useCallback((idx: number) => {
    const chakra = CHAKRAS[idx];
    if (isPlaying && selectedChakra === idx) {
      stopAll();
    } else {
      setSelectedChakra(idx);
      startPlayingWithGuide(chakra.freq, binauralBeat, modulation as ModulationValue, chakra.id);
    }
  }, [isPlaying, selectedChakra, binauralBeat, modulation, startPlayingWithGuide, stopAll]);

  const toggleChakraByFreq = useCallback((freq: number) => {
    const closestChakra = CHAKRAS.reduce((prev, curr) =>
      Math.abs(curr.freq - freq) < Math.abs(prev.freq - freq) ? curr : prev
    );
    const idx = CHAKRAS.indexOf(closestChakra);
    if (isPlaying && selectedChakra === idx) {
      stopAll();
    } else {
      setSelectedChakra(idx);
      startPlayingWithGuide(freq, binauralBeat, modulation as ModulationValue, closestChakra.id);
    }
  }, [isPlaying, selectedChakra, binauralBeat, modulation, startPlayingWithGuide, stopAll]);

  useEffect(() => {
    if (isPlaying && timerMinutes > 0 && elapsedSeconds >= timerMinutes * 60) {
      stopAll();
    }
  }, [elapsedSeconds, isPlaying, timerMinutes, stopAll]);

  useEffect(() => {
    if (!isPlaying && elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
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

  const currentChakra = selectedChakra !== null ? CHAKRAS[selectedChakra] : null;
  const volPercent = Math.round(volume * 100);

  return (
    <PageContainer theme="healing" noShanshui>
      <HealingHeader title="脉轮调谐" subtitle="七轮索尔菲吉奥 · 频率共振" />

      {hasDiagnosis && recommendedChakra && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-400/30 flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">荐</span>
          <span className="text-xs text-amber-800 font-serif">基于您的{primaryConstitution}，推荐{recommendedChakra}调谐</span>
        </div>
      )}

      {/* ═══ 沉浸式可视化舞台 ═══ */}
      <div className="relative overflow-hidden mx-2 mt-2" style={{
        height: 280,
        borderRadius: 20,
        background: 'linear-gradient(180deg, #1a0f0a 0%, #2a1810 40%, #1a1208 100%)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        {/* 七脉轮能量柱背景 */}
        <div className="absolute inset-0 flex items-end justify-around px-2 pb-4">
          {CHAKRAS.map((chakra, i) => {
            const active = isPlaying && selectedChakra === i;
            const dim = selectedChakra !== null && selectedChakra !== i && !isPlaying;
            return (
              <button
                key={chakra.id}
                onClick={() => toggleChakra(i)}
                className="relative flex flex-col items-center justify-end transition-all duration-500"
                style={{
                  height: '100%',
                  width: '12%',
                  opacity: dim ? 0.3 : 1,
                }}
              >
                {/* 能量柱光体 */}
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-700"
                  style={{
                    width: active ? '80%' : '50%',
                    height: active ? `${30 + audioEnergy * 40}%` : dim ? '20%' : '35%',
                    background: `linear-gradient(to top, ${chakra.color}, ${chakra.color}40, transparent)`,
                    filter: active ? `blur(${4 + audioEnergy * 8}px)` : 'blur(6px)',
                    opacity: active ? 0.8 : 0.4,
                    boxShadow: active ? `0 0 30px ${chakra.color}80, 0 0 60px ${chakra.color}40` : 'none',
                    animation: active ? `pulse-${i} 3s ease-in-out infinite` : 'none',
                  }}
                />
                {/* 脉轮字符 */}
                <div
                  className="relative z-10 font-black font-serif transition-all duration-300"
                  style={{
                    fontSize: active ? 20 : 14,
                    color: active ? chakra.color : '#8B735580',
                    textShadow: active ? `0 0 16px ${chakra.color}, 0 0 32px ${chakra.color}80` : 'none',
                    marginBottom: 4,
                  }}
                >
                  {chakra.icon}
                </div>
                {/* 频率数字 */}
                <div
                  className="relative z-10 text-[8px] font-mono tabular-nums transition-all"
                  style={{
                    color: active ? chakra.color : '#8B735540',
                    fontWeight: active ? 700 : 400,
                  }}
                >
                  {chakra.freq}
                </div>
              </button>
            );
          })}
        </div>

        {/* Canvas 可视化叠加层 */}
        <div className="absolute inset-0" style={{ opacity: 0.5, pointerEvents: 'none' }}>
          <HealingCanvas ref={healingCanvasRef} energy={audioEnergy} config={HEALING_PRESET_CHAKRA} />
        </div>

        {/* 中心脉轮信息 — 大字呈现 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {isPlaying && currentChakra ? (
              <>
                <div
                  className="font-extralight tabular-nums tracking-tight"
                  style={{
                    fontSize: 56,
                    lineHeight: 1,
                    color: currentChakra.color,
                    textShadow: `0 0 32px ${currentChakra.color}60, 0 0 64px ${currentChakra.color}30`,
                  }}
                >
                  {currentChakra.freq}
                  <span className="text-2xl ml-1" style={{ color: '#8B7355' }}>Hz</span>
                </div>
                <div className="font-bold font-serif mt-2" style={{ fontSize: 18, color: currentChakra.color, letterSpacing: '0.15em' }}>
                  {currentChakra.name}
                </div>
                <div className="text-xs mt-1 font-serif italic" style={{ color: '#8B7355' }}>
                  {currentChakra.sanskrit} · {currentChakra.element}行
                </div>
              </>
            ) : (
              <div className="text-2xl font-extralight tracking-[0.3em]" style={{ color: '#C4A870' }}>
                选择脉轮
              </div>
            )}
          </div>
        </div>

        {/* 计时器 — 玻璃拟态 */}
        <div className="absolute right-3 top-3 rounded-xl px-3 py-1.5 font-mono text-xs tabular-nums"
          style={{
            background: 'rgba(26,15,10,0.6)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(196,168,112,0.15)',
            color: '#C4A870',
          }}>
          {fmtTime(elapsedSeconds)}
          {timerMinutes > 0 && <span style={{ color: '#8B7355' }}>/{timerMinutes}:00</span>}
        </div>

        {/* 双耳节拍标签 */}
        {isPlaying && binauralBeat > 0 && (
          <div className="absolute left-3 top-3">
            <span className="rounded-xl px-2.5 py-1 text-xs font-bold"
              style={{
                background: 'rgba(74,222,128,0.15)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(74,222,128,0.3)',
                color: '#4ADE80',
              }}>
              +{binauralBeat}Hz
            </span>
          </div>
        )}

        {/* 播放/暂停 — 悬浮按钮 */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
          <button
            onClick={() => isPlaying ? stopAll() : (selectedChakra !== null ? startPlayingWithGuide(CHAKRAS[selectedChakra].freq, binauralBeat, modulation as ModulationValue, CHAKRAS[selectedChakra].id) : startPlayingWithGuide(528, 10, 'ocean', 'heart'))}
            className="w-14 h-14 rounded-full flex items-center justify-center transition active:scale-90"
            style={{
              background: isPlaying
                ? 'linear-gradient(135deg, rgba(220,38,38,0.3), rgba(220,38,38,0.1))'
                : 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.1))',
              border: `1.5px solid ${isPlaying ? 'rgba(220,38,38,0.4)' : 'rgba(34,197,94,0.4)'}`,
              backdropFilter: 'blur(12px)',
              boxShadow: isPlaying
                ? '0 0 20px rgba(220,38,38,0.3)'
                : '0 0 20px rgba(34,197,94,0.3)',
            }}
          >
            {isPlaying ? <Pause size={22} style={{ color: '#F87171' }} /> : <Play size={22} style={{ color: '#4ADE80' }} />}
          </button>
        </div>
      </div>

      {/* ═══ 音量滑块 — 玻璃条 ═══ */}
      <div className="mx-2 mt-2 px-4 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(253,248,240,0.8)',
          backdropFilter: 'blur(8px)',
          borderRadius: 14,
          border: '1px solid rgba(196,168,112,0.15)',
        }}>
        <Volume2 size={16} style={{ color: '#8B7355' }} />
        <input
          type="range" min={0} max={100} value={volPercent}
          onChange={e => setVolume(Number(e.target.value) / 100)}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #B8860B ${volPercent}%, #D4C5A9 ${volPercent}%)` }}
        />
        <span className="text-xs w-8 text-right tabular-nums" style={{ color: '#8B7355' }}>{volPercent}%</span>
      </div>

      {/* ═══ Tab 导航 ═══ */}
      <div className="mx-2 mt-3 flex gap-1 px-1">
        {([
          { key: 'chakras', label: '七脉轮' },
          { key: 'presets', label: '疗愈方案' },
          { key: 'freqs', label: '扩展频率' },
          { key: 'controls', label: '节拍·调制' },
        ] as const).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActivePanel(tab.key)}
            className="flex-1 py-2.5 text-xs font-bold transition-all rounded-lg"
            style={{
              background: activePanel === tab.key
                ? 'linear-gradient(135deg, #5C1A00, #8B2500)'
                : 'transparent',
              color: activePanel === tab.key ? '#FDF8F0' : '#8B7355',
              boxShadow: activePanel === tab.key ? '0 2px 12px rgba(92,26,0,0.25)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ═══ 内容区域 ═══ */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28" style={{ background: 'linear-gradient(170deg, #FDF8F0 0%, #F5EFE0 50%, #EDE4D3 100%)' }}>

        {/* === 七脉轮径向选择 === */}
        {activePanel === 'chakras' && (
          <div className="mb-5">
            {/* 脉轮轨道 — 垂直能量流 */}
            <div className="relative rounded-2xl p-4 mb-4" style={{
              background: 'linear-gradient(135deg, #1a0f0a 0%, #2a1810 100%)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            }}>
              {/* 中央能量线 */}
              <div className="absolute left-1/2 top-4 bottom-4 w-px -translate-x-1/2"
                style={{ background: 'linear-gradient(to bottom, #DC2626, #F97316, #EAB308, #22C55E, #06B6D4, #6366F1, #A855F7)' }} />
              {CHAKRAS.map((chakra, i) => {
                const active = isPlaying && selectedChakra === i;
                const isRecommended = hasDiagnosis && recommendedChakra && chakra.id === recommendedChakra;
                return (
                  <button
                    key={chakra.id}
                    onClick={() => toggleChakra(i)}
                    className="relative flex items-center gap-4 w-full py-2.5 group"
                  >
                    {/* 脉轮光球 */}
                    <div
                      className="relative flex-shrink-0 transition-all duration-500"
                      style={{
                        width: active ? 52 : 40,
                        height: active ? 52 : 40,
                        marginLeft: active ? -6 : 0,
                      }}
                    >
                      <div
                        className="absolute inset-0 rounded-full flex items-center justify-center font-black font-serif"
                        style={{
                          backgroundColor: chakra.color + (active ? '30' : '15'),
                          border: `2px solid ${chakra.color}`,
                          color: chakra.color,
                          fontSize: active ? 16 : 13,
                          boxShadow: active
                            ? `0 0 24px ${chakra.color}80, inset 0 0 12px ${chakra.color}30`
                            : `0 0 8px ${chakra.color}30`,
                          zIndex: 10,
                        }}
                      >
                        {chakra.icon}
                      </div>
                      {active && (
                        <div
                          className="absolute inset-0 rounded-full animate-ping"
                          style={{ border: `1.5px solid ${chakra.color}60`, animationDuration: '2s' }}
                        />
                      )}
                    </div>

                    {/* 脉轮信息 */}
                    <div className="flex-1 text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-bold" style={{ fontSize: 15, color: active ? chakra.color : '#F5EFE0' }}>
                          {chakra.name}
                        </span>
                        <span className="text-[10px] font-serif italic" style={{ color: '#8B7355' }}>
                          {chakra.sanskrit}
                        </span>
                        {isRecommended && !active && (
                          <span className="text-[8px] px-1 py-px rounded bg-amber-500/30 text-amber-300 font-bold">荐</span>
                        )}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#8B7355' }}>{chakra.desc}</div>
                      <div className="text-[10px] mt-0.5 font-mono" style={{ color: chakra.color + 'CC' }}>
                        {chakra.freq}Hz · {chakra.element}行 · {chakra.organ}
                      </div>
                    </div>

                    {/* 频率大字 */}
                    <div className="text-right flex-shrink-0">
                      <div
                        className="font-extralight tabular-nums transition-all"
                        style={{
                          fontSize: active ? 28 : 20,
                          color: active ? chakra.color : '#8B735560',
                          textShadow: active ? `0 0 16px ${chakra.color}60` : 'none',
                        }}
                      >
                        {chakra.freq}
                      </div>
                      <div className="text-[8px]" style={{ color: '#8B7355' }}>Hz</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* 选中脉轮详情卡 */}
            {selectedChakra !== null && (
              <div className="rounded-2xl p-4 mb-4" style={{
                background: `linear-gradient(135deg, ${CHAKRAS[selectedChakra].color}08, ${CHAKRAS[selectedChakra].color}03)`,
                border: `1px solid ${CHAKRAS[selectedChakra].color}25`,
                backdropFilter: 'blur(8px)',
              }}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-black"
                    style={{
                      backgroundColor: CHAKRAS[selectedChakra].color + '20',
                      border: `2px solid ${CHAKRAS[selectedChakra].color}`,
                      color: CHAKRAS[selectedChakra].color,
                    }}>
                    {CHAKRAS[selectedChakra].icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-base" style={{ color: CHAKRAS[selectedChakra].color }}>
                      {CHAKRAS[selectedChakra].name}
                    </h4>
                    <span className="text-[10px] font-serif italic" style={{ color: '#8B7355' }}>
                      {CHAKRAS[selectedChakra].sanskrit}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="rounded-lg px-3 py-2" style={{ background: '#FDF8F0' }}>
                    <span className="font-bold" style={{ color: '#5C1A00' }}>频率 </span>
                    <span style={{ color: '#5C3015' }}>{CHAKRAS[selectedChakra].freq}Hz</span>
                  </div>
                  <div className="rounded-lg px-3 py-2" style={{ background: '#FDF8F0' }}>
                    <span className="font-bold" style={{ color: '#5C1A00' }}>五行 </span>
                    <span style={{ color: '#5C3015' }}>{CHAKRAS[selectedChakra].element}行</span>
                  </div>
                  <div className="rounded-lg px-3 py-2" style={{ background: '#FDF8F0' }}>
                    <span className="font-bold" style={{ color: '#5C1A00' }}>对应 </span>
                    <span style={{ color: '#5C3015' }}>{CHAKRAS[selectedChakra].organ}</span>
                  </div>
                  <div className="rounded-lg px-3 py-2" style={{ background: '#FDF8F0' }}>
                    <span className="font-bold" style={{ color: '#5C1A00' }}>功能 </span>
                    <span style={{ color: '#5C3015' }}>{CHAKRAS[selectedChakra].desc}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* === 疗愈预设 === */}
        {activePanel === 'presets' && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={16} style={{ color: '#8B2500' }} />
              <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>疗愈预设</h3>
            </div>
            <div className="space-y-3">
              {CHAKRA_PRESETS.map((preset, i) => {
                const chakraIdx = CHAKRAS.findIndex(c => c.id === preset.chakraId);
                const isActive = isPlaying && selectedChakra === chakraIdx && binauralBeat === preset.beat;
                return (
                  <button
                    key={i}
                    onClick={() => applyPreset(preset)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition hover:shadow-lg active:scale-[0.98]"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${preset.color}15, ${preset.color}05)`
                        : '#FDF8F0',
                      borderColor: isActive ? preset.color : '#EDE4D3',
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-black flex-shrink-0"
                      style={{
                        backgroundColor: preset.color + '18',
                        border: `2px solid ${preset.color}`,
                        color: preset.color,
                        boxShadow: isActive ? `0 0 16px ${preset.color}40` : 'none',
                      }}
                    >
                      {CHAKRAS.find(c => c.id === preset.chakraId)?.icon || '轮'}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-bold" style={{ color: '#2C1810' }}>{preset.name}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#8B7355' }}>{preset.desc}</div>
                      <div className="flex gap-3 mt-1 text-[9px]" style={{ color: '#8B7355' }}>
                        <span>{preset.timer}分钟</span>
                        <span>+{preset.beat}Hz节拍</span>
                      </div>
                    </div>
                    <ChevronRight size={18} style={{ color: isActive ? preset.color : '#8B7355' }} />
                  </button>
                );
              })}
            </div>

            {/* 定时器 */}
            <div className="mt-5">
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
                    className="px-4 py-2 rounded-xl text-xs font-bold transition"
                    style={{
                      background: timerMinutes === t.value ? 'linear-gradient(135deg, #B8860B, #8B6508)' : '#FDF8F0',
                      color: timerMinutes === t.value ? '#FDF8F0' : '#2C1810',
                      border: `1px solid ${timerMinutes === t.value ? '#B8860B' : '#EDE4D3'}`,
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === 扩展频率 === */}
        {activePanel === 'freqs' && (
          <div className="mb-5">
            {/* 脉轮补充频率 */}
            <div className="mb-5">
              <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>脉轮补充频率</h3>
              <p className="text-[10px] mb-3" style={{ color: '#8B7355' }}>宇宙八度体系·含波长参数</p>
              <div className="space-y-2">
                {CHAKRA_EXTENDED_FREQS.map((cf, i) => {
                  const matchingChakra = CHAKRAS.find(c => {
                    const map: Record<string, string> = {
                      'Earth Star': '', 'Root': 'root', 'Sacral': 'sacral',
                      'Solar Plexus': 'solar', 'Heart': 'heart', 'Throat': 'throat',
                      'Third Eye': 'third', 'Crown': 'crown', 'Soul Star': '',
                    };
                    return map[cf.chakra] === c.id;
                  });
                  const color = matchingChakra?.color || '#8B7355';
                  const isPlayable = cf.f > 20;
                  return (
                    <button
                      key={i}
                      onClick={() => isPlayable ? toggleChakraByFreq(cf.f) : undefined}
                      disabled={!isPlayable}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition hover:shadow-sm active:scale-[0.98] disabled:opacity-50"
                      style={{ background: '#FDF8F0', borderColor: color + '30' }}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ backgroundColor: color + '18', border: `2px solid ${color}`, color }}>
                        {cf.cn.charAt(0)}
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs" style={{ color: '#2C1810' }}>{cf.cn}</span>
                          <span className="text-[10px]" style={{ color: '#8B7355' }}>{cf.chakra}</span>
                        </div>
                        <div className="text-[10px] mt-0.5" style={{ color: '#5C3015' }}>{cf.desc}</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-light tabular-nums" style={{ color }}>{cf.f}</div>
                        <div className="text-[8px]" style={{ color: '#8B7355' }}>
                          Hz{cf.l > 0 && ` · λ=${cf.l}cm`}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 扩展疗愈频率类别 */}
            <div className="mb-5">
              <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>扩展疗愈频率</h3>
              <p className="text-[10px] mb-3" style={{ color: '#8B7355' }}>healing-frequencies 项目·11类频率</p>
              <div className="space-y-3">
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
                          <button
                            key={j}
                            onClick={() => toggleChakraByFreq(f.f)}
                            className="px-2 py-1 rounded-lg text-[10px] font-mono tabular-nums transition hover:shadow-sm"
                            style={{ background: info.color + '10', border: `1px solid ${info.color}30`, color: '#2C1810' }}
                          >
                            {f.f}Hz
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* === 节拍·调制 === */}
        {activePanel === 'controls' && (
          <div className="mb-5">
            {/* 双耳节拍 */}
            <div className="mb-5">
              <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>双耳节拍</h3>
              <div className="grid grid-cols-2 gap-2">
                {BINAURAL_MODES.map((bm) => (
                  <button
                    key={bm.value}
                    onClick={() => {
                      setBinauralBeat(bm.value);
                      if (isPlaying && selectedChakra !== null) {
                        startPlaying(CHAKRAS[selectedChakra].freq, bm.value, modulation as ModulationValue);
                      }
                    }}
                    className="px-3 py-3 rounded-xl border text-left transition hover:shadow-sm"
                    style={{
                      background: binauralBeat === bm.value ? 'linear-gradient(135deg, #2C3E50, #1a252f)' : '#FDF8F0',
                      borderColor: binauralBeat === bm.value ? '#2C3E50' : '#EDE4D3',
                      color: binauralBeat === bm.value ? '#FDF8F0' : '#2C1810',
                    }}
                  >
                    <div className="font-bold text-sm">{bm.name}</div>
                    <div className="text-[10px] opacity-60">{bm.range}</div>
                  </button>
                ))}
              </div>
              {binauralBeat > 0 && selectedChakra !== null && (
                <p className="text-[10px] mt-2 px-3 py-2 rounded-lg" style={{ color: '#8B7355', background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
                  双耳节拍需佩戴耳机，左耳{CHAKRAS[selectedChakra].freq}Hz + 右耳{CHAKRAS[selectedChakra].freq + binauralBeat}Hz → 感知{binauralBeat}Hz差频
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
                      if (isPlaying && selectedChakra !== null) {
                        startPlaying(CHAKRAS[selectedChakra].freq, binauralBeat, m.value);
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl border text-xs font-bold transition hover:shadow-sm"
                    style={{
                      background: modulation === m.value ? 'linear-gradient(135deg, #8B2500, #5C1A00)' : '#FDF8F0',
                      borderColor: modulation === m.value ? '#8B2500' : '#EDE4D3',
                      color: modulation === m.value ? '#FDF8F0' : '#2C1810',
                    }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 脉轮说明 */}
            <div className="rounded-2xl p-4 mb-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
              <h4 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>脉轮调谐原理</h4>
              <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>
                脉轮系统源于古印度瑜伽传统，认为人体有七个能量中心，沿脊柱由下而上排列。
                每个脉轮对应特定的索尔菲吉奥频率：396Hz(根轮)释放恐惧、417Hz(腹轮)促进转化、
                528Hz(脐轮)爱与修复、639Hz(心轮)和谐关系、741Hz(喉轮)直觉觉醒、
                852Hz(眉心轮)精神回归、963Hz(顶轮)宇宙连接。
                双耳节拍通过左右耳频率差诱导脑波同步，配合脉轮频率可深度调谐能量中心。
                补充频率来自 healing-frequencies 项目（MIT, Olivier Guilieri），包含宇宙八度、
                器官共振、矿物频率、天使频率等11类疗愈频率。
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ===== 前奏导引浮层 — 沉浸聆听男声引导 ===== */}
      {preludePlaying && currentChakra && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{
            background: `radial-gradient(ellipse at center, ${currentChakra.color}15 0%, rgba(26,15,10,0.96) 50%, rgba(26,15,10,0.88) 100%)`,
            backdropFilter: 'blur(16px)',
          }}>
          <div className="font-black font-serif mb-4" style={{
            fontSize: 96,
            color: currentChakra.color,
            textShadow: `0 0 48px ${currentChakra.color}50, 0 0 96px ${currentChakra.color}25`,
            lineHeight: 1,
          }}>
            {currentChakra.icon}
          </div>
          <div className="text-lg font-bold mb-1 tracking-wide" style={{ color: '#F5EFE0' }}>
            {currentChakra.name} · {currentChakra.sanskrit}
          </div>
          <div className="text-sm mb-2" style={{ color: '#8B7355' }}>
            {currentChakra.freq}Hz · {currentChakra.element}行 · {currentChakra.desc}
          </div>
          <div className="flex items-center justify-center gap-2 mb-1" style={{ color: currentChakra.color }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: currentChakra.color }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: currentChakra.color }} />
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
              background: currentChakra.color + '15',
              border: `1px solid ${currentChakra.color}40`,
              color: currentChakra.color,
              boxShadow: `0 0 16px ${currentChakra.color}10`,
            }}>
            跳过引导，直接开始
          </button>
        </div>
      )}

      <BottomNav />
    </PageContainer>
  );
}
