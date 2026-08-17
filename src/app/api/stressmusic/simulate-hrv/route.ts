import { NextResponse } from 'next/server';
import { STRESS_API_BASE } from '@/components/stressmusic/types';

export async function POST() {
  try {
    const res = await fetch(`${STRESS_API_BASE}/api/simulate-hrv`, { method: 'POST' });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'StressMusic 后端不可用' }, { status: 502 });
  }
}
