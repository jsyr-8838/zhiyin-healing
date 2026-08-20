import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';
import { assessmentPostSchema, validateOrError } from '@/lib/validators';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateOrError(assessmentPostSchema, body);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { userId, scores, primaryType, dominantWuyin, wuyinScores, recommendation } = validation.data;

    const today = new Date().toISOString().split('T')[0];

    // Check if record exists for today
    const existing = await db.findOne<{ id: string }>(
      'SELECT id FROM Assessment WHERE userId = ? AND date = ?',
      [userId, today]
    );

    if (existing) {
      await db.execute(
        `UPDATE Assessment SET pinghe = ?, qixue = ?, yangxu = ?, yinxu = ?, tanshi = ?, shire = ?,
         xueyu = ?, qiyu = ?, tebing = ?, primaryType = ?, dominantWuyin = ?, wuyinScores = ?, recommendation = ?
         WHERE userId = ? AND date = ?`,
        [scores.pinghe, scores.qixue, scores.yangxu, scores.yinxu, scores.tanshi, scores.shire,
         scores.xueyu, scores.qiyu, scores.tebing, primaryType, dominantWuyin,
         JSON.stringify(wuyinScores), recommendation, userId, today]
      );
    } else {
      const id = generateId();
      const ts = now();
      await db.execute(
        `INSERT INTO Assessment (id, userId, date, pinghe, qixue, yangxu, yinxu, tanshi, shire,
         xueyu, qiyu, tebing, primaryType, dominantWuyin, wuyinScores, recommendation, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, today, scores.pinghe, scores.qixue, scores.yangxu, scores.yinxu,
         scores.tanshi, scores.shire, scores.xueyu, scores.qiyu, scores.tebing,
         primaryType, dominantWuyin, JSON.stringify(wuyinScores), recommendation, ts]
      );
    }

    const assessment = await db.findOne(
      'SELECT * FROM Assessment WHERE userId = ? AND date = ?',
      [userId, today]
    );

    return NextResponse.json({ assessment });
  } catch (error) {
    console.error('Assessment API error:', error);
    return NextResponse.json({ error: '保存测评结果失败' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId || userId.length > 64) {
      return NextResponse.json({ error: '缺少userId或格式错误' }, { status: 400 });
    }

    const latest = await db.findOne(
      'SELECT * FROM Assessment WHERE userId = ? ORDER BY date DESC LIMIT 1',
      [userId]
    );

    return NextResponse.json({ assessment: latest });
  } catch (error) {
    console.error('Assessment GET error:', error);
    return NextResponse.json({ error: '获取测评结果失败' }, { status: 500 });
  }
}
