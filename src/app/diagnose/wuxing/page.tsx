'use client';

import dynamic from 'next/dynamic';

// Use dynamic import with ssr:false because lunar-javascript carries
// ~425KB of calendar/astronomy data that bloats the server bundle.
// The whole calculator only runs in the browser, so no SSR is needed.
const WuXingClient = dynamic(() => import('./WuXingClient'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <p style={{ color: '#999', fontSize: '0.875rem' }}>正在加载五行体质计算...</p>
    </div>
  ),
});

export default function WuXingPage() {
  return <WuXingClient />;
}