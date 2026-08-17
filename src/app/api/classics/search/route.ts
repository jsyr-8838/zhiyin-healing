import { NextRequest, NextResponse } from 'next/server';
import { searchClassics } from '@/lib/classics-search';
import { classicsSearchSchema, validateOrError } from '@/lib/validators';

export async function POST(req: NextRequest) {
  try {
    const raw = await req.json();
    const validated = validateOrError(classicsSearchSchema, raw);
    if ('error' in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }
    const { query } = validated.data;

    const results = await searchClassics(query, 30, true);
    return NextResponse.json({ results, total: results.length });
  } catch (err) {
    console.error('[classics/search] Error:', err);
    return NextResponse.json({ error: '搜索失败' }, { status: 500 });
  }
}
