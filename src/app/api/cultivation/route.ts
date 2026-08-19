import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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
    let cultivation = await prisma.cultivation.findUnique({ where: { userId } });
    if (!cultivation) {
      cultivation = await prisma.cultivation.create({
        data: { userId },
      });
    }

    // 获取近期功法记录（7天内）
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentLogs = await prisma.practiceLog.findMany({
      where: { userId, createdAt: { gte: sevenDaysAgo } },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // 获取经络进度
    const meridianProgs = await prisma.meridianProgress.findMany({
      where: { userId },
    });

    // 统计诊断记录数
    const diagnosisCount = await prisma.assessment.count({ where: { userId } });

    // 计算段位
    const xiuwei: XiuWeiValues = {
      wood: cultivation.woodXiuWei,
      fire: cultivation.fireXiuWei,
      earth: cultivation.earthXiuWei,
      metal: cultivation.metalXiuWei,
      water: cultivation.waterXiuWei,
    };
    const rankResult = calculateRank(xiuwei, {
      totalPractices: cultivation.totalPractices,
      streakDays: cultivation.streakDays,
      completedMeridians: meridianProgs.filter(m => m.isCompleted).length,
      diagnosisCount,
    });

    // 今日完成统计
    const today = new Date().toISOString().slice(0, 10);
    const todayLogs = recentLogs.filter(l => l.date === today);
    const todayCompleted = [...new Set(todayLogs.map(l => l.category))];

    // 连续天数计算
    const lastPracticeDate = cultivation.lastPracticeAt;
    let streakDays = cultivation.streakDays;
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
    const diagnosisCount = await prisma.assessment.count({ where: { userId } });

    // 自动计算段位
    const cultivation = await prisma.cultivation.findUnique({ where: { userId } });
    const totalPractices = cultivation?.totalPractices ?? 0;
    const rankResult = calculateRank(xiuwei, {
      totalPractices,
      streakDays: streakDays ?? 0,
      completedMeridians: 0,
      diagnosisCount,
    });

    const updated = await prisma.cultivation.upsert({
      where: { userId },
      update: {
        woodXiuWei: xiuwei.wood,
        fireXiuWei: xiuwei.fire,
        earthXiuWei: xiuwei.earth,
        metalXiuWei: xiuwei.metal,
        waterXiuWei: xiuwei.water,
        rank: rankResult.index,
        rankTitle: rankResult.title,
        streakDays: streakDays ?? 0,
        updatedAt: new Date(),
      },
      create: {
        userId,
        woodXiuWei: xiuwei.wood,
        fireXiuWei: xiuwei.fire,
        earthXiuWei: xiuwei.earth,
        metalXiuWei: xiuwei.metal,
        waterXiuWei: xiuwei.water,
        rank: rankResult.index,
        rankTitle: rankResult.title,
        streakDays: streakDays ?? 0,
      },
    });

    return NextResponse.json({ cultivation: updated, rank: rankResult });
  } catch (error) {
    console.error('Cultivation PUT error:', error);
    return NextResponse.json({ error: '更新修为失败' }, { status: 500 });
  }
}
