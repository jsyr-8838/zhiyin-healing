import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/content-version
 * 
 * 返回内容版本信息，包括：
 * - 静态题库版本（编译时确定）
 * - 动态题库数量和最后更新时间
 * - 知识库条目数
 * 
 * 用于前端显示"题库v2.3 · 最近更新：2025-08-26"增强信任
 */

// 静态版本号（每次部署时变化）
const STATIC_VERSION = '2.3.0';

export async function GET() {
  try {
    // 并行查询动态内容指标
    const [dynQuizCount, knowledgeCount, lastKnowledgeUpdate] = await Promise.all([
      db.findOne<{ count: number }>(
        "SELECT COUNT(*) as count FROM EvoKnowledge WHERE domain = 'tcm_quiz' AND status = 'deployed'"
      ).catch(() => ({ count: 0 })),
      db.findOne<{ count: number }>(
        "SELECT COUNT(*) as count FROM EvoKnowledge WHERE status = 'deployed'"
      ).catch(() => ({ count: 0 })),
      db.findOne<{ updatedAt: string }>(
        "SELECT updatedAt FROM EvoKnowledge WHERE status = 'deployed' ORDER BY updatedAt DESC LIMIT 1"
      ).catch(() => ({ updatedAt: null })),
    ]);

    return NextResponse.json({
      version: STATIC_VERSION,
      staticQuizCount: 3000,
      dynamicQuizCount: dynQuizCount?.count ?? 0,
      knowledgeCount: knowledgeCount?.count ?? 0,
      lastUpdated: lastKnowledgeUpdate?.updatedAt || null,
      generatedAt: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      version: STATIC_VERSION,
      staticQuizCount: 3000,
      dynamicQuizCount: 0,
      knowledgeCount: 0,
      lastUpdated: null,
      generatedAt: new Date().toISOString(),
    });
  }
}
