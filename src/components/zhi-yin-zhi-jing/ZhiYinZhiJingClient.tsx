'use client';

import { useState, useRef, useCallback, useEffect, useMemo, type CSSProperties } from 'react';
import {
  FLOW_MODES, FLOW_MODE_MAP,
  getNarrationTimeline, findActiveSegment,
  recommendModeByBPM, getAllRecommendedModes,
  type FlowMode, type FlowModeId, type NarrationSegmentWindow,
} from '@/lib/zhi-yin-zhi-jing-data';
import { useFlowAudio } from '@/hooks/useFlowAudio';
import { useZhiYinStore, getTotalDuration, getAverageMoodImprovement, formatDuration } from '@/lib/zhi-yin-session-store';
import { getClientUserId } from '@/lib/auth';
import { cosUrl } from '@/lib/cos-url';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XIUWEI_GAINS, type WuxingElement } from '@/lib/cultivation-engine';
import ParticleCanvas from './ParticleCanvas';
import HRDetector, { type HeartRateData } from './HRDetector';
import dynamic from 'next/dynamic';
import styles from './zhi-yin-zhi-jing.module.css';
import { SlidersHorizontal, Play, Pause, Volume2, Repeat, Subtitles, Moon, X, Heart, Square, BarChart3 } from 'lucide-react';

/* HeartRateMonitor 含 BLE/PPG 浏览器 API，仅 CSR，动态加载避免 SSR 报错 */
const HeartRateMonitor = dynamic(() => import('@/components/stressmusic/HeartRateMonitor'), {
  ssr: false,
  loading: () => <p style={{ color: '#888', textAlign: 'center', padding: 24 }}>加载心率监测…</p>,
});

/* 闲置时的禅意引导语（无模式选中时循环） */
const IDLE_QUOTES = [
  '请深呼吸，与我同在。',
  '感受此刻。',
  '放下所有的期待。',
  '允许自己什么都不做。',
  '你值得这份宁静。',
  '此刻已经足够完整。',
];

/* 默认中性主题（无模式选中时，暖金） */
const DEFAULT_THEME = {
  orbGlow: '#ffb347',
  orbInner: '#ffd966',
  accent: '#ffd54f',
  particleA: 'rgba(255, 244, 204, 0.9)',
  particleB: 'rgba(255, 179, 71, 0.8)',
};

/* 睡眠定时器可选分钟数 */
const SLEEP_OPTIONS = [15, 30, 45, 60];

/* 心情评分量表（1-5） */
const MOOD_FACES = [
  { value: 1, emoji: '😣', label: '很差' },
  { value: 2, emoji: '😕', label: '差' },
  { value: 3, emoji: '😐', label: '一般' },
  { value: 4, emoji: '🙂', label: '好' },
  { value: 5, emoji: '😄', label: '极佳' },
];

/* 最小有效会话时长（秒），低于此值视为误触，不记录 */
const MIN_SESSION_SEC = 20;

/* 格式化播放时间 m:ss */
function formatTime(sec: number): string {
  if (!isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* 格式化倒计时 mm:ss 或 h:mm:ss */
function formatCountdown(sec: number): string {
  if (sec < 0) sec = 0;
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function ZhiYinZhiJingClient() {
  /* ---- 基础状态 ---- */
  const [activeModeId, setActiveModeId] = useState<FlowModeId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false); // 解说+环境是否进行中
  const [volume, setVolume] = useState(35); // 0-100
  const [consoleOpen, setConsoleOpen] = useState(false);
  const [isGlowing, setIsGlowing] = useState(false);
  const [progress, setProgress] = useState(0); // 解说进度 0-1
  const [guidingText, setGuidingText] = useState(IDLE_QUOTES[0]);
  const [loaded, setLoaded] = useState(false);

  /* ---- 循环 / 字幕 / 拖拽 ---- */
  const [loopMode, setLoopMode] = useState(true);
  const [showSubtitle, setShowSubtitle] = useState(true);
  const [currentSegmentText, setCurrentSegmentText] = useState<string | null>(null);
  const [segmentKey, setSegmentKey] = useState(0); // 字幕切换动画 key
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  /* ---- 呼吸引导（与 CSS 11s 呼吸周期同步：5.5s 吸 + 5.5s 呼）---- */
  const [breathIn, setBreathIn] = useState(true);

  /* ---- 睡眠定时器 ---- */
  const [sleepMinutes, setSleepMinutes] = useState<number | null>(null);
  const [sleepRemaining, setSleepRemaining] = useState<number | null>(null); // 秒

  /* ---- 心率联动 ---- */
  const [hrData, setHrData] = useState<HeartRateData | null>(null);
  const [showHROverlay, setShowHROverlay] = useState(false);
  const [showHRMonitor, setShowHRMonitor] = useState(false);

  /* ---- 会话追踪 / 效果评估 ---- */
  const [journeyMoodBefore, setJourneyMoodBefore] = useState<number | null>(null);
  const [showMoodPicker, setShowMoodPicker] = useState<'before' | 'after' | null>(null);
  const [pendingModeId, setPendingModeId] = useState<FlowModeId | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [sessionStartTs, setSessionStartTs] = useState<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState(0);
  const [saving, setSaving] = useState(false);

  /* ---- 挂载标记（避免 zustand persist 的 SSR/hydration 不一致）---- */
  const [mounted, setMounted] = useState(false);

  /* ---- 引用 ---- */
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rippleLayerRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const quoteTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressTrackRef = useRef<HTMLDivElement | null>(null);
  // 用 ref 持有最新字幕文本，避免 audio 事件 effect 频繁重绑
  const currentSegmentTextRef = useRef<string | null>(null);

  const audio = useFlowAudio();
  const voiceEnhancedRef = useRef(false);

  /* ---- 会话 store ---- */
  const sessions = useZhiYinStore((s) => s.sessions);
  const lastCompleted = useZhiYinStore((s) => s.lastCompletedSession);
  const startSession = useZhiYinStore((s) => s.startSession);
  const completeSession = useZhiYinStore((s) => s.completeSession);
  const cancelSession = useZhiYinStore((s) => s.cancelSession);
  const clearLastCompleted = useZhiYinStore((s) => s.clearLastCompleted);

  const activeMode: FlowMode | null = activeModeId ? FLOW_MODE_MAP[activeModeId] : null;
  const theme = activeMode ? activeMode.theme : DEFAULT_THEME;

  const activeJourney = sessionStartTs !== null;

  // 心率推荐境列表
  const recommendedModeIds: FlowModeId[] = useMemo(
    () => (hrData ? getAllRecommendedModes(hrData.bpm) : []),
    [hrData]
  );
  const primaryRecommendation = useMemo(
    () => (hrData ? recommendModeByBPM(hrData.bpm) : null),
    [hrData]
  );

  // 统计数据（仅客户端计算，避免 hydration 不一致）
  const stats = useMemo(() => {
    if (!mounted) return { count: 0, totalDur: 0, avgImprove: 0 };
    return {
      count: sessions.length,
      totalDur: getTotalDuration(sessions),
      avgImprove: getAverageMoodImprovement(sessions),
    };
  }, [mounted, sessions]);

  // 当前模式字幕时间轴（基于文案字数 + pause 估算映射到 duration）
  const timeline: NarrationSegmentWindow[] = useMemo(
    () => (activeMode ? getNarrationTimeline(activeMode) : []),
    [activeMode]
  );

  // 字幕可见条件：开启 + 播放中 + 有文案 + 已选境
  const subtitleVisible = !!(showSubtitle && isPlaying && currentSegmentText && activeMode);

  /* 同步字幕文本到 ref */
  useEffect(() => {
    currentSegmentTextRef.current = currentSegmentText;
  }, [currentSegmentText]);

  /* ---- 挂载 ---- */
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ---- 进场 ---- */
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(t);
  }, []);

  /* ---- 闲置引导语轮换 ---- */
  useEffect(() => {
    if (activeModeId) {
      if (quoteTimer.current) clearInterval(quoteTimer.current);
      setGuidingText(activeMode!.tagline);
      return;
    }
    let i = 0;
    setGuidingText(IDLE_QUOTES[0]);
    quoteTimer.current = setInterval(() => {
      i = (i + 1) % IDLE_QUOTES.length;
      setGuidingText(IDLE_QUOTES[i]);
    }, 9000);
    return () => {
      if (quoteTimer.current) clearInterval(quoteTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModeId]);

  /* ---- 自定义光标 ---- */
  useEffect(() => {
    if ('ontouchstart' in window) return;
    const onMove = (e: MouseEvent) => {
      const cur = cursorRef.current;
      if (!cur) return;
      cur.style.left = e.clientX + 'px';
      cur.style.top = e.clientY + 'px';
      cur.classList.add(styles.moving);
      if (moveTimer.current) clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(() => cur.classList.remove(styles.moving), 100);
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  /* ---- 呼吸引导阶段切换：11s 周期 = 吸气 5.5s + 呼气 5.5s，与光球 zzjBreathe 同步 ---- */
  useEffect(() => {
    if (!isPlaying) {
      setBreathIn(true);
      return;
    }
    setBreathIn(true);
    const timer = setInterval(() => setBreathIn((p) => !p), 5500);
    return () => clearInterval(timer);
  }, [isPlaying]);

  /* ---- 会话计时器：仅在播放中累计有效聆听时长 ---- */
  useEffect(() => {
    if (sessionStartTs === null || !isPlaying) return;
    const t = setInterval(() => setElapsedSec((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [sessionStartTs, isPlaying]);

  /* ---- 睡眠定时器倒计时 ---- */
  useEffect(() => {
    if (sleepRemaining === null) return;
    if (sleepRemaining <= 0) {
      // 时间到，彻底停止一切；若在旅程中则触发结束流程
      setIsPlaying(false);
      audioRef.current?.pause();
      audio.stopAmbient();
      setSleepMinutes(null);
      setSleepRemaining(null);
      setCurrentSegmentText(null);
      if (activeJourney) {
        // 睡眠定时结束 = 自然结束旅程
        requestEndJourney(true);
      }
      return;
    }
    const t = setTimeout(() => {
      setSleepRemaining((r) => (r === null ? null : r - 1));
    }, 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sleepRemaining, audio, activeJourney]);

  /* ---- 暂停旅程 ---- */
  const pauseJourney = useCallback(() => {
    setIsPlaying(false);
    audioRef.current?.pause();
    audio.setAmbientVolume((volume / 100) * 0.25); // 环境音降低但不完全停
  }, [audio, volume]);

  /* ---- 恢复旅程 ---- */
  const resumeJourney = useCallback(() => {
    if (!activeModeId) return;
    audio.ensureContext();
    setIsPlaying(true);
    audioRef.current?.play().catch(() => setIsPlaying(false));
    audio.setAmbientVolume(volume / 100);
  }, [activeModeId, audio, volume]);

  /* ---- 实际启动某个境的播放（音频+环境音）---- */
  const beginPlayback = useCallback(
    (modeId: FlowModeId) => {
      audio.ensureContext();
      const mode = FLOW_MODE_MAP[modeId];
      setActiveModeId(modeId);
      setIsPlaying(true);
      setProgress(0);
      setCurrentTime(0);
      setCurrentSegmentText(null);
      currentSegmentTextRef.current = null;
      setIsDragging(false);

      // 环境音：先停旧的，再启新的
      audio.stopAmbient();
      audio.startAmbient(mode, volume / 100);

      // 解说音频 + 语音增强链
      const el = audioRef.current;
      if (el) {
        el.src = cosUrl(`/audio/zhi-yin-zhi-jing/${modeId}.mp3`);
        el.volume = volume / 100;
        // 首次播放时初始化语音增强链（均衡→压缩→混响）
        if (!voiceEnhancedRef.current) {
          audio.initVoiceEnhance(el);
          voiceEnhancedRef.current = true;
        }
        audio.setVoiceVolume(volume / 100);
        el.play().catch(() => setIsPlaying(false));
      }
      audio.playClick();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [volume, audio]
  );

  /* ---- 选择模式（分发：同模式切换播放 / 旅程中切换 / 全新旅程需先评心情）---- */
  const onModeClick = useCallback(
    (modeId: FlowModeId) => {
      audio.ensureContext();
      // 点击同模式 → 切换播放/暂停
      if (modeId === activeModeId) {
        if (isPlaying) pauseJourney();
        else resumeJourney();
        audio.playClick();
        return;
      }
      // 旅程进行中 → 直接切换境，不打断会话计时
      if (activeJourney) {
        beginPlayback(modeId);
        return;
      }
      // 全新旅程 → 先弹出"疗愈前心情"评分
      setPendingModeId(modeId);
      setShowMoodPicker('before');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeModeId, isPlaying, activeJourney, audio, pauseJourney, resumeJourney, beginPlayback]
  );

  /* ---- 疗愈前心情评分完成 → 正式开启旅程 ---- */
  const moodBeforePicked = useCallback(
    (mood: number) => {
      const modeId = pendingModeId;
      if (!modeId) return;
      setJourneyMoodBefore(mood);
      setElapsedSec(0);
      setSessionStartTs(Date.now());
      setShowMoodPicker(null);
      // 写入 store 的 activeSession（供后续 completeSession 使用）
      startSession({
        modeId,
        startedAt: Date.now(),
        moodBefore: mood,
        moodAfter: 0,
        bpmBefore: hrData?.bpm as any,
        hrvBefore: hrData?.hrv as any,
      });
      setPendingModeId(null);
      beginPlayback(modeId);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pendingModeId, hrData, startSession, beginPlayback]
  );

  /* ---- 请求结束旅程（按钮 / 睡眠定时 / 离开）---- */
  const requestEndJourney = useCallback(
    (fromSleep = false) => {
      if (!activeJourney) return;
      if (elapsedSec < MIN_SESSION_SEC && !fromSleep) {
        // 太短，视为误触，直接丢弃
        cancelSession();
        setSessionStartTs(null);
        setElapsedSec(0);
        setJourneyMoodBefore(null);
        setIsPlaying(false);
        audio.stopAmbient();
        audioRef.current?.pause();
        return;
      }
      // 暂停播放，弹出"疗愈后心情"评分
      setIsPlaying(false);
      audioRef.current?.pause();
      setShowMoodPicker('after');
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeJourney, elapsedSec, cancelSession, audio]
  );

  /* ---- 疗愈后心情评分完成 → 完成会话 + 保存 + 报告 ---- */
  const moodAfterPicked = useCallback(
    async (mood: number) => {
      setShowMoodPicker(null);
      setSaving(true);
      const completed = completeSession(elapsedSec, mood, undefined, undefined);
      if (completed) {
        // 写入情绪打卡（best-effort）
        try {
          await fetch('/api/zhi-yin-zhi-jing/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: getClientUserId(),
              modeId: completed.modeId,
              durationSec: completed.durationSec,
              moodBefore: completed.moodBefore,
              moodAfter: completed.moodAfter,
              bpmBefore: completed.bpmBefore,
            }),
          });
        } catch {
          /* 离线时静默失败，本地仍有记录 */
        }

        // ★ 记录修为获得
        try {
          const modeElMap: Record<string, WuxingElement> = {
            deepsea: 'water', rain: 'water', temple: 'fire', universe: 'fire',
            mountain: 'wood', campfire: 'fire', snow: 'metal', moon: 'metal', mist: 'earth',
          };
          const el: WuxingElement = modeElMap[completed.modeId] || 'water';
          const gain = XIUWEI_GAINS.zhijing_complete;
          useCultivationStore.getState().addXiuWei(el, gain);
          useCultivationStore.getState().recordPractice('zhiYinZhiJing', completed.durationSec, el, gain);
          useCultivationStore.getState().completeTodayStep('zhijing');
          fetch('/api/cultivation/practice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: getClientUserId(),
              category: 'zhiYinZhiJing',
              element: el,
              durationSec: completed.durationSec,
            }),
          }).catch(() => {});
        } catch {}
      }
      setSaving(false);
      setShowReport(true);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [elapsedSec, completeSession]
  );

  /* ---- 关闭报告，回到闲置 ---- */
  const dismissReport = useCallback(() => {
    setShowReport(false);
    clearLastCompleted();
    setSessionStartTs(null);
    setElapsedSec(0);
    setJourneyMoodBefore(null);
    setProgress(0);
    setCurrentTime(0);
    setCurrentSegmentText(null);
    currentSegmentTextRef.current = null;
  }, [clearLastCompleted]);

  /* ---- 心率检测完成 ---- */
  const handleHRReady = useCallback((data: HeartRateData) => {
    setHrData(data);
    setShowHROverlay(false);
    setShowHRMonitor(false);
    audio.playClick();
  }, [audio]);

  const handleHRSkip = useCallback(() => {
    setHrData({ bpm: 72, hrv: 30, source: '默认' });
    setShowHROverlay(false);
    audio.playClick();
  }, [audio]);

  /* ---- 主播放按钮 ---- */
  const togglePlay = useCallback(() => {
    audio.ensureContext();
    if (!activeModeId) {
      // 无模式时，默认进入推荐境或深海
      const defaultMode = primaryRecommendation?.modeId ?? 'deepsea';
      onModeClick(defaultMode);
      return;
    }
    if (isPlaying) pauseJourney();
    else resumeJourney();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeModeId, isPlaying, audio, primaryRecommendation, onModeClick, pauseJourney, resumeJourney]);

  /* ---- 音量变化 ---- */
  const onVolumeChange = useCallback(
    (v: number) => {
      setVolume(v);
      if (audioRef.current) audioRef.current.volume = v / 100;
      audio.setAmbientVolume(v / 100);
      audio.setVoiceVolume(v / 100);
    },
    [audio]
  );

  /* ---- 进度条 seek ---- */
  const computeRatio = useCallback((clientX: number) => {
    const track = progressTrackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const r = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(1, r));
  }, []);

  const seekToRatio = useCallback(
    (ratio: number) => {
      const el = audioRef.current;
      if (!el || !isFinite(el.duration) || el.duration === 0) return;
      const clamped = Math.max(0, Math.min(1, ratio));
      el.currentTime = clamped * el.duration;
      setProgress(clamped);
      setCurrentTime(clamped * el.duration);
      const seg = findActiveSegment(timeline, clamped);
      if (seg?.text !== currentSegmentTextRef.current) {
        currentSegmentTextRef.current = seg?.text ?? null;
        setCurrentSegmentText(seg?.text ?? null);
        setSegmentKey((k) => k + 1);
      }
    },
    [timeline]
  );

  const onProgressPointerDown = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
      setIsDragging(true);
      const r = computeRatio(e.clientX);
      setProgress(r);
      setCurrentTime(r * (audioRef.current?.duration ?? 0));
    },
    [computeRatio]
  );

  const onProgressPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.stopPropagation();
      const r = computeRatio(e.clientX);
      setProgress(r);
      setCurrentTime(r * (audioRef.current?.duration ?? 0));
    },
    [isDragging, computeRatio]
  );

  const onProgressPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      e.stopPropagation();
      const r = computeRatio(e.clientX);
      setIsDragging(false);
      seekToRatio(r);
    },
    [isDragging, computeRatio, seekToRatio]
  );

  /* ---- 睡眠定时器设置 ---- */
  const setSleepTimer = useCallback((minutes: number | null) => {
    setSleepMinutes(minutes);
    setSleepRemaining(minutes === null ? null : minutes * 60);
  }, []);

  /* ---- 解说音频事件 ---- */
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onTime = () => {
      if (!isFinite(el.duration) || el.duration === 0) return;
      if (isDragging) return; // 拖拽中不更新进度，避免抖动
      const r = el.currentTime / el.duration;
      setProgress(r);
      setCurrentTime(el.currentTime);
      setDuration(el.duration);
      const seg = findActiveSegment(timeline, r);
      if (seg?.text !== currentSegmentTextRef.current) {
        currentSegmentTextRef.current = seg?.text ?? null;
        setCurrentSegmentText(seg?.text ?? null);
        setSegmentKey((k) => k + 1);
      }
    };
    const onLoaded = () => {
      if (isFinite(el.duration) && el.duration > 0) setDuration(el.duration);
    };
    const onEnded = () => {
      if (loopMode) {
        // 循环模式：从头重播，环境音保留
        el.currentTime = 0;
        setCurrentTime(0);
        setProgress(0);
        currentSegmentTextRef.current = null;
        setCurrentSegmentText(null);
        el.play().catch(() => setIsPlaying(false));
      } else {
        // 单次模式：停一切；若在旅程中，自动结束并评后心情
        setIsPlaying(false);
        setProgress(1);
        audio.stopAmbient();
        setCurrentSegmentText(null);
        currentSegmentTextRef.current = null;
        if (activeJourney && elapsedSec >= MIN_SESSION_SEC) {
          requestEndJourney(true);
        }
      }
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('loadedmetadata', onLoaded);
    el.addEventListener('durationchange', onLoaded);
    el.addEventListener('ended', onEnded);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('loadedmetadata', onLoaded);
      el.removeEventListener('durationchange', onLoaded);
      el.removeEventListener('ended', onEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audio, loopMode, isDragging, timeline, activeJourney, elapsedSec]);

  /* ---- 水波纹 ---- */
  const createRipple = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'button, a, input, .orbInner, .consolePanel, .consoleToggle, .progressTrack, .sleepOption, .toggleBtn, .progressThumb'
        )
      )
        return;
      const layer = rippleLayerRef.current;
      if (!layer) return;
      const ripple = document.createElement('div');
      ripple.className = styles.ripple;
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      layer.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1500);
    },
    []
  );

  /* ---- 光球点击 ---- */
  const handleOrbClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      audio.ensureContext();
      audio.playBell();
      setIsGlowing(true);
      setTimeout(() => setIsGlowing(false), 1500);
      // 闲置时切换引导语
      if (!activeModeId) {
        const next = IDLE_QUOTES[Math.floor(Math.random() * IDLE_QUOTES.length)];
        setGuidingText(next);
      }
    },
    [audio, activeModeId]
  );

  /* ---- 键盘 ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showReport || showMoodPicker || showHROverlay || showHRMonitor) {
          // 优先关闭弹层
          setShowReport(false);
          setShowMoodPicker(null);
          setShowHROverlay(false);
          setShowHRMonitor(false);
          return;
        }
        setConsoleOpen(false);
        if (isPlaying) pauseJourney();
      }
      if (e.key === ' ' && !e.repeat) {
        e.preventDefault();
        handleOrbClick({ stopPropagation: () => {} } as React.MouseEvent);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, handleOrbClick, pauseJourney, showReport, showMoodPicker, showHROverlay, showHRMonitor]);

  /* ---- 主题 CSS 变量 ---- */
  const themeVars: CSSProperties = {
    ['--zzj-glow' as string]: theme.orbGlow,
    ['--zzj-inner' as string]: theme.orbInner,
    ['--zzj-accent' as string]: theme.accent,
    ['--zzj-particle-a' as string]: theme.particleA,
    ['--zzj-particle-b' as string]: theme.particleB,
  };

  const playStatus = !activeModeId
    ? '未选择'
    : isPlaying
      ? sleepRemaining !== null
        ? `解说中 · ${formatCountdown(sleepRemaining)} 后停`
        : activeJourney
          ? `旅程中 · ${formatTime(elapsedSec)}`
          : loopMode
            ? '解说中 · 循环'
            : '解说中'
      : progress >= 1
        ? '已完成'
        : activeJourney
          ? `已暂停 · ${formatTime(elapsedSec)}`
          : '已暂停';

  /* ---- 心情评分弹窗标题 ---- */
  const moodPickerTitle = showMoodPicker === 'before' ? '此刻你的心情如何？' : '疗愈之后，现在感觉如何？';
  const moodPickerHint = showMoodPicker === 'before'
    ? '选择最接近的状态，开始你的疗愈旅程'
    : '再次选择，看看这份宁静带来了什么变化';

  return (
    <div
      className={styles.scene}
      style={themeVars}
      onClick={createRipple}
    >
      {/* 背景渐变 */}
      <div className={styles.bgGradient}>
        <div className={`${styles.gradientLayer} ${styles.gradientLayer1}`} />
        <div className={`${styles.gradientLayer} ${styles.gradientLayer2}`} />
        <div className={`${styles.gradientLayer} ${styles.gradientLayer3}`} />
      </div>

      {/* 粒子 */}
      <ParticleCanvas colorA={theme.particleA} colorB={theme.particleB} />

      {/* 水波纹层 */}
      <div ref={rippleLayerRef} className={styles.rippleLayer} />

      {/* 自定义光标 */}
      <div ref={cursorRef} className={styles.cursorGlow} />

      {/* 主内容区：呼吸光球 */}
      <main className={styles.mainArea}>
        <div className={styles.orbContainer}>
          <div
            className={`${styles.breathingOrb} ${isGlowing ? styles.glowing : ''}`}
            onClick={handleOrbClick}
            role="button"
            aria-label="点击聆听颂钵"
          >
            <div className={styles.orbInner}>
              <div className={styles.orbLight} />
            </div>
            <div className={styles.orbRipple} />
            <div className={styles.orbRipple} />
            <div className={styles.orbRipple} />
          </div>

          <div className={styles.guidingText}>
            <p key={guidingText} className={styles.fadeText}>{guidingText}</p>
            {activeMode && (
              <p className={styles.modeSubtitle}>{activeMode.subtitle}</p>
            )}
            {/* 呼吸引导文字（仅播放中显示，跟随光球 11s 呼吸周期） */}
            <p
              className={`${styles.breathHint} ${isPlaying && activeMode ? styles.visible : ''}`}
              aria-live="polite"
            >
              {isPlaying ? (breathIn ? '吸气 · 跟随光球舒展' : '呼气 · 跟随光球收敛') : ''}
            </p>
            {/* 心率推荐提示（闲置且有推荐时） */}
            {hrData && primaryRecommendation && !activeJourney && (
              <p className={styles.hrRecommendHint}>
                <Heart size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                {Math.round(hrData.bpm)} BPM · {primaryRecommendation.zoneLabel} · 推荐
                <span style={{ color: 'var(--zzj-accent)', margin: '0 4px' }}>
                  {FLOW_MODE_MAP[primaryRecommendation.modeId].name}
                </span>
                境
              </p>
            )}
          </div>
        </div>
      </main>

      {/* 字幕（沉浸场景下方，跟随解说进度） */}
      <div className={`${styles.subtitle} ${subtitleVisible ? styles.visible : ''}`}>
        {currentSegmentText && (
          <p key={segmentKey} className={`${styles.subtitleText} ${styles.swap}`}>
            {currentSegmentText}
          </p>
        )}
      </div>

      {/* 底部控制台 */}
      <div className={styles.console}>
        {consoleOpen && (
          <div className={`${styles.consolePanel} ${styles.open}`}>
            <p className={styles.panelTitle}>九境</p>

            {/* 累计统计（客户端挂载后显示） */}
            {mounted && stats.count > 0 && (
              <div className={styles.statsBar}>
                <div className={styles.statItem}>
                  <BarChart3 size={11} />
                  <span className={styles.statVal}>{stats.count}</span>
                  <span className={styles.statLabel}>次</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>{formatDuration(stats.totalDur)}</span>
                  <span className={styles.statLabel}>累计</span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statVal}>+{(stats.avgImprove * 20).toFixed(0)}%</span>
                  <span className={styles.statLabel}>均改善</span>
                </div>
              </div>
            )}

            <div className={styles.modeGrid}>
              {FLOW_MODES.map((m) => {
                const recommended = recommendedModeIds.includes(m.id);
                const isPrimary = primaryRecommendation?.modeId === m.id;
                return (
                  <button
                    key={m.id}
                    className={`${styles.modeBtn} ${activeModeId === m.id ? styles.active : ''}`}
                    onClick={() => onModeClick(m.id)}
                    style={{ ['--mode-btn' as string]: m.theme.orbGlow }}
                  >
                    {recommended && (
                      <span className={`${styles.recommendBadge} ${isPrimary ? styles.primary : ''}`}>荐</span>
                    )}
                    <span className={styles.modeIcon}>{m.icon}</span>
                    <span className={styles.modeName}>{m.name}</span>
                  </button>
                );
              })}
            </div>

            <div className={styles.playback}>
              <button
                className={styles.playBtn}
                onClick={togglePlay}
                aria-label={isPlaying ? '暂停' : '播放'}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
              </button>
              <div className={styles.playMeta}>
                <p className={styles.playLabel}>
                  {activeMode ? `${activeMode.icon} ${activeMode.name} · 解说` : '点击开始'}
                </p>
                <p className={styles.playStatus}>{playStatus}</p>
              </div>
            </div>

            {/* 可拖拽进度条 */}
            <div
              ref={progressTrackRef}
              className={`${styles.progressTrack} ${isDragging ? styles.dragging : ''}`}
              onPointerDown={onProgressPointerDown}
              onPointerMove={onProgressPointerMove}
              onPointerUp={onProgressPointerUp}
              onPointerCancel={onProgressPointerUp}
              role="slider"
              aria-label="解说进度"
              aria-valuenow={Math.round(progress * 100)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className={styles.progressFillWrap}>
                <div className={styles.progressFill} style={{ width: `${progress * 100}%` }} />
              </div>
              <div className={styles.progressThumb} style={{ left: `${progress * 100}%` }} />
            </div>
            <div className={styles.timeRow}>
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* 音量滑块 */}
            <div className={styles.volumeRow}>
              <Volume2 size={16} opacity={0.5} />
              <input
                type="range"
                min={0}
                max={100}
                value={volume}
                onChange={(e) => onVolumeChange(Number(e.target.value))}
                aria-label="音量"
              />
              <span className={styles.volumeVal}>{volume}%</span>
            </div>

            <div className={styles.divider} />

            {/* 心率检测入口 */}
            <div className={styles.toolRow}>
              <span className={styles.toolLabel}>
                <Heart size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                心率联动
              </span>
              {hrData ? (
                <button
                  className={`${styles.toggleBtn} ${styles.active}`}
                  onClick={() => setShowHROverlay(true)}
                  aria-label="重新检测心率"
                >
                  {Math.round(hrData.bpm)} BPM · 重测
                </button>
              ) : (
                <button
                  className={styles.toggleBtn}
                  onClick={() => setShowHROverlay(true)}
                  aria-label="启用心率检测"
                >
                  <Heart size={12} /> 检测
                </button>
              )}
            </div>

            {/* 结束旅程按钮（旅程进行中显示） */}
            {activeJourney && (
              <button
                className={styles.endJourneyBtn}
                onClick={() => requestEndJourney(false)}
                style={{ marginTop: 10 }}
              >
                <Square size={12} /> 结束旅程 · 已聆听 {formatTime(elapsedSec)}
              </button>
            )}

            {/* 工具行：循环开关 */}
            <div className={styles.toolRow} style={{ marginTop: 8 }}>
              <span className={styles.toolLabel}>循环解说</span>
              <button
                className={`${styles.toggleBtn} ${loopMode ? styles.active : ''}`}
                onClick={() => setLoopMode((v) => !v)}
                aria-label="循环播放切换"
                aria-pressed={loopMode}
              >
                <Repeat size={12} /> {loopMode ? '开' : '关'}
              </button>
            </div>

            {/* 工具行：字幕开关 */}
            <div className={styles.toolRow} style={{ marginTop: 8 }}>
              <span className={styles.toolLabel}>解说字幕</span>
              <button
                className={`${styles.toggleBtn} ${showSubtitle ? styles.active : ''}`}
                onClick={() => setShowSubtitle((v) => !v)}
                aria-label="字幕切换"
                aria-pressed={showSubtitle}
              >
                <Subtitles size={12} /> {showSubtitle ? '开' : '关'}
              </button>
            </div>

            <div className={styles.divider} />

            {/* 睡眠定时器 */}
            <div className={styles.toolRow}>
              <span className={styles.toolLabel}>
                <Moon size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
                睡眠定时
              </span>
              {sleepMinutes === null && <span className={styles.volumeVal}>关闭</span>}
            </div>
            <div className={styles.sleepPicker}>
              {SLEEP_OPTIONS.map((m) => (
                <button
                  key={m}
                  className={`${styles.sleepOption} ${sleepMinutes === m ? styles.active : ''}`}
                  onClick={() => setSleepTimer(sleepMinutes === m ? null : m)}
                >
                  {m}分
                </button>
              ))}
            </div>
            {sleepRemaining !== null && sleepRemaining > 0 && (
              <div className={styles.sleepCountdown}>
                <span>剩余 {formatCountdown(sleepRemaining)}</span>
                <button className={styles.cancelBtn} onClick={() => setSleepTimer(null)}>
                  <X size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                  取消
                </button>
              </div>
            )}
          </div>
        )}

        <button
          className={`${styles.consoleToggle} ${consoleOpen ? styles.active : ''}`}
          onClick={() => {
            audio.ensureContext();
            setConsoleOpen((o) => !o);
          }}
          aria-label="控制台"
        >
          <SlidersHorizontal size={20} />
        </button>
      </div>

      {/* ===== 心率检测浮层 ===== */}
      {showHROverlay && (
        <div className={styles.overlay}>
          <HRDetector
            onReady={handleHRReady}
            onSkip={handleHRSkip}
            onClose={() => setShowHROverlay(false)}
            onLaunchMonitor={() => {
              setShowHROverlay(false);
              setShowHRMonitor(true);
            }}
          />
        </div>
      )}

      {/* ===== 完整心率监测浮层（BLE/PPG，浅色卡片嵌于深色遮罩）===== */}
      {showHRMonitor && (
        <div className={styles.overlay}>
          <div className={styles.hrMonitorCard}>
            <button className={styles.hrMonitorClose} onClick={() => setShowHRMonitor(false)} aria-label="关闭">
              <X size={18} />
            </button>
            <HeartRateMonitor
              onHeartRateReady={handleHRReady}
              onSkip={handleHRSkip}
            />
          </div>
        </div>
      )}

      {/* ===== 心情评分浮层 ===== */}
      {showMoodPicker && (
        <div className={styles.overlay}>
          <div className={styles.moodCard}>
            <p className={styles.moodTitle}>{moodPickerTitle}</p>
            <p className={styles.moodHint}>{moodPickerHint}</p>
            <div className={styles.moodFaces}>
              {MOOD_FACES.map((f) => (
                <button
                  key={f.value}
                  className={styles.moodFace}
                  onClick={() =>
                    showMoodPicker === 'before'
                      ? moodBeforePicked(f.value)
                      : moodAfterPicked(f.value)
                  }
                >
                  <span className={styles.moodEmoji}>{f.emoji}</span>
                  <span className={styles.moodFaceLabel}>{f.label}</span>
                </button>
              ))}
            </div>
            {showMoodPicker === 'before' && (
              <button className={styles.moodSkip} onClick={() => moodBeforePicked(3)}>
                跳过 · 用"一般"开始
              </button>
            )}
            {saving && <p className={styles.moodHint}>正在保存旅程记录…</p>}
          </div>
        </div>
      )}

      {/* ===== 会话报告浮层 ===== */}
      {showReport && lastCompleted && (
        <div className={styles.overlay}>
          <div className={styles.reportCard}>
            <p className={styles.reportTitle}>旅程完成</p>
            {(() => {
              const mode = FLOW_MODE_MAP[lastCompleted.modeId];
              const delta = lastCompleted.moodAfter - lastCompleted.moodBefore;
              const before = MOOD_FACES.find((f) => f.value === lastCompleted.moodBefore);
              const after = MOOD_FACES.find((f) => f.value === lastCompleted.moodAfter);
              return (
                <>
                  <div className={styles.reportModeRow}>
                    <span className={styles.reportModeIcon}>{mode.icon}</span>
                    <div>
                      <p className={styles.reportModeName}>{mode.name}</p>
                      <p className={styles.reportModeSub}>{mode.subtitle}</p>
                    </div>
                  </div>

                  <div className={styles.reportMoodCompare}>
                    <div className={styles.reportMoodSide}>
                      <span className={styles.reportMoodEmoji}>{before?.emoji}</span>
                      <span className={styles.reportMoodLabel}>之前 · {before?.label}</span>
                    </div>
                    <span className={styles.reportMoodArrow}>→</span>
                    <div className={styles.reportMoodSide}>
                      <span className={styles.reportMoodEmoji}>{after?.emoji}</span>
                      <span className={styles.reportMoodLabel}>之后 · {after?.label}</span>
                    </div>
                  </div>

                  <div
                    className={styles.reportDelta}
                    style={{ color: delta > 0 ? '#7fc7c0' : delta < 0 ? '#c26158' : 'rgba(220,225,235,0.6)' }}
                  >
                    {delta > 0 ? `心情提升 ${delta} 级` : delta < 0 ? `心情下降 ${Math.abs(delta)} 级` : '心情保持平稳'}
                  </div>

                  <div className={styles.reportStatGrid}>
                    <div className={styles.reportStatBox}>
                      <p className={styles.reportStatVal}>{formatDuration(lastCompleted.durationSec)}</p>
                      <p className={styles.reportStatLab}>聆听时长</p>
                    </div>
                    {lastCompleted.bpmBefore && (
                      <div className={styles.reportStatBox}>
                        <p className={styles.reportStatVal}>{Math.round(lastCompleted.bpmBefore)}</p>
                        <p className={styles.reportStatLab}>起始 BPM</p>
                      </div>
                    )}
                    <div className={styles.reportStatBox}>
                      <p className={styles.reportStatVal}>{stats.count}</p>
                      <p className={styles.reportStatLab}>累计次数</p>
                    </div>
                  </div>

                  <p className={styles.reportSyncHint}>
                    已同步至今日情绪打卡
                  </p>

                  <button className={styles.reportClose} onClick={dismissReport}>
                    回到知音之境
                  </button>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* 隐藏音频元素（解说） */}
      <audio ref={audioRef} preload="auto" />

      {/* 进场遮罩 */}
      <div className={`${styles.loader} ${loaded ? styles.hidden : ''}`}>
        <div className={styles.loaderText}>正在进入知音之境</div>
      </div>
    </div>
  );
}
