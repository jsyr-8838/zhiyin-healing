export default function DiagnosisLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24">
      <div className="bg-gradient-to-br from-purple-600 to-pink-700 px-6 pt-12 pb-8">
        <div className="h-8 bg-white/20 rounded w-24 mb-1 animate-pulse" />
        <div className="h-4 bg-white/15 rounded w-36 animate-pulse" />
      </div>
      <div className="px-4 pt-5 space-y-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-32 animate-pulse" />
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-48 animate-pulse" />
      </div>
    </div>
  );
}
