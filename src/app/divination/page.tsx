'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with ssr:false because taibu-core is ESM-only
// and is excluded from the server bundle to reduce handler.mjs size.
const DivinationClient = dynamic(() => import('./DivinationClient'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>正在加载知几...</p>
    </div>
  ),
});

export default function DivinationPage() {
  return <DivinationClient />;
}
