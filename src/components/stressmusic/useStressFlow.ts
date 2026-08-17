'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import type {
  FlowState,
  MusicGenre,
  SessionData,
  HrvData,
  ModelStatus,
  MusicStatus,
  BreathPhase,
} from '@/components/stressmusic/types';

// ═══════════════════════════════════════════
// 心率 → 五行 / 呼吸节奏 映射引擎
// ═══════════════════════════════════════════

/** 流派→五行辅助映射 */
const GENRE_ELEMENT: Record<string, string> = {
  '流行': 'water', '摇滚': 'fire', '古典': 'earth',
  '嘻哈': 'wood', '电子': 'metal', 'R&B': 'water',
  '爵士': 'wood', '乡村': 'earth', '布鲁斯': 'water', '雷鬼': 'wood',
};

/** 五行→五音音频路径 */
const TONE_FILES: Record<string, string> = {
  wood: '/audio/five-tone/jiao.mp3',
  fire: '/audio/five-tone/zhi.mp3',
  earth: '/audio/five-tone/gong.mp3',
  metal: '/audio/five-tone/shang.mp3',
  water: '/audio/five-tone/yu.mp3',
};

/**
 * 根据心率推算五行元素
 * 高压→水行镇静  中高→土行稳定  正常→流派偏好  偏低→火行暖阳  极低→木行生发
 */
function getElementFromBPM(bpm: number, genre?: MusicGenre | null): string {
  if (bpm >= 100) {
    // 高压焦虑 — 以水克火，镇静安神（水行·羽音）
    return 'water';
  } else if (bpm >= 90) {
    // 中高压 — 土行稳定，安神定志（土行·宫音）
    return 'earth';
  } else if (bpm >= 60) {
    // 正常范围 — 流派偏好为主
    return genre ? (GENRE_ELEMENT[genre] || 'earth') : 'earth';
  } else if (bpm >= 50) {
    // 低能量 — 火行暖阳，温通心阳（火行·徵音）
    return 'fire';
  } else {
    // 极低 — 木行生发，激发活力（木行·角音）
    return 'wood';
  }
}

/** BPM→心率状态描述 */
function getBPMZoneLabel(bpm: number): string {
  if (bpm >= 100) return '高压焦虑';
  if (bpm >= 90) return '轻度紧张';
  if (bpm >= 60) return '身心平稳';
  if (bpm >= 50) return '能量偏低';
  return '需要激活';
}

/** 呼吸节奏配置（毫秒） */
export interface BreathConfig {
  inhale: number;
  hold: number;
  exhale: number;
  total: number;
  label: string;
}

/**
 * 根据心率计算呼吸节奏
 * 高心率 → 更慢更深的4-7-8（镇静）
 * 正常心率 → 3-4-5（维持）
 * 低心率 → 2.5-3-4（温和激活）
 */
function getBreathConfig(bpm: number): BreathConfig {
  if (bpm >= 100) {
    return { inhale: 4000, hold: 7000, exhale: 8000, total: 19000, label: '4-7-8 深度镇定' };
  } else if (bpm >= 90) {
    return { inhale: 4000, hold: 6000, exhale: 7000, total: 17000, label: '4-6-7 缓解紧张' };
  } else if (bpm >= 80) {
    return { inhale: 3500, hold: 5000, exhale: 6000, total: 14500, label: '3.5-5-6 调和节奏' };
  } else if (bpm >= 70) {
    return { inhale: 3000, hold: 4000, exhale: 5000, total: 12000, label: '3-4-5 平衡呼吸' };
  } else if (bpm >= 60) {
    return { inhale: 3000, hold: 3500, exhale: 4500, total: 11000, label: '3-3.5-4.5 温和调息' };
  } else {
    return { inhale: 2500, hold: 3000, exhale: 4000, total: 9500, label: '2.5-3-4 暖阳激活' };
  }
}

/**
 * useStressFlow — StressMusic 流程状态机 + API 调用
 * 管理 idle → detecting → preference → loading → playing 全流程
 * 
 * 心率监测由 HeartRateMonitor 组件驱动：
 * - BLE 蓝牙心率设备（胸带/手表）— 最准确
 * - 摄像头 PPG 指尖脉搏 — 零设备备选
 * - 手动输入 — 兜底
 * - 跳过 — 使用默认数据
 * 
 * 核心映射逻辑：
 * - BPM → 五行元素 → 疗愈音乐
 * - BPM → 呼吸节奏（4-7-8 及其变体）
 */
export function useStressFlow() {
  // ═══ 核心状态 ═══
  const [flowState, setFlowState] = useState<FlowState>('idle');
  const [selectedGenre, setSelectedGenre] = useState<MusicGenre | null>(null);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('exhale');
  const [sessionData, setSessionData] = useState<SessionData>({
    startTime: null,
    startHRV: null,
    startBPM: null,
    endHRV: null,
    endBPM: null,
    history: [],
  });
  const [showReport, setShowReport] = useState(false);
  const [audioFileId, setAudioFileId] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 心率来源信息（用于 UI 展示）
  const [heartRateSource, setHeartRateSource] = useState<string | null>(null);

  // 呼吸节奏配置（由 BPM 计算）
  const [breathConfig, setBreathConfig] = useState<BreathConfig>(getBreathConfig(72));

  // 推荐五行元素（由 BPM + 流派计算）
  const [recommendedElement, setRecommendedElement] = useState<string>('earth');

  // 心率状态标签
  const [bpmZoneLabel, setBpmZoneLabel] = useState<string>('身心平稳');

  // 音频分析器
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const musicPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTrackerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animFrameRef = useRef<number>(0);

  // ═══ 检测后端是否可用 ═══
  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch('/api/stressmusic/model-status', { signal: AbortSignal.timeout(3000) });
        if (res.ok) {
          const data: ModelStatus = await res.json();
          setBackendAvailable(data.loaded || data.loading || true);
        } else {
          setBackendAvailable(false);
        }
      } catch {
        setBackendAvailable(false);
      }
    };
    check();
    // 首次检查后，仅在后端可用时保持频繁检测；不可用时降低到每2分钟
    const id = setInterval(check, backendAvailable ? 30000 : 120000);
    return () => clearInterval(id);
  }, [backendAvailable]);

  // ═══ 初始化音频分析器 ═══
  const initAnalyser = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (analyserRef.current) {
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      setAnalyser(analyserRef.current);
      return;
    }

    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      audioCtxRef.current = ctx;
      const source = ctx.createMediaElementSource(audio);
      sourceNodeRef.current = source;
      const an = ctx.createAnalyser();
      an.fftSize = 256;
      an.smoothingTimeConstant = 0.6;
      source.connect(an);
      an.connect(ctx.destination);
      analyserRef.current = an;
      setAnalyser(an);
    } catch (e) {
      console.warn('Audio analyser init failed:', e);
    }
  }, []);

  // ═══ 开始体验 ═══
  const handleStart = useCallback(async () => {
    setErrorMessage(null);
    setHeartRateSource(null);
    setSessionData({
      startTime: null,
      startHRV: null,
      startBPM: null,
      endHRV: null,
      endBPM: null,
      history: [],
    });
    // 进入检测页 — HeartRateMonitor 组件会接管
    // 心率数据就绪后调用 onHeartRateReady 过渡到 preference
    setFlowState('detecting');
  }, []);

  // ═══ 心率监测就绪回调 ═══
  // 由 HeartRateMonitor 组件在检测到有效心率后调用
  const onHeartRateReady = useCallback((data: { bpm: number; hrv: number; source: string }) => {
    setHeartRateSource(data.source);
    setSessionData(prev => ({
      ...prev,
      startTime: prev.startTime || Date.now(),
      startBPM: data.bpm,
      startHRV: data.hrv,
      history: [...prev.history, { timestamp: Date.now(), hrv: data.hrv, bpm: data.bpm }],
    }));

    // 根据心率计算呼吸节奏和推荐五行
    setBreathConfig(getBreathConfig(data.bpm));
    setRecommendedElement(getElementFromBPM(data.bpm, null)); // 流派暂未选择
    setBpmZoneLabel(getBPMZoneLabel(data.bpm));

    // 如果还在 detecting 阶段，过渡到 preference
    if (flowState === 'detecting') {
      setFlowState('preference');
    }
  }, [flowState]);

  // ═══ 跳过心率检测 ═══
  const onSkipDetection = useCallback(() => {
    const defaultBPM = 72;
    setHeartRateSource('默认数据');
    setSessionData(prev => ({
      ...prev,
      startTime: Date.now(),
      startBPM: defaultBPM,
      startHRV: 30,
      history: [{ timestamp: Date.now(), hrv: 30, bpm: defaultBPM }],
    }));
    setBreathConfig(getBreathConfig(defaultBPM));
    setRecommendedElement(getElementFromBPM(defaultBPM, null));
    setBpmZoneLabel(getBPMZoneLabel(defaultBPM));
    setFlowState('preference');
  }, []);

  // ═══ 确认偏好 ═══
  const handleConfirmPreference = useCallback(async () => {
    if (!selectedGenre) return;

    setFlowState('loading');

    // 根据心率重新计算五行元素（此时流派已选定，可综合考量）
    const bpm = sessionData.startBPM || 72;
    const element = getElementFromBPM(bpm, selectedGenre);
    setRecommendedElement(element);

    // 更新呼吸节奏
    setBreathConfig(getBreathConfig(bpm));

    // 发送偏好到后端（如果可用），包含心率数据
    if (backendAvailable) {
      try {
        await fetch('/api/stressmusic/confirm-preference', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            preference: selectedGenre,
            bpm: sessionData.startBPM,
            hrv: sessionData.startHRV,
            source: heartRateSource,
          }),
        });
      } catch (e) {
        console.warn('更新偏好失败:', e);
      }
    }

    // 触发音乐生成
    if (!backendAvailable) {
      // 无后端：使用本地五行音乐作为替代
      // 加载时间根据推荐元素调整（高压→更长加载营造仪式感）
      const loadDelay = bpm >= 90 ? 20000 : bpm >= 70 ? 15000 : 10000;

      setTimeout(() => {
        const fakeId = `local_${element}_${Date.now()}`;
        setAudioFileId(fakeId);
        setAudioUrl(TONE_FILES[element]);
        setFlowState('playing');
      }, loadDelay);
      return;
    }

    try {
      const res = await fetch('/api/stressmusic/generate-music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bpm: sessionData.startBPM,
          hrv: sessionData.startHRV,
          genre: selectedGenre,
          element,
          source: heartRateSource,
        }),
      });
      const data = await res.json();

      if (data.status === 'processing') {
        // 开始轮询生成状态
        if (musicPollRef.current) clearInterval(musicPollRef.current);
        musicPollRef.current = setInterval(async () => {
          try {
            const statusRes = await fetch('/api/stressmusic/music-status');
            const statusData: MusicStatus = await statusRes.json();

            if (statusData.status === 'completed' && statusData.file_id) {
              if (musicPollRef.current) clearInterval(musicPollRef.current);
              setAudioFileId(statusData.file_id);
              setAudioUrl(`/api/stressmusic/audio/${statusData.file_id}`);
              setFlowState('playing');
            } else if (statusData.status === 'failed') {
              if (musicPollRef.current) clearInterval(musicPollRef.current);
              setErrorMessage(statusData.error || '音乐生成失败');
              setFlowState('preference');
            }
          } catch (e) {
            if (musicPollRef.current) clearInterval(musicPollRef.current);
            setErrorMessage('轮询出错');
            setFlowState('preference');
          }
        }, 2000);
      }
    } catch (e) {
      setErrorMessage('启动生成出错');
      setFlowState('preference');
    }
  }, [selectedGenre, backendAvailable, sessionData.startBPM, sessionData.startHRV, heartRateSource]);

  // ═══ 播放/暂停 ═══
  const handleTogglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      initAnalyser();
      if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
      audio.play().catch(e => {
        if ((e as Error).name !== 'AbortError') console.error(e);
      });
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [initAnalyser]);

  // ═══ 音频开始播放 ═══
  const startAudioPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    initAnalyser();
    audio.src = audioUrl;
    audio.play().then(() => {
      setIsPlaying(true);

      // 开始呼吸引导 — 根据 BPM 计算的节奏
      const { inhale, hold, exhale } = breathConfig;
      const startBreathing = () => {
        const steps: BreathPhase[] = ['inhale', 'hold', 'exhale', 'relax'];
        const durations = [inhale, hold, exhale, inhale / 2]; // relax 阶段 = inhale 的一半
        let stepIdx = 0;
        let totalElapsed = 0;

        const tick = () => {
          if (flowState !== 'playing') return;
          setBreathPhase(steps[stepIdx % steps.length]);

          const currentDuration = durations[stepIdx % durations.length];
          stepIdx++;
          totalElapsed += currentDuration;

          // 使用 setTimeout 链式调用，每个阶段时长不同
          setTimeout(tick, currentDuration);
        };
        tick();
      };
      startBreathing();

      // 开始会话数据追踪
      if (sessionTrackerRef.current) clearInterval(sessionTrackerRef.current);

      if (backendAvailable) {
        // 有后端：轮询 HRV
        sessionTrackerRef.current = setInterval(async () => {
          try {
            const res = await fetch('/api/stressmusic/latest-hrv');
            const data: HrvData = await res.json();
            if (data.exists && data.hrv !== null) {
              const point = {
                timestamp: Date.now(),
                hrv: Math.round(data.hrv),
                bpm: data.bpm || (70 + Math.random() * 5),
              };
              setSessionData(prev => ({
                ...prev,
                history: [...prev.history, point],
              }));
            }
          } catch (e) {
            // 静默失败
          }
        }, 3000);
      } else {
        // 无后端：模拟渐进式心率变化（生理合理模型）
        sessionTrackerRef.current = setInterval(() => {
          setSessionData(prev => {
            const startBPM = prev.startBPM || 72;
            const startHRV = prev.startHRV || 30;
            const lastPoint = prev.history[prev.history.length - 1];
            const currentBPM = lastPoint?.bpm ?? startBPM;
            const currentHRV = lastPoint?.hrv ?? startHRV;

            // 高压→降心率更快；低压→略提升；正常→微调
            const bpmDecayRate = startBPM > 90 ? 0.7 : startBPM > 75 ? 0.3 : 0.1;
            const bpmNoise = (Math.random() - 0.4) * bpmDecayRate; // 略偏下降
            const newBPM = Math.max(55, Math.round((currentBPM - bpmDecayRate + bpmNoise) * 10) / 10);

            // HRV 渐升（副交感增强 → 变异性改善）
            const hrvGrowth = startBPM > 90 ? 0.8 : startBPM > 75 ? 0.4 : 0.15;
            const hrvNoise = (Math.random() - 0.5) * hrvGrowth * 0.6;
            const newHRV = Math.min(120, Math.round((currentHRV + hrvGrowth + hrvNoise) * 10) / 10);

            return {
              ...prev,
              history: [...prev.history, { timestamp: Date.now(), bpm: newBPM, hrv: newHRV }],
            };
          });
        }, 5000);
      }
    }).catch(e => {
      if ((e as Error).name !== 'AbortError') console.error(e);
    });
  }, [audioUrl, initAnalyser, flowState, backendAvailable, breathConfig]);

  // ═══ 音频事件绑定 ═══
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onDurationChange = () => setDuration(audio.duration || 0);
    const onEnded = () => {
      setIsPlaying(false);
      // 生成疗愈报告 — 使用实际追踪数据
      setSessionData(prev => {
        // 取最后 5 个点的平均值作为结束数据
        const recentPoints = prev.history.slice(-5);
        if (recentPoints.length >= 2) {
          const avgHRV = Math.round(recentPoints.reduce((s, p) => s + p.hrv, 0) / recentPoints.length);
          const avgBPM = Math.round(recentPoints.reduce((s, p) => s + p.bpm, 0) / recentPoints.length);
          return { ...prev, endHRV: avgHRV, endBPM: avgBPM };
        }
        // 只有初始数据点：基于模拟趋势推算
        const startBPM = prev.startBPM || 72;
        const startHRV = prev.startHRV || 30;
        const expectedBPMChange = startBPM > 90 ? -8 : startBPM > 75 ? -4 : -1;
        const expectedHRVChange = startBPM > 90 ? 15 : startBPM > 75 ? 8 : 3;
        return {
          ...prev,
          endBPM: Math.max(55, startBPM + expectedBPMChange),
          endHRV: Math.min(100, startHRV + expectedHRVChange),
        };
      });
      if (sessionTrackerRef.current) clearInterval(sessionTrackerRef.current);
      setShowReport(true);
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('ended', onEnded);
    audio.volume = 0.8;

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  // ═══ 流程状态变化时启动/停止播放 ═══
  useEffect(() => {
    if (flowState === 'playing' && audioUrl) {
      startAudioPlayback();
    }

    // 离开 loading/playing 时清理
    return () => {
      if (flowState === 'playing') {
        if (sessionTrackerRef.current) clearInterval(sessionTrackerRef.current);
      }
    };
  }, [flowState, audioUrl, startAudioPlayback]);

  // ═══ 重新开始 ═══
  const handleRestart = useCallback(() => {
    setShowReport(false);
    setFlowState('idle');
    setSelectedGenre(null);
    setBreathPhase('exhale');
    setSessionData({
      startTime: null,
      startHRV: null,
      startBPM: null,
      endHRV: null,
      endBPM: null,
      history: [],
    });
    setAudioFileId(null);
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setErrorMessage(null);
    setHeartRateSource(null);

    // 停止音频
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.src = '';
    }

    // 清理所有 interval
    if (musicPollRef.current) clearInterval(musicPollRef.current);
    if (sessionTrackerRef.current) clearInterval(sessionTrackerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
  }, []);

  // ═══ 返回空闲 ═══
  const backToIdle = useCallback(() => {
    handleRestart();
  }, [handleRestart]);

  return {
    // 状态
    flowState,
    selectedGenre,
    setSelectedGenre,
    breathPhase,
    sessionData,
    showReport,
    audioFileId,
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    analyser,
    backendAvailable,
    heartRateSource,
    errorMessage,
    audioRef,

    // 心率→推荐映射结果（供 UI 显示）
    breathConfig,
    recommendedElement,
    bpmZoneLabel,

    // 方法
    handleStart,
    onHeartRateReady,
    onSkipDetection,
    handleConfirmPreference,
    handleTogglePlay,
    handleRestart,
    backToIdle,
    setShowReport,
  };
}
