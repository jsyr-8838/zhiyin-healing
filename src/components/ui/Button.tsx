import { type ReactNode } from 'react';

type WuxingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/**
 * Button — 五行疗愈主题按钮
 *
 * 90% 基础色 + 10% 五行点缀色。
 * 支持亮色/暗色模式、五行色、尺寸变体。
 */
interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'wuxing';
  element?: WuxingElement;
  size?: 'sm' | 'md' | 'lg';
  dark?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

const WUXING_BTN: Record<WuxingElement, string> = {
  wood:   'bg-emerald-500/15 text-emerald-400 border-emerald-500/25 active:bg-emerald-500/25',
  fire:   'bg-red-500/15 text-red-400 border-red-500/25 active:bg-red-500/25',
  earth:  'bg-amber-500/15 text-amber-400 border-amber-500/25 active:bg-amber-500/25',
  metal:  'bg-teal-500/15 text-teal-400 border-teal-500/25 active:bg-teal-500/25',
  water:  'bg-blue-500/15 text-blue-400 border-blue-500/25 active:bg-blue-500/25',
};

const WUXING_BTN_LIGHT: Record<WuxingElement, string> = {
  wood:   'bg-emerald-500 text-white hover:bg-emerald-600',
  fire:   'bg-red-500 text-white hover:bg-red-600',
  earth:  'bg-amber-500 text-white hover:bg-amber-600',
  metal:  'bg-teal-500 text-white hover:bg-teal-600',
  water:  'bg-blue-500 text-white hover:bg-blue-600',
};

const SIZE_MAP = {
  sm: 'px-3 py-1.5 text-xs rounded-[var(--r-sm)]',
  md: 'px-4 py-2.5 text-sm rounded-[var(--r-md)]',
  lg: 'px-6 py-3.5 text-base rounded-[var(--r-lg)]',
};

export default function Button({
  children,
  variant = 'primary',
  element,
  size = 'md',
  dark = false,
  disabled = false,
  className = '',
  onClick,
}: ButtonProps) {
  let base = SIZE_MAP[size];

  if (variant === 'wuxing' && element) {
    base += dark
      ? ` border ${WUXING_BTN[element]}`
      : ` border ${WUXING_BTN_LIGHT[element]}`;
  } else if (variant === 'primary') {
    base += dark
      ? ' bg-white/10 text-white border border-white/15 active:bg-white/20'
      : ' bg-gray-900 text-white active:bg-gray-800';
  } else if (variant === 'secondary') {
    base += dark
      ? ' bg-white/6 text-white/80 border border-white/10 active:bg-white/12'
      : ' bg-white text-gray-700 border border-gray-200 active:bg-gray-50';
  } else if (variant === 'ghost') {
    base += dark
      ? ' text-white/60 active:bg-white/10'
      : ' text-gray-500 active:bg-gray-100';
  }

  if (disabled) {
    base += ' opacity-40 pointer-events-none';
  }

  return (
    <button className={`inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 ${base} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
