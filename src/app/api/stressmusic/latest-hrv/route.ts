import { NextResponse } from 'next/server';
import { STRESS_API_BASE } from '@/components/stressmusic/types';

export async function GET() {
  try {
    const res = await fetch(`${STRESS_API_BASE}/api/latest-hrv`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ exists: false, hrv: null, bpm: null, mtime: null }, { status: 502 });
  }
}
