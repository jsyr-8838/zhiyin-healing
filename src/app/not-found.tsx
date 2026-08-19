import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🔍</div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">你寻找的页面不存在</p>
      <Link
        href="/dashboard"
        className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition"
      >
        返回首页
      </Link>
    </div>
  );
}
