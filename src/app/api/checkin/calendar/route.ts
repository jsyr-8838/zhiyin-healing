import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userIdSchema } from '@/lib/validators';
import { healthScoreToLevel } from '@/lib/health-score';

// GET /api/checkin/calendar?userId=xxx&month=2026-06
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const month = searchParams.get('month'); // YYYY-MM

    if (!userId || !userIdSchema.safeParse(userId).success) {
      return NextResponse.json({ error: 'userId 参数无效' }, { status: 400 });
    }

    const now = new Date();
    const targetMonth = month && /^\d{4}-\d{2}$/.test(month) ? month : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const startDate = `${targetMonth}-01`;
    // 计算月末
    const [y, m] = targetMonth.split('-').map(Number);
    const endDate = new Date(y, m, 0).toISOString().split('T')[0]; // 月份最后一天

    const checkins = await db.findAll<{ date: string; healthScore: number }>(
      `SELECT date, healthScore FROM Checkin WHERE userId = ? AND date >= ? AND date <= ? ORDER BY date ASC`,
      [userId, startDate, endDate]
    );

    // 生成当月所有日期
    const days: Array<{ date: string; level: 0|1|2|3|4; healthScore: number }> = [];
    const checkinMap = new Map(checkins.map(c => [c.date, c.healthScore]));
    const daysInMonth = new Date(y, m, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${targetMonth}-${String(d).padStart(2, '0')}`;
      const score = checkinMap.get(dateStr) ?? 0;
      days.push({ date: dateStr, level: healthScoreToLevel(score), healthScore: score });
    }

    return NextResponse.json({ month: targetMonth, days });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json({ error: '获取日历数据失败' }, { status: 500 });
  }
}
