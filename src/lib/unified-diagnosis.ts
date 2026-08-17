/**
 * 统一辩证体系 — 合并多源诊断结果，生成个性化疗愈方案
 *
 * 数据来源：
 * 1. 九种体质问卷（22题）→ primaryType + scores
 * 2. 五行体质计算器（四柱八字）→ fiveElement + constitution + dayMasterStrength
 * 3. 舌诊 → constitution + element + wuyin + organ
 * 4. 面诊 → constitution + element + wuyin + organ
 * 5. 手诊 → constitution + element + wuyin + organ
 * 6. 五音体质测试（10题）→ dominant + organFocus
 *
 * 核心逻辑：多源投票 + 权重 → 综合体质 + 疗愈方案
 */

// ═══════════════════════════════════════════════════════
//  类型定义
// ═══════════════════════════════════════════════════════

/** 九种体质类型 */
export type NineConstitutionType =
  | '平和质' | '气虚质' | '阳虚质' | '阴虚质'
  | '痰湿质' | '湿热质' | '血瘀质' | '气郁质' | '特禀质';

/** 视觉诊断的体质映射（简化版） */
export type VisualConstitutionType =
  | '平和' | '气虚' | '阳虚' | '阴虚'
  | '痰湿' | '湿热' | '血瘀' | '气郁';

/** 五行 */
export type WuXing = '木' | '火' | '土' | '金' | '水';

/** 五音 */
export type WuYin = '角' | '徵' | '宫' | '商' | '羽';

/** 单个诊断模块的结果 */
export interface DiagnosisSource {
  module: 'jiuZhong' | 'wuXing' | 'tongue' | 'face' | 'hand' | 'wuYinTest';
  timestamp: number;
  completed: boolean;
}

/** 九种体质结果 */
export interface JiuZhongResult {
  primaryType: NineConstitutionType;
  scores: Record<string, number>;
}

/** 五行体质结果 */
export interface WuXingResult {
  fiveElement: WuXing;           // 五行偏性
  constitution: string;          // 如"阳虚质"
  dayMasterStrength: string;     // 日主强弱
  yongShen: string;              // 用神
  jiShen: string;                // 忌神
}

/** 视觉诊断结果 */
export interface VisualDiagnosisResult {
  type: 'tongue' | 'face' | 'hand';
  constitution: VisualConstitutionType;
  element: string;
  wuyin: string;
  organ: string;
  diagnosis: string;
  featureA: string;
  featureB: string;
}

/** 五音体质测试结果 */
export interface WuYinTestResult {
  dominant: string;   // jiao/zhi/gong/shang/yu
  organFocus: string;
  emotionTendency: string;
}

/** 精油偏好诊断结果 */
export interface EssenceDiagnosisResult {
  /** 五行偏好（基于精油五行） */
  preferredElement: WuXing;
  /** 推荐精油列表 */
  recommendedOils: string[];
  /** 香氛基因偏好 */
  aromaProfile: string;
  /** 时间戳 */
  timestamp: number;
}

/** 色彩诊断结果 */
export interface ColorDiagnosisResult {
  /** 季型（如"深秋型"） */
  seasonType: string;
  /** 五行偏好 */
  preferredElement: WuXing;
  /** 治愈色列表 */
  healingColors: string[];
  /** 时间戳 */
  timestamp: number;
}

/** 统一诊断状态 — 存储在 Zustand + localStorage */
export interface UnifiedDiagnosis {
  jiuZhong: JiuZhongResult | null;
  wuXing: WuXingResult | null;
  tongue: VisualDiagnosisResult | null;
  face: VisualDiagnosisResult | null;
  hand: VisualDiagnosisResult | null;
  wuYinTest: WuYinTestResult | null;
  essence: EssenceDiagnosisResult | null;
  color: ColorDiagnosisResult | null;
  lastUpdated: number;
}

/** 综合辩证结果 */
export interface ConsolidatedDiagnosis {
  /** 综合九种体质（投票结果） */
  primaryConstitution: NineConstitutionType;
  /** 综合五行偏性 */
  primaryElement: WuXing;
  /** 综合五音推荐 */
  primaryWuYin: WuYin;
  /** 主要对应脏腑 */
  primaryOrgan: string;
  /** 主要情志 */
  primaryEmotion: string;
  /** 各体质类型投票得分 */
  voteScores: Record<string, number>;
  /** 诊断模块完成情况 */
  completedModules: string[];
  totalModules: number;
  /** 个性化疗愈方案 */
  healingPlan: PersonalizedHealingPlan;
}

/** 个性化疗愈方案 */
export interface PersonalizedHealingPlan {
  /** 推荐五音（含原因） */
  wuyin: { tone: WuYin; reason: string };
  /** 推荐六字诀 */
  liuZiJue: { sound: string; reason: string };
  /** 推荐灸疗穴位 */
  jiuLiao: { acupoints: string[]; meridian: string; reason: string };
  /** 推荐脉轮 */
  chakra: { name: string; reason: string };
  /** 饮食建议 */
  diet: { favor: string[]; avoid: string[] };
  /** 情志调摄 */
  emotion: string;
  /** 作息建议 */
  lifestyle: string;
}

// ═══════════════════════════════════════════════════════
//  体质映射表
// ═══════════════════════════════════════════════════════

/** 视觉诊断体质 → 九种体质映射 */
const VISUAL_TO_NINE: Record<VisualConstitutionType, NineConstitutionType> = {
  '平和': '平和质',
  '气虚': '气虚质',
  '阳虚': '阳虚质',
  '阴虚': '阴虚质',
  '痰湿': '痰湿质',
  '湿热': '湿热质',
  '血瘀': '血瘀质',
  '气郁': '气郁质',
};

/** 五行体质简名 → 九种体质映射 */
const WUXING_TO_NINE: Record<string, NineConstitutionType> = {
  '阳虚': '阳虚质',
  '阴虚': '阴虚质',
  '气虚': '气虚质',
  '痰湿': '痰湿质',
  '湿热': '湿热质',
  '血瘀': '血瘀质',
  '气郁': '气郁质',
  '平和': '平和质',
};

/** 九种体质 → 五行 */
const NINE_TO_ELEMENT: Record<NineConstitutionType, WuXing> = {
  '平和质': '土',  // 五行均衡，归土（中）
  '气虚质': '土',  // 脾肺气虚
  '阳虚质': '火',  // 阳气不足
  '阴虚质': '水',  // 阴液亏虚
  '痰湿质': '土',  // 脾虚湿困
  '湿热质': '火',  // 湿热内蕴
  '血瘀质': '木',  // 肝郁血瘀
  '气郁质': '木',  // 肝气郁结
  '特禀质': '土',  // 先天禀赋不足
};

/** 九种体质 → 五音 */
const NINE_TO_WUYIN: Record<NineConstitutionType, WuYin> = {
  '平和质': '宫',
  '气虚质': '宫',
  '阳虚质': '徵',
  '阴虚质': '羽',
  '痰湿质': '宫',
  '湿热质': '徵',
  '血瘀质': '角',
  '气郁质': '角',
  '特禀质': '宫',
};

/** 五音映射英文key */
const WUYIN_TO_KEY: Record<WuYin, string> = {
  '角': 'jiao', '徵': 'zhi', '宫': 'gong', '商': 'shang', '羽': 'yu',
};

/** 九种体质 → 脏腑 */
const NINE_TO_ORGAN: Record<NineConstitutionType, string> = {
  '平和质': '脏腑调和',
  '气虚质': '脾肺气虚',
  '阳虚质': '脾肾阳虚',
  '阴虚质': '肝肾阴虚',
  '痰湿质': '脾虚湿困',
  '湿热质': '脾胃湿热',
  '血瘀质': '肝郁血瘀',
  '气郁质': '肝气郁结',
  '特禀质': '先天禀赋不足',
};

/** 九种体质 → 情志 */
const NINE_TO_EMOTION: Record<NineConstitutionType, string> = {
  '平和质': '平和',
  '气虚质': '忧思',
  '阳虚质': '恐惧',
  '阴虚质': '烦躁',
  '痰湿质': '困倦',
  '湿热质': '急躁',
  '血瘀质': '抑郁',
  '气郁质': '忧郁',
  '特禀质': '敏感',
};

/** 九种体质 → 六字诀 */
const NINE_TO_LIUZIJUE: Record<NineConstitutionType, string> = {
  '平和质': '呼',
  '气虚质': '呼',
  '阳虚质': '吹',
  '阴虚质': '吹',
  '痰湿质': '呼',
  '湿热质': '呵',
  '血瘀质': '嘘',
  '气郁质': '嘘',
  '特禀质': '呼',
};

/** 九种体质 → 推荐灸疗穴位 + 经络 */
const NINE_TO_JIULIAO: Record<NineConstitutionType, { acupoints: string[]; meridian: string; reason: string }> = {
  '平和质': { acupoints: ['足三里', '关元', '气海'], meridian: '胃经/任脉', reason: '平和体质以固本培元为主，足三里强壮全身，关元气海培补元气' },
  '气虚质': { acupoints: ['足三里', '气海', '太渊'], meridian: '胃经/任脉/肺经', reason: '气虚需补气健脾，足三里补中气，气海培元气，太渊补肺气' },
  '阳虚质': { acupoints: ['关元', '命门', '涌泉'], meridian: '任脉/督脉/肾经', reason: '阳虚需温阳散寒，关元培元固本，命门温补肾阳，涌泉引火归元' },
  '阴虚质': { acupoints: ['太溪', '三阴交', '涌泉'], meridian: '肾经/脾经', reason: '阴虚需滋阴清热，太溪滋肾阴，三阴交养阴血，涌泉引火下行' },
  '痰湿质': { acupoints: ['足三里', '丰隆', '中脘'], meridian: '胃经/任脉', reason: '痰湿需化痰祛湿，丰隆为化痰要穴，中脘健脾化湿，足三里助运化' },
  '湿热质': { acupoints: ['曲池', '阴陵泉', '丰隆'], meridian: '大肠经/脾经/胃经', reason: '湿热需清热祛湿，曲池清泻湿热，阴陵泉利湿，丰隆化痰' },
  '血瘀质': { acupoints: ['太冲', '血海', '合谷'], meridian: '肝经/脾经/大肠经', reason: '血瘀需活血化瘀，太冲疏肝理气，血海活血化瘀，合谷行气' },
  '气郁质': { acupoints: ['太冲', '期门', '膻中'], meridian: '肝经/任脉', reason: '气郁需疏肝解郁，太冲疏肝理气，期门肝募穴，膻中宽胸理气' },
  '特禀质': { acupoints: ['足三里', '关元', '肺俞'], meridian: '胃经/任脉/膀胱经', reason: '特禀质需固本培元，足三里增强免疫，关元培元，肺俞固表' },
};

/** 九种体质 → 脉轮 */
const NINE_TO_CHAKRA: Record<NineConstitutionType, { name: string; reason: string }> = {
  '平和质': { name: '心轮', reason: '平和体质心轮通畅，保持爱与平衡' },
  '气虚质': { name: '太阳轮', reason: '气虚质消化火弱，激活太阳轮增强运化力' },
  '阳虚质': { name: '海底轮', reason: '阳虚质根基不稳，强化海底轮提升生命元气' },
  '阴虚质': { name: '眉心轮', reason: '阴虚质虚火上扰，激活眉心轮安神降火' },
  '痰湿质': { name: '太阳轮', reason: '痰湿质中焦壅滞，激活太阳轮促进运化' },
  '湿热质': { name: '太阳轮', reason: '湿热质肝胆郁热，激活太阳轮疏导湿热' },
  '血瘀质': { name: '心轮', reason: '血瘀质心血不畅，激活心轮促进气血运行' },
  '气郁质': { name: '喉轮', reason: '气郁质情志不畅，激活喉轮释放郁结表达自我' },
  '特禀质': { name: '海底轮', reason: '特禀质根基薄弱，强化海底轮建立安全感' },
};

/** 九种体质 → 饮食建议 */
const NINE_TO_DIET: Record<NineConstitutionType, { favor: string[]; avoid: string[] }> = {
  '平和质': { favor: ['五谷杂粮', '当季蔬果', '均衡饮食'], avoid: ['暴饮暴食', '偏食'] },
  '气虚质': { favor: ['山药', '黄芪', '红枣', '小米', '鸡肉'], avoid: ['生冷食物', '破气食物（萝卜、山楂过量）'] },
  '阳虚质': { favor: ['羊肉', '姜', '桂圆', '韭菜', '核桃'], avoid: ['寒凉食物', '冷饮', '西瓜'] },
  '阴虚质': { favor: ['银耳', '百合', '枸杞', '黑芝麻', '鸭肉'], avoid: ['辛辣燥热', '羊肉', '韭菜'] },
  '痰湿质': { favor: ['薏仁', '冬瓜', '茯苓', '陈皮', '荷叶'], avoid: ['甜食', '肥甘厚味', '酒'] },
  '湿热质': { favor: ['绿豆', '苦瓜', '薏仁', '黄瓜', '莲藕'], avoid: ['辛辣', '油炸', '酒', '羊肉'] },
  '血瘀质': { favor: ['山楂', '红花', '黑豆', '醋', '玫瑰花'], avoid: ['寒凉收涩', '高脂食物'] },
  '气郁质': { favor: ['玫瑰花', '佛手', '萝卜', '柑橘', '小麦'], avoid: ['收敛酸涩', '冰冷食物'] },
  '特禀质': { favor: ['山药', '黄芪', '大枣', '蜂蜜', '粳米'], avoid: ['致敏食物', '海鲜（视过敏源）', '辛辣刺激'] },
};

/** 九种体质 → 情志调摄 */
const NINE_TO_EMOTION_ADVICE: Record<NineConstitutionType, string> = {
  '平和质': '保持内心平和，顺其自然，适度运动',
  '气虚质': '避免过度思虑，适当户外活动，培养乐观心态',
  '阳虚质': '多晒太阳，参与温暖积极的社交，避免恐惧焦虑',
  '阴虚质': '静心冥想，避免急躁，午休养阴，培养耐性',
  '痰湿质': '增加运动量，避免懒散，培养积极生活态度',
  '湿热质': '克制怒气，保持冷静，瑜伽或太极有助平心',
  '血瘀质': '疏解抑郁，多与人交流，积极参与社会活动',
  '气郁质': '培养兴趣爱好，倾诉释怀，音乐和旅行有助舒肝',
  '特禀质': '减少焦虑紧张，规律生活，避免过敏源刺激情绪',
};

/** 九种体质 → 作息建议 */
const NINE_TO_LIFESTYLE: Record<NineConstitutionType, string> = {
  '平和质': '规律作息，随四时调整，春夏晚睡早起，秋冬早睡晚起',
  '气虚质': '早睡早起，避免熬夜，午休30分钟补气，避免过度劳累',
  '阳虚质': '早睡晚起，必待日光，睡前泡脚暖身，避免久坐阴凉处',
  '阴虚质': '早睡早起，避免熬夜伤阴，午休养阴，卧室宜凉爽安静',
  '痰湿质': '早睡早起，增加白天活动量，避免贪睡久坐，保持通风干燥',
  '湿热质': '规律作息，避免熬夜生湿热，居住环境保持通风干燥',
  '血瘀质': '规律作息，保证充足睡眠，睡前热水泡脚促进血行',
  '气郁质': '规律作息，睡前听舒缓音乐，避免独处过久，增加户外时间',
  '特禀质': '规律作息，避免尘螨花粉环境，保持室内清洁，换季注意防护',
};

/** 五音英文 key → 中文 */
const KEY_TO_WUYIN: Record<string, WuYin> = {
  'jiao': '角', 'zhi': '徵', 'gong': '宫', 'shang': '商', 'yu': '羽',
};

/** 五行中文 → 五行 */
const STR_TO_ELEMENT: Record<string, WuXing> = {
  '木': '木', '火': '火', '土': '土', '金': '金', '水': '水',
  'wood': '木', 'fire': '火', 'earth': '土', 'metal': '金', 'water': '水',
};

// ═══════════════════════════════════════════════════════
//  核心整合逻辑
// ═══════════════════════════════════════════════════════

/**
 * 综合辩证 — 多源投票 + 权重
 *
 * 投票规则：
 * - 九种体质问卷：权重 3（最权威的量表）
 * - 五行体质计算：权重 2（基于出生时间的先天偏性）
 * - 舌诊：权重 2（直接望诊）
 * - 面诊：权重 1.5
 * - 手诊：权重 1.5
 * - 五音体质测试：权重 1.5
 */
export function consolidateDiagnosis(diagnosis: UnifiedDiagnosis): ConsolidatedDiagnosis {
  const voteScores: Record<string, number> = {
    '平和质': 0, '气虚质': 0, '阳虚质': 0, '阴虚质': 0,
    '痰湿质': 0, '湿热质': 0, '血瘀质': 0, '气郁质': 0, '特禀质': 0,
  };

  const elementVotes: Record<WuXing, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  const wuyinVotes: Record<WuYin, number> = { '角': 0, '徵': 0, '宫': 0, '商': 0, '羽': 0 };

  let hasAnyDiagnosis = false;

  // 1. 九种体质问卷（权重 3）
  if (diagnosis.jiuZhong) {
    hasAnyDiagnosis = true;
    // 按得分比例分配投票权重
    const totalScore = Object.values(diagnosis.jiuZhong.scores).reduce((a, b) => a + b, 0) || 1;
    for (const [type, score] of Object.entries(diagnosis.jiuZhong.scores)) {
      const key = (type + '质') as NineConstitutionType;
      if (key in voteScores) {
        voteScores[key] += (score / totalScore) * 3;
      }
    }
    // 主导类型额外加权
    voteScores[diagnosis.jiuZhong.primaryType] += 2;

    const el = NINE_TO_ELEMENT[diagnosis.jiuZhong.primaryType];
    elementVotes[el] += 3;
    wuyinVotes[NINE_TO_WUYIN[diagnosis.jiuZhong.primaryType]] += 3;
  }

  // 2. 五行体质计算（权重 2）
  if (diagnosis.wuXing) {
    hasAnyDiagnosis = true;
    const nineType = WUXING_TO_NINE[diagnosis.wuXing.constitution.replace('质', '')] || null;
    if (nineType) {
      voteScores[nineType] += 2;
    }
    const el = STR_TO_ELEMENT[diagnosis.wuXing.fiveElement] || '土';
    elementVotes[el] += 2;
    if (nineType) {
      wuyinVotes[NINE_TO_WUYIN[nineType]] += 2;
    }
  }

  // 3. 舌诊（权重 2）
  if (diagnosis.tongue) {
    hasAnyDiagnosis = true;
    const nineType = VISUAL_TO_NINE[diagnosis.tongue.constitution] || null;
    if (nineType) {
      voteScores[nineType] += 2;
    }
    const el = STR_TO_ELEMENT[diagnosis.tongue.element] || '土';
    elementVotes[el] += 2;
    // 视觉诊断的 wuyin 字段可能是"角"/"徵"等
    const wy = diagnosis.tongue.wuyin as WuYin;
    if (wy && wy in wuyinVotes) {
      wuyinVotes[wy] += 2;
    }
  }

  // 4. 面诊（权重 1.5）
  if (diagnosis.face) {
    hasAnyDiagnosis = true;
    const nineType = VISUAL_TO_NINE[diagnosis.face.constitution] || null;
    if (nineType) {
      voteScores[nineType] += 1.5;
    }
    const el = STR_TO_ELEMENT[diagnosis.face.element] || '土';
    elementVotes[el] += 1.5;
    const wy = diagnosis.face.wuyin as WuYin;
    if (wy && wy in wuyinVotes) {
      wuyinVotes[wy] += 1.5;
    }
  }

  // 5. 手诊（权重 1.5）
  if (diagnosis.hand) {
    hasAnyDiagnosis = true;
    const nineType = VISUAL_TO_NINE[diagnosis.hand.constitution] || null;
    if (nineType) {
      voteScores[nineType] += 1.5;
    }
    const el = STR_TO_ELEMENT[diagnosis.hand.element] || '土';
    elementVotes[el] += 1.5;
    const wy = diagnosis.hand.wuyin as WuYin;
    if (wy && wy in wuyinVotes) {
      wuyinVotes[wy] += 1.5;
    }
  }

  // 6. 五音体质测试（权重 1.5）
  if (diagnosis.wuYinTest) {
    hasAnyDiagnosis = true;
    const wy = KEY_TO_WUYIN[diagnosis.wuYinTest.dominant] || '宫';
    wuyinVotes[wy] += 1.5;
    // 五音 → 九种体质反向映射
    const wuyinToNine: Record<string, NineConstitutionType> = {
      '角': '气郁质', '徵': '阳虚质', '宫': '气虚质', '商': '阴虚质', '羽': '阴虚质',
    };
    const fromWuyin = wuyinToNine[wy];
    if (fromWuyin) {
      voteScores[fromWuyin] += 1;
    }
    const wuyinToElement: Record<string, WuXing> = {
      '角': '木', '徵': '火', '宫': '土', '商': '金', '羽': '水',
    };
    elementVotes[wuyinToElement[wy] || '土'] += 1.5;
  }

  // 7. 精油偏好诊断（权重 1）
  if (diagnosis.essence) {
    hasAnyDiagnosis = true;
    const el = diagnosis.essence.preferredElement;
    if (el && el in elementVotes) {
      elementVotes[el] += 1;
    }
    // 精油五行 → 五音映射
    const essenceToWuyin: Record<string, WuYin> = {
      '木': '角', '火': '徵', '土': '宫', '金': '商', '水': '羽',
    };
    const wy = essenceToWuyin[el];
    if (wy && wy in wuyinVotes) {
      wuyinVotes[wy] += 1;
    }
    // 精油五行 → 九种体质反向映射
    const essenceToNine: Record<string, NineConstitutionType> = {
      '木': '气郁质', '火': '阳虚质', '土': '气虚质', '金': '阴虚质', '水': '阴虚质',
    };
    const fromEssence = essenceToNine[el];
    if (fromEssence) {
      voteScores[fromEssence] += 0.5;
    }
  }

  // 8. 色彩诊断（权重 1）
  if (diagnosis.color) {
    hasAnyDiagnosis = true;
    const el = diagnosis.color.preferredElement;
    if (el && el in elementVotes) {
      elementVotes[el] += 1;
    }
    const colorToWuyin: Record<string, WuYin> = {
      '木': '角', '火': '徵', '土': '宫', '金': '商', '水': '羽',
    };
    const wy = colorToWuyin[el];
    if (wy && wy in wuyinVotes) {
      wuyinVotes[wy] += 1;
    }
    const colorToNine: Record<string, NineConstitutionType> = {
      '木': '气郁质', '火': '阳虚质', '土': '气虚质', '金': '阴虚质', '水': '阴虚质',
    };
    const fromColor = colorToNine[el];
    if (fromColor) {
      voteScores[fromColor] += 0.5;
    }
  }

  // 如果没有任何诊断，返回平和质 + 默认方案
  if (!hasAnyDiagnosis) {
    return getDefaultConsolidation();
  }

  // 选出最高票体质
  const sortedConstitutions = Object.entries(voteScores).sort((a, b) => b[1] - a[1]);
  const primaryConstitution = sortedConstitutions[0][0] as NineConstitutionType;

  // 选出最高票五行
  const sortedElements = Object.entries(elementVotes).sort((a, b) => b[1] - a[1]) as [WuXing, number][];
  const primaryElement = sortedElements[0]?.[0] || NINE_TO_ELEMENT[primaryConstitution];

  // 选出最高票五音
  const sortedWuyin = Object.entries(wuyinVotes).sort((a, b) => b[1] - a[1]) as [WuYin, number][];
  const primaryWuYin = sortedWuyin[0]?.[0] || NINE_TO_WUYIN[primaryConstitution];

  // 完成模块
  const completedModules: string[] = [];
  if (diagnosis.jiuZhong) completedModules.push('九种体质');
  if (diagnosis.wuXing) completedModules.push('五行体质');
  if (diagnosis.tongue) completedModules.push('舌诊');
  if (diagnosis.face) completedModules.push('面诊');
  if (diagnosis.hand) completedModules.push('手诊');
  if (diagnosis.wuYinTest) completedModules.push('五音测试');
  if (diagnosis.essence) completedModules.push('精油偏好');
  if (diagnosis.color) completedModules.push('色彩诊断');

  // 构建个性化疗愈方案
  const healingPlan = buildHealingPlan(primaryConstitution, primaryElement, primaryWuYin);

  return {
    primaryConstitution,
    primaryElement,
    primaryWuYin,
    primaryOrgan: NINE_TO_ORGAN[primaryConstitution],
    primaryEmotion: NINE_TO_EMOTION[primaryConstitution],
    voteScores,
    completedModules,
    totalModules: 8,
    healingPlan,
  };
}

/** 构建个性化疗愈方案 */
function buildHealingPlan(
  constitution: NineConstitutionType,
  _element: WuXing,
  wuyin: WuYin,
): PersonalizedHealingPlan {
  const jiuLiao = NINE_TO_JIULIAO[constitution];
  const chakra = NINE_TO_CHAKRA[constitution];
  const diet = NINE_TO_DIET[constitution];

  return {
    wuyin: {
      tone: wuyin,
      reason: `${constitution}对应${NINE_TO_WUYIN[constitution]}音（${NINE_TO_ORGAN[constitution]}），听${wuyin}音可调理${NINE_TO_ORGAN[constitution]}`,
    },
    liuZiJue: {
      sound: NINE_TO_LIUZIJUE[constitution],
      reason: `六字诀「${NINE_TO_LIUZIJUE[constitution]}」对应${NINE_TO_ORGAN[constitution]}，${constitution}者练习此音有助于调节脏腑功能`,
    },
    jiuLiao: {
      acupoints: jiuLiao.acupoints,
      meridian: jiuLiao.meridian,
      reason: jiuLiao.reason,
    },
    chakra: {
      name: chakra.name,
      reason: chakra.reason,
    },
    diet,
    emotion: NINE_TO_EMOTION_ADVICE[constitution],
    lifestyle: NINE_TO_LIFESTYLE[constitution],
  };
}

/** 默认方案（未作任何诊断时） */
function getDefaultConsolidation(): ConsolidatedDiagnosis {
  return {
    primaryConstitution: '平和质',
    primaryElement: '土',
    primaryWuYin: '宫',
    primaryOrgan: '脏腑调和',
    primaryEmotion: '平和',
    voteScores: { '平和质': 1, '气虚质': 0, '阳虚质': 0, '阴虚质': 0, '痰湿质': 0, '湿热质': 0, '血瘀质': 0, '气郁质': 0, '特禀质': 0 },
    completedModules: [],
    totalModules: 8,
    healingPlan: buildHealingPlan('平和质', '土', '宫'),
  };
}

/** 初始诊断状态 */
export function createEmptyDiagnosis(): UnifiedDiagnosis {
  return {
    jiuZhong: null,
    wuXing: null,
    tongue: null,
    face: null,
    hand: null,
    wuYinTest: null,
    essence: null,
    color: null,
    lastUpdated: Date.now(),
  };
}

/** 获取综合辩证摘要文本（给 AI 导诊用） */
export function getDiagnosisSummary(diagnosis: UnifiedDiagnosis): string {
  const consolidated = consolidateDiagnosis(diagnosis);
  const { completedModules, primaryConstitution, primaryElement, primaryWuYin, primaryOrgan, primaryEmotion, healingPlan } = consolidated;

  if (completedModules.length === 0) {
    return '用户尚未完成任何体质诊断。';
  }

  const lines: string[] = [
    `【综合明辨结果】已完成${completedModules.length}/6项诊断：${completedModules.join('、')}`,
    `综合体质：${primaryConstitution}`,
    `五行偏性：${primaryElement}行`,
    `五音推荐：${primaryWuYin}音（${primaryOrgan}）`,
    `情志特征：${primaryEmotion}`,
  ];

  if (diagnosis.jiuZhong) {
    const top3 = Object.entries(diagnosis.jiuZhong.scores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k, v]) => `${k}(${v}分)`)
      .join(' > ');
    lines.push(`九种体质得分前三：${top3}`);
  }

  if (diagnosis.wuXing) {
    lines.push(`五行八字：日主${diagnosis.wuXing.dayMasterStrength}，用神${diagnosis.wuXing.yongShen}，忌神${diagnosis.wuXing.jiShen}`);
  }

  if (diagnosis.tongue) {
    lines.push(`舌诊：${diagnosis.tongue.diagnosis}`);
  }

  if (diagnosis.face) {
    lines.push(`面诊：${diagnosis.face.diagnosis}`);
  }

  if (diagnosis.hand) {
    lines.push(`手诊：${diagnosis.hand.diagnosis}`);
  }

  lines.push(`疗愈建议：${healingPlan.wuyin.tone}音疗愈 + 六字诀「${healingPlan.liuZiJue.sound}」+ 灸疗${healingPlan.jiuLiao.acupoints.join('、')}`);

  return lines.join('\n');
}
