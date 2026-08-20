'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import HealingCanvas, { type HealingCanvasHandle, HEALING_PRESET_LIUZIJUE } from '@/components/healing/HealingCanvas';
import { useTTS } from '@/hooks/useTTS';
import { useHealingRecommendation } from '@/hooks/useHealingRecommendation';
import { Play, Pause, Volume2, RotateCcw, Sparkles, VolumeX, ArrowLeft, Brain, Heart, Wind, BookOpen, Lightbulb, Star, Headphones } from 'lucide-react';
import { LIUZIJUE_GUIDE_CONFIG, getLiuzijueGuide } from '@/lib/liuzijue-guide-data';
import { useCultivationStore } from '@/lib/cultivation-store';
import { liuzijueIdToElement, XIUWEI_GAINS, type WuxingElement } from '@/lib/cultivation-engine';
import { getClientUserId } from '@/lib/auth';

import {
  LIUZIJUE,
  BREATH_MODES,
  COMPLETION_SCIENCE,
  COMPLETION_STUDIES,
  WHEN_TO_PRACTICE,
  WHAT_YOU_NOTICE,
  BEST_TIPS,
  RECOMMENDED_PRACTICES,
  type BreathMode,
  type LiuzijueItem,
  type BreathModeConfig,
} from '@/lib/data/liuzijue-completion-data';

/* ================================================================
 *  六字诀呼吸法 · 宋韵光色系版
 *  v5: 纯净化呼吸球（无金色粒子）+ 五行音阶悦耳音效 + 完成页面
 * ================================================================ */

// ===== 呼吸模式 =====
type BreathPhase = 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'idle';

// ===== 初始引导文案（仅播放一次） =====
const GUIDE_TEXTS_START = {
  startLiuzijue: (jue: LiuzijueItem) =>
    `欢迎来到${jue.char}字诀的疗愈之旅。${jue.desc}。请找到舒适的坐姿，双手轻放膝上，缓缓闭上双眼。`,
  startGeneric: (mode: BreathModeConfig) =>
    `欢迎来到${mode.name}的疗愈练习。请找到舒适的姿势，轻轻闭上双眼，把注意力带回到呼吸上。`,
  completeLiuzijue: (jue: LiuzijueItem) =>
    `练习完成。${jue.char}字诀的疗愈之力已融入你的每一寸肌肤。请慢慢睁开双眼。`,
  completeGeneric: `练习完成。感受此刻身心的清明与安宁，请慢慢睁开双眼。`,
};

// ===== 五行音阶悦耳音效 =====
// 使用五声音阶(C-D-E-G-A)的柔和泛音+余韵衰减，替代机械正弦波
class WuyinAudioCue {
  private ctx: AudioContext | null = null;
  private enabled = true;
  private masterGain: GainNode | null = null;

  setEnabled(v: boolean) { this.enabled = v; }

  private ensureCtx(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      } catch { return null; }
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  /** 播放一个柔和的泛音音符 */
  private playTone(freq: number, startTime: number, duration: number, vol: number) {
    const ctx = this.ctx;
    const dest = this.masterGain;
    if (!ctx || !dest) return;

    // 基音（三角波 — 温暖柔和）
    const osc1 = ctx.createOscillator();
    const g1 = ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(freq, startTime);
    g1.gain.setValueAtTime(vol * 0.7, startTime);
    g1.gain.exponentialRampToValueAtTime(vol * 0.3, startTime + duration * 0.6);
    g1.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc1.connect(g1).connect(dest);
    osc1.start(startTime);
    osc1.stop(startTime + duration);

    // 五度泛音（正弦，清亮）
    const osc2 = ctx.createOscillator();
    const g2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 1.5, startTime);
    g2.gain.setValueAtTime(vol * 0.2, startTime);
    g2.gain.exponentialRampToValueAtTime(vol * 0.05, startTime + duration * 0.4);
    g2.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.6);
    osc2.connect(g2).connect(dest);
    osc2.start(startTime);
    osc2.stop(startTime + duration * 0.6);

    // 八度泛音（极淡高光）
    const osc3 = ctx.createOscillator();
    const g3 = ctx.createGain();
    osc3.type = 'sine';
    osc3.frequency.setValueAtTime(freq * 2, startTime);
    g3.gain.setValueAtTime(vol * 0.08, startTime);
    g3.gain.exponentialRampToValueAtTime(0.001, startTime + duration * 0.3);
    osc3.connect(g3).connect(dest);
    osc3.start(startTime);
    osc3.stop(startTime + duration * 0.3);
  }

  /** 吸气：C→E 上行五声音阶，温和如气入丹田 */
  inhale(baseFreq = 261.63) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.playTone(baseFreq, t, 1.2, 0.5);
    this.playTone(baseFreq * 5 / 4, t + 0.3, 1.0, 0.35); // 大三度 E
  }

  /** 屏住：单一持续音，泛音缭绕 */
  hold(baseFreq = 329.63) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.playTone(baseFreq, t, 0.8, 0.3);
  }

  /** 呼气：E→C 下行五声音阶，如浊气释出 */
  exhale(baseFreq = 329.63) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    this.playTone(baseFreq, t, 1.2, 0.5);
    this.playTone(baseFreq * 4 / 5, t + 0.3, 1.0, 0.35); // 下行大三度
  }

  /** 完成：宫商角徵羽五音下行琶音 + 最终和弦 */
  complete(baseFreq = 261.63) {
    const ctx = this.ensureCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    // 五音下行琶音 (宫→羽→徵→商→角)
    const pentatonic = [1, 5/4, 3/2, 5/3, 2]; // C E G A C'
    pentatonic.forEach((ratio, i) => {
      this.playTone(baseFreq * 2 / ratio, t + i * 0.15, 2.0 - i * 0.2, 0.35 - i * 0.04);
    });
  }

  destroy() {
    if (this.ctx) { this.ctx.close(); this.ctx = null; this.masterGain = null; }
  }
}



// ===== 主页面 =====
export default function LiuzijuePage() {
  const { hasDiagnosis, recommendedLiuzijue, primaryConstitution } = useHealingRecommendation();
  const hasAutoSelectedRef = useRef(false);
  const [mode, setMode] = useState<BreathMode>('liuzijue');
  const [selectedJue, setSelectedJue] = useState(0);
  const [phase, setPhase] = useState<BreathPhase>('idle');
  const [isActive, setIsActive] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalCycles, setTotalCycles] = useState(6);
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [canvasEnergy, setCanvasEnergy] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);
  const [completedElapsed, setCompletedElapsed] = useState(0);
  const [completedCycles, setCompletedCycles] = useState(0);

  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const secondIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentPhaseStartRef = useRef<number>(0);
  const currentPhaseDurRef = useRef<number>(0);
  const prevEnergyRef = useRef(0);
  const healingCanvasRef = useRef<HealingCanvasHandle>(null);
  const audioCueRef = useRef(new WuyinAudioCue());

  const tts = useTTS({ defaultGender: 'male', defaultSpeed: 'slow' });
  const ttsRef = useRef(tts);
  ttsRef.current = tts;

  // ===== 前奏 / 加深导引音频引用 =====
  const preludeAudioRef = useRef<HTMLAudioElement | null>(null);
  const deepenAudioRef = useRef<HTMLAudioElement | null>(null);
  const [preludePlaying, setPreludePlaying] = useState(false);
  // 防止 prelude onended 与 skip 重复触发 enterBreathingLoop
  const enteredLoopRef = useRef(false);

  useEffect(() => { audioCueRef.current.setEnabled(audioEnabled); }, [audioEnabled]);
  useEffect(() => () => { audioCueRef.current.destroy(); }, []);

  const currentMode = BREATH_MODES.find(m => m.id === mode)!;
  const currentJue = LIUZIJUE[selectedJue];

  // ---- 自动选择推荐六字诀（仅初始化一次） ----
  useEffect(() => {
    if (hasDiagnosis && recommendedLiuzijue && !hasAutoSelectedRef.current) {
      hasAutoSelectedRef.current = true;
      const idx = LIUZIJUE.findIndex(j => j.id === recommendedLiuzijue);
      if (idx >= 0) setSelectedJue(idx);
    }
  }, [hasDiagnosis, recommendedLiuzijue]);

  // ===== 呼吸能量 → HealingCanvas =====
  useEffect(() => {
    let energy = 0;
    if (phase === 'inhale') energy = phaseProgress;
    else if (phase === 'exhale') energy = (1 - phaseProgress) * 0.7;
    else if (phase === 'hold1' || phase === 'hold2') energy = 0.5;
    const smooth = prevEnergyRef.current * 0.85 + energy * 0.15;
    prevEnergyRef.current = smooth;
    setCanvasEnergy(smooth);
  }, [phase, phaseProgress]);

  // ===== 呼吸相位变化 =====
  const prevPhaseRef = useRef<BreathPhase>('idle');
  useEffect(() => {
    if (phase !== prevPhaseRef.current && isActive) {
      prevPhaseRef.current = phase;
    }
    if (!isActive) prevPhaseRef.current = 'idle';
  }, [phase, isActive]);

  // ===== 呼吸循环引擎 =====
  const stopBreathing = useCallback(() => {
    if (phaseTimerRef.current) { clearTimeout(phaseTimerRef.current); phaseTimerRef.current = null; }
    if (secondIntervalRef.current) { clearInterval(secondIntervalRef.current); secondIntervalRef.current = null; }
    if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
    setPhase('idle');
    setIsActive(false);
    setPhaseProgress(0);
    setPreludePlaying(false);
    enteredLoopRef.current = false;
    if (preludeAudioRef.current) { preludeAudioRef.current.pause(); preludeAudioRef.current = null; }
    if (deepenAudioRef.current) { deepenAudioRef.current.pause(); deepenAudioRef.current = null; }
    ttsRef.current.stop();
  }, []);

  const getPhaseDuration = useCallback((p: BreathPhase): number => {
    if (p === 'inhale') return currentMode.inhale;
    if (p === 'hold1') return currentMode.hold1;
    if (p === 'exhale') return currentMode.exhale;
    if (p === 'hold2') return currentMode.hold2;
    return 0;
  }, [currentMode]);

  const runPhase = useCallback((nextPhase: BreathPhase, durationSec: number) => {
    if (durationSec === 0) {
      const phases: BreathPhase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
      const idx = phases.indexOf(nextPhase);
      const nextIdx = (idx + 1) % phases.length;
      if (nextIdx === 0) setCycleCount(c => c + 1);
      runPhase(phases[nextIdx], getPhaseDuration(phases[nextIdx]));
      return;
    }

    setPhase(nextPhase);
    setPhaseProgress(0);
    currentPhaseStartRef.current = Date.now();
    currentPhaseDurRef.current = durationSec * 1000;

    progressIntervalRef.current = setInterval(() => {
      const el = Date.now() - currentPhaseStartRef.current;
      setPhaseProgress(Math.min(el / currentPhaseDurRef.current, 1));
    }, 50);

    // 五行音阶悦耳音效
    const baseFreq = mode === 'liuzijue' ? currentJue.freq : 261.63;
    if (nextPhase === 'inhale') {
      audioCueRef.current.inhale(baseFreq);
    } else if (nextPhase === 'exhale') {
      audioCueRef.current.exhale(baseFreq * 5 / 4);
    } else if (nextPhase === 'hold1' || nextPhase === 'hold2') {
      audioCueRef.current.hold(baseFreq * 3 / 2);
    }

    phaseTimerRef.current = setTimeout(() => {
      if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
      const phases: BreathPhase[] = ['inhale', 'hold1', 'exhale', 'hold2'];
      const idx = phases.indexOf(nextPhase);
      const nextIdx = (idx + 1) % phases.length;
      if (nextIdx === 0) setCycleCount(c => c + 1);
      runPhase(phases[nextIdx], getPhaseDuration(phases[nextIdx]));
    }, durationSec * 1000);
  }, [getPhaseDuration, mode, currentJue]);

  const enterBreathingLoop = useCallback(() => {
    // 双重守卫：prelude onended 与 skip 可能同时触发，只允许进入一次
    if (enteredLoopRef.current) return;
    enteredLoopRef.current = true;

    setIsActive(true);
    setCycleCount(0);
    setElapsed(0);
    secondIntervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000);

    // 六字诀模式：前奏已涵盖姿势/闭眼/呼吸预演，这里不再播开场短文案
    // 通用呼吸模式：仍播开场短文案引导用户
    if (audioEnabled && mode !== 'liuzijue') {
      ttsRef.current.speak(GUIDE_TEXTS_START.startGeneric(currentMode), 0.6);
    }
    const startDelay = mode === 'liuzijue' ? 1500 : 3500;
    setTimeout(() => runPhase('inhale', currentMode.inhale), startDelay);
  }, [audioEnabled, currentJue, currentMode, mode, runPhase]);

  // 跳过前奏导引，直接进入呼吸循环
  const skipPrelude = useCallback(() => {
    if (preludeAudioRef.current) { preludeAudioRef.current.pause(); preludeAudioRef.current = null; }
    setPreludePlaying(false);
    enterBreathingLoop();
  }, [enterBreathingLoop]);

  const startBreathing = useCallback(() => {
    // 每次开始新练习前重置守卫（停止/完成后再次开始时确保能进入呼吸循环）
    enteredLoopRef.current = false;
    ttsRef.current.stop();
    setShowCompletion(false);

    // 六字诀模式 + 音频开启：先进入前奏引导阶段（男声深度导引 MP3）
    if (mode === 'liuzijue' && audioEnabled) {
      const guide = getLiuzijueGuide(currentJue.id);
      if (guide) {
        // 清理可能残留的前奏音频
        if (preludeAudioRef.current) { preludeAudioRef.current.pause(); preludeAudioRef.current = null; }
        setPreludePlaying(true);
        const audio = new Audio(guide.preludeAudio);
        audio.volume = LIUZIJUE_GUIDE_CONFIG.preludeVolume;
        audio.onended = () => {
          setPreludePlaying(false);
          preludeAudioRef.current = null;
          enterBreathingLoop();
        };
        audio.onerror = () => {
          setPreludePlaying(false);
          preludeAudioRef.current = null;
          enterBreathingLoop();
        };
        preludeAudioRef.current = audio;
        audio.play().catch(() => {
          // 浏览器策略阻止 autoplay 或加载失败：降级直接进入呼吸
          setPreludePlaying(false);
          preludeAudioRef.current = null;
          enterBreathingLoop();
        });
        return;
      }
    }

    // 通用呼吸模式 或 未启用音频：直接进入呼吸循环
    enterBreathingLoop();
  }, [audioEnabled, currentJue, mode, enterBreathingLoop]);

  useEffect(() => {
    if (isActive && cycleCount >= totalCycles) {
      // 停止加深导引音频
      if (deepenAudioRef.current) { deepenAudioRef.current.pause(); deepenAudioRef.current = null; }
      // 记录完成数据
      setCompletedElapsed(elapsed);
      setCompletedCycles(cycleCount);

      // ★ 记录修为获得
      try {
        const el: WuxingElement = mode === 'liuzijue' ? liuzijueIdToElement(currentJue.id) : 'earth';
        const gain = XIUWEI_GAINS.liuzijue_cycle * cycleCount;
        useCultivationStore.getState().addXiuWei(el, gain);
        useCultivationStore.getState().recordPractice('liuzijue', elapsed, el, gain);
        useCultivationStore.getState().completeTodayStep('liuzijue');
        // 异步写入 DB
        fetch('/api/cultivation/practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: getClientUserId(),
            category: 'liuzijue',
            subCategory: currentJue.id,
            element: el,
            durationSec: elapsed,
            cycles: cycleCount,
          }),
        }).catch(() => {});
      } catch {}

      // 只播 TTS，不播 audioCue（避免同时播放导致断续）
      if (audioEnabled) {
        ttsRef.current.speak(
          mode === 'liuzijue' ? GUIDE_TEXTS_START.completeLiuzijue(currentJue) : GUIDE_TEXTS_START.completeGeneric,
          0.5, 0.8,
        );
      }
      // 停止呼吸引擎（不调用 stopBreathing 避免截断 TTS）
      if (phaseTimerRef.current) { clearTimeout(phaseTimerRef.current); phaseTimerRef.current = null; }
      if (secondIntervalRef.current) { clearInterval(secondIntervalRef.current); secondIntervalRef.current = null; }
      if (progressIntervalRef.current) { clearInterval(progressIntervalRef.current); progressIntervalRef.current = null; }
      setPhase('idle');
      setIsActive(false);
      setPhaseProgress(0);
      // 等 TTS 自然播完后再切完成页面
      setTimeout(() => { setShowCompletion(true); }, 6000);
    }
  }, [cycleCount, isActive, totalCycles, audioEnabled, currentJue, mode, elapsed]);

  // ===== 加深导引：每 N 轮呼吸自动播放对应字诀的加深 MP3 =====
  useEffect(() => {
    if (!isActive || mode !== 'liuzijue' || !audioEnabled) return;
    if (LIUZIJUE_GUIDE_CONFIG.deepenEvery <= 0) return;
    if (cycleCount <= 0 || cycleCount >= totalCycles) return;
    if (cycleCount % LIUZIJUE_GUIDE_CONFIG.deepenEvery !== 0) return;

    const guide = getLiuzijueGuide(currentJue.id);
    if (!guide) return;

    // 停止上一个加深导引（若有）
    if (deepenAudioRef.current) {
      deepenAudioRef.current.pause();
      deepenAudioRef.current = null;
    }
    const audio = new Audio(guide.deepenAudio);
    audio.volume = LIUZIJUE_GUIDE_CONFIG.deepenVolume;
    audio.onended = () => { deepenAudioRef.current = null; };
    audio.onerror = () => { deepenAudioRef.current = null; };
    deepenAudioRef.current = audio;
    audio.play().catch(() => { deepenAudioRef.current = null; });
  }, [cycleCount, isActive, totalCycles, mode, audioEnabled, currentJue]);

  useEffect(() => () => { stopBreathing(); ttsRef.current.stop(); }, [stopBreathing]);

  // ===== 画面状态 =====
  const jueColor = phase === 'idle'
    ? (mode === 'liuzijue' ? currentJue.color : currentMode.color)
    : phase === 'exhale'
      ? (mode === 'liuzijue' ? currentJue.color : currentMode.color)
      : phase === 'inhale'
        ? '#C4A35A'
        : '#9B8055';

  const phaseDuration = getPhaseDuration(phase);
  const phaseCountdown = phaseDuration > 0 ? Math.ceil(phaseDuration * (1 - phaseProgress)) : 0;

  const phaseLabel: Record<BreathPhase, string> = {
    idle: '准备开始', inhale: '缓缓吸气', hold1: '轻轻屏住', exhale: '慢慢呼气', hold2: '静静屏住',
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  // ===== 完成页面 =====
  if (showCompletion) {
    const breathsPerMin = completedElapsed > 0 ? (completedCycles / completedElapsed * 60).toFixed(1) : '0';
    return (
    <div className="flex flex-col h-screen overflow-hidden pb-16" style={{ background: '#FDF8F0' }}>
        <HealingHeader title="练习完成" subtitle="身心安泰 · 功德圆满" />

        <div className="flex-1 overflow-y-auto px-4 pb-6" style={{ paddingTop: 20 }}>
          {/* 鼓励标题 */}
          <div className="text-center mb-4">
            <div className="text-3xl font-bold mb-2" style={{ color: '#5C1A00' }}>做得很好</div>
            <div className="text-sm leading-relaxed" style={{ color: '#8B7355' }}>
              您在 {formatElapsed(completedElapsed)} 内完成了 {completedCycles} 个呼吸循环。
            </div>
          </div>

          {/* ★ 修为获得提示 */}
          {(() => {
            const el: WuxingElement = mode === 'liuzijue' ? liuzijueIdToElement(currentJue.id) : 'earth';
            const gain = XIUWEI_GAINS.liuzijue_cycle * completedCycles;
            const color = mode === 'liuzijue' ? currentJue.color : '#C9A94F';
            return (
              <div className="rounded-xl p-3 mb-4 text-center" style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                <p className="text-xs font-bold" style={{ color }}>
                  +{gain} {mode === 'liuzijue' ? `${currentJue.element}行` : '土行'}修为
                </p>
              </div>
            );
          })()}

          {/* 三项指标卡片 */}
          <div className="flex gap-3 mb-6">
            {[
              { icon: <Heart size={18} />, label: '心率降低', color: '#FB7185' },
              { icon: <Brain size={18} />, label: '心境平静', color: '#818CF8' },
              { icon: <Wind size={18} />, label: '呼吸调节', color: '#60A5FA' },
            ].map((item, i) => (
              <div key={i} className="flex-1 rounded-xl p-3 text-center" style={{
                background: `${item.color}08`,
                border: `1px solid ${item.color}20`,
              }}>
                <div className="flex justify-center mb-1" style={{ color: item.color }}>{item.icon}</div>
                <div className="text-xs font-bold" style={{ color: item.color }}>{item.label}</div>
              </div>
            ))}
          </div>

          {/* 何时练习 */}
          <div className="rounded-xl p-4 mb-4" style={{ background: '#F5EFE0', border: '1px solid #EDE4D3' }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} style={{ color: '#B8860B' }} />
              <span className="text-xs font-bold" style={{ color: '#5C1A00' }}>何时练习</span>
            </div>
            {WHEN_TO_PRACTICE.map((txt, i) => (
              <div key={i} className="text-xs py-1 flex items-start gap-2" style={{ color: '#5C3015' }}>
                <span style={{ color: '#B8860B' }}>·</span>
                <span>{txt}</span>
              </div>
            ))}
          </div>

          {/* 您会注意到 */}
          <div className="rounded-xl p-4 mb-4" style={{ background: '#F5EFE0', border: '1px solid #EDE4D3' }}>
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} style={{ color: '#B8860B' }} />
              <span className="text-xs font-bold" style={{ color: '#5C1A00' }}>您会注意到</span>
            </div>
            {WHAT_YOU_NOTICE.map((txt, i) => (
              <div key={i} className="text-xs py-1 flex items-start gap-2" style={{ color: '#5C3015' }}>
                <span style={{ color: '#B8860B' }}>✓</span>
                <span>{txt}</span>
              </div>
            ))}
          </div>

          {/* 呼吸练习的工作原理 */}
          <div className="rounded-xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #E8F5E9, #F5EFE0)', border: '1px solid #C8E6C9' }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} style={{ color: '#4ADE80' }} />
              <span className="text-xs font-bold" style={{ color: '#2E7D32' }}>呼吸练习的工作原理</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: '#33691E' }}>
              通过{currentMode.inhale}:{currentMode.exhale}的受控呼吸模式，可刺激迷走神经 —
              这是副交感神经系统的主要组成部分。激活这一神经会发送信号，帮助身体从「战斗或逃跑」状态过渡到「休息和修复」模式。
            </p>
            <p className="text-xs leading-relaxed mt-2" style={{ color: '#33691E' }}>
              这种转变可以降低心率和血压，血管放松改善循环，增加大脑氧气流动，并积极影响消化和免疫系统。
            </p>
          </div>

          {/* 三大科学机制 */}
          <div className="grid grid-cols-1 gap-3 mb-4">
            {Object.values(COMPLETION_SCIENCE).map((item, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">{item.icon}</span>
                  <span className="text-xs font-bold" style={{ color: '#5C1A00' }}>{item.title}</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#8B7355' }}>{item.desc}</p>
              </div>
            ))}
          </div>

          {/* 呼吸练习背后的科学 */}
          <div className="rounded-xl p-4 mb-4" style={{ background: 'linear-gradient(135deg, #E3F2FD, #F5EFE0)', border: '1px solid #BBDEFB' }}>
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={14} style={{ color: '#1976D2' }} />
              <span className="text-xs font-bold" style={{ color: '#0D47A1' }}>呼吸练习背后的科学</span>
            </div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#1565C0' }}>
              研究一致表明，腹式呼吸可显著减少焦虑和生理唤醒。一项8周包含20次15分钟腹式呼吸的计划，使负面情绪降低2.55分，皮质醇水平下降1.32-1.66纳克/毫升。
            </p>
            <div className="grid grid-cols-3 gap-2">
              {COMPLETION_STUDIES.map((study, i) => (
                <div key={i} className="rounded-lg p-2 text-center" style={{ background: 'rgba(25,118,210,0.06)' }}>
                  <div className="text-lg font-black" style={{ color: '#1976D2' }}>{study.metric}</div>
                  <div className="text-[10px] font-bold" style={{ color: '#0D47A1' }}>{study.title}</div>
                  <div className="text-[9px] mt-0.5 leading-tight" style={{ color: '#5C3015' }}>{study.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* 获得最佳效果的提示 */}
          <div className="rounded-xl p-4 mb-4" style={{ background: '#F5EFE0', border: '1px solid #EDE4D3' }}>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={14} style={{ color: '#B8860B' }} />
              <span className="text-xs font-bold" style={{ color: '#5C1A00' }}>获得最佳效果的提示</span>
            </div>
            {BEST_TIPS.map((tip, i) => (
              <div key={i} className="mb-2 last:mb-0">
                <div className="text-xs font-bold" style={{ color: '#B8860B' }}>{tip.title}</div>
                <div className="text-xs" style={{ color: '#8B7355' }}>{tip.desc}</div>
              </div>
            ))}
          </div>

          {/* 推荐练习 */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles size={14} style={{ color: '#B8860B' }} />
              <span className="text-xs font-bold" style={{ color: '#5C1A00' }}>推荐练习</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {RECOMMENDED_PRACTICES.map((p, i) => (
                <div key={i} className="rounded-xl p-3" style={{
                  background: `${p.color}08`,
                  border: `1px solid ${p.color}20`,
                }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{p.emoji}</span>
                    <span className="text-xs font-bold" style={{ color: p.color }}>{p.name}</span>
                  </div>
                  <p className="text-[10px] leading-tight" style={{ color: '#8B7355' }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 再次练习按钮 */}
          <button onClick={() => setShowCompletion(false)}
            className="w-full py-3 rounded-xl text-sm font-bold transition active:scale-95"
            style={{ background: `linear-gradient(135deg, ${currentMode.color}, ${currentMode.color}cc)`, color: 'white' }}>
            再次练习
          </button>
        </div>

        <BottomNav />
      </div>
    );
  }

  // ===== 主练习页面 =====
  return (
    <div className="relative" style={{ height: '100vh', overflow: 'hidden', background: '#FDF8F0' }}>
      {/* Canvas — 全权渲染纯净化 Fibonacci 呼吸球 */}
      <div className="absolute inset-0 z-0">
        <HealingCanvas
          ref={healingCanvasRef}
          energy={canvasEnergy}
          config={HEALING_PRESET_LIUZIJUE}
          breathPhase={phase}
          breathProgress={phaseProgress}
          jueColor={jueColor}
        />
      </div>

      {/* 顶部 Header — 毛玻璃淡入 */}
      <div className="relative z-10">
        <HealingHeader title="六字诀呼吸法" subtitle="沉浸疗愈 · 五脏调养 · 呼吸引导" />
      </div>

      {hasDiagnosis && recommendedLiuzijue && (
        <div className="relative z-10 mx-4 mt-1 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-400/30 flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">荐</span>
          <span className="text-xs text-amber-800 font-serif">基于您的{primaryConstitution}，推荐「{LIUZIJUE.find(j => j.id === recommendedLiuzijue)?.char}」字诀</span>
        </div>
      )}

      {/* 中心呼吸区 — 全部浮于球体之上，自上而下：字诀 → 信息 → 控件 */}
      <div className="absolute left-0 right-0 z-10" style={{ top: 110, bottom: 64, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

        {/* -- 字诀选择环 -- 六个字诀直接围绕球体核心 */}
        {mode === 'liuzijue' && !isActive && (
          <div className="flex gap-4 justify-center mb-4">
            {LIUZIJUE.map((jue, i) => (
              <button key={jue.id} onClick={() => setSelectedJue(i)}
                className="flex flex-col items-center transition active:scale-90 relative"
                style={{ opacity: selectedJue === i ? 1 : 0.45 }}>
                {hasDiagnosis && recommendedLiuzijue === jue.id && selectedJue !== i && (
                  <span className="absolute -top-2 -right-1 text-[8px] px-1 py-px rounded bg-amber-500/25 text-amber-700 font-bold leading-none">荐</span>
                )}
                <div style={{
                  width: selectedJue === i ? 48 : 40,
                  height: selectedJue === i ? 48 : 40,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: selectedJue === i ? 24 : 18,
                  fontFamily: 'serif', fontWeight: 900,
                  backgroundColor: jue.color + (selectedJue === i ? '25' : '10'),
                  border: `2px solid ${selectedJue === i ? jue.color : jue.color + '25'}`,
                  color: jue.color,
                  boxShadow: selectedJue === i ? `0 0 16px ${jue.color}30` : 'none',
                  transition: 'all 0.2s ease',
                }}>
                  {jue.char}
                </div>
                <div className="text-[9px] mt-1 font-bold" style={{ color: '#5C3015' }}>{jue.organ}</div>
              </button>
            ))}
          </div>
        )}

        {/* -- 练习中字诀（大号）-- */}
        {mode === 'liuzijue' && isActive && (phase === 'exhale' || phase === 'hold1') && (
          <div className="font-black font-serif" style={{
            fontSize: 60, color: jueColor,
            textShadow: `0 0 30px ${jueColor}50, 0 0 60px ${jueColor}20`,
            opacity: 0.9,
          }}>
            {currentJue.char}
          </div>
        )}

        {/* -- 非活跃时：选中字诀信息 -- */}
        {!isActive && mode === 'liuzijue' && (
          <div className="text-center mt-1 mb-3">
            <div className="text-sm" style={{ color: '#5C3015' }}>{currentJue.desc}</div>
            <div className="text-xs mt-0.5" style={{ color: '#8B7355' }}>{currentJue.element}行 · {currentJue.wuyin}音 · {currentJue.organ}</div>
          </div>
        )}

        {/* -- 倒计时 -- */}
        {isActive && phaseDuration > 0 && (
          <div className="font-mono tabular-nums font-light" style={{
            fontSize: mode === 'liuzijue' && (phase === 'exhale' || phase === 'hold1') ? 22 : 48,
            color: `rgba(92,26,0,${mode === 'liuzijue' && (phase === 'exhale' || phase === 'hold1') ? 0.5 : 0.65})`,
            textShadow: '0 0 12px rgba(196,163,90,0.15)',
          }}>
            {phaseCountdown}
          </div>
        )}

        {/* -- 相位提示 -- */}
        {isActive && (
          <div className="mt-1 text-center">
            <div className="text-xl font-bold tracking-wider" style={{ color: jueColor, textShadow: `0 0 10px ${jueColor}30` }}>
              {phaseLabel[phase]}
            </div>
            {mode === 'liuzijue' && phase === 'exhale' && (
              <div className="text-sm mt-0.5" style={{ color: '#5C3015' }}>
                念「{currentJue.chant}」· {currentJue.element}行·{currentJue.organ}
              </div>
            )}
          </div>
        )}

        {/* -- 非活跃时：呼吸节律 -- */}
        {!isActive && (
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 text-sm font-mono" style={{ color: '#6B5B45' }}>
              <span>{currentMode.inhale}s吸</span>
              {currentMode.hold1 > 0 && <span>·{currentMode.hold1}s屏</span>}
              <span>·{currentMode.exhale}s呼</span>
              {currentMode.hold2 > 0 && <span>·{currentMode.hold2}s屏</span>}
            </div>
          </div>
        )}

        {/* -- 计时/循环 -- */}
        {isActive && (
          <div className="mt-1 flex items-center gap-3 text-xs" style={{ color: '#6B5B45' }}>
            <span>{formatElapsed(elapsed)}</span>
            <span>·</span>
            <span>{cycleCount}/{totalCycles}轮</span>
          </div>
        )}

        {/* -- 播放控制 + 循环次数 -- */}
        <div className="mt-5 flex items-center gap-3">
          {/* 播放/暂停 */}
          {!isActive ? (
            <button onClick={startBreathing}
              className="w-14 h-14 rounded-full flex items-center justify-center transition active:scale-90"
              style={{ background: `linear-gradient(145deg, ${currentMode.color}, ${currentMode.color}aa)`, boxShadow: `0 0 20px ${currentMode.color}30` }}>
              <Play size={22} className="text-white ml-0.5" />
            </button>
          ) : (
            <button onClick={stopBreathing}
              className="w-14 h-14 rounded-full flex items-center justify-center transition active:scale-90"
              style={{ background: 'rgba(200,50,50,0.10)', border: '1px solid rgba(200,50,50,0.20)' }}>
              <Pause size={22} style={{ color: '#B91C1C' }} />
            </button>
          )}
          {/* 重置 */}
          <button onClick={() => { stopBreathing(); setCycleCount(0); setElapsed(0); }}
            className="w-9 h-9 rounded-full flex items-center justify-center transition"
            style={{ background: currentMode.color + '10' }}>
            <RotateCcw size={14} style={{ color: currentMode.color }} />
          </button>
          {/* 声音 */}
          <button onClick={() => setAudioEnabled(!audioEnabled)}
            className="w-9 h-9 rounded-full flex items-center justify-center transition"
            style={{ background: audioEnabled ? currentMode.color + '18' : currentMode.color + '08' }}>
            {audioEnabled ? <Volume2 size={14} style={{ color: currentMode.color }} /> : <VolumeX size={14} style={{ color: currentMode.color + '80' }} />}
          </button>
          {/* 分隔 */}
          <div className="w-px h-6" style={{ background: currentMode.color + '20' }} />
          {/* 循环次数 */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] mr-0.5" style={{ color: '#8B7355' }}>轮</span>
            {[3, 6, 9, 12].map(n => (
              <button key={n} onClick={() => setTotalCycles(n)}
                className="w-7 h-7 rounded-md flex items-center justify-center text-[11px] font-bold transition"
                style={{
                  background: totalCycles === n ? currentMode.color + '20' : 'rgba(92,48,21,0.05)',
                  border: `1px solid ${totalCycles === n ? currentMode.color + '50' : 'rgba(92,48,21,0.08)'}`,
                  color: totalCycles === n ? currentMode.color : '#8B7355',
                }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* -- 呼吸模式选择 — 极简药丸条 -- */}
        {!isActive && (
          <div className="mt-5 flex gap-2 justify-center">
            {BREATH_MODES.map(bm => (
              <button key={bm.id} onClick={() => setMode(bm.id)}
                className="px-3 py-1.5 rounded-full text-xs font-bold transition"
                style={{
                  background: mode === bm.id ? bm.color + '18' : 'rgba(92,48,21,0.04)',
                  border: `1px solid ${mode === bm.id ? bm.color + '40' : 'rgba(92,48,21,0.06)'}`,
                  color: mode === bm.id ? bm.color : '#8B7355',
                }}>
                {bm.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ===== 前奏导引浮层 — 盖住中心区，沉浸聆听男声引导 ===== */}
      {preludePlaying && (
        <div className="absolute left-0 right-0 z-20 flex flex-col items-center justify-center px-6 text-center"
          style={{
            top: 64, bottom: 56,
            background: `radial-gradient(ellipse at center, rgba(253,248,240,0.96) 0%, rgba(253,248,240,0.86) 60%, rgba(253,248,240,0.72) 100%)`,

}}>
          {/* 字诀大字 */}
          <div className="font-black font-serif mb-4" style={{
            fontSize: 104,
            color: currentJue.color,
            textShadow: `0 0 48px ${currentJue.color}50, 0 0 96px ${currentJue.color}25`,
            lineHeight: 1,
          }}>
            {currentJue.char}
          </div>

          {/* 五行 / 脏腑信息 */}
          <div className="text-base font-bold mb-1 tracking-wide" style={{ color: '#5C1A00' }}>
            {currentJue.element}行 · {currentJue.wuyin}音 · 入{currentJue.organ}
          </div>
          <div className="text-sm mb-1" style={{ color: '#8B7355' }}>
            {currentJue.desc}
          </div>

          {/* 引导状态指示 */}
          <div className="flex items-center justify-center gap-2 mb-1" style={{ color: currentJue.color }}>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: currentJue.color }} />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5" style={{ background: currentJue.color }} />
            </span>
            <span className="text-sm font-bold tracking-widest">正在深度引导</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-10 text-xs" style={{ color: '#8B7355' }}>
            <Headphones size={12} />
            <span>请闭目聆听，跟随引导调整呼吸</span>
          </div>

          {/* 跳过按钮 */}
          <button onClick={skipPrelude}
            className="px-6 py-2.5 rounded-full text-xs font-bold transition active:scale-95"
            style={{
              background: currentJue.color + '15',
              border: `1px solid ${currentJue.color}40`,
              color: currentJue.color,
              boxShadow: `0 0 16px ${currentJue.color}10`,
            }}>
            跳过引导，直接开始
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
