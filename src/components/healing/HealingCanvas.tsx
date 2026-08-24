'use client';

import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';

/**
 * HealingCanvas — 宋韵光色系疗愈背景共享组件
 *
 * 4种专属可视化模式：
 *   wuyin     — 五行色分层流动声波（角绿徵红宫黄商金羽蓝）
 *               支持逐频段音频驱动（analyserNode），音乐停则波浪冻结
 *   liuzijue  — 呼吸脉冲光环 + 气息微粒 + 淡墨山水
 *   bowl      — 同心共振涟漪 + 频率波纹（颂钵敲击效果）
 *   chakra    — 旋转脉轮轮盘 + 能量光晕 + 彩色漩涡
 *
 * 共同特征：宣纸暖白背景、金色粒子、点击涟漪、energy驱动
 * 金色粒子仅在 energy > 0.01 时生成，音乐停止时自然消散
 */

// ===== 通用类型 =====
interface Particle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number;
  hue: number; sat: number; light: number;
}

interface Ripple {
  x: number; y: number; radius: number; maxRadius: number;
  life: number; color: string;
}

// ===== 配置 =====
export type VisMode = 'wuyin' | 'liuzijue' | 'bowl' | 'chakra';

export interface HealingCanvasConfig {
  visMode?: VisMode;
  maxParticles?: number;
  particleBaseSize?: number;
  particleEnergyMul?: number;
  interactive?: boolean;
  bgColorCenter?: string;
  bgColorEdge?: string;
  particleHueCenter?: number;
  particleHueWidth?: number;
  spawnCenterX?: number;
  spawnCenterY?: number;
}

export interface HealingCanvasHandle {
  spawnBurst: (x?: number, y?: number) => void;
  addRipple: (x: number, y: number, color?: string) => void;
}

export interface HealingCanvasProps {
  energy?: number;
  analyserNode?: AnalyserNode | null;
  config?: HealingCanvasConfig;
  className?: string;
  style?: React.CSSProperties;
  /** 六字诀呼吸球：当前呼吸相位 idle|inhale|hold1|exhale|hold2 */
  breathPhase?: string;
  /** 六字诀呼吸球：当前相位进度 0→1 */
  breathProgress?: number;
  /** 六字诀呼吸球：五行色 (如 '#4ADE80') */
  jueColor?: string;
}

// ===== 预设 =====
export const HEALING_PRESET_WUYIN: HealingCanvasConfig = {
  visMode: 'wuyin',
  maxParticles: 60,
  particleBaseSize: 2.5,
  particleEnergyMul: 4,
  interactive: true,
  bgColorCenter: '#FDF8F0',
  bgColorEdge: '#F0E8D8',
  particleHueCenter: 42,
  particleHueWidth: 20,
};

export const HEALING_PRESET_LIUZIJUE: HealingCanvasConfig = {
  visMode: 'liuzijue',
  maxParticles: 50,
  particleBaseSize: 3.0,
  particleEnergyMul: 5,
  interactive: true,
  bgColorCenter: '#FDF8F0',
  bgColorEdge: '#EDE4D3',
  particleHueCenter: 40,
  particleHueWidth: 25,
};

export const HEALING_PRESET_BOWL: HealingCanvasConfig = {
  visMode: 'bowl',
  maxParticles: 40,
  particleBaseSize: 2.0,
  particleEnergyMul: 3,
  interactive: true,
  bgColorCenter: '#1A1208',
  bgColorEdge: '#0F0A06',
  particleHueCenter: 42,
  particleHueWidth: 18,
};

export const HEALING_PRESET_CHAKRA: HealingCanvasConfig = {
  visMode: 'chakra',
  maxParticles: 70,
  particleBaseSize: 2.0,
  particleEnergyMul: 4,
  interactive: true,
  bgColorCenter: '#1A1208',
  bgColorEdge: '#0F0A06',
  particleHueCenter: 0,
  particleHueWidth: 360,
};

// 向后兼容别名
export const HEALING_PRESET_FULL = HEALING_PRESET_WUYIN;
export const HEALING_PRESET_BREATH = HEALING_PRESET_LIUZIJUE;

// ===== 五行色声波数据 =====
const WUYIN_BANDS = [
  { hue: 120, sat: 40, light: 62, yRatio: 0.28, amp: 18, freq: 0.012, speed: 0.6 },
  { hue: 0,   sat: 45, light: 60, yRatio: 0.38, amp: 14, freq: 0.018, speed: 0.8 },
  { hue: 45,  sat: 50, light: 65, yRatio: 0.50, amp: 20, freq: 0.010, speed: 0.5 },
  { hue: 200, sat: 35, light: 60, yRatio: 0.62, amp: 16, freq: 0.015, speed: 0.7 },
  { hue: 230, sat: 38, light: 58, yRatio: 0.72, amp: 12, freq: 0.020, speed: 0.9 },
];

// ===== 七脉轮数据 =====
const CHAKRAS = [
  { name: '顶轮',   hue: 280, sat: 55, y: 0.12, freq: 963  },
  { name: '眉心轮', hue: 240, sat: 50, y: 0.24, freq: 852  },
  { name: '喉轮',   hue: 190, sat: 45, y: 0.36, freq: 741  },
  { name: '心轮',   hue: 120, sat: 50, y: 0.48, freq: 639  },
  { name: '脐轮',   hue: 35,  sat: 60, y: 0.60, freq: 528  },
  { name: '腹轮',   hue: 25,  sat: 55, y: 0.72, freq: 417  },
  { name: '根轮',   hue: 0,   sat: 50, y: 0.84, freq: 396  },
];

// ===== 绘制函数：五音 =====
// waveTime = 可冻结的波浪时间（音乐停时冻结）; e = 全局能量; bandEnergies = 5频段能量
// v2增强：中央脉冲圆环 + 能量粒子飞溅 + 引导性节律光效
function drawWuyin(
  ctx: CanvasRenderingContext2D, w: number, h: number,
  waveTime: number, e: number, bandEnergies: number[],
) {
  const cx = w * 0.5;
  const cy = h * 0.5;

  // ── 中央脉冲圆环（随能量呼吸） ──
  if (e > 0.005) {
    const pulseRadius = Math.min(w, h) * (0.06 + e * 0.16);
    const pulseAlpha = 0.08 + e * 0.20;
    // 外圈光晕
    const glowGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius * 2.5);
    glowGrad.addColorStop(0, `hsla(42, 60%, 70%, ${pulseAlpha * 0.5})`);
    glowGrad.addColorStop(0.4, `hsla(42, 50%, 60%, ${pulseAlpha * 0.2})`);
    glowGrad.addColorStop(1, `hsla(42, 40%, 50%, 0)`);
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseRadius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // 脉冲圆环
    for (let ring = 0; ring < 3; ring++) {
      const ringR = pulseRadius * (1 + ring * 0.4 + Math.sin(waveTime * 0.8 + ring) * 0.1);
      const ringAlpha = pulseAlpha * (1 - ring * 0.3);
      ctx.beginPath();
      ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(42 + ring * 10, 55%, 65%, ${ringAlpha})`;
      ctx.lineWidth = 1.5 + e * 2 - ring * 0.5;
      ctx.stroke();
    }
  }

  // ── 能量粒子飞溅 ──
  if (e > 0.08) {
    const particleCount = Math.floor(e * 12);
    for (let pi = 0; pi < particleCount; pi++) {
      const angle = waveTime * 0.5 + pi * (Math.PI * 2 / particleCount);
      const dist = Math.min(w, h) * (0.12 + e * 0.25 + Math.sin(waveTime * 2 + pi) * 0.06);
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const psize = 1.5 + e * 3;
      const palpha = 0.35 + e * 0.35;
      ctx.beginPath();
      ctx.arc(px, py, psize, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(42, 60%, 70%, ${palpha})`;
      ctx.fill();
    }
  }

  for (let bi = 0; bi < WUYIN_BANDS.length; bi++) {
    const band = WUYIN_BANDS[bi];
    const be = bandEnergies[bi];
    // 每波段使用自身频段能量（更高优先）和全局能量的较大值
    const combined = Math.max(e, be);

    const baseY = band.yRatio * h;
    // 妙曼舞姿：基础振幅极低（静止时近乎平直），音频驱动时大幅舒展
    const amp = band.amp * (0.15 + combined * 4.5);
    const alpha = 0.05 + combined * 0.42;

    // ── 宽波带（渐变填充） ──
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let x = 0; x <= w; x += 3) {
      const y = baseY +
        Math.sin(x * band.freq + waveTime * band.speed + bi * 1.2) * amp +
        Math.sin(x * band.freq * 0.5 + waveTime * band.speed * 0.7 + bi) * amp * 0.5 +
        // 音频驱动的额外谐波 → 舞姿般的丰富动感
        Math.sin(x * band.freq * 2.1 + waveTime * band.speed * 1.3) * amp * 0.22 * combined +
        Math.cos(x * band.freq * 0.3 + waveTime * band.speed * 0.4 + bi * 2.1) * amp * 0.15 * combined;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, baseY - amp * 2, 0, baseY + amp * 2);
    grad.addColorStop(0, `hsla(${band.hue}, ${band.sat}%, ${band.light}%, 0)`);
    grad.addColorStop(0.3, `hsla(${band.hue}, ${band.sat}%, ${band.light}%, ${alpha * 0.5})`);
    grad.addColorStop(0.5, `hsla(${band.hue}, ${band.sat}%, ${band.light}%, ${alpha})`);
    grad.addColorStop(0.7, `hsla(${band.hue}, ${band.sat}%, ${band.light}%, ${alpha * 0.5})`);
    grad.addColorStop(1, `hsla(${band.hue}, ${band.sat}%, ${band.light}%, 0)`);
    ctx.fillStyle = grad;
    ctx.fill();

    // ── 前景波线（灵动舞姿主线） ──
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const y = baseY +
        Math.sin(x * band.freq + waveTime * band.speed + bi * 1.2) * amp +
        Math.sin(x * band.freq * 0.5 + waveTime * band.speed * 0.7 + bi) * amp * 0.5 +
        Math.sin(x * band.freq * 2.1 + waveTime * band.speed * 1.3) * amp * 0.22 * combined +
        Math.cos(x * band.freq * 0.3 + waveTime * band.speed * 0.4 + bi * 2.1) * amp * 0.15 * combined;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${band.hue}, ${band.sat + 10}%, ${band.light - 5}%, ${alpha * 2.5})`;
    ctx.lineWidth = 1.5 + combined * 3;
    ctx.stroke();

    // ── 高光丝线（仙子飘带效果） ──
    ctx.beginPath();
    for (let x = 0; x <= w; x += 3) {
      const y = baseY +
        Math.sin(x * band.freq * 1.3 + waveTime * band.speed * 1.4 + bi * 0.8) * amp * 0.6 +
        Math.cos(x * band.freq * 0.7 + waveTime * band.speed * 0.9 + bi * 1.5) * amp * 0.3 +
        // 额外音频响应丝线 → 仙子飘带随音律舒展
        Math.sin(x * band.freq * 2.8 + waveTime * band.speed * 1.8) * amp * 0.15 * combined;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = `hsla(${band.hue + 20}, ${band.sat + 20}%, ${band.light + 15}%, ${0.03 + combined * 0.10})`;
    ctx.lineWidth = 1 + combined * 1.5;
    ctx.stroke();
  }
}

// ===== Fibonacci 粒子球预计算（六字诀呼吸球核心） =====
const FIBO_PARTICLE_COUNT = 960;
const FIBO_GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));
const FIBO_POSITIONS: Array<{ x: number; y: number; z: number }> = [];
for (let i = 0; i < FIBO_PARTICLE_COUNT; i++) {
  const yNorm = 1 - (i / (FIBO_PARTICLE_COUNT - 1)) * 2; // +1 → -1
  const radiusAtY = Math.sqrt(Math.max(0, 1 - yNorm * yNorm));
  const theta = FIBO_GOLDEN_ANGLE * i;
  const R = 0.9;
  FIBO_POSITIONS.push({
    x: R * Math.cos(theta) * radiusAtY,
    y: R * yNorm,
    z: R * Math.sin(theta) * radiusAtY,
  });
}

// ===== 绘制函数：六字诀呼吸 =====
// breathPhase: idle|inhale|hold1|exhale|hold2; breathProgress: 0→1; jueColor: 五行色
// v6: 纯净化重构 — 守身藏拙，去辐条去装饰
//   只有：柔和光晕 → Fibonacci粒子球 → 微光核 → 进度弧
//   构图清晰明朗，视觉纯净，力道内敛
function drawLiuzijue(
  ctx: CanvasRenderingContext2D, w: number, h: number, time: number, e: number,
  breathPhase?: string, breathProgress?: number, jueColor?: string,
) {
  const cx = w * 0.5;
  const cy = h * 0.48;
  const baseRadius = Math.min(w, h) * 0.28;

  // ── 呼吸球缩放（cosine ease-in-out） ──
  let targetScale: number;
  let targetOpacity: number;
  let targetParticleSize: number;

  const phase = breathPhase ?? 'idle';
  const progress = breathProgress ?? 0;

  if (phase === 'inhale') {
    const t = 0.5 - 0.5 * Math.cos(progress * Math.PI);
    targetScale = 0.4 + t * 1.0;       // 0.4 → 1.4
    targetOpacity = 0.6 + t * 0.4;     // 0.6 → 1.0
    targetParticleSize = 1.0 + t * 1.2; // 1.0 → 2.2
  } else if (phase === 'exhale') {
    const t = 0.5 - 0.5 * Math.cos(progress * Math.PI);
    targetScale = 1.4 - t * 1.0;
    targetOpacity = 1.0 - t * 0.4;
    targetParticleSize = 2.2 - t * 1.2;
  } else if (phase === 'hold1' || phase === 'hold2') {
    targetScale = 1.4;
    targetOpacity = 1.0;
    targetParticleSize = 2.2;
  } else {
    // idle — 安静微呼吸（增强可见度）
    const idle = 0.5 + 0.5 * Math.sin(time * 0.4);
    targetScale = 0.88 + idle * 0.18;
    targetOpacity = 0.65 + idle * 0.15;
    targetParticleSize = 1.5 + idle * 0.5;
  }

  // ── 颜色解析 ──
  const color = jueColor || '#4ADE80';
  const hex = color.replace('#', '');
  const cr = parseInt(hex.substr(0, 2), 16);
  const cg = parseInt(hex.substr(2, 2), 16);
  const cb = parseInt(hex.substr(4, 2), 16);

  // ── 第1层：柔和弥散光晕（增强呼吸气感） ──
  const glowR = baseRadius * targetScale * 2.2;
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowR);
  glow.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.10 + targetOpacity * 0.15})`);
  glow.addColorStop(0.35, `rgba(${cr}, ${cg}, ${cb}, ${0.04 + targetOpacity * 0.06})`);
  glow.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(cx - glowR, cy - glowR, glowR * 2, glowR * 2);

  // ── 呼吸粒子密度 & 粒度：吸气时密集且饱满，呼气时稀疏且精细 ──
  // densityFactor: 0 = 稀疏（跳过多半粒子）, 1 = 全部显示
  // sizeFactor: 吸气时粒子放大（气聚饱满），呼气时缩小（气散精细）
  const densityFactor = phase === 'inhale'
    ? 0.6 + progress * 0.4        // 0.6 → 1.0（吸气渐密）
    : phase === 'exhale'
      ? 1.0 - progress * 0.5      // 1.0 → 0.5（呼气渐疏）
      : phase === 'hold1' || phase === 'hold2'
        ? 1.0                      // 屏气满载
        : 0.55 + Math.sin(time * 0.4) * 0.1; // idle 微弱摆动
  const sizeFactor = phase === 'inhale'
    ? 0.8 + progress * 0.5        // 0.8 → 1.3（吸气渐大，气聚饱满）
    : phase === 'exhale'
      ? 1.3 - progress * 0.6      // 1.3 → 0.7（呼气渐小，气散精细）
      : phase === 'hold1' || phase === 'hold2'
        ? 1.1                      // 屏气稳态
        : 0.85 + Math.sin(time * 0.4) * 0.05; // idle 微弱摆动

  // ── 第2层：Fibonacci 粒子球（纯净化核心 + 呼吸密度） ──
  const fov = 3.0;
  const camZ = 2.2;
  const rotY = time * 0.06;

  const projected: Array<{ px: number; py: number; depth: number; sizeMul: number }> = [];
  for (let i = 0; i < FIBO_PARTICLE_COUNT; i++) {
    // 密度过滤：根据 index 和 densityFactor 决定是否渲染
    // 使用 Fibonacci index 的伪随机分布确保视觉效果均匀
    if (densityFactor < 1.0 && (i * 7919) % 1000 > densityFactor * 1000) continue;

    const p = FIBO_POSITIONS[i];
    const cosR = Math.cos(rotY);
    const sinR = Math.sin(rotY);
    const rx = p.x * cosR - p.z * sinR;
    const rz = p.x * sinR + p.z * cosR;
    const scale = fov / (fov + rz + camZ);
    projected.push({
      px: cx + rx * baseRadius * targetScale * scale,
      py: cy + p.y * baseRadius * targetScale * scale,
      depth: rz,
      sizeMul: scale,
    });
  }
  projected.sort((a, b) => a.depth - b.depth);

  for (let i = 0; i < projected.length; i++) {
    const pt = projected[i];
    const depthNorm = (pt.depth + 1) / 2;
    const brightness = 0.35 + depthNorm * 0.65;
    const alpha = targetOpacity * brightness * 0.75;
    const sz = targetParticleSize * pt.sizeMul * (0.5 + depthNorm * 0.5) * sizeFactor;

    // 极简粒子：仅有微粒点，无附加发光
    ctx.beginPath();
    ctx.arc(pt.px, pt.py, Math.max(sz, 0.3), 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${Math.min(255, cr + 50)}, ${Math.min(255, cg + 35)}, ${Math.min(255, cb + 25)}, ${alpha})`;
    ctx.fill();
  }

  // ── 第3层：微光核心（极小极淡，五行色） ──
  const coreR = 4 + targetScale * 6;
  const coreGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
  coreGlow.addColorStop(0, `rgba(${Math.min(255, cr + 60)}, ${Math.min(255, cg + 40)}, ${Math.min(255, cb + 30)}, ${0.20 + targetOpacity * 0.15})`);
  coreGlow.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
  ctx.fillStyle = coreGlow;
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  // ── 第4层：进度弧（极简细线） ──
  if (phase !== 'idle' && progress > 0) {
    const ringR = baseRadius * targetScale + 10;
    // 底环
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, 0.06)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // 进度弧
    const sa = -Math.PI / 2;
    const ea = sa + Math.PI * 2 * progress;
    ctx.beginPath();
    ctx.arc(cx, cy, ringR, sa, ea);
    ctx.strokeStyle = `rgba(${cr}, ${cg}, ${cb}, ${0.25 + targetOpacity * 0.20})`;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
}

// ===== 绘制函数：颂钵共振 =====
// 色彩斑斓、震动同步、疗愈感十足的颂钵视觉
function drawBowl(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, e: number) {
  const cx = w * 0.5;
  const cy = h * 0.5;
  const maxR = Math.min(w, h) * 0.48;

  // ── 第1层：中央钵体金色光晕（极大、璀璨） ──
  const coreR = 60 + e * 40;
  const goldenGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR * 3);
  goldenGlow.addColorStop(0, `hsla(45, 70%, 72%, ${0.25 + e * 0.35})`);
  goldenGlow.addColorStop(0.15, `hsla(40, 65%, 62%, ${0.15 + e * 0.20})`);
  goldenGlow.addColorStop(0.35, `hsla(38, 55%, 50%, ${0.06 + e * 0.08})`);
  goldenGlow.addColorStop(1, 'hsla(38, 45%, 50%, 0)');
  ctx.fillStyle = goldenGlow;
  ctx.fillRect(cx - coreR * 3, cy - coreR * 3, coreR * 6, coreR * 6);

  // ── 第2层：金色同心共振涟漪（统一金调，瀑布式扩散） ──
  // 以金色/琥珀色为主，营造高级金属感
  const GOLD_HUES = [38, 42, 45, 35, 40, 48, 36, 44, 42];
  const ringCount = 12;
  for (let i = 0; i < ringCount; i++) {
    const phase = (time * 0.35 + i * 0.4) % 4;
    const progress = phase / 4;
    const radius = progress * maxR;
    const fadeOut = 1 - progress;
    const hue = GOLD_HUES[i % GOLD_HUES.length];
    const sat = 55 + e * 25;
    const light = 55 + e * 18;
    // 震动脉冲：线条粗细随能量跳动
    const pulse = 1 + Math.sin(time * 3 + i * 0.7) * (0.2 + e * 0.5);
    const alpha = fadeOut * (0.14 + e * 0.28) * pulse;
    const lw = (3.5 + e * 4) * fadeOut * pulse;

    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `hsla(${hue}, ${sat}%, ${light}%, ${Math.min(alpha, 0.6)})`;
    ctx.lineWidth = Math.max(lw, 0.5);
    ctx.stroke();

    // 每圈的内发光（双层金属感）
    if (e > 0.1) {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `hsla(${hue}, ${sat + 15}%, ${light + 18}%, ${alpha * 0.3})`;
      ctx.lineWidth = lw * 2.5;
      ctx.stroke();
    }
  }

  // ── 第3层：频率波纹（正弦圆环 × 金色调） ──
  const freqRings = 5 + Math.floor(e * 4);
  for (let i = 0; i < freqRings; i++) {
    const baseR = 25 + i * 28 + e * 18;
    const hue = (i * 8 + 38 + time * 8) % 360; // 以金色为中心微变
    const wobbleAmp = (3 + e * 8) * (1 + Math.sin(time * 2.5 + i) * 0.3);
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2; a += 0.015) {
      const wobble = Math.sin(a * 10 + time * 1.2 + i * 1.5) * wobbleAmp
                   + Math.sin(a * 6 + time * 0.8 + i * 0.9) * wobbleAmp * 0.4;
      const r = baseR + wobble;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
    const alpha = (0.15 + e * 0.22) * (1 - i * 0.08);
    ctx.strokeStyle = `hsla(${hue}, 50%, ${58 + e * 12}%, ${Math.min(alpha, 0.5)})`;
    ctx.lineWidth = (1.5 + e * 2.5) * (1 - i * 0.05);
    ctx.stroke();
  }

  // ── 第4层：金色频率闪烁线（随震动的亮线） ──
  if (e > 0.05) {
    const shimmerCount = 6 + Math.floor(e * 8);
    for (let i = 0; i < shimmerCount; i++) {
      const angle = (i / shimmerCount) * Math.PI * 2 + time * 0.4;
      const len = 40 + e * 60 + Math.sin(time * 4 + i * 1.3) * 20;
      const startR = 30 + e * 10;
      const x1 = cx + Math.cos(angle) * startR;
      const y1 = cy + Math.sin(angle) * startR;
      const x2 = cx + Math.cos(angle) * (startR + len);
      const y2 = cy + Math.sin(angle) * (startR + len);
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      const shimmerAlpha = (0.15 + e * 0.25) * (0.5 + Math.sin(time * 5 + i * 2) * 0.5);
      grad.addColorStop(0, `hsla(45, 80%, 75%, ${shimmerAlpha})`);
      grad.addColorStop(0.5, `hsla(50, 70%, 68%, ${shimmerAlpha * 0.5})`);
      grad.addColorStop(1, 'hsla(45, 60%, 65%, 0)');
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2 + e * 2;
      ctx.stroke();
    }
  }

  // ── 第5层：钵口椭圆（精致金色轮廓） ──
  ctx.beginPath();
  ctx.ellipse(cx, cy, 38 + e * 12, 16 + e * 6, 0, 0, Math.PI * 2);
  const bowlRimGrad = ctx.createLinearGradient(cx - 50, cy, cx + 50, cy);
  bowlRimGrad.addColorStop(0, `hsla(40, 60%, 65%, ${0.15 + e * 0.15})`);
  bowlRimGrad.addColorStop(0.5, `hsla(45, 75%, 78%, ${0.25 + e * 0.25})`);
  bowlRimGrad.addColorStop(1, `hsla(40, 60%, 65%, ${0.15 + e * 0.15})`);
  ctx.strokeStyle = bowlRimGrad;
  ctx.lineWidth = 2 + e * 2;
  ctx.stroke();

  // ── 第6层：莲瓣曼陀罗（钵体装饰，双层金调） ──
  const petalCount = 8;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.08);
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const pr = 28 + e * 12;
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(angle) * pr * 0.55,
      Math.sin(angle) * pr * 0.55,
      10 + e * 5, 3.5 + e * 2,
      angle, 0, Math.PI * 2,
    );
    const petalHue = (i * 8 + 35) % 60 + 30; // 金色系微变
    ctx.fillStyle = `hsla(${petalHue}, 50%, 65%, ${0.05 + e * 0.07})`;
    ctx.fill();
    ctx.strokeStyle = `hsla(${petalHue}, 60%, 72%, ${0.08 + e * 0.10})`;
    ctx.lineWidth = 0.8;
    ctx.stroke();
  }
  ctx.restore();

  // 内层8瓣（反向旋转，更精致）
  if (e > 0.05) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-time * 0.06);
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const pr = 18 + e * 8;
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(angle) * pr * 0.55,
        Math.sin(angle) * pr * 0.55,
        7 + e * 3, 2.5 + e * 1.5,
        angle, 0, Math.PI * 2,
      );
      ctx.fillStyle = `hsla(42, 55%, 70%, ${0.04 + e * 0.06})`;
      ctx.fill();
    }
    ctx.restore();
  }

  // ── 第7层：外围装饰光弧（金色调，更含蓄） ──
  for (let i = 0; i < 3; i++) {
    const arcR = maxR * (0.7 + i * 0.12);
    const startAngle = time * (0.2 + i * 0.1) + i * Math.PI * 0.7;
    const sweep = Math.PI * (0.3 + e * 0.4);
    const arcHue = (40 + i * 5 + time * 5) % 60 + 30; // 金色系
    ctx.beginPath();
    ctx.arc(cx, cy, arcR, startAngle, startAngle + sweep);
    ctx.strokeStyle = `hsla(${arcHue}, 45%, 62%, ${0.06 + e * 0.10})`;
    ctx.lineWidth = 2 + e * 2;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.lineCap = 'butt';
  }
}

// ===== 绘制函数：脉轮 =====
// 七脉轮传统莲瓣数：根4·腹6·脐10·心12·喉16·眉心2·顶轮千瓣(以32近似)
const CHAKRA_PETALS = [4, 6, 10, 12, 16, 2, 32];

function drawChakra(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, e: number) {
  const cx = w * 0.5;
  const cy = h * 0.50;
  const baseR = Math.min(w, h) * 0.35;

  // ── 第1层：深漆暗角晕影（营造沉浸空间感） ──
  const vignette = ctx.createRadialGradient(cx, cy, baseR * 0.5, cx, cy, Math.max(w, h) * 0.75);
  vignette.addColorStop(0, 'hsla(36, 25%, 4%, 0)');
  vignette.addColorStop(0.5, 'hsla(36, 25%, 3%, 0.15)');
  vignette.addColorStop(1, 'hsla(36, 25%, 2%, 0.45)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  // ── 第2层：中脉 Sushumna（金色能量通道，七色渐变） ──
  const sushumnaGrad = ctx.createLinearGradient(cx, h * 0.05, cx, h * 0.95);
  sushumnaGrad.addColorStop(0,    `hsla(280, 55%, 62%, ${0.08 + e * 0.06})`);
  sushumnaGrad.addColorStop(0.17, `hsla(240, 50%, 62%, ${0.07 + e * 0.05})`);
  sushumnaGrad.addColorStop(0.34, `hsla(190, 45%, 62%, ${0.06 + e * 0.04})`);
  sushumnaGrad.addColorStop(0.50, `hsla(120, 50%, 62%, ${0.06 + e * 0.04})`);
  sushumnaGrad.addColorStop(0.66, `hsla(35,  60%, 62%, ${0.07 + e * 0.05})`);
  sushumnaGrad.addColorStop(0.83, `hsla(25,  55%, 62%, ${0.08 + e * 0.05})`);
  sushumnaGrad.addColorStop(1,    `hsla(0,   55%, 62%, ${0.08 + e * 0.06})`);
  ctx.strokeStyle = sushumnaGrad;
  ctx.lineWidth = 3 + e * 4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(cx, h * 0.05);
  ctx.lineTo(cx, h * 0.95);
  ctx.stroke();
  ctx.lineCap = 'butt';

  // ── 第3层：七脉轮莲瓣光球（传统花瓣数 + 径向发光 + 核心） ──
  for (let i = 0; i < CHAKRAS.length; i++) {
    const ch = CHAKRAS[i];
    const y = ch.y * h;
    const pulse = 1 + Math.sin(time * 0.7 + i * 0.9) * 0.12 + e * 0.25;
    const orbR = (7 + e * 7) * pulse;
    const petalCount = CHAKRA_PETALS[i];

    // 外层弥散光晕
    const glow = ctx.createRadialGradient(cx, y, 0, cx, y, orbR * 4.5);
    glow.addColorStop(0, `hsla(${ch.hue}, ${ch.sat}%, 68%, ${0.22 + e * 0.18})`);
    glow.addColorStop(0.3, `hsla(${ch.hue}, ${ch.sat}%, 55%, ${0.10 + e * 0.08})`);
    glow.addColorStop(1, `hsla(${ch.hue}, ${ch.sat - 20}%, 40%, 0)`);
    ctx.fillStyle = glow;
    ctx.fillRect(cx - orbR * 4.5, y - orbR * 4.5, orbR * 9, orbR * 9);

    // 莲花瓣（传统数量，随能量展开）
    if (petalCount > 0 && e > 0.02) {
      ctx.save();
      ctx.translate(cx, y);
      ctx.rotate(time * 0.08 + i * 0.3);
      const petalR = orbR * 2.8;
      const petalOpen = Math.min(1, e * 2.5); // 能量越高花瓣越展开
      for (let p = 0; p < petalCount; p++) {
        const angle = (p / petalCount) * Math.PI * 2;
        ctx.beginPath();
        ctx.ellipse(
          Math.cos(angle) * petalR * 0.45 * petalOpen,
          Math.sin(angle) * petalR * 0.45 * petalOpen,
          petalR * 0.38, petalR * 0.12,
          angle, 0, Math.PI * 2,
        );
        ctx.fillStyle = `hsla(${ch.hue}, ${ch.sat}%, 65%, ${0.05 + e * 0.07})`;
        ctx.fill();
        ctx.strokeStyle = `hsla(${ch.hue}, ${ch.sat + 10}%, 72%, ${0.08 + e * 0.10})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }
      ctx.restore();
    }

    // 顶轮千瓣效果（高能量时绽放多层）
    if (i === 6 && e > 0.08) {
      ctx.save();
      ctx.translate(cx, y);
      ctx.rotate(time * 0.04);
      for (let layer = 0; layer < 3; layer++) {
        const layerR = orbR * (2.5 + layer * 0.8);
        const layerPetals = 24;
        for (let p = 0; p < layerPetals; p++) {
          const angle = (p / layerPetals) * Math.PI * 2 + layer * 0.2;
          ctx.beginPath();
          ctx.ellipse(
            Math.cos(angle) * layerR * 0.6,
            Math.sin(angle) * layerR * 0.6,
            layerR * 0.22, layerR * 0.06,
            angle, 0, Math.PI * 2,
          );
          ctx.fillStyle = `hsla(280, 45%, 65%, ${0.02 + e * 0.03 - layer * 0.005})`;
          ctx.fill();
        }
      }
      ctx.restore();
    }

    // 脉轮核心光球（径向渐变，更精致）
    const coreR = orbR * 0.55;
    const coreGrad = ctx.createRadialGradient(cx, y, 0, cx, y, coreR);
    coreGrad.addColorStop(0, `hsla(${ch.hue}, ${ch.sat + 15}%, 80%, ${0.55 + e * 0.30})`);
    coreGrad.addColorStop(0.5, `hsla(${ch.hue}, ${ch.sat}%, 65%, ${0.35 + e * 0.20})`);
    coreGrad.addColorStop(1, `hsla(${ch.hue}, ${ch.sat}%, 55%, 0)`);
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, y, coreR, 0, Math.PI * 2);
    ctx.fill();

    // 核心亮点
    ctx.beginPath();
    ctx.arc(cx, y, Math.max(1.5, orbR * 0.18), 0, Math.PI * 2);
    ctx.fillStyle = `hsla(${ch.hue}, ${ch.sat + 20}%, 88%, ${0.60 + e * 0.30})`;
    ctx.fill();
  }

  // ── 第4层：神圣几何（生命之花，能量激活时显现） ──
  if (e > 0.04) {
    const geoR = baseR * 0.32;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(time * 0.02);
    ctx.strokeStyle = `hsla(45, 35%, 68%, ${0.04 + e * 0.06})`;
    ctx.lineWidth = 0.7;
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const ox = Math.cos(angle) * geoR * 0.5;
      const oy = Math.sin(angle) * geoR * 0.5;
      ctx.beginPath();
      ctx.arc(ox, oy, geoR * 0.5, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(0, 0, geoR * 0.5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // ── 第5层：外层旋转曼陀罗（24瓣，金属色调） ──
  const mandalaR = baseR * 0.85;
  const mandalaPetals = 24;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(time * 0.05);
  for (let i = 0; i < mandalaPetals; i++) {
    const angle = (i / mandalaPetals) * Math.PI * 2;
    const petalLen = mandalaR * (0.28 + e * 0.12);
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(angle) * mandalaR * 0.62,
      Math.sin(angle) * mandalaR * 0.62,
      petalLen * 0.5, petalLen * 0.13,
      angle, 0, Math.PI * 2,
    );
    ctx.fillStyle = `hsla(${(i * 15) % 360}, 30%, 60%, ${0.025 + e * 0.035})`;
    ctx.fill();
    ctx.strokeStyle = `hsla(45, 25%, 65%, ${0.02 + e * 0.03})`;
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }
  ctx.restore();

  // ── 第6层：外环细线（精致金线） ──
  ctx.beginPath();
  ctx.arc(cx, cy, mandalaR * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = `hsla(45, 30%, 65%, ${0.06 + e * 0.05})`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // 内环
  ctx.beginPath();
  ctx.arc(cx, cy, baseR * 0.35, 0, Math.PI * 2);
  ctx.strokeStyle = `hsla(45, 25%, 60%, ${0.04 + e * 0.04})`;
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

// ===== 组件 =====
const HealingCanvas = forwardRef<HealingCanvasHandle, HealingCanvasProps>(
  function HealingCanvasInner(
    { energy = 0, analyserNode = null, config = HEALING_PRESET_WUYIN, className, style,
      breathPhase, breathProgress, jueColor },
    ref,
  ) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animRef = useRef<number>(0);
    const energyRef = useRef(0);
    const configRef = useRef(config);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const breathPhaseRef = useRef<string>('idle');
    const breathProgressRef = useRef<number>(0);
    const jueColorRef = useRef<string>('#4ADE80');

    // 同步更新 refs
    useEffect(() => { energyRef.current = energy; }, [energy]);
    useEffect(() => { configRef.current = config; }, [config]);
    useEffect(() => { analyserRef.current = analyserNode ?? null; }, [analyserNode]);
    useEffect(() => { breathPhaseRef.current = breathPhase ?? 'idle'; }, [breathPhase]);
    useEffect(() => { breathProgressRef.current = breathProgress ?? 0; }, [breathProgress]);
    useEffect(() => { jueColorRef.current = jueColor ?? '#4ADE80'; }, [jueColor]);

    useImperativeHandle(ref, () => ({
      spawnBurst(x?: number, y?: number) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const cfg = configRef.current;
        const cx = x ?? rect.width * (cfg.spawnCenterX ?? 0.5);
        const cy = y ?? rect.height * (cfg.spawnCenterY ?? 0.5);
        canvas.dispatchEvent(new CustomEvent('healing-spawn', { detail: { x: cx, y: cy } }));
      },
      addRipple(x: number, y: number, color?: string) {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.dispatchEvent(new CustomEvent('healing-ripple', { detail: { x, y, color: color ?? '#C4A35A' } }));
      },
    }));

    // 核心动画 useEffect — 挂载时启动，卸载时清理
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // getContext 在 canvas 已挂载的情况下不会返回 null
      const ctx = canvas.getContext('2d')!;

      const cfg = configRef.current;
      const visMode = cfg.visMode ?? 'wuyin';

      // Resize 逻辑 — 确保 canvas 像素尺寸与 CSS 尺寸匹配
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const rect = canvas!.getBoundingClientRect();
        // 避免在布局未完成时设置无效尺寸
        if (rect.width < 1 || rect.height < 1) return;
        canvas!.width = rect.width * dpr;
        canvas!.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener('resize', resize);

      // 延迟二次 resize，确保容器布局完成
      const resizeTimer = setTimeout(resize, 100);

      // 粒子池
      const maxP = cfg.maxParticles ?? 60;
      const particles: Particle[] = [];

      function spawnP(cx: number, cy: number, e: number) {
        if (particles.length >= maxP) return;
        const a = Math.random() * Math.PI * 2;
        const baseSize = cfg.particleBaseSize ?? 2.5;
        const eMul = cfg.particleEnergyMul ?? 4;
        const speed = (0.2 + Math.random() * 0.5) * (0.3 + e * 0.7);
        const hueCenter = cfg.particleHueCenter ?? 42;
        const hueWidth = cfg.particleHueWidth ?? 20;
        particles.push({
          x: cx + (Math.random() - 0.5) * 30,
          y: cy + (Math.random() - 0.5) * 30,
          vx: Math.cos(a) * speed,
          vy: Math.sin(a) * speed - 0.12,
          life: 1,
          maxLife: 90 + Math.random() * 100,
          size: baseSize + Math.random() * baseSize * 0.5 + e * eMul * 0.25,
          hue: hueCenter + Math.random() * hueWidth,
          sat: 55 + Math.random() * 25,
          light: 55 + Math.random() * 15,
        });
      }

      const ripples: Ripple[] = [];

      const handleSpawn = (e: Event) => {
        const d = (e as CustomEvent).detail;
        for (let i = 0; i < 6; i++) spawnP(d.x, d.y, 0.5);
      };
      const handleRipple = (e: Event) => {
        const d = (e as CustomEvent).detail;
        ripples.push({ x: d.x, y: d.y, radius: 0, maxRadius: 50 + Math.random() * 30, life: 1, color: d.color ?? '#C4A35A' });
        for (let i = 0; i < 4; i++) spawnP(d.x, d.y, 0.3);
      };
      canvas.addEventListener('healing-spawn', handleSpawn);
      canvas.addEventListener('healing-ripple', handleRipple);

      let interactiveHandler: ((e: MouseEvent) => void) | null = null;
      if (cfg.interactive !== false) {
        interactiveHandler = (e: MouseEvent) => {
        const rect = canvas!.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          ripples.push({ x, y, radius: 0, maxRadius: 50 + Math.random() * 30, life: 1, color: '#C4A35A' });
          for (let i = 0; i < 4; i++) spawnP(x, y, 0.4);
        };
        canvas.addEventListener('click', interactiveHandler);
      }

      let frame = 0;
      let prevEnergySmooth = 0;

      // ── 五音模式专用：可冻结的波浪时间 ──
      let waveTime = 0;
      let waveFreezeSpeed = 0; // 0=冻结 1=全速，平滑过渡

      // ── 五音模式专用：频段能量缓存 ──
      const BINS_PER_BAND = 20;
      const FREQ_START_BIN = 2;

      function draw() {
        animRef.current = requestAnimationFrame(draw);
        frame++;
        const rect = canvas!.getBoundingClientRect();
        const w = rect.width;
        const h = rect.height;
        if (w < 1 || h < 1) return;
        const time = frame * 0.005;
        const e = energyRef.current;
        const smoothE = prevEnergySmooth * 0.85 + e * 0.15;
        prevEnergySmooth = smoothE;

        // ── 从 analyser 读取逐频段能量（五音模式专属） ──
        const bandEnergies = [0, 0, 0, 0, 0];
        const analyser = analyserRef.current;
        if (analyser && visMode === 'wuyin') {
          const freqArr = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(freqArr);
          const binCount = analyser.frequencyBinCount;
          for (let i = 0; i < 5; i++) {
            let sum = 0;
            const start = FREQ_START_BIN + i * BINS_PER_BAND;
            for (let j = start; j < start + BINS_PER_BAND && j < binCount; j++) {
              sum += freqArr[j];
            }
            bandEnergies[i] = sum / (BINS_PER_BAND * 255);
          }
        }

        // ── 波浪冻结/解冻：音乐播放时流动，停止时优雅静止 ──
        const hasAnyEnergy = smoothE > 0.015 || bandEnergies.some(be => be > 0.02);
        const targetFreeze = hasAnyEnergy ? 1 : 0;
        waveFreezeSpeed += (targetFreeze - waveFreezeSpeed) * 0.04;
        waveTime += 0.005 * waveFreezeSpeed;

        // 背景
        const bgCenter = cfg.bgColorCenter ?? '#FDF8F0';
        const bgEdge = cfg.bgColorEdge ?? '#F0E8D8';
        const bg = ctx.createRadialGradient(w * 0.5, h * 0.4, 0, w * 0.5, h * 0.4, Math.max(w, h) * 0.75);
        bg.addColorStop(0, bgCenter);
        bg.addColorStop(0.6, bgEdge);
        bg.addColorStop(1, '#E8DFD0');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, w, h);

        // 专属可视化
        if (visMode === 'wuyin') {
          drawWuyin(ctx, w, h, waveTime, smoothE, bandEnergies);
        } else if (visMode === 'liuzijue') {
          drawLiuzijue(ctx, w, h, time, smoothE, breathPhaseRef.current, breathProgressRef.current, jueColorRef.current);
        } else if (visMode === 'bowl') {
          drawBowl(ctx, w, h, time, smoothE);
        } else if (visMode === 'chakra') {
          drawChakra(ctx, w, h, time, smoothE);
        }

        // 粒子（仅在能量 > 阈值时生成，六字诀模式禁用金色粒子保持纯净化）
        if (visMode !== 'liuzijue' && smoothE > 0.01 && frame % 3 === 0 && maxP > 0) {
          const count = Math.ceil(smoothE * 3);
          const scx = w * (cfg.spawnCenterX ?? 0.5);
          const scy = h * (cfg.spawnCenterY ?? 0.45);
          for (let i = 0; i < count; i++) {
            spawnP(scx + (Math.random() - 0.5) * w * 0.4, scy + (Math.random() - 0.5) * h * 0.3, smoothE);
          }
        }

        // 绘制粒子（六字诀模式禁用，保持呼吸球纯净视觉）
        if (visMode !== 'liuzijue') {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx; p.y += p.vy;
          p.vx *= 0.988; p.vy *= 0.988;
          p.life -= 1 / p.maxLife;
          if (p.life <= 0) { particles.splice(i, 1); continue; }
          const a = p.life * 0.6;
          const sz = p.size * (0.4 + p.life * 0.6);
          const glowR = sz * 4;
          const gl = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowR);
          gl.addColorStop(0, `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${a * 0.3})`);
          gl.addColorStop(0.3, `hsla(${p.hue}, ${p.sat}%, ${p.light - 10}%, ${a * 0.1})`);
          gl.addColorStop(1, `hsla(${p.hue}, ${p.sat}%, ${p.light - 20}%, 0)`);
          ctx.fillStyle = gl;
          ctx.fillRect(p.x - glowR, p.y - glowR, glowR * 2, glowR * 2);
          ctx.beginPath();
          ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light + 10}%, ${a * 0.6})`;
          ctx.fill();
        }
        } // end if visMode !== liuzijue

        // 涟漪（六字诀模式由呼吸球自身处理，不需要额外涟漪）
        if (visMode !== 'liuzijue') {
        for (let i = ripples.length - 1; i >= 0; i--) {
          const rp = ripples[i];
          rp.radius += 1.2;
          rp.life -= 0.018;
          if (rp.life <= 0) { ripples.splice(i, 1); continue; }
          ctx.beginPath();
          ctx.arc(rp.x, rp.y, rp.radius, 0, Math.PI * 2);
          ctx.strokeStyle = rp.color;
          ctx.globalAlpha = rp.life * 0.25;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
        } // end if visMode !== liuzijue

        // 微弱宣纸肌理
        if (frame % 60 === 0) {
          ctx.globalAlpha = 0.012;
          for (let i = 0; i < 20; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.5 + 0.3, 0, Math.PI * 2);
            ctx.fillStyle = '#8B7355';
            ctx.fill();
          }
          ctx.globalAlpha = 1;
        }
      }

      draw();

      return () => {
        cancelAnimationFrame(animRef.current);
        clearTimeout(resizeTimer);
        window.removeEventListener('resize', resize);
        canvas.removeEventListener('healing-spawn', handleSpawn);
        canvas.removeEventListener('healing-ripple', handleRipple);
        if (interactiveHandler) canvas.removeEventListener('click', interactiveHandler);
      };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full ${className ?? ''}`}
        style={{ background: config.bgColorCenter ?? '#FDF8F0', ...style }}
      />
    );
  },
);

HealingCanvas.displayName = 'HealingCanvas';
export default HealingCanvas;
