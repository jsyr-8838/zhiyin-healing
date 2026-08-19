import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { evoEngine } from '@/lib/evo/engine';

// POST /api/evo/cron — 定时进化任务触发入口
// 由外部 cron 服务或 scheduler skill 定时调用
// 支持参数：{ force: boolean } — 是否强制执行（忽略间隔检查）

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const force = body.force === true;

    // 获取所有启用的调度任务
    const schedules = await prisma.evoSchedule.findMany({
      where: { isEnabled: true },
    });

    const now = new Date();
    const results: { name: string; status: string; detail?: string }[] = [];

    for (const schedule of schedules) {
      try {
        // 检查是否到达执行时间（简单实现：间隔检查）
        if (!force && schedule.nextRunAt && schedule.nextRunAt > now) {
          results.push({ name: schedule.name, status: 'skipped', detail: '未到执行时间' });
          continue;
        }

        // 根据动作类型执行
        let result;
        switch (schedule.actionType) {
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
            result = { tasksTotal: 0, tasksSuccess: 0, tasksFailed: 0, details: [`未知动作类型: ${schedule.actionType}`] };
        }

        // 更新调度记录
        const nextRun = calculateNextRun(schedule.cronExpr);
        await prisma.evoSchedule.update({
          where: { id: schedule.id },
          data: {
            lastRunAt: now,
            nextRunAt: nextRun,
            runCount: { increment: 1 },
          },
        });

        results.push({
          name: schedule.name,
          status: 'success',
          detail: `成功${result.tasksSuccess} 失败${result.tasksFailed}`,
        });
      } catch (err) {
        // 记录失败
        await prisma.evoSchedule.update({
          where: { id: schedule.id },
          data: { failCount: { increment: 1 } },
        }).catch((e) => {
          console.warn('[Evo Cron] failCount increment failed for schedule:', schedule.id, e);
        });

        results.push({
          name: schedule.name,
          status: 'failed',
          detail: String(err),
        });
      }
    }

    const hasFailure = results.some(r => r.status === 'failed');
    return NextResponse.json(
      { results, timestamp: now.toISOString() },
      { status: hasFailure ? 207 : 200 },
    );
  } catch (error) {
    console.error('[Evo Cron] Error:', error);
    return NextResponse.json({ error: '定时任务执行失败' }, { status: 500 });
  }
}

// GET /api/evo/cron — 查看调度状态
export async function GET() {
  try {
    const schedules = await prisma.evoSchedule.findMany({
      orderBy: { nextRunAt: 'asc' },
    });
    return NextResponse.json(schedules);
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
  const now = new Date();
  const next = new Date(now);

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
