import { NextRequest, NextResponse } from 'next/server';
import { evoEngine } from '@/lib/evo/engine';
import { z } from 'zod';

const knowledgeSchema = z.object({
  domain: z.string().min(1),
  element: z.string().optional(),
  title: z.string().min(1),
  content: z.string().min(1),
  source: z.string().optional(),
  sourceUrl: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

// POST /api/evo/knowledge — 添加进化知识
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = knowledgeSchema.parse(body);
    const id = await evoEngine.addKnowledge(params);
    return NextResponse.json({ id, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '参数验证失败', details: error.issues }, { status: 400 });
    }
    console.error('[Evo Knowledge POST] Error:', error);
    return NextResponse.json({ error: '添加知识失败' }, { status: 500 });
  }
}

// GET /api/evo/knowledge?domain=xxx&element=xxx&status=deployed&limit=20 — 查询进化知识
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const result = await evoEngine.queryKnowledge({
      domain: searchParams.get('domain') || undefined,
      element: searchParams.get('element') || undefined,
      status: searchParams.get('status') || undefined,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 20,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error('[Evo Knowledge GET] Error:', error);
    return NextResponse.json({ error: '查询知识失败' }, { status: 500 });
  }
}
