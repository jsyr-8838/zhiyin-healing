/**
 * 二十四节气 · 脊柱身心疗法 数据模块
 *
 * 数据来源：
 * - 椎体解剖参数: Gray's Anatomy 标准解剖学数据
 * - 节气-椎骨映射: 源自中医脊柱身心疗法体系
 * - 经络-情志关联: 《黄帝内经》《针灸甲乙经》
 * - 五行映射: 木火土金水 → 五音/五味/五色/五志
 *
 * 核心理论：
 * 24节气从冬至(0)到大雪(23)，对应人体从骶椎到颈椎2的25块椎骨
 * 颈胸配对关系：颈椎7对胸椎12、颈椎6对胸椎11等
 * 每块椎骨对应一条经络，移位可引发特定身心失衡
 */

/* ===== 类型定义 ===== */

export type VertebraType = 'sacrum' | 'lumbar' | 'thoracic' | 'cervical';
export type WuxingElement = '木' | '火' | '土' | '金' | '水';
export type Season = '春' | '夏' | '秋' | '冬';

export interface SpineSolarEntry {
  /** 节气名称 */
  solarTerm: string;
  /** 英文名 */
  solarTermEn: string;
  /** 序号 0-23 (冬至起) */
  solarTermOrder: number;
  /** 椎骨中文名 */
  vertebra: string;
  /** 椎骨编码 (S+C1, L5, T12, C7 等) */
  vertebraCode: string;
  /** 椎骨区域 */
  vertebraType: VertebraType;
  /** 身体区域描述 */
  region: string;
  /** 健康风险 */
  healthRisks: string[];
  /** 对应经络 */
  meridian: string;
  /** 经络编码 */
  meridianCode: string;
  /** 情志心理模式 */
  psychology: string;
  /** 根因分析 */
  causes: string;
  /** 五行归属 */
  wuxing: WuxingElement;
  /** 季节 */
  season: Season;
  /** 配对椎骨编码 */
  pairedVertebra?: string;
  /** 配对经络 */
  pairedMeridian?: string;
  /** 疗愈方案 */
  healingSolutions: string[];
  /** 推荐五音 */
  recommendedTone: string;
  /** 推荐六字诀 */
  recommendedLiuzijue: string;
  /** 推荐经络穴位 */
  recommendedAcupoints: string[];
  /** 养生饮食 */
  dietAdvice: string;
  /** 节气起居 */
  routineAdvice: string;
  /** 禁忌 */
  contraindication: string;
}

/* ===== 五行色系映射 (zhi-yin 设计系统) ===== */

export const WUXING_COLORS: Record<WuxingElement, string> = {
  '木': '#5d8a63',  // 青瓷绿
  '火': '#c26158',  // 朱砂红
  '土': '#c9a94f',  // 暮金
  '金': '#5ba09a',  // 青蓝
  '水': '#3d7a75',  // 深天青
};

export const WUXING_TONES: Record<WuxingElement, string> = {
  '木': '角音',
  '火': '徵音',
  '土': '宫音',
  '金': '商音',
  '水': '羽音',
};

export const WUXING_LIUZIJUE: Record<WuxingElement, string> = {
  '木': '嘘',
  '火': '呵',
  '土': '呼',
  '金': '呬',
  '水': '吹',
};

export const SEASON_COLORS: Record<Season, string> = {
  '春': '#5d8a63',
  '夏': '#c26158',
  '秋': '#c9a94f',
  '冬': '#3d7a75',
};

export const SEASON_GRADIENTS: Record<Season, [string, string]> = {
  '春': ['#e8f5e9', '#c8e6c9'],
  '夏': ['#fce4ec', '#f8bbd0'],
  '秋': ['#fff8e1', '#ffecb3'],
  '冬': ['#e0f2f1', '#b2dfdb'],
};

export const SEASON_ICONS: Record<Season, string> = {
  '春': '🌸',
  '夏': '☀️',
  '秋': '🍂',
  '冬': '❄️',
};

/* ===== 3D脊柱区域颜色 (宋韵暖色系) ===== */

export const REGION_COLORS: Record<VertebraType, string> = {
  sacrum: '#c97b63',    // 赤陶暖红
  lumbar: '#c9a94f',    // 暮金
  thoracic: '#5d8a63',  // 青瓷绿
  cervical: '#5ba09a',  // 青蓝
};

/* ===== 椎体解剖参数 (Gray's Anatomy, mm) ===== */

export interface VertebraParam {
  y: number;
  bodyW: number;
  bodyH: number;
  canalW: number;
  transverseW: number;
  spinous: number;
  name: string;
  en: string;
  code: string;
  type: VertebraType;
}

export const VERTEBRA_PARAMS: Record<string, VertebraParam> = {
  sacrum: { y: 0, bodyW: 48, bodyH: 110, canalW: 30, transverseW: 0, spinous: 0, name: '骶骨', en: 'Sacrum', code: 'S', type: 'sacrum' },
  L5: { y: 120, bodyW: 44, bodyH: 24, canalW: 22, transverseW: 38, spinous: 28, name: '腰椎5', en: 'L5', code: 'L5', type: 'lumbar' },
  L4: { y: 147, bodyW: 42, bodyH: 24, canalW: 21, transverseW: 36, spinous: 27, name: '腰椎4', en: 'L4', code: 'L4', type: 'lumbar' },
  L3: { y: 174, bodyW: 40, bodyH: 23, canalW: 20, transverseW: 34, spinous: 26, name: '腰椎3', en: 'L3', code: 'L3', type: 'lumbar' },
  L2: { y: 200, bodyW: 38, bodyH: 23, canalW: 20, transverseW: 32, spinous: 25, name: '腰椎2', en: 'L2', code: 'L2', type: 'lumbar' },
  L1: { y: 226, bodyW: 36, bodyH: 22, canalW: 19, transverseW: 30, spinous: 24, name: '腰椎1', en: 'L1', code: 'L1', type: 'lumbar' },
  T12: { y: 253, bodyW: 33, bodyH: 20, canalW: 18, transverseW: 40, spinous: 22, name: '胸椎12', en: 'T12', code: 'T12', type: 'thoracic' },
  T11: { y: 276, bodyW: 31, bodyH: 19, canalW: 17, transverseW: 42, spinous: 24, name: '胸椎11', en: 'T11', code: 'T11', type: 'thoracic' },
  T10: { y: 298, bodyW: 29, bodyH: 18, canalW: 17, transverseW: 44, spinous: 26, name: '胸椎10', en: 'T10', code: 'T10', type: 'thoracic' },
  T9:  { y: 319, bodyW: 27, bodyH: 17, canalW: 16, transverseW: 44, spinous: 27, name: '胸椎9', en: 'T9', code: 'T9', type: 'thoracic' },
  T8:  { y: 339, bodyW: 26, bodyH: 17, canalW: 16, transverseW: 42, spinous: 28, name: '胸椎8', en: 'T8', code: 'T8', type: 'thoracic' },
  T7:  { y: 359, bodyW: 25, bodyH: 16, canalW: 15, transverseW: 40, spinous: 29, name: '胸椎7', en: 'T7', code: 'T7', type: 'thoracic' },
  T6:  { y: 378, bodyW: 24, bodyH: 16, canalW: 15, transverseW: 38, spinous: 30, name: '胸椎6', en: 'T6', code: 'T6', type: 'thoracic' },
  T5:  { y: 397, bodyW: 23, bodyH: 15, canalW: 15, transverseW: 36, spinous: 30, name: '胸椎5', en: 'T5', code: 'T5', type: 'thoracic' },
  T4:  { y: 415, bodyW: 22, bodyH: 15, canalW: 14, transverseW: 34, spinous: 30, name: '胸椎4', en: 'T4', code: 'T4', type: 'thoracic' },
  T3:  { y: 433, bodyW: 21, bodyH: 15, canalW: 14, transverseW: 32, spinous: 30, name: '胸椎3', en: 'T3', code: 'T3', type: 'thoracic' },
  T2:  { y: 451, bodyW: 20, bodyH: 14, canalW: 14, transverseW: 30, spinous: 28, name: '胸椎2', en: 'T2', code: 'T2', type: 'thoracic' },
  T1:  { y: 468, bodyW: 20, bodyH: 14, canalW: 14, transverseW: 34, spinous: 28, name: '胸椎1', en: 'T1', code: 'T1', type: 'thoracic' },
  C7:  { y: 488, bodyW: 18, bodyH: 13, canalW: 14, transverseW: 28, spinous: 26, name: '颈椎7', en: 'C7', code: 'C7', type: 'cervical' },
  C6:  { y: 504, bodyW: 17, bodyH: 12, canalW: 15, transverseW: 26, spinous: 18, name: '颈椎6', en: 'C6', code: 'C6', type: 'cervical' },
  C5:  { y: 519, bodyW: 16, bodyH: 11, canalW: 15, transverseW: 25, spinous: 16, name: '颈椎5', en: 'C5', code: 'C5', type: 'cervical' },
  C4:  { y: 533, bodyW: 16, bodyH: 11, canalW: 15, transverseW: 24, spinous: 15, name: '颈椎4', en: 'C4', code: 'C4', type: 'cervical' },
  C3:  { y: 547, bodyW: 15, bodyH: 10, canalW: 15, transverseW: 24, spinous: 14, name: '颈椎3', en: 'C3', code: 'C3', type: 'cervical' },
  C2:  { y: 560, bodyW: 14, bodyH: 16, canalW: 14, transverseW: 22, spinous: 16, name: '颈椎2(枢椎)', en: 'C2', code: 'C2', type: 'cervical' },
  C1:  { y: 582, bodyW: 28, bodyH: 8, canalW: 18, transverseW: 30, spinous: 0, name: '颈椎1(寰椎)', en: 'C1', code: 'C1', type: 'cervical' },
};

/* ===== 节气日期表 ===== */

export interface SolarTermDate {
  term: string;
  month: number;
  day: number;
}

const SOLAR_TERM_DATES: SolarTermDate[] = [
  { term: '小寒', month: 1, day: 6 },
  { term: '大寒', month: 1, day: 20 },
  { term: '立春', month: 2, day: 4 },
  { term: '雨水', month: 2, day: 19 },
  { term: '惊蛰', month: 3, day: 6 },
  { term: '春分', month: 3, day: 21 },
  { term: '清明', month: 4, day: 5 },
  { term: '谷雨', month: 4, day: 20 },
  { term: '立夏', month: 5, day: 6 },
  { term: '小满', month: 5, day: 21 },
  { term: '芒种', month: 6, day: 6 },
  { term: '夏至', month: 6, day: 21 },
  { term: '小暑', month: 7, day: 7 },
  { term: '大暑', month: 7, day: 23 },
  { term: '立秋', month: 8, day: 7 },
  { term: '处暑', month: 8, day: 23 },
  { term: '白露', month: 9, day: 8 },
  { term: '秋分', month: 9, day: 23 },
  { term: '寒露', month: 10, day: 8 },
  { term: '霜降', month: 10, day: 23 },
  { term: '立冬', month: 11, day: 7 },
  { term: '小雪', month: 11, day: 22 },
  { term: '大雪', month: 12, day: 7 },
  { term: '冬至', month: 12, day: 22 },
];

export const ORDERED_TERMS = [
  '冬至', '小寒', '大寒', '立春', '雨水', '惊蛰',
  '春分', '清明', '谷雨', '立夏', '小满', '芒种',
  '夏至', '小暑', '大暑', '立秋', '处暑', '白露',
  '秋分', '寒露', '霜降', '立冬', '小雪', '大雪',
];

/* ===== 核心24节气脊柱数据 ===== */

const SPINE_SOLAR_DATABASE: SpineSolarEntry[] = [
  {
    solarTerm: '冬至', solarTermEn: 'Winter Solstice', solarTermOrder: 0,
    vertebra: '骶椎+尾椎', vertebraCode: 'S+C1', vertebraType: 'sacrum',
    region: '腰椎骶椎区',
    healthRisks: ['下腹部寒凉', '女性痛经', '宫寒', '疲劳', '下肢酸痛', '痛风', '内分泌失调', '高低肩', '脊柱侧弯', '足跟疼'],
    meridian: '胃经', meridianCode: 'ST',
    psychology: '地基承载点，出生前家庭环境，失神状态(自闭/多动/注意力不集中)',
    causes: '外伤、家庭原始环境',
    wuxing: '水', season: '冬',
    pairedVertebra: 'C1', pairedMeridian: '胃经',
    healingSolutions: ['骶椎正位', '胃经疏通', '下腹部温灸'],
    recommendedTone: '羽音', recommendedLiuzijue: '吹',
    recommendedAcupoints: ['涌泉', '足三里', '中脘'],
    dietAdvice: '温补元阳，食羊肉饺子',
    routineAdvice: '极寒养藏，适度进补',
    contraindication: '忌剧烈运动，忌暴饮暴食',
  },
  {
    solarTerm: '小寒', solarTermEn: 'Minor Cold', solarTermOrder: 1,
    vertebra: '腰椎5', vertebraCode: 'L5', vertebraType: 'lumbar',
    region: '腰椎区',
    healthRisks: ['腰椎间盘突出', '小腿寒凉酸胀', '小腹疼痛', '月经不调'],
    meridian: '肺经', meridianCode: 'LU',
    psychology: '做事动力不足、意志力薄弱、易成瘾、惰性十足',
    causes: '家庭环境影响父母关系不好、0-3岁创伤事件、意外受伤',
    wuxing: '水', season: '冬',
    healingSolutions: ['牵引复位', '肺经疏通', '腰5结节松解'],
    recommendedTone: '羽音', recommendedLiuzijue: '吹',
    recommendedAcupoints: ['太渊', '肺俞', '肾俞'],
    dietAdvice: '温补脾肾，食栗子花生',
    routineAdvice: '防寒保暖，减少外出',
    contraindication: '忌食寒凉生冷，忌大汗淋漓',
  },
  {
    solarTerm: '大寒', solarTermEn: 'Major Cold', solarTermOrder: 2,
    vertebra: '腰椎4', vertebraCode: 'L4', vertebraType: 'lumbar',
    region: '腰椎区',
    healthRisks: ['腰椎间盘突出', '排尿异常(前列腺)', '小腿外侧麻疼'],
    meridian: '心包经', meridianCode: 'PC',
    psychology: '暴力倾向、歇斯底里、抑郁躁狂双向障碍、过度排外敌对',
    causes: '父母一方脾气不好被打骂体罚、父母打架被吓到',
    wuxing: '水', season: '冬',
    healingSolutions: ['牵引复位', '心包经疏通', '腰4结节松解'],
    recommendedTone: '羽音', recommendedLiuzijue: '吹',
    recommendedAcupoints: ['内关', '大陵', '心俞'],
    dietAdvice: '温补收官，食八宝粥',
    routineAdvice: '养藏收尾，准备迎春',
    contraindication: '忌寒凉食物，忌过度劳累',
  },
  {
    solarTerm: '立春', solarTermEn: 'Start of Spring', solarTermOrder: 3,
    vertebra: '腰椎3', vertebraCode: 'L3', vertebraType: 'lumbar',
    region: '腰椎区',
    healthRisks: ['膝关节病变', '膀胱功能异常', '子宫卵巢问题'],
    meridian: '心经', meridianCode: 'HT',
    psychology: '黑白分明是非感太强、爱做口舌之争说狠话、一语成谶、语言暴力',
    causes: '父母双方文化程度不等、经常看到父母吵架争执',
    wuxing: '木', season: '春',
    healingSolutions: ['牵引复位', '心经疏通', '腰3结节松解'],
    recommendedTone: '角音', recommendedLiuzijue: '嘘',
    recommendedAcupoints: ['神门', '少海', '心俞'],
    dietAdvice: '辛甘发散，食韭菜香菜',
    routineAdvice: '夜卧早起，舒展筋骨',
    contraindication: '忌酸收之品，忌久坐不动',
  },
  {
    solarTerm: '雨水', solarTermEn: 'Rain Water', solarTermOrder: 4,
    vertebra: '腰椎2', vertebraCode: 'L2', vertebraType: 'lumbar',
    region: '腰椎区',
    healthRisks: ['肾上腺异常', '肾结石'],
    meridian: '胆经', meridianCode: 'GB',
    psychology: '爱面子、好为人师讲大道理、偶像包袱、义字当先讲情义',
    causes: '父母教育过于严格、教养没被内化流于表面',
    wuxing: '木', season: '春',
    healingSolutions: ['牵引复位', '胆经疏通', '腰2结节松解'],
    recommendedTone: '角音', recommendedLiuzijue: '嘘',
    recommendedAcupoints: ['阳陵泉', '悬钟', '胆俞'],
    dietAdvice: '少酸多甘，食山药大枣',
    routineAdvice: '晨起缓行，防风保暖',
    contraindication: '忌肥甘厚味，忌淋雨受凉',
  },
  {
    solarTerm: '惊蛰', solarTermEn: 'Awakening of Insects', solarTermOrder: 5,
    vertebra: '腰椎1', vertebraCode: 'L1', vertebraType: 'lumbar',
    region: '腰椎区',
    healthRisks: ['生殖系统问题', '不孕不育', '性冷淡', '触觉不灵敏麻木'],
    meridian: '膀胱经', meridianCode: 'BL',
    psychology: '与异性接触有障碍、很多事把性别划分考虑、女性任劳任怨偏袒娘家',
    causes: '父母对孩子期望过高、没有从原生家庭蜕变、缺乏成人礼',
    wuxing: '木', season: '春',
    healingSolutions: ['牵引复位', '膀胱经疏通', '腰1结节松解'],
    recommendedTone: '角音', recommendedLiuzijue: '嘘',
    recommendedAcupoints: ['委中', '昆仑', '膀胱俞'],
    dietAdvice: '清淡养肝，食菠菜芹菜',
    routineAdvice: '早起运动，顺应阳气',
    contraindication: '忌暴怒，忌辛辣过度',
  },
  {
    solarTerm: '春分', solarTermEn: 'Spring Equinox', solarTermOrder: 6,
    vertebra: '胸椎12', vertebraCode: 'T12', vertebraType: 'thoracic',
    region: '胸腰椎交界区',
    healthRisks: ['血糖异常', '疲劳', '上宽下窄或上窄下宽体型'],
    meridian: '三焦经', meridianCode: 'TE',
    psychology: '轻易承诺轻诺必寡信、爱吹牛、不懂拒绝、容易受委屈',
    causes: '家庭环境',
    wuxing: '木', season: '春',
    pairedVertebra: 'C7', pairedMeridian: '三焦经',
    healingSolutions: ['胸椎复位', '三焦经疏通', 'T12结节松解'],
    recommendedTone: '角音', recommendedLiuzijue: '嘘',
    recommendedAcupoints: ['支沟', '天井', '三焦俞'],
    dietAdvice: '阴阳均衡，忌偏热偏寒',
    routineAdvice: '作息有常，心情舒畅',
    contraindication: '忌偏食偏嗜，忌情绪极端',
  },
  {
    solarTerm: '清明', solarTermEn: 'Clear and Bright', solarTermOrder: 7,
    vertebra: '胸椎11', vertebraCode: 'T11', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['免疫系统疾病(红斑狼疮、克罗恩病等)', '肿瘤癌症'],
    meridian: '肾经', meridianCode: 'KI',
    psychology: '恐惧(原始情绪)→次生情绪、自私(根源恐惧能量不够)、一惊一乍、不愿意别人好',
    causes: '深层恐惧未化解',
    wuxing: '木', season: '春',
    pairedVertebra: 'C6', pairedMeridian: '肾经',
    healingSolutions: ['胸椎复位', '肾经疏通', 'T11结节松解'],
    recommendedTone: '角音', recommendedLiuzijue: '嘘',
    recommendedAcupoints: ['涌泉', '太溪', '肾俞'],
    dietAdvice: '柔肝养肺，食银耳百合',
    routineAdvice: '踏青散步，亲近自然',
    contraindication: '忌食发物，忌怒火攻心',
  },
  {
    solarTerm: '谷雨', solarTermEn: 'Grain Rain', solarTermOrder: 8,
    vertebra: '胸椎10', vertebraCode: 'T10', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['腹腔神经丛异常', '肠道问题(横结肠)', '肠易激综合征', '消化不良'],
    meridian: '大肠经', meridianCode: 'LI',
    psychology: '悲观消极抑郁、看什么都不顺眼快乐不起来',
    causes: '持续的消极情绪积累',
    wuxing: '土', season: '春',
    pairedVertebra: 'C5', pairedMeridian: '大肠经',
    healingSolutions: ['胸椎复位', '大肠经疏通', '揉腹调理'],
    recommendedTone: '宫音', recommendedLiuzijue: '呼',
    recommendedAcupoints: ['合谷', '曲池', '大肠俞'],
    dietAdvice: '增甘减酸，食薏仁红豆',
    routineAdvice: '适度运动，防湿保暖',
    contraindication: '忌寒凉伤脾，忌久坐湿地',
  },
  {
    solarTerm: '立夏', solarTermEn: 'Start of Summer', solarTermOrder: 9,
    vertebra: '胸椎9', vertebraCode: 'T9', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['消化不良', '脾湿脾虚', '虚胖'],
    meridian: '脾经', meridianCode: 'SP',
    psychology: '自由任性、总感觉被约束、逃避',
    causes: '成长过程中被过度约束或过度放任',
    wuxing: '火', season: '夏',
    pairedVertebra: 'C4', pairedMeridian: '脾经',
    healingSolutions: ['胸椎复位', '脾经疏通', 'T9结节松解'],
    recommendedTone: '徵音', recommendedLiuzijue: '呵',
    recommendedAcupoints: ['太白', '血海', '脾俞'],
    dietAdvice: '清淡为主，食绿豆莲子',
    routineAdvice: '夜卧早起，午间小憩',
    contraindication: '忌大喜大悲，忌暴晒暴汗',
  },
  {
    solarTerm: '小满', solarTermEn: 'Grain Buds', solarTermOrder: 10,
    vertebra: '胸椎8', vertebraCode: 'T8', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['胆囊问题', '胆结石', '胆囊炎'],
    meridian: '小肠经', meridianCode: 'SI',
    psychology: '犹豫不决、胆子小敬畏感安全感不足、喜欢把控、风险意识强',
    causes: '成长中缺乏安全感',
    wuxing: '火', season: '夏',
    pairedVertebra: 'C3', pairedMeridian: '小肠经',
    healingSolutions: ['胸椎复位', '小肠经疏通', 'T8结节松解'],
    recommendedTone: '徵音', recommendedLiuzijue: '呵',
    recommendedAcupoints: ['后溪', '天宗', '小肠俞'],
    dietAdvice: '清热利湿，食冬瓜薏米',
    routineAdvice: '避免贪凉，静心养神',
    contraindication: '忌冰饮寒凉，忌空调直吹',
  },
  {
    solarTerm: '芒种', solarTermEn: 'Grain in Ear', solarTermOrder: 11,
    vertebra: '胸椎7', vertebraCode: 'T7', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['肝硬化', '肝炎', '脂肪肝'],
    meridian: '肝经', meridianCode: 'LR',
    psychology: '目标感非常强、聪明什么都能懂一点、欲望强烈',
    causes: '追求目标过程中的执念',
    wuxing: '火', season: '夏',
    pairedVertebra: 'C2', pairedMeridian: '肝经',
    healingSolutions: ['胸椎复位', '肝经疏通', 'T7结节松解'],
    recommendedTone: '徵音', recommendedLiuzijue: '呵',
    recommendedAcupoints: ['太冲', '期门', '肝俞'],
    dietAdvice: '清补为主，食苦瓜黄瓜',
    routineAdvice: '午睡养心，避免烈日',
    contraindication: '忌烈日暴晒，忌辛辣燥热',
  },
  {
    solarTerm: '夏至', solarTermEn: 'Summer Solstice', solarTermOrder: 12,
    vertebra: '胸椎6', vertebraCode: 'T6', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['胃疼', '嗝逆打嗝', '胃痉挛胃溃疡'],
    meridian: '胃经', meridianCode: 'ST',
    psychology: '喋喋不休唠叨怨气太重、总觉得别人不理解自己、不会沟通表达不清楚',
    causes: '长期压抑的沟通需求',
    wuxing: '火', season: '夏',
    healingSolutions: ['胸椎复位', '胃经疏通', 'T6结节松解'],
    recommendedTone: '徵音', recommendedLiuzijue: '呵',
    recommendedAcupoints: ['足三里', '梁丘', '胃俞'],
    dietAdvice: '忌食生冷，食酸梅绿豆',
    routineAdvice: '养阳护阴，夜卧早起',
    contraindication: '忌贪凉过度，忌房事过度',
  },
  {
    solarTerm: '小暑', solarTermEn: 'Minor Heat', solarTermOrder: 13,
    vertebra: '胸椎5', vertebraCode: 'T5', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['肺炎支气管炎', '哮喘', '过敏性鼻炎', '腹泻'],
    meridian: '肺经', meridianCode: 'LU',
    psychology: '过度关注细节掉进细节出不来、挑剔吹毛求疵、完美主义拖延、精致有品位',
    causes: '对完美的过度追求',
    wuxing: '火', season: '夏',
    healingSolutions: ['胸椎复位', '肺经疏通', 'T5结节松解'],
    recommendedTone: '徵音', recommendedLiuzijue: '呵',
    recommendedAcupoints: ['尺泽', '列缺', '肺俞'],
    dietAdvice: '清淡消暑，食西瓜荷叶',
    routineAdvice: '避免暑热，静心养气',
    contraindication: '忌冷水浴，忌暴饮暴食',
  },
  {
    solarTerm: '大暑', solarTermEn: 'Major Heat', solarTermOrder: 14,
    vertebra: '胸椎4', vertebraCode: 'T4', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['膈肌膻中异常', '胸口闷气短', '抑郁'],
    meridian: '心包经', meridianCode: 'PC',
    psychology: '纠结上下为难、问题思维模式、压抑越努力越有障碍、很努力执行力强、做承上启下的事',
    causes: '长期处在夹板气的位置',
    wuxing: '土', season: '夏',
    healingSolutions: ['胸椎复位', '心包经疏通', '松解肠道', 'T4结节松解'],
    recommendedTone: '宫音', recommendedLiuzijue: '呼',
    recommendedAcupoints: ['内关', '大陵', '心包俞'],
    dietAdvice: '清热解暑，食绿豆百合',
    routineAdvice: '防暑降温，安神定志',
    contraindication: '忌暴晒中暑，忌贪凉伤脾',
  },
  {
    solarTerm: '立秋', solarTermEn: 'Start of Autumn', solarTermOrder: 15,
    vertebra: '胸椎3', vertebraCode: 'T3', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['心梗', '脑中风', '血压升高', '甲状腺异常'],
    meridian: '心经', meridianCode: 'HT',
    psychology: '压力大爱操心、掌控把控我要说了算、被动靠自己别人靠不住、底线思维',
    causes: '长期承担过多责任',
    wuxing: '金', season: '秋',
    healingSolutions: ['胸椎复位', '心经疏通', 'T3结节松解'],
    recommendedTone: '商音', recommendedLiuzijue: '呬',
    recommendedAcupoints: ['神门', '少海', '心俞'],
    dietAdvice: '滋阴润燥，食梨银耳',
    routineAdvice: '早卧早起，收敛神气',
    contraindication: '忌辛辣燥热，忌大汗耗气',
  },
  {
    solarTerm: '处暑', solarTermEn: 'End of Heat', solarTermOrder: 16,
    vertebra: '胸椎2', vertebraCode: 'T2', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['肩周炎', '乳腺问题'],
    meridian: '胆经', meridianCode: 'GB',
    psychology: '忍受假包容(交易交换有目的地)、让步忍让不心甘情愿情绪积压冤枉、跟性别相关的忍受→乳腺',
    causes: '长期的忍让和委屈',
    wuxing: '金', season: '秋',
    healingSolutions: ['胸椎复位', '胆经疏通', 'T2结节松解'],
    recommendedTone: '商音', recommendedLiuzijue: '呬',
    recommendedAcupoints: ['阳陵泉', '肩井', '胆俞'],
    dietAdvice: '少辛多酸，食蜂蜜芝麻',
    routineAdvice: '秋冻适度，养肺为先',
    contraindication: '忌辛辣煎炸，忌冷水浴',
  },
  {
    solarTerm: '白露', solarTermEn: 'White Dew', solarTermOrder: 17,
    vertebra: '胸椎1', vertebraCode: 'T1', vertebraType: 'thoracic',
    region: '胸椎区',
    healthRisks: ['手腕酸麻', '身体柔软', '肾衰竭尿毒症'],
    meridian: '膀胱经', meridianCode: 'BL',
    psychology: '缺爱不会爱、什么都可以原则感不强、不怎么分内外、有服务意识乐于助人乐于奉献',
    causes: '童年缺爱的经历',
    wuxing: '金', season: '秋',
    healingSolutions: ['胸椎复位', '膀胱经疏通', 'T1结节松解'],
    recommendedTone: '商音', recommendedLiuzijue: '呬',
    recommendedAcupoints: ['委中', '昆仑', '膀胱俞'],
    dietAdvice: '温润养肺，食山药百合',
    routineAdvice: '早晚添衣，防寒保暖',
    contraindication: '忌秋冻过度，忌食冷饮',
  },
  {
    solarTerm: '秋分', solarTermEn: 'Autumnal Equinox', solarTermOrder: 18,
    vertebra: '颈椎7', vertebraCode: 'C7', vertebraType: 'cervical',
    region: '颈胸交界区',
    healthRisks: ['肩颈不适上肢麻木', '低血压心率失常', '甲状腺异常'],
    meridian: '三焦经', meridianCode: 'TE',
    psychology: '平衡力-游刃有余、诚信',
    causes: '-',
    wuxing: '金', season: '秋',
    pairedVertebra: 'T12', pairedMeridian: '三焦经',
    healingSolutions: ['颈椎复位', '三焦经疏通'],
    recommendedTone: '商音', recommendedLiuzijue: '呬',
    recommendedAcupoints: ['支沟', '天井', '三焦俞'],
    dietAdvice: '阴阳均衡，食梨枸杞',
    routineAdvice: '作息有常，心情平和',
    contraindication: '忌忧思过度，忌饮食无常',
  },
  {
    solarTerm: '寒露', solarTermEn: 'Cold Dew', solarTermOrder: 19,
    vertebra: '颈椎6', vertebraCode: 'C6', vertebraType: 'cervical',
    region: '颈椎区',
    healthRisks: ['食道气管扁桃体异常', '慢性咳嗽', '牙疼三叉神经痛'],
    meridian: '肾经', meridianCode: 'KI',
    psychology: '大无畏有边界感敬畏心勇敢',
    causes: '-',
    wuxing: '金', season: '秋',
    pairedVertebra: 'T11', pairedMeridian: '肾经',
    healingSolutions: ['颈椎复位', '肾经疏通'],
    recommendedTone: '商音', recommendedLiuzijue: '呬',
    recommendedAcupoints: ['涌泉', '太溪', '肾俞'],
    dietAdvice: '温补脾肾，食栗子核桃',
    routineAdvice: '早卧晚起，防寒护阳',
    contraindication: '忌寒凉食物，忌过度劳累',
  },
  {
    solarTerm: '霜降', solarTermEn: "Frost's Descent", solarTermOrder: 20,
    vertebra: '颈椎5', vertebraCode: 'C5', vertebraType: 'cervical',
    region: '颈椎区',
    healthRisks: ['眩晕', '视力下降眼疾', '咽喉问题'],
    meridian: '大肠经', meridianCode: 'LI',
    psychology: '有慈悲心共情能力强、悲观消极转换成大慈大悲',
    causes: '-',
    wuxing: '土', season: '秋',
    pairedVertebra: 'T10', pairedMeridian: '大肠经',
    healingSolutions: ['颈椎复位', '大肠经疏通'],
    recommendedTone: '宫音', recommendedLiuzijue: '呼',
    recommendedAcupoints: ['合谷', '曲池', '大肠俞'],
    dietAdvice: '温补为主，食羊肉萝卜',
    routineAdvice: '适度运动，保暖防寒',
    contraindication: '忌寒凉生冷，忌冒霜出行',
  },
  {
    solarTerm: '立冬', solarTermEn: 'Start of Winter', solarTermOrder: 21,
    vertebra: '颈椎4', vertebraCode: 'C4', vertebraType: 'cervical',
    region: '颈椎区',
    healthRisks: ['牙疼三叉神经痛', '甲亢', '湿疹'],
    meridian: '脾经', meridianCode: 'SP',
    psychology: '得大自在天马行空思考没边界、逍遥游-庄子、艺术家通过艺术哲思文学感受',
    causes: '-',
    wuxing: '水', season: '冬',
    pairedVertebra: 'T9', pairedMeridian: '脾经',
    healingSolutions: ['颈椎复位', '脾经疏通'],
    recommendedTone: '羽音', recommendedLiuzijue: '吹',
    recommendedAcupoints: ['太白', '血海', '脾俞'],
    dietAdvice: '温补养藏，食黑豆核桃',
    routineAdvice: '早卧晚起，养藏阳气',
    contraindication: '忌寒凉伤肾，忌大汗淋漓',
  },
  {
    solarTerm: '小雪', solarTermEn: 'Minor Snow', solarTermOrder: 22,
    vertebra: '颈椎3', vertebraCode: 'C3', vertebraType: 'cervical',
    region: '颈椎区',
    healthRisks: ['颈部僵硬', '上肢麻木'],
    meridian: '小肠经', meridianCode: 'SI',
    psychology: '谨慎固执考虑全面、断见(金刚经-能断金刚)',
    causes: '-',
    wuxing: '水', season: '冬',
    pairedVertebra: 'T8', pairedMeridian: '小肠经',
    healingSolutions: ['颈椎复位', '小肠经疏通'],
    recommendedTone: '羽音', recommendedLiuzijue: '吹',
    recommendedAcupoints: ['后溪', '天宗', '小肠俞'],
    dietAdvice: '温补肾阳，食羊肉桂圆',
    routineAdvice: '保暖防寒，静心养神',
    contraindication: '忌忧思过度，忌寒冷环境久留',
  },
  {
    solarTerm: '大雪', solarTermEn: 'Major Snow', solarTermOrder: 23,
    vertebra: '颈椎2', vertebraCode: 'C2', vertebraType: 'cervical',
    region: '颈椎区',
    healthRisks: ['晕眩斜视眼部疾患', '偏头痛'],
    meridian: '肝经', meridianCode: 'LR',
    psychology: '愿力高阶-念力、沟通力、有使命感',
    causes: '-',
    wuxing: '水', season: '冬',
    pairedVertebra: 'T7', pairedMeridian: '肝经',
    healingSolutions: ['颈椎复位', '肝经疏通'],
    recommendedTone: '羽音', recommendedLiuzijue: '吹',
    recommendedAcupoints: ['太冲', '期门', '肝俞'],
    dietAdvice: '温补为主，食红枣当归',
    routineAdvice: '早卧晚起，固护阳气',
    contraindication: '忌寒凉入体，忌房事过度',
  },
];

/* ===== 导出数据与工具函数 ===== */

export const spineSolarData: SpineSolarEntry[] = SPINE_SOLAR_DATABASE;

export function getEntryBySolarTerm(term: string): SpineSolarEntry | undefined {
  return SPINE_SOLAR_DATABASE.find(d => d.solarTerm === term);
}

export function getEntryByVertebra(code: string): SpineSolarEntry | undefined {
  return SPINE_SOLAR_DATABASE.find(d => d.vertebraCode === code || d.vertebraCode.includes(code));
}

export function getCurrentSolarTerm(): string {
  const now = new Date();
  const val = (now.getMonth() + 1) * 100 + now.getDate();
  let result = '冬至';
  for (const item of SOLAR_TERM_DATES) {
    if (val < item.month * 100 + item.day) break;
    result = item.term;
  }
  return result;
}

export function getCurrentEntry(): SpineSolarEntry | undefined {
  return getEntryBySolarTerm(getCurrentSolarTerm());
}

export function getEntriesBySeason(season: Season): SpineSolarEntry[] {
  return SPINE_SOLAR_DATABASE.filter(d => d.season === season);
}

export function getEntriesByWuxing(wuxing: WuxingElement): SpineSolarEntry[] {
  return SPINE_SOLAR_DATABASE.filter(d => d.wuxing === wuxing);
}

export function getEntriesByVertebraType(type: VertebraType): SpineSolarEntry[] {
  return SPINE_SOLAR_DATABASE.filter(d => d.vertebraType === type);
}

export function getVertebraRegionLabel(type: VertebraType): string {
  const labels: Record<VertebraType, string> = {
    sacrum: '骶椎区',
    lumbar: '腰椎区',
    thoracic: '胸椎区',
    cervical: '颈椎区',
  };
  return labels[type];
}

export function getWuxingColor(wuxing: WuxingElement): string {
  return WUXING_COLORS[wuxing];
}
