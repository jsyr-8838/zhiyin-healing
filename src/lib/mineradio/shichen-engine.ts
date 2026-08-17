/**
 * 子午流注时辰引擎
 *
 * 移植自 ziwuliuzhu-clock (https://github.com/eevil505/ziwuliuzhu-clock)
 * 核心功能：十二时辰计算、经络当令、五行归属、四柱八字
 *
 * 基于《黄帝内经》子午流注学说：
 *   每个时辰（2小时）对应一条经络当令，
 *   气血按时辰流注十二经脉，形成天人合一的养生节律。
 */

// ═══════════════════════════════════════════════════
//  基础常量（天干地支五行从唯一数据源引入）
// ═══════════════════════════════════════════════════

import { STEMS, BRANCHES, ELEMENTS } from '@/lib/data/ganzhi-foundation';

export { STEMS, BRANCHES, ELEMENTS };

/** 五行英文键（与项目其他模块统一） */
export type ElementKey = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/** 中文五行 → ElementKey 映射 */
const ELEMENT_TO_KEY: Record<string, ElementKey> = {
  '木': 'wood',
  '火': 'fire',
  '土': 'earth',
  '金': 'metal',
  '水': 'water',
};

/** ElementKey → 中文 */
export const KEY_TO_ELEMENT: Record<ElementKey, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

/** 五行颜色（与项目设计系统一致） */
export const ELEMENT_COLORS: Record<ElementKey, string> = {
  wood: '#5d8a63',   // 木行青瓷绿
  fire: '#c26158',   // 火行朱砂红
  earth: '#c9a94f',  // 土行暮金
  metal: '#5ba09a',  // 金行青蓝
  water: '#3d7a75',  // 水行深天青
};

/** 五行强调色（亮色版本，用于高亮） */
export const ELEMENT_ACCENT_COLORS: Record<ElementKey, string> = {
  wood: '#34d399',   // emerald-400
  fire: '#f87171',   // red-400
  earth: '#fbbf24',  // amber-400
  metal: '#67e8f9',  // cyan-400
  water: '#60a5fa',  // blue-400
};

// ═══════════════════════════════════════════════════
//  十二时辰主数据
// ═══════════════════════════════════════════════════

export interface ShichenData {
  /** 地支（时辰名） */
  branch: string;
  /** 时辰索引 0-11 */
  index: number;
  /** 起始小时（24h制） */
  startHour: number;
  /** 对应脏腑 */
  organ: string;
  /** 经络全名 */
  meridian: string;
  /** 五行归属 */
  element: string;
  /** 五行英文键 */
  elementKey: ElementKey;
  /** 养生提示 */
  wellnessTip: string;
  /** 推荐活动 */
  activity: string;
  /** 宜忌标签 */
  tags: string[];
  /** 时段描述 */
  periodLabel: string;
}

/** 十二时辰完整数据（基于《针灸甲乙经》《黄帝内经》） */
export const SHICHEN_DATA: ShichenData[] = [
  {
    branch: '子', index: 0, startHour: 23,
    organ: '胆', meridian: '足少阳胆经', element: '水', elementKey: 'water',
    wellnessTip: '宜睡觉 · 胆经当令 · 养阳气',
    activity: '安眠', tags: ['安眠', '藏阳', '排毒'],
    periodLabel: '夜半',
  },
  {
    branch: '丑', index: 1, startHour: 1,
    organ: '肝', meridian: '足厥阴肝经', element: '木', elementKey: 'wood',
    wellnessTip: '熟睡养肝 · 肝藏血 · 助排毒',
    activity: '熟睡', tags: ['养肝', '藏血', '排毒'],
    periodLabel: '鸡鸣',
  },
  {
    branch: '寅', index: 2, startHour: 3,
    organ: '肺', meridian: '手太阴肺经', element: '金', elementKey: 'metal',
    wellnessTip: '深度睡眠 · 肺朝百脉',
    activity: '深眠', tags: ['养肺', '朝百脉', '藏气'],
    periodLabel: '平旦',
  },
  {
    branch: '卯', index: 3, startHour: 5,
    organ: '大肠', meridian: '手阳明大肠经', element: '金', elementKey: 'metal',
    wellnessTip: '起床排便 · 宜饮温水',
    activity: '晨起', tags: ['排便', '温水', '清肠'],
    periodLabel: '日出',
  },
  {
    branch: '辰', index: 4, startHour: 7,
    organ: '胃', meridian: '足阳明胃经', element: '土', elementKey: 'earth',
    wellnessTip: '吃早餐 · 胃经当令',
    activity: '进食', tags: ['早餐', '养胃', '运化'],
    periodLabel: '食时',
  },
  {
    branch: '巳', index: 5, startHour: 9,
    organ: '脾', meridian: '足太阴脾经', element: '土', elementKey: 'earth',
    wellnessTip: '工作学习 · 脾经旺运化',
    activity: '工作', tags: ['运化', '学习', '精力旺'],
    periodLabel: '隅中',
  },
  {
    branch: '午', index: 6, startHour: 11,
    organ: '心', meridian: '手少阴心经', element: '火', elementKey: 'fire',
    wellnessTip: '午餐小睡 · 心经旺养心',
    activity: '午休', tags: ['养心', '午睡', '小憩'],
    periodLabel: '日中',
  },
  {
    branch: '未', index: 7, startHour: 13,
    organ: '小肠', meridian: '手太阳小肠经', element: '火', elementKey: 'fire',
    wellnessTip: '小肠吸收 · 宜午后休息',
    activity: '休整', tags: ['吸收', '消化', '休息'],
    periodLabel: '日昳',
  },
  {
    branch: '申', index: 8, startHour: 15,
    organ: '膀胱', meridian: '足太阳膀胱经', element: '水', elementKey: 'water',
    wellnessTip: '多喝水 · 膀胱经旺排毒',
    activity: '饮水', tags: ['排毒', '饮水', '运动'],
    periodLabel: '哺时',
  },
  {
    branch: '酉', index: 9, startHour: 17,
    organ: '肾', meridian: '足少阴肾经', element: '水', elementKey: 'water',
    wellnessTip: '补肾养肾 · 肾经当令',
    activity: '补肾', tags: ['养肾', '藏精', '纳气'],
    periodLabel: '日入',
  },
  {
    branch: '戌', index: 10, startHour: 19,
    organ: '心包', meridian: '手厥阴心包经', element: '火', elementKey: 'fire',
    wellnessTip: '散步放松 · 心包经旺',
    activity: '散步', tags: ['放松', '散步', '护心'],
    periodLabel: '黄昏',
  },
  {
    branch: '亥', index: 11, startHour: 21,
    organ: '三焦', meridian: '手少阳三焦经', element: '火', elementKey: 'fire',
    wellnessTip: '静养 · 准备入睡',
    activity: '静养', tags: ['静养', '入眠', '三焦通'],
    periodLabel: '人定',
  },
];

// ═══════════════════════════════════════════════════
//  时辰计算
// ═══════════════════════════════════════════════════

/** 24小时 → 时辰索引 (0-11) */
export function hourToShichenIndex(hour: number): number {
  if (hour === 23 || hour === 0) return 0;   // 子时
  if (hour === 1  || hour === 2)  return 1;   // 丑时
  if (hour === 3  || hour === 4)  return 2;   // 寅时
  if (hour === 5  || hour === 6)  return 3;   // 卯时
  if (hour === 7  || hour === 8)  return 4;   // 辰时
  if (hour === 9  || hour === 10) return 5;   // 巳时
  if (hour === 11 || hour === 12) return 6;   // 午时
  if (hour === 13 || hour === 14) return 7;   // 未时
  if (hour === 15 || hour === 16) return 8;   // 申时
  if (hour === 17 || hour === 18) return 9;   // 酉时
  if (hour === 19 || hour === 20) return 10;  // 戌时
  return 11;                                   // 亥时
}

/** 获取当前时辰数据 */
export function getCurrentShichen(date: Date = new Date()): ShichenData {
  const idx = hourToShichenIndex(date.getHours());
  return SHICHEN_DATA[idx];
}

/** 获取当前时辰的进度 (0-1) */
export function getShichenProgress(date: Date = new Date()): number {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const idx = hourToShichenIndex(hour);
  const startHour = SHICHEN_DATA[idx].startHour;
  // 计算在这个时辰内经过了多少分钟
  let elapsed: number;
  if (startHour === 23) {
    // 子时跨越午夜
    if (hour === 23) {
      elapsed = minute;
    } else {
      elapsed = 60 + minute;
    }
  } else {
    elapsed = (hour - startHour) * 60 + minute;
  }
  return elapsed / 120; // 2小时 = 120分钟
}

/** 时辰时间范围描述 */
export function getShichenTimeRange(idx: number): string {
  const sc = SHICHEN_DATA[idx];
  const startH = sc.startHour;
  const endIdx = (idx + 1) % 12;
  const endH = SHICHEN_DATA[endIdx].startHour;
  return `${String(startH).padStart(2, '0')}:00–${String(endH).padStart(2, '0')}:00`;
}

// ═══════════════════════════════════════════════════
//  四柱八字计算
// ═══════════════════════════════════════════════════

export interface FourPillars {
  year: string;   // 年柱
  month: string;  // 月柱
  day: string;    // 日柱
  hour: string;   // 时柱
}

/** 日柱干支（以 1900-01-01 为参考点，该日为甲戌日） */
function dayGanZhi(date: Date): string {
  const base = new Date(1900, 0, 1);           // 1900-01-01 = 甲戌日
  const n = Math.round((date.getTime() - base.getTime()) / 86400000);
  return STEMS[((n % 10) + 10) % 10] + BRANCHES[((n % 12) + 12) % 12];
}

/** 年柱干支（1984年为甲子年） */
function yearGanZhi(year: number): string {
  const o = year - 1984;
  return STEMS[((o % 10) + 10) % 10] + BRANCHES[((o % 12) + 12) % 12];
}

/** 月柱干支（简化：按公历月份计算，以寅月为岁首） */
function monthGanZhi(year: number, month: number): string {
  const ys = ((year - 1984) % 10 + 10) % 10;
  const mb = (month + 1) % 12;
  return STEMS[([2, 4, 6, 8, 0][ys % 5] + (mb - 2 + 12) % 12) % 10] + BRANCHES[mb];
}

/** 时柱干支（五虎遁元法） */
function hourGanZhi(dayStemIndex: number, hour: number): string {
  const idx = hourToShichenIndex(hour);
  return STEMS[([0, 2, 4, 6, 8][dayStemIndex % 5] + idx) % 10] + BRANCHES[idx];
}

/** 计算四柱八字 */
export function getFourPillars(date: Date = new Date()): FourPillars {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const hour = date.getHours();

  const dayGZ = dayGanZhi(date);
  const dayStemIndex = STEMS.indexOf(dayGZ[0] as typeof STEMS[number]);

  return {
    year: yearGanZhi(year),
    month: monthGanZhi(year, month),
    day: dayGZ,
    hour: hourGanZhi(dayStemIndex, hour),
  };
}

// ═══════════════════════════════════════════════════
//  五行生克关系
// ═══════════════════════════════════════════════════

/** 五行相生：木→火→土→金→水→木 */
export function sheng(element: ElementKey): ElementKey {
  const map: Record<ElementKey, ElementKey> = {
    wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood',
  };
  return map[element];
}

/** 五行相克：木→土→水→火→金→木 */
export function ke(element: ElementKey): ElementKey {
  const map: Record<ElementKey, ElementKey> = {
    wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood',
  };
  return map[element];
}

/** 五行关系描述 */
export function getElementRelation(from: ElementKey, to: ElementKey): string {
  if (from === to) return '比和';
  if (sheng(from) === to) return '我生';
  if (ke(from) === to) return '我克';
  if (sheng(to) === from) return '生我';
  if (ke(to) === from) return '克我';
  return '无';
}

// ═══════════════════════════════════════════════════
//  时辰+天气联动推荐
// ═══════════════════════════════════════════════════

export interface ShichenMoodRecommendation {
  /** 主推荐五行（时辰当令五行） */
  primaryElement: ElementKey;
  /** 辅助推荐五行（天气反差疗愈） */
  secondaryElement: ElementKey;
  /** 推荐理由（中文说明） */
  reason: string;
  /** 时辰养生建议 */
  shichenAdvice: string;
  /** 天气调养建议 */
  weatherAdvice: string;
  /** 综合推荐元素权重 */
  elementWeights: Record<ElementKey, number>;
}

/**
 * 时辰+天气联动推荐算法
 *
 * 核心逻辑：
 *   1. 时辰五行 = 当前当令经络的五行归属（主）
 *   2. 天气五行 = 以情胜情反差疗愈五行（辅）
 *   3. 综合推荐 = 时辰权重60% + 天气权重40%
 *
 * 原则：
 *   - 顺应天时为主（子午流注是身体节律，不可逆）
 *   - 天气调养为辅（环境因素需要平衡，但不可压过天时）
 *   - 若时辰与天气五行冲突，取相生过渡而非相克硬碰
 */
export function getShichenWeatherRecommendation(
  shichenElement: ElementKey,
  weatherMoodKey: string,
): ShichenMoodRecommendation {
  // 天气→反差疗愈五行映射（已实现在 weather-mood.ts，此处提取关键映射）
  const weatherElementMap: Record<string, ElementKey> = {
    'storm': 'wood',
    'snow': 'earth',
    'rain': 'fire',
    'rain-night': 'fire',
    'hot-day': 'water',
    'sunny-morning': 'fire',
    'golden-hour': 'earth',
    'sunny': 'wood',
    'warm-night': 'water',
    'clear-night': 'water',
    'cloudy-night': 'metal',
    'cloudy': 'metal',
    'autumn-dry': 'water',
    'fog': 'metal',
    'default': 'water',
  };

  const weatherElement = weatherElementMap[weatherMoodKey] || 'water';

  // 计算五行权重
  const weights: Record<ElementKey, number> = {
    wood: 0, fire: 0, earth: 0, metal: 0, water: 0,
  };

  // 时辰主五行 60%
  weights[shichenElement] += 0.6;

  // 天气辅五行 40%
  weights[weatherElement] += 0.4;

  // 相生链加成：时辰五行所生之元素加0.15
  weights[sheng(shichenElement)] += 0.15;

  // 如果时辰和天气五行相同，增强这个元素，并用相生元素拓展
  if (shichenElement === weatherElement) {
    weights[shichenElement] += 0.1;
    weights[sheng(shichenElement)] += 0.15;
  }

  // 确定主推荐和辅推荐
  const sorted = (Object.entries(weights) as [ElementKey, number][])
    .sort((a, b) => b[1] - a[1]);
  const primaryElement = sorted[0][0];
  const secondaryElement = sorted[1][0];

  // 生成推荐理由
  const shichenName = SHICHEN_DATA.find(s => s.elementKey === shichenElement)?.element || '水';
  const weatherName = KEY_TO_ELEMENT[weatherElement];
  let reason: string;
  let shichenAdvice: string;
  let weatherAdvice: string;

  const sc = getCurrentShichen();

  if (shichenElement === weatherElement) {
    reason = `${sc.branch}时${shichenName}行当令，天候亦合${shichenName}行，身心共振`;
    shichenAdvice = `${sc.meridian}当令，宜${sc.activity}以顺天时`;
    weatherAdvice = `天候与经气同频，聆听${shichenName}行音乐可倍增疗愈`;
  } else {
    const relation = getElementRelation(shichenElement, weatherElement);
    reason = `${sc.branch}时${shichenName}行主令，天候宜${weatherName}行调护，${relation}相和`;
    shichenAdvice = `${sc.meridian}当令，${sc.wellnessTip}`;
    weatherAdvice = `天候反差疗愈取${weatherName}行，与时辰${relation}调和`;
  }

  return {
    primaryElement,
    secondaryElement,
    reason,
    shichenAdvice,
    weatherAdvice,
    elementWeights: weights,
  };
}

// ═══════════════════════════════════════════════════
//  时辰专属五音推荐
// ═══════════════════════════════════════════════════

/** 五行→五音映射 */
export const ELEMENT_TONE: Record<ElementKey, { name: string; char: string; desc: string }> = {
  wood:  { name: '角音', char: '角', desc: '木行·肝·舒展' },
  fire:  { name: '徵音', char: '徵', desc: '火行·心·热烈' },
  earth: { name: '宫音', char: '宫', desc: '土行·脾·沉稳' },
  metal: { name: '商音', char: '商', desc: '金行·肺·清肃' },
  water: { name: '羽音', char: '羽', desc: '水行·肾·润下' },
};

/** 获取时辰对应的五音推荐 */
export function getShichenToneRecommendation(
  element: ElementKey,
): { primary: typeof ELEMENT_TONE[ElementKey]; secondary: typeof ELEMENT_TONE[ElementKey] } {
  return {
    primary: ELEMENT_TONE[element],
    secondary: ELEMENT_TONE[sheng(element)],  // 相生五音
  };
}
