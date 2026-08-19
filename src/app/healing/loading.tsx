export default function HealingLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-12 pb-8">
        <div className="h-8 bg-white/20 rounded w-24 mb-1 animate-pulse" />
        <div className="h-4 bg-white/20 rounded w-36 animate-pulse" />
      </div>
      <div className="px-4 pt-5 space-y-3">
        <div className="flex gap-2 animate-pulse">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="w-16 h-9 bg-gray-100 rounded-full" />
          ))}
        </div>
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-24 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
