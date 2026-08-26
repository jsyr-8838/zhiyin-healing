'use client';

import { useEffect } from 'react';

/**
 * Next.js App Router 全局错误边界
 * 捕获根 layout 下所有页面的渲染错误
 * 自动上报到 Evo 进化系统
 */

function fingerprint(msg: string, source?: string): string {
  const raw = `${source || ''}:${msg}`.slice(0, 200);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);

    // 上报到 Evo 进化系统
    const fp = fingerprint(error.message, error.stack?.split('\n')[0]);
    const trackData = {
      eventType: 'error',
      module: 'global',
      action: 'app_render_error',
      detail: {
        message: error.message,
        stack: error.stack?.slice(0, 500),
        digest: error.digest,
        url: window.location.href,
      },
      errorFingerprint: fp,
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/evo/track', JSON.stringify(trackData));
    } else {
      fetch('/api/evo/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trackData),
        keepalive: true,
      }).catch(() => {});
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 opacity-30">
        <svg width="80" height="80" viewBox="0 0 80 80" className="mx-auto" fill="none">
          <circle cx="40" cy="40" r="36" stroke="#b8860b" strokeWidth="1.5" opacity="0.4" />
          <path d="M40 22v24M40 52v4" stroke="#b8860b" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <circle cx="40" cy="40" r="3" fill="#b8860b" opacity="0.5" />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-stone-800 mb-2">页面出了点问题</h2>
      <p className="text-sm text-stone-500 mb-6">
        知音进化系统已记录此问题，将自动分析与修复
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-stone-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-stone-800 transition"
        >
          重新加载
        </button>
        <a
          href="/"
          className="bg-white text-stone-600 px-6 py-2.5 rounded-xl text-sm font-bold border border-stone-200 hover:bg-stone-50 transition"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}
