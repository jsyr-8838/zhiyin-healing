/**
 * 五行修为 Store — Zustand 持久化
 *
 * 管理：修为值、功法记录、每日功法完成状态、段位、经络进度
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type WuxingElement, type XiuWeiValues } from './cultivation-engine';

// ═══════════════════════════════════════
// 状态定义
// ═══════════════════════════════════════

export interface MeridianProg {
  meridianId: string;
  meridianName: string;
  element: WuxingElement;
  completion: number;
  isCompleted: boolean;
}

export interface CultivationState {
  // 五行修为
  xiuwei: XiuWeiValues;
  // 段位
  rankIndex: number;
  rankTitle: string;
  // 统计
  totalPractices: number;
  totalMinutes: number;
  streakDays: number;
  lastPracticeDate: string; // YYYY-MM-DD
  // 每日功法完成
  todayCompleted: string[];  // category 列表
  todayDate: string;         // 当日日期
  // 经络进度（本地缓存，DB 为主）
  meridianProgs: MeridianProg[];
  // 辨证次数
  diagnosisCount: number;
}

interface CultivationActions {
  // 修为增减
  addXiuWei: (element: WuxingElement, gain: number) => void;
  // 记录功法
  recordPractice: (category: string, durationSec: number, element?: WuxingElement, gain?: number) => void;
  // 标记每日功法步骤完成
  completeTodayStep: (category: string) => void;
  // 更新段位
  updateRank: (index: number, title: string) => void;
  // 更新连续天数
  setStreakDays: (days: number) => void;
  // 更新经络进度
  updateMeridianProg: (prog: MeridianProg) => void;
  // 辨证次数递增
  incrementDiagnosis: () => void;
  // 从 DB 同步（用于 hydration）
  syncFromDB: (data: Partial<CultivationState>) => void;
  // 重置（调试用）
  _reset: () => void;
}

const initialState: CultivationState = {
  xiuwei: { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 },
  rankIndex: 0,
  rankTitle: '闻道者',
  totalPractices: 0,
  totalMinutes: 0,
  streakDays: 0,
  lastPracticeDate: '',
  todayCompleted: [],
  todayDate: '',
  meridianProgs: [],
  diagnosisCount: 0,
};

export const useCultivationStore = create<CultivationState & CultivationActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      addXiuWei: (element, gain) =>
        set((state) => ({
          xiuwei: {
            ...state.xiuwei,
            [element]: Math.min(100, state.xiuwei[element] + gain),
          },
        })),

      recordPractice: (category, durationSec, element, gain) =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          const stateUpdate: Partial<CultivationState> = {
            totalPractices: state.totalPractices + 1,
            totalMinutes: state.totalMinutes + Math.round(durationSec / 60),
            lastPracticeDate: today,
          };

          // 如果修为有增加，更新
          if (element && gain) {
            const xiuweiUpdate: XiuWeiValues = {
              ...state.xiuwei,
              [element]: Math.min(100, state.xiuwei[element] + gain),
            };
            (stateUpdate as Partial<CultivationState> & { xiuwei: XiuWeiValues }).xiuwei = xiuweiUpdate;
          }

          return stateUpdate;
        }),

      completeTodayStep: (category) =>
        set((state) => {
          const today = new Date().toISOString().slice(0, 10);
          // 日期变更时重置
          const completed = state.todayDate === today ? state.todayCompleted : [];
          if (completed.includes(category)) return {};
          return {
            todayCompleted: [...completed, category],
            todayDate: today,
          };
        }),

      updateRank: (index, title) =>
        set({ rankIndex: index, rankTitle: title }),

      setStreakDays: (days) =>
        set({ streakDays: days }),

      updateMeridianProg: (prog) =>
        set((state) => {
          const existing = state.meridianProgs.findIndex(m => m.meridianId === prog.meridianId);
          const newProgs = [...state.meridianProgs];
          if (existing >= 0) {
            newProgs[existing] = prog;
          } else {
            newProgs.push(prog);
          }
          return { meridianProgs: newProgs };
        }),

      incrementDiagnosis: () =>
        set((state) => ({ diagnosisCount: state.diagnosisCount + 1 })),

      syncFromDB: (data) =>
        set((state) => ({ ...state, ...data })),

      _reset: () => set(initialState),
    }),
    {
      name: 'cultivation-storage',
      partialize: (state) => ({
        xiuwei: state.xiuwei,
        rankIndex: state.rankIndex,
        rankTitle: state.rankTitle,
        totalPractices: state.totalPractices,
        totalMinutes: state.totalMinutes,
        streakDays: state.streakDays,
        lastPracticeDate: state.lastPracticeDate,
        todayCompleted: state.todayCompleted,
        todayDate: state.todayDate,
        diagnosisCount: state.diagnosisCount,
      }),
    }
  )
);
