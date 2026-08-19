/**
 * 五音疗愈音频引擎 — WAV 多音色合成 + Media Session API
 *
 * 数据定义已迁移至 five-tone-data.ts，本文件仅保留：
 *   1. WAV PCM 数学合成 + Blob 缓存（支持 6 种音色 × 4 种背景音层）
 *   2. Media Session API 集成
 *
 * 音色组合：TIMBRE_OPTIONS × AMBIENT_OPTIONS = 6 × 4 = 24 种音色
 * 每种五音/频率都有 24 种音色可选，无需外部音频文件。
 *
 * 从 audio-service.ts 调用，不直接被页面组件引用。
 */

import type { WuYinKey, TimbreType, AmbientType } from './five-tone-data';
import { FIVE_TONES_MAP, TIMBRE_OPTIONS, AMBIENT_OPTIONS } from './five-tone-data';

// 重导类型，供 audio-service.ts 等消费方使用
export type { WuYinKey, TimbreType, AmbientType } from './five-tone-data';

// Blob 缓存
const blobCache = new Map<string, string>(); // key -> objectURL

// ===== 波形基函数 =====

function sineWave(phase: number): number {
  return Math.sin(2 * Math.PI * phase);
}

function triangleWave(phase: number): number {
  const p = phase % 1;
  return p < 0.25 ? 4 * p : p < 0.75 ? 2 - 4 * p : 4 * p - 4;
}

function squareWave(phase: number): number {
  const p = phase % 1;
  return p < 0.5 ? 1 : -1;
}

function sawtoothWave(phase: number): number {
  const p = phase % 1;
  return 2 * p - 1;
}

// ===== 简易伪随机噪声（确定性，用于背景音层） =====

function noiseAt(seed: number): number {
  // 简单哈希伪随机
  let x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return (x - Math.floor(x)) * 2 - 1;
}

/**
 * 多音色 WAV 合成器
 *
 * @param mainFreq   主频率
 * @param subFreq    副频率（五音副频 / 默认 1.5x）
 * @param overtoneFreq 泛音频率
 * @param duration   秒
 * @param sampleRate 采样率
 * @param timbre     音色类型
 * @param ambient    背景音层
 */
function generateWavObjectURL(
  mainFreq: number,
  subFreq: number,
  overtoneFreq: number,
  duration: number,
  sampleRate: number,
  timbre: TimbreType = 'sine',
  ambient: AmbientType = 'none',
): string {
  const totalSamples = Math.floor(duration * sampleRate);
  const fadeSamples = Math.floor(sampleRate * 0.5);
  const ambientParams = AMBIENT_OPTIONS.find(a => a.value === ambient) ?? AMBIENT_OPTIONS[0];

  const left = new Float32Array(totalSamples);
  const right = new Float32Array(totalSamples);

  for (let i = 0; i < totalSamples; i++) {
    const t = i / sampleRate;

    // 淡入淡出包络
    let envelope = 1;
    if (i < fadeSamples) envelope = i / fadeSamples;
    if (i > totalSamples - fadeSamples) envelope = (totalSamples - i) / fadeSamples;

    // LFO 脉动 (缓慢呼吸感)
    const lfo = 1 + 0.08 * Math.sin(2 * Math.PI * 0.07 * t);

    // ---- 根据音色类型合成主信号 ----
    let sample = 0;

    switch (timbre) {
      case 'sine': {
        // 纯音：正弦波主频 + 副频三角波 + 泛音正弦波
        const v1 = 0.55 * sineWave(mainFreq * t);
        const v2 = 0.20 * triangleWave(subFreq * t);
        const v3 = 0.06 * sineWave(overtoneFreq * t);
        sample = v1 + v2 + v3;
        break;
      }
      case 'triangle': {
        // 柔和：三角波主频 + 正弦副频 + 轻微泛音
        const v1 = 0.50 * triangleWave(mainFreq * t);
        const v2 = 0.22 * sineWave(subFreq * t);
        const v3 = 0.08 * triangleWave(overtoneFreq * t);
        sample = v1 + v2 + v3;
        break;
      }
      case 'square': {
        // 明亮：方波主频（低增益防刺耳）+ 正弦副频
        const v1 = 0.25 * squareWave(mainFreq * t);
        const v2 = 0.18 * sineWave(subFreq * t);
        const v3 = 0.05 * sineWave(overtoneFreq * t);
        sample = v1 + v2 + v3;
        break;
      }
      case 'sawtooth': {
        // 丰富：锯齿波主频 + 正弦副频 + 三角泛音
        const v1 = 0.22 * sawtoothWave(mainFreq * t);
        const v2 = 0.15 * sineWave(subFreq * t);
        const v3 = 0.10 * triangleWave(overtoneFreq * t);
        // 加入轻微去谐（detune）增加厚度
        const v4 = 0.08 * sawtoothWave(mainFreq * 1.003 * t);
        sample = v1 + v2 + v3 + v4;
        break;
      }
      case 'fm-bell': {
        // 颂钵：FM合成 — 调制器频率 = 主频 × 1.4，调制深度随时间衰减
        const modIndex = 3.5 * Math.exp(-t * 0.3); // 调制指数衰减
        const modulator = sineWave(mainFreq * 1.4 * t);
        const carrier = sineWave((mainFreq + modIndex * mainFreq * modulator) * t);
        const v2 = 0.12 * sineWave(subFreq * t) * Math.exp(-t * 0.2);
        const v3 = 0.04 * sineWave(overtoneFreq * t) * Math.exp(-t * 0.5);
        sample = 0.45 * carrier + v2 + v3;
        break;
      }
      case 'crystal': {
        // 水晶：双泛音正弦 + 超声微颤
        const v1 = 0.40 * sineWave(mainFreq * t);
        const v2 = 0.25 * sineWave(overtoneFreq * t);  // 泛音增强
        const v3 = 0.10 * sineWave(overtoneFreq * 2 * t); // 二次泛音
        const shimmer = 0.03 * sineWave(mainFreq * 8 * t) * sineWave(0.5 * t); // 微颤
        sample = v1 + v2 + v3 + shimmer;
        break;
      }
    }

    // LFO 包络
    sample *= envelope * lfo * 0.25;

    // ---- 叠加背景音层 ----
    if (ambientParams.noiseGain > 0) {
      // 确定性伪随机噪声
      const n = noiseAt(i) * ambientParams.noiseGain;
      // LFO 调制背景音量
      const ambientLfo = 1 + ambientParams.lfoDepth * Math.sin(2 * Math.PI * ambientParams.lfoFreq * t);
      sample += n * ambientLfo;
    }

    // 轻微立体声偏移
    left[i] = sample * (1 + 0.03 * Math.sin(2 * Math.PI * 0.15 * t));
    right[i] = sample * (1 - 0.03 * Math.sin(2 * Math.PI * 0.15 * t));
  }

  return pcmToWavObjectURL(left, right, sampleRate);
}

/** PCM → WAV Blob → Object URL */
function pcmToWavObjectURL(left: Float32Array, right: Float32Array, sampleRate: number): string {
  const numChannels = 2;
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign = numChannels * bytesPerSample;
  const dataLength = left.length * blockAlign;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  // WAV header
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // PCM
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  // 交错写入左右声道
  let offset = 44;
  for (let i = 0; i < left.length; i++) {
    const l = Math.max(-1, Math.min(1, left[i]));
    const r = Math.max(-1, Math.min(1, right[i]));
    view.setInt16(offset, l * 0x7FFF, true); offset += 2;
    view.setInt16(offset, r * 0x7FFF, true); offset += 2;
  }

  const blob = new Blob([buffer], { type: 'audio/wav' });
  return URL.createObjectURL(blob);
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}

/**
 * 获取五音的音频 Object URL（带缓存，支持音色 × 背景音层）
 */
export function getWuyinAudioURL(key: WuYinKey, timbre: TimbreType = 'sine', ambient: AmbientType = 'none'): string {
  const cacheKey = `${key}_${timbre}_${ambient}`;
  if (blobCache.has(cacheKey)) return blobCache.get(cacheKey)!;
  const tone = FIVE_TONES_MAP[key];
  const url = generateWavObjectURL(tone.mainFreq, tone.subFreq, tone.overtoneFreq, 8, 44100, timbre, ambient);
  blobCache.set(cacheKey, url);
  return url;
}

/**
 * 获取频率音频 Object URL（脉轮/颂钵，支持音色 × 背景音层）
 */
export function getFreqAudioURL(hz: number, timbre: TimbreType = 'sine', ambient: AmbientType = 'none'): string {
  const cacheKey = `freq_${hz}_${timbre}_${ambient}`;
  if (blobCache.has(cacheKey)) return blobCache.get(cacheKey)!;
  const url = generateWavObjectURL(hz, hz * 1.5, hz * 2, 8, 44100, timbre, ambient);
  blobCache.set(cacheKey, url);
  return url;
}

/**
 * 设置 Media Session（锁屏/通知栏控制）
 */
export function setupMediaSession(info: {
  title: string;
  artist?: string;
  artwork?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onStop?: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}) {
  if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;

  navigator.mediaSession.metadata = new MediaMetadata({
    title: info.title,
    artist: info.artist || '知音',
    album: '知音 疗愈',
    artwork: info.artwork
      ? [{ src: info.artwork, sizes: '512x512', type: 'image/png' }]
      : [{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }],
  });

  navigator.mediaSession.setActionHandler('play', () => info.onPlay?.());
  navigator.mediaSession.setActionHandler('pause', () => info.onPause?.());
  navigator.mediaSession.setActionHandler('stop', () => info.onStop?.());
  navigator.mediaSession.setActionHandler('nexttrack', () => info.onNext?.());
  navigator.mediaSession.setActionHandler('previoustrack', () => info.onPrev?.());
  navigator.mediaSession.setActionHandler('seekto', null);
}

/**
 * 清理缓存的 Object URL
 */
export function revokeAllCache() {
  blobCache.forEach(url => URL.revokeObjectURL(url));
  blobCache.clear();
}