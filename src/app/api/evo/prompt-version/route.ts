import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const promptVersionSchema = z.object({
  promptId: z.string().min(1),
  module: z.string().min(1),
  systemPrompt: z.string().min(1),
  avgScore: z.number().optional(),
  sampleSize: z.number().int().optional(),
  hallucinationRate: z.number().min(0).max(1).optional(),
  isActive: z.boolean().optional(),
});

// POST /api/evo/prompt-version — 添加/部署提示词版本
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = promptVersionSchema.parse(body);

    // 获取当前最大版本号
    const latest = await prisma.evoPromptVersion.findFirst({
      where: { promptId: params.promptId },
      orderBy: { version: 'desc' },
      select: { version: true },
    });
    const nextVersion = (latest?.version || 0) + 1;

    // 如果设为活跃，先将同 promptId 的其他版本设为非活跃
    if (params.isActive) {
      await prisma.evoPromptVersion.updateMany({
        where: { promptId: params.promptId, isActive: true },
        data: { isActive: false },
      });
    }

    const entry = await prisma.evoPromptVersion.create({
      data: {
        promptId: params.promptId,
        module: params.module,
        version: nextVersion,
        systemPrompt: params.systemPrompt,
        avgScore: params.avgScore || 0,
        sampleSize: params.sampleSize || 0,
        hallucinationRate: params.hallucinationRate || 0,
        isActive: params.isActive || false,
        deployedAt: params.isActive ? new Date() : null,
      },
    });

    return NextResponse.json({ id: entry.id, version: nextVersion, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '参数验证失败', details: error.issues }, { status: 400 });
    }
    console.error('[Evo PromptVersion POST] Error:', error);
    return NextResponse.json({ error: '添加提示词版本失败' }, { status: 500 });
  }
}

// GET /api/evo/prompt-version?promptId=xxx&module=xxx&active=true — 查询提示词版本
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const promptId = searchParams.get('promptId');
    const moduleFilter = searchParams.get('module');
    const activeOnly = searchParams.get('active') === 'true';

    const where: Record<string, unknown> = {};
    if (promptId) where.promptId = promptId;
    if (moduleFilter) where.module = moduleFilter;
    if (activeOnly) where.isActive = true;

    const versions = await prisma.evoPromptVersion.findMany({
      where,
      orderBy: { version: 'desc' },
      take: 20,
    });

    return NextResponse.json(versions);
  } catch (error) {
    console.error('[Evo PromptVersion GET] Error:', error);
    return NextResponse.json({ error: '查询提示词版本失败' }, { status: 500 });
  }
}
