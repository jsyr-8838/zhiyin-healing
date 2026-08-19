/**
 * 五行穿衣配色 — 算法与数据层
 * 从 JerseyWong/wuxing-clothing 的 App.jsx 提取，转为 TypeScript
 *
 * 核心逻辑：日柱地支 → 五行 → 相生相克 → 5 类穿衣配色建议
 */

// ===== 天干地支 =====
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'] as const;
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'] as const;

export type Stem = (typeof STEMS)[number];
export type Branch = (typeof BRANCHES)[number];
export type WuXing = '木' | '火' | '土' | '金' | '水';

// ===== 相生相克 =====
/** 我生 → 木生火、火生土、土生金、金生水、水生木 */
export const GEN: Record<WuXing, WuXing> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
/** 生我 → 水生木、木生火 … */
export const GENBY: Record<WuXing, WuXing> = { '木': '水', '火': '木', '土': '火', '金': '土', '水': '金' };
/** 我克 → 木克土、火克金 … */
export const OVER: Record<WuXing, WuXing> = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };
/** 克我 → 金克木、水克火 … */
export const OVERBY: Record<WuXing, WuXing> = { '木': '金', '火': '水', '土': '木', '金': '火', '水': '土' };

// ===== 地支 → 五行 =====
export const BRANCH_EL: Record<Branch, WuXing> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// ===== 五行颜色数据 =====
export interface ColorItem {
  name: string;
  hex: string;
}

export interface ElementData {
  colors: string[];     // 代表色名（3个）
  hexes: string[];      // 代表色 hex（3个）
  bg: string;           // 浅底色
  main: string;         // 主色
  allColors: ColorItem[]; // 全部10色
}

export const EL: Record<WuXing, ElementData> = {
  '木': {
    colors: ['绿色', '青色', '翠绿色'],
    hexes: ['#388e3c', '#0097a7', '#1b5e20'],
    bg: '#e8f5e9', main: '#2e7d32',
    allColors: [
      { name: '绿色', hex: '#43a047' }, { name: '草绿', hex: '#7cb342' },
      { name: '青色', hex: '#0097a7' }, { name: '翠绿', hex: '#2e7d32' },
      { name: '嫩绿', hex: '#aed581' }, { name: '薄荷绿', hex: '#80cbc4' },
      { name: '橄榄绿', hex: '#827717' }, { name: '墨绿', hex: '#1b5e20' },
      { name: '军绿', hex: '#558b2f' }, { name: '苔藓绿', hex: '#6d8b3a' },
    ],
  },
  '火': {
    colors: ['红色', '紫色', '粉色'],
    hexes: ['#d32f2f', '#7b1fa2', '#c2185b'],
    bg: '#fce4ec', main: '#c62828',
    allColors: [
      { name: '大红', hex: '#d32f2f' }, { name: '玫红', hex: '#e91e63' },
      { name: '粉色', hex: '#f48fb1' }, { name: '紫色', hex: '#7b1fa2' },
      { name: '橙色', hex: '#f57c00' }, { name: '橘色', hex: '#fb8c00' },
      { name: '酒红', hex: '#880e4f' }, { name: '珊瑚色', hex: '#ff7043' },
      { name: '桃红', hex: '#f06292' }, { name: '藕粉', hex: '#ce93d8' },
    ],
  },
  '土': {
    colors: ['黄色', '咖啡色', '土黄色'],
    hexes: ['#f9a825', '#6d4c41', '#a07040'],
    bg: '#fff8e1', main: '#c66900',
    allColors: [
      { name: '黄色', hex: '#f9a825' }, { name: '土黄', hex: '#a07040' },
      { name: '咖啡色', hex: '#6d4c41' }, { name: '驼色', hex: '#c8a96e' },
      { name: '卡其', hex: '#a1887f' }, { name: '米色', hex: '#d7ccc8' },
      { name: '奶茶色', hex: '#bcaaa4' }, { name: '焦糖色', hex: '#795548' },
      { name: '沙漠色', hex: '#d4a76a' }, { name: '棕色', hex: '#5d4037' },
    ],
  },
  '金': {
    colors: ['白色', '银白色', '金色'],
    hexes: ['#e0e0e0', '#90a4ae', '#fdd835'],
    bg: '#f5f5f5', main: '#546e7a',
    allColors: [
      { name: '白色', hex: '#f5f5f5' }, { name: '乳白', hex: '#fafafa' },
      { name: '米白', hex: '#efebe9' }, { name: '象牙白', hex: '#fffde7' },
      { name: '珍珠白', hex: '#f3e5f5' }, { name: '银色', hex: '#90a4ae' },
      { name: '浅灰', hex: '#bdbdbd' }, { name: '金色', hex: '#fdd835' },
      { name: '香槟金', hex: '#f0d080' }, { name: '铂金', hex: '#cfd8dc' },
    ],
  },
  '水': {
    colors: ['黑色', '深蓝色', '藏青色'],
    hexes: ['#37474f', '#0d47a1', '#1a237e'],
    bg: '#e3f2fd', main: '#0d47a1',
    allColors: [
      { name: '黑色', hex: '#212121' }, { name: '深蓝', hex: '#0d47a1' },
      { name: '藏青', hex: '#1a237e' }, { name: '宝蓝', hex: '#1565c0' },
      { name: '深灰', hex: '#37474f' }, { name: '炭灰', hex: '#455a64' },
      { name: '靛蓝', hex: '#283593' }, { name: '蓝紫', hex: '#4527a0' },
      { name: '墨色', hex: '#263238' }, { name: '深紫', hex: '#4a148c' },
    ],
  },
};

// ===== 类别定义 =====
export interface ClothingCategory {
  key: string;
  title: string;
  icon: string;
  rel: (dayEl: WuXing) => WuXing;
  badge: (dayEl: WuXing, el: WuXing) => string;
  desc: (dayEl: WuXing, el: WuXing) => string;
  detail: string;
  bar: string;   // 标题栏颜色
}

export const CATS: ClothingCategory[] = [
  {
    key: 'lucky', title: '顺利贵人色', icon: '★',
    rel: (e) => GEN[e],
    badge: (de, e) => `${de}行 生 ${e}行`,
    desc: (de, e) => `穿${EL[e]?.colors.join('、')}上衣比较好`,
    detail: '日支五行生此行，为顺利贵人色\n大环境顺着你，办事易成，开心轻松',
    bar: '#b8860b',
  },
  {
    key: 'stable', title: '合宜安稳色', icon: '◎',
    rel: (e) => e,
    badge: (de, e) => `与当日同为${e}行`,
    desc: (de, e) => `穿${EL[e]?.colors.join('、')}也可以`,
    detail: '与日支五行相同，为安稳比肩色\n适合商务合作、沟通谈判等场合',
    bar: '#2e7d32',
  },
  {
    key: 'effort', title: '奋斗加油色', icon: '◆',
    rel: (e) => OVERBY[e],
    badge: (de, e) => `${e}行 克 ${de}行`,
    desc: (de, e) => `穿${EL[e]?.colors.join('、')}为奋斗进财色`,
    detail: '此行克日支五行，需付出更多努力\n做事会较累，但成功能得到较大收获',
    bar: '#1565c0',
  },
  {
    key: 'drain', title: '辛苦消耗色', icon: '△',
    rel: (e) => GENBY[e],
    badge: (de, e) => `${e}行 生 ${de}行`,
    desc: (de, e) => `穿${EL[e]?.colors.join('、')}为消耗泄气色`,
    detail: '此行生日支五行，消耗自身元气\n万事较累，不建议重要场合穿',
    bar: '#bf360c',
  },
  {
    key: 'bad', title: '压力山大色', icon: '✕',
    rel: (e) => OVER[e],
    badge: (de, e) => `${de}行 克 ${e}行`,
    desc: (de, e) => `不宜穿${EL[e]?.colors.join('、')}衣服`,
    detail: '日支五行克此行，大环境压制\n万事阻力大、成效差，重要日子避免穿',
    bar: '#546e7a',
  },
];

// ===== 日柱标签 =====
export const DAYEL_LABEL: Record<WuXing, string> = {
  '木': '木日 · 寅卯木',
  '火': '火日 · 巳午火',
  '土': '土日 · 辰戌丑未',
  '金': '金日 · 申酉金',
  '水': '水日 · 子亥水',
};

// ===== 农历 =====
export const LD_CN = [
  '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
  '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
  '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十',
] as const;

export const WD = ['日', '一', '二', '三', '四', '五', '六'] as const;

/** Intl 实际输出的月份名 */
const LUNAR_MONTH_MAP: Record<string, number> = {
  '正': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6,
  '七': 7, '八': 8, '九': 9, '十': 10, '十一': 11, '十二': 12,
};

export interface LunarResult {
  ly: number;
  yearName: string;
  lm: number;
  ld: number;
  isLeap: boolean;
  monthLabel: string;
}

function buildSafeDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function parseLunarMonth(monthText: string): { lm: number; isLeap: boolean; displayMonth: string } | null {
  const isLeap = monthText.startsWith('闰');
  const cleaned = monthText.replace(/^闰/, '').replace(/月$/, '');
  const lm = LUNAR_MONTH_MAP[cleaned];
  if (!lm) return null;
  return { lm, isLeap, displayMonth: `${isLeap ? '闰' : ''}${cleaned}` };
}

export function toLunar(year: number, month: number, day: number): LunarResult | null {
  try {
    const date = buildSafeDate(year, month, day);
    if (Number.isNaN(date.getTime())) return null;

    const formatter = new Intl.DateTimeFormat('zh-Hans-u-ca-chinese', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    const parts = formatter.formatToParts(date) as Array<{ type: string; value: string }>;
    const relatedYear = parts.find(p => p.type === 'relatedYear')?.value;
    const yearName = parts.find(p => p.type === 'yearName')?.value;
    const monthText = parts.find(p => p.type === 'month')?.value;
    const dayText = parts.find(p => p.type === 'day')?.value;

    if (!relatedYear || !yearName || !monthText || !dayText) return null;

    const monthInfo = parseLunarMonth(monthText);
    const ld = Number.parseInt(dayText, 10);
    if (!monthInfo || !Number.isInteger(ld) || ld < 1 || ld > 30) return null;

    return {
      ly: Number.parseInt(relatedYear, 10),
      yearName,
      lm: monthInfo.lm,
      ld,
      isLeap: monthInfo.isLeap,
      monthLabel: monthInfo.displayMonth,
    };
  } catch {
    return null;
  }
}

// ===== 日柱计算（JDN 法） =====

function jdn(y: number, m: number, d: number): number {
  const a = Math.floor((14 - m) / 12);
  const yr = y + 4800 - a;
  const mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yr
    + Math.floor(yr / 4) - Math.floor(yr / 100) + Math.floor(yr / 400) - 32045;
}

export interface StemBranch {
  stem: Stem;
  branch: Branch;
}

export function getSB(y: number, m: number, d: number): StemBranch {
  const j = jdn(y, m, d);
  return {
    stem: STEMS[((j + 9) % 10 + 10) % 10],
    branch: BRANCHES[((j + 1) % 12 + 12) % 12],
  };
}

/** 根据日柱地支获取日支五行 */
export function getDayEl(branch: Branch): WuXing {
  return BRANCH_EL[branch] ?? '木';
}

/** 完整计算入口 */
export interface WuxingClothingResult {
  sb: StemBranch;
  dayEl: WuXing;
  lunar: LunarResult | null;
  wday: string;
}

export function calculateWuxingClothing(year: number, month: number, day: number, maxDay: number): WuxingClothingResult {
  const dd = Math.min(day, maxDay);
  const safeDate = buildSafeDate(year, month, dd);
  const lunar = toLunar(year, month, dd);
  const sb = getSB(year, month, dd);
  return {
    sb,
    dayEl: getDayEl(sb.branch),
    lunar,
    wday: WD[safeDate.getDay()],
  };
}
