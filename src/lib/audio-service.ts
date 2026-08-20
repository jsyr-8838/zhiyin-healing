'use client';

/**
 * 统一音频服务 — 全局 Zustand Store
 *
 * 架构设计（借鉴 QListen PlayerContext 模式，用 Zustand 重写）：
 *   - 单一 HTML5 Audio 元素作为主播放引擎（支持后台播放 + Media Session API）
 *   - 通过 createMediaElementSource() 接入 Web Audio API 效果链
 *     （双耳节拍 + 波形调制 + AnalyserNode 可视化）
 *   - 播放列表 / 疗愈方案队列（顺序/单曲循环/方案自动流转）
 *   - Zustand persist 持久化（音量、最后音调、收藏方案）
 *   - 淡入淡出（5秒线性渐变，替代瞬间卡断）
 *   - Media Session API（锁屏/通知栏控制）
 *
 * 取代原有的三套独立系统：
 *   系统A: wuyin/singing-bowl 的 12 useRef + Web Audio API 实时合成
 *   系统B: ClassicsReader 的 new Audio() + loop
 *   系统C: audio-engine.ts 的 WAV Blob 合成（零引用）
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WuYinKey, BinauralValue, ModulationValue } from './five-tone-data';
import { FIVE_TONES_MAP, BINAURAL_MODES, MODULATIONS, BOWL_FREQUENCIES } from './five-tone-data';
import { getFreqAudioURL, setupMediaSession, revokeAllCache } from './audio-engine';
import { getDefaultTrackForTone, getTrackById, getBowlTrackById } from './healing-music-catalog';
import type { HealingTrack, BowlTrack } from './healing-music-catalog';
import { SyntheticAnalyser, type TrackFrequencies } from './synthetic-analyser';

// ===== 类型 =====

export type AudioMode = 'wuyin' | 'singing-bowl' | 'reader';
export type PlayMode = 'sequence' | 'loop' | 'prescription'; // 顺序/单曲循环/方案自动流转

export interface AudioTrack {
  /** 唯一 ID */
  id: string;
  /** 显示名称 */
  title: string;
  /** 副标题/描述 */
  subtitle?: string;
  /** 音频源 — MP3 URL 或 blob object URL */
  src: string;
  /** 播放模式 */
  mode: AudioMode;
  /** 五音 key（如果是五音模式） */
  toneKey?: WuYinKey;
  /** 颂钵频率（如果是颂钵模式） */
  bowlFreq?: number;
  /** 主题色 */
  color: string;
  /** 封面图 URL */
  artwork?: string;
  /** 乐器类型（来自真实曲目目录） */
  instrument?: string;
  /** 关联的目录曲目 ID */
  catalogTrackId?: string;
}

export interface PrescriptionItem {
  trackId: string;
  duration: number; // 秒
}

export interface Prescription {
  id: string;
  name: string;
  items: PrescriptionItem[];
  color: string;
}

interface AudioServiceState {
  // ===== 播放状态 =====
  isPlaying: boolean;
  currentTrack: AudioTrack | null;
  currentTime: number;
  duration: number;
  volume: number;         // 0~1
  isMuted: boolean;

  // ===== 音频参数 =====
  binauralBeat: BinauralValue;   // 双耳节拍 Hz
  modulation: ModulationValue;    // 波形调制模式

  // ===== 播放列表 =====
  queue: AudioTrack[];
  queueIndex: number;
  playMode: PlayMode;

  // ===== 疗愈方案 =====
  activePrescription: Prescription | null;
  prescriptionIndex: number;
  prescriptions: Prescription[];

  // ===== 计时器 =====
  timerMinutes: number;          // 设置的计时（分钟）
  timerRemaining: number;        // 剩余秒数
  isTimerRunning: boolean;

  // ===== 持久化偏好 =====
  lastToneKey: WuYinKey | null;
  lastMode: AudioMode;
  favoritePrescriptions: string[];

  // ===== 操作 =====
  play: (track: AudioTrack) => void;
  pause: () => void;
  togglePlay: () => void;
  stop: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setBinauralBeat: (v: BinauralValue) => void;
  setModulation: (v: ModulationValue) => void;
  next: () => void;
  prev: () => void;
  setQueue: (tracks: AudioTrack[], startIndex?: number) => void;
  setPlayMode: (m: PlayMode) => void;
  startPrescription: (p: Prescription) => void;
  stopPrescription: () => void;
  setTimer: (minutes: number) => void;
  startTimer: () => void;
  stopTimer: () => void;
  startPrescriptionTimer: () => void;
  setCurrentTime: (t: number) => void;
}

// ===== 内部单例 =====

let audioElement: HTMLAudioElement | null = null;
let audioContext: AudioContext | null = null;
let mediaElementSource: MediaElementAudioSourceNode | null = null;
let analyserNode: AnalyserNode | null = null;
let syntheticAnalyser: SyntheticAnalyser | null = null;
let gainNode: GainNode | null = null;
let mergerNode: ChannelMergerNode | null = null;
let binauralOscLeft: OscillatorNode | null = null;
let binauralOscRight: OscillatorNode | null = null;
let lfoNode: OscillatorNode | null = null;
let lfoGain: GainNode | null = null;
let fadeInterval: ReturnType<typeof setInterval> | null = null;
let timerInterval: ReturnType<typeof setInterval> | null = null;
let prescriptionTimerInterval: ReturnType<typeof setInterval> | null = null;

function getAudioElement(): HTMLAudioElement {
  if (!audioElement) {
    audioElement = new Audio();
    // 不设置 crossOrigin — 跨域音频无 CORS 响应头时，
    // createMediaElementSource 会判定音频被"污染"导致静音。
    // 直接用 <audio>.play() 播放，不经过 Web Audio 效果链。
    audioElement.loop = true; // 五音/颂钵无限循环
    audioElement.preload = 'auto';
  }
  return audioElement;
}

/**
 * 确保 AudioContext 初始化（懒加载）
 *
 * 架构说明：
 *   - 音频通过 <audio> 元素直接播放（避免跨域 CORS 静音问题）
 *   - AudioContext 用于双耳节拍振荡器和 LFO 调制（纯合成，不依赖音频源）
 *   - mergerNode 连接到 audioContext.destination 使双耳节拍可听
 *   - SyntheticAnalyser 基于曲目频率生成逼真频谱数据，替代 AnalyserNode
 *   - getAnalyserNode() 返回 SyntheticAnalyser 作为 AnalyserNode 类型（鸭子类型）
 */
function ensureAudioContext(_el: HTMLAudioElement): { analyser: AnalyserNode | null; gain: GainNode | null } {
  if (!audioContext) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    audioContext = new Ctor();
  }
  if (audioContext.state === 'suspended') audioContext.resume();

  // 创建 mergerNode（双耳节拍需要：左右声道合并后输出）
  if (!mergerNode) {
    mergerNode = audioContext.createChannelMerger(2);
    mergerNode.connect(audioContext.destination);
  }

  // 创建 gainNode（LFO 调制目标）
  if (!gainNode) {
    gainNode = audioContext.createGain();
    gainNode.gain.value = 1;
  }

  // 初始化 SyntheticAnalyser（替代 AnalyserNode，提供逼真频谱数据）
  if (!syntheticAnalyser) {
    syntheticAnalyser = new SyntheticAnalyser();
  }

  // analyserNode 指向 syntheticAnalyser（鸭子类型兼容 AnalyserNode）
  if (!analyserNode) {
    analyserNode = syntheticAnalyser as unknown as AnalyserNode;
  }

  return { analyser: analyserNode, gain: gainNode };
}

/** 设置双耳节拍 (binaural beat) */
function setupBinaural(beatHz: BinauralValue) {
  // 清理旧的
  try { binauralOscLeft?.stop(); } catch {}
  try { binauralOscRight?.stop(); } catch {}
  binauralOscLeft = null;
  binauralOscRight = null;

  if (!audioContext || !mergerNode || beatHz === 0) return;

  const ctx = audioContext;
  // 左声道: 基准频率 200Hz
  const oscL = ctx.createOscillator();
  oscL.type = 'sine';
  oscL.frequency.value = 200;
  // 右声道: 基准 + beatHz
  const oscR = ctx.createOscillator();
  oscR.type = 'sine';
  oscR.frequency.value = 200 + beatHz;

  // 分离通道
  const splitterL = ctx.createGain();
  splitterL.channelCount = 1;
  splitterL.channelCountMode = 'explicit';
  const splitterR = ctx.createGain();
  splitterR.channelCount = 1;
  splitterR.channelCountMode = 'explicit';

  oscL.connect(splitterL);
  oscR.connect(splitterR);
  splitterL.connect(mergerNode, 0, 0);
  splitterR.connect(mergerNode, 0, 1);

  oscL.start();
  oscR.start();

  binauralOscLeft = oscL;
  binauralOscRight = oscR;
}

/** 设置 LFO 调制 */
function setupLFO(modValue: ModulationValue) {
  try { lfoNode?.stop(); } catch {}
  try { lfoGain?.disconnect(); } catch {}
  lfoNode = null;
  lfoGain = null;

  if (!audioContext || !gainNode || modValue === 'none') return;

  const mod = MODULATIONS.find(m => m.value === modValue);
  if (!mod) return;

  const ctx = audioContext;
  const lfo = ctx.createOscillator();
  const lfoG = ctx.createGain();

  // FM (频率调制) — 通过 LFO 调制 gain
  lfo.frequency.value = mod.ampRate; // 用 ampRate 作为 LFO 频率
  lfoG.gain.value = mod.amplitudeDepth;

  lfo.connect(lfoG);
  lfoG.connect(gainNode.gain);
  lfo.start();

  lfoNode = lfo;
  lfoGain = lfoG;
}

/**
 * 淡入淡出 — 使用 el.volume 控制（不依赖 Web Audio gainNode）
 * targetGain: 0~1，直接映射到 audio.volume
 */
function fadeAudio(targetGain: number, durationSec: number = 2): Promise<void> {
  return new Promise((resolve) => {
    const el = audioElement;
    if (!el) { resolve(); return; }

    if (fadeInterval) {
      clearInterval(fadeInterval);
      fadeInterval = null;
    }

    const startVol = el.volume;
    const startTime = performance.now();

    fadeInterval = setInterval(() => {
      const elapsed = (performance.now() - startTime) / 1000;
      const ratio = Math.min(1, elapsed / durationSec);
      el.volume = startVol + (targetGain - startVol) * ratio;
      if (ratio >= 1) {
        clearInterval(fadeInterval!);
        fadeInterval = null;
        resolve();
      }
    }, 50);
  });
}

// ===== Track 构建工厂 =====

/**
 * 创建五音播放曲目
 *
 * 优先级：
 *   1. catalogTrackId 指定的目录曲目（真实乐器录音）
 *   2. variantSrc 指定的自定义音频路径
 *   3. tone.mp3Path 默认五音 MP3
 *   4. getWuyinAudioURL() 合成波形兜底（仅作最后手段）
 */
export function createWuyinTrack(key: WuYinKey, variantSrc?: string, catalogTrackId?: string): AudioTrack {
  const tone = FIVE_TONES_MAP[key];
  let track: AudioTrack;

  // 1) 目录曲目优先
  if (catalogTrackId) {
    const catalogTrack = getTrackById(catalogTrackId);
    if (catalogTrack) {
      track = {
        id: catalogTrack.id,
        title: `${catalogTrack.title} — ${catalogTrack.subtitle}`,
        subtitle: `${tone.wuxing} · ${catalogTrack.instrument}`,
        src: catalogTrack.src,
        mode: 'wuyin',
        toneKey: key,
        color: catalogTrack.color,
        artwork: '/icon-512.png',
        instrument: catalogTrack.instrument,
        catalogTrackId: catalogTrack.id,
      };
      return track;
    }
  }

  // 2/3) 自定义路径或默认 MP3
  const src = variantSrc || tone.mp3Path;
  track = {
    id: `wuyin-${key}`,
    title: `${tone.char} · ${tone.element} — ${tone.desc.split('·')[0]}`,
    subtitle: tone.wuxing,
    src,
    mode: 'wuyin',
    toneKey: key,
    color: tone.color,
    artwork: '/icon-512.png',
  };
  return track;
}

/**
 * 创建颂钵播放曲目
 *
 * 优先级：
 *   1. catalogTrackId 指定的目录曲目（真实颂钵录音）
 *   2. variantSrc 指定的自定义音频路径
 *   3. getFreqAudioURL() 合成波形兜底
 */
export function createBowlTrack(freqValue: number, variantSrc?: string, catalogTrackId?: string): AudioTrack {
  const bowl = BOWL_FREQUENCIES.find(b => b.value === freqValue);
  let track: AudioTrack;

  // 1) 目录曲目优先
  if (catalogTrackId) {
    const catalogTrack = getBowlTrackById(catalogTrackId);
    if (catalogTrack) {
      track = {
        id: catalogTrack.id,
        title: `${catalogTrack.title} — ${catalogTrack.subtitle}`,
        subtitle: `${catalogTrack.bowlType} · ${freqValue}Hz`,
        src: catalogTrack.src,
        mode: 'singing-bowl',
        bowlFreq: freqValue,
        color: catalogTrack.color,
        artwork: '/icon-512.png',
        instrument: catalogTrack.bowlType,
        catalogTrackId: catalogTrack.id,
      };
      return track;
    }
  }

  // 2/3) 自定义路径或合成兜底
  const src = variantSrc || getFreqAudioURL(freqValue);
  track = {
    id: `bowl-${freqValue}`,
    title: bowl ? `${bowl.name}` : `${freqValue}Hz 颂钵`,
    subtitle: bowl ? `${bowl.element}·${bowl.organ}` : '',
    src,
    mode: 'singing-bowl',
    bowlFreq: freqValue,
    color: bowl?.color ?? '#2C3E50',
    artwork: '/icon-512.png',
  };
  return track;
}

// ===== 曲目频率提取（供 SyntheticAnalyser 使用） =====

/**
 * 从 AudioTrack 提取频率信息，驱动合成频谱可视化。
 * 五音曲目：使用对应五音的主频/副频/泛音。
 * 颂钵曲目：使用频率值生成主频/副频/泛音。
 * 其他：使用默认 432Hz。
 */
function getTrackFrequencies(track: AudioTrack): TrackFrequencies {
  if (track.toneKey) {
    const tone = FIVE_TONES_MAP[track.toneKey];
    if (tone) {
      return { mainFreq: tone.mainFreq, subFreq: tone.subFreq, overtoneFreq: tone.overtoneFreq };
    }
  }
  if (track.bowlFreq) {
    return { mainFreq: track.bowlFreq, subFreq: track.bowlFreq * 1.5, overtoneFreq: track.bowlFreq * 2 };
  }
  return { mainFreq: 432, subFreq: 528, overtoneFreq: 852 };
}

// ===== Store =====

export const useAudioService = create<AudioServiceState>()(
  persist(
    (set, get) => ({
      // 播放状态
      isPlaying: false,
      currentTrack: null,
      currentTime: 0,
      duration: 0,
      volume: 0.7,
      isMuted: false,

      // 音频参数
      binauralBeat: 0,
      modulation: 'none',

      // 播放列表
      queue: [],
      queueIndex: -1,
      playMode: 'loop',

      // 疗愈方案
      activePrescription: null,
      prescriptionIndex: 0,
      prescriptions: [],

      // 计时器
      timerMinutes: 15,
      timerRemaining: 0,
      isTimerRunning: false,

      // 持久化
      lastToneKey: null,
      lastMode: 'wuyin',
      favoritePrescriptions: [],

      // ===== 操作 =====

      play: (track: AudioTrack) => {
        const el = getAudioElement();
        ensureAudioContext(el); // 初始化 AudioContext（用于双耳节拍/LFO/可视化）

        // 更新 SyntheticAnalyser 的曲目频率（驱动可视化频谱）
        if (syntheticAnalyser) {
          const freqs = getTrackFrequencies(track);
          syntheticAnalyser.setTrack(freqs);
          syntheticAnalyser.setVolume(get().isMuted ? 0 : get().volume);
        }

  // 同一首歌且当前暂停 → resume
  if (get().currentTrack?.id === track.id && get().isPlaying === false) {
    syntheticAnalyser?.setPlaying(true);
    el.play().catch(() => {});
    set({ isPlaying: true });
    return;
  }

  // ===== 切换歌曲 =====
  // [FIX] 先清理旧 fade、暂停当前播放，避免 src 竞态导致 play() reject
  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }
  el.pause();

  el.src = track.src;
  el.load(); // [FIX] 显式触发加载
  const targetVol = get().isMuted ? 0 : get().volume;
  el.volume = 0; // 从0开始淡入
  el.loop = true; // 五音/颂钵循环播放

  // [FIX] play() 加 catch，失败时恢复音量并重试
  el.play().then(() => {
    fadeAudio(targetVol, 2); // 淡入到目标音量
  }).catch((err) => {
    console.warn('[audio-service] play() rejected, retrying:', err);
    el.volume = targetVol;
    el.play().then(() => fadeAudio(targetVol, 1)).catch(() => {
      el.volume = targetVol;
    });
  });
        syntheticAnalyser?.setPlaying(true);

        set({
          isPlaying: true,
          currentTrack: track,
          lastToneKey: track.toneKey ?? null,
          lastMode: track.mode,
        });

        // Media Session（含 next/prev）
        setupMediaSession({
          title: track.title,
          artist: track.subtitle || '知音',
          artwork: track.artwork,
          onPlay: () => get().play(track),
          onPause: () => get().pause(),
          onStop: () => get().stop(),
          onNext: () => get().next(),
          onPrev: () => get().prev(),
        });

        // 如果处于方案模式，启动子计时器
        if (get().playMode === 'prescription' && get().activePrescription) {
          get().startPrescriptionTimer();
        }
      },

      pause: () => {
        const state = get();
        if (!state.isPlaying) return;
        const el = getAudioElement();

        syntheticAnalyser?.setPlaying(false);
    // 淡出
    fadeAudio(0, 1.5).then(() => {
      el.pause();
      set({ isPlaying: false });
    }).catch(() => {
      el.pause();
      set({ isPlaying: false });
    });
      },

      togglePlay: () => {
        const state = get();
        if (state.isPlaying) {
          get().pause();
        } else if (state.currentTrack) {
          get().play(state.currentTrack);
        }
      },

      stop: () => {
        const el = getAudioElement();
        syntheticAnalyser?.setPlaying(false);
        // 清理方案计时器
        if (prescriptionTimerInterval) {
          clearInterval(prescriptionTimerInterval);
          prescriptionTimerInterval = null;
        }
    fadeAudio(0, 1).then(() => {
      el.pause();
      el.currentTime = 0;
      set({ isPlaying: false, currentTime: 0, isTimerRunning: false });
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }).catch(() => {
      el.pause();
      el.currentTime = 0;
      set({ isPlaying: false, currentTime: 0, isTimerRunning: false });
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    });
      },

      setVolume: (v: number) => {
        const clamped = Math.max(0, Math.min(1, v));
        const el = getAudioElement();
        if (!get().isMuted) {
          el.volume = clamped;
        }
        syntheticAnalyser?.setVolume(clamped);
        set({ volume: clamped });
      },

      toggleMute: () => {
        const state = get();
        const el = getAudioElement();
        if (state.isMuted) {
          el.volume = state.volume;
          syntheticAnalyser?.setVolume(state.volume);
        } else {
          el.volume = 0;
          syntheticAnalyser?.setVolume(0);
        }
        set({ isMuted: !state.isMuted });
      },

      setBinauralBeat: (v: BinauralValue) => {
        set({ binauralBeat: v });
        setupBinaural(v);
      },

      setModulation: (v: ModulationValue) => {
        set({ modulation: v });
        setupLFO(v);
      },

      next: () => {
        const state = get();
        if (state.queue.length === 0) return;
        const nextIdx = (state.queueIndex + 1) % state.queue.length;
        set({ queueIndex: nextIdx });
        get().play(state.queue[nextIdx]);
      },

      prev: () => {
        const state = get();
        if (state.queue.length === 0) return;
        const prevIdx = (state.queueIndex - 1 + state.queue.length) % state.queue.length;
        set({ queueIndex: prevIdx });
        get().play(state.queue[prevIdx]);
      },

      setQueue: (tracks: AudioTrack[], startIndex = 0) => {
        set({ queue: tracks, queueIndex: startIndex });
        if (tracks.length > 0) {
          get().play(tracks[startIndex]);
        }
      },

      setPlayMode: (m: PlayMode) => {
        set({ playMode: m });
      },

      startPrescription: (p: Prescription) => {
        set({ activePrescription: p, prescriptionIndex: 0, playMode: 'prescription' });
        // 直接播放第一个 track
        if (p.items.length > 0 && get().currentTrack?.id !== p.items[0].trackId) {
          const firstTrack = get().queue.find(t => t.id === p.items[0].trackId);
          if (firstTrack) get().play(firstTrack);
        }
      },

      stopPrescription: () => {
        if (prescriptionTimerInterval) {
          clearInterval(prescriptionTimerInterval);
          prescriptionTimerInterval = null;
        }
        set({ activePrescription: null, prescriptionIndex: 0, playMode: 'loop' });
        get().stop();
      },

      setTimer: (minutes: number) => {
        set({ timerMinutes: minutes, timerRemaining: minutes * 60 });
      },

      startTimer: () => {
        const state = get();
        if (state.isTimerRunning) return;
        const remaining = state.timerRemaining || state.timerMinutes * 60;

        set({ isTimerRunning: true, timerRemaining: remaining });

        if (timerInterval) clearInterval(timerInterval);
        timerInterval = setInterval(() => {
          const s = get();
          const newRemaining = s.timerRemaining - 1;
          if (newRemaining <= 0) {
            clearInterval(timerInterval!);
            timerInterval = null;
            get().stop();
            set({ timerRemaining: 0, isTimerRunning: false });
          } else {
            set({ timerRemaining: newRemaining });
          }
        }, 1000);
      },

      stopTimer: () => {
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        set({ isTimerRunning: false });
      },

      setCurrentTime: (t: number) => {
        set({ currentTime: t });
      },

      /** 方案自动流转：当前曲目播放到指定时长后，淡出并切换下一首 */
      startPrescriptionTimer: () => {
        const state = get();
        const rx = state.activePrescription;
        if (!rx || state.prescriptionIndex >= rx.items.length) return;

        const itemDuration = rx.items[state.prescriptionIndex].duration; // 秒
        if (itemDuration <= 0) return; // 0 = 不限时，不自动流转

        if (prescriptionTimerInterval) clearInterval(prescriptionTimerInterval);
        let remaining = itemDuration;

        prescriptionTimerInterval = setInterval(() => {
          remaining--;
          const s = get();
          if (remaining <= 0 || !s.isPlaying || !s.activePrescription) {
            if (prescriptionTimerInterval) {
              clearInterval(prescriptionTimerInterval);
              prescriptionTimerInterval = null;
            }
            // 流转到下一首
            if (s.activePrescription) {
              const nextIdx = s.prescriptionIndex + 1;
              if (nextIdx < s.activePrescription.items.length) {
                set({ prescriptionIndex: nextIdx });
                const nextTrack = s.queue.find(t => t.id === s.activePrescription!.items[nextIdx].trackId);
                if (nextTrack) {
                  get().play(nextTrack); // play() 内部会再次调用 startPrescriptionTimer
                }
              } else {
                // 方案结束
                get().stopPrescription();
              }
            }
          }
        }, 1000);
      },
    }),
    {
      name: 'heytcm-audio',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        binauralBeat: state.binauralBeat,
        modulation: state.modulation,
        lastToneKey: state.lastToneKey,
        lastMode: state.lastMode,
        timerMinutes: state.timerMinutes,
        playMode: state.playMode,
        favoritePrescriptions: state.favoritePrescriptions,
      }),
    }
  )
);

// ===== 获取 AnalyserNode（供 Canvas 可视化使用） =====

export function getAnalyserNode(): AnalyserNode | null {
  if (analyserNode) return analyserNode;
  // 触发初始化
  if (audioElement) {
    const { analyser } = ensureAudioContext(audioElement);
    return analyser;
  }
  return null;
}

// ===== 清理 =====

export function cleanupAudioService() {
  try { binauralOscLeft?.stop(); } catch {}
  try { binauralOscRight?.stop(); } catch {}
  try { lfoNode?.stop(); } catch {}
  try { audioContext?.close(); } catch {}
  try { audioElement?.pause(); } catch {}
  if (timerInterval) clearInterval(timerInterval);
  if (prescriptionTimerInterval) clearInterval(prescriptionTimerInterval);
  if (fadeInterval) clearInterval(fadeInterval);
  revokeAllCache();

  audioElement = null;
  audioContext = null;
  mediaElementSource = null;
  analyserNode = null;
  syntheticAnalyser = null;
  gainNode = null;
  mergerNode = null;
  binauralOscLeft = null;
  binauralOscRight = null;
  lfoNode = null;
  lfoGain = null;
  timerInterval = null;
  fadeInterval = null;
}
