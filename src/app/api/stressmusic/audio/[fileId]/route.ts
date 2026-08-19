import { NextRequest, NextResponse } from 'next/server';
import { STRESS_API_BASE } from '@/components/stressmusic/types';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const res = await fetch(`${STRESS_API_BASE}/api/audio/${fileId}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Audio not found' }, { status: res.status });
    }
    const contentType = res.headers.get('content-type') || 'audio/wav';
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        'content-type': contentType,
        'content-length': String(buffer.byteLength),
        'accept-ranges': 'bytes',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'StressMusic 后端不可用' }, { status: 502 });
  }
}
