'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Heart } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import type { HealingSession } from '@/types';

interface AudioPlayerProps {
  session: HealingSession;
  onClose?: () => void;
}

// 五音对应的频率映射 (Hz) - 用于Web Audio API生成疗愈音
const WUYIN_FREQUENCIES: Record<string, number[]> = {
  jiao: [528, 396],  // 角 - 木
  zhi: [639, 528],   // 徵 - 火
  gong: [741, 417],  // 宫 - 土
  shang: [852, 639], // 商 - 金
  yu: [963, 741],    // 羽 - 水
};

const WUYIN_COLORS: Record<string, string> = {
  jiao: 'from-emerald-400 to-green-600',
  zhi: 'from-red-400 to-rose-600',
  gong: 'from-yellow-400 to-amber-600',
  shang: 'from-gray-300 to-slate-500',
  yu: 'from-blue-400 to-indigo-600',
};

export default function AudioPlayer({ session, onClose }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<OscillatorNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const { favorites, toggleFavorite, incrementSessions } = useAppStore();

  const isFavorited = favorites.includes(session.id);
  const gradient = WUYIN_COLORS[session.wuyin] || 'from-emerald-400 to-green-600';
  const totalSeconds = session.duration * 60;

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume * 0.3;
    }
  }, [volume]);

  function startAudio() {
    const ctx = new AudioContext();
    audioContextRef.current = ctx;

    const gainNode = ctx.createGain();
    gainNode.gain.value = volume * 0.3;
    gainNode.connect(ctx.destination);
    gainNodeRef.current = gainNode;

    const freqs = WUYIN_FREQUENCIES[session.wuyin] || [528];
    const oscillators: OscillatorNode[] = [];

    // 创建主频音
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = i === 0 ? 'sine' : 'triangle';
      osc.frequency.value = freq;
      oscGain.gain.value = i === 0 ? 0.6 : 0.3;
      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start();
      oscillators.push(osc);
    });

    // 添加泛音
    const overtone = ctx.createOscillator();
    const overtoneGain = ctx.createGain();
    overtone.type = 'sine';
    overtone.frequency.value = freqs[0] * 2;
    overtoneGain.gain.value = 0.1;
    overtone.connect(overtoneGain);
    overtoneGain.connect(gainNode);
    overtone.start();
    oscillators.push(overtone);

    // 低频脉冲（模拟节奏）
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.1; // 极慢的脉动
    lfoGain.gain.value = 0.1;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();
    oscillators.push(lfo);

    oscillatorsRef.current = oscillators;
    startTimeRef.current = Date.now();
    setIsPlaying(true);

    // 更新进度
    function updateProgress() {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setCurrentTime(elapsed);
      if (elapsed >= totalSeconds) {
        stopAudio();
        incrementSessions();
        return;
      }
      animFrameRef.current = requestAnimationFrame(updateProgress);
    }
    animFrameRef.current = requestAnimationFrame(updateProgress);
  }

  function stopAudio() {
    oscillatorsRef.current.forEach((osc) => {
      try { osc.stop(); } catch {}
    });
    oscillatorsRef.current = [];
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false);
  }

  function togglePlay() {
    if (isPlaying) {
      stopAudio();
    } else {
      setCurrentTime(0);
      startAudio();
    }
  }

  const progress = Math.min(currentTime / totalSeconds, 1);
  const remainSeconds = Math.max(totalSeconds - currentTime, 0);
  const mins = Math.floor(remainSeconds / 60);
  const secs = Math.floor(remainSeconds % 60);

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradient} p-6 text-white shadow-xl`}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 right-4 w-32 h-32 rounded-full border-2 border-white animate-pulse" />
        <div className="absolute bottom-8 left-6 w-20 h-20 rounded-full border border-white animate-pulse delay-500" />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white animate-pulse delay-300" />
      </div>

      <div className="relative z-10">
        {/* 标题行 */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold">{session.title}</h3>
            <p className="text-sm opacity-80 mt-1">{session.frequency}</p>
          </div>
          <button
            onClick={() => toggleFavorite(session.id)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition"
          >
            <Heart size={20} fill={isFavorited ? 'white' : 'none'} />
          </button>
        </div>

        {/* 描述 */}
        <p className="text-sm opacity-70 mb-6 line-clamp-2">{session.description}</p>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs opacity-60">
            <span>{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')}</span>
            <span>剩余 {mins}:{String(secs).padStart(2, '0')}</span>
          </div>
        </div>

        {/* 控制区 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 size={16} className="opacity-60" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 accent-white"
            />
          </div>
          <button
            onClick={togglePlay}
            className="w-14 h-14 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
          </button>
          <div className="w-24" />
        </div>

        {/* 功效标签 */}
        <div className="flex flex-wrap gap-2 mt-5">
          {session.benefits.map((b) => (
            <span key={b} className="text-[11px] bg-white/20 px-2.5 py-1 rounded-full">
              {b}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
