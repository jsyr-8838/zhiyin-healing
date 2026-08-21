/**
 * 五音疗愈统一数据源
 *
 * 合并了三处重复定义：
 *   1. WUYIN_TONES (wuyin/page.tsx) — 12 字段，最完整
 *   2. WUYIN_FREQ  (audio-engine.ts) — 频率子集
 *   3. FIVE_TONE_TRACKS (classics-reader-data.ts) — 不同颜色值
 *
 * 所有消费方应从此文件导入，不再各自定义。
 */

// ===== 核心类型 =====

export type WuYinKey = 'jiao' | 'zhi' | 'gong' | 'shang' | 'yu';

// ===== 音色体系 =====

/** 波形类型 — 决定基础音色 */
export type TimbreType = 'sine' | 'triangle' | 'square' | 'sawtooth' | 'fm-bell' | 'crystal';

export interface TimbreOption {
  value: TimbreType;
  name: string;
  desc: string;
  icon: string;
}

/** 背景音层 — 叠加环境音 */
export type AmbientType = 'none' | 'water' | 'rain' | 'wind';

export interface AmbientOption {
  value: AmbientType;
  name: string;
  icon: string;
  /** 环境音的近似频率/LFO 参数 */
  lfoFreq: number;
  lfoDepth: number;
  noiseGain: number;
}

/** 波形类型选项 */
export const TIMBRE_OPTIONS: TimbreOption[] = [
  { value: 'sine',     name: '纯音',   desc: '正弦波·纯净无瑕',   icon: '○' },
  { value: 'triangle', name: '柔和',   desc: '三角波·温暖圆润',   icon: '△' },
  { value: 'square',   name: '明亮',   desc: '方波·清脆有力',     icon: '□' },
  { value: 'sawtooth', name: '丰富',   desc: '锯齿波·层次饱满',   icon: '⟋' },
  { value: 'fm-bell',  name: '颂钵',   desc: 'FM合成·空灵悠远',   icon: '碗' },
  { value: 'crystal',  name: '水晶',   desc: '双泛音·清透如水',   icon: '◇' },
];

/** 背景音层选项 */
export const AMBIENT_OPTIONS: AmbientOption[] = [
  { value: 'none',  name: '静默', icon: '—',  lfoFreq: 0,    lfoDepth: 0,    noiseGain: 0 },
  { value: 'water', name: '流水', icon: '水', lfoFreq: 0.3,  lfoDepth: 0.04, noiseGain: 0.08 },
  { value: 'rain',  name: '雨声', icon: '雨', lfoFreq: 0.5,  lfoDepth: 0.02, noiseGain: 0.12 },
  { value: 'wind',  name: '微风', icon: '风', lfoFreq: 0.15, lfoDepth: 0.06, noiseGain: 0.06 },
];

export interface FiveToneData {
  /** 唯一标识 */
  key: WuYinKey;
  /** 汉字名 */
  char: string;
  /** 拼音 */
  pinyin: string;
  /** 五行属性 */
  element: string;
  /** 对应脏腑 */
  organ: string;
  /** 五行展示名 */
  wuxing: string;
  /** 主频率 (Hz) */
  mainFreq: number;
  /** 副频率 (Hz) - 基于索尔菲吉奥频率 */
  subFreq: number;
  /** 泛音频率 (Hz) */
  overtoneFreq: number;
  /** 疗愈描述 */
  desc: string;
  /** 主题色 — 五行标准色 */
  color: string;
  /** 音名 */
  note: string;
  /** 对应 MP3 文件路径 */
  mp3Path: string;
}

// ===== 五音完整数据（单一来源） =====

import { cosUrl } from './cos-url';

export const FIVE_TONES: FiveToneData[] = [
  {
    key: 'jiao', char: '角', pinyin: 'jiǎo', element: '木', organ: '肝',
    wuxing: '角音·木行', mainFreq: 329.63, subFreq: 396, overtoneFreq: 659.25,
    desc: '疏肝解郁·缓解烦躁', color: '#27AE60', note: 'E4',
    mp3Path: cosUrl('/audio/five-tone/jiao.mp3'),
  },
  {
    key: 'zhi', char: '徵', pinyin: 'zhǐ', element: '火', organ: '心',
    wuxing: '徵音·火行', mainFreq: 392.00, subFreq: 528, overtoneFreq: 783.99,
    desc: '养心安神·清心降火', color: '#E74C3C', note: 'G4',
    mp3Path: cosUrl('/audio/five-tone/zhi.mp3'),
  },
  {
    key: 'gong', char: '宫', pinyin: 'gōng', element: '土', organ: '脾',
    wuxing: '宫音·土行', mainFreq: 261.63, subFreq: 417, overtoneFreq: 523.25,
    desc: '健脾和胃·调和中焦', color: '#F39C12', note: 'C4',
    mp3Path: cosUrl('/audio/five-tone/gong.mp3'),
  },
  {
    key: 'shang', char: '商', pinyin: 'shāng', element: '金', organ: '肺',
    wuxing: '商音·金行', mainFreq: 293.66, subFreq: 639, overtoneFreq: 587.33,
    desc: '清肺润燥·宣发肃降', color: '#3498DB', note: 'D4',
    mp3Path: cosUrl('/audio/five-tone/shang.mp3'),
  },
  {
    key: 'yu', char: '羽', pinyin: 'yǔ', element: '水', organ: '肾',
    wuxing: '羽音·水行', mainFreq: 440.00, subFreq: 741, overtoneFreq: 880.00,
    desc: '固肾益精·滋阴潜阳', color: '#1ABC9C', note: 'A4',
    mp3Path: cosUrl('/audio/five-tone/yu.mp3'),
  },
];

// ===== 便捷查找 =====

export const FIVE_TONES_MAP: Record<WuYinKey, FiveToneData> = Object.fromEntries(
  FIVE_TONES.map(t => [t.key, t])
) as Record<WuYinKey, FiveToneData>;

export function getFiveTone(key: WuYinKey): FiveToneData {
  return FIVE_TONES_MAP[key];
}

// ===== 双耳节拍模式 =====

export const BINAURAL_MODES = [
  { value: 0, name: '无', range: '纯音', brainwave: '' },
  { value: 2, name: '德尔塔', range: '0.5-4 Hz · 深度睡眠', brainwave: 'Δ' },
  { value: 6, name: '西塔', range: '4-8 Hz · 冥想', brainwave: 'θ' },
  { value: 10, name: '阿尔法', range: '8-13 Hz · 放松', brainwave: 'α' },
  { value: 20, name: '贝塔', range: '13-30 Hz · 专注', brainwave: 'β' },
] as const;

export type BinauralValue = typeof BINAURAL_MODES[number]['value'];

// ===== 波形调制 =====

export const MODULATIONS = [
  { value: 'none', name: '关闭', freqRate: 0, frequencyDepth: 0, ampRate: 0, amplitudeDepth: 0 },
  { value: 'gentle', name: '柔和', freqRate: 0.1, frequencyDepth: 5, ampRate: 0.08, amplitudeDepth: 0.1 },
  { value: 'breathing', name: '呼吸', freqRate: 0.07, frequencyDepth: 8, ampRate: 0.07, amplitudeDepth: 0.15 },
  { value: 'ocean', name: '海洋', freqRate: 0.05, frequencyDepth: 12, ampRate: 0.03, amplitudeDepth: 0.2 },
] as const;

export type ModulationValue = typeof MODULATIONS[number]['value'];

// ===== 颂钵频率体系 =====

export interface BowlFrequency {
  value: number;
  name: string;
  element: string;
  organ: string;
  icon: string;
  color: string;
}

export const BOWL_FREQUENCIES: BowlFrequency[] = [
  { value: 174, name: '痛症舒缓', element: '水', organ: '肾', icon: '疗', color: '#1a1a2e' },
  { value: 256, name: 'C调·海底轮', element: '土', organ: '脾', icon: 'C', color: '#8B2500' },
  { value: 288, name: 'D调·生殖轮', element: '火', organ: '心', icon: 'D', color: '#C4A35A' },
  { value: 324, name: 'E调·脐轮', element: '木', organ: '肝', icon: 'E', color: '#6E9E74' },
  { value: 342, name: 'F调·心轮', element: '火', organ: '心', icon: 'F', color: '#B8860B' },
  { value: 384, name: 'G调·喉轮', element: '金', organ: '肺', icon: 'G', color: '#5C1A00' },
  { value: 396, name: '释放恐惧', element: '水', organ: '肾', icon: '释', color: '#2C3E50' },
  { value: 417, name: '转化变革', element: '木', organ: '肝', icon: '变', color: '#27AE60' },
  { value: 432, name: 'A调·眉心轮', element: '水', organ: '肾', icon: 'A', color: '#4B0082' },
  { value: 480, name: 'B调·顶轮', element: '火', organ: '心', icon: 'B', color: '#9400D3' },
  { value: 528, name: '爱与修复', element: '火', organ: '心', icon: '爱', color: '#E74C3C' },
  { value: 639, name: '和谐关系', element: '土', organ: '脾', icon: '和', color: '#F39C12' },
  { value: 741, name: '直觉觉醒', element: '金', organ: '肺', icon: '觉', color: '#3498DB' },
  { value: 852, name: '精神回归', element: '水', organ: '肾', icon: '归', color: '#1ABC9C' },
  { value: 963, name: '宇宙连接', element: '火', organ: '心', icon: '宇', color: '#9B59B6' },
];

// ===== 中医五行疗愈预设 =====

export interface TherapyPreset {
  name: string;
  icon: string;
  /** 五音模式使用 tone key, 颂钵模式使用 frequency */
  tone: WuYinKey;
  freq?: number;
  beat: BinauralValue;
  mod: ModulationValue;
  timer: number;
  desc: string;
  color: string;
}

export const WUYIN_PRESETS: TherapyPreset[] = [
  { name: '疏肝解郁', icon: '木', tone: 'jiao', beat: 0, mod: 'none', timer: 15, desc: '角音·肝胆·纯音', color: '#27AE60' },
  { name: '养心安神', icon: '火', tone: 'zhi', beat: 0, mod: 'none', timer: 15, desc: '徵音·心小肠·纯音', color: '#E74C3C' },
  { name: '健脾和胃', icon: '土', tone: 'gong', beat: 0, mod: 'none', timer: 20, desc: '宫音·脾胃·纯音', color: '#F39C12' },
  { name: '清肺润燥', icon: '金', tone: 'shang', beat: 0, mod: 'none', timer: 10, desc: '商音·肺大肠·纯音', color: '#3498DB' },
  { name: '固肾益精', icon: '水', tone: 'yu', beat: 0, mod: 'none', timer: 20, desc: '羽音·肾膀胱·纯音', color: '#1ABC9C' },
  { name: '木火同调', icon: '雷', tone: 'jiao', beat: 0, mod: 'none', timer: 15, desc: '角+徵·肝心同调', color: '#8E44AD' },
  { name: '培土生金', icon: '地', tone: 'gong', beat: 0, mod: 'none', timer: 15, desc: '宫+商·脾肺同调', color: '#D4AC0D' },
];

export const SINGING_BOWL_PRESETS: TherapyPreset[] = [
  { name: '疏肝解郁', icon: '木', tone: 'jiao', freq: 417, beat: 6, mod: 'breathing', timer: 15, desc: '木行·角音·肝胆', color: '#27AE60' },
  { name: '养心安神', icon: '火', tone: 'zhi', freq: 528, beat: 10, mod: 'ocean', timer: 15, desc: '火行·徵音·心小肠', color: '#E74C3C' },
  { name: '健脾化湿', icon: '土', tone: 'gong', freq: 639, beat: 10, mod: 'gentle', timer: 20, desc: '土行·宫音·脾胃', color: '#F39C12' },
  { name: '宣肺理气', icon: '金', tone: 'shang', freq: 741, beat: 20, mod: 'none', timer: 10, desc: '金行·商音·肺大肠', color: '#3498DB' },
  { name: '固肾养精', icon: '水', tone: 'yu', freq: 174, beat: 2, mod: 'gentle', timer: 20, desc: '水行·羽音·肾膀胱', color: '#1a1a2e' },
  { name: '安眠助睡', icon: '月', tone: 'yu', freq: 256, beat: 2, mod: 'breathing', timer: 20, desc: '德尔塔波·深度睡眠', color: '#2C3E50' },
  { name: '缓解焦虑', icon: '心', tone: 'zhi', freq: 396, beat: 10, mod: 'ocean', timer: 15, desc: '阿尔法波·释放恐惧', color: '#8E44AD' },
  { name: '冥想入定', icon: '定', tone: 'jiao', freq: 432, beat: 6, mod: 'breathing', timer: 15, desc: '西塔波·眉心轮', color: '#4B0082' },
  { name: '晨间升阳', icon: '阳', tone: 'zhi', freq: 852, beat: 20, mod: 'gentle', timer: 10, desc: '贝塔波·精神回归', color: '#E67E22' },
  { name: '疼痛舒缓', icon: '愈', tone: 'yu', freq: 174, beat: 2, mod: 'ocean', timer: 20, desc: '德尔塔波·天然镇痛', color: '#16A085' },
  { name: '学习专注', icon: '学', tone: 'gong', freq: 639, beat: 20, mod: 'none', timer: 0, desc: '贝塔波·不限时', color: '#2980B9' },
  { name: '情绪疗愈', icon: '愈', tone: 'zhi', freq: 528, beat: 10, mod: 'ocean', timer: 20, desc: '阿尔法波·爱与修复', color: '#C0392B' },
];

// ===== 脉轮频率 (从 audio-engine.ts 迁移) =====

export const CHAKRA_FREQ: Record<string, number> = {
  root: 256, sacral: 288, solar: 324, heart: 342,
  throat: 384, third: 432, crown: 480,
};

// ===== 颂钵增强：环境音叠加层 =====

export interface AmbientSoundscape {
  id: string;
  name: string;
  icon: string;
  src: string;
  desc: string;
  color: string;
  /** 音量建议 (0~1) */
  defaultVolume: number;
}

export const AMBIENT_SOUNDSCAPES: AmbientSoundscape[] = [
  { id: 'none', name: '静默', icon: '—', src: '', desc: '仅颂钵纯净音', color: '#8B7355', defaultVolume: 0 },
  { id: 'rain', name: '雨声', icon: '雨', src: cosUrl('/audio/singing-bowl/crystalbowls/studio_nature_xiayu.mp3'), desc: '夏日细雨·洗涤心灵', color: '#3498DB', defaultVolume: 0.3 },
  { id: 'snow', name: '雪原', icon: '雪', src: cosUrl('/audio/singing-bowl/crystalbowls/studio_nature_snow_wild.mp3'), desc: '原野落雪·万籁俱寂', color: '#85C1E9', defaultVolume: 0.25 },
  { id: 'crickets', name: '蟋蟀', icon: '虫', src: cosUrl('/audio/singing-bowl/crystalbowls/studio_nature_ququ.mp3'), desc: '秋夜虫鸣·自然安眠', color: '#27AE60', defaultVolume: 0.2 },
  { id: 'owl', name: '猫头鹰', icon: '鸮', src: cosUrl('/audio/singing-bowl/crystalbowls/studio_animal_owl.mp3'), desc: '林间夜鸟·空灵幽远', color: '#8E44AD', defaultVolume: 0.25 },
  { id: 'book', name: '翻书', icon: '书', src: cosUrl('/audio/singing-bowl/crystalbowls/studio_life_book.mp3'), desc: '翻书白噪音·专注学习', color: '#D4AC0D', defaultVolume: 0.2 },
  { id: 'keyboard', name: '键盘', icon: '键', src: cosUrl('/audio/singing-bowl/crystalbowls/studio_life_keyboard.mp3'), desc: '键盘敲击·工作陪伴', color: '#2C3E50', defaultVolume: 0.2 },
];

// ===== 颂钵增强：敲击模式音色 =====

export interface BowlHitSample {
  id: string;
  name: string;
  src: string;
  desc: string;
  /** 对应近似频率 */
  freq: number;
  color: string;
}

export const BOWL_HIT_SAMPLES: BowlHitSample[] = [
  // 真实颂钵敲击（SoundDino 免版税）
  { id: 'hit-decayed', name: '铜钵·衰减', src: cosUrl('/audio/singing-bowl/sounddino/decayed-sound.mp3'), desc: '槌击起音·泛音消散', freq: 432, color: '#8B2500' },
  { id: 'hit-monotonous', name: '铜钵·长鸣', src: cosUrl('/audio/singing-bowl/sounddino/monotonous-sound.mp3'), desc: '持续歌唱·单调嗡鸣', freq: 432, color: '#5C1A00' },
  { id: 'hit-long', name: '铜钵·超长鸣', src: cosUrl('/audio/singing-bowl/sounddino/long-monotonous-sound.mp3'), desc: '62秒长音·冥想音床', freq: 256, color: '#1a1a2e' },
  { id: 'hit-low-quiet', name: '铜钵·低沉', src: cosUrl('/audio/singing-bowl/sounddino/low-quiet-sound.mp3'), desc: '低沉安静·30秒余韵', freq: 174, color: '#2C3E50' },
  { id: 'hit-lingering', name: '铜钵·余音', src: cosUrl('/audio/singing-bowl/sounddino/lingering-sound.mp3'), desc: '槌击余韵·4秒收功', freq: 528, color: '#B8860B' },
  { id: 'hit-short', name: '铜钵·短音', src: cosUrl('/audio/singing-bowl/sounddino/short-sound.mp3'), desc: '清脆短击·1秒收功', freq: 741, color: '#3498DB' },
  { id: 'hit-high', name: '铜钵·高音', src: cosUrl('/audio/singing-bowl/sounddino/high-pitched-sound.mp3'), desc: '高音调·32秒共振', freq: 852, color: '#9B59B6' },
  { id: 'hit-pulsation', name: '铜钵·脉动', src: cosUrl('/audio/singing-bowl/sounddino/barely-noticeable-pulsation.mp3'), desc: '微妙脉动·5秒过渡', freq: 639, color: '#F39C12' },
  // 水晶钵敲击（CrystalBowls）
  { id: 'hit-crystal1', name: '水晶钵·清音', src: cosUrl('/audio/singing-bowl/crystalbowls/tap_crystal1.mp3'), desc: '水晶钵清透·高频渗透', freq: 528, color: '#E74C3C' },
  { id: 'hit-crystal2', name: '水晶钵·泛音', src: cosUrl('/audio/singing-bowl/crystalbowls/tap_crystal2.mp3'), desc: '水晶钵泛音·层次丰富', freq: 741, color: '#3498DB' },
  { id: 'hit-crystal3', name: '水晶钵·共振', src: cosUrl('/audio/singing-bowl/crystalbowls/tap_crystal3.mp3'), desc: '水晶钵共振·身心通透', freq: 432, color: '#4B0082' },
  { id: 'hit-crystal4', name: '水晶钵·空明', src: cosUrl('/audio/singing-bowl/crystalbowls/tap_crystal4.mp3'), desc: '水晶钵空明·入静冥想', freq: 639, color: '#F39C12' },
  { id: 'hit-crystal5', name: '水晶钵·清澈', src: cosUrl('/audio/singing-bowl/crystalbowls/tap_crystal5.mp3'), desc: '水晶钵清澈·净化气场', freq: 417, color: '#27AE60' },
  { id: 'hit-crystal6', name: '水晶钵·悠远', src: cosUrl('/audio/singing-bowl/crystalbowls/tap_crystal6.mp3'), desc: '水晶钵悠远·灵性扩展', freq: 852, color: '#1ABC9C' },
  { id: 'hit-crystal7', name: '水晶钵·收功', src: cosUrl('/audio/singing-bowl/crystalbowls/tap_crystal7.mp3'), desc: '水晶钵收功·温和收束', freq: 396, color: '#2C3E50' },
  // 传统钵敲击（CrystalBowls tap_bowl）
  { id: 'hit-bowl1', name: '藏钵·低音击', src: cosUrl('/audio/singing-bowl/crystalbowls/tap_bowl1.mp3'), desc: '藏钵低音·深沉共鸣', freq: 256, color: '#8B2500' },
  { id: 'hit-bowl4', name: '藏钵·中音击', src: cosUrl('/audio/singing-bowl/crystalbowls/tap_bowl4.mp3'), desc: '藏钵中音·稳定悠长', freq: 432, color: '#B8860B' },
  { id: 'hit-bowl7', name: '藏钵·高音击', src: cosUrl('/audio/singing-bowl/crystalbowls/tap_bowl7.mp3'), desc: '藏钵高音·清亮穿透', freq: 741, color: '#3498DB' },
];

// ===== 颂钵增强：真实录音持续音 =====

export interface BowlRecording {
  id: string;
  name: string;
  src: string;
  desc: string;
  /** 对应近似频率 */
  freq: number;
  bowlType: 'brass' | 'crystal' | 'tibetan' | 'mix';
  color: string;
}

export const BOWL_RECORDINGS: BowlRecording[] = [
  { id: 'rec-bowl1', name: '铜钵·持续音', src: cosUrl('/audio/singing-bowl/crystalbowls/bowl1.mp3'), desc: '经典铜钵·浑厚共振', freq: 432, bowlType: 'brass', color: '#8B2500' },
  { id: 'rec-studio-bowls1', name: '颂钵·工作室录音', src: cosUrl('/audio/singing-bowl/crystalbowls/studio_bowls1.mp3'), desc: '多钵和鸣·层次丰富', freq: 528, bowlType: 'mix', color: '#E74C3C' },
  { id: 'rec-studio-other', name: '颂钵·他钵录音', src: cosUrl('/audio/singing-bowl/crystalbowls/studio_other_bowls1.mp3'), desc: '独特音色·深度疗愈', freq: 396, bowlType: 'tibetan', color: '#2C3E50' },
];

// ===== 颂钵播放模式 =====

export type BowlPlayMode = 'synth' | 'recording' | 'hit';

export const BOWL_PLAY_MODES: { value: BowlPlayMode; name: string; icon: string; desc: string }[] = [
  { value: 'synth', name: '合成音', icon: '波', desc: 'Web Audio 实时合成·无限时长' },
  { value: 'recording', name: '真钵音', icon: '钵', desc: '真实颂钵录音·自然共鸣' },
  { value: 'hit', name: '敲击音', icon: '击', desc: '槌击起音·自然衰减' },
];
