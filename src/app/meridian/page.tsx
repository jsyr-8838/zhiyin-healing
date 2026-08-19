'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import with ssr: false to prevent Three.js from being bundled into the server bundle.
// This is critical for Cloudflare Workers deployment (reduces handler.mjs size significantly).
const MeridianClient = dynamic(
  () => import('./MeridianClient'),
  { ssr: false, loading: () => <MeridianFallback /> }
);

function MeridianFallback() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#faf5ee' }}>
      <p style={{ color: '#666', fontSize: '14px' }}>加载中...</p>
    </div>
  );
}

function MeridianPage() {
  return (
    <Suspense fallback={<MeridianFallback />}>
      <MeridianClient />
    </Suspense>
  );
}

export default MeridianPage;
