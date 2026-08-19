/**
 * 段位系统 — P3 核心逻辑
 *
 * 七段段位体系，中医文化称谓
 * 每段位解锁实质性新功能
 */

import { type XiuWeiValues, type WuxingElement, isAllCompleted, avgXiuWei, findWeakestAndStrongest } from './cultivation-engine';

// ═══════════════════════════════════════
// 段位定义
// ═══════════════════════════════════════

export interface RankDef {
  index: number;
  title: string;        // 称谓
  subtitle: string;     // 副标题
  condition: string;     // 条件描述
  check: (v: XiuWeiValues, stats: RankStats) => boolean;
  unlocks: string;      // 解锁内容描述
  icon: string;         // 段位图标
  color: string;        // 段位色
}

export interface RankStats {
  totalPractices: number;
  streakDays: number;
  completedMeridians: number;  // 已贯通经络数
  diagnosisCount: number;      // 辨证次数
}

export const RANKS: RankDef[] = [
  {
    index: 0,
    title: '闻道者',
    subtitle: '初识中医之道',
    condition: '完成首次引导',
    check: () => true, // 默认段位
    unlocks: '基础呼吸模式',
    icon: '🌿',
    color: '#8B7355',
  },
  {
    index: 1,
    title: '修气士',
    subtitle: '开始修气养神',
    condition: '任一五行修为 ≥ 30',
    check: (v) => v.wood >= 30 || v.fire >= 30 || v.earth >= 30 || v.metal >= 30 || v.water >= 30,
    unlocks: '字诀深度导引',
    icon: '🍃',
    color: '#5d8a63',
  },
  {
    index: 2,
    title: '通经者',
    subtitle: '经络初通',
    condition: '任一经络贯通',
    check: (_v, s) => s.completedMeridians >= 1,
    unlocks: '3D 经络交互',
    icon: '🌀',
    color: '#3d7a75',
  },
  {
    index: 3,
    title: '辨证师',
    subtitle: '能辨明虚实',
    condition: '完成 3 次辨证 + 累计 20 次功法',
    check: (_v, s) => s.diagnosisCount >= 3 && s.totalPractices >= 20,
    unlocks: '知几占卜',
    icon: '🔮',
    color: '#818CF8',
  },
  {
    index: 4,
    title: '调理师',
    subtitle: '知调理之道',
    condition: '五行修为均 ≥ 60',
    check: (v) => v.wood >= 60 && v.fire >= 60 && v.earth >= 60 && v.metal >= 60 && v.water >= 60,
    unlocks: '今日功法定制',
    icon: '⚕️',
    color: '#c9a94f',
  },
  {
    index: 5,
    title: '养生家',
    subtitle: '通达养生之理',
    condition: '太极图 3 行贯通',
    check: (v) => {
      let count = 0;
      if (v.wood >= 100) count++;
      if (v.fire >= 100) count++;
      if (v.earth >= 100) count++;
      if (v.metal >= 100) count++;
      if (v.water >= 100) count++;
      return count >= 3;
    },
    unlocks: '节气养生日历',
    icon: '🏔️',
    color: '#c26158',
  },
  {
    index: 6,
    title: '知音者',
    subtitle: '五行圆满，知音自通',
    condition: '太极图 5 行贯通',
    check: (v) => isAllCompleted(v),
    unlocks: '专属称号 + 修为回顾',
    icon: '☯️',
    color: '#1a1a1a',
  },
];

/**
 * 计算用户当前段位
 */
export function calculateRank(values: XiuWeiValues, stats: RankStats): RankDef {
  // 从最高段位往低找
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (RANKS[i].check(values, stats)) {
      return RANKS[i];
    }
  }
  return RANKS[0]; // 保底返回闻道者
}

/**
 * 获取下一个段位（null 表示已达最高）
 */
export function getNextRank(currentIndex: number): RankDef | null {
  if (currentIndex >= RANKS.length - 1) return null;
  return RANKS[currentIndex + 1];
}

/**
 * 计算到下一段位的进度 0-1
 */
export function getRankProgress(values: XiuWeiValues, stats: RankStats, currentIndex: number): number {
  const next = getNextRank(currentIndex);
  if (!next) return 1; // 已达最高

  // 简化：基于平均修为 / 100 作为进度近似
  const avg = avgXiuWei(values);
  const targetAvg = (next.index + 1) * 16; // 每段约16点平均修为
  return Math.min(avg / targetAvg, 1);
}

/**
 * 段位等级描述（用于 UI 显示）
 */
export function getRankDisplay(values: XiuWeiValues, stats: RankStats): {
  current: RankDef;
  next: RankDef | null;
  progress: number;
  summary: string;
} {
  const current = calculateRank(values, stats);
  const next = getNextRank(current.index);
  const progress = getRankProgress(values, stats, current.index);

  let summary = '';
  if (next) {
    summary = `距「${next.title}」还需：${next.condition}`;
  } else {
    summary = '已达最高段位，五行圆满';
  }

  return { current, next, progress, summary };
}
