// 健康评分算法 - 移植自 LingSuHealth
// 综合健康分 = 睡眠×0.3 + 情绪×0.25 + 运动×0.25 + 饮食×0.2

/**
 * 睡眠评分（0-100）
 * - 7-8小时 = 100分
 * - 6小时 = 80分，9小时 = 85分
 * - <6 或 >10 递减扣分
 * - 超过23点入睡扣5-15分
 */
export function calcSleepScore(sleepHours: number, bedtime: string = ''): number {
  let score = 0;

  // 基于时长的评分
  if (sleepHours >= 7 && sleepHours <= 8) {
    score = 100;
  } else if (sleepHours >= 6 && sleepHours < 7) {
    score = 80;
  } else if (sleepHours > 8 && sleepHours <= 9) {
    score = 85;
  } else if (sleepHours >= 5 && sleepHours < 6) {
    score = 60;
  } else if (sleepHours > 9 && sleepHours <= 10) {
    score = 65;
  } else if (sleepHours < 5) {
    score = Math.max(20, 60 - (5 - sleepHours) * 10);
  } else {
    score = 50; // >10小时
  }

  // 基于入睡时间的扣分
  if (bedtime) {
    const [hours] = bedtime.split(':').map(Number);
    if (hours >= 23) {
      score -= 5;
    }
    if (hours >= 0 && hours < 1) {
      score -= 10;
    }
    if (hours >= 1) {
      score -= 15;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * 情绪评分（1-5 映射到 0-100）
 * 5=极佳(100), 4=好(80), 3=一般(60), 2=差(40), 1=很差(20)
 */
export function calcMoodScore(mood: number): number {
  return Math.max(0, Math.min(100, mood * 20));
}

/**
 * 运动评分（1-5 映射到 0-100）
 */
export function calcExerciseScore(exercise: number): number {
  return Math.max(0, Math.min(100, exercise * 20));
}

/**
 * 饮食评分（1-5 映射到 0-100）
 */
export function calcDietScore(diet: number): number {
  return Math.max(0, Math.min(100, diet * 20));
}

/**
 * 综合健康评分
 * = 睡眠×0.3 + 情绪×0.25 + 运动×0.25 + 饮食×0.2
 */
export function calcHealthScore(
  sleepScore: number,
  moodScore: number,
  exerciseScore: number,
  dietScore: number
): number {
  return Math.round(
    sleepScore * 0.3 +
    moodScore * 0.25 +
    exerciseScore * 0.25 +
    dietScore * 0.2
  );
}

/**
 * 获取健康等级文案
 */
export function getHealthLevel(score: number): { label: string; color: string; emoji: string } {
  if (score >= 90) return { label: '极佳', color: 'text-emerald-600', emoji: '🌟' };
  if (score >= 75) return { label: '良好', color: 'text-green-600', emoji: '😊' };
  if (score >= 60) return { label: '一般', color: 'text-amber-600', emoji: '😐' };
  if (score >= 40) return { label: '较差', color: 'text-orange-600', emoji: '😟' };
  return { label: '需关注', color: 'text-red-600', emoji: '😰' };
}

/**
 * 获取健康建议
 */
export function getHealthAdvice(sleepScore: number, moodScore: number, exerciseScore: number, dietScore: number): string[] {
  const advice: string[] = [];

  if (sleepScore < 60) {
    advice.push('建议调整作息，23点前入睡，保证7-8小时睡眠');
  }
  if (moodScore < 60) {
    advice.push('情绪波动较大，可尝试角音疏肝或冥想放松');
  }
  if (exerciseScore < 60) {
    advice.push('运动不足，建议每日30分钟中等强度运动');
  }
  if (dietScore < 60) {
    advice.push('饮食不规律，建议定时定量，避免生冷油腻');
  }

  if (advice.length === 0) {
    advice.push('状态良好，继续保持规律作息和积极心态');
  }

  return advice;
}

/**
 * 计算连续打卡天数
 */
export function calcStreakDays(dates: string[]): number {
  if (dates.length === 0) return 0;

  const sorted = [...dates].sort().reverse();
  const today = new Date().toISOString().split('T')[0];

  // 如果最近一次打卡不是今天也不是昨天，连续天数归零
  if (sorted[0] !== today && sorted[0] !== getYesterday(today)) {
    return 0;
  }

  let streak = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] === getYesterday(sorted[i - 1])) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

function getYesterday(dateStr: string): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

// ===== 五行偏颇推算 =====

export interface WuxingTendencies {
  wood: number;   // 木(肝)
  fire: number;   // 火(心)
  earth: number;  // 土(脾)
  metal: number;  // 金(肺)
  water: number;  // 水(肾)
}

/**
 * 基于单日打卡数据推算五行偏颇评分
 * - 木(肝): 情绪低→肝郁
 * - 火(心): 情绪高+睡眠差→心火亢
 * - 土(脾): 饮食不规律→脾虚
 * - 金(肺): 运动不足+症状→肺气虚
 * - 水(肾): 睡眠严重不足→肾虚
 */
export function calcWuxingTendencies(data: {
  moodScore: number;
  sleepScore: number;
  dietScore: number;
  exerciseScore: number;
  symptoms: string;
}): WuxingTendencies {
  const wood = data.moodScore < 50 ? 0.7
    : data.moodScore < 70 ? 0.4 : 0.1;

  const fire = (data.moodScore > 85 && data.sleepScore < 60) ? 0.7
    : data.sleepScore < 50 ? 0.5 : 0.1;

  const earth = data.dietScore < 50 ? 0.7
    : data.dietScore < 70 ? 0.4 : 0.1;

  const metal = (data.exerciseScore < 40 && !!data.symptoms) ? 0.7
    : data.exerciseScore < 60 ? 0.4 : 0.1;

  const water = data.sleepScore < 40 ? 0.7
    : data.sleepScore < 60 ? 0.4 : 0.1;

  return { wood, fire, earth, metal, water };
}

/**
 * 连续7天聚类分析 — 推断当前五行偏颇倾向
 */
export interface WeeklyTendency {
  element: '木' | '火' | '土' | '金' | '水';
  key: string;
  score: number;       // 0-1, 越高偏颇越明显
  confidence: number;  // 0-1, 数据可信度
  pattern: string;     // 简述
}

export function analyzeWeeklyTendency(checkins: Array<{
  moodScore: number;
  sleepScore: number;
  dietScore: number;
  exerciseScore: number;
  symptoms: string;
}>): WeeklyTendency[] {
  if (checkins.length < 3) return [];

  const elements: Array<{
    element: WeeklyTendency['element'];
    key: string;
    fn: (c: typeof checkins[0]) => boolean;
    pattern: string;
  }> = [
    {
      element: '木', key: 'wood',
      fn: (c) => c.moodScore < 60,
      pattern: `情绪偏低，肝郁气滞`,
    },
    {
      element: '火', key: 'fire',
      fn: (c) => (c.moodScore > 80 && c.sleepScore < 60) || c.sleepScore < 40,
      pattern: `睡眠不佳，心火偏亢`,
    },
    {
      element: '土', key: 'earth',
      fn: (c) => c.dietScore < 60,
      pattern: `饮食不规律，脾胃虚弱`,
    },
    {
      element: '金', key: 'metal',
      fn: (c) => c.exerciseScore < 40 && !!c.symptoms,
      pattern: `运动不足，肺气亏虚`,
    },
    {
      element: '水', key: 'water',
      fn: (c) => c.sleepScore < 50,
      pattern: `睡眠不足，肾精亏虚`,
    },
  ];

  return elements.map(({ element, key, fn, pattern }) => {
    const hits = checkins.filter(fn).length;
    const score = hits / checkins.length;
    const confidence = Math.min(1, checkins.length / 7);
    return {
      element,
      key,
      score: Math.round(score * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      pattern: `连续${hits}天${pattern}`,
    };
  }).sort((a, b) => b.score - a.score);
}

/**
 * 健康分数 → 日历热力图等级 (0-4)
 */
export function healthScoreToLevel(score: number): 0 | 1 | 2 | 3 | 4 {
  if (score >= 85) return 4;
  if (score >= 70) return 3;
  if (score >= 55) return 2;
  if (score > 0) return 1;
  return 0;
}
