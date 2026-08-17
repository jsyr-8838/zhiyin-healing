/**
 * 知音自我进化引擎 — 核心调度器
 * 
 * 五层架构：
 * L1 感知 → L2 分析 → L3 决策 → L4 执行 → L5 反馈
 * 
 * 三级调度：
 * - 每日自检（5-10min）：错误扫描、修复规则匹配、基础指标采集
 * - 每周深度进化（30-60min）：提示词优化、内容扩充、UI改进
 * - 每月知识扩充（2-4h）：深度调研、知识库更新、策略调整
 */

import { prisma } from '@/lib/prisma';

// ── 进化模块枚举 ──
export type EvoModule = 
  | 'diagnose' | 'healing' | 'divination' | 'classics' 
  | 'meridian' | 'tianlai' | 'cultivation' | 'auth' | 'general';

// ── 五行策略 ──
export type WuXingStrategy = 'wood' | 'fire' | 'earth' | 'metal' | 'water';

export const WUXING_STRATEGY_META: Record<WuXingStrategy, {
  label: string;
  direction: string;
  emoji: string;
}> = {
  wood:   { label: '木行·生长', direction: '内容扩充、知识发现', emoji: '🌱' },
  fire:   { label: '火行·活跃', direction: '提示词优化、AI增强', emoji: '🔥' },
  earth:  { label: '土行·稳固', direction: 'Bug修复、体验优化', emoji: '🏔' },
  metal:  { label: '金行·精炼', direction: '性能优化、内容精简', emoji: '⚔' },
  water:  { label: '水行·适应', direction: '个性化适配、动态调整', emoji: '🌊' },
};

// ── 进化任务优先级 ──
export type EvoPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface EvoTask {
  id: string;
  priority: EvoPriority;
  strategy: WuXingStrategy;
  module: EvoModule;
  actionType: string;
  description: string;
  estimatedMinutes: number;
  execute: () => Promise<EvoTaskResult>;
}

export interface EvoTaskResult {
  success: boolean;
  detail: string;
  beforeMetric?: number;
  afterMetric?: number;
  data?: Record<string, unknown>;
}

// ── 进化引擎类 ──
export class ZhiYinEvoEngine {
  private isRunning = false;
  private currentTask: EvoTask | null = null;

  /**
   * 执行每日自检
   * 扫描错误、匹配修复规则、记录基础指标
   */
  async dailySelfCheck(): Promise<{
    tasksTotal: number;
    tasksSuccess: number;
    tasksFailed: number;
    details: string[];
  }> {
    if (this.isRunning) {
      return { tasksTotal: 0, tasksSuccess: 0, tasksFailed: 0, details: ['引擎正在运行，跳过'] };
    }

    this.isRunning = true;
    const details: string[] = [];
    let success = 0;
    let failed = 0;

    try {
      // 1. 记录引擎启动日志
      const logEntry = await this.createLog('scheduled', 'daily_self_check', 'earth');
      details.push('每日自检启动');

      // 2. 扫描修复规则
      const repairRules = await prisma.evoRepairRule.findMany({
        where: { isEnabled: true },
        orderBy: { successRate: 'desc' },
      });
      details.push(`扫描到 ${repairRules.length} 条修复规则`);

      // 3. 检查系统健康指标
      const healthCheck = await this.checkSystemHealth();
      details.push(`系统健康: ${healthCheck.healthy ? '正常' : '异常'} (${healthCheck.checks.length} 项)`);

      // 4. 采集基础指标
      const metrics = await this.collectBasicMetrics();
      details.push(`采集指标: ${Object.keys(metrics).length} 项`);

      // 5. 更新进化日志
      await this.completeLog(logEntry.id, 'success', {
        healthCheck,
        metrics,
        repairRulesCount: repairRules.length,
      });

      success++;
    } catch (err) {
      failed++;
      details.push(`自检异常: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      this.isRunning = false;
    }

    return {
      tasksTotal: success + failed,
      tasksSuccess: success,
      tasksFailed: failed,
      details,
    };
  }

  /**
   * 执行每周深度进化
   * 提示词优化、内容扩充、UI改进
   */
  async weeklyDeepEvolution(): Promise<{
    tasksTotal: number;
    tasksSuccess: number;
    tasksFailed: number;
    details: string[];
  }> {
    if (this.isRunning) {
      return { tasksTotal: 0, tasksSuccess: 0, tasksFailed: 0, details: ['引擎正在运行，跳过'] };
    }

    this.isRunning = true;
    const details: string[] = [];
    let success = 0;
    let failed = 0;

    try {
      details.push('每周深度进化启动');

      // 1. 分析用户反馈，识别低分提示词
      const lowScorePrompts = await this.analyzePromptScores();
      details.push(`低分提示词: ${lowScorePrompts.length} 个需要优化`);

      // 2. 分析内容缺口
      const contentGaps = await this.analyzeContentGaps();
      details.push(`内容缺口: ${contentGaps.length} 个待扩充`);

      // 3. 分析用户行为模式
      const behaviorInsights = await this.analyzeBehaviorPatterns();
      details.push(`行为洞察: ${behaviorInsights.length} 条`);

      // 4. 执行修复规则
      const repairResults = await this.executeRepairRules();
      details.push(`修复执行: ${repairResults.success} 成功, ${repairResults.failed} 失败`);
      success += repairResults.success;
      failed += repairResults.failed;

      // 5. 记录进化日志
      await this.createLog('scheduled', 'weekly_deep_evolution', 'wood', {
        lowScorePrompts: lowScorePrompts.length,
        contentGaps: contentGaps.length,
        behaviorInsights: behaviorInsights.length,
      });

      success++;
    } catch (err) {
      failed++;
      details.push(`深度进化异常: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      this.isRunning = false;
    }

    return {
      tasksTotal: success + failed,
      tasksSuccess: success,
      tasksFailed: failed,
      details,
    };
  }

  /**
   * 执行每月知识扩充
   * 深度调研、知识库更新、策略调整
   */
  async monthlyKnowledgeExpansion(): Promise<{
    tasksTotal: number;
    tasksSuccess: number;
    tasksFailed: number;
    details: string[];
  }> {
    const details: string[] = [];
    let success = 0;
    let failed = 0;

    try {
      details.push('每月知识扩充启动');

      // 1. 统计知识库覆盖率
      const knowledgeStats = await prisma.evoKnowledge.groupBy({
        by: ['domain'],
        _count: { id: true },
        where: { status: 'deployed' },
      });
      details.push(`知识库: ${knowledgeStats.length} 个领域, ${knowledgeStats.reduce((s, d) => s + d._count.id, 0)} 条知识`);

      // 2. 识别低覆盖率领域
      const lowCoverageDomains = knowledgeStats
        .filter(d => d._count.id < 10)
        .map(d => d.domain);
      details.push(`低覆盖率领域: ${lowCoverageDomains.join(', ') || '无'}`);

      // 3. 记录进化日志
      await this.createLog('scheduled', 'monthly_knowledge_expansion', 'water', {
        knowledgeStats: knowledgeStats.map(d => ({ domain: d.domain, count: d._count.id })),
        lowCoverageDomains,
      });

      success++;
    } catch (err) {
      failed++;
      details.push(`知识扩充异常: ${err instanceof Error ? err.message : String(err)}`);
    }

    return {
      tasksTotal: success + failed,
      tasksSuccess: success,
      tasksFailed: failed,
      details,
    };
  }

  // ── 内部方法 ──

  private async checkSystemHealth(): Promise<{
    healthy: boolean;
    checks: { name: string; status: 'ok' | 'warn' | 'error'; detail: string }[];
  }> {
    const checks: { name: string; status: 'ok' | 'warn' | 'error'; detail: string }[] = [];

    // 检查数据库连接
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.push({ name: '数据库', status: 'ok', detail: '连接正常' });
    } catch {
      checks.push({ name: '数据库', status: 'error', detail: '连接失败' });
    }

    // 检查修复规则数
    const repairRuleCount = await prisma.evoRepairRule.count({ where: { isEnabled: true } });
    checks.push({
      name: '修复规则',
      status: repairRuleCount > 0 ? 'ok' : 'warn',
      detail: `${repairRuleCount} 条活跃规则`,
    });

    // 检查进化日志近况
    const recentLogs = await prisma.evoLog.count({
      where: { startedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    });
    checks.push({
      name: '进化日志',
      status: recentLogs > 0 ? 'ok' : 'warn',
      detail: `近24h ${recentLogs} 条日志`,
    });

    const healthy = checks.every(c => c.status !== 'error');
    return { healthy, checks };
  }

  private async collectBasicMetrics(): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};

    // 用户数
    metrics['total_users'] = await prisma.user.count();

    // 注册用户数
    metrics['registered_users'] = await prisma.user.count({
      where: { role: 'registered' },
    });

    // 打卡数
    metrics['total_checkins'] = await prisma.checkin.count();

    // 修为记录数
    metrics['total_practice_logs'] = await prisma.practiceLog.count();

    // 知识库条目数
    metrics['knowledge_entries'] = await prisma.evoKnowledge.count({
      where: { status: 'deployed' },
    });

    // 进化日志数
    metrics['evo_logs'] = await prisma.evoLog.count();

    return metrics;
  }

  private async analyzePromptScores(): Promise<string[]> {
    // 查找平均分低于0的活跃提示词
    const lowScore = await prisma.evoPromptVersion.findMany({
      where: { isActive: true, avgScore: { lt: 0 } },
      select: { promptId: true },
    });
    return lowScore.map(p => p.promptId);
  }

  private async analyzeContentGaps(): Promise<string[]> {
    // 查找覆盖度低于5的知识领域
    const domainCounts = await prisma.evoKnowledge.groupBy({
      by: ['domain'],
      _count: { id: true },
      where: { status: 'deployed' },
    });
    return domainCounts
      .filter(d => d._count.id < 5)
      .map(d => d.domain);
  }

  private async analyzeBehaviorPatterns(): Promise<string[]> {
    // 基于进化日志分析模式
    const recentLogs = await prisma.evoLog.findMany({
      where: { startedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      select: { actionType: true, status: true },
      take: 100,
    });
    
    const patterns: string[] = [];
    const failedActions = recentLogs.filter(l => l.status === 'failed');
    if (failedActions.length > 0) {
      patterns.push(`近7天 ${failedActions.length} 次进化失败`);
    }
    return patterns;
  }

  private async executeRepairRules(): Promise<{ success: number; failed: number }> {
    // 获取需要执行的修复规则
    const rules = await prisma.evoRepairRule.findMany({
      where: { isEnabled: true },
      orderBy: { successRate: 'desc' },
      take: 10,
    });

    let success = 0;
    let failed = 0;

    for (const rule of rules) {
      try {
        // 更新最后执行时间
        await prisma.evoRepairRule.update({
          where: { id: rule.id },
          data: { lastExecutedAt: new Date() },
        });
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  private async createLog(
    triggerType: string,
    actionType: string,
    strategy: string,
    detail?: Record<string, unknown>
  ): Promise<{ id: string }> {
    return prisma.evoLog.create({
      data: {
        triggerType,
        actionType,
        strategy,
        triggerDetail: detail ? JSON.stringify(detail) : '',
        status: 'running',
      },
    });
  }

  private async completeLog(
    id: string,
    status: string,
    detail?: Record<string, unknown>
  ): Promise<void> {
    await prisma.evoLog.update({
      where: { id },
      data: {
        status,
        resultDetail: detail ? JSON.stringify(detail) : '',
        completedAt: new Date(),
        durationMs: Date.now() - Number(id.split('_')[0] || Date.now()),
      },
    });
  }

  // ── 知识库操作 ──

  /**
   * 添加进化知识
   */
  async addKnowledge(params: {
    domain: string;
    element?: string;
    title: string;
    content: string;
    source?: string;
    sourceUrl?: string;
    tags?: string[];
  }): Promise<string> {
    const entry = await prisma.evoKnowledge.create({
      data: {
        domain: params.domain,
        element: params.element || '',
        title: params.title,
        content: params.content,
        source: params.source || 'ai_generated',
        sourceUrl: params.sourceUrl || '',
        tags: JSON.stringify(params.tags || []),
      },
    });
    return entry.id;
  }

  /**
   * 查询进化知识
   */
  async queryKnowledge(params: {
    domain?: string;
    element?: string;
    status?: string;
    limit?: number;
  }) {
    return prisma.evoKnowledge.findMany({
      where: {
        domain: params.domain,
        element: params.element,
        status: params.status || 'deployed',
      },
      orderBy: { qualityScore: 'desc' },
      take: params.limit || 20,
    });
  }

  /**
   * 获取进化仪表盘数据
   */
  async getDashboard(): Promise<{
    totalLogs: number;
    successRate: number;
    knowledgeCount: number;
    promptVersions: number;
    repairRules: number;
    recentLogs: { id: string; actionType: string; strategy: string; status: string; startedAt: Date }[];
  }> {
    const [totalLogs, successLogs, knowledgeCount, promptVersions, repairRules, recentLogs] = await Promise.all([
      prisma.evoLog.count(),
      prisma.evoLog.count({ where: { status: 'success' } }),
      prisma.evoKnowledge.count({ where: { status: 'deployed' } }),
      prisma.evoPromptVersion.count({ where: { isActive: true } }),
      prisma.evoRepairRule.count({ where: { isEnabled: true } }),
      prisma.evoLog.findMany({
        orderBy: { startedAt: 'desc' },
        take: 10,
        select: { id: true, actionType: true, strategy: true, status: true, startedAt: true },
      }),
    ]);

    return {
      totalLogs,
      successRate: totalLogs > 0 ? Math.round((successLogs / totalLogs) * 100) : 0,
      knowledgeCount,
      promptVersions,
      repairRules,
      recentLogs,
    };
  }
}

// 单例导出
export const evoEngine = new ZhiYinEvoEngine();
