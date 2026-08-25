'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import { getTcmAcupoints, getTcmMeridians, type TcmAcupoint, type TcmMeridian } from '@/lib/tcm-acupoint-data';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XWS_VIDEO_ACUPOINTS } from '@/lib/xws-video-names';
import { ACUPOINT_LOCATION_IMAGES } from '@/lib/acupoint-image-names';
import { cosUrl } from '@/lib/cos-url';
import { ArrowLeft, Target, Check, X, Award, RotateCw, Zap, ChevronRight, MapPin, Video, ExternalLink, BookOpen } from 'lucide-react';

// ═══════════════════════════════════════
// 经脉中文映射
// ═══════════════════════════════════════
const MERIDIAN_ZH: Record<string, string> = {
  LU: '手太阴肺经', LI: '手阳明大肠经', ST: '足阳明胃经', SP: '足太阴脾经',
  HT: '手少阴心经', SI: '手太阳小肠经', BL: '足太阳膀胱经', KI: '足少阴肾经',
  PC: '手厥阴心包经', TE: '手少阳三焦经', GB: '足少阳胆经', LV: '足厥阴肝经',
  DU: '督脉', REN: '任脉', DONG: '董氏奇穴',
};

const WUXING_EN: Record<string, string> = {
  '金': 'metal', '水': 'water', '木': 'wood', '火': 'fire', '土': 'earth',
};

// ═══════════════════════════════════════
// 进度持久化
// ═══════════════════════════════════════

interface ChallengeProgress {
  bestStreak: number;
  totalCorrect: number;
  totalAttempts: number;
  playedMeridians: string[];
}

const STORAGE_KEY = 'acupoint-challenge-progress';

function loadProgress(): ChallengeProgress {
  if (typeof window === 'undefined') return { bestStreak: 0, totalCorrect: 0, totalAttempts: 0, playedMeridians: [] };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { bestStreak: 0, totalCorrect: 0, totalAttempts: 0, playedMeridians: [] };
}

function saveProgress(p: ChallengeProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// ═══════════════════════════════════════
// 穴位详情卡片（含定位图+视频，与穴位定位模块信息打通）
// ═══════════════════════════════════════

function AcupointDetailCard({ point, meridian }: { point: TcmAcupoint; meridian?: TcmMeridian }) {
  const hasImage = ACUPOINT_LOCATION_IMAGES.has(point.name);
  const hasVideo = XWS_VIDEO_ACUPOINTS.has(point.name) || XWS_VIDEO_ACUPOINTS.has(point.name + '穴');
  const meridianName = MERIDIAN_ZH[point.meridian] || point.meridian;
  const [showVideo, setShowVideo] = useState(false);

  return (
    <div className="space-y-3">
      {/* 定位图（核心：答题时直接展示真实穴位图） */}
      {hasImage ? (
        <div className="rounded-xl overflow-hidden bg-white border-2 border-emerald-300 shadow-lg">
          <div className="bg-emerald-50 px-3 py-1.5 flex items-center gap-1.5 border-b border-emerald-200">
            <MapPin size={13} className="text-emerald-600" />
            <span className="text-xs font-bold text-emerald-700">{point.name} 穴位定位图</span>
            <span className="text-[10px] text-gray-400 ml-auto">{meridianName}</span>
          </div>
          <img
            src={cosUrl(`/assets/acupoint/images/${encodeURIComponent(point.name)}.jpg`)}
            alt={`${point.name}穴位定位图`}
            className="w-full"
            loading="eager"
          />
        </div>
      ) : (
        <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 text-center">
          <MapPin size={20} className="text-amber-500 mx-auto mb-1" />
          <p className="text-xs text-amber-700">暂无 {point.name} 定位图</p>
        </div>
      )}

      {/* 定位描述 */}
      <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={12} className="text-blue-600" />
          <span className="text-[10px] text-blue-700 font-bold">定位描述</span>
        </div>
        <p className="text-[11px] text-gray-700 leading-relaxed">{point.location}</p>
      </div>

      {/* 穴位定位视频（折叠，点击展开） */}
      {hasVideo && (
        <div className="rounded-xl overflow-hidden bg-white border border-gray-200">
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="w-full px-3 py-2 flex items-center gap-1.5 bg-purple-50 border-b border-purple-200 transition hover:bg-purple-100"
          >
            <Video size={13} className="text-purple-600" />
            <span className="text-xs font-bold text-purple-700">{showVideo ? '收起视频' : '观看定位视频'}</span>
            <ChevronRight size={13} className={`text-purple-400 ml-auto transition-transform ${showVideo ? 'rotate-90' : ''}`} />
          </button>
          {showVideo && (
            <video
              src={cosUrl(`/videos/acupoints/${encodeURIComponent(point.name + '穴')}.mp4`)}
              controls
              autoPlay
              preload="metadata"
              playsInline
              className="w-full"
              style={{ maxHeight: '50vh' }}
              onError={(e) => {
                const target = e.target as HTMLVideoElement;
                target.parentElement!.innerHTML = '<p class="text-xs text-gray-400 text-center py-4">视频加载失败</p>';
              }}
            />
          )}
        </div>
      )}

      {/* 主治 */}
      {point.indications && (
        <div className="p-3 rounded-lg bg-green-50/80 border border-green-200">
          <span className="text-[10px] text-green-700 font-bold">主治</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {point.indications.split(/[，,、]/).filter(Boolean).slice(0, 8).map((ind, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 border border-green-200">
                {ind.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 跳转穴位定位模块 */}
      <Link
        href={`/meridian?focus=${point.code}`}
        className="block w-full p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
      >
        <ExternalLink size={12} />
        前往穴位定位模块查看完整详情
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════
// 生成多选题选项
// ═══════════════════════════════════════

function generateOptions(correctPoint: TcmAcupoint, allPoints: TcmAcupoint[], count: number = 4): TcmAcupoint[] {
  // 选项从同一经脉的其他穴位中选取，如果不够则从附近经脉补充
  const sameMeridian = allPoints.filter(p => p.meridian === correctPoint.meridian && p.code !== correctPoint.code);
  const otherPoints = allPoints.filter(p => p.meridian !== correctPoint.meridian);

  // 打乱
  const shuffle = <T,>(arr: T[]): T[] => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // 优先从同经脉取，不够再从其他经脉补
  const pool = shuffle(sameMeridian);
  const extra = shuffle(otherPoints);
  const wrongOptions = [...pool, ...extra].slice(0, count - 1);

  // 随机插入正确答案
  const allOptions = shuffle([correctPoint, ...wrongOptions]);
  return allOptions;
}

// ═══════════════════════════════════════
// 主组件
// ═══════════════════════════════════════

type GameState = 'idle' | 'playing' | 'finished';
type QuestionData = {
  point: TcmAcupoint;
  options: TcmAcupoint[];
  showHint: boolean;     // 是否已展示定位图提示
  answered: 'correct' | 'wrong' | null;
  selectedCode: string | null;
};

export default function AcupointChallengePage() {
  const allPoints = useMemo(() => getTcmAcupoints(), []);
  const meridians = useMemo(() => getTcmMeridians(), []);

  // 只保留有定位图的穴位作为题目
  const qualifiedPoints = useMemo(() => {
    return allPoints.filter(p => ACUPOINT_LOCATION_IMAGES.has(p.name));
  }, [allPoints]);

  const validMeridianCodes = useMemo(() => {
    return meridians
      .filter(m => m.acupoints.filter(p => ACUPOINT_LOCATION_IMAGES.has(p.name)).length >= 3)
      .map(m => m.code);
  }, [meridians]);

  const [selectedMeridian, setSelectedMeridian] = useState<string>('all');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [progress, setProgress] = useState<ChallengeProgress>(loadProgress);
  const [roundSize, setRoundSize] = useState(10);
  const rewardGivenRef = useRef(false);

  useEffect(() => { saveProgress(progress); }, [progress]);

  const currentQuestion = questions[currentIdx] || null;

  const gamePoints = useMemo(() => {
    if (selectedMeridian === 'all') {
      return qualifiedPoints;
    }
    return qualifiedPoints.filter(p => p.meridian === selectedMeridian);
  }, [qualifiedPoints, selectedMeridian]);

  const startGame = useCallback(() => {
    const pool = [...gamePoints];
    // Fisher-Yates 洗牌
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const round = pool.slice(0, Math.min(roundSize, pool.length));

    // 为每题生成选项
    const qs: QuestionData[] = round.map(point => ({
      point,
      options: generateOptions(point, allPoints, 4),
      showHint: true, // 默认展示定位图
      answered: null,
      selectedCode: null,
    }));

    setQuestions(qs);
    setCurrentIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setGameState('playing');
    rewardGivenRef.current = false;
  }, [gamePoints, roundSize, allPoints]);

  const handleAnswer = useCallback((selectedPoint: TcmAcupoint) => {
    if (!currentQuestion || currentQuestion.answered) return;

    const isCorrect = selectedPoint.code === currentQuestion.point.code;

    // 更新当前题目状态
    setQuestions(prev => prev.map((q, i) =>
      i === currentIdx
        ? { ...q, answered: isCorrect ? 'correct' : 'wrong', selectedCode: selectedPoint.code }
        : q
    ));

    if (isCorrect) {
      const newCorrect = correctCount + 1;
      const newStreak = streak + 1;
      setCorrectCount(newCorrect);
      setStreak(newStreak);

      const meridian = meridians.find(m => m.code === currentQuestion.point.meridian);
      const el = (meridian ? WUXING_EN[meridian.wuxing] : 'earth') as 'wood' | 'fire' | 'earth' | 'metal' | 'water';
      const { addXiuWei, recordPractice, completeTodayStep } = useCultivationStore.getState();
      addXiuWei(el, 2);
      recordPractice('acupoint-challenge', 30, el, 2);

      setProgress(prev => ({
        ...prev,
        totalCorrect: prev.totalCorrect + 1,
        totalAttempts: prev.totalAttempts + 1,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        playedMeridians: prev.playedMeridians.includes(currentQuestion.point.meridian)
          ? prev.playedMeridians
          : [...prev.playedMeridians, currentQuestion.point.meridian],
      }));
    } else {
      setWrongCount(wrongCount + 1);
      setStreak(0);
      setProgress(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));
    }
  }, [currentQuestion, currentIdx, correctCount, wrongCount, streak, meridians]);

  const nextQuestion = useCallback(() => {
    if (currentIdx + 1 >= questions.length) {
      if (!rewardGivenRef.current) {
        rewardGivenRef.current = true;
        const { completeTodayStep } = useCultivationStore.getState();
        completeTodayStep('acupoint-challenge');
      }
      setGameState('finished');
    } else {
      setCurrentIdx(currentIdx + 1);
    }
  }, [currentIdx, questions.length]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setQuestions([]);
    setCurrentIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
  }, []);

  const accuracy = useMemo(() => {
    const total = correctCount + wrongCount;
    return total > 0 ? Math.round((correctCount / total) * 100) : 0;
  }, [correctCount, wrongCount]);

  const progressPercent = useMemo(() => {
    if (questions.length === 0) return 0;
    return Math.round((currentIdx / questions.length) * 100);
  }, [currentIdx, questions.length]);

  const currentMeridian = currentQuestion
    ? meridians.find(m => m.code === currentQuestion.point.meridian)
    : undefined;

  // ═══════════════════════════════════════
  // 渲染
  // ═══════════════════════════════════════

  return (
    <PageContainer theme="healing" className="pb-24">
      {/* 顶部 */}
      <div className="px-5 pt-12 pb-5 text-white" style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => window.history.back()} className="text-white/70 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-black font-serif">穴位挑战</h1>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-bold ml-auto">看图识穴</span>
        </div>
        <p className="text-sm text-white/60 font-serif">真实穴位图+视频 · 多选答题 · 修为联动</p>

        {/* 历史统计 */}
        <div className="mt-3 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-emerald-300">
            <Check size={13} />
            <span>累计答对 {progress.totalCorrect}</span>
          </div>
          <div className="flex items-center gap-1 text-amber-300">
            <Zap size={13} />
            <span>最高连击 {progress.bestStreak}</span>
          </div>
          <div className="flex items-center gap-1 text-teal-300">
            <Target size={13} />
            <span>已练 {progress.playedMeridians.length}/{validMeridianCodes.length} 经</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* 游戏未开始：选择经脉 + 题数 */}
        {gameState === 'idle' && (
          <>
            {/* 说明 */}
            <div className="glass-card p-4 bg-blue-50/50">
              <div className="flex items-start gap-2">
                <BookOpen size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 leading-relaxed">
                  <p className="font-bold text-blue-700 mb-1">玩法说明</p>
                  <p>每道题展示一张<b>真实穴位定位图</b>，请根据图片选择对应的穴位名称。答对后可查看穴位视频和主治信息。</p>
                </div>
              </div>
            </div>

            {/* 经脉选择 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-5 rounded-full bg-blue-500" />
                <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">选择经脉</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-500/40 to-transparent" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedMeridian('all')}
                  className={`glass-card p-3 text-center transition hover:shadow-md hover:-translate-y-0.5 ${selectedMeridian === 'all' ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="text-lg">🌐</div>
                  <p className="text-xs font-bold mt-1 text-gray-800">全部</p>
                  <p className="text-[9px] text-gray-400">{qualifiedPoints.length}穴</p>
                </button>
                {meridians
                  .filter(m => m.acupoints.filter(p => ACUPOINT_LOCATION_IMAGES.has(p.name)).length >= 3)
                  .map(m => {
                    const count = m.acupoints.filter(p => ACUPOINT_LOCATION_IMAGES.has(p.name)).length;
                    return (
                      <button
                        key={m.code}
                        onClick={() => setSelectedMeridian(m.code)}
                        className={`glass-card p-3 text-center transition hover:shadow-md hover:-translate-y-0.5 ${selectedMeridian === m.code ? 'ring-2 ring-blue-500' : ''}`}
                      >
                        <div className="w-3 h-3 rounded-full mx-auto" style={{ backgroundColor: m.color }} />
                        <p className="text-[10px] font-bold mt-1 text-gray-800 truncate">{m.nameZh}</p>
 <p className="text-[9px] text-gray-400">{count}穴</p>
                      </button>
                    );
                  })}
              </div>
            </div>

            {/* 每轮题数 */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-5 rounded-full bg-amber-500" />
                <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">每轮题数</h3>
                <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
              </div>
              <div className="flex gap-2">
                {[5, 10, 15, 20].map(n => (
                  <button
                    key={n}
                    onClick={() => setRoundSize(n)}
                    className={`flex-1 glass-card p-3 text-center transition hover:shadow-md ${roundSize === n ? 'ring-2 ring-amber-500 text-amber-700 font-bold' : 'text-gray-600'}`}
                  >
                    {n}题
                  </button>
                ))}
              </div>
            </div>

            {/* 开始按钮 */}
            <button
              onClick={startGame}
              className="w-full rounded-xl p-4 flex items-center justify-center gap-2 text-white font-bold text-sm font-serif transition hover:shadow-md hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}
            >
              <Target size={18} />
              开始挑战
            </button>
          </>
        )}

        {/* 游戏中/结束 */}
        {(gameState === 'playing' || gameState === 'finished') && (
          <>
            {/* 进度条 + 统计 */}
            <div className="glass-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-xs text-gray-500 font-bold shrink-0">{currentIdx}/{questions.length}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-emerald-600 font-bold">✓ {correctCount}</span>
                <span className="text-red-500 font-bold">✗ {wrongCount}</span>
                <span className="text-amber-600 font-bold">连击 {streak}</span>
                <span className="text-gray-400">正确率 {accuracy}%</span>
              </div>
            </div>

            {/* 当前题目 */}
            {gameState === 'playing' && currentQuestion && (
              <div className="glass-card p-4 ring-2 ring-blue-500/30">
                {/* 题目提示 */}
                <p className="text-[10px] text-gray-400 text-center mb-1">请根据穴位定位图，选择正确的穴位名称</p>
                <p className="text-[11px] text-gray-500 text-center mb-3">{MERIDIAN_ZH[currentQuestion.point.meridian] || currentQuestion.point.meridian}</p>

                {/* 穴位定位图（题目核心） */}
                {ACUPOINT_LOCATION_IMAGES.has(currentQuestion.point.name) ? (
                  <div className="rounded-xl overflow-hidden bg-white border-2 border-emerald-300 shadow-lg mb-4">
                    <div className="bg-emerald-50 px-3 py-1.5 flex items-center gap-1.5 border-b border-emerald-200">
                      <MapPin size={13} className="text-emerald-600" />
                      <span className="text-xs font-bold text-emerald-700">穴位定位图</span>
                      <span className="text-[10px] text-gray-400 ml-auto">{MERIDIAN_ZH[currentQuestion.point.meridian]}</span>
                    </div>
                    <img
                      src={cosUrl(`/assets/acupoint/images/${encodeURIComponent(currentQuestion.point.name)}.jpg`)}
                      alt="穴位定位图"
                      className="w-full"
                      loading="eager"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 text-center mb-4">
                    <MapPin size={20} className="text-amber-500 mx-auto mb-1" />
                    <p className="text-xs text-amber-700">暂无定位图，请根据定位描述答题</p>
                    <p className="text-[11px] text-gray-600 mt-2 text-left">{currentQuestion.point.location}</p>
                  </div>
                )}

                {/* 选项按钮 */}
                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map((opt) => {
                    const isCorrect = opt.code === currentQuestion.point.code;
                    const isSelected = currentQuestion.selectedCode === opt.code;
                    let btnClass = 'glass-card p-3 text-center text-sm font-bold font-serif transition ';
                    let btnStyle: React.CSSProperties = {};

                    if (currentQuestion.answered) {
                      if (isCorrect) {
                        btnClass += 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700';
                      } else if (isSelected) {
                        btnClass += 'bg-red-50 border-2 border-red-400 text-red-600';
                      } else {
                        btnClass += 'opacity-50 border-2 border-transparent text-gray-400';
                      }
                    } else {
                      btnClass += 'border-2 border-transparent text-gray-700 hover:border-blue-300 hover:bg-blue-50 active:scale-95';
                    }

                    return (
                      <button
                        key={opt.code}
                        onClick={() => handleAnswer(opt)}
                        disabled={!!currentQuestion.answered}
                        className={btnClass}
                        style={btnStyle}
                      >
                        <span className="text-base">{opt.name}</span>
                        {currentQuestion.answered && isCorrect && <Check size={14} className="inline ml-1 text-emerald-500" />}
                        {currentQuestion.answered && isSelected && !isCorrect && <X size={14} className="inline ml-1 text-red-500" />}
                      </button>
                    );
                  })}
                </div>

                {/* 答题反馈 */}
                {currentQuestion.answered && (
                  <div className="mt-4">
                    <div className={`p-3 rounded-lg text-sm font-medium ${currentQuestion.answered === 'correct' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      <p className="font-bold">
                        {currentQuestion.answered === 'correct' ? '✓ 正确！' : '✗ 错误'}
                      </p>
                      <p className="text-[11px] mt-1 text-gray-600">
                        {currentQuestion.answered === 'correct'
                          ? `这是 ${currentQuestion.point.name} · ${MERIDIAN_ZH[currentQuestion.point.meridian] || currentQuestion.point.meridian}`
                          : `正确答案是 ${currentQuestion.point.name} · ${MERIDIAN_ZH[currentQuestion.point.meridian] || currentQuestion.point.meridian}`
                        }
                      </p>
                    </div>

                    {/* 答对/答错后展示完整详情 */}
                    <div className="mt-3">
                      <AcupointDetailCard point={currentQuestion.point} meridian={currentMeridian} />
                    </div>

                    {/* 下一题按钮 */}
                    <button
                      onClick={nextQuestion}
                      className="mt-4 w-full rounded-xl p-3 flex items-center justify-center gap-2 text-white font-bold text-sm font-serif transition hover:shadow-md"
                      style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}
                    >
                      {currentIdx + 1 >= questions.length ? '查看结果' : '下一题'}
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 游戏结束 */}
            {gameState === 'finished' && (
              <div className="glass-card p-6 text-center">
                <div className="text-4xl mb-2">
                  {accuracy >= 90 ? '🏆' : accuracy >= 75 ? '🥈' : accuracy >= 60 ? '🥉' : '💪'}
                </div>
                <p className="text-lg font-bold font-serif text-gray-800">
                  {accuracy >= 90 ? '优秀！' : accuracy >= 75 ? '良好！' : accuracy >= 60 ? '继续努力' : '多多练习'}
                </p>
                <div className="mt-3 flex justify-center gap-4 text-sm">
                  <div>
                    <p className="text-2xl font-black text-emerald-600">{correctCount}</p>
                    <p className="text-[10px] text-gray-500">正确</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-red-500">{wrongCount}</p>
                    <p className="text-[10px] text-gray-500">错误</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-amber-600">{accuracy}%</p>
                    <p className="text-[10px] text-gray-500">正确率</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  本轮获得修为：+{correctCount * 2} 五行修为
                </p>
                {/* 链接到穴位定位模块 */}
                <Link
                  href="/meridian"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  <MapPin size={12} />
                  前往穴位定位模块继续学习
                  <ChevronRight size={12} />
                </Link>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3">
              {gameState === 'playing' && (
                <button
                  onClick={resetGame}
                  className="flex-1 glass-card p-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:shadow-md"
                >
                  <RotateCw size={16} />
                  重新开始
                </button>
              )}
              {gameState === 'finished' && (
                <>
                  <button
                    onClick={startGame}
                    className="flex-1 rounded-xl p-3 flex items-center justify-center gap-2 text-white text-sm font-bold font-serif transition hover:shadow-md"
                    style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}
                  >
                    <RotateCw size={16} />
                    再来一轮
                  </button>
                  <button
                    onClick={resetGame}
                    className="flex-1 glass-card p-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:shadow-md"
                  >
                    返回设置
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}
