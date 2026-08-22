'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import {
  TCM_LEVELS, TCM_ZONES, TCM_CHAPTERS, TCM_BOSSES, TCM_ACHIEVEMENTS, TCM_DAILY_TIPS,
  type TcmChapter, type TcmBoss, type TcmQuizQuestion, type TcmSection, type TcmElement, type TcmZone,
} from '@/lib/tcm-master-data';
import { useCultivationStore } from '@/lib/cultivation-store';
import { ELEMENT_COLORS, ELEMENT_NAMES } from '@/lib/cultivation-engine';
import {
  ArrowLeft, ArrowRight, BookOpen, ChevronRight, Check, Award, Flame, Calendar,
  Sparkles, Lock, Swords, Trophy, User, Heart, Gem, Zap, Star, ChevronLeft,
  Map as MapIcon, Target, Shield, X, CircleDot, BookMarked,
} from 'lucide-react';

// ═══════════════════════════════════════
// 进度管理（localStorage 持久化）
// ═══════════════════════════════════════

interface GameProgress {
  xp: number;
  completedChapters: string[];
  quizPerfectCount: number;
  quizScores: Record<string, number>; // chapterId → correct count
  bossDefeated: string[];
  unlockedAchievements: string[];
  dailyCheckIn: string[];
  streak: number;
  lastCheckIn: string;
  viewedTips: number[];
  lastTipDate: string;
}

const STORAGE_KEY = 'tcm-master-progress';

function loadProgress(): GameProgress {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) { const p = JSON.parse(raw); return { ...defaultProgress(), ...p }; }
  } catch { /* ignore */ }
  return defaultProgress();
}

function defaultProgress(): GameProgress {
  return {
    xp: 0, completedChapters: [], quizPerfectCount: 0, quizScores: {},
    bossDefeated: [], unlockedAchievements: [], dailyCheckIn: [],
    streak: 0, lastCheckIn: '', viewedTips: [], lastTipDate: '',
  };
}

function saveProgress(p: GameProgress) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

// ═══════════════════════════════════════
// 等级计算
// ═══════════════════════════════════════

function getLevel(xp: number): { lv: number; title: string; nextXp: number; progress: number } {
  let lv = 1, title = TCM_LEVELS[0].title;
  for (let i = TCM_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= TCM_LEVELS[i].xpRequired) {
      lv = TCM_LEVELS[i].lv;
      title = TCM_LEVELS[i].title;
      break;
    }
  }
  const curThreshold = TCM_LEVELS[lv - 1].xpRequired;
  const nextThreshold = lv < TCM_LEVELS.length ? TCM_LEVELS[lv].xpRequired : TCM_LEVELS[lv - 1].xpRequired;
  const progress = lv < TCM_LEVELS.length
    ? Math.round(((xp - curThreshold) / (nextThreshold - curThreshold)) * 100)
    : 100;
  return { lv, title, nextXp: nextThreshold, progress: Math.min(100, Math.max(0, progress)) };
}

// ═══════════════════════════════════════
// 文本渲染（简易 Markdown: **bold** → <strong>）
// ═══════════════════════════════════════

function renderText(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    // Handle bullet lines (starting with •)
    if (part.includes('\n')) {
      const lines = part.split('\n');
      return lines.map((line, j) => (
        <span key={`${i}-${j}`}>{line}{j < lines.length - 1 && <br />}</span>
      ));
    }
    return part;
  });
}

// ═══════════════════════════════════════
// Section 渲染器
// ═══════════════════════════════════════

function SectionRenderer({ section }: { section: TcmSection }) {
  return (
    <div className="tcm-section">
      {section.heading && <h3 className="tcm-sec-heading">{section.heading}</h3>}
      {section.text && <div className="tcm-sec-text">{renderText(section.text)}</div>}
      {section.list && (
        <ul className="tcm-sec-list">
          {section.list.map((item, i) => <li key={i}>{renderText(item)}</li>)}
        </ul>
      )}
      {section.cards && (
        <div className="tcm-sec-cards">
          {section.cards.map((card, i) => (
            <div key={i} className="tcm-card-item">
              <span className="tcm-card-icon">{card.icon}</span>
              <div>
                <div className="tcm-card-name">{card.name}</div>
                <div className="tcm-card-desc">{card.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}
      {section.table && (
        <div className="tcm-sec-table-wrap">
          <table className="tcm-sec-table">
            <thead>
              <tr>{section.table.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// 主组件
// ═══════════════════════════════════════

type View = 'map' | 'zone' | 'chapter' | 'quiz' | 'boss' | 'boss-fight' | 'achievements' | 'profile';
type Tab = 'map' | 'achievements' | 'profile';

export default function TcmStudyPage() {
  const [progress, setProgress] = useState<GameProgress>(loadProgress);
  const [view, setView] = useState<View>('map');
  const [tab, setTab] = useState<Tab>('map');
  const [activeZoneId, setActiveZoneId] = useState<string>('');
  const [activeChapterId, setActiveChapterId] = useState<string>('');
  const [activeBossId, setActiveBossId] = useState<string>('');
  const [showTip, setShowTip] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { addXiuWei, recordPractice, completeTodayStep } = useCultivationStore();

  // 进度持久化
  useEffect(() => { saveProgress(progress); }, [progress]);
  useEffect(() => { setMounted(true); }, []);

  // 每日一识
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (progress.lastTipDate !== today) setShowTip(true);
  }, []);

  const levelInfo = useMemo(() => getLevel(progress.xp), [progress.xp]);

  // ── Zone / Chapter 查找 ──
  const activeZone = useMemo(() => TCM_ZONES.find(z => z.id === activeZoneId) || null, [activeZoneId]);
  const activeChapter = useMemo(() => TCM_CHAPTERS[activeChapterId] || null, [activeChapterId]);
  const activeBoss = useMemo(() => TCM_BOSSES.find(b => b.id === activeBossId) || null, [activeBossId]);

  // ── Zone 解锁判断 ──
  const isZoneUnlocked = useCallback((zone: TcmZone) => levelInfo.lv >= zone.levelRequired, [levelInfo.lv]);

  // ── 章节完成判断 ──
  const isChapterDone = useCallback((chId: string) => progress.completedChapters.includes(chId), [progress]);

  // ── Zone 完成度 ──
  const getZoneProgress = useCallback((zone: TcmZone) => {
    const done = zone.chapters.filter(id => progress.completedChapters.includes(id)).length;
    return { done, total: zone.chapters.length, pct: zone.chapters.length ? Math.round((done / zone.chapters.length) * 100) : 0 };
  }, [progress]);

  // ── 每日打卡 ──
  const handleCheckIn = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);
    if (progress.dailyCheckIn.includes(today)) return;
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const newStreak = progress.lastCheckIn === yesterday ? progress.streak + 1 : 1;
    setProgress(prev => ({
      ...prev,
      dailyCheckIn: [...prev.dailyCheckIn, today],
      streak: newStreak,
      lastCheckIn: today,
      xp: prev.xp + 5,
    }));
    addXiuWei('earth', 1);
    recordPractice('tcm-study-checkin', 60, 'earth', 1);
    completeTodayStep('tcm-study');
  }, [progress, addXiuWei, recordPractice, completeTodayStep]);

  // ── 章节完成 ──
  const completeChapter = useCallback((chapter: TcmChapter, correctCount: number) => {
    const isPerfect = correctCount === chapter.quiz.length;
    const wasAlreadyDone = progress.completedChapters.includes(chapter.id);

    setProgress(prev => {
      const newCompleted = wasAlreadyDone ? prev.completedChapters : [...prev.completedChapters, chapter.id];
      const newQuizScores = { ...prev.quizScores, [chapter.id]: Math.max(prev.quizScores[chapter.id] || 0, correctCount) };
      const newPerfect = isPerfect && !wasAlreadyDone ? prev.quizPerfectCount + 1 : prev.quizPerfectCount;
      const newXp = wasAlreadyDone ? prev.xp : prev.xp + chapter.xpReward;

      return {
        ...prev,
        completedChapters: newCompleted,
        quizScores: newQuizScores,
        quizPerfectCount: newPerfect,
        xp: newXp,
      };
    });

    // 修为联动
    if (!wasAlreadyDone) {
      const el = chapter.element;
      addXiuWei(el, Math.ceil(chapter.xpReward / 10));
      recordPractice('tcm-study', 180, el, Math.ceil(chapter.xpReward / 10));
      completeTodayStep('tcm-study');
    }
    if (isPerfect && !wasAlreadyDone) {
      addXiuWei(chapter.element, 2);
    }
  }, [progress, addXiuWei, recordPractice, completeTodayStep]);

  // ── Boss 击败 ──
  const defeatBoss = useCallback((boss: TcmBoss) => {
    const wasDefeated = progress.bossDefeated.includes(boss.id);
    setProgress(prev => ({
      ...prev,
      bossDefeated: wasDefeated ? prev.bossDefeated : [...prev.bossDefeated, boss.id],
      xp: wasDefeated ? prev.xp : prev.xp + boss.reward.xp,
      unlockedAchievements: wasDefeated || !boss.reward.achievement
        ? prev.unlockedAchievements
        : prev.unlockedAchievements.includes(boss.reward.achievement)
          ? prev.unlockedAchievements
          : [...prev.unlockedAchievements, boss.reward.achievement],
    }));

    if (!wasDefeated) {
      addXiuWei(boss.element, Math.ceil(boss.reward.xp / 20));
      recordPractice('tcm-study-boss', 300, boss.element, Math.ceil(boss.reward.xp / 20));
      completeTodayStep('tcm-study');
    }
  }, [progress, addXiuWei, recordPractice, completeTodayStep]);

  // ── 成就检查 ──
  useEffect(() => {
    if (!mounted) return;
    const newAchievements: string[] = [];
    const check = (id: string, cond: boolean) => {
      if (cond && !progress.unlockedAchievements.includes(id) && !newAchievements.includes(id)) {
        newAchievements.push(id);
      }
    };

    check('first-step', progress.completedChapters.length >= 1);
    check('first-quiz', Object.keys(progress.quizScores).length >= 1);
    check('daily-habit', progress.streak >= 3);
    check('daily-habit-7', progress.streak >= 7);
    check('daily-habit-30', progress.streak >= 30);
    check('quiz-master-10', progress.quizPerfectCount >= 10);
    check('quiz-master-30', progress.quizPerfectCount >= 30);

    // Zone completions
    TCM_ZONES.forEach(zone => {
      const prog = getZoneProgress(zone);
      const allDone = prog.done === prog.total && prog.total > 0;
      if (allDone) {
        if (zone.id === 'yinyang') check('zone-yinyang', true);
        if (zone.id === 'wuxing') check('zone-wuxing', true);
        if (zone.id === 'zangfu') check('zone-zangfu', true);
        if (zone.id === 'jingluoI' || zone.id === 'jingluoII') {
          const jl1 = TCM_ZONES.find(z => z.id === 'jingluoI')!;
          const jl2 = TCM_ZONES.find(z => z.id === 'jingluoII')!;
          const allJl = [...jl1.chapters, ...jl2.chapters].every(id => progress.completedChapters.includes(id));
          check('zone-jingluo', allJl);
        }
        if (zone.id === 'diagnosis') check('zone-diagnosis', true);
        if (zone.id === 'zhongyao') check('zone-zhongyao', true);
        if (zone.id === 'fangjI' || zone.id === 'fangjII') {
          const f1 = TCM_ZONES.find(z => z.id === 'fangjI')!;
          const f2 = TCM_ZONES.find(z => z.id === 'fangjII')!;
          const allF = [...f1.chapters, ...f2.chapters].every(id => progress.completedChapters.includes(id));
          check('zone-fangji', allF);
        }
        if (zone.id === 'zhenjiu') check('zone-zhenjiu', true);
        if (zone.id === 'yangsheng') check('zone-yangsheng', true);
      }
    });

    // Boss achievements (already handled on defeat, but double check)
    progress.bossDefeated.forEach(bid => {
      const boss = TCM_BOSSES.find(b => b.id === bid);
      if (boss?.reward.achievement) check(boss.reward.achievement, true);
    });

    check('all-bosses', progress.bossDefeated.length === TCM_BOSSES.length);
    check('all-chapters', progress.completedChapters.length === Object.keys(TCM_CHAPTERS).length);
    check('all-zones', TCM_ZONES.every(z => getZoneProgress(z).done === z.chapters.length));
    check('lv20', levelInfo.lv >= 20);

    // all-achievements: all others unlocked
    const otherAchIds = TCM_ACHIEVEMENTS.filter(a => a.id !== 'all-achievements').map(a => a.id);
    const allOthers = otherAchIds.every(id => progress.unlockedAchievements.includes(id) || newAchievements.includes(id));
    check('all-achievements', allOthers);

    if (newAchievements.length > 0) {
      setProgress(prev => ({
        ...prev,
        unlockedAchievements: [...prev.unlockedAchievements, ...newAchievements],
      }));
    }
  }, [progress.completedChapters, progress.quizScores, progress.quizPerfectCount,
      progress.bossDefeated, progress.unlockedAchievements, progress.streak,
      levelInfo.lv, mounted, getZoneProgress]);

  // ── 导航 ──
  const goZone = (zoneId: string) => { setActiveZoneId(zoneId); setView('zone'); };
  const goChapter = (chId: string) => { setActiveChapterId(chId); setView('chapter'); };
  const goBoss = (bossId: string) => { setActiveBossId(bossId); setView('boss'); };
  const goBack = () => {
    if (view === 'chapter' || view === 'quiz' || view === 'boss' || view === 'boss-fight') {
      setView(activeZoneId ? 'zone' : 'map');
    } else if (view === 'zone') {
      setView('map');
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const checkedInToday = progress.dailyCheckIn.includes(today);
  const tipIdx = useMemo(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return dayOfYear % TCM_DAILY_TIPS.length;
  }, []);

  // ═══════════════════════════════════════
  // 渲染
  // ═══════════════════════════════════════

  if (!mounted) return <PageContainer><div className="min-h-screen" /></PageContainer>;

  return (
    <PageContainer>
      <div className="min-h-screen pb-20 tcm-master-page">
        {/* ── 顶部状态栏 ── */}
        <header className="tcm-top-bar">
          <div className="tcm-top-left">
            {view !== 'map' && (
              <button onClick={goBack} className="tcm-back-btn" aria-label="返回">
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="tcm-logo" onClick={() => { setView('map'); setTab('map'); }}>
              <span className="tcm-logo-icon">☯️</span>
              <span className="tcm-logo-text">中医通</span>
            </div>
          </div>
          <div className="tcm-top-stats">
            <div className="tcm-stat-pill">
              <span className="tcm-stat-icon">⭐</span>
              <span>Lv.{levelInfo.lv}</span>
            </div>
            <div className="tcm-stat-pill">
              <span className="tcm-stat-icon">💎</span>
              <span>{progress.xp}</span>
            </div>
            <div className="tcm-stat-pill tcm-checkin-pill" onClick={handleCheckIn}
              style={{ opacity: checkedInToday ? 0.5 : 1, cursor: checkedInToday ? 'default' : 'pointer' }}>
              <Flame size={14} />
              <span>{checkedInToday ? `已打卡·${progress.streak}天` : '打卡'}</span>
            </div>
          </div>
        </header>

        {/* ── 等级进度条 ── */}
        {view === 'map' && (
          <div className="tcm-level-bar">
            <div className="tcm-level-info">
              <span className="tcm-level-title">{levelInfo.title}</span>
              {levelInfo.lv < 20 && <span className="tcm-level-next">→ {levelInfo.nextXp} XP</span>}
            </div>
            <div className="tcm-xp-track">
              <div className="tcm-xp-fill" style={{ width: `${levelInfo.progress}%` }} />
            </div>
          </div>
        )}

        {/* ── 每日一识弹窗 ── */}
        {showTip && (
          <div className="tcm-tip-overlay" onClick={() => { setShowTip(false); setProgress(p => ({ ...p, lastTipDate: today })); }}>
            <div className="tcm-tip-card" onClick={e => e.stopPropagation()}>
              <button className="tcm-tip-close" onClick={() => { setShowTip(false); setProgress(p => ({ ...p, lastTipDate: today })); }}>
                <X size={18} />
              </button>
              <div className="tcm-tip-badge">每日一识</div>
              <h3 className="tcm-tip-h">{TCM_DAILY_TIPS[tipIdx].h}</h3>
              <p className="tcm-tip-p">{TCM_DAILY_TIPS[tipIdx].p}</p>
              <button className="tcm-tip-btn" onClick={() => { setShowTip(false); setProgress(p => ({ ...p, lastTipDate: today })); handleCheckIn(); }}>
                知道了，今日打卡
              </button>
            </div>
          </div>
        )}

        {/* ── 主内容区 ── */}
        <main className="tcm-main">
          {view === 'map' && <MapView
            isZoneUnlocked={isZoneUnlocked}
            getZoneProgress={getZoneProgress}
            onZoneClick={goZone}
            levelInfo={levelInfo}
          />}
          {view === 'zone' && activeZone && <ZoneView
            zone={activeZone}
            isChapterDone={isChapterDone}
            onChapterClick={goChapter}
            onBossClick={goBoss}
            bossDefeated={progress.bossDefeated}
            isUnlocked={isZoneUnlocked(activeZone)}
          />}
          {view === 'chapter' && activeChapter && <ChapterView
            chapter={activeChapter}
            onStartQuiz={() => setView('quiz')}
            isDone={isChapterDone(activeChapter.id)}
          />}
          {view === 'quiz' && activeChapter && <QuizView
            chapter={activeChapter}
            onComplete={(correct) => { completeChapter(activeChapter, correct); }}
            onBack={() => setView('chapter')}
          />}
          {view === 'boss' && activeBoss && <BossIntroView
            boss={activeBoss}
            playerLevel={levelInfo.lv}
            onStart={() => setView('boss-fight')}
            onBack={goBack}
            defeated={progress.bossDefeated.includes(activeBoss.id)}
          />}
          {view === 'boss-fight' && activeBoss && <BossFightView
            boss={activeBoss}
            playerLevel={levelInfo.lv}
            onWin={() => { defeatBoss(activeBoss); }}
            onBack={() => setView('boss')}
          />}
          {view === 'achievements' && <AchievementsView
            unlocked={progress.unlockedAchievements}
          />}
          {view === 'profile' && <ProfileView
            progress={progress}
            levelInfo={levelInfo}
          />}
        </main>

        {/* ── 底部 Tab ── */}
        {(view === 'map' || view === 'achievements' || view === 'profile') && (
          <nav className="tcm-tabs">
            <button className={`tcm-tab ${tab === 'map' ? 'active' : ''}`}
              onClick={() => { setTab('map'); setView('map'); }}>
              <MapIcon size={18} />
              <span>修炼地图</span>
            </button>
            <button className={`tcm-tab ${tab === 'achievements' ? 'active' : ''}`}
              onClick={() => { setTab('achievements'); setView('achievements'); }}>
              <Trophy size={18} />
              <span>成就墙</span>
            </button>
            <button className={`tcm-tab ${tab === 'profile' ? 'active' : ''}`}
              onClick={() => { setTab('profile'); setView('profile'); }}>
              <User size={18} />
              <span>个人档案</span>
            </button>
          </nav>
        )}

        <BottomNav />
      </div>
    </PageContainer>
  );
}

// ═══════════════════════════════════════
// 修炼地图
// ═══════════════════════════════════════

function MapView({ isZoneUnlocked, getZoneProgress, onZoneClick, levelInfo }: {
  isZoneUnlocked: (z: TcmZone) => boolean;
  getZoneProgress: (z: TcmZone) => { done: number; total: number; pct: number };
  onZoneClick: (id: string) => void;
  levelInfo: { lv: number; title: string };
}) {
  return (
    <div className="tcm-map-view">
      <div className="tcm-map-header">
        <h2>修炼殿堂</h2>
        <p>探索中医浩瀚知识，从阴阳五行到针灸养生，步步进阶</p>
      </div>
      <div className="tcm-zone-grid">
        {TCM_ZONES.map((zone, idx) => {
          const unlocked = isZoneUnlocked(zone);
          const prog = getZoneProgress(zone);
          const color = ELEMENT_COLORS[zone.element];
          return (
            <div key={zone.id}
              className={`tcm-zone-card ${unlocked ? 'unlocked' : 'locked'}`}
              style={{ '--zone-color': color } as React.CSSProperties}
              onClick={() => unlocked ? onZoneClick(zone.id) : undefined}>
              <div className="tcm-zone-num">{String(idx + 1).padStart(2, '0')}</div>
              <div className="tcm-zone-icon" style={{ color: unlocked ? color : '#999' }}>
                {unlocked ? zone.icon : <Lock size={22} />}
              </div>
              <div className="tcm-zone-info">
                <div className="tcm-zone-name">{zone.name}</div>
                <div className="tcm-zone-desc">{zone.desc}</div>
                {unlocked ? (
                  <div className="tcm-zone-progress">
                    <div className="tcm-zone-prog-track">
                      <div className="tcm-zone-prog-fill" style={{ width: `${prog.pct}%`, background: color }} />
                    </div>
                    <span className="tcm-zone-prog-text">{prog.done}/{prog.total}</span>
                  </div>
                ) : (
                  <div className="tcm-zone-lock-info">
                    <Lock size={12} /> 需 Lv.{zone.levelRequired}
                  </div>
                )}
              </div>
              {unlocked && <ChevronRight size={18} className="tcm-zone-arrow" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// 殿堂详情
// ═══════════════════════════════════════

function ZoneView({ zone, isChapterDone, onChapterClick, onBossClick, bossDefeated, isUnlocked }: {
  zone: TcmZone;
  isChapterDone: (id: string) => boolean;
  onChapterClick: (id: string) => void;
  onBossClick: (id: string) => void;
  bossDefeated: string[];
  isUnlocked: boolean;
}) {
  const color = ELEMENT_COLORS[zone.element];
  const zoneBoss = TCM_BOSSES.find(b => b.zone === zone.id);

  if (!isUnlocked) {
    return (
      <div className="tcm-zone-locked-msg">
        <Lock size={48} />
        <h3>殿堂未解锁</h3>
        <p>需达到 Lv.{zone.levelRequired} 方可进入「{zone.name}」</p>
      </div>
    );
  }

  return (
    <div className="tcm-zone-detail">
      <div className="tcm-zone-banner" style={{ background: `linear-gradient(135deg, ${color}22, ${color}08)` }}>
        <span className="tcm-zone-banner-icon">{zone.icon}</span>
        <div>
          <h2>{zone.name}</h2>
          <p>{zone.desc}</p>
        </div>
      </div>
      <div className="tcm-chapter-list">
        <div className="tcm-chapter-section-label">知识章节</div>
        {zone.chapters.map((chId, idx) => {
          const chapter = TCM_CHAPTERS[chId];
          if (!chapter) return null;
          const done = isChapterDone(chId);
          return (
            <div key={chId} className="tcm-chapter-item" onClick={() => onChapterClick(chId)}>
              <div className="tcm-chapter-num" style={{ color: done ? '#c9a94f' : '#999' }}>
                {done ? <Check size={18} /> : idx + 1}
              </div>
              <div className="tcm-chapter-content-preview">
                <div className="tcm-chapter-name">{chapter.icon} {chapter.name}</div>
                <div className="tcm-chapter-sub">{chapter.content.subtitle}</div>
                <div className="tcm-chapter-reward">+{chapter.xpReward} XP · {ELEMENT_NAMES[chapter.element]}行修为</div>
              </div>
              <ChevronRight size={16} className="tcm-chapter-arrow" />
            </div>
          );
        })}
      </div>
      {zoneBoss && (
        <div className="tcm-boss-entry" onClick={() => onBossClick(zoneBoss.id)}>
          <div className="tcm-boss-entry-icon" style={{ borderColor: color }}>{zoneBoss.icon}</div>
          <div className="tcm-boss-entry-info">
            <div className="tcm-boss-entry-name">⚔️ Boss: {zoneBoss.name}</div>
            <div className="tcm-boss-entry-desc">{zoneBoss.desc}</div>
            <div className="tcm-boss-entry-reward">
              HP {zoneBoss.hp} · +{zoneBoss.reward.xp} XP · +{zoneBoss.reward.gems} 💎
              {bossDefeated.includes(zoneBoss.id) && <span className="tcm-boss-defeated-tag"> ✓ 已击败</span>}
            </div>
          </div>
          <Swords size={20} style={{ color: bossDefeated.includes(zoneBoss.id) ? '#c9a94f' : '#999' }} />
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// 章节学习
// ═══════════════════════════════════════

function ChapterView({ chapter, onStartQuiz, isDone }: {
  chapter: TcmChapter;
  onStartQuiz: () => void;
  isDone: boolean;
}) {
  const color = ELEMENT_COLORS[chapter.element];
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);

  return (
    <div className="tcm-chapter-view" ref={setScrollEl}>
      <div className="tcm-chapter-header" style={{ background: `linear-gradient(135deg, ${color}18, ${color}05)` }}>
        <div className="tcm-chapter-badge" style={{ background: color }}>{chapter.icon}</div>
        <div className="tcm-chapter-title-area">
          <h1>{chapter.content.title}</h1>
          <p>{chapter.content.subtitle}</p>
          <div className="tcm-chapter-tags">
            <span className="tcm-tag">{chapter.content.category}</span>
            <span className="tcm-tag" style={{ background: color, color: '#fff' }}>{ELEMENT_NAMES[chapter.element]}行</span>
            {isDone && <span className="tcm-tag tcm-tag-done"><Check size={12} /> 已完成</span>}
          </div>
        </div>
      </div>

      <div className="tcm-lesson-content">
        {chapter.content.sections.map((sec, i) => <SectionRenderer key={i} section={sec} />)}
        <div className="highlight">
          <span className="highlight-icon">{chapter.content.highlight.icon}</span>
          {renderText(chapter.content.highlight.text)}
        </div>
      </div>

      <div className="tcm-quiz-cta">
        <button className="tcm-quiz-btn" onClick={onStartQuiz}>
          <Target size={18} />
          {isDone ? '重新闯关' : '开始闯关测试'}
        </button>
        <div className="tcm-quiz-info">
          {chapter.quiz.length}题 · 答对{chapter.quiz.length}题获满分奖励
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// 闯关测试
// ═══════════════════════════════════════

function QuizView({ chapter, onComplete, onBack }: {
  chapter: TcmChapter;
  onComplete: (correct: number) => void;
  onBack: () => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const question = chapter.quiz[qIdx];
  const isLast = qIdx === chapter.quiz.length - 1;

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === question.ans) setCorrectCount(c => c + 1);
  };

  const handleNext = () => {
    if (isLast) {
      setFinished(true);
      const finalCorrect = selected === question.ans ? correctCount : correctCount;
      onComplete(finalCorrect);
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  if (finished) {
    const passed = correctCount >= Math.ceil(chapter.quiz.length * 0.75);
    const perfect = correctCount === chapter.quiz.length;
    return (
      <div className="tcm-quiz-result">
        <div className={`tcm-quiz-result-icon ${perfect ? 'perfect' : passed ? 'pass' : 'fail'}`}>
          {perfect ? '🏆' : passed ? '✅' : '📚'}
        </div>
        <h2>{perfect ? '满分通关！' : passed ? '闯关成功！' : '继续努力'}</h2>
        <div className="tcm-quiz-score">
          <span className="tcm-score-num">{correctCount}</span>
          <span className="tcm-score-sep">/</span>
          <span className="tcm-score-total">{chapter.quiz.length}</span>
        </div>
        <p className="tcm-quiz-result-msg">
          {perfect ? '全部正确！获得双倍修为奖励！' : passed ? '通过闯关，章节已标记完成！' : '答对75%以上才能通过，再试试吧！'}
        </p>
        <button className="tcm-quiz-btn" onClick={onBack}>返回章节</button>
      </div>
    );
  }

  return (
    <div className="tcm-quiz-view">
      <div className="tcm-quiz-progress">
        <div className="tcm-quiz-prog-text">{qIdx + 1} / {chapter.quiz.length}</div>
        <div className="tcm-quiz-prog-track">
          <div className="tcm-quiz-prog-fill" style={{ width: `${((qIdx + (showResult ? 1 : 0)) / chapter.quiz.length) * 100}%` }} />
        </div>
      </div>
      <div className="tcm-quiz-question">
        <h3>{question.q}</h3>
      </div>
      <div className="tcm-quiz-options">
        {question.opts.map((opt, idx) => {
          let cls = 'tcm-quiz-opt';
          if (showResult) {
            if (idx === question.ans) cls += ' correct';
            else if (idx === selected) cls += ' wrong';
          }
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx)} disabled={showResult}>
              <span className="tcm-opt-label">{String.fromCharCode(65 + idx)}</span>
              <span className="tcm-opt-text">{opt}</span>
              {showResult && idx === question.ans && <Check size={16} className="tcm-opt-icon" />}
              {showResult && idx === selected && idx !== question.ans && <X size={16} className="tcm-opt-icon" />}
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className="tcm-quiz-explain">
          <div className="tcm-explain-label">{selected === question.ans ? '✅ 回答正确' : '❌ 回答错误'}</div>
          <p>{question.explain}</p>
          <button className="tcm-quiz-next-btn" onClick={handleNext}>
            {isLast ? '查看结果' : '下一题'} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Boss 介绍
// ═══════════════════════════════════════

function BossIntroView({ boss, playerLevel, onStart, onBack, defeated }: {
  boss: TcmBoss;
  playerLevel: number;
  onStart: () => void;
  onBack: () => void;
  defeated: boolean;
}) {
  const canFight = playerLevel >= boss.levelRequired;
  return (
    <div className="tcm-boss-intro">
      <div className="tcm-boss-intro-avatar" style={{ '--boss-color': ELEMENT_COLORS[boss.element] } as React.CSSProperties}>
        <span className="tcm-boss-emoji">{boss.icon}</span>
        <div className="tcm-boss-pulse" />
      </div>
      <h2 className="tcm-boss-name">{boss.name}</h2>
      <p className="tcm-boss-desc">{boss.desc}</p>
      <div className="tcm-boss-stats">
        <div className="tcm-boss-stat"><Heart size={16} /> <span>HP {boss.hp}</span></div>
        <div className="tcm-boss-stat"><Zap size={16} /> <span>{boss.questions.length}题</span></div>
        <div className="tcm-boss-stat"><Gem size={16} /> <span>+{boss.reward.gems} 💎</span></div>
      </div>
      {defeated && <div className="tcm-boss-defeated-banner"><Check size={18} /> 已击败，可重复挑战</div>}
      {canFight ? (
        <button className="tcm-boss-fight-btn" onClick={onStart}>
          <Swords size={20} /> {defeated ? '再次挑战' : '开始战斗'}
        </button>
      ) : (
        <div className="tcm-boss-locked">
          <Lock size={20} /> 需达到 Lv.{boss.levelRequired} 才能挑战
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Boss 战斗
// ═══════════════════════════════════════

function BossFightView({ boss, playerLevel, onWin, onBack }: {
  boss: TcmBoss;
  playerLevel: number;
  onWin: () => void;
  onBack: () => void;
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [bossHp, setBossHp] = useState(boss.hp);
  const [playerHp, setPlayerHp] = useState(100 + playerLevel * 10);
  const maxPlayerHp = 100 + playerLevel * 10;
  const [combo, setCombo] = useState(0);
  const [battleOver, setBattleOver] = useState(false);
  const [won, setWon] = useState(false);

  const question = boss.questions[qIdx];
  const damagePerHit = Math.ceil(boss.hp / boss.questions.length);
  const bossDamage = 15 + Math.floor(boss.hp / 50);

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    if (idx === question.ans) {
      setCombo(c => c + 1);
      const dmg = damagePerHit + (combo >= 2 ? Math.ceil(damagePerHit * 0.3) : 0);
      setBossHp(h => Math.max(0, h - dmg));
    } else {
      setCombo(0);
      setPlayerHp(h => Math.max(0, h - bossDamage));
    }
  };

  const handleNext = () => {
    if (bossHp <= 0) {
      setBattleOver(true); setWon(true); onWin();
      return;
    }
    if (playerHp <= 0 || qIdx === boss.questions.length - 1) {
      setBattleOver(true);
      setWon(bossHp <= 0);
      if (bossHp <= 0) onWin();
      return;
    }
    setQIdx(i => i + 1);
    setSelected(null);
    setShowResult(false);
  };

  if (battleOver) {
    return (
      <div className="tcm-boss-result">
        <div className={`tcm-boss-result-icon ${won ? 'win' : 'lose'}`}>
          {won ? '🏆' : '💀'}
        </div>
        <h2>{won ? '战斗胜利！' : '挑战失败'}</h2>
        <p>{won ? `击败了 ${boss.name}！获得 ${boss.reward.xp} XP + ${boss.reward.gems} 💎` : '再接再厉，提升等级后再次挑战！'}</p>
        <button className="tcm-quiz-btn" onClick={onBack}>返回</button>
      </div>
    );
  }

  return (
    <div className="tcm-boss-fight">
      {/* Boss HP Bar */}
      <div className="tcm-battle-hp-section">
        <div className="tcm-battle-boss-hp">
          <div className="tcm-battle-hp-label">{boss.icon} {boss.name}</div>
          <div className="tcm-battle-hp-bar boss">
            <div className="tcm-battle-hp-fill boss" style={{ width: `${(bossHp / boss.hp) * 100}%` }} />
            <span className="tcm-battle-hp-text">{bossHp} / {boss.hp}</span>
          </div>
        </div>
        <div className="tcm-battle-player-hp">
          <div className="tcm-battle-hp-label">❤️ 我方</div>
          <div className="tcm-battle-hp-bar player">
            <div className="tcm-battle-hp-fill player" style={{ width: `${(playerHp / maxPlayerHp) * 100}%` }} />
            <span className="tcm-battle-hp-text">{playerHp} / {maxPlayerHp}</span>
          </div>
        </div>
        {combo >= 2 && <div className="tcm-combo-badge">🔥 {combo} 连击！伤害+30%</div>}
      </div>

      {/* Question */}
      <div className="tcm-battle-question">
        <div className="tcm-battle-q-num">第 {qIdx + 1} / {boss.questions.length} 题</div>
        <h3>{question.q}</h3>
      </div>
      <div className="tcm-quiz-options">
        {question.opts.map((opt, idx) => {
          let cls = 'tcm-quiz-opt';
          if (showResult) {
            if (idx === question.ans) cls += ' correct';
            else if (idx === selected) cls += ' wrong';
          }
          return (
            <button key={idx} className={cls} onClick={() => handleSelect(idx)} disabled={showResult}>
              <span className="tcm-opt-label">{String.fromCharCode(65 + idx)}</span>
              <span className="tcm-opt-text">{opt}</span>
              {showResult && idx === question.ans && <Check size={16} className="tcm-opt-icon" />}
              {showResult && idx === selected && idx !== question.ans && <X size={16} className="tcm-opt-icon" />}
            </button>
          );
        })}
      </div>
      {showResult && (
        <div className="tcm-quiz-explain">
          <div className="tcm-explain-label">{selected === question.ans ? '✅ 命中！' : '❌ 被反击！'}</div>
          <p>{question.explain}</p>
          <button className="tcm-quiz-next-btn" onClick={handleNext}>
            {qIdx === boss.questions.length - 1 || bossHp <= 0 ? '战斗结算' : '下一招'} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// 成就墙
// ═══════════════════════════════════════

function AchievementsView({ unlocked }: { unlocked: string[] }) {
  const tiers: { key: string; label: string; color: string }[] = [
    { key: 'bronze', label: '青铜', color: '#b87333' },
    { key: 'silver', label: '白银', color: '#c0c0c0' },
    { key: 'gold', label: '黄金', color: '#ffd700' },
    { key: 'platinum', label: '铂金', color: '#e5e4e2' },
  ];

  return (
    <div className="tcm-achievements-view">
      <div className="tcm-ach-header">
        <h2>成就墙</h2>
        <p>已解锁 {unlocked.length} / {TCM_ACHIEVEMENTS.length}</p>
        <div className="tcm-ach-progress-bar">
          <div className="tcm-ach-progress-fill" style={{ width: `${(unlocked.length / TCM_ACHIEVEMENTS.length) * 100}%` }} />
        </div>
      </div>
      {tiers.map(tier => {
        const achs = TCM_ACHIEVEMENTS.filter(a => a.tier === tier.key);
        return (
          <div key={tier.key} className="tcm-ach-tier">
            <div className="tcm-ach-tier-label" style={{ color: tier.color }}>{tier.label}级</div>
            <div className="tcm-ach-grid">
              {achs.map(ach => {
                const isUnlocked = unlocked.includes(ach.id);
                return (
                  <div key={ach.id} className={`tcm-ach-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                    style={{ '--ach-color': tier.color } as React.CSSProperties}>
                    <div className="tcm-ach-icon">{isUnlocked ? ach.icon : '🔒'}</div>
                    <div className="tcm-ach-info">
                      <div className="tcm-ach-name">{ach.name}</div>
                      <div className="tcm-ach-desc">{ach.desc}</div>
                      <div className="tcm-ach-cond">{ach.condition}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════
// 个人档案
// ═══════════════════════════════════════

function ProfileView({ progress, levelInfo }: {
  progress: GameProgress;
  levelInfo: { lv: number; title: string; nextXp: number; progress: number };
}) {
  const totalChapters = Object.keys(TCM_CHAPTERS).length;
  const totalBosses = TCM_BOSSES.length;
  const totalAchs = TCM_ACHIEVEMENTS.length;

  return (
    <div className="tcm-profile-view">
      <div className="tcm-profile-card">
        <div className="tcm-profile-avatar">
          <div className="tcm-profile-rank-circle" style={{ background: `conic-gradient(#c9a94f ${levelInfo.progress}%, #3333 0)` }}>
            <div className="tcm-profile-rank-inner">
              <span className="tcm-profile-lv-num">{levelInfo.lv}</span>
              <span className="tcm-profile-lv-label">Lv</span>
            </div>
          </div>
        </div>
        <h2 className="tcm-profile-title">{levelInfo.title}</h2>
        <div className="tcm-profile-xp">
          <Zap size={14} /> {progress.xp} XP{levelInfo.lv < 20 && ` / ${levelInfo.nextXp} XP`}
        </div>
      </div>

      <div className="tcm-profile-stats">
        <div className="tcm-profile-stat-item">
          <div className="tcm-stat-icon-wrap"><BookMarked size={20} /></div>
          <div className="tcm-stat-value">{progress.completedChapters.length}<span>/{totalChapters}</span></div>
          <div className="tcm-stat-label">章节完成</div>
        </div>
        <div className="tcm-profile-stat-item">
          <div className="tcm-stat-icon-wrap"><Target size={20} /></div>
          <div className="tcm-stat-value">{progress.quizPerfectCount}</div>
          <div className="tcm-stat-label">满分次数</div>
        </div>
        <div className="tcm-profile-stat-item">
          <div className="tcm-stat-icon-wrap"><Swords size={20} /></div>
          <div className="tcm-stat-value">{progress.bossDefeated.length}<span>/{totalBosses}</span></div>
          <div className="tcm-stat-label">Boss击败</div>
        </div>
        <div className="tcm-profile-stat-item">
          <div className="tcm-stat-icon-wrap"><Trophy size={20} /></div>
          <div className="tcm-stat-value">{progress.unlockedAchievements.length}<span>/{totalAchs}</span></div>
          <div className="tcm-stat-label">成就解锁</div>
        </div>
        <div className="tcm-profile-stat-item">
          <div className="tcm-stat-icon-wrap"><Flame size={20} /></div>
          <div className="tcm-stat-value">{progress.streak}</div>
          <div className="tcm-stat-label">连续打卡</div>
        </div>
        <div className="tcm-profile-stat-item">
          <div className="tcm-stat-icon-wrap"><Calendar size={20} /></div>
          <div className="tcm-stat-value">{progress.dailyCheckIn.length}</div>
          <div className="tcm-stat-label">累计打卡</div>
        </div>
      </div>

      <div className="tcm-profile-zones">
        <h3>殿堂进度</h3>
        {TCM_ZONES.map(zone => {
          const done = zone.chapters.filter(id => progress.completedChapters.includes(id)).length;
          const pct = zone.chapters.length ? Math.round((done / zone.chapters.length) * 100) : 0;
          const color = ELEMENT_COLORS[zone.element];
          return (
            <div key={zone.id} className="tcm-profile-zone-item">
              <span className="tcm-profile-zone-icon">{zone.icon}</span>
              <span className="tcm-profile-zone-name">{zone.name}</span>
              <div className="tcm-profile-zone-bar">
                <div className="tcm-profile-zone-fill" style={{ width: `${pct}%`, background: color }} />
              </div>
              <span className="tcm-profile-zone-pct">{done}/{zone.chapters.length}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
