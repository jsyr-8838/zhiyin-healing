/**
 * 风水堪舆核心算法（TypeScript 版）
 * 基于 fengshui-skill by 天工长老 (MIT License)
 * 版本：v2.2.0
 * 
 * 原始 JS 版本中的中文冒号 `：` 已全部转为英文冒号 `:` 以符合 TS 语法
 */

// ═══════════════════════════════════════════
//  类型定义
// ═══════════════════════════════════════════

export type Gender = 'male' | 'female';

export type FangWei = '北' | '东北' | '东' | '东南' | '南' | '西南' | '西' | '西北';

export type MingGuaName = '坎' | '离' | '震' | '巽' | '乾' | '坤' | '艮' | '兑';

export type MingType = '东四命' | '西四命' | '未知';

export type JiuXingName =
  | '生气' | '天医' | '延年' | '伏位'
  | '祸害' | '六煞' | '五鬼' | '绝命';

export type JiXiongLevel = '大吉' | '吉' | '小吉' | '平' | '凶' | '大凶';

export interface JiuXingResult {
  生气: FangWei;
  天医: FangWei;
  延年: FangWei;
  伏位: FangWei;
  祸害: FangWei;
  六煞: FangWei;
  五鬼: FangWei;
  绝命: FangWei;
}

export interface ZhaiMingMatch {
  match: boolean;
  msg: string;
}

export interface BuJuFangItem {
  方位: FangWei;
  星: JiuXingName;
  吉凶: JiXiongLevel | string;
}

export interface BuJuJianYi {
  吉方: BuJuFangItem[];
  凶方: BuJuFangItem[];
  建议: {
    卧室: string;
    大门: string;
    厨房: string;
    卫生间: string;
    客厅: string;
  };
}

export interface ErShiSiShanResult {
  方位: FangWei;
  三山: string[];
  五行: string;
}

export interface XuanKongFeiXingResult {
  年份: number;
  年飞星: string;
  方位: FangWei;
  方位飞星: string;
  吉凶: string;
}

export interface FengShuiResult {
  命主信息: {
    出生年份: number;
    性别: string;
    命卦: string;
    命型: MingType;
  };
  宅型信息: {
    坐向: FangWei;
    宅型: string;
  };
  宅命匹配: ZhaiMingMatch;
  游年九星: JiuXingResult;
  布局建议: BuJuJianYi;
  综合评分: number;
  综合判断: string;
  风水评分详情?: Record<string, string>;
  风水评分?: number;
  趋吉避凶?: FengshuiAdvice;
}

export interface FengshuiAdvice {
  吉利方位: string[];
  吉利颜色: string[];
  布局调整: string[];
  化解建议: string[];
}

// ═══════════════════════════════════════════
//  核心算法
// ═══════════════════════════════════════════

/** 命卦计算（1900-2100年） */
export function calcMingGua(year: number, gender: Gender): string {
  const yearLast2 = year % 100;
  let remainder: number;

  if (gender === 'male') {
    remainder = (100 - yearLast2) % 9;
  } else {
    remainder = (yearLast2 - 4) % 9;
  }

  if (remainder <= 0) remainder += 9;

  const guaMap: Record<number, string> = {
    1: '坎', 2: '坤', 3: '震', 4: '巽',
    5: gender === 'male' ? '坤' : '艮',
    6: '乾', 7: '兑', 8: '艮', 9: '离',
  };

  return guaMap[remainder] || '坎';
}

/** 东四命/西四命判断 */
export function getMingType(mingGua: string): MingType {
  const dongSi = ['坎', '离', '震', '巽'];
  const xiSi = ['乾', '坤', '艮', '兑'];

  if (dongSi.includes(mingGua)) return '东四命';
  if (xiSi.includes(mingGua)) return '西四命';
  return '未知';
}

/** 宅型判断（根据坐向） */
export function getZhaiType(direction: FangWei): string {
  const directionMap: Record<FangWei, string> = {
    '北': '坎宅', '南': '离宅', '东': '震宅', '西': '兑宅',
    '东北': '艮宅', '西北': '乾宅', '东南': '巽宅', '西南': '坤宅',
  };
  return directionMap[direction] || '未知';
}

/** 游年九星排布 */
export function getJiuXing(mingGua: string): JiuXingResult {
  const jiuXingMap: Record<string, JiuXingResult> = {
    '坎': {
      生气: '东南', 天医: '东', 延年: '南', 伏位: '北',
      祸害: '西', 六煞: '西北', 五鬼: '东北', 绝命: '西南',
    },
    '离': {
      生气: '东', 天医: '东南', 延年: '北', 伏位: '南',
      祸害: '西南', 六煞: '东', 五鬼: '西', 绝命: '西北',
    },
    '震': {
      生气: '南', 天医: '北', 延年: '东南', 伏位: '东',
      祸害: '西南', 六煞: '东北', 五鬼: '西北', 绝命: '西',
    },
    '巽': {
      生气: '北', 天医: '南', 延年: '东', 伏位: '东南',
      祸害: '东', 六煞: '西', 五鬼: '西南', 绝命: '东北',
    },
    '乾': {
      生气: '西', 天医: '东北', 延年: '西南', 伏位: '西北',
      祸害: '东南', 六煞: '北', 五鬼: '东', 绝命: '南',
    },
    '坤': {
      生气: '东北', 天医: '西', 延年: '西北', 伏位: '西南',
      祸害: '北', 六煞: '南', 五鬼: '东南', 绝命: '北',
    },
    '艮': {
      生气: '西南', 天医: '西北', 延年: '西', 伏位: '东北',
      祸害: '南', 六煞: '东', 五鬼: '北', 绝命: '东南',
    },
    '兑': {
      生气: '西北', 天医: '西南', 延年: '东北', 伏位: '西',
      祸害: '北', 六煞: '东南', 五鬼: '南', 绝命: '东',
    },
  };

  return jiuXingMap[mingGua] || {
    生气: '东南', 天医: '东', 延年: '南', 伏位: '北',
    祸害: '西', 六煞: '西北', 五鬼: '东北', 绝命: '西南',
  };
}

/** 九星吉凶判断 */
function getJiuXingJiXiong(star: string): JiXiongLevel | string {
  const jiXiong: Record<string, JiXiongLevel> = {
    '生气': '大吉', '天医': '吉', '延年': '吉', '伏位': '小吉',
    '祸害': '凶', '六煞': '凶', '五鬼': '大凶', '绝命': '大凶',
  };
  return jiXiong[star] || '平';
}

/** 宅命匹配判断 */
export function matchZhaiMing(mingGua: string, zhaiType: string): ZhaiMingMatch {
  const dongSiZhai = ['坎宅', '离宅', '震宅', '巽宅'];
  const xiSiZhai = ['乾宅', '坤宅', '艮宅', '兑宅'];
  const dongSiMing = ['坎', '离', '震', '巽'];
  const xiSiMing = ['乾', '坤', '艮', '兑'];

  const isDongSiMing = dongSiMing.includes(mingGua);
  const isDongSiZhai = dongSiZhai.includes(zhaiType);

  if (isDongSiMing && isDongSiZhai) return { match: true, msg: '吉（东四命住东四宅）' };
  if (!isDongSiMing && !isDongSiZhai) return { match: true, msg: '吉（西四命住西四宅）' };
  return { match: false, msg: '凶（宅命不配）' };
}

/** 布局建议 */
export function getBuJuJianYi(jiuXing: JiuXingResult): BuJuJianYi {
  const jiFang: BuJuFangItem[] = [];
  const xiongFang: BuJuFangItem[] = [];

  for (const [star, fangwei] of Object.entries(jiuXing)) {
    const jiXiong = getJiuXingJiXiong(star);
    if (jiXiong.includes('吉')) {
      jiFang.push({ 方位: fangwei, 星: star as JiuXingName, 吉凶: jiXiong });
    } else {
      xiongFang.push({ 方位: fangwei, 星: star as JiuXingName, 吉凶: jiXiong });
    }
  }

  return {
    吉方: jiFang,
    凶方: xiongFang,
    建议: {
      卧室: '宜在生气、天医、延年方',
      大门: '宜开在生气、延年方',
      厨房: '宜压在凶方，灶口向吉方',
      卫生间: '不宜在吉方',
      客厅: '宜在生气、伏位方',
    },
  };
}

/** 综合风水分析 */
export function fengShui(year: number, gender: Gender, direction: FangWei): FengShuiResult {
  const mingGua = calcMingGua(year, gender);
  const mingType = getMingType(mingGua);
  const zhaiType = getZhaiType(direction);
  const match = matchZhaiMing(mingGua, zhaiType);
  const jiuXing = getJiuXing(mingGua);
  const buJu = getBuJuJianYi(jiuXing);

  // 综合评分
  let score = 60;
  if (match.match) score += 25;
  else score -= 20;

  let conclusion = '中';
  if (score >= 80) conclusion = '吉';
  else if (score >= 65) conclusion = '中吉';
  else if (score >= 50) conclusion = '中';
  else conclusion = '凶';

  return {
    命主信息: {
      出生年份: year,
      性别: gender === 'male' ? '男' : '女',
      命卦: mingGua,
      命型: mingType,
    },
    宅型信息: {
      坐向: direction,
      宅型: zhaiType,
    },
    宅命匹配: match,
    游年九星: jiuXing,
    布局建议: buJu,
    综合评分: score,
    综合判断: conclusion,
  };
}

// ═══════════════════════════════════════════
//  v1.1 新增：二十四山详解
// ═══════════════════════════════════════════

const ER_SHI_SI_SHAN: Record<FangWei, string[]> = {
  '北': ['壬', '子', '癸'],
  '东北': ['丑', '艮', '寅'],
  '东': ['甲', '卯', '乙'],
  '东南': ['辰', '巽', '巳'],
  '南': ['丙', '午', '丁'],
  '西南': ['未', '坤', '申'],
  '西': ['庚', '酉', '辛'],
  '西北': ['戌', '乾', '亥'],
};

/** 山的五行 */
function getShanWuXing(fangWei: FangWei): string {
  const wuXingMap: Record<FangWei, string> = {
    '北': '水', '东北': '土', '东': '木', '东南': '木',
    '南': '火', '西南': '土', '西': '金', '西北': '金',
  };
  return wuXingMap[fangWei] || '未知';
}

/** 获取二十四山详情 */
export function getErShiSiShan(fangWei: FangWei): ErShiSiShanResult | null {
  if (ER_SHI_SI_SHAN[fangWei]) {
    return {
      方位: fangWei,
      三山: ER_SHI_SI_SHAN[fangWei],
      五行: getShanWuXing(fangWei),
    };
  }
  return null;
}

// ═══════════════════════════════════════════
//  v1.1 新增：玄空飞星（简化版）
// ═══════════════════════════════════════════

const FEI_XING = [
  '一白贪狼', '二黑巨门', '三碧禄存', '四绿文曲',
  '五黄廉贞', '六白武曲', '七赤破军', '八白左辅', '九紫右弼',
];

/** 飞星吉凶 */
function getFeiXingJiXiong(feiXing: string): string {
  const jiXing = ['一白贪狼', '四绿文曲', '六白武曲', '八白左辅', '九紫右弼'];
  const xiongXing = ['二黑巨门', '三碧禄存', '五黄廉贞', '七赤破军'];

  if (jiXing.includes(feiXing)) return '吉';
  if (xiongXing.includes(feiXing)) return '凶';
  return '平';
}

/** 玄空飞星基础计算 */
export function getXuanKongFeiXing(year: number, fangWei: FangWei): XuanKongFeiXingResult {
  const yearStarIndex = (year - 1900) % 9;
  const yearStar = FEI_XING[yearStarIndex];

  const fangWeiIndex = Object.keys(ER_SHI_SI_SHAN).indexOf(fangWei);
  const fangWeiStar = FEI_XING[(yearStarIndex + fangWeiIndex) % 9];

  return {
    年份: year,
    年飞星: yearStar,
    方位: fangWei,
    方位飞星: fangWeiStar,
    吉凶: getFeiXingJiXiong(fangWeiStar),
  };
}

// ═══════════════════════════════════════════
//  v2.1.0 增强风水评分系统
// ═══════════════════════════════════════════

/** 详细风水评分计算 */
export function calculateDetailedScore(result: FengShuiResult): FengShuiResult {
  let score = 0;
  const details: Record<string, string> = {};

  // 宅命相配
  if (result.宅命匹配.match) {
    score += 30;
    details['宅命相配'] = '吉 +30 分';
  } else {
    details['宅命相配'] = '凶 +0 分';
  }

  // 其他评分项（简化）
  score += 45; // 基础分
  details['其他'] = '基础分 +45';

  result.风水评分详情 = details;
  result.风水评分 = Math.min(score, 100);

  return result;
}

// ═══════════════════════════════════════════
//  v2.2.0 趋吉避凶建议
// ═══════════════════════════════════════════

/** 趋吉避凶建议 */
export function getFengshuiAdvice(result: FengShuiResult): FengshuiAdvice {
  const advice: FengshuiAdvice = {
    吉利方位: [],
    吉利颜色: [],
    布局调整: [],
    化解建议: [],
  };

  const jiuXing = result.游年九星;

  if (jiuXing) {
    if (jiuXing.生气) {
      advice.吉利方位.push(`生气方：${jiuXing.生气} — 宜大门、卧室`);
    }
    if (jiuXing.天医) {
      advice.吉利方位.push(`天医方：${jiuXing.天医} — 宜卧室、书房`);
    }
    if (jiuXing.延年) {
      advice.吉利方位.push(`延年方：${jiuXing.延年} — 宜卧室、客厅`);
    }

    if (jiuXing.五鬼) {
      advice.化解建议.push(`五鬼方 (${jiuXing.五鬼})：放置葫芦或五帝钱`);
    }
    if (jiuXing.绝命) {
      advice.化解建议.push(`绝命方 (${jiuXing.绝命})：放置泰山石敢当`);
    }
  }

  // 吉利颜色（根据命型）
  if (result.命主信息.命型 === '东四命') {
    advice.吉利颜色.push('绿色、青色（木）', '红色、紫色（火）', '黑色、蓝色（水）');
  } else if (result.命主信息.命型 === '西四命') {
    advice.吉利颜色.push('白色、银色（金）', '黄色、棕色（土）');
  }

  // 布局调整
  advice.布局调整.push('大门宜开在生气、延年、天医方');
  advice.布局调整.push('卧室宜设在吉方，避开凶方');
  advice.布局调整.push('厨房宜设在东方或南方');
  advice.布局调整.push('卫生间宜压在凶方');

  return advice;
}

// ═══════════════════════════════════════════
//  便捷方法：一键完整风水分析
// ═══════════════════════════════════════════

/** 一键完整风水分析（含评分 + 趋吉避凶建议） */
export function fullFengShuiAnalysis(year: number, gender: Gender, direction: FangWei): FengShuiResult {
  const result = fengShui(year, gender, direction);
  calculateDetailedScore(result);
  result.趋吉避凶 = getFengshuiAdvice(result);
  return result;
}
