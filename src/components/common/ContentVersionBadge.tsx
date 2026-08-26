'use client';

import { useState, useEffect } from 'react';

/**
 * 内容版本号显示 — 增强用户信任
 * 显示"题库v2.3 · 最近更新"等
 */

interface VersionInfo {
  version: string;
  staticQuizCount: number;
  dynamicQuizCount: number;
  knowledgeCount: number;
  lastUpdated: string | null;
}

export default function ContentVersionBadge({ className = '' }: { className?: string }) {
  const [info, setInfo] = useState<VersionInfo | null>(null);

  useEffect(() => {
    fetch('/api/content-version')
      .then(r => r.json())
      .then(data => setInfo(data))
      .catch(() => {});
  }, []);

  if (!info) return null;

  const totalQuiz = info.staticQuizCount + info.dynamicQuizCount;
  const updatedDate = info.lastUpdated
    ? new Date(info.lastUpdated).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    : null;

  return (
    <div className={`inline-flex items-center gap-1.5 text-[10px] text-stone-400 ${className}`}>
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
      <span>题库v{info.version}</span>
      <span className="text-stone-300">·</span>
      <span>{totalQuiz}题</span>
      {info.dynamicQuizCount > 0 && (
        <>
          <span className="text-stone-300">·</span>
          <span className="text-amber-500">+{info.dynamicQuizCount}动态题</span>
        </>
      )}
      {updatedDate && (
        <>
          <span className="text-stone-300">·</span>
          <span>更新于{updatedDate}</span>
        </>
      )}
    </div>
  );
}
