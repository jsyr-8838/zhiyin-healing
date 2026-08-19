import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/cultivation/meridian-progress?userId=xxx — 获取经络修行进度
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: '缺少 userId' }, { status: 400 });
    }

    const progress = await prisma.meridianProgress.findMany({
      where: { userId },
      orderBy: { meridianId: 'asc' },
    });

    return NextResponse.json({ progress });
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

    const isCompleted = (completion ?? 0) >= 100;

    const progress = await prisma.meridianProgress.upsert({
      where: { userId_meridianId: { userId, meridianId } },
      update: {
        meridianName: meridianName || undefined,
        element: element || undefined,
        viewCount: viewCount ?? undefined,
        quizCorrect: quizCorrect ?? undefined,
        quizTotal: quizTotal ?? undefined,
        practiceCount: practiceCount ?? undefined,
        completion: completion ?? undefined,
        isCompleted,
        updatedAt: new Date(),
      },
      create: {
        userId,
        meridianId,
        meridianName: meridianName || '',
        element: element || 'earth',
        viewCount: viewCount || 0,
        quizCorrect: quizCorrect || 0,
        quizTotal: quizTotal || 0,
        practiceCount: practiceCount || 0,
        completion: completion || 0,
        isCompleted,
      },
    });

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('MeridianProgress POST error:', error);
    return NextResponse.json({ error: '更新经络进度失败' }, { status: 500 });
  }
}
