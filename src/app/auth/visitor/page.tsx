'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * 旧访客登录页 → 重定向到新登录/注册页
 */
export default function AuthVisitorPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white">
      <div className="flex items-center gap-2 text-emerald-200">
        <div className="w-4 h-4 border-2 border-emerald-200 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm">正在跳转...</span>
      </div>
    </div>
  );
}
