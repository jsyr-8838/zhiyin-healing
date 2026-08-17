/**
 * AI 深度测评历史记录管理
 *
 * 每轮测评结果持久化到 localStorage，
 * 支持历史查看、统计分析和修为计算。
 */

import type { WuxingElement } from './cultivation-engine';

export type QType = 'location' | 'indications' | 'specialPoint' | 'meridian' | 'method';

export interface EvalSubScore {
  accuracy: number;
  coverage: number;
  key_terms: number;
  specificity: number;
  clarity: number;
}

export interface EvalAnswerRecord {
  pointCode: string;
  pointName: string;
  meridianCode: string;
  meridianName: string;
  qType: QType;
  question: string;
  userAnswer: string;
  score: number;
  pass: boolean;
  subscores: EvalSubScore;
  feedback: string;
  modelAnswer: string;
  incorrectReason?: string;
}

export interface EvalSession {
  id: string;           // cuid-like timestamp
  startTime: number;    // ms timestamp
  endTime: number;
  questionCount: number;
  answers: EvalAnswerRecord[];
  avgScore: number;
  passCount: number;
  totalXiuWei: number;
  selectedTypes: QType[];
  meridianFilter: string | null;
}

export interface EvalStats {
  totalSessions: number;
  totalQuestions: number;
  totalPass: number;
  avgScore: number;
  bestScore: number;
  streakPass: number;         // 连续通过数
  dimCounts: Record<QType, number>;
  dimPassRates: Record<QType, number>;
  testedPoints: string[];
  elementXiuWei: Record<WuxingElement, number>;
}

const HISTORY_KEY = 'zhiyin-ai-eval-history';
const MAX_SESSIONS = 50; // 最多保留50轮

export function loadSessions(): EvalSession[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    }
  } catch {}
  return [];
}

export function saveSession(session: EvalSession): void {
  const sessions = loadSessions();
  sessions.unshift(session);
  // 限制数量
  if (sessions.length > MAX_SESSIONS) {
    sessions.length = MAX_SESSIONS;
  }
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(sessions));
  } catch {}
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

export function computeStats(sessions: EvalSession[]): EvalStats {
  const dimCounts: Record<QType, number> = { location: 0, indications: 0, specialPoint: 0, meridian: 0, method: 0 };
  const dimPass: Record<QType, number> = { location: 0, indications: 0, specialPoint: 0, meridian: 0, method: 0 };
  const testedPoints = new Set<string>();
  let totalQuestions = 0;
  let totalPass = 0;
  let totalScore = 0;
  let bestScore = 0;
  let streakPass = 0;
  let currentStreak = 0;
  const elementXiuWei: Record<WuxingElement, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  for (const s of sessions) {
    totalScore += s.avgScore;
    if (s.avgScore > bestScore) bestScore = s.avgScore;

    for (const a of s.answers) {
      totalQuestions++;
      dimCounts[a.qType]++;
      if (a.pass) {
        totalPass++;
        dimPass[a.qType]++;
        currentStreak++;
      } else {
        if (currentStreak > streakPass) streakPass = currentStreak;
        currentStreak = 0;
      }
      testedPoints.add(a.pointCode);
    }

    // 累计修为到各五行
    // (session 级别总量记录在 s.totalXiuWei，按均匀分配到各五行)
    if (s.totalXiuWei > 0 && s.answers.length > 0) {
      // 简化：修为已按五行存储在服务端，这里只记录总获得量
      // 不再做五行拆分
    }
  }

  // 最后一段连续通过
  if (currentStreak > streakPass) streakPass = currentStreak;

  // 计算各维度通过率
  const dimPassRates: Record<QType, number> = { location: 0, indications: 0, specialPoint: 0, meridian: 0, method: 0 };
  for (const d of Object.keys(dimCounts) as QType[]) {
    dimPassRates[d] = dimCounts[d] > 0 ? Math.round((dimPass[d] / dimCounts[d]) * 100) : 0;
  }

  return {
    totalSessions: sessions.length,
    totalQuestions,
    totalPass,
    avgScore: sessions.length > 0 ? Math.round(totalScore / sessions.length) : 0,
    bestScore,
    streakPass,
    dimCounts,
    dimPassRates,
    testedPoints: Array.from(testedPoints),
    elementXiuWei,
  };
}

export function generateSessionId(): string {
  return `eval-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}
