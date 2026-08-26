import { NextRequest, NextResponse } from 'next/server';
import { db, now } from '@/lib/db';
import { evoEngine } from '@/lib/evo/engine';

// ── 安全校验：Vercel Cron 请求头 ──
function isAuthorizedCron(request: NextRequest): boolean {
  // Vercel Cron 会自动注入 x-vercel-cron-auth header
  const cronAuth = request.headers.get('x-vercel-cron-auth');
  if (cronAuth === '1' || cronAuth === 'true') return true;

  // 本地开发或手动触发：检查 auth query param
  const url = new URL(request.url);
  const authToken = url.searchParams.get('auth');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authToken === cronSecret) return true;

  // 没有配置 CRON_SECRET 时，Vercel 环境直接放行（Vercel 已有网络层保护）
  if (process.env.VERCEL && !cronSecret) return true;

  return false;
}

// 核心执行函数 — POST 和 GET(Vercel Cron) 共用
async function runCronJobs(force: boolean) {
  // 获取所有启用的调度任务
  const schedules = await db.findAll(
    'SELECT * FROM EvoSchedule WHERE isEnabled = 1'
  );

  const nowDate = new Date();
  const results: { name: string; status: string; detail?: string }[] = [];

  for (const schedule of schedules) {
    const sch = schedule as Record<string, unknown>;
    try {
      // 检查是否到达执行时间（简单实现：间隔检查）
      if (!force && sch.nextRunAt) {
        const nextRun = new Date(sch.nextRunAt as string);
        if (nextRun > nowDate) {
          results.push({ name: sch.name as string, status: 'skipped', detail: '未到执行时间' });
          continue;
        }
      }

      // 根据动作类型执行
      let result;
      switch (sch.actionType) {
        case 'daily_self_check':
          result = await evoEngine.dailySelfCheck();
          break;
        case 'weekly_deep_evolution':
          result = await evoEngine.weeklyDeepEvolution();
          break;
        case 'monthly_knowledge_expansion':
          result = await evoEngine.monthlyKnowledgeExpansion();
          break;
        default:
          result = { tasksTotal: 0, tasksSuccess: 0, tasksFailed: 0, details: [`未知动作类型: ${sch.actionType}`] };
      }

      // 更新调度记录
      const nextRun = calculateNextRun(sch.cronExpr as string);
      const ts = now();
      const currentRunCount = (sch.runCount as number) || 0;
      await db.execute(
        'UPDATE EvoSchedule SET lastRunAt = ?, nextRunAt = ?, runCount = ?, updatedAt = ? WHERE id = ?',
        [ts, nextRun.toISOString(), currentRunCount + 1, ts, sch.id]
      );

      results.push({
        name: sch.name as string,
        status: 'success',
        detail: `成功${result.tasksSuccess} 失败${result.tasksFailed}`,
      });
    } catch (err) {
      // 记录失败
      const currentFailCount = (sch.failCount as number) || 0;
      const ts = now();
      await db.execute(
        'UPDATE EvoSchedule SET failCount = ?, updatedAt = ? WHERE id = ?',
        [currentFailCount + 1, ts, sch.id]
      ).catch((e) => {
        console.warn('[Evo Cron] failCount increment failed for schedule:', sch.id, e);
      });

      results.push({
        name: sch.name as string,
        status: 'failed',
        detail: String(err),
      });
    }
  }

  const hasFailure = results.some(r => r.status === 'failed');
  return NextResponse.json(
    { results, timestamp: nowDate.toISOString() },
    { status: hasFailure ? 207 : 200 },
  );
}

// POST /api/evo/cron — 定时进化任务触发入口
// 由 Vercel Cron 或外部服务调用
// 支持参数：{ force: boolean } — 是否强制执行（忽略间隔检查）
export async function POST(request: NextRequest) {
  try {
    // 安全校验
    if (!isAuthorizedCron(request)) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const force = body.force === true;
    return await runCronJobs(force);
  } catch (error) {
    console.error('[Evo Cron POST] Error:', error);
    return NextResponse.json({ error: '定时任务执行失败' }, { status: 500 });
  }
}

// GET /api/evo/cron — Vercel Cron 自动触发（GET 方式）+ 查看调度状态
// Vercel Cron 以 GET 方式调用 /api/evo/cron，需带 ?run=1 或 cron-auth header
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const shouldRun = url.searchParams.get('run') === '1';

    if (shouldRun) {
      // Vercel Cron 触发执行
      if (!isAuthorizedCron(request)) {
        return NextResponse.json({ error: '未授权' }, { status: 401 });
      }
      return await runCronJobs(true); // Vercel Cron 触发时强制执行（Vercel 已按计划调用）
    }

    // 否则返回调度状态（查看用）
    const schedules = await db.findAll(
      'SELECT * FROM EvoSchedule ORDER BY nextRunAt ASC'
    );

    const normalized = schedules.map((s: Record<string, unknown>) => ({
      ...s,
      isEnabled: !!s.isEnabled,
      lastRunAt: s.lastRunAt || null,
      nextRunAt: s.nextRunAt || null,
    }));

    return NextResponse.json(normalized);
  } catch (error) {
    console.error('[Evo Cron GET] Error:', error);
    return NextResponse.json({ error: '查询调度状态失败' }, { status: 500 });
  }
}

/**
 * 简单的 cron 表达式解析（计算下次运行时间）
 * 支持格式：分 时 日 月 周
 */
function calculateNextRun(cronExpr: string): Date {
  const parts = cronExpr.trim().split(/\s+/);
  if (parts.length !== 5) {
    // 默认1小时后
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  const [minute, hour, dayOfMonth, , dayOfWeek] = parts;
  const nowDate = new Date();
  const next = new Date(nowDate);

  // 简化实现：基于当前时间 + 固定间隔
  if (dayOfWeek !== '*' && dayOfMonth === '*') {
    // 周级任务：7天后
    next.setDate(next.getDate() + 7);
  } else if (dayOfMonth !== '*') {
    // 月级任务：30天后
    next.setDate(next.getDate() + 30);
  } else {
    // 日级任务：1天后
    next.setDate(next.getDate() + 1);
  }

  // 设置执行时间
  if (hour !== '*') next.setHours(parseInt(hour), 0, 0, 0);
  if (minute !== '*') next.setMinutes(parseInt(minute), 0, 0);

  return next;
}
