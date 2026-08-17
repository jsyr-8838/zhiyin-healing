// 二十四节气养生知识库 - 摘自 LingSuHealth SeasonController + 补全24节气
// 基于中医节气养生理论

export interface SolarTerm {
  name: string;
  month: number;        // 公历月份
  dayStart: number;     // 大约起始日
  season: '春' | '夏' | '秋' | '冬';
  wuyin: 'jiao' | 'zhi' | 'gong' | 'shang' | 'yu'; // 对应五音
  shortTip: string;
  detail: string;
  principle: string;
  foods: string;
  taboos: string;
}

export const SOLAR_TERMS: SolarTerm[] = [
  // ===== 春季节气 =====
  { name: '立春', month: 2, dayStart: 4, season: '春', wuyin: 'jiao',
    shortTip: '阳气生发，宜早起散步',
    detail: '春季阳气开始生发，万物复苏。此时应顺应自然，早睡早起，多到户外活动，让身体感受春天的生机。饮食上宜清淡，多食绿色蔬菜，如菠菜、韭菜等，有助于疏肝理气。避免过度进补，以免阻碍阳气生发。',
    principle: '温补肝肾，调理脾胃', foods: '韭菜、菠菜、春笋、豆芽', taboos: '避免过食酸味，少吃辛辣' },
  { name: '雨水', month: 2, dayStart: 19, season: '春', wuyin: 'jiao',
    shortTip: '湿气渐重，健脾祛湿',
    detail: '雨水节气后，湿气加重，容易困脾。应注意健脾祛湿，可多食用薏米、红豆等祛湿食物。保持室内通风干燥，避免久坐湿地。适当运动，促进气血流通，但不宜大汗淋漓。',
    principle: '健脾祛湿，温中散寒', foods: '薏米、红豆、山药、茯苓', taboos: '少食生冷，避免久居湿地' },
  { name: '惊蛰', month: 3, dayStart: 6, season: '春', wuyin: 'jiao',
    shortTip: '春雷始鸣，养肝护脾',
    detail: '惊蛰时节，春雷始鸣，万物萌动。肝气旺盛，易伤脾胃。饮食宜清淡甘甜，多食梨、银耳等润燥食物。保持心情舒畅，避免情绪波动过大。适合进行柔和的运动，如太极拳、瑜伽等。',
    principle: '养肝护脾，润燥清热', foods: '梨、银耳、蜂蜜、枸杞', taboos: '忌食辛辣燥热，少怒多笑' },
  { name: '春分', month: 3, dayStart: 21, season: '春', wuyin: 'jiao',
    shortTip: '阴阳平衡，调和气血',
    detail: '春分时节，昼夜等长，阴阳平衡。此时人体也应保持平衡状态，饮食不宜过热过寒，作息要规律。多食用平性食物，如小米、莲子等。适合进行中等强度的运动，保持身心和谐。',
    principle: '调和阴阳，平补气血', foods: '小米、莲子、百合、大枣', taboos: '避免大寒大热，保持情绪平和' },
  { name: '清明', month: 4, dayStart: 5, season: '春', wuyin: 'jiao',
    shortTip: '春暖花开，疏肝理气',
    detail: '清明时节，天清地明，万物显荣。肝气仍旺，宜疏肝理气，多到郊外踏青赏景，放松身心。饮食宜清淡新鲜，可食荠菜、香椿等时令蔬菜。注意防风保暖，避免受风感冒。',
    principle: '疏肝理气，清心明目', foods: '荠菜、香椿、菊花茶、桑葚', taboos: '忌暴怒伤肝，少食酸涩' },
  { name: '谷雨', month: 4, dayStart: 20, season: '春', wuyin: 'jiao',
    shortTip: '春雨润物，健脾祛湿',
    detail: '谷雨是春季最后一个节气，降雨增多，湿气加重。应注重健脾祛湿，预防湿邪困脾。多食健脾食物，适当运动增强脾运化功能。此时期花粉增多，过敏体质需加强防护。',
    principle: '健脾祛湿，疏肝养肝', foods: '山药、薏米、红豆、鲫鱼', taboos: '少食寒凉，过敏者防花粉' },

  // ===== 夏季节气 =====
  { name: '立夏', month: 5, dayStart: 6, season: '夏', wuyin: 'zhi',
    shortTip: '心火渐旺，清热养心',
    detail: '立夏后，心火渐旺，应注意清热养心。饮食宜清淡，多食用苦味食物如苦瓜、莲子心等，有助于清心火。避免过度劳累，保持心情愉悦。适合早晚运动，避免中午烈日。',
    principle: '清热养心，健脾祛湿', foods: '苦瓜、莲子、绿豆、冬瓜', taboos: '少食辛热，避免过劳' },
  { name: '小满', month: 5, dayStart: 21, season: '夏', wuyin: 'zhi',
    shortTip: '湿热渐盛，清热利湿',
    detail: '小满时节，湿热渐盛，容易出现皮肤病和消化不良。应清热利湿，多食用薏米、冬瓜等食物。保持皮肤清洁干燥，穿着透气的衣物。适量运动，但要及时补充水分。',
    principle: '清热利湿，健脾和胃', foods: '薏米、冬瓜、丝瓜、绿豆', taboos: '忌食油腻，保持清洁' },
  { name: '芒种', month: 6, dayStart: 6, season: '夏', wuyin: 'zhi',
    shortTip: '梅雨潮湿，祛湿养脾',
    detail: '芒种时节进入梅雨季节，湿气最盛。脾胃最易受湿邪困扰，应重点祛湿健脾。饮食清淡，多食冬瓜、赤小豆等利湿食物。注意居室通风除湿，衣物勤换洗。适当午休养心。',
    principle: '祛湿健脾，清热消暑', foods: '冬瓜、赤小豆、荷叶、西瓜', taboos: '少食甜腻生湿，忌贪凉' },
  { name: '夏至', month: 6, dayStart: 21, season: '夏', wuyin: 'zhi',
    shortTip: '阳气最盛，养心护阳',
    detail: '夏至日最长，阳气达到顶峰。此时应养心护阳，避免过度消耗。饮食清淡爽口，适量食用苦味清心。不宜过度贪凉，空调温度宜在26度以上。适当午睡补养心气。',
    principle: '养心护阳，清热消暑', foods: '苦瓜、绿豆、西瓜、莲子', taboos: '忌冰镇寒凉，不宜大汗' },
  { name: '小暑', month: 7, dayStart: 7, season: '夏', wuyin: 'gong',
    shortTip: '暑热渐起，清补养心',
    detail: '小暑天气渐热，应清补养心，不宜大补。饮食以清补为主，可适量食粥养脾胃。避免正午外出，注意防暑降温。保持心情平静，避免烦躁伤阴。',
    principle: '清补养心，益气生津', foods: '莲藕、黄瓜、绿豆粥、酸梅汤', taboos: '忌大补厚味，少食煎炸' },
  { name: '大暑', month: 7, dayStart: 23, season: '夏', wuyin: 'gong',
    shortTip: '一年最热，防暑养心',
    detail: '大暑是一年中最热的时期，极易中暑。要注意防暑降温，多饮水补充盐分。饮食以清淡清凉为主，可多食瓜果。室内保持通风但避免直吹空调。心静自然凉，冥想静坐有助养心。',
    principle: '防暑降温，益气养阴', foods: '西瓜、黄瓜、绿豆、菊花茶', taboos: '忌暴晒，少食辛辣燥热' },

  // ===== 秋季节气 =====
  { name: '立秋', month: 8, dayStart: 8, season: '秋', wuyin: 'shang',
    shortTip: '燥气渐盛，润燥养肺',
    detail: '立秋后，燥气渐盛，容易伤肺。应注意润燥养肺，多食用梨、百合、银耳等滋阴润燥的食物。保持室内湿度适宜，避免过度干燥。适合进行有氧运动，增强肺功能。',
    principle: '润燥养肺，滋阴清热', foods: '梨、百合、银耳、蜂蜜', taboos: '少食辛辣，多饮温水' },
  { name: '处暑', month: 8, dayStart: 23, season: '秋', wuyin: 'shang',
    shortTip: '暑热渐消，调理脾胃',
    detail: '处暑时节，暑热渐消，但燥气加重。脾胃功能逐渐恢复，可适当进补。多食用健脾润燥的食物，如山药、莲藕等。注意保暖，特别是腹部和足部。',
    principle: '健脾润燥，调理肠胃', foods: '山药、莲藕、芝麻、核桃', taboos: '避免贪凉，注意保暖' },
  { name: '白露', month: 9, dayStart: 8, season: '秋', wuyin: 'shang',
    shortTip: '秋燥明显，滋阴润燥',
    detail: '白露时节，秋燥明显，容易出现口干、皮肤干燥等症状。应重点滋阴润燥，多食用梨、百合、银耳等食物。保持充足睡眠，避免熬夜。适当增加室内湿度。',
    principle: '滋阴润燥，养肺护肤', foods: '梨、百合、银耳、蜂蜜', taboos: '少食辛辣，多饮水' },
  { name: '秋分', month: 9, dayStart: 23, season: '秋', wuyin: 'shang',
    shortTip: '昼夜等长，平补阴阳',
    detail: '秋分时节，昼夜等长，阴阳平衡。此时应平补阴阳，既要润燥，又要温补。饮食宜温润，如莲藕、山药等。保持情绪稳定，适度运动。',
    principle: '平补阴阳，润燥温补', foods: '莲藕、山药、百合、核桃', taboos: '避免大寒大热，保持平和' },
  { name: '寒露', month: 10, dayStart: 8, season: '秋', wuyin: 'shang',
    shortTip: '寒气渐重，温润并重',
    detail: '寒露时节，寒气渐重，燥邪仍存。应温润并重，既要防燥又要防寒。多食用温润食物，如芝麻、核桃、蜂蜜等。注意足部保暖，避免受凉。',
    principle: '温润并重，防燥防寒', foods: '芝麻、核桃、蜂蜜、大枣', taboos: '足部保暖，避免受凉' },
  { name: '霜降', month: 10, dayStart: 23, season: '秋', wuyin: 'shang',
    shortTip: '深秋时节，温补润燥',
    detail: '霜降是秋季最后一个节气，天气渐冷，燥气仍盛。应温补润燥，多食用温性滋润的食物，如柿子、梨、蜂蜜等。加强锻炼，增强体质，为冬季做准备。',
    principle: '温补润燥，增强体质', foods: '柿子、梨、蜂蜜、核桃', taboos: '防寒保暖，适度锻炼' },

  // ===== 冬季节气 =====
  { name: '立冬', month: 11, dayStart: 8, season: '冬', wuyin: 'yu',
    shortTip: '阳气潜藏，温补肾阳',
    detail: '立冬后，阳气潜藏，应温补肾阳。多食用温热性食物，如羊肉、生姜、桂圆等。早睡晚起，保存体力。适合进行温和的运动，避免大汗淋漓消耗阳气。',
    principle: '温补肾阳，固本培元', foods: '羊肉、生姜、桂圆、核桃', taboos: '少食生冷，早睡晚起' },
  { name: '小雪', month: 11, dayStart: 22, season: '冬', wuyin: 'yu',
    shortTip: '寒气渐重，温阳散寒',
    detail: '小雪时节，寒气渐重，应温阳散寒。多食用温热食物，如牛肉、韭菜、生姜等。注意保暖，特别是头部、颈部和足部。室内保持适宜温度，避免过度干燥。',
    principle: '温阳散寒，补益精血', foods: '牛肉、韭菜、生姜、红枣', taboos: '防寒保暖，避风寒' },
  { name: '大雪', month: 12, dayStart: 7, season: '冬', wuyin: 'yu',
    shortTip: '天寒地冻，补肾固本',
    detail: '大雪时节，天寒地冻，阳气深藏。应重点补肾固本，多食用黑色食物入肾，如黑豆、黑芝麻、黑木耳等。注意保暖，坚持温水泡脚。运动宜缓不宜急，避免大汗伤阳。',
    principle: '补肾固本，温阳益气', foods: '黑豆、黑芝麻、黑木耳、羊肉', taboos: '忌大汗伤阳，注意保暖' },
  { name: '冬至', month: 12, dayStart: 22, season: '冬', wuyin: 'yu',
    shortTip: '阴极阳生，进补养藏',
    detail: '冬至日最短，阴极而阳生。此时最适合进补，俗话说"冬至进补，春天打虎"。可食用温补食物如羊肉汤、鸡汤等。早睡晚起，保护初生之阳。保持心态安宁，静养为宜。',
    principle: '进补养藏，温补肾阳', foods: '羊肉汤、鸡汤、桂圆、核桃', taboos: '忌过度运动耗阳，宜静养' },
  { name: '小寒', month: 1, dayStart: 6, season: '冬', wuyin: 'yu',
    shortTip: '一年最冷，温补御寒',
    detail: '小寒是一年中最冷的时期之一，应特别注重御寒温补。多食用温热性食物，保证充足热量。注意关节、腰腹、足部保暖。可适度运动促进气血运行，但要防止受寒。',
    principle: '温补御寒，补肾固精', foods: '羊肉、牛肉、核桃、栗子', taboos: '忌食寒凉，防寒保暖' },
  { name: '大寒', month: 1, dayStart: 20, season: '冬', wuyin: 'yu',
    shortTip: '寒极转暖，养藏待春',
    detail: '大寒是冬季最后一个节气，寒极将转暖。此时仍需注意防寒保暖，同时为春季阳气生发做准备。饮食宜温补但不过燥，可适当食用辛温发散食物如生姜、葱白。保持心情舒畅，迎接春天。',
    principle: '养藏待春，温补不燥', foods: '生姜、葱白、核桃、大枣', taboos: '不宜过燥，保持心情舒畅' },
];

// 获取当前节气
export function getCurrentSolarTerm(): SolarTerm {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();

  // 将月/日转为一年中的第几天（非闰年近似，节气精度足够）
  const DAYS_IN_MONTH = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  function toDOY(m: number, d: number): number {
    let doy = 0;
    for (let i = 1; i < m; i++) doy += DAYS_IN_MONTH[i];
    return doy + d;
  }

  // 节气年起始：立春 ≈ 2月4日（DOY≈35）
  const LICHUN_DOY = toDOY(2, 4);

  // 归一化：立春之前的日期加365，使其排在节气年末（小寒/大寒之后）
  function normDOY(m: number, d: number): number {
    const doy = toDOY(m, d);
    return doy < LICHUN_DOY ? doy + 365 : doy;
  }

  const curNorm = normDOY(month, day);

  // 正向遍历，找到最后一个 <= 当前归一化DOY的节气
  let current = SOLAR_TERMS[SOLAR_TERMS.length - 1]; // 默认大寒
  for (const term of SOLAR_TERMS) {
    if (curNorm >= normDOY(term.month, term.dayStart)) {
      current = term;
    }
  }
  return current;
}

// 获取下一个节气
export function getNextSolarTerm(): SolarTerm {
  const current = getCurrentSolarTerm();
  const idx = SOLAR_TERMS.findIndex((t) => t.name === current.name);
  return SOLAR_TERMS[(idx + 1) % SOLAR_TERMS.length];
}
