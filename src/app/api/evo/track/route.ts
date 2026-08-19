import { NextRequest, NextResponse } from 'next/server';
import { db, generateId, now } from '@/lib/db';
import { z } from 'zod';

// 行为埋点上报 schema
const trackEventSchema = z.object({
  eventType: z.string().min(1),       // 事件类型：page_view | action | error | feedback | healing_session
  module: z.string().min(1),          // 模块：diagnose | healing | divination | classics | meridian | tianlai | cultivation | auth | general
  action: z.string().min(1),          // 动作名称
  detail: z.record(z.string(), z.unknown()).optional(), // 事件详情
  userId: z.string().optional(),       // 用户ID
  sessionId: z.string().optional(),    // 会话ID
  duration: z.number().optional(),     // 持续时间(ms)
  score: z.number().optional(),        // 用户评分 -1~1
  errorFingerprint: z.string().optional(), // 错误指纹
});

// POST /api/evo/track — 行为埋点上报
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = trackEventSchema.parse(body);

    // 存储为进化日志（感知层数据入口）
    const id = generateId();
    const ts = now();
    await db.execute(
      `INSERT INTO EvoLog (id, triggerType, triggerDetail, actionType, actionDetail, targetModule, status, strategy, beforeMetric, afterMetric, improvement, startedAt, completedAt, durationMs)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        event.eventType === 'error' ? 'error_detected'
          : event.eventType === 'feedback' ? 'feedback_threshold'
          : 'manual',
        JSON.stringify({
          userId: event.userId,
          sessionId: event.sessionId,
          duration: event.duration,
          score: event.score,
          errorFingerprint: event.errorFingerprint,
          timestamp: Date.now(),
        }),
        `${event.module}:${event.action}`,
        JSON.stringify(event.detail || {}),
        event.module,
        'success',
        '', // 埋点不直接分配策略，由分析层后续决定
        0,
        0,
        0,
        ts,
        ts,
        0,
      ]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: '埋点参数验证失败', details: error.issues }, { status: 400 });
    }
    console.error('[Evo Track] Error:', error);
    // 埋点失败不影响用户体验，静默返回
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
