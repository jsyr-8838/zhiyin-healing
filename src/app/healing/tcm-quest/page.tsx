'use client';

import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import { useTCMQuestStore } from '@/lib/tcm-quest/store';
import { LEVELS, getLevelByXp, getLevelProgress, MISSIONS, BOSSES, ACHIEVEMENTS, AI_LEADERBOARD, TAG_ICONS, TAG_COLORS, QUIZ_TAGS } from '@/lib/tcm-quest/config';
import { QUIZ_DATA, QUIZ_COUNT } from '@/lib/tcm-quest/quiz-data';
import { HERB_DATA, HERB_COUNT } from '@/lib/tcm-quest/herb-data';
import { FORMULA_DATA, FORMULA_COUNT } from '@/lib/tcm-quest/formula-data';
import { CASE_DATA, CASE_COUNT } from '@/lib/tcm-quest/case-data';
import type { QuizItem, QuizTag, HerbItem, FormulaItem, CaseItem } from '@/lib/tcm-quest/types';
import {
  ArrowLeft, Flame, Coins, Star, BookOpen, Swords, Leaf, Scroll,
  Brain, Target, RotateCw, User, Trophy, Zap, Heart, Award,
  ChevronRight, Check, X, Lock, Sparkles, TrendingUp,
} from 'lucide-react';
import EvoFeedback from '@/components/common/EvoFeedback';
import ContentVersionBadge from '@/components/common/ContentVersionBadge';

// ═══════════════════════════════════════
// Tab 配置
// ═══════════════════════════════════════
type TabId = 'home' | 'battle' | 'herb' | 'formula' | 'cases' | 'ai' | 'review' | 'me';

const TABS: { id: TabId; label: string; icon: typeof BookOpen }[] = [
  { id: 'home',    label: '学院', icon: BookOpen },
  { id: 'battle',  label: '闯关', icon: Swords },
  { id: 'herb',    label: '中药', icon: Leaf },
  { id: 'formula', label: '方剂', icon: Scroll },
  { id: 'cases',   label: '医案', icon: Brain },
  { id: 'ai',      label: 'AI辨证', icon: Sparkles },
  { id: 'review',  label: '复习', icon: RotateCw },
  { id: 'me',      label: '我的', icon: User },
];

// ═══════════════════════════════════════
// 主页面
// ═══════════════════════════════════════
export default function TCMQuestPage() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const store = useTCMQuestStore();

  return (
    <PageContainer theme="healing">
      {/* ===== 顶部状态栏 ===== */}
      <TopBar />

      {/* ===== Tab 导航 ===== */}
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ===== 内容区 ===== */}
      <div className="px-3 pb-4 min-h-[60vh]">
        {activeTab === 'home'    && <HomeTab />}
        {activeTab === 'battle'  && <BattleTab />}
        {activeTab === 'herb'    && <HerbTab />}
        {activeTab === 'formula' && <FormulaTab />}
        {activeTab === 'cases'   && <CasesTab />}
        {activeTab === 'ai'      && <AITab />}
        {activeTab === 'review'  && <ReviewTab />}
        {activeTab === 'me'      && <MeTab />}
      </div>

      <BottomNav />
    </PageContainer>
  );
}

// ═══════════════════════════════════════
// 顶部状态栏 — 等级/经验/金币/连续天数
// ═══════════════════════════════════════
function TopBar() {
  const { xp, coin, level, levelTitle, streak, totalCorrect } = useTCMQuestStore();
  const progress = getLevelProgress(xp);

  return (
    <div className="sticky top-0 z-30 bg-gradient-to-b from-[#fff8ef] to-[#fff8ef]/95 backdrop-blur-sm px-3 pt-3 pb-2 border-b border-amber-900/10">
      {/* 返回按钮 */}
      <div className="flex items-center justify-between mb-2">
        <Link href="/healing" className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800">
          <ArrowLeft size={16} />
          <span>疗愈</span>
        </Link>
        <h1 className="text-base font-bold font-serif text-red-800">灵兰秘典</h1>
        <ContentVersionBadge className="hidden sm:inline-flex" />
        <div className="w-12 sm:hidden" />
      </div>

      {/* 等级 + 进度条 */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{progress.level.icon}</span>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-xs font-bold text-gray-700">Lv.{level}</span>
              <span className="text-[10px] text-gray-500">{levelTitle}</span>
            </div>
          </div>
        </div>
        <div className="flex-1 h-2 bg-amber-200/40 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all duration-500"
               style={{ width: `${progress.percent}%` }} />
        </div>
        <span className="text-[9px] text-gray-500 tabular-nums">{progress.current}/{progress.needed}</span>
      </div>

      {/* 金币 / 连续 / 答对 */}
      <div className="flex items-center gap-3 text-xs">
        <span className="flex items-center gap-0.5 text-amber-700">
          <Coins size={13} /> {coin.toLocaleString()}
        </span>
        <span className="flex items-center gap-0.5 text-red-600">
          <Flame size={13} /> {streak}天
        </span>
        <span className="flex items-center gap-0.5 text-emerald-700">
          <Check size={13} /> {totalCorrect}
        </span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Tab 导航
// ═══════════════════════════════════════
function TabNav({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (t: TabId) => void }) {
  return (
    <div className="sticky top-[72px] z-20 bg-[#fff8ef]/90 backdrop-blur-sm px-2 py-1.5 border-b border-amber-900/5">
      <div className="flex gap-1 overflow-x-auto no-scrollbar">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                active
                  ? 'bg-gradient-to-b from-amber-100 to-amber-50 text-red-800 shadow-sm'
                  : 'text-gray-500'
              }`}
            >
              <Icon size={16} />
              <span className="text-[9px] font-bold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Home Tab — 学院首页
// ═══════════════════════════════════════
function HomeTab() {
  const { xp, coin, level, streak, totalAnswered, totalCorrect, herbsViewed, formulasViewed, casesSolved, bossDefeated, missionsCompleted } = useTCMQuestStore();

  const stats = [
    { label: '题库', value: QUIZ_COUNT, icon: BookOpen, color: '#b5311c' },
    { label: '中药', value: HERB_COUNT, icon: Leaf, color: '#1f7a4a' },
    { label: '方剂', value: FORMULA_COUNT, icon: Scroll, color: '#c9922a' },
    { label: '医案', value: CASE_COUNT, icon: Brain, color: '#5e2d91' },
  ];

  const myStats = [
    { label: '已答', value: totalAnswered, icon: Target, color: '#b5311c' },
    { label: '答对', value: totalCorrect, icon: Check, color: '#1f7a4a' },
    { label: '中药', value: herbsViewed.length, icon: Leaf, color: '#1f7a4a' },
    { label: '方剂', value: formulasViewed.length, icon: Scroll, color: '#c9922a' },
    { label: '医案', value: casesSolved, icon: Brain, color: '#5e2d91' },
    { label: 'Boss', value: bossDefeated, icon: Swords, color: '#b5311c' },
  ];

  // 师承任务进度
  const completedMissions = missionsCompleted.length;
  const nextMissions = MISSIONS.filter(m => !missionsCompleted.includes(m.id)).slice(0, 3);

  return (
    <div className="space-y-4 pt-3">
      {/* 数据概览 */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card p-2.5 text-center rounded-xl">
              <Icon size={16} className="mx-auto mb-1" style={{ color: s.color }} />
              <p className="text-base font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[9px] text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* 我的学习统计 */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={14} className="text-amber-600" />
          <h3 className="text-sm font-bold font-serif text-gray-800">我的学习</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {myStats.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="text-center">
                <Icon size={14} className="mx-auto mb-0.5" style={{ color: s.color }} />
                <p className="text-lg font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[9px] text-gray-500">{s.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 师承任务 */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-amber-600" />
            <h3 className="text-sm font-bold font-serif text-gray-800">师承任务</h3>
          </div>
          <span className="text-[10px] text-gray-500">{completedMissions}/{MISSIONS.length}</span>
        </div>
        <div className="space-y-2">
          {nextMissions.length === 0 ? (
            <p className="text-center text-xs text-gray-500 py-4">全部任务已完成！</p>
          ) : nextMissions.map(m => (
            <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg bg-amber-50/60">
              <span className="text-lg">{m.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-700">{m.title}</p>
                <p className="text-[9px] text-gray-500 truncate">{m.desc}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] font-bold text-amber-600">+{m.xp}XP</p>
                <p className="text-[8px] text-gray-400">+{m.coin}金币</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boss 挑战预览 */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Swords size={14} className="text-red-700" />
          <h3 className="text-sm font-bold font-serif text-gray-800">Boss 挑战</h3>
          <span className="text-[10px] text-gray-500">{bossDefeated}/{BOSSES.length}</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {BOSSES.map(boss => {
            const defeated = useTCMQuestStore.getState().bossDefeatedIds.includes(boss.id);
            return (
              <div key={boss.id} className={`shrink-0 w-20 text-center p-2 rounded-lg ${defeated ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                <span className="text-2xl block">{boss.icon}</span>
                <p className="text-[9px] font-bold text-gray-700 mt-0.5 truncate">{boss.name}</p>
                <p className="text-[8px] text-gray-400">HP {boss.hp}</p>
                {defeated && <Check size={10} className="mx-auto text-emerald-600" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* 科目入口 */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={14} className="text-purple-600" />
          <h3 className="text-sm font-bold font-serif text-gray-800">科目速览</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {QUIZ_TAGS.map(tag => {
            const answered = useTCMQuestStore.getState().perTagAnswered[tag] || 0;
            const total = QUIZ_DATA.filter(q => q.tag === tag).length;
            const color = TAG_COLORS[tag];
            return (
              <div key={tag} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50/50">
                <span className="text-base">{TAG_ICONS[tag]}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate" style={{ color }}>{tag}</p>
                  <p className="text-[8px] text-gray-400">{answered}/{total}题</p>
                </div>
                <div className="w-8 h-1 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Battle Tab — 闯关答题
// ═══════════════════════════════════════
function BattleTab() {
  const [selectedTag, setSelectedTag] = useState<QuizTag | 'all'>('all');
  const [selectedDiff, setSelectedDiff] = useState<string>('all');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [battleMode, setBattleMode] = useState(false);
  const [bossHp, setBossHp] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [currentBoss, setCurrentBoss] = useState<typeof BOSSES[0] | null>(null);
  const [combo, setCombo] = useState(0);
  const { answerQuiz, defeatBoss, addXp, addCoin } = useTCMQuestStore();

  // 题目筛选
  const filteredQuizzes = useMemo(() => {
    let qs = QUIZ_DATA;
    if (selectedTag !== 'all') qs = qs.filter(q => q.tag === selectedTag);
    if (selectedDiff !== 'all') qs = qs.filter(q => q.diff === selectedDiff);
    return qs;
  }, [selectedTag, selectedDiff]);

  const currentQuiz = filteredQuizzes[currentIdx];

  const handleAnswer = (optionIdx: number) => {
    if (showAnswer) return;
    setSelectedOption(optionIdx);
    setShowAnswer(true);
    const correct = optionIdx === currentQuiz.a;
    answerQuiz(currentQuiz.id, currentQuiz.tag, correct, currentQuiz.xp);

    if (battleMode && currentBoss) {
      if (correct) {
        const damage = 50 + combo * 10;
        const newHp = Math.max(0, bossHp - damage);
        setBossHp(newHp);
        setCombo(combo + 1);
        if (newHp === 0) {
          defeatBoss(currentBoss.id);
          addXp(currentBoss.rewardXp);
          addCoin(currentBoss.rewardCoin);
          setBattleMode(false);
          setCurrentBoss(null);
        }
      } else {
        setPlayerHp(Math.max(0, playerHp - currentBoss.atk));
        setCombo(0);
      }
    }
  };

  const nextQuiz = () => {
    setShowAnswer(false);
    setSelectedOption(null);
    setCurrentIdx(prev => (prev + 1) % filteredQuizzes.length);
  };

  const startBattle = (boss: typeof BOSSES[0]) => {
    setCurrentBoss(boss);
    setBossHp(boss.hp);
    setPlayerHp(100);
    setCombo(0);
    setBattleMode(true);
    setCurrentIdx(0);
  };

  // Boss 选择界面
  if (battleMode === false && currentBoss === null && selectedTag === 'all' && selectedDiff === 'all' && currentIdx === 0) {
    // 显示模式选择
  }

  return (
    <div className="space-y-3 pt-3">
      {/* 模式切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => { setBattleMode(false); setCurrentBoss(null); }}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${!battleMode ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-500'}`}
        >
          自由练习
        </button>
        <button
          onClick={() => setBattleMode(true)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${battleMode ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-500'}`}
        >
          Boss 挑战
        </button>
      </div>

      {/* Boss 选择 */}
      {battleMode && !currentBoss && (
        <div className="space-y-2">
          {BOSSES.map(boss => {
            const defeated = useTCMQuestStore.getState().bossDefeatedIds.includes(boss.id);
            return (
              <button
                key={boss.id}
                onClick={() => startBattle(boss)}
                disabled={defeated}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition ${defeated ? 'bg-emerald-50 opacity-60' : 'glass-card hover:shadow-md'}`}
              >
                <span className="text-3xl">{boss.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-800">{boss.name}</p>
                  <p className="text-[9px] text-gray-500">{boss.desc}</p>
                  <div className="flex gap-3 mt-1 text-[9px]">
                    <span className="text-red-600">HP {boss.hp}</span>
                    <span className="text-gray-500">ATK {boss.atk}</span>
                    <span className="text-amber-600">+{boss.rewardXp}XP</span>
                  </div>
                </div>
                {defeated ? <Check className="text-emerald-600" size={18} /> : <ChevronRight className="text-gray-400" size={16} />}
              </button>
            );
          })}
        </div>
      )}

      {/* Boss 战斗界面 */}
      {battleMode && currentBoss && currentQuiz && (
        <div className="space-y-3">
          {/* Boss 状态 */}
          <div className="glass-card p-3 rounded-xl bg-red-50/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{currentBoss.icon}</span>
                <div>
                  <p className="text-sm font-bold text-gray-800">{currentBoss.name}</p>
                  <p className="text-[9px] text-gray-500">连击 x{combo}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-gray-500">Boss HP</p>
                <p className="text-sm font-black text-red-600 tabular-nums">{bossHp}</p>
              </div>
            </div>
            <div className="h-2 bg-red-200/40 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-700 rounded-full transition-all duration-300" style={{ width: `${(bossHp / currentBoss.hp) * 100}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-500">我方</span>
              <div className="flex-1 h-2 bg-emerald-200/40 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-300" style={{ width: `${playerHp}%` }} />
              </div>
              <span className="text-[9px] font-bold text-emerald-600 tabular-nums">{playerHp}</span>
            </div>
          </div>

          <QuizCard quiz={currentQuiz} showAnswer={showAnswer} selectedOption={selectedOption} onAnswer={handleAnswer} onNext={nextQuiz} />
        </div>
      )}

      {/* 自由练习 */}
      {!battleMode && (
        <>
          {/* 筛选 */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
            <FilterChip label="全部" active={selectedTag === 'all'} onClick={() => { setSelectedTag('all'); setCurrentIdx(0); }} />
            {QUIZ_TAGS.map(t => (
              <FilterChip key={t} label={`${TAG_ICONS[t]}${t}`} active={selectedTag === t} onClick={() => { setSelectedTag(t); setCurrentIdx(0); }} />
            ))}
          </div>
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
            <FilterChip label="全难度" active={selectedDiff === 'all'} onClick={() => { setSelectedDiff('all'); setCurrentIdx(0); }} />
            {['初级', '中级', '高级', '专家'].map(d => (
              <FilterChip key={d} label={d} active={selectedDiff === d} onClick={() => { setSelectedDiff(d); setCurrentIdx(0); }} />
            ))}
          </div>

          {currentQuiz && (
            <QuizCard quiz={currentQuiz} showAnswer={showAnswer} selectedOption={selectedOption} onAnswer={handleAnswer} onNext={nextQuiz} />
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Quiz Card — 通用答题卡片
// ═══════════════════════════════════════
function QuizCard({ quiz, showAnswer, selectedOption, onAnswer, onNext }: {
  quiz: QuizItem;
  showAnswer: boolean;
  selectedOption: number | null;
  onAnswer: (idx: number) => void;
  onNext: () => void;
}) {
  const tagColor = TAG_COLORS[quiz.tag] || '#666';
  return (
    <div className="glass-card p-4 rounded-xl space-y-3">
      {/* 题目信息 */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] px-2 py-0.5 rounded-full text-white font-bold" style={{ background: tagColor }}>
          {TAG_ICONS[quiz.tag]} {quiz.tag}
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 font-bold">{quiz.diff}</span>
        <span className="text-[9px] text-amber-600 font-bold ml-auto">+{quiz.xp}XP</span>
      </div>

      {/* 题干 */}
      <p className="text-sm font-bold text-gray-800 leading-relaxed">{quiz.q}</p>

      {/* 选项 */}
      <div className="space-y-2">
        {quiz.o.map((opt, i) => {
          const isSelected = selectedOption === i;
          const isCorrect = i === quiz.a;
          let cls = 'border-gray-200 bg-white/50';
          if (showAnswer) {
            if (isCorrect) cls = 'border-emerald-400 bg-emerald-50';
            else if (isSelected) cls = 'border-red-400 bg-red-50';
            else cls = 'border-gray-200 bg-white/30 opacity-50';
          } else if (isSelected) {
            cls = 'border-amber-400 bg-amber-50';
          }
          return (
            <button
              key={i}
              onClick={() => onAnswer(i)}
              disabled={showAnswer}
              className={`w-full text-left p-3 rounded-xl border-2 transition text-sm ${cls}`}
            >
              <span className="font-bold mr-2 text-xs">{String.fromCharCode(65 + i)}.</span>
              {opt}
              {showAnswer && isCorrect && <Check size={14} className="inline ml-2 text-emerald-600" />}
              {showAnswer && isSelected && !isCorrect && <X size={14} className="inline ml-2 text-red-500" />}
            </button>
          );
        })}
      </div>

      {/* 解析 */}
      {showAnswer && (
        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/40">
          <p className="text-xs text-gray-700 leading-relaxed">
            <span className="font-bold text-amber-700">解析：</span>{quiz.e}
          </p>
          {/* Evo 反馈按钮 */}
          <div className="mt-2 pt-2 border-t border-amber-200/30">
            <EvoFeedback module="classics" action="quiz_explanation" detail={{ questionId: quiz.q, tag: quiz.t }} />
          </div>
        </div>
      )}

      {/* 下一题 */}
      {showAnswer && (
        <button
          onClick={onNext}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white text-sm font-bold"
        >
          下一题 →
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Herb Tab — 中药卡片
// ═══════════════════════════════════════
function HerbTab() {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [currentIdx, setCurrentIdx] = useState(0);
  const { viewHerb } = useTCMQuestStore();

  const cats = useMemo(() => {
    const set = new Set(HERB_DATA.map(h => h.cat));
    return ['all', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    let hs = HERB_DATA;
    if (selectedCat !== 'all') hs = hs.filter(h => h.cat === selectedCat);
    if (search) hs = hs.filter(h => h.name.includes(search) || h.effect.includes(search));
    return hs;
  }, [selectedCat, search]);

  const herb = filtered[currentIdx];

  // 浏览记录
  useMemo(() => {
    if (herb) viewHerb(herb.name);
  }, [herb?.name]);

  return (
    <div className="space-y-3 pt-3">
      {/* 搜索 */}
      <input
        type="text"
        value={search}
        onChange={e => { setSearch(e.target.value); setCurrentIdx(0); }}
        placeholder="搜索中药名/功效..."
        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white/60 text-sm focus:border-amber-400 focus:outline-none"
      />

      {/* 分类筛选 */}
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        {cats.map(c => (
          <FilterChip key={c} label={c === 'all' ? '全部' : c} active={selectedCat === c} onClick={() => { setSelectedCat(c); setCurrentIdx(0); }} />
        ))}
      </div>

      {/* 卡片计数 */}
      <p className="text-[10px] text-gray-500 text-center">
        {filtered.length > 0 ? `${currentIdx + 1} / ${filtered.length}` : '无匹配结果'}
      </p>

      {/* 中药卡片 */}
      {herb && <HerbCard herb={herb} />}

      {/* 导航 */}
      {filtered.length > 1 && (
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentIdx(prev => (prev - 1 + filtered.length) % filtered.length)}
            className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold"
          >
            ← 上一味
          </button>
          <button
            onClick={() => setCurrentIdx(prev => (prev + 1) % filtered.length)}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold"
          >
            下一味 →
          </button>
        </div>
      )}
    </div>
  );
}

function HerbCard({ herb }: { herb: HerbItem }) {
  const catColors: Record<string, string> = { '解表': '#1e5f8a', '清热': '#b5311c', '补虚': '#c9922a', '活血': '#5e2d91', '化痰': '#1e5f8a' };
  const color = catColors[herb.cat] || '#7a5c48';
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      {/* 头部 */}
      <div className="p-4 text-white" style={{ background: `linear-gradient(135deg, ${color}dd, ${color}99)` }}>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-serif">{herb.name}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">{herb.cat}</span>
        </div>
        <p className="text-[10px] opacity-80 mt-1">{herb.poem}</p>
      </div>

      {/* 详情 */}
      <div className="p-4 space-y-2.5">
        <InfoRow label="性味" value={`${herb.temp} · ${herb.taste}`} color={color} />
        <InfoRow label="归经" value={herb.channel} />
        <InfoRow label="功效" value={herb.effect} />
        <InfoRow label="主治" value={herb.use} />
        <InfoRow label="禁忌" value={herb.caution} color="#b5311c" />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Formula Tab — 方剂卡片
// ═══════════════════════════════════════
function FormulaTab() {
  const [search, setSearch] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const { viewFormula } = useTCMQuestStore();

  const filtered = useMemo(() => {
    if (!search) return FORMULA_DATA;
    return FORMULA_DATA.filter(f => f.name.includes(search) || f.func.includes(search));
  }, [search]);

  const formula = filtered[currentIdx];

  useMemo(() => {
    if (formula) viewFormula(formula.name);
  }, [formula?.name]);

  return (
    <div className="space-y-3 pt-3">
      <input
        type="text"
        value={search}
        onChange={e => { setSearch(e.target.value); setCurrentIdx(0); }}
        placeholder="搜索方剂名/功效..."
        className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white/60 text-sm focus:border-amber-400 focus:outline-none"
      />
      <p className="text-[10px] text-gray-500 text-center">
        {filtered.length > 0 ? `${currentIdx + 1} / ${filtered.length}` : '无匹配结果'}
      </p>
      {formula && <FormulaCard formula={formula} />}
      {filtered.length > 1 && (
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentIdx(prev => (prev - 1 + filtered.length) % filtered.length)}
            className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-600 text-xs font-bold"
          >
            ← 上一首
          </button>
          <button
            onClick={() => setCurrentIdx(prev => (prev + 1) % filtered.length)}
            className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-red-600 text-white text-xs font-bold"
          >
            下一首 →
          </button>
        </div>
      )}
    </div>
  );
}

function FormulaCard({ formula }: { formula: FormulaItem }) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="p-4 text-white bg-gradient-to-br from-amber-700 to-red-800">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold font-serif">{formula.name}</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">{formula.cat}</span>
        </div>
        <p className="text-[10px] opacity-80 mt-1">{formula.mem}</p>
      </div>
      <div className="p-4 space-y-2.5">
        <InfoRow label="组成" value={formula.comp} />
        <InfoRow label="功效" value={formula.func} color="#c9922a" />
        <InfoRow label="主治" value={formula.ind} />
        <InfoRow label="备注" value={formula.note} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// Cases Tab — 医案辨证
// ═══════════════════════════════════════
function CasesTab() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [filterDiff, setFilterDiff] = useState<string>('all');
  const { solveCase } = useTCMQuestStore();

  const filtered = useMemo(() => {
    if (filterDiff === 'all') return CASE_DATA;
    return CASE_DATA.filter(c => c.diff === filterDiff);
  }, [filterDiff]);

  const caseItem = filtered[currentIdx];

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelectedOpt(idx);
    setShowResult(true);
    const correct = idx === caseItem.a;
    solveCase(currentIdx, correct);
  };

  const nextCase = () => {
    setShowResult(false);
    setSelectedOpt(null);
    setCurrentIdx(prev => (prev + 1) % filtered.length);
  };

  return (
    <div className="space-y-3 pt-3">
      <div className="flex gap-1 overflow-x-auto no-scrollbar pb-1">
        <FilterChip label="全部" active={filterDiff === 'all'} onClick={() => { setFilterDiff('all'); setCurrentIdx(0); }} />
        {['初级', '中级', '高级'].map(d => (
          <FilterChip key={d} label={d} active={filterDiff === d} onClick={() => { setFilterDiff(d); setCurrentIdx(0); }} />
        ))}
      </div>

      <p className="text-[10px] text-gray-500 text-center">
        {filtered.length > 0 ? `${currentIdx + 1} / ${filtered.length}` : '无匹配结果'}
      </p>

      {caseItem && (
        <div className="glass-card p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-bold">{caseItem.diff}</span>
            <h3 className="text-sm font-bold font-serif text-gray-800">{caseItem.title}</h3>
          </div>

          {/* 病例描述 */}
          <p className="text-sm text-gray-700 leading-relaxed p-3 rounded-xl bg-gray-50/60">{caseItem.text}</p>

          {/* 症状标签 */}
          <div className="flex flex-wrap gap-1">
            {caseItem.syms.map((s, i) => (
              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-red-50 text-red-700">{s}</span>
            ))}
          </div>

          {/* 辨证选项 */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-600">请辨证：</p>
            {caseItem.opts.map((opt, i) => {
              const isSelected = selectedOpt === i;
              const isCorrect = i === caseItem.a;
              let cls = 'border-gray-200 bg-white/50';
              if (showResult) {
                if (isCorrect) cls = 'border-emerald-400 bg-emerald-50';
                else if (isSelected) cls = 'border-red-400 bg-red-50';
                else cls = 'border-gray-200 bg-white/30 opacity-50';
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={showResult}
                  className={`w-full text-left p-3 rounded-xl border-2 transition text-sm ${cls}`}
                >
                  {opt}
                  {showResult && isCorrect && <Check size={14} className="inline ml-2 text-emerald-600" />}
                  {showResult && isSelected && !isCorrect && <X size={14} className="inline ml-2 text-red-500" />}
                </button>
              );
            })}
          </div>

          {/* 解析 */}
          {showResult && (
            <>
              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/40">
                <p className="text-xs text-gray-700 leading-relaxed">
                  <span className="font-bold text-amber-700">解析：</span>{caseItem.e}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-purple-50/40">
                <p className="text-[10px] font-bold text-purple-700 mb-1">学习要点：</p>
                <ul className="space-y-1">
                  {caseItem.points.map((p, i) => (
                    <li key={i} className="text-[10px] text-gray-600 flex items-start gap-1">
                      <Star size={10} className="text-amber-500 mt-0.5 shrink-0" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={nextCase}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold"
              >
                下一个医案 →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// AI Tab — AI 辨证训练
// ═══════════════════════════════════════
function AITab() {
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { incrementAiDx } = useTCMQuestStore();

  const analyze = () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    // 本地模拟 AI 辨证（不依赖外部 API）
    setTimeout(() => {
      const analysis = generateLocalDiagnosis(symptoms);
      setResult(analysis);
      incrementAiDx();
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-3 pt-3">
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-600" />
          <h3 className="text-sm font-bold font-serif text-gray-800">AI 辨证训练</h3>
        </div>
        <p className="text-[10px] text-gray-500 mb-3">
          输入患者症状描述，AI 将给出辨证分析、治法和参考方剂。这是训练辨证思维的好工具。
        </p>
        <textarea
          value={symptoms}
          onChange={e => setSymptoms(e.target.value)}
          placeholder="例：患者女，35岁。面色萎黄，神疲乏力，气短懒言，食少便溏，舌淡苔薄白，脉缓弱..."
          className="w-full h-24 p-3 rounded-xl border border-gray-200 bg-white/60 text-sm resize-none focus:border-purple-400 focus:outline-none"
        />
        <button
          onClick={analyze}
          disabled={loading || !symptoms.trim()}
          className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-bold disabled:opacity-50"
        >
          {loading ? '辨证分析中...' : '开始辨证 →'}
        </button>
      </div>

      {result && (
        <div className="glass-card p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-purple-600" />
            <h4 className="text-sm font-bold text-gray-800">辨证结果</h4>
          </div>
          <div className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{result}</div>
          {/* Evo 反馈按钮 */}
          <div className="pt-2 border-t border-gray-100">
            <EvoFeedback module="diagnose" action="ai_diagnosis" detail={{ symptoms: symptoms.slice(0, 50) }} />
          </div>
        </div>
      )}

      {/* 辨证知识点 */}
      <div className="glass-card p-4 rounded-xl">
        <h4 className="text-xs font-bold text-gray-700 mb-2">辨证方法速查</h4>
        <div className="space-y-1.5">
          {[
            { name: '八纲辨证', desc: '阴阳·表里·寒热·虚实' },
            { name: '脏腑辨证', desc: '五脏六腑功能失调' },
            { name: '气血津液辨证', desc: '气虚血瘀·津伤液耗' },
            { name: '六经辨证', desc: '太阳→阳明→少阳→太阴→少阴→厥阴' },
            { name: '卫气营血辨证', desc: '卫分→气分→营分→血分' },
            { name: '三焦辨证', desc: '上焦·中焦·下焦' },
          ].map(m => (
            <div key={m.name} className="flex items-center gap-2 p-2 rounded-lg bg-purple-50/40">
              <span className="text-xs font-bold text-purple-700">{m.name}</span>
              <span className="text-[10px] text-gray-500 flex-1">{m.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// 本地辨证模拟
function generateLocalDiagnosis(text: string): string {
  const t = text.toLowerCase();
  const rules: { keys: string[]; pattern: string; tx: string; formula: string }[] = [
    { keys: ['乏力', '气短', '懒言', '脉弱'], pattern: '气虚证', tx: '补气健脾', formula: '四君子汤 / 补中益气汤' },
    { keys: ['面色萎黄', '头晕', '心悸', '月经少'], pattern: '血虚证', tx: '补血养血', formula: '四物汤 / 归脾汤' },
    { keys: ['阴虚', '盗汗', '五心烦热', '舌红少苔'], pattern: '阴虚证', tx: '滋阴清热', formula: '六味地黄丸 / 左归丸' },
    { keys: ['畏寒', '肢冷', '腰膝酸软', '脉沉'], pattern: '阳虚证', tx: '温阳补肾', formula: '金匮肾气丸 / 右归丸' },
    { keys: ['胸胁胀痛', '太息', '情志', '脉弦'], pattern: '肝气郁结', tx: '疏肝解郁', formula: '逍遥散 / 柴胡疏肝散' },
    { keys: ['发热', '口渴', '舌红', '苔黄'], pattern: '实热证', tx: '清热泻火', formula: '白虎汤 / 黄连解毒汤' },
    { keys: ['瘀', '紫', '刺痛', '固定'], pattern: '血瘀证', tx: '活血化瘀', formula: '桃红四物汤 / 血府逐瘀汤' },
    { keys: ['痰', '苔腻', '脉滑'], pattern: '痰湿证', tx: '化痰祛湿', formula: '二陈汤 / 平胃散' },
    { keys: ['湿', '苔白腻', '脘痞'], pattern: '湿阻证', tx: '化湿健脾', formula: '藿香正气散 / 平胃散' },
    { keys: ['风', '感冒', '恶寒', '脉浮'], pattern: '外感表证', tx: '解表散邪', formula: '桂枝汤 / 银翘散' },
  ];

  const matches = rules.filter(r => r.keys.some(k => t.includes(k)));
  if (matches.length === 0) {
    return `根据您输入的症状描述，建议从以下角度分析：

1. 八纲辨证：判断阴阳·表里·寒热·虚实
2. 脏腑辨证：定位病变脏腑
3. 病因辨证：分析外感/内伤/病理产物

请尝试输入更详细的症状信息，如舌象、脉象、伴随症状等，以获得更准确的辨证结果。`;
  }

  let result = '根据症状分析，可能的辨证如下：\n\n';
  matches.forEach((m, i) => {
    result += `${i + 1}. ${m.pattern}\n   治法：${m.tx}\n   参考方剂：${m.formula}\n\n`;
  });
  result += '注意：以上为 AI 辅助分析，临床需结合四诊合参，由专业医师最终判断。';
  return result;
}

// ═══════════════════════════════════════
// Review Tab — 间隔复习 (SM-2)
// ═══════════════════════════════════════
function ReviewTab() {
  const { wrongAnswers, srData, reviewCount, gradeSR } = useTCMQuestStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // 待复习的题目（错题 + 到期的间隔重复题目）
  const dueReviews = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const dueIds = Object.values(srData).filter(sr => sr.nextDate <= today).map(sr => sr.quizId);
    const allIds = [...new Set([...wrongAnswers, ...dueIds])];
    return allIds.map(id => QUIZ_DATA.find(q => q.id === id)).filter(Boolean) as QuizItem[];
  }, [wrongAnswers, srData]);

  const currentQuiz = dueReviews[currentIdx];

  const handleGrade = (grade: 0 | 1 | 2 | 3) => {
    if (currentQuiz) {
      gradeSR(currentQuiz.id, grade);
      setShowAnswer(false);
      setCurrentIdx(prev => (prev + 1) % Math.max(dueReviews.length, 1));
    }
  };

  return (
    <div className="space-y-3 pt-3">
      {/* 复习统计 */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <RotateCw size={14} className="text-blue-600" />
          <h3 className="text-sm font-bold font-serif text-gray-800">间隔复习</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-lg font-black text-red-600">{wrongAnswers.length}</p>
            <p className="text-[9px] text-gray-500">错题</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-blue-600">{dueReviews.length}</p>
            <p className="text-[9px] text-gray-500">待复习</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-emerald-600">{reviewCount}</p>
            <p className="text-[9px] text-gray-500">已复习</p>
          </div>
        </div>
      </div>

      {/* 复习卡片 */}
      {currentQuiz ? (
        <div className="space-y-3">
          <QuizCard quiz={currentQuiz} showAnswer={showAnswer} selectedOption={null} onAnswer={() => setShowAnswer(true)} onNext={() => {}} />

          {showAnswer && (
            <div className="glass-card p-3 rounded-xl">
              <p className="text-[10px] text-gray-500 text-center mb-2">你的掌握程度如何？</p>
              <div className="grid grid-cols-4 gap-2">
                <button onClick={() => handleGrade(0)} className="py-2.5 rounded-xl bg-red-100 text-red-700 text-xs font-bold">不会</button>
                <button onClick={() => handleGrade(1)} className="py-2.5 rounded-xl bg-orange-100 text-orange-700 text-xs font-bold">困难</button>
                <button onClick={() => handleGrade(2)} className="py-2.5 rounded-xl bg-amber-100 text-amber-700 text-xs font-bold">一般</button>
                <button onClick={() => handleGrade(3)} className="py-2.5 rounded-xl bg-emerald-100 text-emerald-700 text-xs font-bold">简单</button>
              </div>
              <p className="text-[8px] text-gray-400 text-center mt-2">系统会根据你的评分自动安排下次复习时间</p>
            </div>
          )}
          {!showAnswer && (
            <button
              onClick={() => setShowAnswer(true)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold"
            >
              查看答案
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card p-8 rounded-xl text-center">
          <Check size={32} className="mx-auto text-emerald-500 mb-2" />
          <p className="text-sm font-bold text-gray-700">暂无待复习内容</p>
          <p className="text-[10px] text-gray-500 mt-1">继续闯关答题，错题会自动加入复习队列</p>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Me Tab — 我的中心
// ═══════════════════════════════════════
function MeTab() {
  const {
    xp, coin, level, levelTitle, streak, totalAnswered, totalCorrect,
    herbsViewed, formulasViewed, casesSolved, bossDefeated,
    missionsCompleted, achievementsUnlocked, aiDxCount, reviewCount, wrongAnswers,
  } = useTCMQuestStore();

  const progress = getLevelProgress(xp);

  // 排行榜（用户 + AI）
  const leaderboard = useMemo(() => {
    const userEntry = { name: '我', level, xp, coin, streak, title: levelTitle };
    const all = [...AI_LEADERBOARD, userEntry];
    all.sort((a, b) => b.xp - a.xp);
    return all;
  }, [xp, level, coin, streak, levelTitle]);

  const myRank = leaderboard.findIndex(e => e.name === '我') + 1;

  // 检查成就解锁
  const checkCondition = (cond: string): boolean => {
    const s = useTCMQuestStore.getState();
    const evalStr = cond
      .replace(/totalAnswered/g, String(s.totalAnswered))
      .replace(/totalCorrect/g, String(s.totalCorrect))
      .replace(/herbsViewed\.length/g, String(s.herbsViewed.length))
      .replace(/formulasViewed\.length/g, String(s.formulasViewed.length))
      .replace(/casesSolved/g, String(s.casesSolved))
      .replace(/bossDefeated/g, String(s.bossDefeated))
      .replace(/streak/g, String(s.streak))
      .replace(/reviewCount/g, String(s.reviewCount))
      .replace(/aiDxCount/g, String(s.aiDxCount))
      .replace(/missionsCompleted\.length/g, String(s.missionsCompleted.length))
      .replace(/level/g, String(s.level))
      .replace(/perfectStreak/g, String(s.perfectStreak));
    try { return eval(evalStr) as boolean; } catch { return false; }
  };

  return (
    <div className="space-y-4 pt-3">
      {/* 个人卡片 */}
      <div className="glass-card p-4 rounded-xl text-center">
        <div className="text-4xl mb-1">{progress.level.icon}</div>
        <h3 className="text-base font-bold font-serif text-gray-800">Lv.{level} {levelTitle}</h3>
        <div className="h-2 bg-amber-200/40 rounded-full overflow-hidden mx-auto max-w-[200px] mt-2">
          <div className="h-full bg-gradient-to-r from-amber-500 to-red-600 rounded-full transition-all" style={{ width: `${progress.percent}%` }} />
        </div>
        <p className="text-[10px] text-gray-500 mt-1">{progress.current}/{progress.needed} XP</p>
      </div>

      {/* 统计网格 */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: '答对', value: totalCorrect, icon: Check, color: '#1f7a4a' },
          { label: '连续', value: `${streak}天`, icon: Flame, color: '#b5311c' },
          { label: '金币', value: coin, icon: Coins, color: '#c9922a' },
          { label: '中药', value: herbsViewed.length, icon: Leaf, color: '#1f7a4a' },
          { label: '方剂', value: formulasViewed.length, icon: Scroll, color: '#c9922a' },
          { label: '医案', value: casesSolved, icon: Brain, color: '#5e2d91' },
          { label: 'Boss', value: bossDefeated, icon: Swords, color: '#b5311c' },
          { label: '复习', value: reviewCount, icon: RotateCw, color: '#1e5f8a' },
          { label: 'AI', value: aiDxCount, icon: Sparkles, color: '#5e2d91' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card p-2 text-center rounded-xl">
              <Icon size={14} className="mx-auto mb-0.5" style={{ color: s.color }} />
              <p className="text-sm font-black tabular-nums" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[8px] text-gray-500">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* 排行榜 */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Trophy size={14} className="text-amber-600" />
          <h3 className="text-sm font-bold font-serif text-gray-800">排行榜</h3>
          <span className="text-[10px] text-gray-500 ml-auto">我 #{myRank}</span>
        </div>
        <div className="space-y-1.5">
          {leaderboard.slice(0, 8).map((item, i) => {
            const isMe = item.name === '我';
            return (
              <div key={i} className={`flex items-center gap-2 p-2 rounded-lg ${isMe ? 'bg-amber-100/60 ring-1 ring-amber-400/30' : ''}`}>
                <span className={`text-xs font-bold w-6 text-center ${i === 0 ? 'text-amber-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-600' : 'text-gray-400'}`}>
                  {i + 1}
                </span>
                <span className="text-sm font-bold text-gray-700">{item.name}</span>
                <span className="text-[9px] text-gray-400">Lv.{item.level}</span>
                <span className="text-[9px] text-gray-500 ml-auto">{item.xp.toLocaleString()} XP</span>
                {isMe && <span className="text-[8px] text-amber-600 font-bold">← 我</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* 成就 */}
      <div className="glass-card p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Award size={14} className="text-purple-600" />
          <h3 className="text-sm font-bold font-serif text-gray-800">成就</h3>
          <span className="text-[10px] text-gray-500 ml-auto">{achievementsUnlocked.length}/{ACHIEVEMENTS.length}</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map(a => {
            const unlocked = checkCondition(a.condition);
            const tierColors: Record<string, string> = {
              bronze: '#cd7f32', silver: '#c0c0c0', gold: '#ffd700', platinum: '#e5e4e2',
            };
            return (
              <div key={a.id} className={`text-center p-2 rounded-lg ${unlocked ? 'bg-amber-50' : 'bg-gray-50 opacity-40'}`}>
                <span className="text-lg block">{unlocked ? a.icon : '🔒'}</span>
                <p className="text-[7px] text-gray-600 mt-0.5 leading-tight">{a.name}</p>
                {unlocked && <div className="w-1.5 h-1.5 rounded-full mx-auto mt-0.5" style={{ background: tierColors[a.tier] }} />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// 通用组件
// ═══════════════════════════════════════
function FilterChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
        active ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {label}
    </button>
  );
}

function InfoRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-xs font-bold text-gray-500 shrink-0 w-12">{label}</span>
      <span className="text-xs text-gray-700 leading-relaxed flex-1" style={color ? { color } : undefined}>{value}</span>
    </div>
  );
}
