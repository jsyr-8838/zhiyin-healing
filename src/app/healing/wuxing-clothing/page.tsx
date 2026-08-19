'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import HealingHeader from '@/components/layout/HealingHeader';
import BottomNav from '@/components/BottomNav';
import {
  calculateWuxingClothing,
  type WuXing,
  type WuxingClothingResult,
  EL,
  CATS,
  DAYEL_LABEL,
  LD_CN,
  GEN,
} from '@/lib/wuxing-clothing';
import { Shirt, ChevronDown, ChevronUp } from 'lucide-react';

// ===== 更多颜色展示 =====
function MoreColors({ el, mainColor }: { el: WuXing; mainColor: string }) {
  const [open, setOpen] = useState(false);
  const ed = EL[el];
  if (!ed) return null;
  const lightHexes = ['#f5f5f5', '#fafafa', '#efebe9', '#fffde7', '#f3e5f5'];

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 px-3 py-1 rounded-full text-[11px] transition-colors hover:bg-gray-50"
        style={{ border: `1px solid ${mainColor}33`, color: mainColor }}
      >
        {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        {open ? '收起' : `查看全部 ${ed.allColors.length} 种颜色`}
      </button>
      {open && (
        <div className="mt-2.5 grid grid-cols-5 gap-2">
          {ed.allColors.map((c, i) => (
            <div key={i} className="text-center">
              <div
                className="w-9 h-9 rounded-full mx-auto mb-1"
                style={{
                  background: c.hex,
                  border: lightHexes.includes(c.hex) ? '1.5px solid #ccc' : '1.5px solid rgba(255,255,255,0.5)',
                  boxShadow: `0 2px 8px ${c.hex}44`,
                }}
              />
              <div className="text-[8px] text-gray-500 leading-tight">{c.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== 五行图示 SVG =====
function PentagonDiagram({ dayEl }: { dayEl: WuXing }) {
  const els: WuXing[] = ['木', '火', '土', '金', '水'];
  const cx = 110, cy = 105, r = 66;

  const pts = els.map((_, i) => {
    const a = (i * 72 - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });

  return (
    <svg viewBox="0 0 220 210" className="w-full max-w-[210px] mx-auto">
      <defs>
        <marker id="ar2wx" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
          <path d="M0,0 L5,2.5 L0,5 Z" fill="#c0b89a" />
        </marker>
      </defs>
      {/* 相生箭头 */}
      {els.map((e, i) => {
        const target = GEN[e];
        const ti = els.indexOf(target);
        const [x1, y1] = pts[i], [x2, y2] = pts[ti];
        const dx = x2 - x1, dy = y2 - y1, len = Math.sqrt(dx * dx + dy * dy);
        return (
          <line key={e} x1={x1} y1={y1}
            x2={x1 + dx * (len - 23) / len} y2={y1 + dy * (len - 23) / len}
            stroke="#d5cbb8" strokeWidth="1.3" markerEnd="url(#ar2wx)" />
        );
      })}
      {/* 五行圆点 */}
      {els.map((e, i) => {
        const [px, py] = pts[i];
        const isDay = e === dayEl;
        return (
          <g key={e}>
            <circle cx={px} cy={py} r={isDay ? 27 : 21}
              fill={isDay ? EL[e].main : EL[e].bg}
              stroke={EL[e].main} strokeWidth={isDay ? 2.5 : 1.5} />
            <text x={px} y={py - 3} textAnchor="middle"
              fontSize={isDay ? 18 : 15} fontWeight={isDay ? 700 : 500}
              fill={isDay ? '#fff' : EL[e].main} fontFamily="serif">{e}</text>
            <text x={px} y={py + 11} textAnchor="middle"
              fontSize="8.5"
              fill={isDay ? 'rgba(255,255,255,0.8)' : '#aaa'}
              fontFamily="sans-serif">{EL[e].colors[0]}</text>
          </g>
        );
      })}
    </svg>
  );
}

export default function WuxingClothingPage() {
  const [mounted, setMounted] = useState(false);
  const now = useRef(new Date());
  const [year, setYear] = useState(now.current.getFullYear());
  const [month, setMonth] = useState(now.current.getMonth() + 1);
  const [day, setDay] = useState(now.current.getDate());

  // 客户端挂载后再渲染日期相关内容，避免 hydration mismatch
  useEffect(() => { setMounted(true); }, []);

  const maxDay = new Date(year, month, 0).getDate();

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [maxDay]);

  const result: WuxingClothingResult = useMemo(
    () => calculateWuxingClothing(year, month, day, maxDay),
    [year, month, day, maxDay],
  );

  const { sb, dayEl, lunar, wday } = result;
  const eld = EL[dayEl];

  return (
    <PageContainer theme="healing">
      <HealingHeader
        title="五行穿衣"
        subtitle="依日柱地支五行·论穿衣配色之道"
        element="earth"
      />

      <div className="px-4 pt-2 pb-24 space-y-3">
        {!mounted ? (
          <div className="text-center py-12 text-gray-400 text-sm">加载中...</div>
        ) : (
        <>
        {/* ===== 日期选择卡片 ===== */}
        <div className="glass-card p-5 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500/50" />

          <div className="flex items-center gap-2 mb-3">
            <Shirt size={14} className="text-amber-600" />
            <span className="text-[11px] text-amber-700 tracking-widest font-bold">选择日期</span>
          </div>

          <div className="flex gap-2">
            <select value={year} onChange={e => setYear(+e.target.value)}
              className="flex-[2] px-2 py-2 rounded-lg border border-amber-200 bg-amber-50/50 text-sm text-gray-800 font-serif focus:outline-none focus:ring-2 focus:ring-amber-300">
              {Array.from({ length: 130 }, (_, i) => 1970 + i).map(yr => (
                <option key={yr} value={yr}>{yr}年</option>
              ))}
            </select>
            <select value={month} onChange={e => setMonth(+e.target.value)}
              className="flex-[1.5] px-2 py-2 rounded-lg border border-amber-200 bg-amber-50/50 text-sm text-gray-800 font-serif focus:outline-none focus:ring-2 focus:ring-amber-300">
              {Array.from({ length: 12 }, (_, i) => i + 1).map(mo => (
                <option key={mo} value={mo}>{mo}月</option>
              ))}
            </select>
            <select value={Math.min(day, maxDay)} onChange={e => setDay(+e.target.value)}
              className="flex-[1.5] px-2 py-2 rounded-lg border border-amber-200 bg-amber-50/50 text-sm text-gray-800 font-serif focus:outline-none focus:ring-2 focus:ring-amber-300">
              {Array.from({ length: maxDay }, (_, i) => i + 1).map(dd => (
                <option key={dd} value={dd}>{dd}日</option>
              ))}
            </select>
          </div>

          {lunar ? (
            <div className="mt-5 text-center">
              <div className="text-[11px] text-gray-400 mb-1.5">
                {year}年{month}月{Math.min(day, maxDay)}日 · 星期{wday} · 日柱 {sb.stem}{sb.branch}
              </div>
              <div className="text-xl font-black font-serif text-red-800 tracking-[3px] mb-1">
                {lunar.yearName}年
              </div>
              <div className="text-base font-semibold font-serif text-gray-700 tracking-wider mb-3">
                农历 {lunar.monthLabel}月{LD_CN[lunar.ld - 1] ?? lunar.ld}
              </div>
              <div
                className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full"
                style={{ background: eld.bg, border: `2px solid ${eld.main}33` }}
              >
                <span className="text-xs text-gray-500">日支五行</span>
                <span className="text-2xl font-black" style={{ color: eld.main }}>{dayEl}</span>
                <span className="text-[11px] text-gray-400">{DAYEL_LABEL[dayEl]}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">
              当前环境不支持农历转换，请使用较新的 Chrome / Edge / Safari 浏览器
            </div>
          )}
        </div>

        {/* ===== 五色穿衣卡片 ===== */}
        {lunar && CATS.map(cat => {
          const el = cat.rel(dayEl);
          const ed = EL[el];
          if (!ed) return null;
          return (
            <div key={cat.key} className="glass-card overflow-hidden relative">
              {/* 标题栏 */}
              <div className="px-4 py-2.5 flex items-center justify-between" style={{ background: cat.bar }}>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/85">{cat.icon}</span>
                  <span className="text-sm font-bold text-white tracking-wider font-serif">{cat.title}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/25 whitespace-nowrap">
                  {cat.badge(dayEl, el)}
                </span>
              </div>
              {/* 内容区 */}
              <div className="p-4">
                <div className="flex gap-3 mb-3 items-start">
                  {ed.hexes.map((hex, i) => (
                    <div key={i} className="text-center min-w-[48px]">
                      <div
                        className="w-11 h-11 rounded-full mx-auto mb-1"
                        style={{
                          background: hex,
                          border: hex === '#e0e0e0' ? '1.5px solid #bbb' : '1.5px solid rgba(255,255,255,0.5)',
                          boxShadow: `0 3px 10px ${hex}44`,
                        }}
                      />
                      <div className="text-[10px] text-gray-500 leading-tight">{ed.colors[i]}</div>
                    </div>
                  ))}
                  <div
                    className="ml-auto w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: ed.bg, border: `2px solid ${ed.main}33` }}
                  >
                    <span className="text-base font-black" style={{ color: ed.main }}>{el}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-800 font-semibold font-serif leading-relaxed mb-1.5">
                  {cat.desc(dayEl, el)}
                </div>
                <div className="text-xs text-gray-500 leading-relaxed whitespace-pre-line border-t border-gray-100 pt-2">
                  {cat.detail}
                </div>
                <MoreColors el={el} mainColor={ed.main} />
              </div>
            </div>
          );
        })}

        {/* ===== 五行图示 ===== */}
        {lunar && (
          <div className="glass-card p-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500/50" />
            <div className="flex items-center gap-2 mb-3">
              <div className="w-0.5 h-4 rounded-full bg-amber-500" />
              <span className="text-[11px] text-amber-700 tracking-widest font-bold">五行图示</span>
              <span className="text-[11px] text-gray-400 ml-auto">
                {sb.stem}{sb.branch}日 · {DAYEL_LABEL[dayEl]}
              </span>
            </div>
            <PentagonDiagram dayEl={dayEl} />
            <div className="text-[10px] text-gray-400 text-center leading-relaxed mt-2">
              相生（→）：木→火→土→金→水→木<br />
              相克：木克土 · 火克金 · 土克水 · 金克木 · 水克火
            </div>
          </div>
        )}

        {/* ===== 前往五行体质 ===== */}
        {lunar && (
          <Link href="/diagnose/wuxing"
            className="glass-card p-4 flex items-center gap-3 transition hover:shadow-md hover:-translate-y-0.5 relative overflow-hidden ring-1 ring-amber-400/20">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-amber-500/50" />
            <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-amber-700 flex-shrink-0">
              <Shirt size={18} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-sm font-serif text-gray-800">五行体质测算</h4>
              <p className="text-[10px] mt-0.5 text-gray-500">基于四柱八字推算您的五行体质</p>
            </div>
          </Link>
        )}

        {/* ===== 底部提示 ===== */}
        {lunar && (
          <div className="text-center pt-4 pb-2 leading-loose">
            <div className="text-[11px] text-amber-700/60 tracking-[3px]">以上穿衣搭配仅供参考</div>
            <div className="text-[11px] text-amber-700/60 tracking-[3px]">祝您开心快乐　一切顺遂</div>
            <div className="text-[10px] text-gray-400 mt-2">基于日柱地支五行推算</div>
          </div>
        )}
        </>
        )}
      </div>

      <BottomNav />
    </PageContainer>
  );
}
