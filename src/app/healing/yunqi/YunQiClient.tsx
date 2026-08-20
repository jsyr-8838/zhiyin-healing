'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  computeWuYunLiuQi,
  computeTianFuSuiHui,
  computeYunQiTongHua,
  computeWuBuTuiYun,
  computeYunQiClinicalDecision,
  computeYunQiConstitutionAdvice,
  getCurrentQiPeriod,
  type WuYunLiuQi,
  type WuxingElement,
} from '@/lib/tcm-calendar';
import { useAppStore } from '@/lib/store';

// ===== 五行色映射 =====
const WUXING_COLORS: Record<string, string> = {
  '金': '#5ba09a', '水': '#3d7a75', '木': '#5d8a63', '火': '#c26158', '土': '#c9a94f',
};
const WUXING_BG: Record<string, string> = {
  '金': 'rgba(91,160,154,0.12)', '水': 'rgba(61,122,117,0.12)', '木': 'rgba(93,138,99,0.12)',
  '火': 'rgba(194,97,88,0.12)', '土': 'rgba(201,169,79,0.12)',
};

// ===== 六气→五行映射 =====
const QI_TO_WUXING: Record<string, string> = {
  '厥阴风木': '木', '少阴君火': '火', '少阳相火': '火',
  '太阴湿土': '土', '阳明燥金': '金', '太阳寒水': '水',
};

// ===== 五行中文→英文映射（体质联动用）=====
const CN_TO_EN: Record<string, string> = { '金': 'metal', '水': 'water', '木': 'wood', '火': 'fire', '土': 'earth' };

export default function YunQiClient() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'overview' | 'liuqi' | 'wubu' | 'constitution'>('overview');

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

  // 运气推算
  const wylq = useMemo(() => computeWuYunLiuQi(year), [year]);
  const decision = useMemo(() => computeYunQiClinicalDecision(year), [year]);
  const constitutionAdvice = useMemo(
    () => constitutionElement ? computeYunQiConstitutionAdvice(constitutionElement, wylq) : null,
    [constitutionElement, wylq],
  );
  const currentPeriod = useMemo(() => getCurrentQiPeriod(), []);

  // 年份导航
  const prevYear = useCallback(() => setYear(y => Math.max(1600, y - 1)), []);
  const nextYear = useCallback(() => setYear(y => Math.min(3000, y + 1)), []);

  // 60甲子速查数据（缓存计算，避免每次渲染重复60次推算）
  const jiaZi60 = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => {
      const y = 1984 + i;
      const gz = computeWuYunLiuQi(y);
      const tfsh = computeTianFuSuiHui(gz);
      return {
        year: y,
        tianGan: gz.tianGan,
        diZhi: gz.diZhi,
        ganZhi: gz.yearGanZhi,
        zhongYunName: gz.zhongYunName,
        isTianFu: tfsh.isTianFu,
        isSuiHui: tfsh.isSuiHui,
        isTaiYi: tfsh.isTaiYiTianFu,
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0a12] via-[#0d0d1a] to-[#0a0a12]">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-50 bg-[#0a0a12]/90 border-b border-white/5">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/healing" className="text-zinc-500 hover:text-white transition-colors text-sm">
            ← 疗愈
          </a>
          <h1 className="text-base font-bold tracking-wider">五运六气</h1>
          <div className="text-xs text-zinc-600">素问七篇大论</div>
        </div>
      </header>

      {/* ===== 年份选择器 ===== */}
      <section className="max-w-3xl mx-auto px-4 pt-6 pb-4">
        <div className="relative flex items-center justify-center gap-4">
          <button onClick={prevYear} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
            ←
          </button>
          <div className="text-center min-w-[180px]">
            <div className="text-3xl font-bold tracking-wider" style={{ color: WUXING_COLORS[wylq.zhongYun] }}>
              {wylq.yearGanZhi}
            </div>
            <div className="text-xs text-zinc-500 mt-0.5">公元 {year} 年</div>
          </div>
          <button onClick={nextYear} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
            →
          </button>
        </div>
        {/* 年份滑块 */}
        <input
          type="range" min={1600} max={3000} value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="w-full mt-3 accent-amber-500 h-1 opacity-60"
        />
      </section>

      {/* ===== 核心卡片：中运 + 司天在泉 ===== */}
      <section className="max-w-3xl mx-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl border border-white/5" style={{ background: WUXING_BG[wylq.zhongYun] }}>
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">中运</div>
            <div className="text-xl font-bold" style={{ color: WUXING_COLORS[wylq.zhongYun] }}>
              {wylq.zhongYunName}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {wylq.isTaiGuo ? '太过 · 气盛' : '不及 · 气衰'}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">司天 / 在泉</div>
            <div className="text-sm font-bold" style={{ color: WUXING_COLORS[wylq.siTianElement] }}>
              {wylq.siTian}
            </div>
            <div className="text-xs text-zinc-400 mt-0.5" style={{ color: WUXING_COLORS[wylq.zaiQuanElement] }}>
              {wylq.zaiQuan}
            </div>
          </div>
        </div>

        {/* 天符岁会提示 */}
        {decision.tianFuSuiHui.isTianFu && (
          <div className="mt-3 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-amber-400">
                {decision.tianFuSuiHui.isTaiYiTianFu ? '太一天符' : '天符'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {decision.tianFuSuiHui.isTaiYiTianFu ? '极危' : '偏盛'}
              </span>
            </div>
            <p className="text-xs text-zinc-300">{decision.tianFuSuiHui.description}</p>
            <p className="text-xs text-zinc-500 mt-1 italic">倪师按：{decision.tianFuSuiHui.niComment}</p>
          </div>
        )}
        {decision.tianFuSuiHui.isSuiHui && !decision.tianFuSuiHui.isTianFu && (
          <div className="mt-3 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-blue-400">岁会</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300">和缓</span>
            </div>
            <p className="text-xs text-zinc-300 mt-1">{decision.tianFuSuiHui.description}</p>
          </div>
        )}
      </section>

      {/* ===== Tab 切换 ===== */}
      <section className="max-w-3xl mx-auto px-4 pb-4">
        <div className="flex gap-1 bg-white/[0.03] p-1 rounded-xl">
          {([
            { key: 'overview', label: '概览' },
            { key: 'liuqi', label: '六气分期' },
            { key: 'wubu', label: '五步推运' },
            ...(constitutionElement ? [{ key: 'constitution', label: '体质联动' }] : []),
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex-1 py-2 text-xs rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white font-bold'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ===== Tab 内容 ===== */}
      <section className="max-w-3xl mx-auto px-4 pb-8">
        {/* === 概览 Tab === */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* 当前六气阶段 */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
              <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">当前所处</div>
              <div className="text-lg font-bold" style={{ color: WUXING_COLORS[QI_TO_WUXING[currentPeriod.hostQi] || '土'] }}>
                {currentPeriod.name}
              </div>
              <div className="text-xs text-zinc-400 mt-1">
                主气 {currentPeriod.hostQi} · 客气 {currentPeriod.guestQi}
              </div>
              <p className="text-xs text-zinc-300 mt-2">{currentPeriod.advice}</p>
            </div>

            {/* 病机/养生/饮食 三列 */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: '病机预测', text: wylq.bingJi, icon: '⚠' },
                { label: '养生建议', text: wylq.yangSheng, icon: '🧘' },
                { label: '饮食建议', text: wylq.yinShi, icon: '🍵' },
              ].map(item => (
                <div key={item.label} className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1.5">
                    {item.icon} {item.label}
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>

            {/* 经络宜忌 */}
            {(wylq.recommendedMeridians.length > 0 || wylq.contraindicatedMeridians.length > 0) && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">经络宜忌</div>
                <div className="flex flex-wrap gap-2">
                  {wylq.recommendedMeridians.map((m, i) => (
                    <span key={`y-${i}`} className="text-[11px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300">
                      宜 {m}
                    </span>
                  ))}
                  {wylq.contraindicatedMeridians.map((m, i) => (
                    <span key={`j-${i}`} className="text-[11px] px-2 py-1 rounded-lg bg-red-500/10 text-red-300">
                      忌 {m}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 古籍引用 */}
            <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-[10px] text-zinc-600 mb-2">经典依据</div>
              <p className="text-xs text-zinc-400 leading-relaxed italic">{wylq.classicRef}</p>
            </div>

            {/* 倪师总结 */}
            <div className="p-4 rounded-2xl border border-amber-500/10" style={{ background: 'rgba(201,169,79,0.04)' }}>
              <div className="text-[10px] text-amber-600/60 uppercase tracking-widest mb-2">倪师运气观</div>
              <p className="text-xs text-zinc-300 leading-relaxed">{decision.niSummary}</p>
            </div>
          </div>
        )}

        {/* === 六气分期 Tab === */}
        {activeTab === 'liuqi' && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-500 mb-2">主客气顺逆关系 · 六期推演</div>
            {decision.yunQiTongHua.map((tq, i) => {
              const lq = wylq.liuQi[i];
              const isCurrent = currentPeriod.period === i + 1;
              const relColor = tq.relationship === '顺化' ? '#4ade80' : tq.relationship === '逆化' ? '#ef4444' : '#fbbf24';

              return (
                <div
                  key={i}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent ? 'border-amber-500/30 bg-amber-500/[0.04]' : 'border-white/5 bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-sm font-bold ${isCurrent ? 'text-amber-400' : 'text-white'}`}>
                      {lq.name}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">当前</span>
                    )}
                    <span className="text-[10px] text-zinc-600 ml-auto">{lq.startDate} → {lq.endDate}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <div>
                      <div className="text-[10px] text-zinc-500 mb-0.5">主气</div>
                      <span className="text-sm font-bold" style={{ color: WUXING_COLORS[lq.zhuQiElement] }}>
                        {lq.zhuQi}
                      </span>
                    </div>
                    <div>
                      <div className="text-[10px] text-zinc-500 mb-0.5">客气</div>
                      <span className="text-sm font-bold" style={{ color: WUXING_COLORS[lq.keQiElement] }}>
                        {lq.keQi}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                      style={{ color: relColor, backgroundColor: `${relColor}15` }}
                    >
                      {tq.relationship}
                    </span>
                    <span className="text-[11px] text-zinc-400">{tq.description}</span>
                  </div>
                  <p className="text-[11px] text-zinc-500 leading-relaxed">{tq.clinicalAdvice}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* === 五步推运 Tab === */}
        {activeTab === 'wubu' && (
          <div className="space-y-3">
            <div className="text-xs text-zinc-500 mb-2">初运→终运 · 五步轮转</div>
            {/* 五步环形可视化 */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {decision.wuBuTuiYun.map((step, i) => (
                <div
                  key={step.step}
                  className="flex-shrink-0 w-[130px] p-3 rounded-xl border border-white/5 text-center"
                  style={{ background: WUXING_BG[step.element] }}
                >
                  <div className="text-[10px] text-zinc-500">{step.name}</div>
                  <div className="text-lg font-bold mt-1" style={{ color: WUXING_COLORS[step.element] }}>
                    {step.element}
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">
                    {step.isTaiGuo ? '太过' : '不及'}
                  </div>
                  <div className="text-[9px] text-zinc-600 mt-1.5">{step.period}</div>
                  <div className="text-[10px] text-zinc-400 mt-1 leading-relaxed">{step.clinicalNote}</div>
                </div>
              ))}
            </div>
            {/* 运气综合摘要 */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mt-4">
              <div className="text-[10px] text-zinc-500 mb-2">运气综合</div>
              <p className="text-xs text-zinc-300 leading-relaxed">{decision.summary}</p>
            </div>
          </div>
        )}

        {/* === 体质联动 Tab === */}
        {activeTab === 'constitution' && constitutionAdvice && (
          <div className="space-y-4">
            {/* 风险等级 */}
            <div className={`p-4 rounded-2xl border ${
              constitutionAdvice.riskLevel === '高' ? 'border-red-500/20 bg-red-500/[0.04]' :
              constitutionAdvice.riskLevel === '中' ? 'border-amber-500/20 bg-amber-500/[0.04]' :
              'border-emerald-500/20 bg-emerald-500/[0.04]'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest">运气-体质关系</div>
                <span className={`text-sm font-bold ${
                  constitutionAdvice.riskLevel === '高' ? 'text-red-400' :
                  constitutionAdvice.riskLevel === '中' ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {constitutionAdvice.relationship}
                </span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg font-bold" style={{ color: WUXING_COLORS[constitutionAdvice.constitutionElement] }}>
                  {constitutionAdvice.constitutionElement}行体质
                </span>
                <span className="text-zinc-600">↔</span>
                <span className="text-lg font-bold" style={{ color: WUXING_COLORS[constitutionAdvice.currentYearElement] }}>
                  {constitutionAdvice.currentYearElement}运{constitutionAdvice.isTaiGuo ? '太过' : '不及'}
                </span>
                <span className={`ml-auto text-xs px-2 py-0.5 rounded font-bold ${
                  constitutionAdvice.riskLevel === '高' ? 'bg-red-500/15 text-red-400' :
                  constitutionAdvice.riskLevel === '中' ? 'bg-amber-500/15 text-amber-400' :
                  'bg-emerald-500/15 text-emerald-400'
                }`}>
                  风险{constitutionAdvice.riskLevel}
                </span>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">{constitutionAdvice.advice}</p>
            </div>

            {/* 倪师按 */}
            <div className="p-4 rounded-2xl border border-amber-500/10" style={{ background: 'rgba(201,169,79,0.04)' }}>
              <div className="text-[10px] text-amber-600/60 uppercase tracking-widest mb-2">倪师辨证</div>
              <p className="text-xs text-zinc-300 leading-relaxed">{constitutionAdvice.niComment}</p>
            </div>

            {/* 推荐方剂 */}
            {constitutionAdvice.recommendedFormulas.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">推荐方剂</div>
                <div className="flex flex-wrap gap-2">
                  {constitutionAdvice.recommendedFormulas.map((f, i) => (
                    <a
                      key={i}
                      href={`/healing/jingfang`}
                      className="text-[11px] px-2 py-1 rounded-lg bg-blue-500/10 text-blue-300 hover:bg-blue-500/20 transition-colors"
                    >
                      {f}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* 推荐穴位 */}
            {constitutionAdvice.recommendedAcupoints.length > 0 && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">推荐穴位</div>
                <div className="flex flex-wrap gap-2">
                  {constitutionAdvice.recommendedAcupoints.map((a, i) => (
                    <a
                      key={i}
                      href={`/healing/acupoint`}
                      className="text-[11px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                    >
                      {a}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ===== 运气年历（60甲子循环图） ===== */}
      <section className="max-w-3xl mx-auto px-4 pb-8">
        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest">六十甲子运气速查</div>
            <div className="flex items-center gap-3 text-[9px] text-zinc-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500/40" />天符</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/40" />岁会</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500/60" />太一天符</span>
            </div>
          </div>
          <div className="grid grid-cols-10 gap-1">
            {jiaZi60.map((item) => {
              const isCurrentYear = item.year === new Date().getFullYear();
              const isSelected = item.year === year;
              // 天符/岁会/太一天符样式
              let specialClass = '';
              if (!isSelected) {
                if (item.isTaiYi) specialClass = 'bg-red-500/10 text-red-300';
                else if (item.isTianFu) specialClass = 'bg-amber-500/10 text-amber-300';
                else if (item.isSuiHui) specialClass = 'bg-blue-500/10 text-blue-300';
              }
              return (
                <button
                  key={item.year}
                  onClick={() => setYear(item.year)}
                  className={`text-[9px] p-1 rounded transition-all ${
                    isSelected
                      ? 'bg-amber-500/20 text-amber-300 font-bold ring-1 ring-amber-500/40'
                      : isCurrentYear
                      ? 'bg-white/10 text-white font-bold'
                      : specialClass || 'text-zinc-600 hover:bg-white/5 hover:text-zinc-400'
                  }`}
                  title={`${item.ganZhi}年 (公元${item.year}年) ${item.zhongYunName}${item.isTaiYi ? ' · 太一天符' : item.isTianFu ? ' · 天符' : item.isSuiHui ? ' · 岁会' : ''}`}
                >
                  {item.tianGan}{item.diZhi}
                </button>
              );
            })}
          </div>
          <div className="text-[10px] text-zinc-600 mt-2 text-center">
            当前: {new Date().getFullYear()}年 · 点击切换年份
          </div>
        </div>
      </section>
    </div>
  );
}
