'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import {
  CONSTITUTION_QUESTIONS,
  CONSTITUTION_DETAILS,
  calculateConstitution,
} from '@/lib/constitution-data';
import type { ConstitutionType } from '@/lib/constitution-data';

const DIMENSION_LABELS: Record<number, string> = {
  1: '精力体能', 2: '精力体能', 3: '精力体能',
  4: '睡眠出汗', 5: '睡眠出汗', 6: '睡眠出汗',
  7: '温度口渴', 8: '温度口渴', 9: '温度口渴',
  10: '面色皮肤', 11: '面色皮肤', 12: '面色皮肤',
  13: '消化二便', 14: '消化二便', 15: '消化二便',
  16: '情志胸闷', 17: '情志胸闷', 18: '情志胸闷',
  19: '舌象过敏', 20: '舌象过敏', 21: '舌象过敏', 22: '舌象过敏',
};

const DIMENSION_ICONS: Record<string, string> = {
  '精力体能': '💪', '睡眠出汗': '🌙', '温度口渴': '🌡️',
  '面色皮肤': '🪞', '消化二便': '🍽️', '情志胸闷': '💭', '舌象过敏': '👅',
};

export default function TestPage() {
  const router = useRouter();
  const { setTestAnswer, currentTestAnswers } = useAppStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ReturnType<typeof calculateConstitution> | null>(null);

  const currentQuestion = CONSTITUTION_QUESTIONS[currentIndex];
  const totalQuestions = CONSTITUTION_QUESTIONS.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const currentAnswer = currentTestAnswers[currentQuestion.id];
  const dimension = DIMENSION_LABELS[currentQuestion.id] || '';
  const dimensionIcon = DIMENSION_ICONS[dimension] || '';

  function handleSelect(answerIndex: number) {
    setTestAnswer(currentQuestion.id, answerIndex);

    if (currentIndex < totalQuestions - 1) {
      setTimeout(() => setCurrentIndex((i) => i + 1), 250);
    } else {
      setIsAnalyzing(true);
      setTimeout(() => {
        const answers = Object.entries(currentTestAnswers)
          .map(([id, idx]) => ({ questionId: Number(id), answerIndex: idx as number }));
        answers.push({ questionId: currentQuestion.id, answerIndex });
        const res = calculateConstitution(answers);
        setResult(res);
        setIsAnalyzing(false);
        setShowResult(true);
      }, 2500);
    }
  }

  function handleBack() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else {
      router.back();
    }
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center px-6">
        <div className="w-24 h-24 rounded-full border-4 border-emerald-200 border-t-emerald-600 mb-8 animate-spin" style={{ animationDuration: '3s' }} />
        <h2 className="text-xl font-bold text-gray-900 mb-2">AI 正在分析你的体质</h2>
        <p className="text-sm text-gray-500">综合7大维度22项指标，辨识九种体质...</p>
      </div>
    );
  }

  if (showResult && result) {
    const details = CONSTITUTION_DETAILS[result.dominant];
    const secondaryType = result.allScores[1];

    return (
      <div className="min-h-screen bg-[#fafaf9] pb-24">
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-16 pb-12 text-white">
          <div className="text-center">
            <p className="text-sm opacity-80 mb-2">九种体质辨识报告</p>
            <h1 className="text-4xl font-black mb-1">{details.name}</h1>
            <p className="text-lg opacity-90">{details.alias}</p>
            <div className="flex items-center justify-center gap-4 mt-3 text-sm">
              <span className="bg-white/15 px-3 py-1 rounded-full">五行：{details.element}</span>
              <span className="bg-white/15 px-3 py-1 rounded-full">脏腑：{details.organ}</span>
            </div>
          </div>
        </div>

        <div className="px-4 -mt-6 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">体质特征</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{details.description}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-4">九种体质得分</h3>
            <div className="space-y-2.5">
              {result.allScores.map(({ type, name, score }, idx) => {
                const d = CONSTITUTION_DETAILS[type];
                const maxScore = 12;
                const isDominant = idx === 0;
                return (
                  <div key={type} className={`flex items-center gap-3 ${isDominant ? 'bg-emerald-50 -mx-2 px-2 py-1 rounded-lg' : ''}`}>
                    <span className="text-xs font-bold w-14" style={{ color: d.color }}>
                      {name}
                    </span>
                    <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((score / maxScore) * 100, 100)}%`,
                          backgroundColor: isDominant ? d.color : '#D1D5DB',
                        }}
                      />
                    </div>
                    <span className={`text-xs font-bold w-6 text-right ${isDominant ? 'text-gray-900' : 'text-gray-400'}`}>{score}</span>
                  </div>
                );
              })}
            </div>
            {secondaryType && secondaryType.score > 0 && (
              <p className="text-xs text-gray-400 mt-3">
                兼夹体质倾向：{CONSTITUTION_DETAILS[secondaryType.type].name}（{secondaryType.score}分）
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">养生建议</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{details.summary}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">食疗方案</h3>
            <div className="space-y-2">
              {details.dietaryAdvice.map((a) => (
                <div key={a} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="font-bold text-gray-900 mb-3">起居养生</h3>
            <div className="space-y-2">
              {details.lifestyleAdvice.map((a) => (
                <div key={a} className="flex items-start gap-2 text-sm text-gray-600">
                  <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push('/diagnosis')}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition"
            >
              AI导诊咨询
            </button>
            <button
              onClick={() => router.push('/healing')}
              className="flex-1 bg-white text-emerald-700 py-3.5 rounded-xl font-bold text-sm border border-emerald-200 hover:bg-emerald-50 transition"
            >
              疗愈方案
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24">
      <div className="sticky top-0 z-10 bg-white/80 border-b border-gray-100">
        <div className="px-4 py-3 flex items-center gap-4">
          <button onClick={handleBack} className="p-1">
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div className="flex-1">
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span className="text-sm font-semibold text-gray-500">{currentIndex + 1}/{totalQuestions}</span>
        </div>
      </div>

      <div className="px-6 pt-6">
        <div
          key={currentIndex}
          className="animate-[test-slide-in_0.25s_ease-out_forwards]"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold mb-4">
            {dimensionIcon} {dimension}
          </div>

          <h2 className="text-lg font-bold text-gray-900 mb-6 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-3">
            {currentQuestion.options.map((opt, answerIndex) => (
              <button
                key={answerIndex}
                onClick={() => handleSelect(answerIndex)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                  currentAnswer === answerIndex
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold'
                    : 'border-gray-100 bg-white text-gray-700 hover:border-emerald-200 hover:bg-emerald-50/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                    currentAnswer === answerIndex
                      ? 'border-emerald-500 bg-emerald-500 text-white'
                      : 'border-gray-200 text-gray-400'
                  }`}>
                    {currentAnswer === answerIndex ? <Check size={14} /> : String.fromCharCode(65 + answerIndex)}
                  </div>
                  <span>{opt.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes test-slide-in {
          from { opacity: 0; transform: translateX(50px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
