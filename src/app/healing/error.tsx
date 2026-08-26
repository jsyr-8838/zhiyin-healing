'use client';

import { useEffect } from 'react';

/**
 * Healing 模块错误边界
 * 捕获疗愈子页面渲染错误 + 上报 Evo
 */

function fingerprint(msg: string, source?: string): string {
  const raw = `${source || ''}:${msg}`.slice(0, 200);
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `fp_${Math.abs(hash).toString(36)}`;
}

export default function HealingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Healing module error:', error.digest ?? error.message);

    // 上报到 Evo 进化系统
    const fp = fingerprint(error.message, error.stack?.split('\n')[0]);
    const trackData = {
      eventType: 'error',
      module: 'healing',
      action: 'healing_render_error',
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-stone-50 to-amber-50/30 px-4">
      <div className="p-8 text-center max-w-sm">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-stone-100 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="12" stroke="#b8860b" strokeWidth="1.5" opacity="0.4" />
            <path d="M14 8v9M14 19v1" stroke="#b8860b" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          </svg>
        </div>
        <h2 className="text-lg font-bold font-serif text-stone-800 mb-2">页面出现了问题</h2>
        <p className="text-sm text-stone-500 mb-6">
          疗愈模块加载异常，进化系统已记录
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={reset}
            className="px-6 py-2.5 rounded-lg bg-stone-700 text-white text-sm font-bold font-serif transition hover:bg-stone-800"
          >
            重新加载
          </button>
          <a
            href="/healing"
            className="px-6 py-2.5 rounded-lg bg-white text-stone-600 text-sm font-bold font-serif border border-stone-200 transition hover:bg-stone-50"
          >
            返回疗愈
          </a>
        </div>
      </div>
    </div>
  );
}
