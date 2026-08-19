/**
 * 五行修为系统核心引擎
 *
 * 管理修为值的增减、五行树的成长阶段、修为来源追踪
 * P1 核心逻辑
 */

// ═══════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════

export type WuxingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export interface XiuWeiValues {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface XiuWeiSource {
  category: string;      // liuzijue | wuyin | zhiYinZhiJing | meridian | acupointQuiz | breathing | songbo | moxa
  subCategory?: string;  // 如 'xu', 'he', 'hu', 'si', 'chui', 'xi'
  element: WuxingElement;
  baseGain: number;      // 基础修为获得
  multiplier?: number;   // 倍率（如首次完成 ×2）
}

/** 修为树的成长阶段 */
export enum TreeStage {
  Seed = 0,       // 种子 0
  Sprout = 1,     // 发芽 ≥10
  Branch = 2,     // 枝干 ≥30
  Leaf = 3,       // 繁叶 ≥60
  Bloom = 4,      // 开花 ≥90
  Fruit = 5,      // 结果 =100 贯通
}

/** 五行色系 */
export const ELEMENT_COLORS: Record<WuxingElement, string> = {
  wood: '#5d8a63',
  fire: '#c26158',
  earth: '#c9a94f',
  metal: '#5ba09a',
  water: '#3d7a75',
};

/** 五行中文名 */
export const ELEMENT_NAMES: Record<WuxingElement, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

/** 五行对应脏腑 */
export const ELEMENT_ORGANS: Record<WuxingElement, string> = {
  wood: '肝', fire: '心', earth: '脾', metal: '肺', water: '肾',
};

/** 五行对应字诀 */
export const ELEMENT_LIUZIJUE: Record<WuxingElement, { id: string; char: string }> = {
  wood: { id: 'xu', char: '嘘' },
  fire: { id: 'he', char: '呵' },
  earth: { id: 'hu', char: '呼' },
  metal: { id: 'si', char: '呬' },
  water: { id: 'chui', char: '吹' },
};

/** 五行对应五音 */
export const ELEMENT_TONES: Record<WuxingElement, { key: string; name: string }> = {
  wood: { key: 'jiao', name: '角' },
  fire: { key: 'zhi', name: '徵' },
  earth: { key: 'gong', name: '宫' },
  metal: { key: 'shang', name: '商' },
  water: { key: 'yu', name: '羽' },
};

/** 五行对应知音之境 */
export const ELEMENT_ZHIJING: Record<WuxingElement, string[]> = {
  wood: ['mountain'],
  fire: ['campfire', 'temple'],
  earth: ['mist'],
  metal: ['snow', 'moon'],
  water: ['deepsea', 'rain'],
};

// ═══════════════════════════════════════
// 修为计算
// ═══════════════════════════════════════

/** 修为来源 → 基础获得量映射 */
export const XIUWEI_GAINS: Record<string, number> = {
  liuzijue_cycle: 2,      // 六字诀完成 1 轮
  wuyin_5min: 5,          // 五音疗愈 5 分钟
  zhijing_complete: 8,    // 知音之境完成一次
  meridian_view: 3,       // 经络穴位查看
  acupoint_quiz: 2,       // 穴位测验答对
  breathing_complete: 3,  // 呼吸练习完成
  songbo_complete: 4,     // 颂钵完成
  moxa_complete: 3,       // 灸疗完成
  checkin: 1,             // 每日打卡
};

/**
 * 计算一次练习的修为获得
 * 考虑倍率（首次完成、连续完成等）
 */
export function calcXiuWeiGain(source: XiuWeiSource): number {
  const base = source.baseGain || XIUWEI_GAINS[source.category] || 1;
  const mult = source.multiplier || 1;
  return Math.round(base * mult);
}

/**
 * 字诀 id → 五行 element
 */
export function liuzijueIdToElement(id: string): WuxingElement {
  const map: Record<string, WuxingElement> = {
    xu: 'wood', he: 'fire', hu: 'earth', si: 'metal', chui: 'water',
  };
  return map[id] || 'earth'; // 嘻(xi)=三焦，默认归土
}

/**
 * 获取修为树的成长阶段
 */
export function getTreeStage(xiuwei: number): TreeStage {
  if (xiuwei >= 100) return TreeStage.Fruit;
  if (xiuwei >= 90) return TreeStage.Bloom;
  if (xiuwei >= 60) return TreeStage.Leaf;
  if (xiuwei >= 30) return TreeStage.Branch;
  if (xiuwei >= 10) return TreeStage.Sprout;
  return TreeStage.Seed;
}

/**
 * 修为树阶段描述
 */
export const TREE_STAGE_LABELS: Record<TreeStage, string> = {
  [TreeStage.Seed]: '种子',
  [TreeStage.Sprout]: '发芽',
  [TreeStage.Branch]: '枝干',
  [TreeStage.Leaf]: '繁叶',
  [TreeStage.Bloom]: '开花',
  [TreeStage.Fruit]: '贯通',
};

/**
 * 五行全部贯通检查
 */
export function isAllCompleted(values: XiuWeiValues): boolean {
  return values.wood >= 100 && values.fire >= 100 && values.earth >= 100 && values.metal >= 100 && values.water >= 100;
}

/**
 * 计算五行修为总和
 */
export function totalXiuWei(values: XiuWeiValues): number {
  return values.wood + values.fire + values.earth + values.metal + values.water;
}

/**
 * 计算五行修为平均值
 */
export function avgXiuWei(values: XiuWeiValues): number {
  return Math.round(totalXiuWei(values) / 5);
}

/**
 * 找出最弱和最强的五行
 */
export function findWeakestAndStrongest(values: XiuWeiValues): { weakest: WuxingElement; strongest: WuxingElement } {
  const entries: [WuxingElement, number][] = Object.entries(values) as [WuxingElement, number][];
  entries.sort((a, b) => a[1] - b[1]);
  return {
    weakest: entries[0][0],
    strongest: entries[entries.length - 1][0],
  };
}

/**
 * 获取体质对应的五行初始加成
 * 先天禀赋：体质对应行 +10 初始值
 */
export function getConstitutionBonus(primaryElement: WuxingElement | null): Partial<XiuWeiValues> {
  if (!primaryElement) return {};
  return { [primaryElement]: 10 } as Partial<XiuWeiValues>;
}
