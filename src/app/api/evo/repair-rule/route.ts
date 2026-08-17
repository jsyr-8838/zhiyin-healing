import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    const entry = await prisma.evoRepairRule.create({
      data: {
        errorFingerprint: rule.errorFingerprint,
        errorPattern: rule.errorPattern,
        repairAction: rule.repairAction,
        maxRetries: rule.maxRetries || 3,
        cooldownMs: rule.cooldownMs || 60000,
        isEnabled: rule.isEnabled !== false,
      },
    });

    return NextResponse.json({ id: entry.id, success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '参数验证失败', details: error.issues }, { status: 400 });
    }
    if (String(error).includes('Unique')) {
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
    const rules = await prisma.evoRepairRule.findMany({
      where: isEnabled !== null ? { isEnabled: isEnabled === 'true' } : undefined,
      orderBy: { successRate: 'desc' },
      take: 50,
    });
    return NextResponse.json(rules);
  } catch (error) {
    console.error('[Evo RepairRule GET] Error:', error);
    return NextResponse.json({ error: '查询修复规则失败' }, { status: 500 });
  }
}
