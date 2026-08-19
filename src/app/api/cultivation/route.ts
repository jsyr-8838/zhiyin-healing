import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';
import { calculateRank } from '@/lib/rank-system';
import type { XiuWeiValues } from '@/lib/cultivation-engine';

// GET /api/cultivation?userId=xxx — 获取修为数据
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }

    // 获取或创建修为记录
    let cultivation = await db.findOne<{
      id: string; userId: string; woodXiuWei: number; fireXiuWei: number;
      earthXiuWei: number; metalXiuWei: number; waterXiuWei: number;
      rank: number; rankTitle: string; totalPractices: number; totalMinutes: number;
      streakDays: number; lastPracticeAt: string | null; createdAt: string; updatedAt: string;
    }>('SELECT * FROM Cultivation WHERE userId = ?', [userId]);

    if (!cultivation) {
      const id = generateId();
      const ts = now();
      await db.execute(
        `INSERT INTO Cultivation (id, userId, woodXiuWei, fireXiuWei, earthXiuWei, metalXiuWei, waterXiuWei, rank, rankTitle, totalPractices, totalMinutes, streakDays, lastPracticeAt, createdAt, updatedAt)
         VALUES (?, ?, 0, 0, 0, 0, 0, 0, '闻道者', 0, 0, 0, NULL, ?, ?)`,
        [id, userId, ts, ts]
      );
      cultivation = await db.findOne<typeof cultivation>('SELECT * FROM Cultivation WHERE userId = ?', [userId]);
    }

    // 获取近期功法记录（7天内）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();
    const recentLogs = await db.findAll(
      'SELECT * FROM PracticeLog WHERE userId = ? AND createdAt >= ? ORDER BY createdAt DESC LIMIT 50',
      [userId, sevenDaysAgoStr]
    );

    // 获取经络进度
    const meridianProgs = await db.findAll<{ isCompleted: number }>(
      'SELECT * FROM MeridianProgress WHERE userId = ?',
      [userId]
    );

    // 统计诊断记录数
    const countResult = await db.findOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM Assessment WHERE userId = ?',
      [userId]
    );
    const diagnosisCount = countResult?.count ?? 0;

    // 计算段位
    const xiuwei: XiuWeiValues = {
      wood: cultivation!.woodXiuWei,
      fire: cultivation!.fireXiuWei,
      earth: cultivation!.earthXiuWei,
      metal: cultivation!.metalXiuWei,
      water: cultivation!.waterXiuWei,
    };
    const rankResult = calculateRank(xiuwei, {
      totalPractices: cultivation!.totalPractices,
      streakDays: cultivation!.streakDays,
      completedMeridians: meridianProgs.filter(m => m.isCompleted).length,
      diagnosisCount,
    });

    // 今日完成统计
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = recentLogs.filter((l: Record<string, unknown>) => l.date === today);
    const todayCompleted = [...new Set(todayLogs.map((l: Record<string, unknown>) => l.category))];

    // 连续天数计算
    const lastPracticeDate = cultivation!.lastPracticeAt;
    let streakDays = cultivation!.streakDays;
    if (lastPracticeDate) {
      const lastDate = new Date(lastPracticeDate).toISOString().slice(0, 10);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      if (lastDate !== today && lastDate !== yesterdayStr) {
        streakDays = 0; // 断了连续
      }
    }

    return NextResponse.json({
      cultivation,
      rank: rankResult,
      xiuwei,
      meridianProgress: meridianProgs,
      recentLogs,
      todayCompleted,
      streakDays,
    });
  } catch (error) {
    console.error('Cultivation GET error:', error);
    return NextResponse.json({ error: '获取修为数据失败' }, { status: 500 });
  }
}

// PUT /api/cultivation — 更新修为值（段位同步）
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, woodXiuWei, fireXiuWei, earthXiuWei, metalXiuWei, waterXiuWei, streakDays } = body;

    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }

    const xiuwei: XiuWeiValues = {
      wood: woodXiuWei ?? 0,
      fire: fireXiuWei ?? 0,
      earth: earthXiuWei ?? 0,
      metal: metalXiuWei ?? 0,
      water: waterXiuWei ?? 0,
    };

    // 统计诊断记录数
    const countResult = await db.findOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM Assessment WHERE userId = ?',
      [userId]
    );
    const diagnosisCount = countResult?.count ?? 0;

    // 自动计算段位
    const existing = await db.findOne<{ totalPractices: number }>(
      'SELECT totalPractices FROM Cultivation WHERE userId = ?', [userId]
    );
    const totalPractices = existing?.totalPractices ?? 0;
    const rankResult = calculateRank(xiuwei, {
      totalPractices,
      streakDays: streakDays ?? 0,
      completedMeridians: 0,
      diagnosisCount,
    });

    const ts = now();
    const existingRow = await db.findOne<{ id: string }>('SELECT id FROM Cultivation WHERE userId = ?', [userId]);

    let updated;
    if (existingRow) {
      await db.execute(
        `UPDATE Cultivation SET woodXiuWei = ?, fireXiuWei = ?, earthXiuWei = ?, metalXiuWei = ?, waterXiuWei = ?,
         rank = ?, rankTitle = ?, streakDays = ?, updatedAt = ? WHERE userId = ?`,
        [xiuwei.wood, xiuwei.fire, xiuwei.earth, xiuwei.metal, xiuwei.water,
         rankResult.index, rankResult.title, streakDays ?? 0, ts, userId]
      );
      updated = await db.findOne('SELECT * FROM Cultivation WHERE userId = ?', [userId]);
    } else {
      const id = generateId();
      await db.execute(
        `INSERT INTO Cultivation (id, userId, woodXiuWei, fireXiuWei, earthXiuWei, metalXiuWei, waterXiuWei,
         rank, rankTitle, totalPractices, totalMinutes, streakDays, lastPracticeAt, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, NULL, ?, ?)`,
        [id, userId, xiuwei.wood, xiuwei.fire, xiuwei.earth, xiuwei.metal, xiuwei.water,
         rankResult.index, rankResult.title, streakDays ?? 0, ts, ts]
      );
      updated = await db.findOne('SELECT * FROM Cultivation WHERE userId = ?', [userId]);
    }

    return NextResponse.json({ cultivation: updated, rank: rankResult });
  } catch (error) {
    console.error('Cultivation PUT error:', error);
    return NextResponse.json({ error: '更新修为失败' }, { status: 500 });
  }
}
