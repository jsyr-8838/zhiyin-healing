export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#fafaf9] pb-24">
      {/* 头部骨架 */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 px-6 pt-12 pb-8">
        <div className="h-4 bg-white/20 rounded w-20 mb-2 animate-pulse" />
        <div className="h-8 bg-white/20 rounded w-32 mb-4 animate-pulse" />
        <div className="bg-white/15 rounded-2xl p-4 h-28 animate-pulse" />
      </div>

      <div className="px-4 pt-6 space-y-5">
        {/* 打卡卡片骨架 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-20 animate-pulse" />
        {/* 体质卡片骨架 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-20 animate-pulse" />
        {/* 功能网格骨架 */}
        <div className="grid grid-cols-2 gap-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-32 animate-pulse" />
          ))}
        </div>
        {/* 健康概况骨架 */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 h-32 animate-pulse" />
      </div>
    </div>
  );
}
