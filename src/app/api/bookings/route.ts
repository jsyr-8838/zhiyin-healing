/**
 * 预约 API
 * POST /api/bookings - 创建预约
 * GET  /api/bookings - 获取预约列表（管理后台）
 */
import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';
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

    const id = generateId();
    const ts = now();
    await db.execute(
      `INSERT INTO Booking (id, userId, expertId, service, name, phone, preferredDate, preferredTime, note, status, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, body.userId, body.expertId, body.service, body.name, body.phone,
       body.preferredDate, body.preferredTime, body.note, 'pending', ts, ts]
    );

    const booking = await db.findOne('SELECT * FROM Booking WHERE id = ?', [id]);
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

    let sql = `SELECT b.*, e.name as expertName, e.title as expertTitle, e.avatar as expertAvatar
               FROM Booking b LEFT JOIN Expert e ON b.expertId = e.id WHERE 1=1`;
    const params: unknown[] = [];
    if (expertId) { sql += ' AND b.expertId = ?'; params.push(expertId); }
    if (status) { sql += ' AND b.status = ?'; params.push(status); }
    if (userId) { sql += ' AND b.userId = ?'; params.push(userId); }
    sql += ' ORDER BY b.createdAt DESC';

    const bookings = await db.findAll(sql, params);

    // 转换为含 expert 的结构
    const result = bookings.map((b: Record<string, unknown>) => ({
      ...b,
      expert: b.expertName ? {
        name: b.expertName,
        title: b.expertTitle,
        avatar: b.expertAvatar,
      } : null,
    }));

    return NextResponse.json({ bookings: result });
  } catch (error) {
    console.error('[bookings] GET error:', error);
    return NextResponse.json({ error: '获取预约列表失败' }, { status: 500 });
  }
}
