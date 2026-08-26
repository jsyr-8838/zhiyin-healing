'use client';

import { useState } from 'react';
import { trackAction } from '@/lib/evo/tracker';

/**
 * 一键分享组件
 * 
 * 功能：
 * 1. 生成分享链接
 * 2. 复制到剪贴板
 * 3. 调用 Web Share API（手机端原生分享面板）
 * 4. 可选生成国风分享卡片
 */

interface ShareButtonProps {
  /** 分享标题 */
  title: string;
  /** 分享描述 */
  text: string;
  /** 分享URL（默认当前页面） */
  url?: string;
  /** 模块名（用于埋点） */
  module?: 'diagnose' | 'healing' | 'divination' | 'classics' | 'meridian' | 'tianlai' | 'cultivation' | 'general';
  /** 自定义样式 */
  className?: string;
  /** 按钮文字 */
  label?: string;
}

export default function ShareButton({
  title,
  text,
  url,
  module = 'general',
  className = '',
  label = '分享',
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
  const fullText = `${title}\n${text}`;
  const shareData = {
    title,
    text: fullText,
    url: shareUrl,
  };

  const handleShare = async () => {
    // 埋点
    trackAction(module, 'share', { title, url: shareUrl });

    // 优先使用 Web Share API（手机端原生面板）
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // 用户取消分享，不处理
        return;
      }
    }

    // 降级：复制到剪贴板
    try {
      await navigator.clipboard.writeText(`${fullText}\n${shareUrl}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 再降级：选中文本
      const textarea = document.createElement('textarea');
      textarea.value = `${fullText}\n${shareUrl}`;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // 无法复制
      }
      document.body.removeChild(textarea);
    }
  };

  return (
    <button
      onClick={handleShare}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-stone-500 bg-stone-100 hover:bg-stone-200 transition-colors ${className}`}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>已复制</span>
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="3" cy="6" r="1.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="9" cy="3" r="1.5" stroke="currentColor" strokeWidth="1" />
            <circle cx="9" cy="9" r="1.5" stroke="currentColor" strokeWidth="1" />
            <path d="M4.3 5.3L7.7 3.7M4.3 6.7L7.7 8.3" stroke="currentColor" strokeWidth="0.8" />
          </svg>
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
