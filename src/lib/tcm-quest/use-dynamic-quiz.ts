'use client';

import { useState, useEffect, useCallback } from 'react';
import type { QuizItem } from '@/lib/tcm-quest/types';

/**
 * 动态题库 Hook — 从 EvoKnowledge 获取进化引擎生成的题目
 * 与静态题库混合，让灵兰秘典题库可持续扩展
 * 
 * 使用：
 * const { allQuizzes, dynamicQuizzes, loading, refresh } = useDynamicQuiz(QUIZ_DATA);
 */

interface UseDynamicQuizReturn {
  /** 静态题 + 动态题混合 */
  allQuizzes: QuizItem[];
  /** 仅动态题 */
  dynamicQuizzes: QuizItem[];
  /** 加载状态 */
  loading: boolean;
  /** 最后更新时间 */
  lastUpdated: string | null;
  /** 手动刷新 */
  refresh: () => void;
}

export function useDynamicQuiz(staticQuizzes: QuizItem[]): UseDynamicQuizReturn {
  const [dynamicQuizzes, setDynamicQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const fetchDynamic = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await fetch('/api/tcm-quest/dynamic-quiz?limit=30', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (data.quizzes && Array.isArray(data.quizzes)) {
        // 去重：过滤掉与静态题重复的题目（按 q 字段匹配）
        const staticQs = new Set(staticQuizzes.map(q => q.q));
        const unique = data.quizzes.filter((q: QuizItem) => !staticQs.has(q.q));
        setDynamicQuizzes(unique);
        setLastUpdated(data.updatedAt || new Date().toISOString());
      }
    } catch {
      // 静默失败，不影响静态题库使用
    } finally {
      setLoading(false);
    }
  }, [staticQuizzes]);

  useEffect(() => {
    fetchDynamic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allQuizzes = [...staticQuizzes, ...dynamicQuizzes];

  return {
    allQuizzes,
    dynamicQuizzes,
    loading,
    lastUpdated,
    refresh: fetchDynamic,
  };
}
