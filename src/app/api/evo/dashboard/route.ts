import { NextResponse } from 'next/server';
import { evoEngine } from '@/lib/evo/engine';

// GET /api/evo/dashboard — 进化仪表盘数据
export async function GET() {
  try {
    const dashboard = await evoEngine.getDashboard();
    return NextResponse.json(dashboard);
  } catch (error) {
    console.error('[Evo Dashboard] Error:', error);
    return NextResponse.json(
      { error: '获取仪表盘数据失败' },
      { status: 500 }
    );
  }
}
