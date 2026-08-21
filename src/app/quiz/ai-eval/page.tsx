'use client';

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import {
  saveSession,
  generateSessionId,
  type EvalSession,
  type EvalAnswerRecord,
  type QType,
  type EvalSubScore,
} from '@/lib/ai-eval-history';
import { History, Sparkles, Zap } from 'lucide-react';

type EvalPhase = 'setup' | 'question' | 'grading' | 'result' | 'summary';

interface SubScore extends EvalSubScore {}
interface GradeResult {
  subscores: SubScore;
  score: number;
  pass: boolean;
  feedback: string;
  model_answer: string;
  incorrect_reason?: string;
}

interface EvalQuestion {
  point: Acupoint;
  meridian: Meridian;
  qType: QType;
  question: string;
  canonicalAnswer: string;
}

interface EvalAnswer {
  question: EvalQuestion;
  userAnswer: string;
  grade: GradeResult;
}

interface DimCount {
  location: number;
  indications: number;
  specialPoint: number;
  meridian: number;
  method: number;
}

interface PersistData {
  testedPoints: string[];
  dimCounts: DimCount;
  totalSessions: number;
  totalPass: number;
}

const Q_TYPE_LABELS: Record<QType, string> = {
  location: '定位',
  indications: '主治',
  specialPoint: '特定穴',
  meridian: '归经',
  method: '取穴方法',
};

const DIM_KEYS: QType[] = ['location', 'indications', 'specialPoint', 'meridian', 'method'];
const DIM_WEIGHTS: Record<QType, { accuracy: number; coverage: number; key_terms: number; specificity: number; clarity: number }> = {
  location: { accuracy: 0.40, coverage: 0.25, key_terms: 0.15, specificity: 0.10, clarity: 0.10 },
  indications: { accuracy: 0.40, coverage: 0.25, key_terms: 0.15, specificity: 0.10, clarity: 0.10 },
  specialPoint: { accuracy: 0.40, coverage: 0.25, key_terms: 0.15, specificity: 0.10, clarity: 0.10 },
  meridian: { accuracy: 0.40, coverage: 0.25, key_terms: 0.15, specificity: 0.10, clarity: 0.10 },
  method: { accuracy: 0.40, coverage: 0.25, key_terms: 0.15, specificity: 0.10, clarity: 0.10 },
};

const STORAGE_KEY = 'zhiyin-ai-eval-progress';

function loadPersist(): PersistData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const d = JSON.parse(raw);
      return {
        testedPoints: d.testedPoints || [],
        dimCounts: d.dimCounts || { location: 0, indications: 0, specialPoint: 0, meridian: 0, method: 0 },
        totalSessions: d.totalSessions || 0,
        totalPass: d.totalPass || 0,
      };
    }
  } catch {}
  return { testedPoints: [], dimCounts: { location: 0, indications: 0, specialPoint: 0, meridian: 0, method: 0 }, totalSessions: 0, totalPass: 0 };
}

function savePersist(data: PersistData) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {}
}

function pickNextDim(dimCounts: DimCount, selectedTypes: QType[]): QType {
  const available = selectedTypes.length > 0 ? selectedTypes : DIM_KEYS;
  let minCount = Infinity;
  let minDim: QType = available[0];
  for (const d of available) {
    if (dimCounts[d] < minCount) {
      minCount = dimCounts[d];
      minDim = d;
    }
  }
  return minDim;
}

function getPointDataForType(point: Acupoint, qType: QType): string {
  switch (qType) {
    case 'location': return point.location || '';
    case 'indications': return point.indications || '';
    case 'specialPoint': return point.specialPoint || '';
    case 'meridian': return '';
    case 'method': return point.method || '';
  }
}

function hasDataForType(point: Acupoint, qType: QType): boolean {
  if (qType === 'meridian') return true;
  return !!getPointDataForType(point, qType);
}

const WUXING_COLORS: Record<string, string> = {
  '金': '#5ba09a',
  '水': '#3d7a75',
  '木': '#5d8a63',
  '火': '#c26158',
  '土': '#c9a94f',
};

function FiveDimRadar({ subscores, size = 160 }: { subscores: SubScore; size?: number }) {
  const dims = [
    { key: 'accuracy', label: '准确性', value: subscores.accuracy },
    { key: 'coverage', label: '覆盖度', value: subscores.coverage },
    { key: 'key_terms', label: '术语', value: subscores.key_terms },
    { key: 'specificity', label: '特异性', value: subscores.specificity },
    { key: 'clarity', label: '清晰度', value: subscores.clarity },
  ];
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 24;

  const points = dims.map((d, i) => {
    const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
    const dist = (d.value / 5) * r;
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
      labelX: cx + (r + 16) * Math.cos(angle),
      labelY: cy + (r + 16) * Math.sin(angle),
      ...d,
    };
  });

  const polygonStr = points.map((p) => `${p.x},${p.y}`).join(' ');

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.2, 0.4, 0.6, 0.8, 1.0].map((frac) => {
        const ringPts = dims.map((_, i) => {
          const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
          const x = cx + r * frac * Math.cos(angle);
          const y = cy + r * frac * Math.sin(angle);
          return `${x},${y}`;
        }).join(' ');
        return <polygon key={frac} points={ringPts} fill="none" stroke="#e5e7eb" strokeWidth={0.5} />;
      })}
      {points.map((p, i) => {
        const next = points[(i + 1) % points.length];
        const ex = cx + r * Math.cos((Math.PI * 2 * i) / 5 - Math.PI / 2);
        const ey = cy + r * Math.sin((Math.PI * 2 * i) / 5 - Math.PI / 2);
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#e5e7eb" strokeWidth={0.5} />;
      })}
      <polygon points={polygonStr} fill="rgba(93,138,99,0.2)" stroke="#5d8a63" strokeWidth={1.5} />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#5d8a63" />
      ))}
      {points.map((p, i) => (
        <text key={`l${i}`} x={p.labelX} y={p.labelY} textAnchor="middle" dominantBaseline="middle" fontSize={9} fill="#6b7280">
          {p.label}
        </text>
      ))}
    </svg>
  );
}

function ScoreBar({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-14 text-gray-500 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: pct >= 80 ? '#5d8a63' : pct >= 60 ? '#c9a94f' : '#c26158',
          }}
        />
      </div>
      <span className="w-6 text-right font-mono text-gray-700">{value}</span>
    </div>
  );
}

export default function AiEvalPage() {
  const router = useRouter();
  const [phase, setPhase] = useState<EvalPhase>('setup');

  const [selectedTypes, setSelectedTypes] = useState<QType[]>(['location', 'indications', 'specialPoint', 'meridian', 'method']);
  const [questionCount, setQuestionCount] = useState(5);
  const [meridianFilter, setMeridianFilter] = useState<string | null>(null);

  const [currentQuestion, setCurrentQuestion] = useState<EvalQuestion | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [answers, setAnswers] = useState<EvalAnswer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(0);
  const [consecutivePass, setConsecutivePass] = useState(0);
  const [totalSessionXiuWei, setTotalSessionXiuWei] = useState(0);

  const [grading, setGrading] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<GradeResult | null>(null);

  const [loadingQ, setLoadingQ] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const persistRef = useRef<PersistData>(loadPersist());

  const toggleType = useCallback((t: QType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(t)) return prev.length <= 1 ? prev : prev.filter((x) => x !== t);
      return [...prev, t];
    });
  }, []);

  const fetchQuestion = useCallback(async (idx: number) => {
    setLoadingQ(true);
    const persist = persistRef.current;
    const nextDim = pickNextDim(persist.dimCounts, selectedTypes);

    let candidates: Array<{ point: Acupoint; meridian: Meridian }> = [];
    for (const m of TWELVE_MERIDIANS) {
      if (meridianFilter && m.code !== meridianFilter) continue;
      for (const p of m.points) {
        if (hasDataForType(p, nextDim)) {
          candidates.push({ point: p, meridian: m });
        }
      }
    }

    const untested = candidates.filter((c) => !persist.testedPoints.includes(c.point.code));
    const pool = untested.length > 0 ? untested : candidates;
    if (pool.length === 0) {
      setLoadingQ(false);
      return;
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];

    const pointData = getPointDataForType(chosen.point, nextDim);

    try {
      const res = await fetch('/api/quiz/ai-question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meridianCode: chosen.meridian.code,
          qType: nextDim,
          pointName: chosen.point.name,
          pointData: pointData ? [
            chosen.point.location ? `定位：${chosen.point.location}` : '',
            chosen.point.indications ? `主治：${chosen.point.indications}` : '',
            chosen.point.specialPoint ? `特定穴：${chosen.point.specialPoint}` : '',
            chosen.point.method ? `取穴：${chosen.point.method}` : '',
          ].filter(Boolean).join('\n') : undefined,
        }),
      });
      const data = await res.json();

      setCurrentQuestion({
        point: chosen.point,
        meridian: chosen.meridian,
        qType: nextDim,
        question: data.question || `请描述「${chosen.point.name}」的${Q_TYPE_LABELS[nextDim]}`,
        canonicalAnswer: data.canonical_answer || pointData,
      });
    } catch {
      setCurrentQuestion({
        point: chosen.point,
        meridian: chosen.meridian,
        qType: nextDim,
        question: `请描述「${chosen.point.name}」的${Q_TYPE_LABELS[nextDim]}`,
        canonicalAnswer: pointData,
      });
    }
    setUserAnswer('');
    setCurrentGrade(null);
    setLoadingQ(false);
  }, [selectedTypes, meridianFilter]);

  const startEval = useCallback(() => {
    setAnswers([]);
    setCurrentIndex(0);
    setSessionStartTime(Date.now());
    setConsecutivePass(0);
    setTotalSessionXiuWei(0);
    setPhase('question');
    fetchQuestion(0);
  }, [fetchQuestion]);

  const submitAnswer = useCallback(async () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    setGrading(true);

    try {
      const res = await fetch('/api/quiz/ai-grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuestion.question,
          canonicalAnswer: currentQuestion.canonicalAnswer,
          userAnswer: userAnswer.trim(),
          qType: currentQuestion.qType,
          pointName: currentQuestion.point.name,
        }),
      });
      const grade: GradeResult = await res.json();

      setCurrentGrade(grade);
      setAnswers((prev) => [...prev, { question: currentQuestion, userAnswer: userAnswer.trim(), grade }]);

      const persist = { ...persistRef.current };
      persist.testedPoints = [...new Set([...persist.testedPoints, currentQuestion.point.code])];
      persist.dimCounts = { ...persist.dimCounts, [currentQuestion.qType]: persist.dimCounts[currentQuestion.qType] + 1 };
      persistRef.current = persist;
      savePersist(persist);

      if (grade.pass) {
        const newConsecutive = consecutivePass + 1;
        setConsecutivePass(newConsecutive);
        try {
          const el = currentQuestion.meridian.wuxing;
          const wEl = el === '金' ? 'metal' : el === '水' ? 'water' : el === '木' ? 'wood' : el === '火' ? 'fire' : 'earth' as any;
          let gain = XIUWEI_GAINS.acupoint_quiz;
          // 连续通过3题以上，额外+1修为
          let bonusGain = 0;
          if (newConsecutive >= 3) {
            bonusGain = 1;
            gain += bonusGain;
          }
          // 全部通过且最后一题，额外+2修为
          const isLastAndAllPass = (currentIndex + 1 >= questionCount) && answers.every((a) => a.grade.pass);
          if (isLastAndAllPass) {
            gain += 2;
          }
          useCultivationStore.getState().addXiuWei(wEl as any, gain);
          useCultivationStore.getState().recordPractice('acupointQuiz', 60, wEl as any, gain);
          useCultivationStore.getState().completeTodayStep('acupoint_quiz');
          setTotalSessionXiuWei((prev) => prev + gain);
          fetch('/api/cultivation/practice', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: 'acupointQuiz', durationSec: 60, element: wEl, gain }),
          }).catch(() => {});
        } catch {}
      } else {
        setConsecutivePass(0);
      }
    } catch {
      setCurrentGrade({
        subscores: { accuracy: 0, coverage: 0, key_terms: 0, specificity: 0, clarity: 0 },
        score: 0,
        pass: false,
        feedback: '评分服务暂时不可用，请稍后重试。',
        model_answer: currentQuestion.canonicalAnswer,
        incorrect_reason: 'API 调用失败',
      });
    }

    setGrading(false);
    setPhase('result');
  }, [currentQuestion, userAnswer, consecutivePass, answers, currentIndex, questionCount]);

  const nextQuestion = useCallback(() => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= questionCount) {
      const persist = { ...persistRef.current };
      persist.totalSessions += 1;
      persist.totalPass += answers.filter((a) => a.grade.pass).length;
      persistRef.current = persist;
      savePersist(persist);

      // 保存测评历史记录
      const session: EvalSession = {
        id: generateSessionId(),
        startTime: sessionStartTime,
        endTime: Date.now(),
        questionCount,
        answers: answers.map((a) => ({
          pointCode: a.question.point.code,
          pointName: a.question.point.name,
          meridianCode: a.question.meridian.code,
          meridianName: a.question.meridian.name,
          qType: a.question.qType,
          question: a.question.question,
          userAnswer: a.userAnswer,
          score: a.grade.score,
          pass: a.grade.pass,
          subscores: a.grade.subscores,
          feedback: a.grade.feedback,
          modelAnswer: a.grade.model_answer,
          incorrectReason: a.grade.incorrect_reason,
        })),
        avgScore: answers.length > 0 ? Math.round(answers.reduce((s, a) => s + a.grade.score, 0) / answers.length) : 0,
        passCount: answers.filter((a) => a.grade.pass).length,
        totalXiuWei: totalSessionXiuWei,
        selectedTypes: [...selectedTypes],
        meridianFilter,
      };
      saveSession(session);

      setPhase('summary');
      return;
    }
    setCurrentIndex(nextIdx);
    setPhase('question');
    fetchQuestion(nextIdx);
  }, [currentIndex, questionCount, answers.length, fetchQuestion, sessionStartTime, totalSessionXiuWei, selectedTypes, meridianFilter]);

  const goTo3D = useCallback((point: Acupoint) => {
    router.push(`/healing/acupoint`);
  }, [router]);

  const persist = persistRef.current;
  const totalAnswered = answers.length;
  const passCount = answers.filter((a) => a.grade.pass).length;
  const avgScore = totalAnswered > 0 ? Math.round(answers.reduce((s, a) => s + a.grade.score, 0) / totalAnswered) : 0;

  return (
    <PageContainer theme="healing" className="text-gray-900 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link href="/quiz" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-black">AI 深度测评</h1>
            <p className="text-xs text-gray-400">自由输入 · 五维评分 · 深度评估</p>
          </div>
          <Link
            href="/quiz/ai-eval-history"
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-emerald-600 transition-all"
            title="测评历史"
          >
            <History size={20} />
          </Link>
        </div>

        {/* ═══ SETUP ═══ */}
        {phase === 'setup' && (
          <div className="space-y-6">
            {/* Dimension selection */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">测评维度</h3>
              <div className="flex flex-wrap gap-2">
                {DIM_KEYS.map((t) => (
                  <button
                    key={t}
                    onClick={() => toggleType(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      selectedTypes.includes(t)
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {Q_TYPE_LABELS[t]}
                  </button>
                ))}
              </div>
            </div>

            {/* Meridian filter */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">经脉筛选</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setMeridianFilter(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    !meridianFilter ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  全部
                </button>
                {TWELVE_MERIDIANS.map((m) => (
                  <button
                    key={m.code}
                    onClick={() => setMeridianFilter(m.code)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                      meridianFilter === m.code ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    style={meridianFilter === m.code ? { background: WUXING_COLORS[m.wuxing] || '#5d8a63' } : undefined}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Question count */}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">题目数量</h3>
              <div className="flex gap-2">
                {[3, 5, 10, 15].map((n) => (
                  <button
                    key={n}
                    onClick={() => setQuestionCount(n)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      questionCount === n
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {n}题
                  </button>
                ))}
              </div>
            </div>

            {/* Dimension balance info */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#c9a94f" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <span className="text-xs font-bold text-amber-700">维度均衡轮转</span>
              </div>
              <div className="flex gap-3 text-xs text-amber-700">
                {DIM_KEYS.map((d) => (
                  <span key={d}>{Q_TYPE_LABELS[d]}:{persist.dimCounts[d]}</span>
                ))}
              </div>
              <p className="text-xs text-amber-600 mt-1">系统自动优先出题次数最少的维度，避免偏科</p>
            </div>

            {/* Progress */}
            {persist.testedPoints.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                <p className="text-xs text-gray-500">
                  已测 <span className="font-bold text-gray-700">{persist.testedPoints.length}</span> 个穴位 · 
                  通过 <span className="font-bold text-emerald-700">{persist.totalPass}</span> / {persist.totalSessions} 题
                </p>
              </div>
            )}

            <button
              onClick={startEval}
              disabled={selectedTypes.length === 0}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              开始深度测评
            </button>
          </div>
        )}

        {/* ═══ QUESTION ═══ */}
        {phase === 'question' && (
          <div className="space-y-5">
            {/* Progress */}
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>第 {currentIndex + 1} / {questionCount} 题</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">
                {Q_TYPE_LABELS[currentQuestion?.qType || 'location']}
              </span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${((currentIndex) / questionCount) * 100}%` }} />
            </div>

            {/* Question card */}
            {loadingQ ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
                <div className="animate-pulse text-gray-400">AI 正在出题...</div>
              </div>
            ) : currentQuestion ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-bold text-gray-400">{currentQuestion.meridian.name}</span>
                  <span className="text-xs text-gray-300">|</span>
                  <span className="text-lg font-black text-gray-900">{currentQuestion.point.name}</span>
                  {currentQuestion.point.isJingWell && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">井穴</span>}
                  {currentQuestion.point.isYuan && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">原穴</span>}
                </div>
                <p className="text-base font-bold text-gray-800 leading-relaxed">{currentQuestion.question}</p>
              </div>
            ) : null}

            {/* Answer textarea */}
            <div>
              <label className="text-xs font-bold text-gray-500 mb-2 block">你的回答</label>
              <textarea
                ref={textareaRef}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                placeholder="请用文字描述你的答案..."
                className="w-full h-40 px-4 py-3 border border-gray-200 rounded-2xl text-sm text-gray-800 placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all"
                disabled={loadingQ}
              />
              <p className="text-xs text-gray-300 mt-1 text-right">{userAnswer.length} 字</p>
            </div>

            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim() || grading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {grading ? 'AI 评分中...' : '提交答案'}
            </button>
          </div>
        )}

        {/* ═══ RESULT (per-question) ═══ */}
        {phase === 'result' && currentGrade && currentQuestion && (
          <div className="space-y-5">
            {/* Score circle */}
            <div className="text-center">
              <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-3 border-2 ${
                currentGrade.pass ? 'bg-emerald-50 border-emerald-400' : 'bg-red-50 border-red-300'
              }`}>
                <div>
                  <div className={`text-2xl font-black ${currentGrade.pass ? 'text-emerald-700' : 'text-red-600'}`}>
                    {currentGrade.score}
                  </div>
                  <div className="text-[10px] text-gray-400">分</div>
                </div>
              </div>
              <div className={`text-sm font-bold ${currentGrade.pass ? 'text-emerald-700' : 'text-red-600'}`}>
                {currentGrade.pass ? '通过' : '未通过'}
              </div>
              {currentGrade.pass && (
                <div className="mt-1 flex flex-col items-center gap-1">
                  <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                    <span className="text-xs font-bold text-emerald-700">+{XIUWEI_GAINS.acupoint_quiz + (consecutivePass >= 3 ? 1 : 0)} 修为</span>
                  </div>
                  {consecutivePass >= 3 && (
                    <span className="text-[10px] font-bold text-amber-600 flex items-center gap-0.5">
                      <Sparkles size={10} /> 连续×{consecutivePass} +1加成
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Five-dimension radar */}
            <div className="flex justify-center">
              <FiveDimRadar subscores={currentGrade.subscores} size={180} />
            </div>

            {/* Score bars */}
            <div className="space-y-2 px-2">
              <ScoreBar label="准确性" value={currentGrade.subscores.accuracy} />
              <ScoreBar label="覆盖度" value={currentGrade.subscores.coverage} />
              <ScoreBar label="术语" value={currentGrade.subscores.key_terms} />
              <ScoreBar label="特异性" value={currentGrade.subscores.specificity} />
              <ScoreBar label="清晰度" value={currentGrade.subscores.clarity} />
            </div>

            {/* Feedback */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <p className="text-sm text-gray-700 leading-relaxed">{currentGrade.feedback}</p>
              {currentGrade.incorrect_reason && (
                <p className="text-xs text-red-500 mt-2">不足之处：{currentGrade.incorrect_reason}</p>
              )}
            </div>

            {/* Model answer */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-emerald-700 mb-1">参考答案</h4>
              <div className="text-sm text-emerald-800 leading-relaxed whitespace-pre-line">
                {currentGrade.model_answer.split('|').map((part: string, i: number) => {
                  const trimmed = part.trim();
                  if (!trimmed) return null;
                  return <p key={i}>{trimmed}</p>;
                })}
              </div>
            </div>

            {/* 3D link for wrong answers */}
            {!currentGrade.pass && (
              <button
                onClick={() => goTo3D(currentQuestion.point)}
                className="w-full py-3 bg-white text-emerald-700 font-bold rounded-2xl border border-emerald-200 hover:bg-emerald-50 transition-all active:scale-[0.98]"
              >
                3D查看「{currentQuestion.point.name}」
              </button>
            )}

            <button
              onClick={nextQuestion}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-[0.98]"
            >
              {currentIndex + 1 >= questionCount ? '查看总结' : '下一题 →'}
            </button>
          </div>
        )}

        {/* ═══ SUMMARY ═══ */}
        {phase === 'summary' && (
          <div className="space-y-5">
            <div className="text-center">
              <div className="w-28 h-28 mx-auto rounded-full flex items-center justify-center mb-4 border-2 bg-emerald-50 border-emerald-400">
                <div>
                  <div className="text-3xl font-black text-emerald-700">{avgScore}</div>
                  <div className="text-xs text-gray-400">平均分</div>
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900">
                {avgScore >= 90 ? '优秀' : avgScore >= 80 ? '良好' : avgScore >= 70 ? '中等' : avgScore >= 60 ? '及格' : '需努力'}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                共 {totalAnswered} 题，通过 {passCount} 题
              </p>
              {/* 修为奖励汇总 */}
              {totalSessionXiuWei > 0 && (
                <div className="mt-3 inline-flex flex-col items-center gap-1.5">
                  <div className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 inline-flex items-center gap-2">
                    <Zap size={14} className="text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">+{totalSessionXiuWei} 修为</span>
                  </div>
                  {consecutivePass >= 3 && (
                    <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 inline-flex items-center gap-1">
                      <Sparkles size={12} className="text-amber-500" />
                      <span className="text-[10px] font-bold text-amber-700">连续通过 ×{consecutivePass} 额外加成</span>
                    </div>
                  )}
                  {answers.every((a) => a.grade.pass) && totalAnswered >= 3 && (
                    <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 inline-flex items-center gap-1">
                      <Sparkles size={12} className="text-blue-500" />
                      <span className="text-[10px] font-bold text-blue-700">全部通过 额外+2修为</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dimension distribution */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
              <h4 className="text-xs font-bold text-gray-500 mb-2">维度分布</h4>
              <div className="flex gap-3 flex-wrap text-xs">
                {DIM_KEYS.map((d) => (
                  <span key={d} className="text-gray-600">
                    {Q_TYPE_LABELS[d]}: {persistRef.current.dimCounts[d]}题
                  </span>
                ))}
              </div>
            </div>

            {/* Wrong answers review */}
            {answers.filter((a) => !a.grade.pass).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">未通过题目</h3>
                <div className="space-y-3">
                  {answers.filter((a) => !a.grade.pass).map((ans, idx) => (
                    <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 mr-2">
                            {Q_TYPE_LABELS[ans.question.qType]}
                          </span>
                          <span className="text-xs text-gray-400">{ans.question.meridian.name} · {ans.question.point.name}</span>
                        </div>
                        <button
                          onClick={() => goTo3D(ans.question.point)}
                          className="text-xs px-2.5 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shrink-0 font-bold"
                        >
                          3D
                        </button>
                      </div>
                      <p className="text-sm text-gray-800 mb-1">{ans.question.question}</p>
                      <p className="text-xs text-red-500 mb-1">你的答案：{ans.userAnswer.slice(0, 80)}...</p>
                      <p className="text-xs text-emerald-600">得分：{ans.grade.score} · {ans.grade.feedback}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All passed */}
            {answers.every((a) => a.grade.pass) && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <p className="text-emerald-700 font-bold text-lg">全部通过！</p>
                <p className="text-sm text-emerald-600 mt-1">对穴位理解非常深入</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => { setPhase('setup'); setAnswers([]); setCurrentIndex(0); }}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all active:scale-[0.98]"
              >
                再来一轮
              </button>
              <Link
                href="/quiz/ai-eval-history"
                className="w-full py-3.5 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <History size={16} />
                查看测评历史
              </Link>
              <button
                onClick={() => router.push('/healing/acupoint')}
                className="w-full py-3.5 bg-white text-gray-700 font-bold rounded-2xl border border-gray-200 shadow-sm hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                进入穴位定位
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav />
    </PageContainer>
  );
}
