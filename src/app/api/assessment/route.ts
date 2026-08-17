import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const assessment = await prisma.assessment.upsert({
      where: { userId_date: { userId, date: today } },
      update: {
        pinghe: scores.pinghe, qixue: scores.qixue, yangxu: scores.yangxu,
        yinxu: scores.yinxu, tanshi: scores.tanshi, shire: scores.shire,
        xueyu: scores.xueyu, qiyu: scores.qiyu, tebing: scores.tebing,
        primaryType, dominantWuyin, wuyinScores: JSON.stringify(wuyinScores), recommendation,
      },
      create: {
        userId, date: today,
        pinghe: scores.pinghe, qixue: scores.qixue, yangxu: scores.yangxu,
        yinxu: scores.yinxu, tanshi: scores.tanshi, shire: scores.shire,
        xueyu: scores.xueyu, qiyu: scores.qiyu, tebing: scores.tebing,
        primaryType, dominantWuyin, wuyinScores: JSON.stringify(wuyinScores), recommendation,
      },
    });

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

    const latest = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ assessment: latest });
  } catch (error) {
    console.error('Assessment GET error:', error);
    return NextResponse.json({ error: '获取测评结果失败' }, { status: 500 });
  }
}
