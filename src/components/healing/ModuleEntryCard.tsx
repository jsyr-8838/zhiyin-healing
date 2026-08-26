'use client';

import Link from 'next/link';
import { type ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * ModuleEntryCard — 疗愈模块统一入口卡片（宋韵雅致风）
 *
 * 设计原则：
 *  - 只负责外观包装，不承载任何业务逻辑
 *  - 三端自适应：手机单列紧凑、平板/PC 由网格决定列数
 *  - 交互毫秒级：纯 CSS transform + opacity，无 JS 计算
 *
 * 变体：
 *  - grid : 竖版图标卡（图标在上，标题在下），默认
 *  - row  : 横版图标卡（图标在左，标题在右），适合宽卡
 */
type Variant = 'grid' | 'row';

interface Props {
  href: string;
  icon: ReactNode;
  title: string;
  desc?: string;
  /** 五行标记（显示为右上角小印章） */
  element?: 'wood' | 'fire' | 'earth' | 'metal' | 'water';
  /** 右上角徽标文案（如 NEW / 3000题），优先级高于五行印章 */
  badge?: string;
  variant?: Variant;
  /** 图标容器背景类（默认五行渐变） */
  iconBg?: string;
  /** 图标颜色类（默认白） */
  iconColor?: string;
  className?: string;
}

const ELEMENT_TEXT: Record<string, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

const ELEMENT_SEAL: Record<string, string> = {
  wood: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  fire: 'text-red-600 bg-red-500/10 border-red-500/30',
  earth: 'text-amber-600 bg-amber-500/10 border-amber-500/30',
  metal: 'text-teal-600 bg-teal-500/10 border-teal-500/30',
  water: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
};

const DEFAULT_ICON_BG: Record<string, string> = {
  wood: 'bg-gradient-to-br from-emerald-500 to-emerald-700',
  fire: 'bg-gradient-to-br from-red-500 to-red-700',
  earth: 'bg-gradient-to-br from-amber-400 to-amber-600',
  metal: 'bg-gradient-to-br from-teal-500 to-teal-700',
  water: 'bg-gradient-to-br from-blue-500 to-blue-700',
};

export default function ModuleEntryCard({
  href,
  icon,
  title,
  desc,
  element,
  badge,
  variant = 'grid',
  iconBg,
  iconColor = 'text-white',
  className = '',
}: Props) {
  const sealLabel = element ? ELEMENT_TEXT[element] : undefined;
  const iconBgClass = iconBg ?? (element ? DEFAULT_ICON_BG[element] : 'bg-gradient-to-br from-amber-400 to-amber-600');

  if (variant === 'row') {
    return (
      <Link
        href={href}
        className={`song-card group flex items-center gap-3 p-3.5 ${className}`}
      >
        <div className={`song-seal w-11 h-11 ${iconBgClass}`}>
          <span className={iconColor}>{icon}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-sm font-serif text-gray-800 truncate">{title}</h4>
            {badge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold shrink-0">
                {badge}
              </span>
            )}
          </div>
          {desc && <p className="text-[10px] mt-0.5 text-gray-500 truncate">{desc}</p>}
        </div>
        <ArrowRight
          size={16}
          className="text-amber-500/50 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-amber-600"
        />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className={`song-card group relative p-4 text-center ${className}`}
    >
      {/* 右上角五行小印章 */}
      {!badge && sealLabel && (
        <span
          className={`absolute top-2 right-2 text-[9px] font-bold w-5 h-5 rounded-full border flex items-center justify-center ${ELEMENT_SEAL[element]}`}
        >
          {sealLabel}
        </span>
      )}
      {/* 右上角徽标 */}
      {badge && (
        <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold">
          {badge}
        </span>
      )}
      <div className={`song-seal w-11 h-11 mx-auto mb-2 ${iconBgClass}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <h4 className="font-bold text-sm font-serif text-gray-800 leading-tight">{title}</h4>
      {desc && <p className="text-[10px] mt-1 text-gray-500 leading-relaxed">{desc}</p>}
    </Link>
  );
}