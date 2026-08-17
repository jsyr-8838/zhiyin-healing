/**
 * taibu-core 适配层 — 统一封装 10 种术数的精确排盘计算
 *
 * 替代原有的手写简化算法（divination-engine.ts / divination-data.ts）
 * 所有计算均为纯函数或异步函数，SSR/CSR 双端可用
 */

// ===== 梅花易数 (SYNC) =====
import { calculateMeihua, toMeihuaJson, toMeihuaText } from 'taibu-core/meihua';

// ===== 六爻 (ASYNC) =====
import { calculateLiuyao, toLiuyaoJson, toLiuyaoText } from 'taibu-core/liuyao';

// ===== 奇门遁甲 (ASYNC) =====
import { calculateQimen, toQimenJson, toQimenText } from 'taibu-core/qimen';

// ===== 大六壬 (SYNC) =====
import { calculateDaliuren, toDaliurenJson, toDaliurenText } from 'taibu-core/daliuren';

// ===== 八字 (SYNC) =====
import { calculateBazi, calculateBaziFiveElementsStats, toBaziJson, toBaziText } from 'taibu-core/bazi';
import { calculateBaziDayun, toBaziDayunJson } from 'taibu-core/bazi-dayun';

// ===== 小六壬 (SYNC) =====
import { calculateXiaoliurenData, toXiaoliurenJson, toXiaoliurenText } from 'taibu-core/xiaoliuren';

// ===== 紫微斗数 (SYNC) =====
import { calculateZiwei, toZiweiJson, toZiweiText } from 'taibu-core/ziwei';

// ===== 太乙神数 (SYNC) =====
import { calculateTaiyi, toTaiyiJson, toTaiyiText } from 'taibu-core/taiyi';

// ===== 塔罗牌 (ASYNC) =====
import { calculateTarot, toTarotJson, toTarotText } from 'taibu-core/tarot';

// ===== 黄历 (ASYNC) =====
import { calculateDailyAlmanac } from 'taibu-core/almanac';

// ===== 64卦数据 =====
import { HEXAGRAMS } from 'taibu-core/data/hexagrams';

// ═══════════════════════════════════════════════════════
//  统一输入接口
// ═══════════════════════════════════════════════════════

export interface DivineInput {
  method: DivinationMethod;
  question?: string;
  /** 梅花起卦数字 */
  number?: number;
  /** 出生日期 YYYY-MM-DD (八字/紫微) */
  birthDate?: string;
  /** 出生时辰 0-23 (八字/紫微) */
  birthHour?: number;
  /** 性别 (八字/紫微) */
  gender?: 'male' | 'female';
  /** 塔罗牌阵类型 */
  spreadType?: string;
  /** 随机种子 (string for tarot, number for others) */
  seed?: number;
}

export type DivinationMethod =
  | 'meihua' | 'zhouyi' | 'liuyao' | 'qimen' | 'daliuren' | 'bazi'
  | 'xiaoliuren' | 'ziwei' | 'taiyi' | 'tarot';

// ═══════════════════════════════════════════════════════
//  统一结果接口
// ═══════════════════════════════════════════════════════

export interface DivineResult {
  method: DivinationMethod;
  methodName: string;
  /** 结构化JSON供程序消费 — 各术数返回结构差异大，使用未知键值对 */
  json: unknown;
  text: string;          // 可读文本供人类阅读
  summary: string;       // 一句话摘要
  extraInfo: string;     // 补充信息字符串（给AI解读用）
}

// ═══════════════════════════════════════════════════════
//  术数元数据
// ═══════════════════════════════════════════════════════

export const DIVINATION_METHODS_V2 = [
  { id: 'meihua' as const, name: '梅花易数', desc: '以数起卦，体用生克', difficulty: 2, origin: '邵雍《梅花易数》', category: '卜' },
  { id: 'zhouyi' as const, name: '周易占卜', desc: '铜钱摇卦，六爻成象', difficulty: 2, origin: '《周易》', category: '卜' },
  { id: 'liuyao' as const, name: '六爻纳甲', desc: '纳甲世应，六亲用神', difficulty: 3, origin: '京房《京氏易传》', category: '卜' },
  { id: 'qimen' as const, name: '奇门遁甲', desc: '九宫八门，天盘地盘', difficulty: 4, origin: '《奇门遁甲》', category: '卜' },
  { id: 'daliuren' as const, name: '大六壬', desc: '四课三传，天将十二', difficulty: 4, origin: '《大六壬》', category: '卜' },
  { id: 'bazi' as const, name: '八字命盘', desc: '四柱八字，大运流年', difficulty: 3, origin: '《子平真诠》', category: '命' },
  { id: 'xiaoliuren' as const, name: '小六壬', desc: '大安留连，速喜赤口', difficulty: 1, origin: '民间流传', category: '卜' },
  { id: 'ziwei' as const, name: '紫微斗数', desc: '命宫星曜，十二宫位', difficulty: 4, origin: '陈抟《紫微斗数》', category: '命' },
  { id: 'taiyi' as const, name: '太乙神数', desc: '太乙九星，积年推算', difficulty: 5, origin: '《太乙神数》', category: '卜' },
  { id: 'tarot' as const, name: '塔罗牌', desc: '大阿卡纳，正逆位解读', difficulty: 1, origin: '西方术数', category: '卜' },
];

// ═══════════════════════════════════════════════════════
//  辅助函数
// ═══════════════════════════════════════════════════════

/** 获取当前日期字符串 YYYY-MM-DD */
function todayStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** 获取当前日期时间字符串 YYYY-MM-DDTHH:MM（taibu-core 梅花/六爻等需要的格式） */
function nowStr(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 解析出生日期 -> BirthTimeInput 字段 */
function parseBirthDate(birthDate: string, birthHour = 12) {
  const [y, m, d] = birthDate.split('-').map(Number);
  return { birthYear: y, birthMonth: m, birthDay: d, birthHour };
}

// ═══════════════════════════════════════════════════════
//  核心适配函数（ASYNC — 因为部分术数是异步的）
// ═══════════════════════════════════════════════════════

/** 统一占卜入口（异步） */
export async function divine(input: DivineInput): Promise<DivineResult> {
  switch (input.method) {
    case 'meihua':
    case 'zhouyi':
      return divineMeihua(input);
    case 'liuyao':
      return await divineLiuyao(input);
    case 'qimen':
      return await divineQimen(input);
    case 'daliuren':
      return divineDaliuren(input);
    case 'bazi':
      return divineBazi(input);
    case 'xiaoliuren':
      return divineXiaoliuren(input);
    case 'ziwei':
      return divineZiwei(input);
    case 'taiyi':
      return divineTaiyi(input);
    case 'tarot':
      return await divineTarot(input);
    default:
      throw new Error(`不支持的术数方法: ${input.method}`);
  }
}

// ===== 梅花易数 (SYNC) =====
function divineMeihua(input: DivineInput): DivineResult {
  const now = new Date();
  const useCount = input.number && input.number > 0;
  const result = calculateMeihua({
    question: input.question || '占卦',
    date: nowStr(),
    method: useCount ? 'count_with_time' : 'time',
    count: useCount ? input.number : undefined,
    countCategory: useCount ? 'item' : undefined,
    detailLevel: 'full',
  });
  const json = toMeihuaJson(result);
  const text = toMeihuaText(result);

  const mainHex = result.mainHexagram;
  const summary = `${mainHex?.name || ''} · 动爻${result.movingLine}`;

  return {
    method: input.method === 'zhouyi' ? 'zhouyi' : 'meihua',
    methodName: input.method === 'zhouyi' ? '周易占卜' : '梅花易数',
    json,
    text,
    summary,
    extraInfo: text,
  };
}

// ===== 六爻纳甲 (ASYNC) =====
async function divineLiuyao(input: DivineInput): Promise<DivineResult> {
  const result = await calculateLiuyao({
    question: input.question || '占卦',
    yongShenTargets: ['妻财'],
    date: nowStr(),
    seed: input.seed ? String(input.seed) : undefined,
    detailLevel: 'full',
  });
  const json = toLiuyaoJson(result);
  const text = toLiuyaoText(result);

  return {
    method: 'liuyao',
    methodName: '六爻纳甲',
    json,
    text,
    summary: `${result.hexagramName} · ${result.hexagramGong}宫`,
    extraInfo: text,
  };
}

// ===== 奇门遁甲 (ASYNC) =====
async function divineQimen(input: DivineInput): Promise<DivineResult> {
  const now = new Date();
  const result = await calculateQimen({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    question: input.question,
  });
  const json = toQimenJson(result);
  const text = toQimenText(result);

  return {
    method: 'qimen',
    methodName: '奇门遁甲',
    json,
    text,
    summary: `${result.dunType === 'yang' ? '阳' : '阴'}遁${result.juNumber}局`,
    extraInfo: text,
  };
}

// ===== 大六壬 (SYNC) =====
function divineDaliuren(input: DivineInput): DivineResult {
  const now = new Date();
  const result = calculateDaliuren({
    date: nowStr(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    question: input.question,
  });
  const json = toDaliurenJson(result);
  const text = toDaliurenText(result);

  const sc = result.sanChuan;
  return {
    method: 'daliuren',
    methodName: '大六壬',
    json,
    text,
    summary: `${result.keName} · 四课三传`,
    extraInfo: text,
  };
}

// ===== 八字命盘 (SYNC) =====
function divineBazi(input: DivineInput): DivineResult {
  if (!input.birthDate) throw new Error('八字排盘需要出生日期');
  const birth = parseBirthDate(input.birthDate, input.birthHour);
  const gender = input.gender || 'male';

  const result = calculateBazi({ ...birth, gender });
  const json = toBaziJson(result);
  const text = toBaziText(result);

  // 大运
  let dayunJson: Record<string, unknown> | null = null;
  try {
    const dayun = calculateBaziDayun({ ...birth, gender });
    dayunJson = toBaziDayunJson(dayun) as unknown as Record<string, unknown>;
  } catch { /* 大运计算可能需要额外参数 */ }

  // 五行统计
  let fiveElementsStats: Record<string, unknown> | null = null;
  try {
    fiveElementsStats = calculateBaziFiveElementsStats(result.fourPillars) as unknown as Record<string, unknown>;
  } catch {}

  const fp = result.fourPillars;
  const summary = `${fp.year.stem}${fp.year.branch} ${fp.month.stem}${fp.month.branch} ${fp.day.stem}${fp.day.branch} ${fp.hour.stem}${fp.hour.branch}`;

  return {
    method: 'bazi',
    methodName: '八字命盘',
    json: { ...(json as unknown as Record<string, unknown>), dayun: dayunJson, fiveElementsStats, fourPillars: fp, dayMaster: result.dayMaster },
    text,
    summary,
    extraInfo: text,
  };
}

// ===== 小六壬 (SYNC) =====
function divineXiaoliuren(input: DivineInput): DivineResult {
  const now = new Date();
  // 小六壬需要农历月日，此处使用公历近似（taibu-core 内部可能做转换）
  // hour: 0-23 hours or 时辰序号(1-12)
  const result = calculateXiaoliurenData({
    lunarMonth: now.getMonth() + 1,
    lunarDay: now.getDate(),
    hour: now.getHours(),
    question: input.question,
  });
  const json = toXiaoliurenJson(result);
  const text = toXiaoliurenText(result);

  return {
    method: 'xiaoliuren',
    methodName: '小六壬',
    json,
    text,
    summary: `${result.result.name}`,
    extraInfo: text,
  };
}

// ===== 紫微斗数 (SYNC) =====
function divineZiwei(input: DivineInput): DivineResult {
  if (!input.birthDate) throw new Error('紫微斗数需要出生日期');
  const birth = parseBirthDate(input.birthDate, input.birthHour);
  const gender = input.gender || 'male';

  const result = calculateZiwei({ ...birth, gender });
  const json = toZiweiJson(result);
  const text = toZiweiText(result);

  return {
    method: 'ziwei',
    methodName: '紫微斗数',
    json,
    text,
    summary: `命宫${result.soul} · ${result.fiveElement}五局`,
    extraInfo: text,
  };
}

// ===== 太乙神数 (SYNC) =====
function divineTaiyi(input: DivineInput): DivineResult {
  const now = new Date();
  const result = calculateTaiyi({
    mode: 'day',
    date: nowStr(),
    hour: now.getHours(),
    minute: now.getMinutes(),
    question: input.question,
  });
  const json = toTaiyiJson(result);
  const text = toTaiyiText(result);

  // 太乙神数 summary 提取：coreBoard.primaryStar.name 或 keName
  const taiyiCoreBoard = result.coreBoard as Record<string, unknown> | undefined;
  const taiyiPrimaryStarName = taiyiCoreBoard?.primaryStar
    ? (taiyiCoreBoard.primaryStar as Record<string, string>).name
    : '';
  const taiyiKeName = (result as unknown as Record<string, unknown>).keName as string | undefined;
  const taiyiSummary = `太乙${taiyiPrimaryStarName || taiyiKeName || ''}`;

  return {
    method: 'taiyi',
    methodName: '太乙神数',
    json,
    text,
    summary: taiyiSummary,
    extraInfo: text,
  };
}

// ===== 塔罗牌 (ASYNC) =====
async function divineTarot(input: DivineInput): Promise<DivineResult> {
  const result = await calculateTarot({
    question: input.question,
    spreadType: input.spreadType || 'three_card',
    allowReversed: true,
    seed: input.seed ? String(input.seed) : undefined,
  });
  const json = toTarotJson(result);
  const text = toTarotText(result);

  const cardNames = result.cards?.map(c => c.card?.nameChinese || c.card?.name || '?').join(' · ') || '塔罗牌';

  return {
    method: 'tarot',
    methodName: '塔罗牌',
    json,
    text,
    summary: cardNames,
    extraInfo: text,
  };
}

// ═══════════════════════════════════════════════════════
//  辅助导出
// ═══════════════════════════════════════════════════════

/** 获取今日黄历（异步） */
export async function getTodayAlmanac() {
  try {
    return await calculateDailyAlmanac({ date: todayStr() });
  } catch {
    return null;
  }
}

/** 64卦完整数据 */
export function getHexagramsData() {
  return HEXAGRAMS;
}

/** 获取今日干支（同步，通过八字排盘提取） */
export function getDailyGanZhi(): { year: string; month: string; day: string; hour: string } | null {
  try {
    const now = new Date();
    const result = calculateBazi({
      birthYear: now.getFullYear(),
      birthMonth: now.getMonth() + 1,
      birthDay: now.getDate(),
      birthHour: now.getHours(),
      gender: 'male',
    });
    const fp = result.fourPillars;
    return {
      year: fp.year.stem + fp.year.branch,
      month: fp.month.stem + fp.month.branch,
      day: fp.day.stem + fp.day.branch,
      hour: fp.hour.stem + fp.hour.branch,
    };
  } catch {
    return null;
  }
}
