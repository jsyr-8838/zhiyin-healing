/**
 * tcm-lifestyle-data.ts — 中医生活方式数据模块
 * 
 * 整合自 tcm-acupoint 开源项目的生活模块数据：
 *   - 穴位按摩手法详情
 *   - 二十四节气饮食
 *   - 运动康复方案
 *   - 茶道冲泡数据
 *   - 酒道品鉴数据
 *   - 花语与节日送花指南
 *   - 症状同义词映射（增强搜索）
 */

// ============================================================
//  一、穴位按摩手法
// ============================================================

export interface MassageTechnique {
  /** 穴位名称 */
  name: string;
  /** 所属经络 */
  meridian: string;
  /** 功效描述 */
  effects: string[];
  /** 按摩方法 */
  massage: {
    method: string;
    duration: string;
    frequency: string;
    strength: string;
  };
  /** 注意事项 */
  tips: string;
  /** 对应症状 */
  symptoms: string[];
}

export const MASSAGE_TECHNIQUES: MassageTechnique[] = [
  {
    name: '合谷', meridian: '大肠经',
    effects: ['镇痛安神', '通经活络', '疏风解表'],
    massage: { method: '拇指按揉，对准虎口凹陷处，向食指方向按压', duration: '每侧3~5分钟', frequency: '每日2~3次', strength: '中等力度，以酸胀为度' },
    tips: '孕妇禁用，可致子宫收缩', symptoms: ['头痛', '牙痛', '面瘫', '感冒', '咽喉肿痛'],
  },
  {
    name: '足三里', meridian: '胃经',
    effects: ['健脾和胃', '扶正培元', '通经活络'],
    massage: { method: '拇指按揉，外膝眼下3寸，胫骨外一横指处', duration: '每侧5~10分钟', frequency: '每日1~2次', strength: '中重度按压，得气后缓揉' },
    tips: '常按可益寿延年，是保健要穴', symptoms: ['胃痛', '腹胀', '消化不良', '虚劳', '免疫力低下'],
  },
  {
    name: '三阴交', meridian: '脾经',
    effects: ['健脾益血', '调肝补肾', '安神助眠'],
    massage: { method: '拇指按揉，内踝尖上3寸，胫骨内侧后缘', duration: '每侧3~5分钟', frequency: '每日1~2次', strength: '中等力度，酸胀即可' },
    tips: '孕妇禁用，经期慎用', symptoms: ['月经不调', '失眠', '脾胃虚弱', '更年期综合征'],
  },
  {
    name: '太冲', meridian: '肝经',
    effects: ['疏肝理气', '平肝熄风', '清热利湿'],
    massage: { method: '拇指按压，足背第1、2跖骨结合部前方凹陷处', duration: '每侧3~5分钟', frequency: '每日2次', strength: '中等偏重，按至酸胀痛' },
    tips: '情志不畅时按揉效果尤佳', symptoms: ['头痛', '眩晕', '易怒', '月经不调', '肝病'],
  },
  {
    name: '涌泉', meridian: '肾经',
    effects: ['滋阴益肾', '平肝熄风', '醒脑开窍'],
    massage: { method: '拇指或掌根推擦，足底前1/3凹陷处，向趾尖方向推', duration: '每侧5~10分钟', frequency: '每晚睡前', strength: '中等力度，温热为度' },
    tips: '睡前搓涌泉可助眠，坚持数周见效', symptoms: ['失眠', '头痛', '高血压', '肾虚', '足底冷'],
  },
  {
    name: '内关', meridian: '心包经',
    effects: ['宁心安神', '和胃降逆', '宽胸理气'],
    massage: { method: '拇指按压，腕横纹上2寸，两筋之间', duration: '每侧3~5分钟', frequency: '每日2~3次', strength: '中等力度，酸胀为宜' },
    tips: '晕车时按揉可即时缓解', symptoms: ['心悸', '胸闷', '恶心呕吐', '失眠', '晕车'],
  },
  {
    name: '风池', meridian: '胆经',
    effects: ['疏风散寒', '醒脑明目', '通络止痛'],
    massage: { method: '双手拇指同时按压，后颈部枕骨下两侧凹陷处', duration: '每侧3~5分钟', frequency: '每日2次', strength: '中等偏重，酸胀为度' },
    tips: '配合按压风府穴效果更佳', symptoms: ['头痛', '颈肩僵硬', '感冒', '目赤肿痛', '头晕'],
  },
  {
    name: '关元', meridian: '任脉',
    effects: ['培补元气', '导赤通淋', '温经散寒'],
    massage: { method: '掌心摩腹，脐下3寸处，顺时针方向揉按', duration: '5~10分钟', frequency: '每日1~2次', strength: '轻柔缓慢，温热为度' },
    tips: '配合艾灸效果更佳，是强壮要穴', symptoms: ['虚劳', '腹痛', '月经不调', '遗精', '尿频'],
  },
  {
    name: '百会', meridian: '督脉',
    effects: ['醒脑开窍', '升阳举陷', '安神定志'],
    massage: { method: '中指按压，头顶正中线两耳尖连线交点', duration: '3~5分钟', frequency: '每日1~2次', strength: '轻柔按压，不宜过重' },
    tips: '可配合轻叩百会穴提升阳气', symptoms: ['头痛', '眩晕', '失眠', '脱肛', '低血压'],
  },
  {
    name: '气海', meridian: '任脉',
    effects: ['补气固本', '温阳益气', '调经止带'],
    massage: { method: '掌心摩腹，脐下1.5寸处，顺时针揉按', duration: '5~10分钟', frequency: '每日1~2次', strength: '轻柔温热为度' },
    tips: '气虚者坚持按揉可显著改善', symptoms: ['气虚乏力', '腹痛', '月经不调', '遗尿'],
  },
  {
    name: '太溪', meridian: '肾经',
    effects: ['滋阴补肾', '调理冲任', '清虚热'],
    massage: { method: '拇指按揉，内踝尖与跟腱之间凹陷处', duration: '每侧3~5分钟', frequency: '每日1~2次', strength: '中等力度，酸胀即可' },
    tips: '肾虚者可配合涌泉同按', symptoms: ['肾虚', '咽痛', '失眠', '腰痛', '月经不调'],
  },
  {
    name: '曲池', meridian: '大肠经',
    effects: ['疏风解表', '清热利湿', '调和气血'],
    massage: { method: '拇指按压，肘横纹外侧端凹陷处', duration: '每侧3~5分钟', frequency: '每日2次', strength: '中等力度' },
    tips: '配合合谷穴可增强退热效果', symptoms: ['发热', '咽喉肿痛', '荨麻疹', '高血压', '上肢不遂'],
  },
  {
    name: '血海', meridian: '脾经',
    effects: ['调经统血', '祛风止痒', '健脾化湿'],
    massage: { method: '拇指按揉，髌骨内上缘上2寸，股四头肌内侧头隆起处', duration: '每侧3~5分钟', frequency: '每日1~2次', strength: '中等力度' },
    tips: '妇科血症要穴，配合三阴交效果更佳', symptoms: ['月经不调', '痛经', '湿疹', '荨麻疹', '贫血'],
  },
  {
    name: '神门', meridian: '心经',
    effects: ['宁心安神', '清心凉血', '宽胸理气'],
    massage: { method: '拇指轻按，腕横纹尺侧端凹陷处', duration: '每侧3~5分钟', frequency: '每日2次，尤宜睡前', strength: '轻柔按压，不可过重' },
    tips: '失眠首选穴位之一', symptoms: ['失眠', '心悸', '健忘', '焦虑', '多梦'],
  },
  {
    name: '阴陵泉', meridian: '脾经',
    effects: ['健脾利湿', '调经止带', '通利三焦'],
    massage: { method: '拇指按压，胫骨内侧髁后下方凹陷处', duration: '每侧3~5分钟', frequency: '每日1~2次', strength: '中等偏重' },
    tips: '湿气重者按之酸胀明显，坚持可祛湿', symptoms: ['水肿', '腹胀', '小便不利', '膝关节痛', '带下'],
  },
];

/** 根据穴位名称查找按摩手法 */
export function getMassageByName(name: string): MassageTechnique | undefined {
  return MASSAGE_TECHNIQUES.find(t => t.name === name);
}

/** 根据症状搜索推荐按摩穴位 */
export function getMassageBySymptom(symptom: string): MassageTechnique[] {
  const q = symptom.toLowerCase();
  return MASSAGE_TECHNIQUES.filter(t =>
    t.symptoms.some(s => s.includes(q) || q.includes(s))
  );
}


// ============================================================
//  二、二十四节气饮食
// ============================================================

export interface SolarTermDiet {
  /** 节气名称 */
  name: string;
  /** 对应公历大约日期 */
  dateRange: string;
  /** 养生原则 */
  principle: string;
  /** 宜食食材 */
  recommended: string[];
  /** 忌食食材 */
  avoid: string[];
  /** 推荐汤品 */
  soup: string;
  /** 推荐茶饮 */
  tea: string;
  /** 五行属性 */
  element: string;
  /** 对应脏腑 */
  organ: string;
  /** 描述 */
  description: string;
}

export const SOLAR_TERM_DIETS: SolarTermDiet[] = [
  { name: '立春', dateRange: '2月3~5日', principle: '生发阳气，疏肝理气', recommended: ['韭菜', '春笋', '菠菜', '荠菜', '香菜'], avoid: ['酸收之品', '寒凉食物'], soup: '韭菜猪肝汤', tea: '茉莉花茶', element: '木', organ: '肝', description: '立春阳气初生，宜食辛甘发散之品，助肝气条达。' },
  { name: '雨水', dateRange: '2月18~20日', principle: '养脾胃，祛湿气', recommended: ['山药', '薏米', '红枣', '小米', '鲫鱼'], avoid: ['油腻辛辣', '生冷'], soup: '薏米山药排骨汤', tea: '陈皮普洱茶', element: '木', organ: '肝/脾', description: '雨水时节湿气渐重，当健脾祛湿为先。' },
  { name: '惊蛰', dateRange: '3月5~7日', principle: '平肝潜阳，养阴润燥', recommended: ['梨', '百合', '银耳', '莲子', '蜂蜜'], avoid: ['燥热食物', '烈酒'], soup: '银耳百合梨汤', tea: '菊花枸杞茶', element: '木', organ: '肝', description: '惊蛰雷动，肝阳易亢，宜养阴柔肝，润肺止咳。' },
  { name: '春分', dateRange: '3月20~22日', principle: '调和阴阳，平衡肝脾', recommended: ['荠菜', '香椿', '樱桃', '核桃', '鸡蛋'], avoid: ['偏热偏寒食物'], soup: '荠菜豆腐汤', tea: '玫瑰花茶', element: '木', organ: '肝', description: '春分昼夜平分，阴阳相半，饮食宜平和不偏。' },
  { name: '清明', dateRange: '4月4~6日', principle: '疏肝健脾，养血柔肝', recommended: ['菊花', '桑叶', '枸杞', '山药', '菊花脑'], avoid: ['发物', '海腥'], soup: '菠菜猪肝汤', tea: '菊花茶', element: '木', organ: '肝', description: '清明肝气最旺，宜柔肝养血，清热明目。' },
  { name: '谷雨', dateRange: '4月19~21日', principle: '健脾祛湿，养肝护肝', recommended: ['薏米', '红豆', '茯苓', '豆芽', '鲫鱼'], avoid: ['寒凉伤脾之品'], soup: '薏米红豆鲫鱼汤', tea: '陈皮茶', element: '木→火', organ: '肝/脾', description: '谷雨湿气最盛，当健脾祛湿，为入夏做准备。' },
  { name: '立夏', dateRange: '5月5~7日', principle: '养心安神，清热消暑', recommended: ['苦瓜', '莲子', '绿豆', '莴苣', '西瓜'], avoid: ['温热上火之品'], soup: '绿豆莲子汤', tea: '绿茶', element: '火', organ: '心', description: '立夏心火渐旺，宜清心降火，养心安神。' },
  { name: '小满', dateRange: '5月20~22日', principle: '清利湿热，健脾和胃', recommended: ['冬瓜', '黄瓜', '薏米', '荸荠', '丝瓜'], avoid: ['肥甘厚味', '温热助湿'], soup: '冬瓜薏米老鸭汤', tea: '荷叶茶', element: '火', organ: '心/脾', description: '小满湿热渐盛，宜清淡利湿，不过食冷饮。' },
  { name: '芒种', dateRange: '6月5~7日', principle: '清热解暑，益气生津', recommended: ['西瓜', '番茄', '黄瓜', '绿豆', '酸梅'], avoid: ['油腻黏滞', '过咸'], soup: '酸梅汤', tea: '乌梅甘草茶', element: '火', organ: '心', description: '芒种气候炎热，当清热生津，顾护心气。' },
  { name: '夏至', dateRange: '6月21~22日', principle: '养心益气，清热消暑', recommended: ['苦瓜', '莲子', '绿豆', '百合', '西瓜'], avoid: ['过食寒凉', '油腻煎炸'], soup: '莲子百合糖水', tea: '金银花茶', element: '火', organ: '心', description: '夏至阳气最旺，需防暑伤气，宜清淡养心。' },
  { name: '小暑', dateRange: '7月6~8日', principle: '清热解暑，健脾除湿', recommended: ['莲藕', '绿豆', '薏米', '鳝鱼', '生姜'], avoid: ['冰冷食物', '过量苦寒'], soup: '莲藕排骨汤', tea: '薄荷绿茶', element: '火→土', organ: '心/脾', description: '小暑伏天将至，需健脾除湿，冬病夏治正当时。' },
  { name: '大暑', dateRange: '7月22~24日', principle: '益气养阴，清暑利湿', recommended: ['西瓜', '绿豆', '苦瓜', '冬瓜', '鳝鱼'], avoid: ['过食生冷', '暴饮暴食'], soup: '老鸭冬瓜汤', tea: '菊花决明子茶', element: '土', organ: '脾', description: '大暑一年最热，当清暑益气，切忌贪凉伤脾。' },
  { name: '立秋', dateRange: '8月7~9日', principle: '润肺生津，养阴清热', recommended: ['梨', '百合', '银耳', '蜂蜜', '莲藕'], avoid: ['辛辣燥热', '烧烤煎炸'], soup: '银耳雪梨汤', tea: '麦冬玉竹茶', element: '金', organ: '肺', description: '立秋秋燥初起，宜润肺养阴，防燥伤肺。' },
  { name: '处暑', dateRange: '8月22~24日', principle: '滋阴润燥，养肺安神', recommended: ['梨', '百合', '蜂蜜', '芝麻', '银耳'], avoid: ['辛燥食物', '姜葱过量'], soup: '百合莲子羹', tea: '罗汉果茶', element: '金', organ: '肺', description: '处暑暑气渐消，秋凉渐至，当滋阴润肺。' },
  { name: '白露', dateRange: '9月7~9日', principle: '润燥养肺，益气和胃', recommended: ['梨', '百合', '山药', '蜂蜜', '板栗'], avoid: ['寒凉生冷', '辛辣刺激'], soup: '川贝炖雪梨', tea: '银杞茶', element: '金', organ: '肺', description: '白露天气转凉，秋燥明显，宜养肺润燥。' },
  { name: '秋分', dateRange: '9月22~24日', principle: '滋阴润肺，调和阴阳', recommended: ['梨', '银耳', '百合', '山药', '芝麻'], avoid: ['过辛过酸', '寒凉伤胃'], soup: '山药枸杞乌鸡汤', tea: '杏仁茶', element: '金', organ: '肺', description: '秋分昼夜均等，阴阳各半，当润燥养肺，调和阴阳。' },
  { name: '寒露', dateRange: '10月8~9日', principle: '养阴防燥，润肺益胃', recommended: ['芝麻', '核桃', '梨', '银耳', '蜂蜜'], avoid: ['寒凉食物', '燥热之品'], soup: '沙参玉竹老鸭汤', tea: '菊花枸杞茶', element: '金→水', organ: '肺/肾', description: '寒露转凉，燥邪当令，当滋阴润燥，固护肺胃。' },
  { name: '霜降', dateRange: '10月23~24日', principle: '温润养肺，补肾固本', recommended: ['板栗', '核桃', '山药', '红枣', '牛肉'], avoid: ['寒凉滑泄之品'], soup: '板栗炖鸡', tea: '红枣桂圆茶', element: '土', organ: '脾/肺', description: '霜降秋尽冬来，当温补脾肾，为入冬准备。' },
  { name: '立冬', dateRange: '11月7~8日', principle: '补肾藏精，温养阳气', recommended: ['羊肉', '核桃', '板栗', '黑豆', '桂圆'], avoid: ['生冷寒凉', '耗气之品'], soup: '当归羊肉汤', tea: '红枣枸杞茶', element: '水', organ: '肾', description: '立冬阳气潜藏，宜补肾温阳，敛阴护阳。' },
  { name: '小雪', dateRange: '11月22~23日', principle: '温补肾阳，养藏固精', recommended: ['羊肉', '黑芝麻', '核桃', '栗子', '枸杞'], avoid: ['寒凉食物', '发散过度'], soup: '当归生姜羊肉汤', tea: '桂圆红枣茶', element: '水', organ: '肾', description: '小雪阴气渐重，当温补肾阳，养藏为要。' },
  { name: '大雪', dateRange: '12月6~8日', principle: '温补固肾，养藏阳气', recommended: ['羊肉', '牛肉', '黑豆', '核桃', '山药'], avoid: ['生冷寒凉', '辛散太过'], soup: '黑豆羊肉汤', tea: '姜枣茶', element: '水', organ: '肾', description: '大雪阴气最盛，当大补肾阳，收藏精气。' },
  { name: '冬至', dateRange: '12月21~23日', principle: '补肾壮阳，益气养血', recommended: ['羊肉', '饺子（温馅）', '汤圆', '核桃', '枸杞'], avoid: ['寒凉泻下之品'], soup: '人参炖乌鸡', tea: '杜仲茶', element: '水', organ: '肾', description: '冬至一阳初生，为进补最佳时机，冬至补一冬。' },
  { name: '小寒', dateRange: '1月5~7日', principle: '温补肾阳，养藏御寒', recommended: ['羊肉', '核桃', '板栗', '红枣', '桂圆'], avoid: ['寒凉食物', '冷饮'], soup: '黄芪羊肉汤', tea: '生姜红茶', element: '水→木', organ: '肾/肝', description: '小寒为一年最冷节气之一，当温阳驱寒，补肾养肝。' },
  { name: '大寒', dateRange: '1月20~21日', principle: '温阳散寒，养藏迎春', recommended: ['羊肉', '红枣', '桂圆', '核桃', '生姜'], avoid: ['生冷黏硬', '过度发散'], soup: '八珍汤炖鸡', tea: '玫瑰花茶', element: '土→木', organ: '脾/肝', description: '大寒为冬末，将迎立春，当温补脾胃，疏泄肝气。' },
];

/** 获取当前节气饮食建议 */
export function getCurrentSolarTerm(): SolarTermDiet {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  // 简化的节气映射（按月日范围）
  const ranges: [number, number, number][] = [
    [1, 20, 23], [2, 3, 5], [2, 18, 20], [3, 5, 7], [3, 20, 22],
    [4, 4, 6], [4, 19, 21], [5, 5, 7], [5, 20, 22], [6, 5, 7],
    [6, 21, 22], [7, 6, 8], [7, 22, 24], [8, 7, 9], [8, 22, 24],
    [9, 7, 9], [9, 22, 24], [10, 8, 9], [10, 23, 24], [11, 7, 8],
    [11, 22, 23], [12, 6, 8], [12, 21, 23], [1, 5, 7],
  ];
  // 先排序确保按时间顺序
  for (let i = 0; i < ranges.length; i++) {
    const [m, _sd, _ed] = ranges[i];
    if (month === m) {
      // 简化：返回该月的节气
      const idx = i;
      return SOLAR_TERM_DIETS[idx % SOLAR_TERM_DIETS.length];
    }
  }
  return SOLAR_TERM_DIETS[0];
}

/** 根据节气名称查找 */
export function getDietByTermName(name: string): SolarTermDiet | undefined {
  return SOLAR_TERM_DIETS.find(d => d.name === name);
}


// ============================================================
//  三、运动康复方案
// ============================================================

export interface FitnessPlan {
  /** 方案名称 */
  name: string;
  /** 目标症状/身体部位 */
  target: string;
  /** 五行关联 */
  element: string;
  /** 难度等级 */
  level: '初级' | '中级' | '高级';
  /** 涉及肌肉 */
  muscles: string[];
  /** 动作列表 */
  exercises: {
    name: string;
    description: string;
    duration: string;
    sets: string;
    tips: string;
  }[];
  /** 注意事项 */
  precautions: string[];
  /** 预计效果 */
  expectedEffect: string;
}

export const FITNESS_PLANS: FitnessPlan[] = [
  {
    name: '颈肩舒展操', target: '颈肩僵硬、落枕', element: '金',
    level: '初级', muscles: ['斜方肌', '肩胛提肌', '胸锁乳突肌'],
    exercises: [
      { name: '颈部前屈后伸', description: '端坐，缓慢低头至极限，再缓慢仰头', duration: '每个方向5秒', sets: '8次', tips: '动作缓慢，不可用力过猛' },
      { name: '颈部左右侧屈', description: '头向左侧倾斜，耳靠近肩部，再换右侧', duration: '每侧5秒', sets: '8次', tips: '肩部保持下沉不耸起' },
      { name: '颈部旋转', description: '头缓慢转向左侧至极限，再转向右侧', duration: '每侧5秒', sets: '8次', tips: '配合呼吸，呼气时转头' },
      { name: '耸肩放松', description: '双肩上耸至耳部，保持3秒后骤然放松', duration: '3秒保持+2秒放松', sets: '10次', tips: '放松时感受重力下沉感' },
      { name: '肩部绕环', description: '双手搭肩，前后画圆旋转', duration: '前后各10圈', sets: '2组', tips: '幅度由小到大，速度由慢到快' },
    ],
    precautions: ['急性期（扭伤48h内）不宜做主动运动', '头晕时停止运动', '椎动脉型颈椎病禁做旋转动作'],
    expectedEffect: '缓解颈肩肌肉紧张，改善局部血液循环，2~4周可见明显改善',
  },
  {
    name: '腰背强健功', target: '腰痛、腰椎不适', element: '水',
    level: '中级', muscles: ['竖脊肌', '多裂肌', '腹横肌', '臀大肌'],
    exercises: [
      { name: '猫牛式', description: '四点跪姿，吸气塌腰抬头，呼气弓背低头', duration: '每式3~5秒', sets: '10次', tips: '配合呼吸节奏，动作流畅' },
      { name: '婴儿式', description: '跪坐，上身前倾贴地，双臂前伸', duration: '保持30秒', sets: '3次', tips: '完全放松腰部，感受牵拉' },
      { name: '仰卧抬臀', description: '仰卧屈膝，抬起臀部至大腿与身体成直线', duration: '保持5秒', sets: '12次×3组', tips: '收紧核心，避免腰椎代偿' },
      { name: '俯卧超人式', description: '俯卧，交替抬起对侧手脚', duration: '每侧保持3秒', sets: '每侧10次×2组', tips: '保持骨盆稳定不摇晃' },
    ],
    precautions: ['急性腰痛需先就医明确诊断', '椎间盘突出急性期避免前屈', '运动后冰敷15分钟有助恢复'],
    expectedEffect: '增强腰背核心力量，改善腰椎稳定性，4~6周显著改善慢性腰痛',
  },
  {
    name: '膝关节养护操', target: '膝关节疼痛、退行性改变', element: '水',
    level: '初级', muscles: ['股四头肌', '腘绳肌', '髂胫束', '小腿三头肌'],
    exercises: [
      { name: '直腿抬高', description: '仰卧，单腿伸直抬高30~45度', duration: '保持10秒', sets: '每侧15次×2组', tips: '脚尖勾起，全腿绷紧' },
      { name: '靠墙静蹲', description: '背靠墙，屈膝至90度（或大于90度）', duration: '保持30~60秒', sets: '3次', tips: '膝盖不超过脚尖，疼痛即止' },
      { name: '坐位伸膝', description: '坐姿，小腿缓慢伸直，保持3秒', duration: '3秒保持', sets: '15次×2组', tips: '脚尖上勾效果更佳' },
      { name: '踝泵运动', description: '坐姿或仰卧，脚踝用力上勾下踩', duration: '每个方向3秒', sets: '30次', tips: '可预防下肢静脉血栓' },
    ],
    precautions: ['急性炎症期（红肿热痛）以休息为主', '避免深蹲、爬楼等高负荷运动', '运动时佩戴护膝保护'],
    expectedEffect: '增强膝关节周围肌力，减轻关节负担，6~8周疼痛明显缓解',
  },
  {
    name: '办公室颈椎操', target: '办公族颈椎不适', element: '金',
    level: '初级', muscles: ['颈夹肌', '斜方肌上束', '肩胛提肌', '菱形肌'],
    exercises: [
      { name: '收下巴', description: '端坐，下巴水平后缩，做双下巴动作', duration: '保持5秒', sets: '10次', tips: '头部不低下，水平后缩' },
      { name: '颈部等长对抗', description: '手掌放在额头/后脑/侧方，头手对抗', duration: '每方向5秒', sets: '每方向5次', tips: '头不动，仅发力对抗' },
      { name: '肩胛骨后缩', description: '坐姿，双肩胛骨向中间夹紧', duration: '保持5秒', sets: '10次', tips: '挺胸收腹，感受肩胛骨聚拢' },
      { name: '门框牵伸', description: '站在门框内，双臂撑门框，身体前倾', duration: '保持20秒', sets: '3次', tips: '感受胸部牵拉感' },
    ],
    precautions: ['每工作40分钟做1组', '避免长时间低头看手机', '已有颈椎病诊断者遵医嘱调整'],
    expectedEffect: '改善上交叉综合征，缓解办公室颈肩综合征，坚持2周即可感受改善',
  },
  {
    name: '呼吸吐纳功', target: '呼吸系统、肺功能不足', element: '金',
    level: '初级', muscles: ['膈肌', '肋间肌', '腹横肌', '盆底肌'],
    exercises: [
      { name: '腹式呼吸', description: '仰卧或坐姿，吸气腹部隆起，呼气腹部凹陷', duration: '吸4秒呼6秒', sets: '10次×3组', tips: '手放腹部感受起伏' },
      { name: '缩唇呼吸', description: '鼻吸气2秒，嘴唇缩如吹口哨状，缓慢呼气4~6秒', duration: '吸2秒呼4~6秒', sets: '10次', tips: '呼气时间为吸气2倍以上' },
      { name: '胸廓扩张', description: '坐姿，双手抱头，吸气时展开胸廓，呼气时收回', duration: '每式5秒', sets: '8次', tips: '配合上肢运动增加胸廓活动度' },
    ],
    precautions: ['哮喘急性发作期禁做', ' COPD患者避免过度换气', '头晕时及时停止恢复正常呼吸'],
    expectedEffect: '增强膈肌力量，改善肺活量，减少呼吸道感染频率',
  },
  {
    name: '脾胃调理功', target: '消化不良、脾胃虚弱', element: '土',
    level: '初级', muscles: ['腹直肌', '腹横肌', '膈肌'],
    exercises: [
      { name: '摩腹', description: '仰卧，掌心贴腹，顺时针环行摩腹', duration: '5~10分钟', sets: '每日早晚各1次', tips: '力度轻柔，速度缓慢' },
      { name: '揉中脘', description: '拇指按揉脐上4寸中脘穴', duration: '3分钟', sets: '每日2次', tips: '配合深呼吸效果更佳' },
      { name: '仰卧起坐（改良版）', description: '仰卧屈膝，双手前伸，仅抬起肩胛骨离地', duration: '每秒1次', sets: '15次×2组', tips: '不用力拽头，腹肌发力' },
      { name: '八段锦-调理脾胃须单举', description: '站立，一手上托一下按，交替进行', duration: '每侧5秒', sets: '8次', tips: '上举时吸气，下按时呼气' },
    ],
    precautions: ['饭后1小时内不宜做腹部运动', '胃下垂患者避免大幅度腹肌运动', '腹泻时不宜做腹部按摩'],
    expectedEffect: '促进胃肠蠕动，改善消化功能，增强脾胃运化能力',
  },
  {
    name: '安神助眠操', target: '失眠、焦虑、入睡困难', element: '水',
    level: '初级', muscles: ['膈肌', '盆底肌', '全身放松肌群'],
    exercises: [
      { name: '4-7-8呼吸法', description: '鼻吸气4秒→屏息7秒→口呼气8秒', duration: '每轮约20秒', sets: '4轮', tips: '舌抵上腭，呼气时发出"呼"声' },
      { name: '渐进性肌肉放松', description: '从脚到头，依次绷紧5秒→放松10秒', duration: '全身约15分钟', sets: '1次', tips: '感受绷紧与放松的对比' },
      { name: '涌泉搓擦', description: '坐姿，用手掌搓擦对侧足底涌泉穴', duration: '每侧3~5分钟', sets: '每晚睡前', tips: '至足底发热为止' },
    ],
    precautions: ['严重失眠需排查焦虑/抑郁等心理因素', '安眠药服用者不宜骤然停药', '睡前1小时内不做剧烈运动'],
    expectedEffect: '降低交感神经兴奋，促进入睡，改善睡眠质量，1~2周见效',
  },
  {
    name: '女性经期调理操', target: '痛经、经期不适', element: '木→水',
    level: '初级', muscles: ['腹横肌', '盆底肌', '腰方肌'],
    exercises: [
      { name: '膝胸卧位', description: '跪姿，臀部坐于脚跟，上身前俯贴地', duration: '保持2~3分钟', sets: '每日2次', tips: '经期第一天最有效' },
      { name: '猫牛式（轻柔版）', description: '四点跪姿，缓慢做小幅度的弓背塌腰', duration: '每式3秒', sets: '8次', tips: '幅度小于常规版，更柔和' },
      { name: '仰卧屈膝摇摆', description: '仰卧屈膝，双膝左右缓慢摇摆', duration: '每侧3秒', sets: '10次', tips: '腰部贴地，感受腰骶放松' },
    ],
    precautions: ['经血量过多时减少运动量', '避免倒立和剧烈腹肌运动', '严重痛经需就医排除器质性病变'],
    expectedEffect: '缓解子宫痉挛，促进经血排出，减轻经期不适',
  },
];


// ============================================================
//  四、茶道
// ============================================================

export interface TeaInfo {
  /** 茶名 */
  name: string;
  /** 茶类 */
  category: string;
  /** 五行属性 */
  element: string;
  /** 对应脏腑 */
  organ: string;
  /** 五音关联 */
  wuyin: string;
  /** 冲泡参数 */
  brewing: {
    waterTemp: string;
    ratio: string;
    firstInfusion: string;
    subsequentInfusion: string;
    totalInfusions: number;
  };
  /** 冲泡步骤 */
  steps: string[];
  /** 功效 */
  effects: string[];
  /** 禁忌 */
  contraindications: string[];
  /** 口感描述 */
  taste: string;
  /** 适合时节 */
  season: string;
}

export const TEA_DATA: TeaInfo[] = [
  {
    name: '龙井', category: '绿茶', element: '木', organ: '肝', wuyin: '角',
    brewing: { waterTemp: '80~85℃', ratio: '1:50（3g/150ml）', firstInfusion: '30秒', subsequentInfusion: '递增10秒', totalInfusions: 3 },
    steps: ['温杯：热水浸润杯壁后倒出', '投茶：3g茶叶入玻璃杯', '注水：80℃水沿杯壁缓缓注入', '静置：30秒后即可品饮', '续泡：每次递增10秒'],
    effects: ['清热解暑', '生津止渴', '提神醒脑', '消食化痰'],
    contraindications: ['胃寒者少饮', '空腹不宜', '睡前不宜'],
    taste: '豆花香，甘鲜醇和，回味悠长', season: '春夏季',
  },
  {
    name: '铁观音', category: '乌龙茶', element: '土', organ: '脾', wuyin: '宫',
    brewing: { waterTemp: '95~100℃', ratio: '1:20（7g/150ml）', firstInfusion: '10秒', subsequentInfusion: '递增5秒', totalInfusions: 7 },
    steps: ['温壶温杯：沸水冲淋', '投茶：7g入盖碗', '洗茶：沸水冲入即倒出', '正泡：10秒出汤', '分茶：均匀分入品茗杯', '续泡：每次递增5秒'],
    effects: ['消食去腻', '减肥健美', '清热降火', '提神益思'],
    contraindications: ['不宜空腹饮用', '孕妇慎饮浓茶'],
    taste: '兰花香，观音韵，七泡有余香', season: '秋季',
  },
  {
    name: '大红袍', category: '岩茶', element: '土', organ: '脾', wuyin: '宫',
    brewing: { waterTemp: '98~100℃', ratio: '1:15（8g/120ml）', firstInfusion: '8秒', subsequentInfusion: '递增3~5秒', totalInfusions: 9 },
    steps: ['温壶温杯', '投茶8g入紫砂壶', '高冲洗茶即倒', '正泡8秒出汤', '闻香杯盖香', '续泡递增'],
    effects: ['健胃消食', '提神醒脑', '抗氧化', '降血脂'],
    contraindications: ['失眠者晚间不宜', '胃溃疡患者慎饮'],
    taste: '岩骨花香，醇厚甘活，岩韵显', season: '秋冬季',
  },
  {
    name: '普洱熟茶', category: '黑茶', element: '水', organ: '肾', wuyin: '羽',
    brewing: { waterTemp: '100℃', ratio: '1:20（7g/140ml）', firstInfusion: '20秒', subsequentInfusion: '递增10秒', totalInfusions: 10 },
    steps: ['温壶温杯', '投茶7g紫砂壶', '洗茶两遍（快速出水）', '正泡20秒出汤', '品饮陈香', '续泡递增10秒'],
    effects: ['暖胃降脂', '消食化滞', '降压降糖', '抗衰老'],
    contraindications: ['低血压者不宜过量', '不宜空腹大量饮用'],
    taste: '陈香馥郁，醇厚顺滑，回甘绵长', season: '冬春季',
  },
  {
    name: '白毫银针', category: '白茶', element: '金', organ: '肺', wuyin: '商',
    brewing: { waterTemp: '85~90℃', ratio: '1:40（5g/200ml）', firstInfusion: '45秒', subsequentInfusion: '递增15秒', totalInfusions: 5 },
    steps: ['温杯', '投茶5g入玻璃杯', '85℃水沿壁缓缓注入', '静置45秒品饮', '续泡递增15秒'],
    effects: ['清热降火', '消炎解毒', '滋阴润肺', '抗氧化'],
    contraindications: ['体质虚寒者少饮', '不宜冷饮'],
    taste: '毫香蜜韵，鲜爽甘醇，如饮清泉', season: '夏季',
  },
  {
    name: '菊花茶', category: '花茶', element: '金', organ: '肺/肝', wuyin: '商',
    brewing: { waterTemp: '90~95℃', ratio: '1:50（3g/150ml）', firstInfusion: '3分钟', subsequentInfusion: '递增1分钟', totalInfusions: 3 },
    steps: ['取菊花3~5朵', '90℃热水冲泡', '加盖闷3分钟', '可加枸杞或冰糖调味'],
    effects: ['清肝明目', '疏风散热', '解毒消炎', '降血压'],
    contraindications: ['脾胃虚寒者不宜多饮', '低血压者慎饮'],
    taste: '花香清幽，甘凉爽口，回甘微甜', season: '秋季',
  },
  {
    name: '玫瑰花茶', category: '花茶', element: '木→火', organ: '肝/心', wuyin: '角/徵',
    brewing: { waterTemp: '80~85℃', ratio: '1:50（3g/150ml）', firstInfusion: '3分钟', subsequentInfusion: '递增1分钟', totalInfusions: 3 },
    steps: ['取玫瑰花3~5朵', '80℃热水冲泡（避免高温破坏花香）', '闷3分钟', '可加蜂蜜或红枣调味'],
    effects: ['疏肝理气', '活血调经', '美容养颜', '缓解抑郁'],
    contraindications: ['经期量多者不宜', '孕妇慎饮', '便秘者少饮'],
    taste: '花香馥郁，甘柔醇美，温暖舒心', season: '春夏季',
  },
  {
    name: '陈皮普洱', category: '黑茶+药食', element: '土', organ: '脾/肺', wuyin: '宫/商',
    brewing: { waterTemp: '100℃', ratio: '陈皮1:普洱2（3g陈皮+6g普洱/150ml）', firstInfusion: '15秒', subsequentInfusion: '递增5秒', totalInfusions: 8 },
    steps: ['温壶', '陈皮掰小块与普洱同入壶', '洗茶一遍', '正泡15秒出汤', '先闻陈皮香再品茶味', '续泡递增5秒'],
    effects: ['理气健脾', '燥湿化痰', '消食化滞', '降脂减肥'],
    contraindications: ['阴虚燥咳者不宜', '气虚体弱者少量饮用'],
    taste: '陈香药香交融，醇厚甘润，回味悠长', season: '秋冬春季',
  },
];

/** 根据五音找茶 */
export function getTeaByWuyin(wuyin: string): TeaInfo[] {
  return TEA_DATA.filter(t => t.wuyin.includes(wuyin));
}

/** 根据五行找茶 */
export function getTeaByElement(element: string): TeaInfo[] {
  return TEA_DATA.filter(t => t.element === element);
}


// ============================================================
//  五、酒道（选择性集成）
// ============================================================

export interface WineInfo {
  name: string;
  category: string;
  element: string;
  organ: string;
  appearance: string;
  aroma: string;
  taste: string;
  pairings: string[];
  servingTemp: string;
  drinkingMethod: string;
  healthNote: string;
  taboo: string;
}

export const WINE_DATA: WineInfo[] = [
  {
    name: '黄酒（绍兴花雕）', category: '黄酒', element: '土', organ: '脾',
    appearance: '琥珀色，澄清透亮', aroma: '醇香馥郁，有焦糖与米香', taste: '甘甜醇厚，回味绵长',
    pairings: ['大闸蟹', '红烧肉', '绍兴醉鸡', '茴香豆'], servingTemp: '38~45℃温饮',
    drinkingMethod: '温酒器隔水加热至微烫，可加姜丝枸杞', healthNote: '温经散寒，活血通络，适量可助药力运行', taboo: '肝病患者禁饮，痛风者不宜',
  },
  {
    name: '米酒（醪糟）', category: '米酒', element: '土→水', organ: '脾/肾',
    appearance: '乳白色微浊，颗粒分明', aroma: '甜香扑鼻，发酵米的清甜', taste: '甘甜软糯，酒香淡雅',
    pairings: ['汤圆', '鸡蛋', '红枣', '桂圆'], servingTemp: '热饮为主',
    drinkingMethod: '直接饮用或煮汤圆/鸡蛋，冬季暖身佳品', healthNote: '健脾养胃，益气活血，产妇恢复常用', taboo: '糖尿病患者慎饮',
  },
  {
    name: '葡萄酒', category: '果酒', element: '火', organ: '心',
    appearance: '宝石红色/金黄色', aroma: '浆果香/花果香/橡木香', taste: '单宁柔顺/酸度爽口/果味丰富',
    pairings: ['牛排', '羊排', '芝士', '巧克力'], servingTemp: '红16~18℃/白8~12℃',
    drinkingMethod: '醒酒30分钟~2小时（老酒可缩短），小口细品', healthNote: '含白藜芦醇，适量可活化心血管', taboo: '每日不宜超过150ml，孕妇禁饮',
  },
  {
    name: '药酒（人参酒）', category: '药酒', element: '水→木', organ: '肾/肝',
    appearance: '淡黄色至棕红色', aroma: '药香浓郁，参味回甘', taste: '甘苦微辛，参味悠长',
    pairings: ['不宜搭配食物', '空腹少量服用'], servingTemp: '常温',
    drinkingMethod: '每次15~30ml，每日1~2次，饭后半小时', healthNote: '大补元气，健脾益肺，安神生津', taboo: '感冒发热时停服，高血压患者慎用，不可过量',
  },
  {
    name: '梅酒', category: '果酒', element: '木', organ: '肝',
    appearance: '琥珀色通透', aroma: '青梅果香，甜酸交融', taste: '酸甜清爽，梅味馥郁',
    pairings: ['日式料理', '刺身', '凉菜', '甜品'], servingTemp: '冰镇或加冰',
    drinkingMethod: '纯饮或兑苏打水/热水，1:3比例', healthNote: '生津开胃，消除疲劳，促进消化', taboo: '胃酸过多者少饮',
  },
  {
    name: '白酒（酱香型）', category: '白酒', element: '火→金', organ: '心/肺',
    appearance: '无色透明，挂杯明显', aroma: '酱香突出，幽雅细腻', taste: '醇厚丰满，回味悠长',
    pairings: ['火锅', '烤肉', '卤味', '凉拌菜'], servingTemp: '常温或微温',
    drinkingMethod: '小杯慢品，不急饮不混饮', healthNote: '少量可温经通络，过量伤肝', taboo: '肝病患者绝对禁饮，每日不超过50ml',
  },
  {
    name: '桂花酒', category: '花酒', element: '木→金', organ: '肝/肺',
    appearance: '淡金黄色', aroma: '桂花香气馥郁', taste: '甘甜清雅，花香四溢',
    pairings: ['月饼', '汤圆', '甜品', '中秋佳肴'], servingTemp: '冷饮或微温',
    drinkingMethod: '中秋传统饮品，可加冰或温饮', healthNote: '散寒破结，化痰止咳，润肠通便', taboo: '糖尿病患者不宜',
  },
  {
    name: '竹叶青酒', category: '配制酒', element: '木', organ: '肝',
    appearance: '金黄碧翠，清澈透明', aroma: '竹叶清香，药香怡人', taste: '甘甜微苦，清香爽口',
    pairings: ['凉菜', '海鲜', '素菜'], servingTemp: '冷藏或加冰',
    drinkingMethod: '纯饮或兑雪碧，夏日冰饮最佳', healthNote: '疏肝理气，清热利湿，和胃消食', taboo: '酒精过敏者不宜，孕妇禁饮',
  },
];


// ============================================================
//  六、花语（选择性集成）
// ============================================================

export interface FlowerInfo {
  name: string;
  language: string;          // 花语
  element: string;
  season: string;
  meaning: string;            // 详细寓意
  careTips: string;           // 养护建议
  suitableFor: string[];      // 适合赠送对象/场合
  pairingTea: string;         // 搭配茶饮
}

export const FLOWER_DATA: FlowerInfo[] = [
  { name: '梅花', language: '坚毅不屈，傲雪凌霜', element: '木', season: '冬末春初', meaning: '梅花为首，五福之花，象征坚韧品格与高洁志向', careTips: '喜光照耐寒，盆土不积水为宜', suitableFor: ['长者', '师长', '鼓励挫折中的人'], pairingTea: '白毫银针' },
  { name: '兰花', language: '清雅高洁，贤德贤淑', element: '木', season: '春夏', meaning: '四君子之一，象征君子之风、淑女之德', careTips: '喜散射光，忌强光直射，保持湿润通风', suitableFor: ['恩师', '学者', '雅集'], pairingTea: '铁观音' },
  { name: '菊花', language: '隐逸淡泊，长寿吉祥', element: '金', season: '秋冬', meaning: '四君子之一，象征淡泊名利、健康长寿', careTips: '喜光耐旱，避免过湿，秋后修剪', suitableFor: ['老人', '退休', '重阳节'], pairingTea: '菊花茶' },
  { name: '荷花', language: '出淤泥而不染，清廉高洁', element: '水', season: '夏季', meaning: '佛教圣花，象征清净无染、和合美满', careTips: '水生植物，需充足阳光和静水', suitableFor: ['婚礼', '佛事', '文人雅聚'], pairingTea: '白毫银针' },
  { name: '牡丹', language: '富贵荣华，国色天香', element: '土', season: '春季', meaning: '花之王，象征富贵吉祥、繁荣昌盛', careTips: '喜凉爽阳光，忌高温多湿', suitableFor: ['乔迁', '升职', '新婚'], pairingTea: '大红袍' },
  { name: '桂花', language: '崇高美好，收获荣光', element: '金', season: '秋季', meaning: '月中之树，象征功名得中、甜蜜收获', careTips: '喜光温暖，通风良好，秋季施肥', suitableFor: ['中秋', '考试', '获奖'], pairingTea: '桂花酒' },
  { name: '玫瑰', language: '热恋真情，浪漫温馨', element: '火', season: '春夏', meaning: '爱情之花，红玫瑰热恋，白玫瑰纯真', careTips: '喜光通风，定期修剪，注意防虫', suitableFor: ['恋人', '情人节', '告白'], pairingTea: '玫瑰花茶' },
  { name: '茉莉', language: '纯真柔美，忠贞不渝', element: '木', season: '夏秋', meaning: '友谊与爱情之花，象征纯洁真挚', careTips: '喜温暖湿润，充足光照，勤修剪', suitableFor: ['友人', '闺蜜', '母亲'], pairingTea: '茉莉花茶（龙井窨制）' },
  { name: '百合', language: '百年好合，纯洁高雅', element: '土', season: '春夏', meaning: '婚礼首选用花，象征和合美满、纯洁高贵', careTips: '喜凉爽半阴，忌高温暴晒', suitableFor: ['婚礼', '新婚', '祝福'], pairingTea: '白毫银针' },
  { name: '水仙', language: '自恋清高，吉祥如意', element: '水', season: '冬春', meaning: '凌波仙子，象征吉祥如意、品德高洁', careTips: '水培即可，喜光通风，定期换水', suitableFor: ['春节', '新年', '书房装饰'], pairingTea: '龙井' },
  { name: '茶花', language: '谦逊美德，理想之爱', element: '木→火', season: '冬春', meaning: '象征理想与坚贞，是美德与爱的化身', careTips: '喜半阴温暖，忌强光直射和严寒', suitableFor: ['女性朋友', '长辈', '感恩'], pairingTea: '普洱熟茶' },
  { name: '玉兰', language: '纯洁感恩，高洁端庄', element: '木', season: '早春', meaning: '先花后叶，象征品质高洁、感恩图报', careTips: '喜光耐寒，排水良好，少施肥', suitableFor: ['母亲', '恩师', '感恩节'], pairingTea: '铁观音' },
  { name: '桃花', language: '爱情降临，美好生活', element: '木', season: '春季', meaning: '桃之夭夭，象征爱情运与美好生活', careTips: '喜光耐旱，注意排水，春季修剪', suitableFor: ['单身祝福', '恋爱', '新春'], pairingTea: '龙井' },
  { name: '芍药', language: '情有独钟，依依不舍', element: '木', season: '暮春', meaning: '与牡丹齐名，古人赠芍药表示结情', careTips: '喜光凉爽，排水佳，秋季分株', suitableFor: ['恋人', '离别', '深情表白'], pairingTea: '玫瑰花茶' },
  { name: '月季', language: '四季平安，幸福期待', element: '火', season: '四季', meaning: '月月开花，象征持续的幸福与美好期待', careTips: '喜光通风，定期修剪施肥，防白粉病', suitableFor: ['日常赠送', '探望', '祝福'], pairingTea: '陈皮普洱' },
  { name: '紫藤', language: '醉人恋情，依依思念', element: '木', season: '春夏', meaning: '紫色花瀑象征着缠绵的思念与深情', careTips: '喜光耐寒，搭架攀援，早春修剪', suitableFor: ['思念', '怀旧', '庭院'], pairingTea: '大红袍' },
  { name: '薰衣草', language: '等待爱情，宁静安详', element: '木→水', season: '夏季', meaning: '紫色花海，象征等待与浪漫的憧憬', careTips: '喜光耐旱，忌积水湿热，通风良好', suitableFor: ['疗愈', '冥想', '助眠'], pairingTea: '菊花茶' },
  { name: '向日葵', language: '忠诚爱慕，积极向上', element: '火', season: '夏秋', meaning: '向日而生，象征积极向上、温暖忠诚', careTips: '喜充足阳光，耐旱，需支撑高大花盘', suitableFor: ['生日', '加油鼓劲', '父亲节'], pairingTea: '普洱熟茶' },
];


// ============================================================
//  七、症状同义词映射（增强搜索体验）
// ============================================================

export const SYMPTOM_SYNONYMS: Record<string, string[]> = {
  '头痛': ['头疼', '偏头痛', '脑袋疼', '头部疼痛', '头风'],
  '失眠': ['睡不着', '入睡困难', '早醒', '多梦', '睡眠差', '酣睡难'],
  '胃痛': ['胃疼', '胃部不适', '胃脘痛', '心口疼'],
  '腰痛': ['腰疼', '腰酸', '腰椎痛', '腰骶痛', '腰肌劳损'],
  '颈肩僵硬': ['脖子疼', '颈痛', '肩颈痛', '落枕', '颈椎病'],
  '月经不调': ['经期紊乱', '痛经', '月经量少', '经血过多', '经期不准'],
  '便秘': ['大便不通', '排便困难', '肠燥便秘'],
  '腹泻': ['拉肚子', '大便稀溏', '泄泻', '水样便'],
  '咳嗽': ['咳', '干咳', '久咳', '痰多', '夜咳'],
  '感冒': ['伤风', '风寒感冒', '风热感冒', '鼻塞', '流鼻涕'],
  '高血压': ['眩晕', '头晕', '血压高', '头昏脑胀'],
  '糖尿病': ['消渴', '血糖高', '口渴尿多'],
  '过敏': ['荨麻疹', '湿疹', '皮肤瘙痒', '风疹'],
  '焦虑': ['心烦', '焦躁', '不安', '烦躁', '心神不宁'],
  '消化不良': ['腹胀', '积食', '胃胀', '食欲不振', '食少'],
  '膝关节痛': ['膝盖疼', '关节痛', '膝痛', '腿疼'],
  '面瘫': ['口眼歪斜', '面部麻木', '面神经麻痹'],
  '牙痛': ['牙疼', '牙龈肿痛', '蛀牙痛'],
  '眼睛疲劳': ['目赤', '眼干', '视物模糊', '眼睛酸涩'],
  '咽痛': ['喉咙痛', '咽喉肿痛', '嗓子疼', '扁桃体发炎'],
  '心悸': ['心跳快', '心慌', '心神不宁', '心动过速'],
  '水肿': ['浮肿', '肿胀', '腿肿', '脸肿'],
  '乏力': ['疲劳', '无力', '精神不振', '气虚', '体力差'],
  '耳鸣': ['耳朵嗡嗡响', '听力下降', '耳中蝉鸣'],
  '口臭': ['口气', '口中异味', '口苦'],
  '脱发': ['掉头发', '斑秃', '头发稀疏'],
  '痛风': ['尿酸高', '关节红肿热痛', '足大趾痛'],
  '更年期': ['潮热', '盗汗', '烦躁易怒', '围绝经期'],
  '肩周炎': ['五十肩', '肩关节周围炎', '肩膀抬不起'],
  '鼻炎': ['鼻塞不通', '打喷嚏', '流清涕', '过敏性鼻炎'],
};

/** 标准化搜索词：将用户输入的同义词统一为标准症状名 */
export function normalizeSymptom(input: string): string[] {
  const results: string[] = [];
  const q = input.trim().toLowerCase();
  for (const [standard, synonyms] of Object.entries(SYMPTOM_SYNONYMS)) {
    if (standard.includes(q) || q.includes(standard)) {
      results.push(standard);
    }
    for (const syn of synonyms) {
      if (syn.includes(q) || q.includes(syn)) {
        if (!results.includes(standard)) results.push(standard);
        break;
      }
    }
  }
  // 如果未匹配到同义词，返回原始输入
  return results.length > 0 ? results : [input];
}
