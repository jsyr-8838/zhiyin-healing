'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import { getTcmAcupoints, getTcmMeridians, type TcmAcupoint, type TcmMeridian } from '@/lib/tcm-acupoint-data';
import { ACUPOINT_LIST } from '@/lib/xws-data';
import { useCultivationStore } from '@/lib/cultivation-store';
import { XWS_VIDEO_ACUPOINTS } from '@/lib/xws-video-names';
import { ACUPOINT_LOCATION_IMAGES } from '@/lib/acupoint-image-names';
import { cosUrl } from '@/lib/cos-url';
import { ArrowLeft, Target, Check, X, RotateCw, Zap, ChevronRight, MapPin, Video, ExternalLink, BookOpen, Activity } from 'lucide-react';

// ═══════════════════════════════════════
// 经脉中文映射 (code → 中文名)
// ═══════════════════════════════════════
const MERIDIAN_ZH: Record<string, string> = {
  LU: '手太阴肺经', LI: '手阳明大肠经', ST: '足阳明胃经', SP: '足太阴脾经',
  HT: '手少阴心经', SI: '手太阳小肠经', BL: '足太阳膀胱经', KI: '足少阴肾经',
  PC: '手厥阴心包经', TE: '手少阳三焦经', GB: '足少阳胆经', LV: '足厥阴肝经',
  DU: '督脉', REN: '任脉', DONG: '董氏奇穴',
};

// 中文名 → code（用于经络图URL）
const MERIDIAN_ZH_TO_CODE: Record<string, string> = {};
Object.entries(MERIDIAN_ZH).forEach(([code, zh]) => { MERIDIAN_ZH_TO_CODE[zh] = code; });

const WUXING_EN: Record<string, string> = {
  '金': 'metal', '水': 'water', '木': 'wood', '火': 'fire', '土': 'earth',
};

// xws-data 中的经络名 → tcm-acupoint-data 的 code
const XWS_MERIDIAN_TO_CODE: Record<string, string> = {
  '手太阴肺经': 'LU', '手阳明大肠经': 'LI', '足阳明胃经': 'ST', '足太阴脾经': 'SP',
  '手少阴心经': 'HT', '手太阳小肠经': 'SI', '足太阳膀胱经': 'BL', '足少阴肾经': 'KI',
  '手厥阴心包经': 'PC', '手少阳三焦经': 'TE', '足少阳胆经': 'GB', '足厥阴肝经': 'LV',
  '督脉': 'DU', '任脉': 'REN', '经外奇穴': 'DONG',
};

// ═══════════════════════════════════════
// 获取经络动态图URL
// ═══════════════════════════════════════
function getMeridianGifUrl(meridianCode: string): string | null {
  const zhName = MERIDIAN_ZH[meridianCode];
  if (!zhName) return null;
  return cosUrl(`/images/meridians/${encodeURIComponent(zhName)}_model.gif`);
}

function getMeridianTypeImgUrl(meridianCode: string): string | null {
  const zhName = MERIDIAN_ZH[meridianCode];
  if (!zhName) return null;
  return cosUrl(`/images/meridians/${encodeURIComponent(zhName)}_type.jpg`);
}

// ═══════════════════════════════════════
// xws-data 中穴位名（带"穴"后缀）→ 去后缀
// ═══════════════════════════════════════
function stripSuffix(name: string): string {
  return name.endsWith('穴') ? name.slice(0, -1) : name;
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

const STORAGE_KEY = 'acupoint-challenge-progress-v2';

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
// 题型定义
// ═══════════════════════════════════════

type QuestionType = 'image-to-name' | 'name-to-image' | 'location-to-name' | 'meridian-to-acupoint';

interface Question {
  type: QuestionType;
  point: TcmAcupoint;
  options: string[];       // 选项文本
  correctAnswer: string;  // 正确答案文本
  optionPoints: TcmAcupoint[]; // 选项对应的穴位（用于答题后展示）
}

// ═══════════════════════════════════════
// xws-data 索引（用于按穴位名快速查找详细定位/主治）
// ═══════════════════════════════════════

function buildXwsIndex(): Map<string, { location: string; disease: string; meridian: string }> {
  const map = new Map<string, { location: string; disease: string; meridian: string }>();
  for (const item of ACUPOINT_LIST) {
    const name = stripSuffix(item.name);
    map.set(name, { location: item.location, disease: item.disease, meridian: item.meridian });
  }
  return map;
}

// ═══════════════════════════════════════
// 生成题目
// ═══════════════════════════════════════

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateQuestion(point: TcmAcupoint, allPoints: TcmAcupoint[]): Question {
  const types: QuestionType[] = [];
  
  // 有定位图的 → 可以出"看图选穴名"和"看穴名选图"
  const hasImage = ACUPOINT_LOCATION_IMAGES.has(point.name);
  if (hasImage) {
    types.push('image-to-name', 'name-to-image');
  }
  // 有定位描述 → 可以出"看定位选穴名"
  if (point.location) {
    types.push('location-to-name');
  }
  // 有经脉 → 可以出"看经脉选穴位"
  types.push('meridian-to-acupoint');

  const type = types[Math.floor(Math.random() * types.length)];

  // 生成干扰选项（优先同经脉）
  const sameMeridian = allPoints.filter(p => p.meridian === point.meridian && p.code !== point.code);
  const otherPoints = allPoints.filter(p => p.meridian !== point.meridian && p.meridian !== 'DONG');
  const pool = shuffle([...sameMeridian, ...shuffle(otherPoints).slice(0, 20)]).slice(0, 3);
  const wrongOptions = pool.filter(p => p.name !== point.name).slice(0, 3);
  const optionPoints = shuffle([point, ...wrongOptions]);

  switch (type) {
    case 'image-to-name':
      return {
        type,
        point,
        options: optionPoints.map(p => p.name),
        correctAnswer: point.name,
        optionPoints,
      };
    case 'name-to-image':
      // 4个穴位名 → 选出对应定位图
      return {
        type,
        point,
        options: optionPoints.map(p => p.name),
        correctAnswer: point.name,
        optionPoints,
      };
    case 'location-to-name':
      return {
        type,
        point,
        options: optionPoints.map(p => p.name),
        correctAnswer: point.name,
        optionPoints,
      };
    case 'meridian-to-acupoint':
      // 题目：这条经脉上有哪些穴位？选出属于该经脉的穴位
      // 选项中有些属于该经脉、有些不属于
      const meridianPoints = allPoints.filter(p => p.meridian === point.meridian);
      const nonMeridianPoints = allPoints.filter(p => p.meridian !== point.meridian && p.meridian !== 'DONG');
      const correctPool = shuffle(meridianPoints.filter(p => p.code !== point.code)).slice(0, 2);
      const wrongPool = shuffle(nonMeridianPoints).slice(0, 2);
      const meridianOptions = shuffle([point, ...correctPool, ...wrongPool]);
      return {
        type,
        point,
        options: meridianOptions.map(p => p.name),
        correctAnswer: point.name, // 属于该经脉的正确穴位
        optionPoints: meridianOptions,
      };
  }
}

// ═══════════════════════════════════════
// 题目展示文本
// ═══════════════════════════════════════

function getQuestionPrompt(q: Question): string {
  const meridianName = MERIDIAN_ZH[q.point.meridian] || q.point.meridian;
  switch (q.type) {
    case 'image-to-name':
      return '请根据穴位定位图，选出正确的穴位名称';
    case 'name-to-image':
      return `请选出「${q.point.name}」对应的穴位定位图`;
    case 'location-to-name':
      return '请根据定位描述，选出正确的穴位名称';
    case 'meridian-to-acupoint':
      return `以下哪个穴位属于「${meridianName}」？`;
  }
}

// ═══════════════════════════════════════
// 答题反馈面板（核心：毫秒级交互联动）
// ═══════════════════════════════════════

function FeedbackPanel({ question, selectedAnswer, meridian }: {
  question: Question;
  selectedAnswer: string | null;
  meridian?: TcmMeridian;
}) {
  const point = question.point;
  const isCorrect = selectedAnswer === question.correctAnswer;
  const hasImage = ACUPOINT_LOCATION_IMAGES.has(point.name);
  const hasVideo = XWS_VIDEO_ACUPOINTS.has(point.name) || XWS_VIDEO_ACUPOINTS.has(point.name + '穴');
  const meridianGifUrl = getMeridianGifUrl(point.meridian);
  const meridianTypeImgUrl = getMeridianTypeImgUrl(point.meridian);
  const [showVideo, setShowVideo] = useState(false);
  const [showMeridianGif, setShowMeridianGif] = useState(false);

  const meridianName = MERIDIAN_ZH[point.meridian] || point.meridian;

  return (
    <div className="mt-4 space-y-3">
      {/* 答题结果 */}
      <div className={`p-3 rounded-lg text-sm font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
        <p className="font-bold text-base">
          {isCorrect ? '✓ 回答正确！' : '✗ 回答错误'}
        </p>
        <p className="text-[11px] mt-1 text-gray-600">
          正确答案：<span className="font-bold">{point.name}</span> · {meridianName}
        </p>
      </div>

      {/* 穴位定位图（毫秒级响应） */}
      {hasImage && (
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
      )}

      {/* 穴位定位视频（折叠展开） */}
      {hasVideo && (
        <div className="rounded-xl overflow-hidden bg-white border border-purple-200">
          <button
            onClick={() => setShowVideo(!showVideo)}
            className="w-full px-3 py-2 flex items-center gap-1.5 bg-purple-50 border-b border-purple-200 transition hover:bg-purple-100"
          >
            <Video size={13} className="text-purple-600" />
            <span className="text-xs font-bold text-purple-700">{showVideo ? '收起定位视频' : '观看定位视频'}</span>
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

      {/* 经络动态图（打通经络图解模块） */}
      {meridianGifUrl && (
        <div className="rounded-xl overflow-hidden bg-white border border-blue-200">
          <button
            onClick={() => setShowMeridianGif(!showMeridianGif)}
            className="w-full px-3 py-2 flex items-center gap-1.5 bg-blue-50 border-b border-blue-200 transition hover:bg-blue-100"
          >
            <Activity size={13} className="text-blue-600" />
            <span className="text-xs font-bold text-blue-700">{showMeridianGif ? '收起经络动态图' : `查看${meridianName}动态图`}</span>
            <ChevronRight size={13} className={`text-blue-400 ml-auto transition-transform ${showMeridianGif ? 'rotate-90' : ''}`} />
          </button>
          {showMeridianGif && (
            <div className="bg-gray-50 p-2 flex items-center justify-center">
              <img
                src={meridianGifUrl}
                alt={`${meridianName}动态图`}
                className="max-h-[50vh] rounded-lg shadow-md object-contain"
                loading="eager"
                onError={(e) => {
                  // 动态图加载失败 → 回退到静态图
                  const target = e.target as HTMLImageElement;
                  if (meridianTypeImgUrl) target.src = meridianTypeImgUrl;
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* 定位描述 */}
      {point.location && (
        <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen size={12} className="text-blue-600" />
            <span className="text-[10px] text-blue-700 font-bold">定位描述</span>
          </div>
          <p className="text-[11px] text-gray-700 leading-relaxed">{point.location}</p>
        </div>
      )}

      {/* 主治 */}
      {point.indications && (
        <div className="p-3 rounded-lg bg-green-50/80 border border-green-200">
          <span className="text-[10px] text-green-700 font-bold">主治</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {point.indications.split(/[，,、]/).filter(Boolean).slice(0, 10).map((ind, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 border border-green-200">
                {ind.trim()}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 针刺方法 */}
      {point.needlingMethod && (
        <div className="p-3 rounded-lg bg-amber-50/80 border border-amber-200">
          <span className="text-[10px] text-amber-700 font-bold">针刺方法</span>
          <p className="text-[11px] text-gray-700 leading-relaxed mt-1">{point.needlingMethod}</p>
        </div>
      )}

      {/* 跳转链接 */}
      <div className="flex gap-2">
        <Link
          href={`/meridian?focus=${point.code}`}
          className="flex-1 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
        >
          <ExternalLink size={12} />
          穴位定位模块
        </Link>
        <Link
          href="/healing/meridian-chart"
          className="flex-1 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-center text-xs text-blue-700 font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
        >
          <Activity size={12} />
          经络图解
        </Link>
      </div>
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
  const xwsIndex = useMemo(() => buildXwsIndex(), []);

  // 只保留有定位图的穴位作为题库
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
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
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
    const shuffled = shuffle(pool);
    const round = shuffled.slice(0, Math.min(roundSize, shuffled.length));

    // 为每题生成不同类型的题目
    const qs: Question[] = round.map(point => generateQuestion(point, allPoints));

    setQuestions(qs);
    setCurrentIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setSelectedAnswer(null);
    setGameState('playing');
    rewardGivenRef.current = false;
  }, [gamePoints, roundSize, allPoints]);

  const handleAnswer = useCallback((answer: string) => {
    if (!currentQuestion || selectedAnswer !== null) return; // 已答过不能再答

    setSelectedAnswer(answer);
    const isCorrect = answer === currentQuestion.correctAnswer;
    const point = currentQuestion.point;

    if (isCorrect) {
      const newCorrect = correctCount + 1;
      const newStreak = streak + 1;
      setCorrectCount(newCorrect);
      setStreak(newStreak);

      const meridian = meridians.find(m => m.code === point.meridian);
      const el = (meridian ? WUXING_EN[meridian.wuxing] : 'earth') as 'wood' | 'fire' | 'earth' | 'metal' | 'water';
      const { addXiuWei, recordPractice } = useCultivationStore.getState();
      addXiuWei(el, 2);
      recordPractice('acupoint-challenge', 30, el, 2);

      setProgress(prev => ({
        ...prev,
        totalCorrect: prev.totalCorrect + 1,
        totalAttempts: prev.totalAttempts + 1,
        bestStreak: Math.max(prev.bestStreak, newStreak),
        playedMeridians: prev.playedMeridians.includes(point.meridian)
          ? prev.playedMeridians
          : [...prev.playedMeridians, point.meridian],
      }));
    } else {
      setWrongCount(wrongCount + 1);
      setStreak(0);
      setProgress(prev => ({ ...prev, totalAttempts: prev.totalAttempts + 1 }));
    }
  }, [currentQuestion, selectedAnswer, correctCount, wrongCount, streak, meridians]);

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
      setSelectedAnswer(null);
    }
  }, [currentIdx, questions.length]);

  const resetGame = useCallback(() => {
    setGameState('idle');
    setQuestions([]);
    setCurrentIdx(0);
    setCorrectCount(0);
    setWrongCount(0);
    setStreak(0);
    setSelectedAnswer(null);
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
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 font-bold ml-auto">智能出题</span>
        </div>
        <p className="text-sm text-white/60 font-serif">多题型智能出题 · 穴位图/视频/经络图联动 · 修为联动</p>

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
        {/* ═══ 游戏未开始：选择经脉 + 题数 ═══ */}
        {gameState === 'idle' && (
          <>
            {/* 说明 */}
            <div className="glass-card p-4 bg-blue-50/50">
              <div className="flex items-start gap-2">
                <BookOpen size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-700 leading-relaxed">
                  <p className="font-bold text-blue-700 mb-1">玩法说明</p>
                  <p>系统从穴位定位库中智能出题，包含<b>看图识穴、看穴选图、定位描述辨穴、经脉归属辨穴</b>等多种题型。</p>
                  <p className="mt-1">答题后立即展示：<b>穴位定位图 + 定位视频 + 经络动态图</b>，三位一体联动学习。</p>
                </div>
              </div>
            </div>

            {/* 题型预览 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="glass-card p-3 text-center">
                <MapPin size={18} className="text-emerald-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-700">看图识穴</p>
                <p className="text-[9px] text-gray-400">根据定位图选穴位名</p>
              </div>
              <div className="glass-card p-3 text-center">
                <BookOpen size={18} className="text-blue-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-700">定位辨穴</p>
                <p className="text-[9px] text-gray-400">根据描述选穴位名</p>
              </div>
              <div className="glass-card p-3 text-center">
                <Video size={18} className="text-purple-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-700">看穴选图</p>
                <p className="text-[9px] text-gray-400">根据穴名选定位图</p>
              </div>
              <div className="glass-card p-3 text-center">
                <Activity size={18} className="text-blue-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-700">经脉归属</p>
                <p className="text-[9px] text-gray-400">选出属于该经的穴位</p>
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

        {/* ═══ 游戏中/结束 ═══ */}
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

            {/* ═══ 当前题目 ═══ */}
            {gameState === 'playing' && currentQuestion && (
              <div className="glass-card p-4 ring-2 ring-blue-500/30">
                {/* 题目类型标签 */}
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">
                    {currentQuestion.type === 'image-to-name' ? '看图识穴' :
                     currentQuestion.type === 'name-to-image' ? '看穴选图' :
                     currentQuestion.type === 'location-to-name' ? '定位辨穴' : '经脉归属'}
                  </span>
                </div>

                {/* 题目提示 */}
                <p className="text-[10px] text-gray-400 text-center mb-1">{getQuestionPrompt(currentQuestion)}</p>
                <p className="text-[11px] text-gray-500 text-center mb-3">
                  {MERIDIAN_ZH[currentQuestion.point.meridian] || currentQuestion.point.meridian}
                </p>

                {/* ═══ 题目内容区 ═══ */}
                {/* image-to-name: 展示定位图，选项是穴名 */}
                {currentQuestion.type === 'image-to-name' && (
                  <div className="mb-4">
                    {ACUPOINT_LOCATION_IMAGES.has(currentQuestion.point.name) ? (
                      <div className="rounded-xl overflow-hidden bg-white border-2 border-emerald-300 shadow-lg">
                        <div className="bg-emerald-50 px-3 py-1.5 flex items-center gap-1.5 border-b border-emerald-200">
                          <MapPin size={13} className="text-emerald-600" />
                          <span className="text-xs font-bold text-emerald-700">穴位定位图</span>
                        </div>
                        <img
                          src={cosUrl(`/assets/acupoint/images/${encodeURIComponent(currentQuestion.point.name)}.jpg`)}
                          alt="穴位定位图"
                          className="w-full"
                          loading="eager"
                        />
                      </div>
                    ) : (
                      <div className="rounded-xl bg-amber-50 border-2 border-amber-200 p-4 text-center">
                        <MapPin size={20} className="text-amber-500 mx-auto mb-1" />
                        <p className="text-xs text-amber-700">暂无定位图</p>
                      </div>
                    )}
                  </div>
                )}

                {/* name-to-image: 展示穴名，选项也是穴名（但提示选对应图） */}
                {currentQuestion.type === 'name-to-image' && (
                  <div className="mb-4 text-center">
                    <p className="text-3xl font-black font-serif text-gray-800">{currentQuestion.point.name}</p>
                    <p className="text-[10px] text-gray-400 mt-1">请从选项中选出此穴位的定位图</p>
                  </div>
                )}

                {/* location-to-name: 展示定位描述，选项是穴名 */}
                {currentQuestion.type === 'location-to-name' && (
                  <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen size={12} className="text-blue-600" />
                      <span className="text-[10px] text-blue-700 font-bold">定位描述</span>
                    </div>
                    <p className="text-[12px] text-gray-700 leading-relaxed">{currentQuestion.point.location}</p>
                  </div>
                )}

                {/* meridian-to-acupoint: 展示经脉名，选项是穴名 */}
                {currentQuestion.type === 'meridian-to-acupoint' && (
                  <div className="mb-4 text-center">
                    <p className="text-[10px] text-gray-400">经脉</p>
                    <p className="text-2xl font-black font-serif text-blue-700 mt-1">
                      {MERIDIAN_ZH[currentQuestion.point.meridian]}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-2">选出属于这条经脉的穴位</p>
                  </div>
                )}

                {/* ═══ 选项区 ═══ */}
                <div className="grid grid-cols-2 gap-2">
                  {currentQuestion.options.map((opt, i) => {
                    const optPoint = currentQuestion.optionPoints[i];
                    const isCorrect = opt === currentQuestion.correctAnswer;
                    const isSelected = selectedAnswer === opt;
                    let btnClass = 'glass-card p-3 text-center text-sm font-bold font-serif transition ';

                    if (selectedAnswer !== null) {
                      // 已答题：高亮正确/错误
                      if (isCorrect) {
                        btnClass += 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700';
                      } else if (isSelected) {
                        btnClass += 'bg-red-50 border-2 border-red-400 text-red-600';
                      } else {
                        btnClass += 'opacity-50 border-2 border-transparent text-gray-400';
                      }
                    } else {
                      // name-to-image 模式：选项带小图
                      btnClass += 'border-2 border-transparent text-gray-700 hover:border-blue-300 hover:bg-blue-50 active:scale-95';
                    }

                    // name-to-image 模式：选项展示穴位定位图
                    if (currentQuestion.type === 'name-to-image' && selectedAnswer === null) {
                      const hasImg = ACUPOINT_LOCATION_IMAGES.has(stripSuffix(opt)) || ACUPOINT_LOCATION_IMAGES.has(opt);
                      const imgName = ACUPOINT_LOCATION_IMAGES.has(opt) ? opt : stripSuffix(opt);
                      return (
                        <button
                          key={i}
                          onClick={() => handleAnswer(opt)}
                          className="glass-card p-2 text-center transition hover:shadow-md active:scale-95 border-2 border-transparent hover:border-blue-300"
                        >
                          {hasImg ? (
                            <img
                              src={cosUrl(`/assets/acupoint/images/${encodeURIComponent(imgName)}.jpg`)}
                              alt={opt}
                              className="w-full rounded-lg mb-1"
                              loading="eager"
                            />
                          ) : (
                            <div className="aspect-square bg-amber-50 rounded-lg flex items-center justify-center mb-1">
                              <MapPin size={20} className="text-amber-400" />
                            </div>
                          )}
                          <span className="text-[10px] font-bold text-gray-600">{opt}</span>
                        </button>
                      );
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(opt)}
                        disabled={selectedAnswer !== null}
                        className={btnClass}
                      >
                        <span className="text-base">{opt}</span>
                        {selectedAnswer !== null && isCorrect && <Check size={14} className="inline ml-1 text-emerald-500" />}
                        {selectedAnswer !== null && isSelected && !isCorrect && <X size={14} className="inline ml-1 text-red-500" />}
                      </button>
                    );
                  })}
                </div>

                {/* ═══ 答题反馈（毫秒级交互联动） ═══ */}
                {selectedAnswer !== null && (
                  <>
                    <FeedbackPanel
                      question={currentQuestion}
                      selectedAnswer={selectedAnswer}
                      meridian={currentMeridian}
                    />
                    {/* 下一题按钮 */}
                    <button
                      onClick={nextQuestion}
                      className="mt-4 w-full rounded-xl p-3 flex items-center justify-center gap-2 text-white font-bold text-sm font-serif transition hover:shadow-md"
                      style={{ background: 'linear-gradient(135deg, #1565C0, #0D47A1)' }}
                    >
                      {currentIdx + 1 >= questions.length ? '查看结果' : '下一题'}
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ═══ 游戏结束 ═══ */}
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
                {/* 链接 */}
                <div className="flex gap-2 mt-4">
                  <Link
                    href="/meridian"
                    className="flex-1 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-center text-xs text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <MapPin size={12} />
                    穴位定位
                  </Link>
                  <Link
                    href="/healing/meridian-chart"
                    className="flex-1 p-2 rounded-lg bg-blue-50 border border-blue-200 text-center text-xs text-blue-700 font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1"
                  >
                    <Activity size={12} />
                    经络图解
                  </Link>
                </div>
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
