import { NextResponse } from 'next/server';
import { evoEngine } from '@/lib/evo/engine';

// POST /api/evo/weekly-evolution — 触发每周深度进化
export async function POST() {
  try {
    const result = await evoEngine.weeklyDeepEvolution();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Evo WeeklyEvolution] Error:', error);
    return NextResponse.json(
      { error: '每周深度进化执行失败', tasksTotal: 0, tasksSuccess: 0, tasksFailed: 0, details: [String(error)] },
      { status: 500 }
    );
  }
}
