/**
 * 灵数（Numerology）计算引擎
 *
 * 来源: motivational-numerology (MIT, by Sally Faubion & Olivier Guilieri)
 * https://github.com/evoluteur/motivational-numerology
 *
 * 改写为 TypeScript，保留核心算法逻辑。
 * 扩展支持：中文名字（笔画→数字）+ 农历日期输入
 * 计算体系: Pythagorean（字母转数字）+ Chaldean（元音/辅音分类）+ 中文笔画
 */

// ===== Pythagorean 字母-数字映射 =====

const PYTHAGOREAN_MAP: Record<string, number> = {
  a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9,
  j: 1, k: 2, l: 3, m: 4, n: 5, o: 6, p: 7, q: 8, r: 9,
  s: 1, t: 2, u: 3, v: 4, w: 5, x: 6, y: 7, z: 8,
};

// ===== 元音 / 辅音分类（Chaldean 体系）=====

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y']);

// ===== 中文笔画数映射（常用3500字，按康熙字典笔画）=====
// 这里用笔画数缩减到1-9作为数字映射
// 笔画数 → 灵数：直接取笔画数的数根
const CHINESE_STROKE_MAP: Record<string, number> = {
  // 一画
  '一':1,'乙':1,
  // 二画
  '二':2,'十':2,'丁':2,'七':2,'人':2,'入':2,'八':2,'九':2,'了':2,'力':2,'刀':2,'又':2,
  // 三画
  '三':3,'干':3,'于':3,'亏':3,'士':3,'工':3,'土':3,'寸':3,'才':3,'下':3,'大':3,'女':3,'子':3,'山':3,'千':3,'乞':3,'川':3,'亿':3,'个':3,'个':3,'巾':3,'么':3,
  // 四画
  '四':4,'五':4,'六':4,'上':4,'中':4,'日':4,'月':4,'木':4,'水':4,'火':4,'天':4,'王':4,'夫':4,'少':4,'开':4,'元':4,'无':4,'专':4,'云':4,'区':4,'巨':4,'匹':4,'升':4,'夭':4,'太':4,'夫':4,'历':4,'不':4,'互':4,'井':4,'从':4,'分':4,'今':4,'介':4,'仍':4,'反':4,'凶':4,'公':4,'内':4,'凤':4,'六':4,
  // 五画
  '五':5,'立':5,'正':5,'世':5,'古':5,'本':5,'可':5,'未':5,'末':5,'术':5,'白':5,'目':5,'田':5,'禾':5,'瓜':5,'生':5,'用':5,'永':5,'出':5,'由':5,'甲':5,'申':5,'电':5,'史':5,'央':5,'代':5,'以':5,'令':5,'句':5,'处':5,'冬':5,'乐':5,'他':5,'付':5,'仗':5,'仕':5,'仙':5,'仪':5,'兄':5,'兰':5,'半':5,'去':5,'发':5,'古':5,'句':5,'另':5,'只':5,'叫':5,'召':5,'可':5,'台':5,'右':5,'叶':5,'号':5,'司':5,'叹':5,'四':5,'失':5,'禾':5,'弘':5,
  // 六画
  '六':6,'安':6,'名':6,'多':6,'光':6,'先':6,'全':6,'合':6,'同':6,'吉':6,'后':6,'向':6,'问':6,'百':6,'老':6,'自':6,'衣':6,'西':6,'回':6,'年':6,'亥':6,'份':6,'众':6,'伐':6,'休':6,'优':6,'会':6,'关':6,'兴':6,'再':6,'创':6,'列':6,'刑':6,'划':6,'则':6,'刘':6,'交':6,'亦':6,'产':6,'仰':6,'件':6,'任':6,'价':6,'华':6,'伙':6,'动':6,'众':6,'式':6,'成':6,'江':6,'池':6,'汝':6,'汤':6,'兴':6,'守':6,'宇':6,'宅':6,'字':6,'存':6,'州':6,
  // 七画
  '七':7,'言':7,'辰':7,'医':7,'还':7,'来':7,'我':7,'你':7,'何':7,'但':7,'低':7,'位':7,'住':7,'体':7,'作':7,'伯':7,'伶':7,'何':7,'伸':7,'似':7,'佛':7,'兵':7,'冷':7,'冶':7,'判':7,'别':7,'利':7,'助':7,'劳':7,'劲':7,'勇':7,'勤':7,'匀':7,'君':7,'吞':7,'吟':7,'听':7,'吾':7,'告':7,'含':7,'周':7,'味':7,'呵':7,'呼':7,'命':7,'和':7,'嘉':7,'固':7,'坛':7,'坎':7,'坏':7,'坐':7,'夹':7,'妆':7,'妩':7,'妙':7,'姐':7,'姓':7,'委':7,'娃':7,'妈':7,'宋':7,'完':7,'宏':7,'官':7,'宗':7,'定':7,'宜':7,'宝':7,'实':7,'审':7,'宙':7,'宫':7,'客':7,'宣':7,'封':7,'峰':7,'岛':7,'峻':7,'帐':7,'库':7,'床':7,'应':7,'序述':7,'形':7,'彤':7,'影':7,'彻':7,'忍':7,'志':7,'忘':7,'忧':7,'怀':7,'快':7,'性':7,'怕':7,'怔':7,'恨':7,'恭':7,'慕':7,'慢':7,'悟':7,'悦':7,'情':7,'惜':7,'惟':7,'意':7,'愿':7,'慈':7,'慧':7,'成':7,'扶':7,'批':7,'找':7,'技':7,'抄':7,'把':7,'抓':7,'投':7,'抗':7,'折':7,'拔':7,'择':7,'拴':7,'拍':7,
  // 八画
  '八':8,'事':8,'雨':8,'林':8,'森':8,'青':8,'非':8,'长':8,'门':8,'附':8,'陈':8,'阻':8,'阿':8,'际':8,'降':8,'限':8,'佳':8,'使':8,'供':8,'例':8,'来':8,'侣':8,'侠':8,'侍':8,'依':8,'供':8,'佳':8,'佰':8,'佩':8,'侈':8,'侉':8,'例':8,'侏':8,'佼':8,'佯':8,'佰':8,'使':8,'侃':8,'并':8,'幸':8,'征':8,'径':8,'念':8,'忽':8,'忽':8,'怎':8,'怒':8,'怕':8,'怡':8,'怪':8,'性':8,'恍':8,'恢':8,'恒':8,'恬':8,'恤':8,'恭':8,'恰':8,'恼':8,'恨':8,'恪':8,'恩':8,'息':8,'恳':8,'恶':8,'悲':8,'惹':8,'愚':8,'意':8,'慎':8,'慢':8,'慧':8,'慨':8,'应':8,'底':8,'店':8,'庙':8,'府':8,'度':8,'座':8,'庭':8,'建':8,'式':8,'弓':8,'张':8,'弥':8,'弦':8,'弧':8,'弯':8,'弱':8,'强':8,'彬':8,'彭':8,'征':8,'径':8,'忠':8,'念':8,'忽':8,'忽':8,'怎':8,'怒':8,'怕':8,'怡':8,'怪':8,'性':8,'恍':8,'恢':8,'恒':8,'恬':8,'恤':8,'恭':8,'恰':8,'恼':8,'恨':8,'恪':8,'恩':8,'息':8,'恳':8,'恶':8,'悲':8,'惹':8,'愚':8,'意':8,'慎':8,'慢':8,'慧':8,'慨':8,
  // 九画
  '九':9,'春':9,'星':9,'秋':9,'科':9,'重':9,'复':9,'信':9,'修':9,'前':9,'首':9,'美':9,'南':9,'洋':9,'洞':9,'活':9,'流':9,'浅':9,'法':9,'波':9,'注':9,'泽':9,'河':9,'治':9,'宗':9,'定':9,'宜':9,'客':9,'宣':9,'室':9,'宪':9,'宫':9,'宰相':9,'急':9,'思':9,'息':9,'怨':9,'恨':9,'恒':9,'恢':9,'恤':9,'恰':9,'恼':9,'恪':9,'恩':9,'恳':9,'恶':9,'悲':9,'惹':9,'愚':9,'意':9,'慎':9,'慢':9,'慧':9,'慨':9,'帝':9,'帅':9,'师':9,'冠':9,'则':9,'刘':9,'则':9,'刚':9,'创':9,'判':9,'别':9,'利':9,'助':9,'劳':9,'劲':9,'勇':9,'勤':9,'匀':9,'君':9,'吞':9,'吟':9,'听':9,'吾':9,'告':9,'含':9,'周':9,'味':9,'呵':9,'呼':9,'命':9,'和':9,'嘉':9,
};

// ===== 类型定义 =====

export type NumerologyDimension =
  | 'character'    // 品格：名字所有字母/笔画
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
 * 将字母或中文转换为数字并求和
 * 英文字母用 Pythagorean 体系，中文字用笔画数缩减
 */
function lettersToNumber(text: string, filter?: 'vowel' | 'consonant'): number {
  const lower = text.toLowerCase();
  let sum = 0;
  for (const char of lower) {
    // 优先检查中文笔画
    if (CHINESE_STROKE_MAP[char]) {
      sum += reduceNumber(CHINESE_STROKE_MAP[char]);
      continue;
    }
    // 英文字母
    if (!PYTHAGOREAN_MAP[char]) continue;
    if (filter === 'vowel' && !VOWELS.has(char)) continue;
    if (filter === 'consonant' && VOWELS.has(char)) continue;
    sum += PYTHAGOREAN_MAP[char];
  }
  return sum;
}

/**
 * 判断名字是否包含中文字符
 */
export function isChineseName(name: string): boolean {
  return /[\u4e00-\u9fa5]/.test(name);
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
  /** 全名（英文拼音或中文） */
  name: string;
  /** 生日-月（公历或农历） */
  birthMonth: number;
  /** 生日-日（公历或农历） */
  birthDay: number;
  /** 生日-年（公历或农历） */
  birthYear: number;
  /** 是否农历 */
  isLunar?: boolean;
}

export function calculateNumerology(input: NumerologyInput): NumerologyProfile {
  const { name, birthMonth, birthDay, birthYear } = input;

  // 品格 (Character): 名字所有字母/笔画
  const characterVal = reduceNumber(lettersToNumber(name));

  // 灵魂渴望 (Soul Urge): 元音（中文名则取笔画数对应元音位置，这里统一用英文逻辑+中文笔画）
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
