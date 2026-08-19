/**
 * 专家 CRUD API
 * GET    /api/experts       - 获取专家列表（公开，仅 isActive=true）
 * GET    /api/experts?all=1 - 获取全部专家（管理后台）
 * POST   /api/experts       - 创建专家
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 获取专家列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === '1';

    const experts = await prisma.expert.findMany({
      where: showAll ? {} : { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { bookings: true } } },
    });

    // 解析 JSON 字段
    const result = experts.map((e) => ({
      ...e,
      tags: JSON.parse(e.tags || '[]'),
      services: JSON.parse(e.services || '[]'),
      bookingCount: e._count.bookings,
    }));

    return NextResponse.json({ experts: result });
  } catch (error) {
    console.error('[experts] GET error:', error);
    return NextResponse.json({ error: '获取专家列表失败' }, { status: 500 });
  }
}

// 创建专家
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const expert = await prisma.expert.create({
      data: {
        name: body.name || '',
        title: body.title || '',
        subtitle: body.subtitle || '',
        specialty: body.specialty || '',
        tags: JSON.stringify(body.tags || []),
        avatar: body.avatar || '',
        element: body.element || 'earth',
        bio: body.bio || '',
        services: JSON.stringify(body.services || []),
        wechatId: body.wechatId || '',
        phone: body.phone || '',
        sortOrder: body.sortOrder ?? 0,
        isActive: body.isActive ?? true,
      },
    });

    return NextResponse.json({ expert });
  } catch (error) {
    console.error('[experts] POST error:', error);
    return NextResponse.json({ error: '创建专家失败' }, { status: 500 });
  }
}
