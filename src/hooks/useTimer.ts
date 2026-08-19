'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * useTimer — 计时器 hook
 *
 * 提供正计时（elapsed）和倒计时（remaining）两种模式。
 * 从 grounding / wuyin / singing-bowl / tuina-guide 提取的公共逻辑。
 */
interface UseTimerOptions {
  /** 倒计时模式：设定总秒数 (0 = 正计时模式) */
  totalSeconds?: number;
  /** 是否自动启动 */
  autoStart?: boolean;
  /** 计时结束回调 */
  onComplete?: () => void;
}

interface UseTimerReturn {
  /** 已经过秒数 */
  elapsed: number;
  /** 剩余秒数（仅倒计时模式） */
  remaining: number;
  /** 是否正在计时 */
  isRunning: boolean;
  /** 开始/恢复 */
  start: () => void;
  /** 暂停 */
  pause: () => void;
  /** 重置 */
  reset: () => void;
  /** 设置总秒数（同时重置） */
  setTotal: (sec: number) => void;
  /** 格式化后的已用时间 MM:SS */
  formattedElapsed: string;
  /** 格式化后的剩余时间 MM:SS */
  formattedRemaining: string;
}

function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function useTimer(options: UseTimerOptions = {}): UseTimerReturn {
  const { totalSeconds: initialTotal = 0, autoStart = false, onComplete } = options;
  const [elapsed, setElapsed] = useState(0);
  const [total, setTotal] = useState(initialTotal);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTsRef = useRef<number>(Date.now());

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    setElapsed(prev => {
      const next = prev + 1;
      if (total > 0 && next >= total) {
        clearTimer();
        setIsRunning(false);
        onComplete?.();
        return total;
      }
      return next;
    });
  }, [total, clearTimer, onComplete]);

  const start = useCallback(() => {
    if (isRunning) return;
    startTsRef.current = Date.now();
    setIsRunning(true);
  }, [isRunning]);

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const reset = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setElapsed(0);
  }, [clearTimer]);

  const setTotalTime = useCallback((sec: number) => {
    clearTimer();
    setIsRunning(false);
    setTotal(sec);
    setElapsed(0);
  }, [clearTimer]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearTimer();
    }
    return clearTimer;
  }, [isRunning, tick, clearTimer]);

  return {
    elapsed,
    remaining: Math.max(0, total - elapsed),
    isRunning,
    start,
    pause,
    reset,
    setTotal: setTotalTime,
    formattedElapsed: fmtTime(elapsed),
    formattedRemaining: fmtTime(Math.max(0, total - elapsed)),
  };
}

export { fmtTime };
export default useTimer;
