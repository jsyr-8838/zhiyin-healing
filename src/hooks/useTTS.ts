'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * useTTS — Edge TTS 增强版
 *
 * 优先 Edge TTS（高质量神经网络语音），单次失败仅当次回退到浏览器 speechSynthesis，
 * 下次 speak 仍尝试 Edge TTS，不会永久关闭。
 *
 * 音色：
 *   女声：zh-CN-XiaoxiaoNeural（晓晓）
 *   男声：zh-CN-YunjianNeural（云健·沉稳厚重·感染力强）
 *   男声默认 pitch=0.7（低沉磁性），避免偏高女声感
 */
export type VoiceGender = 'female' | 'male';
export type VoiceSpeed = 'slow' | 'normal' | 'fast';

interface UseTTSOptions {
  defaultGender?: VoiceGender;
  defaultSpeed?: VoiceSpeed;
  pitch?: number;
  volume?: number;
  lang?: string;
  /** Override the Edge TTS voice name (e.g. 'zh-CN-YunjianNeural') */
  voiceId?: string;
}

interface UseTTSReturn {
  speak: (text: string, rate?: number, pitch?: number) => void;
  stop: () => void;
  isSpeaking: () => boolean;
  unlockAudio: () => void;
  gender: VoiceGender;
  setGender: (g: VoiceGender) => void;
  speed: VoiceSpeed;
  setSpeed: (s: VoiceSpeed) => void;
  voicesReady: boolean;
  usingEdgeTTS: boolean;
}

const EDGE_VOICE_MAP: Record<VoiceGender, string> = {
  female: 'zh-CN-XiaoxiaoNeural',
  male: 'zh-CN-YunjianNeural',
};

const FEMALE_KEYWORDS = ['yaoyao', 'huihui', 'xiaoxiao', 'xiaoyi', 'female'];
const MALE_KEYWORDS = ['yunjian', 'yunxi', 'yunyang', 'kangkang', 'male'];

// 男声默认音高：0.7 = 低沉磁性，避免偏高女声感
const DEFAULT_PITCH_MALE = 0.7;

// 正常语速：1.0 = 自然人声速度
const SPEED_MAP: Record<VoiceSpeed, number> = { slow: 0.5, normal: 1.0, fast: 1.5 };

// 极短静音 WAV（用于解锁手机 Audio 自动播放限制）
const SILENCE_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

function clampRate(rate: number): number {
  return Math.max(0.25, Math.min(4.0, rate));
}

export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const {
    defaultGender = 'female',
    defaultSpeed = 'slow',
    pitch: defaultPitch,
    volume = 0.9,
    lang = 'zh-CN',
    voiceId,
  } = options;

  // 男声默认 pitch=0.7（低沉磁性），女声默认 0.85
  const effectiveDefaultPitch = defaultPitch ?? (defaultGender === 'male' ? DEFAULT_PITCH_MALE : 0.85);

  const [gender, setGenderState] = useState<VoiceGender>(defaultGender);
  const [speed, setSpeedState] = useState<VoiceSpeed>(defaultSpeed);
  const [voicesReady, setVoicesReady] = useState(false);
  const [usingEdgeTTS, setUsingEdgeTTS] = useState(true);

  // 用 ref 保存所有可变值，避免 useCallback 依赖循环
  const stateRef = useRef({ gender, speed, usingEdgeTTS, effectiveDefaultPitch, volume, lang, voiceId });
  stateRef.current = { gender, speed, usingEdgeTTS, effectiveDefaultPitch, volume, lang, voiceId };

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const browserVoicesRef = useRef<SpeechSynthesisVoice[]>([]);
  const speakingRef = useRef(false);
  const audioUnlockedRef = useRef(false);

  // 递增 speakId：每次新 speak 自增，旧 speak 的异步回调检查 id 是否过期
  const speakIdRef = useRef(0);

  // 初始化 Audio
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = options.volume ?? 0.9;
    }
    return () => {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ''; }
    };
  }, []);

  // 加载浏览器语音列表
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setVoicesReady(true);
      return;
    }
    const loadVoices = () => {
      const v = speechSynthesis.getVoices();
      if (v.length > 0) { browserVoicesRef.current = v; setVoicesReady(true); }
    };
    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    const timer = setTimeout(loadVoices, 300);
    return () => { speechSynthesis.removeEventListener('voiceschanged', loadVoices); clearTimeout(timer); };
  }, []);

  // ===== 音频解锁（修复手机端无法播放问题） =====
  // 手机浏览器要求 audio.play() 必须在用户手势中调用至少一次。
  // speak() 内部有异步 fetch，等到 play() 时已脱离手势上下文，被自动播放策略拦截。
  // 解决：在用户首次交互时用静音音频解锁 Audio 元素，之后异步播放不再被拦截。
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current || !audioRef.current) return;
    audioUnlockedRef.current = true; // 立即标记，避免竞态
    const audio = audioRef.current;
    const prevVolume = audio.volume;
    audio.volume = 0;
    audio.src = SILENCE_WAV;
    audio.play().then(() => {
      audio.pause();
      audio.removeAttribute('src');
      audio.volume = prevVolume;
    }).catch(() => {
      audio.volume = prevVolume;
    });
    // 同时解锁 speechSynthesis（部分手机浏览器也需要）
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        const u = new SpeechSynthesisUtterance(' ');
        u.volume = 0;
        u.rate = 10;
        speechSynthesis.speak(u);
        speechSynthesis.cancel();
      } catch {}
    }
  }, []);

  // 全局监听首次用户交互，自动解锁
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handler = () => unlockAudio();
    const opts = { once: true, passive: true } as AddEventListenerOptions;
    document.addEventListener('click', handler, opts);
    document.addEventListener('touchend', handler, opts);
    return () => {
      document.removeEventListener('click', handler);
      document.removeEventListener('touchend', handler);
    };
  }, [unlockAudio]);

  // 停止所有播放
  const stop = useCallback(() => {
    speakIdRef.current++; // 让所有进行中的异步回调失效

    // 停止 Edge TTS Audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
      audioRef.current.load(); // 释放资源
    }

    // 停止浏览器 speechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    speakingRef.current = false;
  }, []);

  // 浏览器 SpeechSynthesis 回退
  const speakBrowser = useCallback((text: string, rate: number, g: VoiceGender) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    speechSynthesis.cancel();

    const s = stateRef.current;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = s.lang;
    u.rate = rate;
    // 男声使用低沉 pitch，女声使用默认偏高 pitch
    u.pitch = g === 'male' ? DEFAULT_PITCH_MALE : s.effectiveDefaultPitch;
    u.volume = s.volume;

    const voices = browserVoicesRef.current;
    const keywords = g === 'male' ? MALE_KEYWORDS : FEMALE_KEYWORDS;
    for (const kw of keywords) {
      const found = voices.find(v => v.lang.startsWith('zh') && v.name.toLowerCase().includes(kw));
      if (found) { u.voice = found; break; }
    }
    if (!u.voice) {
      const zh = voices.find(v => v.lang.startsWith('zh'));
      if (zh) u.voice = zh;
    }

    u.onend = () => { speakingRef.current = false; };
    u.onerror = () => { speakingRef.current = false; };
    speakingRef.current = true;
    speechSynthesis.speak(u);
  }, []);

  // 对外 speak — 唯一入口
  const speak = useCallback((text: string, rate?: number, pitchOverride?: number) => {
    const s = stateRef.current;
    const effectiveRate = rate ?? SPEED_MAP[s.speed];
    const voiceName = s.voiceId || EDGE_VOICE_MAP[s.gender];
    const g = s.gender;
    const effectivePitch = pitchOverride ?? (g === 'male' ? DEFAULT_PITCH_MALE : s.effectiveDefaultPitch);

    // 每次新 speak 都使旧异步回调失效
    const myId = ++speakIdRef.current;

    // 在用户手势上下文中解锁音频（speak 通常由按钮点击触发）
    unlockAudio();

    // 先停止之前的所有播放（若刚解锁则静音播放正在进行，跳过暂停避免打断解锁）
    if (audioUnlockedRef.current && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.removeAttribute('src');
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    speakingRef.current = true;

    // 异步请求 Edge TTS
    (async () => {
      try {
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, voice: voiceName, speed: clampRate(effectiveRate), pitch: effectivePitch }),
        });

        // 检查是否已被更新的 speak 取代
        if (speakIdRef.current !== myId) return;

        const ct = response.headers.get('content-type') ?? '';
        if (!response.ok || ct.includes('application/json')) {
          // Edge TTS 本次失败，仅当次回退到浏览器语音
          speakBrowser(text, effectiveRate, g);
          return;
        }

        const audioBlob = await response.blob();
        if (speakIdRef.current !== myId) return;

        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = audioRef.current!;
        audio.src = audioUrl;
        // 确保音量恢复正常（解锁时可能设为 0）
        audio.volume = s.volume;

        audio.onended = () => {
          if (speakIdRef.current === myId) speakingRef.current = false;
          URL.revokeObjectURL(audioUrl);
        };
        audio.onerror = () => {
          if (speakIdRef.current === myId) speakingRef.current = false;
          URL.revokeObjectURL(audioUrl);
        };

        try {
          await audio.play();
        } catch (playErr: unknown) {
          // play() 被中断（新的 speak 到来）— 正常，不需要 fallback
          if (playErr instanceof DOMException && playErr.name === 'AbortError') return;
          // 其他播放错误（如手机自动播放限制） → fallback 到浏览器语音
          if (speakIdRef.current === myId) {
            speakBrowser(text, effectiveRate, g);
          }
        }
      } catch (err) {
        // fetch 失败 → 仅当次回退
        if (speakIdRef.current === myId) {
          speakBrowser(text, effectiveRate, g);
        }
      }
    })();
  }, [speakBrowser, unlockAudio]);

  const isSpeaking = useCallback((): boolean => {
    if (typeof window === 'undefined') return false;
    if (audioRef.current && !audioRef.current.paused) return true;
    if ('speechSynthesis' in window && speechSynthesis.speaking) return true;
    return speakingRef.current;
  }, []);

  const setGender = useCallback((g: VoiceGender) => {
    setGenderState(g);
    // 切换音色时确保 Edge TTS 开启
    setUsingEdgeTTS(true);
  }, []);

  const setSpeed = useCallback((s: VoiceSpeed) => {
    setSpeedState(s);
  }, []);

  return { speak, stop, isSpeaking, unlockAudio, gender, setGender, speed, setSpeed, voicesReady, usingEdgeTTS };
}

export default useTTS;
