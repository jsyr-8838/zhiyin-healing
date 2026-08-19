import { Suspense } from 'react';
import SeasonPageClient from './SeasonPageClient';

export const metadata = {
  title: '节气养生 - 二十四节气',
};

export default function SeasonPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fafaf9] flex items-center justify-center"><p className="text-gray-400">加载中...</p></div>}>
      <SeasonPageClient />
    </Suspense>
  );
}
