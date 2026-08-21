'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import { useCultivationStore } from '@/lib/cultivation-store';
import { ArrowLeft, Palette, RotateCw, Zap, Award, Timer, Pause, Play, ChevronRight } from 'lucide-react';

// ═══════════════════════════════════════
// 色彩生成与游戏逻辑
// 改编自 ColorTestGame（stanleyei/ColorTestGame）
// ═══════════════════════════════════════

interface ColorBlock {
  r: number;
  g: number;
  b: number;
  isTarget: boolean;
}

/** 生成随机 RGB 颜色 */
function randomColor(): { r: number; g: number; b: number } {
  return {
    r: Math.floor(Math.random() * 200) + 30,
    g: Math.floor(Math.random() * 200) + 30,
    b: Math.floor(Math.random() * 200) + 30,
  };
}

/** 根据 scoreValue（0~100）计算差异透明度
 *  scoreValue 越高 → opacity 越接近 1 → 差异越小 → 越难 */
function calcOpacity(scoreValue: number): number {
  // 原版：opacity = 0.5 + scoreValue / 100，范围 0.5~1.5
  // 但 opacity > 1 等于 1，所以实际范围 0.5~1.0
  // 我们微调：0.35 + scoreValue / 200，范围 0.35~0.85，让游戏稍难一些
  return 0.35 + scoreValue / 200;
}

/** 生成 cubeCount×cubeCount 个色块，其中一个颜色不同 */
function generateBlocks(cubeCount: number, scoreValue: number): ColorBlock[] {
  const total = cubeCount * cubeCount;
  const baseColor = randomColor();
  const opacity = calcOpacity(scoreValue);

  // 目标色块的颜色：在 baseColor 上叠加 opacity 差异
  const diff = (1 - opacity) * 80;
  const dirR = Math.random() > 0.5 ? diff : -diff;
  const dirG = Math.random() > 0.5 ? diff : -diff;
  const dirB = Math.random() > 0.5 ? diff : -diff;
  const targetColor = {
    r: Math.min(255, Math.max(0, Math.round(baseColor.r + dirR))),
    g: Math.min(255, Math.max(0, Math.round(baseColor.g + dirG))),
    b: Math.min(255, Math.max(0, Math.round(baseColor.b + dirB))),
  };

  // 随机选目标位置
  const targetIdx = Math.floor(Math.random() * total);

  const blocks: ColorBlock[] = [];
  for (let i = 0; i < total; i++) {
    if (i === targetIdx) {
      blocks.push({ ...targetColor, isTarget: true });
    } else {
      blocks.push({ ...baseColor, isTarget: false });
    }
  }
  return blocks;
}

// ═══════════════════════════════════════
// 进度持久化
// ═══════════════════════════════════════

interface ColorProgress {
  highScore: number;
  bestRound: number;
  totalCorrect: number;
  totalGames: number;
}

const STORAGE_KEY = 'color-challenge-progress';

function loadProgress(): ColorProgress {
  if (typeof window === 'undefined') return { highScore: 0, bestRound: 0, totalCorrect: 0, totalGames: 0 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { highScore: 0, bestRound: 0, totalCorrect: 0, totalGames: 0 };
}

function saveProgress(p: ColorProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// ═══════════════════════════════════════
// 主组件
// ═══════════════════════════════════════

type GameState = 'idle' | 'playing' | 'paused' | 'finished';

const TIME_LIMIT = 60; // 60秒倒计时

export default function ColorChallengePage() {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [cubeCount, setCubeCount] = useState(2); // 从 2×2 开始
  const [round, setRound] = useState(0); // 当前轮次（答对后递增）
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [blocks, setBlocks] = useState<ColorBlock[]>([]);
  const [wrongFlash, setWrongFlash] = useState<number | null>(null);
  const [progress, setProgress] = useState<ColorProgress>(loadProgress);
  const [rewardGiven, setRewardGiven] = useState(false);

  const { addXiuWei, recordPractice, completeTodayStep } = useCultivationStore();
  const rewardGivenRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { saveProgress(progress); }, [progress]);

  // 生成新一局色块
  const newRound = useCallback((cc: number, sc: number) => {
    setBlocks(generateBlocks(cc, sc));
  }, []);

  // 开始游戏
  const startGame = useCallback(() => {
    setCubeCount(2);
    setRound(0);
    setScore(0);
    setTimeLeft(TIME_LIMIT);
    setWrongFlash(null);
    setGameState('playing');
    setRewardGiven(false);
    rewardGivenRef.current = false;
    newRound(2, 0);
  }, [newRound]);

  // 倒计时
  useEffect(() => {
    if (gameState !== 'playing') {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          // 时间到 → 游戏结束
          if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
          setGameState('finished');
          // 修为奖励
          if (!rewardGivenRef.current) {
            rewardGivenRef.current = true;
            const gain = Math.floor(score / 5) + 2; // 每5分1点+基础2点，火行
            addXiuWei('fire', gain);
            recordPractice('color-challenge', TIME_LIMIT, 'fire', gain);
            completeTodayStep('color-challenge');
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
  }, [gameState, score, addXiuWei, recordPractice, completeTodayStep]);

  // 点击色块
  const handleClickBlock = useCallback((idx: number) => {
    if (gameState !== 'playing') return;

    const block = blocks[idx];
    if (block.isTarget) {
      // 答对
      const newScore = score + Math.max(1, cubeCount - 1); // 难度越高得分越多
      const newRound = round + 1;
      setScore(newScore);
      setRound(newRound);

      // 每答对 cubeCount 次递增难度
      let newCubeCount = cubeCount;
      if (newRound % cubeCount === 0 && cubeCount < 8) {
        newCubeCount = cubeCount + 1;
        setCubeCount(newCubeCount);
      }

      // 修为：每答对 +1 火行
      addXiuWei('fire', 1);

      // 生成下一局
      newRound_blocks(newCubeCount, newScore);

      // 更新进度
      setProgress(prev => ({
        ...prev,
        totalCorrect: prev.totalCorrect + 1,
        highScore: Math.max(prev.highScore, newScore),
        bestRound: Math.max(prev.bestRound, newRound),
      }));
    } else {
      // 答错：闪烁 + 扣 2 秒
      setWrongFlash(idx);
      setTimeLeft((t) => Math.max(0, t - 2));
      setTimeout(() => setWrongFlash(null), 400);
    }
  }, [gameState, blocks, score, round, cubeCount, addXiuWei, newRound]);

  // 辅助：生成新一局色块（避免与 newRound 函数名冲突）
  const newRound_blocks = useCallback((cc: number, sc: number) => {
    setBlocks(generateBlocks(cc, sc));
  }, []);

  // 暂停/恢复
  const togglePause = useCallback(() => {
    setGameState((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s));
  }, []);

  // 返回主页
  const backToMenu = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setGameState('idle');
    setBlocks([]);
    setScore(0);
    setRound(0);
    setCubeCount(2);
    setTimeLeft(TIME_LIMIT);
  }, []);

  // 统计
  const progressPercent = useMemo(() => {
    return Math.round((1 - timeLeft / TIME_LIMIT) * 100);
  }, [timeLeft]);

  // 游戏结束统计
  const finalGain = useMemo(() => {
    return Math.floor(score / 5) + 2;
  }, [score]);

  // ═══════════════════════════════════════
  // 渲染
  // ═══════════════════════════════════════

  // 生成 CSS grid 布局
  const gridStyle = useMemo(() => {
    const gap = cubeCount <= 4 ? 6 : cubeCount <= 6 ? 4 : 3;
    const size = `repeat(${cubeCount}, 1fr)`;
    return { gridTemplateColumns: size, gridTemplateRows: size, gap: `${gap}px` };
  }, [cubeCount]);

  // 色块尺寸自适应
  const blockSize = useMemo(() => {
    if (cubeCount <= 3) return 'w-full aspect-square';
    if (cubeCount <= 5) return 'w-full aspect-square';
    if (cubeCount <= 7) return 'w-full aspect-square';
    return 'w-full aspect-square';
  }, [cubeCount]);

  return (
    <PageContainer theme="healing" className="pb-24">
      {/* 顶部 */}
      <div className="px-5 pt-12 pb-5 text-white" style={{ background: 'linear-gradient(135deg, #E65100, #BF360C)' }}>
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => window.history.back()} className="text-white/70 hover:text-white">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-xl font-black font-serif">辨色挑战</h1>
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold ml-auto">火行修为</span>
        </div>
        <p className="text-sm text-white/60 font-serif">色彩辨识 · 反应速度 · 难度递增</p>

        {/* 历史统计 */}
        <div className="mt-3 flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 text-amber-300">
            <Award size={13} />
            <span>最高分 {progress.highScore}</span>
          </div>
          <div className="flex items-center gap-1 text-orange-300">
            <Zap size={13} />
            <span>最佳轮次 {progress.bestRound}</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-300">
            <Palette size={13} />
            <span>累计答对 {progress.totalCorrect}</span>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* ===== 待开始界面 ===== */}
        {gameState === 'idle' && (
          <>
            {/* 游戏说明 */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-5 rounded-full bg-orange-500" />
                <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">玩法说明</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-600 leading-relaxed">
                <p>· 在色块网格中找出<strong className="text-orange-600">颜色不同</strong>的那一个</p>
                <p>· 答对得分，难度递增：2×2 → 3×3 → 4×4 ... 最高 8×8</p>
                <p>· 答错<strong className="text-red-500">扣 2 秒</strong>，颜色差异越来越小</p>
                <p>· 60 秒内尽量得高分，所得修为归属<strong className="text-red-600">火行</strong></p>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200">
                <p className="text-xs text-orange-700 font-medium">
                  🔥 火行对应心，心主神明。辨色训练可宁心安神、提升专注力。
                </p>
              </div>
            </div>

            {/* 最佳成绩 */}
            {progress.highScore > 0 && (
              <div className="glass-card p-4 ring-1 ring-amber-400/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-amber-400 to-orange-600">
                      <Award size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold font-serif text-gray-800">个人最佳</p>
                      <p className="text-[10px] text-gray-500">最高分 / 最佳轮次 / 总答对</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-center">
                    <div>
                      <p className="text-xl font-black text-amber-600">{progress.highScore}</p>
                      <p className="text-[8px] text-gray-400">分</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-orange-500">{progress.bestRound}</p>
                      <p className="text-[8px] text-gray-400">轮</p>
                    </div>
                    <div>
                      <p className="text-xl font-black text-emerald-500">{progress.totalCorrect}</p>
                      <p className="text-[8px] text-gray-400">对</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 开始按钮 */}
            <button
              onClick={startGame}
              className="w-full rounded-xl p-4 flex items-center justify-center gap-2 text-white font-bold text-sm font-serif transition hover:shadow-md hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #E65100, #BF360C)' }}
            >
              <Palette size={18} />
              开始挑战
            </button>
          </>
        )}

        {/* ===== 游戏中 / 暂停界面 ===== */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <>
            {/* 顶部状态栏 */}
            <div className="glass-card p-3">
              <div className="flex items-center gap-2 mb-2">
                {/* 倒计时 */}
                <div className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500' : 'text-gray-700'}`}>
                  <Timer size={16} />
                  <span className="text-lg font-black font-serif">{timeLeft}s</span>
                </div>
                <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-red-500' : 'bg-gradient-to-r from-orange-500 to-amber-500'}`}
                    style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
                  />
                </div>
                {/* 暂停按钮 */}
                <button onClick={togglePause} className="text-gray-500 hover:text-gray-700">
                  {gameState === 'playing' ? <Pause size={18} /> : <Play size={18} />}
                </button>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold text-orange-600">分数 {score}</span>
                <span className="font-bold text-amber-600">轮次 {round}</span>
                <span className="font-bold text-gray-600">{cubeCount}×{cubeCount} = {cubeCount * cubeCount}格</span>
              </div>
            </div>

            {/* 色块网格 */}
            <div className="glass-card p-4">
              {gameState === 'paused' ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Pause size={48} className="text-gray-400 mb-3" />
                  <p className="text-lg font-bold font-serif text-gray-700">已暂停</p>
                  <button
                    onClick={togglePause}
                    className="mt-4 px-6 py-2 rounded-lg text-white font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #E65100, #BF360C)' }}
                  >
                    继续游戏
                  </button>
                </div>
              ) : (
                <div
                  className="grid w-full mx-auto select-none"
                  style={{
                    ...gridStyle,
                    maxWidth: cubeCount <= 3 ? '320px' : cubeCount <= 5 ? '360px' : '400px',
                  }}
                >
                  {blocks.map((block, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleClickBlock(idx)}
                      className={`${blockSize} rounded-lg transition-all duration-200 hover:scale-95 active:scale-90`}
                      style={{
                        backgroundColor: `rgb(${block.r}, ${block.g}, ${block.b})`,
                        boxShadow: wrongFlash === idx ? '0 0 0 3px #ef4444' : '0 2px 4px rgba(0,0,0,0.1)',
                        animation: wrongFlash === idx ? 'shake 0.3s' : 'none',
                        cursor: 'pointer',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* 提示 */}
            <p className="text-center text-xs text-gray-400">
              {gameState === 'playing' && '找出颜色不同的色块 → 点击它'}
            </p>
          </>
        )}

        {/* ===== 游戏结束界面 ===== */}
        {gameState === 'finished' && (
          <>
            <div className="glass-card p-6 text-center">
              <div className="text-5xl mb-3">
                {score >= 80 ? '🏆' : score >= 50 ? '🥈' : score >= 30 ? '🥉' : score >= 10 ? '💪' : '🌱'}
              </div>
              <p className="text-lg font-bold font-serif text-gray-800">
                {score >= 80 ? '火眼金睛！' : score >= 50 ? '火行充沛！' : score >= 30 ? '初窥门径' : score >= 10 ? '继续修炼' : '再接再厉'}
              </p>

              <div className="mt-4 flex justify-center gap-4 text-sm">
                <div>
                  <p className="text-3xl font-black text-orange-600">{score}</p>
                  <p className="text-[10px] text-gray-500">总分</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <p className="text-3xl font-black text-amber-600">{round}</p>
                  <p className="text-[10px] text-gray-500">轮次</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div>
                  <p className="text-3xl font-black text-red-500">{cubeCount}×{cubeCount}</p>
                  <p className="text-[10px] text-gray-500">最高难度</p>
                </div>
              </div>

              {/* 修为奖励 */}
              <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">🔥</span>
                  <span className="text-sm font-bold text-red-600">火行修为 +{finalGain}</span>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  心主神明 · 辨色宁心 · 已记录今日功法
                </p>
              </div>

              {/* 新纪录提示 */}
              {score === progress.highScore && score > 0 && (
                <div className="mt-2 inline-block px-3 py-1 rounded-full bg-amber-400/20 text-amber-700 text-xs font-bold animate-pulse">
                  ✨ 新纪录！
                </div>
              )}
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3">
              <button
                onClick={startGame}
                className="flex-1 rounded-xl p-3 flex items-center justify-center gap-2 text-white text-sm font-bold font-serif transition hover:shadow-md"
                style={{ background: 'linear-gradient(135deg, #E65100, #BF360C)' }}
              >
                <RotateCw size={16} />
                再来一局
              </button>
              <button
                onClick={backToMenu}
                className="flex-1 glass-card p-3 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 transition hover:shadow-md"
              >
                返回主页
              </button>
            </div>
          </>
        )}

        {/* 五行修为关联说明 */}
        {gameState === 'idle' && (
          <div className="glass-card p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-1 h-5 rounded-full bg-red-500" />
              <h3 className="font-bold font-serif text-sm text-gray-800">五行修为关联</h3>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              <p>· 每答对 1 题：火行修为 +1</p>
              <p>· 每局结束：按总分额外获得修为（每5分+1火行）</p>
              <p>· 完成一局：自动记录今日功法「辨色挑战」</p>
              <p>· 修为提升可晋级段位：闻道者→修气士→通经者→...→知音者</p>
            </div>
            <Link href="/healing/cultivation" className="mt-3 flex items-center justify-between text-xs text-red-600 font-medium">
              <span>查看修为进度</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>

      <BottomNav />

      {/* shake 动画 */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}      </style>
    </PageContainer>
  );
}
