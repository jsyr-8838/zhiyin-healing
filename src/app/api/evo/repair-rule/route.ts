import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';
import { z } from 'zod';

const repairRuleSchema = z.object({
  errorFingerprint: z.string().min(1),
  errorPattern: z.string().min(1),
  repairAction: z.string().min(1),
  maxRetries: z.number().int().min(1).max(10).optional(),
  cooldownMs: z.number().int().min(1000).optional(),
  isEnabled: z.boolean().optional(),
});

// POST /api/evo/repair-rule — 添加修复规则
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const rule = repairRuleSchema.parse(body);

    const id = generateId();
    const ts = now();
    await db.execute(
      `INSERT INTO EvoRepairRule (id, errorFingerprint, errorPattern, repairAction, successCount, failCount, successRate, maxRetries, cooldownMs, lastExecutedAt, isEnabled, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?)`,
      [
        id,
        rule.errorFingerprint,
        rule.errorPattern,
        rule.repairAction,
        0, // successCount
        0, // failCount
        0, // successRate
        rule.maxRetries || 3,
        rule.cooldownMs || 60000,
        rule.isEnabled !== false ? 1 : 0,
        ts,
        ts,
      ]
    );

    return NextResponse.json({ id, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '参数验证失败', details: error.issues }, { status: 400 });
    }
    if (String(error).includes('UNIQUE') || String(error).includes('Unique')) {
      return NextResponse.json({ error: '该错误指纹已存在' }, { status: 409 });
    }
    console.error('[Evo RepairRule] Error:', error);
    return NextResponse.json({ error: '添加修复规则失败' }, { status: 500 });
  }
}

// GET /api/evo/repair-rule — 查询修复规则
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isEnabled = searchParams.get('enabled');
    let rules;
    if (isEnabled !== null) {
      rules = await db.findAll(
        'SELECT * FROM EvoRepairRule WHERE isEnabled = ? ORDER BY successRate DESC LIMIT 50',
        [isEnabled === 'true' ? 1 : 0]
      );
    } else {
      rules = await db.findAll(
        'SELECT * FROM EvoRepairRule ORDER BY successRate DESC LIMIT 50'
      );
    }
    // Convert boolean fields
    const normalized = rules.map(r => ({
      ...r,
      isEnabled: !!r.isEnabled,
      lastExecutedAt: r.lastExecutedAt || null,
    }));
    return NextResponse.json(normalized);
  } catch (error) {
    console.error('[Evo RepairRule GET] Error:', error);
    return NextResponse.json({ error: '查询修复规则失败' }, { status: 500 });
  }
}
