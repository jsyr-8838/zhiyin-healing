import { Suspense } from 'react';
import JiuliaoClient from './JiuliaoClient';

export const dynamic = 'force-dynamic';

function JiuliaoFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#faf5ee' }}>
      <p style={{ color: '#666', fontSize: '14px' }}>加载中...</p>
    </div>
  );
}

export default function JiuliaoPage() {
  return (
    <Suspense fallback={<JiuliaoFallback />}>
      <JiuliaoClient />
    </Suspense>
  );
}
