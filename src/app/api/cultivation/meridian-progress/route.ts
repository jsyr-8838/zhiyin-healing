import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';

// GET /api/cultivation/meridian-progress?userId=xxx — 获取经络修行进度
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }

    const progress = await db.findAll(
      'SELECT * FROM MeridianProgress WHERE userId = ? ORDER BY meridianId ASC',
      [userId]
    );

    // Convert boolean fields
    const normalized = progress.map((p: Record<string, unknown>) => ({
      ...p,
      isCompleted: !!p.isCompleted,
      unlockedAt: p.unlockedAt || null,
    }));

    return NextResponse.json({ progress: normalized });
  } catch (error) {
    console.error('MeridianProgress GET error:', error);
    return NextResponse.json({ error: '获取经络进度失败' }, { status: 500 });
  }
}

// POST /api/cultivation/meridian-progress — 更新经络进度
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, meridianId, meridianName, element, viewCount, quizCorrect, quizTotal, practiceCount, completion } = body;

    if (!userId || !meridianId) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const isCompleted = (completion ?? 0) >= 100 ? 1 : 0;

    // Check if record exists
    const existing = await db.findOne<{ id: string }>(
      'SELECT id FROM MeridianProgress WHERE userId = ? AND meridianId = ?',
      [userId, meridianId]
    );

    let progress;
    if (existing) {
      // Build dynamic update
      const fields: string[] = [];
      const values: unknown[] = [];
      if (meridianName !== undefined) { fields.push('meridianName = ?'); values.push(meridianName); }
      if (element !== undefined) { fields.push('element = ?'); values.push(element); }
      if (viewCount !== undefined) { fields.push('viewCount = ?'); values.push(viewCount); }
      if (quizCorrect !== undefined) { fields.push('quizCorrect = ?'); values.push(quizCorrect); }
      if (quizTotal !== undefined) { fields.push('quizTotal = ?'); values.push(quizTotal); }
      if (practiceCount !== undefined) { fields.push('practiceCount = ?'); values.push(practiceCount); }
      if (completion !== undefined) { fields.push('completion = ?'); values.push(completion); }
      fields.push('isCompleted = ?'); values.push(isCompleted);
      fields.push('updatedAt = ?'); values.push(now());
      values.push(userId, meridianId);

      await db.execute(
        `UPDATE MeridianProgress SET ${fields.join(', ')} WHERE userId = ? AND meridianId = ?`,
        values
      );
      progress = await db.findOne('SELECT * FROM MeridianProgress WHERE userId = ? AND meridianId = ?', [userId, meridianId]);
    } else {
      const id = generateId();
      const ts = now();
      await db.execute(
        `INSERT INTO MeridianProgress (id, userId, meridianId, meridianName, element, completion, viewCount, quizCorrect, quizTotal, practiceCount, isCompleted, unlockedAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
        [id, userId, meridianId, meridianName || '', element || 'earth',
         completion || 0, viewCount || 0, quizCorrect || 0, quizTotal || 0,
         practiceCount || 0, isCompleted, ts, ts]
      );
      progress = await db.findOne('SELECT * FROM MeridianProgress WHERE userId = ? AND meridianId = ?', [userId, meridianId]);
    }

    return NextResponse.json({
      progress: {
        ...progress,
        isCompleted: !!progress?.isCompleted,
        unlockedAt: progress?.unlockedAt || null,
      },
    });
  } catch (error) {
    console.error('MeridianProgress POST error:', error);
    return NextResponse.json({ error: '更新经络进度失败' }, { status: 500 });
  }
}
