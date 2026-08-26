'use client';

import { useState } from 'react';
import { trackFeedback } from '@/lib/evo/tracker';

/**
 * Evo 反馈按钮 — 用户对 AI 结果"准/不准"评分
 * 
 * 用法：
 * <EvoFeedback module="diagnose" action="ai_diagnosis" detail={{ diagnosisType: '九种体质' }} />
 * <EvoFeedback module="divination" action="divination_result" detail={{ method: 'meihua' }} />
 * <EvoFeedback module="classics" action="quiz_explanation" detail={{ questionId: 'q123' }} />
 */

interface EvoFeedbackProps {
  /** 模块名 */
  module: 'diagnose' | 'healing' | 'divination' | 'classics' | 'meridian' | 'tianlai' | 'cultivation' | 'general';
  /** 动作名 */
  action: string;
  /** 附加详情 */
  detail?: Record<string, unknown>;
  /** 自定义样式类 */
  className?: string;
}

type FeedbackState = 'idle' | 'submitted';

export default function EvoFeedback({ module, action, detail, className = '' }: EvoFeedbackProps) {
  const [state, setState] = useState<FeedbackState>('idle');
  const [submittedScore, setSubmittedScore] = useState<number>(0);

  const handleFeedback = (score: number) => {
    // 上报到 Evo 进化系统
    trackFeedback(module, action, score, {
      ...detail,
      timestamp: Date.now(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    });

    setSubmittedScore(score);
    setState('submitted');

    // 3秒后恢复可点击状态（允许用户修改评分）
    setTimeout(() => {
      setState('idle');
    }, 3000);
  };

  if (state === 'submitted') {
    return (
      <div className={`flex items-center gap-2 text-xs text-stone-400 ${className}`}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1" opacity="0.4" />
          <path d="M4.5 7l1.8 1.8L10 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span>{submittedScore > 0 ? '感谢反馈"准确"，已帮助系统进化' : '感谢反馈"待改进"，系统将分析优化'}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="text-xs text-stone-400 mr-1">结果准确？</span>
      <button
        onClick={() => handleFeedback(1)}
        className="px-2.5 py-1 rounded-full text-xs font-medium text-stone-500 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
      >
        准
      </button>
      <button
        onClick={() => handleFeedback(-1)}
        className="px-2.5 py-1 rounded-full text-xs font-medium text-stone-500 bg-stone-100 hover:bg-amber-50 hover:text-amber-600 transition-colors"
      >
        不准
      </button>
    </div>
  );
}
