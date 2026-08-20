'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, SkipForward } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { Solar, LunarYear } from 'lunar-javascript';
import {
  calcConstitution,
  HOUR_BRANCHES,
  HOUR_RANGES,
  CONSTITUTION_INFO,
  STEM_ELEMENT,
  STEM_YINYANG,
  BRANCH_ELEMENT,
  type ConstitutionReport,
} from '@/lib/constitution-calculator';
import { LUNAR_MONTH_NAMES, LUNAR_DAY_NAMES, type Stem, type Branch } from '@/lib/data/ganzhi-foundation';
import { useAppStore } from '@/lib/store';
import type { WuXing } from '@/lib/unified-diagnosis';
type Phase = 'input' | 'result';
type CalendarMode = 'solar' | 'lunar';

export default function WuXingPage() {
  const { setWuXingResult, diagnosisFlow, advanceDiagnosisFlow, exitDiagnosisFlow } = useAppStore();
  const [phase, setPhase] = useState<Phase>('input');
  const [report, setReport] = useState<ConstitutionReport | null>(null);
  const [calMode, setCalMode] = useState<CalendarMode>('solar');
  const [year, setYear] = useState(1990);
  const [month, setMonth] = useState(6);
  const [day, setDay] = useState(15);
  const [hour, setHour] = useState('卯时');
  const [isLeapMonth, setIsLeapMonth] = useState(false);

  // 农历某年是否为闰月年及闰哪个月
  const leapMonthInfo = useMemo(() => {
    if (calMode !== 'lunar') return { hasLeap: false, leapMonthNum: 0 };
    try {
      // 用公历近似定位该农历年
      const solar = Solar.fromYmd(year, 1, 1);
      const lunar = solar.getLunar();
      const lunarYear = lunar.getYear();
      const ly = LunarYear.fromYear(lunarYear);
      const leapMonthNum = ly.getLeapMonth();
      return { hasLeap: leapMonthNum > 0, leapMonthNum };
    } catch {
      return { hasLeap: false, leapMonthNum: 0 };
    }
  }, [calMode, year]);

  // 农历月份列表（含闰月）
  const lunarMonthOptions = useMemo(() => {
    const opts: { value: number; label: string }[] = [];
    for (let m = 1; m <= 12; m++) {
      opts.push({ value: m, label: LUNAR_MONTH_NAMES[m] });
      if (leapMonthInfo.hasLeap && leapMonthInfo.leapMonthNum === m) {
        opts.push({ value: m, label: `闰${LUNAR_MONTH_NAMES[m]}` });
      }
    }
    return opts;
  }, [leapMonthInfo]);

  // 当前选择了闰月？
  const currentIsLeap = calMode === 'lunar' && isLeapMonth && month === leapMonthInfo.leapMonthNum;

  const handleCalc = () => {
    const r = calcConstitution(year, month, day, hour, calMode === 'lunar', currentIsLeap);
    setReport(r);
    // 写入统一明辨 store
    setWuXingResult({
      fiveElement: (r.dominant as WuXing) || '土',
      constitution: r.constitution || '平和',
      dayMasterStrength: r.strength || '平衡',
      yongShen: (Array.isArray(r.yongshen?.yongshen) ? r.yongshen.yongshen[0] : r.dominant) || '土',
      jiShen: r.weak || '木',
    });
    // 流水线模式：完成后自动推进一步
    if (diagnosisFlow.active && diagnosisFlow.currentStep === 1) {
      advanceDiagnosisFlow();
    }
    setPhase('result');
  };

  // 月份选择处理
  const handleMonthChange = (value: string) => {
    const num = Number(value);
    setMonth(num);
    // 如果选的是闰月项，标记 isLeapMonth
    // 闰月项的 value 也是月份数字，但 label 不同
    // 我们用 select 的 data 属性不太好传，改用 select index 来判断
    setIsLeapMonth(false); // 重置，由专用开关控制
  };

  // 农历月份显示值
  const monthDisplay = calMode === 'lunar'
    ? (isLeapMonth && month === leapMonthInfo.leapMonthNum ? `闰${LUNAR_MONTH_NAMES[month]}` : LUNAR_MONTH_NAMES[month])
    : `${month}月`;

  // 农历日期显示值
  const dayDisplay = calMode === 'lunar' ? (LUNAR_DAY_NAMES[day] || `${day}日`) : `${day}日`;

  // ═══════════════════════════════════════════════════
  //  INPUT
  // ═══════════════════════════════════════════════════
  if (phase === 'input') {
    return (
      <PageContainer theme="healing" className="text-gray-900 pb-28">
        <div className="bg-gradient-to-br from-amber-500 to-red-600 px-5 pt-12 pb-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Link href="/diagnose" className="text-white/70 hover:text-white">←</Link>
            <h1 className="text-2xl font-black">五行体质计算</h1>
            {diagnosisFlow.active && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 ml-auto">
                流水线 2/5
              </span>
            )}
          </div>
          <p className="text-amber-100 text-sm">四柱八字 · 日主强弱 · 用神忌神 · 体质辨识</p>
        </div>

        <div className="px-4 pt-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4">请输入出生信息</h3>

            {/* 公历/农历切换 */}
            <div className="flex items-center gap-3 mb-5 p-1 bg-gray-100 rounded-xl">
              <button
                onClick={() => { setCalMode('solar'); setIsLeapMonth(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  calMode === 'solar' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                公历
              </button>
              <button
                onClick={() => { setCalMode('lunar'); setDay(1); }}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                  calMode === 'lunar' ? 'bg-white text-amber-700 shadow-sm' : 'text-gray-500'
                }`}
              >
                农历
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">出生年份</label>
                <input
                  type="number"
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  min={1900} max={2100}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  {calMode === 'lunar' ? '农历月份' : '出生月份'}
                </label>
                {calMode === 'solar' ? (
                  <select
                    value={month}
                    onChange={e => setMonth(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-500"
                  >
                    {Array.from({length:12}, (_,i) => i+1).map(m => (
                      <option key={m} value={m}>{m}月</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={month}
                    onChange={e => handleMonthChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-500"
                  >
                    {lunarMonthOptions.map((opt, idx) => (
                      <option key={idx} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">
                  {calMode === 'lunar' ? '农历日期' : '出生日期'}
                </label>
                {calMode === 'solar' ? (
                  <select
                    value={day}
                    onChange={e => setDay(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-500"
                  >
                    {Array.from({length:31}, (_,i) => i+1).map(d => (
                      <option key={d} value={d}>{d}日</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={day}
                    onChange={e => setDay(Number(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-amber-500"
                  >
                    {LUNAR_DAY_NAMES.slice(1, 31).map((name, idx) => (
                      <option key={idx+1} value={idx+1}>{name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* 闰月切换 — 仅农历模式且当年有闰月且选中了闰月月份时显示 */}
              {calMode === 'lunar' && leapMonthInfo.hasLeap && month === leapMonthInfo.leapMonthNum && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-sm text-amber-800 font-medium">
                    该月为闰{LUNAR_MONTH_NAMES[month]}
                  </span>
                  <button
                    onClick={() => setIsLeapMonth(!isLeapMonth)}
                    className={`ml-auto px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isLeapMonth
                        ? 'bg-amber-600 text-white'
                        : 'bg-white text-amber-700 border border-amber-300'
                    }`}
                  >
                    {isLeapMonth ? '闰月 ✓' : '非闰月'}
                  </button>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 block mb-1.5">出生时辰</label>
                <div className="grid grid-cols-4 gap-2">
                  {HOUR_BRANCHES.map(h => (
                    <button
                      key={h}
                      onClick={() => setHour(h)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                        hour === h
                          ? 'bg-amber-600 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 已选择信息确认 */}
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200">
              <p className="text-sm text-amber-800 font-medium">
                {calMode === 'solar' ? '公历' : '农历'}：{year}年{monthDisplay}{dayDisplay} · {hour}（{HOUR_RANGES[hour] || ''}）
              </p>
              {calMode === 'lunar' && currentIsLeap && (
                <p className="text-xs text-amber-600 mt-1">* 闰月</p>
              )}
            </div>
          </div>
        </div>

        {/* 固定底部按钮 */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 border-t border-gray-200 px-4 py-3">
          <button
            onClick={handleCalc}
            className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-red-500 text-white font-bold rounded-2xl text-lg shadow-lg shadow-amber-600/20 hover:shadow-amber-600/30 transition-all active:scale-[0.98]"
          >
            开始推算
          </button>
        </div>
      </PageContainer>
    );
  }

  // ═══════════════════════════════════════════════════
  //  RESULT
  // ═══════════════════════════════════════════════════
  if (!report) return null;
  const r = report;

  // 流水线模式：五行体质完成后，导引到舌诊
  if (diagnosisFlow.active) {
    return (
      <PageContainer theme="healing" className="text-gray-900 pb-20">
        <div className="bg-gradient-to-br from-amber-500 to-red-600 px-5 pt-12 pb-8 text-white">
          <div className="text-center">
            <CheckCircle2 size={48} className="mx-auto mb-3 text-amber-200" />
            <h1 className="text-xl font-black">五行体质已保存</h1>
            <p className="text-amber-100 text-sm mt-1">
              {r.constitution} · {r.dominant}行偏旺 · 日主{r.strength}
            </p>
          </div>
        </div>
        <div className="px-4 pt-6 space-y-4">
          {/* 五行得分简览 */}
          <div className="bg-white rounded-xl p-4 border border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-2">五行得分</h3>
            <div className="flex gap-2">
              {(['木','火','土','金','水'] as const).map(el => {
                const sc = r.scores[el];
                const pct = r.total > 0 ? sc / r.total * 100 : 0;
                const elColor: Record<string,string> = {'木':'#4CAF50','火':'#F44336','土':'#FF9800','金':'#9E9E9E','水':'#2196F3'};
                return (
                  <div key={el} className="flex-1 text-center">
                    <div className="h-16 bg-gray-100 rounded-full overflow-hidden flex flex-col-reverse mx-auto w-6">
                      <div className="rounded-full transition-all" style={{ height: `${Math.max(pct, 8)}%`, background: elColor[el] }} />
                    </div>
                    <p className="text-[10px] mt-1 font-bold" style={{ color: elColor[el] }}>{el}</p>
                    <p className="text-[9px] text-gray-400">{pct.toFixed(0)}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 font-serif">下一步：AI舌诊</p>

          <Link
            href="/diagnose?tab=capture&type=tongue"
            className="flex items-center justify-center gap-2 py-3.5 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(145deg, #6e9e74, #8fc8bd)' }}
          >
            继续第3步 · 舌诊 <ArrowRight size={16} />
          </Link>

          <div className="flex gap-2">
            <button
              onClick={() => {
                advanceDiagnosisFlow();
                // 跳过舌诊后直接跳到 /diagnose，由流水线进度卡片引导到手诊
                // 但如果用户想直接去舌诊也可以，所以跳到 /diagnose 让进度卡片处理
                window.location.href = '/diagnose';
              }}
              className="flex-1 py-2.5 rounded-xl text-xs text-gray-400 border border-gray-200 flex items-center justify-center gap-1"
            >
              <SkipForward size={12} /> 跳过舌诊
            </button>
            <button
              onClick={() => setPhase('input')}
              className="flex-1 py-2.5 rounded-xl text-xs text-gray-500 border border-gray-200"
            >
              重新计算
            </button>
          </div>
        </div>
        <BottomNav />
      </PageContainer>
    );
  }

  // 正常模式：显示完整结果
  const info = r.constitutionInfo;
  const elColor: Record<string, string> = {'木':'#4CAF50','火':'#F44336','土':'#FF9800','金':'#9E9E9E','水':'#2196F3'};
  const pillarLabels = ['年柱','月柱','日柱(命主)','时柱'];

  return (
    <PageContainer theme="healing" className="text-gray-900 pb-20">
      <div className="bg-gradient-to-br from-amber-500 to-red-600 px-5 pt-12 pb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <button onClick={() => setPhase('input')} className="text-white/70 hover:text-white">←</button>
          <h1 className="text-xl font-black">五行体质分析</h1>
        </div>
        <p className="text-amber-100 text-xs">
          {r.year}年{r.month}月{r.day}日 · {r.birthHour} · {r.zodiac} · {r.constitution}
        </p>
        {r.lunarYear && r.lunarMonthName && r.lunarDayName && (
          <p className="text-amber-200/80 text-xs mt-0.5">
            农历：{r.lunarYear}年{r.isLeapMonth ? '闰' : ''}{r.lunarMonthName}{r.lunarDayName}
          </p>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* 四柱八字 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-amber-700 border-l-3 border-amber-500 pl-2 mb-3">四柱八字</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-gray-200 px-2 py-1.5 w-16"></th>
                  {pillarLabels.map(l => <th key={l} className="border border-gray-200 px-2 py-1.5">{l}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr><th className="border border-gray-200 px-2 py-1.5 bg-gray-50">天干</th>
                  {r.pillars.map(([s],i) => <td key={i} className="border border-gray-200 px-2 py-1.5 text-center font-bold">{s}({r.scores[STEM_ELEMENT[s as Stem]] !== undefined ? STEM_ELEMENT[s as Stem] : ''}{STEM_YINYANG[s as Stem]})</td>)}
                </tr>
                <tr><th className="border border-gray-200 px-2 py-1.5 bg-gray-50">地支</th>
                  {r.pillars.map(([,b],i) => <td key={i} className="border border-gray-200 px-2 py-1.5 text-center font-bold">{b}({BRANCH_ELEMENT[b as Branch]})</td>)}
                </tr>
                <tr><th className="border border-gray-200 px-2 py-1.5 bg-gray-50">十神</th>
                  {r.shishens.map((ss,i) => <td key={i} className="border border-gray-200 px-2 py-1.5 text-center">{ss}</td>)}
                </tr>
                <tr><th className="border border-gray-200 px-2 py-1.5 bg-gray-50">纳音</th>
                  {r.nayins.map((ny,i) => <td key={i} className="border border-gray-200 px-2 py-1.5 text-center text-gray-500">{ny}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            生肖：{r.zodiac}({r.yinYang}性) · 命宫：{r.lifePalace} · 胎元：{r.fetalOrigin[0]}{r.fetalOrigin[1]}
          </p>
        </div>

        {/* 日主强弱 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-amber-700 border-l-3 border-amber-500 pl-2 mb-3">日主强弱 & 用神忌神</h2>
          <div className="bg-gray-50 rounded-xl p-3 text-sm">
            <p>日主 <b>{r.dStem}</b>（{STEM_ELEMENT[r.dStem as Stem]}行，{STEM_YINYANG[r.dStem as Stem]}性）
              → <b className="text-amber-700">{r.strength}</b>（生扶占比 {r.supportRatio}%）
            </p>
            <p className="mt-2">用神：<b className="text-emerald-700">{r.yongshen.yongshen.filter(Boolean).map(e => e + '行').join(' ')}</b>
              {' | '}忌神：<b className="text-red-700">{r.yongshen.jishen.filter(Boolean).map(e => e + '行').join(' ') || '无'}</b></p>
            <p className="mt-1 text-gray-500 text-xs">{r.yongshen.note}</p>
          </div>
        </div>

        {/* 五行得分 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-amber-700 border-l-3 border-amber-500 pl-2 mb-3">五行得分（月令加权）</h2>
          {['木','火','土','金','水'].map(el => {
            const sc = r.scores[el];
            const pct = r.total > 0 ? sc / r.total * 100 : 0;
            const det = r.elementDetail[el];
            const mark = el === r.dominant ? ' ★主旺' : el === r.weak ? ' ▽偏弱' : '';
            const miss = r.missing.includes(el) ? ' ⚠缺' : '';
            return (
              <div key={el} className="flex items-center gap-2 mb-2 text-sm">
                <span className="w-20 shrink-0 font-bold" style={{color: elColor[el]}}>{el}({det.organ})</span>
                <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{width: `${pct}%`, background: elColor[el]}} />
                </div>
                <span className="w-28 shrink-0 text-xs text-gray-600">{sc.toFixed(1)}分 {pct.toFixed(0)}%{mark}{miss}</span>
              </div>
            );
          })}
          {r.missing.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mt-3 text-xs">
              <b className="text-yellow-800">五行偏缺：{r.missing.join('、')}行</b>
              {r.missing.map(el => {
                const det = r.elementDetail[el];
                return <p key={el} className="text-yellow-700 mt-1">· 补{el}：多食{det.taste}味，宜{det.color}色，护{det.organ}，接触{det.dir}方事物</p>;
              })}
            </div>
          )}
        </div>

        {/* 流年 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-amber-700 border-l-3 border-amber-500 pl-2 mb-3">{r.liunian.year}年流年运势</h2>
          <div className="bg-amber-50 rounded-xl p-3">
            <p className="text-sm">流年柱：<b>{r.liunian.pillar}</b> · 五行：<b>{r.liunian.element}</b>行 · 十神：{r.liunian.relation}</p>
            <p className="text-lg font-black mt-2" style={{color: info.color}}>{r.liunian.luck}</p>
            <p className="text-sm text-gray-600 mt-1">{r.liunian.advice}</p>
          </div>
        </div>

        {/* 体质判定 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-amber-700 border-l-3 border-amber-500 pl-2 mb-3">中医体质判定</h2>
          <span className="inline-block px-4 py-1.5 rounded-full text-base font-black text-white mb-2" style={{background: info.color}}>
            {r.constitution}
          </span>
          <p className="text-sm text-gray-600 mb-3">{info.desc}</p>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {info.features.map(f => (
              <span key={f} className="text-xs bg-gray-100 border border-gray-200 rounded-full px-2 py-0.5">{f}</span>
            ))}
          </div>
          <p className="text-sm text-red-600 font-bold">易患：{info.prone.join('、')}</p>
        </div>

        {/* 养生建议 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-amber-700 border-l-3 border-amber-500 pl-2 mb-3">养生调理方案</h2>
          <div className="space-y-3">
            {([
              {title: '饮食调养', items: info.diet, icon: '🍽'},
              {title: '运动锻炼', items: info.exercise, icon: '🏃'},
              {title: '情志调摄', items: info.emotion, icon: '🧘'},
              {title: '经络穴位', items: info.meridian, icon: '🩺'},
              {title: '中药食疗', items: info.herbs, icon: '🌿'},
            ] as const).map(({title, items, icon}) => (
              <div key={title} className="bg-gray-50 rounded-xl p-3">
                <p className="text-sm font-bold text-gray-800 mb-1">{icon} {title}</p>
                {items.map((it, i) => (
                  <p key={i} className="text-xs text-gray-600 pl-3">· {it}</p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* 大运 */}
        <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
          <h2 className="text-sm font-bold text-amber-700 border-l-3 border-amber-500 pl-2 mb-3">大运推算</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-amber-50">
                  <th className="border border-gray-200 px-2 py-1.5">步</th>
                  <th className="border border-gray-200 px-2 py-1.5">干支</th>
                  <th className="border border-gray-200 px-2 py-1.5">五行</th>
                  <th className="border border-gray-200 px-2 py-1.5">纳音</th>
                  <th className="border border-gray-200 px-2 py-1.5">年龄</th>
                  <th className="border border-gray-200 px-2 py-1.5">公历</th>
                </tr>
              </thead>
              <tbody>
                {r.dayun.map((dy, i) => (
                  <tr key={i}>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">{i+1}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center font-bold">{dy.stem}{dy.branch}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center"><span style={{color: elColor[dy.stemEl]}}>{dy.stemEl}</span>/{dy.branchEl}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center text-gray-500">{dy.nayin}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center">{dy.age}</td>
                    <td className="border border-gray-200 px-2 py-1.5 text-center text-gray-500">{dy.yearRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 重新计算 */}
        <button
          onClick={() => setPhase('input')}
          className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-red-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/20 transition-all active:scale-[0.98]"
        >
          重新计算
        </button>
      </div>
      <BottomNav />
    </PageContainer>
  );
}

