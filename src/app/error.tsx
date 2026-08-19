'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-5xl mb-4">😵</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">页面出了点问题</h2>
      <p className="text-sm text-gray-500 mb-6">请尝试刷新页面，或返回首页</p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
        >
          重新加载
        </button>
        <a
          href="/dashboard"
          className="bg-white text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold border border-gray-200 hover:bg-gray-50 transition"
        >
          返回首页
        </a>
      </div>
    </div>
  );
}
