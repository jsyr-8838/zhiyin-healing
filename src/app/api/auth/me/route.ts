import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { db } from '@/lib/db';

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

    const user = await db.findOne<{
      id: string;
      nickname: string;
      name: string | null;
      avatar: string;
      phone: string | null;
      phoneVerified: number;
      gender: string | null;
      age: number | null;
      role: string;
      vipLevel: string;
      createdAt: string;
      lastLoginAt: string | null;
    }>(
      `SELECT id, nickname, name, avatar, phone, phoneVerified, gender, age, role, vipLevel, createdAt, lastLoginAt FROM User WHERE id = ?`,
      [userId]
    );

    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    return NextResponse.json({
      authenticated: true,
      ...user,
      phoneVerified: !!user.phoneVerified,
      isRegistered: user.role === 'registered' || user.role === 'admin',
    });
  } catch (err) {
    console.error('[auth/me] Error:', err);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
