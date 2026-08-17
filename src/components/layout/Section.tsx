import { type ReactNode } from 'react';

/**
 * Section — 内容分区容器
 *
 * 为疗愈页面内容区提供统一的间距、卡片包装。
 * 替代散落的 mb-4 rounded-xl p-4 + 硬编码背景。
 *
 * Props:
 *   title?    — 区块标题
 *   subtitle? — 区块副标题
 *   glass?    — 是否启用毛玻璃效果（默认 false）
 *   className? — 额外 class
 *   children  — 区块内容
 */
interface SectionProps {
  title?: string;
  subtitle?: string;
  glass?: boolean;
  className?: string;
  children: ReactNode;
}

export default function Section({
  title,
  subtitle,
  glass = false,
  className = '',
  children,
}: SectionProps) {
  return (
    <section className={`mb-5 ${className}`}>
      {/* 标题行 */}
      {(title || subtitle) && (
        <div className="mb-3">
          {title && (
            <h2 className="text-base font-bold text-gray-900 tracking-wide">{title}</h2>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}

      {/* 内容区 */}
      <div className={glass ? 'glass-card p-4' : ''}>
        {children}
      </div>
    </section>
  );
}
