'use client';

import { useEffect } from 'react';

/**
 * 知音之境 — 错误边界
 * 深色风格，与沉浸式场景一致。
 */
export default function ZhiYinZhiJingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('ZhiYinZhiJing error:', error.digest ?? error.message);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#11141a',
        padding: '16px',
      }}
    >
      <div
        style={{
          maxWidth: 360,
          textAlign: 'center',
          padding: 32,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,179,71,0.22)',
          borderRadius: 22,
          backdropFilter: 'blur(22px) saturate(1.4)',
          WebkitBackdropFilter: 'blur(22px) saturate(1.4)',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            margin: '0 auto 16px',
            borderRadius: '50%',
            background: 'rgba(255,179,71,0.14)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,179,71,0.9)"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2
          style={{
            fontSize: 18,
            fontWeight: 400,
            letterSpacing: '0.15em',
            color: 'rgba(240,242,248,0.92)',
            margin: '0 0 8px',
            fontFamily: "'Noto Serif SC', serif",
          }}
        >
          境界暂时关闭
        </h2>
        <p
          style={{
            fontSize: 13,
            fontWeight: 200,
            letterSpacing: '0.1em',
            color: 'rgba(200,205,215,0.55)',
            marginBottom: 24,
            lineHeight: 1.8,
          }}
        >
          知音之境加载异常，请稍后重试
        </p>
        <button
          onClick={reset}
          style={{
            padding: '10px 24px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #ffb347, #ffd966)',
            color: '#11141a',
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: '0.15em',
            border: 'none',
            cursor: 'pointer',
            fontFamily: "'Noto Serif SC', serif",
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          重新入境
        </button>
      </div>
    </div>
  );
}
