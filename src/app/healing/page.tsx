'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import PageContainer from '@/components/layout/PageContainer';
import ModuleEntryCard from '@/components/healing/ModuleEntryCard';
import { useAppStore } from '@/lib/store';
import { consolidateDiagnosis } from '@/lib/unified-diagnosis';
import {
  MessageCircleHeart, FlameKindling, RotateCw, Hand,
  Wind, Music, Sparkles, Volume2, BarChart3, CircleDot,
  ArrowRight, Sun, Moon, Heart, Zap, Leaf, Dumbbell, Coffee, Wine, Flower2, Palette, Shirt, Music2, Bone,
  Droplets, CalendarHeart, BookOpen, Target, Eye, GitBranch, Clock, Hash,
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
  Droplets, CalendarHeart, BookOpen, Target, Eye, GitBranch, Clock, Hash,
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
  const [scenes, setScenes] = useState<Array<{ id: string; name: string; desc: string; href: string; element: 'wood' | 'fire' | 'earth' | 'metal' | 'water'; icon: typeof Sun }>>([]);
  useEffect(() => {
    setGreeting(getGreeting());
    setScenes(getScenes());
  }, []);

  return (
    <PageContainer theme="healing">
      {/* ══════════ 顶部：Logo 门面 + 问候 + 体质信息 ══════════ */}
      <div className="px-5 pt-12 pb-8 text-white relative overflow-hidden bg-gradient-to-br from-red-950 via-red-900 to-red-800">
        {/* 莲花光能装饰背景 */}
        <img
          src="/images/healing/lotus-light.jpg"
          alt=""
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-32 h-32 object-contain pointer-events-none"
          style={{ opacity: 0.22, mixBlendMode: 'screen', filter: 'blur(0.5px)' }}
        />
        {/* 门面区：Logo + 品牌名 */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="song-logo-badge w-[76px] h-[76px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brand/zhiyin-logo-seal-mini-v8.jpg"
              alt="知音"
              className="w-full h-full object-cover rounded-full"
              loading="eager"
            />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-black font-serif tracking-[0.15em]">知音 · 疗愈</h1>
            <p className="text-xs mt-1 font-serif text-white/60 tracking-wider">辨证论治 · 五法合一 · 调和阴阳</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {greeting.icon}
          <p className="text-sm font-serif text-white/70">{greeting.text}</p>
        </div>

        {/* 体质信息条 */}
        {consolidated.completedModules.length > 0 && (
          <div className="mt-1 rounded-lg px-4 py-2 flex items-center gap-2 flex-wrap bg-amber-400/15 border border-amber-400/30">
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

      <div className="px-4 pt-4 space-y-5">
        {/* ═════════ 场景推荐（4卡片） ═════════ */}
        <section className="song-section">
          <div className="song-section-title mb-3">
            <span className="st-label">推荐场景</span>
            <span className="st-line" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {scenes.map((scene, idx) => (
              <ModuleEntryCard
                key={scene.id}
                href={scene.href}
                icon={<scene.icon size={20} />}
                title={scene.name}
                desc={scene.desc}
                element={scene.element}
                badge={idx === 0 ? '推荐' : undefined}
                iconBg={ELEMENT_ICON_BG[scene.element]}
                className={idx === 0 ? 'ring-1 ring-amber-400/30' : ''}
              />
            ))}
          </div>
        </section>

        {/* ═════════ 个性化方案（有明辨数据时） ═════════ */}
        {consolidated.completedModules.length > 0 && (
          <section className="song-hero-card relative border-culture">
            {/* 左侧朱砂竖线 */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-red-700 to-red-500" />
            {/* 四角角花补充 */}
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
          </section>
        )}

        {/* ═════════ 无明辨数据引导 ═════════ */}
        {consolidated.completedModules.length === 0 && (
          <Link href="/diagnose" className="block rounded-xl p-5 text-center font-serif transition hover:shadow-md glass-card ring-2 ring-dashed ring-amber-400/50">
            <p className="text-sm font-bold text-red-700">尚未完成体质辨识</p>
            <p className="text-xs mt-1 text-gray-600">前往明辨模块完成辨识，获取个性化疗愈方案</p>
            <span className="inline-block mt-2 text-xs px-4 py-1.5 rounded-lg text-white font-bold bg-gradient-to-r from-red-800 to-red-600">
              开始明辨 →
            </span>
          </Link>
        )}

        {/* ═════════ 辨证施治入口 ═════════ */}
        <section className="song-section">
          <div className="song-section-title mb-3">
            <span className="st-label">辨证施治</span>
            <span className="st-line" />
            <span className="st-badge bg-amber-100 text-amber-700 border border-amber-400/40">{TREATMENT_MODULES.length} 法</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TREATMENT_MODULES.map(m => {
              const MIcon = ICON_MAP[m.icon];
              return (
                <ModuleEntryCard
                  key={m.name}
                  href={m.href}
                  icon={MIcon ? <MIcon size={20} /> : <CircleDot size={20} />}
                  title={m.name}
                  desc={m.desc}
                  element={m.element}
                  iconBg={ELEMENT_ICON_BG[m.element]}
                />
              );
            })}
          </div>
        </section>

        {/* ═════════ 倪师智慧入口 ═════════ */}
        <section className="song-section">
          <div className="song-section-title mb-3">
            <span className="st-label">倪师智慧</span>
            <span className="st-line" />
            <span className="st-badge bg-amber-100 text-amber-700">NEW</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ModuleEntryCard href="/healing/jingfang" icon={<FlameKindling size={20} />} title="经方处方" desc="190首·原文·配伍·倪注" element="fire" />
            <ModuleEntryCard href="/healing/bencao" icon={<Leaf size={20} />} title="本草药典" desc="320味·性味归经·倪注" element="wood" />
            <ModuleEntryCard href="/healing/zhishi" icon={<Sparkles size={20} />} title="知识图谱" desc="179节点·333关系·11类" element="metal" />
            <ModuleEntryCard href="/healing/yunqi" icon={<Sun size={20} />} title="五运六气" desc="天符岁会·主客顺逆" element="water" />
            <ModuleEntryCard href="/healing/bianzheng" icon={<BarChart3 size={20} />} title="辨证引擎" desc="六经辨证 · 十问歌 · 智能辨证 · 倪师注释" element="earth" variant="row" className="col-span-2" />
            <ModuleEntryCard href="/healing/jibing" icon={<Zap size={20} />} title="疾病仿真" desc="症状输入 → 六经辨证 → 倪师诊断 · 运气疾病倾向" element="fire" variant="row" className="col-span-2" />
          </div>
        </section>

        {/* ═════════ 灵兰秘典 · 游戏化学习 ═════════ */}
        <section className="song-section">
          <div className="song-section-title mb-3">
            <span className="st-label">灵兰秘典</span>
            <span className="st-line" />
            <span className="st-badge bg-red-100 text-red-700">3000题</span>
          </div>
          <Link href="/healing/tcm-quest" className="block rounded-xl overflow-hidden relative transition hover:shadow-lg hover:-translate-y-0.5">
            <div className="absolute inset-0 bg-gradient-to-r from-red-900 via-amber-800 to-amber-700" />
            <div className="absolute inset-0 opacity-20" style={{
              backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(201,146,42,0.4) 0%, transparent 50%), radial-gradient(circle at 85% 30%, rgba(181,49,28,0.3) 0%, transparent 50%)',
            }} />
            <div className="relative z-10 p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 border border-white/20 flex-shrink-0 text-2xl">
                🏆
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm font-serif text-white flex items-center gap-2">
                  灵兰秘典 · Linglan Canon
                  <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 font-normal">Ultra</span>
                </h4>
                <p className="text-[10px] text-white/50 mt-0.5">3000题库 · 500中药 · 200方剂 · 100医案 · Boss挑战 · 间隔复习</p>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[0.4, 0.7, 1, 0.6, 0.8].map((h, i) => (
                  <div key={i} className="w-1 bg-amber-400/60 rounded-full animate-pulse" style={{ height: `${h * 16}px`, animationDelay: `${i * 200}ms` }} />
                ))}
              </div>
              <ArrowRight size={16} className="text-amber-300/60 flex-shrink-0" />
            </div>
          </Link>
        </section>

        {/* ═════════ 音频疗愈专区 ═════════ */}
        <section className="song-section">
          <div className="song-section-title mb-3">
            <span className="st-label">音频疗愈</span>
            <span className="st-line" />
            <span className="st-badge bg-blue-100 text-blue-700">3 modules</span>
          </div>
          <div className="space-y-3">
            {/* 五音疗愈 */}
            <Link href="/healing/wuyin" className="block rounded-xl overflow-hidden relative transition hover:shadow-lg hover:-translate-y-0.5">
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
            <Link href="/healing/mineradio" className="block rounded-xl overflow-hidden relative transition hover:shadow-lg hover:-translate-y-0.5">
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
            <Link href="/healing/zhi-yin-zhi-jing" className="block rounded-xl overflow-hidden relative transition hover:shadow-lg hover:-translate-y-0.5">
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
        </section>

        {/* ═════════ 六法疗愈入口 ═════════ */}
        <section className="song-section">
          <div className="song-section-title mb-3">
            <span className="st-label">六法疗愈</span>
            <span className="st-line" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {THERAPY_MODULES.filter(m => m.name !== '天籁' && m.name !== '五音疗愈' && m.name !== '知音之境').map(m => {
              const MIcon = ICON_MAP[m.icon];
              return (
                <ModuleEntryCard
                  key={m.name}
                  href={m.href}
                  icon={MIcon ? <MIcon size={20} /> : <CircleDot size={20} />}
                  title={m.name}
                  desc={m.desc}
                  element={m.element}
                  iconBg={ELEMENT_ICON_BG[m.element]}
                />
              );
            })}
          </div>
        </section>

        {/* ═════════ 生活方式入口 ═════════ */}
        <section className="song-section">
          <div className="song-section-title mb-3">
            <span className="st-label">生活方式</span>
            <span className="st-line" />
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {LIFESTYLE_MODULES.map(m => {
              const MIcon = ICON_MAP[m.icon];
              return (
                <ModuleEntryCard
                  key={m.name}
                  href={m.href}
                  icon={MIcon ? <MIcon size={16} /> : <CircleDot size={16} />}
                  title={m.name}
                  desc={m.desc}
                  element={m.element}
                  iconBg={ELEMENT_ICON_BG[m.element]}
                  className="p-3"
                />
              );
            })}
          </div>
        </section>

        {/* ═════════ 健康打卡入口 ═════════ */}
        <ModuleEntryCard
          href="/healing/dashboard"
          icon={<BarChart3 size={20} />}
          title="健康打卡"
          desc="日历热力图 · 趋势追踪 · 五行推荐"
          variant="row"
          iconBg="bg-gradient-to-br from-red-700 to-amber-500"
        />

        {/* ═════════ 今日疗愈统计 ═════════ */}
        <div className="song-hero-card p-4 relative overflow-hidden">
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

        {/* ═════════ 每日一言 ═════════ */}
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