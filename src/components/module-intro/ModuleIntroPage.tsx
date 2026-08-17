'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';
import BottomNav from '@/components/BottomNav';

/* ================================================================
 *  ModuleIntroPage — 模块专业版介绍页
 *  宋韵极简 × 五行色点缀 × 液态玻璃美学
 *  设计理念：诗意卷轴 + 宣纸留白 + 五行流光
 * ================================================================ */

export interface ModuleFeature {
  icon: string;
  title: string;
  desc: string;
}

export interface ModuleIntroProps {
  /** 模块ID，用于图片路径和路由 */
  moduleId: string;
  /** 诗意名（如 明辨、知几） */
  poeticName: string;
  /** 副标题/一句话描述 */
  tagline: string;
  /** 五行属性 */
  wuxing: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  /** 五行中文名 */
  wuxingLabel: string;
  /** 宣介文案（2-3段） */
  description: string[];
  /** 核心功能卡片 */
  features: ModuleFeature[];
  /** 底部CTA链接 */
  ctaHref: string;
  /** CTA按钮文案 */
  ctaLabel: string;
  /** 底部导航返回路径 */
  backHref?: string;
}

// 五行色系映射
const WUXING_COLORS = {
  wood:  { primary: '#5d8a63', light: '#eef5ef', mid: '#aedbb3', glow: 'rgba(93,138,99,0.35)' },
  fire:  { primary: '#c26158', light: '#fdf0ee', mid: '#f0b3ad', glow: 'rgba(194,97,88,0.35)' },
  earth: { primary: '#c9a94f', light: '#fdf8e8', mid: '#f0dba0', glow: 'rgba(201,169,79,0.35)' },
  metal: { primary: '#8fa6a0', light: '#f0f4f3', mid: '#b9ccc9', glow: 'rgba(143,166,160,0.35)' },
  water: { primary: '#3d7a75', light: '#ecf6f5', mid: '#9fd5d1', glow: 'rgba(61,122,117,0.40)' },
};

const WUXING_CHARS: Record<string, string> = {
  wood: '木', fire: '火', earth: '土', metal: '金', water: '水',
};

export default function ModuleIntroPage({
  moduleId,
  poeticName,
  tagline,
  wuxing,
  wuxingLabel,
  description,
  features,
  ctaHref,
  ctaLabel,
  backHref = '/dashboard',
}: ModuleIntroProps) {
  const [visible, setVisible] = useState(false);
  const colors = WUXING_COLORS[wuxing];

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="relative min-h-screen overflow-y-auto overflow-x-hidden pb-20" style={{ background: '#FDF8F0' }}>
      {/* ═══ 背景层：五行色雾 + 宣纸纹理 ═══ */}
      <div className="absolute inset-0 pointer-events-none" style={{
        background: `
          radial-gradient(ellipse 80% 50% at 50% 15%, ${colors.glow}, transparent),
          radial-gradient(ellipse 40% 40% at 85% 85%, ${colors.glow.replace('0.25', '0.10')}, transparent),
          radial-gradient(ellipse 30% 30% at 10% 70%, ${colors.glow.replace('0.25', '0.06')}, transparent)
        `,
      }} />

      {/* 浮动五行字符装饰 */}
      <div className="absolute top-20 right-6 text-8xl font-serif font-black pointer-events-none select-none"
        style={{ color: colors.primary, opacity: 0.04, transform: 'rotate(12deg)' }}>
        {WUXING_CHARS[wuxing]}
      </div>
      <div className="absolute bottom-40 left-4 text-6xl font-serif font-black pointer-events-none select-none"
        style={{ color: colors.primary, opacity: 0.03, transform: 'rotate(-8deg)' }}>
        {WUXING_CHARS[wuxing]}
      </div>

      {/* ═══ 顶部导航 ═══ */}
      <header className="relative z-20 px-4 pt-12 pb-3 flex items-center gap-3"
        style={{
          background: 'linear-gradient(to bottom, rgba(253,248,240,0.95), rgba(253,248,240,0))',
          backdropFilter: 'blur(12px)',
        }}>
        <Link href={backHref}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={{ background: 'rgba(30,45,38,0.05)' }}>
          <ArrowLeft size={18} style={{ color: 'var(--ink-light)' }} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-0.5 h-5 rounded-full" style={{ background: colors.primary }} />
            <h1 className="text-lg font-black tracking-[0.15em]" style={{ color: 'var(--ink-main)' }}>
              {poeticName}
            </h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
              style={{ background: colors.light, color: colors.primary, border: `1px solid ${colors.mid}60` }}>
              {wuxingLabel}行
            </span>
          </div>
        </div>
      </header>

      {/* ═══ 内容区（可滚动） ═══ */}
      <div className="relative z-10 px-5 pt-2 pb-32">

        {/* ── 模块Hero区 — 大字书法主视觉 + AI图氛围底纹 ── */}
        <div className={`relative rounded-2xl overflow-hidden mb-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ height: '50vh', minHeight: 320 }}>
          {/* 氛围底纹图（低透明度，仅作肌理） */}
          <Image
            src={`/images/modules/${moduleId}.jpg`}
            alt={tagline}
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority
            style={{ opacity: 0.18 }}
          />
          {/* 五行渐变主背景 */}
          <div className="absolute inset-0" style={{
            background: `linear-gradient(160deg, ${colors.primary}28, ${colors.primary}10 40%, rgba(253,248,240,0.9) 80%)`,
          }} />
          {/* 中心大字—模块诗意名 */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="mb-3 text-xs font-bold tracking-[0.35em] uppercase" style={{ color: colors.primary, opacity: 0.6 }}>
              {wuxingLabel}行
            </div>
            <div className="font-serif font-black leading-none select-none" style={{
              fontSize: 'clamp(72px, 20vw, 120px)',
              color: colors.primary,
              textShadow: `0 4px 24px ${colors.glow}, 0 2px 6px ${colors.mid}60`,
              letterSpacing: '0.05em',
              WebkitTextStroke: `1px ${colors.primary}40`,
            }}>
              {poeticName}
            </div>
            <div className="mt-4 text-base font-bold tracking-[0.15em]" style={{ color: 'var(--ink-main)' }}>
              {tagline}
            </div>
            {/* 装饰线 */}
            <div className="mt-4 flex items-center gap-2">
              <div className="w-8 h-px" style={{ background: colors.primary, opacity: 0.3 }} />
              <Sparkles size={12} style={{ color: colors.primary, opacity: 0.5 }} />
              <div className="w-8 h-px" style={{ background: colors.primary, opacity: 0.3 }} />
            </div>
          </div>
        </div>

        {/* ── 诗意宣介 ── 渐入动画 */}
        <div className={`space-y-3 mb-8 transition-all duration-700 delay-200 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ borderLeft: `2px solid ${colors.mid}50`, paddingLeft: 16 }}>
          {description.map((para, i) => (
            <p key={i} className="text-sm leading-relaxed" style={{ color: 'var(--ink-light)', textIndent: '2em' }}>
              {para}
            </p>
          ))}
        </div>

        {/* ── 核心功能卡片 ── 液态玻璃 + 五行色点缀 */}
        <div className={`mb-8 transition-all duration-700 delay-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-4 rounded-full" style={{ background: colors.primary }} />
            <h3 className="text-sm font-black tracking-[0.1em]" style={{ color: 'var(--ink-main)' }}>核心功能</h3>
          </div>
          <div className="space-y-3">
            {features.map((feat, i) => (
              <div key={i} className="rounded-xl p-4 relative overflow-hidden transition-all hover:scale-[1.01]"
                style={{
                  background: `linear-gradient(145deg, rgba(255,255,255,0.6), rgba(255,255,255,0.3))`,
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${colors.mid}30`,
                  boxShadow: `0 4px 16px ${colors.glow.replace('0.25', '0.06')}`,
                }}>
                {/* 左侧五行色条 */}
                <div className="absolute left-0 top-0 bottom-0 w-0.5" style={{ background: colors.primary }} />
                <div className="flex items-start gap-3 pl-2">
                  <span className="text-2xl mt-0.5">{feat.icon}</span>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold" style={{ color: 'var(--ink-main)' }}>{feat.title}</h4>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--ink-light)', opacity: 0.8 }}>{feat.desc}</p>
                  </div>
                  <ChevronRight size={14} style={{ color: colors.primary, opacity: 0.4, marginTop: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA按钮 ── 五行渐变 + 光晕 */}
        <div className={`transition-all duration-700 delay-400 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Link href={ctaHref}
            className="block w-full py-4 rounded-2xl text-center font-bold text-base tracking-[0.1em] transition-all active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.primary}cc)`,
              color: 'white',
              boxShadow: `0 8px 32px ${colors.glow}`,
            }}>
            {ctaLabel}
          </Link>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
