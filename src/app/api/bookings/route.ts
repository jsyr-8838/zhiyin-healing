/**
 * 预约 API
 * POST /api/bookings - 创建预约
 * GET  /api/bookings - 获取预约列表（管理后台）
 */
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { bookingCreateSchema, validateOrError } from '@/lib/validators';

// 创建预约
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const validated = validateOrError(bookingCreateSchema, raw);
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const body = validated.data;

    const booking = await prisma.booking.create({
      data: {
        userId: body.userId,
        expertId: body.expertId,
        service: body.service,
        name: body.name,
        phone: body.phone,
        preferredDate: body.preferredDate,
        preferredTime: body.preferredTime,
        note: body.note,
        status: 'pending',
      },
    });

    return NextResponse.json({ booking });
  } catch (error) {
    console.error('[bookings] POST error:', error);
    return NextResponse.json({ error: '创建预约失败' }, { status: 500 });
  }
}

// 获取预约列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const expertId = searchParams.get('expertId');
    const status = searchParams.get('status');
    const userId = searchParams.get('userId');

    const where: Record<string, unknown> = {};
    if (expertId) where.expertId = expertId;
    if (status) where.status = status;
    if (userId) where.userId = userId;

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { expert: { select: { name: true, title: true, avatar: true } } },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('[bookings] GET error:', error);
    return NextResponse.json({ error: '获取预约列表失败' }, { status: 500 });
  }
}
