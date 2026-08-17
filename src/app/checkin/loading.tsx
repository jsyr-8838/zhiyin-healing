export default function CheckinLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24">
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-12 pb-8">
        <div className="h-8 bg-white/20 rounded w-32 mb-2 animate-pulse" />
        <div className="h-4 bg-white/20 rounded w-48 animate-pulse" />
        <div className="flex gap-3 mt-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex-1 bg-white/15 rounded-xl p-3 h-16 animate-pulse" />
          ))}
        </div>
      </div>
      <div className="px-4 pt-6 space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 h-20 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
