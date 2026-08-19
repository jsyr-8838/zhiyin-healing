'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';

import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { getClientUserId } from '@/lib/auth';
import { Flame, Wind, Music, Hand, Volume2, ArrowLeft, Calendar, TrendingUp, Sparkles, Activity, Moon, Heart, Dumbbell, Utensils, BarChart3 } from 'lucide-react';

// ===== 图表用精确色值（Recharts / 热力图组件需要具体色值） =====
const chartColors = {
  xuanzhi: '#F5F0E8',
  zhusha1: '#F2D4C9',
  zhusha2: '#E8A598',
  zhusha3: '#D4614E',
  zhusha4: '#B8332A',
  jinse: '#C9A84C',
  danmo: '#8B7355',
};

// ===== 推荐数据类型 =====
interface Recommendation {
  element: string;
  color: string;
  pattern: string;
  score: number;
  wuyin: { tone: string; freq: number; preset: string };
  liuzijue: { char: string; organ: string };
  tuina: { region: string; technique: string };
  moxibustion: { point: string; duration: string };
  lifestyle: string;
}

// ===== 日历热力图组件（替代 react-activity-calendar） =====
interface HeatmapDay {
  date: string;
  count: number;
  level?: number;
}

function CalendarHeatmap({ data, theme }: { data: HeatmapDay[]; theme: { light: string[] } }) {
  const days = ['一', '二', '三', '四', '五', '六', '日'];
  const dateMap = new Map(data.map(d => [d.date, d.count]));
  const colors = theme.light;
  const maxCount = Math.max(...data.map(d => d.count), 1);

  const getLevel = (count: number) => {
    if (count === 0) return 0;
    return Math.min(Math.ceil((count / maxCount) * 4), 4);
  };

  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  const startDay = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1;
  startDate.setDate(startDate.getDate() - startDay);

  const cells: { date: string; count: number; level: number }[] = [];
  const d = new Date(startDate);
  for (let i = 0; i < 371; i++) {
    const dateStr = d.toISOString().slice(0, 10);
    const count = dateMap.get(dateStr) || 0;
    cells.push({ date: dateStr, count, level: getLevel(count) });
    d.setDate(d.getDate() + 1);
  }

  return (
    <div className="flex gap-1.5">
      <div className="flex flex-col gap-[3px] pt-0.5 text-[9px] text-gray-400" style={{ lineHeight: '14px' }}>
        {days.map((d, i) => <span key={i} style={{ height: 14 }}>{i % 2 === 0 ? d : ''}</span>)}
      </div>
      <div className="grid grid-flow-col gap-[3px]" style={{ gridTemplateRows: 'repeat(7, 14px)' }}>
        {cells.map((cell, i) => (
          <div
            key={i}
            className="rounded-[2px]"
            style={{
              width: 12,
              height: 14,
              background: cell.level === 0 ? 'rgba(30,45,38,0.04)' : colors[cell.level],
              border: cell.level === 0 ? '1px solid rgba(30,45,38,0.06)' : 'none',
            }}
            title={`${cell.date}: ${cell.count}分`}
          />
        ))}
      </div>
    </div>
  );
}

// ===== 日历热力图主题 =====
const heatmapTheme = {
  light: [chartColors.xuanzhi, chartColors.zhusha1, chartColors.zhusha2, chartColors.zhusha3, chartColors.zhusha4],
};

// ===== 推荐跳转链接 =====
const WUYIN_HREF: Record<string, string> = { '角': 'jiao', '徵': 'zhi', '宫': 'gong', '商': 'shang', '羽': 'yu' };
const LIUZIJUE_HREF: Record<string, string> = { '嘘': 'xu', '呵': 'he', '呼': 'hu', '呬': 'si', '吹': 'chui' };

export default function HealingDashboardPage() {
  const userId = getClientUserId();
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState({ current: 0, longest: 0, totalDays: 0, thisWeekDays: 0, thisMonthDays: 0 });
  const [calendarData, setCalendarData] = useState<Array<{ date: string; count: number; level: number }>>([]);
  const [trendData, setTrendData] = useState<Array<{ date: string; value: number }>>([]);
  const [trendMetric, setTrendMetric] = useState('healthScore');
  const [trendDays, setTrendDays] = useState(30);
  const [wuxingTendencies, setWuxingTendencies] = useState({ wood: 0, fire: 0, earth: 0, metal: 0, water: 0 });
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({ avgHealthScore: 0, avgSleepScore: 0, avgMoodScore: 0, avgExerciseScore: 0, avgDietScore: 0 });
  const [trend, setTrend] = useState<'improving' | 'stable' | 'declining'>('stable');
  const [avgScore, setAvgScore] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // 加载 Dashboard 数据
  const loadDashboard = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/checkin/dashboard?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setStreak(data.streak);
        setWuxingTendencies(data.wuxingTendencies);
        setRecommendations(data.recommendations || []);
        setMonthlyStats(data.monthlyStats);
      }
    } catch (e) { console.error('Dashboard load error:', e); }
    setLoading(false);
  }, [userId]);

  // 加载日历数据
  const loadCalendar = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/checkin/calendar?userId=${userId}&month=${calendarMonth}`);
      if (res.ok) {
        const data = await res.json();
        setCalendarData(data.days.map((d: { date: string; level: number; healthScore: number }) => ({
          date: d.date,
          count: d.healthScore,
          level: d.level,
        })));
      }
    } catch (e) { console.error('Calendar load error:', e); }
  }, [userId, calendarMonth]);

  // 加载趋势数据
  const loadTrends = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/checkin/trends?userId=${userId}&metric=${trendMetric}&days=${trendDays}`);
      if (res.ok) {
        const data = await res.json();
        setTrendData(data.data);
        setTrend(data.trend);
        setAvgScore(data.average);
      }
    } catch (e) { console.error('Trends load error:', e); }
  }, [userId, trendMetric, trendDays]);

  useEffect(() => { loadDashboard(); }, [loadDashboard]);
  useEffect(() => { loadCalendar(); }, [loadCalendar]);
  useEffect(() => { loadTrends(); }, [loadTrends]);

  // 五行雷达图数据
  const radarData = useMemo(() => [
    { element: '木(肝)', value: wuxingTendencies.wood, fullMark: 1 },
    { element: '火(心)', value: wuxingTendencies.fire, fullMark: 1 },
    { element: '土(脾)', value: wuxingTendencies.earth, fullMark: 1 },
    { element: '金(肺)', value: wuxingTendencies.metal, fullMark: 1 },
    { element: '水(肾)', value: wuxingTendencies.water, fullMark: 1 },
  ], [wuxingTendencies]);

  // 趋势指标标签
  const metricLabels: Record<string, { label: string; icon: React.ReactNode }> = {
    healthScore: { label: '综合', icon: <Activity size={12} /> },
    sleepScore: { label: '睡眠', icon: <Moon size={12} /> },
    moodScore: { label: '情绪', icon: <Heart size={12} /> },
    exerciseScore: { label: '运动', icon: <Dumbbell size={12} /> },
    dietScore: { label: '饮食', icon: <Utensils size={12} /> },
  };

  const trendLabel = trend === 'improving' ? '上升' : trend === 'declining' ? '下降' : '平稳';
  const trendColorStyle = trend === 'improving'
    ? { color: '#4d7653', background: 'rgba(77,118,83,0.10)' }
    : trend === 'declining'
    ? { color: '#7a3532', background: 'rgba(122,53,50,0.10)' }
    : { color: '#968c78', background: 'rgba(150,140,120,0.10)' };

  if (loading) {
    return (
      <PageContainer theme="healing">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 mx-auto mb-3 rounded-full animate-pulse bg-gradient-to-br from-red-400 to-amber-400" />
            <p className="text-sm text-gray-500">加载中...</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer theme="healing">
      {/* Header — 打卡仪表板专用，保留自定义布局 */}
      <div className="px-5 pt-12 pb-6 text-white relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-red-800">
        <div className="absolute top-4 right-4 opacity-10 -rotate-[8deg]">
          <div className="border-2 border-amber-400 px-3 py-1 text-amber-400 text-[0.7em] font-bold tracking-[4px]">打卡</div>
        </div>
        <Link href="/healing" className="text-white/70 text-xs flex items-center gap-1 mb-2">
          <ArrowLeft size={14} /> 疗愈
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black font-serif tracking-[0.1em]">健康打卡</h1>
            <p className="text-xs mt-1 font-serif text-white/60">数据驱动 · 五行调养</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-amber-400">{streak.current}</div>
            <div className="text-xs text-white/70">天连续</div>
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* 区1: Streak 三卡片 */}
        <div className="flex gap-3">
          {[
            { value: streak.current, label: '当前连续' },
            { value: streak.longest, label: '最长连续' },
            { value: streak.totalDays, label: '累计天数' },
          ].map((item) => (
            <div key={item.label} className="flex-1 rounded-xl p-3 text-center relative overflow-hidden glass-card">
              <div className="absolute top-0 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              <div className="text-2xl font-black bg-gradient-to-br from-red-700 to-amber-400 bg-clip-text text-transparent">{item.value}</div>
              <div className="text-[10px] mt-1 text-gray-500">{item.label}</div>
            </div>
          ))}
        </div>

        {/* 本周/本月小标签 */}
        <div className="flex gap-4 justify-center">
          <div className="text-xs text-gray-500">
            <span className="text-amber-400 font-bold">本周</span> {streak.thisWeekDays}天
          </div>
          <div className="text-xs text-gray-500">
            <span className="text-amber-400 font-bold">本月</span> {streak.thisMonthDays}天
          </div>
        </div>

        {/* 区2: 日历热力图 */}
        <div className="rounded-xl p-4 relative overflow-hidden glass-card">
          <div className="absolute top-0 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => {
              const [y, m] = calendarMonth.split('-').map(Number);
              const prev = m === 1 ? `${y-1}-12` : `${y}-${String(m-1).padStart(2,'0')}`;
              setCalendarMonth(prev);
            }} className="text-xs p-1 text-gray-500">
              <ArrowLeft size={14} />
            </button>
            <span className="text-sm font-bold font-serif text-gray-800">
              {calendarMonth.replace('-', '年')}月
            </span>
            <button onClick={() => {
              const [y, m] = calendarMonth.split('-').map(Number);
              const next = m === 12 ? `${y+1}-01` : `${y}-${String(m+1).padStart(2,'0')}`;
              setCalendarMonth(next);
            }} className="text-xs p-1 text-gray-500">
              <ArrowLeft size={14} className="rotate-180" />
            </button>
          </div>

          {calendarData.length > 0 ? (
            <CalendarHeatmap data={calendarData} theme={heatmapTheme} />
          ) : (
            <div className="text-center py-8 text-xs text-gray-500">
              <Calendar size={24} className="mx-auto mb-2 opacity-40" />
              开始打卡后显示日历
            </div>
          )}

          {/* 图例 */}
          <div className="flex items-center justify-end gap-1 mt-2">
            <span className="text-[10px] text-gray-500">低</span>
            {[chartColors.xuanzhi, chartColors.zhusha1, chartColors.zhusha2, chartColors.zhusha3, chartColors.zhusha4].map((c, i) => (
              <div key={i} className="w-2.5 h-2.5 rounded-[2px]" style={{ background: c, border: i === 0 ? '1px solid #d4c5a9' : 'none' }} />
            ))}
            <span className="text-[10px] text-gray-500">高</span>
          </div>
        </div>

        {/* 区3: 健康趋势图 */}
        <div className="rounded-xl p-4 relative overflow-hidden glass-card">
          <div className="absolute top-0 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-serif text-gray-800">健康趋势</span>
              {trendData.length > 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={trendColorStyle}>
                  {trendLabel}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500">均值 {avgScore}</div>
          </div>

          {/* 指标 Tabs */}
          <div className="flex gap-1 mb-3 flex-wrap">
            {Object.entries(metricLabels).map(([key, { label, icon }]) => (
              <button key={key} onClick={() => setTrendMetric(key)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                  trendMetric === key
                    ? 'bg-red-700 text-white border border-red-800'
                    : 'text-gray-500 border border-transparent'
                }`}>
                {icon} {label}
              </button>
            ))}
          </div>

          {/* 天数切换 */}
          <div className="flex gap-2 mb-2">
            {[7, 14, 30].map(d => (
              <button key={d} onClick={() => setTrendDays(d)}
                className={`text-[10px] px-2 py-0.5 rounded-full cursor-pointer ${
                  trendDays === d ? 'bg-red-700 text-white' : 'text-gray-500'
                }`}>
                {d}天
              </button>
            ))}
          </div>

          {trendData.length > 1 ? (
            <svg viewBox="0 0 300 160" className="w-full" style={{ overflow: 'visible' }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={chartColors.jinse} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={chartColors.jinse} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              {(() => {
                const w = 280, h = 130, padL = 20, padT = 10;
                const pts = trendData.map((d, i) => ({
                  x: padL + (i / Math.max(trendData.length - 1, 1)) * w,
                  y: padT + (1 - d.value / 100) * h,
                }));
                const line = pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
                const area = line + ` L${pts[pts.length-1].x},${padT + h} L${pts[0].x},${padT + h} Z`;
                const yTicks = [0, 25, 50, 75, 100];
                return (
                  <>
                    {yTicks.map(v => (
                      <line key={v} x1={padL} y1={padT + (1 - v / 100) * h} x2={padL + w} y2={padL + (1 - v / 100) * h} stroke="#8B735522" strokeDasharray="3 3" />
                    ))}
                    {trendData.map((d, i) => (
                      <text key={i} x={padL + (i / Math.max(trendData.length - 1, 1)) * w} y={padT + h + 16} textAnchor="middle" fontSize={9} fill={chartColors.danmo}>{d.date.slice(5)}</text>
                    ))}
                    {yTicks.map(v => (
                      <text key={v} x={padL - 4} y={padT + (1 - v / 100) * h + 3} textAnchor="end" fontSize={9} fill={chartColors.danmo}>{v}</text>
                    ))}
                    <path d={area} fill="url(#trendGrad)" />
                    <path d={line} fill="none" stroke={chartColors.jinse} strokeWidth={2.5} />
                    {pts.map((p, i) => (
                      <circle key={i} cx={p.x} cy={p.y} r={3} fill={chartColors.jinse} stroke="white" strokeWidth={1.5} />
                    ))}
                  </>
                );
              })()}
            </svg>
          ) : (
            <div className="text-center py-8 text-xs text-gray-500">
              <TrendingUp size={24} className="mx-auto mb-2 opacity-40" />
              打卡 2 天后显示趋势
            </div>
          )}
        </div>

        {/* 区4: 五行偏颇 + 推荐 */}
        <div className="rounded-xl p-4 relative overflow-hidden glass-card">
          <div className="absolute top-0 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold font-serif text-gray-800">五行偏颇与疗愈推荐</span>
            <span className="text-[10px] text-gray-500">基于近7日数据</span>
          </div>

          <div className="flex gap-3">
            {/* 雷达图 */}
            <div className="w-[130px] flex-shrink-0">
              <svg viewBox="0 0 130 130" className="w-full">
                {(() => {
                  const cx = 65, cy = 65, r = 45;
                  const n = radarData.length;
                  const angleStep = (2 * Math.PI) / n;
                  const startAngle = -Math.PI / 2;
                  const gridLevels = [0.25, 0.5, 0.75, 1];
                  const polarToCart = (angle: number, dist: number) => ({
                    x: cx + dist * Math.cos(angle),
                    y: cy + dist * Math.sin(angle),
                  });
                  const gridPaths = gridLevels.map(level => {
                    const pts = Array.from({ length: n }, (_, i) => {
                      const { x, y } = polarToCart(startAngle + i * angleStep, r * level);
                      return `${x},${y}`;
                    });
                    return `M${pts.join('L')}Z`;
                  });
                  const dataPts = radarData.map((d, i) => polarToCart(startAngle + i * angleStep, r * Math.min(d.value, 1)));
                  const dataPath = `M${dataPts.map(p => `${p.x},${p.y}`).join('L')}Z`;
                  return (
                    <>
                      {gridPaths.map((d, i) => <path key={i} d={d} fill="none" stroke="#d4c5a944" strokeWidth={0.5} />)}
                      {radarData.map((d, i) => {
                        const outer = polarToCart(startAngle + i * angleStep, r + 14);
                        return <text key={i} x={outer.x} y={outer.y} textAnchor="middle" dominantBaseline="central" fontSize={9} fill={chartColors.danmo}>{d.element}</text>;
                      })}
                      <path d={dataPath} fill={chartColors.zhusha3} fillOpacity={0.2} stroke={chartColors.zhusha3} strokeWidth={2} />
                    </>
                  );
                })()}
              </svg>
            </div>

            {/* 推荐列表 */}
            <div className="flex-1 flex flex-col gap-2">
              {recommendations.length > 0 ? recommendations.map((rec, idx) => (
                <div key={idx} className="rounded-lg p-2.5 transition hover:shadow-sm cursor-pointer"
                  style={{ background: `${rec.color}08`, border: `1px solid ${rec.color}33` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ background: `${rec.color}18`, color: rec.color }}>
                      {rec.element}行
                    </span>
                    <span className="text-[11px] font-medium text-gray-800">{rec.pattern.slice(0, 10)}</span>
                  </div>
                  <div className="text-[10px] text-gray-500">
                    {rec.wuyin.tone}音{rec.wuyin.preset} · {rec.liuzijue.char}字诀
                  </div>
                  <div className="flex gap-2 mt-1.5">
                    <Link href={`/healing/wuyin?tone=${WUYIN_HREF[rec.wuyin.tone] || 'gong'}`}
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ color: rec.color, background: `${rec.color}12` }}>
                      {rec.wuyin.tone}音
                    </Link>
                    <Link href={`/healing/liuzijue?char=${LIUZIJUE_HREF[rec.liuzijue.char] || 'xu'}`}
                      className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{ color: rec.color, background: `${rec.color}12` }}>
                      {rec.liuzijue.char}字
                    </Link>
                  </div>
                </div>
              )) : (
                <div className="text-center py-6 text-xs text-gray-500">
                  <Sparkles size={20} className="mx-auto mb-2 opacity-40" />
                  连续打卡3天后解锁推荐
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 打卡入口 */}
        <Link href="/checkin"
          className="block w-full py-3 rounded-xl text-white font-bold text-sm font-serif text-center transition hover:shadow-md bg-gradient-to-br from-red-700 to-amber-500">
          + 立即打卡
        </Link>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
