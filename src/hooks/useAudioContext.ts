'use client';

import { useRef, useCallback, useEffect } from 'react';

/**
 * useAudioContext — Web Audio API 上下文管理 hook
 *
 * 从 wuyin / singing-bowl 提取的公共 AudioContext 初始化逻辑。
 * 管理单个 AudioContext + 两个 AnalyserNode 的生命周期。
 *
 * 使用:
 *   const { ctx, analyser, analyser2, init, getCtx, cleanup } = useAudioContext();
 */
interface UseAudioContextReturn {
  /** 获取/创建 AudioContext（懒初始化） */
  init: () => AudioContext;
  /** 当前 AudioContext（可能为 null） */
  getCtx: () => AudioContext | null;
  /** 主分析器（fftSize=2048, smoothing=0.85） */
  analyser: React.RefObject<AnalyserNode | null>;
  /** 副分析器（fftSize=2048, smoothing=0，用于 Lissajous） */
  analyser2: React.RefObject<AnalyserNode | null>;
  /** 安全停止所有振荡器节点 */
  stopOscillators: (nodes: (OscillatorNode | AudioScheduledSourceNode | null)[]) => void;
  /** 关闭 AudioContext */
  close: () => void;
}

export function useAudioContext(): UseAudioContextReturn {
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyser2Ref = useRef<AnalyserNode | null>(null);

  const init = useCallback(() => {
    if (!ctxRef.current) {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const a1 = ctx.createAnalyser();
      a1.fftSize = 2048;
      a1.smoothingTimeConstant = 0.85;
      const a2 = ctx.createAnalyser();
      a2.fftSize = 2048;
      a2.smoothingTimeConstant = 0;
      ctxRef.current = ctx;
      analyserRef.current = a1;
      analyser2Ref.current = a2;
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const getCtx = useCallback(() => ctxRef.current, []);

  const stopOscillators = useCallback((nodes: (OscillatorNode | AudioScheduledSourceNode | null)[]) => {
    for (const n of nodes) {
      try { n?.stop(); } catch { /* already stopped */ }
    }
  }, []);

  const close = useCallback(() => {
    if (ctxRef.current) {
      try { ctxRef.current.close(); } catch { /* */ }
      ctxRef.current = null;
      analyserRef.current = null;
      analyser2Ref.current = null;
    }
  }, []);

  // 组件卸载时自动关闭
  useEffect(() => {
    return () => { close(); };
  }, [close]);

  return {
    init,
    getCtx,
    analyser: analyserRef,
    analyser2: analyser2Ref,
    stopOscillators,
    close,
  };
}

export default useAudioContext;
