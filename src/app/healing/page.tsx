'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import { useAppStore } from '@/lib/store';
import { consolidateDiagnosis } from '@/lib/unified-diagnosis';
import {
  MessageCircleHeart, FlameKindling, RotateCw, Hand,
  Wind, Music, Sparkles, Volume2, BarChart3, CircleDot,
  ArrowRight, Sun, Moon, Heart, Zap, Leaf, Dumbbell, Coffee, Wine, Flower2, Palette, Shirt, Music2, Bone,
  Droplets, CalendarHeart, BookOpen, Target,
} from 'lucide-react';
import {
  DAILY_QUOTES,
  TREATMENT_MODULES,
  THERAPY_MODULES,
  LIFESTYLE_MODULES,
  ELEMENT_STYLE,
  ELEMENT_ICON_BG,
} from '@/lib/data/healing-modules';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>> = {
  MessageCircleHeart, FlameKindling, RotateCw, Hand,
  Wind, Music, Sparkles, Volume2, BarChart3, CircleDot,
  ArrowRight, Sun, Moon, Heart, Zap, Leaf, Dumbbell, Coffee, Wine, Flower2, Palette, Shirt, Music2, Bone,
  Droplets, CalendarHeart, BookOpen, Target,
};

// ===== 时间问候 =====
function getGreeting(): { text: string; icon: React.ReactNode } {
  const h = new Date().getHours();
  if (h >= 5 && h < 9) return { text: '早安，新的一天从调养开始', icon: <Sun size={18} /> };
  if (h >= 9 && h < 12) return { text: '上午好，身心和合', icon: <Sun size={18} /> };
  if (h >= 12 && h < 14) return { text: '午安，小憩片刻', icon: <Zap size={18} /> };
  if (h >= 14 && h < 18) return { text: '下午好，适时调理', icon: <Sun size={18} /> };
  if (h >= 18 && h < 21) return { text: '傍晚好，放松身心', icon: <Moon size={18} /> };
  return { text: '夜深了，安神入眠', icon: <Moon size={18} /> };
}

// ===== 场景推荐（基于时间） =====
function getScenes() {
  const h = new Date().getHours();
  const scenes = [
    { id: 'sleep', name: '睡前放松', desc: '颂钵·五音羽调·六字诀吹', href: '/healing/singing-bowl', element: 'water' as const, icon: Moon },
    { id: 'morning', name: '晨间活力', desc: '六字诀嘘字诀·五音角调·接地法', href: '/healing/liuzijue', element: 'wood' as const, icon: Sun },
    { id: 'emotion', name: '情绪调节', desc: '灸疗疏导·五音徵调·脉轮心轮', href: '/healing/grounding', element: 'fire' as const, icon: Heart },
    { id: 'meridian', name: '经络调理', desc: '灸疗处方·推拿手法·AI导诊', href: '/jiuliao', element: 'earth' as const, icon: Zap },
  ];

  // 根据时间排序推荐优先级
  if (h >= 21 || h < 6) return [scenes[0], scenes[2], scenes[3], scenes[1]]; // 夜间：睡眠优先
  if (h < 12) return [scenes[1], scenes[3], scenes[2], scenes[0]]; // 上午：晨间优先
  return [scenes[2], scenes[0], scenes[3], scenes[1]]; // 下午/傍晚：情绪优先
}

export default function HealingPage() {
  const { todaySessionsCompleted, unifiedDiagnosis } = useAppStore();
  const consolidated = useMemo(() => consolidateDiagnosis(unifiedDiagnosis), [unifiedDiagnosis]);

  // 每日一言（按日期选择，一天一句）
  const [quote, setQuote] = useState(DAILY_QUOTES[0]);
  useEffect(() => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setQuote(DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length]);
  }, []);

  // 问候/场景延迟到客户端渲染，避免 hydration mismatch
  const [greeting, setGreeting] = useState<{ text: string; icon: React.ReactNode }>({ text: '', icon: null });
  const [scenes, setScenes] = useState<Array<{ id: string; name: string; desc: string; href: string; element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'; icon: typeof Sun }>>([]); // 延迟初始化避免 SSR hydration mismatch
  useEffect(() => {
    setGreeting(getGreeting());
    setScenes(getScenes());
  }, []);

  return (
    <PageContainer theme="healing">
      {/* ===== 顶部：问候 + 体质信息 ===== */}
      <div className="px-5 pt-12 pb-8 text-white relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-red-800">
        {/* 装饰印章 */}
        <div className="absolute top-4 right-4 opacity-10 -rotate-[8deg]">
          <div className="border-2 border-amber-400 px-3 py-1 text-amber-400 text-[0.7em] font-bold tracking-[4px]">疗愈</div>
        </div>

        <div className="flex items-center gap-2 mb-1">
          {greeting.icon}
          <p className="text-sm font-serif text-white/70">{greeting.text}</p>
        </div>

        <h1 className="text-2xl font-black font-serif tracking-[0.15em]">疗愈</h1>
        <p className="text-sm mt-1 font-serif text-white/60">辨证论治 · 五法合一 · 调和阴阳</p>

        {/* 体质信息条 */}
        {consolidated.completedModules.length > 0 && (
          <div className="mt-3 rounded-lg px-4 py-2 flex items-center gap-2 flex-wrap bg-amber-400/15 border border-amber-400/30">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-xs text-white/80">{consolidated.primaryConstitution}</span>
            </div>
            <span className="text-xs px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-400">{consolidated.primaryElement}行</span>
            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">{consolidated.primaryWuYin}音</span>
            <span className="text-xs text-white/50">{consolidated.completedModules.length}/6项</span>
          </div>
        )}
      </div>

      <div className="px-4 pt-4 space-y-4">
        {/* ===== 场景推荐（4卡片） ===== */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 rounded-full bg-amber-500" />
            <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">推荐场景</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {scenes.map((scene, idx) => (
              <Link key={scene.id} href={scene.href}
                className={`glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 ${idx === 0 ? 'ring-1 ring-amber-400/30' : ''}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white ${ELEMENT_ICON_BG[scene.element]}`}>
                    <scene.icon size={14} />
                  </div>
                  <span className="text-sm font-bold font-serif text-gray-800">{scene.name}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-relaxed">{scene.desc}</p>
                {idx === 0 && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600 font-medium">
                    <span className="px-1.5 py-0.5 rounded bg-amber-400/15">推荐</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* ===== 个性化方案（有明辨数据时） ===== */}
        {consolidated.completedModules.length > 0 && (
          <div className="rounded-xl overflow-hidden glass-card ring-2 ring-amber-400/40 relative border-culture">
            {/* 左侧朱砂竖线 */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-700 to-red-500" />
            {/* 四角角花补充（右上+左下） */}
            <div className="border-culture-tr" />
            <div className="border-culture-bl" />
            {/* 标题区 */}
            <div className="p-4 pb-2 pl-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold font-serif flex items-center gap-2 text-red-700">
                  <span className="border-l-[3px] border-amber-500 pl-2">辨证施治方案</span>
                </h3>
                <span className="text-xs font-serif border-2 border-red-700 text-red-700 px-2 py-0.5 -rotate-[3deg] inline-block bg-red-700/5">
                  {consolidated.primaryConstitution.replace('质', '')}
                </span>
              </div>
            </div>
            {/* 四宫格方案 */}
            <div className="px-4 pb-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg p-3 bg-emerald-500/10 border-l-[3px] border-emerald-500">
                <p className="text-[10px] font-bold text-emerald-600">推荐五音</p>
                <p className="text-lg font-black font-serif text-gray-800">{consolidated.healingPlan.wuyin.tone}音</p>
                <p className="text-[10px] mt-0.5 text-gray-600">{consolidated.healingPlan.wuyin.reason.slice(0, 24)}...</p>
              </div>
              <div className="rounded-lg p-3 bg-amber-500/10 border-l-[3px] border-amber-500">
                <p className="text-[10px] font-bold text-amber-600">六字诀</p>
                <p className="text-lg font-black font-serif text-gray-800">「{consolidated.healingPlan.liuZiJue.sound}」</p>
                <p className="text-[10px] mt-0.5 text-gray-600">{consolidated.healingPlan.liuZiJue.reason.slice(0, 24)}...</p>
              </div>
              <Link href={`/jiuliao?constitution=${encodeURIComponent(consolidated.primaryConstitution)}`}
                className="rounded-lg p-3 hover:shadow-md transition bg-orange-500/10 border-l-[3px] border-orange-500">
                <p className="text-[10px] font-bold text-orange-600">灸疗处方</p>
                <p className="text-sm font-bold font-serif text-gray-800">{consolidated.healingPlan.jiuLiao.acupoints.slice(0, 2).join(' · ')}</p>
                <p className="text-[10px] mt-0.5 text-gray-600">{consolidated.healingPlan.jiuLiao.meridian}</p>
              </Link>
              <div className="rounded-lg p-3 bg-red-500/10 border-l-[3px] border-red-400">
                <p className="text-[10px] font-bold text-red-500">脉轮</p>
                <p className="text-sm font-bold font-serif text-gray-800">{consolidated.healingPlan.chakra.name}</p>
                <p className="text-[10px] mt-0.5 text-gray-600">{consolidated.healingPlan.chakra.reason.slice(0, 24)}...</p>
              </div>
            </div>
            {/* 饮食 + AI导诊入口 */}
            <div className="px-4 pb-4">
              <div className="flex gap-3 text-xs mb-3">
                <div><span className="font-bold text-amber-600">宜食：</span><span className="text-gray-800">{consolidated.healingPlan.diet.favor.slice(0, 3).join('、')}</span></div>
                <div><span className="font-bold text-red-600">忌食：</span><span className="text-gray-800">{consolidated.healingPlan.diet.avoid.slice(0, 2).join('、')}</span></div>
              </div>
              <Link href="/healing/ai-diagnosis"
                className="flex items-center justify-center gap-2 py-3 rounded-lg text-white font-bold text-sm font-serif transition hover:shadow-md bg-gradient-to-r from-red-800 to-red-600">
                <MessageCircleHeart size={16} /> AI导诊 · 获取详细疗愈指导 <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        )}

        {/* ===== 无明辨数据引导 ===== */}
        {consolidated.completedModules.length === 0 && (
          <Link href="/diagnose" className="block rounded-xl p-5 text-center font-serif transition hover:shadow-md glass-card ring-2 ring-dashed ring-amber-400/50">
            <p className="text-sm font-bold text-red-700">尚未完成体质辨识</p>
            <p className="text-xs mt-1 text-gray-600">前往明辨模块完成辨识，获取个性化疗愈方案</p>
            <span className="inline-block mt-2 text-xs px-4 py-1.5 rounded-lg text-white font-bold bg-gradient-to-r from-red-800 to-red-600">
              开始明辨 →
            </span>
          </Link>
        )}

        {/* ===== 辨证施治入口 ===== */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 rounded-full bg-red-700" />
            <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">辨证施治</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TREATMENT_MODULES.map(m => {
              const MIcon = ICON_MAP[m.icon];
              return (
              <Link key={m.name} href={m.href}
                className="glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 text-center relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-700/60" />
                <div className={`w-11 h-11 rounded-lg mx-auto mb-2 flex items-center justify-center text-white ${ELEMENT_ICON_BG[m.element]}`}>
                  {MIcon && <MIcon size={20} />}
                  {m.name === 'AI导诊' && (
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-3 text-[7px] px-1 rounded-full text-white font-bold bg-red-400">AI</span>
                  )}
                </div>
                <h4 className="font-bold text-sm font-serif text-gray-800">{m.name}</h4>
                <p className="text-[10px] mt-0.5 text-gray-500">{m.desc}</p>
              </Link>
              );
            })}
          </div>
        </div>

        {/* ===== 倪师智慧入口（TCM集成） ===== */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 rounded-full bg-amber-500" />
            <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">倪师智慧</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">NEW</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/healing/acupoint" className="glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 text-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
              <div className="w-11 h-11 rounded-lg mx-auto mb-2 flex items-center justify-center text-white bg-gradient-to-br from-amber-600 to-amber-700">
                <CircleDot size={20} />
              </div>
              <h4 className="font-bold text-sm font-serif text-gray-800">穴位定位</h4>
              <p className="text-[10px] mt-0.5 text-gray-500">571穴·董氏奇穴·视频</p>
            </Link>
            <Link href="/healing/jingfang" className="glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 text-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-700/60" />
              <div className="w-11 h-11 rounded-lg mx-auto mb-2 flex items-center justify-center text-white bg-gradient-to-br from-red-700 to-red-800">
                <FlameKindling size={20} />
              </div>
              <h4 className="font-bold text-sm font-serif text-gray-800">经方处方</h4>
              <p className="text-[10px] mt-0.5 text-gray-500">190首·原文·配伍·倪注</p>
            </Link>
            <Link href="/healing/bencao" className="glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 text-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600/60" />
              <div className="w-11 h-11 rounded-lg mx-auto mb-2 flex items-center justify-center text-white bg-gradient-to-br from-emerald-600 to-emerald-700">
                <Leaf size={20} />
              </div>
              <h4 className="font-bold text-sm font-serif text-gray-800">本草药典</h4>
              <p className="text-[10px] mt-0.5 text-gray-500">320味·性味归经·倪注</p>
            </Link>
            <Link href="/healing/zhishi" className="glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 text-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500/60" />
              <div className="w-11 h-11 rounded-lg mx-auto mb-2 flex items-center justify-center text-white bg-gradient-to-br from-purple-600 to-purple-700">
                <Sparkles size={20} />
              </div>
              <h4 className="font-bold text-sm font-serif text-gray-800">知识图谱</h4>
              <p className="text-[10px] mt-0.5 text-gray-500">179节点·333关系·11类</p>
            </Link>
            <Link href="/healing/bianzheng" className="glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 text-center relative overflow-hidden col-span-2">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-amber-500 to-amber-700 shrink-0">
                  <BarChart3 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm font-serif text-gray-800">辨证引擎</h4>
                  <p className="text-[10px] mt-0.5 text-gray-500">六经辨证 · 十问歌 · 智能辨证 · 倪师注释</p>
                </div>
                <ArrowRight size={16} className="text-amber-600 ml-auto shrink-0" />
              </div>
            </Link>
            <Link href="/healing/yunqi" className="glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 text-center relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500/60" />
              <div className="w-11 h-11 rounded-lg mx-auto mb-2 flex items-center justify-center text-white bg-gradient-to-br from-teal-500 to-teal-700">
                <Sun size={20} />
              </div>
              <h4 className="font-bold text-sm font-serif text-gray-800">五运六气</h4>
              <p className="text-[10px] mt-0.5 text-gray-500">天符岁会·主客顺逆·体质联动</p>
            </Link>
            <Link href="/healing/jibing" className="glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 text-center relative overflow-hidden col-span-2">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg flex items-center justify-center text-white bg-gradient-to-br from-rose-500 to-rose-700 shrink-0">
                  <Zap size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-sm font-serif text-gray-800">疾病仿真</h4>
                  <p className="text-[10px] mt-0.5 text-gray-500">症状输入 → 六经辨证 → 倪师诊断 · 运气疾病倾向</p>
                </div>
                <ArrowRight size={16} className="text-rose-600 ml-auto shrink-0" />
              </div>
            </Link>
          </div>
        </div>

        {/* ===== 音频疗愈专区（三模块统一入口） ===== */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 rounded-full bg-blue-500" />
            <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">音频疗愈</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/40 to-transparent" />
            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold">3 modules</span>
          </div>
          <div className="space-y-3">
            {/* 五音疗愈 */}
            <Link href="/healing/wuyin"
              className="block rounded-xl overflow-hidden relative transition hover:shadow-lg hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-900 via-cyan-800 to-blue-900" />
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(20,184,166,0.4) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(59,130,246,0.3) 0%, transparent 50%)',
              }} />
              <div className="relative z-10 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-teal-300 border border-white/20 flex-shrink-0">
                  <Music size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm font-serif text-white flex items-center gap-2">
                    五音疗愈
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-teal-500/30 text-teal-200 font-normal">角徵宫商羽</span>
                  </h4>
                  <p className="text-[10px] text-white/50 mt-0.5">五行脏腑共振 · 实时声波可视化</p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {[0.5, 0.8, 1, 0.6, 0.9, 0.4].map((h, i) => (
                    <div key={i} className="w-1 bg-teal-400/60 rounded-full animate-pulse" style={{ height: `${h * 16}px`, animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
                <ArrowRight size={16} className="text-teal-300/60 flex-shrink-0" />
              </div>
            </Link>

            {/* 天籁 */}
            <Link href="/healing/mineradio"
              className="block rounded-xl overflow-hidden relative transition hover:shadow-lg hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 via-purple-900 to-slate-900" />
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(139,92,246,0.4) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(59,130,246,0.3) 0%, transparent 50%)',
              }} />
              <div className="relative z-10 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-purple-300 border border-white/20 flex-shrink-0">
                  <Music2 size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm font-serif text-white flex items-center gap-2">
                    天籁
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 font-normal">LIVE</span>
                  </h4>
                  <p className="text-[10px] text-white/50 mt-0.5">天籁无奏 · 万窍自鸣 · 以情胜情</p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {[0.4, 0.7, 1, 0.6, 0.8].map((h, i) => (
                    <div key={i} className="w-1 bg-purple-400/60 rounded-full animate-pulse" style={{ height: `${h * 16}px`, animationDelay: `${i * 200}ms` }} />
                  ))}
                </div>
                <ArrowRight size={16} className="text-purple-300/60 flex-shrink-0" />
              </div>
            </Link>

            {/* 知音之境 */}
            <Link href="/healing/zhi-yin-zhi-jing"
              className="block rounded-xl overflow-hidden relative transition hover:shadow-lg hover:-translate-y-0.5">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-gray-800 to-indigo-950" />
              <div className="absolute inset-0 opacity-20" style={{
                backgroundImage: 'radial-gradient(circle at 25% 50%, rgba(251,191,36,0.3) 0%, transparent 50%), radial-gradient(circle at 75% 40%, rgba(99,102,241,0.3) 0%, transparent 50%)',
              }} />
              <div className="relative z-10 p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20 flex-shrink-0">
                  <Sparkles size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm font-serif text-white flex items-center gap-2">
                    知音之境
                    <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-normal">九境沉浸</span>
                  </h4>
                  <p className="text-[10px] text-white/50 mt-0.5">口语疗愈解说 · 心率联动 · 睡眠定时</p>
                </div>
                <div className="flex items-center gap-0.5 flex-shrink-0">
                  {[0.3, 0.6, 0.9, 0.5, 0.7, 0.4].map((h, i) => (
                    <div key={i} className="w-1 bg-amber-400/60 rounded-full animate-pulse" style={{ height: `${h * 16}px`, animationDelay: `${i * 180}ms` }} />
                  ))}
                </div>
                <ArrowRight size={16} className="text-amber-300/60 flex-shrink-0" />
              </div>
            </Link>
          </div>
        </div>

        {/* ===== 六法疗愈入口 ===== */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 rounded-full bg-amber-600" />
            <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">六法疗愈</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-amber-500/40 to-transparent" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {THERAPY_MODULES.filter(m => m.name !== '天籁' && m.name !== '五音疗愈' && m.name !== '知音之境').map(m => {
              const MIcon = ICON_MAP[m.icon];
              return (
              <Link key={m.name} href={m.href}
                className="glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 text-center relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${ELEMENT_STYLE[m.element].accent} opacity-40`} />
                <div className={`w-11 h-11 rounded-lg mx-auto mb-2 flex items-center justify-center text-white ${ELEMENT_ICON_BG[m.element]}`}>
                  {MIcon && <MIcon size={20} />}
                </div>
                <h4 className="font-bold text-sm font-serif text-gray-800">{m.name}</h4>
                <p className="text-[10px] mt-0.5 text-gray-500">{m.desc}</p>
              </Link>
              );
            })}
          </div>
        </div>

        {/* ===== 生活方式入口 ===== */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-1 h-5 rounded-full bg-emerald-600" />
            <h3 className="font-bold font-serif text-base text-gray-800 tracking-wide">生活方式</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/40 to-transparent" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {LIFESTYLE_MODULES.map(m => {
              const MIcon = ICON_MAP[m.icon];
              return (
              <Link key={m.name} href={m.href}
                className="glass-card p-3 transition hover:shadow-md hover:-translate-y-0.5 text-center relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${ELEMENT_STYLE[m.element].accent} opacity-40`} />
                <div className={`w-9 h-9 rounded-lg mx-auto mb-1.5 flex items-center justify-center text-white ${ELEMENT_ICON_BG[m.element]}`}>
                  {MIcon && <MIcon size={16} />}
                </div>
                <h4 className="font-bold text-xs font-serif text-gray-800">{m.name}</h4>
                <p className="text-[8px] mt-0.5 text-gray-500">{m.desc}</p>
              </Link>
              );
            })}
          </div>
        </div>

        {/* ===== 健康打卡入口 ===== */}
        <Link href="/healing/dashboard"
          className="glass-card p-4 transition hover:shadow-md hover:-translate-y-0.5 flex items-center gap-3 relative overflow-hidden ring-1 ring-amber-400/30">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-700" />
          <div className="w-11 h-11 rounded-lg flex items-center justify-center text-white flex-shrink-0 bg-gradient-to-br from-red-700 to-amber-500">
            <BarChart3 size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm font-serif text-gray-800">健康打卡</h4>
            <p className="text-[10px] mt-0.5 text-gray-500">日历热力图 · 趋势追踪 · 五行推荐</p>
          </div>
          <ArrowRight size={16} className="text-amber-600" />
        </Link>

        {/* ===== 今日疗愈统计 ===== */}
        <div className="glass-card p-4 relative overflow-hidden">
          <div className="absolute right-1 top-1 bottom-1 w-0.5 border border-amber-400/20 border-l-0" />
          <h3 className="font-bold font-serif mb-2 text-red-700 border-l-[3px] border-amber-500 pl-2">今日疗愈</h3>
          <div className="flex items-center gap-4">
            <div className="text-center flex-1">
              <p className="text-2xl font-black font-serif text-red-700">{todaySessionsCompleted}</p>
              <p className="text-[10px] text-gray-600">完成次数</p>
            </div>
            <div className="w-px h-8 bg-amber-400/20" />
            <div className="text-center flex-1">
              <p className="text-2xl font-black font-serif text-amber-600">0</p>
              <p className="text-[10px] text-gray-600">累计分钟</p>
            </div>
          </div>
        </div>

        {/* ===== 每日一言 ===== */}
        <div className="glass-card p-5 text-center relative border-culture">
          <div className="border-culture-tr" />
          <div className="border-culture-bl" />
          <p className="text-base font-serif font-light text-gray-700 leading-loose tracking-wide">
            「{quote.text}」
          </p>
          <p className="text-xs text-gray-400 mt-2 font-serif">—— {quote.author}</p>
        </div>
      </div>

      <BottomNav />
    </PageContainer>
  );
}
