'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { type ReactNode } from 'react';

type WuxingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/**
 * HealingHeader — 疗愈子页面统一头
 *
 * 替代 8 个 healing/* 页面各自内联的 ~20 行 header。
 * 支持亮色/暗色模式（深空/银河页面用 dark）、五行色点缀。
 *
 * Props:
 *   title       — 页面标题
 *   subtitle?   — 副标题
 *   backHref?   — 返回链接，默认 /healing
 *   dark?       — 暗色模式（深空/银河背景页面）
 *   element?    — 五行元素，用于左侧装饰线颜色
 *   rightSlot?  — 右侧自定义内容（计时器、状态等）
 */

const WUXING_ACCENT: Record<WuxingElement, string> = {
  wood:   'bg-emerald-400/80',
  fire:   'bg-red-400/80',
  earth:  'bg-amber-400/80',
  metal:  'bg-teal-400/80',
  water:  'bg-blue-400/80',
};

const WUXING_BORDER: Record<WuxingElement, string> = {
  wood:   'border-emerald-400/20',
  fire:   'border-red-400/20',
  earth:  'border-amber-400/20',
  metal:  'border-teal-400/20',
  water:  'border-blue-400/20',
};

interface HealingHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  dark?: boolean;
  element?: WuxingElement;
  rightSlot?: ReactNode;
}

export default function HealingHeader({
  title,
  subtitle,
  backHref = '/healing',
  dark = false,
  element,
  rightSlot,
}: HealingHeaderProps) {
  const textCls = dark ? 'text-white' : 'text-gray-900';
  const subCls = dark ? 'text-white/40' : 'text-gray-400';
  const backBg = dark
    ? 'bg-white/10 hover:bg-white/20'
    : 'bg-black/5 hover:bg-black/10';
  const backIcon = dark ? 'text-white/70' : 'text-gray-600';
  const wrapperBg = dark
    ? 'bg-gradient-to-b from-gray-950/95 to-transparent'
    : 'bg-gradient-to-b from-white/80 to-transparent';

  return (
    <header className={`flex-shrink-0 px-4 pt-12 pb-3 relative z-10 ${wrapperBg}`}>
      <div className="flex items-center gap-3">
        {/* 返回按钮 */}
        <Link
          href={backHref}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${backBg}`}
        >
          <ArrowLeft size={18} className={backIcon} />
        </Link>

        {/* 五行装饰线 */}
        {element && (
          <div className={`w-0.5 h-6 rounded-full ${WUXING_ACCENT[element]}`} />
        )}

        {/* 标题区 */}
        <div className="flex-1 min-w-0">
          <h1
            className={`text-lg font-black tracking-[0.15em] leading-tight ${textCls}`}
          >
            {title}
          </h1>
          {subtitle && (
            <p className={`text-xs mt-0.5 truncate ${subCls}`}>{subtitle}</p>
          )}
        </div>

        {/* 右侧插槽 */}
        {rightSlot && <div className="flex-shrink-0">{rightSlot}</div>}
      </div>

      {/* 底部分隔线（亮色模式） */}
      {!dark && (
        <div className={`mt-2 h-px ${element ? WUXING_BORDER[element] : 'bg-gray-200/40'}`} />
      )}
    </header>
  );
}
