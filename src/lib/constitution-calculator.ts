// constitution-calculator.ts — 赛华佗 · 五行体质计算器 v3.0
// 基于 Python 版转写：四柱八字 · 日主强弱 · 用神忌神 · 大运流年 · 纳音五行 · 体质辨识
// 支持公历/农历输入，农历为准推算四柱

import { Solar } from 'lunar-javascript';
import {
  STEMS, BRANCHES, ELEMENTS,
  STEM_ELEMENT, STEM_YINYANG, BRANCH_ELEMENT,
  LUNAR_MONTH_NAMES, LUNAR_DAY_NAMES,
  type Stem, type Branch, type Element,
} from '@/lib/data/ganzhi-foundation';

// ═══════════════════════════════════════════════════════════════
//  基础数据（天干地支五行已移至 @/lib/data/ganzhi-foundation）
// ═══════════════════════════════════════════════════════════════
const ZODIAC: Record<Branch, string> = {
  '子':'鼠','丑':'牛','寅':'虎','卯':'兔','辰':'龙','巳':'蛇',
  '午':'马','未':'羊','申':'猴','酉':'鸡','戌':'狗','亥':'猪',
};

// 地支藏干
const BRANCH_HIDDEN: Record<Branch, Stem[]> = {
  '子':['癸'],'丑':['己','癸','辛'],'寅':['甲','丙','戊'],
  '卯':['乙'],'辰':['戊','乙','癸'],'巳':['丙','庚','戊'],
  '午':['丁','己'],'未':['己','丁','乙'],'申':['庚','壬','戊'],
  '酉':['辛'],'戌':['戊','辛','丁'],'亥':['壬','甲'],
};

/** 安全地将 string 转为 Stem 类型（运行时无校验，仅在类型推断已确认安全时使用） */
function asStem(s: string): Stem { return s as Stem; }
/** 安全地将 string 转为 Branch 类型 */
function asBranch(s: string): Branch { return s as Branch; }

// 纳音五行（60甲子）
const NAYIN_60: Record<string, string> = {
  '甲子':'海中金','乙丑':'海中金','丙寅':'炉中火','丁卯':'炉中火',
  '戊辰':'大林木','己巳':'大林木','庚午':'路旁土','辛未':'路旁土',
  '壬申':'剑锋金','癸酉':'剑锋金','甲戌':'山头火','乙亥':'山头火',
  '丙子':'涧下水','丁丑':'涧下水','戊寅':'城头土','己卯':'城头土',
  '庚辰':'白蜡金','辛巳':'白蜡金','壬午':'杨柳木','癸未':'杨柳木',
  '甲申':'泉中水','乙酉':'泉中水','丙戌':'屋上土','丁亥':'屋上土',
  '戊子':'霹雳火','己丑':'霹雳火','庚寅':'松柏木','辛卯':'松柏木',
  '壬辰':'长流水','癸巳':'长流水','甲午':'砂中金','乙未':'砂中金',
  '丙申':'山下火','丁酉':'山下火','戊戌':'平地木','己亥':'平地木',
  '庚子':'壁上土','辛丑':'壁上土','壬寅':'金箔金','癸卯':'金箔金',
  '甲辰':'覆灯火','乙巳':'覆灯火','丙午':'天河水','丁未':'天河水',
  '戊申':'大驿土','己酉':'大驿土','庚戌':'钗钏金','辛亥':'钗钏金',
  '壬子':'桑柘木','癸丑':'桑柘木','甲寅':'大溪水','乙卯':'大溪水',
  '丙辰':'沙中土','丁巳':'沙中土','戊午':'天上火','己未':'天上火',
  '庚申':'石榴木','辛酉':'石榴木','壬戌':'大海水','癸亥':'大海水',
};

// 月柱
const MONTH_BRANCH = ['','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥','子'];
const YEAR_STEM_MONTH_START: Record<string, number> = {'甲':2,'己':2,'乙':4,'庚':4,'丙':6,'辛':6,'丁':8,'壬':8,'戊':0,'癸':0};
const MONTH_OFFSET: Record<string, number> = {'丑':-1,'寅':0,'卯':1,'辰':2,'巳':3,'午':4,'未':5,'申':6,'酉':7,'戌':8,'亥':9,'子':10};

// 日柱基准
const BASE_DATE = new Date(2000, 0, 1);
const BASE_STEM_IDX = 0;
const BASE_BRANCH_IDX = 10;

// 时干起法
const DAY_STEM_HOUR_START: Record<string, number> = {'甲':0,'己':0,'乙':2,'庚':2,'丙':4,'辛':4,'丁':6,'壬':6,'戊':8,'癸':8};

// 月令旺衰权重
const SEASON_WEIGHT: Record<string, Record<string, number>> = {
  '木':{'木':5,'火':3,'水':2,'土':1,'金':1},
  '火':{'火':5,'土':3,'木':2,'金':1,'水':1},
  '土':{'土':5,'金':3,'火':2,'水':1,'木':1},
  '金':{'金':5,'水':3,'土':2,'木':1,'火':1},
  '水':{'水':5,'木':3,'金':2,'火':1,'土':1},
};

// 五行生克
const GENERATES: Record<string, string> = {'木':'火','火':'土','土':'金','金':'水','水':'木'};
const RESTRAINS: Record<string, string> = {'木':'土','土':'水','水':'火','火':'金','金':'木'};
const GEN_BY: Record<string, string> = {}; // 被生
const RST_BY: Record<string, string> = {}; // 被克
for (const [k, v] of Object.entries(GENERATES)) GEN_BY[v] = k;
for (const [k, v] of Object.entries(RESTRAINS)) RST_BY[v] = k;

// 五行详情
const ELEMENT_DETAIL: Record<string, {organ: string; dir: string; season: string; color: string; emotion: string; taste: string}> = {
  '木':{organ:'肝/胆',dir:'东',season:'春',color:'青绿',emotion:'怒',taste:'酸'},
  '火':{organ:'心/小肠',dir:'南',season:'夏',color:'赤红',emotion:'喜',taste:'苦'},
  '土':{organ:'脾/胃',dir:'中',season:'长夏',color:'黄',emotion:'思',taste:'甘'},
  '金':{organ:'肺/大肠',dir:'西',season:'秋',color:'白金',emotion:'悲',taste:'辛'},
  '水':{organ:'肾/膀胱',dir:'北',season:'冬',color:'黑蓝',emotion:'恐',taste:'咸'},
};

// 时辰对照
const HOUR_BRANCHES = ['子时','丑时','寅时','卯时','辰时','巳时','午时','未时','申时','酉时','戌时','亥时'];
const HOUR_RANGES: Record<string, string> = {
  '子时':'23:00–01:00','丑时':'01:00–03:00','寅时':'03:00–05:00','卯时':'05:00–07:00',
  '辰时':'07:00–09:00','巳时':'09:00–11:00','午时':'11:00–13:00','未时':'13:00–15:00',
  '申时':'15:00–17:00','酉时':'17:00–19:00','戌时':'19:00–21:00','亥时':'21:00–23:00',
};

// 九种体质数据
const CONSTITUTION_INFO: Record<string, {
  desc: string; features: string[]; prone: string[];
  diet: string[]; exercise: string[]; emotion: string[];
  meridian: string[]; herbs: string[]; color: string;
}> = {
  '平和质':{
    desc:'阴阳气血调和，体态适中、面色红润、精力充沛',
    features:['体型匀称','面色润泽','精力充沛','睡眠良好','二便正常'],
    prone:['适应能力强，较少生病'],
    diet:['饮食多样均衡','少食过寒过热之品','五谷杂粮为主'],
    exercise:['运动形式不限，以感到舒适为度','太极、散步、游泳均可'],
    emotion:['保持乐观平和，避免大喜大悲'],
    meridian:['日常保健：足三里、关元、气海','每日按揉5–10分钟即可'],
    herbs:['西洋参、黄芪适量泡茶','枸杞、红枣日常食用'],
    color:'#4CAF50'},
  '气虚质':{
    desc:'元气不足，以疲乏、气短、自汗等气虚表现为主',
    features:['容易疲乏','气短懒言','自汗','舌淡苔白','声音低怯'],
    prone:['反复感冒','内脏下垂','慢性疲劳综合征'],
    diet:['黄芪、党参炖汤','山药、大枣、糯米粥','少食生冷耗气之品'],
    exercise:['八段锦、太极拳','避免大汗淋漓的剧烈运动','每次20–30分钟为宜'],
    emotion:['避免过度劳思，保持情绪平稳','培养平和心态'],
    meridian:['足三里（补气要穴）','气海、关元（温补元气）','脾俞、肺俞（健脾益肺）'],
    herbs:['四君子汤（党参、白术、茯苓、甘草）','补中益气丸（遵医嘱）'],
    color:'#8BC34A'},
  '阳虚质':{
    desc:'阳气不足，以畏寒怕冷、手足不温等虚寒表现为主',
    features:['怕冷手足不温','喜热饮食','精神不振','舌淡胖嫩','小便清长'],
    prone:['寒证','水肿','骨关节疾病','性功能减退'],
    diet:['羊肉、韭菜生姜汤','肉桂核桃粥','忌生冷寒凉之品'],
    exercise:['春夏多户外运动，多晒太阳','注意腰腹保暖','艾灸调理'],
    emotion:['多晒太阳，避免情绪低落抑郁','宜听振奋音乐'],
    meridian:['命门（温补肾阳）','肾俞（补肾壮阳）','神阙（艾灸温阳散寒）'],
    herbs:['金匮肾气丸（遵医嘱）','当归生姜羊肉汤'],
    color:'#FF9800'},
  '阴虚质':{
    desc:'阴液亏少，以口燥咽干、手足心热等虚热表现为主',
    features:['手足心热','口燥咽干','鼻微干','喜冷饮','大便干燥','舌红少津'],
    prone:['失眠','糖尿病','结核病','更年期综合征'],
    diet:['百合莲子粥','枸杞银耳汤','鸭肉、黑芝麻','忌辛辣燥热，戒烟酒'],
    exercise:['太极拳、瑜伽','避免剧烈大汗运动','傍晚锻炼为宜'],
    emotion:['静养心神，避免情绪激动','练习冥想、书法'],
    meridian:['三阴交（滋阴要穴）','太溪（补肾阴）','照海（滋阴降火）'],
    herbs:['六味地黄丸（遵医嘱）','石斛、玉竹泡茶','麦冬煮水代茶'],
    color:'#F44336'},
  '痰湿质':{
    desc:'痰湿凝聚，以形体肥胖、腹部肥满、口黏苔腻等为主',
    features:['体形肥胖','腹部肥满松软','口黏腻','痰多','面部油腻','苔白腻'],
    prone:['高血压','高血脂','糖尿病','肥胖症','睡眠呼吸暂停'],
    diet:['薏苡仁赤小豆粥','冬瓜荷叶茶','山楂陈皮汤','少食肥甘厚腻，戒酒'],
    exercise:['有氧运动：慢跑、游泳、爬山','每次40–60分钟','坚持长期规律'],
    emotion:['多参加社交活动','避免独处过久，以防气机郁滞'],
    meridian:['丰隆（化痰要穴）','脾俞（健脾化湿）','阴陵泉（利湿化痰）'],
    herbs:['二陈丸（遵医嘱）','茯苓、白术、薏苡仁煮粥'],
    color:'#9C27B0'},
  '湿热质':{
    desc:'湿热内蕴，以面垢油光、口苦、苔黄腻等湿热表现为主',
    features:['面垢油光','易生痤疮','口苦口干','身重困倦','大便黏滞','苔黄腻'],
    prone:['皮肤病','肝胆疾病','泌尿系感染','带下病'],
    diet:['绿豆薏仁汤','苦瓜炒鸡蛋','芹菜汁','忌肥甘厚味、辛辣烟酒'],
    exercise:['中高强度有氧运动排出湿热','游泳、跑步、球类运动'],
    emotion:['克制急躁易怒情绪','学会冷静，避免肝郁化火'],
    meridian:['曲池（清热要穴）','阴陵泉（利湿）','支沟（通腑泄热）'],
    herbs:['龙胆泻肝丸（遵医嘱）','茵陈蒿茶','蒲公英泡水'],
    color:'#FF5722'},
  '血瘀质':{
    desc:'血行不畅，以肤色晦暗、舌质紫暗等血瘀表现为主',
    features:['肤色晦暗','色素沉着','容易出现瘀斑','口唇暗淡','舌质紫暗'],
    prone:['心脑血管疾病','痛经','肿瘤','血栓性疾病'],
    diet:['山楂玫瑰花茶','黑木耳炒菜','红糖生姜水','忌寒凉收涩之品'],
    exercise:['舞蹈、太极、慢跑','全身性舒展运动','促进气血流通'],
    emotion:['培养乐观情绪','避免长期郁闷，防气滞血瘀加重'],
    meridian:['血海（活血化瘀）','膈俞（活血化瘀要穴）','三阴交（调和气血）'],
    herbs:['血府逐瘀丸（遵医嘱）','丹参玫瑰茶','川芎白芷泡浴'],
    color:'#607D8B'},
  '气郁质':{
    desc:'气机郁滞，以神情抑郁、忧虑脆弱等气郁表现为主',
    features:['神情抑郁','情感脆弱','烦闷不乐','胸胁胀满','善太息','咽有异物感'],
    prone:['抑郁症','焦虑症','乳腺增生','甲状腺疾病','梅核气'],
    diet:['佛手陈皮茶','玫瑰花蜂蜜水','小麦大枣粥','少食收敛酸涩之品'],
    exercise:['户外集体活动、旅游、登山','增加人际互动和阳光照射'],
    emotion:['培养兴趣爱好','学会倾诉表达，疏导郁结情绪'],
    meridian:['太冲（疏肝解郁要穴）','膻中（宽胸理气）','期门（疏肝利胆）'],
    herbs:['逍遥丸（遵医嘱）','柴胡、郁金泡茶'],
    color:'#3F51B5'},
  '特禀质':{
    desc:'先天失常，以生理缺陷、过敏反应等为主',
    features:['过敏体质','对外界适应能力差','遗传倾向明显','易鼻塞流涕'],
    prone:['过敏性鼻炎','哮喘','荨麻疹','先天性疾病'],
    diet:['饮食清淡均衡','避免已知过敏食物','益气固表为主'],
    exercise:['避免在花粉多或污染环境运动','循序渐进增强体质'],
    emotion:['避免情绪紧张','保持心态平和稳定'],
    meridian:['肺俞（补肺固卫）','足三里（补益正气）','风门（祛风固表）'],
    herbs:['玉屏风散（遵医嘱）','黄芪防风泡茶'],
    color:'#795548'},
};

// ═══════════════════════════════════════════════════════════════
//  四柱推算
// ═══════════════════════════════════════════════════════════════

function getYearPillar(year: number): [string, string] {
  return [STEMS[(year - 4) % 10], BRANCHES[(year - 4) % 12]];
}

function getMonthPillar(year: number, month: number): [string, string] {
  const [yStem] = getYearPillar(year);
  const mBranch = MONTH_BRANCH[month];
  const start = YEAR_STEM_MONTH_START[yStem];
  const offset = MONTH_OFFSET[mBranch];
  return [STEMS[(start + offset + 10) % 10], mBranch];
}

function getDayPillar(year: number, month: number, day: number): [string, string] {
  const d = new Date(year, month - 1, day);
  const delta = Math.round((d.getTime() - BASE_DATE.getTime()) / 86400000);
  return [STEMS[(BASE_STEM_IDX + delta % 10 + 10) % 10], BRANCHES[(BASE_BRANCH_IDX + delta % 12 + 12) % 12]];
}

function getHourPillar(dayStem: string, hourBranch: string): [string, string] {
  const bIdx = BRANCHES.indexOf(hourBranch as Branch);
  const start = DAY_STEM_HOUR_START[dayStem];
  return [STEMS[(start + bIdx + 10) % 10], BRANCHES[bIdx]];
}

function getNayin(stem: string, branch: string): string {
  const key = stem + branch;
  if (NAYIN_60[key]) return NAYIN_60[key];
  // 奇数柱共用纳音
  const sIdx = STEMS.indexOf(stem as Stem);
  const bIdx = BRANCHES.indexOf(branch as Branch);
  if (sIdx % 2 === 1) {
    const key2 = STEMS[sIdx - 1] + BRANCHES[(bIdx - 1 + 12) % 12];
    if (NAYIN_60[key2]) return NAYIN_60[key2];
  }
  return '未知';
}

function hiddenElements(branch: string): string[] {
  const result: string[] = [];
  const seen = new Set<string>();
  for (const s of BRANCH_HIDDEN[asBranch(branch)] || []) {
    const el = STEM_ELEMENT[s];
    if (!seen.has(el)) { seen.add(el); result.push(el); }
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
//  十神
// ═══════════════════════════════════════════════════════════════

function shishen(dayEl: string, dayYy: string, targetEl: string, targetYy: string): string {
  if (targetEl === dayEl) return targetYy === dayYy ? '比肩' : '劫财';
  if (GENERATES[dayEl] === targetEl) return targetYy === dayYy ? '食神' : '伤官';
  if (GENERATES[targetEl] === dayEl) return targetYy === dayYy ? '偏印' : '正印';
  if (RESTRAINS[dayEl] === targetEl) return targetYy === dayYy ? '偏财' : '正财';
  if (RESTRAINS[targetEl] === dayEl) return targetYy === dayYy ? '七杀' : '正官';
  return '—';
}

// ═══════════════════════════════════════════════════════════════
//  命宫 & 胎元
// ═══════════════════════════════════════════════════════════════

function getLifePalace(month: number, hourBranch: string): string {
  const hIdx = BRANCHES.indexOf(hourBranch as Branch);
  const palaceIdx = (BRANCHES.indexOf('寅' as Branch) + (month - 1) - hIdx + 24) % 12;
  return BRANCHES[palaceIdx];
}

function getFetalOrigin(mStem: string, mBranch: string): [string, string] {
  const sIdx = (STEMS.indexOf(mStem as Stem) + 1) % 10;
  const bIdx = (BRANCHES.indexOf(mBranch as Branch) + 3) % 12;
  return [STEMS[sIdx], BRANCHES[bIdx]];
}

// ═══════════════════════════════════════════════════════════════
//  五行得分
// ═══════════════════════════════════════════════════════════════

function calcScores(pillars: [string, string][], monthBranch: string): Record<string, number> {
  const monthEl = BRANCH_ELEMENT[asBranch(monthBranch)];
  const weights = SEASON_WEIGHT[monthEl];
  const raw: Record<string, number> = { '木': 0, '火': 0, '土': 0, '金': 0, '水': 0 };
  for (const [stem, branch] of pillars) {
    raw[STEM_ELEMENT[asStem(stem)]] += 1.0;
    raw[BRANCH_ELEMENT[asBranch(branch)]] += 1.5;
    for (const hel of hiddenElements(branch)) {
      raw[hel] += 0.5;
    }
  }
  const result: Record<string, number> = {};
  for (const el of ELEMENTS) {
    result[el] = Math.round(raw[el] * weights[el] * 100) / 100;
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════
//  日主强弱 & 用神忌神
// ═══════════════════════════════════════════════════════════════

function judgeDaymasterStrength(dayStem: string, scores: Record<string, number>): [string, number] {
  const dayEl = STEM_ELEMENT[asStem(dayStem)];
  const genEl = GEN_BY[dayEl] || '';
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const support = (scores[dayEl] || 0) + (scores[genEl] || 0);
  const ratio = total > 0 ? support / total : 0;

  let level: string;
  if (ratio >= 0.55) level = '身旺';
  else if (ratio >= 0.45) level = '中和';
  else level = '身弱';
  return [level, Math.round(ratio * 1000) / 10];
}

function getYongshen(dayStem: string, strength: string): {
  yongshen: string[]; xishen: string[]; jishen: string[]; xianshen: string[]; note: string;
} {
  const dayEl = STEM_ELEMENT[asStem(dayStem)];
  const foodEl = GENERATES[dayEl];
  const wealthEl = RESTRAINS[dayEl];
  const officialEl = RST_BY[dayEl] || '';
  const genEl = GEN_BY[dayEl] || '';

  if (strength === '身旺') {
    return {
      yongshen: [foodEl, wealthEl, officialEl],
      xishen: [foodEl],
      jishen: [dayEl, genEl],
      xianshen: [],
      note: '日主过旺，宜食伤泄秀、财星耗气、官杀制约',
    };
  } else if (strength === '身弱') {
    return {
      yongshen: [genEl, dayEl],
      xishen: [genEl],
      jishen: [foodEl, wealthEl, officialEl],
      xianshen: [],
      note: '日主偏弱，宜印星滋养、比劫扶身为用',
    };
  } else {
    return {
      yongshen: [foodEl, genEl],
      xishen: [foodEl],
      jishen: [],
      xianshen: [dayEl, wealthEl, officialEl],
      note: '日主中和，调候为主，均衡发展',
    };
  }
}

// ═══════════════════════════════════════════════════════════════
//  大运推算
// ═══════════════════════════════════════════════════════════════

interface DayunItem {
  stem: string; branch: string; stemEl: string; branchEl: string;
  age: string; yearRange: string; nayin: string;
}

function calcDayun(year: number, yStem: string, mStem: string, mBranch: string): DayunItem[] {
  const yy = STEM_YINYANG[asStem(yStem)];
  const forward = yy === '阳';
  const startAge = 3;
  const mStemIdx = STEMS.indexOf(mStem as Stem);
  const mBranchIdx = BRANCHES.indexOf(mBranch as Branch);

  const list: DayunItem[] = [];
  for (let i = 1; i <= 8; i++) {
    const si = forward ? (mStemIdx + i) % 10 : (mStemIdx - i + 10) % 10;
    const bi = forward ? (mBranchIdx + i) % 12 : (mBranchIdx - i + 12) % 12;
    const ds = STEMS[si];
    const db = BRANCHES[bi];
    const ageStart = startAge + (i - 1) * 10;
    const calStart = year + ageStart;
    list.push({
      stem: ds, branch: db,
      stemEl: STEM_ELEMENT[ds], branchEl: BRANCH_ELEMENT[db],
      age: `${ageStart}–${ageStart + 9}岁`,
      yearRange: `${calStart}–${calStart + 9}年`,
      nayin: getNayin(ds, db),
    });
  }
  return list;
}

// ═══════════════════════════════════════════════════════════════
//  流年运势
// ═══════════════════════════════════════════════════════════════

function calcLiunian(currentYear: number, dayStem: string, scores: Record<string, number>, yongshen: ReturnType<typeof getYongshen>) {
  const [lyStem, lyBranch] = getYearPillar(currentYear);
  const lyEl = STEM_ELEMENT[asStem(lyStem)];
  const dayEl = STEM_ELEMENT[asStem(dayStem)];

  const rel = shishen(dayEl, STEM_YINYANG[asStem(dayStem)], lyEl, STEM_YINYANG[asStem(lyStem)]);
  let luck: string; let advice: string;

  if (yongshen.yongshen.includes(lyEl)) {
    luck = '大吉 ★★★★★';
    advice = `${lyEl}行流年，恰逢用神，诸事顺遂，宜进取发展`;
  } else if (yongshen.jishen.includes(lyEl)) {
    luck = '注意 ★★☆☆☆';
    advice = `${lyEl}行流年，触动忌神，需防${ELEMENT_DETAIL[lyEl].organ}相关健康问题，凡事谨慎`;
  } else if (GENERATES[lyEl] && yongshen.yongshen.includes(GENERATES[lyEl])) {
    luck = '较吉 ★★★★☆';
    advice = `${lyEl}行流年，间接生旺用神，整体平稳中有进步`;
  } else {
    luck = '平稳 ★★★☆☆';
    advice = `${lyEl}行流年，对命局影响中性，维持现状，稳步前行`;
  }

  return {
    year: currentYear, pillar: lyStem + lyBranch, element: lyEl,
    relation: rel, nayin: getNayin(lyStem, lyBranch), luck, advice,
  };
}

// ═══════════════════════════════════════════════════════════════
//  体质判定
// ═══════════════════════════════════════════════════════════════

function determineConstitution(scores: Record<string, number>, dominant: string, weak: string): string {
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxSc = scores[dominant];
  const spread = maxSc - scores[weak];

  if (total > 0 && spread <= total * 0.18 && maxSc / total < 0.32) return '平和质';

  const rules: [string, string, string][] = [
    ['水','火','阳虚质'],['水','金','气虚质'],['水','土','痰湿质'],
    ['水','木','血瘀质'],['水','水','阳虚质'],
    ['木','金','气郁质'],['木','木','气郁质'],['木','土','气郁质'],
    ['木','火','阴虚质'],['木','水','血瘀质'],
    ['火','水','阴虚质'],['火','金','阴虚质'],['火','火','阴虚质'],
    ['火','木','湿热质'],['火','土','湿热质'],
    ['土','木','痰湿质'],['土','水','痰湿质'],['土','火','湿热质'],
    ['土','土','痰湿质'],['土','金','气虚质'],
    ['金','火','气虚质'],['金','木','气虚质'],['金','金','气虚质'],
    ['金','水','阳虚质'],['金','土','痰湿质'],
  ];
  for (const [dom, wk, const_] of rules) {
    if (dominant === dom && weak === wk) return const_;
  }
  return '气虚质';
}

// ═══════════════════════════════════════════════════════════════
//  主计算 — 导出
// ═══════════════════════════════════════════════════════════════

export interface ConstitutionReport {
  year: number; month: number; day: number;
  pillars: [string, string][];
  nayins: string[]; shishens: string[];
  yStem: string; yBranch: string;
  mStem: string; mBranch: string;
  dStem: string; dBranch: string;
  hStem: string; hBranch: string;
  birthHour: string; yinYang: string; zodiac: string;
  monthEl: string;
  scores: Record<string, number>;
  total: number; dominant: string; weak: string; missing: string[];
  lifePalace: string; fetalOrigin: [string, string];
  strength: string; supportRatio: number;
  yongshen: ReturnType<typeof getYongshen>;
  dayun: DayunItem[];
  liunian: ReturnType<typeof calcLiunian>;
  constitution: string;
  constitutionInfo: typeof CONSTITUTION_INFO[string];
  elementDetail: typeof ELEMENT_DETAIL;
  hourRanges: typeof HOUR_RANGES;
  lunarYear?: number; lunarMonth?: number; lunarDay?: number; lunarMonthName?: string; lunarDayName?: string;
  isLeapMonth?: boolean;
}

export function calcConstitution(
  year: number, month: number, day: number, hourStr: string,
  isLunar = false, isLeapMonth = false
): ConstitutionReport {
  const hourBranch = hourStr.replace('时', '');

  // 如果输入是公历，转为农历后推算四柱
  let lunarYear = year, lunarMonth = month, lunarDay = day;
  let leapMonth = isLeapMonth;
  let lunarMonthName = LUNAR_MONTH_NAMES[month] || `${month}月`;
  let lunarDayName = LUNAR_DAY_NAMES[day] || `${day}日`;

  if (!isLunar) {
    // 公历转农历
    try {
      const solar = Solar.fromYmd(year, month, day);
      const lunar = solar.getLunar();
      lunarYear = lunar.getYear();
      lunarMonth = lunar.getMonth();
      lunarDay = lunar.getDay();
      leapMonth = lunar.getMonth() < 0; // 负数表示闰月
      if (leapMonth) lunarMonth = -lunarMonth;
      lunarMonthName = lunar.getMonthInChinese();
      lunarDayName = lunar.getDayInChinese();
    } catch (e) {
      // 转换失败时回退为原值
    }
  }

  // 四柱推算使用农历年月（这是八字推算的正确方式）
  const [yStem, yBranch] = getYearPillar(lunarYear);
  const [mStem, mBranch] = getMonthPillar(lunarYear, lunarMonth);
  const [dStem, dBranch] = getDayPillar(year, month, day); // 日柱仍用实际日期计算干支
  const [hStem, hBranch] = getHourPillar(dStem, hourBranch);

  const pillars: [string, string][] = [[yStem,yBranch],[mStem,mBranch],[dStem,dBranch],[hStem,hBranch]];
  const scores = calcScores(pillars, mBranch);
  const total = Object.values(scores).reduce((a, b) => a + b, 0);

  let dominant = '木', weak = '木';
  let maxSc = -1, minSc = Infinity;
  for (const el of ELEMENTS) {
    if (scores[el] > maxSc) { maxSc = scores[el]; dominant = el; }
    if (scores[el] < minSc) { minSc = scores[el]; weak = el; }
  }

  const nayins = pillars.map(([s, b]) => getNayin(s, b));
  const shishens = pillars.map(([s]) => shishen(STEM_ELEMENT[asStem(dStem)], STEM_YINYANG[asStem(dStem)], STEM_ELEMENT[asStem(s)], STEM_YINYANG[asStem(s)]));

  const lifePalace = getLifePalace(lunarMonth, hourBranch);
  const fetalOrigin = getFetalOrigin(yStem, mStem);

  const [strength, supportRatio] = judgeDaymasterStrength(dStem, scores);
  const yongshen = getYongshen(dStem, strength);

  const dayun = calcDayun(lunarYear, yStem, mStem, mBranch);
  const liunian = calcLiunian(new Date().getFullYear(), dStem, scores, yongshen);

  const missing = ELEMENTS.filter(el => scores[el] < total * 0.08);
  const constitution = determineConstitution(scores, dominant, weak);

  return {
    year, month, day, pillars, nayins, shishens,
    yStem, yBranch, mStem, mBranch, dStem, dBranch, hStem, hBranch,
    birthHour: hourStr.endsWith('时') ? hourStr : hourStr + '时',
    yinYang: STEM_YINYANG[asStem(yStem)], zodiac: ZODIAC[asBranch(yBranch)],
    monthEl: BRANCH_ELEMENT[asBranch(mBranch)],
    scores, total, dominant, weak, missing,
    lifePalace, fetalOrigin, strength, supportRatio,
    yongshen, dayun, liunian, constitution,
    constitutionInfo: CONSTITUTION_INFO[constitution],
    elementDetail: ELEMENT_DETAIL,
    hourRanges: HOUR_RANGES,
    lunarYear, lunarMonth, lunarDay, lunarMonthName, lunarDayName,
    isLeapMonth: leapMonth,
  };
}

// 导出常量供前端使用
export { STEMS, BRANCHES, ELEMENTS, STEM_ELEMENT, STEM_YINYANG, BRANCH_ELEMENT, ZODIAC, CONSTITUTION_INFO, ELEMENT_DETAIL, HOUR_BRANCHES, HOUR_RANGES, LUNAR_MONTH_NAMES, LUNAR_DAY_NAMES };
