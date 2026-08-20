import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userIdSchema } from '@/lib/validators';

// GET /api/checkin/trends?userId=xxx&metric=healthScore&days=30
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const metric = searchParams.get('metric') || 'healthScore';
    const days = parseInt(searchParams.get('days') || '30', 10);

    if (!userId || !userIdSchema.safeParse(userId).success) {
      return NextResponse.json({ error: 'userId 参数无效' }, { status: 400 });
    }

    const validDays = [7, 14, 30, 90].includes(days) ? days : 30;
    const validMetrics = ['sleepScore', 'moodScore', 'exerciseScore', 'dietScore', 'healthScore'] as const;
    const validMetric = validMetrics.includes(metric as typeof validMetrics[number]) ? metric : 'healthScore';

    const since = new Date();
    since.setDate(since.getDate() - validDays);
    const sinceStr = since.toISOString().split('T')[0];

    const checkins = await db.findAll<{ date: string; [k: string]: unknown }>(
      `SELECT date, ${validMetric} FROM Checkin WHERE userId = ? AND date >= ? ORDER BY date ASC`,
      [userId, sinceStr]
    );

    const data = checkins.map(c => ({
      date: c.date,
      value: c[validMetric] as number,
    }));

    const average = data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.value, 0) / data.length)
      : 0;

    // 趋势判断：后半均值 vs 前半均值
    let trend: 'improving' | 'stable' | 'declining' = 'stable';
    if (data.length >= 4) {
      const mid = Math.floor(data.length / 2);
      const firstHalf = data.slice(0, mid).reduce((s, d) => s + d.value, 0) / mid;
      const secondHalf = data.slice(mid).reduce((s, d) => s + d.value, 0) / (data.length - mid);
      const diff = secondHalf - firstHalf;
      if (diff > 5) trend = 'improving';
      else if (diff < -5) trend = 'declining';
    }

    return NextResponse.json({ metric: validMetric, data, average, trend, days: validDays });
  } catch (error) {
    console.error('Trends API error:', error);
    return NextResponse.json({ error: '获取趋势数据失败' }, { status: 500 });
  }
}
