'use client';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { SEASONS, SEASON_KEYS, type SeasonColor } from '@/lib/season-colors';
import { PHASE1_SEQUENCE, generatePhase2, MIN_ROUNDS, TOTAL_ROUNDS, type TestRound } from '@/lib/test-sequence';
import { analyzeImageMetrics, calculateFinalResults, getRoundFinalScore, type RoundHistory, type AnalyzeResult, type FinalResult } from '@/lib/color-analyzer';
import { useAppStore } from '@/lib/store';
import type { ColorDiagnosisResult } from '@/lib/unified-diagnosis';

// Season key -> Wuxing mapping
const SEASON_WUXING: Record<string, '木' | '火' | '土' | '金' | '水'> = {
  brightSpring: '木', warmSpring: '木', softSpring: '木',
  brightSummer: '火', coolSummer: '火', softSummer: '火',
  warmAutumn: '土', softAutumn: '土', deepAutumn: '金',
  deepWinter: '水', coolWinter: '水', brightWinter: '水',
};

const EMOJI_SCORES = [
  { emoji: '😖', label: '很不适合', score: 1 },
  { emoji: '😐', label: '不太适合', score: 2 },
  { emoji: '🙂', label: '一般', score: 3 },
  { emoji: '😊', label: '挺适合', score: 4 },
  { emoji: '🥰', label: '非常适合', score: 5 },
];

type Phase = 'intro' | 'testing' | 'results';

export default function ColorTestPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentRound, setCurrentRound] = useState(0);
  const [userScores, setUserScores] = useState<Record<string, number>>({});
  const [roundHistory, setRoundHistory] = useState<RoundHistory[]>([]);
  const [phase2Sequence, setPhase2Sequence] = useState<TestRound[]>([]);
  const [finalResults, setFinalResults] = useState<FinalResult[]>([]);
  const [saved, setSaved] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const setColorDiagnosisResult = useAppStore(s => s.setColorDiagnosisResult);

  // Wire to unified diagnosis store when finalResults change
  useEffect(() => {
    if (finalResults.length === 0) return;
    const topKey = finalResults[0]?.key;
    const season = SEASONS[topKey];
    const colorResult: ColorDiagnosisResult = {
      seasonType: season?.nameCN || topKey,
      preferredElement: SEASON_WUXING[topKey] || '土',
      healingColors: season?.palette || [],
      timestamp: Date.now(),
    };
    setColorDiagnosisResult(colorResult);
  }, [finalResults, setColorDiagnosisResult]);

  const fullSequence = useMemo(() => {
    return [...PHASE1_SEQUENCE, ...phase2Sequence];
  }, [phase2Sequence]);

  const currentTest = fullSequence[currentRound] || null;
  const isPhase2 = currentRound >= PHASE1_SEQUENCE.length;
  const progress = ((currentRound + 1) / TOTAL_ROUNDS) * 100;

  const startTest = useCallback(() => {
    setPhase('testing');
    setCurrentRound(0);
    setUserScores({});
    setRoundHistory([]);
    setPhase2Sequence([]);
    setFinalResults([]);
    setSaved(false);
  }, []);

  const handleScore = useCallback(async (userScore: number) => {
    if (!currentTest) return;
    setAiLoading(true);

    try {
      const defaultSkinBase64 = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2YwZDBiOCIvPjwvc3ZnPg==';
      const aiResult = await analyzeImageMetrics(defaultSkinBase64, currentTest.color);
      const systemScore = getRoundFinalScore(userScore, aiResult.total);

      const historyEntry: RoundHistory = {
        round: currentRound + 1,
        seasonKey: currentTest.seasonKey,
        color: currentTest.color,
        colorName: currentTest.colorName,
        phase: currentTest.phase,
        aiScores: aiResult,
        userScore,
        systemScore,
      };

      const newUserScores = { ...userScores, [currentTest.seasonKey]: (userScores[currentTest.seasonKey] || 0) + userScore };
      const newHistory = [...roundHistory, historyEntry];

      setRoundHistory(newHistory);
      setUserScores(newUserScores);

      const nextRound = currentRound + 1;

      if (nextRound === PHASE1_SEQUENCE.length && phase2Sequence.length === 0) {
        const p2 = generatePhase2(newUserScores);
        setPhase2Sequence(p2);
      }

      if (nextRound >= TOTAL_ROUNDS) {
        const results = calculateFinalResults(newHistory, newUserScores);
        setFinalResults(results);
        setPhase('results');
      } else {
        setCurrentRound(nextRound);
      }
    } finally {
      setAiLoading(false);
    }
  }, [currentTest, currentRound, userScores, roundHistory, phase2Sequence, fullSequence]);

  const handleSave = useCallback(() => {
    if (finalResults.length === 0) return;
    const data = {
      date: new Date().toISOString(),
      top: finalResults[0],
      runnerUps: finalResults.slice(1, 3),
    };
    localStorage.setItem('color-test-result', JSON.stringify(data));
    setSaved(true);
  }, [finalResults]);

  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #faf5ee 0%, #f5efe4 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-6 flex-1">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/diagnose" className="text-sm" style={{ color: '#5d8a63' }}>← 明辨</Link>
            <span style={{ color: '#ccc' }}>·</span>
            <span className="text-sm" style={{ color: '#888' }}>色彩诊断</span>
          </div>

          <h1 className="text-2xl mb-3" style={{ color: '#1a1a1a', fontWeight: 780, letterSpacing: '-0.02em' }}>12季型色彩诊断</h1>

          <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: '#f5efe4' }}>🎨</div>
              <div>
                <h3 className="text-base mb-1" style={{ color: '#1a1a1a', fontWeight: 700 }}>两阶段测试</h3>
                <p className="text-sm" style={{ color: '#777' }}>
                  通过 16 轮色彩比对，发现最适合你的季型色彩体系
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#faf5ee' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: '#c26158', color: '#fff' }}>1</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>极端色初筛</p>
                  <p className="text-xs" style={{ color: '#888' }}>12轮高饱和色彩，筛选候选季型</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#faf5ee' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: '#5ba09a', color: '#fff' }}>2</div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>日常色精筛</p>
                  <p className="text-xs" style={{ color: '#888' }}>4轮日常色彩，精准锁定最终季型</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-8" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h3 className="text-sm mb-2" style={{ color: '#1a1a1a', fontWeight: 700 }}>12季型一览</h3>
            <div className="grid grid-cols-3 gap-2">
              {SEASON_KEYS.map(key => {
                const s = SEASONS[key];
                return (
                  <div key={key} className="flex items-center gap-1.5 p-2 rounded-lg" style={{ background: '#faf5ee' }}>
                    <div className="w-4 h-4 rounded" style={{ background: s.extremeColor }} />
                    <span className="text-xs" style={{ color: '#1a1a1a' }}>{s.nameCN}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={startTest}
            className="w-full py-4 rounded-xl text-base"
            style={{ background: 'linear-gradient(135deg, #c26158, #5d8a63)', color: '#fff', fontWeight: 700 }}
          >
            开始测试 →
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'testing' && currentTest) {
    return (
      <div className="min-h-screen flex flex-col" style={{ background: currentTest.color }}>
        <div className="relative flex-1 flex flex-col">
          <div className="absolute top-0 left-0 right-0 z-10 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff',
}}>
                {isPhase2 ? '阶段2·日常色精筛' : '阶段1·极端色初筛'}
              </div>
              <div className="px-3 py-1 rounded-full text-xs" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff',
}}>
                {currentRound + 1} / {TOTAL_ROUNDS}
              </div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.3)' }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: '#fff' }} />
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 px-5 py-2 rounded-full inline-block" style={{ background: 'rgba(0,0,0,0.45)',
}}>
                <p className="text-2xl font-bold text-white">{currentTest.colorName}</p>
                <p className="text-sm text-white/70 mt-1">{currentTest.nameCN} · {currentTest.name}</p>
              </div>
              <div className="mt-2 px-4 py-1.5 rounded-full inline-block" style={{ background: 'rgba(0,0,0,0.3)' }}>
                <p className="text-xs text-white/80">这个颜色适合我吗？</p>
              </div>
            </div>
          </div>

          <div className="p-4 pb-8" style={{ background: 'rgba(250,245,238,0.97)',
borderRadius: '24px 24px 0 0' }}>
            <p className="text-center text-sm mb-4" style={{ color: '#888' }}>这个色彩与你有多契合？</p>
            <div className="flex items-center justify-center gap-4 mb-2">
              {EMOJI_SCORES.map(({ emoji, label, score }) => (
                <button
                  key={score}
                  onClick={() => handleScore(score)}
                  disabled={aiLoading}
                  className="flex flex-col items-center gap-1 transition-transform active:scale-90"
                  style={{ opacity: aiLoading ? 0.5 : 1 }}
                >
                  <span className="text-3xl">{emoji}</span>
                  <span className="text-xs" style={{ color: '#888' }}>{label}</span>
                </button>
              ))}
            </div>
            {aiLoading && (
              <p className="text-center text-xs mt-2" style={{ color: '#5d8a63' }}>AI 正在分析中...</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'results' && finalResults.length > 0) {
    const topResult = finalResults[0];
    const topSeason = SEASONS[topResult.key];
    const runnerUps = finalResults.slice(1, 3);

    return (
      <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #faf5ee 0%, #f5efe4 100%)' }}>
        <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
          <div className="flex items-center gap-2 mb-6">
            <Link href="/diagnose/color-test" onClick={() => setPhase('intro')} className="text-sm" style={{ color: '#5d8a63' }}>← 重新测试</Link>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm mb-2" style={{ color: '#888' }}>你的季型</p>
            <h1 className="text-3xl mb-1" style={{ color: '#1a1a1a', fontWeight: 780 }}>{topSeason.nameCN}</h1>
            <p className="text-base" style={{ color: topSeason.extremeColor, fontWeight: 600 }}>{topSeason.name}</p>
          </div>

          <div className="rounded-2xl p-6 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div className="w-full h-32 rounded-xl mb-4 flex items-center justify-center" style={{
              background: `linear-gradient(135deg, ${topSeason.extremeColor}40, ${topSeason.dailyColor}60)`,
            }}>
              <span className="text-4xl font-bold" style={{ color: '#fff', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>{topSeason.nameCN}</span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#444' }}>{topSeason.description}</p>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base mb-4" style={{ color: '#1a1a1a', fontWeight: 760 }}>推荐色彩</h2>
            <div className="grid grid-cols-6 gap-2">
              {topSeason.palette.map((hex, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded-xl" style={{ background: hex, boxShadow: `0 2px 8px ${hex}40` }} />
                  <span className="text-xs" style={{ color: '#888' }}>{hex}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <h2 className="text-base mb-4" style={{ color: '#1a1a1a', fontWeight: 760 }}>避雷色彩</h2>
            <div className="grid grid-cols-3 gap-2">
              {topSeason.avoid.map((hex, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-full aspect-square rounded-xl relative overflow-hidden" style={{ background: hex }}>
                    <div className="absolute inset-0 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.2)' }}>
                      <span className="text-white text-lg">✕</span>
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: '#888' }}>{hex}</span>
                </div>
              ))}
            </div>
          </div>

          {runnerUps.length > 0 && (
            <div className="rounded-2xl p-5 mb-5" style={{ background: '#fff', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <h2 className="text-base mb-4" style={{ color: '#1a1a1a', fontWeight: 760 }}>相似季型</h2>
              <div className="space-y-3">
                {runnerUps.map((r, i) => {
                  const s = SEASONS[r.key];
                  if (!s) return null;
                  return (
                    <div key={r.key} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: '#faf5ee' }}>
                      <div className="w-10 h-10 rounded-lg" style={{ background: `linear-gradient(135deg, ${s.extremeColor}, ${s.dailyColor})` }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold" style={{ color: '#1a1a1a' }}>{s.nameCN}</span>
                          <span className="text-xs" style={{ color: '#888' }}>{s.name}</span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: '#888' }}>匹配度 {Math.round(r.score * 10)}%</p>
                      </div>
                      <span className="text-lg font-bold" style={{ color: '#c9a94f' }}>#{i + 2}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <button
            onClick={handleSave}
            className="w-full py-3.5 rounded-xl text-sm"
            style={{
              background: saved ? '#5d8a63' : 'linear-gradient(135deg, #5d8a63, #3d7a75)',
              color: '#fff',
              fontWeight: 700,
            }}
          >
            {saved ? '✓ 已保存结果' : '保存结果'}
          </button>

          <p className="text-xs text-center mt-4" style={{ color: '#aaa' }}>色彩诊断为参考性建议，实际穿搭请结合个人喜好与场合。</p>
        </div>
      </div>
    );
  }

  return null;
}
