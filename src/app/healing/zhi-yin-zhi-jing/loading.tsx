/**
 * 知音之境 — 加载占位
 * 沉浸式深色风格，与场景一致。
 */
export default function Loading() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#11141a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
      }}
    >
      <div
        style={{
          fontSize: 16,
          fontWeight: 200,
          letterSpacing: '0.35em',
          color: 'rgba(200,205,215,0.5)',
          animation: 'zzjLoadPulse 2s ease-in-out infinite',
        }}
      >
        正在进入知音之境
      </div>
      <style>{`
        @keyframes zzjLoadPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
