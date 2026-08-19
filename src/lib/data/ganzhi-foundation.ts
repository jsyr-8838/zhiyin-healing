// ganzhi-foundation.ts — 天干地支五行基础数据（唯一数据源）
// 被 constitution-calculator.ts、shichen-engine.ts 等模块共同引用

/** 十天干 */
export const STEMS = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'] as const;

/** 十二地支 */
export const BRANCHES = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const;

/** 五行名称 */
export const ELEMENTS = ['木','火','土','金','水'] as const;

/** 天干类型 */
export type Stem = typeof STEMS[number];

/** 地支类型 */
export type Branch = typeof BRANCHES[number];

/** 五行类型 */
export type Element = typeof ELEMENTS[number];

/** 天干→五行映射 */
export const STEM_ELEMENT: Record<Stem, Element> = {
  '甲':'木','乙':'木','丙':'火','丁':'火','戊':'土',
  '己':'土','庚':'金','辛':'金','壬':'水','癸':'水',
};

/** 天干→阴阳映射 */
export const STEM_YINYANG: Record<Stem, string> = {
  '甲':'阳','乙':'阴','丙':'阳','丁':'阴','戊':'阳',
  '己':'阴','庚':'阳','辛':'阴','壬':'阳','癸':'阴',
};

/** 地支→五行映射 */
export const BRANCH_ELEMENT: Record<Branch, Element> = {
  '子':'水','丑':'土','寅':'木','卯':'木','辰':'土','巳':'火',
  '午':'火','未':'土','申':'金','酉':'金','戌':'土','亥':'水',
};

/** 农历月名（索引0为空串，1-12对应正月-腊月） */
export const LUNAR_MONTH_NAMES = ['','正月','二月','三月','四月','五月','六月','七月','八月','九月','十月','冬月','腊月'];

/** 农历日名（索引0为空串，1-30对应初一-三十） */
export const LUNAR_DAY_NAMES = ['','初一','初二','初三','初四','初五','初六','初七','初八','初九','初十',
  '十一','十二','十三','十四','十五','十六','十七','十八','十九','二十',
  '廿一','廿二','廿三','廿四','廿五','廿六','廿七','廿八','廿九','三十'];
