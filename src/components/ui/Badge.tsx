import { type ReactNode } from 'react';

type WuxingElement = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

/**
 * Badge — 小标签/徽章
 *
 * 用于五行标签、状态标签等。
 */
interface BadgeProps {
  children: ReactNode;
  element?: WuxingElement;
  variant?: 'solid' | 'outline' | 'dot';
  dark?: boolean;
  className?: string;
}

const WUXING_SOLID: Record<WuxingElement, string> = {
  wood:   'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
  fire:   'bg-red-500/15 text-red-600 dark:text-red-400',
  earth:  'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  metal:  'bg-teal-500/15 text-teal-600 dark:text-teal-400',
  water:  'bg-blue-500/15 text-blue-600 dark:text-blue-400',
};

const WUXING_OUTLINE: Record<WuxingElement, string> = {
  wood:   'border-emerald-500/25 text-emerald-600 dark:text-emerald-400',
  fire:   'border-red-500/25 text-red-600 dark:text-red-400',
  earth:  'border-amber-500/25 text-amber-600 dark:text-amber-400',
  metal:  'border-teal-500/25 text-teal-600 dark:text-teal-400',
  water:  'border-blue-500/25 text-blue-600 dark:text-blue-400',
};

const WUXING_DOT: Record<WuxingElement, string> = {
  wood:   'before:bg-emerald-500 text-emerald-600 dark:text-emerald-400',
  fire:   'before:bg-red-500 text-red-600 dark:text-red-400',
  earth:  'before:bg-amber-500 text-amber-600 dark:text-amber-400',
  metal:  'before:bg-teal-500 text-teal-600 dark:text-teal-400',
  water:  'before:bg-blue-500 text-blue-600 dark:text-blue-400',
};

export default function Badge({
  children,
  element,
  variant = 'solid',
  dark = false,
  className = '',
}: BadgeProps) {
  let base = 'inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-medium rounded-full';

  if (element) {
    if (variant === 'solid') base += ` ${WUXING_SOLID[element]}`;
    else if (variant === 'outline') base += ` border ${WUXING_OUTLINE[element]}`;
    else if (variant === 'dot') base += ` before:content-[''] before:w-1.5 before:h-1.5 before:rounded-full ${WUXING_DOT[element]}`;
  } else {
    base += dark
      ? ' bg-white/10 text-white/70'
      : ' bg-gray-100 text-gray-600';
  }

  return <span className={`${base} ${className}`}>{children}</span>;
}
