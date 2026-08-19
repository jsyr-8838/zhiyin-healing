import { Suspense } from 'react';
import DiagnoseClient from './DiagnoseClient';

function DiagnoseFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#faf5ee' }}>
      <p style={{ color: '#666', fontSize: '14px' }}>加载中...</p>
    </div>
  );
}

export default function DiagnosePage() {
  return (
    <Suspense fallback={<DiagnoseFallback />}>
      <DiagnoseClient />
    </Suspense>
  );
}
