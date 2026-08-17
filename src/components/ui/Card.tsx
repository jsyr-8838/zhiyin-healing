import { type ReactNode } from 'react';

/**
 * Card — 毛玻璃卡片
 *
 * 对应 globals.css 中的 .glass-card。
 * 默认亮色，支持 dark 模式（.glass-dark）。
 */
interface CardProps {
  dark?: boolean;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}

export default function Card({ dark = false, className = '', children, onClick }: CardProps) {
  return (
    <div
      className={`${dark ? 'glass-dark' : 'glass-card'} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
