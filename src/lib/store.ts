'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { WuYinProfile, ChatMessage, UserProfile, HealthRecord } from '@/types';
import type {
  UnifiedDiagnosis,
  JiuZhongResult,
  WuXingResult,
  VisualDiagnosisResult,
  WuYinTestResult,
  EssenceDiagnosisResult,
  ColorDiagnosisResult,
} from '@/lib/unified-diagnosis';
import { createEmptyDiagnosis } from '@/lib/unified-diagnosis';

// ===== 命主档案 =====
export interface DestineeProfile {
  name: string;           // 姓名
  gender: 'male' | 'female';
  birthDate: string;      // 公历 YYYY-MM-DD
  birthHour: number;      // 0-23
  isLunar: boolean;       // 是否农历
  isLeapMonth: boolean;   // 是否闰月
  phone: string;          // 手机号（可选，用于后续营销/通知）
}

// ===== 辨证流水线 =====
export interface DiagnosisFlow {
  active: boolean;
  /** 0:九种体质 1:五行体质 2:舌诊 3:手诊 4:面诊 5:全部完成 */
  currentStep: number;
}

const FLOW_STEPS = ['jiuzhong', 'wuxing', 'tongue', 'hand', 'face'] as const;
export type FlowStepKey = (typeof FLOW_STEPS)[number];

interface AppState {
  // 用户
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;

  // 命主档案（占卜专用）
  destinee: DestineeProfile | null;
  setDestinee: (profile: DestineeProfile) => void;
  clearDestinee: () => void;

  // 测试
  currentTestAnswers: Record<number, number>;
  setTestAnswer: (questionId: number, score: number) => void;
  clearTestAnswers: () => void;
  lastProfile: WuYinProfile | null;
  setLastProfile: (profile: WuYinProfile) => void;

  // 统一辩证状态
  unifiedDiagnosis: UnifiedDiagnosis;
  setJiuZhongResult: (result: JiuZhongResult) => void;
  setWuXingResult: (result: WuXingResult) => void;
  setVisualDiagnosisResult: (result: VisualDiagnosisResult) => void;
  setWuYinTestResult: (result: WuYinTestResult) => void;
  setEssenceDiagnosisResult: (result: EssenceDiagnosisResult) => void;
  setColorDiagnosisResult: (result: ColorDiagnosisResult) => void;
  clearUnifiedDiagnosis: () => void;

  // 明辨
  diagnosisFlow: DiagnosisFlow;
  startDiagnosisFlow: () => void;
  advanceDiagnosisFlow: () => void;
  exitDiagnosisFlow: () => void;
  completeDiagnosisFlow: () => void;

  // AI导诊（无次数限制）
  chatMessages: ChatMessage[];
  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  // 健康记录
  healthRecords: HealthRecord[];
  addHealthRecord: (record: HealthRecord) => void;

  // 疗愈
  todaySessionsCompleted: number;
  incrementSessions: () => void;

  // 收藏
  favorites: string[];
  toggleFavorite: (sessionId: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // 用户
      user: null,
      setUser: (user) => set({ user }),

      // 命主档案
      destinee: null,
      setDestinee: (profile) => set({ destinee: profile }),
      clearDestinee: () => set({ destinee: null }),

      // 测试
      currentTestAnswers: {},
      setTestAnswer: (questionId, score) =>
        set((state) => ({
          currentTestAnswers: { ...state.currentTestAnswers, [questionId]: score },
        })),
      clearTestAnswers: () => set({ currentTestAnswers: {} }),
      lastProfile: null,
      setLastProfile: (profile) => set({ lastProfile: profile }),

      // 统一辩证状态
      unifiedDiagnosis: createEmptyDiagnosis(),
      setJiuZhongResult: (result) => set((state) => ({
        unifiedDiagnosis: { ...state.unifiedDiagnosis, jiuZhong: result, lastUpdated: Date.now() },
      })),
      setWuXingResult: (result) => set((state) => ({
        unifiedDiagnosis: { ...state.unifiedDiagnosis, wuXing: result, lastUpdated: Date.now() },
      })),
      setVisualDiagnosisResult: (result) => set((state) => ({
        unifiedDiagnosis: {
          ...state.unifiedDiagnosis,
          [result.type]: result,
          lastUpdated: Date.now(),
        },
      })),
      setWuYinTestResult: (result) => set((state) => ({
        unifiedDiagnosis: { ...state.unifiedDiagnosis, wuYinTest: result, lastUpdated: Date.now() },
      })),
      setEssenceDiagnosisResult: (result) => set((state) => ({
        unifiedDiagnosis: { ...state.unifiedDiagnosis, essence: result, lastUpdated: Date.now() },
      })),
      setColorDiagnosisResult: (result) => set((state) => ({
        unifiedDiagnosis: { ...state.unifiedDiagnosis, color: result, lastUpdated: Date.now() },
      })),
      clearUnifiedDiagnosis: () => set({ unifiedDiagnosis: createEmptyDiagnosis() }),

      // 明辨
      diagnosisFlow: { active: false, currentStep: 0 },
      startDiagnosisFlow: () => set({
        diagnosisFlow: { active: true, currentStep: 0 },
        unifiedDiagnosis: createEmptyDiagnosis(),
      }),
      advanceDiagnosisFlow: () => set((state) => ({
        diagnosisFlow: {
          active: true,
          currentStep: Math.min(state.diagnosisFlow.currentStep + 1, 5),
        },
      })),
      exitDiagnosisFlow: () => set({ diagnosisFlow: { active: false, currentStep: 0 } }),
      completeDiagnosisFlow: () => set({ diagnosisFlow: { active: false, currentStep: 5 } }),

      // AI导诊 - 无次数限制，全部功能免费
      chatMessages: [],
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      clearChat: () => set({ chatMessages: [] }),

      // 健康记录
      healthRecords: [],
      addHealthRecord: (record) =>
        set((state) => ({
          healthRecords: [...state.healthRecords, record],
        })),

      // 疗愈
      todaySessionsCompleted: 0,
      incrementSessions: () =>
        set((state) => ({
          todaySessionsCompleted: state.todaySessionsCompleted + 1,
        })),

      // 收藏
      favorites: [],
      toggleFavorite: (sessionId) =>
        set((state) => ({
          favorites: state.favorites.includes(sessionId)
            ? state.favorites.filter((id) => id !== sessionId)
            : [...state.favorites, sessionId],
        })),
    }),
    {
      name: 'heytcm-storage',
      partialize: (state) => ({
        user: state.user,
        lastProfile: state.lastProfile,
        healthRecords: state.healthRecords,
        chatMessages: state.chatMessages,
        favorites: state.favorites,
        todaySessionsCompleted: state.todaySessionsCompleted,
        unifiedDiagnosis: state.unifiedDiagnosis,
        destinee: state.destinee,
        diagnosisFlow: state.diagnosisFlow,
      }),
    }
  )
);
