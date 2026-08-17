'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center flex-col gap-4">
      <div className="text-red-400 text-sm">运气推算出错</div>
      <button
        onClick={reset}
        className="text-xs px-3 py-1.5 rounded-lg bg-white/5 text-zinc-400 hover:text-white border border-white/10 transition-all"
      >
        重试
      </button>
    </div>
  );
}
