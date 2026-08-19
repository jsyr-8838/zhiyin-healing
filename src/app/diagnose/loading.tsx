export default function DiagnoseLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pt-12 pb-8">
        <div className="h-8 bg-white/20 rounded w-20 mb-1 animate-pulse" />
        <div className="h-4 bg-white/15 rounded w-40 animate-pulse" />
      </div>
      <div className="px-4 pt-5 space-y-3">
        {[1,2,3,4].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-28 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
