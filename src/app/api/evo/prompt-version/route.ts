import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';
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
    const latest = await db.findOne<{ version: number }>(
      'SELECT version FROM EvoPromptVersion WHERE promptId = ? ORDER BY version DESC LIMIT 1',
      [params.promptId]
    );
    const nextVersion = (latest?.version || 0) + 1;

    // 如果设为活跃，先将同 promptId 的其他版本设为非活跃
    if (params.isActive) {
      await db.execute(
        'UPDATE EvoPromptVersion SET isActive = 0 WHERE promptId = ? AND isActive = 1',
        [params.promptId]
      );
    }

    const id = generateId();
    const ts = now();
    await db.execute(
      `INSERT INTO EvoPromptVersion (id, promptId, module, version, systemPrompt, avgScore, sampleSize, hallucinationRate, isActive, deployedAt, rolledBackAt, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
      [id, params.promptId, params.module, nextVersion, params.systemPrompt,
       params.avgScore || 0, params.sampleSize || 0, params.hallucinationRate || 0,
       params.isActive ? 1 : 0,
       params.isActive ? ts : null, ts]
    );

    return NextResponse.json({ id, version: nextVersion, success: true });
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

    let sql = 'SELECT * FROM EvoPromptVersion WHERE 1=1';
    const params: unknown[] = [];
    if (promptId) { sql += ' AND promptId = ?'; params.push(promptId); }
    if (moduleFilter) { sql += ' AND module = ?'; params.push(moduleFilter); }
    if (activeOnly) { sql += ' AND isActive = 1'; }
    sql += ' ORDER BY version DESC LIMIT 20';

    const versions = await db.findAll(sql, params);

    // Normalize boolean fields
    const normalized = versions.map((v: Record<string, unknown>) => ({
      ...v,
      isActive: !!v.isActive,
      deployedAt: v.deployedAt || null,
      rolledBackAt: v.rolledBackAt || null,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('[Evo PromptVersion GET] Error:', error);
    return NextResponse.json({ error: '查询提示词版本失败' }, { status: 500 });
  }
}
