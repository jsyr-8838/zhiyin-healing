'use client';
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { personalityColorMap, getRecommendedColors, getColorHex, ENERGY_PROPERTY, COLOR_PSYCHOLOGY } from '@/lib/essence-data';
import { analyzeSymptoms, QUICK_COMMANDS, type DialecticResult } from '@/lib/dialectic-engine';
import { useAppStore } from '@/lib/store';
import type { EssenceDiagnosisResult } from '@/lib/unified-diagnosis';

type Dimension = 'taiyang' | 'shaoyang' | 'yinyangheping' | 'shaoyin' | 'taiyin';
type Phase = 'intro' | 'quiz' | 'result' | 'dialectic';

const WUXING_HEX: Record<string, string> = { '木': '#5d8a63', '火': '#c26158', '土': '#c9a94f', '金': '#5ba09a', '水': '#3d7a75' };

const DIMENSION_META: Record<Dimension, { label: string; en: string; color: string; wuxing: string; icon: string; desc: string }> = {
  taiyang: { label: '太阳', en: 'Tai Yang', color: '#c26158', wuxing: '火', icon: '☀️', desc: '太阳之人，居处于于，好言大事，是无能为，虚说自夸，举措不顾，发于政事' },
  shaoyang: { label: '少阳', en: 'Shao Yang', color: '#5d8a63', wuxing: '木', icon: '🌱', desc: '少阳之人，諟谛好自贵，有小小官，则高自宜，好为外交而不内附' },
  yinyangheping: { label: '阴阳和平', en: 'Harmony', color: '#c9a94f', wuxing: '土', icon: '☯️', desc: '阴阳和平之人，其状委委然，随随然，颙颙然，愉愉然，璇璇然，豆豆然' },
  shaoyin: { label: '少阴', en: 'Shao Yin', color: '#5ba09a', wuxing: '金', icon: '🌙', desc: '少阴之人，小贪而贼心，见人有亡，常若有得，好伤好害，见人有荣，乃反愠怒' },
  taiyin: { label: '太阴', en: 'Tai Yin', color: '#3d7a75', wuxing: '水', icon: '🏔️', desc: '太阴之人，贪而不仁，下齐湛湛，好内而恶出，心抑而不发，不务于时，动而后之' },
};

const QUESTIONS: { dimension: Dimension; text: string }[] = [
  { dimension: 'taiyang', text: '我在做决定时往往坚持己见' },
  { dimension: 'taiyang', text: '我遇到问题时容易据理力争' },
  { dimension: 'taiyang', text: '我做事节奏比较快' },
  { dimension: 'taiyang', text: '我走路时习惯昂首挺胸' },
  { dimension: 'shaoyang', text: '我对生活总体持乐观态度' },
  { dimension: 'shaoyang', text: '我对突发事件反应较快' },
  { dimension: 'shaoyang', text: '我喜欢社交和与人交流' },
  { dimension: 'shaoyang', text: '我说话时经常配合手势' },
  { dimension: 'yinyangheping', text: '我遇事从容不迫' },
  { dimension: 'yinyangheping', text: '我能保持心态平和' },
  { dimension: 'yinyangheping', text: '我善于权衡利弊再做决定' },
  { dimension: 'yinyangheping', text: '我待人接物得体妥当' },
  { dimension: 'shaoyin', text: '我做事比较谨慎' },
  { dimension: 'shaoyin', text: '我性格偏内敛' },
  { dimension: 'shaoyin', text: '我行事稳重踏实' },
  { dimension: 'shaoyin', text: '我说话做事节奏偏慢' },
  { dimension: 'taiyin', text: '我经常深思熟虑' },
  { dimension: 'taiyin', text: '我有时缺乏自信' },
  { dimension: 'taiyin', text: '我容易感到烦恼' },
  { dimension: 'taiyin', text: '我的情绪波动较大' },
];

const LIKERT_LABELS = ['很不符合', '较不符合', '一般', '比较符合', '非常符合'];

export default function PersonalityPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQ, setCurrentQ] = useState(0);
  const [symptomInput, setSymptomInput] = useState('');
  const [dialecticResult, setDialecticResult] = useState<DialecticResult | null>(null);

  const scores = useMemo(() => {
    const s: Record<Dimension, number> = { taiyang: 0, shaoyang: 0, yinyangheping: 0, shaoyin: 0, taiyin: 0 };
    for (let i = 0; i < QUESTIONS.length; i++) {
      const q = QUESTIONS[i];
      s[q.dimension] += (answers[i] || 0) + 1;
    }
    return s;
  }, [answers]);

  const dominant = useMemo<Dimension>(() => {
    return (Object.entries(scores) as [Dimension, number][]).sort((a, b) => b[1] - a[1])[0][0];
  }, [scores]);

  const setEssenceDiagnosisResult = useAppStore(s => s.setEssenceDiagnosisResult);

  // Wire to unified diagnosis store when dominant personality is determined
  useEffect(() => {
    if (phase !== 'result' && phase !== 'dialectic') return;
    const dm = DIMENSION_META[dominant];
    const essenceResult: EssenceDiagnosisResult = {
      preferredElement: (dm.wuxing) as EssenceDiagnosisResult['preferredElement'],
      recommendedOils: [],
      aromaProfile: `${dm.label}·${dm.wuxing}行`,
      timestamp: Date.now(),
    };
    setEssenceDiagnosisResult(essenceResult);
  }, [dominant, phase, setEssenceDiagnosisResult]);

  const recommendedColors = useMemo(() => {
    return getRecommendedColors(scores);
  }, [scores]);

  const allAnswered = QUESTIONS.every((_, i) => answers[i] !== undefined);

  const handleLikert = (qIndex: number, value: number) => {
    setAnswers(prev => ({ ...prev, [qIndex]: value }));
    if (qIndex < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(qIndex + 1), 250);
    }
  };

  const handleAnalyze = () => {
    const symptoms = symptomInput.split(/[,，、\s]+/).filter(Boolean);
    if (symptoms.length > 0) {
      setDialecticResult(analyzeSymptoms(symptoms));
    }
  };

  const dimensionKeys = Object.keys(DIMENSION_META) as Dimension[];

  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-[#faf5ee]">
        <div className="sticky top-0 z-10 bg-[#faf5ee]/90 border-b border-[#e8d4b8]">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <Link href="/diagnose" className="text-[#8b7b6b] hover:text-[#1a1a1a] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-lg font-bold text-[#1a1a1a]">五维人格评估</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
          <div className="text-center space-y-2">
            <div className="text-5xl">☯️</div>
            <h2 className="text-2xl font-bold text-[#1a1a1a]">五维人格 · 智能辨证</h2>
            <p className="text-sm text-[#8b7b6b]">源自《灵枢·通天》阴阳五态人格学说</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8] space-y-4">
            <p className="text-sm text-[#1a1a1a] leading-relaxed">
              《灵枢·通天》根据人体阴阳之气多少，将人格分为<strong>太阳、少阳、阴阳和平、少阴、太阴</strong>五类。
              每种人格类型都有其独特的心理特征、情志倾向与疗愈需求。
            </p>
            <div className="grid grid-cols-5 gap-2">
              {dimensionKeys.map(key => {
                const m = DIMENSION_META[key];
                return (
                  <div key={key} className="text-center p-2 rounded-xl" style={{ backgroundColor: m.color + '15' }}>
                    <div className="text-lg">{m.icon}</div>
                    <div className="text-xs font-semibold mt-1" style={{ color: m.color }}>{m.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
            <h3 className="font-bold text-[#1a1a1a] mb-3">评估内容</h3>
            <div className="space-y-2 text-sm text-[#5a4a3a]">
              <div className="flex items-start gap-2"><span className="text-[#c26158]">●</span> 20道五维人格测评题（5点量表）</div>
              <div className="flex items-start gap-2"><span className="text-[#5d8a63]">●</span> 五维雷达图与主导类型分析</div>
              <div className="flex items-start gap-2"><span className="text-[#c9a94f]">●</span> 个性化疗愈色彩与经络推荐</div>
              <div className="flex items-start gap-2"><span className="text-[#5ba09a]">●</span> 症状智能辨证与养生建议</div>
            </div>
          </div>
          <button
            onClick={() => { setPhase('quiz'); setCurrentQ(0); }}
            className="w-full py-3.5 rounded-xl font-bold text-white text-base"
            style={{ background: 'linear-gradient(135deg, #c26158, #c9a94f)' }}
          >
            开始评估
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'quiz') {
    const q = QUESTIONS[currentQ];
    const dm = DIMENSION_META[q.dimension];
    const progress = ((Object.keys(answers).length) / QUESTIONS.length) * 100;

    return (
      <div className="min-h-screen bg-[#faf5ee]">
        <div className="sticky top-0 z-10 bg-[#faf5ee]/90 border-b border-[#e8d4b8]">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setPhase('intro')} className="text-[#8b7b6b] hover:text-[#1a1a1a] transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-lg font-bold text-[#1a1a1a]">五维人格评估</h1>
            <span className="ml-auto text-sm text-[#8b7b6b]">{currentQ + 1}/{QUESTIONS.length}</span>
          </div>
          <div className="max-w-lg mx-auto px-4 pb-2">
            <div className="h-1.5 bg-[#e8d4b8] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: dm.color }} />
            </div>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: dm.color }}>{dm.icon} {dm.label}</span>
            <span className="text-xs text-[#8b7b6b]">{dm.wuxing}行</span>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#e8d4b8]">
            <p className="text-lg font-semibold text-[#1a1a1a] leading-relaxed mb-6">{q.text}</p>
            <div className="space-y-2.5">
              {LIKERT_LABELS.map((label, idx) => (
                <button
                  key={idx}
                  onClick={() => handleLikert(currentQ, idx)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all text-sm ${
                    answers[currentQ] === idx
                      ? 'border-transparent text-white font-semibold shadow-md'
                      : 'border-[#e8d4b8] text-[#5a4a3a] hover:border-[#c9a94f]'
                  }`}
                  style={answers[currentQ] === idx ? { backgroundColor: dm.color } : undefined}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      answers[currentQ] === idx ? 'bg-white/25 text-white' : 'bg-[#f5ede3] text-[#8b7b6b]'
                    }`}>{idx + 1}</span>
                    {label}
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
              disabled={currentQ === 0}
              className="flex-1 py-3 rounded-xl border border-[#e8d4b8] text-sm font-semibold text-[#8b7b6b] disabled:opacity-40"
            >
              上一题
            </button>
            {currentQ === QUESTIONS.length - 1 && allAnswered ? (
              <button
                onClick={() => setPhase('result')}
                className="flex-1 py-3 rounded-xl font-bold text-white text-sm"
                style={{ background: 'linear-gradient(135deg, #c9a94f, #c26158)' }}
              >
                查看结果
              </button>
            ) : (
              <button
                onClick={() => setCurrentQ(Math.min(QUESTIONS.length - 1, currentQ + 1))}
                className="flex-1 py-3 rounded-xl border border-[#e8d4b8] text-sm font-semibold text-[#5a4a3a]"
              >
                下一题
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {QUESTIONS.map((qq, i) => (
              <button
                key={i}
                onClick={() => setCurrentQ(i)}
                className={`w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                  i === currentQ
                    ? 'ring-2 ring-offset-1'
                    : answers[i] !== undefined ? 'text-white' : 'bg-[#f5ede3] text-[#8b7b6b]'
                }`}
                style={i === currentQ ? { backgroundColor: DIMENSION_META[qq.dimension].color, outlineColor: DIMENSION_META[qq.dimension].color } : answers[i] !== undefined ? { backgroundColor: DIMENSION_META[qq.dimension].color + '80' } : undefined}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'result') {
    const dm = DIMENSION_META[dominant];
    const maxScore = Math.max(...Object.values(scores));
    const sortedDims = dimensionKeys.sort((a, b) => scores[b] - scores[a]);

    return (
      <div className="min-h-screen bg-[#faf5ee]">
        <div className="sticky top-0 z-10 bg-[#faf5ee]/90 border-b border-[#e8d4b8]">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => setPhase('quiz')} className="text-[#8b7b6b] hover:text-[#1a1a1a]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
            <h1 className="text-lg font-bold text-[#1a1a1a]">评估结果</h1>
            <button onClick={() => setPhase('dialectic')} className="ml-auto text-sm font-semibold text-[#c26158]">
              智能辨证 →
            </button>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          <div className="text-center p-6 rounded-2xl text-white" style={{ background: `linear-gradient(135deg, ${dm.color}, ${dm.color}dd)` }}>
            <div className="text-4xl mb-2">{dm.icon}</div>
            <h2 className="text-2xl font-bold">{dm.label}型人格</h2>
            <p className="text-sm opacity-90 mt-1">{dm.en}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
            <h3 className="font-bold text-[#1a1a1a] mb-3">《灵枢》原文</h3>
            <p className="text-sm text-[#5a4a3a] leading-relaxed">{dm.desc}</p>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
            <h3 className="font-bold text-[#1a1a1a] mb-4">五维人格图</h3>
            <div className="space-y-3">
              {sortedDims.map(key => {
                const m = DIMENSION_META[key];
                const s = scores[key];
                const pct = maxScore > 0 ? (s / maxScore) * 100 : 0;
                return (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold" style={{ color: m.color }}>{m.icon} {m.label}</span>
                      <span className="text-[#8b7b6b]">{s}分</span>
                    </div>
                    <div className="h-3 bg-[#f5ede3] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: m.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
            <h3 className="font-bold text-[#1a1a1a] mb-3">疗愈色彩推荐</h3>
            <div className="flex flex-wrap gap-2">
              {recommendedColors.map(c => {
                const hex = getColorHex(c);
                const psy = COLOR_PSYCHOLOGY[c];
                return (
                  <div key={c} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#e8d4b8] bg-[#faf5ee]">
                    <div className="w-6 h-6 rounded-full border border-white/60 shadow-sm" style={{ backgroundColor: hex }} />
                    <div>
                      <div className="text-xs font-semibold text-[#1a1a1a]">{c}</div>
                      {psy && <div className="text-[10px] text-[#8b7b6b]">{psy.psyche}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
            <h3 className="font-bold text-[#1a1a1a] mb-3">推荐经络与节气</h3>
            <div className="space-y-2">
              {sortedDims.slice(0, 3).map(key => {
                const m = DIMENSION_META[key];
                const maps = personalityColorMap.filter(p => p.dimension === m.label && p.level === '高分').slice(0, 2);
                return (
                  <div key={key} className="flex items-start gap-2 p-2.5 rounded-xl" style={{ backgroundColor: m.color + '10' }}>
                    <span className="text-lg">{m.icon}</span>
                    <div className="text-sm">
                      <div className="font-semibold" style={{ color: m.color }}>{m.label}型</div>
                      <div className="text-[#5a4a3a] text-xs mt-0.5">
                        经络：{[...new Set(maps.flatMap(p => p.meridians))].slice(0, 3).join('、')}
                      </div>
                      <div className="text-[#5a4a3a] text-xs">
                        节气：{[...new Set(maps.flatMap(p => p.solarTerms))].slice(0, 4).join('、')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <button
            onClick={() => setPhase('dialectic')}
            className="w-full py-3.5 rounded-xl font-bold text-white text-base"
            style={{ background: 'linear-gradient(135deg, #5d8a63, #3d7a75)' }}
          >
            继续智能辨证 →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf5ee]">
      <div className="sticky top-0 z-10 bg-[#faf5ee]/90 border-b border-[#e8d4b8]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => setPhase('result')} className="text-[#8b7b6b] hover:text-[#1a1a1a]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
          </button>
          <h1 className="text-lg font-bold text-[#1a1a1a]">智能辨证</h1>
        </div>
      </div>
      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
          <h3 className="font-bold text-[#1a1a1a] mb-3">描述您的症状</h3>
          <textarea
            value={symptomInput}
            onChange={e => setSymptomInput(e.target.value)}
            placeholder="请输入症状，如：头痛、失眠、乏力..."
            className="w-full h-28 px-4 py-3 rounded-xl border border-[#e8d4b8] bg-[#faf5ee] text-sm text-[#1a1a1a] placeholder-[#b8a898] resize-none focus:outline-none focus:border-[#c9a94f] transition-colors"
          />
          <div className="flex flex-wrap gap-2 mt-3">
            {QUICK_COMMANDS.map(cmd => (
              <button
                key={cmd.label}
                onClick={() => setSymptomInput(prev => prev ? prev + '、' + cmd.symptoms.join('、') : cmd.symptoms.join('、'))}
                className="px-3 py-1.5 rounded-full text-xs font-medium border border-[#e8d4b8] text-[#5a4a3a] hover:border-[#c9a94f] hover:text-[#c9a94f] transition-colors"
              >
                {cmd.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleAnalyze}
            disabled={!symptomInput.trim()}
            className="w-full mt-4 py-3 rounded-xl font-bold text-white text-sm disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #5d8a63, #3d7a75)' }}
          >
            开始辨证分析
          </button>
        </div>
        {dialecticResult && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
              <h3 className="font-bold text-[#1a1a1a] mb-3">辨证分析</h3>
              <p className="text-sm text-[#5a4a3a] leading-relaxed">{dialecticResult.summary}</p>
            </div>
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">🕐</span>
                <h3 className="font-bold text-[#1a1a1a]">当前时辰</h3>
              </div>
              <div className="p-3 rounded-xl bg-[#faf5ee]">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-[#1a1a1a]">{dialecticResult.currentShichen.name}时</span>
                  <span className="text-[#8b7b6b]">{dialecticResult.currentShichen.hours}</span>
                </div>
                <div className="text-xs text-[#5a4a3a]">{dialecticResult.currentShichen.meridian}当令 · {dialecticResult.currentShichen.healthTip}</div>
              </div>
            </div>
            {dialecticResult.matchedRules.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
                <h3 className="font-bold text-[#1a1a1a] mb-3">匹配证型</h3>
                <div className="space-y-3">
                  {dialecticResult.matchedRules.map(rule => {
                    const wuxingMap: Record<string, string> = { '肝': '木', '心': '火', '脾': '土', '肺': '金', '肾': '水', '胃': '土', '胆': '木', '膀胱': '水', '大肠': '金', '小肠': '火', '心包': '火', '三焦': '水' };
                    const wuxing = wuxingMap[rule.organ] || '土';
                    return (
                      <div key={rule.id} className="p-3 rounded-xl border border-[#e8d4b8] bg-[#faf5ee]">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: WUXING_HEX[wuxing] }}>
                            {rule.organ}·{wuxing}行
                          </span>
                          <span className="text-sm font-semibold text-[#1a1a1a]">{rule.category}</span>
                        </div>
                        <p className="text-xs text-[#5a4a3a] mb-2">{rule.description}</p>
                        <p className="text-xs text-[#8b7b6b]">经络：{rule.meridian}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
              <h3 className="font-bold text-[#1a1a1a] mb-3">穴位推荐</h3>
              <div className="flex flex-wrap gap-2">
                {dialecticResult.acupointRecommendations.map(pt => (
                  <span key={pt} className="px-3 py-1.5 rounded-full text-sm font-medium bg-[#5d8a63]/10 text-[#5d8a63]">
                    {pt}
                  </span>
                ))}
              </div>
            </div>
            {dialecticResult.matchedRules.length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#e8d4b8]">
                <h3 className="font-bold text-[#1a1a1a] mb-3">调理建议</h3>
                <div className="space-y-2">
                  {dialecticResult.matchedRules.flatMap(r => r.advice).slice(0, 6).map((a, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-[#5a4a3a]">
                      <span className="text-[#c9a94f] mt-0.5">•</span>
                      {a}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="p-4 rounded-xl bg-[#f5ede3] text-xs text-center text-[#8b7b6b]">
              本评估仅供参考，不构成医疗建议。如有不适请及时就医。
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
