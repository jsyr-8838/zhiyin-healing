'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BottomNav from '@/components/BottomNav';
import { useAppStore } from '@/lib/store';
import { getGreeting } from '@/lib/utils';
import { WUYIN_DETAILS } from '@/lib/tcm-data';
import { getCurrentSolarTerm, getNextSolarTerm } from '@/lib/solar-terms-data';
import { MessageCircle, ArrowRight, Sparkles, Zap, Leaf, ClipboardCheck, TrendingUp, Compass, BookOpen, Stethoscope, FlameKindling, Camera, Brain, Bone, Music, Wind, Droplets, Sun, Moon, TreePine } from 'lucide-react';
import { getClientUserId } from '@/lib/auth';
import DailyPracticeCard from '@/components/cultivation/DailyPracticeCard';
import XiuWeiOverview from '@/components/cultivation/XiuWeiOverview';
import OnboardingFlow from '@/components/cultivation/OnboardingFlow';
import SolarGiftCard from '@/components/cultivation/SolarGiftCard';

// 五行对应图标与色系（核心流程精简）
const WUXING_MODULES = [
  { href: '/diagnose', introHref: '/intro/mingbian', icon: Stethoscope, label: '明辨', sub: '体质辨识', wuxing: 'wood', color: 'var(--wood)' },
  { href: '/healing', introHref: '/intro/liaoyu', icon: FlameKindling, label: '疗愈', sub: '五法合一', wuxing: 'fire', color: 'var(--fire)' },
  { href: '/meridian', introHref: '/intro/jingluo', icon: Bone, label: '经络', sub: '3D穴位', wuxing: 'water', color: 'var(--water)' },
] as const;

// 修为页面入口
const CULTIVATION_HREF = '/cultivation';

export default function DashboardPage() {
  const { lastProfile, todaySessionsCompleted } = useAppStore();

  const greeting = getGreeting();
  const solarTerm = getCurrentSolarTerm();
  const nextTerm = getNextSolarTerm();

  const [streak, setStreak] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [todayChecked, setTodayChecked] = useState(false);
  const [todayHealthScore, setTodayHealthScore] = useState<number | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    try {
      const res = await fetch(`/api/checkin?userId=${getClientUserId()}&days=7`);
      if (res.ok) {
        const data = await res.json();
        setStreak(data.streak);
        setAvgScore(data.avgHealthScore);
        setTodayChecked(!!data.todayCheckin);
        if (data.todayCheckin) {
          setTodayHealthScore(data.todayCheckin.healthScore);
        }
      }
    } catch {}
  }

  // 根据时段返回意境词
  const timeMood = (() => {
    const h = new Date().getHours();
    if (h < 6) return { text: '夜阑人静', char: '辰' };
    if (h < 9) return { text: '晨光初照', char: '卯' };
    if (h < 11) return { text: '日上三竿', char: '巳' };
    if (h < 13) return { text: '日正中天', char: '午' };
    if (h < 17) return { text: '斜阳午後', char: '未' };
    if (h < 19) return { text: '暮色将至', char: '酉' };
    return { text: '月明星稀', char: '戌' };
  })();

  return (
    <div className="min-h-screen pb-24 bg-home texture-paper texture-ink-wash">
      {/* ═══ 山水头部 — 晨雾留白意境 ═══ */}
      <div className="relative px-6 pt-14 pb-10 overflow-hidden">
        {/* 装饰：远山剪影SVG */}
        <svg className="absolute bottom-0 left-0 right-0 w-full opacity-[0.04]" viewBox="0 0 400 80" preserveAspectRatio="none" style={{ height: '80px' }}>
          <path d="M0,80 L0,50 Q50,10 100,40 Q150,65 200,30 Q250,5 300,35 Q350,55 400,25 L400,80Z" fill="var(--ink-main)" />
          <path d="M0,80 L0,60 Q80,30 160,55 Q240,70 320,40 Q370,25 400,45 L400,80Z" fill="var(--ink-light)" opacity="0.5" />
        </svg>

        {/* 装饰：五行太极缓转 */}
        <div className="absolute top-16 right-4 w-28 h-28 opacity-[0.05] animate-slow-rotate">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke="var(--ink-main)" strokeWidth="0.5" />
            <path d="M50,2 A48,48 0 0,1 50,98 A24,24 0 0,0 50,50 A24,24 0 0,1 50,2" fill="var(--ink-main)" opacity="0.3" />
            <circle cx="50" cy="26" r="4" fill="var(--xuan-paper)" />
            <circle cx="50" cy="74" r="4" fill="var(--ink-main)" opacity="0.3" />
          </svg>
        </div>

        <div className="relative">
          <p className="text-sm font-medium" style={{ color: 'var(--ink-light)', letterSpacing: '0.15em' }}>{timeMood.text}</p>
          <h1 className="text-3xl font-black mt-2" style={{ color: 'var(--ink-main)', letterSpacing: '0.08em' }}>知音</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ink-light)', opacity: 0.7 }}>调和阴阳 · 顺应天时</p>
        </div>

        {/* 节气卡片 — 微宣纸质感 */}
        <div className="relative mt-6 rounded-2xl p-5 overflow-hidden" style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.6)',
          boxShadow: '0 8px 32px rgba(30,45,38,0.08)',
        }}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Leaf size={14} style={{ color: 'var(--wood)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--wood)' }}>当令节气</span>
              </div>
              <h3 className="text-xl font-black" style={{ color: 'var(--ink-main)' }}>{solarTerm.name} · {solarTerm.season}季</h3>
              <p className="text-sm mt-1" style={{ color: 'var(--ink-light)' }}>{solarTerm.shortTip}</p>
              <p className="text-xs mt-1.5" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>下一节气：{nextTerm.name}</p>
            </div>
            {todayHealthScore !== null && (
              <div className="text-center ml-3">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg, var(--wood), var(--water))',
                  boxShadow: '0 4px 16px rgba(93,138,99,0.3)',
                }}>
                  <div className="text-white text-center">
                    <p className="text-xl font-black leading-none">{todayHealthScore}</p>
                    <p className="text-[8px] mt-0.5 opacity-80">健康分</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 space-y-5">
        {/* ═══ 今日功法 — 首屏核心，解决"打开不知道做什么" ═══ */}
        <DailyPracticeCard />

        {/* ═══ 节气礼遇 — 替代惊喜盒，文化调性统一 ═══ */}
        <SolarGiftCard />

        {/* ═══ 五行修为概览 — 段位+修为条 ═══ */}
        <XiuWeiOverview />

        {/* ═══ 核心流程 — 明辨→疗愈→经络 精简快捷入口 ═══ */}
        <div className="flex gap-2">
          {WUXING_MODULES.map((mod) => (
            <Link key={mod.href} href={mod.href} className="flex-1 glass-card p-3 text-center hover:scale-[1.02] transition-transform">
              <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-white" style={{ background: mod.color }}>
                <mod.icon size={16} />
              </div>
              <h4 className="font-bold text-xs" style={{ color: 'var(--ink-main)' }}>{mod.label}</h4>
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--ink-light)', opacity: 0.5 }}>{mod.sub}</p>
            </Link>
          ))}
          {/* 修为入口 */}
          <Link href={CULTIVATION_HREF} className="flex-1 glass-card p-3 text-center hover:scale-[1.02] transition-transform">
            <div className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--wood), var(--water))' }}>
              <TreePine size={16} />
            </div>
            <h4 className="font-bold text-xs" style={{ color: 'var(--ink-main)' }}>修为</h4>
            <p className="text-[9px] mt-0.5" style={{ color: 'var(--ink-light)', opacity: 0.5 }}>五行成长</p>
          </Link>
        </div>

        {/* ═══ 每日打卡 — 墨晕能量 ═══ */}
        <Link
          href="/checkin"
          className="glass-card flex items-center gap-4 p-5"
        >
          <div className="relative w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{
            background: todayChecked
              ? 'linear-gradient(135deg, var(--wood), var(--water))'
              : 'linear-gradient(135deg, var(--earth), var(--ochre))',
          }}>
            <ClipboardCheck size={22} />
            {!todayChecked && (
              <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-glow-pulse" style={{ background: 'var(--fire)' }} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold" style={{ color: 'var(--ink-main)' }}>
              {todayChecked ? '今日已打卡' : '每日健康打卡'}
            </h3>
            <p className="text-sm mt-0.5" style={{ color: 'var(--ink-light)' }}>
              {todayChecked
                ? `健康分 ${todayHealthScore ?? '--'} · 连续${streak}天`
                : '睡眠 · 情绪 · 运动 · 饮食'}
            </p>
          </div>
          <ArrowRight size={18} style={{ color: 'var(--ink-light)', opacity: 0.4 }} />
        </Link>

        {/* ═══ 体质结果 / 测体质入口 ═══ */}
        {lastProfile ? (
          <Link href="/diagnose" className="glass-card flex items-center p-5">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center text-white mr-4 flex-shrink-0"
              style={{
                background: `linear-gradient(135deg, ${
                  lastProfile.dominant === 'jiao' ? 'var(--wood)' :
                  lastProfile.dominant === 'zhi' ? 'var(--fire)' :
                  lastProfile.dominant === 'gong' ? 'var(--earth)' :
                  lastProfile.dominant === 'shang' ? 'var(--metal)' : 'var(--water)'
                }, ${
                  lastProfile.dominant === 'jiao' ? 'var(--wood-deep)' :
                  lastProfile.dominant === 'zhi' ? 'var(--fire-deep)' :
                  lastProfile.dominant === 'gong' ? 'var(--earth-deep)' :
                  lastProfile.dominant === 'shang' ? 'var(--metal-deep)' : 'var(--water-deep)'
                })`
              }}
            >
              <Music size={20} />
            </div>
            <div className="flex-1">
              <p className="text-xs" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>你的体质</p>
              <h3 className="text-lg font-bold mt-0.5" style={{ color: 'var(--ink-main)' }}>
                {WUYIN_DETAILS[lastProfile.dominant].name}音 · {WUYIN_DETAILS[lastProfile.dominant].element}行
              </h3>
              <p className="text-sm" style={{ color: 'var(--ink-light)' }}>
                对应{WUYIN_DETAILS[lastProfile.dominant].organ} · 易感「{WUYIN_DETAILS[lastProfile.dominant].emotion}」
              </p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--ink-light)', opacity: 0.4 }} />
          </Link>
        ) : (
          <Link href="/diagnose" className="glass-card flex items-center gap-4 p-5">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white flex-shrink-0" style={{ background: 'linear-gradient(135deg, var(--wood), var(--wood-deep))' }}>
              <Stethoscope size={22} />
            </div>
            <div className="flex-1">
              <h3 className="font-bold" style={{ color: 'var(--ink-main)' }}>测测你的五行体质</h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--ink-light)' }}>22题九种体质 + AI舌诊</p>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--ink-light)', opacity: 0.4 }} />
          </Link>
        )}

        {/* ═══ 快捷功能 — 六宫格 ═══ */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: '/diagnose', introHref: '/intro/mingbian', icon: Camera, label: 'AI舌诊', sub: '拍照辨舌·体质分析', gradient: 'var(--fire), var(--fire-deep)' },
            { href: '/diagnosis', icon: MessageCircle, label: 'AI导诊', sub: '随时咨询·智能辨证', gradient: 'var(--earth), var(--earth-deep)' },
            { href: '/divination', introHref: '/intro/zhiji', icon: Compass, label: '知几', sub: '排盘引擎·知几为先', gradient: 'var(--indigo), #3a5068' },
            { href: '/classics', introHref: '/intro/xuanlan', icon: BookOpen, label: '玄览', sub: '山医命相卜·36部经典', gradient: 'var(--ochre), var(--earth-deep)' },
            { href: '/season', icon: Wind, label: '节气养生', sub: `${solarTerm.name}·${solarTerm.season}季`, gradient: 'var(--water), var(--water-deep)' },
            { href: '/ingredient', icon: Sparkles, label: '食材百科', sub: '相生相克·食养有道', gradient: 'var(--earth), var(--ochre)' },
          ].map(item => (
            <Link key={item.href} href={item.href} className="glass-card p-4 hover:scale-[1.02] transition-transform relative">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3"
                style={{ background: `linear-gradient(135deg, ${item.gradient})` }}
              >
                <item.icon size={18} />
              </div>
              <h3 className="font-bold text-sm" style={{ color: 'var(--ink-main)' }}>{item.label}</h3>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>{item.sub}</p>
              {item.introHref && (
                <span onClick={(e) => { e.preventDefault(); e.stopPropagation(); }} className="absolute top-3 right-3">
                  <Link href={item.introHref} className="text-[9px] font-bold px-1.5 py-0.5 rounded-full transition-colors"
                    style={{ background: 'rgba(30,45,38,0.05)', color: 'var(--ink-light)' }}>
                    介绍
                  </Link>
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* ═══ 健康概况 — 五行色 ═══ */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold" style={{ color: 'var(--ink-main)' }}>健康概况</h3>
            <Link href="/checkin" className="flex items-center gap-1 text-xs font-bold" style={{ color: 'var(--wood)' }}>
              <TrendingUp size={12} /> 详情
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: todaySessionsCompleted, label: '疗愈次数', color: 'var(--wood)' },
              { value: streak || '--', label: '连续天数', color: 'var(--earth)' },
              { value: avgScore || '--', label: '近期均分', color: 'var(--water)' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-black" style={{ color: stat.color }}>{stat.value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--ink-light)', opacity: 0.6 }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ 节气养生 — 草药意象 ═══ */}
        <div className="glass-card p-5">
          <h3 className="font-bold mb-4" style={{ color: 'var(--ink-main)' }}>{solarTerm.name}节气养生</h3>
          <div className="space-y-2.5">
            {solarTerm.foods.split('、').map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: `rgba(${[93, 91, 201, 194, 143, 201, 74][i % 7]}, ${[138, 160, 169, 97, 200, 169, 104][i % 7]}, ${[99, 154, 79, 88, 189, 79, 128][i % 7]}, 0.12)`,
                    color: `rgb(${[93, 91, 201, 194, 143, 201, 74][i % 7]}, ${[138, 160, 169, 97, 200, 169, 104][i % 7]}, ${[99, 154, 79, 88, 189, 79, 128][i % 7]})`,
                  }}
                >
                  {i + 1}
                </div>
                <span className="text-sm" style={{ color: 'var(--ink-light)' }}>{item}</span>
              </div>
            ))}
          </div>
          <Link href="/season" className="flex items-center gap-1 text-xs font-bold mt-4" style={{ color: 'var(--wood)' }}>
            查看全部24节气 <ArrowRight size={12} />
          </Link>
        </div>

        {/* 页底留白 */}
        <div className="h-8" />
      </div>

      <BottomNav />

      {/* 首次引导流 */}
      <OnboardingFlow />
    </div>
  );
}
