// 九种体质辨识系统 - 摘自 LingSuHealth AssessmentController
// 基于王琦国医大师九种体质分类标准

export type ConstitutionType =
  | 'pinghe'   // 平和质
  | 'qixu'     // 气虚质
  | 'yangxu'   // 阳虚质
  | 'yinxu'    // 阴虚质
  | 'tanshi'   // 痰湿质
  | 'shire'    // 湿热质
  | 'xueyu'    // 血瘀质
  | 'qiyu'     // 气郁质
  | 'tebing';  // 特禀质

export interface ConstitutionQuestion {
  id: number;
  question: string;
  options: { label: string; scores: Partial<Record<ConstitutionType, number>> }[];
}

// 九种体质详情
export const CONSTITUTION_DETAILS: Record<ConstitutionType, {
  name: string;
  alias: string;
  element: string;
  organ: string;
  emotion: string;
  color: string;
  description: string;
  summary: string;
  dietaryAdvice: string[];
  lifestyleAdvice: string[];
  riskTip: string;
}> = {
  pinghe: {
    name: '平和质',
    alias: '平衡型',
    element: '中',
    organ: '五脏调和',
    emotion: '平和',
    color: '#10B981',
    description: '阴阳气血调和，体态适中，面色润泽，精力充沛，睡眠良好，性格随和开朗。这是最健康的体质状态。',
    summary: '您的体质相对平和，阴阳气血调和，脏腑功能正常。建议保持规律作息，均衡饮食，适量运动，保持心情愉悦。可多食用性味平和的食物，如小米、山药、莲子等。',
    dietaryAdvice: ['均衡饮食，不偏食', '五谷杂粮为主', '四季可食小米、山药、莲子', '适量蔬果，不过量'],
    lifestyleAdvice: ['保持规律作息', '适量运动，不强求', '保持心情愉悦', '顺应四时变化'],
    riskTip: '平和体质建议继续保持良好生活习惯。',
  },
  qixu: {
    name: '气虚质',
    alias: '疲乏型',
    element: '土',
    organ: '脾/肺',
    emotion: '忧',
    color: '#F59E0B',
    description: '元气不足，疲乏气短，容易感冒。说话声音低，容易出汗，舌淡红、舌边有齿痕。性格内向，不喜冒险。',
    summary: '您可能存在气虚体质，表现为精力不足、容易疲劳。建议多食用补气食物如人参、黄芪、山药、大枣等，避免过度劳累，适当进行缓和的运动如太极拳、八段锦等。',
    dietaryAdvice: ['多食补气食物：人参、黄芪', '山药、大枣、小米', '少食耗气食物：萝卜、空心菜', '细嚼慢咽，定时定量'],
    lifestyleAdvice: ['循序渐进运动，避免过度劳累', '太极拳、八段锦推荐', '保证充足睡眠', '避免大汗淋漓'],
    riskTip: '气虚体质建议循序渐进运动，避免过度劳累。',
  },
  yangxu: {
    name: '阳虚质',
    alias: '怕冷型',
    element: '水/土',
    organ: '肾/脾',
    emotion: '恐',
    color: '#3B82F6',
    description: '阳气不足，手足不温，畏寒怕冷。面色柔白，口淡不渴，大便溏薄，小便清长。性格多沉静内向。',
    summary: '您可能存在阳虚体质，表现为怕冷、手足不温。建议多食用温阳食物如羊肉、生姜、肉桂、核桃等，避免生冷食物，注意保暖，可进行温和的有氧运动。',
    dietaryAdvice: ['多食温阳食物：羊肉、生姜', '肉桂、核桃、韭菜', '忌食生冷寒凉', '冬季可适当进补'],
    lifestyleAdvice: ['注意保暖，特别是腰腹足部', '避免长时间吹空调', '温和有氧运动', '早睡晚起，养藏阳气'],
    riskTip: '阳虚体质注意保暖，少吃生冷食物。',
  },
  yinxu: {
    name: '阴虚质',
    alias: '缺水型',
    element: '火/金',
    organ: '肾/肺',
    emotion: '烦',
    color: '#EF4444',
    description: '阴液亏少，口燥咽干，手足心热。体形偏瘦，鼻微干，喜冷饮，大便干燥。性情急躁，外向好动。',
    summary: '您可能存在阴虚体质，表现为口干、怕热、失眠等。建议多食用滋阴食物如银耳、百合、枸杞、梨等，避免辛辣燥热食物，保持充足睡眠，适合做瑜伽等静态运动。',
    dietaryAdvice: ['多食滋阴食物：银耳、百合', '枸杞、梨、黑芝麻', '忌食辛辣燥热', '少食煎炸烧烤'],
    lifestyleAdvice: ['避免熬夜，保证充足睡眠', '适合瑜伽、冥想等静态运动', '保持心态平和', '避免大汗过度运动'],
    riskTip: '阴虚体质注意滋阴润燥，避免熬夜。',
  },
  tanshi: {
    name: '痰湿质',
    alias: '肥胖型',
    element: '土',
    organ: '脾',
    emotion: '思',
    color: '#8B5CF6',
    description: '痰湿凝聚，体形肥胖，腹部肥满松软。面部皮肤油脂较多，多汗且黏，胸闷痰多。性格偏温和稳重。',
    summary: '您可能存在痰湿体质，表现为体型偏胖、容易困倦。建议清淡饮食，多食用健脾化湿食物如薏米、冬瓜、白萝卜等，避免油腻甜腻食物，增加运动量，保持环境干燥。',
    dietaryAdvice: ['健脾化湿：薏米、冬瓜', '白萝卜、荷叶茶', '忌油腻甜腻', '少食肥甘厚味'],
    lifestyleAdvice: ['增加运动量，持之以恒', '保持环境干燥通风', '避免久坐久卧', '控制体重'],
    riskTip: '痰湿体质建议控制油腻甜食，增加运动。',
  },
  shire: {
    name: '湿热质',
    alias: '长痘型',
    element: '火/土',
    organ: '脾/肝',
    emotion: '躁',
    color: '#F97316',
    description: '湿热内蕴，面垢油光，易生痤疮。口苦口干，身重困倦，大便黏滞，小便短赤。性格多急躁易怒。',
    summary: '您可能存在湿热体质，表现为面部油腻、口苦口干。建议清热利湿，多食用绿豆、苦瓜、茯苓、薏米等，避免辛辣油腻食物，保持大便通畅，适合游泳等水上运动。',
    dietaryAdvice: ['清热利湿：绿豆、苦瓜', '茯苓、薏米、西瓜', '忌辛辣油腻', '少食甜食'],
    lifestyleAdvice: ['保持皮肤清洁', '适合游泳、慢跑', '保持大便通畅', '避免湿热环境'],
    riskTip: '湿热体质建议清淡饮食，避免辛辣油腻。',
  },
  xueyu: {
    name: '血瘀质',
    alias: '长斑型',
    element: '—',
    organ: '肝/心',
    emotion: '烦',
    color: '#7C3AED',
    description: '血行不畅，肤色晦暗，色素沉着。容易出现瘀斑，口唇暗淡，舌暗或有瘀点。性格忧郁，心情不快。',
    summary: '您可能存在血瘀体质，表现为面色暗沉、容易健忘。建议活血化瘀，多食用山楂、黑豆、红花茶等，避免寒凉食物，适当进行有氧运动促进血液循环。',
    dietaryAdvice: ['活血化瘀：山楂、黑豆', '红花茶、玫瑰花茶', '少食寒凉', '适量饮醋助消化'],
    lifestyleAdvice: ['有氧运动促进循环', '保持心情愉快', '避免久坐', '注意保暖，防寒凝血瘀'],
    riskTip: '血瘀体质建议适量有氧运动促进循环。',
  },
  qiyu: {
    name: '气郁质',
    alias: '郁闷型',
    element: '木',
    organ: '肝/胆',
    emotion: '郁',
    color: '#059669',
    description: '气机郁滞，神情抑郁，忧虑脆弱。形体瘦者为多，胸胁胀满，善太息。性格内向不稳定。',
    summary: '您可能存在气郁体质，表现为情绪波动、胸闷不舒。建议疏肝理气，多食用柑橘、玫瑰花茶、薄荷等，保持心情愉悦，多参加社交活动，适合做有氧运动释放压力。',
    dietaryAdvice: ['疏肝理气：柑橘、佛手', '玫瑰花茶、薄荷茶', '少饮咖啡浓茶', '可适量饮酒舒肝'],
    lifestyleAdvice: ['多参加社交活动', '跑步、游泳释放压力', '听舒缓音乐', '保持情志调达'],
    riskTip: '气郁体质建议保持心情舒畅，多做舒缓运动。',
  },
  tebing: {
    name: '特禀质',
    alias: '过敏型',
    element: '—',
    organ: '肺/卫表',
    emotion: '惧',
    color: '#EC4899',
    description: '先天禀赋不足，过敏体质为主。易患哮喘、过敏性鼻炎、荨麻疹等。对季节变化适应能力差。',
    summary: '您可能存在特禀体质，容易过敏。建议避免接触过敏原，饮食宜清淡，多食用益气固表食物如黄芪、防风、白术等，增强体质，提高免疫力。',
    dietaryAdvice: ['益气固表：黄芪、防风', '白术、大枣', '避免已知过敏食物', '饮食清淡，少食异种蛋白'],
    lifestyleAdvice: ['远离过敏原', '规律作息增强免疫', '适度运动增强体质', '季节交替注意防护'],
    riskTip: '特禀体质注意远离过敏原，规律作息。',
  },
};

// 九种体质评估题目（基于王琦体质分类法，22题完整版）
// 7大维度：精力体能(1-3) · 睡眠出汗(4-6) · 温度口渴(7-9) ·
//          面色皮肤(10-12) · 消化二便(13-15) · 情志胸闷(16-18) · 舌象过敏(19-22)
export const CONSTITUTION_QUESTIONS: ConstitutionQuestion[] = [
  // ===== 维度一：精力体能 =====
  {
    id: 1,
    question: '你日常的精力状态如何？',
    options: [
      { label: '精力充沛，活力满满', scores: { pinghe: 2 } },
      { label: '容易疲劳，说话声低', scores: { qixu: 2 } },
      { label: '困倦身重，不想动弹', scores: { tanshi: 2, qixu: 1 } },
      { label: '还行，时好时差', scores: { pinghe: 1 } },
    ],
  },
  {
    id: 2,
    question: '你走三层楼梯后的感觉？',
    options: [
      { label: '轻松，没什么感觉', scores: { pinghe: 2 } },
      { label: '气喘吁吁，要歇一歇', scores: { qixu: 2, yangxu: 1 } },
      { label: '腿软出汗，心慌气短', scores: { qixu: 3 } },
      { label: '有些累，但能坚持', scores: { pinghe: 1, qixu: 1 } },
    ],
  },
  {
    id: 3,
    question: '你容易感冒吗？',
    options: [
      { label: '很少感冒，一年1-2次', scores: { pinghe: 2 } },
      { label: '换季容易感冒', scores: { qixu: 1, tebing: 1 } },
      { label: '经常感冒，恢复也慢', scores: { qixu: 2, yangxu: 1 } },
      { label: '几乎不感冒', scores: { pinghe: 1 } },
    ],
  },

  // ===== 维度二：睡眠出汗 =====
  {
    id: 4,
    question: '你的睡眠质量怎样？',
    options: [
      { label: '入睡快，一夜好眠', scores: { pinghe: 2 } },
      { label: '多梦易醒，心烦', scores: { yinxu: 1, qiyu: 1 } },
      { label: '失眠，手足心热', scores: { yinxu: 2 } },
      { label: '嗜睡，总睡不够', scores: { qixu: 1, tanshi: 1, yangxu: 1 } },
    ],
  },
  {
    id: 5,
    question: '你夜间是否会盗汗（睡着出汗，醒来汗止）？',
    options: [
      { label: '不会，晚上不出汗', scores: { pinghe: 1 } },
      { label: '偶尔盗汗', scores: { yinxu: 1 } },
      { label: '经常盗汗，醒来衣湿', scores: { yinxu: 2 } },
      { label: '夜间燥热难入睡', scores: { yinxu: 2, shire: 1 } },
    ],
  },
  {
    id: 6,
    question: '你白天出汗的情况？',
    options: [
      { label: '正常，运动才出汗', scores: { pinghe: 2 } },
      { label: '稍动即汗，气短乏力', scores: { qixu: 2 } },
      { label: '自汗不止，怕风', scores: { qixu: 3, yangxu: 1 } },
      { label: '汗出黏腻，不爽快', scores: { tanshi: 1, shire: 1 } },
    ],
  },

  // ===== 维度三：温度口渴 =====
  {
    id: 7,
    question: '你对冷热的感受如何？',
    options: [
      { label: '冷热都能适应', scores: { pinghe: 2 } },
      { label: '特别怕冷，手足冰凉', scores: { yangxu: 2 } },
      { label: '怕热，喜冷饮空调', scores: { yinxu: 1, shire: 1 } },
      { label: '冬天怕冷、夏天怕热', scores: { yangxu: 1, yinxu: 1 } },
    ],
  },
  {
    id: 8,
    question: '你口渴和饮水的情况？',
    options: [
      { label: '口不渴，饮水量正常', scores: { pinghe: 2, yangxu: 1 } },
      { label: '口干咽燥，总想喝水', scores: { yinxu: 2 } },
      { label: '口苦口干，但不特别想喝', scores: { shire: 2 } },
      { label: '口黏发甜，不想喝水', scores: { tanshi: 2 } },
    ],
  },
  {
    id: 9,
    question: '你的手足温度如何？',
    options: [
      { label: '温度适中，冬天也不冰', scores: { pinghe: 2 } },
      { label: '手足不温，冬天尤甚', scores: { yangxu: 2 } },
      { label: '手足心热，夏天烦躁', scores: { yinxu: 2 } },
      { label: '手脚发凉，但躯干不怕冷', scores: { qiyu: 1, xueyu: 1 } },
    ],
  },

  // ===== 维度四：面色皮肤 =====
  {
    id: 10,
    question: '你的面色如何？',
    options: [
      { label: '红润有光泽', scores: { pinghe: 2 } },
      { label: '偏白偏暗，没有血色', scores: { yangxu: 1, qixu: 1 } },
      { label: '偏红，两颧发红', scores: { yinxu: 2 } },
      { label: '晦暗发青，有色素沉着', scores: { xueyu: 2 } },
    ],
  },
  {
    id: 11,
    question: '你的面部和头皮出油情况？',
    options: [
      { label: '正常，不干不油', scores: { pinghe: 2 } },
      { label: '面部油光，容易长痘', scores: { shire: 2, tanshi: 1 } },
      { label: '皮肤偏干，容易起皮', scores: { yinxu: 1, xueyu: 1 } },
      { label: 'T区油、两颊干', scores: { shire: 1 } },
    ],
  },
  {
    id: 12,
    question: '你的皮肤容易出现以下哪种情况？',
    options: [
      { label: '皮肤状态好，少有问题', scores: { pinghe: 2 } },
      { label: '容易过敏、起红疹', scores: { tebing: 2 } },
      { label: '容易出现瘀斑、青紫', scores: { xueyu: 2 } },
      { label: '容易长湿疹、脂溢性皮炎', scores: { shire: 1, tanshi: 1 } },
    ],
  },

  // ===== 维度五：消化二便 =====
  {
    id: 13,
    question: '你的消化和食欲如何？',
    options: [
      { label: '胃口好，消化正常', scores: { pinghe: 2 } },
      { label: '食欲不振，吃得少', scores: { qixu: 1, qiyu: 1 } },
      { label: '吃点就胀，消化不良', scores: { qixu: 2, tanshi: 1 } },
      { label: '口苦口臭，大便黏滞', scores: { shire: 2 } },
    ],
  },
  {
    id: 14,
    question: '你的大便情况怎样？',
    options: [
      { label: '成形顺畅，每日一次', scores: { pinghe: 2 } },
      { label: '大便溏薄，不成形', scores: { yangxu: 2, qixu: 1 } },
      { label: '大便干燥，排便困难', scores: { yinxu: 2 } },
      { label: '大便黏滞，冲不干净', scores: { shire: 2, tanshi: 1 } },
    ],
  },
  {
    id: 15,
    question: '你的小便情况怎样？',
    options: [
      { label: '颜色淡黄，量正常', scores: { pinghe: 2 } },
      { label: '小便清长，夜尿多', scores: { yangxu: 2 } },
      { label: '小便短赤，颜色深', scores: { shire: 2, yinxu: 1 } },
      { label: '尿频量少，小便不利', scores: { tanshi: 1, qixu: 1 } },
    ],
  },

  // ===== 维度六：情志胸闷 =====
  {
    id: 16,
    question: '你的情绪状态如何？',
    options: [
      { label: '情绪稳定，心态乐观', scores: { pinghe: 2 } },
      { label: '容易忧虑，多思多想', scores: { qiyu: 1, qixu: 1 } },
      { label: '经常郁闷，唉声叹气', scores: { qiyu: 2 } },
      { label: '急躁易怒，心烦不安', scores: { shire: 1, yinxu: 1, qiyu: 1 } },
    ],
  },
  {
    id: 17,
    question: '你是否有胸闷胁胀的感觉？',
    options: [
      { label: '不会，呼吸通畅', scores: { pinghe: 2 } },
      { label: '偶尔胸闷叹气', scores: { qiyu: 1 } },
      { label: '经常胸胁胀满，叹气舒解', scores: { qiyu: 2 } },
      { label: '心悸胸闷，烦躁不安', scores: { yinxu: 1, qiyu: 1 } },
    ],
  },
  {
    id: 18,
    question: '社交和独处时，你更倾向哪种状态？',
    options: [
      { label: '社交和独处都自在', scores: { pinghe: 2 } },
      { label: '喜欢独处，不太想社交', scores: { qiyu: 1, yangxu: 1 } },
      { label: '想社交但容易紧张', scores: { qiyu: 1, tebing: 1 } },
      { label: '沉默寡言，回避社交', scores: { qiyu: 2 } },
    ],
  },

  // ===== 维度七：舌象过敏 =====
  {
    id: 19,
    question: '伸出舌头看，你的舌体最接近哪种？',
    options: [
      { label: '淡红舌，大小适中', scores: { pinghe: 2 } },
      { label: '舌体胖大，边有齿痕', scores: { qixu: 2, yangxu: 1, tanshi: 1 } },
      { label: '舌体偏瘦，舌红少苔', scores: { yinxu: 2 } },
      { label: '舌色暗紫，或有瘀斑瘀点', scores: { xueyu: 2 } },
    ],
  },
  {
    id: 20,
    question: '你的舌苔情况如何？',
    options: [
      { label: '薄白苔，正常', scores: { pinghe: 2 } },
      { label: '舌苔白腻偏厚', scores: { tanshi: 2, yangxu: 1 } },
      { label: '舌苔黄腻', scores: { shire: 2 } },
      { label: '苔少或无苔（镜面舌）', scores: { yinxu: 2 } },
    ],
  },
  {
    id: 21,
    question: '你是否容易过敏（花粉、食物、药物等）？',
    options: [
      { label: '从不过敏', scores: { pinghe: 1 } },
      { label: '偶尔过敏，不严重', scores: { pinghe: 0 } },
      { label: '容易过敏（鼻炎/皮疹/哮喘）', scores: { tebing: 2 } },
      { label: '严重过敏，影响生活', scores: { tebing: 3 } },
    ],
  },
  {
    id: 22,
    question: '季节变化时你的身体反应如何？',
    options: [
      { label: '无明显不适，适应良好', scores: { pinghe: 2 } },
      { label: '换季容易感冒咳嗽', scores: { qixu: 1 } },
      { label: '春秋易过敏，皮肤瘙痒', scores: { tebing: 2, xueyu: 1 } },
      { label: '换季关节酸痛、身体不舒', scores: { yangxu: 1, xueyu: 1 } },
    ],
  },
];

// 体质评分算法 - 翻译自 LingSuHealth AssessmentController.calculateConstitutionScore
export function calculateConstitution(
  answers: { questionId: number; answerIndex: number }[]
): {
  dominant: ConstitutionType;
  scores: Record<ConstitutionType, number>;
  allScores: { type: ConstitutionType; name: string; score: number }[];
} {
  const scores: Record<ConstitutionType, number> = {
    pinghe: 0, qixu: 0, yangxu: 0, yinxu: 0,
    tanshi: 0, shire: 0, xueyu: 0, qiyu: 0, tebing: 0,
  };

  answers.forEach(({ questionId, answerIndex }) => {
    const question = CONSTITUTION_QUESTIONS.find((q) => q.id === questionId);
    if (!question || answerIndex >= question.options.length) return;
    const option = question.options[answerIndex];
    Object.entries(option.scores).forEach(([type, score]) => {
      scores[type as ConstitutionType] += score;
    });
  });

  // 排序
  const allScores = (Object.entries(scores) as [ConstitutionType, number][])
    .map(([type, score]) => ({ type, name: CONSTITUTION_DETAILS[type].name, score }))
    .sort((a, b) => b.score - a.score);

  const dominant = allScores[0].type;

  return { dominant, scores, allScores };
}
