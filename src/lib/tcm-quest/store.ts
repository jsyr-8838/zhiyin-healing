'use client';

/**
 * 中医修真 · TCM Quest Ultra — Zustand Store
 *
 * 管理：等级/经验/金币、连续打卡、答题统计、错题本、间隔重复(SM-2)、
 *       中药/方剂浏览记录、医案进度、Boss进度、师承任务完成、成就解锁
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { SRItem, QuizTag } from './types';
import { getLevelByXp, getLevelProgress, LEVELS } from './config';

// ═══════════════════════════════════════
// SM-2 间隔重复算法
// ═══════════════════════════════════════

/** SM-2 评分等级: 0=Again, 1=Hard, 2=Good, 3=Easy */
type SM2Grade = 0 | 1 | 2 | 3;

/**
 * SM-2 算法核心实现
 * @param prev 之前的 SRItem（可选）
 * @param grade 评分 0-3
 * @returns 更新后的 SRItem
 */
function sm2Update(prev: SRItem | undefined, quizId: string, grade: SM2Grade): SRItem {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();

  if (!prev) {
    // 新条目
    const ef = grade === 0 ? 1.3 : grade === 1 ? 2.0 : grade === 2 ? 2.5 : 2.8;
    const interval = grade === 0 ? 0 : grade === 1 ? 1 : grade === 2 ? 2 : 4;
    return {
      quizId,
      ef,
      interval,
      reps: grade === 0 ? 0 : 1,
      nextDate: addDays(today, interval),
      lastDate: now,
      history: [{ date: today, grade }],
    };
  }

  let { ef, interval, reps } = prev;

  if (grade === 0) {
    // Again: 重置
    reps = 0;
    interval = 0;
    ef = Math.max(1.3, ef - 0.2);
  } else {
    reps += 1;
    // 更新 EF
    const qMap = [0, 3, 4, 5]; // grade -> q value
    const q = qMap[grade];
    ef = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
    // 计算间隔
    if (reps === 1) interval = 1;
    else if (reps === 2) interval = grade === 3 ? 4 : 2;
    else interval = Math.round(interval * ef);
    if (grade === 1) interval = Math.max(1, Math.round(interval * 0.8)); // Hard 缩短
  }

  return {
    quizId,
    ef,
    interval,
    reps,
    nextDate: addDays(today, interval),
    lastDate: now,
    history: [...prev.history, { date: today, grade }].slice(-50),
  };
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 获取今天日期 YYYY-MM-DD */
function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

// ═══════════════════════════════════════
// Store 状态定义
// ═══════════════════════════════════════

interface TCMQuestState {
  // 核心数值
  xp: number;
  coin: number;
  level: number;
  levelTitle: string;
  // 连续打卡
  streak: number;
  lastStudyDate: string;
  // 答题统计
  totalAnswered: number;
  totalCorrect: number;
  perTagAnswered: Record<string, number>;
  perTagCorrect: Record<string, number>;
  // 错题本
  wrongAnswers: string[];
  // 间隔重复
  srData: Record<string, SRItem>;
  reviewCount: number;
  perfectStreak: number; // 连续答对不犯错
  // 浏览记录
  herbsViewed: string[];
  formulasViewed: string[];
  // 医案/Boss
  casesSolved: number;
  casesSolvedIds: number[];
  bossDefeated: number;
  bossDefeatedIds: string[];
  // 师承任务
  missionsCompleted: string[];
  // 成就
  achievementsUnlocked: string[];
  // AI 辨证
  aiDxCount: number;
}

interface TCMQuestActions {
  // 答题
  answerQuiz: (quizId: string, tag: QuizTag, correct: boolean, xp: number) => void;
  // 间隔重复评分
  gradeSR: (quizId: string, grade: SM2Grade) => void;
  // 获取待复习题目
  getDueReviews: () => string[];
  // 浏览记录
  viewHerb: (name: string) => void;
  viewFormula: (name: string) => void;
  // 医案
  solveCase: (caseIndex: number, correct: boolean) => void;
  // Boss
  defeatBoss: (bossId: string) => void;
  // 师承任务
  completeMission: (missionId: string) => void;
  // 成就
  unlockAchievement: (achievementId: string) => void;
  // AI辨证
  incrementAiDx: () => void;
  // 奖励
  addXp: (amount: number) => void;
  addCoin: (amount: number) => void;
  // 检查连续打卡
  checkStreak: () => void;
  // 重置
  _reset: () => void;
}

const initialState: TCMQuestState = {
  xp: 0,
  coin: 0,
  level: 1,
  levelTitle: '初入杏林',
  streak: 0,
  lastStudyDate: '',
  totalAnswered: 0,
  totalCorrect: 0,
  perTagAnswered: {},
  perTagCorrect: {},
  wrongAnswers: [],
  srData: {},
  reviewCount: 0,
  perfectStreak: 0,
  herbsViewed: [],
  formulasViewed: [],
  casesSolved: 0,
  casesSolvedIds: [],
  bossDefeated: 0,
  bossDefeatedIds: [],
  missionsCompleted: [],
  achievementsUnlocked: [],
  aiDxCount: 0,
};

export const useTCMQuestStore = create<TCMQuestState & TCMQuestActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      answerQuiz: (quizId, tag, correct, xp) => {
        set((state) => {
          const today = todayStr();
          // 连续打卡逻辑
          let newStreak = state.streak;
          if (state.lastStudyDate !== today) {
            const yesterday = addDays(today, -1);
            if (state.lastStudyDate === yesterday) {
              newStreak = state.streak + 1;
            } else {
              newStreak = 1;
            }
          }

          const perTagAnswered = { ...state.perTagAnswered };
          perTagAnswered[tag] = (perTagAnswered[tag] || 0) + 1;

          const perTagCorrect = { ...state.perTagCorrect };
          if (correct) perTagCorrect[tag] = (perTagCorrect[tag] || 0) + 1;

          const wrongAnswers = correct
            ? state.wrongAnswers.filter(id => id !== quizId)
            : (state.wrongAnswers.includes(quizId) ? state.wrongAnswers : [...state.wrongAnswers, quizId]);

          const perfectStreak = correct ? state.perfectStreak + 1 : 0;

          const newXp = state.xp + (correct ? xp : Math.floor(xp * 0.2));
          const newCoin = state.coin + (correct ? Math.floor(xp * 0.5) : 5);
          const levelDef = getLevelByXp(newXp);

          return {
            xp: newXp,
            coin: newCoin,
            level: levelDef.level,
            levelTitle: levelDef.title,
            streak: newStreak,
            lastStudyDate: today,
            totalAnswered: state.totalAnswered + 1,
            totalCorrect: state.totalCorrect + (correct ? 1 : 0),
            perTagAnswered,
            perTagCorrect,
            wrongAnswers,
            perfectStreak,
          };
        });
      },

      gradeSR: (quizId, grade) => {
        set((state) => {
          const prev = state.srData[quizId];
          const updated = sm2Update(prev, quizId, grade);
          return {
            srData: { ...state.srData, [quizId]: updated },
            reviewCount: state.reviewCount + 1,
          };
        });
      },

      getDueReviews: () => {
        const state = get();
        const today = todayStr();
        return Object.values(state.srData)
          .filter(sr => sr.nextDate <= today)
          .map(sr => sr.quizId);
      },

      viewHerb: (name) => {
        set((state) => {
          if (state.herbsViewed.includes(name)) return {};
          return { herbsViewed: [...state.herbsViewed, name] };
        });
      },

      viewFormula: (name) => {
        set((state) => {
          if (state.formulasViewed.includes(name)) return {};
          return { formulasViewed: [...state.formulasViewed, name] };
        });
      },

      solveCase: (caseIndex, correct) => {
        set((state) => {
          if (!correct) return {};
          if (state.casesSolvedIds.includes(caseIndex)) return {};
          return {
            casesSolved: state.casesSolved + 1,
            casesSolvedIds: [...state.casesSolvedIds, caseIndex],
            xp: state.xp + 200,
            coin: state.coin + 100,
          };
        });
      },

      defeatBoss: (bossId) => {
        set((state) => {
          if (state.bossDefeatedIds.includes(bossId)) return {};
          return {
            bossDefeated: state.bossDefeated + 1,
            bossDefeatedIds: [...state.bossDefeatedIds, bossId],
          };
        });
      },

      completeMission: (missionId) => {
        set((state) => {
          if (state.missionsCompleted.includes(missionId)) return {};
          return {
            missionsCompleted: [...state.missionsCompleted, missionId],
          };
        });
      },

      unlockAchievement: (achievementId) => {
        set((state) => {
          if (state.achievementsUnlocked.includes(achievementId)) return {};
          return {
            achievementsUnlocked: [...state.achievementsUnlocked, achievementId],
            coin: state.coin + 100, // 成就奖励金币
          };
        });
      },

      incrementAiDx: () => {
        set((state) => ({
          aiDxCount: state.aiDxCount + 1,
          xp: state.xp + 50,
          coin: state.coin + 30,
        }));
      },

      addXp: (amount) => {
        set((state) => {
          const newXp = state.xp + amount;
          const levelDef = getLevelByXp(newXp);
          return { xp: newXp, level: levelDef.level, levelTitle: levelDef.title };
        });
      },

      addCoin: (amount) => {
        set((state) => ({ coin: state.coin + amount }));
      },

      checkStreak: () => {
        set((state) => {
          const today = todayStr();
          if (state.lastStudyDate === today) return {};
          const yesterday = addDays(today, -1);
          if (state.lastStudyDate === yesterday) {
            return { streak: state.streak + 1, lastStudyDate: today };
          }
          return { streak: 1, lastStudyDate: today };
        });
      },

      _reset: () => set(initialState),
    }),
    {
      name: 'tcm-quest-storage',
    }
  )
);

// ═══════════════════════════════════════
// 导出辅助函数
// ═══════════════════════════════════════

export { sm2Update, addDays, todayStr };
export type { SM2Grade };
export { getLevelByXp, getLevelProgress, LEVELS };
