import { NextRequest, NextResponse } from 'next/server';
import { db, generateId } from '@/lib/db';
import { calcSleepScore, calcMoodScore, calcExerciseScore, calcDietScore, calcHealthScore, calcWuxingTendencies } from '@/lib/health-score';
import { checkinPostSchema, checkinGetSchema, validateOrError } from '@/lib/validators';

// POST /api/checkin - 提交每日打卡
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = validateOrError(checkinPostSchema, body);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { userId, sleepHours, bedtime, mood, exercise, diet, symptoms, note } = validation.data;

    // 计算各项评分
    const sleepScore = calcSleepScore(sleepHours, bedtime);
    const moodScore = calcMoodScore(mood);
    const exerciseScore = calcExerciseScore(exercise);
    const dietScore = calcDietScore(diet);
    const healthScore = calcHealthScore(sleepScore, moodScore, exerciseScore, dietScore);

    // 推算五行偏颇
    const wuxing = calcWuxingTendencies({ moodScore, sleepScore, dietScore, exerciseScore, symptoms });

    const today = new Date().toISOString().split('T')[0];
    const createdAt = new Date().toISOString();

    // upsert: 同一天同用户只保留一条记录
    const existing = await db.findOne<{ id: string }>(
      'SELECT id FROM Checkin WHERE userId = ? AND date = ?',
      [userId, today]
    );

    let checkin;
    if (existing) {
      await db.execute(
        `UPDATE Checkin SET sleepHours = ?, sleepScore = ?, bedtime = ?, mood = ?, moodScore = ?,
         exercise = ?, exerciseScore = ?, diet = ?, dietScore = ?, healthScore = ?, symptoms = ?, note = ?,
         woodTendency = ?, fireTendency = ?, earthTendency = ?, metalTendency = ?, waterTendency = ?
         WHERE userId = ? AND date = ?`,
        [sleepHours, sleepScore, bedtime, mood, moodScore,
         exercise, exerciseScore, diet, dietScore, healthScore, symptoms, note,
         wuxing.wood, wuxing.fire, wuxing.earth, wuxing.metal, wuxing.water,
         userId, today]
      );
      checkin = await db.findOne('SELECT * FROM Checkin WHERE userId = ? AND date = ?', [userId, today]);
    } else {
      await db.execute(
        `INSERT INTO Checkin (id, userId, date, sleepHours, sleepScore, bedtime, mood, moodScore,
         exercise, exerciseScore, diet, dietScore, healthScore, symptoms, note,
         woodTendency, fireTendency, earthTendency, metalTendency, waterTendency, healingDone, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [generateId(), userId, today, sleepHours, sleepScore, bedtime, mood, moodScore,
         exercise, exerciseScore, diet, dietScore, healthScore, symptoms, note,
         wuxing.wood, wuxing.fire, wuxing.earth, wuxing.metal, wuxing.water, '{}', createdAt]
      );
      checkin = await db.findOne('SELECT * FROM Checkin WHERE userId = ? AND date = ?', [userId, today]);
    }

    return NextResponse.json({ checkin, scores: { sleepScore, moodScore, exerciseScore, dietScore, healthScore }, wuxing });
  } catch (error) {
    console.error('Checkin API error:', error);
    return NextResponse.json({ error: '打卡失败' }, { status: 500 });
  }
}

// GET /api/checkin?userId=xxx&days=7
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const validation = validateOrError(checkinGetSchema, {
      userId: searchParams.get('userId'),
      days: searchParams.get('days'),
    });
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    const { userId, days } = validation.data;

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    const checkins = await db.findAll(
      'SELECT * FROM Checkin WHERE userId = ? AND date >= ? ORDER BY date DESC',
      [userId, sinceStr]
    );

    // 连续打卡天数（高效算法）
    const allDates = await db.findAll<{ date: string }>(
      'SELECT date FROM Checkin WHERE userId = ? ORDER BY date DESC',
      [userId]
    );
    const dateSet = new Set(allDates.map(c => c.date));
    let streak = 0;
    for (let i = 0; i <= days + 1; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().split('T')[0];
      if (dateSet.has(ds)) {
        streak++;
      } else if (i === 0) {
        continue; // 今天还没打卡不中断
      } else {
        break;
      }
    }

    const avgHealthScore = checkins.length > 0
      ? Math.round(checkins.reduce((sum, c) => sum + (c.healthScore as number), 0) / checkins.length)
      : 0;

    const today = new Date().toISOString().split('T')[0];
    const todayCheckin = await db.findOne(
      'SELECT * FROM Checkin WHERE userId = ? AND date = ?',
      [userId, today]
    );

    return NextResponse.json({
      checkins, streak, avgHealthScore, todayCheckin,
      totalDays: allDates.length,
    });
  } catch (error) {
    console.error('Checkin GET error:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}
