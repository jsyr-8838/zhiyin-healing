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
import { ArrowLeft, Target, Check, X, Award, RotateCw, Zap, ChevronRight, MapPin, Video, ExternalLink } from 'lucide-react';

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
// 2D 人体模型坐标映射
// 与穴位定位模块(MeridianClient/TcmBodyModel)统一的2D人体图
// 坐标系：SVG viewBox 300×400，与挑战页人体图一致
// 原始3D坐标 Y:0~1.714, X:-0.557~0.557 → 转为SVG百分比
// ═══════════════════════════════════════

const Y_MIN = 0, Y_MAX = 1.714;
const X_MIN = -0.557, X_MAX = 0.557;

function pointTo2D(pos: [number, number, number]): { x: number; y: number } {
  const xNorm = (pos[0] - X_MIN) / (X_MAX - X_MIN);
  const yNorm = 1 - (pos[1] - Y_MIN) / (Y_MAX - Y_MIN);
  return { x: xNorm * 100, y: yNorm * 100 };
}

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

function AcupointInfoCard({ point, meridian, showFullDetail }: { point: TcmAcupoint; meridian?: TcmMeridian; showFullDetail: boolean }) {
  const hasImage = ACUPOINT_LOCATION_IMAGES.has(point.name);
  const hasVideo = XWS_VIDEO_ACUPOINTS.has(point.name) || XWS_VIDEO_ACUPOINTS.has(point.name + '穴');
  const meridianName = MERIDIAN_ZH[point.meridian] || point.meridian;

  if (!showFullDetail) {
    // 简洁模式（答题中显示定位信息）
    return (
      <div className="mt-3 p-3 rounded-lg bg-blue-50/80 border border-blue-200">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={12} className="text-blue-600" />
          <span className="text-[10px] text-blue-700 font-bold">定位</span>
        </div>
        <p className="text-[11px] text-gray-700 leading-relaxed">{point.location}</p>
      </div>
    );
  }

  // 完整模式（答对后展示图片+视频+主治）
  return (
    <div className="mt-3 space-y-2">
      {/* 定位 */}
      <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200">
        <div className="flex items-center gap-2 mb-1">
          <MapPin size={12} className="text-blue-600" />
          <span className="text-[10px] text-blue-700 font-bold">定位</span>
          <Link
            href={`/meridian?focus=${point.code}`}
            className="ml-auto text-[9px] text-emerald-600 flex items-center gap-0.5 hover:text-emerald-700 transition-colors"
          >
            <ExternalLink size={10} />
            穴位定位模块
          </Link>
        </div>
        <p className="text-[11px] text-gray-700 leading-relaxed">{point.location}</p>
      </div>

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

      {/* 定位图 */}
      {hasImage && (
        <div className="p-2 rounded-lg bg-white/60 border border-gray-200">
          <div className="text-[10px] text-gray-500 font-bold mb-1 flex items-center gap-1">
            <span className="text-blue-500">◉</span> 穴位定位图
          </div>
          <img
            src={cosUrl(`/assets/acupoint/images/${encodeURIComponent(point.name)}.jpg`)}
            alt={`${point.name}穴位定位图`}
            className="w-full rounded-lg"
            loading="lazy"
          />
        </div>
      )}

      {/* 穴位视频 */}
      {hasVideo && (
        <div className="p-2 rounded-lg bg-white/60 border border-gray-200">
          <div className="text-[10px] text-gray-500 font-bold mb-1 flex items-center gap-1">
            <Video size={10} className="text-emerald-500" /> 穴位定位视频
          </div>
          <video
            src={cosUrl(`/videos/acupoints/${encodeURIComponent(point.name + '穴')}.mp4`)}
            controls
            preload="metadata"
            playsInline
            className="w-full rounded-lg"
            style={{ maxHeight: '40vh' }}
            onError={(e) => { (e.target as HTMLVideoElement).parentElement!.style.display = 'none'; }}
          />
        </div>
      )}

      {/* 跳转穴位定位模块 */}
      <Link
        href={`/meridian?focus=${point.code}`}
        className="block w-full p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
      >
        <MapPin size={12} />
        前往穴位定位模块查看完整详情
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}

// ═══════════════════════════════════════
// 主组件
// ═══════════════════════════════════════

type GameState = 'idle' | 'playing' | 'finished';

export default function AcupointChallengePage() {
  const allPoints = useMemo(() => getTcmAcupoints(), []);
  const meridians = useMemo(() => getTcmMeridians(), []);

  const validMeridianCodes = useMemo(() => {
    return meridians.filter(m => m.acupoints.length >= 5).map(m => m.code);
  }, [meridians]);

  const [selectedMeridian, setSelectedMeridian] = useState<string>('all');
  const [gameState, setGameState] = useState<GameState>('idle');
  const [questionPool, setQuestionPool] = useState<TcmAcupoint[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong'; msg: string; detail?: string } | null>(null);
  const [highlightCode, setHighlightCode] = useState<string | null>(null);
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [progress, setProgress] = useState<ChallengeProgress>(loadProgress);
  const [roundSize, setRoundSize] = useState(10);
  const [rewardGiven, setRewardGiven] = useState(false);

  const { addXiuWei, recordPractice, completeTodayStep } = useCultivationStore();
  const rewardGivenRef = useRef(false);

  useEffect(() => { saveProgress(progress); }, [progress]);

  const currentQuestion = useMemo(() => questionPool[currentIdx] || null, [questionPool, currentIdx]);

  const gamePoints = useMemo(() => {
    if (selectedMeridian === 'all') {
      return allPoints;
    }
    return allPoints.filter(p => p.meridian === selectedMeridian);
  }, [allPoints, selectedMeridian]);

  // 计算2D位置（统一坐标系，不再用3D投影）
  const points2d = useMemo(() => {
    return gamePoints.map(p => ({ ...p, pos2d: pointTo2D(p.position3d) }));
  }, [gamePoints]);

  const startGame = useCallback(() => {
    const pool = [...gamePoints];
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    const round = pool.slice(0, Math.min(roundSize, pool.length));
    setQuestionPool(round);
    setCurrentIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setFeedback(null);
    setHighlightCode(null);
    setGameState('playing');
    setRewardGiven(false);
    rewardGivenRef.current = false;
  }, [gamePoints, roundSize]);

  const handleClickPoint = useCallback((point: TcmAcupoint) => {
    if (gameState !== 'playing' || !currentQuestion) return;

    if (point.code === currentQuestion.code) {
      const newCorrect = correctCount + 1;
      const newStreak = streak + 1;
      setCorrectCount(newCorrect);
      setStreak(newStreak);
      setHighlightCode(point.code);
      setFeedback({
        type: 'correct',
        msg: `正确！${point.name} · ${MERIDIAN_ZH[point.meridian] || point.meridian}`,
        detail: point.location,
      });

      const meridian = meridians.find(m => m.code === point.meridian);
      const el = (meridian ? WUXING_EN[meridian.wuxing] : 'earth') as 'wood' | 'fire' | 'earth' | 'metal' | 'water';
      addXiuWei(el, 2);
      recordPractice('acupoint-challenge', 30, el, 2);

      setProgress(prev => ({
        ...prev,
        totalCorrect: prev.totalCorrect + 1,
        totalAttempts: prev.totalAttempts + 1,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        playedMeridians: prev.playedMeridians.includes(point.meridian) ? prev.playedMeridians : [...prev.playedMeridians, point.meridian],
      }));

      setTimeout(() => {
        if (currentIdx + 1 >= questionPool.length) {
          if (!rewardGivenRef.current) {
            rewardGivenRef.current = true;
            completeTodayStep('acupoint-challenge');
          }
          setGameState('finished');
        } else {
          setCurrentIdx(currentIdx + 1);
          setFeedback(null);
          setHighlightCode(null);
        }
      }, 2500);
    } else {
      const newWrong = wrongCount + 1;
      setWrongCount(newWrong);
      setStreak(0);
      setFeedback({
        type: 'wrong',
        msg: `错误！你点的是「${point.name}」`,
        detail: `正确答案是「${currentQuestion.name}」`,
      });
      setHighlightCode(currentQuestion.code);

      setProgress(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));

      setTimeout(() => {
        if (currentIdx + 1 >= questionPool.length) {
          if (!rewardGivenRef.current) {
            rewardGivenRef.current = true;
            completeTodayStep('acupoint-challenge');
          }
          setGameState('finished');
        } else {
          setCurrentIdx(currentIdx + 1);
          setFeedback(null);
          setHighlightCode(null);
        }
      }, 3500);
    }
  }, [gameState, currentQuestion, correctCount, wrongCount, streak, currentIdx, questionPool.length, meridians, addXiuWei, recordPractice, completeTodayStep]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setQuestionPool([]);
    setCurrentIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setFeedback(null);
    setHighlightCode(null);
  }, []);

  const accuracy = useMemo(() => {
    const total = correctCount + wrongCount;
    return total > 0 ? Math.round((correctCount / total) * 100) : 0;
  }, [correctCount, wrongCount]);

  const progressPercent = useMemo(() => {
    if (questionPool.length === 0) return 0;
    return Math.round((currentIdx / questionPool.length) * 100);
  }, [currentIdx, questionPool.length]);

  const currentMeridian = currentQuestion ? meridians.find(m => m.code === currentQuestion.meridian) : undefined;

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
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-bold ml-auto">看图找穴</span>
        </div>
        <p className="text-sm text-white/60 font-serif">571穴 · 经脉筛选 · 修为联动 · 图文视频互通</p>

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
                  <p className="text-[9px] text-gray-400">{allPoints.length}穴</p>
                </button>
                {meridians.filter(m => m.acupoints.length >= 5).map(m => (
                  <button
                    key={m.code}
                    onClick={() => setSelectedMeridian(m.code)}
                    className={`glass-card p-3 text-center transition hover:shadow-md hover:-translate-y-0.5 ${selectedMeridian === m.code ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="w-3 h-3 rounded-full mx-auto" style={{ backgroundColor: m.color }} />
                    <p className="text-[10px] font-bold mt-1 text-gray-800 truncate">{m.nameZh}</p>
                    <p className="text-[9px] text-gray-400">{m.acupoints.length}穴</p>
                  </button>
                ))}
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

        {/* 游戏中/结束：人体图 + 题目 */}
        {(gameState === 'playing' || gameState === 'finished') && (
          <>
            {/* 进度条 + 统计 */}
            <div className="glass-card p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-500 transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-xs text-gray-500 font-bold shrink-0">{currentIdx}/{questionPool.length}</span>
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
                <p className="text-[10px] text-gray-400 text-center">请在人体图上找到以下穴位</p>
                <p className="text-2xl font-black font-serif text-center text-gray-800 mt-1">{currentQuestion.name}</p>
                <p className="text-[10px] text-gray-400 text-center mt-1">{MERIDIAN_ZH[currentQuestion.meridian] || currentQuestion.meridian}</p>

                {/* 反馈 + 穴位详情 */}
                {feedback ? (
                  <div>
                    <div className={`mt-3 p-3 rounded-lg text-sm font-medium ${feedback.type === 'correct' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                      <p>{feedback.msg}</p>
                      {feedback.detail && <p className="text-[10px] mt-1 text-gray-500">{feedback.detail}</p>}
                    </div>
                    {/* 答对后展示完整详情（图片+视频+主治），答错仅展示定位图 */}
                    <AcupointInfoCard
                      point={feedback.type === 'correct' ? currentQuestion : currentQuestion}
                      meridian={currentMeridian}
                      showFullDetail={feedback.type === 'correct'}
                    />
                  </div>
                ) : (
                  /* 未答题时显示定位提示 */
                  <AcupointInfoCard
                    point={currentQuestion}
                    meridian={currentMeridian}
                    showFullDetail={false}
                  />
                )}
              </div>
            )}

            {/* 人体图 + 穴位点 */}
            <div className="glass-card p-2 relative">
              <div className="relative w-full mx-auto" style={{ maxWidth: '400px', aspectRatio: '3/4' }}>
                {/* SVG 人体轮廓（与穴位定位模块统一的2D风格） */}
                <svg viewBox="0 0 300 400" className="absolute inset-0 w-full h-full" style={{ filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))' }}>
                  {/* 头部 */}
                  <ellipse cx="150" cy="45" rx="28" ry="32" fill="#fde4d0" stroke="#d4a574" strokeWidth="1" />
                  {/* 颈部 */}
                  <rect x="140" y="72" width="20" height="15" fill="#f5d5ae" stroke="#d4a574" strokeWidth="0.5" />
                  {/* 躯干 */}
                  <path d="M 110 87 Q 100 90 95 110 L 90 200 Q 90 230 100 250 L 120 270 L 180 270 L 200 250 Q 210 230 210 200 L 205 110 Q 200 90 190 87 Z" fill="#fde4d0" stroke="#d4a574" strokeWidth="1" />
                  {/* 左臂 */}
                  <path d="M 95 110 Q 80 130 72 165 Q 68 185 66 210 Q 66 215 72 215 Q 78 215 80 210 Q 82 190 88 170 Q 92 145 95 110 Z" fill="#f5d5ae" stroke="#d4a574" strokeWidth="0.5" />
                  {/* 右臂 */}
                  <path d="M 205 110 Q 220 130 228 165 Q 232 185 234 210 Q 234 215 228 215 Q 222 215 220 210 Q 218 190 212 170 Q 208 145 205 110 Z" fill="#f5d5ae" stroke="#d4a574" strokeWidth="0.5" />
                  {/* 左腿 */}
                  <path d="M 120 270 Q 115 290 112 330 Q 110 360 115 395 L 135 395 Q 138 370 140 340 Q 142 305 145 270 Z" fill="#f5d5ae" stroke="#d4a574" strokeWidth="0.5" />
                  {/* 右腿 */}
                  <path d="M 180 270 Q 185 290 188 330 Q 190 360 185 395 L 165 395 Q 162 370 160 340 Q 158 305 155 270 Z" fill="#f5d5ae" stroke="#d4a574" strokeWidth="0.5" />
                </svg>

                {/* 穴位点 */}
                {points2d.map((p) => {
                  const isHighlight = highlightCode === p.code;
                  const isDimmed = gameState === 'playing' && !feedback;
                  return (
                    <button
                      key={p.code}
                      onClick={() => handleClickPoint(p)}
                      className="absolute rounded-full border-2 border-white transition-all"
                      style={{
                        left: `${p.pos2d.x}%`,
                        top: `${p.pos2d.y}%`,
                        width: isHighlight ? '18px' : '10px',
                        height: isHighlight ? '18px' : '10px',
                        transform: 'translate(-50%, -50%)',
                        backgroundColor: isHighlight ? '#f59e0b' : isDimmed ? '#6b7280' : '#ef4444',
                        boxShadow: isHighlight ? '0 0 12px rgba(245,158,11,0.8)' : '0 2px 4px rgba(0,0,0,0.2)',
                        zIndex: isHighlight ? 20 : 10,
                        animation: isHighlight ? 'pulse 1.5s infinite' : 'none',
                        opacity: isDimmed ? 0.5 : 1,
                        cursor: gameState === 'playing' ? 'pointer' : 'default',
                      }}
                      title={showAllLabels ? p.name : undefined}
                    />
                  );
                })}

                {/* 显示所有标签 */}
                {showAllLabels && points2d.map(p => (
                  <div
                    key={`label-${p.code}`}
                    className="absolute text-[8px] px-1 py-0.5 rounded bg-black/70 text-white pointer-events-none whitespace-nowrap"
                    style={{ left: `${p.pos2d.x}%`, top: `${p.pos2d.y}%`, transform: 'translate(-50%, -120%)' }}
                  >
                    {p.name}
                  </div>
                ))}
              </div>

              {/* 显示/隐藏标签 */}
              <button
                onClick={() => setShowAllLabels(!showAllLabels)}
                className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-full bg-black/50 text-white"
              >
                {showAllLabels ? '隐藏' : '显示'}标签
              </button>
            </div>

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
