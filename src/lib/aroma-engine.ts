/**
 * 香气基因推荐引擎
 * 抽取自 aroma-recommender 核心算法，适配108精油五行经络体系
 * 
 * 算法流程：
 * 1. 用户回答5道感知题 → 加权聚合为6维香气向量
 * 2. 余弦相似度匹配6种香气人格 → 取最优
 * 3. 按5行+5行权重筛选108精油 → 余弦排序+场景加分 → TOP3
 */

import { essenceOils } from './essence-data';
import type { EssenceOil } from './essence-data';

// ==================== 类型定义 ====================

export interface AromaVector {
  sweet: number;   // 甘甜度
  woody: number;   // 木质感
  cool: number;    // 清凉感
  milk: number;    // 奶甜韵
  spicy: number;   // 辛香度
  fruity: number;  // 果香感
}

export interface QuizOption {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  vector: AromaVector;
  color?: string;
  sceneTags?: string[];
}

export interface QuizQuestion {
  id: string;
  step: string;
  title: string;
  subtitle: string;
  type: 'single' | 'color';
  layout: 'cols-1' | 'cols-2';
  options: QuizOption[];
}

export interface AromaPersonality {
  icon: string;
  name: string;
  color: string;
  desc: string;
  traits: string[];
  coreVector: AromaVector;
}

export interface AromaRecommendation {
  oil: EssenceOil;
  score: number;
  matchPct: number;
  reason: string;
}

export interface AromaQuizResult {
  userVector: AromaVector;
  personality: AromaPersonality;
  recommendations: AromaRecommendation[];
  sceneTags: string[];
}

// ==================== 香气维度标签 ====================

export const AROMA_LABELS: Record<keyof AromaVector, { name: string; emoji: string }> = {
  sweet:  { name: '甘甜度', emoji: '🍯' },
  woody:  { name: '木质感', emoji: '🪵' },
  cool:   { name: '清凉感', emoji: '❄️' },
  milk:   { name: '奶甜韵', emoji: '🥛' },
  spicy:  { name: '辛香度', emoji: '🌶️' },
  fruity: { name: '果香感', emoji: '🍑' },
};

// ==================== 问卷数据（5题） ====================

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'mood',
    step: '第一题 · 情绪感知',
    title: '此刻，你的内心状态更像哪首歌？',
    subtitle: '选一个最接近你当下感受的',
    type: 'single',
    layout: 'cols-1',
    options: [
      { id: 'relax', emoji: '🌅', label: '《彩虹》——有点疲惫，渴望温暖与慰藉', desc: '需要放松、被治愈的感觉', vector: { sweet: 0.9, woody: 0.6, cool: 0.1, milk: 0.8, spicy: 0.1, fruity: 0.3 } },
      { id: 'focus', emoji: '☀️', label: '《晴天》——清爽愉快，充满能量与专注', desc: '需要清醒、高效工作的状态', vector: { sweet: 0.3, woody: 0.7, cool: 0.8, milk: 0.2, spicy: 0.6, fruity: 0.5 } },
      { id: 'meditate', emoji: '🌙', label: '《夜曲》——内敛沉静，享受独处与冥想', desc: '需要安静、深度思考的时刻', vector: { sweet: 0.4, woody: 0.9, cool: 0.2, milk: 0.5, spicy: 0.3, fruity: 0.1 } },
      { id: 'social', emoji: '🎉', label: '《稻香》——自然朴实，享受当下的简单快乐', desc: '轻松愉悦，喜欢分享与陪伴', vector: { sweet: 0.7, woody: 0.5, cool: 0.4, milk: 0.4, spicy: 0.2, fruity: 0.8 } },
    ],
  },
  {
    id: 'color',
    step: '第二题 · 颜色联觉',
    title: '哪种颜色最能打动你的心？',
    subtitle: '颜色偏好映射你的香气基因',
    type: 'color',
    layout: 'cols-2',
    options: [
      { id: 'deep_ocean', emoji: '', color: 'linear-gradient(135deg, #1a3a5c, #2d6a8a)', label: '深海蓝', desc: '沉稳、内敛、深邃', vector: { sweet: 0.3, woody: 0.9, cool: 0.5, milk: 0.4, spicy: 0.4, fruity: 0.1 } },
      { id: 'warm_amber', emoji: '', color: 'linear-gradient(135deg, #C9963A, #E8B96A)', label: '琥珀金', desc: '温暖、富足、甘甜', vector: { sweet: 0.9, woody: 0.6, cool: 0.1, milk: 0.8, spicy: 0.2, fruity: 0.4 } },
      { id: 'forest_green', emoji: '', color: 'linear-gradient(135deg, #2d5a3d, #6DA87A)', label: '深林绿', desc: '自然、清新、生命力', vector: { sweet: 0.4, woody: 0.8, cool: 0.7, milk: 0.2, spicy: 0.5, fruity: 0.6 } },
      { id: 'misty_purple', emoji: '', color: 'linear-gradient(135deg, #6b5b8e, #b09cc8)', label: '云雾紫', desc: '神秘、浪漫、空灵', vector: { sweet: 0.6, woody: 0.7, cool: 0.6, milk: 0.7, spicy: 0.1, fruity: 0.3 } },
      { id: 'ivory_cream', emoji: '', color: 'linear-gradient(135deg, #f0e6d0, #faf3e8)', label: '象牙白', desc: '纯净、雅致、温柔', vector: { sweet: 0.7, woody: 0.5, cool: 0.3, milk: 0.9, spicy: 0.1, fruity: 0.5 } },
      { id: 'ink_black', emoji: '', color: 'linear-gradient(135deg, #1a0e06, #3d2010)', label: '墨沉黑', desc: '极致、稀有、收藏级', vector: { sweet: 0.2, woody: 1.0, cool: 0.2, milk: 0.3, spicy: 0.6, fruity: 0.0 } },
    ],
  },
  {
    id: 'scene',
    step: '第三题 · 使用场景',
    title: '你最想在哪个场景用香？',
    subtitle: '可以选择最主要的一种',
    type: 'single',
    layout: 'cols-2',
    options: [
      { id: 'sleep', emoji: '🛌', label: '睡前助眠', desc: '让香气抚平一天的疲惫', sceneTags: ['🌙 睡前30分钟', '🕯️ 卧室营造', '😴 深度睡眠'], vector: { sweet: 0.8, woody: 0.5, cool: 0.1, milk: 0.9, spicy: 0.1, fruity: 0.3 } },
      { id: 'work', emoji: '💼', label: '工作专注', desc: '清醒头脑，提升效率', sceneTags: ['☕ 晨间启动', '📚 书房伴侣', '🎯 高效专注'], vector: { sweet: 0.2, woody: 0.8, cool: 0.9, milk: 0.1, spicy: 0.7, fruity: 0.3 } },
      { id: 'meditate', emoji: '🧘', label: '冥想打坐', desc: '净化空间，收摄身心', sceneTags: ['🌿 冥想空间', '🙏 禅意修行', '✨ 净化气场'], vector: { sweet: 0.3, woody: 1.0, cool: 0.3, milk: 0.4, spicy: 0.2, fruity: 0.0 } },
      { id: 'tea', emoji: '🍵', label: '茶道品茗', desc: '以香入茶，雅致生活', sceneTags: ['🍵 茶桌相伴', '🎨 艺术氛围', '🌸 雅集分享'], vector: { sweet: 0.6, woody: 0.8, cool: 0.4, milk: 0.5, spicy: 0.3, fruity: 0.4 } },
      { id: 'gift', emoji: '🎁', label: '送礼收藏', desc: '有品位的高端礼品', sceneTags: ['🎁 商务礼赠', '💎 收藏价值', '🏆 品质象征'], vector: { sweet: 0.4, woody: 0.9, cool: 0.3, milk: 0.5, spicy: 0.5, fruity: 0.2 } },
      { id: 'daily', emoji: '🏠', label: '日常居家', desc: '让家充满温馨香气', sceneTags: ['🏠 日常空间', '🌅 早晚仪式', '💆 身心舒缓'], vector: { sweet: 0.7, woody: 0.6, cool: 0.4, milk: 0.6, spicy: 0.2, fruity: 0.5 } },
    ],
  },
  {
    id: 'music',
    step: '第四题 · 音乐感知',
    title: '你的耳机里最常播放哪类音乐？',
    subtitle: '音乐品味与香气偏好高度相关',
    type: 'single',
    layout: 'cols-2',
    options: [
      { id: 'jazz_classic', emoji: '🎷', label: '爵士 / 古典', desc: '层次丰富，复杂精妙', vector: { sweet: 0.5, woody: 0.9, cool: 0.3, milk: 0.6, spicy: 0.5, fruity: 0.2 } },
      { id: 'folk_acoustic', emoji: '🎸', label: '民谣 / 轻音乐', desc: '自然纯朴，贴近生活', vector: { sweet: 0.7, woody: 0.7, cool: 0.5, milk: 0.4, spicy: 0.2, fruity: 0.7 } },
      { id: 'electronic_pop', emoji: '🎧', label: '电子 / 流行', desc: '活力四射，时尚潮流', vector: { sweet: 0.6, woody: 0.3, cool: 0.8, milk: 0.3, spicy: 0.4, fruity: 0.8 } },
      { id: 'meditation_ambient', emoji: '🔔', label: '冥想 / 空灵音', desc: '内观静默，超越时空', vector: { sweet: 0.3, woody: 1.0, cool: 0.4, milk: 0.5, spicy: 0.1, fruity: 0.0 } },
    ],
  },
  {
    id: 'wuxing',
    step: '第五题 · 五行偏好',
    title: '你当下最渴望哪种自然力量？',
    subtitle: '五行能量映射你的体质与疗愈方向',
    type: 'single',
    layout: 'cols-1',
    options: [
      { id: 'mu', emoji: '🌿', label: '木 · 生发生长', desc: '如春日嫩芽破土，渴望突破与创新', vector: { sweet: 0.5, woody: 0.6, cool: 0.3, milk: 0.3, spicy: 0.2, fruity: 0.9 } },
      { id: 'huo', emoji: '🔥', label: '火 · 温热炎上', desc: '如夏日骄阳似火，渴望激情与表达', vector: { sweet: 0.8, woody: 0.5, cool: 0.1, milk: 0.6, spicy: 0.9, fruity: 0.4 } },
      { id: 'tu', emoji: '🏔️', label: '土 · 孕育承载', desc: '如大地滋养万物，渴望安稳与包容', vector: { sweet: 0.7, woody: 0.4, cool: 0.2, milk: 0.9, spicy: 0.1, fruity: 0.5 } },
      { id: 'jin', emoji: '⚔️', label: '金 · 清肃收敛', desc: '如秋风肃杀落叶，渴望整理与决断', vector: { sweet: 0.2, woody: 0.9, cool: 0.8, milk: 0.2, spicy: 0.7, fruity: 0.1 } },
      { id: 'shui', emoji: '🌊', label: '水 · 润下藏精', desc: '如冬水归藏地下，渴望宁静与蓄力', vector: { sweet: 0.3, woody: 0.7, cool: 0.6, milk: 0.7, spicy: 0.2, fruity: 0.2 } },
    ],
  },
];

// ==================== 香气人格体系 ====================

export const AROMA_PERSONALITIES: AromaPersonality[] = [
  { icon: '🌙', name: '沉静探索者', color: '#2C1A0E', desc: '你有着深邃的内心世界，偏爱内敛而有层次的香气。在沉香的醇厚木质香中，你找到了自己独处时的安宁与智慧。', traits: ['深度冥想', '内观独处', '品质收藏'], coreVector: { sweet: 0.4, woody: 0.95, cool: 0.3, milk: 0.5, spicy: 0.3, fruity: 0.1 } },
  { icon: '🌅', name: '温润治愈者', color: '#8B5E3C', desc: '你有着温暖包容的心，香气对你而言是情绪的抚慰剂。甜润的蜜香与奶香让你放松，是最懂你的生活伴侣。', traits: ['情绪疗愈', '睡眠助眠', '温暖陪伴'], coreVector: { sweet: 0.9, woody: 0.55, cool: 0.1, milk: 0.9, spicy: 0.1, fruity: 0.4 } },
  { icon: '☀️', name: '清新活力派', color: '#3D6B4F', desc: '你充满活力与创造力，喜欢清爽提神的香气氛围。清凉的果香与辛香让你头脑清醒，随时保持最佳状态。', traits: ['高效专注', '清醒提神', '积极生活'], coreVector: { sweet: 0.45, woody: 0.55, cool: 0.85, milk: 0.2, spicy: 0.65, fruity: 0.8 } },
  { icon: '🍵', name: '雅致品鉴家', color: '#5C3317', desc: '你对生活有着极高的审美标准，香气是你精致生活方式的重要组成。在茶道与香道的结合中，你体验东方文化的精髓。', traits: ['茶道文化', '雅致审美', '精品收藏'], coreVector: { sweet: 0.6, woody: 0.82, cool: 0.4, milk: 0.6, spicy: 0.35, fruity: 0.35 } },
  { icon: '✨', name: '神秘感性者', color: '#6b5b8e', desc: '你有着敏锐的感官与浪漫的灵魂，被复杂而神秘的香气所吸引。奇楠与极品沉水的层次变化，正是你内心丰富世界的映射。', traits: ['感官敏锐', '层次丰富', '顶级珍稀'], coreVector: { sweet: 0.65, woody: 0.85, cool: 0.6, milk: 0.7, spicy: 0.45, fruity: 0.25 } },
  { icon: '🌿', name: '自然生活家', color: '#3D6B4F', desc: '你热爱自然，生活简单而充实。果甜清新的香气让你时刻感受大自然的馈赠，香气是你日常生活美学的一部分。', traits: ['自然清新', '日常生活', '简单愉悦'], coreVector: { sweet: 0.72, woody: 0.58, cool: 0.55, milk: 0.4, spicy: 0.2, fruity: 0.82 } },
];

// ==================== 核心算法 ====================

/** 余弦相似度 */
export function cosineSimilarity(a: AromaVector, b: AromaVector): number {
  const dims = Object.keys(a) as (keyof AromaVector)[];
  let dot = 0, magA = 0, magB = 0;
  for (const d of dims) {
    const av = a[d] || 0, bv = b[d] || 0;
    dot  += av * bv;
    magA += av * av;
    magB += bv * bv;
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) + 1e-8);
}

/** 五行→香气向量映射（用于为108精油生成向量） */
const WUXING_VECTOR: Record<string, AromaVector> = {
  '木': { sweet: 0.5, woody: 0.65, cool: 0.35, milk: 0.3, spicy: 0.25, fruity: 0.85 },
  '火': { sweet: 0.75, woody: 0.5, cool: 0.15, milk: 0.55, spicy: 0.85, fruity: 0.45 },
  '土': { sweet: 0.7, woody: 0.45, cool: 0.25, milk: 0.85, spicy: 0.15, fruity: 0.5 },
  '金': { sweet: 0.25, woody: 0.9, cool: 0.75, milk: 0.25, spicy: 0.65, fruity: 0.15 },
  '水': { sweet: 0.35, woody: 0.75, cool: 0.55, milk: 0.65, spicy: 0.2, fruity: 0.2 },
};

/** 根据精油属性计算香气向量 */
function getOilVector(oil: EssenceOil): AromaVector {
  const base = WUXING_VECTOR[oil.wuxing] || WUXING_VECTOR['土'];
  const yangRatio = oil.yangValue / 6;
  const yinRatio = oil.yinValue / 6;
  return {
    sweet:  Math.min(1, base.sweet  + yinRatio * 0.15),
    woody:  Math.min(1, base.woody  + (1 - yangRatio) * 0.08),
    cool:   Math.min(1, base.cool   + yangRatio * 0.15),
    milk:   Math.min(1, base.milk   + yinRatio * 0.12),
    spicy:  Math.min(1, base.spicy  + yangRatio * 0.12),
    fruity: Math.min(1, base.fruity + (yangRatio + yinRatio > 0.6 ? 0.08 : -0.05)),
  };
}

const QUESTION_WEIGHTS: Record<string, number> = {
  mood: 0.25, color: 0.20, scene: 0.20, music: 0.15, wuxing: 0.20,
};

/** 核心推荐计算 */
export function computeAromaRecommendation(answers: Record<string, string>): AromaQuizResult {
  const dims = Object.keys(AROMA_LABELS) as (keyof AromaVector)[];
  const userVector: AromaVector = { sweet: 0, woody: 0, cool: 0, milk: 0, spicy: 0, fruity: 0 };

  let totalWeight = 0;
  for (const q of QUIZ_QUESTIONS) {
    const w = QUESTION_WEIGHTS[q.id] || 0.15;
    const opt = q.options.find(o => o.id === answers[q.id]);
    if (!opt) continue;
    for (const d of dims) {
      userVector[d] += (opt.vector[d] || 0) * w;
    }
    totalWeight += w;
  }
  if (totalWeight > 0) {
    for (const d of dims) userVector[d] /= totalWeight;
  }

  let bestPersonality = AROMA_PERSONALITIES[0];
  let bestScore = -1;
  for (const p of AROMA_PERSONALITIES) {
    const score = cosineSimilarity(userVector, p.coreVector);
    if (score > bestScore) {
      bestScore = score;
      bestPersonality = p;
    }
  }

  const sceneAnswer = answers['scene'];
  const scored = essenceOils.map(oil => {
    const oilVec = getOilVector(oil);
    let score = cosineSimilarity(userVector, oilVec);
    if (bestPersonality.traits.includes('深度冥想') && oil.wuxing === '水') score += 0.08;
    if (bestPersonality.traits.includes('情绪疗愈') && oil.wuxing === '火') score += 0.06;
    if (bestPersonality.traits.includes('清醒提神') && oil.wuxing === '金') score += 0.06;
    if (bestPersonality.traits.includes('茶道文化') && oil.wuxing === '木') score += 0.06;
    if (bestPersonality.traits.includes('自然清新') && oil.wuxing === '木') score += 0.06;
    if (bestPersonality.traits.includes('精品收藏') && oil.wuxing === '金') score += 0.05;
    if (sceneAnswer === 'sleep' && oil.yinValue >= 4) score += 0.05;
    if (sceneAnswer === 'work' && oil.yangValue >= 4) score += 0.05;
    if (sceneAnswer === 'meditate' && (oil.wuxing === '水' || oil.wuxing === '金')) score += 0.05;
    if (sceneAnswer === 'tea' && oil.wuxing === '木') score += 0.05;

    return { oil, score: Math.min(score, 0.99) };
  });

  scored.sort((a, b) => b.score - a.score);
  const top3 = scored.slice(0, 3);

  const wuxingNames: Record<string, string> = { '木': '木行·生发', '火': '火行·温养', '土': '土行·运化', '金': '金行·收敛', '水': '水行·藏精' };
  const recommendations: AromaRecommendation[] = top3.map((item, i) => {
    const matchPct = Math.round(item.score * 85 + 10);
    const reasons = [
      `${wuxingNames[item.oil.wuxing]}能量与您${bestPersonality.name}的气质深度共鸣`,
      `${item.oil.meridian}关联情志与您的香气基因高度匹配`,
      `阳${item.oil.yangValue}/阴${item.oil.yinValue}配比契合您当前的身心状态`,
    ];
    return {
      oil: item.oil,
      score: item.score,
      matchPct,
      reason: reasons[i] || reasons[0],
    };
  });

  const sceneOpt = QUIZ_QUESTIONS.find(q => q.id === 'scene')?.options.find(o => o.id === sceneAnswer);
  const sceneTags = sceneOpt?.sceneTags || ['🏠 日常居家', '🌅 早晚仪式', '💆 身心舒缓'];

  return { userVector, personality: bestPersonality, recommendations, sceneTags };
}
