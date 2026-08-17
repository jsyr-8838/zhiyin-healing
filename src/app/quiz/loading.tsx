export default function QuizLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24">
      <div className="bg-gradient-to-br from-teal-600 to-cyan-700 px-6 pt-12 pb-8">
        <div className="h-8 bg-white/20 rounded w-28 mb-1 animate-pulse" />
        <div className="h-4 bg-white/15 rounded w-40 animate-pulse" />
      </div>
      <div className="px-4 pt-5 space-y-3">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-20 animate-pulse" />
        {[1,2,3,4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-gray-100 h-14 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
