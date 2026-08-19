import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';
import { calcXiuWeiGain, type XiuWeiSource } from '@/lib/cultivation-engine';
import { calculateRank } from '@/lib/rank-system';
import type { XiuWeiValues } from '@/lib/cultivation-engine';

// POST /api/cultivation/practice — 记录一次功法完成
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, category, subCategory, element, durationSec, cycles, xiuWeiGain: customGain, metadata } = body;

    if (!userId || !category || !element) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const ts = now();

    // 计算修为获得
    const source: XiuWeiSource = {
      category,
      subCategory,
      element,
      baseGain: customGain || 1,
    };
    const gain = calcXiuWeiGain(source);

    // 写入功法记录
    const logId = generateId();
    await db.execute(
      `INSERT INTO PracticeLog (id, userId, date, category, subCategory, element, durationSec, cycles, xiuWeiGain, metadata, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [logId, userId, today, category, subCategory || '', element,
       durationSec || 0, cycles || 0, gain,
       metadata ? JSON.stringify(metadata) : '{}', ts]
    );

    // 更新修为值
    let prev = await db.findOne<{
      id: string; woodXiuWei: number; fireXiuWei: number; earthXiuWei: number;
      metalXiuWei: number; waterXiuWei: number; totalPractices: number;
      totalMinutes: number; streakDays: number; lastPracticeAt: string | null;
    }>('SELECT * FROM Cultivation WHERE userId = ?', [userId]);

    if (!prev) {
      const cultId = generateId();
      const tsNow = now();
      await db.execute(
        `INSERT INTO Cultivation (id, userId, woodXiuWei, fireXiuWei, earthXiuWei, metalXiuWei, waterXiuWei, rank, rankTitle, totalPractices, totalMinutes, streakDays, lastPracticeAt, createdAt, updatedAt)
         VALUES (?, ?, 0, 0, 0, 0, 0, 0, '闻道者', 0, 0, 0, NULL, ?, ?)`,
        [cultId, userId, tsNow, tsNow]
      );
      prev = await db.findOne<typeof prev>('SELECT * FROM Cultivation WHERE userId = ?', [userId]);
    }

    const xiuwei: XiuWeiValues = {
      wood: prev!.woodXiuWei,
      fire: prev!.fireXiuWei,
      earth: prev!.earthXiuWei,
      metal: prev!.metalXiuWei,
      water: prev!.waterXiuWei,
    };

    // 增加对应行的修为
    const fieldMap: Record<string, keyof XiuWeiValues> = {
      wood: 'wood', fire: 'fire', earth: 'earth', metal: 'metal', water: 'water',
    };
    const field = fieldMap[element];
    if (field) {
      xiuwei[field] = Math.min(100, xiuwei[field] + gain);
    }

    // 连续天数计算
    const nowDate = new Date();
    const yesterday = new Date(nowDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const lastDate = prev!.lastPracticeAt ? new Date(prev!.lastPracticeAt).toISOString().slice(0, 10) : '';
    let streakDays = prev!.streakDays;
    if (lastDate === yesterdayStr) {
      streakDays += 1;
    } else if (lastDate !== today) {
      streakDays = 1;
    }

    // 统计诊断记录数
    const countResult = await db.findOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM Assessment WHERE userId = ?',
      [userId]
    );
    const diagnosisCount = countResult?.count ?? 0;

    // 段位计算
    const rankResult = calculateRank(xiuwei, {
      totalPractices: prev!.totalPractices + 1,
      streakDays,
      completedMeridians: 0,
      diagnosisCount,
    });

    // 更新 DB
    const updatedTs = now();
    await db.execute(
      `UPDATE Cultivation SET woodXiuWei = ?, fireXiuWei = ?, earthXiuWei = ?, metalXiuWei = ?, waterXiuWei = ?,
       rank = ?, rankTitle = ?, totalPractices = ?, totalMinutes = ?, streakDays = ?, lastPracticeAt = ?, updatedAt = ?
       WHERE userId = ?`,
      [xiuwei.wood, xiuwei.fire, xiuwei.earth, xiuwei.metal, xiuwei.water,
       rankResult.index, rankResult.title,
       prev!.totalPractices + 1,
       prev!.totalMinutes + Math.round((durationSec || 0) / 60),
       streakDays, nowDate.toISOString(), updatedTs, userId]
    );

    const log = await db.findOne('SELECT * FROM PracticeLog WHERE id = ?', [logId]);

    return NextResponse.json({
      log,
      xiuwei,
      gain,
      element,
      rank: rankResult,
      streakDays,
    });
  } catch (error) {
    console.error('Practice POST error:', error);
    return NextResponse.json({ error: '记录功法失败' }, { status: 500 });
  }
}

// GET /api/cultivation/practice?userId=xxx&date=YYYY-MM-DD — 查询功法记录
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }

    let logs;
    if (date) {
      logs = await db.findAll(
        'SELECT * FROM PracticeLog WHERE userId = ? AND date = ? ORDER BY createdAt DESC LIMIT 100',
        [userId, date]
      );
    } else {
      logs = await db.findAll(
        'SELECT * FROM PracticeLog WHERE userId = ? ORDER BY createdAt DESC LIMIT 100',
        [userId]
      );
    }

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Practice GET error:', error);
    return NextResponse.json({ error: '查询功法记录失败' }, { status: 500 });
  }
}
