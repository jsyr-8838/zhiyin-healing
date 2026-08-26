'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';

/**
 * 懒加载容器组件 — 滚动到可视区域时才加载内容
 * 
 * 用法：
 * <LazyLoad height="200px">
 *   <SomeHeavyComponent />
 * </LazyLoad>
 * 
 * 原理：Intersection Observer + 可选占位
 */

interface LazyLoadProps {
  children: ReactNode;
  /** 占位高度 */
  height?: string;
  /** 根 margin（提前多少像素开始加载） */
  rootMargin?: string;
  /** 占位内容 */
  placeholder?: ReactNode;
  /** 是否只加载一次 */
  once?: boolean;
  className?: string;
}

export default function LazyLoad({
  children,
  height = 'auto',
  rootMargin = '200px',
  placeholder,
  once = true,
  className = '',
}: LazyLoadProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // 如果已经支持 IntersectionObserver
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              setVisible(true);
              if (once) observer.disconnect();
            } else if (!once) {
              setVisible(false);
            }
          }
        },
        { rootMargin }
      );
      observer.observe(el);
      return () => observer.disconnect();
    }

    // 不支持则直接显示
    setVisible(true);
  }, [rootMargin, once]);

  return (
    <div ref={ref} className={className} style={{ minHeight: visible ? 'auto' : height }}>
      {visible ? children : (
        placeholder || (
          <div className="flex items-center justify-center" style={{ minHeight: height }}>
            <div className="w-6 h-6 rounded-full border-2 border-stone-200 border-t-amber-500 animate-spin" />
          </div>
        )
      )}
    </div>
  );
}
