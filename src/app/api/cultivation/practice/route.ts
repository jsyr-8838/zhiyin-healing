import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calcXiuWeiGain, type XiuWeiSource, liuzijueIdToElement } from '@/lib/cultivation-engine';
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

    // 计算修为获得
    const source: XiuWeiSource = {
      category,
      subCategory,
      element,
      baseGain: customGain || 1,
    };
    const gain = calcXiuWeiGain(source);

    // 写入功法记录
    const log = await prisma.practiceLog.create({
      data: {
        userId,
        date: today,
        category,
        subCategory: subCategory || '',
        element,
        durationSec: durationSec || 0,
        cycles: cycles || 0,
        xiuWeiGain: gain,
        metadata: metadata ? JSON.stringify(metadata) : '{}',
      },
    });

    // 更新修为值
    const cultivation = await prisma.cultivation.findUnique({ where: { userId } });
    const prev = cultivation || await prisma.cultivation.create({ data: { userId } });

    const xiuwei: XiuWeiValues = {
      wood: prev.woodXiuWei,
      fire: prev.fireXiuWei,
      earth: prev.earthXiuWei,
      metal: prev.metalXiuWei,
      water: prev.waterXiuWei,
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
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().slice(0, 10);
    const lastDate = prev.lastPracticeAt?.toISOString().slice(0, 10) ?? '';
    let streakDays = prev.streakDays;
    if (lastDate === yesterdayStr) {
      streakDays += 1;
    } else if (lastDate !== today) {
      streakDays = 1;
    }

    // 统计诊断记录数
    const diagnosisCount = await prisma.assessment.count({ where: { userId } });

    // 段位计算
    const rankResult = calculateRank(xiuwei, {
      totalPractices: prev.totalPractices + 1,
      streakDays,
      completedMeridians: 0,
      diagnosisCount,
    });

    // 更新 DB
    const updated = await prisma.cultivation.update({
      where: { userId },
      data: {
        woodXiuWei: xiuwei.wood,
        fireXiuWei: xiuwei.fire,
        earthXiuWei: xiuwei.earth,
        metalXiuWei: xiuwei.metal,
        waterXiuWei: xiuwei.water,
        rank: rankResult.index,
        rankTitle: rankResult.title,
        totalPractices: prev.totalPractices + 1,
        totalMinutes: prev.totalMinutes + Math.round((durationSec || 0) / 60),
        streakDays,
        lastPracticeAt: now,
      },
    });

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

    const where: { userId: string; date?: string } = { userId };
    if (date) where.date = date;

    const logs = await prisma.practiceLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Practice GET error:', error);
    return NextResponse.json({ error: '查询功法记录失败' }, { status: 500 });
  }
}
