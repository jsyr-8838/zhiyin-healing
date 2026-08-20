'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { QUIZ_QUESTIONS, AROMA_LABELS, AROMA_PERSONALITIES, computeAromaRecommendation, type AromaQuizResult, type AromaVector, type QuizQuestion } from '@/lib/aroma-engine';
import { useAppStore } from '@/lib/store';
import type { EssenceDiagnosisResult } from '@/lib/unified-diagnosis';

const WUXING_COLORS: Record<string, string> = { '木': '#5d8a63', '火': '#c26158', '土': '#c9a94f', '金': '#5ba09a', '水': '#3d7a75' };
const DIM_COLORS: Record<string, string> = { sweet: '#c9a94f', woody: '#5d8a63', cool: '#5ba09a', milk: '#c26158', spicy: '#c26158', fruity: '#5d8a63' };

export default function AromaQuizPage() {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<AromaQuizResult | null>(null);
  const setEssenceDiagnosisResult = useAppStore(s => s.setEssenceDiagnosisResult);

  // Wire to unified diagnosis store when result changes
  useEffect(() => {
    if (!result) return;
    const topOil = result.recommendations[0]?.oil;
    const essenceResult: EssenceDiagnosisResult = {
      preferredElement: (topOil?.wuxing as EssenceDiagnosisResult['preferredElement']) || '土',
      recommendedOils: result.recommendations.slice(0, 5).map(r => r.oil.name),
      aromaProfile: result.personality.name,
      timestamp: Date.now(),
    };
    setEssenceDiagnosisResult(essenceResult);
  }, [result, setEssenceDiagnosisResult]);

  const totalSteps = QUIZ_QUESTIONS.length;
  const currentQ = QUIZ_QUESTIONS[currentStep] as QuizQuestion | undefined;

  const handleSelect = (questionId: string, optionId: string) => {
    const newAnswers = { ...answers, [questionId]: optionId };
    setAnswers(newAnswers);

    if (currentStep < totalSteps - 1) {
      setTimeout(() => setCurrentStep(s => s + 1), 300);
    } else {
      const r = computeAromaRecommendation(newAnswers);
      setTimeout(() => {
        setResult(r);
        setCurrentStep(totalSteps);
      }, 400);
    }
  };

  const handleRetake = () => {
    setAnswers({});
    setCurrentStep(0);
    setResult(null);
  };

  const progressPct = ((currentStep + (result ? 1 : 0)) / totalSteps) * 100;

  return (
    <div className="min-h-screen" style={{ background: '#faf5ee' }}>
      <header className="sticky top-0 z-30 flex items-center gap-3 px-4 py-3" style={{ background: 'rgba(250,245,238,0.88)',
}}>
        {currentStep < totalSteps ? (
          <button onClick={() => { if (currentStep > 0) setCurrentStep(s => s - 1); }}
            className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(26,26,26,0.06)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
        ) : (
          <Link href="/diagnose" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(26,26,26,0.06)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="2" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </Link>
        )}
        <h1 className="text-lg font-bold tracking-wide" style={{ color: '#1a1a1a', fontWeight: 760 }}>香氛基因</h1>
        <span className="ml-auto text-xs" style={{ color: '#999' }}>
          {currentStep < totalSteps ? `${currentStep + 1}/${totalSteps}` : '完成'}
        </span>
      </header>

      <div className="px-4 mb-4">
        <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, background: '#5ba09a' }} />
        </div>
      </div>

      {currentStep < totalSteps && currentQ && (
        <div className="px-4 pb-8">
          <div className="text-[10px] mb-1.5 font-semibold tracking-wider" style={{ color: '#5ba09a' }}>{currentQ.step}</div>
          <h2 className="text-xl font-bold mb-1" style={{ color: '#1a1a1a', fontWeight: 780 }}>{currentQ.title}</h2>
          <p className="text-xs mb-5" style={{ color: '#999' }}>{currentQ.subtitle}</p>

          {currentQ.type === 'color' ? (
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map(opt => {
                const isSelected = answers[currentQ.id] === opt.id;
                return (
                  <button key={opt.id} onClick={() => handleSelect(currentQ.id, opt.id)}
                    className="relative rounded-2xl p-4 text-left transition-all active:scale-[0.97] overflow-hidden"
                    style={{
                      background: opt.color || 'rgba(255,255,255,0.7)',
                      border: isSelected ? '2px solid #1a1a1a' : '2px solid transparent',
                      boxShadow: isSelected ? '0 4px 16px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.1)',
                    }}>
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
                    <div className="relative">
                      <div className="text-sm font-bold text-white mb-0.5" style={{ fontWeight: 760 }}>{opt.label}</div>
                      <div className="text-[10px] text-white/80">{opt.desc}</div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2.5">
              {currentQ.options.map(opt => {
                const isSelected = answers[currentQ.id] === opt.id;
                return (
                  <button key={opt.id} onClick={() => handleSelect(currentQ.id, opt.id)}
                    className="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-[0.98]"
                    style={{
                      background: isSelected ? 'rgba(91,160,154,0.1)' : 'rgba(255,255,255,0.65)',
border: isSelected ? '1.5px solid #5ba09a' : '1.5px solid rgba(0,0,0,0.04)',
                      boxShadow: isSelected ? '0 2px 12px rgba(91,160,154,0.15)' : '0 1px 4px rgba(0,0,0,0.04)',
                    }}>
                    <span className="text-xl shrink-0 mt-0.5">{opt.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold leading-tight" style={{ color: '#1a1a1a', fontWeight: isSelected ? 700 : 500 }}>{opt.label}</div>
                      <div className="text-[11px] mt-0.5" style={{ color: '#888' }}>{opt.desc}</div>
                    </div>
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full shrink-0 mt-1 flex items-center justify-center" style={{ background: '#5ba09a' }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {currentStep >= totalSteps && result && (
        <div className="px-4 pb-8">
          <div className="text-center mb-6">
            <div className="text-5xl mb-2">{result.personality.icon}</div>
            <div className="text-xl font-bold" style={{ color: '#1a1a1a', fontWeight: 780 }}>{result.personality.name}</div>
            <div className="text-xs mt-1.5 mx-auto max-w-xs" style={{ color: '#666', lineHeight: 1.6 }}>{result.personality.desc}</div>
            <div className="flex justify-center gap-2 mt-3">
              {result.personality.traits.map(t => (
                <span key={t} className="text-[10px] px-2.5 py-1 rounded-full font-medium"
                  style={{ background: 'rgba(91,160,154,0.1)', color: '#5ba09a' }}>{t}</span>
              ))}
            </div>
          </div>

          <div className="mb-5 px-4 py-4 rounded-2xl" style={{ background: 'rgba(255,255,255,0.65)',
}}>
            <div className="text-xs font-bold mb-3" style={{ color: '#1a1a1a', fontWeight: 760 }}>香气基因图谱</div>
            <div className="space-y-2.5">
              {(Object.keys(AROMA_LABELS) as (keyof AromaVector)[]).map(key => {
                const label = AROMA_LABELS[key];
                const val = result.userVector[key];
                return (
                  <div key={key} className="flex items-center gap-2.5">
                    <span className="text-sm w-5 text-center">{label.emoji}</span>
                    <span className="text-[11px] w-10 shrink-0" style={{ color: '#666' }}>{label.name}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.05)' }}>
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${val * 100}%`, background: DIM_COLORS[key] || '#5ba09a' }} />
                    </div>
                    <span className="text-[10px] w-8 text-right" style={{ color: '#999' }}>{(val * 100).toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-xs font-bold mb-3" style={{ color: '#1a1a1a', fontWeight: 760 }}>推荐精油</div>
            <div className="space-y-2.5">
              {result.recommendations.map((rec, i) => {
                const color = WUXING_COLORS[rec.oil.wuxing];
                return (
                  <div key={rec.oil.id} className="px-4 py-3.5 rounded-2xl flex items-start gap-3"
                    style={{ background: 'rgba(255,255,255,0.65)',
borderLeft: `3px solid ${color}` }}>
                    <div className="text-lg font-bold shrink-0 mt-0.5" style={{ color, fontWeight: 780 }}>{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold" style={{ color: '#1a1a1a', fontWeight: 700 }}>{rec.oil.name}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: `${color}18`, color }}>{rec.oil.wuxing}</span>
                        <span className="text-[10px] ml-auto font-bold" style={{ color }}>{rec.matchPct}%</span>
                      </div>
                      <div className="text-[11px] leading-relaxed" style={{ color: '#666' }}>{rec.reason}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mb-5">
            <div className="text-xs font-bold mb-2.5" style={{ color: '#1a1a1a', fontWeight: 760 }}>适用场景</div>
            <div className="flex flex-wrap gap-2">
              {result.sceneTags.map(tag => (
                <span key={tag} className="text-[11px] px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(192,161,79,0.1)', color: '#c9a94f', fontWeight: 500 }}>{tag}</span>
              ))}
            </div>
          </div>

          <button onClick={handleRetake}
            className="w-full py-3 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97]"
            style={{ background: '#1a1a1a', color: '#faf5ee', fontWeight: 600 }}>
            重新测试
          </button>
        </div>
      )}
    </div>
  );
}
