'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  TWELVE_MERIDIANS,
  type Acupoint,
  type Meridian,
  type WuxingElement,
} from '@/lib/meridian-data';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XIUWEI_GAINS } from '@/lib/cultivation-engine';
import { getClientUserId } from '@/lib/auth';

// ============================================================
// TYPES
// ============================================================

type QuestionType = 'location' | 'indications' | 'meridian' | 'specialPoint';
type QuizPhase = 'setup' | 'playing' | 'result';

interface QuizQuestion {
  point: Acupoint;
  meridian: Meridian;
  type: QuestionType;
  question: string;
  options: string[];
  correctIndex: number;
}

interface QuizAnswer {
  question: QuizQuestion;
  selectedIndex: number;
  isCorrect: boolean;
  explanation: string;
}

// ============================================================
// QUESTION GENERATION
// ============================================================

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  location: '定位',
  indications: '主治',
  meridian: '归经',
  specialPoint: '特定穴',
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWrongOptions(
  correctValue: string,
  allValues: string[],
  count: number
): string[] {
  const filtered = allValues.filter((v) => v && v !== correctValue);
  const unique = [...new Set(filtered)];
  return shuffleArray(unique).slice(0, count);
}

function generateQuestion(
  point: Acupoint,
  meridian: Meridian,
  type: QuestionType,
  allMeridians: Meridian[]
): QuizQuestion | null {
  switch (type) {
    case 'location': {
      if (!point.location) return null;
      const allLocations = allMeridians.flatMap((m) =>
        m.points.filter((p) => p.location).map((p) => p.location)
      );
      const wrongs = getWrongOptions(point.location, allLocations, 3);
      if (wrongs.length < 3) return null;
      const options = shuffleArray([point.location, ...wrongs]);
      return {
        point,
        meridian,
        type,
        question: `「${point.name}」的定位是？`,
        options,
        correctIndex: options.indexOf(point.location),
      };
    }
    case 'indications': {
      if (!point.indications) return null;
      const allIndications = allMeridians.flatMap((m) =>
        m.points.filter((p) => p.indications).map((p) => p.indications)
      );
      const wrongs = getWrongOptions(point.indications, allIndications, 3);
      if (wrongs.length < 3) return null;
      const options = shuffleArray([point.indications, ...wrongs]);
      return {
        point,
        meridian,
        type,
        question: `「${point.name}」的主治是？`,
        options,
        correctIndex: options.indexOf(point.indications),
      };
    }
    case 'meridian': {
      const correctName = meridian.name;
      const wrongMeridians = allMeridians.filter((m) => m.name !== correctName);
      const wrongNames = shuffleArray(wrongMeridians.map((m) => m.name)).slice(0, 3);
      if (wrongNames.length < 3) return null;
      const options = shuffleArray([correctName, ...wrongNames]);
      return {
        point,
        meridian,
        type,
        question: `「${point.name}」属于哪条经脉？`,
        options,
        correctIndex: options.indexOf(correctName),
      };
    }
    case 'specialPoint': {
      if (!point.specialPoint) return null;
      const allSpecial = allMeridians.flatMap((m) =>
        m.points.filter((p) => p.specialPoint).map((p) => p.specialPoint)
      );
      const wrongs = getWrongOptions(point.specialPoint, allSpecial, 3);
      if (wrongs.length < 3) return null;
      const options = shuffleArray([point.specialPoint, ...wrongs]);
      return {
        point,
        meridian,
        type,
        question: `「${point.name}」的特定穴类别是？`,
        options,
        correctIndex: options.indexOf(point.specialPoint),
      };
    }
  }
  return null;
}

function generateQuiz(
  count: number,
  selectedTypes: QuestionType[],
  meridianFilter: string | null,
  wuxingFilter: WuxingElement | null
): QuizQuestion[] {
  // 收集可用穴位
  let candidates: Array<{ point: Acupoint; meridian: Meridian }> = [];
  for (const m of TWELVE_MERIDIANS) {
    if (meridianFilter && m.code !== meridianFilter) continue;
    if (wuxingFilter && m.wuxing !== wuxingFilter) continue;
    for (const p of m.points) {
      candidates.push({ point: p, meridian: m });
    }
  }

  candidates = shuffleArray(candidates);
  const questions: QuizQuestion[] = [];
  const usedPointCodes = new Set<string>();

  for (const { point, meridian } of candidates) {
    if (questions.length >= count) break;
    if (usedPointCodes.has(point.code)) continue;

    // 随机选一个题型
    const availableTypes = selectedTypes.filter((t) => {
      if (t === 'location') return !!point.location;
      if (t === 'indications') return !!point.indications;
      if (t === 'specialPoint') return !!point.specialPoint;
      return true; // meridian always available
    });

    if (availableTypes.length === 0) continue;

    const type = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    const q = generateQuestion(point, meridian, type, TWELVE_MERIDIANS);
    if (q) {
      questions.push(q);
      usedPointCodes.add(point.code);
    }
  }

  return questions;
}

// ============================================================
// COMPONENT
// ============================================================

export default function QuizPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<QuizPhase>('setup');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  // Setup state
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>([
    'location',
    'indications',
    'meridian',
    'specialPoint',
  ]);
  const [meridianFilter, setMeridianFilter] = useState<string | null>(null);
  const [wuxingFilter, setWuxingFilter] = useState<WuxingElement | null>(null);

  const currentQuestion = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100 : 0;
  const correctCount = answers.filter((a) => a.isCorrect).length;

  const toggleType = useCallback((type: QuestionType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        if (prev.length <= 1) return prev;
        return prev.filter((t) => t !== type);
      }
      return [...prev, type];
    });
  }, []);

  const startQuiz = useCallback(() => {
    const qs = generateQuiz(questionCount, selectedTypes, meridianFilter, wuxingFilter);
    if (qs.length === 0) {
      alert('所选条件下无法生成题目，请调整筛选条件');
      return;
    }
    setQuestions(qs);
    setCurrentIndex(0);
    setAnswers([]);
    setSelectedOption(null);
    setShowResult(false);
    setExplanation('');
    setPhase('playing');
  }, [questionCount, selectedTypes, meridianFilter, wuxingFilter]);

  const handleSelect = useCallback(
    (index: number) => {
      if (showResult || !currentQuestion) return;
      setSelectedOption(index);
      const isCorrect = index === currentQuestion.correctIndex;

      const answer: QuizAnswer = {
        question: currentQuestion,
        selectedIndex: index,
        isCorrect,
        explanation: '',
      };
      setAnswers((prev) => [...prev, answer]);
      setShowResult(true);

      // 如果答错，自动请求AI解析
      if (!isCorrect) {
        fetchExplanation(currentQuestion, index);
      }

      // ★ 答对时获得修为
      if (isCorrect) {
        try {
          const zhEl = currentQuestion.meridian?.wuxing || '土';
          const el: any = zhEl === '金' ? 'metal' : zhEl === '水' ? 'water' : zhEl === '木' ? 'wood' : zhEl === '火' ? 'fire' : 'earth';
          const gain = XIUWEI_GAINS.acupoint_quiz;
          useCultivationStore.getState().addXiuWei(el, gain);
          useCultivationStore.getState().recordPractice('acupointQuiz', 30, el, gain);
          useCultivationStore.getState().completeTodayStep('acupoint_quiz');
          // 异步写入 DB
          fetch('/api/cultivation/practice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: getClientUserId(),
              category: 'acupointQuiz',
              element: el,
              durationSec: 30,
              cycles: 1,
            }),
          }).catch(() => {});
        } catch {}
      }
    },
    [currentQuestion, showResult]
  );

  const fetchExplanation = async (q: QuizQuestion, selectedIdx: number) => {
    setLoadingExplanation(true);
    try {
      const res = await fetch('/api/quiz-explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pointName: q.point.name,
          correctAnswer: q.options[q.correctIndex],
          userAnswer: q.options[selectedIdx],
          questionType: q.type,
        }),
      });
      const data = await res.json();
      setExplanation(data.content || '');
    } catch {
      setExplanation('解析加载失败');
    }
    setLoadingExplanation(false);
  };

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      setPhase('result');
    } else {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setShowResult(false);
      setExplanation('');
    }
  }, [currentIndex, questions.length]);

  const goTo3D = useCallback(
    (point: Acupoint) => {
      router.push(`/meridian?focus=${point.code}`);
    },
    [router]
  );

  const restartQuiz = useCallback(() => {
    setPhase('setup');
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setExplanation('');
  }, []);

  // ============================================================
  // SETUP SCREEN
  // ============================================================
  if (phase === 'setup') {
    return (
      <PageContainer theme="healing" className="text-gray-900 pb-20">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Header with back button */}
          <div className="flex items-center gap-3 mb-6">
            <Link
              href="/meridian"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all"
            >
              ←
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                穴位测验
              </h1>
              <p className="text-xs text-gray-400">巩固经络穴位知识，答错可跳转3D模型查看</p>
            </div>
          </div>

          {/* Question Count */}
          <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 block mb-2">题目数量</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    questionCount === n
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {n}题
                </button>
              ))}
            </div>
          </div>

          {/* Question Types */}
          <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 block mb-2">题型选择</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(QUESTION_TYPE_LABELS) as [QuestionType, string][]).map(
                ([type, label]) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all ${
                      selectedTypes.includes(type)
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {label}题
                  </button>
                )
              )}
            </div>
          </div>

          {/* Meridian Filter */}
          <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 block mb-2">经脉筛选（可选）</label>
            <select
              value={meridianFilter || ''}
              onChange={(e) => setMeridianFilter(e.target.value || null)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">全部经脉</option>
              {TWELVE_MERIDIANS.map((m) => (
                <option key={m.code} value={m.code}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </div>

          {/* Wuxing Filter */}
          <div className="bg-white rounded-2xl p-4 mb-4 border border-gray-100 shadow-sm">
            <label className="text-sm font-semibold text-gray-700 block mb-2">五行筛选（可选）</label>
            <div className="flex gap-2">
              {(['金', '木', '水', '火', '土'] as WuxingElement[]).map((w) => {
                const colorMap: Record<string, string> = {
                  金: 'from-yellow-500 to-amber-400',
                  木: 'from-green-500 to-emerald-400',
                  水: 'from-blue-500 to-cyan-400',
                  火: 'from-red-500 to-orange-400',
                  土: 'from-yellow-700 to-amber-600',
                };
                return (
                  <button
                    key={w}
                    onClick={() => setWuxingFilter(wuxingFilter === w ? null : w)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      wuxingFilter === w
                        ? `bg-gradient-to-br ${colorMap[w]} text-white shadow-sm`
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={startQuiz}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl text-lg shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-[0.98]"
          >
            开始测验
          </button>

          {/* AI Deep Eval Entry */}
          <Link
            href="/quiz/ai-eval"
            className="block mt-3 w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white font-bold rounded-2xl text-lg shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all active:scale-[0.98] text-center"
          >
            AI 深度测评 →
          </Link>
          <p className="text-xs text-gray-400 text-center mt-1">自由输入 · 五维评分 · 深度理解评估</p>
          <Link
            href="/quiz/ai-eval-history"
            className="block mt-2 w-full py-2.5 bg-white text-gray-500 font-bold rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-emerald-600 transition-all active:scale-[0.98] text-center text-sm"
          >
            测评历史
          </Link>
        </div>
        <BottomNav />
      </PageContainer>
    );
  }

  // ============================================================
  // PLAYING SCREEN
  // ============================================================
  if (phase === 'playing' && currentQuestion) {
    return (
      <PageContainer theme="healing" className="text-gray-900 pb-20">
        <div className="max-w-lg mx-auto px-4 py-3">
          {/* Top bar with exit */}
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => {
                if (confirm('确定退出测验？当前进度将丢失')) restartQuiz();
              }}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕ 退出
            </button>
            <span className="text-sm font-semibold text-emerald-600">
              {correctCount}/{currentIndex + (showResult ? 1 : 0)} 正确
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mb-5">
            <div className="text-sm text-gray-500 mb-1.5">
              第 {currentIndex + 1}/{questions.length} 题
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl p-5 mb-4 border border-gray-100 shadow-sm">
            {/* Type Tag + Meridian */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                {QUESTION_TYPE_LABELS[currentQuestion.type]}题
              </span>
              <span className="text-xs text-gray-400">
                {currentQuestion.meridian.name} · {currentQuestion.point.code}
              </span>
            </div>
            {/* Question */}
            <h2 className="text-lg font-bold text-gray-900 leading-relaxed">
              {currentQuestion.question}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-4">
            {currentQuestion.options.map((option, idx) => {
              let borderColor = 'border-gray-200';
              let bgColor = 'bg-white';
              let textColor = 'text-gray-800';
              let letterBg = 'bg-gray-100 text-gray-600';

              if (showResult) {
                if (idx === currentQuestion.correctIndex) {
                  borderColor = 'border-emerald-400';
                  bgColor = 'bg-emerald-50';
                  textColor = 'text-emerald-800';
                  letterBg = 'bg-emerald-600 text-white';
                } else if (idx === selectedOption && !answers[answers.length - 1]?.isCorrect) {
                  borderColor = 'border-red-400';
                  bgColor = 'bg-red-50';
                  textColor = 'text-red-800';
                  letterBg = 'bg-red-600 text-white';
                } else {
                  textColor = 'text-gray-400';
                  letterBg = 'bg-gray-50 text-gray-300';
                }
              } else if (idx === selectedOption) {
                borderColor = 'border-blue-400';
                bgColor = 'bg-blue-50';
                letterBg = 'bg-blue-600 text-white';
              }

              const letterMap = ['A', 'B', 'C', 'D'];
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={showResult}
                  className={`w-full text-left p-4 rounded-xl border-2 ${borderColor} ${bgColor} transition-all shadow-sm ${
                    showResult ? 'cursor-default' : 'hover:shadow-md active:scale-[0.99]'
                  }`}
                >
                  <div className="flex gap-3 items-start">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${letterBg}`}
                    >
                      {letterMap[idx]}
                    </span>
                    <span className={`text-base leading-relaxed font-medium ${textColor}`}>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation (shown after answering wrong) */}
          {showResult && !answers[answers.length - 1]?.isCorrect && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-orange-600 text-sm font-bold">AI 解析</span>
                {loadingExplanation && (
                  <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                )}
              </div>
              <p className="text-sm text-orange-800 leading-relaxed whitespace-pre-wrap">
                {explanation || (loadingExplanation ? '正在生成解析...' : '')}
              </p>
              <button
                onClick={() => goTo3D(currentQuestion.point)}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all shadow-sm"
              >
                查看3D定位 →
              </button>
            </div>
          )}

          {/* Correct Answer Feedback */}
          {showResult && answers[answers.length - 1]?.isCorrect && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4">
              <p className="text-sm text-emerald-700 font-bold">回答正确！</p>
            </div>
          )}

          {/* Next Button */}
          {showResult && (
            <button
              onClick={nextQuestion}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl text-base shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-[0.98]"
            >
              {currentIndex + 1 >= questions.length ? '查看成绩' : '下一题 →'}
            </button>
          )}
        </div>
        <BottomNav />
      </PageContainer>
    );
  }

  // ============================================================
  // RESULT SCREEN
  // ============================================================
  if (phase === 'result') {
    const wrongAnswers = answers.filter((a) => !a.isCorrect);
    const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;
    const grade =
      score >= 90 ? '优秀' : score >= 80 ? '良好' : score >= 70 ? '中等' : score >= 60 ? '及格' : '需努力';

    return (
      <PageContainer theme="healing" className="text-gray-900 pb-20">
        <div className="max-w-lg mx-auto px-4 py-6">
          {/* Score Card */}
          <div className="text-center mb-6">
            <div
              className={`w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-4 ${
                score >= 80
                  ? 'bg-emerald-100 border-2 border-emerald-400'
                  : score >= 60
                  ? 'bg-yellow-100 border-2 border-yellow-400'
                  : 'bg-red-100 border-2 border-red-400'
              }`}
            >
              <div>
                <div className={`text-3xl font-black ${score >= 80 ? 'text-emerald-700' : score >= 60 ? 'text-yellow-700' : 'text-red-700'}`}>{score}</div>
                <div className="text-xs text-gray-400">分</div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{grade}</h2>
            <p className="text-sm text-gray-500 mt-1">
              共 {questions.length} 题，正确 {correctCount} 题，错误 {wrongAnswers.length} 题
            </p>
            {/* ★ 修为获得提示 */}
            {correctCount > 0 && (
              <div className="mt-2 inline-block px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                <span className="text-xs font-bold text-emerald-700">+{correctCount * XIUWEI_GAINS.acupoint_quiz} 修为</span>
              </div>
            )}
          </div>

          {/* Wrong Answers Review */}
          {wrongAnswers.length > 0 && (
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-700 mb-3">错题回顾</h3>
              <div className="space-y-3">
                {wrongAnswers.map((ans, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 mr-2">
                          {QUESTION_TYPE_LABELS[ans.question.type]}题
                        </span>
                        <span className="text-xs text-gray-400">
                          {ans.question.meridian.name}
                        </span>
                      </div>
                      <button
                        onClick={() => goTo3D(ans.question.point)}
                        className="text-xs px-2.5 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shrink-0 font-bold"
                      >
                        3D查看
                      </button>
                    </div>
                    <p className="text-sm text-gray-900 font-bold mb-2">
                      {ans.question.question}
                    </p>
                    <div className="space-y-1 text-sm">
                      <p className="text-red-600">
                        你的答案：{ans.question.options[ans.selectedIndex]}
                      </p>
                      <p className="text-emerald-600 font-medium">
                        正确答案：{ans.question.options[ans.question.correctIndex]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Correct */}
          {wrongAnswers.length === 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center mb-6">
              <p className="text-emerald-700 font-bold text-lg">全部正确！</p>
              <p className="text-sm text-emerald-600 mt-1">恭喜你，对穴位知识掌握非常扎实</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={restartQuiz}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-[0.98]"
            >
              再来一轮
            </button>
            <button
              onClick={() => router.push('/meridian')}
              className="w-full py-3.5 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
            >
              进入3D经络
            </button>
          </div>
        </div>
        <BottomNav />
      </PageContainer>
    );
  }

  return null;
}
