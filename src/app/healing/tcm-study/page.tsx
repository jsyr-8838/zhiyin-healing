'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import { TCM_COURSES, TCM_DAILY_TIPS, type TcmCourse, type TcmLesson } from '@/lib/tcm-study-data';
import { useCultivationStore } from '@/lib/cultivation-store';
import { ELEMENT_COLORS, ELEMENT_NAMES, XIUWEI_GAINS } from '@/lib/cultivation-engine';
import { ArrowLeft, BookOpen, ChevronRight, ChevronLeft, Check, Award, Flame, Calendar, Sparkles, RotateCw } from 'lucide-react';

// ═══════════════════════════════════════
// 进度管理（localStorage 持久化）
// ═══════════════════════════════════════

interface StudyProgress {
  completedLessons: Record<string, number[]>; // courseId → lesson indices
  quizScores: Record<string, number>;        // courseId → score (0-100)
  dailyCheckIn: string[];                      // YYYY-MM-DD 列表
  lastTipDate: string;
  viewedTips: number[];
}

const STORAGE_KEY = 'tcm-study-progress';

function loadProgress(): StudyProgress {
  if (typeof window === 'undefined') return { completedLessons: {}, quizScores: {}, dailyCheckIn: [], lastTipDate: '', viewedTips: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { completedLessons: {}, quizScores: {}, dailyCheckIn: [], lastTipDate: '', viewedTips: [] };
}

function saveProgress(p: StudyProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// ═══════════════════════════════════════
// 主组件
// ═══════════════════════════════════════

type View = 'list' | 'course' | 'lesson' | 'quiz' | 'review' | 'progress';

export default function TcmStudyPage() {
  const [progress, setProgress] = useState<StudyProgress>(loadProgress);
  const [view, setView] = useState<View>('list');
  const [activeCourseId, setActiveCourseId] = useState<string>('');
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);
  const [showTip, setShowTip] = useState(false);

  const { addXiuWei, recordPractice, completeTodayStep } = useCultivationStore();

  // 进度持久化
  useEffect(() => { saveProgress(progress); }, [progress]);

  // 每日一识：按日期选索引
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setTipIdx(dayOfYear % TCM_DAILY_TIPS.length);
    if (progress.lastTipDate !== today) {
      setShowTip(true);
    }
  }, []);

  // ── 辅助函数 ──
  const activeCourse = useMemo(() => TCM_COURSES.find(c => c.id === activeCourseId) || null, [activeCourseId]);

  const getCourseProgress = useCallback((courseId: string): number => {
    const course = TCM_COURSES.find(c => c.id === courseId);
    if (!course) return 0;
    const done = progress.completedLessons[courseId]?.length || 0;
    return Math.round((done / course.lessons.length) * 100);
  }, [progress]);

  const getTotalProgress = useCallback((): number => {
    const totalLessons = TCM_COURSES.reduce((s, c) => s + c.lessons.length, 0);
    const doneLessons = TCM_COURSES.reduce((s, c) => s + (progress.completedLessons[c.id]?.length || 0), 0);
    return Math.round((doneLessons / totalLessons) * 100);
  }, [progress]);

  const isLessonDone = useCallback((courseId: string, idx: number): boolean => {
    return (progress.completedLessons[courseId] || []).includes(idx);
  }, [progress]);

  const markLessonDone = useCallback((courseId: string, idx: number, element: string) => {
    setProgress(prev => {
      const arr = prev.completedLessons[courseId] || [];
      if (arr.includes(idx)) return prev; // 已完成，不重复
      return { ...prev, completedLessons: { ...prev.completedLessons, [courseId]: [...arr, idx] } };
    });
    // 修为：每完成一课时 +2
    const el = element as 'wood' | 'fire' | 'earth' | 'metal' | 'water';
    addXiuWei(el, 2);
    recordPractice('tcm-study', 120, el, 2);
    completeTodayStep('tcm-study');
  }, [addXiuWei, recordPractice, completeTodayStep]);

  const submitQuiz = useCallback((courseId: string, score: number, element: string) => {
    setProgress(prev => ({
      ...prev,
      quizScores: { ...prev.quizScores, [courseId]: Math.max(prev.quizScores[courseId] || 0, score) },
    }));
    // 测验满分 +5，及格 +3
    const el = element as 'wood' | 'fire' | 'earth' | 'metal' | 'water';
    const gain = score >= 100 ? 5 : score >= 75 ? 4 : score >= 50 ? 3 : 1;
    addXiuWei(el, gain);
    recordPractice('tcm-study-quiz', 300, el, gain);
    completeTodayStep('tcm-study');
  }, [addXiuWei, recordPractice, completeTodayStep]);

  const dailyCheckIn = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (progress.dailyCheckIn.includes(today)) return;
    setProgress(prev => ({ ...prev, dailyCheckIn: [...prev.dailyCheckIn, today] }));
    // 打卡 +1 修为（土行）
    addXiuWei('earth', 1);
    completeTodayStep('tcm-study');
  }, [progress.dailyCheckIn, addXiuWei, completeTodayStep]);

  const isTodayCheckedIn = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return progress.dailyCheckIn.includes(today);
  }, [progress.dailyCheckIn]);

  const streakDays = useMemo(() => {
    if (progress.dailyCheckIn.length === 0) return 0;
    const sorted = [...progress.dailyCheckIn].sort().reverse();
    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
      const d1 = new Date(sorted[i]);
      const d2 = new Date(sorted[i + 1]);
      const diff = (d1.getTime() - d2.getTime()) / 86400000;
      if (diff === 1) streak++;
      else break;
    }
    return streak;
  }, [progress.dailyCheckIn]);

  // ═══════════════════════════════════════
  // 渲染
  // ═══════════════════════════════════════

  return (
    <PageContainer theme="healing" className="pb-24">
      {/* ===== 顶部 ===== */}
      <div className="px-5 pt-12 pb-5 text-white" style={{ background: 'linear-gradient(135deg, #5D4037, #3E2723)' }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => view !== 'list' ? setView('list') : window.history.back()} className="text-white/70 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-black font-serif">中医学习</h1>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold ml-auto">从零到进阶</span>
        </div>
        <p className="text-sm text-white/60 font-serif">12课程 · 49课时 · 48题测验 · 修为联动</p>

        {/* 总进度条 */}
        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500" style={{ width: `${getTotalProgress()}%` }} />
          </div>
          <span className="text-xs text-amber-300 font-bold">{getTotalProgress()}%</span>
        </div>

        {/* 连续打卡 */}
        <div className="mt-2 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-orange-300">
            <Flame size={13} />
            <span>连续 {streakDays} 天</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-300">
            <Check size={13} />
            <span>已学 {Object.values(progress.completedLessons).reduce((s, a) => s + a.length, 0)} 课时</span>
          </div>
          <div className="flex items-center gap-1 text-amber-300">
            <Award size={13} />
            <span>测验 {Object.keys(progress.quizScores).length} / 12</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* ===== 每日一识弹窗 ===== */}
        {showTip && tipIdx < TCM_DAILY_TIPS.length && (
          <div className="glass-card p-4 relative overflow-hidden ring-2 ring-amber-400/30 animate-in fade-in slide-in-from-top-2 duration-300">
            <button onClick={() => setShowTip(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xs">×</button>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-amber-600 text-white shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-700">{TCM_DAILY_TIPS[tipIdx].h}</p>
                <p className="text-sm text-gray-700 mt-1 leading-relaxed">{TCM_DAILY_TIPS[tipIdx].p}</p>
              </div>
            </div>
          </div>
        )}

        {/* ===== 每日打卡 ===== */}
        <button
          onClick={dailyCheckIn}
          disabled={isTodayCheckedIn}
          className={`w-full rounded-xl p-4 flex items-center gap-3 transition-all ${isTodayCheckedIn ? 'glass-card opacity-70' : 'glass-card hover:shadow-md hover:-translate-y-0.5 ring-1 ring-amber-400/30'}`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${isTodayCheckedIn ? 'bg-emerald-500' : 'bg-gradient-to-br from-amber-500 to-amber-600'} text-white`}>
            {isTodayCheckedIn ? <Check size={20} /> : <Calendar size={20} />}
          </div>
          <div className="flex-1 text-left">
            <p className="text-sm font-bold font-serif text-gray-800">{isTodayCheckedIn ? '今日已打卡' : '每日学习打卡'}</p>
            <p className="text-[10px] text-gray-500 mt-0.5">{isTodayCheckedIn ? '已获得 +1 土行修为' : '打卡获得 +1 土行修为'}</p>
          </div>
          {!isTodayCheckedIn && <ChevronRight size={16} className="text-gray-400" />}
        </button>

        {/* ===== 视图：课程列表 ===== */}
        {view === 'list' && (
          <CourseList
            progress={progress}
            getCourseProgress={getCourseProgress}
            onOpenCourse={(id) => { setActiveCourseId(id); setView('course'); }}
          />
        )}

        {/* ===== 视图：课程详情 ===== */}
        {view === 'course' && activeCourse && (
          <CourseDetail
            course={activeCourse}
            progress={progress}
            isLessonDone={isLessonDone}
            onOpenLesson={(idx) => { setActiveLessonIdx(idx); setView('lesson'); }}
            onStartQuiz={() => setView('quiz')}
            onBack={() => setView('list')}
          />
        )}

        {/* ===== 视图：课时学习 ===== */}
        {view === 'lesson' && activeCourse && (
          <LessonView
            course={activeCourse}
            lessonIdx={activeLessonIdx}
            isDone={isLessonDone(activeCourse.id, activeLessonIdx)}
            onMarkDone={() => markLessonDone(activeCourse.id, activeLessonIdx, activeCourse.element)}
            onPrev={() => setActiveLessonIdx(Math.max(0, activeLessonIdx - 1))}
            onNext={() => setActiveLessonIdx(Math.min(activeCourse.lessons.length - 1, activeLessonIdx + 1))}
            onBack={() => setView('course')}
          />
        )}

        {/* ===== 视图：测验 ===== */}
        {view === 'quiz' && activeCourse && (
          <QuizView
            course={activeCourse}
            bestScore={progress.quizScores[activeCourse.id] || 0}
            onSubmit={(score) => submitQuiz(activeCourse.id, score, activeCourse.element)}
            onBack={() => setView('course')}
          />
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

// ═══════════════════════════════════════
// 子组件：课程列表
// ═══════════════════════════════════════

function CourseList({
  progress,
  getCourseProgress,
  onOpenCourse,
}: {
  progress: StudyProgress;
  getCourseProgress: (id: string) => number;
  onOpenCourse: (id: string) => void;
}) {
  const basicCourses = TCM_COURSES.filter(c => c.level === 'basic');
  const advCourses = TCM_COURSES.filter(c => c.level === 'advanced');

  const renderCourseCard = (course: TcmCourse) => {
    const prog = getCourseProgress(course.id);
    const elementColor = ELEMENT_COLORS[course.element];
    const quizScore = progress.quizScores[course.id];
    return (
      <button
        key={course.id}
        onClick={() => onOpenCourse(course.id)}
        className="glass-card p-4 w-full text-left transition hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden"
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r" style={{ backgroundColor: elementColor }} />
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: `${elementColor}20`, border: `1px solid ${elementColor}40` }}>
            {course.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm font-serif text-gray-800 truncate">{course.name}</h4>
              <span className="text-[8px] px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${elementColor}15`, color: elementColor }}>
                {ELEMENT_NAMES[course.element]}行
              </span>
              {quizScore !== undefined && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0 font-bold">测验 {quizScore}</span>
              )}
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5 truncate">{course.desc}</p>
            {/* 进度条 */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${prog}%`, backgroundColor: elementColor }} />
              </div>
              <span className="text-[9px] text-gray-400 shrink-0">{course.lessons.length}课时</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-gray-300 shrink-0" />
        </div>
      </button>
    );
  };

  return (
    <>
      {/* 基础课程 */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-5 rounded-full bg-amber-500" />
          <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">基础课程</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">{basicCourses.length}门</span>
        </div>
        <div className="space-y-3">{basicCourses.map(renderCourseCard)}</div>
      </div>

      {/* 进阶课程 */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-5 rounded-full bg-red-700" />
          <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">进阶课程</h3>
          <div className="flex-1 h-px bg-gradient-to-r from-red-700/40 to-transparent" />
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 font-bold">{advCourses.length}门</span>
        </div>
        <div className="space-y-3">{advCourses.map(renderCourseCard)}</div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════
// 子组件：课程详情
// ═══════════════════════════════════════

function CourseDetail({
  course,
  progress,
  isLessonDone,
  onOpenLesson,
  onStartQuiz,
  onBack,
}: {
  course: TcmCourse;
  progress: StudyProgress;
  isLessonDone: (courseId: string, idx: number) => boolean;
  onOpenLesson: (idx: number) => void;
  onStartQuiz: () => void;
  onBack: () => void;
}) {
  const elementColor = ELEMENT_COLORS[course.element];
  const doneCount = (progress.completedLessons[course.id] || []).length;
  const quizScore = progress.quizScores[course.id];

  return (
    <>
      {/* 课程头部 */}
      <div className="glass-card p-4 relative overflow-hidden" style={{ borderColor: `${elementColor}30` }}>
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-r" style={{ backgroundColor: elementColor }} />
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl shrink-0" style={{ backgroundColor: `${elementColor}20`, border: `1px solid ${elementColor}40` }}>
            {course.icon}
          </div>
          <div>
            <h3 className="font-bold text-lg font-serif text-gray-800">{course.name}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{course.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="px-2 py-1 rounded-full" style={{ backgroundColor: `${elementColor}15`, color: elementColor }}>
            {ELEMENT_NAMES[course.element]}行修为
          </span>
          <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-600">
            {doneCount}/{course.lessons.length} 课时
          </span>
          {quizScore !== undefined && (
            <span className="px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold">
              测验 {quizScore}分
            </span>
          )}
        </div>
      </div>

      {/* 课时列表 */}
      <div className="space-y-2">
        {course.lessons.map((lesson, idx) => {
          const done = isLessonDone(course.id, idx);
          return (
            <button
              key={idx}
              onClick={() => onOpenLesson(idx)}
              className="glass-card p-3 w-full text-left flex items-center gap-3 transition hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${done ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {done ? <Check size={16} /> : idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{lesson.title}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">课时 {idx + 1}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </button>
          );
        })}
      </div>

      {/* 单元测验按钮 */}
      <button
        onClick={onStartQuiz}
        className="w-full rounded-xl p-4 flex items-center gap-3 transition hover:shadow-md hover:-translate-y-0.5"
        style={{ background: `linear-gradient(135deg, ${elementColor}15, ${elementColor}08)`, border: `1px solid ${elementColor}30` }}
      >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ backgroundColor: elementColor }}>
          <Award size={20} />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-bold font-serif text-gray-800">单元测验</p>
          <p className="text-[10px] text-gray-500 mt-0.5">{course.quiz.length}题 · 满分获 +5 {ELEMENT_NAMES[course.element]}行修为</p>
        </div>
        {quizScore !== undefined && (
          <span className="text-lg font-black" style={{ color: elementColor }}>{quizScore}</span>
        )}
        <ChevronRight size={16} className="text-gray-300 shrink-0" />
      </button>
    </>
  );
}

// ═══════════════════════════════════════
// 子组件：课时学习
// ═══════════════════════════════════════

function LessonView({
  course,
  lessonIdx,
  isDone,
  onMarkDone,
  onPrev,
  onNext,
  onBack,
}: {
  course: TcmCourse;
  lessonIdx: number;
  isDone: boolean;
  onMarkDone: () => void;
  onPrev: () => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const lesson: TcmLesson = course.lessons[lessonIdx];
  const elementColor = ELEMENT_COLORS[course.element];

  return (
    <>
      {/* 课时标题栏 */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-gray-400">{course.name} · 课时 {lessonIdx + 1}/{course.lessons.length}</p>
          <h3 className="font-bold text-sm font-serif text-gray-800 truncate">{lesson.title}</h3>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${elementColor}15`, color: elementColor }}>
          {ELEMENT_NAMES[course.element]}行
        </span>
      </div>

      {/* 内容区 */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r" style={{ backgroundColor: elementColor }} />
        <div
          className="tcm-lesson-content prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: lesson.content }}
        />
      </div>

      {/* 完成按钮 */}
      {!isDone ? (
        <button
          onClick={onMarkDone}
          className="w-full rounded-xl p-3 flex items-center justify-center gap-2 transition hover:shadow-md text-white font-bold text-sm font-serif"
          style={{ background: `linear-gradient(135deg, ${elementColor}, ${elementColor}dd)` }}
        >
          <Check size={18} />
          标记完成 · 获 +2 {ELEMENT_NAMES[course.element]}行修为
        </button>
      ) : (
        <div className="w-full rounded-xl p-3 flex items-center justify-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-sm font-serif">
          <Check size={18} />
          本课时已完成
        </div>
      )}

      {/* 上一课/下一课 */}
      <div className="flex gap-3">
        <button
          onClick={onPrev}
          disabled={lessonIdx === 0}
          className="flex-1 glass-card p-3 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 transition hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={16} />
          上一课
        </button>
        <button
          onClick={onNext}
          disabled={lessonIdx === course.lessons.length - 1}
          className="flex-1 glass-card p-3 flex items-center justify-center gap-1 text-xs font-medium text-gray-600 transition hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed"
        >
          下一课
          <ChevronRight size={16} />
        </button>
      </div>
    </>
  );
}

// ═══════════════════════════════════════
// 子组件：单元测验
// ═══════════════════════════════════════

function QuizView({
  course,
  bestScore,
  onSubmit,
  onBack,
}: {
  course: TcmCourse;
  bestScore: number;
  onSubmit: (score: number) => void;
  onBack: () => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(() => course.quiz.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const elementColor = ELEMENT_COLORS[course.element];

  const score = useMemo(() => {
    if (!submitted) return 0;
    let correct = 0;
    course.quiz.forEach((q, i) => { if (answers[i] === q.ans) correct++; });
    return Math.round((correct / course.quiz.length) * 100);
  }, [submitted, answers, course.quiz]);

  const allAnswered = answers.every(a => a !== null);

  const handleSubmit = () => {
    setSubmitted(true);
    let correct = 0;
    course.quiz.forEach((q, i) => { if (answers[i] === q.ans) correct++; });
    const sc = Math.round((correct / course.quiz.length) * 100);
    onSubmit(sc);
  };

  const handleRetry = () => {
    setAnswers(course.quiz.map(() => null));
    setSubmitted(false);
  };

  return (
    <>
      {/* 测验标题栏 */}
      <div className="flex items-center gap-2 mb-3">
        <button onClick={onBack} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <p className="text-[10px] text-gray-400">{course.name}</p>
          <h3 className="font-bold text-sm font-serif text-gray-800">单元测验</h3>
        </div>
        {bestScore > 0 && !submitted && (
          <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">最高 {bestScore}分</span>
        )}
      </div>

      {/* 题目列表 */}
      <div className="space-y-4">
        {course.quiz.map((item, qi) => (
          <div key={qi} className="glass-card p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ backgroundColor: elementColor }} />
            <p className="text-sm font-bold text-gray-800 mb-3 pl-2">
              <span className="text-gray-400 mr-1">Q{qi + 1}.</span>
              {item.q}
            </p>
            <div className="space-y-2 pl-2">
              {item.opts.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const isCorrect = item.ans === oi;
                const showResult = submitted;
                let cls = 'border border-gray-200 bg-white/50 text-gray-700';
                if (showResult && isCorrect) {
                  cls = 'border border-emerald-300 bg-emerald-50 text-emerald-800';
                } else if (showResult && isSelected && !isCorrect) {
                  cls = 'border border-red-300 bg-red-50 text-red-800';
                } else if (isSelected) {
                  cls = 'border-2 text-gray-800';
                  if (isSelected) cls = cls.replace('border-gray-200', '');
                  cls += ` text-white`;
                }
                return (
                  <button
                    key={oi}
                    onClick={() => { if (!submitted) { const na = [...answers]; na[qi] = oi; setAnswers(na); } }}
                    disabled={submitted}
                    className={`w-full text-left p-3 rounded-lg text-sm transition-all ${showResult ? cls : isSelected ? 'border-2 text-white' : 'border border-gray-200 bg-white/50 text-gray-700 hover:bg-white'}`}
                    style={isSelected && !showResult ? { backgroundColor: elementColor, borderColor: elementColor } : undefined}
                  >
                    <span className="font-bold mr-2">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                    {showResult && isCorrect && <Check size={14} className="inline ml-2 text-emerald-600" />}
                  </button>
                );
              })}
            </div>
            {/* 解析 */}
            {submitted && (
              <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-[10px] font-bold text-blue-600 mb-1">解析</p>
                <p className="text-xs text-gray-600 leading-relaxed">{item.explain}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 提交/结果 */}
      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="w-full rounded-xl p-4 flex items-center justify-center gap-2 transition hover:shadow-md text-white font-bold text-sm font-serif disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: `linear-gradient(135deg, ${elementColor}, ${elementColor}dd)` }}
        >
          <Award size={18} />
          {allAnswered ? '提交测验' : `还需回答 ${answers.filter(a => a === null).length} 题`}
        </button>
      ) : (
        <>
          {/* 成绩展示 */}
          <div className="glass-card p-6 text-center relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ backgroundColor: elementColor }} />
            <div className="text-5xl font-black font-serif" style={{ color: score >= 75 ? elementColor : '#999' }}>
              {score}
              <span className="text-xl text-gray-400">分</span>
            </div>
            <p className="text-sm text-gray-500 mt-2 font-serif">
              {score === 100 ? '满分通关！+5 修为' : score >= 75 ? '优秀！+4 修为' : score >= 50 ? '及格 +3 修为' : '继续努力 +1 修为'}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              {course.quiz.filter((q, i) => answers[i] === q.ans).length} / {course.quiz.length} 题正确
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRetry}
              className="flex-1 glass-card p-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:shadow-md"
            >
              <RotateCw size={16} />
              重新测验
            </button>
            <button
              onClick={onBack}
              className="flex-1 rounded-xl p-3 flex items-center justify-center gap-2 text-white text-sm font-bold font-serif transition hover:shadow-md"
              style={{ backgroundColor: elementColor }}
            >
              <BookOpen size={16} />
              返回课程
            </button>
          </div>
        </>
      )}
    </>
  );
}
