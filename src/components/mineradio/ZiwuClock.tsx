'use client';

import { useState, useEffect, useRef, memo } from 'react';
import {
  SHICHEN_DATA,
  getCurrentShichen,
  getShichenProgress,
  getShichenTimeRange,
  getFourPillars,
  ELEMENT_ACCENT_COLORS,
  ELEMENT_COLORS,
  KEY_TO_ELEMENT,
  getShichenToneRecommendation,
  getShichenWeatherRecommendation,
  sheng,
  type ElementKey,
  type FourPillars,
  type ShichenData,
} from '@/lib/mineradio/shichen-engine';
import type { HealingTheme } from '@/lib/mineradio/weather-mood';
import { Music } from 'lucide-react';

/** 传统五行色 — 更饱和的中国传统色彩 */
const TRAD_COLORS: Record<ElementKey, { bg: string; text: string; border: string; light: string }> = {
  wood:  { bg: '#f0faf0', text: '#1a5c2a', border: '#5d8a63', light: '#d4edda' },
  fire:  { bg: '#fdf2f2', text: '#8b1a1a', border: '#c26158', light: '#f8d7da' },
  earth: { bg: '#fdf8ef', text: '#7a5c10', border: '#c9a94f', light: '#fff3cd' },
  metal: { bg: '#f0f8f8', text: '#1a5555', border: '#5ba09a', light: '#d1ecf1' },
  water: { bg: '#eff5fa', text: '#1a3a5c', border: '#3d7a75', light: '#d6e9f8' },
};

interface ZiwuClockProps {
  weatherMoodKey?: string;
  theme?: HealingTheme;
  compact?: boolean;
  onPlayShichenMusic?: (element: ElementKey, label: string) => void;
}

/**
 * 子午流注时钟 — 传统宣纸墨韵风格
 *
 * 设计理念：如展卷观图，以宣纸为底、墨笔为文、五行为饰
 *   - 宣纸暖底色，墨字高对比
 *   - 传统五行色点缀，不喧宾夺主
 *   - 圆形日晷计时，十二地支环布如天盘
 *   - 四柱八字、经络当令、五音推荐一目了然
 *
 * 基于子午流注时钟 https://github.com/eevil505/ziwuliuzhu-clock
 */
function ZiwuClock({ weatherMoodKey, theme, compact = false, onPlayShichenMusic }: ZiwuClockProps) {
  const [now, setNow] = useState<Date | null>(null);
  const [currentShichen, setCurrentShichen] = useState<ShichenData | null>(null);
  const [progress, setProgress] = useState(0);
  const [pillars, setPillars] = useState<FourPillars | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    const update = () => {
      const d = new Date();
      setNow(d);
      setCurrentShichen(getCurrentShichen(d));
      setProgress(getShichenProgress(d));
      setPillars(getFourPillars(d));
    };
    update();
    timerRef.current = setInterval(update, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  if (!now || !currentShichen || !pillars) {
    return (
      <div className="rounded-2xl bg-[#faf5ee] border border-[#d0c8b8] p-8 animate-pulse">
        <div className="h-52 flex items-center justify-center text-[#8a7a60] text-sm font-serif">
          正在推算时辰...
        </div>
      </div>
    );
  }

  const tradColor = TRAD_COLORS[currentShichen.elementKey];
  const hour = now.getHours();
  const minute = now.getMinutes();
  const second = now.getSeconds();
  const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;

  const recommendation = weatherMoodKey
    ? getShichenWeatherRecommendation(currentShichen.elementKey, weatherMoodKey)
    : null;
  const toneRec = getShichenToneRecommendation(currentShichen.elementKey);

  // SVG 时钟参数 — 大尺寸
  const svgSize = compact ? 300 : 360;
  const center = svgSize / 2;
  const outerR = svgSize / 2 - 12;
  const branchR = svgSize / 2 - 32;
  const organR = svgSize / 2 - 60;
  const elementDotR = svgSize / 2 - 78;

  return (
    <div
      className="rounded-2xl border overflow-hidden"
      style={{
        background: 'linear-gradient(145deg, #faf5ee 0%, #f5efe4 40%, #f0e8d8 100%)',
        borderColor: '#d0c8b8',
      }}
    >
      {/* ═══ 标题栏 ═══ */}
      <div
        className="px-5 py-3.5 flex items-center justify-between border-b"
        style={{ borderColor: '#e0d8c8', background: `linear-gradient(90deg, ${tradColor.bg} 0%, #faf5ee 100%)` }}
      >
        <div className="flex items-center gap-3">
          <span
            className="text-xl font-bold font-serif"
            style={{ color: tradColor.text }}
          >
            子午流注
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded font-serif"
            style={{ background: tradColor.light, color: tradColor.text }}
          >
            {currentShichen.branch}时 · {currentShichen.meridian}
          </span>
        </div>
        <span className="text-[#8a7a60] text-sm font-mono tracking-wide">{timeStr}</span>
      </div>

      {/* ═══ 日晷时钟面 ═══ */}
      <div className="px-5 pt-5 pb-3 flex justify-center">
        <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
          {/* 外圈装饰环 */}
          <circle cx={center} cy={center} r={outerR} fill="none" stroke="#e0d8c8" strokeWidth="1.5" />
          <circle cx={center} cy={center} r={outerR - 8} fill="none" stroke="#ebe5d8" strokeWidth="0.5" />

          {/* 进度弧 — 当前时辰走过的时间 */}
          {(() => {
            const scIdx = currentShichen.index;
            const startAngle = scIdx * 30 - 90;
            const endAngle = startAngle + progress * 30;
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            const x1 = center + (outerR - 4) * Math.cos(startRad);
            const y1 = center + (outerR - 4) * Math.sin(startRad);
            const x2 = center + (outerR - 4) * Math.cos(endRad);
            const y2 = center + (outerR - 4) * Math.sin(endRad);
            const largeArc = progress > 0.5 ? 1 : 0;
            return (
              <path
                d={`M ${x1} ${y1} A ${outerR - 4} ${outerR - 4} 0 ${largeArc} 1 ${x2} ${y2}`}
                fill="none"
                stroke={tradColor.border}
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.7"
              />
            );
          })()}

          {/* 十二地支 + 脏腑 + 五行色标 */}
          {SHICHEN_DATA.map((sc, i) => {
            const angle = i * 30 - 90;
            const rad = (angle * Math.PI) / 180;
            const isActive = i === currentShichen.index;
            const tc = TRAD_COLORS[sc.elementKey];

            const bx = center + branchR * Math.cos(rad);
            const by = center + branchR * Math.sin(rad);
            const ox = center + organR * Math.cos(rad);
            const oy = center + organR * Math.sin(rad);
            const ex = center + elementDotR * Math.cos(rad);
            const ey = center + elementDotR * Math.sin(rad);

            return (
              <g key={sc.branch}>
                {/* 当前时辰高亮扇区 */}
                {isActive && (() => {
                  const a1 = i * 30 - 90 - 0.5;
                  const a2 = (i + 1) * 30 - 90 + 0.5;
                  const r1 = (a1 * Math.PI) / 180;
                  const r2 = (a2 * Math.PI) / 180;
                  const innerR = elementDotR - 10;
                  return (
                    <path
                      d={`M ${center + outerR * Math.cos(r1)} ${center + outerR * Math.sin(r1)}
                          A ${outerR} ${outerR} 0 0 1 ${center + outerR * Math.cos(r2)} ${center + outerR * Math.sin(r2)}
                          L ${center + innerR * Math.cos(r2)} ${center + innerR * Math.sin(r2)}
                          A ${innerR} ${innerR} 0 0 0 ${center + innerR * Math.cos(r1)} ${center + innerR * Math.sin(r1)} Z`}
                      fill={tc.bg}
                      opacity="0.6"
                    />
                  );
                })()}

                {/* 五行色标点 */}
                <circle
                  cx={ex} cy={ey}
                  r={isActive ? 7 : 4}
                  fill={tc.border}
                  opacity={isActive ? 0.9 : 0.25}
                />
                {isActive && (
                  <circle cx={ex} cy={ey} r={12} fill={tc.border} opacity="0.12" />
                )}

                {/* 脏腑名 */}
                <text
                  x={ox} y={oy}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isActive ? tc.text : '#a09080'}
                  fontSize={isActive ? 13 : 10}
                  fontWeight={isActive ? 'bold' : 'normal'}
                  fontFamily="'Noto Serif SC', 'SimSun', serif"
                >
                  {sc.organ}
                </text>

                {/* 地支大字 */}
                <text
                  x={bx} y={by}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isActive ? tc.text : '#5a4a3a'}
                  fontSize={isActive ? 20 : 14}
                  fontWeight={isActive ? 'bold' : 'normal'}
                  fontFamily="'Noto Serif SC', 'SimSun', serif"
                >
                  {sc.branch}
                </text>
              </g>
            );
          })}

          {/* 中心圆盘 */}
          <circle cx={center} cy={center} r={56} fill="#faf5ee" stroke="#d0c8b8" strokeWidth="1" />
          <circle cx={center} cy={center} r={52} fill={`${tradColor.bg}80`} stroke={tradColor.border} strokeWidth="0.5" opacity="0.5" />

          {/* 中心：当前时辰 */}
          <text
            x={center} y={center - 16}
            textAnchor="middle"
            dominantBaseline="central"
            fill={tradColor.text}
            fontSize="36"
            fontWeight="760"
            fontFamily="'Noto Serif SC', 'STSong', serif"
          >
            {currentShichen.branch}
          </text>
          <text
            x={center} y={center + 10}
            textAnchor="middle"
            fill={tradColor.text}
            fontSize="13"
            fontWeight="bold"
            fontFamily="'Noto Serif SC', 'SimSun', serif"
          >
            {currentShichen.organ} · {currentShichen.element}行
          </text>
          <text
            x={center} y={center + 28}
            textAnchor="middle"
            fill="#8a7a60"
            fontSize="10"
            fontFamily="'Noto Serif SC', 'SimSun', serif"
          >
            {currentShichen.periodLabel} · {getShichenTimeRange(currentShichen.index)}
          </text>
        </svg>
      </div>

      {/* ═══ 四柱八字 ═══ */}
      <div className="px-5 pb-3 flex justify-center gap-3">
        {[
          { label: '年柱', value: pillars.year },
          { label: '月柱', value: pillars.month },
          { label: '日柱', value: pillars.day },
          { label: '时柱', value: pillars.hour },
        ].map(p => (
          <div key={p.label} className="text-center">
            <div className="text-[10px] text-[#8a7a60] mb-1 font-serif">{p.label}</div>
            <div
              className="text-base font-bold font-serif px-3 py-1.5 rounded-lg"
              style={{
                background: tradColor.light,
                color: tradColor.text,
                border: `1px solid ${tradColor.border}40`,
              }}
            >
              {p.value}
            </div>
          </div>
        ))}
      </div>

      {/* ═══ 经络当令 ═══ */}
      <div className="px-5 pb-3">
        <div
          className="p-4 rounded-xl"
          style={{ background: tradColor.bg, border: `1px solid ${tradColor.border}30` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-base font-bold font-serif" style={{ color: tradColor.text }}>
                {currentShichen.meridian}
              </span>
              <span className="text-xs text-[#8a7a60] ml-2">当令</span>
            </div>
            <span
              className="text-xs px-2 py-0.5 rounded-full font-serif"
              style={{ background: tradColor.light, color: tradColor.text }}
            >
              {currentShichen.element}行 · {toneRec.primary.name}
            </span>
          </div>
          <p className="text-sm text-[#4a3a2a] leading-relaxed">
            {currentShichen.wellnessTip}
          </p>
          <div className="flex items-center gap-2 mt-2 text-xs text-[#6a5a4a]">
            <Music size={12} style={{ color: tradColor.border }} />
            <span className="font-serif">
              {toneRec.primary.name}（{toneRec.primary.desc}）
              {toneRec.primary.name !== toneRec.secondary.name && (
                <> → {toneRec.secondary.name}（相生补益）</>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ═══ 时辰+天气联动 ═══ */}
      {recommendation && (() => {
        const rc = TRAD_COLORS[recommendation.primaryElement];
        return (
          <div className="px-5 pb-3">
            <div
              className="p-4 rounded-xl"
              style={{ background: rc.bg, border: `1px solid ${rc.border}30` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-bold font-serif" style={{ color: rc.text }}>
                  天时天候 · 合参
                </span>
                <span
                  className="text-[10px] px-1.5 py-0.5 rounded"
                  style={{ background: rc.light, color: rc.text }}
                >
                  {KEY_TO_ELEMENT[recommendation.primaryElement]}行主 · {KEY_TO_ELEMENT[recommendation.secondaryElement]}行辅
                </span>
              </div>
              <p className="text-sm text-[#4a3a2a] leading-relaxed mb-2">
                {recommendation.reason}
              </p>
              <div className="space-y-1 text-xs text-[#6a5a4a]">
                <p>
                  <span className="font-bold" style={{ color: rc.text }}>天时：</span>
                  {recommendation.shichenAdvice}
                </p>
                <p>
                  <span className="font-bold" style={{ color: rc.text }}>天候：</span>
                  {recommendation.weatherAdvice}
                </p>
              </div>

              {onPlayShichenMusic && (
                <button
                  onClick={() => onPlayShichenMusic(
                    recommendation.primaryElement,
                    `${currentShichen.branch}时·${KEY_TO_ELEMENT[recommendation.primaryElement]}行`,
                  )}
                  className="mt-3 w-full py-2.5 rounded-xl text-sm font-bold font-serif flex items-center justify-center gap-2 transition"
                  style={{
                    background: rc.border,
                    color: '#fff',
                  }}
                >
                  <Music size={14} />
                  聆听{toneRec.primary.name} — {KEY_TO_ELEMENT[recommendation.primaryElement]}行疗愈
                </button>
              )}
            </div>
          </div>
        );
      })()}

      {/* ═══ 十二时辰总览 ═══ */}
      {!compact && (
        <div className="px-5 pb-4">
          <div className="grid grid-cols-6 gap-2">
            {SHICHEN_DATA.map((sc, i) => {
              const isActive = i === currentShichen.index;
              const tc = TRAD_COLORS[sc.elementKey];
              return (
                <div
                  key={sc.branch}
                  className={`p-2 rounded-lg text-center transition ${
                    isActive ? 'ring-2' : ''
                  }`}
                  style={isActive ? {
                    background: tc.bg,
                    boxShadow: `0 0 0 2px ${tc.border}`,
                    border: `1.5px solid ${tc.border}`,
                  } : {
                    background: '#f8f4ec',
                    border: '1px solid #e8e0d0',
                  }}
                >
                  <div
                    className="text-base font-bold font-serif"
                    style={{ color: isActive ? tc.text : '#8a7a60' }}
                  >
                    {sc.branch}
                  </div>
                  <div className="text-[10px] text-[#a09080]">{sc.organ}</div>
                  <div
                    className="text-[8px] mt-0.5 px-1 py-0.5 rounded-sm inline-block"
                    style={isActive ? { background: tc.light, color: tc.text } : { background: '#f0ebe0', color: '#a09080' }}
                  >
                    {sc.element}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ 详细面板 ═══ */}
      {!compact && (
        <div className="px-5 pb-4">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="w-full py-2 text-xs text-[#8a7a60] hover:text-[#4a3a2a] transition font-serif text-center"
          >
            {showDetail ? '▲ 收起时辰详解' : '▼ 展开时辰详解'}
          </button>

          {showDetail && (
            <div className="mt-2 space-y-1">
              {SHICHEN_DATA.map((sc, i) => {
                const isActive = i === currentShichen.index;
                const tc = TRAD_COLORS[sc.elementKey];
                return (
                  <div
                    key={sc.branch}
                    className="p-3 rounded-lg flex items-start gap-3"
                    style={isActive ? { background: tc.bg } : { background: '#faf5ee' }}
                  >
                    <div className="flex-shrink-0 w-8 text-center">
                      <div
                        className="text-lg font-bold font-serif"
                        style={{ color: isActive ? tc.text : '#5a4a3a' }}
                      >
                        {sc.branch}
                      </div>
                      <div className="text-[9px] text-[#8a7a60]">{sc.periodLabel}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold font-serif" style={{ color: isActive ? tc.text : '#3a2a1a' }}>
                          {sc.meridian}
                        </span>
                        <span
                          className="text-[9px] px-1.5 py-0.5 rounded-sm"
                          style={{ background: tc.light, color: tc.text }}
                        >
                          {sc.element}行
                        </span>
                      </div>
                      <p className="text-xs text-[#6a5a4a] leading-relaxed">{sc.wellnessTip}</p>
                      <div className="text-[10px] text-[#9a8a7a] mt-0.5 font-mono">
                        {getShichenTimeRange(i)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ 底部 ═══ */}
      <div className="px-5 py-3 flex justify-between items-center border-t" style={{ borderColor: '#e8e0d0' }}>
        <div className="flex gap-3">
          {(['wood', 'fire', 'earth', 'metal', 'water'] as const).map(el => {
            const tc = TRAD_COLORS[el];
            const isCurrent = el === currentShichen.elementKey;
            return (
              <div key={el} className="flex items-center gap-1">
                <div
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{
                    background: tc.border,
                    opacity: isCurrent ? 1 : 0.4,
                    boxShadow: isCurrent ? `0 0 0 1px ${tc.border}` : undefined,
                  }}
                />
                <span
                  className="text-[10px] font-serif"
                  style={{ color: isCurrent ? tc.text : '#a09080', fontWeight: isCurrent ? 'bold' : 'normal' }}
                >
                  {KEY_TO_ELEMENT[el]}
                </span>
              </div>
            );
          })}
        </div>
        <a
          href="https://github.com/eevil505/ziwuliuzhu-clock"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[9px] text-[#b0a890] hover:text-[#8a7a60] transition font-serif"
        >
          子午流注 · 墨水屏时钟
        </a>
      </div>
    </div>
  );
}

export default memo(ZiwuClock);
