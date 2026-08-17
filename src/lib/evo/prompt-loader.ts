/**
 * 知音进化系统 — 提示词动态加载器
 * 
 * 职责：从 EvoPromptVersion 表加载最新活跃版本的提示词
 * 降级策略：数据库不可用时回退到代码中的硬编码常量
 */

import { prisma } from '@/lib/prisma';

// ── 提示词 ID 常量 ──
export const PROMPT_IDS = {
  AI_DIAGNOSIS: 'ai-diagnosis',
  TONGUE_ANALYSIS: 'tongue-analysis',
  DIVINATION: 'divination-interpretation',
} as const;

// ── 内存缓存 ──
const promptCache = new Map<string, { prompt: string; loadedAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

/**
 * 从 EvoPromptVersion 表加载最新活跃提示词
 * 如果数据库不可用或没有部署版本，返回 null
 */
export async function loadActivePrompt(promptId: string): Promise<string | null> {
  // 检查缓存
  const cached = promptCache.get(promptId);
  if (cached && Date.now() - cached.loadedAt < CACHE_TTL) {
    return cached.prompt;
  }

  try {
    const version = await prisma.evoPromptVersion.findFirst({
      where: { promptId, isActive: true },
      orderBy: { version: 'desc' },
      select: { systemPrompt: true, version: true },
    });

    if (version) {
      // 更新缓存
      promptCache.set(promptId, { prompt: version.systemPrompt, loadedAt: Date.now() });
      return version.systemPrompt;
    }
  } catch (err) {
    console.warn(`[EvoPromptLoader] 加载提示词 ${promptId} 失败:`, err);
  }

  return null;
}

/**
 * 加载提示词，带降级回退
 * 优先从进化系统加载，失败则使用传入的 fallback
 */
export async function loadPromptWithFallback(
  promptId: string,
  fallback: string
): Promise<string> {
  const prompt = await loadActivePrompt(promptId);
  return prompt || fallback;
}

/**
 * 清除缓存（部署新版本后调用）
 */
export function clearPromptCache(promptId?: string): void {
  if (promptId) {
    promptCache.delete(promptId);
  } else {
    promptCache.clear();
  }
}
