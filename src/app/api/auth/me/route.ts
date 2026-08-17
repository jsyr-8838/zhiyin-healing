import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/auth/me — 获取当前用户信息
 * 返回注册状态、手机号、姓名等
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        nickname: true,
        name: true,
        avatar: true,
        phone: true,
        phoneVerified: true,
        gender: true,
        age: true,
        role: true,
        vipLevel: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      ...user,
      isRegistered: user.role === 'registered' || user.role === 'admin',
    });
  } catch (err) {
    console.error('[auth/me] Error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
