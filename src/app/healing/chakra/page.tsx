'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import HealingCanvas, { type HealingCanvasHandle, HEALING_PRESET_CHAKRA } from '@/components/healing/HealingCanvas';
import { fmtTime } from '@/hooks/useTimer';
import { Play, Pause, Volume2, Timer, Sparkles, Headphones } from 'lucide-react';
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
 *  脉轮调谐 · 宋韵光色系版
 *  七脉轮索尔菲吉奥频率 (396/417/528/639/741/852/963)
 *  + HealingCanvas 脉轮旋转轮盘 + 能量光晕 + 彩色漩涡
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

  // ===== TTS 男声导引 =====
  const tts = useTTS({ defaultGender: 'male', defaultSpeed: 'slow', voiceId: 'zh-CN-YunjianNeural' });
  const ttsRef = useRef(tts);
  ttsRef.current = tts;
  // 待播放参数：导引播完后自动播放音乐
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

    // ★ 构建七脉轮播放队列，播完自动切下一首
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

  // ★ 带语音导引的播放（先播男声导引，播完自动进入音乐）
  const startPlayingWithGuide = useCallback((freq: number, beat: BinauralValue, mod: ModulationValue, chakraId?: string) => {
    // 停止任何正在进行的导引
    ttsRef.current.stop();
    if (guideEndTimeoutRef.current) { clearTimeout(guideEndTimeoutRef.current); guideEndTimeoutRef.current = null; }

    // 获取导引文案
    const text = chakraId ? getChakraGuide(chakraId) : '';
    if (text) {
      setGuideText(text);
      setPreludePlaying(true);
      pendingPlayRef.current = { freq, beat, mod };

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
          startPlaying(pending.freq, pending.beat, pending.mod);
        }
      }, estimatedMs);
    } else {
      // 无导引文案，直接播放
      startPlaying(freq, beat, mod);
    }
  }, [startPlaying]);

  // 跳过导引，直接进入音乐
  const skipPrelude = useCallback(() => {
    ttsRef.current.stop();
    if (guideEndTimeoutRef.current) { clearTimeout(guideEndTimeoutRef.current); guideEndTimeoutRef.current = null; }
    setPreludePlaying(false);
    const pending = pendingPlayRef.current;
    pendingPlayRef.current = null;
    if (pending) {
      startPlaying(pending.freq, pending.beat, pending.mod);
    }
  }, [startPlaying]);

  // 停止播放
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

  // 预设点击
  const applyPreset = useCallback((preset: typeof CHAKRA_PRESETS[number]) => {
    const chakraIdx = CHAKRAS.findIndex(c => c.id === preset.chakraId);
    setSelectedChakra(chakraIdx >= 0 ? chakraIdx : 0);
    setTimer(preset.timer);
    const freq = CHAKRAS[chakraIdx >= 0 ? chakraIdx : 0].freq;
    const chakraId = CHAKRAS[chakraIdx >= 0 ? chakraIdx : 0].id;
    startPlayingWithGuide(freq, preset.beat, preset.mod, chakraId);
  }, [startPlayingWithGuide, setTimer]);

  // 脉轮频率点击
  const toggleChakra = useCallback((idx: number) => {
    const chakra = CHAKRAS[idx];
    if (isPlaying && selectedChakra === idx) {
      stopAll();
    } else {
      setSelectedChakra(idx);
      startPlayingWithGuide(chakra.freq, binauralBeat, modulation as ModulationValue, chakra.id);
    }
  }, [isPlaying, selectedChakra, binauralBeat, modulation, startPlayingWithGuide, stopAll]);

  // 通过任意频率播放（扩展频率）
  const toggleChakraByFreq = useCallback((freq: number) => {
    // 找到最接近的脉轮
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

  // 定时器自动停止
  useEffect(() => {
    if (isPlaying && timerMinutes > 0 && elapsedSeconds >= timerMinutes * 60) {
      stopAll();
    }
  }, [elapsedSeconds, isPlaying, timerMinutes, stopAll]);

  // 播放状态同步
  useEffect(() => {
    if (!isPlaying && elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  }, [isPlaying]);

  // 清理
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

  // 当前脉轮
  const currentChakra = selectedChakra !== null ? CHAKRAS[selectedChakra] : null;
  const volPercent = Math.round(volume * 100);

  return (
    <PageContainer theme="healing" noShanshui>
      {/* Header */}
      <HealingHeader
        title="脉轮调谐"
        subtitle="七轮索尔菲吉奥 · 频率共振"
      />

      {hasDiagnosis && recommendedChakra && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-400/30 flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">荐</span>
          <span className="text-xs text-amber-800 font-serif">基于您的{primaryConstitution}，推荐{recommendedChakra}调谐</span>
        </div>
      )}

      {/* Canvas 可视化区域 */}
      <div className="relative" style={{ height: 240, background: 'linear-gradient(180deg, #FDF8F0 0%, #F5EFE0 100%)', borderRadius: 12, margin: '8px 8px 0', boxShadow: 'inset 0 0 12px rgba(196,168,112,0.08)' }}>
        <HealingCanvas
          ref={healingCanvasRef}
          energy={audioEnergy}
          config={HEALING_PRESET_CHAKRA}
        />
        {/* 中心脉轮信息 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {isPlaying && currentChakra ? (
              <>
                <div className="text-3xl font-extralight tabular-nums tracking-tight sm:text-4xl" style={{ color: currentChakra.color }}>
                  {currentChakra.freq}
                  <span className="ml-1 text-sm sm:text-lg" style={{ color: '#8B7355' }}>Hz</span>
                </div>
                <div className="text-base font-bold font-serif mt-1" style={{ color: currentChakra.color }}>
                  {currentChakra.name}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>
                  {currentChakra.sanskrit} · {currentChakra.element}行
                </div>
              </>
            ) : (
              <div className="text-3xl font-extralight" style={{ color: '#C4A870' }}>脉轮调谐</div>
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
        {/* 播放/暂停 */}
        <div className="absolute bottom-2 left-3">
          <button
            onClick={() => isPlaying ? stopAll() : (selectedChakra !== null ? startPlayingWithGuide(CHAKRAS[selectedChakra].freq, binauralBeat, modulation as ModulationValue, CHAKRAS[selectedChakra].id) : startPlayingWithGuide(528, 10, 'ocean', 'heart'))}
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

        {/* 脉轮疗愈预设 */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: '#8B2500' }} />
            <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>疗愈预设</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {CHAKRA_PRESETS.map((preset, i) => {
              const chakraIdx = CHAKRAS.findIndex(c => c.id === preset.chakraId);
              const isActive = isPlaying && selectedChakra === chakraIdx && binauralBeat === preset.beat;
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
                    {CHAKRAS.find(c => c.id === preset.chakraId)?.icon || '轮'}
                  </div>
                  <div className="text-xs font-bold" style={{ color: '#2C1810' }}>{preset.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>{preset.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 七脉轮选择 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>七脉轮</h3>
          <div className="space-y-2">
            {CHAKRAS.map((chakra, i) => {
              const active = isPlaying && selectedChakra === i;
              const isRecommended = hasDiagnosis && recommendedChakra && chakra.id === recommendedChakra;
              return (
                <button
                  key={chakra.id}
                  onClick={() => toggleChakra(i)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition hover:shadow-sm active:scale-[0.98] relative"
                  style={{
                    background: active ? chakra.color + '10' : '#FDF8F0',
                    borderColor: active ? chakra.color + '60' : isRecommended ? chakra.color + '40' : '#EDE4D3',
                  }}
                >
                  {isRecommended && !active && (
                    <span className="absolute top-1 right-2 text-[8px] px-1 py-px rounded bg-amber-500/25 text-amber-700 font-bold leading-none">荐</span>
                  )}
                  {/* 脉轮图标 */}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                    style={{
                      backgroundColor: chakra.color + '18',
                      border: `2px solid ${chakra.color}`,
                      color: chakra.color,
                      boxShadow: active ? `0 0 12px ${chakra.color}30` : 'none',
                    }}
                  >
                    {chakra.icon}
                  </div>
                  {/* 信息 */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm" style={{ color: active ? chakra.color : '#2C1810' }}>{chakra.name}</span>
                      <span className="text-[10px]" style={{ color: '#8B7355' }}>{chakra.sanskrit}</span>
                    </div>
                    <div className="text-[10px] mt-0.5" style={{ color: '#5C3015' }}>{chakra.desc}</div>
                    <div className="text-[10px]" style={{ color: '#8B7355' }}>
                      {chakra.freq}Hz · {chakra.element}行 · {chakra.organ}
                    </div>
                  </div>
                  {/* 频率指示 */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-lg font-light tabular-nums" style={{ color: active ? chakra.color : '#B8A080' }}>
                      {chakra.freq}
                    </div>
                    <div className="text-[8px]" style={{ color: '#8B7355' }}>Hz</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 脉轮详情 */}
        {selectedChakra !== null && (
          <div className="mb-5 rounded-xl p-4" style={{ background: CHAKRAS[selectedChakra].color + '08', border: `1px solid ${CHAKRAS[selectedChakra].color}20` }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: CHAKRAS[selectedChakra].color + '20', color: CHAKRAS[selectedChakra].color }}>
                {CHAKRAS[selectedChakra].icon}
              </div>
              <h4 className="font-bold text-sm" style={{ color: CHAKRAS[selectedChakra].color }}>{CHAKRAS[selectedChakra].name}</h4>
              <span className="text-[10px]" style={{ color: '#8B7355' }}>{CHAKRAS[selectedChakra].sanskrit}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="font-bold" style={{ color: '#5C1A00' }}>频率：</span>
                <span style={{ color: '#5C3015' }}>{CHAKRAS[selectedChakra].freq}Hz (索尔菲吉奥)</span>
              </div>
              <div>
                <span className="font-bold" style={{ color: '#5C1A00' }}>五行：</span>
                <span style={{ color: '#5C3015' }}>{CHAKRAS[selectedChakra].element}行</span>
              </div>
              <div>
                <span className="font-bold" style={{ color: '#5C1A00' }}>对应：</span>
                <span style={{ color: '#5C3015' }}>{CHAKRAS[selectedChakra].organ}</span>
              </div>
              <div>
                <span className="font-bold" style={{ color: '#5C1A00' }}>功能：</span>
                <span style={{ color: '#5C3015' }}>{CHAKRAS[selectedChakra].desc}</span>
              </div>
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
                  if (isPlaying && selectedChakra !== null) {
                    startPlaying(CHAKRAS[selectedChakra].freq, bm.value, modulation as ModulationValue);
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
          {binauralBeat > 0 && selectedChakra !== null && (
            <p className="text-[10px] mt-2 px-3 py-1.5 rounded-lg" style={{ color: '#8B7355', background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
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

        {/* 脉轮补充频率（healing-frequencies 带波长数据） */}
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
                  style={{
                    background: '#FDF8F0',
                    borderColor: color + '30',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ backgroundColor: color + '18', border: `2px solid ${color}`, color }}
                  >
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
                        onClick={() => toggleChakraByFreq(f.f)}
                        className="px-2 py-1 rounded-lg text-[10px] font-mono tabular-nums transition hover:shadow-sm"
                        style={{
                          background: info.color + '10',
                          border: `1px solid ${info.color}30`,
                          color: '#2C1810',
                        }}
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

        {/* 脉轮说明 */}
        <div className="rounded-xl p-4 mb-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
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

      {/* ===== 前奏导引浮层 — 沉浸聆听男声引导 ===== */}
      {preludePlaying && currentChakra && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{
            background: `radial-gradient(ellipse at center, ${currentChakra.color}15 0%, rgba(253,248,240,0.96) 50%, rgba(253,248,240,0.88) 100%)`,
            backdropFilter: 'blur(8px)',
          }}>
          {/* 脉轮大字 */}
          <div className="font-black font-serif mb-4" style={{
            fontSize: 88,
            color: currentChakra.color,
            textShadow: `0 0 48px ${currentChakra.color}50, 0 0 96px ${currentChakra.color}25`,
            lineHeight: 1,
          }}>
            {currentChakra.icon}
          </div>

          {/* 脉轮信息 */}
          <div className="text-base font-bold mb-1 tracking-wide" style={{ color: '#5C1A00' }}>
            {currentChakra.name} · {currentChakra.sanskrit}
          </div>
          <div className="text-sm mb-2" style={{ color: '#8B7355' }}>
            {currentChakra.freq}Hz · {currentChakra.element}行 · {currentChakra.desc}
          </div>

          {/* 引导状态指示 */}
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

          {/* 跳过按钮 */}
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
