import { NextResponse } from 'next/server';
import { evoEngine } from '@/lib/evo/engine';

// POST /api/evo/monthly-expansion — 触发每月知识扩充
export async function POST() {
  try {
    const result = await evoEngine.monthlyKnowledgeExpansion();
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Evo MonthlyExpansion] Error:', error);
    return NextResponse.json(
      { error: '每月知识扩充执行失败', tasksTotal: 0, tasksSuccess: 0, tasksFailed: 0, details: [String(error)] },
      { status: 500 }
    );
  }
}
