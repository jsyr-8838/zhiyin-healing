export interface SolarTermDateInfo {
  name: string;
  nameEn: string;
  order: number;
  month: number;
  day: number;
  endMonth: number;
  endDay: number;
  season: string;
  wuxing: string;
  meridian: string;
  meridianCode: string;
  huangJing: string;
}

export interface SolarTermWellness {
  name: string;
  preAdvice: string[];
  onsetAdvice: string[];
  postAdvice: string[];
  essentialOils: string[];
  meridian: string;
  peakTime: string;
  dietFocus: string;
  routineFocus: string;
  incense: string;
  contraindication: string;
}

export const SOLAR_TERM_DATES: SolarTermDateInfo[] = [
  { name: '小寒', nameEn: 'Minor Cold', order: 0, month: 1, day: 5, endMonth: 1, endDay: 19, season: '冬', wuxing: '水', meridian: '肺经', meridianCode: 'LU', huangJing: '285°' },
  { name: '大寒', nameEn: 'Major Cold', order: 1, month: 1, day: 20, endMonth: 2, endDay: 3, season: '冬', wuxing: '水', meridian: '心包经', meridianCode: 'PC', huangJing: '300°' },
  { name: '立春', nameEn: 'Start of Spring', order: 2, month: 2, day: 4, endMonth: 2, endDay: 18, season: '春', wuxing: '木', meridian: '肝经', meridianCode: 'LR', huangJing: '315°' },
  { name: '雨水', nameEn: 'Rain Water', order: 3, month: 2, day: 19, endMonth: 3, endDay: 4, season: '春', wuxing: '木', meridian: '胆经', meridianCode: 'GB', huangJing: '330°' },
  { name: '惊蛰', nameEn: 'Awakening', order: 4, month: 3, day: 5, endMonth: 3, endDay: 19, season: '春', wuxing: '木', meridian: '肝经', meridianCode: 'LR', huangJing: '345°' },
  { name: '春分', nameEn: 'Spring Equinox', order: 5, month: 3, day: 20, endMonth: 4, endDay: 4, season: '春', wuxing: '木', meridian: '胆经', meridianCode: 'GB', huangJing: '0°' },
  { name: '清明', nameEn: 'Clear & Bright', order: 6, month: 4, day: 5, endMonth: 4, endDay: 19, season: '春', wuxing: '木', meridian: '肝经', meridianCode: 'LR', huangJing: '15°' },
  { name: '谷雨', nameEn: 'Grain Rain', order: 7, month: 4, day: 20, endMonth: 5, endDay: 4, season: '春', wuxing: '土', meridian: '脾经', meridianCode: 'SP', huangJing: '30°' },
  { name: '立夏', nameEn: 'Start of Summer', order: 8, month: 5, day: 5, endMonth: 5, endDay: 20, season: '夏', wuxing: '火', meridian: '心经', meridianCode: 'HT', huangJing: '45°' },
  { name: '小满', nameEn: 'Grain Buds', order: 9, month: 5, day: 21, endMonth: 6, endDay: 5, season: '夏', wuxing: '火', meridian: '小肠经', meridianCode: 'SI', huangJing: '60°' },
  { name: '芒种', nameEn: 'Grain in Ear', order: 10, month: 6, day: 6, endMonth: 6, endDay: 20, season: '夏', wuxing: '火', meridian: '心经', meridianCode: 'HT', huangJing: '75°' },
  { name: '夏至', nameEn: 'Summer Solstice', order: 11, month: 6, day: 21, endMonth: 7, endDay: 6, season: '夏', wuxing: '火', meridian: '胃经', meridianCode: 'ST', huangJing: '90°' },
  { name: '小暑', nameEn: 'Minor Heat', order: 12, month: 7, day: 7, endMonth: 7, endDay: 22, season: '夏', wuxing: '火', meridian: '心包经', meridianCode: 'PC', huangJing: '105°' },
  { name: '大暑', nameEn: 'Major Heat', order: 13, month: 7, day: 23, endMonth: 8, endDay: 6, season: '夏', wuxing: '土', meridian: '脾经', meridianCode: 'SP', huangJing: '120°' },
  { name: '立秋', nameEn: 'Start of Autumn', order: 14, month: 8, day: 7, endMonth: 8, endDay: 22, season: '秋', wuxing: '金', meridian: '肺经', meridianCode: 'LU', huangJing: '135°' },
  { name: '处暑', nameEn: 'End of Heat', order: 15, month: 8, day: 23, endMonth: 9, endDay: 7, season: '秋', wuxing: '金', meridian: '胆经', meridianCode: 'GB', huangJing: '150°' },
  { name: '白露', nameEn: 'White Dew', order: 16, month: 9, day: 8, endMonth: 9, endDay: 22, season: '秋', wuxing: '金', meridian: '膀胱经', meridianCode: 'BL', huangJing: '165°' },
  { name: '秋分', nameEn: 'Autumn Equinox', order: 17, month: 9, day: 23, endMonth: 10, endDay: 7, season: '秋', wuxing: '金', meridian: '肺经', meridianCode: 'LU', huangJing: '180°' },
  { name: '寒露', nameEn: 'Cold Dew', order: 18, month: 10, day: 8, endMonth: 10, endDay: 22, season: '秋', wuxing: '金', meridian: '大肠经', meridianCode: 'LI', huangJing: '195°' },
  { name: '霜降', nameEn: "Frost's Descent", order: 19, month: 10, day: 23, endMonth: 11, endDay: 6, season: '秋', wuxing: '土', meridian: '脾经', meridianCode: 'SP', huangJing: '210°' },
  { name: '立冬', nameEn: 'Start of Winter', order: 20, month: 11, day: 7, endMonth: 11, endDay: 21, season: '冬', wuxing: '水', meridian: '肾经', meridianCode: 'KI', huangJing: '225°' },
  { name: '小雪', nameEn: 'Minor Snow', order: 21, month: 11, day: 22, endMonth: 12, endDay: 6, season: '冬', wuxing: '水', meridian: '肾经', meridianCode: 'KI', huangJing: '240°' },
  { name: '大雪', nameEn: 'Major Snow', order: 22, month: 12, day: 7, endMonth: 12, endDay: 21, season: '冬', wuxing: '水', meridian: '肾经', meridianCode: 'KI', huangJing: '255°' },
  { name: '冬至', nameEn: 'Winter Solstice', order: 23, month: 12, day: 22, endMonth: 1, endDay: 4, season: '冬', wuxing: '水', meridian: '胃经', meridianCode: 'ST', huangJing: '270°' },
];

export const SEASON_COLORS: Record<string, string> = {
  '春': '#7DBA6E',
  '夏': '#E86040',
  '秋': '#D4A574',
  '冬': '#4A90D9',
};

export const SEASON_ICONS: Record<string, string> = {
  '春': '🌸',
  '夏': '☀️',
  '秋': '🍂',
  '冬': '❄️',
};

export const SEASON_GRADIENTS: Record<string, [string, string]> = {
  '春': ['#d4edda', '#c3e6cb'],
  '夏': ['#fff3cd', '#ffeaa7'],
  '秋': ['#f5e6d3', '#e8d5c4'],
  '冬': ['#d6eaf8', '#c5dbe8'],
};

export const SOLAR_TERM_WELLNESS: SolarTermWellness[] = [
  {
    name: '小寒',
    preAdvice: ['防寒保暖为首，提前添加衣物', '温补肾阳，可适度进补', '室内保持通风，避免干燥'],
    onsetAdvice: ['小寒至冷时，温补肾阳为要', '早卧晚起，必待日光', '晨起温水泡脚，搓涌泉穴'],
    postAdvice: ['持续温补，食温热食物', '避免剧烈运动，适度散步', '督脉艾灸，固护阳气'],
    essentialOils: ['丁香', '肉桂', '生姜'],
    meridian: '手太阴肺经',
    peakTime: '寅时 3:00-5:00',
    dietFocus: '温补脾肾，食栗子花生',
    routineFocus: '防寒保暖，减少外出',
    incense: '丁香熏香，温中散寒',
    contraindication: '忌食寒凉生冷，忌大汗淋漓',
  },
  {
    name: '大寒',
    preAdvice: ['极寒将至，添衣加被', '温补肾阳食物可增加', '室内适当加湿，防燥伤肺'],
    onsetAdvice: ['大寒为冬末，养藏收官', '温补元阳，食羊肉饺子', '静心安神，减少思虑'],
    postAdvice: ['冬春交替，乍暖还寒注意保暖', '逐步增加户外活动', '养藏收尾，准备迎春'],
    essentialOils: ['没药', '乳香', '广藿香'],
    meridian: '手厥阴心包经',
    peakTime: '戌时 19:00-21:00',
    dietFocus: '温补收官，食八宝粥',
    routineFocus: '养藏收尾，准备迎春',
    incense: '没药熏香，温经固肾',
    contraindication: '忌寒凉食物，忌过度劳累',
  },
  {
    name: '立春',
    preAdvice: ['冬春交替，注意防风御寒', '准备辛甘发散之物', '调整作息，准备早起'],
    onsetAdvice: ['立春阳气生发，助肝气升', '夜卧早起，舒展筋骨', '辛甘发散，食韭菜香菜'],
    postAdvice: ['顺应春气，适度增加运动量', '保持心情舒畅，避免郁怒', '疏肝理气，揉太冲穴'],
    essentialOils: ['紫苏叶', '薄荷', '迷迭香'],
    meridian: '足厥阴肝经',
    peakTime: '丑时 1:00-3:00',
    dietFocus: '辛甘发散，食韭菜香菜',
    routineFocus: '夜卧早起，舒展筋骨',
    incense: '紫苏叶熏香，助肝气生发',
    contraindication: '忌酸收之品，忌久坐不动',
  },
  {
    name: '雨水',
    preAdvice: ['春雨初降，注意防湿', '准备健脾祛湿之品', '早晚温差异大，适时增减衣物'],
    onsetAdvice: ['雨水节气，湿气渐重', '少酸多甘，食山药大枣', '晨起缓行，防风保暖'],
    postAdvice: ['持续健脾祛湿', '防风湿侵袭关节', '按揉足三里、阴陵泉'],
    essentialOils: ['薄荷', '佛手柑', '豆蔻'],
    meridian: '足少阳胆经',
    peakTime: '子时 23:00-1:00',
    dietFocus: '少酸多甘，食山药大枣',
    routineFocus: '晨起缓行，防风保暖',
    incense: '薄荷熏香，疏肝解郁',
    contraindication: '忌肥甘厚味，忌淋雨受凉',
  },
  {
    name: '惊蛰',
    preAdvice: ['万物始生，准备助阳升发', '可食辛散之物助肝', '注意防风，风为春季主气'],
    onsetAdvice: ['惊蛰春雷动，阳气大升', '早起运动，顺应阳气', '清淡养肝，食菠菜芹菜'],
    postAdvice: ['春日运动渐增，量力而行', '保持充足睡眠', '疏肝泻火，揉行间穴'],
    essentialOils: ['艾叶', '尤加利', '茶树'],
    meridian: '足厥阴肝经',
    peakTime: '丑时 1:00-3:00',
    dietFocus: '清淡养肝，食菠菜芹菜',
    routineFocus: '早起运动，顺应阳气',
    incense: '艾叶熏香，驱寒除湿',
    contraindication: '忌暴怒，忌辛辣过度',
  },
  {
    name: '春分',
    preAdvice: ['阴阳相半，调和为主', '饮食忌偏热偏寒', '情志保持平和'],
    onsetAdvice: ['春分昼夜平，阴阳均衡', '作息有常，心情舒畅', '阴阳均衡，忌偏热偏寒'],
    postAdvice: ['持续阴阳调和', '适度运动，不过度', '按摩肝经，推太冲至行间'],
    essentialOils: ['玫瑰', '天竺葵', '依兰'],
    meridian: '足少阳胆经',
    peakTime: '子时 23:00-1:00',
    dietFocus: '阴阳均衡，忌偏热偏寒',
    routineFocus: '作息有常，心情舒畅',
    incense: '玫瑰熏香，调畅情志',
    contraindication: '忌偏食偏嗜，忌情绪极端',
  },
  {
    name: '清明',
    preAdvice: ['清明前后肝气最旺', '准备柔肝养肺之品', '慎食发物，如虾蟹韭菜'],
    onsetAdvice: ['清明踏青时，亲近自然', '柔肝养肺，食银耳百合', '菊花熏香，清肝明目'],
    postAdvice: ['春气升发旺盛，注意疏泄', '防过敏，少食发物', '养肺防燥，按合谷穴'],
    essentialOils: ['菊花', '薄荷', '薰衣草'],
    meridian: '足厥阴肝经',
    peakTime: '丑时 1:00-3:00',
    dietFocus: '柔肝养肺，食银耳百合',
    routineFocus: '踏青散步，亲近自然',
    incense: '菊花熏香，清肝明目',
    contraindication: '忌食发物，忌怒火攻心',
  },
  {
    name: '谷雨',
    preAdvice: ['暮春湿气加重，准备祛湿', '增甘减酸饮食调整', '防湿邪入体'],
    onsetAdvice: ['谷雨春将暮，健脾祛湿', '增甘减酸，食薏仁红豆', '适度运动，防湿保暖'],
    postAdvice: ['湿气重，持续健脾', '准备过渡到夏季饮食', '祛湿常按阴陵泉'],
    essentialOils: ['荷叶', '广藿香', '生姜'],
    meridian: '足太阴脾经',
    peakTime: '巳时 9:00-11:00',
    dietFocus: '增甘减酸，食薏仁红豆',
    routineFocus: '适度运动，防湿保暖',
    incense: '荷叶熏香，健脾祛湿',
    contraindication: '忌寒凉伤脾，忌久坐湿地',
  },
  {
    name: '立夏',
    preAdvice: ['春夏交替，养心安神为先', '准备清心降火之品', '调整午间作息，准备午睡'],
    onsetAdvice: ['立夏心火旺，养心安神', '清淡为主，食绿豆莲子', '夜卧早起，午间小憩'],
    postAdvice: ['心火渐旺，继续清心', '午睡养心很重要', '按内关、神门安眠'],
    essentialOils: ['檀香', '乳香', '薰衣草'],
    meridian: '手少阴心经',
    peakTime: '午时 11:00-13:00',
    dietFocus: '清淡为主，食绿豆莲子',
    routineFocus: '夜卧早起，午间小憩',
    incense: '檀香熏香，宁心安神',
    contraindication: '忌大喜大悲，忌暴晒暴汗',
  },
  {
    name: '小满',
    preAdvice: ['湿热渐显，清热利湿', '避免贪凉伤阳', '准备消暑之物'],
    onsetAdvice: ['小满湿热生，清利为要', '清热利湿，食冬瓜薏米', '避免贪凉，静心养神'],
    postAdvice: ['湿气重，持续清热利湿', '防湿热型皮肤病', '刮痧祛湿，排脾经湿热'],
    essentialOils: ['薰衣草', '薄荷', '柠檬'],
    meridian: '手太阳小肠经',
    peakTime: '未时 13:00-15:00',
    dietFocus: '清热利湿，食冬瓜薏米',
    routineFocus: '避免贪凉，静心养神',
    incense: '薰衣草熏香，安心定志',
    contraindication: '忌冰饮寒凉，忌空调直吹',
  },
  {
    name: '芒种',
    preAdvice: ['暑气日盛，注意防暑', '清补为主饮食调整', '午睡习惯要养成'],
    onsetAdvice: ['芒种忙种时，清心降火', '清补为主，食苦瓜黄瓜', '午睡养心，避免烈日'],
    postAdvice: ['三伏将至，持续养心', '心火旺可按少府穴', '清淡饮食，防暑降温'],
    essentialOils: ['薄荷', '茶树', '尤加利'],
    meridian: '手少阴心经',
    peakTime: '午时 11:00-13:00',
    dietFocus: '清补为主，食苦瓜黄瓜',
    routineFocus: '午睡养心，避免烈日',
    incense: '荷花熏香，清心降火',
    contraindication: '忌烈日暴晒，忌辛辣燥热',
  },
  {
    name: '夏至',
    preAdvice: ['阳气极盛，注意养阳护阴', '准备降火安神之物', '避免过度运动耗气'],
    onsetAdvice: ['夏至阳极阴生，养阳护阴', '忌食生冷，食酸梅绿豆', '沉香熏香，降火安神'],
    postAdvice: ['阴气始生，注意护阳', '晚睡早起适当调整', '灸关元穴，冬病夏治'],
    essentialOils: ['沉香', '檀香', '乳香'],
    meridian: '足阳明胃经',
    peakTime: '辰时 7:00-9:00',
    dietFocus: '忌食生冷，食酸梅绿豆',
    routineFocus: '养阳护阴，夜卧早起',
    incense: '沉香熏香，降火安神',
    contraindication: '忌贪凉过度，忌房事过度',
  },
  {
    name: '小暑',
    preAdvice: ['伏天将至，备好消暑之物', '调整运动时间，避开正午', '心火旺盛注意静心'],
    onsetAdvice: ['小暑入伏，清暑益气', '清淡消暑，食西瓜荷叶', '避免暑热，静心养气'],
    postAdvice: ['三伏天持续，冬病夏治好时机', '艾灸督脉、足三里', '大量流汗及时补水补盐'],
    essentialOils: ['薄荷', '柠檬', '茶树'],
    meridian: '手厥阴心包经',
    peakTime: '戌时 19:00-21:00',
    dietFocus: '清淡消暑，食西瓜荷叶',
    routineFocus: '避免暑热，静心养气',
    incense: '薄荷熏香，清暑益气',
    contraindication: '忌冷水浴，忌暴饮暴食',
  },
  {
    name: '大暑',
    preAdvice: ['一年最热，做好防暑降温', '准备化湿解暑之品', '减少户外活动时间'],
    onsetAdvice: ['大暑极热时，化湿解暑', '清热解暑，食绿豆百合', '防暑降温，安神定志'],
    postAdvice: ['暑热将退，仍需防暑', '逐步恢复正常运动量', '长夏主湿，持续健脾'],
    essentialOils: ['藿香', '广藿香', '薄荷'],
    meridian: '足太阴脾经',
    peakTime: '巳时 9:00-11:00',
    dietFocus: '清热解暑，食绿豆百合',
    routineFocus: '防暑降温，安神定志',
    incense: '藿香熏香，化湿解暑',
    contraindication: '忌暴晒中暑，忌贪凉伤脾',
  },
  {
    name: '立秋',
    preAdvice: ['夏秋交替，润燥养肺', '准备滋阴润燥之品', '秋冻尚早，注意温差'],
    onsetAdvice: ['立秋燥气生，润肺生津', '滋阴润燥，食梨银耳', '早卧早起，收敛神气'],
    postAdvice: ['秋燥明显，持续润肺', '防秋乏，适当运动', '按太渊穴养肺气'],
    essentialOils: ['桂花', '柠檬', '薄荷'],
    meridian: '手太阴肺经',
    peakTime: '寅时 3:00-5:00',
    dietFocus: '滋阴润燥，食梨银耳',
    routineFocus: '早卧早起，收敛神气',
    incense: '桂花熏香，润肺生津',
    contraindication: '忌辛辣燥热，忌大汗耗气',
  },
  {
    name: '处暑',
    preAdvice: ['暑气渐消，秋凉渐至', '少辛多酸饮食调整', '注意早晚温差'],
    onsetAdvice: ['处暑暑气止，清热润肺', '少辛多酸，食蜂蜜芝麻', '秋冻适度，养肺为先'],
    postAdvice: ['秋高气爽，适度增加户外', '润燥持续，防秋燥伤肺', '按揉列缺穴润肺'],
    essentialOils: ['菊花', '薰衣草', '橙花'],
    meridian: '足少阳胆经',
    peakTime: '子时 23:00-1:00',
    dietFocus: '少辛多酸，食蜂蜜芝麻',
    routineFocus: '秋冻适度，养肺为先',
    incense: '菊花熏香，清热润肺',
    contraindication: '忌辛辣煎炸，忌冷水浴',
  },
  {
    name: '白露',
    preAdvice: ['寒露将至，早晚添衣', '准备温润养肺之品', '防寒气入侵'],
    onsetAdvice: ['白露秋风凉，温肺散寒', '温润养肺，食山药百合', '早晚添衣，防寒保暖'],
    postAdvice: ['秋燥转凉，防燥又防寒', '温补脾肾初开始', '灸肺俞穴温肺'],
    essentialOils: ['松木', '尤加利', '乳香'],
    meridian: '足太阳膀胱经',
    peakTime: '申时 15:00-17:00',
    dietFocus: '温润养肺，食山药百合',
    routineFocus: '早晚添衣，防寒保暖',
    incense: '松木熏香，温肺散寒',
    contraindication: '忌秋冻过度，忌食冷饮',
  },
  {
    name: '秋分',
    preAdvice: ['昼夜再次均等，阴阳调和', '准备阴阳均衡之食', '注意情绪平和'],
    onsetAdvice: ['秋分阴阳半，调和为要', '阴阳均衡，食梨枸杞', '作息有常，心情平和'],
    postAdvice: ['阴气渐盛，注意养阴', '防悲秋情绪低落', '檀香安神，调和阴阳'],
    essentialOils: ['檀香', '玫瑰', '依兰'],
    meridian: '手太阴肺经',
    peakTime: '寅时 3:00-5:00',
    dietFocus: '阴阳均衡，食梨枸杞',
    routineFocus: '作息有常，心情平和',
    incense: '檀香熏香，调和阴阳',
    contraindication: '忌忧思过度，忌饮食无常',
  },
  {
    name: '寒露',
    preAdvice: ['寒气日重，准备温补', '温补脾肾开始', '早卧晚起习惯调整'],
    onsetAdvice: ['寒露秋已深，温肾纳气', '温补脾肾，食栗子核桃', '早卧晚起，防寒护阳'],
    postAdvice: ['深秋寒重，持续温补', '防寒保暖非常重要', '灸肾俞穴温补肾阳'],
    essentialOils: ['乳香', '没药', '生姜'],
    meridian: '手阳明大肠经',
    peakTime: '卯时 5:00-7:00',
    dietFocus: '温补脾肾，食栗子核桃',
    routineFocus: '早卧晚起，防寒护阳',
    incense: '乳香熏香，温肾纳气',
    contraindication: '忌寒凉食物，忌过度劳累',
  },
  {
    name: '霜降',
    preAdvice: ['霜降将至，注意深秋防寒', '温补食物增加', '运动量适度减少'],
    onsetAdvice: ['霜降秋已末，温经散寒', '温补为主，食羊肉萝卜', '适度运动，保暖防寒'],
    postAdvice: ['秋冬交替，大温补开始', '准备冬令进补方案', '灸关元穴培元固本'],
    essentialOils: ['没药', '肉桂', '广藿香'],
    meridian: '足太阴脾经',
    peakTime: '巳时 9:00-11:00',
    dietFocus: '温补为主，食羊肉萝卜',
    routineFocus: '适度运动，保暖防寒',
    incense: '没药熏香，温经散寒',
    contraindication: '忌寒凉生冷，忌冒霜出行',
  },
  {
    name: '立冬',
    preAdvice: ['冬令开始，准备温补养藏', '增加温补肾阳食物', '作息调整早睡晚起'],
    onsetAdvice: ['立冬藏之始，温肾藏精', '温补养藏，食黑豆核桃', '早卧晚起，养藏阳气'],
    postAdvice: ['冬藏为主，减少运动量', '保暖防寒持续', '肾经疏通，揉涌泉穴'],
    essentialOils: ['沉香', '檀香', '乳香'],
    meridian: '足少阴肾经',
    peakTime: '酉时 17:00-19:00',
    dietFocus: '温补养藏，食黑豆核桃',
    routineFocus: '早卧晚起，养藏阳气',
    incense: '沉香熏香，温肾藏精',
    contraindication: '忌寒凉伤肾，忌大汗淋漓',
  },
  {
    name: '小雪',
    preAdvice: ['冬寒加深，保暖加温', '温补肾阳食物为主', '静心安神防抑郁'],
    onsetAdvice: ['小雪寒渐浓，温阳安神', '温补肾阳，食羊肉桂圆', '保暖防寒，静心养神'],
    postAdvice: ['日照短，预防冬季抑郁', '温补持续，可膏方进补', '艾灸命门穴温补肾阳'],
    essentialOils: ['安息香', '檀香', '乳香'],
    meridian: '足少阴肾经',
    peakTime: '酉时 17:00-19:00',
    dietFocus: '温补肾阳，食羊肉桂圆',
    routineFocus: '保暖防寒，静心养神',
    incense: '安息香熏香，温阳安神',
    contraindication: '忌忧思过度，忌寒冷环境久留',
  },
  {
    name: '大雪',
    preAdvice: ['大雪前后寒气最重', '温阳散寒食物加大力度', '减少一切不必要外出'],
    onsetAdvice: ['大雪仲冬时，温阳散寒', '温补为主，食红枣当归', '早卧晚起，固护阳气'],
    postAdvice: ['冬至将至，极寒养藏', '适当进补高热量食物', '灸气海穴温阳补气'],
    essentialOils: ['肉桂', '生姜', '丁香'],
    meridian: '足少阴肾经',
    peakTime: '酉时 17:00-19:00',
    dietFocus: '温补为主，食红枣当归',
    routineFocus: '早卧晚起，固护阳气',
    incense: '肉桂熏香，温阳散寒',
    contraindication: '忌寒凉入体，忌房事过度',
  },
  {
    name: '冬至',
    preAdvice: ['冬至将至，极寒养藏', '温补肾阳食物备好', '调整作息极早就寝'],
    onsetAdvice: ['冬至一阳生，温补肾阳', '温补元阳，食羊肉饺子', '极寒养藏，适度进补'],
    postAdvice: ['阳气始生，护阳为要', '冬至进补正当时', '灸神阙穴培元固本'],
    essentialOils: ['乳香', '没药', '檀香'],
    meridian: '足阳明胃经',
    peakTime: '辰时 7:00-9:00',
    dietFocus: '温补元阳，食羊肉饺子',
    routineFocus: '极寒养藏，适度进补',
    incense: '乳香熏香，温补肾阳',
    contraindication: '忌剧烈运动，忌暴饮暴食',
  },
];

export function getSolarTermDate(year: number, term: SolarTermDateInfo): Date {
  return new Date(year, term.month - 1, term.day);
}

export function getCurrentSolarTermDateInfo(date: Date = new Date()): SolarTermDateInfo {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (let i = SOLAR_TERM_DATES.length - 1; i >= 0; i--) {
    const term = SOLAR_TERM_DATES[i];
    const termStart = new Date(year, term.month - 1, term.day);
    const termEnd = new Date(
      term.endMonth < term.month ? year + 1 : year,
      term.endMonth - 1,
      term.endDay
    );
    if (date >= termStart && date <= termEnd) {
      return term;
    }
  }

  const lastTerm = SOLAR_TERM_DATES[SOLAR_TERM_DATES.length - 1];
  const lastTermEnd = new Date(year, lastTerm.endMonth - 1, lastTerm.endDay);
  if (date <= lastTermEnd) {
    return lastTerm;
  }

  return SOLAR_TERM_DATES[0];
}

export function getCurrentWellness(date: Date = new Date()): SolarTermWellness {
  const termInfo = getCurrentSolarTermDateInfo(date);
  return SOLAR_TERM_WELLNESS.find(w => w.name === termInfo.name) || SOLAR_TERM_WELLNESS[0];
}

export function getSolarTermProximity(date: Date = new Date()): {
  current: SolarTermDateInfo;
  next: SolarTermDateInfo;
  daysUntilNext: number;
  phase: 'pre' | 'onset' | 'post';
} {
  const current = getCurrentSolarTermDateInfo(date);
  const year = date.getFullYear();
  const currentStart = new Date(year, current.month - 1, current.day);
  const daysSinceStart = Math.floor((date.getTime() - currentStart.getTime()) / (1000 * 60 * 60 * 24));

  const phase: 'pre' | 'onset' | 'post' =
    daysSinceStart <= 2 ? 'pre' : daysSinceStart <= 7 ? 'onset' : 'post';

  const nextOrder = (current.order + 1) % 24;
  const next = SOLAR_TERM_DATES[nextOrder];
  const nextStart = new Date(
    next.order <= current.order ? year + 1 : year,
    next.month - 1,
    next.day
  );
  const daysUntilNext = Math.floor((nextStart.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  return { current, next, daysUntilNext, phase };
}

export function getSolarTermsInMonth(year: number, month: number): SolarTermDateInfo[] {
  return SOLAR_TERM_DATES.filter(t => t.month === month || t.endMonth === month).map(t => {
    const termDate = t.month === month
      ? new Date(year, t.month - 1, t.day)
      : new Date(year, t.endMonth - 1, t.endDay);
    return { ...t, _date: termDate } as SolarTermDateInfo & { _date: Date };
  }).sort((a, b) => a._date.getTime() - b._date.getTime());
}

export function getCalendarTermMarkers(year: number, month: number): Array<{
  day: number;
  term: SolarTermDateInfo;
}> {
  const markers: Array<{ day: number; term: SolarTermDateInfo }> = [];
  for (const term of SOLAR_TERM_DATES) {
    if (term.month === month) {
      markers.push({ day: term.day, term });
    }
    if (term.endMonth === month) {
      if (term.endDay < term.day || term.endMonth !== term.month) {
        markers.push({ day: term.endDay, term });
      }
    }
  }
  return markers;
}
