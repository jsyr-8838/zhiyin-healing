/**
 * color-wuxing.ts — 色彩→五行映射引擎
 *
 * 核心能力：
 * 1. HSL→五行映射（色相匹配+饱和度/亮度偏盛偏衰判断）
 * 2. 日内瓦情绪轮20词→五行情志映射
 * 3. 五行偏盛偏衰→疗愈推荐（经络、五音、灸法）
 *
 * 依据：《黄帝内经》五色入五脏理论 + 日内瓦情绪轮(GEW)
 *   木-肝-怒-青/绿  火-心-喜-红/赤  土-脾-思-黄
 *   金-肺-悲-白      水-肾-恐-黑/蓝
 */

// ===== 类型 =====

export type WuxingElement = '木' | '火' | '土' | '金' | '水';

export interface HSLColor {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
  hex?: string;
}

export type WuxingTendency = '盛' | '衰' | '平';

export interface WuxingResult {
  element: WuxingElement;
  tendency: WuxingTendency;
  /** 区分度 0-1，色相越靠近该五行中心越高 */
  confidence: number;
}

export interface WuxingDiagnosis {
  /** 主色（用户选的第一个颜色）的五行 */
  primary: WuxingResult;
  /** 五行分布统计 */
  distribution: Record<WuxingElement, { count: number; avgSat: number; avgLight: number }>;
  /** 偏盛的五行 */
  excess: WuxingElement[];
  /** 偏衰的五行 */
  deficient: WuxingElement[];
  /** 综合推荐 */
  recommendation: WuxingRecommendation;
}

export interface WuxingRecommendation {
  /** 需要疏导的经络（泻其子） */
  meridians: string[];
  /** 推荐的五音曲目 */
  tones: string[];
  /** 推荐的灸疗穴位 */
  acupoints: string[];
  /** 情志调养建议 */
  emotionAdvice: string;
  /** 饮食建议 */
  dietAdvice: string;
}

// ===== 五行常量 =====

export const WUXING_META: Record<WuxingElement, {
  organ: string; emotion: string; color: string; colorHex: string;
  tone: string; meridian: string; acupoints: string[];
  hueRange: [number, number][]; // 色相范围
  emotionKeywords: string[];
}> = {
  '木': {
    organ: '肝', emotion: '怒', color: '青/绿', colorHex: '#27AE60',
    tone: '角音', meridian: '足厥阴肝经',
    acupoints: ['太冲', '行间', '期门', '阳陵泉'],
    hueRange: [[90, 165]],
    emotionKeywords: ['感兴趣', '欢愉', '自豪'],
  },
  '火': {
    organ: '心', emotion: '喜', color: '红/赤', colorHex: '#E74C3C',
    tone: '徵音', meridian: '手少阴心经',
    acupoints: ['神门', '少府', '内关', '心俞'],
    hueRange: [[345, 361], [0, 30]],
    emotionKeywords: ['欢乐', '愉快', '忿怒'],
  },
  '土': {
    organ: '脾', emotion: '思', color: '黄', colorHex: '#F39C12',
    tone: '宫音', meridian: '足太阴脾经',
    acupoints: ['足三里', '三阴交', '中脘', '脾俞'],
    hueRange: [[30, 90]],
    emotionKeywords: ['满足', '赞赏', '爱'],
  },
  '金': {
    organ: '肺', emotion: '悲', color: '白', colorHex: '#BDC3C7',
    tone: '商音', meridian: '手太阴肺经',
    acupoints: ['列缺', '尺泽', '太渊', '肺俞'],
    hueRange: [], // 金=低饱和+高亮度，用特殊逻辑
    emotionKeywords: ['如释重负', '同情', '悲伤'],
  },
  '水': {
    organ: '肾', emotion: '恐', color: '黑/蓝', colorHex: '#2C3E50',
    tone: '羽音', meridian: '足少阴肾经',
    acupoints: ['涌泉', '太溪', '复溜', '肾俞'],
    hueRange: [[200, 285]],
    emotionKeywords: ['恐惧', '厌恶', '轻视'],
  },
};

// ===== 核心：HSL → 五行映射 =====

export function hslToWuxing(h: number, s: number, l: number): WuxingResult {
  // 特殊规则：低饱和+高亮 → 金（白）
  if (s < 18 && l > 68) {
    return { element: '金', tendency: l > 85 ? '平' : '衰', confidence: 1 - s / 18 };
  }
  // 特殊规则：低亮度 → 水（黑）
  if (l < 22) {
    return { element: '水', tendency: '盛', confidence: 1 - l / 22 };
  }
  // 高饱和+极低亮度 → 水（深蓝/黑蓝）
  if (l < 35 && s > 50 && h >= 200 && h < 280) {
    return { element: '水', tendency: '盛', confidence: 0.8 };
  }

  // 按色相匹配五行
  let bestElement: WuxingElement = '土'; // 默认归土（中宫）
  let bestDist = Infinity;
  let bestRangeLen = 1;

  for (const [elem, meta] of Object.entries(WUXING_META) as [WuxingElement, typeof WUXING_META[WuxingElement]][]) {
    if (meta.hueRange.length === 0) continue;
    for (const [lo, hi] of meta.hueRange) {
      // 计算色相到范围中心的距离
      const center = (lo + hi) / 2;
      const rangeLen = hi - lo;
      let dist = Math.abs(h - center);
      if (dist > 180) dist = 360 - dist; // 环形距离
      if (dist < bestDist) {
        bestDist = dist;
        bestElement = elem as WuxingElement;
        bestRangeLen = rangeLen;
      }
    }
  }

  // 色相是否在范围内
  const inRange = isHueInRange(h, WUXING_META[bestElement].hueRange);
  const confidence = inRange ? Math.max(0.3, 1 - bestDist / (bestRangeLen / 2)) : 0.25;

  // 偏盛偏衰判断
  let tendency: WuxingTendency;
  if (s > 55 && l > 35 && l < 70) {
    tendency = '盛'; // 高饱和适中亮度 = 偏盛
  } else if (s < 25 || l > 80 || l < 20) {
    tendency = '衰'; // 低饱和或极端亮度 = 偏衰
  } else {
    tendency = '平';
  }

  return { element: bestElement, tendency, confidence };
}

function isHueInRange(h: number, ranges: [number, number][]): boolean {
  for (const [lo, hi] of ranges) {
    if (h >= lo && h < hi) return true;
  }
  return false;
}

// ===== 情绪 → 五行映射 =====

// GEW 20词 → 五行映射（基于中医五志理论 + GEW情绪极性）
export const EMOTION_WUXING_MAP: Record<string, WuxingElement> = {
  // 木-肝-怒（正面：生机/拓展）
  '感兴趣': '木', '欢愉': '木', '自豪': '木',
  // 火-心-喜（正面：兴奋/热烈）
  '欢乐': '火', '愉快': '火', '忿怒': '火',
  // 土-脾-思（中性：稳定/关联）
  '满足': '土', '赞赏': '土', '爱': '土',
  // 金-肺-悲（衰减：释放/消退）
  '如释重负': '金', '同情': '金', '悲伤': '金',
  // 水-肾-恐（负面：收缩/防御）
  '恐惧': '水', '厌恶': '水', '轻视': '水',
  '憎恨': '水', '失望': '水',
  // 兼顾英文 key
  'interest': '木', 'amusement': '木', 'pride': '木',
  'joy': '火', 'pleasure': '火', 'anger': '火',
  'contentment': '土', 'admiration': '土', 'love': '土',
  'relief': '金', 'compassion': '金', 'sadness': '金',
  'fear': '水', 'disgust': '水', 'contempt': '水',
  'hate': '水', 'disappointment': '水',
  // 补充：五志简版
  '怒': '木', '喜': '火', '思': '土', '悲': '金', '恐': '水',
  // 补充：疏泄版情绪词
  '焦虑烦躁': '火', '抑郁低落': '木', '思虑过度': '土', '悲伤忧愁': '金', '恐惧不安': '水',
  '内疚': '金', '后悔': '金', '羞愧': '金',
};

export function emotionToWuxing(emotion: string): WuxingElement {
  return EMOTION_WUXING_MAP[emotion] || '土'; // 默认归土
}

// ===== 五行生克关系 =====

const SHENG_CYCLE: Record<WuxingElement, WuxingElement> = {
  '木': '火', '火': '土', '土': '金', '金': '水', '水': '木',
}; // 木生火、火生土...

const KE_CYCLE: Record<WuxingElement, WuxingElement> = {
  '木': '土', '火': '金', '土': '水', '金': '木', '水': '火',
}; // 木克土、火克金...

export function getShengChild(element: WuxingElement): WuxingElement {
  return SHENG_CYCLE[element];
}

export function getKeTarget(element: WuxingElement): WuxingElement {
  return KE_CYCLE[element];
}

// ===== 综合诊断 =====

export function generateDiagnosis(
  colorData: Record<string, HSLColor>,
  selectedEmotion?: string,
): WuxingDiagnosis {
  // 1. 统计每个五行的出现频次和平均饱和度/亮度
  const dist: Record<WuxingElement, { count: number; totalSat: number; totalLight: number }> = {
    '木': { count: 0, totalSat: 0, totalLight: 0 },
    '火': { count: 0, totalSat: 0, totalLight: 0 },
    '土': { count: 0, totalSat: 0, totalLight: 0 },
    '金': { count: 0, totalSat: 0, totalLight: 0 },
    '水': { count: 0, totalSat: 0, totalLight: 0 },
  };

  const entries = Object.entries(colorData);
  let primaryResult: WuxingResult = { element: '土', tendency: '平', confidence: 0.5 };

  for (let i = 0; i < entries.length; i++) {
    const [, color] = entries[i];
    const result = hslToWuxing(color.h, color.s, color.l);
    dist[result.element].count++;
    dist[result.element].totalSat += color.s;
    dist[result.element].totalLight += color.l;
    if (i === 0) primaryResult = result;
  }

  // 如果有选情绪，也纳入统计
  if (selectedEmotion) {
    const emotionElement = emotionToWuxing(selectedEmotion);
    dist[emotionElement].count += 2; // 情绪权重为2
  }

  // 2. 计算平均值
  const distribution: WuxingDiagnosis['distribution'] = {} as Record<WuxingElement, { count: number; avgSat: number; avgLight: number }>;
  const elements: WuxingElement[] = ['木', '火', '土', '金', '水'];
  for (const e of elements) {
    const d = dist[e];
    distribution[e] = {
      count: d.count,
      avgSat: d.count > 0 ? Math.round(d.totalSat / d.count) : 0,
      avgLight: d.count > 0 ? Math.round(d.totalLight / d.count) : 0,
    };
  }

  // 3. 判断偏盛偏衰
  const total = entries.length + (selectedEmotion ? 2 : 0);
  const avg = total / 5;
  const excess: WuxingElement[] = [];
  const deficient: WuxingElement[] = [];

  for (const e of elements) {
    if (dist[e].count > avg * 1.5) excess.push(e);
    if (dist[e].count < avg * 0.3 && total > 2) deficient.push(e);
  }
  if (excess.length === 0 && primaryResult.tendency === '盛') excess.push(primaryResult.element);
  if (deficient.length === 0 && primaryResult.tendency === '衰') deficient.push(primaryResult.element);

  // 4. 生成推荐
  const recommendation = generateRecommendation(excess, deficient, primaryResult);

  return {
    primary: primaryResult,
    distribution,
    excess,
    deficient,
    recommendation,
  };
}

function generateRecommendation(
  excess: WuxingElement[],
  deficient: WuxingElement[],
  primary: WuxingResult,
): WuxingRecommendation {
  // 疏导策略：泻其盛，补其衰
  const targetElement = excess.length > 0 ? excess[0] : primary.element;
  const targetMeta = WUXING_META[targetElement];

  // 经络：泻盛者的本经，补衰者的本经
  const meridians: string[] = [];
  if (excess.length > 0) meridians.push(`${WUXING_META[excess[0]].meridian}（泻）`);
  if (deficient.length > 0) meridians.push(`${WUXING_META[deficient[0]].meridian}（补）`);
  if (meridians.length === 0) meridians.push(targetMeta.meridian);

  // 五音：泻盛用"我克之音"，补衰用"生我之音"
  const tones: string[] = [];
  if (excess.length > 0) {
    const keTarget = getKeTarget(excess[0]);
    tones.push(`${WUXING_META[keTarget].tone}（泻${excess[0]}）`);
  }
  if (deficient.length > 0) {
    // 生我者：找到生deficient[0]的五行
    for (const [elem, child] of Object.entries(SHENG_CYCLE) as [WuxingElement, WuxingElement][]) {
      if (child === deficient[0]) {
        tones.push(`${WUXING_META[elem].tone}（补${deficient[0]}）`);
        break;
      }
    }
  }
  if (tones.length === 0) tones.push(targetMeta.tone);

  // 灸疗穴位
  const acupoints = [...targetMeta.acupoints];
  if (deficient.length > 0) acupoints.push(...WUXING_META[deficient[0]].acupoints.slice(0, 2));

  // 情志建议
  const emotionAdvice = generateEmotionAdvice(excess, deficient, primary);

  // 饮食建议
  const dietAdvice = generateDietAdvice(excess, deficient);

  return { meridians, tones, acupoints, emotionAdvice, dietAdvice };
}

function generateEmotionAdvice(
  excess: WuxingElement[], deficient: WuxingElement[], primary: WuxingResult,
): string {
  const elem = excess.length > 0 ? excess[0] : primary.element;
  const meta = WUXING_META[elem];

  const adviceMap: Record<WuxingElement, string> = {
    '木': '肝气偏盛，易怒易躁。建议多做疏肝理气之事：户外散步、舒展身体、倾诉表达。避免压抑情绪，以"喜"胜"怒"——听欢快曲目或回忆愉快经历。',
    '火': '心火偏亢，心神不宁。建议静心安神：冥想、深呼吸、温水泡脚。以"恐"胜"喜"非良策，宜以"悲"泄火——听舒缓悲悯之曲，释放炽烈之情。',
    '土': '脾土偏滞，思虑过度。建议健脾化湿：规律饮食、适度运动、减少久坐。以"怒"胜"思"——适度宣泄，打破反复思虑的循环。',
    '金': '肺金偏实，悲忧郁结。建议宣肺解郁：腹式呼吸、扩胸运动、唱歌。以"喜"胜"悲"——接触欢乐的人和事，温暖社交。',
    '水': '肾水偏盛，恐惧不安。建议温肾壮阳：艾灸涌泉、温热饮食、充足睡眠。以"思"胜"恐"——理性分析恐惧源，以认知化解不安。',
  };

  return adviceMap[elem];
}

function generateDietAdvice(excess: WuxingElement[], deficient: WuxingElement[]): string {
  const parts: string[] = [];
  if (excess.length > 0) {
    const dietMap: Record<WuxingElement, string> = {
      '木': '少食酸味和油腻，多食甘味（红枣、山药）以缓肝急',
      '火': '少食辛辣和苦味，多食酸味（柠檬、山楂）以敛心火',
      '土': '少食甜腻，多食咸味（海带、紫菜）以软坚散结',
      '金': '少食辛味，多食苦味（苦瓜、莲子心）以清泻肺热',
      '水': '少食咸味和寒凉，多食辛味（生姜、桂皮）以温阳化气',
    };
    parts.push(dietMap[excess[0]]);
  }
  if (deficient.length > 0) {
    const dietMap: Record<WuxingElement, string> = {
      '木': '多食绿色蔬菜、酸味水果（山楂、枸杞）以养肝',
      '火': '多食红色食材（红枣、红豆、番茄）以补心',
      '土': '多食黄色食材（小米、南瓜、玉米）以健脾',
      '金': '多食白色食材（百合、银耳、雪梨）以润肺',
      '水': '多食黑色食材（黑豆、黑芝麻、黑木耳）以补肾',
    };
    parts.push(dietMap[deficient[0]]);
  }
  if (parts.length === 0) parts.push('饮食宜清淡均衡，五色五味兼顾');
  return parts.join('；') + '。';
}

// ===== 辅助：HSL → Hex =====

export function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
