'use client';

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import PageContainer from '@/components/layout/PageContainer';
import HealingCanvas, { type HealingCanvasHandle, HEALING_PRESET_BOWL } from '@/components/healing/HealingCanvas';
import { fmtTime } from '@/hooks/useTimer';
import { Play, Pause, Volume2, Timer, Sparkles, Music } from 'lucide-react';
import {
  BOWL_FREQUENCIES, BINAURAL_MODES, MODULATIONS, SINGING_BOWL_PRESETS,
  type BinauralValue, type ModulationValue,
} from '@/lib/five-tone-data';
import {
  useAudioService, createBowlTrack,
} from '@/lib/audio-service';
import {
  getTracksForBowlFreq, BOWL_TYPE_INFO,
} from '@/lib/healing-music-catalog';
import { useHealingRecommendation } from '@/hooks/useHealingRecommendation';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XIUWEI_GAINS, type WuxingElement } from '@/lib/cultivation-engine';
import { getClientUserId } from '@/lib/auth';

/* ================================================================
 *  颂钵音疗 · 宋韵光色系版
 *  五行颂钵频率 + 双耳节拍 + 波形调制
 *  + HealingCanvas 宣纸暖白五行声波 + 金色能量粒子
 * ================================================================ */

// ===== 主页面组件 =====
export default function SingingBowlPage() {
  const { hasDiagnosis, recommendedElement, primaryConstitution } = useHealingRecommendation();

  // ---- 音频服务状态 ----
  const {
    isPlaying, currentTrack, volume, binauralBeat, modulation,
    timerMinutes, timerRemaining, isTimerRunning,
    play, pause, stop, togglePlay, setVolume,
    setBinauralBeat, setModulation,
    setTimer, startTimer, stopTimer,
  } = useAudioService();

  // ---- 本地 UI 状态 ----
  const [selectedFreq, setSelectedFreq] = useState<number | null>(null);
  const [selectedBowlTrackId, setSelectedBowlTrackId] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioEnergy, setAudioEnergy] = useState(0);

  // ---- 当前选中频率的可用曲目 ----
  const availableBowlTracks = useMemo(() => {
    if (!selectedFreq) return [];
    return getTracksForBowlFreq(selectedFreq);
  }, [selectedFreq]);

  // ---- Canvas / AnalyserNode 引用 ----
  const healingCanvasRef = useRef<HealingCanvasHandle>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const energyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ---- 获取 AnalyserNode ----
  useEffect(() => {
    if (isPlaying && !analyserRef.current) {
      import('@/lib/audio-service').then(mod => {
        const node = mod.getAnalyserNode();
        if (node) analyserRef.current = node;
      });
    }
  }, [isPlaying]);

  // ---- 音频能量 → Canvas 驱动 ----
  useEffect(() => {
    if (!isPlaying) {
      setAudioEnergy(0);
      return;
    }
    const poll = () => {
      const analyser = analyserRef.current;
      if (!analyser) return;
      const freqData = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freqData);
      let sum = 0;
      for (let i = 0; i < 64; i++) sum += freqData[i];
      const avg = sum / 64 / 255;
      setAudioEnergy(prev => prev * 0.8 + avg * 0.2);
    };
    energyIntervalRef.current = setInterval(poll, 80);
    return () => {
      if (energyIntervalRef.current) clearInterval(energyIntervalRef.current);
    };
  }, [isPlaying]);

  // ---- 播放颂钵频率 ----
  const startPlaying = useCallback((freq: number, beat: BinauralValue, mod: ModulationValue, trackId?: string) => {
    const track = createBowlTrack(freq, undefined, trackId || selectedBowlTrackId || undefined);
    play(track);
    if (beat !== binauralBeat) setBinauralBeat(beat);
    if (mod !== modulation) setModulation(mod);
    setElapsedSeconds(0);

    if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
    elapsedIntervalRef.current = setInterval(() => {
      setElapsedSeconds(s => s + 1);
    }, 1000);
  }, [play, binauralBeat, modulation, setBinauralBeat, setModulation, selectedBowlTrackId]);

  // ---- 停止播放 ----
  const stopAll = useCallback(() => {
    stop();
    if (elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
    setElapsedSeconds(0);
  }, [stop]);

  // ---- 预设点击 ----
  const applyPreset = useCallback((preset: typeof SINGING_BOWL_PRESETS[number]) => {
    const freq = preset.freq ?? 432;
    setSelectedFreq(freq);
    setTimer(preset.timer);
    startPlaying(freq, preset.beat, preset.mod);
  }, [startPlaying, setTimer]);

  // ---- 频率点击 ----
  const toggleFreq = useCallback((freq: number) => {
    if (isPlaying && selectedFreq === freq) {
      stopAll();
    } else {
      setSelectedFreq(freq);
      const tracks = getTracksForBowlFreq(freq);
      const firstTrackId = tracks.length > 0 ? tracks[0].id : null;
      setSelectedBowlTrackId(firstTrackId);
      startPlaying(freq, binauralBeat, modulation as ModulationValue, firstTrackId || undefined);
    }
  }, [isPlaying, selectedFreq, binauralBeat, modulation, startPlaying, stopAll]);

  // ---- 定时器自动停止 ----
  useEffect(() => {
    if (isPlaying && timerMinutes > 0 && elapsedSeconds >= timerMinutes * 60) {
      stopAll();
    }
  }, [elapsedSeconds, isPlaying, timerMinutes, stopAll]);

  // ---- 颂钵疗愈≥5分钟：记录修为（深度集成） ----
  useEffect(() => {
    if (isPlaying && selectedFreq && elapsedSeconds > 0 && elapsedSeconds % 300 === 0) {
      // 每5分钟记录一次修为（最多记录2次避免刷分）
      const currentBowlEl = currentBowl?.element as WuxingElement | undefined;
      if (!currentBowlEl) return;
      const gain = XIUWEI_GAINS.songbo_complete;
      try {
        useCultivationStore.getState().addXiuWei(currentBowlEl, gain);
        useCultivationStore.getState().recordPractice('songbo', 300, currentBowlEl, gain);
        useCultivationStore.getState().completeTodayStep('songbo');
        // 异步写入 DB
        fetch('/api/cultivation/practice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: getClientUserId(),
            category: 'songbo',
            subCategory: String(selectedFreq),
            element: currentBowlEl,
            durationSec: 300,
          }),
        }).catch(() => {});
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elapsedSeconds, isPlaying, selectedFreq]);

  // ---- 播放状态变化时同步 ----
  useEffect(() => {
    if (!isPlaying && elapsedIntervalRef.current) {
      clearInterval(elapsedIntervalRef.current);
      elapsedIntervalRef.current = null;
    }
  }, [isPlaying]);

  // ---- 清理 ----
  useEffect(() => {
    return () => {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current);
      if (energyIntervalRef.current) clearInterval(energyIntervalRef.current);
    };
  }, []);

  // 当前选中频率对应的钵数据
  const currentBowl = BOWL_FREQUENCIES.find(b => b.value === selectedFreq);
  const volPercent = Math.round(volume * 100);

  return (
    <PageContainer theme="healing">
      {/* Header */}
      <HealingHeader
        title="颂钵音疗"
        subtitle="五行频率 · 双耳节拍 · 声波共振"
      />

      {hasDiagnosis && recommendedElement && (
        <div className="mx-4 mt-2 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-400/30 flex items-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">荐</span>
          <span className="text-xs text-amber-800 font-serif">基于您的{primaryConstitution}，推荐{recommendedElement === 'wood' ? '木' : recommendedElement === 'fire' ? '火' : recommendedElement === 'earth' ? '土' : recommendedElement === 'metal' ? '金' : '水'}行颂钵</span>
        </div>
      )}

      {/* Canvas 可视化区域 - 宣纸暖白背景 */}
      <div className="relative" style={{ height: 220, background: '#FDF8F0' }}>
        <HealingCanvas
          ref={healingCanvasRef}
          energy={audioEnergy}
          config={HEALING_PRESET_BOWL}
        />
        {/* 中心频率显示 */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {isPlaying && selectedFreq ? (
              <>
                <div className="text-3xl font-extralight tabular-nums tracking-tight sm:text-4xl" style={{ color: '#5C1A00' }}>
                  {selectedFreq}
                  <span className="ml-1 text-sm sm:text-lg" style={{ color: '#8B7355' }}>Hz</span>
                </div>
                {currentBowl && (
                  <div className="text-sm mt-1" style={{ color: '#8B7355' }}>{currentBowl.name} · {currentBowl.element}·{currentBowl.organ}</div>
                )}
              </>
            ) : (
              <div className="text-3xl font-extralight" style={{ color: '#C4A870' }}>颂钵音疗</div>
            )}
          </div>
        </div>
        {/* 计时器 */}
        <div className="absolute right-3 top-3 rounded px-2 py-1 font-mono text-xs tabular-nums" style={{ background: 'rgba(253,248,240,0.7)', color: '#8B7355' }}>
          {fmtTime(elapsedSeconds)}
          {timerMinutes > 0 && <span style={{ color: '#B8A080' }}>/{timerMinutes}:00</span>}
        </div>
        {/* 双耳节拍标签 */}
        {isPlaying && binauralBeat > 0 && (
          <div className="absolute left-3 top-3">
            <span className="rounded border px-2 py-1 text-xs" style={{
              borderColor: '#4ADE8050', background: '#4ADE8015', color: '#2D7A4F'
            }}>
              +{binauralBeat}Hz 双耳节拍
            </span>
          </div>
        )}
        {/* 调制标签 */}
        {isPlaying && modulation !== 'none' && (
          <div className="absolute left-3 top-9">
            <span className="rounded border px-2 py-1 text-xs" style={{
              borderColor: '#B8860B50', background: '#B8860B15', color: '#8B6508'
            }}>
              {MODULATIONS.find(m => m.value === modulation)?.name}调制
            </span>
          </div>
        )}
        {/* 播放/暂停 */}
        <div className="absolute bottom-2 left-3">
          <button
            onClick={() => isPlaying ? stopAll() : (selectedFreq ? startPlaying(selectedFreq, binauralBeat, modulation as ModulationValue) : startPlaying(432, 0, 'none'))}
            className="w-10 h-10 rounded-full flex items-center justify-center transition"
            style={{ background: isPlaying ? 'rgba(239,68,68,0.12)' : 'rgba(34,197,94,0.12)' }}
          >
            {isPlaying ? <Pause size={18} style={{ color: '#B91C1C' }} /> : <Play size={18} style={{ color: '#166534' }} />}
          </button>
        </div>
      </div>

      {/* 音量滑块 */}
      <div className="px-4 py-3 flex items-center gap-3" style={{ background: 'linear-gradient(to right, #F5EFE0, #EDE4D3)' }}>
        <Volume2 size={16} style={{ color: '#8B7355' }} />
        <input
          type="range" min={0} max={100} value={volPercent}
          onChange={e => setVolume(Number(e.target.value) / 100)}
          className="flex-1 h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ background: `linear-gradient(to right, #B8860B ${volPercent}%, #D4C5A9 ${volPercent}%)` }}
        />
        <span className="text-xs w-8 text-right tabular-nums" style={{ color: '#8B7355' }}>{volPercent}%</span>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-28" style={{ background: 'linear-gradient(170deg, #FDF8F0 0%, #F5EFE0 50%, #EDE4D3 100%)' }}>

        {/* 中医五行预设 */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={16} style={{ color: '#8B2500' }} />
            <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>五行疗愈方案</h3>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SINGING_BOWL_PRESETS.map((preset, i) => {
              const freq = preset.freq ?? 432;
              const isActive = isPlaying && selectedFreq === freq && binauralBeat === preset.beat;
              return (
                <button
                  key={i}
                  onClick={() => applyPreset(preset)}
                  className="rounded-xl p-3 border text-center transition hover:shadow-md active:scale-95"
                  style={{
                    background: isActive ? preset.color + '15' : '#FDF8F0',
                    borderColor: isActive ? preset.color : '#EDE4D3',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-sm font-black"
                    style={{ backgroundColor: preset.color + '18', border: `2px solid ${preset.color}`, color: preset.color }}
                  >
                    {preset.icon}
                  </div>
                  <div className="text-xs font-bold" style={{ color: '#2C1810' }}>{preset.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: '#8B7355' }}>{preset.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 频率选择 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>频率选择</h3>
          <div className="grid grid-cols-5 gap-2">
            {BOWL_FREQUENCIES.map((bf) => {
              const active = isPlaying && selectedFreq === bf.value;
              const ELEMENT_CN: Record<string, string> = { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' };
              const isRecommended = hasDiagnosis && recommendedElement && ELEMENT_CN[recommendedElement] === bf.element;
              return (
                <button
                  key={bf.value}
                  onClick={() => toggleFreq(bf.value)}
                  className="rounded-lg p-2 border text-center transition hover:shadow-sm active:scale-95 relative"
                  style={{
                    background: active ? bf.color + '15' : '#FDF8F0',
                    borderColor: active ? bf.color : isRecommended ? bf.color + '60' : '#EDE4D3',
                  }}
                >
                  {isRecommended && !active && (
                    <span className="absolute -top-1 -right-1 text-[8px] px-1 py-px rounded bg-amber-500/25 text-amber-700 font-bold leading-none">荐</span>
                  )}
                  <div
                    className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-xs font-black"
                    style={{ backgroundColor: bf.color + '18', border: `2px solid ${bf.color}`, color: bf.color }}
                  >
                    {bf.icon}
                  </div>
                  <div className="text-[10px] font-bold" style={{ color: '#2C1810' }}>{bf.value}</div>
                  <div className="text-[8px]" style={{ color: '#8B7355' }}>{bf.element}·{bf.organ}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 颂钵曲目选择 */}
        {selectedFreq && availableBowlTracks.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Music size={14} style={{ color: '#8B2500' }} />
              <h3 className="font-bold text-sm" style={{ color: '#5C1A00' }}>钵体选择</h3>
              <span className="text-[10px]" style={{ color: '#8B7355' }}>
                {availableBowlTracks.length}种可用
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {availableBowlTracks.map((track) => {
                const isSelected = selectedBowlTrackId === track.id;
                const bowlInfo = BOWL_TYPE_INFO[track.bowlType];
                return (
                  <button
                    key={track.id}
                    onClick={() => {
                      setSelectedBowlTrackId(track.id);
                      if (isPlaying && selectedFreq) {
                        const audioTrack = createBowlTrack(selectedFreq, undefined, track.id);
                        play(audioTrack);
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition hover:shadow-sm"
                    style={{
                      background: isSelected ? track.color + '15' : '#FDF8F0',
                      borderColor: isSelected ? track.color : '#EDE4D3',
                    }}
                  >
                    <span
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold"
                      style={{ backgroundColor: track.color + '18', color: track.color }}
                    >
                      {bowlInfo?.icon || '钵'}
                    </span>
                    <div className="text-left">
                      <div className="font-bold" style={{ color: isSelected ? track.color : '#2C1810' }}>
                        {track.title}
                      </div>
                      <div className="text-[9px]" style={{ color: '#8B7355' }}>
                        {bowlInfo?.name || track.bowlType} · {track.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 双耳节拍 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>双耳节拍</h3>
          <div className="flex flex-wrap gap-2">
            {BINAURAL_MODES.map((bm) => (
              <button
                key={bm.value}
                onClick={() => {
                  setBinauralBeat(bm.value);
                  if (isPlaying && selectedFreq) {
                    startPlaying(selectedFreq, bm.value, modulation as ModulationValue);
                  }
                }}
                className="px-3 py-2 rounded-lg border text-xs transition hover:shadow-sm"
                style={{
                  background: binauralBeat === bm.value ? '#2C3E50' : '#FDF8F0',
                  borderColor: binauralBeat === bm.value ? '#2C3E50' : '#EDE4D3',
                  color: binauralBeat === bm.value ? '#FDF8F0' : '#2C1810',
                }}
              >
                <div className="font-bold">{bm.name}</div>
                <div className="text-[10px] opacity-60">{bm.range}</div>
              </button>
            ))}
          </div>
          {binauralBeat > 0 && (
            <p className="text-[10px] mt-2 px-3 py-1.5 rounded-lg" style={{ color: '#8B7355', background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
              双耳节拍需佩戴耳机，左耳{selectedFreq || '???'}Hz + 右耳{(selectedFreq || 0) + binauralBeat}Hz → 感知{binauralBeat}Hz差频
            </p>
          )}
        </div>

        {/* 波形调制 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-3" style={{ color: '#5C1A00' }}>波形调制</h3>
          <div className="flex flex-wrap gap-2">
            {MODULATIONS.map((m) => (
              <button
                key={m.value}
                onClick={() => {
                  setModulation(m.value);
                  if (isPlaying && selectedFreq) {
                    startPlaying(selectedFreq, binauralBeat, m.value);
                  }
                }}
                className="px-3 py-2 rounded-lg border text-xs transition hover:shadow-sm"
                style={{
                  background: modulation === m.value ? '#8B2500' : '#FDF8F0',
                  borderColor: modulation === m.value ? '#8B2500' : '#EDE4D3',
                  color: modulation === m.value ? '#FDF8F0' : '#2C1810',
                }}
              >
                {m.name}
              </button>
            ))}
          </div>
        </div>

        {/* 定时器 */}
        <div className="mb-5">
          <h3 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>
            <Timer size={14} className="inline mr-1" />时长
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '不限', value: 0 },
              { label: '5分钟', value: 5 },
              { label: '10分钟', value: 10 },
              { label: '15分钟', value: 15 },
              { label: '20分钟', value: 20 },
              { label: '30分钟', value: 30 },
            ].map((t) => (
              <button
                key={t.value}
                onClick={() => setTimer(t.value)}
                className="px-3 py-1.5 rounded-lg border text-xs transition"
                style={{
                  background: timerMinutes === t.value ? '#B8860B' : '#FDF8F0',
                  borderColor: timerMinutes === t.value ? '#B8860B' : '#EDE4D3',
                  color: timerMinutes === t.value ? '#FDF8F0' : '#2C1810',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* 科学说明 */}
        <div className="rounded-xl p-4 mb-4" style={{ background: '#FDF8F0', border: '1px solid #EDE4D3' }}>
          <h4 className="font-bold text-sm mb-2" style={{ color: '#5C1A00' }}>颂钵音疗原理</h4>
          <p className="text-xs leading-relaxed" style={{ color: '#5C3015' }}>
            颂钵音疗运用特定频率作用于人体，通过共振原理影响生理机能。中医认为"五音入五脏"，
            角(木/肝)、徵(火/心)、宫(土/脾)、商(金/肺)、羽(水/肾)五种音阶与五行脏腑对应。
            双耳节拍技术通过左右耳频率差诱导脑波同步，德尔塔波助眠、西塔波助冥想、阿尔法波助放松、贝塔波助专注。
            波形调制模拟颂钵敲击后的自然衰减，营造更真实的音疗体验。
          </p>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
