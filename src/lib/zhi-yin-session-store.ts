/**
 * 知音之境 — 会话记录与效果评估 Store
 *
 * 使用 localStorage 持久化，无需后端数据库。
 * 记录：
 *  - 历史会话（境 id、开始时间、时长、前后心情评分、心率数据）
 *  - 累计疗愈时长（按境分组）
 *  - 最近一次会话用于报告
 *
 * 与情绪打卡模块联动：会话完成后，通过 /api/checkin 接口更新
 * 今日打卡记录的 healingDone.zhiYinZhiJing 字段。
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { FlowModeId } from '@/lib/zhi-yin-zhi-jing-data';

export interface ZhiYinSession {
  id: string;
  modeId: FlowModeId;
  startedAt: number;
  durationSec: number;
  /** 疗愈前心情评分 1-5 */
  moodBefore: number;
  /** 疗愈后心情评分 1-5 */
  moodAfter: number;
  /** 心率数据（可选，若启用心率检测） */
  bpmBefore?: number;
  bpmAfter?: number;
  hrvBefore?: number;
  hrvAfter?: number;
}

interface ZhiYinStoreState {
  sessions: ZhiYinSession[];
  /** 当前正在进行的会话（未完成） */
  activeSession: Omit<ZhiYinSession, 'id' | 'durationSec'> | null;
  /** 上次完成的会话（用于效果报告弹窗） */
  lastCompletedSession: ZhiYinSession | null;

  startSession: (data: Omit<ZhiYinSession, 'id' | 'durationSec'>) => string;
  completeSession: (durationSec: number, moodAfter: number, bpmAfter?: number, hrvAfter?: number) => ZhiYinSession | null;
  cancelSession: () => void;
  clearLastCompleted: () => void;
  clearAll: () => void;
}

const STORAGE_KEY = 'zhi-yin-zhi-jing-sessions';

export const useZhiYinStore = create<ZhiYinStoreState>()(
  persist(
    (set, get) => ({
      sessions: [],
      activeSession: null,
      lastCompletedSession: null,

      startSession: (data) => {
        const id = `zy-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        set({ activeSession: { ...data, id } as any });
        return id;
      },

      completeSession: (durationSec, moodAfter, bpmAfter, hrvAfter) => {
        const active = get().activeSession;
        if (!active) return null;
        const session: ZhiYinSession = {
          ...active,
          id: (active as any).id || `zy-${Date.now()}`,
          durationSec,
          moodAfter,
          bpmAfter,
          hrvAfter,
        };
        set((s) => ({
          sessions: [...s.sessions, session].slice(-100), // 保留最近 100 条
          activeSession: null,
          lastCompletedSession: session,
        }));
        return session;
      },

      cancelSession: () => set({ activeSession: null }),
      clearLastCompleted: () => set({ lastCompletedSession: null }),
      clearAll: () => set({ sessions: [], activeSession: null, lastCompletedSession: null }),
    }),
    {
      name: STORAGE_KEY,
      // 只持久化会话历史，不持久化进行中的会话
      partialize: (state) => ({ sessions: state.sessions }),
    }
  )
);

/* ================================================================
 *  统计工具函数
 * ================================================================ */

/** 累计疗愈时长（秒） */
export function getTotalDuration(sessions: ZhiYinSession[]): number {
  return sessions.reduce((s, x) => s + x.durationSec, 0);
}

/** 按境分组的累计时长 */
export function getDurationByMode(sessions: ZhiYinSession[]): Record<FlowModeId, number> {
  const result = {} as Record<FlowModeId, number>;
  for (const s of sessions) {
    result[s.modeId] = (result[s.modeId] || 0) + s.durationSec;
  }
  return result;
}

/** 平均心情改善（moodAfter - moodBefore），无数据返回 0 */
export function getAverageMoodImprovement(sessions: ZhiYinSession[]): number {
  if (!sessions.length) return 0;
  const valid = sessions.filter((s) => s.moodAfter != null && s.moodBefore != null);
  if (!valid.length) return 0;
  return valid.reduce((s, x) => s + (x.moodAfter - x.moodBefore), 0) / valid.length;
}

/** 会话总数 */
export function getSessionCount(sessions: ZhiYinSession[]): number {
  return sessions.length;
}

/** 格式化时长（秒 → "Xh Ym" 或 "Xm Ys"） */
export function formatDuration(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}秒`;
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  if (m < 60) return s > 0 ? `${m}分${s}秒` : `${m}分钟`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm > 0 ? `${h}小时${mm}分` : `${h}小时`;
}
