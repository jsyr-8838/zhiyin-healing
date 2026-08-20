/**
 * 专家单条 CRUD API
 * GET    /api/experts/[id] - 获取单个专家
 * PUT    /api/experts/[id] - 更新专家
 * DELETE /api/experts/[id] - 删除专家
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const expert = await db.findOne<{ id: string; tags: string; services: string; [k: string]: unknown }>(
      'SELECT * FROM Expert WHERE id = ?',
      [id]
    );

    if (!expert) {
      return NextResponse.json({ error: '专家不存在' }, { status: 404 });
    }

    return NextResponse.json({
      expert: {
        ...expert,
        tags: JSON.parse(expert.tags || '[]'),
        services: JSON.parse(expert.services || '[]'),
        isActive: !!expert.isActive,
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

    const fields: string[] = [];
    const values: unknown[] = [];
    const scalarFields = ['name', 'title', 'subtitle', 'specialty', 'avatar', 'element', 'bio', 'wechatId', 'phone', 'sortOrder'];
    for (const f of scalarFields) {
      if (body[f] !== undefined) {
        fields.push(`${f} = ?`);
        values.push(body[f]);
      }
    }
    if (body.isActive !== undefined) {
      fields.push('isActive = ?');
      values.push(body.isActive ? 1 : 0);
    }
    if (body.tags !== undefined) {
      fields.push('tags = ?');
      values.push(JSON.stringify(body.tags));
    }
    if (body.services !== undefined) {
      fields.push('services = ?');
      values.push(JSON.stringify(body.services));
    }

    if (fields.length > 0) {
      const ts = new Date().toISOString();
      fields.push('updatedAt = ?');
      values.push(ts);
      values.push(id);
      await db.execute(
        `UPDATE Expert SET ${fields.join(', ')} WHERE id = ?`,
        values
      );
    }

    const expert = await db.findOne<{ tags: string; services: string; isActive: number; [k: string]: unknown }>(
      'SELECT * FROM Expert WHERE id = ?',
      [id]
    );

    if (!expert) {
      return NextResponse.json({ error: '专家不存在' }, { status: 404 });
    }

    return NextResponse.json({
      expert: {
        ...expert,
        tags: JSON.parse(expert.tags || '[]'),
        services: JSON.parse(expert.services || '[]'),
        isActive: !!expert.isActive,
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
    await db.execute('DELETE FROM Expert WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[experts/id] DELETE error:', error);
    return NextResponse.json({ error: '删除专家失败' }, { status: 500 });
  }
}
