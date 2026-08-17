export default function MeridianLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-emerald-950 pb-24">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-3/5 h-[60vh] bg-slate-800/50 animate-pulse" />
        <div className="w-full md:w-2/5 p-4 space-y-3">
          <div className="h-6 bg-emerald-500/20 rounded w-24 animate-pulse" />
          {[1,2,3,4,5,6,7,8].map((i) => (
            <div key={i} className="h-12 bg-emerald-900/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
