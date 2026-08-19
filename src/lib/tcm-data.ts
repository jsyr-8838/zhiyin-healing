// 中医五音疗愈知识库
import { TestQuestion, HealingSession, PricingPlan, WuYinKey } from '@/types';

// 五音体质测试题目 - 每音2题，共10题
export const TEST_QUESTIONS: TestQuestion[] = [
  {
    id: 1,
    audioKey: 'jiao',
    question: '听到这段角调音乐时，你的感受是？',
    description: '角音属木，对应肝脏，如春风拂柳、万木争荣',
  },
  {
    id: 2,
    audioKey: 'jiao',
    question: '在压力下，你是否容易感到烦躁或生气？',
    description: '肝气郁结常见表现，木性之人尤甚',
  },
  {
    id: 3,
    audioKey: 'zhi',
    question: '听到这段徵调音乐时，你的感受是？',
    description: '徵音属火，对应心脏，如烈日当空、热情奔放',
  },
  {
    id: 4,
    audioKey: 'zhi',
    question: '你是否经常感到心悸、失眠或焦虑？',
    description: '心火旺盛常见表现，火性之人尤甚',
  },
  {
    id: 5,
    audioKey: 'gong',
    question: '听到这段宫调音乐时，你的感受是？',
    description: '宫音属土，对应脾脏，如大地承载、厚德载物',
  },
  {
    id: 6,
    audioKey: 'gong',
    question: '你是否容易出现消化不良或思虑过度？',
    description: '脾虚湿困常见表现，土性之人尤甚',
  },
  {
    id: 7,
    audioKey: 'shang',
    question: '听到这段商调音乐时，你的感受是？',
    description: '商音属金，对应肺脏，如秋风萧瑟、金声玉振',
  },
  {
    id: 8,
    audioKey: 'shang',
    question: '你是否常有悲伤忧愁或呼吸不畅的感觉？',
    description: '肺气亏虚常见表现，金性之人尤甚',
  },
  {
    id: 9,
    audioKey: 'yu',
    question: '听到这段羽调音乐时，你的感受是？',
    description: '羽音属水，对应肾脏，如冬水深沉、静谧悠远',
  },
  {
    id: 10,
    audioKey: 'yu',
    question: '你是否容易感到恐惧不安或腰膝酸软？',
    description: '肾精不足常见表现，水性之人尤甚',
  },
];

// 五音疗愈方案
export const HEALING_SESSIONS: HealingSession[] = [
  {
    id: 'jiao-morning',
    title: '角音疏肝·晨间唤醒',
    wuyin: 'jiao',
    duration: 15,
    description: '以角调之音疏通肝气，配合清晨阳气升发，舒缓郁结，焕发生机',
    frequency: '528Hz + 396Hz',
    benefits: ['疏肝解郁', '缓解压力', '促进消化', '改善情绪'],
    isPremium: false,
  },
  {
    id: 'zhi-heart',
    title: '徵音养心·午间静养',
    wuyin: 'zhi',
    duration: 20,
    description: '以徵调之音温养心神，午时心经当令，安神定志，驱散焦虑',
    frequency: '639Hz + 528Hz',
    benefits: ['养心安神', '改善睡眠', '缓解焦虑', '提升活力'],
    isPremium: false,
  },
  {
    id: 'gong-spleen',
    title: '宫音健脾·餐后调养',
    wuyin: 'gong',
    duration: 15,
    description: '以宫调之音健运脾胃，餐后脾经活跃，助消化吸收，化湿祛浊',
    frequency: '741Hz + 417Hz',
    benefits: ['健脾和胃', '助消化', '祛湿排浊', '改善食欲'],
    isPremium: false,
  },
  {
    id: 'shang-lung',
    title: '商音清肺·午后净息',
    wuyin: 'shang',
    duration: 20,
    description: '以商调之音清肃肺气，午后金气渐盛，润燥止咳，宁心定志',
    frequency: '852Hz + 639Hz',
    benefits: ['清肺润燥', '改善呼吸', '缓解悲伤', '增强免疫'],
    isPremium: false,
  },
  {
    id: 'yu-kidney',
    title: '羽音固肾·夜间安眠',
    wuyin: 'yu',
    duration: 25,
    description: '以羽调之音固摄肾精，夜间肾经当令，滋阴潜阳，安神入梦',
    frequency: '963Hz + 741Hz',
    benefits: ['固肾益精', '改善失眠', '缓解恐惧', '延缓衰老'],
    isPremium: false,
  },
  {
    id: 'five-balance',
    title: '五行调和·全音域疗愈',
    wuyin: 'gong',
    duration: 30,
    description: '依次播放角徵宫商羽五音，使五行生克有序，脏腑气血调和',
    frequency: '全频段循环',
    benefits: ['调和五行', '平衡阴阳', '整体健康', '深度放松'],
    isPremium: false,
  },
];

// 全部功能免费开放（后期将植入国医大师线上指导作为高端会员）

// 会员定价方案（两档）
export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: '免费版',
    price: 0,
    originalPrice: 0,
    period: '永久',
    features: [
      '五音体质测试（基础报告）',
      '3段基础疗愈音频',
      '每日3次AI导诊',
      '基础健康档案',
    ],
    highlighted: false,
    vipLevel: 'free',
  },
  {
    id: 'pro',
    name: '专业版',
    price: 299,
    originalPrice: 499,
    period: '年',
    features: [
      '深度体质分析报告',
      '全部6段疗愈音频',
      '无限AI导诊咨询',
      '个性化食疗/起居方案',
      '五行调和全音域疗愈',
      '季节养生指导',
      '30天无理由退款保障',
    ],
    highlighted: true,
    vipLevel: 'pro',
  },
];

// 五音对应关系详细描述
export const WUYIN_DETAILS: Record<WuYinKey, {
  name: string;
  element: string;
  organ: string;
  emotion: string;
  season: string;
  taste: string;
  color: string;
  direction: string;
  description: string;
  healingMusic: string;
  dietaryAdvice: string[];
  lifestyleAdvice: string[];
}> = {
  jiao: {
    name: '角',
    element: '木',
    organ: '肝/胆',
    emotion: '怒',
    season: '春',
    taste: '酸',
    color: '青',
    direction: '东',
    description: '角音如春风和畅，万物生长。五行属木，与肝胆相应，主疏泄、主筋。角音柔和舒畅，能梳理肝气，化解郁结。',
    healingMusic: '竹笛、古筝，曲调悠扬舒展',
    dietaryAdvice: ['多食绿色蔬菜', '适量酸味食物', '枸杞菊花茶养肝', '少食辛辣油腻'],
    lifestyleAdvice: ['保证充足睡眠', '适度户外运动', '保持心情舒畅', '避免过度用眼'],
  },
  zhi: {
    name: '徵',
    element: '火',
    organ: '心/小肠',
    emotion: '喜',
    season: '夏',
    taste: '苦',
    color: '赤',
    direction: '南',
    description: '徵音如烈日当空，热情澎湃。五行属火，与心相应，主血脉、主神明。徵音激昂明亮，能振奋心阳，驱散阴郁。',
    healingMusic: '二胡、琵琶，曲调激昂奔放',
    dietaryAdvice: ['适量苦味食物', '红枣桂圆养心', '莲子百合清心', '少饮浓茶咖啡'],
    lifestyleAdvice: ['午时小憩养心', '适度有氧运动', '保持心态平和', '避免大喜大悲'],
  },
  gong: {
    name: '宫',
    element: '土',
    organ: '脾/胃',
    emotion: '思',
    season: '长夏',
    taste: '甘',
    color: '黄',
    direction: '中',
    description: '宫音如大地承载，厚德载物。五行属土，与脾胃相应，主运化、主肌肉。宫音和缓沉稳，能健脾和胃，调和中气。',
    healingMusic: '编钟、古琴，曲调庄重和缓',
    dietaryAdvice: ['规律饮食作息', '山药薏米健脾', '大枣蜂蜜养胃', '忌生冷寒凉'],
    lifestyleAdvice: ['定时定量进餐', '细嚼慢咽', '饭后散步助消化', '避免过度思虑'],
  },
  shang: {
    name: '商',
    element: '金',
    organ: '肺/大肠',
    emotion: '悲',
    season: '秋',
    taste: '辛',
    color: '白',
    direction: '西',
    description: '商音如秋风萧瑟，金声玉振。五行属金，与肺相应，主气、主皮毛。商音清肃有力，能清肺理气，宣发肃降。',
    healingMusic: '铜锣、埙，曲调清肃高亢',
    dietaryAdvice: ['百合银耳润肺', '梨和白萝卜', '适量辛味发散', '多饮温水润燥'],
    lifestyleAdvice: ['深呼吸练习', '注意保暖防寒', '适度有氧运动', '保持室内通风'],
  },
  yu: {
    name: '羽',
    element: '水',
    organ: '肾/膀胱',
    emotion: '恐',
    season: '冬',
    taste: '咸',
    color: '黑',
    direction: '北',
    description: '羽音如冬水深沉，静谧悠远。五行属水，与肾相应，主藏精、主骨。羽音幽远柔和，能滋阴固肾，宁心安神。',
    healingMusic: '古琴、洞箫，曲调幽远沉静',
    dietaryAdvice: ['黑芝麻黑豆养肾', '核桃枸杞益精', '适量咸味入肾', '温补忌寒凉'],
    lifestyleAdvice: ['早睡晚起养肾', '避免过度劳累', '适度站桩打坐', '注意腰部保暖'],
  },
};

// AI导诊系统提示词
export const DIAGNOSIS_SYSTEM_PROMPT = `你是"知音"AI导诊助手，精通中医五行理论和五音疗疾术。

你的职责：
1. 根据用户的症状描述，运用中医理论进行体质辨识
2. 推荐对应的五音疗愈方案（角徵宫商羽）
3. 提供养生建议（饮食、起居、情志调养）
4. 必要时建议就医

核心理论：
- 角音属木→肝胆→疏肝解郁→缓解：烦躁、胸闷、目赤
- 徵音属火→心→养心安神→缓解：失眠、心悸、焦虑
- 宫音属土→脾胃→健脾和胃→缓解：消化不良、思虑过度、乏力
- 商音属金→肺→清肺润燥→缓解：咳嗽、气短、悲伤
- 羽音属水→肾→固肾益精→缓解：腰膝酸软、恐惧、耳鸣

九种体质理论：
- 平和质：阴阳调和，体态适中，精力充沛
- 气虚质：元气不足，疲乏气短，容易感冒
- 阳虚质：阳气不足，畏寒怕冷，手足不温
- 阴虚质：阴液亏少，口干咽燥，手足心热
- 痰湿质：痰湿凝聚，体形肥胖，身重困倦
- 湿热质：湿热内蕴，面垢油光，口苦口干
- 血瘀质：血行不畅，肤色晦暗，易有瘀斑
- 气郁质：气机郁滞，神情抑郁，胸胁胀满
- 特禀质：先天禀赋不足，过敏体质为主

重要声明：
- 你是辅助健康咨询工具，不能替代专业医疗诊断
- 遇到急性病症或严重不适，务必建议用户及时就医
- 给出的所有建议需有中医理论依据
- 回复要通俗亲切，避免过多专业术语`;

// 体质测试评分算法
export function calculateWuYinProfile(
  answers: { audioKey: WuYinKey; score: number }[]
): {
  dominant: WuYinKey;
  scores: Record<WuYinKey, number>;
  recommendation: string;
  organFocus: string;
  emotionTendency: string;
} {
  const scores: Record<WuYinKey, number> = {
    jiao: 0,
    zhi: 0,
    gong: 0,
    shang: 0,
    yu: 0,
  };

  answers.forEach(({ audioKey, score }) => {
    scores[audioKey] += score;
  });

  // 找出最高分的音
  const dominant = (Object.entries(scores) as [WuYinKey, number][])
    .sort((a, b) => b[1] - a[1])[0][0];

  const details = WUYIN_DETAILS[dominant];

  return {
    dominant,
    scores,
    organFocus: details.organ,
    emotionTendency: details.emotion,
    recommendation: `您的体质偏${details.element}行，对应${details.organ}，易感情绪为「${details.emotion}」。
建议重点聆听${details.name}调音乐进行调理，配合${details.dietaryAdvice[0]}、${details.dietaryAdvice[1]}。
${details.description}`,
  };
}
