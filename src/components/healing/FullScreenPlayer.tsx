'use client';

import { useState, useRef, useCallback, useEffect, memo } from 'react';
import {
  Play, Pause, Square, ChevronDown, Volume2, VolumeX,
  SkipBack, SkipForward, Timer, Waves, Wind,
} from 'lucide-react';
import {
  useAudioService, getAnalyserNode,
} from '@/lib/audio-service';
import { BINAURAL_MODES, MODULATIONS, type BinauralValue, type ModulationValue } from '@/lib/five-tone-data';
import { fmtTime } from '@/hooks/useTimer';

/* ================================================================
 *  全局全屏播放器
 *
 *  两种状态：
 *    mini   — 底部悬浮薄条（fixed，在 BottomNav 上方）
 *    full   — 全屏覆盖，宋韵极简 × 液态玻璃美学
 *
 *  仅在 currentTrack 存在时渲染（有曲目在队列中）。
 * ================================================================ */

// ===== 金色常量 =====
const GOLD = '#C4A35A';
const GOLD_LIGHT = '#DAB96B';
const GOLD_DIM = 'rgba(196,163,90,0.3)';

function FullScreenPlayer() {
  const {
    isPlaying, currentTrack, volume, isMuted,
    binauralBeat, modulation,
    timerMinutes, timerRemaining,
    activePrescription, prescriptionIndex,
    queue, queueIndex, playMode,
    togglePlay, stop, setVolume, toggleMute,
    next, prev, setBinauralBeat, setModulation,
    stopPrescription,
  } = useAudioService();

  const [expanded, setExpanded] = useState(false);
  const [touchStartY, setTouchStartY] = useState(0);

  // ---- Canvas refs ----
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number>(0);

  // ---- 仅在有曲目时渲染 ----
  if (!currentTrack) return null;

  const trackColor = currentTrack.color || GOLD;
  const volPercent = Math.round(volume * 100);

  // ===== 迷你播放器 =====
  const MiniPlayer = (
    <div
      className="fixed left-2 right-2 z-50 flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-all duration-300 active:scale-[0.98]"
      style={{
        bottom: 80, // BottomNav 高度
        background: 'rgba(12,10,26,0.85)',
        borderRadius: 16,
        border: `1px solid rgba(196,163,90,0.15)`,
        boxShadow: `0 4px 30px rgba(0,0,0,0.4), inset 0 1px 0 rgba(196,163,90,0.08)`,
      }}
      onClick={() => setExpanded(true)}
      onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
      onTouchEnd={(e) => {
        const dy = touchStartY - e.changedTouches[0].clientY;
        if (dy > 60) setExpanded(true);
      }}
    >
      {/* 色条 */}
      <div className="w-1 h-8 rounded-full flex-shrink-0" style={{ background: trackColor }} />

      {/* 曲目信息 */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white/90 truncate">{currentTrack.title}</div>
        <div className="text-[10px] text-white/40 truncate">
          {currentTrack.instrument && <span className="text-white/50">{currentTrack.instrument}</span>}
          {currentTrack.instrument && currentTrack.subtitle ? ' · ' : ''}
          {currentTrack.subtitle}
        </div>
      </div>

      {/* 方案进度 */}
      {activePrescription && (
        <div className="text-[10px] text-amber-400/70 flex-shrink-0">
          {prescriptionIndex + 1}/{activePrescription.items.length}
        </div>
      )}

      {/* 播放/暂停 */}
      <button
        onClick={(e) => { e.stopPropagation(); togglePlay(); }}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition"
        style={{ background: isPlaying ? 'rgba(239,68,68,0.25)' : 'rgba(34,197,94,0.25)' }}
      >
        {isPlaying
          ? <Pause size={16} className="text-red-300" />
          : <Play size={16} className="text-green-300 ml-0.5" />
        }
      </button>

      {/* 进度条动画 */}
      {isPlaying && (
        <div className="absolute bottom-0 left-4 right-4 h-0.5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full animate-pulse"
            style={{
              background: `linear-gradient(90deg, ${trackColor}, ${GOLD_LIGHT})`,
              width: '100%',
            }}
          />
        </div>
      )}
    </div>
  );

  // ===== 全屏播放器 =====
  if (!expanded) return MiniPlayer;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col animate-in"
      style={{
        background: 'linear-gradient(180deg, #0c0a1a 0%, #080614 40%, #03020a 100%)',
      }}
    >
      {/* 顶部拖拽条 + 关闭 */}
      <div className="flex justify-center pt-3 pb-1">
        <button
          onClick={() => setExpanded(false)}
          className="w-10 h-1 rounded-full bg-white/20 hover:bg-white/40 transition cursor-pointer"
        />
      </div>

      {/* 关闭按钮 */}
      <div className="flex items-center justify-between px-5 py-2">
        <button onClick={() => setExpanded(false)} className="text-white/40 hover:text-white/70 transition">
          <ChevronDown size={24} />
        </button>
        <div className="text-xs text-white/30 tracking-widest font-light">正在疗愈</div>
        <button onClick={stop} className="text-white/40 hover:text-red-400/70 transition">
          <Square size={18} />
        </button>
      </div>

      {/* Canvas 可视化区域 */}
      <div className="flex-1 relative mx-4 my-2 rounded-3xl overflow-hidden"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(196,163,90,0.08)',
        }}
      >
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        {/* 中心信息叠加 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {/* 音符/频率大字 */}
          <div className="text-center mb-2">
            {currentTrack.toneKey ? (
              <div className="text-6xl font-black" style={{ color: trackColor }}>
                {currentTrack.title.charAt(0)}
              </div>
            ) : currentTrack.bowlFreq ? (
              <div className="text-4xl font-extralight text-white/80 tabular-nums">
                {currentTrack.bowlFreq}
                <span className="text-base ml-1 text-white/40">Hz</span>
              </div>
            ) : null}
          </div>
          {/* 曲目标题 */}
          <div className="text-lg font-medium text-white/90 tracking-wide">
            {currentTrack.title}
          </div>
          <div className="text-xs text-white/40 mt-1">
            {currentTrack.instrument && <span className="text-white/50">{currentTrack.instrument}</span>}
            {currentTrack.instrument && currentTrack.subtitle ? ' · ' : ''}
            {currentTrack.subtitle}
          </div>

          {/* 方案进度指示 */}
          {activePrescription && (
            <div className="mt-4 flex items-center gap-1.5">
              {activePrescription.items.map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full transition-all"
                  style={{
                    background: i <= prescriptionIndex ? trackColor : 'rgba(255,255,255,0.15)',
                    transform: i === prescriptionIndex ? 'scale(1.3)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* 指标标签 */}
        {isPlaying && binauralBeat > 0 && (
          <div className="absolute left-3 top-3">
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 text-[10px] text-emerald-400/80 flex items-center gap-1">
              <Waves size={10} /> +{binauralBeat}Hz
            </span>
          </div>
        )}
        {isPlaying && modulation !== 'none' && (
          <div className="absolute left-3 top-10">
            <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[10px] text-amber-400/80 flex items-center gap-1">
              <Wind size={10} /> {MODULATIONS.find(m => m.value === modulation)?.name}
            </span>
          </div>
        )}

        {/* 计时器 */}
        <div className="absolute right-3 top-3 rounded-xl bg-black/30 px-3 py-1.5">
          <div className="font-mono text-xs tabular-nums text-white/70">
            {timerMinutes > 0
              ? <>{fmtTime(timerRemaining)}<span className="text-white/30 ml-1">/{timerMinutes}:00</span></>
              : <span className="text-white/30">{fmtTime(0)}</span>
            }
          </div>
        </div>
      </div>

      {/* 控制区 */}
      <div className="px-6 pb-6 pt-2">
        {/* 进度条（装饰性，实际循环播放） */}
        <div className="mb-4 h-0.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: isPlaying ? '100%' : '0%',
              background: `linear-gradient(90deg, ${trackColor}66, ${GOLD})`,
              transition: isPlaying ? 'width 60s linear' : 'width 0.3s ease',
            }}
          />
        </div>

        {/* 播放控制按钮 */}
        <div className="flex items-center justify-center gap-8 mb-5">
          <button onClick={prev} className="text-white/40 hover:text-white/80 transition active:scale-90">
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-95"
            style={{
              background: isPlaying
                ? `linear-gradient(135deg, rgba(239,68,68,0.3), rgba(239,68,68,0.15))`
                : `linear-gradient(135deg, ${trackColor}44, ${trackColor}22)`,
              border: `1.5px solid ${isPlaying ? 'rgba(239,68,68,0.3)' : trackColor + '44'}`,
              boxShadow: isPlaying
                ? '0 0 30px rgba(239,68,68,0.15)'
                : `0 0 30px ${trackColor}15`,
            }}
          >
            {isPlaying
              ? <Pause size={28} className="text-red-300" />
              : <Play size={28} className="text-white/80 ml-1" />
            }
          </button>
          <button onClick={next} className="text-white/40 hover:text-white/80 transition active:scale-90">
            <SkipForward size={24} fill="currentColor" />
          </button>
        </div>

        {/* 音量 */}
        <div className="flex items-center gap-3 mb-4">
          <button onClick={toggleMute} className="text-white/40 hover:text-white/70 transition">
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          <input
            type="range" min={0} max={100} value={isMuted ? 0 : volPercent}
            onChange={e => setVolume(Number(e.target.value) / 100)}
            className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, ${GOLD} ${isMuted ? 0 : volPercent}%, rgba(255,255,255,0.08) ${isMuted ? 0 : volPercent}%)`,
            }}
          />
          <span className="text-[10px] text-white/30 w-7 text-right tabular-nums">{isMuted ? 0 : volPercent}%</span>
        </div>

        {/* 双耳节拍 + 调制 快捷切换 */}
        <div className="flex gap-2">
          <div className="flex-1 flex items-center gap-1.5 rounded-xl px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Waves size={12} className="text-white/30 flex-shrink-0" />
            <select
              value={binauralBeat}
              onChange={e => setBinauralBeat(Number(e.target.value) as BinauralValue)}
              className="flex-1 bg-transparent text-[11px] text-white/60 outline-none cursor-pointer appearance-none"
            >
              {BINAURAL_MODES.map(bm => (
                <option key={bm.value} value={bm.value} className="bg-gray-900 text-white">
                  {bm.name} {bm.brainwave && `(${bm.brainwave})`}
                </option>
              ))}
            </select>
          </div>
          <div className="flex-1 flex items-center gap-1.5 rounded-xl px-3 py-2"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <Wind size={12} className="text-white/30 flex-shrink-0" />
            <select
              value={modulation}
              onChange={e => setModulation(e.target.value as ModulationValue)}
              className="flex-1 bg-transparent text-[11px] text-white/60 outline-none cursor-pointer appearance-none"
            >
              {MODULATIONS.map(m => (
                <option key={m.value} value={m.value} className="bg-gray-900 text-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 方案控制 */}
        {activePrescription && (
          <div className="mt-3 flex items-center justify-between rounded-xl px-4 py-2.5"
            style={{ background: 'rgba(196,163,90,0.05)', border: '1px solid rgba(196,163,90,0.1)' }}
          >
            <div className="flex items-center gap-2">
              <Timer size={12} className="text-amber-400/60" />
              <span className="text-[11px] text-amber-400/80">{activePrescription.name}</span>
              <span className="text-[10px] text-white/30">
                {prescriptionIndex + 1}/{activePrescription.items.length}
              </span>
            </div>
            <button
              onClick={stopPrescription}
              className="text-[10px] text-red-400/60 hover:text-red-400/90 transition px-2 py-1 rounded-lg hover:bg-red-500/10"
            >
              结束方案
            </button>
          </div>
        )}
      </div>

      {/* 内嵌 Canvas 可视化逻辑 */}
      <PlayerVisualization
        canvasRef={canvasRef}
        animFrameRef={animFrameRef}
        isPlaying={isPlaying}
        trackColor={trackColor}
      />
    </div>
  );
}

/* ================================================================
 *  播放器内嵌可视化（简化版银河 — 金色粒子 + 环形波纹）
 *  独立组件，避免全屏播放器主体过于臃肿
 * ================================================================ */

interface PlayerVisProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  animFrameRef: React.MutableRefObject<number>;
  isPlaying: boolean;
  trackColor: string;
}

function PlayerVisualization({ canvasRef, animFrameRef, isPlaying, trackColor }: PlayerVisProps) {
  const startVis = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = getAnalyserNode();
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d')!;
    const bufLen = analyser.frequencyBinCount;
    const freqData = new Uint8Array(bufLen);
    const timeData = new Uint8Array(bufLen);

    // 粒子
    const MAX_P = 60;
    const particles: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; size: number; hue: number }[] = [];
    function spawn(cx: number, cy: number, energy: number) {
      if (particles.length >= MAX_P) return;
      const a = Math.random() * Math.PI * 2;
      const sp = (0.2 + Math.random() * 0.6) * (0.5 + energy);
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        life: 1, maxLife: 50 + Math.random() * 80,
        size: 1 + Math.random() * 2.5 + energy * 2,
        hue: 35 + Math.random() * 25,
      });
    }

    // 星星
    const stars: { x: number; y: number; r: number; b: number; sp: number; ph: number }[] = [];
    for (let i = 0; i < 150; i++) {
      stars.push({
        x: Math.random(), y: Math.random(),
        r: Math.random() * 1.2 + 0.2,
        b: Math.random() * 0.5 + 0.3,
        sp: Math.random() * 2 + 0.5,
        ph: Math.random() * Math.PI * 2,
      });
    }

    // 环形波纹
    const rings: { radius: number; maxR: number; life: number; speed: number }[] = [];
    let ringTimer = 0;

    let frame = 0;
    let prevE = 0;

    function draw() {
      if (!canvas) return;
      animFrameRef.current = requestAnimationFrame(draw);
      frame++;
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      analyser!.getByteFrequencyData(freqData);
      analyser!.getByteTimeDomainData(timeData);

      let sum = 0;
      for (let i = 0; i < 64; i++) sum += freqData[i];
      const avg = sum / 64 / 255;
      const e = prevE * 0.85 + avg * 0.15;
      prevE = e;

      // 背景
      ctx.fillStyle = 'rgba(3,2,10,0.15)';
      ctx.fillRect(0, 0, w, h);

      // 中心光晕
      const cx = w / 2;
      const cy = h / 2;
      const glowR = Math.min(w, h) * 0.3 * (0.8 + e * 0.5);
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
      glow.addColorStop(0, `rgba(196,163,90,${0.04 + e * 0.06})`);
      glow.addColorStop(0.5, `rgba(196,163,90,${0.01 + e * 0.02})`);
      glow.addColorStop(1, 'transparent');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      // 星星
      for (const s of stars) {
        const tw = Math.sin(frame * 0.02 * s.sp + s.ph);
        const alpha = s.b * (0.5 + tw * 0.5) * (0.6 + e * 0.4);
        ctx.beginPath();
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,215,240,${alpha})`;
        ctx.fill();
      }

      // 环形波纹（从中心扩散）
      ringTimer++;
      if (ringTimer > 40 && e > 0.03) {
        ringTimer = 0;
        rings.push({ radius: 5, maxR: Math.min(w, h) * 0.4, life: 1, speed: 0.5 + e * 1.5 });
      }
      for (let i = rings.length - 1; i >= 0; i--) {
        const r = rings[i];
        r.radius += r.speed;
        r.life -= 0.008;
        if (r.life <= 0 || r.radius >= r.maxR) { rings.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(cx, cy, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(196,163,90,${r.life * 0.15 * e * 5})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // 波形（圆形排列）
      ctx.beginPath();
      const baseR = Math.min(w, h) * 0.15;
      for (let i = 0; i < bufLen; i++) {
        const v = (timeData[i] - 128) / 128;
        const angle = (i / bufLen) * Math.PI * 2;
        const r = baseR + v * baseR * 0.6 * (0.3 + e * 0.7);
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(218,185,107,${0.3 + e * 0.5})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // 粒子
      if (e > 0.04) {
        const rate = Math.floor(e * 3);
        for (let i = 0; i < rate; i++) {
          const a = Math.random() * Math.PI * 2;
          spawn(cx + Math.cos(a) * baseR, cy + Math.sin(a) * baseR, e);
        }
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.98; p.vy *= 0.98;
        p.life -= 1 / p.maxLife;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        const alpha = p.life * 0.7;
        const sz = p.size * (0.4 + p.life * 0.6);
        const pg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, sz * 2.5);
        pg.addColorStop(0, `hsla(${p.hue},70%,75%,${alpha * 0.5})`);
        pg.addColorStop(1, `hsla(${p.hue},70%,50%,0)`);
        ctx.fillStyle = pg;
        ctx.fillRect(p.x - sz * 2.5, p.y - sz * 2.5, sz * 5, sz * 5);
      }
    }
    draw();
  }, [isPlaying, trackColor]);

  useEffect(() => {
    if (isPlaying) startVis();
    else if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = 0;
    }
  }, [isPlaying, startVis, animFrameRef]);

  // Canvas 尺寸
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx2d = canvas.getContext('2d')!;
      ctx2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [canvasRef]);

  return null; // 纯逻辑组件，不渲染 UI
}

export default memo(FullScreenPlayer);