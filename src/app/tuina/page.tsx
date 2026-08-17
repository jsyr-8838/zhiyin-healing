import { Suspense } from 'react';
import TuinaClient from './TuinaClient';

export const dynamic = 'force-dynamic';

function TuinaFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#faf5ee' }}>
      <p style={{ color: '#666', fontSize: '14px' }}>加载中...</p>
    </div>
  );
}

export default function TuinaPage() {
  return (
    <Suspense fallback={<TuinaFallback />}>
      <TuinaClient />
    </Suspense>
  );
}
