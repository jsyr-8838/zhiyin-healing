import { Suspense } from 'react';
import AcupointClient from './AcupointClient';

export default function AcupointPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#faf5ee' }}>
        <p style={{ color: '#666', fontSize: '14px' }}>加载穴位图库...</p>
      </div>
    }>
      <AcupointClient />
    </Suspense>
  );
}
