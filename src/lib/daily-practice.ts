/**
 * 每日功法引擎 — P0 核心逻辑
 *
 * 根据子午流注（时辰）、节气、天气、体质综合推荐每日功法
 * 3 步 × ~15 分钟，每天都有回来练习的理由
 */

import { type WuxingElement, ELEMENT_NAMES, ELEMENT_ORGANS, ELEMENT_LIUZIJUE, ELEMENT_TONES } from './cultivation-engine';
import { getCurrentSolarTerm } from './solar-terms-data';
import { getCurrentShichen, type ShichenData } from './mineradio/shichen-engine';

// ═══════════════════════════════════════
// 功法定义
// ═══════════════════════════════════════

export type PracticeType = 'liuzijue' | 'wuyin' | 'zhijing' | 'meridian' | 'breathing' | 'acupoint_quiz' | 'songbo' | 'moxa';

export interface PracticeStep {
  type: PracticeType;
  label: string;           // 显示标题
  subLabel: string;        // 副标题
  element: WuxingElement;
  duration: string;        // 预估时长
  href: string;            // 跳转链接
  icon: string;            // 图标字符
  done: boolean;           // 是否已完成
}

export interface DailyPractice {
  date: string;            // YYYY-MM-DD
  shichen: string;         // 当前时辰名
  element: WuxingElement;  // 当令五行
  organ: string;           // 当令脏腑
  greeting: string;        // 问候语
  steps: PracticeStep[];   // 功法步骤
  streakGoal: number;      // 连续目标天数
  streakDays: number;      // 当前连续天数
}

// ═══════════════════════════════════════
// 时辰 → 五行推荐
// ═══════════════════════════════════════

/** 时辰 → 核心字诀映射 */
const SHICHEN_CORE: Record<string, { jueId: string; jueChar: string; element: WuxingElement; organ: string }> = {
  'xu': { jueId: 'xu', jueChar: '嘘', element: 'wood', organ: '肝' },
  'he': { jueId: 'he', jueChar: '呵', element: 'fire', organ: '心' },
  'hu': { jueId: 'hu', jueChar: '呼', element: 'earth', organ: '脾' },
  'si': { jueId: 'si', jueChar: '呬', element: 'metal', organ: '肺' },
  'chui': { jueId: 'chui', jueChar: '吹', element: 'water', organ: '肾' },
};

/** 五行 → 字诀信息 */
const ELEMENT_JUE: Record<WuxingElement, { jueId: string; jueChar: string; organ: string }> = {
  wood: { jueId: 'xu', jueChar: '嘘', organ: '肝' },
  fire: { jueId: 'he', jueChar: '呵', organ: '心' },
  earth: { jueId: 'hu', jueChar: '呼', organ: '脾' },
  metal: { jueId: 'si', jueChar: '呬', organ: '肺' },
  water: { jueId: 'chui', jueChar: '吹', organ: '肾' },
};

/** 五行 → 五音曲目描述 */
const ELEMENT_TONE_DESC: Record<WuxingElement, string> = {
  wood: '角音·木行疏肝',
  fire: '徵音·火行养心',
  earth: '宫音·土行健脾',
  metal: '商音·金行润肺',
  water: '羽音·水行固肾',
};

/** 五行 → 推荐经络穴位 */
const ELEMENT_ACUPOINT: Record<WuxingElement, { meridian: string; points: string[] }> = {
  wood: { meridian: '足厥阴肝经', points: ['太冲', '行间'] },
  fire: { meridian: '手少阴心经', points: ['神门', '少海'] },
  earth: { meridian: '足太阴脾经', points: ['太白', '三阴交'] },
  metal: { meridian: '手太阴肺经', points: ['太渊', '列缺'] },
  water: { meridian: '足少阴肾经', points: ['太溪', '涌泉'] },
};

// ═══════════════════════════════════════
// 时段问候
// ═══════════════════════════════════════

function getTimeGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了，静心安神';
  if (h < 9) return '晨光初照，顺应春生之气';
  if (h < 11) return '日上三竿，阳气渐旺';
  if (h < 13) return '日正中天，心火当令';
  if (h < 17) return '午后渐宁，脾土养运';
  if (h < 19) return '暮色将至，收敛归元';
  return '夜色沉沉，肾水当令';
}

// ═══════════════════════════════════════
// 核心推荐逻辑
// ═══════════════════════════════════════

/**
 * 生成今日功法推荐
 *
 * 优先级：时辰当令 > 节气 > 体质薄弱 > 默认(土)
 */
export function generateDailyPractice(
  userElement?: WuxingElement | null,
  completedToday?: string[],
): DailyPractice {
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const shichen = getCurrentShichen();
  const shichenData = shichen as ShichenData;

  // 决定核心五行
  // 优先时辰当令 → 体质薄弱项 → 默认土
  let primaryElement: WuxingElement = shichenData?.elementKey || 'earth';

  // 如果有体质信息，在上午推体质薄弱行，下午推时辰当令
  if (userElement && now.getHours() < 12) {
    // 上午推相生行的补益（体质行的"生我"之行）
    const shengMap: Record<WuxingElement, WuxingElement> = {
      wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal',
    };
    primaryElement = shengMap[userElement] || userElement;
  }

  const jue = ELEMENT_JUE[primaryElement];
  const tone = ELEMENT_TONES[primaryElement];
  const acupoint = ELEMENT_ACUPOINT[primaryElement];
  const solarTerm = getCurrentSolarTerm();

  const doneSet = new Set(completedToday || []);

  const steps: PracticeStep[] = [
    // ① 六字诀
    {
      type: 'liuzijue',
      label: `${jue.jueChar}字诀 3 轮`,
      subLabel: `${ELEMENT_NAMES[primaryElement]}行${jue.organ === '脾' ? '健' : '疏'}${jue.organ}`,
      element: primaryElement,
      duration: '~3 分钟',
      href: '/healing/liuzijue',
      icon: '气',
      done: doneSet.has('liuzijue'),
    },
    // ② 五音疗愈
    {
      type: 'wuyin',
      label: `${tone.name}音疗愈 10 分钟`,
      subLabel: ELEMENT_TONE_DESC[primaryElement],
      element: primaryElement,
      duration: '~10 分钟',
      href: '/healing/wuyin',
      icon: '音',
      done: doneSet.has('wuyin'),
    },
    // ③ 经络穴位
    {
      type: 'meridian',
      label: `${acupoint.points[0]}、${acupoint.points[1]}按揉`,
      subLabel: `${acupoint.meridian}`,
      element: primaryElement,
      duration: '~2 分钟',
      href: '/meridian',
      icon: '穴',
      done: doneSet.has('meridian'),
    },
  ];

  return {
    date,
    shichen: shichenData?.organ ? `${shichenData.organ}经当令` : '顺应天时',
    element: primaryElement,
    organ: jue.organ,
    greeting: getTimeGreeting(),
    steps,
    streakGoal: 7,
    streakDays: 0, // 从 API 获取
  };
}

/**
 * 基于体质的弱行推荐功法
 * 找出用户修为最弱的行，推荐补益练习
 */
export function generateWeakElementPractice(
  xiuwei: { wood: number; fire: number; earth: number; metal: number; water: number },
  completedToday?: string[],
): DailyPractice {
  const entries: [WuxingElement, number][] = Object.entries(xiuwei) as [WuxingElement, number][];
  entries.sort((a, b) => a[1] - b[1]);
  const weakest = entries[0][0];
  return generateDailyPractice(weakest, completedToday);
}
