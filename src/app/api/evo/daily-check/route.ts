import { NextResponse } from 'next/server';
import { evoEngine } from '@/lib/evo/engine';

// POST /api/evo/daily-check — 触发每日自检
export async function POST() {
  try {
    const result = await evoEngine.dailySelfCheck();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Evo DailyCheck] Error:', error);
    return NextResponse.json(
      { error: '每日自检执行失败', tasksTotal: 0, tasksSuccess: 0, tasksFailed: 0, details: [String(error)] },
      { status: 500 }
    );
  }
}
