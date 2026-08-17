export interface HealingTheme {
  key: string;
  bgGradient: string;
  particleHueRange: [number, number];
  particleStyle: 'float' | 'rise' | 'fall' | 'drift' | 'burst';
  glowColor: string;
  spectrumHue: number;
  ambientBlur: string;
  accentColor: string;
  accentRgb: string;
  textPrimary: string;
  textSecondary: string;
  specialEffect: string;
}

export const COOL_WATER: HealingTheme = {
  key: 'cool-water',
  bgGradient: 'linear-gradient(180deg, #0a1628 0%, #0d2137 30%, #0f2a3d 60%, #071520 100%)',
  particleHueRange: [190, 220],
  particleStyle: 'fall',
  glowColor: 'rgba(100, 200, 240, 0.12)',
  spectrumHue: 200,
  ambientBlur: 'rgba(20, 100, 160, 0.5)',
  accentColor: '#67e8f9',
  accentRgb: '103,232,249',
  textPrimary: 'rgba(220, 245, 255, 0.95)',
  textSecondary: 'rgba(160, 210, 240, 0.5)',
  specialEffect: '冰晶粒子下落 + 凉风波纹',
};

export const WARM_FIRE: HealingTheme = {
  key: 'warm-fire',
  bgGradient: 'linear-gradient(180deg, #1a0e05 0%, #2d1810 30%, #3d1f10 60%, #1a0c05 100%)',
  particleHueRange: [15, 50],
  particleStyle: 'rise',
  glowColor: 'rgba(255, 160, 60, 0.12)',
  spectrumHue: 30,
  ambientBlur: 'rgba(180, 80, 20, 0.5)',
  accentColor: '#fb923c',
  accentRgb: '251,146,60',
  textPrimary: 'rgba(255, 240, 220, 0.95)',
  textSecondary: 'rgba(220, 180, 140, 0.5)',
  specialEffect: '火焰粒子上升 + 热力脉动辉光',
};

export const MOIST_WATER: HealingTheme = {
  key: 'moist-water',
  bgGradient: 'linear-gradient(180deg, #050d1a 0%, #0a1a30 30%, #0d2040 60%, #040c18 100%)',
  particleHueRange: [200, 240],
  particleStyle: 'fall',
  glowColor: 'rgba(80, 150, 220, 0.10)',
  spectrumHue: 220,
  ambientBlur: 'rgba(30, 80, 160, 0.5)',
  accentColor: '#60a5fa',
  accentRgb: '96,165,250',
  textPrimary: 'rgba(210, 230, 255, 0.95)',
  textSecondary: 'rgba(140, 180, 220, 0.5)',
  specialEffect: '雨滴粒子下落 + 涟漪扩散',
};

export const GROW_WOOD: HealingTheme = {
  key: 'grow-wood',
  bgGradient: 'linear-gradient(180deg, #050f0a 0%, #0a2018 30%, #0d2a1a 60%, #040d08 100%)',
  particleHueRange: [120, 160],
  particleStyle: 'rise',
  glowColor: 'rgba(80, 200, 120, 0.10)',
  spectrumHue: 140,
  ambientBlur: 'rgba(20, 120, 50, 0.5)',
  accentColor: '#34d399',
  accentRgb: '52,211,153',
  textPrimary: 'rgba(220, 255, 235, 0.95)',
  textSecondary: 'rgba(140, 210, 170, 0.5)',
  specialEffect: '藤蔓粒子上升 + 生长脉动',
};

export const DAWN_GLOW: HealingTheme = {
  key: 'dawn-glow',
  bgGradient: 'linear-gradient(180deg, #1a0a1e 0%, #2d1225 30%, #3d1a2a 60%, #1a0c18 100%)',
  particleHueRange: [330, 30],
  particleStyle: 'float',
  glowColor: 'rgba(255, 140, 180, 0.12)',
  spectrumHue: 350,
  ambientBlur: 'rgba(160, 40, 80, 0.45)',
  accentColor: '#f472b6',
  accentRgb: '244,114,182',
  textPrimary: 'rgba(255, 230, 240, 0.95)',
  textSecondary: 'rgba(220, 160, 190, 0.5)',
  specialEffect: '霞光粒子漂浮 + 光线扩散',
};

export const GOLDEN_EARTH: HealingTheme = {
  key: 'golden-earth',
  bgGradient: 'linear-gradient(180deg, #1a1005 0%, #2d1e0a 30%, #3a2510 60%, #150d03 100%)',
  particleHueRange: [30, 55],
  particleStyle: 'drift',
  glowColor: 'rgba(220, 170, 80, 0.10)',
  spectrumHue: 40,
  ambientBlur: 'rgba(140, 90, 20, 0.5)',
  accentColor: '#fbbf24',
  accentRgb: '251,191,36',
  textPrimary: 'rgba(255, 240, 200, 0.95)',
  textSecondary: 'rgba(200, 170, 120, 0.5)',
  specialEffect: '琥珀粒子缓飘 + 暖光呼吸',
};

export const FRESH_WOOD: HealingTheme = {
  key: 'fresh-wood',
  bgGradient: 'linear-gradient(180deg, #050f0a 0%, #0a1a12 30%, #0d2015 60%, #040d07 100%)',
  particleHueRange: [100, 150],
  particleStyle: 'drift',
  glowColor: 'rgba(100, 200, 120, 0.10)',
  spectrumHue: 130,
  ambientBlur: 'rgba(30, 100, 40, 0.45)',
  accentColor: '#34d399',
  accentRgb: '52,211,153',
  textPrimary: 'rgba(220, 255, 230, 0.95)',
  textSecondary: 'rgba(140, 200, 160, 0.5)',
  specialEffect: '绿叶粒子飘动 + 清风涟漪',
};

export const BRIGHT_METAL: HealingTheme = {
  key: 'bright-metal',
  bgGradient: 'linear-gradient(180deg, #101018 0%, #1a1a28 30%, #20202f 60%, #0a0a12 100%)',
  particleHueRange: [210, 250],
  particleStyle: 'float',
  glowColor: 'rgba(180, 200, 230, 0.12)',
  spectrumHue: 230,
  ambientBlur: 'rgba(80, 100, 140, 0.5)',
  accentColor: '#94a3b8',
  accentRgb: '148,163,184',
  textPrimary: 'rgba(230, 240, 255, 0.95)',
  textSecondary: 'rgba(160, 180, 210, 0.5)',
  specialEffect: '银白粒子漂浮 + 破雾之光',
};

export const PIERCE_METAL: HealingTheme = {
  key: 'pierce-metal',
  bgGradient: 'linear-gradient(180deg, #0d0d14 0%, #151520 30%, #1a1a28 60%, #08080e 100%)',
  particleHueRange: [200, 240],
  particleStyle: 'drift',
  glowColor: 'rgba(200, 210, 240, 0.08)',
  spectrumHue: 220,
  ambientBlur: 'rgba(60, 70, 100, 0.5)',
  accentColor: '#a5b4fc',
  accentRgb: '165,180,252',
  textPrimary: 'rgba(230, 235, 255, 0.95)',
  textSecondary: 'rgba(160, 170, 200, 0.5)',
  specialEffect: '光束穿透雾层 + 粒子缓飘',
};

export const COZY_EARTH: HealingTheme = {
  key: 'cozy-earth',
  bgGradient: 'linear-gradient(180deg, #120805 0%, #1e120a 30%, #281810 60%, #0d0603 100%)',
  particleHueRange: [25, 50],
  particleStyle: 'float',
  glowColor: 'rgba(200, 150, 80, 0.12)',
  spectrumHue: 35,
  ambientBlur: 'rgba(120, 70, 20, 0.5)',
  accentColor: '#d97706',
  accentRgb: '217,119,6',
  textPrimary: 'rgba(255, 235, 200, 0.95)',
  textSecondary: 'rgba(200, 170, 120, 0.5)',
  specialEffect: '琥珀粒子缓飘 + 壁炉暖光呼吸',
};

export const MEDITATE_WATER: HealingTheme = {
  key: 'meditate-water',
  bgGradient: 'linear-gradient(180deg, #030712 0%, #0a1020 30%, #0d1530 60%, #020508 100%)',
  particleHueRange: [220, 260],
  particleStyle: 'float',
  glowColor: 'rgba(80, 100, 180, 0.08)',
  spectrumHue: 240,
  ambientBlur: 'rgba(30, 40, 100, 0.5)',
  accentColor: '#818cf8',
  accentRgb: '129,140,248',
  textPrimary: 'rgba(220, 225, 255, 0.95)',
  textSecondary: 'rgba(140, 150, 200, 0.5)',
  specialEffect: '星尘缓飘 + 月光呼吸',
};

export const DEFAULT_THEME: HealingTheme = {
  key: 'default',
  bgGradient: 'linear-gradient(180deg, #080418 0%, #0d0825 30%, #100a2a 60%, #050312 100%)',
  particleHueRange: [240, 300],
  particleStyle: 'float',
  glowColor: 'rgba(100, 80, 160, 0.08)',
  spectrumHue: 260,
  ambientBlur: 'rgba(60, 40, 120, 0.5)',
  accentColor: '#00F5D4',
  accentRgb: '0,245,212',
  textPrimary: 'rgba(255,255,255,0.95)',
  textSecondary: 'rgba(255,255,255,0.5)',
  specialEffect: '粒子缓飘 + 柔和辉光',
};
