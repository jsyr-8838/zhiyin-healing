/**
 * 专家单条 CRUD API
 * GET    /api/experts/[id] - 获取单个专家
 * PUT    /api/experts/[id] - 更新专家
 * DELETE /api/experts/[id] - 删除专家
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expert = await prisma.expert.findUnique({ where: { id } });

    if (!expert) {
      return NextResponse.json({ error: '专家不存在' }, { status: 404 });
    }

    return NextResponse.json({
      expert: {
        ...expert,
        tags: JSON.parse(expert.tags || '[]'),
        services: JSON.parse(expert.services || '[]'),
      },
    });
  } catch (error) {
    console.error('[experts/id] GET error:', error);
    return NextResponse.json({ error: '获取专家详情失败' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    const scalarFields = ['name', 'title', 'subtitle', 'specialty', 'avatar', 'element', 'bio', 'wechatId', 'phone', 'sortOrder', 'isActive'] as const;
    for (const f of scalarFields) {
      if (body[f] !== undefined) data[f] = body[f];
    }
    if (body.tags !== undefined) data.tags = JSON.stringify(body.tags);
    if (body.services !== undefined) data.services = JSON.stringify(body.services);

    const expert = await prisma.expert.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      expert: {
        ...expert,
        tags: JSON.parse(expert.tags || '[]'),
        services: JSON.parse(expert.services || '[]'),
      },
    });
  } catch (error) {
    console.error('[experts/id] PUT error:', error);
    return NextResponse.json({ error: '更新专家失败' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.expert.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[experts/id] DELETE error:', error);
    return NextResponse.json({ error: '删除专家失败' }, { status: 500 });
  }
}
