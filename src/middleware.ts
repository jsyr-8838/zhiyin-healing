import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 内存限流器（单实例够用，生产环境可换 Redis）
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60; // 每分钟60次请求
const RATE_WINDOW = 60 * 1000; // 1分钟窗口

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. 安全头
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set(
    'Permissions-Policy',
    'camera=(self), microphone=(self), bluetooth=(self), geolocation=()'
  );

  // 2. 访客 ID 注入（从 cookie 读取或生成）
  let visitorId = request.cookies.get('heytcm-vid')?.value;
  if (!visitorId) {
    visitorId = `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    response.cookies.set('heytcm-vid', visitorId, {
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });
  }
  response.headers.set('x-visitor-id', visitorId);

  // 3. API 限流
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const clientIp = request.headers.get('x-forwarded-for')
      || request.headers.get('x-real-ip')
      || 'unknown';
    const key = `${clientIp}:${request.nextUrl.pathname}`;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now > record.resetAt) {
      rateLimitMap.set(key, { count: 1, resetAt: now + RATE_WINDOW });
    } else {
      record.count++;
      if (record.count > RATE_LIMIT) {
        return NextResponse.json(
          { error: '请求过于频繁，请稍后再试' },
          { status: 429 }
        );
      }
    }

    // 清理过期记录（每100次请求清理一次）
    if (rateLimitMap.size > 1000) {
      for (const [k, v] of rateLimitMap) {
        if (now > v.resetAt) rateLimitMap.delete(k);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon-|sw.js|manifest.json).*)',
  ],
};
