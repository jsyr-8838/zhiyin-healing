'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="zh-CN">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafaf9',
        fontFamily: 'system-ui, sans-serif',
        textAlign: 'center',
        padding: '0 24px',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>💥</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1c1917', marginBottom: 8 }}>
          应用遇到了严重错误
        </h2>
        <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
          请清除浏览器缓存后重试
        </p>
        <button
          onClick={reset}
          style={{
            background: '#059669',
            color: 'white',
            border: 'none',
            padding: '10px 24px',
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          重新加载
        </button>
      </body>
    </html>
  );
}
