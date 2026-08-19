'use client';

import { useEffect } from 'react';

export default function HealingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 仅记录摘要，不暴露详细信息到控制台
    console.error('Healing module error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-amber-50 px-4">
      <div className="glass-card p-8 text-center max-w-sm">
        <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="text-lg font-bold font-serif text-gray-800 mb-2">页面出现了问题</h2>
        <p className="text-sm text-gray-500 mb-6">疗愈模块加载异常，请稍后重试</p>
        <button
          onClick={reset}
          className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-700 to-red-500 text-white text-sm font-bold font-serif transition hover:shadow-md"
        >
          重新加载
        </button>
      </div>
    </div>
  );
}
