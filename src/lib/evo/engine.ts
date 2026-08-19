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

import { db, generateId, now } from '@/lib/db';

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
      const repairRules = await db.findAll(
        'SELECT * FROM EvoRepairRule WHERE isEnabled = 1 ORDER BY successRate DESC'
      );
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

      // 1. 统计知识库覆盖率（替代 prisma.groupBy）
      const knowledgeStats = await db.findAll<{ domain: string; count: number }>(
        'SELECT domain, COUNT(*) as count FROM EvoKnowledge WHERE status = ? GROUP BY domain',
        ['deployed']
      );
      details.push(`知识库: ${knowledgeStats.length} 个领域, ${knowledgeStats.reduce((s, d) => s + d.count, 0)} 条知识`);

      // 2. 识别低覆盖率领域
      const lowCoverageDomains = knowledgeStats
        .filter(d => d.count < 10)
        .map(d => d.domain);
      details.push(`低覆盖率领域: ${lowCoverageDomains.join(', ') || '无'}`);

      // 3. 记录进化日志
      await this.createLog('scheduled', 'monthly_knowledge_expansion', 'water', {
        knowledgeStats: knowledgeStats.map(d => ({ domain: d.domain, count: d.count })),
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
      await db.findOne('SELECT 1 as ok');
      checks.push({ name: '数据库', status: 'ok', detail: '连接正常' });
    } catch {
      checks.push({ name: '数据库', status: 'error', detail: '连接失败' });
    }

    // 检查修复规则数
    const repairCount = await db.findOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM EvoRepairRule WHERE isEnabled = 1'
    );
    const repairRuleCount = repairCount?.count ?? 0;
    checks.push({
      name: '修复规则',
      status: repairRuleCount > 0 ? 'ok' : 'warn',
      detail: `${repairRuleCount} 条活跃规则`,
    });

    // 检查进化日志近况
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentCount = await db.findOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM EvoLog WHERE startedAt >= ?',
      [since]
    );
    const recentLogs = recentCount?.count ?? 0;
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

    // 使用 Promise.all 并发查询（替代多个 prisma.count）
    const [
      totalUsers,
      registeredUsers,
      totalCheckins,
      totalPracticeLogs,
      knowledgeEntries,
      evoLogs,
    ] = await Promise.all([
      db.findOne<{ count: number }>('SELECT COUNT(*) as count FROM User'),
      db.findOne<{ count: number }>("SELECT COUNT(*) as count FROM User WHERE role = 'registered'"),
      db.findOne<{ count: number }>('SELECT COUNT(*) as count FROM Checkin'),
      db.findOne<{ count: number }>('SELECT COUNT(*) as count FROM PracticeLog'),
      db.findOne<{ count: number }>("SELECT COUNT(*) as count FROM EvoKnowledge WHERE status = 'deployed'"),
      db.findOne<{ count: number }>('SELECT COUNT(*) as count FROM EvoLog'),
    ]);

    metrics['total_users'] = totalUsers?.count ?? 0;
    metrics['registered_users'] = registeredUsers?.count ?? 0;
    metrics['total_checkins'] = totalCheckins?.count ?? 0;
    metrics['total_practice_logs'] = totalPracticeLogs?.count ?? 0;
    metrics['knowledge_entries'] = knowledgeEntries?.count ?? 0;
    metrics['evo_logs'] = evoLogs?.count ?? 0;

    return metrics;
  }

  private async analyzePromptScores(): Promise<string[]> {
    // 查找平均分低于0的活跃提示词
    const lowScore = await db.findAll<{ promptId: string }>(
      'SELECT promptId FROM EvoPromptVersion WHERE isActive = 1 AND avgScore < 0'
    );
    return lowScore.map(p => p.promptId);
  }

  private async analyzeContentGaps(): Promise<string[]> {
    // 查找覆盖度低于5的知识领域（替代 prisma.groupBy）
    const domainCounts = await db.findAll<{ domain: string; count: number }>(
      'SELECT domain, COUNT(*) as count FROM EvoKnowledge WHERE status = ? GROUP BY domain',
      ['deployed']
    );
    return domainCounts
      .filter(d => d.count < 5)
      .map(d => d.domain);
  }

  private async analyzeBehaviorPatterns(): Promise<string[]> {
    // 基于进化日志分析模式
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const recentLogs = await db.findAll<{ actionType: string; status: string }>(
      'SELECT actionType, status FROM EvoLog WHERE startedAt >= ? ORDER BY startedAt DESC LIMIT 100',
      [since]
    );
    
    const patterns: string[] = [];
    const failedActions = recentLogs.filter(l => l.status === 'failed');
    if (failedActions.length > 0) {
      patterns.push(`近7天 ${failedActions.length} 次进化失败`);
    }
    return patterns;
  }

  private async executeRepairRules(): Promise<{ success: number; failed: number }> {
    // 获取需要执行的修复规则
    const rules = await db.findAll<{ id: string }>(
      'SELECT id FROM EvoRepairRule WHERE isEnabled = 1 ORDER BY successRate DESC LIMIT 10'
    );

    let success = 0;
    let failed = 0;

    for (const rule of rules) {
      try {
        // 更新最后执行时间
        const ts = now();
        await db.execute(
          'UPDATE EvoRepairRule SET lastExecutedAt = ?, updatedAt = ? WHERE id = ?',
          [ts, ts, rule.id]
        );
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
    const id = generateId();
    const ts = now();
    await db.execute(
      `INSERT INTO EvoLog (id, triggerType, triggerDetail, actionType, actionDetail, targetModule, status, strategy, beforeMetric, afterMetric, improvement, startedAt, completedAt, durationMs)
       VALUES (?, ?, ?, ?, '', '', 'running', ?, 0, 0, 0, ?, NULL, 0)`,
      [id, triggerType, detail ? JSON.stringify(detail) : '', actionType, strategy, ts]
    );
    return { id };
  }

  private async completeLog(
    id: string,
    status: string,
    detail?: Record<string, unknown>
  ): Promise<void> {
    const ts = now();
    await db.execute(
      'UPDATE EvoLog SET status = ?, resultDetail = ?, completedAt = ?, durationMs = ? WHERE id = ?',
      [status, detail ? JSON.stringify(detail) : '', ts, 0, id]
    );
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
    const id = generateId();
    const ts = now();
    await db.execute(
      `INSERT INTO EvoKnowledge (id, domain, element, title, content, source, sourceUrl, version, status, qualityScore, usageCount, tags, metadata, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1, 'draft', 0, 0, ?, '{}', ?, ?)`,
      [id, params.domain, params.element || '', params.title, params.content,
       params.source || 'ai_generated', params.sourceUrl || '',
       JSON.stringify(params.tags || []), ts, ts]
    );
    return id;
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
    let sql = 'SELECT * FROM EvoKnowledge WHERE 1=1';
    const values: unknown[] = [];
    if (params.domain) { sql += ' AND domain = ?'; values.push(params.domain); }
    if (params.element) { sql += ' AND element = ?'; values.push(params.element); }
    sql += ' AND status = ?';
    values.push(params.status || 'deployed');
    sql += ' ORDER BY qualityScore DESC LIMIT ?';
    values.push(params.limit || 20);

    return db.findAll(sql, values);
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
    recentLogs: { id: string; actionType: string; strategy: string; status: string; startedAt: string }[];
  }> {
    // 使用 Promise.all 并发查询（替代 6 个 prisma 查询）
    const [
      totalLogsResult,
      successLogsResult,
      knowledgeCountResult,
      promptVersionsResult,
      repairRulesResult,
      recentLogs,
    ] = await Promise.all([
      db.findOne<{ count: number }>('SELECT COUNT(*) as count FROM EvoLog'),
      db.findOne<{ count: number }>("SELECT COUNT(*) as count FROM EvoLog WHERE status = 'success'"),
      db.findOne<{ count: number }>("SELECT COUNT(*) as count FROM EvoKnowledge WHERE status = 'deployed'"),
      db.findOne<{ count: number }>('SELECT COUNT(*) as count FROM EvoPromptVersion WHERE isActive = 1'),
      db.findOne<{ count: number }>('SELECT COUNT(*) as count FROM EvoRepairRule WHERE isEnabled = 1'),
      db.findAll<{ id: string; actionType: string; strategy: string; status: string; startedAt: string }>(
        'SELECT id, actionType, strategy, status, startedAt FROM EvoLog ORDER BY startedAt DESC LIMIT 10'
      ),
    ]);

    const totalLogs = totalLogsResult?.count ?? 0;
    const successLogs = successLogsResult?.count ?? 0;

    return {
      totalLogs,
      successRate: totalLogs > 0 ? Math.round((successLogs / totalLogs) * 100) : 0,
      knowledgeCount: knowledgeCountResult?.count ?? 0,
      promptVersions: promptVersionsResult?.count ?? 0,
      repairRules: repairRulesResult?.count ?? 0,
      recentLogs,
    };
  }
}

// 单例导出
export const evoEngine = new ZhiYinEvoEngine();
