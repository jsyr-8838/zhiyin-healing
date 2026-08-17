/**
 * 色彩诊断测试序列逻辑
 * 两阶段测试：阶段1(12轮极端色初筛) → 阶段2(4轮日常色精筛)
 */
import { SEASON_KEYS, SEASONS, getColorName } from './season-colors';

export interface TestRound {
  seasonKey: string;
  color: string;
  colorName: string;
  name: string;
  nameCN: string;
  phase: 1 | 2;
}

export const PHASE1_SEQUENCE: TestRound[] = SEASON_KEYS.map(key => {
  const s = SEASONS[key];
  return {
    seasonKey: key,
    color: s.extremeColor,
    colorName: getColorName(s.extremeColor, 1),
    name: s.name,
    nameCN: s.nameCN,
    phase: 1 as const,
  };
});

export function generatePhase2(currentScores: Record<string, number>): TestRound[] {
  const sorted = SEASON_KEYS
    .filter(k => currentScores[k] !== undefined)
    .sort((a, b) => (currentScores[b] || 0) - (currentScores[a] || 0));
  const top4 = sorted.slice(0, 4);
  return top4.map(key => {
    const s = SEASONS[key];
    return {
      seasonKey: key,
      color: s.dailyColor,
      colorName: getColorName(s.dailyColor, 2),
      name: s.name,
      nameCN: s.nameCN,
      phase: 2 as const,
    };
  });
}

export const MIN_ROUNDS = 8;
export const TOTAL_ROUNDS = 16;
