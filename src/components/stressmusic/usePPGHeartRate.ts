'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * usePPGHeartRate — 摄像头光电容积脉搏波(PPG)心率检测
 * 
 * 原理：将指尖轻放在手机摄像头+闪光灯上，
 * 随着心脏搏动，指尖血容量变化导致透射光强度变化，
 * 通过分析红色通道的周期性变化计算心率。
 * 
 * 算法：
 * 1. 采集摄像头帧，提取红色通道平均值
 * 2. 带通滤波 (0.5Hz-4Hz, 对应 30-240 BPM)
 * 3. 峰值检测
 * 4. 根据相邻峰值间隔计算 BPM
 */

export interface PPGHeartRateData {
  bpm: number;
  confidence: number;  // 0-1 检测置信度
  timestamp: number;
  signalStrength: number;  // 0-1 信号质量
}

export type PPGState = 'idle' | 'preparing' | 'measuring' | 'stable' | 'error';

const FPS_TARGET = 30;
const MIN_MEASUREMENT_FRAMES = 90;  // 至少3秒数据 (90 frames @ 30fps)
const BUFFER_SIZE = 300;            // 10秒缓冲
const BPM_MIN = 40;
const BPM_MAX = 200;
const PEAK_MIN_DISTANCE = 15;       // 最小峰值间距 (frames, ~0.5s @ 30fps)

export function usePPGHeartRate() {
  const [ppgState, setPpgState] = useState<PPGState>('idle');
  const [heartRateData, setHeartRateData] = useState<PPGHeartRateData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const signalBufferRef = useRef<number[]>([]);
  const bpmHistoryRef = useRef<number[]>([]);
  const frameCountRef = useRef<number>(0);
  const lastPeakRef = useRef<number>(0);
  const peakTimesRef = useRef<number[]>([]);
  const ppgStateRef = useRef<PPGState>('idle');

  // 保持 ref 与 state 同步
  useEffect(() => {
    ppgStateRef.current = ppgState;
  }, [ppgState]);

  /**
   * 从视频帧提取红色通道平均值
   */
  const extractRedChannelAvg = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number): number => {
    // 采样中心区域（指尖最稳定区域）
    const cx = Math.floor(width * 0.3);
    const cy = Math.floor(height * 0.3);
    const cw = Math.floor(width * 0.4);
    const ch = Math.floor(height * 0.4);
    const imageData = ctx.getImageData(cx, cy, cw, ch);
    const data = imageData.data;

    let redSum = 0;
    const pixelCount = data.length / 4;
    for (let i = 0; i < data.length; i += 4) {
      redSum += data[i]; // R channel
    }
    return redSum / pixelCount;
  }, []);

  /**
   * 简单移动平均滤波
   */
  const movingAverage = useCallback((data: number[], windowSize: number): number[] => {
    const result: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
      const slice = data.slice(start, end);
      result.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    }
    return result;
  }, []);

  /**
   * 峰值检测
   */
  const detectPeaks = useCallback((signal: number[], minDistance: number): number[] => {
    const peaks: number[] = [];
    for (let i = 1; i < signal.length - 1; i++) {
      if (signal[i] > signal[i - 1] && signal[i] > signal[i + 1]) {
        if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minDistance) {
          peaks.push(i);
        }
      }
    }
    return peaks;
  }, []);

  /**
   * 根据峰值计算 BPM
   */
  const calculateBPMFromPeaks = useCallback((peaks: number[], fps: number): number => {
    if (peaks.length < 2) return 0;

    const intervals: number[] = [];
    for (let i = 1; i < peaks.length; i++) {
      const intervalFrames = peaks[i] - peaks[i - 1];
      const intervalSeconds = intervalFrames / fps;
      const instantBPM = 60 / intervalSeconds;
      if (instantBPM >= BPM_MIN && instantBPM <= BPM_MAX) {
        intervals.push(intervalSeconds);
      }
    }

    if (intervals.length === 0) return 0;
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    return Math.round(60 / avgInterval);
  }, []);

  /**
   * 计算信号质量/置信度
   */
  const calculateConfidence = useCallback((signal: number[]): number => {
    if (signal.length < 30) return 0;
    const recent = signal.slice(-90);
    const mean = recent.reduce((a, b) => a + b, 0) / recent.length;
    const variance = recent.reduce((sum, v) => sum + (v - mean) ** 2, 0) / recent.length;
    const std = Math.sqrt(variance);
    // 变异系数越小→信号越稳定→置信度越高
    const cv = mean > 0 ? std / mean : 1;
    return Math.min(1, Math.max(0, 1 - cv * 5));
  }, []);

  /**
   * 处理每一帧
   */
  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;

    ctx.drawImage(video, 0, 0);
    const redAvg = extractRedChannelAvg(ctx, canvas.width, canvas.height);

    // 存入缓冲
    signalBufferRef.current.push(redAvg);
    if (signalBufferRef.current.length > BUFFER_SIZE) {
      signalBufferRef.current.shift();
    }

    frameCountRef.current++;

    // 至少3秒数据后开始计算
    if (signalBufferRef.current.length >= MIN_MEASUREMENT_FRAMES) {
      const signal = movingAverage(signalBufferRef.current, 5);
      const peaks = detectPeaks(signal, PEAK_MIN_DISTANCE);
      const bpm = calculateBPMFromPeaks(peaks, FPS_TARGET);
      const confidence = calculateConfidence(signalBufferRef.current.slice(-90));
      const signalStrength = Math.min(1, redAvg / 200); // 红色通道强度

      if (bpm >= BPM_MIN && bpm <= BPM_MAX) {
        bpmHistoryRef.current.push(bpm);
        if (bpmHistoryRef.current.length > 30) {
          bpmHistoryRef.current.shift();
        }

        // 使用最近5个BPM的中位数
        const recentBPMs = bpmHistoryRef.current.slice(-5);
        const sorted = [...recentBPMs].sort((a, b) => a - b);
        const medianBPM = sorted[Math.floor(sorted.length / 2)];

        const stableConfidence = confidence * 0.7 + (bpmHistoryRef.current.length >= 5 ? 0.3 : 0);

        setHeartRateData({
          bpm: medianBPM,
          confidence: Math.min(stableConfidence, 1),
          timestamp: Date.now(),
          signalStrength,
        });

        if (ppgStateRef.current !== 'stable' && confidence > 0.5 && bpmHistoryRef.current.length >= 5) {
          setPpgState('stable');
        }
      }
    }

    animFrameRef.current = requestAnimationFrame(processFrame);
  }, [extractRedChannelAvg, movingAverage, detectPeaks, calculateBPMFromPeaks, calculateConfidence]);

  /**
   * 开始 PPG 测量
   */
  const startMeasurement = useCallback(async () => {
    setErrorMessage(null);
    setPpgState('preparing');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment', // 后置摄像头（手指覆盖时更方便）
          width: { ideal: 320 },
          height: { ideal: 240 },
        },
        audio: false,
      });

      streamRef.current = stream;

      // 创建 video 和 canvas 元素
      const video = document.createElement('video');
      video.srcObject = stream;
      video.setAttribute('playsinline', '');
      await video.play();
      videoRef.current = video;

      const canvas = document.createElement('canvas');
      canvasRef.current = canvas;

      // 重置缓冲
      signalBufferRef.current = [];
      bpmHistoryRef.current = [];
      frameCountRef.current = 0;
      peakTimesRef.current = [];

      setPpgState('measuring');

      // 开始处理帧
      animFrameRef.current = requestAnimationFrame(processFrame);
    } catch (error) {
      const err = error as Error;
      if (err.name === 'NotAllowedError') {
        setErrorMessage('请允许摄像头权限以使用指尖脉搏检测');
      } else if (err.name === 'NotFoundError') {
        setErrorMessage('未找到可用的摄像头');
      } else {
        setErrorMessage(`启动摄像头失败: ${err.message}`);
      }
      setPpgState('error');
    }
  }, [processFrame]);

  /**
   * 停止测量
   */
  const stopMeasurement = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current = null;
    }

    canvasRef.current = null;
    signalBufferRef.current = [];
    bpmHistoryRef.current = [];
    frameCountRef.current = 0;

    setPpgState('idle');
  }, []);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return {
    // 状态
    ppgState,
    heartRateData,
    errorMessage,

    // 方法
    startMeasurement,
    stopMeasurement,
  };
}
