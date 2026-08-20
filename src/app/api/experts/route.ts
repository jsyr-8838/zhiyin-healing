/**
 * 专家 CRUD API
 * GET    /api/experts       - 获取专家列表（公开，仅 isActive=true）
 * GET    /api/experts?all=1 - 获取全部专家（管理后台）
 * POST   /api/experts       - 创建专家
 */
import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';

// 获取专家列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === '1';

    let experts;
    if (showAll) {
      experts = await db.findAll(
        `SELECT e.*, (SELECT COUNT(*) FROM Booking b WHERE b.expertId = e.id) as bookingCount
         FROM Expert e ORDER BY e.sortOrder ASC`
      );
    } else {
      experts = await db.findAll(
        `SELECT e.*, (SELECT COUNT(*) FROM Booking b WHERE b.expertId = e.id) as bookingCount
         FROM Expert e WHERE e.isActive = 1 ORDER BY e.sortOrder ASC`
      );
    }

    // 解析 JSON 字段
    const result = experts.map((e: Record<string, unknown>) => ({
      ...e,
      tags: JSON.parse((e.tags as string) || '[]'),
      services: JSON.parse((e.services as string) || '[]'),
      isActive: !!e.isActive,
      bookingCount: e.bookingCount,
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

    const id = generateId();
    const ts = now();
    await db.execute(
      `INSERT INTO Expert (id, name, title, subtitle, specialty, tags, avatar, element, bio, services, wechatId, phone, sortOrder, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        body.name || '',
        body.title || '',
        body.subtitle || '',
        body.specialty || '',
        JSON.stringify(body.tags || []),
        body.avatar || '',
        body.element || 'earth',
        body.bio || '',
        JSON.stringify(body.services || []),
        body.wechatId || '',
        body.phone || '',
        body.sortOrder ?? 0,
        body.isActive !== false ? 1 : 0,
        ts,
        ts,
      ]
    );

    const expert = await db.findOne('SELECT * FROM Expert WHERE id = ?', [id]);
    return NextResponse.json({
      expert: {
        ...expert,
        tags: JSON.parse((expert?.tags as string) || '[]'),
        services: JSON.parse((expert?.services as string) || '[]'),
        isActive: !!expert?.isActive,
      },
    });
  } catch (error) {
    console.error('[experts] POST error:', error);
    return NextResponse.json({ error: '创建专家失败' }, { status: 500 });
  }
}
