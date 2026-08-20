'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  simulateDisease,
  getAllSymptoms,
  type DiseaseSimulationResult,
  type SyndromeMatch,
  type ConstitutionAdviceResult,
} from '@/lib/disease-simulation';
import {
  computeWuYunLiuQi,
  computeYunQiClinicalDecision,
  type WuxingElement,
} from '@/lib/tcm-calendar';
import { predictYunQiDiseaseTendency } from '@/lib/disease-simulation';
import { useAppStore } from '@/lib/store';

// ============================================================
// 主页面组件
// ============================================================

// 五行中文→英文映射
const CN_TO_EN: Record<string, WuxingElement> = { '木': '木', '火': '火', '土': '土', '金': '金', '水': '水' };
const WUXING_COLORS: Record<string, string> = {
  '金': '#5ba09a', '水': '#3d7a75', '木': '#5d8a63', '火': '#c26158', '土': '#c9a94f',
};

export default function JibingPage() {
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [result, setResult] = useState<DiseaseSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategoriesRaw] = useState<{ category: string; symptoms: { name: string; value: string }[] }[]>([]);
  const [activeCategory, setActiveCategory] = useState(0);
  const [showYunQi, setShowYunQi] = useState(false);

  // 体质数据
  const consolidateDiagnosis = useAppStore(s => s.consolidateDiagnosis);
  const constitutionElement = useMemo((): WuxingElement | null => {
    const elem = consolidateDiagnosis?.element;
    if (!elem) return null;
    const map: Record<string, WuxingElement> = {
      'wood': '木', 'fire': '火', 'earth': '土', 'metal': '金', 'water': '水',
    };
    return (map[elem] as WuxingElement) || null;
  }, [consolidateDiagnosis]);

  // 加载十问歌分类
  React.useEffect(() => {
    getAllSymptoms().then(data => setCategoriesRaw(data));
  }, []);

  // 当前年份五运六气
  const currentYear = new Date().getFullYear();
  const yunQiDecision = useMemo(() => computeYunQiClinicalDecision(currentYear), [currentYear]);
  const yunQiDiseaseTendency = useMemo(
    () => predictYunQiDiseaseTendency(yunQiDecision.wylq.zhongYun, yunQiDecision.wylq.isTaiGuo, yunQiDecision.wylq.siTianElement),
    [yunQiDecision],
  );

  // 执行仿真（携带体质）
  const handleSimulate = useCallback(async () => {
    if (selectedSymptoms.length === 0) return;
    setLoading(true);
    try {
      const res = await simulateDisease(selectedSymptoms, constitutionElement || undefined);
      setResult(res);
    } catch (e) {
      console.error('仿真失败:', e);
    }
    setLoading(false);
  }, [selectedSymptoms, constitutionElement]);

  const toggleSymptom = (name: string) => {
    setSelectedSymptoms(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name],
    );
  };

  const clearAll = () => {
    setSelectedSymptoms([]);
    setResult(null);
  };

  // 五行颜色
  const riskColors: Record<string, string> = { '低': '#4ade80', '中': '#fbbf24', '高': '#ef4444' };

  // 常见症状组合快速选择
  const commonCombos = useMemo(() => [
    { name: '外感风寒', symptoms: ['恶寒', '发热', '头痛', '身痛', '无汗'] },
    { name: '外感风热', symptoms: ['发热', '微恶寒', '咽喉肿痛', '咳嗽', '口渴'] },
    { name: '脾胃虚寒', symptoms: ['脘腹冷痛', '食欲不振', '泄泻', '四肢不温', '乏力'] },
    { name: '肝郁气滞', symptoms: ['胸胁胀痛', '情志抑郁', '善太息', '月经不调', '脘腹胀满'] },
    { name: '心肾不交', symptoms: ['失眠', '心悸', '腰膝酸软', '潮热盗汗', '头晕'] },
    { name: '肺热咳嗽', symptoms: ['咳嗽', '痰黄', '发热', '口渴', '咽喉肿痛'] },
  ], []);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#0a0a12]/95 border-b border-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold">疾病仿真</h1>
          <p className="text-xs text-zinc-500 mt-0.5">基于六经辨证·十问歌·知识图谱的智能辨证推理</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* 运气疾病倾向 — 折叠面板 */}
        <div className="bg-white/3 rounded-2xl border border-white/5 overflow-hidden">
          <button
            onClick={() => setShowYunQi(!showYunQi)}
            className="w-full px-4 py-3 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">五运六气疾病倾向</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                {yunQiDecision.wylq.yearGanZhi}年
              </span>
            </div>
            <span className="text-zinc-500 text-xs">{showYunQi ? '收起' : '展开'}</span>
          </button>
          {showYunQi && (
            <div className="px-4 pb-4 space-y-3">
              <p className="text-xs text-zinc-400">{yunQiDecision.summary}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="text-[10px] text-zinc-500 mb-1">易感疾病</div>
                  <div className="flex flex-wrap gap-1">
                    {yunQiDiseaseTendency.proneDiseases.map(d => (
                      <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300">{d}</span>
                    ))}
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="text-[10px] text-zinc-500 mb-1">预防经络</div>
                  <div className="flex flex-wrap gap-1">
                    {yunQiDiseaseTendency.preventiveMeridians.map((m: string) => (
                      <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{m}</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">{yunQiDiseaseTendency.niComment}</p>
            </div>
          )}
        </div>

          {/* 症状选择 */}
          {/* 体质状态提示 */}
          {constitutionElement && (
            <div className="px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] flex items-center gap-2">
              <span className="text-[10px] text-zinc-500">当前体质</span>
              <span className="text-xs font-bold" style={{ color: WUXING_COLORS[constitutionElement] }}>
                {constitutionElement}行
              </span>
              <span className="text-[10px] text-zinc-600 ml-1">· 仿真结果将结合体质与运气联动分析</span>
            </div>
          )}

        <div className="bg-white/3 rounded-2xl border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold">选择症状</h2>
            {selectedSymptoms.length > 0 && (
              <button onClick={clearAll} className="text-[10px] text-zinc-500 hover:text-white">
                清空 ({selectedSymptoms.length})
              </button>
            )}
          </div>

          {/* 快速选择常见组合 */}
          <div className="mb-3">
            <div className="text-[10px] text-zinc-500 mb-1.5">常见证候快速选择</div>
            <div className="flex flex-wrap gap-1.5">
              {commonCombos.map(combo => (
                <button
                  key={combo.name}
                  onClick={() => {
                    setSelectedSymptoms(prev => {
                      const set = new Set(prev);
                      combo.symptoms.forEach(s => set.add(s));
                      return Array.from(set);
                    });
                  }}
                  className="text-[10px] px-2 py-1 rounded-lg bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5 transition-all"
                >
                  {combo.name}
                </button>
              ))}
            </div>
          </div>

          {/* 已选症状标签 */}
          {selectedSymptoms.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {selectedSymptoms.map(s => (
                <span
                  key={s}
                  onClick={() => toggleSymptom(s)}
                  className="text-xs px-2 py-1 rounded-lg bg-blue-500/20 text-blue-300 cursor-pointer hover:bg-blue-500/30 transition-colors"
                >
                  {s} ✕
                </span>
              ))}
            </div>
          )}

          {/* 十问歌分类标签 */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {categories.map((cat, i) => (
              <button
                key={cat.category}
                onClick={() => setActiveCategory(i)}
                className={`text-[10px] px-2 py-1 rounded-lg transition-colors ${
                  activeCategory === i
                    ? 'bg-white/10 text-white'
                    : 'bg-white/3 text-zinc-500 hover:bg-white/5'
                }`}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* 当前分类的症状列表 */}
          <div className="flex flex-wrap gap-1.5">
            {categories[activeCategory]?.symptoms.map((sym: { name: string; value: string }) => (
              <button
                key={sym.name}
                onClick={() => toggleSymptom(sym.name)}
                className={`text-xs px-2.5 py-1.5 rounded-lg transition-colors ${
                  selectedSymptoms.includes(sym.name)
                    ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30'
                    : 'bg-white/3 text-zinc-400 hover:bg-white/5'
                }`}
              >
                {sym.name}
                <span className="text-[10px] text-zinc-600 ml-1">{sym.value}</span>
              </button>
            ))}
          </div>

          {/* 仿真按钮 */}
          <button
            onClick={handleSimulate}
            disabled={loading || selectedSymptoms.length === 0}
            className="mt-4 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:from-blue-500 hover:to-purple-500 transition-all"
          >
            {loading ? '推理中...' : `开始辨证 (${selectedSymptoms.length} 个症状)`}
          </button>
        </div>

        {/* 仿真结果 */}
        {result && (
          <div className="space-y-4">
            {/* 综合风险等级（含体质调整） */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/3 border border-white/5">
              <span className="text-xs text-zinc-500">综合风险</span>
              <span className="text-sm font-bold" style={{ color: riskColors[result.riskLevel] }}>
                {result.riskLevel}
              </span>
              {result.constitutionAdvice && result.constitutionAdvice.riskLevel !== result.constitutionAdvice.adjustedRiskLevel && (
                <span className="text-[10px] text-zinc-500">
                  （症状风险{result.constitutionAdvice.riskLevel}，体质联动上调至{result.riskLevel}）
                </span>
              )}
            </div>

            {/* 体质-运气联动建议 */}
            {result.constitutionAdvice && (
              <ConstitutionAdviceCard advice={result.constitutionAdvice} />
            )}

            {/* 倪师诊断 */}
            <div className="bg-white/3 rounded-2xl border border-white/5 p-4">
              <h3 className="text-sm font-bold mb-2">倪师辨证</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">{result.niDiagnosis}</p>
              <p className="text-xs text-zinc-500 mt-2">{result.recommendedAction}</p>
            </div>

            {/* 匹配证候 */}
            {result.matchedSyndromes.length > 0 && (
              <div className="bg-white/3 rounded-2xl border border-white/5 p-4">
                <h3 className="text-sm font-bold mb-3">证候匹配</h3>
                <div className="space-y-3">
                  {result.matchedSyndromes.map((syn, i) => (
                    <SyndromeCard key={syn.name} syndrome={syn} rank={i + 1} />
                  ))}
                </div>
              </div>
            )}

            {/* 知识图谱关联 */}
            {result.knowledgeGraphLinks.length > 0 && (
              <div className="bg-white/3 rounded-2xl border border-white/5 p-4">
                <h3 className="text-sm font-bold mb-3">知识关联</h3>
                <div className="space-y-1.5">
                  {result.knowledgeGraphLinks.slice(0, 10).map((link, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <span className="text-blue-300">{link.source}</span>
                      <span className="text-zinc-600">→[{link.relation}]→</span>
                      <span className="text-emerald-300">{link.target}</span>
                      <span className="text-zinc-600 ml-auto">{Math.round(link.weight * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 证候卡片子组件
// ============================================================

function SyndromeCard({ syndrome, rank }: { syndrome: SyndromeMatch; rank: number }) {
  const [expanded, setExpanded] = useState(rank === 1);
  const confidencePercent = Math.round(syndrome.confidence * 100);
  const barColor = confidencePercent > 70 ? '#4ade80' : confidencePercent > 40 ? '#fbbf24' : '#6b7280';

  return (
    <div className="bg-white/3 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-3 py-2.5 flex items-center gap-3"
      >
        <span className="text-xs text-zinc-600 font-mono w-4">{rank}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold">{syndrome.name}</span>
            <span className="text-[10px] text-zinc-500">{syndrome.englishName}</span>
          </div>
          {/* 置信度条 */}
          <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${confidencePercent}%`, backgroundColor: barColor }} />
          </div>
        </div>
        <span className="text-xs font-mono" style={{ color: barColor }}>{confidencePercent}%</span>
        <span className="text-zinc-600 text-xs">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-2">
          {/* 匹配症状 */}
          <div>
            <span className="text-[10px] text-zinc-500">匹配症状</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {syndrome.matchedSymptoms.map(s => (
                <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300">{s}</span>
              ))}
            </div>
          </div>

          {/* 舌脉 */}
          <div className="flex gap-4 text-xs">
            {syndrome.tongue && <span className="text-zinc-400">舌: {syndrome.tongue}</span>}
            {syndrome.pulse && <span className="text-zinc-400">脉: {syndrome.pulse}</span>}
          </div>

          {/* 方剂 */}
          {syndrome.formulas.length > 0 && (
            <div>
              <span className="text-[10px] text-zinc-500">推荐方剂</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {syndrome.formulas.slice(0, 6).map(f => (
                  <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300">{f}</span>
                ))}
              </div>
            </div>
          )}

          {/* 穴位 */}
          {syndrome.acupoints.length > 0 && (
            <div>
              <span className="text-[10px] text-zinc-500">推荐穴位</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {syndrome.acupoints.slice(0, 6).map(a => (
                  <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{a}</span>
                ))}
              </div>
            </div>
          )}

          {/* 倪师注释 */}
          {syndrome.niComment && (
            <p className="text-xs text-zinc-400 leading-relaxed italic border-t border-white/5 pt-2 mt-2">
              倪师按：{syndrome.niComment}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// 体质-运气联动卡片
// ============================================================

function ConstitutionAdviceCard({ advice }: { advice: ConstitutionAdviceResult }) {
  const riskColorsMap: Record<string, string> = { '低': '#4ade80', '中': '#fbbf24', '高': '#ef4444' };
  const riskBg: Record<string, string> = { '低': 'border-emerald-500/20 bg-emerald-500/[0.04]', '中': 'border-amber-500/20 bg-amber-500/[0.04]', '高': 'border-red-500/20 bg-red-500/[0.04]' };
  const relIcon = advice.relationship === '相克' ? '⚔' : advice.relationship === '相生' ? '✦' : '⬡';

  return (
    <div className={`rounded-2xl border p-4 ${riskBg[advice.adjustedRiskLevel]}`}>
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-[10px] text-zinc-500 uppercase tracking-widest">体质-运气联动</div>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-bold ${advice.adjustedRiskLevel === '高' ? 'text-red-400' : advice.adjustedRiskLevel === '中' ? 'text-amber-400' : 'text-emerald-400'}`}>
            风险{advice.adjustedRiskLevel}
          </span>
        </div>
      </div>

      {/* 五行关系 */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-lg font-bold" style={{ color: WUXING_COLORS[advice.constitutionElement] }}>
          {advice.constitutionElement}行体质
        </span>
        <span className="text-zinc-600">{relIcon}</span>
        <span className="text-lg font-bold" style={{ color: WUXING_COLORS[advice.yunQiElement] }}>
          {advice.yunQiElement}运{advice.isTaiGuo ? '太过' : '不及'}
        </span>
        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold ml-1"
          style={{ color: riskColorsMap[advice.riskLevel], backgroundColor: `${riskColorsMap[advice.riskLevel]}15` }}>
          {advice.relationship}
        </span>
      </div>

      {/* 临床建议 */}
      <p className="text-xs text-zinc-300 leading-relaxed mb-3">{advice.clinicalAdvice}</p>

      {/* 联合易感疾病 */}
      {advice.proneDiseases.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] text-zinc-500 mb-1.5">联合易感</div>
          <div className="flex flex-wrap gap-1">
            {advice.proneDiseases.slice(0, 8).map(d => (
              <span key={d} className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-300">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* 预防经络 */}
      {advice.preventiveMeridians.length > 0 && (
        <div className="mb-3">
          <div className="text-[10px] text-zinc-500 mb-1.5">预防经络</div>
          <div className="flex flex-wrap gap-1">
            {advice.preventiveMeridians.map(m => (
              <span key={m} className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-300">{m}</span>
            ))}
          </div>
        </div>
      )}

      {/* 倪师按 */}
      <div className="border-t border-white/5 pt-2 mt-2">
        <p className="text-xs text-zinc-400 leading-relaxed italic">{advice.niComment}</p>
      </div>
    </div>
  );
}
