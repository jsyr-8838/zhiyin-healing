export default function DivinationLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-amber-950 pb-24">
      <div className="px-6 pt-12 pb-6">
        <div className="h-8 bg-amber-500/20 rounded w-20 mb-2 animate-pulse" />
        <div className="h-4 bg-amber-500/15 rounded w-32 animate-pulse" />
      </div>
      <div className="px-4 space-y-3">
        {['八字', '紫微', '奇门', '六爻', '六壬'].map((n) => (
          <div key={n} className="bg-amber-900/30 rounded-2xl p-4 border border-amber-700/30 h-20 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
