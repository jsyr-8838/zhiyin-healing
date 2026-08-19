import { NextRequest, NextResponse } from 'next/server';
import { STRESS_API_BASE } from '@/components/stressmusic/types';
import { startMeasurementSchema, validateOrError } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const validated = validateOrError(startMeasurementSchema, raw);
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const body = validated.data;
    const res = await fetch(`${STRESS_API_BASE}/api/start-measurement`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json({ error: 'StressMusic 后端不可用' }, { status: 502 });
  }
}
