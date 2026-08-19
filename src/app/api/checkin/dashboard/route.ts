import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { userIdSchema } from '@/lib/validators';
import { calcStreakDays, analyzeWeeklyTendency, healthScoreToLevel } from '@/lib/health-score';

// GET /api/checkin/dashboard?userId=xxx
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId || !userIdSchema.safeParse(userId).success) {
      return NextResponse.json({ error: 'userId 参数无效' }, { status: 400 });
    }

    // 1. 最近30天打卡记录
    const since30 = new Date();
    since30.setDate(since30.getDate() - 30);
    const since30Str = since30.toISOString().split('T')[0];

    const recentCheckins = await prisma.checkin.findMany({
      where: { userId, date: { gte: since30Str } },
      orderBy: { date: 'desc' },
    });

    // 2. 所有打卡日期（for streak 计算）
    const allDates = await prisma.checkin.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: 'desc' },
    });
    const dateStrings = allDates.map(c => c.date);

    // 3. Streak 计算
    const currentStreak = calcStreakDays(dateStrings);
    // 最长连续（遍历所有日期）
    let longestStreak = 0;
    let tempStreak = 0;
    const sortedDates = [...dateStrings].sort();
    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) { tempStreak = 1; }
      else {
        const prev = new Date(sortedDates[i - 1]);
        const curr = new Date(sortedDates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
        tempStreak = diff === 1 ? tempStreak + 1 : 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    }

    // 4. 本周/本月天数
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // 周一
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const monthStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const thisWeekDays = dateStrings.filter(d => d >= weekStartStr).length;
    const thisMonthDays = dateStrings.filter(d => d >= monthStartStr).length;

    // 5. 月度统计
    const monthCheckins = recentCheckins.filter(c => c.date >= monthStartStr);
    const avgHealthScore = monthCheckins.length > 0
      ? Math.round(monthCheckins.reduce((s, c) => s + c.healthScore, 0) / monthCheckins.length) : 0;
    const avgSleepScore = monthCheckins.length > 0
      ? Math.round(monthCheckins.reduce((s, c) => s + c.sleepScore, 0) / monthCheckins.length) : 0;
    const avgMoodScore = monthCheckins.length > 0
      ? Math.round(monthCheckins.reduce((s, c) => s + c.moodScore, 0) / monthCheckins.length) : 0;
    const avgExerciseScore = monthCheckins.length > 0
      ? Math.round(monthCheckins.reduce((s, c) => s + c.exerciseScore, 0) / monthCheckins.length) : 0;
    const avgDietScore = monthCheckins.length > 0
      ? Math.round(monthCheckins.reduce((s, c) => s + c.dietScore, 0) / monthCheckins.length) : 0;

    // 6. 五行偏颇趋势（近7天）
    const since7 = new Date();
    since7.setDate(since7.getDate() - 7);
    const since7Str = since7.toISOString().split('T')[0];
    const recent7 = recentCheckins.filter(c => c.date >= since7Str);
    const weeklyTendencies = analyzeWeeklyTendency(recent7.map(c => ({
      moodScore: c.moodScore, sleepScore: c.sleepScore,
      dietScore: c.dietScore, exerciseScore: c.exerciseScore,
      symptoms: c.symptoms,
    })));
    // 聚合偏颇
    const wuxingAvg = recent7.length > 0 ? {
      wood: Math.round(recent7.reduce((s, c) => s + c.woodTendency, 0) / recent7.length * 100) / 100,
      fire: Math.round(recent7.reduce((s, c) => s + c.fireTendency, 0) / recent7.length * 100) / 100,
      earth: Math.round(recent7.reduce((s, c) => s + c.earthTendency, 0) / recent7.length * 100) / 100,
      metal: Math.round(recent7.reduce((s, c) => s + c.metalTendency, 0) / recent7.length * 100) / 100,
      water: Math.round(recent7.reduce((s, c) => s + c.waterTendency, 0) / recent7.length * 100) / 100,
    } : { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

    // 7. 推荐引擎
    const RECOMMENDATIONS: Record<string, {
      element: string; wuyin: { tone: string; freq: number; preset: string };
      liuzijue: { char: string; organ: string };
      tuina: { region: string; technique: string };
      moxibustion: { point: string; duration: string };
      lifestyle: string;
      color: string;
    }> = {
      '木': {
        element: '木', color: '#4A8C5C',
        wuyin: { tone: '角', freq: 329.63, preset: '疏肝解郁' },
        liuzijue: { char: '嘘', organ: '肝' },
        tuina: { region: '胸胁', technique: '擦胁疏肝' },
        moxibustion: { point: '太冲·期门', duration: '15分钟' },
        lifestyle: '保持心情舒畅，避免怒气，适当户外运动',
      },
      '火': {
        element: '火', color: '#D4614E',
        wuyin: { tone: '徵', freq: 392.00, preset: '养心安神' },
        liuzijue: { char: '呵', organ: '心' },
        tuina: { region: '胸', technique: '按揉膻中' },
        moxibustion: { point: '神门·内关', duration: '15分钟' },
        lifestyle: '早睡早起，减少辛辣，静心冥想',
      },
      '土': {
        element: '土', color: '#C9A84C',
        wuyin: { tone: '宫', freq: 261.63, preset: '健脾和胃' },
        liuzijue: { char: '呼', organ: '脾' },
        tuina: { region: '腹部', technique: '摩腹健脾' },
        moxibustion: { point: '足三里·中脘', duration: '20分钟' },
        lifestyle: '定时定量饮食，细嚼慢咽，饭后散步',
      },
      '金': {
        element: '金', color: '#8B7355',
        wuyin: { tone: '商', freq: 293.66, preset: '宣肺理气' },
        liuzijue: { char: '呬', organ: '肺' },
        tuina: { region: '上肢', technique: '按揉合谷' },
        moxibustion: { point: '肺俞·列缺', duration: '10分钟' },
        lifestyle: '适度有氧运动，注意保暖，深呼吸练习',
      },
      '水': {
        element: '水', color: '#2C1810',
        wuyin: { tone: '羽', freq: 440.00, preset: '固肾益精' },
        liuzijue: { char: '吹', organ: '肾' },
        tuina: { region: '腰背', technique: '擦肾俞' },
        moxibustion: { point: '涌泉·肾俞', duration: '20分钟' },
        lifestyle: '避免熬夜，温水泡脚，节制房事',
      },
    };

    const recommendations = weeklyTendencies
      .filter(t => t.score > 0.3)
      .slice(0, 3)
      .map(t => ({ ...RECOMMENDATIONS[t.element], pattern: t.pattern, score: t.score }));

    // 8. 健康计划
    const healthPlan = await prisma.healthPlan.findFirst({
      where: { userId, isActive: true },
    });

    // 9. 最近打卡转换为 summary
    const recentSummary = recentCheckins.map(c => ({
      date: c.date,
      healthScore: c.healthScore,
      sleepScore: c.sleepScore,
      moodScore: c.moodScore,
      exerciseScore: c.exerciseScore,
      dietScore: c.dietScore,
      level: healthScoreToLevel(c.healthScore),
      woodTendency: c.woodTendency,
      fireTendency: c.fireTendency,
      earthTendency: c.earthTendency,
      metalTendency: c.metalTendency,
      waterTendency: c.waterTendency,
      healingDone: c.healingDone,
    }));

    return NextResponse.json({
      streak: {
        current: currentStreak,
        longest: longestStreak,
        totalDays: allDates.length,
        thisWeekDays,
        thisMonthDays,
      },
      recentCheckins: recentSummary,
      monthlyStats: {
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        avgHealthScore,
        avgSleepScore,
        avgMoodScore,
        avgExerciseScore,
        avgDietScore,
      },
      wuxingTendencies: wuxingAvg,
      weeklyTendencies,
      recommendations,
      healthPlan: healthPlan ? {
        active: healthPlan.isActive,
        startDate: healthPlan.startDate,
        endDate: healthPlan.endDate,
        completionRate: healthPlan.completionRate,
      } : null,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json({ error: '获取Dashboard数据失败' }, { status: 500 });
  }
}
