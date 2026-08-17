import React, { memo, useMemo } from 'react';
import {
  type WuYunLiuQi,
  computeTianFuSuiHui,
  computeYunQiTongHua,
  computeWuBuTuiYun,
  computeYunQiClinicalDecision,
} from '@/lib/tcm-calendar';
import { WUXING_COLORS_DISPLAY } from './constants';

interface WuYunLiuQiModalProps {
  data: WuYunLiuQi;
  year: number;
  onClose: () => void;
  onYearChange: (year: number) => void;
}

export const WuYunLiuQiModal = memo(function WuYunLiuQiModal({
  data,
  year,
  onClose,
  onYearChange,
}: WuYunLiuQiModalProps) {
  // 深化数据
  const tianFuSuiHui = useMemo(() => computeTianFuSuiHui(data), [data]);
  const yunQiTongHua = useMemo(() => computeYunQiTongHua(data), [data]);
  const wuBuTuiYun = useMemo(() => computeWuBuTuiYun(data), [data]);

  // 顺逆关系颜色
  const relColors: Record<string, string> = {
    '顺化': '#4ade80',
    '逆化': '#ef4444',
    '同气': '#fbbf24',
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative bg-[#12121a] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-white mb-1">五运六气</h2>
        <p className="text-xs text-zinc-500 mb-4">基于《素问》七篇大论的运气推算</p>

        {/* 年份选择 */}
        <div className="mb-6">
          <label className="text-xs text-zinc-400 mb-2 block">年份选择</label>
          <input
            type="range"
            min={1600}
            max={3000}
            value={year}
            onChange={e => onYearChange(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-xs text-zinc-500 mt-1">
            <span>1600</span>
            <span className="text-white font-bold text-sm">{data.tianGan}{data.diZhi}年 (公元{year}年)</span>
            <span>3000</span>
          </div>
        </div>

        {/* 中运 + 司天在泉 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="p-3 bg-white/5 rounded-xl">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">中运</div>
            <div className="text-lg font-bold" style={{ color: WUXING_COLORS_DISPLAY[data.zhongYun] }}>
              {data.zhongYunName}
            </div>
            <div className="text-xs text-zinc-400 mt-1">
              {data.isTaiGuo ? '太过（气盛）' : '不及（气衰）'}
            </div>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">司天 / 在泉</div>
            <div className="text-sm font-bold text-white">{data.siTian}</div>
            <div className="text-xs text-zinc-400">{data.zaiQuan}</div>
          </div>
        </div>

        {/* 天符岁会 — 新增 */}
        {(tianFuSuiHui.isTianFu || tianFuSuiHui.isSuiHui) && (
          <div className="mb-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-amber-400">
                {tianFuSuiHui.isTaiYiTianFu ? '太一天符' : tianFuSuiHui.isTianFu ? '天符' : '岁会'}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                {tianFuSuiHui.isTaiYiTianFu ? '极危' : tianFuSuiHui.isTianFu ? '偏盛' : '和缓'}
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">{tianFuSuiHui.description}</p>
            <p className="text-xs text-zinc-400 mt-1">{tianFuSuiHui.clinicalSignificance}</p>
            <p className="text-xs text-zinc-500 mt-1 italic">倪师按：{tianFuSuiHui.niComment}</p>
          </div>
        )}

        {/* 六气 + 主客顺逆 — 增强 */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white mb-2">六气分期</h3>
          <div className="space-y-1.5">
            {data.liuQi.map((lq, i) => (
              <div key={i} className="p-2 bg-white/3 rounded-lg text-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-zinc-500 w-14 shrink-0">{lq.name}</span>
                  <span className="text-zinc-300 flex-1">
                    主气: <span style={{ color: WUXING_COLORS_DISPLAY[lq.zhuQiElement] }}>{lq.zhuQi}</span>
                  </span>
                  <span className="text-zinc-300 flex-1">
                    客气: <span style={{ color: WUXING_COLORS_DISPLAY[lq.keQiElement] }}>{lq.keQi}</span>
                  </span>
                  <span className="text-zinc-600 text-[10px]">{lq.startDate}→{lq.endDate}</span>
                </div>
                {/* 主客顺逆标签 */}
                {yunQiTongHua[i] && (
                  <div className="flex items-center gap-2 mt-1 pl-14">
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded"
                      style={{
                        color: relColors[yunQiTongHua[i].relationship],
                        backgroundColor: `${relColors[yunQiTongHua[i].relationship]}15`,
                      }}
                    >
                      {yunQiTongHua[i].relationship}
                    </span>
                    <span className="text-zinc-500 text-[10px]">{yunQiTongHua[i].description}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 五步推运 — 新增 */}
        <div className="mb-4">
          <h3 className="text-sm font-bold text-white mb-2">五步推运</h3>
          <div className="flex gap-2">
            {wuBuTuiYun.map((step) => (
              <div key={step.step} className="flex-1 p-2 bg-white/3 rounded-lg text-center">
                <div className="text-[10px] text-zinc-500">{step.name}</div>
                <div className="text-sm font-bold mt-0.5" style={{ color: WUXING_COLORS_DISPLAY[step.element] }}>
                  {step.element}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5">
                  {step.isTaiGuo ? '太过' : '不及'}
                </div>
                <div className="text-[10px] text-zinc-600 mt-1">{step.period}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{step.clinicalNote}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 病机预测 / 养生 / 饮食 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="p-3 bg-white/5 rounded-xl">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">病机预测</div>
            <p className="text-xs text-zinc-300 leading-relaxed">{data.bingJi}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">养生建议</div>
            <p className="text-xs text-zinc-300 leading-relaxed">{data.yangSheng}</p>
          </div>
          <div className="p-3 bg-white/5 rounded-xl">
            <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-1">饮食建议</div>
            <p className="text-xs text-zinc-300 leading-relaxed">{data.yinShi}</p>
          </div>
        </div>

        {/* 经络宜忌 */}
        {(data.recommendedMeridians.length > 0 || data.contraindicatedMeridians.length > 0) && (
          <div className="mb-4">
            <h3 className="text-sm font-bold text-white mb-2">经络宜忌</h3>
            <div className="flex flex-wrap gap-2">
              {data.recommendedMeridians.map((m, i) => (
                <span key={`y-${i}`} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-300">
                  宜{m}
                </span>
              ))}
              {data.contraindicatedMeridians.map((m, i) => (
                <span key={`j-${i}`} className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-300">
                  忌{m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
