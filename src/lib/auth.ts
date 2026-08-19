import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

declare module 'next-auth' {
  interface Session {
    user: {
      id?: string;
      role?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

export async function getCurrentUserRole(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.role || null;
}

/**
 * 判断当前用户是否已注册（非访客）
 */
export async function isRegisteredUser(): Promise<boolean> {
  const role = await getCurrentUserRole();
  return role === 'registered' || role === 'admin';
}

/**
 * 客户端获取访客 ID（localStorage 兜底）
 * 用于客户端组件中判断当前用户
 */
export function getClientUserId(): string {
  if (typeof window === 'undefined') return 'demo-user-001';

  const STORAGE_KEY = 'heytcm-visitor-id';

  let visitorId = localStorage.getItem(STORAGE_KEY);
  if (!visitorId) {
    visitorId = `visitor-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    localStorage.setItem(STORAGE_KEY, visitorId);
  }
  return visitorId;
}
