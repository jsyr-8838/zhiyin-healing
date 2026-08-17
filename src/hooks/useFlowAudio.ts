'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import type { FlowMode } from '@/lib/zhi-yin-zhi-jing-data';

/* ================================================================
 *  环境音节点（多层合成）
 * ================================================================ */
interface AmbientNodes {
  /** 低频底层（sub-bass drone） */
  subSource: AudioBufferSourceNode;
  subGain: GainNode;
  /** 中频纹理层（filtered noise texture） */
  midSource: AudioBufferSourceNode;
  midGain: GainNode;
  midFilter: BiquadFilterNode;
  /** 高频细节层（subtle detail） */
  hiSource: AudioBufferSourceNode;
  hiGain: GainNode;
  hiFilter: BiquadFilterNode;
  /** 总增益 */
  masterGain: GainNode;
  /** LFO 调制（呼吸感） */
  lfo: OscillatorNode;
  lfoGain: GainNode;
}

/* ================================================================
 *  导引语音增强节点
 * ================================================================ */
interface VoiceEnhanceNodes {
  /** 均衡器：中频增强（人声清晰度 1-4kHz） */
  eqMid: BiquadFilterNode;
  /** 均衡器：低频微提（温暖感 200-400Hz） */
  eqLow: BiquadFilterNode;
  /** 压缩器：动态范围压缩（小声变大） */
  compressor: DynamicsCompressorNode;
  /** 混响：疗愈空间感 */
  convolver: ConvolverNode;
  reverbGain: GainNode;
  dryGain: GainNode;
  /** 总增益 */
  masterGain: GainNode;
}

/**
 * useFlowAudio — 知音之境 Web 音频引擎 v2
 *
 * 改进：
 *  - 导引语音：通过 Web Audio API 增强链（均衡→压缩→混响），加大清晰度与疗愈感
 *  - 环境音：三层合成（低频drone + 中频纹理 + 高频细节）+ LFO呼吸调制
 *           以环绕式低音为主，音量降至 0.22，不盖过导引语音
 *  - 颂钵钟声：6 层泛音 + 频率漂移 + 撞击声
 *  - 点击音效：短促正弦
 */
export function useFlowAudio() {
  const ctxRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<AmbientNodes | null>(null);
  const voiceRef = useRef<VoiceEnhanceNodes | null>(null);
  const [ready, setReady] = useState(false);

  /** 惰性初始化 / 恢复 AudioContext（必须在用户手势内调用） */
  const ensureContext = useCallback((): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    if (!ctxRef.current) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
      setReady(true);
    }
    if (ctxRef.current.state === 'suspended') {
      void ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  /* ================================================================
   *  噪音缓冲生成
   * ================================================================ */

  /** 生成粉红噪音缓冲（更自然，低频能量更多） */
  const makePinkNoiseBuffer = useCallback((ctx: AudioContext, duration = 4): AudioBuffer => {
    const size = duration * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }, []);

  /** 生成棕色噪音缓冲（极低频轰鸣，深海底噪/宇宙嗡鸣感） */
  const makeBrownNoiseBuffer = useCallback((ctx: AudioContext, duration = 4): AudioBuffer => {
    const size = duration * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < size; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + (0.02 * white)) / 1.02;
      data[i] = last * 3.5;
    }
    return buffer;
  }, []);

  /** 生成白噪音缓冲（高频细节用） */
  const makeWhiteNoiseBuffer = useCallback((ctx: AudioContext, duration = 2): AudioBuffer => {
    const size = duration * ctx.sampleRate;
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }, []);

  /* ================================================================
   *  各境环境音参数（三层合成配置）
   * ================================================================ */

  interface AmbientConfig {
    /** 低频层：频率范围(Hz) + 增益 */
    sub: { freq: number; gain: number };
    /** 中频纹理层：滤波器类型 + 中心频率 + Q + 增益 */
    mid: { filterType: BiquadFilterType; frequency: number; q: number; gain: number };
    /** 高频细节层：高通频率 + 增益（极低，仅点缀） */
    hi: { frequency: number; gain: number };
    /** LFO 呼吸调制速率(Hz) + 深度 */
    lfo: { rate: number; depth: number };
  }

  const AMBIENT_CONFIGS: Record<string, AmbientConfig> = {
    deepsea: {
      sub: { freq: 40, gain: 0.35 },
      mid: { filterType: 'lowpass', frequency: 180, q: 0.8, gain: 0.28 },
      hi: { frequency: 800, gain: 0.03 },
      lfo: { rate: 0.08, depth: 0.15 },
    },
    rain: {
      sub: { freq: 60, gain: 0.18 },
      mid: { filterType: 'bandpass', frequency: 3000, q: 0.3, gain: 0.22 },
      hi: { frequency: 5000, gain: 0.08 },
      lfo: { rate: 0.12, depth: 0.1 },
    },
    temple: {
      sub: { freq: 55, gain: 0.25 },
      mid: { filterType: 'bandpass', frequency: 400, q: 1.5, gain: 0.15 },
      hi: { frequency: 2000, gain: 0.02 },
      lfo: { rate: 0.05, depth: 0.2 },
    },
    universe: {
      sub: { freq: 30, gain: 0.4 },
      mid: { filterType: 'lowpass', frequency: 120, q: 0.5, gain: 0.2 },
      hi: { frequency: 600, gain: 0.015 },
      lfo: { rate: 0.03, depth: 0.25 },
    },
    mountain: {
      sub: { freq: 50, gain: 0.22 },
      mid: { filterType: 'bandpass', frequency: 600, q: 0.5, gain: 0.2 },
      hi: { frequency: 4000, gain: 0.04 },
      lfo: { rate: 0.07, depth: 0.12 },
    },
    campfire: {
      sub: { freq: 65, gain: 0.3 },
      mid: { filterType: 'lowpass', frequency: 500, q: 0.8, gain: 0.18 },
      hi: { frequency: 3000, gain: 0.05 },
      lfo: { rate: 0.15, depth: 0.08 },
    },
    snow: {
      sub: { freq: 45, gain: 0.12 },
      mid: { filterType: 'highpass', frequency: 4000, q: 0.3, gain: 0.1 },
      hi: { frequency: 8000, gain: 0.06 },
      lfo: { rate: 0.04, depth: 0.18 },
    },
    moon: {
      sub: { freq: 35, gain: 0.28 },
      mid: { filterType: 'lowpass', frequency: 300, q: 0.6, gain: 0.22 },
      hi: { frequency: 1200, gain: 0.025 },
      lfo: { rate: 0.06, depth: 0.2 },
    },
    mist: {
      sub: { freq: 38, gain: 0.32 },
      mid: { filterType: 'lowpass', frequency: 200, q: 0.4, gain: 0.25 },
      hi: { frequency: 900, gain: 0.02 },
      lfo: { rate: 0.05, depth: 0.22 },
    },
  };

  /* ================================================================
   *  导引语音增强链
   * ================================================================ */

  /** 初始化导引语音增强链（连接到 <audio> 元素的 MediaElementSource） */
  const initVoiceEnhance = useCallback((audioEl: HTMLAudioElement): GainNode | null => {
    const ctx = ensureContext();
    if (!ctx) return null;

    // 已初始化则先断开旧链
    if (voiceRef.current) {
      try { voiceRef.current.masterGain.disconnect(); } catch { /* noop */ }
    }

    // 中频增强均衡器（人声清晰度核心：1-4kHz）
    const eqMid = ctx.createBiquadFilter();
    eqMid.type = 'peaking';
    eqMid.frequency.setValueAtTime(2500, ctx.currentTime);
    eqMid.Q.setValueAtTime(1.0, ctx.currentTime);
    eqMid.gain.setValueAtTime(4.5, ctx.currentTime); // +4.5dB 人声增强

    // 低频微提均衡器（温暖感：200-400Hz）
    const eqLow = ctx.createBiquadFilter();
    eqLow.type = 'peaking';
    eqLow.frequency.setValueAtTime(280, ctx.currentTime);
    eqLow.Q.setValueAtTime(0.8, ctx.currentTime);
    eqLow.gain.setValueAtTime(2.0, ctx.currentTime); // +2dB 低频温暖

    // 高频柔化（去除刺耳齿音 8kHz+）
    const eqHi = ctx.createBiquadFilter();
    eqHi.type = 'lowshelf';
    eqHi.frequency.setValueAtTime(8000, ctx.currentTime);
    eqHi.gain.setValueAtTime(-2.0, ctx.currentTime); // -2dB 高频柔化

    // 动态压缩器（小声变大，大声不爆）
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.setValueAtTime(-24, ctx.currentTime);  // -24dB 开始压缩
    compressor.knee.setValueAtTime(12, ctx.currentTime);        // 12dB 软膝
    compressor.ratio.setValueAtTime(3, ctx.currentTime);        // 3:1 压缩比
    compressor.attack.setValueAtTime(0.003, ctx.currentTime);   // 3ms 快速响应
    compressor.release.setValueAtTime(0.15, ctx.currentTime);  // 150ms 释放

    // 混响（疗愈空间感）
    const convolver = ctx.createConvolver();
    const reverbGain = ctx.createGain();
    const dryGain = ctx.createGain();

    // 生成简易脉冲响应（模拟小厅堂混响，1.8s衰减）
    const reverbLen = Math.floor(ctx.sampleRate * 1.8);
    const impulse = ctx.createBuffer(2, reverbLen, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      for (let i = 0; i < reverbLen; i++) {
        // 早期反射 + 指数衰减
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / reverbLen, 2.2);
      }
    }
    convolver.buffer = impulse;

    reverbGain.gain.setValueAtTime(0.12, ctx.currentTime); // 12% 湿信号
    dryGain.gain.setValueAtTime(1.0, ctx.currentTime);     // 100% 干信号

    // 导引语音总增益（确保声音够大）
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(1.35, ctx.currentTime); // 提升35%基础音量

    // 连接 <audio> → 增强链 → 输出
    try {
      const src = ctx.createMediaElementSource(audioEl);
      src.connect(eqLow);
    } catch {
      // 可能已连接过（同一个<audio>只能createMediaElementSource一次）
      // 尝试直接连接到已有链
      try {
        // 如果之前已连接，MediaElementSource还在，直接修改参数
        if (voiceRef.current) {
          return voiceRef.current.masterGain;
        }
      } catch { /* noop */ }
      return null;
    }

    eqLow.connect(eqMid);
    eqMid.connect(eqHi);
    eqHi.connect(compressor);

    // 干信号路径
    compressor.connect(dryGain);
    dryGain.connect(masterGain);

    // 湿信号路径（混响）
    compressor.connect(convolver);
    convolver.connect(reverbGain);
    reverbGain.connect(masterGain);

    masterGain.connect(ctx.destination);

    voiceRef.current = { eqMid, eqLow, compressor, convolver, reverbGain, dryGain, masterGain };

    return masterGain;
  }, [ensureContext]);

  /** 更新导引语音音量 */
  const setVoiceVolume = useCallback((volume: number) => {
    const nodes = voiceRef.current;
    if (!nodes) return;
    // 音量映射：volume 0-100 → 1.0-1.8（基础1.35 + 额外提升）
    nodes.masterGain.gain.setValueAtTime(0.8 + volume * 0.01, ctxRef.current?.currentTime ?? 0);
  }, []);

  /* ================================================================
   *  环境音启动（三层合成）
   * ================================================================ */

  /** 启动某境环境音 */
  const startAmbient = useCallback(
    (mode: FlowMode, volume: number) => {
      const ctx = ensureContext();
      if (!ctx) return;

      // 若已有环境音，先停
      if (ambientRef.current) {
        try { ambientRef.current.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5); } catch { /* noop */ }
        setTimeout(() => {
          try { ambientRef.current?.subSource.stop(); } catch { /* noop */ }
          try { ambientRef.current?.midSource.stop(); } catch { /* noop */ }
          try { ambientRef.current?.hiSource.stop(); } catch { /* noop */ }
          try { ambientRef.current?.lfo.stop(); } catch { /* noop */ }
        }, 600);
        ambientRef.current = null;
      }

      const cfg = AMBIENT_CONFIGS[mode.id] || AMBIENT_CONFIGS.deepsea;
      const now = ctx.currentTime;

      // ---- 总增益 ----
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0, now);
      // 环境音大幅降低：0.22 倍音量，以环绕低音为主，不盖过导引语音
      masterGain.gain.linearRampToValueAtTime(volume * 0.22, now + 4); // 4秒缓慢淡入
      masterGain.connect(ctx.destination);

      // ---- 低频底层（棕色噪音 → 低通，深海底噪/宇宙嗡鸣） ----
      const subSource = ctx.createBufferSource();
      subSource.buffer = makeBrownNoiseBuffer(ctx, 6); // 6秒循环
      subSource.loop = true;
      const subFilter = ctx.createBiquadFilter();
      subFilter.type = 'lowpass';
      subFilter.frequency.setValueAtTime(cfg.sub.freq * 2, now);
      subFilter.Q.setValueAtTime(0.5, now);
      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(cfg.sub.gain, now);
      subSource.connect(subFilter);
      subFilter.connect(subGain);
      subGain.connect(masterGain);

      // ---- 中频纹理层（粉红噪音 → 带通/低通，真实环境声场） ----
      const midSource = ctx.createBufferSource();
      midSource.buffer = makePinkNoiseBuffer(ctx, 5); // 5秒循环
      midSource.loop = true;
      const midFilter = ctx.createBiquadFilter();
      midFilter.type = cfg.mid.filterType;
      midFilter.frequency.setValueAtTime(cfg.mid.frequency, now);
      midFilter.Q.setValueAtTime(cfg.mid.q, now);
      const midGain = ctx.createGain();
      midGain.gain.setValueAtTime(cfg.mid.gain, now);
      midSource.connect(midFilter);
      midFilter.connect(midGain);
      midGain.connect(masterGain);

      // ---- 高频细节层（白噪音 → 高通，极低音量仅点缀） ----
      const hiSource = ctx.createBufferSource();
      hiSource.buffer = makeWhiteNoiseBuffer(ctx, 3); // 3秒循环
      hiSource.loop = true;
      const hiFilter = ctx.createBiquadFilter();
      hiFilter.type = 'highpass';
      hiFilter.frequency.setValueAtTime(cfg.hi.frequency, now);
      hiFilter.Q.setValueAtTime(0.3, now);
      const hiGain = ctx.createGain();
      hiGain.gain.setValueAtTime(cfg.hi.gain, now);
      hiSource.connect(hiFilter);
      hiFilter.connect(hiGain);
      hiGain.connect(masterGain);

      // ---- LFO 呼吸调制（给低频层添加缓慢起伏感） ----
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(cfg.lfo.rate, now);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(cfg.lfo.depth, now);
      lfo.connect(lfoGain);
      lfoGain.connect(subGain.gain); // 调制低频层音量

      // 启动所有层
      subSource.start(now);
      midSource.start(now);
      hiSource.start(now);
      lfo.start(now);

      ambientRef.current = { subSource, subGain, midSource, midGain, midFilter, hiSource, hiGain, hiFilter, masterGain, lfo, lfoGain };
    },
    [ensureContext, makeBrownNoiseBuffer, makePinkNoiseBuffer, makeWhiteNoiseBuffer]
  );

  /** 停止环境音（3 秒淡出） */
  const stopAmbient = useCallback(() => {
    const ctx = ctxRef.current;
    const nodes = ambientRef.current;
    if (!ctx || !nodes) return;
    try {
      nodes.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      nodes.masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3); // 3秒淡出
      setTimeout(() => {
        try { nodes.subSource.stop(); } catch { /* noop */ }
        try { nodes.midSource.stop(); } catch { /* noop */ }
        try { nodes.hiSource.stop(); } catch { /* noop */ }
        try { nodes.lfo.stop(); } catch { /* noop */ }
      }, 3200);
    } catch { /* noop */ }
    ambientRef.current = null;
  }, []);

  /** 调整环境音量（实时） */
  const setAmbientVolume = useCallback((volume: number) => {
    const ctx = ctxRef.current;
    const nodes = ambientRef.current;
    if (!ctx || !nodes) return;
    nodes.masterGain.gain.cancelScheduledValues(ctx.currentTime);
    nodes.masterGain.gain.linearRampToValueAtTime(volume * 0.22, ctx.currentTime + 0.2);
  }, []);

  /* ================================================================
   *  颂钵钟声（光球点击）
   * ================================================================ */

  /** 单个泛音 */
  const playBowlTone = useCallback(
    (ctx: AudioContext, frequency: number, maxGain: number, decay: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, now);
      osc.frequency.exponentialRampToValueAtTime(frequency * 0.998, now + decay);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(maxGain * 0.3, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(maxGain, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(maxGain * 0.7, now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay);
      osc.start(now);
      osc.stop(now + decay);
    },
    []
  );

  /** 撞击声（白噪音 burst） */
  const playStrike = useCallback((ctx: AudioContext) => {
    const now = ctx.currentTime;
    const size = Math.floor(ctx.sampleRate * 0.05);
    const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < size; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (size * 0.3));
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(500, now + 0.05);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }, []);

  /** 颂钵钟声（光球点击） */
  const playBell = useCallback(() => {
    const ctx = ensureContext();
    if (!ctx) return;
    const baseFreq = 261.63;
    const harmonics = [
      { freq: baseFreq, gain: 0.4, decay: 4 },
      { freq: baseFreq * 2.0, gain: 0.25, decay: 3.5 },
      { freq: baseFreq * 3.0, gain: 0.15, decay: 3 },
      { freq: baseFreq * 4.2, gain: 0.1, decay: 2.5 },
      { freq: baseFreq * 5.8, gain: 0.08, decay: 2 },
      { freq: baseFreq * 7.9, gain: 0.05, decay: 1.5 },
    ];
    harmonics.forEach((h, i) => {
      setTimeout(() => playBowlTone(ctx, h.freq, h.gain, h.decay), i * 50);
    });
    playStrike(ctx);
  }, [ensureContext, playBowlTone, playStrike]);

  /** 点击音效 */
  const playClick = useCallback(() => {
    const ctx = ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, now);
    osc.type = 'sine';
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  }, [ensureContext]);

  // 卸载时清理
  useEffect(() => {
    return () => {
      if (ambientRef.current) {
        try { ambientRef.current.subSource.stop(); } catch { /* noop */ }
        try { ambientRef.current.midSource.stop(); } catch { /* noop */ }
        try { ambientRef.current.hiSource.stop(); } catch { /* noop */ }
        try { ambientRef.current.lfo.stop(); } catch { /* noop */ }
      }
      if (ctxRef.current) {
        void ctxRef.current.close();
      }
    };
  }, []);

  return {
    ready,
    ensureContext,
    initVoiceEnhance,
    setVoiceVolume,
    startAmbient,
    stopAmbient,
    setAmbientVolume,
    playBell,
    playClick,
  };
}
