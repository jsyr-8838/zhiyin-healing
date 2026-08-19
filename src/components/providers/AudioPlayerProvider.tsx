'use client';

import dynamic from 'next/dynamic';

/**
 * 全局音频播放器容器
 * 
 * 使用 dynamic import 避免 SSR hydration 问题（AudioContext 仅在客户端可用）。
 * 挂载在根 layout.tsx 中，渲染固定定位的迷你/全屏播放器。
 */
const FullScreenPlayer = dynamic(
  () => import('@/components/healing/FullScreenPlayer'),
  { ssr: false },
);

export default function AudioPlayerProvider() {
  return <FullScreenPlayer />;
}