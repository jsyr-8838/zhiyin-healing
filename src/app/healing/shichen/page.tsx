'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PageContainer from '@/components/layout/PageContainer';
import BottomNav from '@/components/BottomNav';
import HealingHeader from '@/components/layout/HealingHeader';
import { SHICHEN_LIST, getCurrentShichen, getNextShichen, type ShichenEntry } from '@/lib/shichen-data';
import { Clock, MapPin, Sparkles, Sun, Moon, ArrowRight } from 'lucide-react';

// ═══════════════════════════════════════
// 五行颜色映射（国风暖色调）
// ═══════════════════════════════════════

const WUXING_STYLE: Record<string, { bg: string; text: string; accent: string; border: string; gradient: string }> = {
  wood:   { bg: 'bg-emerald-500/10', text: 'text-emerald-600', accent: 'bg-emerald-500', border: 'border-emerald-500/20', gradient: 'from-emerald-400 to-emerald-600' },
  fire:   { bg: 'bg-red-500/10', text: 'text-red-600', accent: 'bg-red-500', border: 'border-red-500/20', gradient: 'from-red-400 to-red-600' },
  earth:  { bg: 'bg-amber-500/10', text: 'text-amber-600', accent: 'bg-amber-500', border: 'border-amber-500/20', gradient: 'from-amber-400 to-amber-600' },
  metal:  { bg: 'bg-teal-500/10', text: 'text-teal-600', accent: 'bg-teal-500', border: 'border-teal-500/20', gradient: 'from-teal-400 to-teal-600' },
  water:  { bg: 'bg-blue-500/10', text: 'text-blue-600', accent: 'bg-blue-500', border: 'border-blue-500/20', gradient: 'from-blue-400 to-blue-600' },
};

// 时辰时间轴可视化色
const SHICHEN_COLOR: Record<string, string> = {
  '子时': '#6366f1', '丑时': '#7c3aed', '寅时': '#0ea5e9',
  '卯时': '#f59e0b', '辰时': '#f97316', '巳时': '#eab308',
  '午时': '#ef4444', '未时': '#f43f5e', '申时': '#06b6d4',
  '酉时': '#3b82f6', '戌时': '#8b5cf6', '亥时': '#4f46e5',
};

// ═══════════════════════════════════════
// 当前时辰卡（高亮展示）
// ═══════════════════════════════════════

function CurrentShichenCard({ entry, timeText }: { entry: ShichenEntry; timeText: string }) {
  const style = WUXING_STYLE[entry.wuxing];
  const next = getNextShichen(entry.name);

  return (
    <div className={`relative overflow-hidden rounded-2xl ${style.bg} border ${style.border} p-5`}>
      {/* 背景大图标 */}
      <div className="absolute -right-4 -top-4 text-8xl opacity-10 select-none">
        {entry.icon}
      </div>

      <div className="relative z-10">
        {/* 时间显示 */}
        <div className="flex items-center gap-2 mb-1">
          <Clock className={`w-4 h-4 ${style.text}`} />
          <span className={`text-sm font-medium ${style.text}`}>当前时间 {timeText}</span>
        </div>

        {/* 时辰名 + 经络 */}
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-3xl font-bold text-[#2d2417]">{entry.name}</span>
          <span className={`text-lg font-semibold ${style.text}`}>{entry.meridian}当令</span>
        </div>

        {/* 功效 */}
        <div className="mb-3">
          <div className="text-xs text-[#8b7b6b] mb-1">调理功效</div>
          <div className="text-sm text-[#4a3f35] font-medium">{entry.acupunctureEffect}</div>
        </div>

        {/* 推荐穴位 */}
        <div className="mb-3">
          <div className="text-xs text-[#8b7b6b] mb-1">推荐穴位</div>
          <div className="flex flex-wrap gap-2">
            {entry.acupunctureCodes.map((code, i) => (
              <Link
                key={code}
                href={`/meridian?focus=${code}`}
                className={`px-3 py-1 rounded-full text-xs font-medium bg-white/70 border ${style.border} ${style.text} hover:bg-white transition-colors active:scale-95`}
              >
                <MapPin className="w-3 h-3 inline mr-1" />
                {code}
              </Link>
            ))}
          </div>
        </div>

        {/* 调养建议 */}
        <div className="mb-3 p-3 rounded-lg bg-white/50">
          <div className="flex items-start gap-2">
            <Sparkles className={`w-4 h-4 ${style.text} mt-0.5 flex-shrink-0`} />
            <span className="text-sm text-[#4a3f35]">{entry.tip}</span>
          </div>
        </div>

        {/* 下一时辰 */}
        <div className="flex items-center gap-2 text-xs text-[#8b7b6b]">
          <span>下一时辰</span>
          <ArrowRight className="w-3 h-3" />
          <span className="font-medium">{next.icon} {next.name} · {next.meridian}</span>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// 12时辰时间轴
// ═══════════════════════════════════════

function ShichenTimeline({
  currentIndex,
  onSelect,
}: {
  currentIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="relative">
      {/* 时间轴线 */}
      <div className="absolute left-0 right-0 top-[28px] h-[2px] bg-gradient-to-r from-indigo-400 via-amber-300 to-indigo-400 opacity-30" />

      <div className="flex justify-between relative z-10 overflow-x-auto pb-2 -mx-1 px-1 gap-1">
        {SHICHEN_LIST.map((s, i) => {
          const isActive = i === currentIndex;
          const color = SHICHEN_COLOR[s.name];
          return (
            <button
              key={s.name}
              onClick={() => onSelect(i)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
            >
              {/* 圆点 */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
                  isActive
                    ? 'scale-125 shadow-lg ring-2 ring-white'
                    : 'group-hover:scale-110'
                }`}
                style={{
                  backgroundColor: isActive ? color : `${color}33`,
                  color: isActive ? '#fff' : color,
                }}
              >
                {isActive ? s.icon : ''}
              </div>
              {/* 时辰名 */}
              <div
                className={`text-[10px] font-medium whitespace-nowrap ${
                  isActive ? 'text-[#2d2417]' : 'text-[#8b7b6b]'
                }`}
              >
                {s.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// 时辰详情卡
// ═══════════════════════════════════════

function ShichenDetailCard({ entry }: { entry: ShichenEntry }) {
  const style = WUXING_STYLE[entry.wuxing];
  const [hStart, hEnd] = [entry.startHour, entry.endHour];
  const timeRange = hStart === 23
    ? '23:00 - 01:00（跨日）'
    : `${String(hStart).padStart(2, '0')}:00 - ${String(hEnd).padStart(2, '0')}:00`;

  return (
    <div className={`rounded-xl bg-white/60 border ${style.border} overflow-hidden`}>
      {/* 头部 */}
      <div className={`px-4 py-3 ${style.bg} flex items-center justify-between`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{entry.icon}</span>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-[#2d2417]">{entry.name}</span>
              <span className={`text-sm ${style.text}`}>{entry.meridian}</span>
            </div>
            <div className="text-xs text-[#8b7b6b]">{timeRange}</div>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs ${style.bg} ${style.text} font-medium`}>
          {entry.wuxing === 'wood' ? '木' : entry.wuxing === 'fire' ? '火' : entry.wuxing === 'earth' ? '土' : entry.wuxing === 'metal' ? '金' : '水'}
        </div>
      </div>

      {/* 内容 */}
      <div className="px-4 py-3 space-y-3">
        {/* 推荐穴位 */}
        <div>
          <div className="text-xs font-medium text-[#8b7b6b] mb-1.5">针灸推荐</div>
          <div className="text-sm text-[#4a3f35] mb-2">{entry.acupuncture}</div>
          <div className="flex flex-wrap gap-1.5">
            {entry.acupunctureCodes.map(code => (
              <Link
                key={code}
                href={`/meridian?focus=${code}`}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium bg-white/70 border ${style.border} ${style.text} hover:bg-white transition-colors active:scale-95`}
              >
                <MapPin className="w-3 h-3 inline mr-0.5" />
                {code} → 定位
              </Link>
            ))}
          </div>
        </div>

        {/* 功效 */}
        <div className="p-2.5 rounded-lg bg-white/50">
          <div className="text-xs font-medium text-[#8b7b6b] mb-0.5">功效</div>
          <div className="text-sm text-[#4a3f35]">{entry.acupunctureEffect}</div>
        </div>

        {/* 按摩穴位 */}
        <div>
          <div className="text-xs font-medium text-[#8b7b6b] mb-0.5">按摩穴位</div>
          <div className="text-sm text-[#4a3f35]">{entry.massage}</div>
        </div>

        {/* 调养建议 */}
        <div className={`p-2.5 rounded-lg ${style.bg}`}>
          <div className="flex items-start gap-2">
            <Sparkles className={`w-3.5 h-3.5 ${style.text} mt-0.5 flex-shrink-0`} />
            <span className="text-xs text-[#4a3f35]">{entry.tip}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════
// 主页面
// ═══════════════════════════════════════

export default function ShichenPage() {
  const [mounted, setMounted] = useState(false);
  const [current, setCurrent] = useState<{ shichen: ShichenEntry; timeText: string } | null>(null);
  const [selected, setSelected] = useState<number>(0);

  // 客户端挂载后获取当前时辰
  useEffect(() => {
    const now = getCurrentShichen();
    setCurrent(now);
    const idx = SHICHEN_LIST.findIndex(s => s.name === now.shichen.name);
    setSelected(idx >= 0 ? idx : 0);
    setMounted(true);

    // 每分钟刷新当前时间
    const timer = setInterval(() => {
      const n = getCurrentShichen();
      setCurrent(n);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const selectedEntry = SHICHEN_LIST[selected];

  // 子午流注说明
  const introText = '子午流注是中医时间医学的核心理论，认为人体气血沿十二经脉循环流注，每个时辰有一条经络气血最旺。在当令时辰调理对应经络，可事半功倍。';

  return (
    <PageContainer theme="healing">
      <HealingHeader title="时辰养生" subtitle="子午流注 · 十二时辰经络调养" />

      <div className="relative z-10 pt-[68px] pb-[80px] px-4 max-w-[640px] mx-auto">
        {/* 介绍 */}
        <div className="mb-4 p-3 rounded-xl bg-[#faf5ee]/80 border border-[#e8d4b8]/30">
          <p className="text-xs text-[#8b7b6b] leading-relaxed">{introText}</p>
        </div>

        {/* 当前时辰 */}
        {mounted && current ? (
          <div className="mb-4">
            <CurrentShichenCard entry={current.shichen} timeText={current.timeText} />
          </div>
        ) : (
          <div className="mb-4 h-[200px] rounded-2xl bg-[#faf5ee]/50 animate-pulse" />
        )}

        {/* 12时辰时间轴 */}
        <div className="mb-4">
          <div className="text-sm font-semibold text-[#5d4e3b] mb-2 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            十二时辰
          </div>
          <ShichenTimeline currentIndex={selected} onSelect={setSelected} />
        </div>

        {/* 选中时辰详情 */}
        <div className="mb-4">
          <ShichenDetailCard entry={selectedEntry} />
        </div>

        {/* 全部时辰列表 */}
        <div className="mb-2">
          <div className="text-sm font-semibold text-[#5d4e3b] mb-2 flex items-center gap-1.5">
            <Sun className="w-4 h-4" />
            全部时辰一览
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SHICHEN_LIST.map((s, i) => {
              const style = WUXING_STYLE[s.wuxing];
              const isActive = i === selected;
              return (
                <button
                  key={s.name}
                  onClick={() => setSelected(i)}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border transition-all text-left ${
                    isActive
                      ? `${style.bg} ${style.border} ring-1 ring-current`
                      : 'bg-white/50 border-[#e8d4b8]/20 hover:bg-white/70'
                  }`}
                >
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#2d2417]">{s.name}</div>
                    <div className={`text-xs ${style.text} truncate`}>{s.meridian}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 跳转 */}
        <div className="mt-4 flex justify-center">
          <Link
            href="/meridian"
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#faf5ee] border border-[#e8d4b8]/30 text-sm text-[#5d4e3b] hover:bg-white transition-colors active:scale-95"
          >
            <MapPin className="w-4 h-4" />
            前往穴位定位
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
