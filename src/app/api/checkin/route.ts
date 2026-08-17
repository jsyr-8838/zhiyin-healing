import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // upsert: 同一天同用户只保留一条记录
    const checkin = await prisma.checkin.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        sleepHours, sleepScore, bedtime, mood, moodScore,
        exercise, exerciseScore, diet, dietScore,
        healthScore, symptoms, note,
        woodTendency: wuxing.wood, fireTendency: wuxing.fire,
        earthTendency: wuxing.earth, metalTendency: wuxing.metal,
        waterTendency: wuxing.water,
      },
      create: {
        userId, date: today, sleepHours, sleepScore, bedtime,
        mood, moodScore, exercise, exerciseScore, diet, dietScore,
        healthScore, symptoms, note,
        woodTendency: wuxing.wood, fireTendency: wuxing.fire,
        earthTendency: wuxing.earth, metalTendency: wuxing.metal,
        waterTendency: wuxing.water,
      },
    });

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

    const checkins = await prisma.checkin.findMany({
      where: { userId, date: { gte: sinceStr } },
      orderBy: { date: 'desc' },
    });

    // 连续打卡天数（高效算法）
    const allDates = await prisma.checkin.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' },
    });
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
      ? Math.round(checkins.reduce((sum, c) => sum + c.healthScore, 0) / checkins.length)
      : 0;

    const today = new Date().toISOString().split('T')[0];
    const todayCheckin = await prisma.checkin.findUnique({
      where: { userId_date: { userId, date: today } },
    });

    return NextResponse.json({
      checkins, streak, avgHealthScore, todayCheckin,
      totalDays: allDates.length,
    });
  } catch (error) {
    console.error('Checkin GET error:', error);
    return NextResponse.json({ error: '获取数据失败' }, { status: 500 });
  }
}
