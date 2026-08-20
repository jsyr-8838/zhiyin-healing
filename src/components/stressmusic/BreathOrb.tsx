'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import type { BreathPhase } from './types';
import type { BreathConfig } from './useStressFlow';

/**
 * BreathOrb — 正念呼吸引导球体
 * 移植自 StressMusic 的 .main-breath-orb + .breath-ripple
 * 采用五彩流光效果 + 心率自适应呼吸节奏
 * 
 * 呼吸节奏根据 BPM 动态调整：
 * - 高心率(>100): 4-7-8 深度镇定（19秒/周期）
 * - 中高心率(90-100): 4-6-7 缓解紧张（17秒/周期）
 * - 正常心率(60-89): 3-4-5 或 3.5-5-6 平衡呼吸
 * - 低心率(<60): 2.5-3-4 温和激活
 * 
 * 用途：
 * 1. Loading 页面：自动循环呼吸引导
 * 2. Playing 页面：同步呼吸文字提示
 */
export default function BreathOrb({
  active = true,
  phase,
  onPhaseChange,
  size = 150,
  showText = true,
  bpm,
}: {
  active?: boolean;
  phase?: BreathPhase;
  onPhaseChange?: (phase: BreathPhase) => void;
  size?: number;
  showText?: boolean;
  /** 心率 BPM，用于计算呼吸节奏。不传则使用默认 4-4-4 */
  bpm?: number;
}) {
  const [currentPhase, setCurrentPhase] = React.useState<BreathPhase>('exhale');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);
  const phaseRef = useRef(currentPhase);

  // 同步外部 phase
  useEffect(() => {
    if (phase) setCurrentPhase(phase);
  }, [phase]);

  // 心率→呼吸节奏计算
  const getBreathTiming = useCallback((): BreathConfig => {
    const b = bpm || 72;
    if (b >= 100) return { inhale: 4000, hold: 7000, exhale: 8000, total: 19000, label: '4-7-8 深度镇定' };
    if (b >= 90)  return { inhale: 4000, hold: 6000, exhale: 7000, total: 17000, label: '4-6-7 缓解紧张' };
    if (b >= 80)  return { inhale: 3500, hold: 5000, exhale: 6000, total: 14500, label: '3.5-5-6 调和节奏' };
    if (b >= 70)  return { inhale: 3000, hold: 4000, exhale: 5000, total: 12000, label: '3-4-5 平衡呼吸' };
    if (b >= 60)  return { inhale: 3000, hold: 3500, exhale: 4500, total: 11000, label: '3-3.5-4.5 温和调息' };
    return { inhale: 2500, hold: 3000, exhale: 4000, total: 9500, label: '2.5-3-4 暖阳激活' };
  }, [bpm]);

  // 内部自动循环呼吸
  const startBreathingCycle = useCallback(() => {
    // 清理之前的
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRefs.current.forEach(t => clearTimeout(t));
    timeoutRefs.current = [];

    const timing = getBreathTiming();

    const runCycle = () => {
      if (!active) return;

      // 吸气
      setCurrentPhase('inhale');
      phaseRef.current = 'inhale';
      onPhaseChange?.('inhale');

      // 保持
      const t1 = setTimeout(() => {
        setCurrentPhase('hold');
        phaseRef.current = 'hold';
        onPhaseChange?.('hold');
      }, timing.inhale);
      timeoutRefs.current.push(t1);

      // 呼气
      const t2 = setTimeout(() => {
        setCurrentPhase('exhale');
        phaseRef.current = 'exhale';
        onPhaseChange?.('exhale');
      }, timing.inhale + timing.hold);

      // 放松（短暂间歇后开始下一轮）
      const t3 = setTimeout(() => {
        setCurrentPhase('relax');
        phaseRef.current = 'relax';
        onPhaseChange?.('relax');
      }, timing.inhale + timing.hold + timing.exhale);
      timeoutRefs.current.push(t2);
      timeoutRefs.current.push(t3);
    };

    runCycle();
    intervalRef.current = setInterval(runCycle, timing.total);
  }, [active, onPhaseChange, getBreathTiming]);

  useEffect(() => {
    if (active && !phase) {
      startBreathingCycle();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      timeoutRefs.current.forEach(t => clearTimeout(t));
      timeoutRefs.current = [];
    };
  }, [active, phase, startBreathingCycle]);

  const effectivePhase = phase || currentPhase;

  const phaseLabels: Record<BreathPhase, string> = {
    inhale: '吸气',
    hold: '保持',
    exhale: '呼气',
    relax: '放松',
  };

  // 呼吸节奏标签
  const timingLabel = getBreathTiming().label;

  // 根据呼吸阶段计算缩放和形变
  const getOrbStyle = (): React.CSSProperties => {
    const timing = getBreathTiming();
    const transitionDuration = `${timing.inhale / 1000}s`;

    const base: React.CSSProperties = {
      position: 'relative',
      width: size,
      height: size,
      borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
      background: 'radial-gradient(circle at 35% 35%, rgba(255,255,255,0.98), rgba(245,250,255,0.9))',
      border: '1px solid rgba(255,255,255,0.2)',

      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 10,
      willChange: 'transform, border-radius, box-shadow',
      animation: 'iridescentFlow 12s ease-in-out infinite alternate',
    };

    switch (effectivePhase) {
      case 'inhale':
        return {
          ...base,
          transform: 'scale(1.5)',
          borderRadius: '40% 60% 60% 40% / 40% 50% 50% 60%',
          transition: `all ${transitionDuration} cubic-bezier(0.4, 0.0, 0.2, 1)`,
          boxShadow: `
            -10px -10px 70px rgba(91,160,154,0.4),
            0 0 50px rgba(255,255,255,0.8),
            inset 15px 15px 50px rgba(255,210,225,0.5),
            inset -15px -15px 50px rgba(180,240,255,0.5),
            inset 0 0 30px rgba(255,255,255,1.0)
          `,
        };
      case 'hold':
        return {
          ...base,
          transform: 'scale(1.5)',
          borderRadius: '40% 60% 60% 40% / 40% 50% 50% 60%',
          transition: `all ${timing.hold / 1000}s linear`,
          boxShadow: `
            -10px -10px 70px rgba(91,160,154,0.5),
            0 0 50px rgba(255,255,255,0.9),
            inset 15px 15px 50px rgba(255,210,225,0.6),
            inset -15px -15px 50px rgba(180,240,255,0.6),
            inset 0 0 30px rgba(255,255,255,1.0)
          `,
        };
      case 'exhale':
        return {
          ...base,
          transform: 'scale(0.7)',
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          transition: `all ${timing.exhale / 1000}s cubic-bezier(0.4, 0.0, 0.2, 1)`,
          boxShadow: `
            -10px -10px 70px rgba(91,160,154,0.35),
            0 0 50px rgba(255,255,255,0.8),
            inset 15px 15px 50px rgba(255,210,225,0.5),
            inset -15px -15px 50px rgba(180,240,255,0.5),
            inset 0 0 30px rgba(255,255,255,1.0)
          `,
        };
      case 'relax':
      default:
        return {
          ...base,
          transform: 'scale(0.75)',
          borderRadius: '55% 45% 35% 65% / 55% 35% 65% 45%',
          transition: `all 1s cubic-bezier(0.4, 0.0, 0.2, 1)`,
          boxShadow: `
            -10px -10px 70px rgba(91,160,154,0.3),
            0 0 50px rgba(255,255,255,0.7),
            inset 15px 15px 50px rgba(255,210,225,0.4),
            inset -15px -15px 50px rgba(180,240,255,0.4),
            inset 0 0 30px rgba(255,255,255,1.0)
          `,
        };
    }
  };

  // 涟漪样式
  const getRippleStyle = (idx: number, phase: BreathPhase): React.CSSProperties => {
    const rippleSizes = [180, 240, 300];
    const s = rippleSizes[idx] || 180;
    const expanded = phase === 'inhale' || phase === 'hold';
    const scaleVal = expanded ? (1.8 + idx * 0.3) : 0.7;
    const opacityVal = expanded ? (0.3 - idx * 0.1) : 0;

    return {
      position: 'absolute',
      borderRadius: '50%',
      top: '50%',
      left: '50%',
      width: s,
      height: s,
      border: '1px solid rgba(91,160,154,0.15)',
      background: 'rgba(91,160,154,0.05)',
      transform: `translate(-50%, -50%) scale(${scaleVal})`,
      opacity: opacityVal,
      transition: expanded
        ? 'transform 4s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 4s ease'
        : 'transform 4s cubic-bezier(0.4, 0.0, 0.2, 1), opacity 4s ease',
      pointerEvents: 'none',
      zIndex: 0,
    };
  };

  const wrapperSize = size * 2.5;

  return (
    <div
      className="relative flex flex-col items-center justify-center"
      style={{ width: wrapperSize, height: wrapperSize }}
    >
      {/* 涟漪 */}
      {[0, 1, 2].map(idx => (
        <div key={idx} style={getRippleStyle(idx, effectivePhase)} />
      ))}

      {/* 呼吸球体 */}
      <div style={getOrbStyle()}>
        {showText && (
          <div className="flex flex-col items-center">
            <span
              style={{
                background: 'linear-gradient(135deg, #5ba09a 0%, #c26158 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.4rem',
                fontWeight: 500,
                letterSpacing: '0.15em',
                opacity: 0.9,
                transition: 'opacity 0.5s ease',
              }}
            >
              {phaseLabels[effectivePhase]}
            </span>
            {bpm && bpm > 0 && (
              <span
                style={{
                  fontSize: '0.6rem',
                  color: 'rgba(91,160,154,0.6)',
                  marginTop: 2,
                  letterSpacing: '0.05em',
                }}
              >
                {timingLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* 虹彩流动 keyframes */}
      <style jsx>{`
        @keyframes iridescentFlow {
          0% {
            box-shadow:
              -10px -10px 70px rgba(91,160,154,0.35),
              0 0 50px rgba(255,255,255,0.8),
              inset 15px 15px 50px rgba(255,210,225,0.5),
              inset -15px -15px 50px rgba(180,240,255,0.5),
              inset 0 0 30px rgba(255,255,255,1.0);
          }
          33% {
            box-shadow:
              0px -15px 70px rgba(194,97,88,0.35),
              0 0 50px rgba(255,255,255,0.8),
              inset -15px 15px 50px rgba(93,138,99,0.5),
              inset 15px -15px 50px rgba(201,169,79,0.5),
              inset 0 0 30px rgba(255,255,255,1.0);
          }
          66% {
            box-shadow:
              -15px 0px 70px rgba(61,122,117,0.35),
              0 0 50px rgba(255,255,255,0.8),
              inset 15px -15px 50px rgba(91,160,154,0.5),
              inset -15px 15px 50px rgba(201,169,79,0.5),
              inset 0 0 30px rgba(255,255,255,1.0);
          }
          100% {
            box-shadow:
              -10px -10px 70px rgba(91,160,154,0.35),
              0 0 50px rgba(255,255,255,0.8),
              inset 15px 15px 50px rgba(255,210,225,0.5),
              inset -15px -15px 50px rgba(180,240,255,0.5),
              inset 0 0 30px rgba(255,255,255,1.0);
          }
        }
      `}</style>
    </div>
  );
}
