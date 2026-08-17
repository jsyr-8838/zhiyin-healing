/**
 * Design Tokens — zhi-yin
 * 
 * 与 globals.css CSS变量保持一致，提供JS端程序化访问。
 * 页面样式中优先使用 Tailwind class（已通过 @theme inline 映射），
 * 仅在需要动态计算（如shadow-glow、条件色值）时引用此文件。
 */

export const color = {
  /** 五行色板 — 与 globals.css :root 完全对应 */
  wood:   { 50:'#eef5ef', 100:'#d4e8d6', 200:'#aedbb3', 300:'#82c78a', 400:'#5d8a63', 500:'#4d7653', 600:'#3d6142', 700:'#2e4a32', 800:'#1e3322', 900:'#0f1a11' },
  fire:   { 50:'#fdf0ee', 100:'#f8d9d6', 200:'#f0b3ad', 300:'#e58d85', 400:'#c26158', 500:'#ab534b', 600:'#9c4440', 700:'#7a3532', 800:'#592624', 900:'#381816' },
  earth:  { 50:'#fdf8e8', 100:'#f9edd0', 200:'#f0dba0', 300:'#e5c870', 400:'#c9a94f', 500:'#b59844', 600:'#a68b3a', 700:'#826c2d', 800:'#5e4e20', 900:'#3a3013' },
  metal:  { 50:'#f0f4f3', 100:'#dce6e4', 200:'#b9ccc9', 300:'#96b3af', 400:'#8fa6a0', 500:'#7d9690', 600:'#6c8580', 700:'#536662', 800:'#3a4744', 900:'#212927' },
  water:  { 50:'#ecf6f5', 100:'#cfeae8', 200:'#9fd5d1', 300:'#70c0ba', 400:'#5ba09a', 500:'#4d8d88', 600:'#3d7a75', 700:'#2e5e5a', 800:'#1f4140', 900:'#0f2322' },

  /** 宣纸墨色系 */
  paper:  { 50:'#faf7f0', 100:'#f4ede0', 200:'#e8dfd0', 300:'#d2c9b8', 400:'#b5ab98', 500:'#968c78', 600:'#786f5e', 700:'#5a5244', 800:'#3a5545', 900:'#1e2d26' },

  /** 修饰色 */
  rouge: '#bf5a52',
  apricot: '#e8b87a',
  jade: '#7ec4b5',
  indigo: '#4a6880',
  ochre: '#c28a5a',

  /** 刮痧朱砂体系（逐步迁移到fire色系） */
  zhusha: { main:'#5C1A00', light:'#8B2500', bg:'#3E1200' },
  gold:   { main:'#C4A35A', deep:'#B8860B' },
} as const;

/** 五行色key类型 */
export type WuxingKey = keyof typeof color.wood;

/** 获取五行色 */
export function getWuxingColor(element: 'wood' | 'fire' | 'earth' | 'metal' | 'water', shade: number): string {
  const palette = color[element];
  const key = `${shade}` as unknown as keyof typeof palette;
  return palette[key] ?? palette[400];
}

/** 生成五行光晕阴影 */
export function wuxingGlow(element: 'wood' | 'fire' | 'earth' | 'metal' | 'water', intensity: number = 0.12): string {
  const mainColor = color[element][400];
  return `0 0 60px ${mainColor}${Math.round(intensity * 255).toString(16).padStart(2, '0')}`;
}

/** 阴影 */
export const shadow = {
  sm:   '0 2px 12px rgba(30, 45, 38, 0.06)',
  md:   '0 8px 32px rgba(30, 45, 38, 0.10)',
  lg:   '0 24px 64px rgba(30, 45, 38, 0.14)',
  glow: '0 0 24px rgba(93, 138, 99, 0.08)',
} as const;

/** 圆角 */
export const radius = {
  sm:  '12px',
  md:  '20px',
  lg:  '32px',
  xl:  '48px',
} as const;

/** 动效时长 */
export const duration = {
  fast:    '150ms',
  normal:  '300ms',
  slow:    '600ms',
  breathe: '4000ms',
} as const;

/** 缓动函数 */
export const easing = {
  default: 'cubic-bezier(0.4, 0, 0.2, 1)',
  breathe: 'ease-in-out',
  smooth:  'cubic-bezier(.22, .61, .36, 1)',
} as const;
