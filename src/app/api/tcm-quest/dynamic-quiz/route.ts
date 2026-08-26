import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import type { QuizItem, QuizTag } from '@/lib/tcm-quest/types';

/**
 * GET /api/tcm-quest/dynamic-quiz
 * 
 * 从 EvoKnowledge 表中获取已部署的动态题目
 * 这些题目由进化引擎生成/审核后，以 QuizItem 格式存入 EvoKnowledge
 * 
 * 查询参数：
 *   tag  — 按科目筛选（可选）
 *   limit — 返回数量（默认20，最大50）
 *   since — 只返回此时间之后更新的题目（ISO string，可选）
 * 
 * 返回格式与静态题库一致：QuizItem[]
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get('tag');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const since = searchParams.get('since');

    // 从 EvoKnowledge 查询 domain 为 tcm_quiz 的已部署知识
    let sql = "SELECT * FROM EvoKnowledge WHERE domain = 'tcm_quiz' AND status = 'deployed'";
    const params: unknown[] = [];

    if (tag) {
      sql += ' AND element = ?';
      params.push(tag);
    }

    if (since) {
      sql += ' AND updatedAt > ?';
      params.push(since);
    }

    sql += ' ORDER BY qualityScore DESC, usageCount DESC LIMIT ?';
    params.push(limit);

    const rows = await db.findAll<{
      id: string;
      title: string;
      content: string;
      metadata: string;
      tags: string;
      qualityScore: number;
      usageCount: number;
      updatedAt: string;
    }>(sql, params);

    // 将 EvoKnowledge 行转换为 QuizItem 格式
    // metadata 中应存储完整的题目数据：{ q, o, a, e, xp, diff, tag }
    const quizzes: QuizItem[] = [];

    for (const row of rows) {
      try {
        const meta = JSON.parse(row.metadata || '{}');
        if (!meta.q || !meta.o || meta.a === undefined) continue;

        // 验证格式
        if (!Array.isArray(meta.o) || meta.o.length !== 4) continue;
        if (typeof meta.a !== 'number' || meta.a < 0 || meta.a > 3) continue;

        quizzes.push({
          id: `dyn_${row.id}`,
          tag: (meta.tag || '经典') as QuizTag,
          q: meta.q,
          o: meta.o as [string, string, string, string],
          a: meta.a,
          e: meta.e || row.content || '',
          xp: meta.xp || 5,
          diff: meta.diff || '中级',
        });
      } catch {
        // 跳过格式错误的数据
        continue;
      }
    }

    // 增加使用计数
    if (quizzes.length > 0) {
      const ids = quizzes.map(q => q.id.replace('dyn_', ''));
      for (const id of ids) {
        db.execute(
          'UPDATE EvoKnowledge SET usageCount = usageCount + 1 WHERE id = ?',
          [id]
        ).catch(() => {});
      }
    }

    return NextResponse.json({
      quizzes,
      count: quizzes.length,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Dynamic Quiz] Error:', error);
    return NextResponse.json(
      { error: '获取动态题目失败', quizzes: [], count: 0 },
      { status: 500 }
    );
  }
}
