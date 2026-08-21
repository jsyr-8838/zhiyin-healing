/**
 * 灵数含义数据（中文化）
 *
 * 来源: motivational-numerology (MIT, by Sally Faubion & Olivier Guilieri)
 * 原始含义数据来自 i18n/meaning_en.js
 *
 * 6 大维度 × 12 个数字值（1-9, 11, 22, 33）的详细含义
 * 翻译并调整为中文语境
 */

import type { NumerologyDimension } from './numerology-engine';

// ===== 类型定义 =====

export interface NumberMeaning {
  /** 数字值 */
  number: number;
  /** 核心关键词 */
  keyword: string;
  /** 详细描述 */
  description: string;
  /** 优势 */
  strengths: string;
  /** 挑战 */
  challenges: string;
}

// ===== 各维度含义数据 =====

/** 品格 (Character) — 名字所有字母 */
export const CHARACTER_MEANINGS: Record<number, NumberMeaning> = {
  1: { number: 1, keyword: '领导者', description: '天生具有独立和开创的特质。你自信、果断，喜欢走在前面引领方向。你的存在感强烈，别人自然会追随你的步伐。', strengths: '独立自主·果断勇敢·创新开创', challenges: '可能过于自我·需学习倾听他人' },
  2: { number: 2, keyword: '协调者', description: '天生的外交家和和平使者。你善于倾听、感受他人情绪，在合作中找到平衡。你的温柔力量是团队不可或缺的黏合剂。', strengths: '善于合作·直觉敏锐·温柔包容', challenges: '可能优柔寡断·需建立自我边界' },
  3: { number: 3, keyword: '表达者', description: '充满创造力和表达欲。你天生善于沟通，无论语言、文字还是艺术，都能将内心的灵感传递给世界。你是人群中的阳光。', strengths: '创意丰富·善于表达·社交达人', challenges: '可能分散精力·需培养专注力' },
  4: { number: 4, keyword: '建造者', description: '务实、稳定、可靠。你是将理想变为现实的执行者，一步一个脚印地构建自己的基石。你的坚持和纪律是成功的根基。', strengths: '踏实稳定·勤劳自律·责任感强', challenges: '可能过于固执·需学会灵活变通' },
  5: { number: 5, keyword: '自由魂', description: '自由和变化是你的核心。你渴望体验生命的丰富多彩，不愿被束缚。你的冒险精神和适应力让你在变化中如鱼得水。', strengths: '自由奔放·适应力强·充满冒险', challenges: '可能缺乏安定·需学会承诺与坚持' },
  6: { number: 6, keyword: '守护者', description: '天生的关爱者和责任担当。你以家庭和社群为重，用温暖和无私的爱守护身边的人。你的和谐之美让世界更温馨。', strengths: '关爱他人·责任心强·和谐温暖', challenges: '可能过度付出·需学会爱自己' },
  7: { number: 7, keyword: '智者', description: '追求真理和智慧的探索者。你内省、深思，对宇宙的奥秘有着天然的吸引力。你的直觉和洞察力超越常人。', strengths: '智慧深邃·直觉超凡·善于分析', challenges: '可能过于内敛·需学会与人连接' },
  8: { number: 8, keyword: '成就者', description: '力量与丰盛的化身。你具有卓越的商业头脑和管理能力，善于将资源转化为成果。你的气场强大，天生具有领袖魅力。', strengths: '领导力强·商业头脑·成就丰盛', challenges: '可能过于操控·需平衡物质与灵性' },
  9: { number: 9, keyword: '博爱者', description: '人道主义者和圆满的灵魂。你胸怀天下，以无私的爱关怀所有生命。你的智慧与慈悲让你成为精神的灯塔。', strengths: '博爱无私·智慧圆满·灵性觉醒', challenges: '可能理想过高·需学会放下执着' },
  11: { number: 11, keyword: '灵性使者', description: '大师数字·灵性觉醒的先驱。你具有超强的直觉和灵感力，是连接物质与灵性世界的桥梁。你的使命是启发和照亮他人。', strengths: '灵性觉醒·灵感超凡·启发他人', challenges: '可能精神敏感·需学会 grounding' },
  22: { number: 22, keyword: '大师建造者', description: '大师数字·将梦想变为现实的大师。你拥有将宏大愿景落地的能力，可以创造出影响深远的成就。你的潜力是无限的。', strengths: '大师级建造·愿景宏大·影响深远', challenges: '压力巨大·需学会分解目标' },
};

/** 灵魂渴望 (Soul Urge) — 元音 */
export const SOUL_MEANINGS: Record<number, NumberMeaning> = {
  1: { number: 1, keyword: '独立渴望', description: '内心深处渴望独立自主，成为自己生命的主人。你的灵魂追求自由和开创，不愿依附他人。', strengths: '内心独立·自我驱动', challenges: '可能内心孤独·需学会接受支持' },
  2: { number: 2, keyword: '和谐渴望', description: '灵魂深处渴望和谐与连结。你追求深层的情感共鸣，在爱与被爱中找到内心的平静。', strengths: '内心温柔·渴望连结', challenges: '可能害怕冲突·需学会表达真实' },
  3: { number: 3, keyword: '表达渴望', description: '内心渴望自由表达和创造。你的灵魂在艺术和交流中找到快乐，渴望将内心的灵感分享给世界。', strengths: '内心创意·表达欲望', challenges: '可能害怕批评·需学会真实表达' },
  4: { number: 4, keyword: '稳定渴望', description: '灵魂深处渴望安全与稳定。你追求有根基的生活，在秩序和规律中找到内心的安宁。', strengths: '内心踏实·追求稳定', challenges: '可能害怕变化·需学会拥抱流动' },
  5: { number: 5, keyword: '自由渴望', description: '内心渴望绝对的自由和体验。你的灵魂不想被任何框架束缚，渴望探索生命的每一种可能。', strengths: '内心自由·探索欲望', challenges: '可能害怕承诺·需学会在选择中自由' },
  6: { number: 6, keyword: '爱之渴望', description: '灵魂渴望爱和被爱。你内心深处是一个守护者，渴望用温暖和关怀营造和谐的家庭与关系。', strengths: '内心温暖·渴望关爱', challenges: '可能过度付出·需学会自我滋养' },
  7: { number: 7, keyword: '真理渴望', description: '内心渴望探索真理和宇宙奥秘。你的灵魂是永恒的学生，在知识和灵性中找到满足。', strengths: '内心智慧·探求真理', challenges: '可能内心孤独·需学会分享智慧' },
  8: { number: 8, keyword: '成就渴望', description: '灵魂渴望物质和精神的双重丰盛。你内心追求权力和影响力，渴望创造实实在在的成就。', strengths: '内心强大·追求成就', challenges: '可能过度追求·需学会知足' },
  9: { number: 9, keyword: '博爱渴望', description: '内心渴望以爱服务世界。你的灵魂追求无私的奉献，在帮助他人中找到最大的满足。', strengths: '内心博爱·无私奉献', challenges: '可能拯救者情结·需学会放手' },
  11: { number: 11, keyword: '灵性渴望', description: '灵魂渴望灵性觉醒和启迪。你内心追求超越物质的精神世界，渴望成为光与爱的管道。', strengths: '灵性觉醒·灵感渴望', challenges: '可能精神过敏·需学会 grounding' },
  22: { number: 22, keyword: '大师渴望', description: '灵魂渴望创造伟大的成就。你内心追求将宏大愿景变为现实，渴望留下深远的遗产。', strengths: '大师愿景·建造渴望', challenges: '可能压力过大·需学会分步前行' },
};

/** 隐藏议程 (Hidden Agenda) — 辅音 */
export const HIDDEN_MEANINGS: Record<number, NumberMeaning> = {
  1: { number: 1, keyword: '隐藏的独立', description: '潜意识中你渴望独立行动，不想被他人左右。即使外表温和，内心也有一股不屈的力量。', strengths: '内心坚定·独立意志', challenges: '可能内心倔强·需学会合作' },
  2: { number: 2, keyword: '隐藏的和谐', description: '潜意识中你渴望和平与连结。即使外表强势，内心也向往温柔的合作关系。', strengths: '内心柔软·渴望和谐', challenges: '可能压抑自我·需学会表达需求' },
  3: { number: 3, keyword: '隐藏的创意', description: '潜意识中你渴望自由表达。即使外表沉稳，内心也充满了创造的冲动和表达的欲望。', strengths: '内心丰富·创意涌动', challenges: '可能压抑表达·需学会释放' },
  4: { number: 4, keyword: '隐藏的秩序', description: '潜意识中你渴望稳定和秩序。即使外表随性，内心也在寻求安全感和生命的根基。', strengths: '内心踏实·渴望根基', challenges: '可能内心焦虑·需学会信任流动' },
  5: { number: 5, keyword: '隐藏的自由', description: '潜意识中你渴望打破束缚。即使外表守规，内心也有一股不安分的冒险精神。', strengths: '内心自由·冒险渴望', challenges: '可能内心冲突·需学会平衡' },
  6: { number: 6, keyword: '隐藏的关爱', description: '潜意识中你渴望照顾他人。即使外表独立，内心也充满了对家庭和关爱的向往。', strengths: '内心温暖·守护渴望', challenges: '可能过度担责·需学会放下' },
  7: { number: 7, keyword: '隐藏的智慧', description: '潜意识中你渴望探索真理。即使外表外向，内心也有一个安静的智者。', strengths: '内心深邃·求知渴望', challenges: '可能内心封闭·需学会开放' },
  8: { number: 8, keyword: '隐藏的力量', description: '潜意识中你渴望掌控和成就。即使外表谦和，内心也有强烈的力量感和成功欲望。', strengths: '内心强大·力量渴望', challenges: '可能控制欲强·需学会放手' },
  9: { number: 9, keyword: '隐藏的博爱', description: '潜意识中你渴望服务更大的善。即使外表务实，内心也怀着对世界的深情。', strengths: '内心慈悲·博爱渴望', challenges: '可能拯救情结·需学会界限' },
  11: { number: 11, keyword: '隐藏的灵性', description: '潜意识中你渴望灵性觉醒。即使外表世俗，内心也有对超越的深深向往。', strengths: '灵性潜能·直觉深厚', challenges: '可能内心迷茫·需学会信任直觉' },
  22: { number: 22, keyword: '隐藏的大师', description: '潜意识中你渴望创造伟大。即使外表平凡，内心也有建造大业的雄心壮志。', strengths: '大师潜能·宏大视野', challenges: '可能内心压力·需学会分步实现' },
};

/** 态度 (Attitude) — 月+日 */
export const ATTITUDE_MEANINGS: Record<number, NumberMeaning> = {
  1: { number: 1, keyword: '积极进取', description: '你以积极主动的态度面对世界。自信、果断，喜欢走在前面。你的能量让人感受到前进的动力。', strengths: '积极自信·引领方向', challenges: '可能过于急切·需学会耐心' },
  2: { number: 2, keyword: '温和协调', description: '你以温和包容的态度面对世界。善于倾听和合作，在和谐中找到自己的位置。你的存在让人安心。', strengths: '温和包容·善于协调', challenges: '可能犹豫不决·需学会果断' },
  3: { number: 3, keyword: '开朗活泼', description: '你以开朗活泼的态度面对世界。善于表达和社交，你的笑声和创意给周围带来欢乐。', strengths: '开朗表达·社交达人', challenges: '可能不够专注·需学会深入' },
  4: { number: 4, keyword: '踏实稳重', description: '你以踏实稳重的态度面对世界。可靠、自律，你的稳定感让人信任和依赖。', strengths: '踏实可靠·稳重自律', challenges: '可能过于保守·需学会变通' },
  5: { number: 5, keyword: '灵活多变', description: '你以灵活多变的态度面对世界。充满好奇心和冒险精神，你的适应力让你在任何环境都能生存。', strengths: '灵活适应·冒险精神', challenges: '可能不安定·需学会专注' },
  6: { number: 6, keyword: '温暖关怀', description: '你以温暖关怀的态度面对世界。有责任感、有爱心，你的守护让周围的人感到温暖。', strengths: '温暖有爱·责任感强', challenges: '可能过度操心·需学会放下' },
  7: { number: 7, keyword: '深思内省', description: '你以深思内省的态度面对世界。善于观察和分析，你的深度让人敬佩和信赖。', strengths: '深思智慧·观察敏锐', challenges: '可能过于内敛·需学会分享' },
  8: { number: 8, keyword: '自信强势', description: '你以自信强势的态度面对世界。有魄力和领导力，你的气场让人不由自主地追随。', strengths: '自信有力·领导力强', challenges: '可能过于强势·需学会柔软' },
  9: { number: 9, keyword: '宽容博爱', description: '你以宽容博爱的态度面对世界。有智慧和慈悲心，你的包容让周围的人感到被接纳。', strengths: '宽容博爱·智慧深邃', challenges: '可能理想过高·需学会现实' },
  11: { number: 11, keyword: '灵感直觉', description: '你以灵感和直觉面对世界。你的感知力超越常人，能感受到他人看不见的层面。', strengths: '直觉超凡·灵感丰富', challenges: '可能精神敏感·需学会 grounding' },
  22: { number: 22, keyword: '大师视野', description: '你以大师的视野面对世界。你的远见和执行力让你能将宏大梦想变为现实。', strengths: '大师视野·执行力强', challenges: '可能压力巨大·需学会分解' },
};

/** 个性 (Personality) — 生日 */
export const PERSONALITY_MEANINGS: Record<number, NumberMeaning> = {
  1: { number: 1, keyword: '独立先锋', description: '你给人的第一印象是独立和自信。你像一个先锋，走在前面，不怕开创未知的道路。', strengths: '独立自信·开创力强', challenges: '可能过于自我·需学会合作' },
  2: { number: 2, keyword: '温和外交', description: '你给人的第一印象是温和与合作。你像一个外交家，在人际交往中游刃有余。', strengths: '温和合作·善于外交', challenges: '可能优柔寡断·需学会果断' },
  3: { number: 3, keyword: '魅力表达', description: '你给人的第一印象是开朗和有魅力。你的表达力和创造力让人印象深刻。', strengths: '开朗魅力·表达力强', challenges: '可能分散精力·需学会专注' },
  4: { number: 4, keyword: '可靠基石', description: '你给人的第一印象是稳定和可靠。你像一块基石，让人感到踏实和安心。', strengths: '稳定可靠·踏实勤勉', challenges: '可能过于死板·需学会灵活' },
  5: { number: 5, keyword: '自由灵魂', description: '你给人的第一印象是自由和活力。你的冒险精神和适应力让人被你的活力吸引。', strengths: '自由活力·适应力强', challenges: '可能不安定·需学会承诺' },
  6: { number: 6, keyword: '温暖守护', description: '你给人的第一印象是温暖和关爱。你的责任感和爱心让人感到被呵护。', strengths: '温暖关爱·责任感强', challenges: '可能过度操心·需学会自我关爱' },
  7: { number: 7, keyword: '神秘智者', description: '你给人的第一印象是神秘和深邃。你的智慧和内敛让人对你产生好奇和敬意。', strengths: '深邃智慧·神秘魅力', challenges: '可能过于封闭·需学会开放' },
  8: { number: 8, keyword: '强势领袖', description: '你给人的第一印象是强大和有魄力。你的领导力和成就欲让人被你的气场所吸引。', strengths: '强大魄力·领导力强', challenges: '可能过于强势·需学会柔软' },
  9: { number: 9, keyword: '慈祥智者', description: '你给人的第一印象是慈祥和博爱。你的智慧和包容让人感到被理解和接纳。', strengths: '慈祥博爱·智慧深邃', challenges: '可能理想过高·需学会现实' },
  11: { number: 11, keyword: '灵性光芒', description: '你给人的第一印象是灵性和光芒。你的直觉和灵感让人感到一种超越的存在。', strengths: '灵性光芒·直觉敏锐', challenges: '可能精神敏感·需学会 grounding' },
  22: { number: 22, keyword: '大师气场', description: '你给人的第一印象是大师般的气度和远见。你的存在让人感到一种强大的信赖。', strengths: '大师气度·远见卓识', challenges: '可能压力过大·需学会放松' },
};

/** 命运 (Destiny) — 月+日+年 */
export const DESTINY_MEANINGS: Record<number, NumberMeaning> = {
  1: { number: 1, keyword: '领导之命', description: '你的命运是成为领导者和开创者。你的人生道路指向独立自主，用自己的力量开辟新路径。', strengths: '领导开创·独立自主', challenges: '需学习合作与谦逊' },
  2: { number: 2, keyword: '和谐之命', description: '你的命运是成为和平使者和协调者。你的人生道路指向合作与连结，在和谐中找到自己的力量。', strengths: '和平协调·合作连结', challenges: '需学习独立与果断' },
  3: { number: 3, keyword: '表达之命', description: '你的命运是成为创造者和表达者。你的人生道路指向用创意和语言启发世界。', strengths: '创造表达·启发他人', challenges: '需学习专注与深入' },
  4: { number: 4, keyword: '建造之命', description: '你的命运是成为建造者和基石。你的人生道路指向用勤劳和稳定构建持久的成就。', strengths: '勤劳稳定·建造基石', challenges: '需学习灵活与变通' },
  5: { number: 5, keyword: '自由之命', description: '你的命运是体验自由和变化。你的人生道路指向探索和冒险，在变化中找到成长。', strengths: '自由探索·适应变化', challenges: '需学习专注与承诺' },
  6: { number: 6, keyword: '守护之命', description: '你的命运是成为守护者和关爱者。你的人生道路指向用爱和责任温暖周围的人。', strengths: '关爱守护·温暖他人', challenges: '需学习自我关爱与界限' },
  7: { number: 7, keyword: '智慧之命', description: '你的命运是追求智慧和真理。你的人生道路指向内省和探索，在知识中找到光明。', strengths: '智慧探索·真理追求', challenges: '需学习与人分享和连接' },
  8: { number: 8, keyword: '成就之命', description: '你的命运是创造丰盛和成就。你的人生道路指向用力量和智慧将资源转化为成果。', strengths: '力量成就·资源转化', challenges: '需学习平衡物质与灵性' },
  9: { number: 9, keyword: '博爱之命', description: '你的命运是博爱和服务。你的人生道路指向以无私的慈悲关怀更大的善。', strengths: '博爱服务·无私慈悲', challenges: '需学习放下执着与现实' },
  11: { number: 11, keyword: '灵性之命', description: '你的命运是灵性觉醒和启迪。你的人生道路指向成为光与爱的管道，照亮他人的路。', strengths: '灵性觉醒·启迪他人', challenges: '需学会 grounding 与自我保护' },
  22: { number: 22, keyword: '大师之命', description: '你的命运是将宏大梦想变为现实。你的人生道路指向创造影响深远的成就。', strengths: '大师建造·宏大愿景', challenges: '需学会分解目标与自我关怀' },
};

// ===== 便捷查找 =====

export function getMeaning(dimension: NumerologyDimension, value: number): NumberMeaning | undefined {
  const map: Record<NumerologyDimension, Record<number, NumberMeaning>> = {
    character: CHARACTER_MEANINGS,
    soul: SOUL_MEANINGS,
    hidden: HIDDEN_MEANINGS,
    attitude: ATTITUDE_MEANINGS,
    personality: PERSONALITY_MEANINGS,
    destiny: DESTINY_MEANINGS,
    divine: DESTINY_MEANINGS, // 神圣使命复用命运数据
  };
  return map[dimension]?.[value];
}
