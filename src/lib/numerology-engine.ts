/**
 * 灵数（Numerology）计算引擎
 *
 * 来源: motivational-numerology (MIT, by Sally Faubion & Olivier Guilieri)
 * https://github.com/evoluteur/motivational-numerology
 *
 * 改写为 TypeScript，保留核心算法逻辑。
 * 计算体系: Pythagorean（字母转数字）+ Chaldean（元音/辅音分类）
 */

// ===== Pythagorean 字母-数字映射 =====

const PYTHAGOREAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

// ===== 元音 / 辅音分类（Chaldean 体系）=====

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

// ===== 类型定义 =====

export type NumerologyDimension =
  | 'character'    // 品格：名字所有字母
  | 'soul'          // 灵魂渴望：元音
  | 'hidden'        // 隐藏议程：辅音
  | 'attitude'      // 态度：月+日
  | 'personality'   // 个性：日
  | 'destiny'       // 命运：月+日+年
  | 'divine';       // 神圣使命：命运+品格

export interface NumerologyResult {
  dimension: NumerologyDimension;
  label: string;
  cn: string;
  value: number;
  description: string;
}

export interface NumerologyProfile {
  character: NumerologyResult;
  soul: NumerologyResult;
  hidden: NumerologyResult;
  attitude: NumerologyResult;
  personality: NumerologyResult;
  destiny: NumerologyResult;
  divine: NumerologyResult;
}

// ===== 核心计算函数 =====

/**
 * 数字缩减：将多位数反复相加，直到 1-9 或大师数字 11/22
 */
export function reduceNumber(num: number): number {
  while (num > 9 && num !== 11 && num !== 22) {
    num = String(num).split('').reduce((sum, d) => sum + Number(d), 0);
  }
  return num;
}

/**
 * 将字母转换为数字并求和
 */
function lettersToNumber(text: string, filter?: 'vowel' | 'consonant'): number {
  const lower = text.toLowerCase();
  let sum = 0;
  for (const char of lower) {
    if (!PYTHAGOREAN_MAP[char]) continue;
    if (filter === 'vowel' && !VOWELS.has(char)) continue;
    if (filter === 'consonant' && VOWELS.has(char)) continue;
    sum += PYTHAGOREAN_MAP[char];
  }
  return sum;
}

/**
 * 将日期数字缩减
 */
function reduceDate(month: number, day: number, year: number): number {
  return reduceNumber(
    reduceNumber(month) + reduceNumber(day) + reduceNumber(year)
  );
}

// ===== 维度计算 =====

export interface NumerologyInput {
  /** 全名（英文或拼音） */
  name: string;
  /** 生日-月 */
  birthMonth: number;
  /** 生日-日 */
  birthDay: number;
  /** 生日-年 */
  birthYear: number;
}

export function calculateNumerology(input: NumerologyInput): NumerologyProfile {
  const { name, birthMonth, birthDay, birthYear } = input;

  // 品格 (Character): 名字所有字母
  const characterVal = reduceNumber(lettersToNumber(name));

  // 灵魂渴望 (Soul Urge): 元音
  const soulVal = reduceNumber(lettersToNumber(name, 'vowel'));

  // 隐藏议程 (Hidden Agenda): 辅音
  const hiddenVal = reduceNumber(lettersToNumber(name, 'consonant'));

  // 态度 (Attitude): 月+日
  const attitudeVal = reduceNumber(reduceNumber(birthMonth) + reduceNumber(birthDay));

  // 个性 (Personality): 日
  const personalityVal = reduceNumber(birthDay);

  // 命运 (Destiny): 月+日+年
  const destinyVal = reduceDate(birthMonth, birthDay, birthYear);

  // 神圣使命 (Divine Purpose): 命运+品格
  const divineVal = reduceNumber(destinyVal + characterVal);

  return {
    character:  { dimension: 'character',   label: 'Character',        cn: '品格',     value: characterVal,   description: '名字所有字母之和·外在表现与天赋' },
    soul:       { dimension: 'soul',        label: 'Soul Urge',        cn: '灵魂渴望',  value: soulVal,        description: '元音之和·内心深处的渴望与动机' },
    hidden:     { dimension: 'hidden',      label: 'Hidden Agenda',    cn: '隐藏议程',  value: hiddenVal,      description: '辅音之和·潜意识中的行为模式' },
    attitude:   { dimension: 'attitude',    label: 'Attitude',          cn: '态度',     value: attitudeVal,    description: '月+日·面对世界的自然态度' },
    personality:{ dimension: 'personality', label: 'Personality',       cn: '个性',     value: personalityVal, description: '生日·展现给他人的第一印象' },
    destiny:    { dimension: 'destiny',     label: 'Destiny',           cn: '命运',     value: destinyVal,    description: '月+日+年·一生总体的方向与使命' },
    divine:     { dimension: 'divine',      label: 'Divine Purpose',    cn: '神圣使命',  value: divineVal,     description: '命运+品格·灵性层面的终极使命' },
  };
}

// ===== 星级可视化 =====

/** 数字对应的星级（1-5星） */
export function getStarRating(value: number): number {
  const ratings: Record<number, number> = {
    1: 3, 2: 2, 3: 4, 4: 3, 5: 4, 6: 3, 7: 5, 8: 4, 9: 5, 11: 5, 22: 5,
  };
  return ratings[value] || 3;
}

// ===== 数字关键词（简短） =====

export function getNumberKeyword(value: number): string {
  const keywords: Record<number, string> = {
    1: '领导·独立·开创',
    2: '合作·平衡·直觉',
    3: '表达·创意·社交',
    4: '稳定·秩序·勤奋',
    5: '自由·变化·冒险',
    6: '关爱·责任·和谐',
    7: '智慧·内省·灵性',
    8: '力量·成就·丰盛',
    9: '博爱·圆满·智慧',
    11: '灵感·直觉·灵性觉醒',
    22: '大师建造者·宏大愿景',
  };
  return keywords[value] || '';
}
