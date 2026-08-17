'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import HealingHeader from '@/components/layout/HealingHeader';
import BottomNav from '@/components/BottomNav';
import ColorPicker, { type HSLColor } from '@/components/healing/ColorPicker';
import EmotionWheel, {
  type EmotionSelection,
} from '@/components/healing/EmotionWheel';
import {
  generateDiagnosis,
  hslToHex,
  hslToWuxing,
  emotionToWuxing,
  WUXING_META,
  type WuxingElement,
  type WuxingDiagnosis,
} from '@/lib/color-wuxing';
import { useHealingRecommendation } from '@/hooks/useHealingRecommendation';
import {
  ArrowLeft,
  ArrowRight,
  Palette,
  RotateCcw,
  Leaf,
  Flame,
  Mountain,
  Wind,
  Droplets,
  Music,
  Heart,
  Sparkles,
} from 'lucide-react';

// ===== 阶段定义 =====
type Phase = 'intro' | 'emotion' | 'color' | 'result';

const WUXING_ICONS: Record<WuxingElement, typeof Leaf> = {
  '木': Leaf,
  '火': Flame,
  '土': Mountain,
  '金': Wind,
  '水': Droplets,
};

const WUXING_COLORS: Record<WuxingElement, string> = {
  '木': '#27AE60',
  '火': '#E74C3C',
  '土': '#F39C12',
  '金': '#95A5A6',
  '水': '#2C3E50',
};

const WUXING_BG: Record<WuxingElement, string> = {
  '木': 'bg-emerald-50 border-emerald-200',
  '火': 'bg-red-50 border-red-200',
  '土': 'bg-amber-50 border-amber-200',
  '金': 'bg-gray-50 border-gray-200',
  '水': 'bg-blue-50 border-blue-200',
};

export default function ColorDiagnosisPage() {
  const { hasDiagnosis, recommendedElement, primaryConstitution } = useHealingRecommendation();
  const [phase, setPhase] = useState<Phase>('intro');
  const [emotionSelections, setEmotionSelections] = useState<EmotionSelection[]>([]);
  const [currentColorIndex, setCurrentColorIndex] = useState(0);
  const [colorData, setColorData] = useState<Record<string, HSLColor>>({});
  const [diagnosis, setDiagnosis] = useState<WuxingDiagnosis | null>(null);

  // 当前情绪对应的默认色彩
  const currentEmotion =
    emotionSelections[currentColorIndex]?.emotion || '';
  const currentHSL: HSLColor =
    colorData[currentEmotion] || { h: 0, s: 50, l: 50 };

  // 色彩变化处理
  const handleColorChange = useCallback(
    (hsl: HSLColor) => {
      if (!currentEmotion) return;
      setColorData((prev) => ({ ...prev, [currentEmotion]: hsl }));
    },
    [currentEmotion],
  );

  // 进入下一阶段
  const goNext = useCallback(() => {
    if (phase === 'intro') {
      setPhase('emotion');
    } else if (phase === 'emotion') {
      if (emotionSelections.length === 0) return;
      setPhase('color');
      setCurrentColorIndex(0);
    } else if (phase === 'color') {
      if (currentColorIndex < emotionSelections.length - 1) {
        setCurrentColorIndex((i) => i + 1);
      } else {
        // 所有颜色选择完毕，生成诊断
        const result = generateDiagnosis(colorData);
        setDiagnosis(result);
        setPhase('result');
      }
    }
  }, [phase, emotionSelections.length, currentColorIndex, colorData]);

  // 返回上一阶段
  const goBack = useCallback(() => {
    if (phase === 'emotion') setPhase('intro');
    else if (phase === 'color') {
      if (currentColorIndex > 0) {
        setCurrentColorIndex((i) => i - 1);
      } else {
        setPhase('emotion');
      }
    } else if (phase === 'result') {
      setPhase('color');
      setCurrentColorIndex(emotionSelections.length - 1);
    }
  }, [phase, currentColorIndex, emotionSelections.length]);

  // 重新开始
  const resetAll = useCallback(() => {
    setPhase('intro');
    setEmotionSelections([]);
    setCurrentColorIndex(0);
    setColorData({});
    setDiagnosis(null);
  }, []);

  // 计算进度
  const getProgress = () => {
    if (phase === 'intro') return 0;
    if (phase === 'emotion') return 25;
    if (phase === 'color')
      return 25 + (currentColorIndex / emotionSelections.length) * 50;
    return 100;
  };

  return (
    <PageContainer theme="diagnose">
      <HealingHeader
        title="色彩情志"
        subtitle="色诊明辨 · 五行推荐"
        backHref="/healing"
        element="earth"
      />

      <div className="px-4 pb-24 space-y-5">
        {hasDiagnosis && recommendedElement && (
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-red-500/10 border border-amber-400/30 flex items-center gap-2">
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-700 font-bold">荐</span>
            <span className="text-xs text-amber-800 font-serif">基于您的{primaryConstitution}，五色中宜多接触{recommendedElement === 'wood' ? '青绿(木)' : recommendedElement === 'fire' ? '赤红(火)' : recommendedElement === 'earth' ? '黄褐(土)' : recommendedElement === 'metal' ? '白灰(金)' : '蓝黑(水)'}系色彩</span>
          </div>
        )}

        {/* 进度条 */}
        <div className="w-full h-1 rounded-full bg-gray-200/60 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-red-400 transition-all duration-500"
            style={{ width: `${getProgress()}%` }}
          />
        </div>

        {/* ===== 阶段1：介绍 ===== */}
        {phase === 'intro' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="text-center space-y-3 pt-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-amber-400 to-red-400 flex items-center justify-center shadow-lg">
                <Palette className="text-white" size={28} />
              </div>
              <h2 className="text-xl font-black font-serif text-gray-800 tracking-wider">
                色彩情志诊断
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">
                基于《黄帝内经》五色入五脏理论与日内瓦情绪轮(GEW)，
                通过您选择的色彩与情绪，推演五行偏盛偏衰
              </p>
            </div>

            {/* 三步说明 */}
            <div className="space-y-3">
              {[
                {
                  step: 1,
                  title: '辨识情志',
                  desc: '选择当下最强烈的1-3种情绪',
                  icon: Heart,
                  color: 'text-red-500',
                },
                {
                  step: 2,
                  title: '映射色彩',
                  desc: '为每种情绪选择代表色彩',
                  icon: Palette,
                  color: 'text-amber-500',
                },
                {
                  step: 3,
                  title: '五行明辨',
                  desc: '综合色彩与情志推演五行偏盛',
                  icon: Sparkles,
                  color: 'text-emerald-500',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="glass-card p-4 flex items-start gap-3"
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white ${item.color}`}
                  >
                    <item.icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold font-serif text-gray-800">
                      第{item.step}步 · {item.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 理论依据 */}
            <div className="glass-card p-4 bg-amber-50/50 border-l-[3px] border-amber-400">
              <p className="text-xs font-serif text-gray-600 leading-relaxed">
                <span className="font-bold text-amber-700">《灵枢·五色》</span>
                ：「青为肝，赤为心，黄为脾，白为肺，黑为肾」。
                五色与五志相应，色之偏盛即气之偏盛，观色可知脏腑虚实。
              </p>
            </div>

            <button
              onClick={goNext}
              className="w-full py-3.5 rounded-xl text-white font-bold font-serif text-sm tracking-wider bg-gradient-to-r from-amber-500 to-red-500 shadow-lg active:scale-[0.98] transition-transform"
            >
              开始诊断 →
            </button>
          </div>
        )}

        {/* ===== 阶段2：情绪选择 ===== */}
        {phase === 'emotion' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center">
              <p className="text-xs text-gray-400">第1步 / 共3步</p>
              <h2 className="text-lg font-bold font-serif text-gray-800 mt-1">
                辨识当下情志
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                选择您此刻最强烈的1-3种情绪
              </p>
            </div>

            <EmotionWheel
              selections={emotionSelections}
              onChange={setEmotionSelections}
              maxSelections={3}
            />

            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="flex-1 py-3 rounded-xl text-gray-600 font-serif text-sm border border-gray-200 bg-white active:scale-[0.98] transition-transform"
              >
                <ArrowLeft size={14} className="inline mr-1" />
                返回
              </button>
              <button
                onClick={goNext}
                disabled={emotionSelections.length === 0}
                className="flex-[2] py-3 rounded-xl text-white font-bold font-serif text-sm bg-gradient-to-r from-amber-500 to-red-500 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
              >
                选色彩
                <ArrowRight size={14} className="inline ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* ===== 阶段3：色彩映射 ===== */}
        {phase === 'color' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center">
              <p className="text-xs text-gray-400">
                第2步 / 共3步 · {currentColorIndex + 1} / {emotionSelections.length}
              </p>
              <h2 className="text-lg font-bold font-serif text-gray-800 mt-1">
                映射情志色彩
              </h2>
            </div>

            {/* 情绪进度指示 */}
            <div className="flex justify-center gap-2">
              {emotionSelections.map((s, i) => (
                <div
                  key={s.emotion}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-serif transition-all ${
                    i === currentColorIndex
                      ? 'bg-amber-100 text-amber-700 border border-amber-300'
                      : colorData[s.emotion]
                      ? 'bg-gray-100 text-gray-600'
                      : 'bg-gray-50 text-gray-300'
                  }`}
                >
                  {colorData[s.emotion] && (
                    <span
                      className="w-3 h-3 rounded-full border border-white shadow-sm"
                      style={{
                        backgroundColor: `hsl(${colorData[s.emotion].h}, ${colorData[s.emotion].s}%, ${colorData[s.emotion].l}%)`,
                      }}
                    />
                  )}
                  {s.emotion}
                </div>
              ))}
            </div>

            <ColorPicker
              value={currentHSL}
              onChange={handleColorChange}
              emotionLabel={currentEmotion}
            />

            <div className="flex gap-3">
              <button
                onClick={goBack}
                className="flex-1 py-3 rounded-xl text-gray-600 font-serif text-sm border border-gray-200 bg-white active:scale-[0.98] transition-transform"
              >
                <ArrowLeft size={14} className="inline mr-1" />
                {currentColorIndex > 0 ? '上一个' : '返回'}
              </button>
              <button
                onClick={goNext}
                disabled={!colorData[currentEmotion]}
                className="flex-[2] py-3 rounded-xl text-white font-bold font-serif text-sm bg-gradient-to-r from-amber-500 to-red-500 shadow-lg active:scale-[0.98] transition-transform disabled:opacity-40 disabled:active:scale-100"
              >
                {currentColorIndex < emotionSelections.length - 1
                  ? '下一个情绪'
                  : '查看诊断'}
                <ArrowRight size={14} className="inline ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* ===== 阶段4：诊断结果 ===== */}
        {phase === 'result' && diagnosis && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <div className="text-center">
              <p className="text-xs text-gray-400">诊断完成</p>
              <h2 className="text-lg font-bold font-serif text-gray-800 mt-1">
                五行色彩明辨
              </h2>
            </div>

            {/* 色彩-五行映射总览 */}
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-sm font-bold font-serif text-gray-700 border-l-[3px] border-amber-400 pl-2">
                色彩→五行映射
              </h3>
              <div className="space-y-2">
                {Object.entries(colorData).map(([emotion, hsl]) => {
                  const wuxingResult = hslToWuxing(hsl.h, hsl.s, hsl.l);
                  const meta = WUXING_META[wuxingResult.element];
                  return (
                    <div
                      key={emotion}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/60"
                    >
                      <div
                        className="w-8 h-8 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                        style={{
                          backgroundColor: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-700">
                          {emotion}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          HSL({hsl.h}, {hsl.s}%, {hsl.l}%)
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className="text-xs font-serif font-bold px-2 py-0.5 rounded"
                          style={{
                            color: WUXING_COLORS[wuxingResult.element],
                            backgroundColor:
                              WUXING_COLORS[wuxingResult.element] + '15',
                          }}
                        >
                          {wuxingResult.element}·{meta.organ}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          {wuxingResult.tendency === '盛'
                            ? '偏盛'
                            : wuxingResult.tendency === '衰'
                            ? '偏衰'
                            : '平和'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 五行分布可视化 */}
            <div className="glass-card p-4 space-y-3">
              <h3 className="text-sm font-bold font-serif text-gray-700 border-l-[3px] border-amber-400 pl-2">
                五行分布
              </h3>
              <div className="space-y-2">
                {(['木', '火', '土', '金', '水'] as WuxingElement[]).map(
                  (elem) => {
                    const d = diagnosis.distribution[elem];
                    const meta = WUXING_META[elem];
                    const maxCount = Math.max(
                      ...Object.values(diagnosis.distribution).map(
                        (v) => v.count,
                      ),
                      1,
                    );
                    const widthPercent = (d.count / maxCount) * 100;
                    const isExcess = diagnosis.excess.includes(elem);
                    const isDeficient = diagnosis.deficient.includes(elem);

                    return (
                      <div key={elem} className="flex items-center gap-2">
                        <span
                          className="w-6 text-xs font-serif font-bold text-right"
                          style={{ color: WUXING_COLORS[elem] }}
                        >
                          {elem}
                        </span>
                        <div className="flex-1 h-6 rounded-full bg-gray-100 relative overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700 flex items-center px-2"
                            style={{
                              width: `${Math.max(widthPercent, d.count > 0 ? 15 : 0)}%`,
                              backgroundColor: WUXING_COLORS[elem],
                              opacity: d.count > 0 ? 0.8 : 0.15,
                            }}
                          >
                            {d.count > 0 && (
                              <span className="text-[10px] text-white font-bold">
                                {d.count}
                              </span>
                            )}
                          </div>
                          {isExcess && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-red-500">
                              盛
                            </span>
                          )}
                          {isDeficient && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-blue-500">
                              衰
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 w-8">
                          {meta.organ}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* 综合结论 */}
            <div className="glass-card p-4 space-y-3 ring-2 ring-amber-400/30">
              <h3 className="text-sm font-bold font-serif text-gray-700 border-l-[3px] border-amber-400 pl-2">
                综合明辨
              </h3>
              <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200/50">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="text-lg font-black font-serif"
                    style={{
                      color: WUXING_COLORS[diagnosis.primary.element],
                    }}
                  >
                    {diagnosis.primary.element}行
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-serif ${
                      diagnosis.primary.tendency === '盛'
                        ? 'bg-red-100 text-red-600'
                        : diagnosis.primary.tendency === '衰'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-emerald-100 text-emerald-600'
                    }`}
                  >
                    {diagnosis.primary.tendency === '盛'
                      ? '偏盛'
                      : diagnosis.primary.tendency === '衰'
                      ? '偏衰'
                      : '平和'}
                  </span>
                </div>
                {diagnosis.excess.length > 0 && (
                  <p className="text-xs text-gray-600">
                    <span className="font-bold text-red-600">偏盛：</span>
                    {diagnosis.excess.join('、')}行
                  </p>
                )}
                {diagnosis.deficient.length > 0 && (
                  <p className="text-xs text-gray-600">
                    <span className="font-bold text-blue-600">偏衰：</span>
                    {diagnosis.deficient.join('、')}行
                  </p>
                )}
              </div>
            </div>

            {/* 疗愈推荐 */}
            <div className="glass-card p-4 space-y-4">
              <h3 className="text-sm font-bold font-serif text-gray-700 border-l-[3px] border-amber-400 pl-2">
                疗愈推荐
              </h3>

              {/* 经络 */}
              <div className={`rounded-lg p-3 border ${WUXING_BG[diagnosis.primary.element]}`}>
                <p className="text-xs font-bold text-gray-700 mb-1">
                  经络疏导
                </p>
                {diagnosis.recommendation.meridians.map((m, i) => (
                  <p key={i} className="text-xs text-gray-600">
                    · {m}
                  </p>
                ))}
              </div>

              {/* 五音 */}
              <div className="rounded-lg p-3 bg-purple-50 border border-purple-200">
                <p className="text-xs font-bold text-gray-700 mb-1">
                  五音疗愈
                </p>
                {diagnosis.recommendation.tones.map((t, i) => (
                  <p key={i} className="text-xs text-gray-600">
                    · {t}
                  </p>
                ))}
                <Link
                  href="/healing/wuyin"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-purple-600 font-serif hover:underline"
                >
                  <Music size={12} />
                  前往五音疗愈
                </Link>
              </div>

              {/* 灸疗穴位 */}
              <div className="rounded-lg p-3 bg-orange-50 border border-orange-200">
                <p className="text-xs font-bold text-gray-700 mb-1">
                  灸疗穴位
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {diagnosis.recommendation.acupoints.map((a, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-serif"
                    >
                      {a}
                    </span>
                  ))}
                </div>
                <Link
                  href="/jiuliao"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-orange-600 font-serif hover:underline"
                >
                  <Flame size={12} />
                  前往灸疗处方
                </Link>
              </div>

              {/* 情志建议 */}
              <div className="rounded-lg p-3 bg-rose-50 border border-rose-200">
                <p className="text-xs font-bold text-gray-700 mb-1">
                  情志调养
                </p>
                <p className="text-xs text-gray-600 leading-relaxed font-serif">
                  {diagnosis.recommendation.emotionAdvice}
                </p>
              </div>

              {/* 饮食建议 */}
              <div className="rounded-lg p-3 bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-bold text-gray-700 mb-1">
                  饮食调理
                </p>
                <p className="text-xs text-gray-600 leading-relaxed font-serif">
                  {diagnosis.recommendation.dietAdvice}
                </p>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="space-y-3">
              <Link
                href="/healing"
                className="w-full py-3.5 rounded-xl text-white font-bold font-serif text-sm tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-red-500 shadow-lg active:scale-[0.98] transition-transform"
              >
                返回疗愈首页
              </Link>
              <button
                onClick={resetAll}
                className="w-full py-3 rounded-xl text-gray-500 font-serif text-sm border border-gray-200 bg-white flex items-center justify-center gap-1.5 active:scale-[0.98] transition-transform"
              >
                <RotateCcw size={14} />
                重新诊断
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}
